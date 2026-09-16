# Operations and recovery

This is a development build. The full parser sandbox, background jobs, LAN gateway, model gateway and signed release containers are not yet available. Keep the server bound to loopback and use fictional data for verification.

## Development containers

`docker compose up --build -d` builds pinned base images and starts the synthetic development stack. The case service runs as UID 10001 with a read-only root and internal-only network. A fixed-target TCP forwarder publishes only `127.0.0.1:8080`; it is not a LAN identity/TLS gateway. Read the secret with `docker compose exec app cat /data/pairing-secret`. `docker compose down` stops the stack and preserves the named volume. Do not add `-v` unless intentionally destroying that development data.

The Linux arm64 backend test suite passed with `--network none` and read-only root. The running stack passed pairing, synthetic case reads, Host denial and unauthenticated denial. See `artifacts/container-verification.json`. Signed images, offline distribution and other architectures remain unverified.

## Local service

`make dev` serves the compiled frontend and API on `127.0.0.1:8080`. `AHA_DATA_ROOT` selects a server-local directory (default `.local/cases`). `.env` is loaded at startup. Database files must not reside on an SMB/NFS share. Each case is held by an exclusive OS advisory writer lock for the life of the service. Launching a second writer fails.

Pairing secret is written with mode 0600 to `.local/pairing-secret` by default; it lasts ten minutes. Sessions have 30-minute idle and 12-hour absolute lifetimes. Reloading the page currently requires pairing again because CSRF state stays in memory. Restart to generate a new pairing secret. No token is placed in a URL. API logs suppress request bodies and access logs. Keep host login and case directory access restricted.

Use host full-disk encryption and separately encrypted backup storage. The application does not encrypt SQLite itself. Confirm encryption using your OS management tools and recovery-key policy. Protect exported ZIPs independently.

## Backups

The browser's backup operation uses SQLite's backup API under the writer lock, copies all original/derivative versions, verifies each hash and atomically publishes a manifest-bearing ZIP. Downloads expire after 24 hours; files remain on local disk until operator archival/retention tooling is added. Backups include sensitive records and are not redacted publications. Current backup execution is synchronous and is not cancellable; large-case acceptance is open.

For an offline command-line backup, stop `make dev` first (the maintenance process must acquire the exclusive writer lock):

```sh
make backup CASE=00000000-0000-4000-8000-000000000001
```

Output is `artifacts/<case-uuid>.aha-case.zip`. For online backups use the authenticated browser.

## Restore drill

```sh
make restore BUNDLE=/absolute/path/to/case.aha-case.zip RESTORE_ROOT=.local/restored-cases
```

Restore checks archive paths, expansion bounds, declared members, byte hashes, database integrity, schema, case identity, records and audit chain in staging. An existing UUID cannot be overwritten. Start the service with `AHA_DATA_ROOT=.local/restored-cases` after stopping the other instance. Verify again and compare case revision and original hashes with the source manifest.

The live-WAL database must never be copied by itself. Original bytes are not corrected in place. If verification finds corruption, retain the damaged copy for inspection and recover a separate case from a known backup. Never change a stored hash to match damaged bytes.

Crash tests cover process exits after staging-file fsync, after original publication, before DB commit, and after DB commit. Unreferenced original objects are reported and retained; automated grace-period quarantine/cleanup is not yet implemented. Audit JSONL is rebuilt from authoritative SQLite entries on reopen.

Disk-full and migration-failure drills remain unverified. Stop writes if storage fails. Preserve data, free space outside the case, and restore into a fresh directory if needed. Only initial schema format 1.0.0 is supported; do not attempt an in-place downgrade. Inspection of unknown newer formats is incomplete.

## Windows equivalents

Use Python 3.13 and Node 24. Run `python scripts/manage.py bootstrap`, then `.venv\Scripts\python.exe scripts\manage.py demo` and `.venv\Scripts\python.exe scripts\manage.py dev`. `verify`, `backup --case UUID`, `restore --bundle PATH --root NEW_DIRECTORY`, and `release` use the same script. Windows locking and directory durability have not been certified. Do not interpret these commands as tested Windows release support.
