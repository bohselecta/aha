-- Reference persistence baseline. Application semantic validators are mandatory.
PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
PRAGMA synchronous=FULL;
PRAGMA user_version=1;
CREATE TABLE case_meta (
 id TEXT PRIMARY KEY, schema_version TEXT NOT NULL, case_revision INTEGER NOT NULL CHECK(case_revision>=0),
 title TEXT NOT NULL, timezone TEXT NOT NULL, synthetic INTEGER NOT NULL CHECK(synthetic IN(0,1))
);
CREATE TABLE records (
 case_id TEXT NOT NULL REFERENCES case_meta(id), id TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision>0),
 kind TEXT NOT NULL, body TEXT NOT NULL CHECK(json_valid(body)), created_case_revision INTEGER NOT NULL,
 PRIMARY KEY(case_id,id,revision),
 CHECK(json_extract(body,'$.id')=id), CHECK(json_extract(body,'$.case_id')=case_id),
 CHECK(json_extract(body,'$.revision')=revision), CHECK(json_extract(body,'$.kind')=kind)
);
CREATE TABLE current_records (
 case_id TEXT NOT NULL, id TEXT NOT NULL, revision INTEGER NOT NULL,
 PRIMARY KEY(case_id,id), FOREIGN KEY(case_id,id,revision) REFERENCES records(case_id,id,revision)
);
CREATE TABLE record_refs (
 case_id TEXT NOT NULL, source_id TEXT NOT NULL, source_revision INTEGER NOT NULL,
 target_id TEXT NOT NULL, target_revision INTEGER NOT NULL, role TEXT NOT NULL,
 PRIMARY KEY(case_id,source_id,source_revision,target_id,target_revision,role),
 FOREIGN KEY(case_id,source_id,source_revision) REFERENCES records(case_id,id,revision) DEFERRABLE INITIALLY DEFERRED,
 FOREIGN KEY(case_id,target_id,target_revision) REFERENCES records(case_id,id,revision) DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX reverse_refs ON record_refs(case_id,target_id,target_revision,role);
CREATE TABLE blobs (
 sha256 TEXT PRIMARY KEY CHECK(length(sha256)=64), relative_path TEXT NOT NULL UNIQUE,
 byte_count INTEGER NOT NULL CHECK(byte_count>=0), role TEXT NOT NULL CHECK(role IN('ORIGINAL','DERIVATIVE'))
);
CREATE TABLE proposals (
 id TEXT PRIMARY KEY, case_id TEXT NOT NULL REFERENCES case_meta(id), case_revision INTEGER NOT NULL,
 body TEXT NOT NULL CHECK(json_valid(body)), state TEXT NOT NULL CHECK(state IN('PENDING','ACCEPTED','REJECTED'))
);
CREATE TABLE audit (
 sequence INTEGER PRIMARY KEY, case_id TEXT NOT NULL REFERENCES case_meta(id), at TEXT NOT NULL,
 actor TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), previous_sha256 TEXT,
 payload_sha256 TEXT NOT NULL CHECK(length(payload_sha256)=64)
);
CREATE TABLE jobs (
 id TEXT PRIMARY KEY, case_id TEXT NOT NULL REFERENCES case_meta(id), type TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED')),
 input_json TEXT NOT NULL CHECK(json_valid(input_json)), input_sha256 TEXT NOT NULL,
 snapshot_revision INTEGER NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0,
 result_json TEXT, error_code TEXT
);
CREATE TABLE idempotency (
 actor TEXT NOT NULL, route TEXT NOT NULL, key TEXT NOT NULL, body_sha256 TEXT NOT NULL,
 response_json TEXT NOT NULL CHECK(json_valid(response_json)), expires_at TEXT NOT NULL,
 PRIMARY KEY(actor,route,key)
);
CREATE TABLE view_definitions (
 id TEXT PRIMARY KEY, view_revision INTEGER NOT NULL, body TEXT NOT NULL CHECK(json_valid(body))
);
CREATE TABLE index_generations (
 id TEXT PRIMARY KEY, case_revision INTEGER NOT NULL, active INTEGER NOT NULL CHECK(active IN(0,1))
);
CREATE UNIQUE INDEX one_active_generation ON index_generations(active) WHERE active=1;
CREATE VIRTUAL TABLE text_search USING fts5(record_id UNINDEXED, derivative_sha256 UNINDEXED, locator UNINDEXED, text);
CREATE TRIGGER records_no_update BEFORE UPDATE ON records BEGIN SELECT RAISE(ABORT,'records are append-only'); END;
CREATE TRIGGER records_no_delete BEFORE DELETE ON records BEGIN SELECT RAISE(ABORT,'records are append-only'); END;
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'audit is append-only'); END;
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'audit is append-only'); END;
-- SQLite triggers are an app guard, not protection against a privileged host administrator.
