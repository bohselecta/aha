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
    assert store.case()["case_revision"] == 2
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
    assert recovered.case()["case_revision"] == 2
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
        assert store.case()["case_revision"] == 2
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


def test_repetitive_backup_roundtrip_and_writer_limits(store, tmp_path, monkeypatch):
    from aha.storage import portable

    content = b"SYNTHETIC\n" + b"A" * 200000
    ingest(store, content)
    bundle = tmp_path / "repetitive.zip"
    backup(store, bundle)
    restore(bundle, tmp_path / "fresh")
    registry = Registry(tmp_path / "fresh")
    try:
        recovered = registry.get(store.case()["id"])
        original = next(r for r in recovered.all_records() if r["kind"] == "Evidence")
        assert recovered.verified_blob(original) == content
    finally:
        registry.close()
    monkeypatch.setattr(portable, "MAX_BUNDLE_BYTES", 100)
    rejected = tmp_path / "oversize.zip"
    with pytest.raises(DomainError, match="limit"):
        backup(store, rejected)
    assert not rejected.exists()


def test_unsupported_format_does_not_touch_case(store, registry):
    ident, path = store.case()["id"], store.path
    store.db.execute("PRAGMA user_version=99")
    store.close()
    registry.stores.pop(ident)
    before = {
        str(p.relative_to(path)): (p.stat().st_mtime_ns, p.read_bytes())
        for p in path.rglob("*")
        if p.is_file()
    }
    inspection = Store(path)
    try:
        assert inspection.inspection_only
        assert inspection.case()["id"] == ident
        with pytest.raises(DomainError, match="inspection-only"):
            with inspection.transaction():
                pass
    finally:
        inspection.close()
    after = {
        str(p.relative_to(path)): (p.stat().st_mtime_ns, p.read_bytes())
        for p in path.rglob("*")
        if p.is_file()
    }
    assert after == before


def test_quarantine_survives_reopen_until_successful_operator_verification(
    store, registry
):
    ingest(store)
    original = next(r for r in store.all_records() if r["kind"] == "Evidence")
    path = store.blob_path(original)
    content = path.read_bytes()
    path.chmod(0o600)
    path.write_bytes(b"tampered")
    assert store.verify()["failures"]
    ident = store.case()["id"]
    store.close()
    registry.stores.pop(ident)
    recovered = registry.get(ident)
    with pytest.raises(DomainError, match="quarantined"):
        cmd(recovered, note())
    path.write_bytes(content)
    assert recovered.verify()["failures"]
    assert recovered.verify(recheck=True)["failures"] == []
    assert cmd(recovered, note())["proposal_id"]


def test_empty_case_manual_reasoning_and_historical_references(store, tmp_path):
    def accept(draft, key):
        proposed = cmd(
            store,
            {
                "type": "proposeRecord",
                "record": draft,
                "reason": "Synthetic manual workflow.",
            },
            key=key,
        )
        reviewed = cmd(
            store,
            {
                "type": "reviewProposal",
                "proposal_id": proposed["proposal_id"],
                "decision": "ACCEPT",
                "reason": "Compared with the complete source and reviewed basis.",
            },
        )
        return store.record(reviewed["changed_refs"][0]["id"])

    from aha.storage.store import ref

    ingest(store, b"SYNTHETIC: the crate arrived before closing.")
    evidence = next(r for r in store.all_records() if r["kind"] == "Evidence")
    derivative = next(
        r
        for r in store.all_records()
        if r["kind"] == "Derivative" and r["derivative_type"] == "TEXT"
    )
    subject = accept(
        dict(
            kind="Entity",
            label="Records crate",
            entity_type="OBJECT",
            aliases=[],
            source_refs=[ref(evidence)],
        ),
        "entity",
    )
    time = dict(
        raw="before closing",
        start=None,
        end=None,
        start_inclusive=True,
        end_inclusive=True,
        timezone=None,
        precision="UNKNOWN",
        clock_source="Source account",
        tolerance_seconds=None,
        alternative_refs=[],
    )
    common = dict(
        tier="OBSERVED",
        citations=[
            dict(
                evidence=ref(evidence),
                evidence_sha256=evidence["sha256"],
                derivative=ref(derivative),
                derivative_sha256=derivative["sha256"],
                locator=dict(
                    type="text",
                    start=0,
                    end=len("SYNTHETIC: the crate arrived before closing."),
                ),
                quote="SYNTHETIC: the crate arrived before closing.",
            )
        ],
        support_refs=[],
        counter_refs=[],
        rationale="Literal report, not independently established.",
    )
    observation = accept(
        dict(
            kind="Observation",
            **common,
            statement="The source reports arrival before closing.",
            subject_refs=[ref(subject)],
            predicate="arrived",
            object_value="before closing",
            occurrence=time,
            discovered_at=None,
            recorded_at=None,
            provenance_group=evidence["id"],
            independence="UNKNOWN",
        ),
        "observation",
    )
    basis = dict(
        tier="INFERRED",
        citations=[],
        support_refs=[ref(observation)],
        counter_refs=[],
        rationale="Timing inferred from the attributed account.",
    )
    event = accept(
        dict(
            kind="Event",
            **basis,
            label="Reported arrival",
            occurrence=time,
            participant_refs=[ref(subject)],
            observation_refs=[ref(observation)],
        ),
        "event",
    )
    edge = accept(
        dict(
            kind="Edge",
            **basis,
            from_ref=ref(subject),
            to_ref=ref(event),
            relation="PARTICIPATED_IN",
            independence="UNKNOWN",
        ),
        "edge",
    )
    hypothesis = accept(
        dict(
            kind="Hypothesis",
            **{**basis, "tier": "SPECULATIVE"},
            claim="The crate arrived during the normal delivery window.",
            family_key="normal-delivery",
            strengthen_if=["A dated receipt matches."],
            weaken_if=["The receipt predates the arrival."],
            retire_if=["A reliable record places arrival elsewhere."],
            falsifiability="TESTABLE",
        ),
        "hypothesis",
    )
    cmd(
        store,
        dict(
            type="transitionHypothesis",
            hypothesis=ref(hypothesis),
            target_state="TESTING",
            reason="Check the receipt.",
            evidence_refs=[],
        ),
    )
    testing = store.record(hypothesis["id"])
    cmd(
        store,
        dict(
            type="transitionHypothesis",
            hypothesis=ref(testing),
            target_state="RETIRED",
            reason="Synthetic disconfirmation for lifecycle test.",
            evidence_refs=[ref(observation)],
        ),
    )
    with pytest.raises(DomainError, match="after retirement"):
        cmd(
            store,
            dict(
                type="reopenHypothesis",
                hypothesis=ref(store.record(hypothesis["id"])),
                new_evidence_refs=[ref(observation)],
                reason="Old evidence cannot unlock retirement.",
            ),
        )
    revised = {
        k: v
        for k, v in subject.items()
        if k in ("kind", "label", "entity_type", "aliases", "source_refs")
    }
    revised["label"] = "Records crate A"
    p = cmd(
        store,
        dict(
            type="reviseRecord",
            target=ref(subject),
            record=revised,
            reason="Clarified label.",
        ),
    )
    cmd(
        store,
        dict(
            type="reviewProposal",
            proposal_id=p["proposal_id"],
            decision="ACCEPT",
            reason="Reviewed label correction.",
        ),
    )
    assert store.record(subject["id"], 1)["label"] == "Records crate"
    assert store.record(edge["id"])["from_ref"] == ref(subject)
    bundle = tmp_path / "manual.zip"
    backup(store, bundle)
    restore(bundle, tmp_path / "restored")
