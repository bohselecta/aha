import os
from pathlib import Path
from demo import seed
import uvicorn

if os.environ.get("AHA_SEED_DEMO") == "1":
    seed(Path(os.environ["AHA_DATA_ROOT"]))
uvicorn.run(
    "aha.app:create_app", factory=True, host="0.0.0.0", port=8080, access_log=False
)
