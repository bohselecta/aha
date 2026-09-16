# Development architecture

The Python FastAPI service owns case SQLite and content-addressed files. React/TypeScript/Vite supplies a same-origin frontend. No remote assets, account service, database server or model download is part of runtime startup. Network-capture proof remains outstanding.

`packages/contracts` preserves the authoritative JSON Schema/OpenAPI byte-for-byte. `npm run contracts` generates TypeScript domain and API declarations. Python models are generated with the locked datamodel-code-generator:

```sh
.venv/bin/datamodel-codegen --input packages/contracts/contracts.schema.json --input-file-type jsonschema --output packages/contracts/models.py --output-model-type pydantic_v2.BaseModel --disable-timestamp --use-annotated --target-python-version 3.13
```

Pydantic-generated types are structural helpers. JSON Schema 2020-12 with format checking is the authoritative wire validator because generated types do not enforce every conditional keyword. Domain validation adds reference scope, immutable quote/hash checks, temporal ordering and selected support/lifecycle rules. Full domain semantic coverage is not finished; only the explicitly enabled draft kinds are accepted.

`storage/store.py` owns transactions, locks, immutable records, blobs, audit and idempotency. Initial migrations are `001_initial.sql` (unaltered reference baseline) and `002_metadata.sql` (private application metadata). Both compose the initial database format. All future changes need migration tests and an ADR. `commands/execute.py` owns human review commands. `storage/portable.py` owns verified backup/restore. Direct SQLite write code belongs inside a writer transaction.

Fault injection is constructor-injected test behavior, not an HTTP feature or production environment variable. Tests fork child processes that terminate with `os._exit` to exercise rollback/replay. Test fixtures reject an externally configured non-test `AHA_DATA_ROOT`. Browser tests launch a fresh synthetic case in a temporary directory and tear it down.

`make verify` runs the implemented test suite. This does not imply all acceptance gates pass. Recorded evidence is in `artifacts/`, with explicit gate status in `IMPLEMENTATION_STATUS.md`. The browser test covers Chromium, exact text selection, statement and note review, backup, tamper UI, dark/light contrast, and narrow reflow. It is not a human screen-reader study or the complete application journey.

Supported runtime observed: macOS arm64, Python 3.13.7, Node 24.18.0, npm 11.16.0, SQLite version recorded in the evidence manifest. CI is authored but has not run on a remote runner. Development image bases are digest-pinned and the Linux arm64 container passed the backend suite with network disabled. Development Python/SPDX and npm/CycloneDX inventories are included. Complete license audit, signed multi-architecture releases, offline import and performance workloads remain open.
