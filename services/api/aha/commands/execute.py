import json
from copy import deepcopy
from uuid import uuid4
from ..domain.contracts import DomainError, SCHEMA, validate, refs
from ..domain.semantics import semantic
from ..storage.store import ref, now, canonical

SUPPORTED_DRAFTS = {"Note", "Entity", "Observation"}
TRANSITIONS = {
    "PROPOSED": {"TESTING", "RETIRED"},
    "TESTING": {"SUPPORTED", "WEAKENED", "RETIRED"},
    "SUPPORTED": {"TESTING", "WEAKENED", "RETIRED"},
    "WEAKENED": {"TESTING", "RETIRED"},
    "RETIRED": set(),
}


def current(store, reference, kind=None):
    record = store.record(reference["id"])
    if not record:
        raise DomainError("NOT_FOUND", "Record not found.", 404)
    if record["revision"] != reference["revision"]:
        raise DomainError("STALE_RECORD", "Referenced record has changed.", 409)
    if kind and record["kind"] != kind:
        raise DomainError("WRONG_KIND", "Reference has the wrong record kind.")
    return record


def version(store, record, actor):
    return {
        **deepcopy(record),
        "revision": record["revision"] + 1,
        "introduced_case_revision": store.case()["case_revision"] + 1,
        "created_at": now(),
        "created_by": actor,
    }


def draft_record(store, draft, actor, prior=None):
    if draft["kind"] not in SUPPORTED_DRAFTS:
        raise DomainError(
            "NOT_IMPLEMENTED", "This draft kind is not enabled in this build.", 503
        )
    record = {**store.base(draft["kind"], actor), **deepcopy(draft)}
    props = SCHEMA["$defs"][draft["kind"]]["properties"]
    if "review" in props:
        record["review"] = "PENDING"
    if "origin" in props:
        record["origin"] = "HUMAN"
    if draft["kind"] == "Hypothesis":
        record.update(
            state="PROPOSED",
            predecessor_id=None,
            retirement_reason=None,
            retired_at_case_revision=None,
            reopening_evidence=[],
        )
        if prior:
            for k in (
                "state",
                "predecessor_id",
                "retirement_reason",
                "retired_at_case_revision",
                "reopening_evidence",
            ):
                record[k] = prior[k]
        for old in store.all_records():
            if (
                old["kind"] == "Hypothesis"
                and old["state"] == "RETIRED"
                and old["family_key"].casefold().strip()
                == record["family_key"].casefold().strip()
            ):
                raise DomainError(
                    "RETIRED_FAMILY",
                    "Retired explanation: new evidence and review required.",
                )
    if prior:
        record.update(id=prior["id"], revision=prior["revision"] + 1)
    return semantic(record, store)


def execute(store, command, actor, expected, key):
    validate("Command", command)
    if not command["reason"].strip():
        raise DomainError("REASON_REQUIRED", "Enter a review reason.")
    with store.transaction():
        replay = store.precondition(actor, "commands", key, command, expected)
        if replay is not None:
            return replay
        kind = command["type"]
        changed = []
        proposal_id = None
        accepted = []
        bump = False
        if kind in ("proposeRecord", "reviseRecord"):
            prior = None
            if kind == "reviseRecord":
                prior = current(store, command["target"], command["record"]["kind"])
                if prior.get("state") == "RETIRED":
                    raise DomainError(
                        "TERMINAL_RETIREMENT",
                        "A retired explanation requires a new successor.",
                    )
            record = draft_record(store, command["record"], actor, prior)
            proposal_id = str(uuid4())
            proposal = dict(
                id=proposal_id,
                case_revision=store.case()["case_revision"],
                record=record,
                status="PENDING",
                run_id=None,
            )
            validate("Proposal", proposal)
            store.db.execute(
                "INSERT INTO proposals VALUES(?,?,?,?,?)",
                (
                    proposal_id,
                    record["case_id"],
                    proposal["case_revision"],
                    canonical(proposal).decode(),
                    "PENDING",
                ),
            )
            store.db.execute(
                "INSERT INTO proposal_targets VALUES(?,?)",
                (proposal_id, json.dumps(ref(prior)) if prior else None),
            )
        elif kind == "reviewProposal":
            row = store.db.execute(
                "SELECT body,state FROM proposals WHERE id=?", (command["proposal_id"],)
            ).fetchone()
            if not row:
                raise DomainError("NOT_FOUND", "Proposal not found.", 404)
            if row["state"] != "PENDING":
                raise DomainError("ALREADY_REVIEWED", "Proposal already reviewed.", 409)
            proposal = json.loads(row["body"])
            record = proposal["record"]
            target = store.db.execute(
                "SELECT target FROM proposal_targets WHERE id=?", (proposal["id"],)
            ).fetchone()[0]
            if target:
                current(store, json.loads(target), record["kind"])
            proposal["status"] = (
                "ACCEPTED" if command["decision"] == "ACCEPT" else "REJECTED"
            )
            if command["decision"] == "ACCEPT":
                # All prerequisite versions must still be current at human acceptance.
                for _, reference in refs(record):
                    current(store, reference)
                record["review"] = "ACCEPTED"
                record["introduced_case_revision"] = store.case()["case_revision"] + 1
                semantic(record, store, accepted=True)
                accepted.append(record)
                bump = True
            proposal["record"] = record
            store.db.execute(
                "UPDATE proposals SET body=?,state=? WHERE id=?",
                (canonical(proposal).decode(), proposal["status"], proposal["id"]),
            )
            proposal_id = proposal["id"]
        elif kind == "transitionHypothesis":
            old = current(store, command["hypothesis"], "Hypothesis")
            target = command["target_state"]
            if target not in TRANSITIONS[old["state"]]:
                raise DomainError(
                    "INVALID_TRANSITION", "This lifecycle transition is not allowed."
                )
            evidence = [current(store, r) for r in command["evidence_refs"]]
            if any(
                r.get("origin") == "AI_SYNTHETIC"
                or r.get("review") not in (None, "ACCEPTED")
                for r in evidence
            ):
                raise DomainError(
                    "INVALID_BASIS", "Choose accepted nonsynthetic evidence."
                )
            if target in ("SUPPORTED", "WEAKENED", "RETIRED") and not evidence:
                raise DomainError(
                    "BASIS_REQUIRED",
                    "Cite support or counter-support for this transition.",
                )
            record = version(store, old, actor)
            record["state"] = target
            if target == "SUPPORTED":
                record["support_refs"] = command["evidence_refs"]
            if target in ("WEAKENED", "RETIRED"):
                record["counter_refs"] = command["evidence_refs"]
            if target == "RETIRED":
                record.update(
                    retirement_reason=command["reason"],
                    retired_at_case_revision=store.case()["case_revision"] + 1,
                )
            semantic(record, store, True)
            accepted.append(record)
            bump = True
        elif kind == "setAnchor":
            proposition = current(store, command["proposition"])
            if (
                proposition["kind"] not in ("Observation", "Event")
                or proposition.get("review") != "ACCEPTED"
                or proposition.get("tier") not in ("DOCUMENTED", "OBSERVED")
                or not proposition.get("citations")
            ):
                raise DomainError(
                    "ANCHOR_BASIS",
                    "Choose an accepted source-cited observation or event.",
                )
            old = next(
                (
                    r
                    for r in store.all_records()
                    if r["kind"] == "Anchor"
                    and r["proposition"]["id"] == proposition["id"]
                ),
                None,
            )
            record = version(store, old, actor) if old else store.base("Anchor", actor)
            record.update(
                proposition=ref(proposition),
                reason=command["reason"],
                active=command["active"],
            )
            semantic(record, store)
            accepted.append(record)
            bump = True
        elif kind == "excludeSource":
            source = current(store, command["source"], "Evidence")
            store.db.execute(
                "INSERT INTO source_exclusions VALUES(?,?) ON CONFLICT(id) DO UPDATE SET excluded=excluded.excluded",
                (source["id"], int(command["excluded"])),
            )
            changed.append(ref(source))
            bump = True
        else:
            raise DomainError(
                "NOT_IMPLEMENTED", "This command is not enabled in this build.", 503
            )
        for record in accepted:
            store.put(record)
            changed.append(ref(record))
        if accepted:
            review = {
                **store.base("ReviewAction", actor),
                "action": kind,
                "target_refs": changed.copy(),
                "reason": command["reason"],
                "actor_subject": actor,
            }
            store.put(review)
            changed.append(ref(review))
        if bump:
            store.bump()
        seq = store.audit(
            actor,
            f"{kind}:{proposal_id}" if proposal_id else kind,
            changed,
            command["reason"],
        )
        result = validate(
            "CommandResult",
            dict(
                case_revision=store.case()["case_revision"],
                changed_refs=changed,
                proposal_id=proposal_id,
                audit_sequence=seq,
            ),
        )
        store.remember(actor, "commands", key, command, result)
        return result
