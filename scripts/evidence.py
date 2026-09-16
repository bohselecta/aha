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
            "Tampered bytes trigger visible integrity failure and block download/backup. Persistent quarantine state and recovery workflow remain incomplete.",
        ),
        "CORE-07": (
            "PASS",
            "tests/integration/test_integrity.py::test_review_revision_retry_history",
            "Old accepted versions resolve; SQLite UPDATE/DELETE attempts against records and audit fail.",
        ),
        "ING-01": (
            "PARTIAL",
            "services/api/aha/storage/intake.py",
            "Real immutable UTF-8 TXT derivatives work; PDF/OCR/image/Office/CSV parsers are unfinished.",
        ),
        "ING-02": (
            "PARTIAL",
            "tests/e2e/workflow.spec.ts",
            "Manual source and note proposal/review flow passes. AI extraction, proposal editing and batch review are unfinished.",
        ),
        "ING-03": (
            "PARTIAL",
            "packages/contracts/contracts.schema.json; services/api/aha/commands/execute.py",
            "Separate types preserved; only Note, Entity and Observation drafts enabled. Full interpretation workflow unfinished.",
        ),
        "ING-04": (
            "PARTIAL",
            "tests/unit/test_semantics.py; apps/web/src/inbox/SourceReview.tsx",
            "Immutable hash, exact-quote/range rejection and browser text selection tested. Page/row/media locator maps and full Unicode corpus remain open.",
        ),
        "ING-06": (
            "PASS",
            "tests/integration/test_integrity.py::test_original_retry_and_independent_receipts",
            "Same bytes under different names share content but retain distinct evidence and custody receipts.",
        ),
        "TIME-01": (
            "PARTIAL",
            "tests/unit/test_semantics.py::test_open_and_reversed_intervals",
            "Open/empty/reversed bounds tested; basic source timeline displays raw uncertainty. DST, disputes and time editing unfinished.",
        ),
        "EDGE-01": (
            "PARTIAL",
            "tests/unit/test_semantics.py::test_unsupported_edge_and_synthetic_promotion",
            "Semantic rejection tested; full edge creation/review UI is not enabled.",
        ),
        "HYP-01": (
            "PARTIAL",
            "services/api/aha/commands/execute.py; tests/unit/test_semantics.py::test_retirement_cannot_transition",
            "Transition rules and terminal retirement guard exist; full transition table and reviewer UI unfinished.",
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
            "Fresh-directory restore and hash checks pass. Full run artifacts, independent operator drill and release-volume certification remain open.",
        ),
        "SEC-01": (
            "PARTIAL",
            "compose.yaml; deploy/Dockerfile",
            "No runtime remote assets or telemetry code; internal container network configured. Offline install and packet-capture proof not run.",
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
            "Original storage crash/retry drills pass. Disk-full, worker interruption and migration rollback unfinished.",
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
        "| M1 | Usable storage/review/recovery slice; original immutability and concurrency checks pass | Complete integrity quarantine/recovery, migration/unsupported-format behavior, bounded streaming, complete command authorization and crash matrix |",
        "| M2 | TXT original/derivative and human source review only | Sandboxed supported-format parsers, durable cancellable jobs, locator maps, AI proposal extraction and hostile-format suite |",
        "| M3 | Basic timeline and selected semantic guards | Full chronology solver, independent edge review, contradictions, hypothesis lifecycle/reopening and dependency rules |",
        "| M4 | Not implemented | Stable 2D/3D/table Atlas, Lens compiler/executor, FTS and accessibility parity |",
        "| M5 | Not implemented | Replay and real Ollama/local-compatible adapters, frozen snapshots, full AHA validation and 100-prompt evaluation |",
        "| M6 | Backup/restore slice and workstation guards only | Briefings, redaction, portable runs, offline/LAN operations and security drills |",
        "| M7 | Not implemented | Expanded demo, performance/stress, five-person usability, screen-reader testing, SBOM/licenses, signed image release |",
        "",
        "## Tests actually run",
        "",
        "- Supplied validator: 620 assertions across 89 definitions, 41 API operations, 32 synthetic records and 57 gates. This validates the specification package only.",
        "- `make verify`: Python formatting, TypeScript checking, frontend build, 35 application tests, and one Chromium end-to-end flow. See `artifacts/application-tests.xml` and `artifacts/browser-tests.json`.",
        "- Browser flow: source text selection → human statement review → investigator note review → integrity verification → backup download → actual original tamper → visible failure and blocked backup.",
        "- Automated accessibility scans cover light/dark tested pages; narrow-width screenshot is a reflow check, not full accessibility certification.",
        "- Real child-process exits exercise four original file/database boundaries, followed by reopen and idempotent retry.",
        "- Development server inspected with agent-browser: meaningful content, no error overlay, no JavaScript errors.",
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
        "- Intake reads a bounded file into memory and executes TXT extraction synchronously; streaming receipt and durable cancellable worker jobs are unfinished.",
        "- Large case paging, backup size, latency and memory have not been qualified. No 8-hour stress test or reference-hardware performance results exist.",
        "- Unknown-format read-only opening, migration failure recovery and per-file quarantine need implementation.",
        "- HTTP error coverage, session expiry and LAN authorization require broader tests.",
        "- All currently exercised content is synthetic. No real local model run, human usability study or assistive-technology certification has been conducted.",
        "- 35 backend tests also pass in a Linux arm64 container with network disabled and read-only root. CI workflow is authored but not executed on a remote runner. Windows commands are documented but unverified.",
        "- `make release` refuses incomplete gates; there is no signed accepted release.",
        "",
    ]
    (ROOT / "IMPLEMENTATION_STATUS.md").write_text("\n".join(lines))


if __name__ == "__main__":
    main()
