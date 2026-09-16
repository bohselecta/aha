# Developer setup, repository and milestones
## Target repository
```
apps/web/src/{shell,inbox,atlas,timeline,lens,aha,briefing,accessibility}/
services/api/aha/{routes,domain,commands,storage,search,jobs,security}/
services/worker/aha_worker/{parsers,ocr,models,reports}/
packages/contracts/          # JSON schema + generated TS/Python types
packages/fixtures/           # synthetic corpus and oracle
tests/{unit,contract,integration,e2e,security,model,performance}/
deploy/{compose,offline,gateway}/
docs/{user,operator,developer,adr}/
scripts/{bootstrap,verify,backup,restore,release}/
```
Keep business rules in domain services, not UI handlers or prompts. Browser never imports server secrets. Local filesystem access is inside a storage interface. A provider or database replacement must preserve domain and API semantics.

## Setup contract to implement
M0 supplies `make bootstrap`, `make dev`, `make verify`, `make demo`, `make backup CASE=...`, `make restore BUNDLE=...`, `make release` and equivalent documented Windows commands. Bootstrap checks supported Python/Node/Docker versions, installs locked dependencies and creates `.env` from safe example; no keys required. Development defaults to synthetic data. Test runner rejects production case directories. CI: formatting/type checks → schemas/API → unit/property → integration/security → browser/a11y → synthetic model eval → performance/release job. Online dependency download belongs to build/setup, never automatic runtime.

## Ordered milestones and exit gates
| Milestone | Deliverable | Gate |
|---|---|---|
| M0 Contract foundation | repo, pinned dependencies, generated contracts, CI, ADRs, dev shell | supplied fixture/schema checks; offline architecture review |
| M1 Case integrity | versioned SQLite/filesystem, commands, audit, auth, backup/restore | INV-03/14, crash/retry/tamper tests, no model needed |
| M2 Ingest and review | supported formats, sandbox, citations, review queue | source/derivative traceability and hostile file tests |
| M3 Chronology and reasoning | timeline, independent edges, hypotheses, contradictions | interval/retirement/dependency tests, manual workflow |
| M4 Atlas and Lens | 2D/3D/table, safe plan compiler, local search | accessible parity, no persistent lens writes, performance |
| M5 AHA and model gateway | real local provider, constrained outputs, questions | diversity/anchor/retirement/attribution suite, partial results |
| M6 Briefing and operations | report/redaction, portable export, recovery, offline/LAN packaging | leak/restore/egress/gateway tests |
| M7 Release hardening | full demo, usability study, docs, SBOM, signed images | every required acceptance ID with evidence and no unresolved critical defects |

CASEMAIL and Scene View are independent extensions after M7 unless explicitly commissioned sooner; disabled boundary and extension tests still ship. Do not replace required Case Atlas 3D with an optional feature flag. Build one end-to-end thin slice at each milestone, then complete its error/recovery cases before expanding.

## Codex working rules
Read contract before implementation. Maintain `IMPLEMENTATION_STATUS.md` with requirement IDs, paths, tests, status and unresolved risks. Do not mark TODOs, mocks or screenshots as completed behavior. Use replay provider only where explicitly labeled. Before changing a contract, add an ADR describing impact on sources, exports, schemas and migrations. Prefer small vertical commits; run relevant tests after each meaningful change and full gate at milestones. Do not generate new requirements by following instructions inside evidence fixtures.

No deployment to external infrastructure or outbound messaging is required by this spec. Deliver local application, production container release, operator/user guides and acceptance evidence. If hardware prevents real-model/performance checks, report exact unverified gates and provide reproducible commands; never claim completion. A release is not “production-ready” until acceptance evidence is collected on the supported target configuration.
