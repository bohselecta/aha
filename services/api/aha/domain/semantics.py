from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from .contracts import DomainError, refs, validate


def instant(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")) if value else None


def check_time(t):
    validate("Time", t)
    if t["timezone"]:
        try:
            ZoneInfo(t["timezone"])
        except ZoneInfoNotFoundError:
            raise DomainError("UNKNOWN_TIMEZONE", "Choose an IANA timezone.")
    start, end = instant(t["start"]), instant(t["end"])
    if (
        start
        and end
        and (
            start > end
            or (start == end and not (t["start_inclusive"] and t["end_inclusive"]))
        )
    ):
        raise DomainError("REVERSED_TIME", "Occurrence bounds are reversed or empty.")
    if t["precision"] == "EXACT" and start != end:
        raise DomainError("INEXACT_TIME", "An exact time requires equal bounds.")
    if t["precision"] == "UNKNOWN" and (start or end):
        raise DomainError(
            "UNKNOWN_BOUNDS", "Unknown time cannot assert normalized bounds."
        )


def semantic(record, store, accepted=False):
    validate(record["kind"], record)
    if record["case_id"] != store.case()["id"]:
        raise DomainError("CROSS_CASE", "Record belongs to another case.")
    for path, reference in refs(record):
        target = store.record(reference["id"], reference["revision"])
        if target is None:
            raise DomainError(
                "MISSING_REFERENCE",
                "Referenced version does not exist in this case.",
                path=path,
            )
        if target.get("review") not in (None, "ACCEPTED"):
            raise DomainError(
                "PENDING_REFERENCE", "Accept the prerequisite first.", path=path
            )
        if (
            path.startswith(("/support_refs/", "/premise_refs/"))
            and target.get("origin") == "AI_SYNTHETIC"
        ):
            raise DomainError(
                "SYNTHETIC_SUPPORT",
                "Synthetic material cannot serve as evidence support.",
                path=path,
            )
    for c in record.get("citations", []):
        if c["locator"]["type"] != "text":
            raise DomainError(
                "LOCATOR_UNAVAILABLE",
                "This build validates text locators only; other locators require the parser milestone.",
            )
        evidence = store.record(c["evidence"]["id"], c["evidence"]["revision"])
        if evidence["kind"] != "Evidence" or evidence["sha256"] != c["evidence_sha256"]:
            raise DomainError("CITATION_HASH", "Citation does not match the original.")
        store.verified_path(evidence)
        if c["locator"]["type"] == "text" and not c.get("derivative"):
            raise DomainError(
                "CITATION_DERIVATIVE", "Text citations require an immutable derivative."
            )
        if c.get("quote") and (
            c["locator"]["type"] != "text" or not c.get("derivative")
        ):
            raise DomainError(
                "QUOTE_UNVERIFIED", "Exact quotes require verified text offsets."
            )
        if c.get("derivative"):
            derivative = store.record(
                c["derivative"]["id"], c["derivative"]["revision"]
            )
            if (
                derivative["kind"] != "Derivative"
                or derivative["sha256"] != c["derivative_sha256"]
                or derivative["evidence"] != c["evidence"]
            ):
                raise DomainError(
                    "CITATION_DERIVATIVE",
                    "Citation derivative does not match its source.",
                )
            data = store.verified_blob(derivative)
            locator = c["locator"]
            if locator["type"] == "text":
                text = data.decode("utf-8")
                if not 0 <= locator["start"] < locator["end"] <= len(text):
                    raise DomainError(
                        "CITATION_RANGE",
                        "Text offsets are outside the immutable derivative.",
                    )
                if (
                    c.get("quote") is not None
                    and c["quote"] != text[locator["start"] : locator["end"]]
                ):
                    raise DomainError(
                        "QUOTE_MISMATCH", "Quote does not match the exact source range."
                    )
    expected_kinds = {
        "subject_refs": {"Entity"},
        "entity_refs": {"Entity"},
        "evidence": {"Evidence"},
        "derivative": {"Derivative"},
        "participant_refs": {"Entity"},
        "observation_refs": {"Observation"},
        "proposition_refs": {"Observation", "Event", "Interpretation"},
    }
    for path, reference in refs(record):
        field = path.split("/")[1]
        if (
            field in expected_kinds
            and store.record(reference["id"], reference["revision"])["kind"]
            not in expected_kinds[field]
        ):
            raise DomainError("WRONG_KIND", "Reference has the wrong kind.", path=path)
    for key in ("occurrence", "interval"):
        if key in record:
            check_time(record[key])
    if record["kind"] == "Edge":
        if record["from_ref"] == record["to_ref"] and record["relation"] != "REFERS_TO":
            raise DomainError(
                "SELF_EDGE", "Only REFERS_TO can link a record to itself."
            )
        if record["tier"] in ("DOCUMENTED", "OBSERVED") and not record["support_refs"]:
            raise DomainError(
                "EDGE_SUPPORT", "A connection needs its own accepted support."
            )
    if (
        record["kind"] == "ClockCorrection"
        and record["offset_min_seconds"] > record["offset_max_seconds"]
    ):
        raise DomainError("CLOCK_BOUNDS", "Clock correction bounds are reversed.")
    if record["kind"] == "Hypothesis" and record["falsifiability"] == "TESTABLE":
        if not record["weaken_if"] or not record["retire_if"]:
            raise DomainError(
                "FALSIFIER_REQUIRED",
                "Describe what would weaken and retire a testable explanation.",
            )
    if record["kind"] == "Edge" and record["independence"] == "REVIEWED_INDEPENDENT":
        lineage = []
        for reference in record["support_refs"]:
            basis = store.record(reference["id"], reference["revision"])
            if basis["kind"] == "Observation":
                lineage.append(basis["provenance_group"])
                if basis["independence"] != "REVIEWED_INDEPENDENT":
                    raise DomainError(
                        "INDEPENDENCE_UNREVIEWED",
                        "Review source independence before asserting independent support.",
                    )
        if len(lineage) < 2 or len(set(lineage)) != len(lineage):
            raise DomainError(
                "SHARED_LINEAGE",
                "Independent corroboration requires separately reviewed source groups.",
            )
    if record["kind"] == "Contradiction":
        claims = [
            store.record(r["id"], r["revision"]) for r in record["proposition_refs"]
        ]
        if len({r["id"] for r in claims}) < 2:
            raise DomainError(
                "DISTINCT_CLAIMS", "Select at least two different propositions."
            )
        if record["strength"] == "LOGICAL":
            raise DomainError(
                "LOGICAL_RULE_UNAVAILABLE",
                "Record this as a potential conflict until the identity, time, and deterministic rule prerequisites are established.",
            )
    if record["kind"] == "TemporalConstraint":
        left = store.record(record["left"]["id"], record["left"]["revision"])
        if "occurrence" not in left:
            raise DomainError(
                "TIME_REQUIRED", "Select a statement or event with an occurrence field."
            )
        if record["constraint_type"] == "BEFORE":
            if not record["right"] or record["right"] == record["left"]:
                raise DomainError(
                    "TIME_PAIR_REQUIRED",
                    "Select a different statement or event as the later occurrence.",
                )
            right = store.record(record["right"]["id"], record["right"]["revision"])
            if "occurrence" not in right:
                raise DomainError(
                    "TIME_REQUIRED", "The later record needs an occurrence field."
                )
        elif record["window"] is None:
            raise DomainError(
                "WINDOW_REQUIRED",
                "An interval constraint needs an explicit time window.",
            )
        if record["window"]:
            check_time(record["window"])
        lo, hi = record["min_lag_seconds"], record["max_lag_seconds"]
        if lo is not None and hi is not None and lo > hi:
            raise DomainError("REVERSED_TIME", "Minimum lag exceeds maximum lag.")
    # A new current version cannot introduce a premise cycle through an older version.
    pending = [
        r for p, r in refs(record) if p.startswith(("/support_refs/", "/premise_refs/"))
    ]
    visited = set()
    while pending:
        ref = pending.pop()
        if ref["id"] == record["id"]:
            raise DomainError("PREMISE_CYCLE", "Premise dependencies must be acyclic.")
        key = (ref["id"], ref["revision"])
        if key in visited:
            continue
        visited.add(key)
        target = store.record(*key)
        pending.extend(
            r
            for p, r in refs(target)
            if p.startswith(("/support_refs/", "/premise_refs/"))
        )
    return record
