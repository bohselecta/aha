# Hypothesis ledger and contradiction engine
## Hypothesis state machine
PROPOSED → TESTING or RETIRED. TESTING → SUPPORTED, WEAKENED or RETIRED. SUPPORTED → TESTING, WEAKENED or RETIRED. WEAKENED → TESTING or RETIRED. RETIRED has no outgoing state transition. All transitions require human reason and cited support/counter-support where applicable. SUPPORTED means the reviewer records supporting material, never “proven.” Missing falsifiers force `falsifiability=NOT_CURRENTLY_FALSIFIABLE` and disallow SUPPORTED.

Each hypothesis specifies what would strengthen, weaken and retire it. Retirement stores the claim, normalized family key, reason, disconfirming source versions and retirement case revision. New run preflight retrieves all tombstones, never only vector top-k. The engine compares normalized structured mechanism, participant placeholders, interval and premise changes. Exact family matches are blocked; semantic near-duplicates are quarantined for review. Embedding similarity is a candidate screen, not a proof of novelty.

A new file alone does not unlock a retired idea. The human must cite accepted evidence created or materially revised since retirement and explain how it challenges the retirement basis. Service checks timestamps/revisions and references, then creates a NEW PROPOSED hypothesis with predecessor_id. The original stays RETIRED. Semantically equivalent resurrected narratives without such review are suppressed from AHA results. When equivalence is uncertain, hold the result with “May repeat a retired explanation” rather than assert a guarantee that paraphrase detection is perfect.

## Contradiction pipeline
1. Normalize accepted propositions without changing raw statements.
2. Generate comparable pairs using same subject/predicate/scope or dependency overlap.
3. Apply deterministic rules: mutually exclusive values under an exclusive predicate; disjoint claimed occurrence windows for the same event; impossible co-location only with reviewed identity, comparable time intervals and documented travel lower bounds; cycles in strict before/after constraints.
4. LLM may propose semantic inconsistencies with exact citations; all are CANDIDATE.
5. Reviewer marks UNRESOLVED, DISMISSED or RESOLVED with reason. Accepted deterministic candidates still require review of identity and time assumptions.

Candidate dedupe key = rule version + sorted proposition ID/version set + scope. Status never erases the original competing claims. An uncertain identity/time relationship is a POTENTIAL conflict, not a logical contradiction. Missing observation is not evidence of absence unless a reviewed observation states search method, coverage, expected detection and limitations.

Conflict record exposes both claims, overlap/interval calculation, rule, unverified prerequisites and resolution targets. For “vehicle departed before 22:10” versus camera “vehicle at 22:26,” targets include vehicle identity and clock calibration; do not assume same vehicle or clock accuracy. Resolving creates a decision linked to new evidence/correction. If relevant source versions change, create a linked candidate for reconsideration and show the resolved record's prior basis as stale.

Inconsistent hard anchors: reject AHA before model call with UNSAT_CONSTRAINTS and an irreducible conflicting subset found by deletion-based satisfiability checks (up to 100 constraints). For larger sets, return a bounded conflicting subset, explicitly not minimal. No anchor is automatically dropped. Use interval bounds plus difference constraints/Bellman-Ford for before/after relations; unknown bounds remain unknown, not zero. Human chooses a separate corrected constraint set.
