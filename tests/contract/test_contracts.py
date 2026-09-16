import importlib.util
import json
from pathlib import Path
from aha.domain.contracts import ROOT, validate
from scripts.demo import seed
from aha.storage.store import Registry


def test_contracts_are_preserved():
    for source, target in [
        ("schemas/contracts.schema.json", "contracts.schema.json"),
        ("api/openapi.json", "openapi.json"),
    ]:
        assert (ROOT / "Corgiverse-AHA-Specification-v1.0.0" / source).read_bytes() == (
            ROOT / "packages/contracts" / target
        ).read_bytes()


def test_generated_pydantic_case():
    spec = importlib.util.spec_from_file_location(
        "generated", ROOT / "packages/contracts/models.py"
    )
    module = importlib.util.module_from_spec(spec)
    import sys

    sys.modules["generated"] = module
    spec.loader.exec_module(module)
    fixture = json.loads((ROOT / "packages/fixtures/demo/case.json").read_text())
    case = module.Case.model_validate(fixture["case"])
    assert str(case.id) == fixture["case"]["id"]


def test_demo_persists_and_verifies(tmp_path):
    ident = seed(tmp_path / "synthetic-cases")
    registry = Registry(tmp_path / "synthetic-cases")
    try:
        store = registry.get(ident)
        assert len(store.all_records()) == 32
        assert store.verify()["failures"] == []
        for record in store.all_records():
            validate(record["kind"], record)
    finally:
        registry.close()
