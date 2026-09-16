# Testing and performance budgets
## Test layers
Unit: interval algebra/DST, tier rules, constraint solver, lifecycle transitions, canonical audit hashes, citation offsets, dependency traversal, path safety, dedupe, field restrictions and record-reference integrity. Property tests: permutations do not change contradiction pairs; accepted originals never overwritten; identical transaction retries do not duplicate changes; synthetic provenance cannot support documented edges; backup/restore retains byte hashes.

Contract: validate every fixture and generated API object with Draft 2020-12 + format checking; OpenAPI validation and generated client conformance; migration tests from each supported case format. A schema-valid response may still be semantically rejected. Fixtures include both kinds. Fuzz upload/container formats within resource limits and verify service remains healthy.

Integration: real SQLite/filesystem transaction crash points, orphan reconciliation, WAL backup, restore on fresh volume, worker lease restart, index generation swap, provider timeout, redaction and egress block. Run real supported parser formats. Test LAN gateway denial, loopback CSRF, cookie/session expiry, unauthorized file IDs and export scopes. Tampered original must produce a visible integrity failure.

End-to-end: import → review → timeline → independent edge → contradiction → lens/clear → AHA/partial → hypothesis retirement → blocked regeneration → report → backup/restore. Test keyboard-only and screen-reader journeys; no need to inspect JSON to use the product. Test both WebGL and forced fallback. Capture representative screenshots for empty, dense, uncertainty and failure states in light/dark themes.

Model evaluations: replay deterministic contract fixtures plus at least 100 synthetic/adversarial prompts against a real supported local model. Release gate: zero accepted fabricated citations, forbidden attribution or synthetic promotions; all retired exact-family matches blocked; paraphrase misses produce documented remediation and expanded tests before release. Measure completion/partial/rejection rates, never promise perfect model recall. Review free-text samples independently by a human; passing shape checks is not semantic assurance. No real case contents in CI.

## Performance envelope
Reference hardware: 4 modern CPU cores, 16 GiB RAM, SSD, integrated graphics, 1920×1080 browser; record exact machine/browser in result. Corpus A: 10k entities, 30k edges, 100k observations, 100k text chunks, 10k pages; generate deterministically from synthetic seed. Run 20 warm and 5 cold repetitions and report p50/p95. Local generation measured separately by model/hardware, not hidden in API latency.

| Operation | Release target |
|---|---|
| Case summary open | p95 ≤2s warm / ≤5s cold |
| Indexed keyword search first 50 | p95 ≤500ms warm |
| Two-hop filtered lens, ≤500 nodes | p95 ≤1s deterministic execution |
| Atlas visible 500 nodes/1,500 edges | ≥30 FPS while interacting; initial view ≤2s |
| Select node / keyboard feedback | p95 ≤100ms |
| Timeline viewport 2,000 events | p95 ≤500ms layout |
| Service idle memory | ≤500 MiB excluding models/parsers |
| Browser working memory | ≤750 MiB on reference visible graph |
| Cancel acknowledgment | ≤1s, worker termination ≤5s |
| First ingest status | ≤1s after accepted upload |
| Text PDF extraction | ≥2 pages/s on 100-page fixture; OCR measured separately |
| 100-page briefing render | ≤30s excluding original ingest |

Large cases use explicit paging/clustering and never promise all nodes simultaneously. A job estimates work only if measurable; OCR and local generation show elapsed time/cancellable status rather than invented deadlines. Publish model throughput and minimum RAM separately. Performance test failure requires optimization or an explicit revised scope decision, not silently raising budgets. Long-running stress test: five clients, 1,000 reviewed commands, parser/model interruption, 8 hours; no lost accepted writes or leaked case data.
