# Portable case format and local deployment
## Case directory
```
CASE-<uuid>/
  manifest.json
  case.sqlite
  originals/sha256/<first2>/<fullhash>
  derivatives/<uuid>/<sha256>
  thumbnails/<sha256>
  indexes/<generation>/
  manifests/snapshots/<revision>.json
  runs/<run-uuid>/
  exports/
  audit.jsonl
  staging/
```
Models live in a host-shared model volume, never copied into every case. Manifest declares schema/application compatibility, case UUID, created time and synthetic status. Snapshot manifests list relative paths, bytes and hashes; unlisted extras are reported. Hashes and case IDs are validated on import. Paths never escape root after canonicalization. No hardlinks/symlinks from untrusted bundles. Export names do not reveal case names by default.

SQLite is authoritative for records and audit. Reference DDL is a minimal versioned-record baseline; generated semantic validators enforce richer schema constraints. Store old records append-only and maintain current pointers, edges and citation join indexes transactionally. SQLite FTS5 and vector caches are rebuildable. Audit JSONL is a mirror, not a competing commit log. Each schema migration is numbered, transactional when possible, backed up and tested on old fixtures. Unknown newer format opens read-only. Do not downgrade in place; restore a pre-upgrade backup.

## Backup and portability
Backup command uses SQLite backup API and a frozen case revision, then copies content-addressed originals and snapshot-referenced derivatives and runs into a staging bundle; verify every copied hash before atomic finalization. Never copy only a live WAL database file. Online backup records original snapshot revision even if case continues changing. Restore validates manifest, path safety, hashes and database integrity into a new directory before registering the case. Opening a copied case requires exclusive writer lock and full initial verification. Scheduled backups are configured by custodian, with a documented test restore and host-managed encryption.

LAN clients access HTTP API only. Database and evidence reside on server-local storage, never a client-mounted SMB/NFS live database. SQLite's WAL requires same-host coordination; this is why the server owns all database access ([SQLite WAL](https://www.sqlite.org/wal.html)). Concurrency target: one active writer process, five browser clients, serialized reviewed commands. No realtime collaborative editing or automatic sync between independent case copies. Export/import case copies are branches; merging divergent case histories is not supported in v1.

## Workstation profile
Linux containers on Linux or Docker Desktop on macOS/Windows; certify x86_64 and arm64. Baseline 4 cores, 16 GiB RAM, SSD, 10 GiB free excluding evidence/models. GPU optional. Default bind 127.0.0.1:8080, non-root application, read-only root filesystem, tmpfs for temporary files, capabilities dropped, no privileged mode or Docker socket. Local model port is not published to LAN. Runtime assets/fonts ship in image. App starts with zero cloud credentials and zero internet calls.

Minimal authentication still matters: first launch generates a short-lived pairing secret to terminal/local installer, exchanged via POST for an HttpOnly SameSite=Strict session cookie. Token is not a query parameter. Validate Host/Origin, reject foreign origins and cross-site requests, require CSRF token for mutations. Displayed actor name is a local operator label, not verified legal identity. Workstation assumes trusted OS login; shared-machine operators must use separate protected profiles or agency identity mode.

## LAN profile
Disabled until TLS reverse proxy and authentication are configured. Trusted gateway provides verified stable subject, group/case authorization and strips incoming identity headers. Backend accepts gateway identity only over a private authenticated channel with a shared secret or mTLS; reject spoofed headers from clients. Every request checks allowed case IDs. No built-in directory, password reset or complex RBAC service. If no agency gateway exists, stay in workstation mode. LAN extension acceptance includes cross-case denial and spoof tests. Host firewall restricts subnet; no internet exposure claim.

## Air-gap release
Build artifacts online in a controlled build environment; ship signed images, SBOM, checksums, pinned dependencies, frontend assets, OCR language packs and separately approved model weights/licenses. Import with Docker load, verify checksums/signatures and run without pulls. Offline compose must use pull_policy: never. Provide health check, diagnostics with redacted metadata, migration/rollback guide and restoration drill. No update checks at runtime; updates are manually imported. A packaged native installer is a later distribution option, not a prerequisite.
