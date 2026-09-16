# Specification package validation report

Package: Corgiverse Open Investigations / AHA specification 1.0.0  
Specification date: 2026-09-15  
Validation runtime: Python 3.13.7

```text
PASS: 620 contract assertions; 89 definitions; 41 API operations; 32 synthetic records; 57 acceptance gates.
This validates the specification artifacts only. Application acceptance remains NOT_RUN.
```

Verified: JSON Schema 2020-12 definitions and local references; OpenAPI 3.1; the synthetic case, model output, lens and AHA payloads; six original source hashes/sizes; four shape-invalid and three semantically invalid examples; SQLite DDL, fixture load, append-only trigger and integrity check; unique acceptance IDs and invariant coverage; local Markdown links.

The supplied seed contains 32 typed records and six entirely synthetic source files. The application acceptance matrix has 57 NOT_RUN gates. Optional mail and calibrated physical-scene extensions have explicit disabled-state and enablement boundaries.

This report validates the specification package, not a completed application. UI, parser sandbox, live local-model behavior, security, performance, usability, redaction and deployment checks must be performed by the implementer. No production app, release container images, model weights or legacy project attachments are included. Deployment files are labeled templates.

Reproduce with `tests/requirements.txt` and `tests/validate_package.py`. Package SHA256SUMS covers every other included file except itself. The outer ZIP checksum is supplied beside the download.
