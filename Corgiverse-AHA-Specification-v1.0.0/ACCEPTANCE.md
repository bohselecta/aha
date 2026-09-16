# Acceptance checklist and definition of done

All rows below are REQUIRED for v1, including disabled extension boundary tests. Keep status NOT_RUN until evidence exists. Spec-package validation is not application acceptance. Add code paths, command/output references, tested build digest, operator and date to each row in IMPLEMENTATION_STATUS.md. No unresolved critical/high security, data integrity or evidentiary-boundary defects are allowed.

| ID | Milestone | Invariant | Acceptance condition | Required evidence |
|---|---|---|---|---|
| CORE-01 | M0 | INV-01 | Contracts validate and generated clients agree with API | Schema/OpenAPI validation report. |
| CORE-02 | M1 | INV-03 | Original bytes survive import, correction and restore unchanged | SHA-256 equality at all three stages. |
| CORE-03 | M1 | INV-14 | Retrying a command creates exactly one write/audit event | Idempotency replay + changed-body conflict test. |
| CORE-04 | M1 | INV-14 | Stale If-Match never overwrites accepted state | Two-client conflict integration test. |
| CORE-05 | M1 | INV-14 | Crash at each file/DB commit boundary recovers correctly | Fault-injection matrix and orphan reconciliation. |
| CORE-06 | M1 | INV-03 | Tampered original is detected and quarantined visibly | Byte mutation + UI + blocked export test. |
| CORE-07 | M1 | INV-14 | Append-only revisions and audit stay resolvable | Old-reference read and update/delete denial. |
| ING-01 | M2 | INV-03 | Every required file format preserves original and yields usable derivatives | PDF/OCR/image/DOCX/TXT/CSV/XLSX integration fixtures. |
| ING-02 | M2 | INV-01 | AI extraction remains pending until source-side review | E2E reject/edit/accept with audit. |
| ING-03 | M2 | INV-04 | Statement and interpretation are separate records | Source statement versus inferred event test. |
| ING-04 | M2 | INV-12 | Citations resolve exact immutable derivative location | Unicode, page, row and quote boundary tests. |
| ING-05 | M2 | INV-11 | Hostile parser inputs cannot fetch URLs or exceed resource limits | Sandbox/timeout/zip-bomb network tests. |
| ING-06 | M2 | INV-03 | Duplicate bytes preserve independent receipt history | Two names/same bytes + two receipt events. |
| TIME-01 | M3 | INV-13 | Exact, approximate, range, undated, disputed and DST times display honestly | Temporal unit and UI cases. |
| TIME-02 | M3 | INV-09 | Conflicting anchors block AHA before generation | Unsatisfiable-set test with model call count zero. |
| EDGE-01 | M3 | INV-05 | Documented endpoints never promote an unsupported edge | Independent edge rejection test. |
| EDGE-02 | M3 | INV-05 | Shared source lineage never counts as independent corroboration | Copied-report fixture. |
| CON-01 | M3 | INV-06 | Contradictions retain competing claims and resolution history | Candidate→unresolved→resolved + source correction. |
| CON-02 | M3 | INV-13 | Uncertain identity/time creates potential, not logical conflict | Red-vehicle demo assertion. |
| HYP-01 | M3 | INV-07 | All transitions enforce human reason and testability | Full transition table tests. |
| HYP-02 | M3 | INV-07 | Retired exact and paraphrased ideas are blocked or held | Retirement model evaluation + human collision review. |
| HYP-03 | M3 | INV-07 | Relevant new evidence plus review creates successor, never un-retires old record | Positive/negative reopening E2E. |
| LENS-01 | M4 | INV-08 | Eggs query shows similarity without invented evidence edge | Oracle IDs and persistent graph hash unchanged. |
| LENS-02 | M4 | INV-12 | Every highlight has supported why/source explanation | Source click-through automated + human audit. |
| LENS-03 | M4 | INV-08 | Plan rejects code, excessive hops and invalid fields | Allowlist fuzz tests. |
| LENS-04 | M4 | INV-08 | Clear lens restores previous view and case state | View/state snapshot comparison. |
| LENS-05 | M4 | INV-13 | Index staleness and no-match scope are visible | Delayed/rebuilding index E2E. |
| LENS-06 | M4 | INV-13 | Counterfactual excludes dependencies without asserting surviving truth | Dependency fixture and unchanged evidence. |
| UI-01 | M4 | INV-10 | Atlas 3D encodes labeled time/group/basis dimensions | Visual review and stable layout tests. |
| UI-02 | M4 | INV-10 | All graph actions/insights work in 2D/table with keyboard | Forced WebGL failure + accessibility journey. |
| UI-03 | M4 | INV-10 | Tier remains legible without color and at 200% zoom | Contrast, monochrome and reflow review. |
| AHA-01 | M5 | INV-09 | All published scenarios preserve selected anchor versions | Temporal/source constraint evaluation. |
| AHA-02 | M5 | INV-09 | Alternatives differ materially and yield discriminating questions | Structural duplicate + human review. |
| AHA-03 | M5 | INV-02 | No guilt fields, ranked suspects or unsupported named offender roles | 100-case adversarial suite + reviewed outputs. |
| AHA-04 | M5 | INV-12 | Fabricated references and quoted text are rejected | Invalid citation/reference fixture suite. |
| AHA-05 | M5 | INV-09 | Insufficient diversity returns honest partial set | Requested ten/result two fixture. |
| AHA-06 | M5 | INV-01 | Scenario saved as hypothesis remains proposed/speculative | Save-to-hypothesis E2E. |
| MODEL-01 | M5 | INV-11 | Real local model completes supported workflows with internet disabled | Recorded model/digest/hardware and packet capture. |
| MODEL-02 | M5 | INV-11 | Missing model preserves manual workflows; no cloud fallback | Provider-down E2E. |
| MODEL-03 | M5 | INV-12 | Run provenance and stale snapshot warnings are complete | Revision change mid-run test. |
| MODEL-04 | M5 | INV-01 | Injection cannot create writes, fetch URLs or change tiers | Adversarial source/tool-output suite. |
| EXP-01 | M6 | INV-12 | PDF/HTML/JSON/CSV retain labels, provenance and counter-evidence | Round-trip and report review. |
| EXP-02 | M6 | INV-03 | Portable backup restores on a fresh volume with matching hashes | Independent restore drill. |
| EXP-03 | M6 | INV-11 | Redacted export leaks no removed visible or hidden content | Text, metadata, attachment and OCR leak tests. |
| EXP-04 | M6 | INV-09 | Synthetic export is explicit and labeled on each relevant page | Default exclusion and opted-in print test. |
| SEC-01 | M6 | INV-11 | Fresh workstation starts without external network attempts | Offline install/runtime traffic evidence. |
| SEC-02 | M6 | INV-14 | CSRF, foreign Host/Origin and unauthenticated access fail | Browser/API negative test suite. |
| SEC-03 | M6 | INV-14 | LAN identity spoofing and cross-case access fail | Gateway integration tests. |
| SEC-04 | M6 | INV-11 | Secrets/case text absent from default logs and diagnostic exports | Sensitive sentinel scan. |
| SEC-05 | M6 | INV-14 | Disk-full, interrupted worker and migration failure recover safely | Failure injection and rollback drill. |
| REL-01 | M7 | INV-10 | Performance budgets pass on documented reference machine | p50/p95 report, five-client stress test. |
| REL-02 | M7 | INV-01 | Nontechnical reviewers complete core workflow and distinguish basis | Usability study with findings/resolutions. |
| REL-03 | M7 | INV-10 | WCAG AA workflows verified beyond automated scanning | Keyboard/NVDA/VoiceOver evidence. |
| REL-04 | M7 | INV-11 | Signed images, SBOM, licenses and offline assets are complete | Release manifest and signature verification. |
| REL-05 | M7 | INV-01 | Required screens contain no stubs or unlabeled replay behavior | End-to-end production configuration walkthrough. |
| EXT-01 | M6 | INV-11 | CASEMAIL absent/disabled cannot send mail or bypass review | Disabled endpoint + envelope fixture test. |
| EXT-02 | M6 | INV-10 | Scene View hidden unless calibration/uncertainty gates pass | Feature capability/disabled-state test. |

## Definition of done
The required local app runs from a clean documented installation, all seven workspaces function on real persisted data, the full synthetic demo works, every required acceptance row passes on supported hardware, and the repository contains reproducible release artifacts, migration/restore instructions and user/operator help. A real local provider is exercised. No real evidence is in test data. Remaining optional extensions are clearly disabled and documented. The publisher adopts appropriate licenses and preserves dependency notices before public release.

## Optional extension gates
CASEMAIL enabled: authenticate sender and case scope, dedupe, quarantine, prevent loops, review recipient/release and prove no unintended sends. Scene View enabled: calibrated coordinate units, sourced geometry, uncertainty sweeps, schematic-mode restrictions and equivalent accessible numeric results. Neither extension can weaken the required invariants.
