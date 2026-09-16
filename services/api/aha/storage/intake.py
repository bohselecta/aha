"""Original receipt only. Unsupported extraction is explicitly reported."""

import re
from uuid import uuid4
from .store import digest, ref, now, canonical
from ..domain.contracts import validate


def receive(store, data, filename, media_type, actor, expected, key, source_note):
    filename = re.sub(r"[\x00-\x1f/\\]", "_", filename)[:200] or "unnamed"
    body = {
        "sha256": digest(data),
        "bytes": len(data),
        "filename": filename,
        "media_type": media_type,
        "source_note": source_note,
    }
    with store.transaction():
        replay = store.precondition(actor, "ingest", key, body, expected)
        if replay is not None:
            return replay
        sha, path = store.write_blob(data)
        evidence = {
            **store.base("Evidence", actor),
            "sha256": sha,
            "bytes": len(data),
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
            (sha, path, len(data), "ORIGINAL"),
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
        derivatives = []
        warnings = ["UNSCANNED. Original bytes preserved."]
        if filename.lower().endswith(".txt") and len(data) <= 10 * 1024**2:
            try:
                text = data.decode("utf-8", errors="strict")
                if "\x00" in text:
                    raise ValueError("Binary content")
                derivative = {
                    **store.base("Derivative", actor),
                    "evidence": ref(evidence),
                    "sha256": sha,
                    "bytes": len(data),
                    "derivative_type": "TEXT",
                    "tool": "identity-utf8",
                    "tool_version": "1.0.0",
                    "config_sha256": digest(b"utf8-strict-no-normalization"),
                    "media_type": "text/plain",
                }
                store.write_blob(data, "DERIVATIVE", derivative["id"])
                store.put(derivative)
                derivatives.append(ref(derivative))
            except (UnicodeDecodeError, ValueError):
                warnings.append(
                    "Stored; text extraction failed. Requires valid UTF-8 without NUL."
                )
        else:
            warnings.append(
                "Stored; extraction unavailable for this format in this build."
            )
        store.bump()
        store.audit(
            actor,
            "receiveOriginal",
            [ref(evidence), ref(custody)],
            "Received immutable original bytes.",
        )
        job_id = str(uuid4())
        result = validate(
            "IngestSummary",
            dict(
                result_type="INGEST",
                evidence_refs=[ref(evidence)],
                derivative_refs=derivatives,
                proposal_ids=[],
                warnings=warnings,
            ),
        )
        job = validate(
            "Job",
            dict(
                id=job_id,
                case_id=store.case()["id"],
                type="INGEST",
                state="SUCCEEDED",
                phase=(
                    "Original preserved; UTF-8 extracted"
                    if derivatives
                    else "Original preserved; extraction unavailable"
                ),
                fraction=1,
                result_path=f'/api/v1/cases/{store.case()["id"]}/jobs/{job_id}/result',
                error=None,
                snapshot_revision=store.case()["case_revision"],
            ),
        )
        store.db.execute(
            "INSERT INTO jobs(id,case_id,type,state,input_json,input_sha256,snapshot_revision,result_json) VALUES(?,?,?,?,?,?,?,?)",
            (
                job_id,
                store.case()["id"],
                "INGEST",
                "SUCCEEDED",
                canonical(body).decode(),
                digest(canonical(body)),
                store.case()["case_revision"],
                canonical(result).decode(),
            ),
        )
        store.db.execute(
            "INSERT INTO job_views VALUES(?,?)", (job_id, canonical(job).decode())
        )
        store.remember(actor, "ingest", key, body, job)
        return job
