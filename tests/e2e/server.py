import sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT), str(ROOT / "services/api")]
from scripts.demo import seed
from aha.app import create_app
import uvicorn

with tempfile.TemporaryDirectory(prefix="aha-pytest-") as temp:
    seed(Path(temp) / "cases")
    (ROOT / "test-results").mkdir(exist_ok=True)
    (ROOT / "test-results/e2e-root.txt").write_text(temp)
    app = create_app(
        Path(temp) / "cases",
        pairing_secret="synthetic-browser-test",
        allowed_origins={"http://127.0.0.1:8081"},
    )
    uvicorn.run(app, host="127.0.0.1", port=8081, access_log=False)
