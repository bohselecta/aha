import json
from datetime import datetime, timezone, timedelta
from aha.recovery import health, rehearse
from aha.storage.store import canonical, file_digest
from aha.storage.portable import backup
from aha.storage.intake import receive
from aha.domain.contracts import DomainError
import pytest


def test_real_restore_rehearsal_and_expired_copy_cleanup(store):
    receive(
        store,
        b"SYNTHETIC\n" + b"A" * 200000,
        "repetitive.txt",
        "text/plain",
        "reviewer",
        0,
        "receive",
        "Synthetic repetitive source",
    )
    ident = "00000000-0000-4000-8000-000000000099"
    path = store.path / "exports" / (ident + ".aha-case.zip")
    manifest = backup(store, path)
    artifact = dict(
        result_type="EXPORT",
        export_id=ident,
        sha256=file_digest(path),
        bytes=path.stat().st_size,
        case_revision=manifest["case_revision"],
        expires_at=(datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
    )
    store.db.execute(
        "INSERT INTO jobs(id,case_id,type,state,input_json,input_sha256,snapshot_revision,result_json) VALUES(?,?,'BACKUP','SUCCEEDED','{}',?,?,?)",
        (
            ident,
            store.case()["id"],
            "0" * 64,
            manifest["case_revision"],
            canonical(artifact).decode(),
        ),
    )
    before = store.case()["case_revision"]
    result = rehearse(store, "reviewer", before, "rehearsal")
    assert result["result"] == "RESTORED_AND_VERIFIED"
    assert result["case_revision"] == before
    assert store.case()["case_revision"] == before
    assert rehearse(store, "reviewer", before, "rehearsal") == result
    assert not list((store.path / "staging").glob("aha-recovery-*"))
    assert health(store)["available"]
    artifact["expires_at"] = (
        datetime.now(timezone.utc) - timedelta(seconds=1)
    ).isoformat()
    store.db.execute(
        "UPDATE jobs SET result_json=? WHERE id=?",
        (canonical(artifact).decode(), ident),
    )
    assert not health(store)["available"]
    assert not path.exists()
    assert health(store)["rehearsal"]["sha256"] == result["sha256"]
    assert store.verify()["failures"] == []


def test_quarantine_discovered_in_rejected_transaction_persists(store):
    receive(
        store,
        b"SYNTHETIC source",
        "x.txt",
        "text/plain",
        "reviewer",
        0,
        "receipt",
        "Synthetic",
    )
    source = next(r for r in store.all_records() if r["kind"] == "Evidence")
    path = store.verified_path(source)
    path.chmod(0o600)
    path.write_bytes(b"SYNTHETIC tamper")
    with pytest.raises(DomainError):
        with store.transaction():
            store.verified_path(source)
    with pytest.raises(DomainError, match="quarantined"):
        store.require_healthy()


def test_retention_rejects_untrusted_artifact_path(store):
    from aha.recovery import cleanup_exports

    protected = store.path / "sentinel.aha-case.zip"
    protected.write_bytes(b"SYNTHETIC must remain")
    artifact = dict(
        result_type="EXPORT",
        export_id="../sentinel",
        sha256="0" * 64,
        bytes=1,
        case_revision=0,
        expires_at="2000-01-01T00:00:00Z",
    )
    store.db.execute(
        "INSERT INTO jobs(id,case_id,type,state,input_json,input_sha256,snapshot_revision,result_json) VALUES('untrusted',?,'BACKUP','SUCCEEDED','{}',?,0,?)",
        (store.case()["id"], "0" * 64, canonical(artifact).decode()),
    )
    with pytest.raises(DomainError):
        cleanup_exports(store)
    assert protected.read_bytes() == b"SYNTHETIC must remain"
