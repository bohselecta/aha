import base64
import json
import os
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, Request, UploadFile, File, Form, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
from .domain.contracts import DomainError, ROOT, validate
from .commands.execute import execute
from .storage.store import Registry, canonical, digest
from .storage.intake import receive
from .storage.portable import backup

MAX_UPLOAD = 250 * 1024**2


def create_app(data_root=None, pairing_secret=None, allowed_origins=None):
    root = Path(data_root or os.environ.get("AHA_DATA_ROOT", ROOT / ".local/cases"))
    origins = allowed_origins or {"http://127.0.0.1:8080", "http://localhost:8080"}
    hosts = {o.split("://")[1] for o in origins}
    registry = Registry(root)
    sessions = {}
    attempts = []
    secret = pairing_secret or secrets.token_urlsafe(24)
    secret_deadline = time.monotonic() + 600
    if pairing_secret is None:
        secret_file = root.parent / "pairing-secret"
        fd = os.open(secret_file, os.O_CREAT | os.O_TRUNC | os.O_WRONLY, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(secret + "\n")
        os.chmod(secret_file, 0o600)
        print(
            f"AHA local pairing secret: {secret_file}. Valid for ten minutes. Bind only to loopback."
        )

    @asynccontextmanager
    async def lifespan(app):
        yield
        registry.close()

    app = FastAPI(
        title="AHA local case service",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=lifespan,
    )
    app.state.registry = registry

    def error_response(exc, request_id):
        return JSONResponse(
            status_code=exc.status,
            content=validate(
                "Error",
                dict(
                    code=exc.code,
                    message=exc.message,
                    request_id=request_id,
                    field_errors=[
                        dict(path=exc.path, code=exc.code, message=exc.message)
                    ],
                    retryable=exc.status in (409, 429, 503),
                ),
            ),
        )

    @app.middleware("http")
    async def boundary(request, call_next):
        request_id = str(uuid4())
        request.state.request_id = request_id
        try:
            if request.headers.get("host") not in hosts:
                raise DomainError("HOST_DENIED", "Host is not allowed.", 403)
            if (
                request.headers.get("origin")
                and request.headers["origin"] not in origins
            ):
                raise DomainError("ORIGIN_DENIED", "Origin is not allowed.", 403)
            if request.headers.get("sec-fetch-site") == "cross-site":
                raise DomainError("ORIGIN_DENIED", "Cross-site request denied.", 403)
            if any(
                h in request.headers
                for h in (
                    "x-remote-user",
                    "x-auth-request-user",
                    "x-forwarded-user",
                    "x-aha-gateway-secret",
                )
            ):
                raise DomainError("GATEWAY_DISABLED", "LAN identity is disabled.", 403)
            path = request.url.path
            if path.startswith("/api/") and path not in (
                "/api/v1/health",
                "/api/v1/session",
            ):
                token = request.cookies.get("aha_session")
                session = sessions.get(token)
                clock = time.monotonic()
                if (
                    not session
                    or clock - session["last"] > 1800
                    or clock - session["created"] > 43200
                ):
                    sessions.pop(token, None)
                    raise DomainError(
                        "UNAUTHENTICATED",
                        "Pair this browser with the local service.",
                        401,
                    )
                session["last"] = clock
                request.state.actor = session["actor"]
                request.state.session = session
                if request.method not in ("GET", "HEAD") and not secrets.compare_digest(
                    request.headers.get("x-csrf-token", ""), session["csrf"]
                ):
                    raise DomainError(
                        "CSRF_DENIED", "A valid CSRF token is required.", 403
                    )
            response = await call_next(request)
        except DomainError as exc:
            response = error_response(exc, request_id)
        except OSError:
            response = error_response(
                DomainError(
                    "STORAGE_UNAVAILABLE",
                    "Storage unavailable. Stop writes and check free space and permissions.",
                    503,
                ),
                request_id,
            )
        response.headers.update(
            {
                "X-Request-ID": request_id,
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
                "Referrer-Policy": "no-referrer",
                "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
            }
        )
        return response

    @app.exception_handler(DomainError)
    async def domain_error(request, exc):
        return error_response(exc, request.state.request_id)

    @app.exception_handler(RequestValidationError)
    async def request_error(request, exc):
        return error_response(
            DomainError("SCHEMA_INVALID", "Request parameters are invalid."),
            request.state.request_id,
        )

    @app.exception_handler(404)
    async def missing(request, exc):
        return error_response(
            DomainError("NOT_FOUND", "Resource not found.", 404),
            request.state.request_id,
        )

    def headers(store):
        return {"ETag": f'"{store.case()["case_revision"]}"', "X-Index-Revision": "0"}

    def result(store, value, status=200):
        return JSONResponse(value, status_code=status, headers=headers(store))

    def preconditions(request):
        match = request.headers.get("if-match")
        key = request.headers.get("idempotency-key")
        if not match or not key:
            raise DomainError(
                "PRECONDITION_REQUIRED",
                "If-Match and Idempotency-Key are required.",
                428,
            )
        if (
            not match.startswith('"')
            or not match.endswith('"')
            or not match[1:-1].isdigit()
            or len(key) > 200
        ):
            raise DomainError(
                "INVALID_PRECONDITION",
                "Use a quoted case revision and a bounded idempotency key.",
                400,
            )
        return int(match[1:-1]), key

    async def body(request, kind):
        try:
            value = await request.json()
        except (ValueError, UnicodeDecodeError):
            raise DomainError("MALFORMED_JSON", "Request is not valid JSON.", 400)
        return validate(kind, value)

    @app.get("/api/v1/health")
    def health():
        return validate(
            "Health", dict(status="DEGRADED", schema_version="1.0.0", offline_mode=True)
        )

    @app.post("/api/v1/session")
    async def pair(request: Request):
        payload = await body(request, "SessionRequest")
        clock = time.monotonic()
        attempts[:] = [t for t in attempts if clock - t < 60]
        if len(attempts) >= 10:
            raise DomainError("RATE_LIMIT", "Wait before another pairing attempt.", 429)
        attempts.append(clock)
        if clock > secret_deadline or not secrets.compare_digest(
            payload["pairing_secret"], secret
        ):
            raise DomainError(
                "PAIRING_DENIED", "Pairing secret is invalid or expired.", 401
            )
        token = secrets.token_urlsafe(32)
        csrf = secrets.token_urlsafe(32)
        sessions[token] = dict(
            actor=payload["operator_label"], csrf=csrf, created=clock, last=clock
        )
        value = validate(
            "Session",
            dict(
                actor=payload["operator_label"],
                csrf_token=csrf,
                expires_at=(
                    datetime.now(timezone.utc) + timedelta(hours=12)
                ).isoformat(),
            ),
        )
        response = JSONResponse(value)
        response.set_cookie(
            "aha_session",
            token,
            httponly=True,
            samesite="strict",
            max_age=43200,
            path="/api/",
        )
        return response

    @app.delete("/api/v1/session")
    def logout(request: Request):
        session = sessions.get(request.cookies.get("aha_session"))
        if not session or not secrets.compare_digest(
            session["csrf"], request.headers.get("x-csrf-token", "")
        ):
            raise DomainError("CSRF_DENIED", "A valid CSRF token is required.", 403)
        sessions.pop(request.cookies.get("aha_session"), None)
        response = Response(status_code=204)
        response.delete_cookie("aha_session", path="/api/")
        return response

    @app.get("/api/v1/cases")
    def cases():
        return validate("CasePage", dict(items=registry.list()[:200], next_cursor=None))

    @app.post("/api/v1/cases", status_code=201)
    async def create(request: Request):
        return registry.create(await body(request, "CreateCase"), request.state.actor)

    @app.get("/api/v1/cases/{case_id}")
    def case(case_id: str):
        store = registry.get(case_id)
        return result(store, store.case())

    @app.get("/api/v1/cases/{case_id}/records")
    def records(
        case_id: str,
        kind: str | None = None,
        cursor: str | None = None,
        limit: int = Query(50, ge=1, le=200),
    ):
        store = registry.get(case_id)
        with store.lock:
            revision = store.case()["case_revision"]
            after = ""
            if cursor:
                try:
                    saved = json.loads(base64.urlsafe_b64decode(cursor))
                    after = saved["after"]
                    if saved["revision"] != revision or saved["kind"] != kind:
                        raise DomainError(
                            "STALE_PAGE", "The case changed. Restart pagination.", 409
                        )
                except (ValueError, KeyError):
                    raise DomainError(
                        "CURSOR_INVALID", "Invalid pagination cursor.", 400
                    )
            rows = [
                r
                for r in store.all_records()
                if r["id"] > after and (not kind or r["kind"] == kind)
            ]
            selected = rows[:limit]
            next_cursor = (
                base64.urlsafe_b64encode(
                    canonical(
                        dict(revision=revision, after=selected[-1]["id"], kind=kind)
                    )
                ).decode()
                if len(rows) > limit
                else None
            )
            return result(
                store,
                validate(
                    "Page",
                    dict(
                        case_revision=revision,
                        index_revision=0,
                        items=selected,
                        next_cursor=next_cursor,
                    ),
                ),
            )

    @app.get("/api/v1/cases/{case_id}/records/{record_id}")
    def record(case_id: str, record_id: str, revision: int | None = Query(None, ge=1)):
        store = registry.get(case_id)
        value = store.record(record_id, revision)
        if not value:
            raise DomainError("NOT_FOUND", "Record not found.", 404)
        return result(store, value)

    @app.post("/api/v1/cases/{case_id}/commands")
    async def command(case_id: str, request: Request):
        store = registry.get(case_id)
        expected, key = preconditions(request)
        return result(
            store,
            execute(
                store,
                await body(request, "Command"),
                request.state.actor,
                expected,
                key,
            ),
        )

    @app.get("/api/v1/cases/{case_id}/proposals")
    def proposals(
        case_id: str, limit: int = Query(50, ge=1, le=200), cursor: str | None = None
    ):
        store = registry.get(case_id)
        with store.lock:
            items = [
                json.loads(row[0])
                for row in store.db.execute(
                    "SELECT body FROM proposals WHERE id>? ORDER BY id LIMIT ?",
                    (cursor or "", limit + 1),
                )
            ]
            return result(
                store,
                dict(
                    items=items[:limit],
                    next_cursor=items[limit - 1]["id"] if len(items) > limit else None,
                ),
            )

    @app.post("/api/v1/cases/{case_id}/ingest", status_code=202)
    async def ingest(
        case_id: str,
        request: Request,
        file: UploadFile = File(),
        source_note: str = Form(min_length=1, max_length=20000),
    ):
        store = registry.get(case_id)
        expected, key = preconditions(request)
        data = await file.read(MAX_UPLOAD + 1)
        await file.close()
        if len(data) > MAX_UPLOAD:
            raise DomainError(
                "FILE_TOO_LARGE", "File exceeds the 250 MiB intake limit.", 413
            )
        return result(
            store,
            receive(
                store,
                data,
                file.filename or "unnamed",
                file.content_type or "application/octet-stream",
                request.state.actor,
                expected,
                key,
                source_note,
            ),
            202,
        )

    @app.get("/api/v1/cases/{case_id}/evidence/{record_id}/original")
    def original(case_id: str, record_id: str):
        store = registry.get(case_id)
        record = store.record(record_id)
        if not record or record["kind"] != "Evidence":
            raise DomainError("NOT_FOUND", "Original not found.", 404)
        return Response(
            store.verified_blob(record),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{record_id}.original"'
            },
        )

    @app.get("/api/v1/cases/{case_id}/derivatives/{record_id}/content")
    def derivative(case_id: str, record_id: str):
        store = registry.get(case_id)
        record = store.record(record_id)
        if not record or record["kind"] != "Derivative":
            raise DomainError("NOT_FOUND", "Derivative not found.", 404)
        return Response(
            store.verified_blob(record), media_type="text/plain; charset=utf-8"
        )

    def completed_job(store, actor, kind, value):
        ident = str(uuid4())
        job = validate(
            "Job",
            dict(
                id=ident,
                case_id=store.case()["id"],
                type=kind,
                state="SUCCEEDED",
                phase="Complete",
                fraction=1,
                result_path=f'/api/v1/cases/{store.case()["id"]}/jobs/{ident}/result',
                error=None,
                snapshot_revision=store.case()["case_revision"],
            ),
        )
        store.db.execute(
            "INSERT INTO jobs(id,case_id,type,state,input_json,input_sha256,snapshot_revision,result_json) VALUES(?,?,?,?,?,?,?,?)",
            (
                ident,
                store.case()["id"],
                kind,
                "SUCCEEDED",
                "{}",
                digest(b"{}"),
                store.case()["case_revision"],
                canonical(value).decode(),
            ),
        )
        store.db.execute(
            "INSERT INTO job_views VALUES(?,?)", (ident, canonical(job).decode())
        )
        store.audit(actor, kind, [], "Operator requested " + kind.lower() + ".")
        return job

    @app.post("/api/v1/cases/{case_id}/integrity/verify")
    def verify(case_id: str, request: Request):
        store = registry.get(case_id)
        expected, key = preconditions(request)
        with store.transaction():
            replay = store.precondition(
                request.state.actor, "verify", key, {}, expected
            )
            if replay is not None:
                return result(store, replay, 202)
            job = completed_job(store, request.state.actor, "VERIFY", store.verify())
            store.remember(request.state.actor, "verify", key, {}, job)
        return result(store, job, 202)

    @app.post("/api/v1/cases/{case_id}/backup")
    def backup_case(case_id: str, request: Request):
        store = registry.get(case_id)
        expected, key = preconditions(request)
        with store.lock:
            replay = store.precondition(
                request.state.actor, "backup", key, {}, expected
            )
            if replay is not None:
                return result(store, replay, 202)
            ident = str(uuid4())
            output = store.path / "exports" / f"{ident}.aha-case.zip"
            manifest = backup(store, output)
            artifact = validate(
                "ExportArtifact",
                dict(
                    result_type="EXPORT",
                    export_id=ident,
                    sha256=digest(output.read_bytes()),
                    bytes=output.stat().st_size,
                    case_revision=manifest["case_revision"],
                    expires_at=(
                        datetime.now(timezone.utc) + timedelta(hours=24)
                    ).isoformat(),
                ),
            )
            with store.transaction():
                job = completed_job(store, request.state.actor, "BACKUP", artifact)
                store.remember(request.state.actor, "backup", key, {}, job)
            return result(store, job, 202)

    @app.get("/api/v1/cases/{case_id}/exports/{export_id}/download")
    def download(case_id: str, export_id: str):
        store = registry.get(case_id)
        rows = store.db.execute(
            "SELECT result_json FROM jobs WHERE type='BACKUP' AND state='SUCCEEDED'"
        ).fetchall()
        artifact = next(
            (
                json.loads(r[0])
                for r in rows
                if json.loads(r[0]).get("export_id") == export_id
            ),
            None,
        )
        if not artifact or datetime.fromisoformat(
            artifact["expires_at"]
        ) < datetime.now(timezone.utc):
            raise DomainError("NOT_FOUND", "Export not found or expired.", 404)
        path = store.path / "exports" / f"{export_id}.aha-case.zip"
        if not path.is_file() or digest(path.read_bytes()) != artifact["sha256"]:
            raise DomainError(
                "INTEGRITY_FAILURE", "Export integrity verification failed.", 409
            )
        return FileResponse(
            path,
            media_type="application/zip",
            filename=f"{case_id}-{export_id}.aha-case.zip",
        )

    @app.get("/api/v1/cases/{case_id}/jobs/{job_id}")
    def job(case_id: str, job_id: str):
        store = registry.get(case_id)
        row = store.db.execute(
            "SELECT body FROM job_views WHERE id=?", (job_id,)
        ).fetchone()
        if not row:
            raise DomainError("NOT_FOUND", "Job not found.", 404)
        return result(store, json.loads(row[0]))

    @app.get("/api/v1/cases/{case_id}/jobs/{job_id}/result")
    def job_result(case_id: str, job_id: str):
        store = registry.get(case_id)
        row = store.db.execute(
            "SELECT result_json FROM jobs WHERE id=?", (job_id,)
        ).fetchone()
        if not row:
            raise DomainError("NOT_FOUND", "Job not found.", 404)
        return result(store, json.loads(row[0]))

    @app.post("/api/v1/integrations/casemail/envelopes")
    def casemail():
        raise DomainError("EXTENSION_DISABLED", "CASEMAIL is disabled.", 403)

    dist = ROOT / "apps/web/dist"
    if dist.exists():
        app.mount("/", StaticFiles(directory=dist, html=True), name="web")
    return app
