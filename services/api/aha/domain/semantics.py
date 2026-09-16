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
        store.verified_blob(evidence)
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
