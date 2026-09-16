# ADR 0001 — Preserve contracts and gate incomplete implementation

Status: accepted for development, 2026-09-16.

The supplied package is a specification with 57 required release gates. Preserve it and its ZIP unchanged. Build the monorepo beside it; do not relabel the supplied validator as application acceptance.

Use the specified React/Vite + FastAPI + SQLite/filesystem architecture. The initial database uses the reference DDL unchanged plus four private metadata tables, without changing wire schemas. Append-only triggers protect accepted versions and audit entries from routine application updates/deletes. RFC 8785 canonicalization is used for audit hashing.

Generate Python and TypeScript declarations, but retain JSON Schema validation at the service boundary so conditional/closed-schema constraints remain authoritative. Do not add convenience HTTP mutations outside the supplied contract. Unsupported commands/endpoints are unavailable rather than accepting a generic dictionary or silently using mocks.

Implement the source-storage/review/recovery slice first. Publish its exact limitations in UI and status documentation. Restrict draft creation to Note, Entity and Observation until the other semantic validators have complete tests. UTF-8 identity extraction is deterministic; richer parser formats remain explicitly unavailable until sandboxing and locator maps exist. No replay provider is silently substituted for an actual model.

Release tooling must refuse an incomplete acceptance matrix. This development state is not a production release, even when all currently implemented tests pass. Human usability, screen-reader, real local model, hardware performance, offline packet capture and signed image evidence are separate gates.
