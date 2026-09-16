import json
import sqlite3
import zipfile
from pathlib import Path
from uuid import uuid4
import pytest
from aha.storage.store import Store, Registry, digest
from aha.storage.intake import receive
from aha.storage.portable import backup, restore
from aha.commands.execute import execute
from aha.domain.contracts import DomainError, ROOT


def ingest(store, data=b"SYNTHETIC source", key=None, expected=None, name="source.txt"):
    return receive(
        store,
        data,
        name,
        "text/plain",
        "operator",
        store.case()["case_revision"] if expected is None else expected,
        key or str(uuid4()),
        "Synthetic receipt for test.",
    )


def cmd(store, body, key=None, expected=None):
    return execute(
        store,
        body,
        "operator",
        store.case()["case_revision"] if expected is None else expected,
        key or str(uuid4()),
    )


def note(text="Human note"):
    return dict(
        type="proposeRecord",
        record=dict(
            kind="Note", text=text, target_refs=[], note_type="INVESTIGATOR_NOTE"
        ),
        reason="Human entered note.",
    )


def test_original_retry_and_independent_receipts(store):
    first = ingest(store, key="same", expected=0)
    assert ingest(store, key="same", expected=0) == first
    assert store.case()["case_revision"] == 1
    assert len([r for r in store.all_records() if r["kind"] == "Evidence"]) == 1
    with pytest.raises(DomainError, match="different content"):
        ingest(store, b"changed", key="same", expected=0)
    ingest(store, name="different-name.txt")
    originals = [r for r in store.all_records() if r["kind"] == "Evidence"]
    assert len(originals) == 2
    assert originals[0]["sha256"] == originals[1]["sha256"]
    assert len(list((store.path / "originals").rglob("?" * 64))) == 1
    assert len([r for r in store.all_records() if r["kind"] == "CustodyEvent"]) == 2


def test_review_revision_retry_history(store):
    proposal = cmd(store, note(), key="propose", expected=0)
    assert (
        store.case()["case_revision"] == 0
    )  # Technical proposal is not accepted evidence.
    body = dict(
        type="reviewProposal",
        proposal_id=proposal["proposal_id"],
        decision="ACCEPT",
        reason="Reviewed the complete note.",
    )
    result = cmd(store, body, key="accept", expected=0)
    audit_count = store.db.execute("SELECT COUNT(*) FROM audit").fetchone()[0]
    assert cmd(store, body, key="accept", expected=0) == result
    assert store.db.execute("SELECT COUNT(*) FROM audit").fetchone()[0] == audit_count
    with pytest.raises(DomainError, match="Current case revision"):
        cmd(store, note(), expected=0)
    record = next(r for r in store.all_records() if r["kind"] == "Note")
    body = note("Corrected human note")
    body["type"] = "reviseRecord"
    body["target"] = {"id": record["id"], "revision": 1}
    proposal = cmd(store, body)
    assert store.record(record["id"])["text"] == "Human note"
    cmd(
        store,
        dict(
            type="reviewProposal",
            proposal_id=proposal["proposal_id"],
            decision="ACCEPT",
            reason="Reviewed correction.",
        ),
    )
    assert store.record(record["id"], 1)["text"] == "Human note"
    assert store.record(record["id"])["text"] == "Corrected human note"
    for sql in (
        "UPDATE records SET revision=7",
        "DELETE FROM records",
        "DELETE FROM audit",
        "UPDATE audit SET actor='altered'",
    ):
        with pytest.raises(sqlite3.IntegrityError):
            store.db.execute(sql)


def test_rejection_not_case_evidence(store):
    p = cmd(store, note())
    cmd(
        store,
        dict(
            type="reviewProposal",
            proposal_id=p["proposal_id"],
            decision="REJECT",
            reason="Rejected representation.",
        ),
    )
    assert not store.all_records()
    assert store.case()["case_revision"] == 0


def test_writer_lock(store):
    with pytest.raises(DomainError, match="already has a writer"):
        Store(store.path)


def test_backup_restore_tamper(store, tmp_path):
    ingest(store)
    original = next(r for r in store.all_records() if r["kind"] == "Evidence")
    bundle = tmp_path / "backup.aha-case.zip"
    manifest = backup(store, bundle)
    restored = restore(bundle, tmp_path / "fresh-volume")
    assert manifest == restored
    registry = Registry(tmp_path / "fresh-volume")
    try:
        other = registry.get(manifest["case_id"])
        assert other.verified_blob(original) == store.verified_blob(original)
        assert other.case() == store.case()
        assert other.verify()["failures"] == []
    finally:
        registry.close()
    path = (
        store.path / f'originals/sha256/{original["sha256"][:2]}/{original["sha256"]}'
    )
    path.chmod(0o600)
    path.write_bytes(b"tampered")
    assert store.verify()["failures"]
    with pytest.raises(DomainError, match="integrity"):
        backup(store, tmp_path / "bad.zip")
    with pytest.raises(DomainError):
        store.verified_blob(original)


@pytest.mark.parametrize(
    "point",
    ["after_file_fsync", "after_blob_publish", "before_db_commit", "after_db_commit"],
)
def test_crash_recovery(store, registry, point):
    # Fault at each durable boundary, then reopen the same database and retry.
    def crash(at):
        if at == point:
            raise RuntimeError("simulated abrupt exit")

    store.fault = crash
    with pytest.raises(RuntimeError):
        ingest(store, key="recover", expected=0)
    ident = store.case()["id"]
    path = store.path
    store.close()
    registry.stores.pop(ident)
    recovered = registry.get(ident)
    result = ingest(recovered, key="recover", expected=0)
    assert result["state"] == "SUCCEEDED"
    assert recovered.case()["case_revision"] == 1
    assert len([r for r in recovered.all_records() if r["kind"] == "Evidence"]) == 1
    assert recovered.verify()["failures"] == []


@pytest.mark.parametrize(
    "name",
    [
        "../escape",
        "/absolute",
        "a/../../escape",
        "a\\escape",
        "C:/escape",
        "a/./escape",
    ],
)
def test_restore_path_rejection(tmp_path, name):
    bundle = tmp_path / "unsafe.zip"
    with zipfile.ZipFile(bundle, "w") as z:
        z.writestr(name, b"bad")
    with pytest.raises(DomainError):
        restore(bundle, tmp_path / "restore")
    assert not (tmp_path / "escape").exists()


def test_restore_manifest_hash_and_overwrite(store, tmp_path):
    ingest(store)
    bundle = tmp_path / "good.zip"
    backup(store, bundle)
    with pytest.raises(DomainError, match="overwrite"):
        restore(bundle, store.path.parent)
    bad = tmp_path / "corrupt.zip"
    with zipfile.ZipFile(bundle) as source, zipfile.ZipFile(bad, "w") as target:
        for name in source.namelist():
            target.writestr(
                name, b"corrupt" if name == "case.sqlite" else source.read(name)
            )
    with pytest.raises(DomainError):
        restore(bad, tmp_path / "fresh")


def test_cross_case_reference(store, registry):
    other = registry.get(
        registry.create(
            dict(title="other", timezone="UTC", synthetic=True), "operator"
        )["id"]
    )
    p = cmd(other, note())
    cmd(
        other,
        dict(
            type="reviewProposal",
            proposal_id=p["proposal_id"],
            decision="ACCEPT",
            reason="Reviewed.",
        ),
    )
    foreign = next(r for r in other.all_records() if r["kind"] == "Note")
    body = note()
    body["record"]["target_refs"] = [dict(id=foreign["id"], revision=1)]
    with pytest.raises(DomainError, match="does not exist"):
        cmd(store, body)


def test_authority_fields_rejected(store):
    body = note()
    body["record"]["review"] = "ACCEPTED"
    with pytest.raises(DomainError, match="satisfy Command"):
        cmd(store, body)


@pytest.mark.parametrize(
    "point",
    ["after_file_fsync", "after_blob_publish", "before_db_commit", "after_db_commit"],
)
def test_actual_process_termination_and_replay(tmp_path, point):
    import subprocess, sys, os

    root = tmp_path / "synthetic-crash"
    reg = Registry(root)
    case = reg.create(
        dict(title="Synthetic crash", timezone="UTC", synthetic=True), "operator"
    )
    reg.close()
    script = """
import os,sys
from aha.storage.store import Registry
from aha.storage.intake import receive
registry=Registry(sys.argv[1]);store=registry.get(sys.argv[2])
store.fault=lambda at: os._exit(77) if at==sys.argv[3] else None
receive(store,b'SYNTHETIC crash bytes','source.txt','text/plain','operator',0,'retry','Synthetic test')
"""
    env = {**os.environ, "PYTHONPATH": str(ROOT / "services/api")}
    process = subprocess.run(
        [sys.executable, "-c", script, str(root), case["id"], point],
        env=env,
        capture_output=True,
    )
    assert process.returncode == 77, process.stderr
    reg = Registry(root)
    try:
        store = reg.get(case["id"])
        receive(
            store,
            b"SYNTHETIC crash bytes",
            "source.txt",
            "text/plain",
            "operator",
            0,
            "retry",
            "Synthetic test",
        )
        assert store.case()["case_revision"] == 1
        assert len([r for r in store.all_records() if r["kind"] == "Evidence"]) == 1
        assert store.verify()["failures"] == []
    finally:
        reg.close()


def test_concurrent_review_conflict(store):
    from concurrent.futures import ThreadPoolExecutor

    first = cmd(store, note("first"))
    second = cmd(store, note("second"))

    def review(p):
        try:
            return cmd(
                store,
                dict(
                    type="reviewProposal",
                    proposal_id=p["proposal_id"],
                    decision="ACCEPT",
                    reason="Reviewed.",
                ),
                expected=0,
            )
        except DomainError as e:
            return e.code

    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(pool.map(review, [first, second]))
    assert sum(isinstance(o, dict) for o in outcomes) == 1
    assert "STALE_REVISION" in outcomes
    assert store.case()["case_revision"] == 1


def test_command_idempotency_binds_changed_body(store):
    first = cmd(store, note(), key="bound-command", expected=0)
    assert cmd(store, note(), key="bound-command", expected=0) == first
    with pytest.raises(DomainError, match="different content"):
        cmd(store, note("Changed command body"), key="bound-command", expected=0)
    assert store.db.execute("SELECT COUNT(*) FROM proposals").fetchone()[0] == 1


def test_restore_rejects_modified_database_schema(store, tmp_path):
    ingest(store)
    original = tmp_path / "original.zip"
    backup(store, original)
    with zipfile.ZipFile(original) as z:
        members = {name: z.read(name) for name in z.namelist()}
    database = tmp_path / "edited.sqlite"
    database.write_bytes(members["case.sqlite"])
    connection = sqlite3.connect(database)
    connection.execute(
        "CREATE TRIGGER untrusted AFTER INSERT ON proposals BEGIN DELETE FROM current_records; END;"
    )
    connection.commit()
    connection.close()
    members["case.sqlite"] = database.read_bytes()
    manifest = json.loads(members["manifest.json"])
    entry = next(f for f in manifest["files"] if f["path"] == "case.sqlite")
    entry.update(
        bytes=len(members["case.sqlite"]), sha256=digest(members["case.sqlite"])
    )
    members["manifest.json"] = json.dumps(manifest).encode()
    malicious = tmp_path / "modified.zip"
    with zipfile.ZipFile(malicious, "w") as z:
        for name, data in members.items():
            z.writestr(name, data)
    with pytest.raises(DomainError, match="schema does not match"):
        restore(malicious, tmp_path / "restore")
