# Corgiverse Open Investigations
## AHA — Augmented Human Investigation
**Local first · Evidence aware · Model agnostic · Auditable · Open source**

The investigator investigates. The software expands what the investigator can see, remember, compare, challenge, and think about.

This is the authoritative **v1.0 build specification**, version 1.0.0, dated 2026-09-15. It is a specification package, not a finished application or a claim of operational certification. Hand this directory to Codex to implement the complete release described here. The supplied schemas, OpenAPI contract, reference SQL, synthetic fixtures, validator, and acceptance matrix make the contract testable. Deployment files are implementation templates until the application and images exist.

AHA is a local investigative reasoning workbench for professionals reviewing complex, incomplete case material. It preserves original material, separates observations from interpretations, displays independently supported relationships, exposes contradictions, and generates constrained alternatives and questions. It does not decide guilt or rank people by suspicion.

### Start here
1. Read `AGENTS.md` and `docs/00-contract.md`.
2. Read `docs/01-product.md`, then architecture, domain, and evidence rules.
3. Validate this package: `python -m venv .venv && .venv/bin/pip install -r tests/requirements.txt`, then `.venv/bin/python tests/validate_package.py`.
4. Give Codex `CODEX_START_HERE.md`. Implement milestones in order; record evidence against every acceptance ID.

### Seven connected workspaces
**Inbox** preserves and reviews incoming material. **Timeline** expresses uncertain chronology honestly. **Case Atlas** presents a stable 2D/3D case graph. **Query Lens** highlights a temporary, explainable subgraph. **AHA** explores distinct constrained scenarios. **Contradictions & Leads** tracks unresolved conflicts and discriminating questions. **Briefing Room** produces readable, source-linked reports.

### Target installation after implementation
`docker compose up --build -d` starts the default workstation profile. Open `http://127.0.0.1:8080`, complete the local pairing flow, and choose the clearly marked synthetic demo or an empty case. Model installation is explicit and separate; core casework works with no model. A prebuilt, signed release supports `docker compose up -d` after image import. LAN mode requires the documented authenticated TLS gateway. No SaaS account, billing, graph server, external database, or external API is required.

### Package map
| Location | Purpose |
|---|---|
| `docs/00-contract.md`–`docs/18-delivery.md` | Product, technical behavior, operations, tests and build sequence |
| `schemas/contracts.schema.json` | Closed JSON Schema 2020-12 contracts and domain records |
| `api/openapi.json`, `api/reference.sql` | HTTP contract and SQLite persistence baseline |
| `fixtures/` | Valid synthetic seed, expected outputs and adversarial examples |
| `prompts/` | Versioned model task instructions and restrictions |
| `deploy/` | Workstation and LAN deployment templates |
| `design/` | Tokens and interaction layout |
| `ACCEPTANCE.md` | Release gate and definition of done |
| `docs/19-sources-decisions.md` | Conversation traceability, external sources, resolved choices |

Recommended application license: Apache-2.0; see `LICENSE-RECOMMENDATION.md`. No actual evidence, personal data, model weights, or legacy project files are bundled. Existing PATTERNLINE and Evidence Graph files were unavailable; principles visible in the referenced conversation are preserved without claiming their original implementations were inspected.
