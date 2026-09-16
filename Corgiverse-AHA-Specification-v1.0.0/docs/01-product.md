# Product specification
## People and jobs
Primary users are investigators and analysts with uneven technical confidence, including small agencies and innocence-review teams. A local case custodian installs the system. Later agency operators may provide identity, authorization, retention and evidence-store adapters. The UI uses “source,” “statement,” “connection,” and “possibility”; ontology and embedding controls belong in advanced settings.

Primary journey: create case → import folder → inspect ingest failures → review extracted statements beside originals → place events with honest time uncertainty → inspect connections and contradictions → use a temporary lens → choose anchors and generate possibilities → review questions → export a briefing and portable case backup.

## Required behavior by workspace
| Workspace | Actions and observable result |
|---|---|
| Inbox | Folder/file drop, per-file progress, duplicate receipt, quarantine, cancel/retry, source preview, extraction diff, approve/reject individual proposals or reviewed selection. Original always available separately. |
| Timeline | Filter by occurrence/discovery/recorded time; show exact/range/approximate/unknown/disputed; lock selected claim versions; side-by-side alternatives; visible timezones and clock corrections. |
| Case Atlas | Stable positions, meaningful time/layer axes, expand one hop, search, select, focus, pin, hide, reset, 2D/3D/table toggle. Edge drawer shows why it exists and its independent status. |
| Query Lens | Plain-language box, editable interpretation chips, matching sources, evidence/context/similarity legend, clear lens, save lens definition, source-backed why panel and honest partial-result indicator. |
| AHA | Select interval, anchors and exclusions; inspect constraints; generate up to ten distinct pathways; compare assumptions/conflicts/questions; create a PROPOSED hypothesis only through human review. |
| Contradictions & Leads | Candidate/unresolved/resolved/dismissed conflict views; dependency inspection; resolution evidence; question task tracking; include disconfirming material. |
| Briefing Room | Select report sections, review speculation inclusion, source appendix, redaction preview, export PDF/HTML/JSON/CSV and verifiable case bundle. |

Every workspace supports empty, loading, partial, stale, permission-denied, cancelled and failed states. Preserve user input on failure. Never clear selection after a recoverable error. Undo is a compensating audited revision, never removal of history. Long work is a cancellable job with progress, no false percentage when total work is unknown.

## Product actions
“Surprise Me” asks for one non-obvious lens, displays its scope and why it might help, and applies it only after preview. It cannot produce allegations or write case records. “What survives without this source?” creates a counterfactual view that marks dependent support as unavailable; it does not erase the source or assert remaining hypotheses are true. Save such a view as a lens with exclusions and snapshot revision.

## Anti-goals
No autonomous investigator; guilt determination; suspect discovery/ranking from weak similarities; demographic profiling; facial recognition; emotion/deception detection; predictive policing; public accusation pages; surveillance scraping; external people enrichment; autonomous outreach; automatic source credibility score; case closure recommendation; fake probability; real-case demo. No SaaS, billing, enterprise account directory, multi-tenant cloud service, distributed writes, Kubernetes requirement or graph database in v1.

No replacement claim for certified evidence custody, forensic acquisition, legal admissibility, emergency response, agency security compliance or an agency record-retention program. These are integration boundaries, not missing disclaimers to hide in onboarding.

## Success criteria
Five representative reviewers can complete import → source review → lens → question → report without command-line use; at least four complete each core task unaided after a ten-minute introduction. All can distinguish a source statement from a synthetic event and a similarity from an evidenced connection. No participant is shown a “most likely culprit.” Ship usability findings and corrective actions, not just automated screenshots.
