from copy import deepcopy
import pytest
from aha.domain.semantics import check_time, semantic
from aha.domain.contracts import DomainError
from aha.storage.store import Registry
from aha.commands.execute import execute
from scripts.demo import seed


@pytest.fixture
def demo(tmp_path):
    root = tmp_path / "synthetic"
    ident = seed(root)
    registry = Registry(root)
    yield registry.get(ident)
    registry.close()


def test_quote_mismatch_and_unicode_offsets(demo):
    observation = deepcopy(
        next(r for r in demo.all_records() if r["kind"] == "Observation")
    )
    observation["citations"][0]["quote"] = "Fabricated quotation"
    with pytest.raises(DomainError, match="exact source range"):
        semantic(observation, demo)
    observation = deepcopy(
        next(r for r in demo.all_records() if r["kind"] == "Observation")
    )
    observation["citations"][0]["locator"]["end"] = 100000
    with pytest.raises(DomainError, match="outside"):
        semantic(observation, demo)


def test_unsupported_edge_and_synthetic_promotion(demo):
    edge = deepcopy(next(r for r in demo.all_records() if r["kind"] == "Edge"))
    edge.update(tier="DOCUMENTED", support_refs=[], citations=[])
    with pytest.raises(DomainError):
        semantic(edge, demo)
    edge["origin"] = "AI_SYNTHETIC"
    with pytest.raises(DomainError):
        semantic(edge, demo)


def test_retirement_cannot_transition(demo):
    old = next(
        r
        for r in demo.all_records()
        if r["kind"] == "Hypothesis" and r["state"] == "RETIRED"
    )
    with pytest.raises(DomainError, match="not allowed"):
        execute(
            demo,
            dict(
                type="transitionHypothesis",
                hypothesis={"id": old["id"], "revision": old["revision"]},
                target_state="TESTING",
                reason="Trying to revive retired explanation",
                evidence_refs=[],
            ),
            "operator",
            demo.case()["case_revision"],
            "transition",
        )


def test_open_and_reversed_intervals(demo):
    time = deepcopy(
        next(r["occurrence"] for r in demo.all_records() if r["kind"] == "Observation")
    )
    time.update(
        precision="RANGE", start=None, end="2026-01-01T00:00:00Z", timezone="UTC"
    )
    check_time(time)
    time["start"] = "2026-01-02T00:00:00Z"
    with pytest.raises(DomainError):
        check_time(time)
    time.update(start=time["end"], start_inclusive=False)
    with pytest.raises(DomainError):
        check_time(time)


def test_source_correction_preserves_bytes_through_restore(demo, tmp_path):
    from aha.storage.portable import backup, restore
    from aha.domain.contracts import SCHEMA

    original = next(r for r in demo.all_records() if r["kind"] == "Evidence")
    before = demo.verified_blob(original)
    observation = next(r for r in demo.all_records() if r["kind"] == "Observation")
    draft = {
        k: deepcopy(observation[k])
        for k in SCHEMA["$defs"]["HumanObservationDraft"]["properties"]
    }
    draft["statement"] = (
        "SYNTHETIC corrected source representation; source uncertainty retained."
    )
    proposed = execute(
        demo,
        {
            "type": "reviseRecord",
            "target": {"id": observation["id"], "revision": observation["revision"]},
            "record": draft,
            "reason": "Corrected the representation, not the source bytes.",
        },
        "operator",
        demo.case()["case_revision"],
        "correct",
    )
    execute(
        demo,
        {
            "type": "reviewProposal",
            "proposal_id": proposed["proposal_id"],
            "decision": "ACCEPT",
            "reason": "Compared correction with immutable source.",
        },
        "operator",
        demo.case()["case_revision"],
        "review-correction",
    )
    assert demo.verified_blob(original) == before
    bundle = tmp_path / "corrected.aha-case.zip"
    backup(demo, bundle)
    root = tmp_path / "fresh-volume"
    restore(bundle, root)
    registry = Registry(root)
    try:
        restored = registry.get(demo.case()["id"])
        assert restored.verified_blob(original) == before
        assert (
            restored.record(observation["id"], 1)["statement"]
            == observation["statement"]
        )
        assert restored.record(observation["id"])["statement"] == draft["statement"]
    finally:
        registry.close()


def test_unicode_code_point_citation(demo):
    import json
    from aha.storage.intake import receive
    from aha.domain.contracts import SCHEMA

    content = "🦊 café report\n"
    job = receive(
        demo,
        content.encode(),
        "unicode.txt",
        "text/plain",
        "operator",
        demo.case()["case_revision"],
        "unicode-source",
        "Synthetic Unicode source",
    )
    result = json.loads(
        demo.db.execute(
            "SELECT result_json FROM jobs WHERE id=?", (job["id"],)
        ).fetchone()[0]
    )
    original = demo.record(result["evidence_refs"][0]["id"])
    derivative = demo.record(result["derivative_refs"][0]["id"])
    sample = next(r for r in demo.all_records() if r["kind"] == "Observation")
    draft = {
        k: deepcopy(sample[k])
        for k in SCHEMA["$defs"]["HumanObservationDraft"]["properties"]
    }
    draft["citations"] = [
        {
            "evidence": result["evidence_refs"][0],
            "evidence_sha256": original["sha256"],
            "derivative": result["derivative_refs"][0],
            "derivative_sha256": derivative["sha256"],
            "locator": {"type": "text", "start": 2, "end": 6},
            "quote": "café",
        }
    ]
    execute(
        demo,
        {
            "type": "proposeRecord",
            "record": draft,
            "reason": "Unicode code-point offsets.",
        },
        "operator",
        demo.case()["case_revision"],
        "unicode-correct",
    )
    draft["citations"][0]["locator"] = {"type": "text", "start": 3, "end": 7}
    with pytest.raises(DomainError, match="exact source range"):
        execute(
            demo,
            {
                "type": "proposeRecord",
                "record": draft,
                "reason": "Incorrect UTF-16 offsets.",
            },
            "operator",
            demo.case()["case_revision"],
            "unicode-wrong",
        )
