# Contract and invariant register
MUST means release-blocking; SHOULD permits a documented, tested alternative; MAY means optional. Scope is v1.0 unless explicitly labeled extension. Optional 3D Scene View and CASEMAIL are extension contracts; their boundaries and disabled states are required, full implementations are not v1.0 gates. Case Atlas 3D is required, with equally capable 2D/table access.

Precedence: invariant register → JSON schemas and semantic validators → API contracts → product/architecture → design examples. If two normative requirements conflict, stop the affected implementation, record the conflict and resolve it explicitly; do not silently pick the easier interpretation. Acceptance cannot weaken an invariant. Updating schemas requires corresponding migration, fixture, API and acceptance updates.

| ID | Invariant |
|---|---|
| INV-01 | Humans review and authorize semantic case mutations. Models return proposals only. |
| INV-02 | Never generate guilt scores, suspect rankings, arrest recommendations or new named accusations from pattern similarity. |
| INV-03 | Original bytes are immutable, SHA-256 addressed and verified; corrections are new records. A hash establishes byte identity, not truth or pre-ingest authenticity. |
| INV-04 | Observation (what a source asserts) and interpretation (what someone concludes) are separate record types. |
| INV-05 | Every persistent edge owns its tier, support, counter-support and review history independently of its endpoints. |
| INV-06 | Contradictions are objects, never silently reconciled or deleted to improve a narrative. |
| INV-07 | Retirement is terminal for a hypothesis version; relevant new evidence plus human review is required for a linked successor. |
| INV-08 | Query Lens similarity/context overlays cannot become persistent evidentiary edges automatically. |
| INV-09 | AHA preserves the exact human-selected constraint snapshot and returns distinct possibilities and tests, never likelihood rankings. |
| INV-10 | 3D axes, layers, measurements and uncertainty have explicit meanings. No decorative geometry masquerades as measured evidence. |
| INV-11 | Default operation has no outbound case traffic, telemetry, remote fonts, maps, analytics or automatic model downloads. |
| INV-12 | Every generated assertion is either source-bound, an explicit assumption, or rejected. No fabricated citations. |
| INV-13 | Unknown, unsupported, not searched, unobserved and contradicted are distinguishable. Absence is not negative evidence without a documented search scope. |
| INV-14 | All writes are case-scoped, revision-checked, audited and atomic; derived indexes may lag but their revision is visible. |

No implementation may rely on a prompt alone for these guarantees. Enforce structural restrictions, authority separation, deterministic validation, review gates, safe UI labels and adversarial tests. Model free text remains fallible: generated narratives stay visibly unreviewed and never appear as accepted findings merely because validation passes.

Release scope is an entire usable local product, not a screens-only demo. All seven workspaces, real supported-format ingest, disk persistence, recovery, offline core workflows, at least one real local model adapter, accessible fallback, export and signed release tooling are required. Demo mode may use replayed generation, but must say so. Stubs do not satisfy production acceptance.
