# Contract verification

Run from the package root:

```sh
python3 -m venv .venv
.venv/bin/pip install -r tests/requirements.txt
.venv/bin/python tests/validate_package.py
```

Python 3.13 was used for the supplied validation run. Requirements pin the tested validation environment; they are not the future application's dependency lockfile. Installing these dependencies requires a package mirror or preloaded wheels in an air-gapped environment.

The validator checks schema syntax, local references, OpenAPI, positive payloads, source hashes and sizes, selected semantic reference/time/citation rules, seven negative fixtures, SQLite DDL and append-only record behavior, acceptance-ID coverage, and Markdown links.

It does **not** implement the full application rule engine, test an actual browser UI, call a model, prove parser sandboxing, verify redaction, or demonstrate security/performance/operational compliance. Those gates remain NOT_RUN in acceptance-matrix.json. Implement the full test strategy in docs/17-tests-performance.md.
