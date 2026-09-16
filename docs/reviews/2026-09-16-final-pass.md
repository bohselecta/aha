# Aha! final implementation pass — 16 September 2026

This implements the first substantial portion of the reviewed backlog. **It is not completion of the full v1 specification or approval for real casework.** Confidential casework remains local; Vercel serves only product information and the fictional read-only sample. The original specification is unchanged.

## Delivered

| Area | Result |
|---|---|
| Recovery | Compatible backup/restore archive bounds, streaming hashing/copying, repetitive-text regression, persistent quarantine, untouched unsupported-format inspection, expiring temporary exports, backup health and an actual restore rehearsal. |
| Reliability | Instant-based chronology, valid-session resumption, local pairing-code rotation, guarded case refreshes, captured case identity for delayed writes, and reuse of unresolved request keys. Lost-response proposal and delayed-upload browser regressions pass. |
| Manual casework | Reviewed forms for events, interpretations, relationships, explanations, notes, entities, clocks and before constraints; correction proposals; potential-conflict review; question outcomes and hypothesis lifecycle decisions. Review shows substantive timing, premises, counter-evidence and falsifiers before acceptance. |
| Intake | Durable original receipt followed by persisted extraction work. TXT, CSV, DOCX, XLSX, text PDF and English OCR for PNG/JPEG/TIFF/scanned PDF. Immutable text and locator maps, progress, cancellation and retry; failure retains originals. |
| Isolation | Separate non-root, read-only, network-disabled Compose parser without the case volume; additional network syscall denial and bounded worker resources. Native macOS sandbox and fail-closed Linux Landlock profile. |
| Search and exploration | Case-local full-text search finds previously uncited passages, reports coverage and returns exact quotes. Historical dependencies resolve to the cited version. Map matches beyond the initial cap are reachable; tables paginate. |
| Everyday use | Case overview, source coverage, question board, side-by-side comparison, recent version differences and review reasons. Public “Follow the question” opens the actual question. |
| Delivery | Updated user/operator guides, additive API/isolation ADR, refreshed test evidence and dependency inventory, parser checks in CI, local container update, GitHub publication and static Vercel update. |

## Evidence

- Supplied package validator: **620 assertions pass**. This validates the package, not application acceptance.
- Native backend: **48 pass, 1 OCR test skipped** because OCR is checked in the actual container runtime.
- Isolated Linux arm64 runtime: **49 backend tests pass**, including real text PDF and OCR for four formats, hostile XML, encrypted PDF, recovery and network-syscall denial. See `artifacts/parser-verification.json`.
- Local browser: **4 complete flows pass**, covering the empty-case import/search/statement/event path, stale case responses, lost-response retry, session resumption, review, backup rehearsal and corruption rejection.
- Public site: **8 checks pass**, covering exact-version graph links, chronology offsets, map-cap reachability, source search, deep question navigation and the full sample journey.
- TypeScript/build, Python formatting and Compose configuration checks pass. Automated accessibility checks cover tested light/dark, source-review and reflow states; they are not a complete screen-reader or human accessibility assessment.
- The updated three-service local stack is healthy and passes authenticated/unauthenticated/Host-boundary checks. No case volume or credentials are sent to Vercel.

The test files and generated build-source hash are recorded in `IMPLEMENTATION_STATUS.md` and `artifacts/build-evidence.json`. CI and deployment status should be read for the exact published commit; prior successful runs are not treated as proof for later changes.

## What remains before public casework

1. Complete proposal editing/batch review, entity equivalence, standalone question creation/priorities, full history navigation, saved working views and the full graphical citation/OCR correction workflow.
2. Finish temporal/identity/dependency solving, automatic contradiction detection and relevance checks for hypothesis successors. Current logical-conflict claims fail closed. Clock constraints are recorded, not presented as a completed solver.
3. Implement and evaluate the bounded natural-language Lens compiler/executor, dependency-aware exclusions, required core Atlas 3D and measured large-case layouts. Optional calibrated Scene View remains separate and disabled.
4. Build real local AHA generation: provider setup, frozen snapshots, hard-anchor preflight, retirement/near-duplicate controls, validated questions/scenarios, cancellation and the required real-model/adversarial evaluation. This pass does not substitute fixture playback for generation.
5. Build briefings and safe redacted exchange: PDF/HTML/JSON/CSV, source appendices, frozen revisions, export scope and seeded-secret leak tests. Current portable backups are complete, sensitive and unredacted.
6. Complete migration/orphan/disk-full/worker-crash/cancellation timing matrices, format/locale/rotation corpus, full hostile-native-parser checks, independent/off-device recovery, offline traffic proof and authenticated LAN support.
7. Run reference-hardware performance and the eight-hour stress suite, declared platform/browser checks, screen-reader journeys and the five-person usability study. Finish signed installation/update/rollback artifacts and the complete dependency/model redistribution audit.

The nine review findings received fixes or meaningful progress, but their broad “done when” criteria are not all satisfied. D01–D08 have targeted regressions for the delivered fixes; D09 still has significant fault-recovery acceptance work. New-case creation does not yet have full persisted server-side retry deduplication; uncertain request keys are retained only for the current browser session. History differences currently show the latest 50 versions. Native Windows extraction is unavailable. These limits remain release work, not silently removed scope.

The public sample and local evaluation label remain appropriate. `make release` continues to block incomplete acceptance gates.
