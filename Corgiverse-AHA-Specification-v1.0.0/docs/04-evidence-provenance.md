# Evidence tiers, provenance and review
| Tier | Required basis | Presentation |
|---|---|---|
| DOCUMENTED | Reviewer accepted cited documentary/technical support for the precise proposition | Solid blue, document icon, “Documented claim” |
| OBSERVED | Cited observation or testimony attributed to its source | Solid teal, eye/quote icon, “Reported observation” |
| INFERRED | Explicit reviewed premises and explanatory reasoning | Dashed amber, inference icon |
| SPECULATIVE | Explicit assumptions; no evidentiary authority | Dotted purple, possibility icon |

These categories encode basis, not relative witness worth or numerical reliability. A document reporting an interview documents that the statement was recorded; it does not turn the described event into a DOCUMENTED occurrence. Review must disambiguate these two propositions. Corroboration is a separately explained support relationship, with origin independence marked UNKNOWN / SHARED / REVIEWED_INDEPENDENT.

Pending extractions live in a proposal queue. The model may suggest a tier but may not set ACCEPTED, add an anchor or promote support. Reviewer sees source excerpt, page, OCR warning, proposed proposition, existing duplicates and potential conflict. Approval requires deliberate selection and reason for tier; batch approval requires viewing each selected source/proposition pair and presents a count. Rejection records reason. “Approved extraction” confirms representation, not objective truth.

For all tiers, amendments create versions; the previous version remains resolvable. Changing tier or support invalidates dependent derived views and marks affected runs/reports stale. Never regenerate an accepted interpretation silently. Explicit hard anchors are reviewer-selected versions of accepted DOCUMENTED or OBSERVED propositions, have source citations and a lock reason, and mean “fixed for this run.” They can be challenged in a separate run only after a reviewer changes the constraint selection with a reason; original source bytes and old run remain unchanged.

Originals: SHA-256 filename without user extension; retain filename only in metadata. Identical bytes deduplicate content within a case but produce distinct receipts/custody events with original origin metadata. Derivatives have separate hashes; they never replace originals. OCR corrections create new derivatives and cite the prior derivative; both retain tool and configuration provenance. Thumbnails and redactions are derivatives too.

Provenance chain: receipt → original → transform → derivative → citation → observation → interpretation/edge → hypothesis/scenario → report. Every step is traversable in the UI and export. A displayed claim must have a clickable basis or “assumption, no source.” The chain must distinguish user annotations from extracted text and generated summaries.

Audit payloads are canonicalized using RFC 8785 before SHA-256 chaining; audit event includes sequence, actor, action, object/version IDs, reason, timestamp, previous hash and payload hash. SQLite audit table is authoritative; audit.jsonl is a reproducible mirror written after commit and reconciled on restart. A hash chain detects some alterations but cannot defeat an administrator rewriting the entire chain. Agency-signed external checkpoints are an optional hardening adapter; never claim tamper-proof storage.

No source deletion or original replacement through routine UI. “Exclude from analysis” preserves the original and audit. Agency-directed purge is an offline, documented maintenance operation with authority, backup/retention impact and a minimal tombstone; it is outside core v1 write APIs. Backups and exported copies require independent retention treatment.
