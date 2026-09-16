import os
import pytest
from aha.storage.store import Registry


@pytest.fixture(autouse=True)
def no_production_data():
    if os.environ.get("AHA_DATA_ROOT") and "pytest" not in os.environ["AHA_DATA_ROOT"]:
        pytest.fail(
            "Tests reject configured production case directories. Unset AHA_DATA_ROOT."
        )


@pytest.fixture
def registry(tmp_path):
    registry = Registry(tmp_path / "synthetic-cases")
    yield registry
    registry.close()


@pytest.fixture
def store(registry):
    case = registry.create(
        dict(title="SYNTHETIC test", timezone="America/Chicago", synthetic=True),
        "test-operator",
    )
    return registry.get(case["id"])
