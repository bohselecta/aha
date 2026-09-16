# Aha! software review and release plan

Review date: 16 September 2026. Source reviewed: `00b9543`. Public site: <https://aha-nine-omega.vercel.app/>. This is a review and proposed backlog, not an implementation approval or a release certification.

## Recommendation

Keep the public site and clearly fictional, read-only sample available as an evaluation experience. Do not yet present the local application as ready for real casework. Finish a complete, dependable investigation workflow before inviting public users to rely on it.

The strongest foundations are immutable originals, versioned accepted records, explicit human review, traceable quotations, and separation of confidential local casework from the public demonstration. Preserve those decisions.

The largest product gap is that the sample can demonstrate more than a person can build from an empty case. The largest reliability gaps are restore compatibility, chronology, and the handling of delayed requests. Those require fixes, not different wording.

The direction remains consistent with the original “AI cold case assistant” conversation: a clear investigator workspace, meaningful connections, source-backed exploration, alternative explanations, and questions that distinguish them. The later specification controls the detailed semantics: no guilt scores, no probability ranking of people, no automatic acceptance of generated material, and no loss of counter-evidence or retired ideas.

The existing release record reports **5 PASS, 25 PARTIAL, and 27 NOT_RUN across 57 gates**. These are tracked implementation outcomes, not an independent certification. The supplied specification validator checks the package; it does not establish that the application meets those requirements.

## What was examined

- The deployed landing page and fictional workspace, local application, shared explorer, command/API layer, storage, import and restore paths, and current documentation.
- The original implementation package, its invariants, supported formats, milestone contract, and release criteria.
- Recorded application/browser test evidence and successful GitHub CI runs for the current published work. Existing evidence includes 35 backend tests, one local browser workflow, four explorer model tests, and one public browser workflow. This is useful coverage of a limited slice.
- Targeted experiments with synthetic data: restoring an application-generated backup; ordering offset timestamps; delayed upload completion during a case switch; reloading the session UI; finding a match outside the map limit; retrying a pending proposal with a new request key; and importing invalid UTF-8 text.

No real case data was used. The case-switch experiment mocked API responses to reproduce browser behavior; it did not demonstrate a cross-case server write or data leak. Resource exhaustion, full performance targets, real model behavior, full accessibility, and independent recovery were not certified in this review. No application fixes or deployments are included in this document.

## Confirmed defects and important code findings

“Release blocker” means a correction and regression evidence are necessary before real case use. “Required workflow” means unfinished functionality already in the specification. Inspection findings are distinguished from reproduced failures below.

### D01 — An application-generated backup can fail its own restore

**Release blocker; reproduced.** A synthetic file containing `SYNTHETIC\n` followed by 200,000 repeated `A` bytes was preserved and backed up successfully. Restoring that bundle failed with `BUNDLE_LIMIT: Archive expansion limit exceeded`.

The writer uses ZIP compression, while the reader rejects any member whose expansion ratio exceeds 100. Ordinary repetitive text can exceed that ratio. The writer also does not enforce the reader's complete aggregate size/member-count contract before producing a bundle.

Evidence: `services/api/aha/storage/portable.py:77`, `:100`, `:121`.

**Change:** Make production and consumption rules compatible, with bounded streaming and retained archive abuse protections. For example, store highly compressible members without compression when necessary. Report limits before claiming a backup succeeded. Validate backups against the actual restore contract.

**Done when:** Every successfully produced supported backup restores on a fresh volume, including repetitive text, empty files, boundary sizes, many originals, historical records, and run artifacts. Corrupt or hostile bundles fail safely. An independent operator completes a recovery drill.

### D02 — Timeline order can be chronologically wrong

**Release blocker; reproduced.** `2026-09-11T05:00:00+02:00` represents 03:00 UTC, but the explorer puts `2026-09-11T04:00:00Z` before it because it sorts timestamp strings. Both are valid inputs. The older local timeline also compares strings independently.

Evidence: `packages/workbench/model.ts:113`, `apps/web/src/shell/App.tsx:136`.

**Change:** Compare resolved instants, preserve the original wording/time zone, and treat intervals, uncertainty, and disputed times explicitly. A display order must not imply that overlapping uncertain events have a proven sequence. Share the chronology implementation across views.

**Done when:** Offset, DST, ambiguous local time, date-only, unknown, disputed, overlapping, and open-ended interval fixtures render correctly and consistently. Editing time creates a reviewed version without rewriting its source.

### D03 — A delayed operation can reopen the previous case

**Release blocker; reproduced in the browser with mocked responses.** Start an upload in case A, switch to case B while the upload is pending, then complete A's request. The interface switches back to A. The refresh captures the navigation epoch after the mutation finishes, too late to identify the stale operation.

Evidence: `apps/web/src/shell/App.tsx:74`, `:102`, `:111`, `:419`.

**Change:** Capture case identity and navigation generation when an operation starts. Ignore stale UI updates and cancel obsolete reads. Show the destination of ongoing work; ensure old notifications and form resets cannot affect another case.

**Done when:** Uploads, review decisions, searches, errors, logout, and refreshes can complete in any order without changing the selected case or showing another case's details. Test two cases, two tabs, and delayed/failed requests. This finding does not establish that the server wrote to the wrong case.

### D04 — Reloading loses the signed-in interface; expired pairing has no convenient recovery

**Required reliability fix; reload behavior reproduced, expiry path inspected.** Operator and CSRF state exist only in memory. Reload returns to pairing even when the browser holds a session cookie. The pairing secret expires ten minutes after service startup; the documented recovery is a server restart.

Evidence: `apps/web/src/api.ts:11`, `apps/web/src/shell/App.tsx:117`, `services/api/aha/app.py:31`, `:207`.

**Change:** Provide secure session resumption, explicit expiry handling, and a local way to regenerate pairing credentials. Preserve case-scoped drafts appropriately. Do not put case material or session credentials into general browser localStorage.

**Done when:** Refresh, reopen, expiry, logout, and server restart have understandable outcomes without losing accepted work or mixing drafts between cases. A novice can regain access without debugging the service.

### D05 — Retrying an uncertain request can duplicate a pending proposal

**Required reliability fix; client inspected and server behavior reproduced.** Each non-GET call gets a new idempotency key. Two identical pending proposals at the same case revision with different keys create two proposals. The server correctly deduplicates the same key; the browser does not retain it across a retry of the same logical action.

Evidence: `apps/web/src/api.ts:27`, `services/api/aha/storage/store.py:277`.

**Change:** Keep a logical operation identifier until its outcome is known, support recovery after a lost response, and provide useful stale-revision handling. A deliberate second submission must remain distinguishable from a retry.

**Done when:** Dropping the response after a successful commit and then retrying yields exactly one result, one accepted change when applicable, and no duplicate proposal or custody receipt.

### D06 — Search can find a record that the map does not display

**Required functional fix; reproduced with 81 synthetic entities.** A unique match in the 81st node appears in search results but has zero matching nodes on the map. The map takes its first 80 nodes before applying the search visibility set. The table offers a fallback and the cap is disclosed, but the map still cannot show the requested match.

Evidence: `packages/workbench/CaseExplorer.tsx:745`.

**Change:** Build the visible subset around matches and selected neighborhoods, preserve stable positions where possible, show omitted counts, and offer explicit expansion/paging. Results outside a cap must remain reachable. Table/card limits also need navigation; a truncated list is not pagination.

**Done when:** Matches at positions 81, 501, and deep in a large case are reachable in map and table workflows. Clearing filters restores the view without changing records or generating relationships.

### D07 — Current-only loading makes historical references disappear from exploration

**Required integrity-of-presentation fix; inspected and covered by an existing model fixture.** Records can cite exact older revisions, but the explorer receives current records and resolves references only against that set. Revising an endpoint can therefore remove an old connection from the map or leave its referenced version unavailable. The backend does retain historical versions.

Evidence: `packages/workbench/model.ts:61`, `packages/workbench/CaseExplorer.tsx` reference resolver, `apps/web/src/api.ts:58`.

**Change:** Resolve cited historical versions on demand. Show “version cited” and “latest version” distinctly, with a readable diff and source trail. Do not silently substitute a newer record into old reasoning.

**Done when:** Rename or correct a referenced record; every prior citation, edge, hypothesis, report, and run remains inspectable against its original snapshot.

### D08 — Import feedback does not reflect the actual extraction result

**Required usability fix; inspected with an invalid UTF-8 import experiment.** The UI ignores returned job warnings and displays a generic extraction statement. Invalid UTF-8 `.txt` bytes produce no derivative. Every source card also displays a `TXT` icon regardless of its actual format.

Evidence: `apps/web/src/shell/App.tsx:420`, `:428`, `:468`; `services/api/aha/storage/intake.py:50`.

**Change:** Show actual file type and separate original receipt, scanning, extraction, OCR, indexing, and review states. Offer appropriate actions for unsupported, locked, failed, or interrupted files.

**Done when:** A user can tell which sources are preserved, readable, searchable, and reviewed. Failed extraction never appears successful, and retry does not create duplicate originals.

### D09 — Recovery and resource limits have unfinished boundaries

**Release engineering blockers; code inspection, not a completed fault-injection result.** The store opens SQLite writable and sets pragmas before checking for an unsupported case version. It creates directories and mirrors audit output even in the inspection-only path. Verification reports tampering but has no complete persistent quarantine/recovery workflow. Intake buffers up to 250 MiB and performs extraction synchronously; the container's 64 MiB temporary filesystem needs reconciliation with multipart spooling. Large reads also occur during backup/restore. Expired export downloads are denied, but expired artifacts are not automatically removed.

Evidence: `services/api/aha/storage/store.py:63`, `:96`, `:357`; `services/api/aha/app.py:376`, `:515`; `compose.yaml`; `services/api/aha/storage/portable.py`.

**Change:** Detect unsupported formats before writes, implement genuine read-only inspection and safe migrations, persist quarantine state, reconcile orphans, bound streams and temporary storage, and clean expired export artifacts. Keep protected originals immutable. A hash chain detects defined tampering; it is not proof against every action by a privileged host administrator.

**Done when:** Future-format opening makes no changes; failed migrations restore cleanly; corruption stays visible across restarts; full disks, interrupted jobs, and maximum-size inputs fail predictably without lost accepted work or unbounded resource use.

## Work required to complete the product

These are implementation gaps, not merely missing test cases. Proposed convenience additions appear separately below.

| Workstream | What to change or finish | Acceptance outcome |
|---|---|---|
| 1. Dependable case workspace | Fix D01–D09; isolate asynchronous state; add case-scoped drafts, safe retry, useful conflict recovery, and readable history. | The selected case stays correct through failures, refreshes, concurrent actions, and recovery. |
| 2. Complete manual authoring | Enable reviewed creation/correction of events, interpretations, independently supported relationships, contradictions, questions, and hypotheses. Finish proposal editing and lifecycle actions. Only Note, Entity, and Observation drafts are currently enabled. | A person builds a useful case from nothing, using ordinary controls, without editing JSON or depending on preloaded records or a model. |
| 3. Real document intake | TXT, text/scanned PDF, PNG/JPEG/TIFF, DOCX, CSV, and XLSX; batch receipt, OCR, page/row/image locators, exact citation selection, new derivatives for corrections, and explicit locked/unsupported states. | Real format fixtures produce verifiable quotations and locators; originals remain byte-identical. Binary DOC/XLS and media retain the specification's store-only behavior. |
| 4. Durable jobs and hostile-file handling | Separate bounded workers for parsing/OCR/report/model jobs; cancellation, checkpoint/restart, useful progress, disk checks, no parser network access/macros/external fetches, and honest scan status. | Interrupted work resumes or safely retries. Hostile files cannot cause unbounded work or silently disappear. The rest of the interface remains usable. |
| 5. Chronology and reasoning rules | Finish interval constraints, clock offsets, disputed times, contradiction detection/review, dependency handling, and the hypothesis lifecycle with retirement reasons. Relevant new evidence may support a reviewed successor hypothesis; it never erases the old retirement. | Supporting and conflicting material remains visible; an uncertain interval is not converted into false precision; uncertain identity creates a potential conflict rather than an asserted logical contradiction. |
| 6. Whole-source search and Lens | Index extracted text locally, not just titles, statements, and cited snippets. Provide filters, exact source hits, coverage status, saved views, and a bounded natural-language plan compiler with visible criteria. Implement dependency-aware counterfactual exclusion. | A passage can be found before it has been turned into a reviewed observation. “No result” can be distinguished from “not indexed.” Lens execution cannot mutate the case or execute arbitrary code/SQL; excluding one premise does not establish the truth of everything left visible. |
| 7. Useful Atlas at scale | Correct reference resolution; match-centered navigation, selected neighborhoods, meaningful edge labels, clustering, stable layouts, keyboard/table parity, and layout work off the main UI thread. Implement required 2D/3D/table modes. | The graph helps answer a question, shows why a connection exists, and meets the specified visible-graph budget. A forced graphics fallback preserves the same task. Core Atlas 3D remains required; the optional calibrated Scene View is separate. |
| 8. Actual local AHA generation | Real local provider setup and capability checks; frozen case snapshots; clear anchors/soft premises/exclusions; counter-evidence and retirement context; schema/reference/semantic validation; bounded retries and partial results. | Generated possibilities are explicitly provisional, source references resolve, and a human decides what to save. Outputs expose distinguishing questions and what would weaken an idea, without guilt or plausibility scores. A replay provider is clearly labeled and never treated as real-model acceptance. |
| 9. Briefings and safe exchange | Searchable bookmarked PDF, accessible HTML, typed JSON and useful CSV; frozen revisions, source appendix, explicit scope, redaction preview, and clean separation from full backups. | Shared reports retain provenance. Redacted exports cannot leak hidden text, OCR, metadata, attachments, or unintentionally bundled originals. Synthetic material requires deliberate inclusion. |
| 10. Clear everyday interaction | Consistent source/statement/interpretation/possibility language; understandable empty and failure states; real task destinations for links; compact case identity; readable inspector; keyboard shortcuts and focus restoration; one coherent timeline experience. | People can complete core tasks without understanding schemas, acceptance gates, or implementation terms. Technical details are available only where useful. |
| 11. Installation, local security, and operations | Tested installation/start/update/uninstall paths; secure session lifecycle; storage location and backup guidance; packet-capture proof of offline behavior; supported LAN gateway controls; safe diagnostics and export retention. | A new user can operate and recover the supported release without developer help. The operator label is not misrepresented as verified identity. No unprotected service is exposed to the LAN. |
| 12. Release and maintainability | Complete API/client conformance, modular state/command handling, shared chronology/ref resolution, migration policy, clean-machine platform checks, signed artifacts, SBOM/license audit, and release evidence attached to the exact build. | Every required gate has passing evidence on declared configurations; download/setup instructions match shipped behavior; upgrades and rollback are documented and tested. |

Implementation should consolidate the large shell/explorer components around these responsibilities as features are completed. Refactoring alone is not a user outcome; measure it by fewer duplicated rules and regressions, especially in time handling, references, asynchronous operations, and command validation.

## Additions I would make

These are proposed product improvements. They should be reviewed as additions, not silently treated as requirements from the original package.

1. **Case overview.** A calm starting screen with the case question, recent activity, items awaiting review, unresolved questions, and backup status. Counts describe work, not “case certainty.” Each item takes the user to a useful action.
2. **Question workboard.** Questions with a status, human-set priority, related sources, proposed checks, and recorded outcomes. For example: “Can the camera clock offset be established?” Completing a check links to the resulting evidence; it does not automatically validate an explanation.
3. **Source coverage panel.** Show what was received, extracted, indexed, and reviewed, with failures and exclusions. This is the practical answer to “What might the tool have missed?” Processing coverage must not be presented as completeness of the investigation.
4. **Side-by-side comparison.** Compare accounts, source passages, timelines, or alternative explanations. Align shared facts and differences, with links to support and counter-evidence. Give each possibility a concrete question that could distinguish it.
5. **A readable change history.** “What changed since my last review?” with before/after values, reviewer, reason, affected records, and exact citations. Corrections are new versions; accepted history is retained.
6. **Saved working views and bookmarks.** Resume a selected neighborhood, source passage, filter set, or timeline range. Clearly distinguish a view pinned to a historical revision from a live view. Keep deep links local for private cases.
7. **Backup health and guided restore.** Last completed backup, validation result, location, and a guided restore rehearsal using a separate destination. A reminder must not say “safe” merely because a ZIP file exists.

The first, third, and seventh are especially valuable for a first public release because they make unfinished work and recovery visible. The question workboard and comparisons make Aha! more useful as an investigation tool rather than just a record viewer.

## Presentation and public-site improvements

- Retain the supplied corgi identity. Use it prominently on the product site and more quietly in the working application so records and sources dominate the workspace.
- Keep concise, user-facing instructions near actions. Put repository structure, test gates, provider internals, and release engineering details in documentation. Keep necessary user information—fictional sample, read-only status, extraction coverage, and local storage boundaries—visible.
- Once a supported release exists, make “Get Aha!” lead to versioned installation choices, system requirements, and a short first-run guide rather than a development-container heading on GitHub. Until then, keep the evaluation label truthful and visible.
- Make “Follow the question” open the specific question in the sample. Add useful deep links and a short optional walkthrough: inspect a passage, compare the accounts, identify a next check.
- Test empty, dense, long-name, missing-source, and failure layouts. Avoid large ornamental dashboards or repeated warnings that crowd out the case. Describe errors with what happened, what was preserved, and the next available action.
- Show a straightforward supported-feature/format page. Avoid implying that saved sample possibilities are live generation or that keyword search covers every imported byte.

## Pressure tests before release

| Challenge | Required result |
|---|---|
| Start with an empty case | Import mixed sources, review statements, add events and an independently justified relationship, record a conflict, explore a Lens, generate/review possibilities, retire a hypothesis, export a briefing, and restore the case. No fixture-only shortcut or JSON editing. |
| Two cases and responses finishing out of order | Case identity, selected records, notifications, drafts, and action destinations stay correct. Logging out prevents late completions from reviving the prior workspace. |
| A successful write whose response is lost | A retry recovers the same outcome without duplicate proposals, receipts, accepted versions, or audit effects. Two conflicting reviewers receive a clear conflict rather than an overwrite. |
| Awkward or hostile documents | Exercise malformed, password-protected, Unicode, huge, compressed, image-heavy, macro-bearing, and external-reference fixtures. Display precise status, preserve bytes, bound resources, and keep the service responsive. |
| Hostile instructions inside sources | Treat source content as evidence, not system instructions. A local model cannot use a document to gain tools, disclose files, change case records, or manufacture accepted citations. Test obfuscated and multimodal cases as applicable. |
| Clock and interval ambiguity | DST, mixed offsets, unknown time zones, overlapping estimates, disputed clocks, and open bounds retain their meaning. Visual order never replaces the uncertainty model. |
| Apparently independent sources repeat one account | Copied reports retain their common lineage and do not count as independent corroboration. Documented endpoints never automatically promote a relationship to documented status. |
| Incompatible anchors or recycled explanations | Contradictory hard anchors block generation before any model call and identify the conflict. Exact retired families are blocked; near-duplicates are held for review; a reviewed successor requires relevant new evidence. |
| A referenced record is corrected | Historical citations and connections still resolve to the cited version. New reasoning can explicitly choose the latest version. |
| Power loss, full disk, corrupt bytes, or a newer case format | Accepted originals remain unchanged; uncommitted work has an explicit outcome; integrity failures persist; safe inspection performs no writes; recovery is demonstrated on a clean volume. |
| Large case | Measure the specified synthetic corpus and reference hardware with 20 warm/5 cold runs. Test search/navigation beyond display caps and memory during import, export, and restore. |
| Model unavailable, cancelled, or producing poor results | Manual workflows still work. Cancel acknowledges within 1 second and terminates worker work within 5 seconds under the specified test. Return explicit partial/rejected outcomes rather than invented completeness. |
| Redacted material leaving the computer | Search all exported layers and inspect metadata, embedded files, OCR, and source appendices for seeded secrets. Protect CSV consumers from formula injection. Full backup and redacted share are unmistakably different actions. |
| Offline and shared-host operation | Capture runtime traffic, test forbidden network requests, cookie/CSRF/Host/Origin failures and expiry, and verify the supported gateway boundary. Sensitive diagnostics contain no case text or credentials. |
| Real people using the interface | Keyboard-only, screen-reader, light/dark, zoom/reflow, and declared browser/platform journeys; the specified five-person usability study; no developer coaching to finish essential tasks. |
| Fresh install and upgrade | A clean supported machine can install, start, pair, use the sample, create a case, update safely, and recover. Validate Windows commands and all advertised architectures instead of extrapolating from the current Mac/Linux checks. |

Source-file prompt injection needs layered controls; a retrieval system or a prompt alone does not remove it. This informs the model and parser tests above. See [OWASP's prompt-injection guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). Accessibility acceptance should use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and actual task testing; passing automated axe checks is only part of that evidence.

The existing performance contract is demanding and should remain explicit: case summary p95 at most 2 seconds warm/5 seconds cold; keyword results within 500 ms; deterministic Lens within 1 second for up to 500 nodes; 30 FPS for 500 visible nodes/1,500 edges; browser working memory at most 750 MiB; API idle memory at most 500 MiB excluding models/parsers. Measure model requirements separately. Complete the specified eight-hour, five-client, 1,000-reviewed-command stress run. Do not silently raise budgets or replace the large corpus with the small demo.

## Proposed delivery order

1. **Reliability gate:** D01–D09, version-aware references, bounded storage operations, session recovery, and focused regression tests. Exit with reproducible recovery and correct case/time behavior.
2. **Manual investigation gate:** Real supported-format intake, durable workers, complete review/authoring, chronology, contradictions, and hypothesis lifecycle. Exit with a useful case built from empty while the model is unavailable.
3. **Exploration gate:** Whole-source search, safe Lens, scalable Atlas in required 2D/3D/table modes, accessible source navigation, and meaningful saved views. Exit with measured correctness and performance on the reference corpus.
4. **AHA gate:** Real local provider, frozen and inspectable inputs, source-grounded diverse possibilities, distinguishing questions, retirement enforcement, adversarial evaluation, and independent human review of outputs.
5. **Sharing and release gate:** Briefings/redaction, complete portable recovery, offline/LAN operations, packaging, usability/accessibility, stress tests, signed artifacts, and versioned public download/help pages.

Add the case overview and source coverage alongside the workflows they summarize; add comparison tools when the underlying record and hypothesis semantics are complete. Do not build a status screen that claims work is supported before the workflow exists.

## Scope and release decisions to review

- **Keep:** confidential casework local; the Vercel site remains product information and fictional demonstration. The public GitHub repository and permissive license are already established.
- **Preserve the agreed v1 scope:** required local workflows, core Atlas 3D, local AHA provider, exports, and acceptance evidence. If a smaller first release is preferred, record that as an explicit scope decision and change user-facing claims accordingly; do not quietly call partial gates complete.
- **Declare the supported configuration:** operating systems, browser versions, distribution method, CPU/RAM/GPU requirements, and tested local model/provider. The LAN gateway is a distinct deployment profile requiring its own controls and evidence, not an assumed capability of the workstation setup.
- **Keep optional extensions out of the critical path:** calibrated Scene View and CASEMAIL remain disabled until their extension gates pass. Do not add autonomous outreach, automatic suspect attribution, external OSINT collection, or a new hosted account/database platform to solve the present gaps.
- **Maintain licensing evidence:** keep Apache-2.0/NOTICE and finish the third-party/parser/model license inventory for the actual release artifacts. Do not advertise the license as guaranteeing immunity from liability.

## Definition of ready for public use

Release is a claim about a specific build on supported configurations. The release candidate should have:

- No unresolved critical/high-severity defects and no known data-loss or misleading-evidence paths.
- Passing evidence for every required acceptance gate, including disabled-extension boundaries, or an explicitly reviewed revision of scope. “Not run” and “partial” are not passes.
- The full empty-case journey and the same journey after restart/restore, independent of the demonstration fixture.
- Real parser and local-model evidence. At least 100 synthetic/adversarial prompts against a supported real model; zero accepted fabricated citations, forbidden attributions, or synthetic promotions in that evaluation; all exact retired-family matches blocked; documented remediation and expanded tests for paraphrase misses. This is evaluation evidence, not a promise of infallibility.
- Independent human review of sampled outputs, the specified usability study, keyboard/screen-reader evidence, and supported browser/platform checks.
- Measured performance and stress results, clean-volume recovery, redaction leak tests, and demonstrated runtime egress controls.
- Install/update/rollback instructions a nondeveloper can follow; a signed release, checksum/SBOM/license inventory, security-reporting route, and version-specific limitations.

### Acceptance coverage map

This map links the plan to the existing gate families; it does not change their current status. Individual outcomes remain in `IMPLEMENTATION_STATUS.md` and the specification checklist.

| Gate family | Work in this plan |
|---|---|
| CORE-01–07 | API conformance; original/version integrity; same-operation retry; concurrency; crash recovery; persistent quarantine; historical references. |
| ING-01–06 | Real formats; proposal review/editing; distinct record semantics; exact locators; sandboxed/durable jobs; independent custody receipts. |
| TIME-01–02 | Correct instant/interval semantics, ambiguity, editing, chronology constraints. |
| EDGE-01–02 | Independently justified relationships, tier/dependency rules, full review workflow. |
| CON-01–02 | Contradiction detection, review, qualifications, and resolution history. |
| HYP-01–03 | Full lifecycle, retirement preservation/regeneration guards, dependencies. |
| LENS-01–06 | Indexed whole-source search, bounded plan execution, why-shown/source trail, saved/cleared views, no case mutation. |
| UI-01–03 | Required Atlas modes, accessible task parity, navigation, scale and view-state behavior. |
| AHA-01–06; MODEL-01–04 | Real providers, frozen inputs, hard/soft constraints, diversity, partial/failure/cancellation, validation, adversarial and human evaluation. |
| EXP-01–04 | Briefings, typed exchange, full portable recovery/run artifacts, scope/redaction/retention. |
| SEC-01–05 | Offline/egress proof, sessions and request defenses, gateway identity, hostile inputs, disk/worker/migration recovery. |
| REL-01–05 | Complete demo, performance/stress, usability/accessibility, reproducible signed packaging, release evidence. |
| EXT-01–02 | Disabled optional extension boundaries and tests; no substitution for required core features. |

The next implementation phase should use this reviewed backlog and the original acceptance checklist together. The immediate priority is a trustworthy, complete manual case workflow, followed by the reasoning features and measured release proof.
