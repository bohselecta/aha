# Domain and schema semantics
`schemas/contracts.schema.json` is the wire schema source of truth (JSON Schema 2020-12). Generate frontend types and validate server requests with the same constraints. Closed objects reject undeclared fields, including invented probability or guilt fields. JSON Schema handles shape; this document and `tests/validate_package.py` cover a subset of semantic rules; the application MUST implement the full rule set.

## Record dictionary
| Record | Meaning |
|---|---|
| Case | Stable UUID, title, IANA timezone, schema version and monotonic revision; synthetic marker. |
| Evidence | Original content hash, size, media type, original filename and received time; metadata is not original bytes. |
| Derivative | Parent evidence, output hash, tool/version/config digest and locator mapping; OCR, text, preview or transcript. |
| Citation | Evidence UUID/hash plus optional derivative UUID/hash and precise page, text, row or media range. |
| Entity | Person, organization, place, object, vehicle, device or unknown actor; aliases are names, not merges. |
| Observation | A source's assertion, citation(s), subjects, predicate, object value and occurrence time; may be false or disputed. |
| Interpretation | Human/AI inference, premise IDs, assumptions, counter-support and independent tier. |
| Event | A time-bounded proposition backed by observations; does not prove the occurrence. |
| Edge | From/to, typed relationship, own tier and own support; never inherits endpoint status. |
| Contradiction | Incompatible propositions, rule, qualifications, resolution targets and complete decisions. |
| Hypothesis | Claim, premises, counter-support, falsifier, lifecycle, family key and optional predecessor. |
| Question | A testable question, scenarios it separates, expected outcomes and status. |
| Scenario | Synthetic pathway tied to a run, assumptions, structured steps and discriminators. |
| ModelRun | Frozen revision, provider/model digest, prompt version, input/output hashes and validation outcome. |
| ReviewAction | Actor, action, reason, time and affected versions; no anonymous human decisions. |
| CustodyEvent | Receipt/verification/export/transfer claim with actor, hash and time; limited to events observed by this app. |
| AuditEvent | Case-local append-only sequence with previous hash and canonical payload hash. |
| SceneObject | Optional spatial geometry reference, coordinate frame, measurement provenance and uncertainty. |

Every case record has UUID, case_id, record revision, introduced_case_revision, creator identity and creation time. Record revision is per-record; introduced_case_revision records the aggregate revision at which this version entered the case. Use it to enforce genuinely newer evidence on hypothesis reopening. A reference in a frozen run includes record ID + version; current API views return current record versions. Fixture IDs are fixed UUIDs; real creation uses UUIDv4. A record ID cannot be reused across kinds or cases. References to other cases are rejected. No `fact` table.

Citation text offsets are Unicode code-point offsets [start,end), not bytes or browser UTF-16 units. Page indexes are 1-based, media times milliseconds from start, bounding boxes normalized [x,y,width,height] with top-left origin and bounds ≤1. Text locators require immutable derivative hash. Page locators alone identify a source location but are not exact quote verification; generated quotes require matching extracted text range. CSV row includes header convention in derivative metadata; first data row is row 2. Citations never resolve against a mutable latest derivative.

Evidence tier, review status, truth uncertainty, source origin and lifecycle are separate axes. `DOCUMENTED` is not a probability and is not a universal “verified” flag. `AI_SYNTHETIC` is origin, paired with SPECULATIVE tier; RETIRED is lifecycle, never a tier. Names such as “suspect” are source-attributed case labels only, not a model-assigned entity category.

Entity resolution proposes duplicate candidates with matching-field citations. Only a reviewer may merge. Merge creates an equivalence record with reason, preserves original IDs and redirects current navigation; undo creates another version. Shared names, language or generic habits never automatically merge people. Source independence is UNKNOWN unless reviewed; copied reports and common-origin statements share a provenance group and cannot count as independent corroboration.

Semantic checks: valid references and expected kinds; no cycles in derivation or premise graph; all cited hashes match records; source locators are in range; interval order; incoming accepted IDs cannot overwrite history; edge self-links allowed only for an explicit REFERS_TO relation; evidence-backed tiers need accepted support; inferred records need premises and rationale; synthetic records cannot serve as evidence support; retired hypotheses never become active by editing state. A validator rejection includes field path and stable error code.

Additional typed records: TemporalConstraint expresses INTERVAL or BEFORE, ClockCorrection stores a sourced offset range without changing raw time, Note stores human-authored annotations, Anchor stores an active reviewed lock, and EntityMerge stores reversible equivalence decisions. Before constraints mean `min_lag ≤ start(right) − end(left) ≤ max_lag`; null lag bounds are unbounded, strict=true excludes equality at a stated bound. A missing event boundary cannot be guessed: the solver reports insufficient bounds or uses an explicit human-approved interval. Clock correction convention is `corrected UTC = normalized raw UTC + offset`; offset_min must not exceed offset_max. A positive “camera fast” amount therefore corresponds to a negative correction. Quaternions must normalize to unit length; frame references and scene geometry assets must exist if Scene View is enabled.

Snapshot records freeze record versions, anchors, temporal constraints and retirement ledger plus a source-manifest hash. Temporal constraints require accepted basis and a human review. No free-text natural-language constraint is treated as enforced until compiled into this typed form and shown to the reviewer. Model-run metadata, provider configurations, ephemeral proposals and saved views use separate technical/view revisions; they cannot increment or change accepted evidentiary meaning merely by being generated.
