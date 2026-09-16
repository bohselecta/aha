"""Verify a running development compose stack using synthetic data only."""

import json
import subprocess
from pathlib import Path
import httpx

ROOT = Path(__file__).resolve().parents[1]
secret = subprocess.check_output(
    ["docker", "compose", "exec", "-T", "app", "cat", "/data/pairing-secret"],
    cwd=ROOT,
    text=True,
).strip()
with httpx.Client(base_url="http://127.0.0.1:8080", timeout=10) as client:
    assert client.get("/api/v1/health").status_code == 200
    assert (
        client.get("/brand/aha-logo.png").content
        == (ROOT / "apps/web/public/brand/aha-logo.png").read_bytes()
    )
    assert client.get("/api/v1/cases").status_code == 401
    paired = client.post(
        "/api/v1/session",
        json={
            "pairing_secret": secret,
            "operator_label": "Synthetic container verifier",
        },
    )
    assert paired.status_code == 200
    csrf = paired.json()["csrf_token"]
    cases = client.get("/api/v1/cases").json()["items"]
    assert all(c["synthetic"] for c in cases)
    assert cases
    records = client.get(f'/api/v1/cases/{cases[0]["id"]}/records?limit=200').json()[
        "items"
    ]
    assert len(records) == 32
    assert (
        client.get("/api/v1/health", headers={"Host": "foreign.test"}).status_code
        == 403
    )
    assert (
        client.delete("/api/v1/session", headers={"X-CSRF-Token": csrf}).status_code
        == 204
    )
info = json.loads(
    subprocess.check_output(
        ["docker", "inspect", "corgiverse-aha-development-app-1"], text=True
    )
)[0]
assert info["Config"]["User"] == "10001:10001"
assert info["HostConfig"]["ReadonlyRootfs"]
assert "ALL" in info["HostConfig"]["CapDrop"]
report = {
    "image_id": info["Image"],
    "architecture": subprocess.check_output(
        [
            "docker",
            "image",
            "inspect",
            "corgiverse-aha:development",
            "--format",
            "{{.Architecture}}",
        ],
        text=True,
    ).strip(),
    "health": info["State"]["Health"]["Status"],
    "non_root": True,
    "read_only_root": True,
    "capabilities_dropped": True,
    "pairing_and_case_read": "PASS",
    "unauthenticated_and_foreign_host": "PASS",
    "synthetic_record_count": len(records),
    "note": "Development stack verification; not signed release or packet-capture certification.",
}
(ROOT / "artifacts/container-verification.json").write_text(
    json.dumps(report, indent=2) + "\n"
)
print(json.dumps(report, indent=2))
