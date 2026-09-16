"""Reproducible synthetic parser checks in the actual isolated Linux runtime."""

import argparse
import json
import subprocess
import time
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]


def run(args, **kwargs):
    try:
        return subprocess.run(args, check=True, text=True, **kwargs)
    except subprocess.CalledProcessError as error:
        print(error.stdout or "")
        print(error.stderr or "")
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", default="aha:parser-check")
    parser.add_argument("--built", action="store_true")
    args = parser.parse_args()
    if not args.built:
        run(
            ["docker", "build", "-q", "-f", "deploy/Dockerfile", "-t", args.image, "."],
            cwd=ROOT,
        )
    ident = "aha-parser-test-" + uuid4().hex[:10]
    volume = ident + "-transfer"
    run(["docker", "volume", "create", volume], capture_output=True)
    common = [
        "--network",
        "none",
        "--read-only",
        "--tmpfs",
        "/tmp:rw,nosuid,nodev,size=512m",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges:true",
        "--pids-limit",
        "32",
        "--memory",
        "2g",
        "-v",
        volume + ":/spool",
    ]
    try:
        run(
            [
                "docker",
                "run",
                "-d",
                "--name",
                ident,
                *common,
                args.image,
                "python",
                "services/worker/serve.py",
            ],
            capture_output=True,
        )
        for _ in range(30):
            ready = subprocess.run(
                ["docker", "exec", ident, "test", "-f", "/spool/heartbeat"],
                capture_output=True,
            )
            if ready.returncode == 0:
                break
            time.sleep(0.2)
        assert ready.returncode == 0, "Parser did not become ready"
        # Run all backend tests against real, isolated parsers; no case volume is mounted.
        command = [
            "docker",
            "run",
            "--rm",
            *common,
            "-e",
            "AHA_DATA_ROOT=",
            "-e",
            "AHA_PARSER_SPOOL=/spool",
            "-e",
            "PYTHONPATH=/app/services/api:/app",
            "-v",
            f"{ROOT / 'tests'}:/app/tests:ro",
            "-v",
            f"{ROOT / 'Corgiverse-AHA-Specification-v1.0.0'}:/app/Corgiverse-AHA-Specification-v1.0.0:ro",
            args.image,
            "python",
            "-m",
            "pytest",
            "tests",
            "-q",
            "-p",
            "no:cacheprovider",
        ]
        result = run(command, capture_output=True)
        print(result.stdout)
        # These probes run in a fresh child, with exactly the worker syscall restrictions.
        probe = "import sys,socket,pathlib;sys.path.insert(0,'/app/services/worker');from parse import restrict_syscalls;restrict_syscalls();assert not pathlib.Path('/data/cases').exists();\ntry: socket.socket()\nexcept PermissionError: print('SOCKET_DENIED; CASE_VOLUME_ABSENT')\nelse: raise AssertionError('Network syscall permitted')"
        denied = run(
            ["docker", "exec", ident, "python", "-c", probe], capture_output=True
        )
        assert "SOCKET_DENIED; CASE_VOLUME_ABSENT" in denied.stdout
        info = json.loads(
            run(["docker", "inspect", ident], capture_output=True).stdout
        )[0]
        assert info["HostConfig"]["NetworkMode"] == "none"
        assert info["HostConfig"]["ReadonlyRootfs"]
        assert "ALL" in info["HostConfig"]["CapDrop"]
        assert info["Config"]["User"] == "10001:10001"
        report = {
            "image": info["Image"],
            "network_disabled": True,
            "no_case_volume": True,
            "non_root": True,
            "readonly_root": True,
            "socket_syscalls_denied": True,
            "tests": result.stdout.strip(),
            "limitations": "Synthetic runtime checks; not a complete hostile-file, disk-full, or independent security audit.",
        }
        (ROOT / "artifacts/parser-verification.json").write_text(
            json.dumps(report, indent=2) + "\n"
        )
    finally:
        subprocess.run(["docker", "rm", "-f", ident], capture_output=True)
        subprocess.run(["docker", "volume", "rm", volume], capture_output=True)


if __name__ == "__main__":
    main()
