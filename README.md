# Aha! · Open Investigations

[Public site & fictional demo](https://aha-nine-omega.vercel.app) · [GitHub](https://github.com/bohselecta/aha)

A local evidence workbench under active implementation. **This repository is an early development slice, not the completed v1.0 application.** The complete, unchanged specification is in [Corgiverse-AHA-Specification-v1.0.0](Corgiverse-AHA-Specification-v1.0.0/CODEX_START_HERE.md). See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for all 57 release gates.

Currently runnable: local browser pairing and session resumption, case creation, immutable receipts, isolated extraction for TXT/CSV/DOCX/XLSX/PDF and image OCR, source-text search with exact citations, human-reviewed statements/events/interpretations/relationships/explanations, lifecycle decisions, case overview, comparisons, version history, a source-linked 2D/table Atlas, integrity quarantine, portable backup/restore, and recovery rehearsal. No external account or model is required for this manual workflow. Local AI generation is not implemented yet.

## Run the development container

```sh
docker compose up --build -d
docker compose exec app cat /data/pairing-secret
```

Open http://127.0.0.1:8080 and pair with the displayed local secret. Compose explicitly loads the fictional demo. The non-root case service uses an internal-only network and a read-only root filesystem. A separate parser service has no network and no case-volume access; a fixed-target loopback forwarder provides browser access. This is not the agency LAN/TLS gateway. Stop with `docker compose down` before running the native development server on the same port. Named-volume case data is retained.

## Start locally

Tested development runtimes: Python 3.13.7 and Node 24.18.0 on macOS arm64. The isolated development container passes 49 backend tests on Linux arm64, including real parser/OCR checks. Other target platforms are not yet certified.

```sh
make bootstrap
npx playwright install chromium  # browser test dependency; setup-time download
make demo                       # explicitly fictional Lantern Annex case
make dev
```

Open http://127.0.0.1:8080. Read `.local/pairing-secret` on this computer and enter it in the pairing form with your operator label. The secret expires ten minutes after startup. Use `make pairing` to generate a fresh code without restarting the server. A valid browser session survives a page reload. No case data is stored in browser localStorage; only the theme preference is persisted.

Run `make verify` for specification validation, Python formatting, TypeScript checks, implementation tests, browser/a11y checks and the frontend build. Test data is synthetic and temporary. The supplied validator's 620 assertions validate the package, not application acceptance.

## Current boundaries

Document extraction preserves original bytes and produces new text and locator-map derivatives. OCR currently uses English recognition. Review OCR against the original; password-protected, unsupported and failed extractions retain their original with an explanation. Binary DOC/XLS and audio/video remain store-only. Windows parser isolation is not enabled.

The full temporal solver, natural-language Lens compiler/executor, required Atlas 3D and large-case layout work, local AHA generation, briefings/redaction, saved views, authenticated LAN gateway, full recovery fault matrix, performance/stress and human acceptance, and signed offline release remain unfinished. CASEMAIL and optional Scene View remain disabled. `make release` deliberately blocks until the required acceptance and release tooling exist. This pass does not reduce the agreed v1 scope.

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
