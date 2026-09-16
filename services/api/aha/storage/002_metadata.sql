CREATE TABLE metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
                CREATE TABLE proposal_targets(id TEXT PRIMARY KEY, target TEXT);
                CREATE TABLE job_views(id TEXT PRIMARY KEY, body TEXT NOT NULL);
                CREATE TABLE source_exclusions(id TEXT PRIMARY KEY, excluded INTEGER NOT NULL);
