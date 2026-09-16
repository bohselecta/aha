from fastapi.testclient import TestClient
from aha.app import create_app
from aha.domain.contracts import validate


def test_chunked_intake_is_bounded_before_file_receipt(tmp_path, monkeypatch):
    import aha.app as module

    monkeypatch.setattr(module, "MAX_UPLOAD", 1024)
    app = create_app(
        tmp_path / "synthetic-cases",
        pairing_secret="synthetic",
        allowed_origins={"http://testserver"},
    )
    with TestClient(app) as client:
        session = client.post(
            "/api/v1/session",
            json={
                "pairing_secret": "synthetic",
                "operator_label": "Synthetic reviewer",
            },
        ).json()
        headers = {"X-CSRF-Token": session["csrf_token"]}
        case = client.post(
            "/api/v1/cases",
            json={
                "title": "Synthetic bounded upload",
                "timezone": "UTC",
                "synthetic": True,
            },
            headers=headers,
        ).json()

        def chunks():
            yield b'--aha\r\nContent-Disposition: form-data; name="file"; filename="x.txt"\r\nContent-Type: text/plain\r\n\r\n'
            for _ in range(20):
                yield b"x" * 65536
            yield b"\r\n--aha--\r\n"

        response = client.post(
            f'/api/v1/cases/{case["id"]}/ingest',
            content=chunks(),
            headers={
                **headers,
                "Content-Type": "multipart/form-data; boundary=aha",
                "If-Match": '"0"',
                "Idempotency-Key": "bounded",
            },
        )
        assert response.status_code == 413
        assert response.json()["code"] == "FILE_TOO_LARGE"
        assert client.get(f'/api/v1/cases/{case["id"]}/records').json()["items"] == []


def test_security_and_http_contract(tmp_path):
    app = create_app(
        tmp_path / "synthetic-cases",
        pairing_secret="test-only",
        allowed_origins={"http://testserver"},
    )
    with TestClient(app) as client:
        assert client.get("/api/v1/cases").status_code == 401
        assert (
            client.get("/api/v1/health", headers={"Host": "evil.test"}).status_code
            == 403
        )
        assert (
            client.get(
                "/api/v1/health", headers={"Origin": "https://evil.test"}
            ).status_code
            == 403
        )
        assert (
            client.get("/api/v1/health", headers={"X-Remote-User": "admin"}).status_code
            == 403
        )
        paired = client.post(
            "/api/v1/session",
            json={"pairing_secret": "test-only", "operator_label": "Reviewer"},
        )
        validate("Session", paired.json())
        assert "HttpOnly" in paired.headers["set-cookie"]
        csrf = {"X-CSRF-Token": paired.json()["csrf_token"]}
        payload = dict(title="Synthetic", timezone="UTC", synthetic=True)
        assert client.post("/api/v1/cases", json=payload).status_code == 403
        created = client.post("/api/v1/cases", json=payload, headers=csrf)
        assert created.status_code == 201
        validate("Case", created.json())
        base = "/api/v1/cases/" + created.json()["id"]
        response = client.get(base + "/records")
        validate("Page", response.json())
        assert response.headers["etag"] == '"0"'
        command = dict(
            type="proposeRecord",
            record=dict(
                kind="Note",
                text="Synthetic <script>alert(1)</script>",
                target_refs=[],
                note_type="INVESTIGATOR_NOTE",
            ),
            reason="Review required.",
        )
        assert (
            client.post(base + "/commands", json=command, headers=csrf).status_code
            == 428
        )
        h = {**csrf, "If-Match": '"0"', "Idempotency-Key": "request"}
        proposal = client.post(base + "/commands", json=command, headers=h)
        assert proposal.status_code == 200
        validate("CommandResult", proposal.json())
        assert client.get(base + "/records").json()["items"] == []
        receipt = client.post(
            base + "/ingest",
            headers={**h, "Idempotency-Key": "upload"},
            data={"source_note": "Synthetic original"},
            files={"file": ("x.txt", b"Synthetic text", "text/plain")},
        )
        assert receipt.status_code == 202
        validate("Job", receipt.json())
        import time

        for _ in range(100):
            progress = client.get(base + "/jobs/" + receipt.json()["id"]).json()
            if progress["state"] in ("SUCCEEDED", "FAILED"):
                break
            time.sleep(0.02)
        result = client.get(receipt.json()["result_path"])
        validate("IngestSummary", result.json())
        rid = result.json()["evidence_refs"][0]["id"]
        downloaded = client.get(base + f"/evidence/{rid}/original")
        assert downloaded.content == b"Synthetic text"
        assert "attachment" in downloaded.headers["content-disposition"]
        assert (
            client.post(
                "/api/v1/integrations/casemail/envelopes", headers=csrf, json={}
            ).status_code
            == 403
        )
        assert client.delete("/api/v1/session", headers=csrf).status_code == 204
        assert client.get(base + f"/evidence/{rid}/original").status_code == 401


def test_session_resumption_and_logout_boundary(tmp_path):
    app = create_app(
        tmp_path / "synthetic-cases",
        pairing_secret="resume-test",
        allowed_origins={"http://testserver"},
    )
    with TestClient(app) as client:
        assert client.get("/api/v1/session").status_code == 401
        session = client.post(
            "/api/v1/session",
            json={"pairing_secret": "resume-test", "operator_label": "Reviewer"},
        ).json()
        resumed = client.get("/api/v1/session")
        assert resumed.status_code == 200
        assert resumed.json()["csrf_token"] == session["csrf_token"]
        assert resumed.json()["actor"] == "Reviewer"
        assert (
            client.get(
                "/api/v1/session", headers={"Origin": "https://foreign.test"}
            ).status_code
            == 403
        )
        assert client.delete("/api/v1/session").status_code == 403
        assert (
            client.delete(
                "/api/v1/session", headers={"X-CSRF-Token": session["csrf_token"]}
            ).status_code
            == 204
        )
        assert client.get("/api/v1/session").status_code == 401
