"""Single-writer case store. Originals and accepted versions are append-only."""

import hashlib
import json
import os
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from uuid import uuid4, UUID
import rfc8785
from ..domain.contracts import DomainError, validate, refs


def now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return rfc8785.dumps(value)


def ref(record):
    return {"id": record["id"], "revision": record["revision"]}


def sync_dir(path):
    if os.name != "nt":
        fd = os.open(path, os.O_RDONLY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)


class Store:
    def __init__(self, path, new_case=None, fault=None):
        self.path = Path(path)
        self.path.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.lock = threading.RLock()
        self.fault = fault or (lambda point: None)
        self.lock_file = (self.path / ".writer.lock").open("a+b")
        try:
            if os.name == "nt":
                import msvcrt

                self.lock_file.write(b"0")
                self.lock_file.flush()
                self.lock_file.seek(0)
                msvcrt.locking(self.lock_file.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl

                fcntl.flock(self.lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            self.lock_file.close()
            raise DomainError("WRITER_LOCKED", "This case already has a writer.", 409)
        self.db = sqlite3.connect(
            self.path / "case.sqlite", check_same_thread=False, isolation_level=None
        )
        self.db.row_factory = sqlite3.Row
        for pragma in (
            "foreign_keys=ON",
            "journal_mode=WAL",
            "synchronous=FULL",
            "busy_timeout=5000",
        ):
            self.db.execute(f"PRAGMA {pragma}")
        if new_case:
            self.db.executescript(
                Path(__file__).with_name("001_initial.sql").read_text()
            )
            self.db.executescript(
                Path(__file__).with_name("002_metadata.sql").read_text()
            )
            self.db.execute(
                "INSERT INTO case_meta VALUES(?,?,?,?,?,?)",
                (
                    new_case["id"],
                    "1.0.0",
                    new_case["case_revision"],
                    new_case["title"],
                    new_case["timezone"],
                    int(new_case["synthetic"]),
                ),
            )
            self.db.execute(
                "INSERT INTO metadata VALUES(?,?)",
                ("created_at", new_case["created_at"]),
            )
        self.inspection_only = self.db.execute("PRAGMA user_version").fetchone()[0] != 1
        for name in (
            "originals/sha256",
            "derivatives",
            "staging",
            "exports",
            "manifests/snapshots",
            "runs",
            "indexes",
        ):
            (self.path / name).mkdir(parents=True, exist_ok=True)
        self.mirror_audit()

    def close(self):
        self.db.close()
        self.lock_file.close()

    def case(self):
        with self.lock:
            c = dict(self.db.execute("SELECT * FROM case_meta").fetchone())
            c["synthetic"] = bool(c["synthetic"])
            c["created_at"] = self.db.execute(
                "SELECT value FROM metadata WHERE key='created_at'"
            ).fetchone()[0]
            return validate("Case", c)

    @contextmanager
    def transaction(self):
        with self.lock:
            if self.inspection_only:
                raise DomainError("NEWER_FORMAT", "This case is inspection-only.", 403)
            self.db.execute("BEGIN IMMEDIATE")
            try:
                yield
                self.fault("before_db_commit")
                self.db.execute("COMMIT")
                self.fault("after_db_commit")
            except BaseException:
                if self.db.in_transaction:
                    self.db.execute("ROLLBACK")
                raise
            finally:
                if not self.db.in_transaction:
                    self.mirror_audit()

    def record(self, ident, revision=None):
        with self.lock:
            if revision is None:
                row = self.db.execute(
                    "SELECT r.body FROM records r JOIN current_records c USING(case_id,id,revision) WHERE r.id=?",
                    (ident,),
                ).fetchone()
            else:
                row = self.db.execute(
                    "SELECT body FROM records WHERE id=? AND revision=?",
                    (ident, revision),
                ).fetchone()
            return json.loads(row[0]) if row else None

    def all_records(self):
        with self.lock:
            return [
                json.loads(r[0])
                for r in self.db.execute(
                    "SELECT r.body FROM records r JOIN current_records c USING(case_id,id,revision) ORDER BY r.id"
                )
            ]

    def base(self, kind, actor, revision=None):
        return dict(
            id=str(uuid4()),
            case_id=self.case()["id"],
            revision=1,
            introduced_case_revision=(
                revision if revision is not None else self.case()["case_revision"] + 1
            ),
            created_at=now(),
            created_by=actor,
            kind=kind,
        )

    def put(self, record):
        validate(record["kind"], record)
        if record["case_id"] != self.case()["id"]:
            raise DomainError("CROSS_CASE", "Record belongs to another case.")
        current = self.record(record["id"])
        if current and (
            current["kind"] != record["kind"]
            or record["revision"] != current["revision"] + 1
        ):
            raise DomainError(
                "VERSION_CONFLICT", "Record identity or revision does not match.", 409
            )
        self.db.execute(
            "INSERT INTO records VALUES(?,?,?,?,?,?)",
            (
                record["case_id"],
                record["id"],
                record["revision"],
                record["kind"],
                canonical(record).decode(),
                record["introduced_case_revision"],
            ),
        )
        self.db.execute(
            "INSERT INTO current_records VALUES(?,?,?) ON CONFLICT(case_id,id) DO UPDATE SET revision=excluded.revision",
            (record["case_id"], record["id"], record["revision"]),
        )
        for role, target in refs(record):
            self.db.execute(
                "INSERT INTO record_refs VALUES(?,?,?,?,?,?)",
                (
                    record["case_id"],
                    record["id"],
                    record["revision"],
                    target["id"],
                    target["revision"],
                    role,
                ),
            )

    def bump(self):
        self.db.execute("UPDATE case_meta SET case_revision=case_revision+1")
        return self.case()["case_revision"]

    def audit(self, actor, action, targets, reason):
        row = self.db.execute(
            "SELECT sequence,payload_sha256 FROM audit ORDER BY sequence DESC LIMIT 1"
        ).fetchone()
        event = dict(
            case_id=self.case()["id"],
            sequence=row[0] + 1 if row else 1,
            at=now(),
            actor=actor,
            action=action,
            target_refs=targets,
            reason=reason,
            previous_sha256=row[1] if row else None,
        )
        event["payload_sha256"] = digest(canonical(event))
        validate("AuditEvent", event)
        self.db.execute(
            "INSERT INTO audit VALUES(?,?,?,?,?,?,?)",
            (
                event["sequence"],
                event["case_id"],
                event["at"],
                actor,
                canonical(event).decode(),
                event["previous_sha256"],
                event["payload_sha256"],
            ),
        )
        return event["sequence"]

    def mirror_audit(self):
        with self.lock:
            temp = self.path / "staging-audit.jsonl"
            with temp.open("wb") as out:
                for row in self.db.execute(
                    "SELECT payload FROM audit ORDER BY sequence"
                ):
                    out.write(row[0].encode() + b"\n")
                out.flush()
                os.fsync(out.fileno())
            os.replace(temp, self.path / "audit.jsonl")
            sync_dir(self.path)

    def remember(self, actor, route, key, body, response):
        self.db.execute(
            "INSERT OR REPLACE INTO idempotency VALUES(?,?,?,?,?,?)",
            (
                actor,
                route,
                key,
                digest(canonical(body)),
                canonical(response).decode(),
                (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            ),
        )

    def precondition(self, actor, route, key, body, expected):
        if not key or expected is None:
            raise DomainError(
                "PRECONDITION_REQUIRED",
                "If-Match and Idempotency-Key are required.",
                428,
            )
        row = self.db.execute(
            "SELECT * FROM idempotency WHERE actor=? AND route=? AND key=?",
            (actor, route, key),
        ).fetchone()
        if row and datetime.fromisoformat(row["expires_at"]) > datetime.now(
            timezone.utc
        ):
            if row["body_sha256"] != digest(canonical(body)):
                raise DomainError(
                    "IDEMPOTENCY_CONFLICT",
                    "Key already used with different content.",
                    409,
                )
            return json.loads(row["response_json"])
        if expected != self.case()["case_revision"]:
            raise DomainError(
                "STALE_REVISION",
                f"Current case revision is {self.case()['case_revision']}.",
                409,
            )
        return None

    def write_blob(self, data, role="ORIGINAL", derivative_id=None):
        sha = digest(data)
        relative = (
            f"originals/sha256/{sha[:2]}/{sha}"
            if role == "ORIGINAL"
            else f"derivatives/{derivative_id}/{sha}"
        )
        dest = self.path / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        stage = self.path / "staging" / str(uuid4())
        with stage.open("xb") as out:
            out.write(data)
            out.flush()
            os.fsync(out.fileno())
        self.fault("after_file_fsync")
        if dest.exists():
            if dest.is_symlink() or digest(dest.read_bytes()) != sha:
                stage.unlink()
                raise DomainError(
                    "INTEGRITY_FAILURE", "Stored content failed verification.", 409
                )
            stage.unlink()
        else:
            # Exclusive hard-link publication prevents accidental replacement.
            os.link(stage, dest)
            stage.unlink()
            dest.chmod(0o400)
            sync_dir(dest.parent)
        self.fault("after_blob_publish")
        return sha, relative

    def verified_blob(self, record):
        sha = record["sha256"]
        path = self.path / (
            f"originals/sha256/{sha[:2]}/{sha}"
            if record["kind"] == "Evidence"
            else f"derivatives/{record['id']}/{sha}"
        )
        if path.is_symlink() or not path.is_file():
            raise DomainError(
                "INTEGRITY_FAILURE", "Stored content is missing or unsafe.", 409
            )
        data = path.read_bytes()
        if digest(data) != sha or len(data) != record["bytes"]:
            raise DomainError(
                "INTEGRITY_FAILURE",
                "Stored bytes no longer match the accepted hash.",
                409,
            )
        return data

    def verify(self):
        failures = []
        count = 0
        previous = None
        for record in self.all_records():
            if record["kind"] in ("Evidence", "Derivative"):
                count += 1
                try:
                    self.verified_blob(record)
                except DomainError:
                    failures.append(f"INTEGRITY_FAILURE:{record['id']}")
        for row in self.db.execute("SELECT payload FROM audit ORDER BY sequence"):
            event = json.loads(row[0])
            sha = event.pop("payload_sha256")
            count += 1
            if digest(canonical(event)) != sha or event["previous_sha256"] != previous:
                failures.append(f"AUDIT_FAILURE:{event['sequence']}")
            previous = sha
        known = {row[0] for row in self.db.execute("SELECT relative_path FROM blobs")}
        orphaned = [
            str(p.relative_to(self.path))
            for p in (self.path / "originals").rglob("*")
            if p.is_file() and str(p.relative_to(self.path)) not in known
        ]
        return validate(
            "VerificationResult",
            dict(
                result_type="VERIFY",
                case_revision=self.case()["case_revision"],
                checked_count=count,
                failures=failures,
                warnings=(
                    [
                        f"{len(orphaned)} unreferenced original objects retained for reconciliation."
                    ]
                    if orphaned
                    else []
                ),
            ),
        )


class Registry:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.stores = {}
        self.lock = threading.RLock()

    def get(self, ident):
        try:
            ident = str(UUID(ident))
        except ValueError:
            raise DomainError("NOT_FOUND", "Case not found.", 404)
        with self.lock:
            if ident not in self.stores:
                path = self.root / f"CASE-{ident}"
                if not (path / "case.sqlite").is_file():
                    raise DomainError("NOT_FOUND", "Case not found.", 404)
                self.stores[ident] = Store(path)
            return self.stores[ident]

    def create(self, request, actor):
        from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

        validate("CreateCase", request)
        try:
            ZoneInfo(request["timezone"])
        except ZoneInfoNotFoundError:
            raise DomainError("UNKNOWN_TIMEZONE", "Choose an IANA timezone.")
        case = {
            **request,
            "id": str(uuid4()),
            "schema_version": "1.0.0",
            "case_revision": 0,
            "created_at": now(),
        }
        store = Store(self.root / f"CASE-{case['id']}", case)
        with store.transaction():
            store.audit(actor, "createCase", [], "Created local case.")
        self.stores[case["id"]] = store
        return case

    def list(self):
        return [
            self.get(p.name[5:]).case()
            for p in sorted(self.root.glob("CASE-*"))
            if (p / "case.sqlite").exists()
        ]

    def close(self):
        for store in self.stores.values():
            store.close()
        self.stores.clear()
