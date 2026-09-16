# Architecture
## Chosen baseline
One monorepo: TypeScript React/Vite browser client, Three.js rendering, Python FastAPI service with Pydantic contract models, SQLite on server-local disk, filesystem evidence store, and isolated extraction workers. Pin supported dependency versions and image digests at implementation milestone M0; commit lockfiles and a compatibility matrix. Version ranges are not reproducible releases.

Browser → same-origin API → case service → SQLite + content-addressed files. Case service → durable SQLite job queue → parser sandbox or model gateway. Only the case service commits domain state. A worker receives bounded job input and returns staged output; it has no unrestricted case database access. The browser never has model credentials. A cloud adapter is optional and disabled.

Modules: CASECORE owns records, provenance and revisions; CASEGRAPH computes adjacency/dependencies; CHRONICLE computes temporal constraints; AHA generates and validates scenarios; Query Lens compiles a safe view plan; report service renders frozen snapshots. CASEMAIL is an external adapter. Do not create six network microservices for these modules.

## Ownership and transactions
Each open case has one writer service process and a lifetime OS advisory lock. SQLite uses foreign_keys=ON, WAL, synchronous=FULL, busy_timeout=5000 and short transactions. One case-wide revision increments per accepted semantic command or registered original receipt. Technical run/job/proposal metadata and saved views have their own revisions and never change accepted evidence merely by existing. Read results expose case_revision and index_revision. API If-Match prevents lost updates; a mismatch returns 409 with current revision, never silently merges evidentiary decisions. Idempotency keys bind actor, route and body hash for 24 hours; reuse with different body returns 409.

Atomic accepted command: validate schema + references + actor + current revision → begin immediate → append immutable versions and review action → update current pointers → append audit entry → increment case revision → enqueue derivative/index work → commit. Human-friendly labels may change through revisions; UUID identity does not. A retry produces the original response once, not duplicate originals or reviews.

File durability: stream into same-volume staging, hash incrementally, fsync file, rename into content-addressed location without overwrite, fsync directory, then commit metadata. Crash after rename but before DB commit leaves an orphan for reconciliation, not a missing accepted original. Pending imports retain status; cleanup only quarantines unreferenced objects after a grace period and verified reconciliation.

## Durable jobs
States QUEUED → RUNNING → SUCCEEDED / FAILED / CANCELLED. Worker lease is 60s, heartbeat 15s; expired leases return to QUEUED up to three execution attempts. Outputs have deterministic job+input identifiers; atomic promotion prevents duplicate writes. Cancellation stops child processes, deletes only temporary derivatives and leaves original receipt intact. Job status uses SSE with Last-Event-ID and polling fallback. On case revision change, model job finishes against its frozen snapshot and is marked stale; no result auto-applies to current state.

## Deterministic versus AI
Deterministic code owns hashes, storage, time normalization, reference integrity, access, tiers, lifecycle transitions, constraint checking, graph traversal, equality matching, interval overlap, saved layout, report labels, audit and export. AI may propose extracted statements, natural-language query plans, semantic contradiction candidates, scenarios and concise source-bound explanations. Humans own entity merges, evidentiary assessment, anchors, proposed record acceptance, contradiction resolution, retirement and reopening. Model output cannot execute SQL, shell, arbitrary URLs, files or write APIs.

## Failure containment
Parser/model failures cannot roll back original receipt or corrupt accepted records. Disk-full disables writes with a clear read-only banner and recovery instructions. Unsupported schema opens in inspection-only mode with export access. A corrupt or mismatched original shows INTEGRITY_FAILURE and prevents evidence-inclusive export until resolved by explicit custodian action; never rehash and quietly accept changed bytes. Individual files can be quarantined while the rest of the case remains inspectable.
