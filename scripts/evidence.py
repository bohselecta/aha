"""Record precise development evidence without treating partial checks as release acceptance."""

import hashlib
import json
import platform
import sqlite3
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    paths = sorted(
        p
        for folder in [
            "apps/web/src",
            "apps/web/public",
            "services",
            "scripts",
            "tests",
            "packages/contracts",
            "packages/workbench",
            "apps/site/src",
        ]
        for p in (ROOT / folder).rglob("*")
        if p.is_file() and "__pycache__" not in str(p) and p.suffix not in (".pyc",)
    )
    paths += [
        ROOT / p
        for p in [
            "package-lock.json",
            "requirements.lock",
            "compose.yaml",
            "deploy/Dockerfile",
        ]
    ]
    checksums = {
        str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in paths
    }
    build = hashlib.sha256(json.dumps(checksums, sort_keys=True).encode()).hexdigest()
    environment = {
        "date": datetime.now(timezone.utc).isoformat(),
        "operator": "Codex automated synthetic verification",
        "platform": platform.platform(),
        "machine": platform.machine(),
        "python": platform.python_version(),
        "sqlite": sqlite3.sqlite_version,
        "node": subprocess.check_output(["node", "--version"], text=True).strip(),
        "source_sha256": build,
        "source_files": checksums,
    }
    (ROOT / "artifacts/build-evidence.json").write_text(
        json.dumps(environment, indent=2) + "\n"
    )
    gates = json.loads(
        (
            ROOT / "Corgiverse-AHA-Specification-v1.0.0/acceptance-matrix.json"
        ).read_text()
    )
    evidence = {
        "CORE-01": (
            "PARTIAL",
            "packages/contracts; tests/contract/test_contracts.py",
            "620 supplied assertions and generated types pass. Full 41-operation client/API conformance is not implemented.",
        ),
        "CORE-02": (
            "PASS",
            "tests/unit/test_semantics.py::test_source_correction_preserves_bytes_through_restore",
            "Original bytes equal before source-statement correction, after correction, and after fresh-directory restore.",
        ),
        "CORE-03": (
            "PASS",
            "tests/integration/test_integrity.py::test_review_revision_retry_history; test_command_idempotency_binds_changed_body",
            "Retry returns the original response once; changed command content conflicts; audit and revision do not duplicate.",
        ),
        "CORE-04": (
            "PASS",
            "tests/integration/test_integrity.py::test_concurrent_review_conflict",
            "Two simultaneous reviewers at the same revision produce one commit and one conflict.",
        ),
        "CORE-05": (
            "PARTIAL",
            "tests/integration/test_integrity.py::test_actual_process_termination_and_replay",
            "Real process-exit/reopen/retry at four durable boundaries passes. Orphans are retained/reported; full grace-period quarantine and all future parser/job crash boundaries are unfinished.",
        ),
        "CORE-06": (
            "PARTIAL",
            "tests/e2e/workflow.spec.ts; artifacts/integrity-failure.png",
            "Tampered bytes trigger visible integrity failure and block download/backup. Persistent quarantine survives restart and rejected transactions; explicit verification clears it only after repairs. Complete repair UX and privileged-tamper certification remain open.",
        ),
        "CORE-07": (
            "PASS",
            "tests/integration/test_integrity.py::test_review_revision_retry_history",
            "Old accepted versions resolve; SQLite UPDATE/DELETE attempts against records and audit fail.",
        ),
        "ING-01": (
            "PARTIAL",
            "services/api/aha/storage/intake.py",
            "Real TXT/CSV/DOCX/XLSX/text-PDF and English OCR for images/scanned PDFs pass isolated-container checks. Full format/locale/rotation corpus and graphical locators remain incomplete.",
        ),
        "ING-02": (
            "PARTIAL",
            "tests/e2e/workflow.spec.ts",
            "Manual source and note proposal/review flow passes. AI extraction, proposal editing and batch review are unfinished.",
        ),
        "ING-03": (
            "PARTIAL",
            "packages/contracts/contracts.schema.json; services/api/aha/commands/execute.py",
            "Human statement/event/interpretation/relationship/hypothesis/time drafts are enabled with pending review; empty-case backend and browser journeys pass. Full batch/editing flows remain open.",
        ),
        "ING-04": (
            "PARTIAL",
            "tests/unit/test_semantics.py; apps/web/src/inbox/SourceReview.tsx",
            "Immutable hash, exact-quote/range rejection and browser text selection tested. Page/row/sheet/OCR word locator maps are preserved; current review uses exact text ranges. Full graphical locators and Unicode corpus remain open.",
        ),
        "ING-06": (
            "PASS",
            "tests/integration/test_integrity.py::test_original_retry_and_independent_receipts",
            "Same bytes under different names share content but retain distinct evidence and custody receipts.",
        ),
        "TIME-01": (
            "PARTIAL",
            "tests/unit/test_semantics.py::test_open_and_reversed_intervals",
            "Chronology compares instants across offsets; reviewed time/clock/before-constraint forms preserve raw bounds. Full DST/dispute corpus and solver remain unfinished.",
        ),
        "EDGE-01": (
            "PARTIAL",
            "tests/unit/test_semantics.py::test_unsupported_edge_and_synthetic_promotion",
            "Human edge creation/review is enabled, with its own support and independence guards. Full independence/dependency acceptance remains open.",
        ),
        "HYP-01": (
            "PARTIAL",
            "services/api/aha/commands/execute.py; tests/unit/test_semantics.py::test_retirement_cannot_transition",
            "Lifecycle decisions and terminal retirement are available in review UI. Empty-case creation/retirement/restore passes; full transition table remains open.",
        ),
        "HYP-02": (
            "PARTIAL",
            "services/api/aha/commands/execute.py",
            "Exact family check exists; paraphrase hold/model evaluation unfinished.",
        ),
        "MODEL-02": (
            "PARTIAL",
            "tests/e2e/workflow.spec.ts",
            "Manual workflows operate without a model; model gateway/provider-down behavior is not implemented.",
        ),
        "EXP-02": (
            "PARTIAL",
            "services/api/aha/storage/portable.py; tests/integration/test_integrity.py",
            "Repetitive backups, streaming restore, shared archive bounds, real recovery rehearsal and expired-copy cleanup pass. Full run artifacts, independent operator drill and release-volume certification remain open.",
        ),
        "SEC-01": (
            "PARTIAL",
            "compose.yaml; deploy/Dockerfile",
            "No runtime remote assets/telemetry; parser has no network or case volume and socket-syscall denial is tested. Offline install and packet-capture proof not run.",
        ),
        "SEC-02": (
            "PARTIAL",
            "tests/security/test_http.py",
            "Unauthenticated, foreign Host/Origin, CSRF and logout denial tested. Expiry, full browser negative matrix and all future routes remain open.",
        ),
        "SEC-03": (
            "PARTIAL",
            "tests/security/test_http.py",
            "Workstation rejects gateway identity headers. Authenticated LAN gateway not implemented.",
        ),
        "SEC-05": (
            "PARTIAL",
            "tests/integration/test_integrity.py",
            "Storage crash/retry, untouched unsupported-format inspection and persistent quarantine pass. Full disk-full, worker interruption and migration rollback matrix unfinished.",
        ),
        "LENS-01": (
            "PARTIAL",
            "packages/workbench/model.ts; tests/site/model.spec.ts; tests/site/public.spec.ts",
            "Local FTS finds uncited exact passages and reports extraction/index coverage without changing case meaning. Natural-language plan and complete Lens oracle execution remain unfinished.",
        ),
        "LENS-02": (
            "PARTIAL",
            "packages/workbench/CaseExplorer.tsx; tests/site/public.spec.ts; tests/e2e/workflow.spec.ts",
            "Keyword why-shown and version-resolved source navigation pass in public and local views. Full model-plan explanations and human audit remain open.",
        ),
        "LENS-04": (
            "PARTIAL",
            "tests/site/public.spec.ts; tests/site/model.spec.ts",
            "Clearing text/basis filters restores stable map coordinates and preserves records. Saved lenses and complete view-state regression remain unfinished.",
        ),
        "UI-02": (
            "PARTIAL",
            "packages/workbench; tests/site/public.spec.ts; tests/e2e/workflow.spec.ts",
            "2D map/table and keyboard source journey pass, including focus restoration, light/dark axe and mobile reflow. 3D fallback and full cross-browser/screen-reader acceptance remain open.",
        ),
        "REL-03": (
            "PARTIAL",
            "tests/e2e/workflow.spec.ts; artifacts/browser-tests.json",
            "Chromium automated axe scans pass in light and dark for tested screens. Human keyboard/VoiceOver/NVDA and full WCAG conformance not established.",
        ),
        "REL-04": (
            "PARTIAL",
            "deploy/Dockerfile; compose.yaml; requirements.lock; package-lock.json",
            "Dependency locks and image base digests pinned. Development SBOM inventories and Linux arm64 container checks exist; signed multi-architecture releases, complete license audit and offline import certification unfinished.",
        ),
        "EXT-01": (
            "PARTIAL",
            "tests/security/test_http.py",
            "Authenticated CASEMAIL endpoint is disabled and cannot write/send; full extension envelope fixture suite not implemented.",
        ),
        "EXT-02": (
            "PARTIAL",
            "apps/web/src/shell/App.tsx",
            "Scene View is absent; explicit extension capability tests remain open.",
        ),
    }
    evidence.update(
        {
            "ING-05": (
                "PARTIAL",
                "services/worker; scripts/verify_parsers.py; artifacts/parser-verification.json",
                "Dedicated offline container without case volume; real format/OCR, hostile XML, network-syscall denial and bounded processing checks pass. Complete hostile/disk-full/escape corpus remains open.",
            ),
            "CON-01": (
                "PARTIAL",
                "services/api/aha/commands/execute.py; apps/web/src/casework",
                "Human potential-conflict proposal and versioned resolution UI implemented; full candidate/correction/dependency acceptance not complete.",
            ),
            "CON-02": (
                "PARTIAL",
                "services/api/aha/domain/semantics.py",
                "Logical conflict claims fail closed pending the complete solver; human differences remain potential. Full red-vehicle semantic acceptance remains open.",
            ),
            "HYP-03": (
                "PARTIAL",
                "services/api/aha/commands/execute.py",
                "Successor command preserves retirement and requires newly introduced accepted source-backed records. Full relevance and positive/negative reopening E2E remain open.",
            ),
        }
    )
    for gate in gates:
        status, paths, note = evidence.get(
            gate["id"],
            (
                "NOT_RUN",
                "—",
                "Required implementation and acceptance evidence remain outstanding.",
            ),
        )
        gate.update(
            status=status,
            paths=paths,
            note=note,
            build_sha256=build,
            operator=environment["operator"],
            date=environment["date"],
        )
    (ROOT / "artifacts/acceptance-status.json").write_text(
        json.dumps(
            {
                "environment": environment
                | {"source_files": "See build-evidence.json"},
                "gates": gates,
            },
            indent=2,
        )
        + "\n"
    )
    counts = {
        s: sum(g["status"] == s for g in gates) for s in ["PASS", "PARTIAL", "NOT_RUN"]
    }
    lines = [
        "# Implementation status",
        "",
        "**The full M0–M7 specification is not complete. This is a runnable development slice, not a v1 release.**",
        "",
        f"Evidence date: {environment['date']}. Operator: {environment['operator']}.",
        f"Build/source SHA-256: `{build}`.",
        f"Gate outcomes: {counts['PASS']} PASS; {counts['PARTIAL']} PARTIAL; {counts['NOT_RUN']} NOT_RUN. Passing a limited set of gates does not certify the app.",
        "",
        "## Milestones",
        "",
        "| Milestone | Current outcome | Next required work |",
        "|---|---|---|",
        "| M0 | Partial foundation: repo, exact dependency locks, generated contracts, CI definition, development shell, pinned container recipe | Full client conformance, clean-platform bootstrap evidence and accepted release tooling |",
        "| M1 | Usable storage/review/recovery slice; original immutability and concurrency checks pass | Complete migration rollback, orphan reconciliation, command authorization and crash/disk-full matrix |",
        "| M2 | Real bounded parsers/OCR, separate persisted import jobs, human source review and source-search coverage | Full format/locale/graphical-locator and hostile-file suite; AI proposal extraction; complete cancellation/restart acceptance |",
        "| M3 | Reviewed reasoning/time forms, conflict decisions and hypothesis lifecycle | Full chronology solver, dependency semantics, contradiction detection and new-evidence relevance acceptance |",
        "| M4 | Shared 2D/table Atlas, deterministic keyword search, source inspection, questions and saved possibilities | 3D renderer, full Lens compiler/executor, saved views, large-case layout worker and accessibility parity |",
        "| M5 | Not implemented | Replay and real Ollama/local-compatible adapters, frozen snapshots, full AHA validation and 100-prompt evaluation |",
        "| M6 | Backup/restore slice and workstation guards only | Briefings, redaction, portable runs, offline/LAN operations and security drills |",
        "| M7 | Not implemented | Expanded demo, performance/stress, five-person usability, screen-reader testing, SBOM/licenses, signed image release |",
        "",
        "## Tests actually run",
        "",
        "- Supplied validator: 620 assertions across 89 definitions, 41 API operations, 32 synthetic records and 57 gates. This validates the specification package only.",
        "- `make verify`: Python formatting, TypeScript checking, frontend build, 48 passing native application tests (one OCR test runs in the container), and four Chromium end-to-end flows. See `artifacts/application-tests.xml` and `artifacts/browser-tests.json`.",
        "- Empty-case browser flow: CSV receipt/extraction → find an uncited passage → review a subject and source statement → review an event, with no model. Delayed-case and lost-response regressions also pass.",
        "- Browser flow: source text selection → human statement review → investigator note review → integrity verification → backup download → actual restore rehearsal → original tamper → visible failure and blocked backup.",
        "- Automated accessibility scans cover light/dark tested pages; narrow-width screenshot is a reflow check, not full accessibility certification.",
        "- Real child-process exits exercise four original file/database boundaries, followed by reopen and idempotent retry.",
        "- Development server inspected with agent-browser: meaningful content, no error overlay, no JavaScript errors.",
        "",
        "- `npm run verify:site`: six model/reference/search tests and two public-workspace browser flows. Keyword matching, version references, no invented links, source navigation, uncertainty, saved possibilities, keyboard focus, mobile reflow and axe checks pass.",
        "",
        "## Required acceptance mapping",
        "",
        "| ID | Milestone | Status | Code/tests/evidence | Outcome / remaining gate |",
        "|---|---|---|---|---|",
    ]
    for g in gates:
        lines.append(
            f"| {g['id']} | {g['milestone']} | {g['status']} | {g['paths']} | {g['note']} |"
        )
    lines += [
        "",
        "## Known limitations and risks",
        "",
        "- No acceptance claim for real case use; later milestones are substantial unfinished work, not only missing tests.",
        "- Intake streams immutable receipts and persists extraction jobs. Full import/report/model job orchestration, disk-full and hostile-native-parser acceptance remain incomplete.",
        "- Large case paging, backup size, latency and memory have not been qualified. No 8-hour stress test or reference-hardware performance results exist.",
        "- Unsupported formats are inspected without case writes and quarantine persists. Migration rollback, orphan reconciliation and full restoration workflows remain incomplete.",
        "- HTTP error coverage, session expiry and LAN authorization require broader tests.",
        "- All currently exercised content is synthetic. No real local model run, human usability study or assistive-technology certification has been conducted.",
        "- 49 backend tests also pass against the real isolated Linux arm64 parser service, including OCR, with network disabled and read-only root. GitHub CI passed on the previous published version; current-run status is recorded by GitHub Actions. Windows commands are documented but unverified.",
        "- `make release` refuses incomplete gates; there is no signed accepted release.",
        "",
    ]
    (ROOT / "IMPLEMENTATION_STATUS.md").write_text("\n".join(lines))


if __name__ == "__main__":
    main()
