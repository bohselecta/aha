# Security policy

Aha! is currently pre-release. The full application acceptance and security gates have not passed; it is not supported for production casework yet. See IMPLEMENTATION_STATUS.md for the exact state.

Do not post confidential source material or exploitable secrets in public issues. If GitHub private vulnerability reporting is available for this repository, use its **Security → Report a vulnerability** flow. Otherwise, report only a non-sensitive summary and request a private disclosure channel before sharing details.

For development use, keep the service bound to loopback, restrict access to the host and case volumes, use encrypted storage, and use only synthetic material in tests. A public source repository must never contain case databases, original evidence, backups, pairing secrets or session data.

Security-critical areas include immutable original storage, record revision checks, source citation verification, parser isolation, model proposal validation, authentication/CSRF, backup restore, and export redaction. The license is not a substitute for verifying these controls.
