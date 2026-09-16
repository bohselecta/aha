import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "services/api"))
from dotenv import load_dotenv

load_dotenv(ROOT / ".env")
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "aha.app:create_app",
        factory=True,
        host="127.0.0.1",
        port=8080,
        access_log=False,
    )
