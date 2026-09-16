"""Case-local lexical index. Normalization affects matching, never quoted bytes."""

import json
import re
import unicodedata
from uuid import uuid4
from .domain.contracts import DomainError, validate
from .storage.store import canonical, ref


def normalize(text):
    return unicodedata.normalize("NFKC", text).casefold()


def index_derivative(store, derivative):
    if derivative["derivative_type"] not in ("TEXT", "OCR"):
        return
    text = store.verified_blob(derivative).decode("utf-8")
    for other in store.all_records():
        if (
            other["kind"] == "Derivative"
            and other["evidence"]["id"] == derivative["evidence"]["id"]
        ):
            store.db.execute(
                "DELETE FROM text_search WHERE record_id=?", (other["id"],)
            )
    for start in range(0, len(text), 2800):
        end = min(start + 3200, len(text))
        store.db.execute(
            "INSERT INTO text_search VALUES(?,?,?,?)",
            (
                derivative["id"],
                derivative["sha256"],
                json.dumps(dict(type="text", start=start, end=end)),
                normalize(text[start:end]),
            ),
        )


def mark_index_revision(store):
    store.db.execute("UPDATE index_generations SET active=0 WHERE active=1")
    store.db.execute(
        "INSERT INTO index_generations VALUES(?,?,1)",
        (str(uuid4()), store.case()["case_revision"]),
    )


def rebuild(store):
    store.require_healthy()
    with store.transaction():
        store.db.execute("DELETE FROM text_search")
        for r in sorted(
            store.all_records(),
            key=lambda r: (r["introduced_case_revision"], r["created_at"], r["id"]),
        ):
            if r["kind"] == "Derivative":
                index_derivative(store, r)
        mark_index_revision(store)


def coverage(store):
    rows = store.all_records()
    sources = [r for r in rows if r["kind"] == "Evidence"]
    text = [
        r
        for r in rows
        if r["kind"] == "Derivative" and r["derivative_type"] in ("TEXT", "OCR")
    ]
    indexed = {
        r[0] for r in store.db.execute("SELECT DISTINCT record_id FROM text_search")
    }
    active = store.db.execute(
        "SELECT case_revision FROM index_generations WHERE active=1"
    ).fetchone()
    return dict(
        source_count=len(sources),
        text_source_count=len({r["evidence"]["id"] for r in text}),
        indexed_source_count=len(
            {r["evidence"]["id"] for r in text if r["id"] in indexed}
        ),
        index_revision=active[0] if active else 0,
        case_revision=store.case()["case_revision"],
    )


def search_sources(store, query, offset=0, limit=50):
    tokens = re.findall(r"\w+", normalize(query), re.UNICODE)
    if len(query) > 2000 or len(tokens) > 50:
        raise DomainError("QUERY_LIMIT", "Use a shorter search, with at most 50 words.")
    if not tokens:
        return dict(hits=[], has_more=False, coverage=coverage(store))
    match = " AND ".join('"' + word.replace('"', '""') + '"' for word in tokens)
    with store.lock:
        rows = store.db.execute(
            "SELECT record_id,derivative_sha256,locator FROM text_search WHERE text_search MATCH ? ORDER BY rank,record_id,locator LIMIT ? OFFSET ?",
            (match, limit + 1, offset),
        ).fetchall()
        hits = []
        for row in rows[:limit]:
            derivative = store.record(row[0])
            if not derivative or derivative["sha256"] != row[1]:
                continue
            evidence = store.record(
                derivative["evidence"]["id"], derivative["evidence"]["revision"]
            )
            store.verified_path(evidence)
            text = store.verified_blob(derivative).decode("utf-8")
            locator = json.loads(row[2])
            quote = text[locator["start"] : locator["end"]]
            citation = validate(
                "Citation",
                dict(
                    evidence=ref(evidence),
                    evidence_sha256=evidence["sha256"],
                    derivative=ref(derivative),
                    derivative_sha256=derivative["sha256"],
                    locator=locator,
                    quote=quote,
                ),
            )
            hits.append(dict(source=evidence, citation=citation))
        return dict(hits=hits, has_more=len(rows) > limit, coverage=coverage(store))
