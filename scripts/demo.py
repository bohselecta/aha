import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services/api"))
from aha.storage.store import Registry, Store
from aha.domain.contracts import validate
from aha.domain.semantics import semantic


def seed(root):
    fixture = json.loads((ROOT / "packages/fixtures/demo/case.json").read_text())
    validate("CaseExchange", fixture)
    registry = Registry(root)
    case = fixture["case"]
    path = registry.root / f'CASE-{case["id"]}'
    if path.exists():
        registry.close()
        return case["id"]
    store = Store(path, case)
    try:
        with store.transaction():
            for record in fixture["records"]:
                if record["kind"] == "Evidence":
                    data = (
                        ROOT
                        / "packages/fixtures/demo/originals"
                        / record["original_filename"]
                    ).read_bytes()
                    sha, relative = store.write_blob(data)
                    assert sha == record["sha256"]
                    store.db.execute(
                        "INSERT OR IGNORE INTO blobs VALUES(?,?,?,?)",
                        (sha, relative, len(data), "ORIGINAL"),
                    )
                if record["kind"] == "Derivative":
                    evidence = next(
                        r
                        for r in fixture["records"]
                        if r["id"] == record["evidence"]["id"]
                    )
                    data = (
                        ROOT
                        / "packages/fixtures/demo/originals"
                        / evidence["original_filename"]
                    ).read_bytes()
                    store.write_blob(data, "DERIVATIVE", record["id"])
                store.put(record)
            for record in fixture["records"]:
                semantic(record, store)
            store.audit(
                "synthetic-fixture-author",
                "seedSyntheticDemo",
                [],
                "Imported specification fixture. All people, sources and events are fictional.",
            )
        assert not store.verify()["failures"]
    finally:
        store.close()
        registry.close()
    return case["id"]


if __name__ == "__main__":
    print(seed(ROOT / ".local/cases"))
