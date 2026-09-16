"""Launch parsers without case-directory access or network permission."""

import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import tempfile
from .domain.contracts import ROOT

SUPPORTED = {
    ".txt",
    ".csv",
    ".docx",
    ".xlsx",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
}


def extract_file(source, filename, cancelled=None, *, isolated_container=False):
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED:
        return dict(error="UNSUPPORTED_FORMAT")
    if os.environ.get("AHA_PARSER_SPOOL") and not isolated_container:
        return extract_via_spool(source, suffix, cancelled)
    with tempfile.TemporaryDirectory(prefix="aha-parser-") as directory:
        work = Path(directory).resolve()
        target = work / ("input" + suffix)
        shutil.copyfile(source, target)
        target.chmod(0o400)
        script = ROOT / "services/worker/parse.py"
        command = [sys.executable, "-B", str(script), str(work), suffix]
        if sys.platform == "darwin":
            paths = [
                "/dev",
                "/System",
                "/usr",
                "/Library",
                "/opt/homebrew",
                "/private/etc",
                "/private/var/db/dyld",
                str(Path(sys.base_prefix).resolve()),
                str(Path(sys.prefix).resolve()),
                str(script.parent.resolve()),
                str(work),
            ]
            reads = (
                " ".join(f"(subpath {json.dumps(p)})" for p in paths)
                + " "
                + " ".join(
                    f"(literal {json.dumps(str(p))})"
                    for path in paths
                    for p in Path(path).parents
                )
            )
            profile = f'(version 1)(deny default)(allow process-exec process-fork process-info* sysctl-read mach-lookup file-read-metadata)(allow file-read* {reads} (literal "/dev/null") (literal "/dev/urandom"))(allow file-write* (subpath {json.dumps(str(work))}) (literal "/dev/null"))'
            command = ["/usr/bin/sandbox-exec", "-p", profile, *command]
        elif sys.platform != "linux":
            return dict(error="SANDBOX_UNAVAILABLE")
        env = {
            "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"),
            "TMPDIR": str(work),
            "PYTHONDONTWRITEBYTECODE": "1",
            "OMP_THREAD_LIMIT": "1",
            "OPENBLAS_NUM_THREADS": "1",
            "LANG": "C.UTF-8",
        }
        if isolated_container:
            env["AHA_ISOLATED_PARSER"] = "1"
        process = subprocess.Popen(
            command,
            env=env,
            cwd=work,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        try:
            import time

            deadline = time.monotonic() + 600
            while process.poll() is None:
                if cancelled is not None and cancelled.is_set():
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait()
                    return dict(error="CANCELLED")
                if time.monotonic() > deadline:
                    raise subprocess.TimeoutExpired(command, 600)
                time.sleep(0.1)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            return dict(error="PARSER_TIMEOUT")
        result = work / "result.json"
        if process.returncode or not result.is_file():
            return dict(error="SANDBOX_OR_RESOURCE_LIMIT")
        if result.stat().st_size > 64 * 1024**2:
            return dict(error="EXTRACTED_TEXT_LIMIT")
        return json.loads(result.read_text(encoding="utf-8"))


def extract_via_spool(source, suffix, cancelled):
    """One private transfer at a time; no source path is exposed to the worker."""
    import time
    from uuid import uuid4
    from threading import Lock

    with _transfer_lock:
        spool = Path(os.environ["AHA_PARSER_SPOOL"])
        heartbeat = spool / "heartbeat"
        if not heartbeat.exists() or time.time() - heartbeat.stat().st_mtime > 15:
            return dict(error="PARSER_SERVICE_UNAVAILABLE")
        work = spool / str(uuid4())
        work.mkdir(mode=0o700)
        try:
            shutil.copyfile(source, work / "source")
            (work / "request.tmp").write_text(json.dumps({"suffix": suffix}))
            (work / "request.tmp").replace(work / "request.json")
            deadline = time.monotonic() + 630
            while time.monotonic() < deadline:
                if cancelled is not None and cancelled.is_set():
                    (work / "cancel").touch()
                    return dict(error="CANCELLED")
                result = work / "result.json"
                if result.is_file():
                    if result.stat().st_size > 64 * 1024**2:
                        return dict(error="EXTRACTED_TEXT_LIMIT")
                    return json.loads(result.read_text(encoding="utf-8"))
                time.sleep(0.1)
            (work / "cancel").touch()
            return dict(error="PARSER_TIMEOUT")
        finally:
            shutil.rmtree(work, ignore_errors=True)


from threading import Lock

_transfer_lock = Lock()


def clear_interrupted_transfers():
    """Startup only, before scheduling jobs; this volume belongs to one API process."""
    from uuid import UUID

    directory = os.environ.get("AHA_PARSER_SPOOL")
    if not directory:
        return
    with _transfer_lock:
        for work in Path(directory).iterdir():
            try:
                if (
                    str(UUID(work.name)) != work.name
                    or work.is_symlink()
                    or not work.is_dir()
                ):
                    continue
            except ValueError:
                continue
            (work / "cancel").touch()
            shutil.rmtree(work)
