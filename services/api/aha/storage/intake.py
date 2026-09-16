"""Immutable receipt, persisted extraction jobs, and separately committed derivatives."""

import hashlib
import json
import re
from io import BytesIO
from uuid import uuid4
from .store import digest, ref, now, canonical
from ..domain.contracts import DomainError, validate


def receive(store, data, filename, media_type, actor, expected, key, source_note):
    return receive_file(
        store, BytesIO(data), filename, media_type, actor, expected, key, source_note
    )


def receive_file(
    store, stream, filename, media_type, actor, expected, key, source_note, defer=False
):
    stream.seek(0, 2)
    size = stream.tell()
    stream.seek(0)
    if size > 250 * 1024**2:
        raise DomainError(
            "FILE_TOO_LARGE", "File exceeds the 250 MiB intake limit.", 413
        )
    sha = hashlib.file_digest(stream, "sha256").hexdigest()
    filename = re.sub(r"[\x00-\x1f/\\]", "_", filename)[:200] or "unnamed"
    body = dict(
        sha256=sha,
        bytes=size,
        filename=filename,
        media_type=media_type,
        source_note=source_note,
    )
    store.require_healthy()
    with store.transaction():
        store.require_healthy()
        replay = store.precondition(actor, "ingest", key, body, expected)
        if replay is not None:
            job = replay
        else:
            sha, path, size = store.write_stream(stream)
            evidence = {
                **store.base("Evidence", actor),
                "sha256": sha,
                "bytes": size,
                "media_type": media_type,
                "original_filename": filename,
                "received_at": now(),
                "source_channel": "UPLOAD",
                "integrity": "VERIFIED",
                "scan_status": "UNSCANNED",
            }
            store.put(evidence)
            store.db.execute(
                "INSERT OR IGNORE INTO blobs VALUES(?,?,?,?)",
                (sha, path, size, "ORIGINAL"),
            )
            custody = {
                **store.base("CustodyEvent", actor),
                "evidence": ref(evidence),
                "action": "RECEIVED",
                "sha256": sha,
                "actor_subject": actor,
                "details": source_note,
            }
            store.put(custody)
            store.bump()
            store.audit(
                actor,
                "receiveOriginal",
                [ref(evidence), ref(custody)],
                "Received immutable original bytes.",
            )
            ident = str(uuid4())
            summary = validate(
                "IngestSummary",
                dict(
                    result_type="INGEST",
                    evidence_refs=[ref(evidence)],
                    derivative_refs=[],
                    proposal_ids=[],
                    warnings=["UNSCANNED. Original preserved; extraction queued."],
                ),
            )
            job = validate(
                "Job",
                dict(
                    id=ident,
                    case_id=store.case()["id"],
                    type="INGEST",
                    state="QUEUED",
                    phase="Original preserved; waiting for extraction",
                    fraction=None,
                    result_path=f'/api/v1/cases/{store.case()["id"]}/jobs/{ident}/result',
                    error=None,
                    snapshot_revision=store.case()["case_revision"],
                ),
            )
            store.db.execute(
                "INSERT INTO jobs(id,case_id,type,state,input_json,input_sha256,snapshot_revision,result_json) VALUES(?,?,?,?,?,?,?,?)",
                (
                    ident,
                    store.case()["id"],
                    "INGEST",
                    "QUEUED",
                    canonical(body).decode(),
                    digest(canonical(body)),
                    store.case()["case_revision"],
                    canonical(summary).decode(),
                ),
            )
            store.db.execute(
                "INSERT INTO job_views VALUES(?,?)", (ident, canonical(job).decode())
            )
            store.remember(actor, "ingest", key, body, job)
    return job if defer else process_job(store, job["id"])


def process_job(store, ident, cancelled=None):
    from ..parsing import extract_file
    from ..search import index_derivative, mark_index_revision

    with store.transaction():
        store.require_healthy()
        row = store.db.execute("SELECT * FROM jobs WHERE id=?", (ident,)).fetchone()
        if not row:
            raise DomainError("NOT_FOUND", "Import job not found.", 404)
        job = json.loads(
            store.db.execute(
                "SELECT body FROM job_views WHERE id=?", (ident,)
            ).fetchone()[0]
        )
        if row["state"] in ("SUCCEEDED", "CANCELLED"):
            return job
        summary = json.loads(row["result_json"])
        evidence = store.record(summary["evidence_refs"][0]["id"])
        source = store.verified_path(evidence)
        job.update(
            state="RUNNING",
            phase="Extracting text in an isolated process",
            fraction=None,
        )
        store.db.execute(
            "UPDATE jobs SET state='RUNNING',attempts=attempts+1 WHERE id=?", (ident,)
        )
        store.db.execute(
            "UPDATE job_views SET body=? WHERE id=?", (canonical(job).decode(), ident)
        )
    extracted = extract_file(source, evidence["original_filename"], cancelled)
    with store.transaction():
        state = store.db.execute(
            "SELECT state FROM jobs WHERE id=?", (ident,)
        ).fetchone()[0]
        if state == "CANCELLED":
            return json.loads(
                store.db.execute(
                    "SELECT body FROM job_views WHERE id=?", (ident,)
                ).fetchone()[0]
            )
        if extracted.get("error") == "CANCELLED":
            job.update(
                state="QUEUED",
                phase="Extraction paused; resumes at next start",
                fraction=None,
            )
            store.db.execute("UPDATE jobs SET state='QUEUED' WHERE id=?", (ident,))
            store.db.execute(
                "UPDATE job_views SET body=? WHERE id=?",
                (canonical(job).decode(), ident),
            )
            return job
        store.require_healthy()
        actor = evidence["created_by"]
        warnings = ["UNSCANNED. Original bytes preserved."]
        derivatives = []
        if "error" in extracted:
            descriptions = {
                "PARSER_SERVICE_UNAVAILABLE": "The isolated parser service is unavailable. Restart Aha!, then retry extraction.",
                "LOCKED": "File is password protected. Provide an authorized unlocked copy as a separate source.",
                "OCR_UNAVAILABLE": "OCR tools are unavailable. Install the supported OCR runtime, then retry extraction.",
                "UNSUPPORTED_FORMAT": "Extraction is unavailable for this format. The original can be downloaded.",
                "SANDBOX_OR_RESOURCE_LIMIT": "The parser sandbox could not run or reached a resource limit. Check the supported local runtime before retrying.",
            }
            warnings.append(
                descriptions.get(
                    extracted["error"],
                    f"Extraction did not complete ({extracted['error']}). Inspect the original and retry with a supported copy.",
                )
            )
        else:
            for kind, data, media in [
                ("TEXT", extracted["text"].encode("utf-8"), "text/plain"),
                (
                    "LOCATOR_MAP",
                    canonical(
                        dict(
                            locations=extracted["locations"],
                            source_filename=evidence["original_filename"],
                        )
                    ),
                    "application/json",
                ),
            ]:
                derivative = {
                    **store.base("Derivative", actor),
                    "evidence": ref(evidence),
                    "sha256": digest(data),
                    "bytes": len(data),
                    "derivative_type": kind,
                    "tool": extracted["tool"],
                    "tool_version": extracted["version"],
                    "config_sha256": digest(b"aha-parser-v1-offline-bounded"),
                    "media_type": media,
                }
                store.write_blob(data, "DERIVATIVE", derivative["id"])
                store.put(derivative)
                derivatives.append(ref(derivative))
                if kind == "TEXT":
                    index_derivative(store, derivative)
            store.bump()
            mark_index_revision(store)
            warnings.extend(extracted["warnings"])
        summary.update(derivative_refs=derivatives, warnings=warnings)
        job.update(
            state="SUCCEEDED",
            phase=(
                "Original preserved; text ready"
                if derivatives
                else "Original preserved; extraction needs attention"
            ),
            fraction=1,
        )
        validate("IngestSummary", summary)
        validate("Job", job)
        store.db.execute(
            "UPDATE jobs SET state='SUCCEEDED',result_json=? WHERE id=?",
            (canonical(summary).decode(), ident),
        )
        store.db.execute(
            "UPDATE job_views SET body=? WHERE id=?", (canonical(job).decode(), ident)
        )
        store.audit(
            actor,
            "completeExtraction",
            derivatives,
            "Completed import processing; originals unchanged.",
        )
        return job
