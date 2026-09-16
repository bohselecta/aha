"""Single-job file transfer for the isolated Compose parser service.

The service has network_mode:none, a private PID namespace, no case volume,
read-only root, no capabilities, and one bounded scratch volume. Requests never
contain host paths or commands. The API serializes all transfers.
"""

import json
import os
from pathlib import Path
import threading
import time
from aha.parsing import extract_file, SUPPORTED


def main():
    spool = Path("/spool")
    if any(
        p.parent.name != "lo" and int(p.read_text().strip(), 16) & 1
        for p in Path("/sys/class/net").glob("*/flags")
    ):
        raise RuntimeError("Parser service requires network_mode: none")
    stopping = threading.Event()

    def heartbeat():
        while not stopping.wait(1):
            (spool / "heartbeat").touch()

    threading.Thread(target=heartbeat, daemon=True).start()
    (spool / "heartbeat").touch()
    while True:
        for work in sorted(spool.iterdir()):
            if (
                not work.is_dir()
                or not (work / "request.json").is_file()
                or (work / "result.json").exists()
            ):
                continue
            cancelled = threading.Event()
            finished = threading.Event()

            def watch():
                while not finished.wait(0.1):
                    if not work.exists() or (work / "cancel").exists():
                        cancelled.set()
                        return

            monitor = threading.Thread(target=watch, daemon=True)
            monitor.start()
            try:
                if (work / "request.json").stat().st_size > 1024:
                    continue
                suffix = json.loads((work / "request.json").read_text())["suffix"]
                if (
                    suffix not in SUPPORTED
                    or (work / "source").stat().st_size > 250 * 1024**2
                ):
                    result = {"error": "UNSUPPORTED_FORMAT"}
                else:
                    result = extract_file(
                        work / "source",
                        "input" + suffix,
                        cancelled,
                        isolated_container=True,
                    )
                if work.exists() and not cancelled.is_set():
                    (work / "result.tmp").write_text(
                        json.dumps(result, ensure_ascii=False), encoding="utf-8"
                    )
                    (work / "result.tmp").replace(work / "result.json")
            except (OSError, ValueError, KeyError):
                pass  # API timeout/cancellation retains the original; never log input.
            finally:
                finished.set()
                monitor.join(timeout=1)
        time.sleep(0.1)


if __name__ == "__main__":
    main()
