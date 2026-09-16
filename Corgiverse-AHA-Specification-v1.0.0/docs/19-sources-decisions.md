# Sources, traceability and decisions
## Conversation provenance
Read the ten returned turns of “AI cold case assistant,” conversation 68a65600-48ec-8320-b85f-136f88dfabef. The source service reported no older page. Its referenced PATTERNLINE/Evidence Graph attachments and an earlier sample PDF were not available as files. This package uses principles expressed in conversation, not unverified details of those unavailable artifacts. No competitive-market novelty claims are carried forward.

| Conversation principle | Implementation contract |
|---|---|
| Human investigators; AI helps them think | INV-01/02; proposals and source review |
| Observations versus interpretations | separate domain types; provenance rules |
| Independent edge status | Edge schema + semantic support validator |
| Retired explanations retained | terminal versions + reviewed successor with new evidence |
| Query “likes eggs for breakfast” | similarity lens fixture, no involvement inference |
| Ten materially different possibilities | bounded 1–10, distinctness + honest partials |
| Questions worth checking | outcome partitions, no probability/culprit ranking |
| Useful 3D | temporal/layer Atlas, optional calibrated Scene View |
| Workstation/LAN, easy agency integration | SQLite/file ownership, gateway boundary, local models |
| Familiar printable/email workflow | Briefing Room required; CASEMAIL optional adapter |

Resolved superseded suggestions: SQLite replaces earlier PostgreSQL sketch; Docker/browser is required, native installer deferred; no fabricated plausibility tiers or probability ranking; reported source content is not unquestionable truth; anchors lock a run, not reality; RETIRED is lifecycle not tier; synthetic is origin not a higher evidence plane; email never auto-sends under default scope; existing named people cannot receive new harmful roles based on weak patterns.

## Verified technical references (accessed 2026-09-15)
These support narrow design choices, not an assertion that dependencies are pinned in this specification.
- [SQLite WAL](https://www.sqlite.org/wal.html): keep live database on server-local storage and use proper backups.
- [SQLite backup API](https://www.sqlite.org/backup.html): implement a consistent online database snapshot.
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12): schema dialect.
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html): HTTP description and schema integration.
- [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785): canonical JSON for audit payload hashes.
- [Ollama structured outputs](https://docs.ollama.com/capabilities/structured-outputs): local structured generation; application validation still required.
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): renderer capability surface; fallback remains required.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): accessibility target.
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html): recommended permissive application license with explicit patent terms.

Decision log: ADR-001 local SQLite/filesystem; ADR-002 closed proposal-only model contracts; ADR-003 no truth/guilt probabilities; ADR-004 categorical Atlas depth; ADR-005 terminal hypothesis versions; ADR-006 optional mail and physical scenes; ADR-007 trusted gateway for LAN identity; ADR-008 derive indexes and preserve source bytes. Implementers create detailed ADRs if changing these decisions; invariants cannot be weakened.
