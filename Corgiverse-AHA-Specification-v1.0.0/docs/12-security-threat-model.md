# Security and privacy boundaries
Assets: originals, identifying information, source statements, hypotheses, model inputs, credentials, audit history and exports. Trust boundaries: operator browser → API; untrusted files → sandbox; accepted records → model context; local service → optional remote provider; app → gateway; case → portable export. Case content is confidential by default, including synthetic-looking filenames in real cases.

| Threat | Required mitigation | Verification / remaining boundary |
|---|---|---|
| Malicious document/parser exploit | Bounded isolated parser, no egress, non-root, no macros/external fetch | Adversarial fixtures and sandbox escape review; patch parsers |
| Prompt injection | Sources remain data; no tools/writes; validated references and human review | Injection suite; free-text semantic checks remain imperfect |
| Browser XSS from source text | Escape text, sanitize allowed markup, strict CSP, no inline source HTML | Script-bearing PDF/text/metadata fixtures |
| CSRF/DNS rebinding/local cross-origin access | Session+CSRF, strict Origin/Host allowlists, loopback bind | Foreign Host/Origin rejected |
| LAN identity spoof/cross-case leak | Trusted gateway channel, strip headers, per-request case authorization | Forged header and wrong-case requests denied |
| Path traversal/zip bomb | Normalize paths, reject links, limits before expansion | Hostile ZIP suite, no writes outside staging |
| SSRF/provider URL abuse | Admin-only endpoint configuration, exact allowlist, no model URL fetch | Private metadata endpoints and redirects denied unless explicitly configured local runner |
| Silent evidence alteration | Content addressing, hashes, read-only original handling, versioning, integrity checks | Tamper fixture alerts; privileged host can rewrite all storage |
| Data egress/telemetry | Offline defaults, no remote assets, explicit cloud scope, server egress controls | Packet capture without external attempts |
| Resource exhaustion | Upload/parser/token/graph limits, queue cancellation and quotas | Large malformed input tests; service remains responsive |
| Backup/export disclosure | Explicit selection, redaction preview, secure download/session, no public links | Leak scan of text/metadata/assets; copied exports outside app control |
| Dependency compromise | Lockfiles, SBOM, signature verification, license/vulnerability review | Reproducible release pipeline and documented exceptions |
| Misleading AI authority | Proposal boundary, separate synthetic layer, no guilt fields, source explanation | Human factors tests plus misuse evaluation |
| Insider misuse | Attributable reviews, export audit, minimal access, agency policy hooks | Does not defeat authorized insider or compromised OS |

Default bind and no-cloud policy are enforced configuration, not prose. Session idle timeout 30 minutes, absolute 12 hours; local setup can choose a documented alternative. Secrets never appear in URLs, logs, case bundles or client build. Downloads require authorization; no filesystem browsing endpoint. Source viewer uses sandboxed derivatives. CSP defaults to same-origin assets, disallows object/embed, and permits only necessary local blob rendering.

At-rest encryption is supplied by an encrypted host volume; app does not claim SQLite encryption by default. Document how to confirm encryption and protect backups. Logs contain request IDs, status and record IDs, not names, excerpts, queries or prompts unless a protected diagnostic mode is explicitly enabled. Purge diagnostics after seven days by default. Ingest and evidence audit records follow case retention and are not log-rotated away.

No claim of CJIS, classified-system, courtroom or jurisdictional compliance. Agency review may impose additional controls. The application must ship safe workstation defaults and a secure LAN boundary even though full enterprise identity infrastructure is deferred. Public/victim PATTERNLINE intake, consent tracking and cross-case matching require separate future threat modeling; no public intake endpoint in v1.
