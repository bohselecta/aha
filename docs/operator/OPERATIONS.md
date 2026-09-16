# Operations and recovery

This is a development build. Isolated document parsing and persisted import jobs are available. The LAN gateway, model gateway and signed release containers are not yet available. Keep the server bound to loopback and use fictional data for verification.

## Development containers

`docker compose up --build -d` builds pinned base images and starts the synthetic development stack. The case service runs as UID 10001 with a read-only root and internal-only network. A separate parser service runs without a network interface or case volume, with a read-only root, dropped capabilities, a 2 GiB memory limit, CPU/time limits and a 512 MiB scratch filesystem. Only the current file and bounded extraction result cross the private transfer volume; the API serializes transfers. A fixed-target TCP forwarder publishes only `127.0.0.1:8080`; it is not a LAN identity/TLS gateway. Read the secret with `docker compose exec app cat /data/pairing-secret`. `docker compose down` stops the stack and preserves the named volume. Do not add `-v` unless intentionally destroying that development data.

The Linux arm64 backend test suite passed with `--network none` and read-only root. The running stack passed pairing, synthetic case reads, Host denial and unauthenticated denial. See `artifacts/container-verification.json`. Signed images, offline distribution and other architectures remain unverified.

## Local service

`make dev` serves the compiled frontend and API on `127.0.0.1:8080`. `AHA_DATA_ROOT` selects a server-local directory (default `.local/cases`). `.env` is loaded at startup. Database files must not reside on an SMB/NFS share. Each case is held by an exclusive OS advisory writer lock for the life of the service. Launching a second writer fails.

Pairing secret is written with mode 0600 to `.local/pairing-secret` by default; it lasts ten minutes. Sessions have 30-minute idle and 12-hour absolute lifetimes. A valid session resumes after reload; CSRF remains in memory. Use `make pairing` natively or `docker compose exec app python scripts/manage.py pairing --root /data/cases` for a new ten-minute code without restarting. Then read the code locally. No token is placed in a URL. API logs suppress request bodies and access logs. Keep host login and case directory access restricted.

Use host full-disk encryption and separately encrypted backup storage. The application does not encrypt SQLite itself. Confirm encryption using your OS management tools and recovery-key policy. Protect exported ZIPs independently.

## Backups

The browser's backup operation uses SQLite's backup API under the writer lock, copies all original/derivative versions, verifies each hash and atomically publishes a manifest-bearing ZIP. Temporary downloads expire after 24 hours; expired copies are removed on startup, on backup-health inspection, and by a one-minute retention sweep. Downloaded copies are outside this retention policy. Backups include sensitive records and are not redacted publications. Current backup execution is synchronous and is not cancellable; large-case acceptance is open.

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

Disk-full and migration-failure drills remain unverified. Stop writes if storage fails. Preserve data, free space outside the case, and restore into a fresh directory if needed. Only initial schema format 1.0.0 is supported; do not attempt an in-place downgrade. Unsupported database versions are opened for inspection without writing to their case directories. A nonempty WAL is inspected through a temporary snapshot outside the case. Migration rollback and compatibility with arbitrary future schemas are not certified.

## Windows equivalents

Use Python 3.13 and Node 24. Run `python scripts/manage.py bootstrap`, then `.venv\Scripts\python.exe scripts\manage.py demo` and `.venv\Scripts\python.exe scripts\manage.py dev`. `verify`, `backup --case UUID`, `restore --bundle PATH --root NEW_DIRECTORY`, and `release` use the same script. Windows locking and directory durability have not been certified. Do not interpret these commands as tested Windows release support.

## Extraction and recovery limits

Inputs are limited to 250 MiB. Multipart intake is serialized and counts streamed request bytes as well as declared length. Extracted text is capped at 20 MiB; parser output at 64 MiB; CPU at 120 seconds and wall time at 600 seconds. Archive, image, page, sheet and row bounds are enforced. Limit or sandbox failure preserves the original and reports that extraction did not complete. Recognition is English-only; page rotation and the complete locale corpus remain open acceptance work.

Import receipt and extraction commit separately. The original is durable before parsing begins; successful derivative publication advances the case revision again. Queued/interrupted jobs resume at service startup. Cancelling extraction retains the original. Retry produces new derivatives; source search selects the newest extracted text, while old citations remain resolvable. The shared transfer volume and worker scratch area contain sensitive transient bytes, so protect the host storage. Full disk and malicious-native-parser escape testing remain incomplete.

The Compose isolation profile works on the tested Docker Desktop Linux arm64 kernel without Landlock. Native macOS uses sandbox-exec. Native Linux requires Landlock ABI 3 and libseccomp; if unavailable, use Compose. Native Windows extraction fails closed. Do not disable these boundaries to make a parser succeed.

Backups use stored ZIP members, shared writer/reader limits of 2 GiB uncompressed content and 10,001 members, streaming copies and SHA-256 verification. Rehearse recovery exercises the actual restore validator on the current storage device, removes the temporary restore, and retains a result tied to the backup hash and case revision. It does not replace an independent operator/off-device drill. Integrity quarantine persists through rejected transactions and restart; explicit successful verification is required to clear it.

Run `.venv/bin/python scripts/verify_parsers.py` to build and test the isolated runtime with synthetic files. It also verifies network-syscall denial and absence of the case volume. The complete hostile-document corpus, packet-capture proof, crash/resume/cancel timing matrix and independent security audit remain release work.
