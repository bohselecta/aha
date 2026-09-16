"""Authoritative closed-schema boundary. No source/model content is executable."""

import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[4]
SCHEMA = json.loads((ROOT / "packages/contracts/contracts.schema.json").read_text())


class DomainError(Exception):
    def __init__(self, code, message, status=422, path="/"):
        self.code, self.message, self.status, self.path = code, message, status, path
        super().__init__(message)


def validate(kind, value):
    validator = Draft202012Validator(
        {"$ref": f"#/$defs/{kind}", "$defs": SCHEMA["$defs"]},
        format_checker=FormatChecker(),
    )
    error = next(validator.iter_errors(value), None)
    if error:
        # Never echo untrusted source or credential values into generic errors.
        path = "/" + "/".join(map(str, error.absolute_path))
        raise DomainError(
            "SCHEMA_INVALID",
            f"Value does not satisfy {kind}: {error.validator}.",
            path=path,
        )
    return value


def refs(value, path=""):
    if isinstance(value, dict):
        if set(value) == {"id", "revision"}:
            yield path, value
        else:
            for key, item in value.items():
                yield from refs(item, f"{path}/{key}")
    elif isinstance(value, list):
        for i, item in enumerate(value):
            yield from refs(item, f"{path}/{i}")
