"""Cross-platform development and maintenance commands; never tests real case data."""

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT), str(ROOT / "services/api")]


def run(args):
    subprocess.run(args, cwd=ROOT, check=True)


def python():
    return str(
        ROOT / (".venv/Scripts/python.exe" if os.name == "nt" else ".venv/bin/python")
    )


def npm():
    return "npm.cmd" if os.name == "nt" else "npm"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command",
        choices=["bootstrap", "dev", "verify", "demo", "backup", "restore", "release"],
    )
    parser.add_argument("--case")
    parser.add_argument("--bundle")
    parser.add_argument("--root", default=str(ROOT / ".local/cases"))
    parser.add_argument("--output", default=str(ROOT / "artifacts"))
    args = parser.parse_args()
    if args.command == "bootstrap":
        if not (3, 13) <= sys.version_info[:2] < (3, 14):
            raise SystemExit("Use Python 3.13.x; this is the tested runtime.")
        node = subprocess.check_output(["node", "--version"], text=True).strip()
        if not node.startswith("v24."):
            raise SystemExit("Use Node 24.x; this is the tested runtime.")
        run(["docker", "--version"])
        if not (ROOT / ".venv").exists():
            run([sys.executable, "-m", "venv", str(ROOT / ".venv")])
        run([python(), "-m", "pip", "install", "-r", "requirements.lock"])
        run([npm(), "ci"])
        if not (ROOT / ".env").exists():
            shutil.copyfile(ROOT / ".env.example", ROOT / ".env")
        run([npm(), "run", "contracts"])
        run([npm(), "run", "build"])
        print(
            "Bootstrap complete. Model installation is separate; no model is required for manual casework."
        )
    elif args.command == "dev":
        run([python(), "scripts/dev.py"])
    elif args.command == "demo":
        from scripts.demo import seed

        print(seed(args.root))
    elif args.command == "verify":
        run([python(), "Corgiverse-AHA-Specification-v1.0.0/tests/validate_package.py"])
        run([python(), "-m", "black", "--check", "services", "scripts", "tests"])
        run([npm(), "run", "typecheck"])
        run([python(), "-m", "pytest", "--junitxml=artifacts/application-tests.xml"])
        run([npm(), "run", "build"])
        run(["npx.cmd" if os.name == "nt" else "npx", "playwright", "test"])
    elif args.command == "backup":
        if not args.case:
            parser.error("--case is required")
        from aha.storage.store import Registry
        from aha.storage.portable import backup

        registry = Registry(args.root)
        try:
            target = Path(args.output) / f"{args.case}.aha-case.zip"
            backup(registry.get(args.case), target)
            print(target)
        finally:
            registry.close()
    elif args.command == "restore":
        if not args.bundle:
            parser.error("--bundle is required")
        from aha.storage.portable import restore

        print(json.dumps(restore(args.bundle, args.root), indent=2))
    elif args.command == "release":
        evidence = json.loads((ROOT / "artifacts/acceptance-status.json").read_text())
        remaining = [x["id"] for x in evidence["gates"] if x["status"] != "PASS"]
        if remaining:
            raise SystemExit(
                "Release blocked by incomplete acceptance gates: "
                + ", ".join(remaining)
            )
        raise SystemExit(
            "Signed image release tooling has not been implemented; no release produced."
        )


if __name__ == "__main__":
    main()
