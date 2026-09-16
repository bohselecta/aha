"""Portable backup health and a real restore rehearsal in a fresh directory."""

import json
import tempfile
from datetime import datetime, timezone
from .domain.contracts import DomainError, validate
from .storage.portable import restore
from .storage.store import canonical, file_digest, now


def artifacts(store):
    return [
        validate("ExportArtifact", json.loads(row[0]))
        for row in store.db.execute(
            "SELECT result_json FROM jobs WHERE type='BACKUP' AND state='SUCCEEDED' ORDER BY rowid DESC"
        )
    ]


def path_for(store, artifact):
    validate("ExportArtifact", artifact)
    return store.path / "exports" / (artifact["export_id"] + ".aha-case.zip")


def cleanup_exports(store):
    if store.inspection_only:
        return
    with store.lock:
        for artifact in artifacts(store):
            if datetime.fromisoformat(artifact["expires_at"]) <= datetime.now(
                timezone.utc
            ):
                path_for(store, artifact).unlink(missing_ok=True)


def health(store):
    cleanup_exports(store)
    with store.lock:
        latest = next(iter(artifacts(store)), None)
        row = store.db.execute(
            "SELECT value FROM metadata WHERE key='backup_rehearsal'"
        ).fetchone()
        return {
            "latest": latest,
            "available": bool(latest and path_for(store, latest).is_file()),
            "rehearsal": json.loads(row[0]) if row else None,
        }


def rehearse(store, actor, expected, key):
    with store.lock:
        store.require_healthy()
        replay = store.precondition(actor, "backup-rehearsal", key, {}, expected)
        if replay is not None:
            return replay
        status = health(store)
        artifact = status["latest"]
        if not status["available"]:
            raise DomainError(
                "BACKUP_REQUIRED",
                "Create a new portable backup before rehearsing recovery.",
                409,
            )
        path = path_for(store, artifact)
        if file_digest(path) != artifact["sha256"]:
            raise DomainError(
                "INTEGRITY_FAILURE",
                "Backup bytes no longer match their recorded hash.",
                409,
            )
        # Same storage device for this rehearsal; an independent/off-device drill remains necessary.
        with tempfile.TemporaryDirectory(
            prefix="aha-recovery-", dir=store.path / "staging"
        ) as directory:
            manifest = restore(path, directory)
        value = {
            "export_id": artifact["export_id"],
            "sha256": artifact["sha256"],
            "case_revision": manifest["case_revision"],
            "verified_at": now(),
            "file_count": len(manifest["files"]),
            "result": "RESTORED_AND_VERIFIED",
        }
        with store.transaction():
            store.db.execute(
                "INSERT INTO metadata VALUES('backup_rehearsal',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                (canonical(value).decode(),),
            )
            store.audit(
                actor,
                "rehearseRestore",
                [],
                "Restored latest backup into a separate temporary directory and verified content; temporary copy removed.",
            )
            store.remember(actor, "backup-rehearsal", key, {}, value)
        return value
