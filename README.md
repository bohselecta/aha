# Aha! · Open Investigations

[Public site & fictional demo](https://aha-nine-omega.vercel.app) · [GitHub](https://github.com/bohselecta/aha)

A local evidence workbench under active implementation. **This repository is an early development slice, not the completed v1.0 application.** The complete, unchanged specification is in [Corgiverse-AHA-Specification-v1.0.0](Corgiverse-AHA-Specification-v1.0.0/CODEX_START_HERE.md). See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for all 57 release gates.

Currently runnable: local browser pairing, synthetic case loading and case creation, immutable original receipts, exact UTF-8 derivatives, manual source statement proposals, human acceptance/rejection, record history, a basic timeline table, integrity verification, and portable backup/restore. Accepted original bytes never change. No model or external account is required. No model adapter is implemented yet.

## Run the development container

```sh
docker compose up --build -d
docker compose exec app cat /data/pairing-secret
```

Open http://127.0.0.1:8080 and pair with the displayed local secret. Compose explicitly loads the fictional demo. The non-root case service uses an internal-only network and a read-only root filesystem; a fixed-target loopback forwarder provides browser access. This is not the agency LAN/TLS gateway. Stop with `docker compose down` before running the native development server on the same port. Named-volume case data is retained.

## Start locally

Tested development runtimes: Python 3.13.7 and Node 24.18.0 on macOS arm64. The development container also passes the 35 backend tests on Linux arm64. Other target platforms are not yet certified.

```sh
make bootstrap
npx playwright install chromium  # browser test dependency; setup-time download
make demo                       # explicitly fictional Lantern Annex case
make dev
```

Open http://127.0.0.1:8080. Read `.local/pairing-secret` on this computer and enter it in the pairing form with your operator label. The secret expires ten minutes after startup. Restart the server to generate a new secret. No case data is stored in browser localStorage; only the theme preference is persisted.

Run `make verify` for specification validation, Python formatting, TypeScript checks, implementation tests, browser/a11y checks and the frontend build. Test data is synthetic and temporary. The supplied validator's 620 assertions validate the package, not application acceptance.

## Current boundaries

TXT extraction is implemented. Other file types are stored unchanged with an explicit extraction-unavailable warning. Semantic proposal creation currently accepts only Entity, Observation (exact text citation), and Note drafts. Unimplemented command types fail explicitly. The broader deterministic reasoning engine, parser sandbox, full Atlas/Lens/AHA/Briefing workspaces, local model adapters, redaction, LAN gateway, expanded demo, performance testing, human usability study, and signed offline release remain unfinished. CASEMAIL and Scene View are disabled. `make release` deliberately fails until acceptance and release tooling exist.

Use only synthetic material while developing and testing. No agency/compliance certification or production-readiness claim is made.

## Documentation

- [User guide](docs/user/START.md)
- [Operator and recovery guide](docs/operator/OPERATIONS.md)
- [Developer guide](docs/developer/DEVELOPMENT.md)
- [Implementation decisions](docs/adr/0001-foundation.md)

## Public site on Vercel

`apps/site` is a separate static product website and **read-only synthetic demonstration**. Confidential casework stays in the local application. No account, model, upload endpoint, database, or environment variables are required for the site.

```sh
npm ci
npm run verify:site
```

Import `bohselecta/aha` into Vercel, leaving the Root Directory at the repository root. The committed `vercel.json` configures the Vite build and `apps/site/dist` output. Publish only that output; do not deploy the local API or case directories. See [hosting decision](docs/adr/0003-public-site.md).

## License

Free to use, modify, and distribute, including commercially, under [Apache-2.0](LICENSE). The license includes warranty and liability disclaimers, subject to applicable law; it cannot guarantee immunity from all liability. See [licensing notes](docs/operator/LICENSING.md), [NOTICE](NOTICE), and the third-party inventory. Model weights are not bundled.
