"""Frozen SQLite backups and bounded, validated restore into a fresh directory."""

import json
import os
import shutil
import sqlite3
import stat
import tempfile
import zipfile
from pathlib import Path, PurePosixPath
from uuid import uuid4
from .store import Store, canonical, digest, sync_dir
from ..domain.contracts import DomainError, validate

MAX_BUNDLE_BYTES = 2 * 1024**3


def backup(store, output):
    output = Path(output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    with store.lock, tempfile.TemporaryDirectory(dir=store.path / "staging") as temp:
        directory = Path(temp)
        verification = store.verify()
        if verification["failures"]:
            raise DomainError(
                "INTEGRITY_FAILURE",
                "Backup blocked: case integrity verification failed.",
                409,
            )
        case = store.case()
        target = sqlite3.connect(directory / "case.sqlite")
        try:
            store.db.backup(target)
        finally:
            target.close()
        paths = ["case.sqlite"]
        # Include all original and derivative versions, not only current pointers.
        records = [
            json.loads(row[0])
            for row in store.db.execute(
                "SELECT body FROM records WHERE kind IN ('Evidence','Derivative')"
            )
        ]
        for record in records:
            data = store.verified_blob(record)
            sha = record["sha256"]
            relative = (
                f"originals/sha256/{sha[:2]}/{sha}"
                if record["kind"] == "Evidence"
                else f'derivatives/{record["id"]}/{sha}'
            )
            if relative in paths:
                continue
            dest = directory / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            paths.append(relative)
        manifest = validate(
            "Manifest",
            dict(
                schema_version="1.0.0",
                case_id=case["id"],
                case_revision=case["case_revision"],
                synthetic=case["synthetic"],
                files=[
                    dict(
                        path=p,
                        bytes=(directory / p).stat().st_size,
                        sha256=digest((directory / p).read_bytes()),
                    )
                    for p in sorted(paths)
                ],
            ),
        )
        stage = output.with_name(output.name + "." + str(uuid4()) + ".tmp")
        try:
            with zipfile.ZipFile(stage, "w", compression=zipfile.ZIP_DEFLATED) as z:
                z.writestr("manifest.json", canonical(manifest))
                for path in paths:
                    z.write(directory / path, path)
            with stage.open("rb") as f:
                os.fsync(f.fileno())
            os.replace(stage, output)
            sync_dir(output.parent)
        finally:
            stage.unlink(missing_ok=True)
        return manifest


def restore(bundle, root):
    root = Path(root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".restore-", dir=root) as temp:
        target = Path(temp) / "case"
        target.mkdir()
        try:
            with zipfile.ZipFile(bundle) as z:
                infos = z.infolist()
                names = [i.filename for i in infos]
                if (
                    len(names) > 10001
                    or len(set(names)) != len(names)
                    or sum(i.file_size for i in infos) > MAX_BUNDLE_BYTES
                ):
                    raise DomainError(
                        "BUNDLE_LIMIT", "Bundle limits or duplicate paths rejected."
                    )
                for i in infos:
                    path = PurePosixPath(i.filename)
                    mode = i.external_attr >> 16
                    if (
                        i.is_dir()
                        or path.is_absolute()
                        or ".." in path.parts
                        or "\\" in i.filename
                        or ":" in i.filename
                        or str(path) != i.filename
                        or stat.S_ISLNK(mode)
                    ):
                        raise DomainError("UNSAFE_PATH", "Unsafe bundle path rejected.")
                    if (
                        i.file_size > MAX_BUNDLE_BYTES
                        or i.file_size > max(i.compress_size, 1) * 100
                    ):
                        raise DomainError(
                            "BUNDLE_LIMIT", "Archive expansion limit exceeded."
                        )
                if "manifest.json" not in names:
                    raise DomainError("MANIFEST_MISSING", "Bundle manifest is missing.")
                if z.getinfo("manifest.json").file_size > 4 * 1024**2:
                    raise DomainError("BUNDLE_LIMIT", "Manifest too large.")
                manifest = validate("Manifest", json.loads(z.read("manifest.json")))
                declared = [f["path"] for f in manifest["files"]]
                if (
                    len(set(declared)) != len(declared)
                    or set(names) != set(declared) | {"manifest.json"}
                    or "case.sqlite" not in declared
                ):
                    raise DomainError(
                        "MANIFEST_MISMATCH",
                        "Bundle contains missing or unlisted files.",
                    )
                for item in manifest["files"]:
                    p = item["path"]
                    if p != "case.sqlite" and not p.startswith(
                        ("originals/sha256/", "derivatives/")
                    ):
                        raise DomainError("UNSAFE_PATH", "Unsupported bundle member.")
                    info = z.getinfo(p)
                    if info.file_size != item["bytes"]:
                        raise DomainError("HASH_MISMATCH", "Bundle size mismatch.")
                    data = z.read(p)
                    if digest(data) != item["sha256"]:
                        raise DomainError("HASH_MISMATCH", "Bundle hash mismatch.")
                    dest = target / p
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(data)
            conn = sqlite3.connect(f'file:{target / "case.sqlite"}?mode=ro', uri=True)
            try:
                conn.execute("PRAGMA trusted_schema=OFF")
                expected = sqlite3.connect(":memory:")
                try:
                    for migration in ("001_initial.sql", "002_metadata.sql"):
                        expected.executescript(
                            Path(__file__).with_name(migration).read_text()
                        )
                    query = "SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name"
                    if (
                        conn.execute(query).fetchall()
                        != expected.execute(query).fetchall()
                    ):
                        raise DomainError(
                            "UNTRUSTED_SCHEMA",
                            "Bundle database schema does not match the supported migration.",
                        )
                finally:
                    expected.close()
                if (
                    conn.execute("PRAGMA integrity_check").fetchone()[0] != "ok"
                    or conn.execute("PRAGMA foreign_key_check").fetchall()
                ):
                    raise DomainError(
                        "DATABASE_INVALID", "Restored database failed integrity checks."
                    )
                case = conn.execute(
                    "SELECT id,case_revision,synthetic FROM case_meta"
                ).fetchone()
                if case != (
                    manifest["case_id"],
                    manifest["case_revision"],
                    int(manifest["synthetic"]),
                ):
                    raise DomainError(
                        "MANIFEST_MISMATCH", "Manifest does not match the database."
                    )
                # Reject executable schema changes before opening with the application.
                if conn.execute("PRAGMA user_version").fetchone()[0] != 1:
                    raise DomainError(
                        "UNSUPPORTED_FORMAT", "Restore requires schema version 1."
                    )
            finally:
                conn.close()
            destination = root / f'CASE-{manifest["case_id"]}'
            if destination.exists():
                raise DomainError(
                    "CASE_EXISTS", "Restore cannot overwrite an existing case.", 409
                )
            store = Store(target)
            try:
                if store.verify()["failures"]:
                    raise DomainError(
                        "INTEGRITY_FAILURE",
                        "Restored content or audit failed verification.",
                    )
                for row in store.db.execute("SELECT body FROM records"):
                    record = json.loads(row[0])
                    validate(record["kind"], record)
                    if record["case_id"] != manifest["case_id"]:
                        raise DomainError(
                            "CROSS_CASE", "Restored record belongs to another case."
                        )
            finally:
                store.close()
            os.rename(target, destination)
            sync_dir(root)
            return manifest
        except (zipfile.BadZipFile, KeyError, ValueError, sqlite3.DatabaseError) as exc:
            raise DomainError(
                "INVALID_BUNDLE", "Bundle is not a valid supported case backup."
            ) from exc
