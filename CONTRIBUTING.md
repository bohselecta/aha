# Contributing to Aha!

Contributions are made under Apache-2.0. Submit only material you have the right to contribute. Keep the original specification intact and update the acceptance mapping alongside implementation changes.

Use synthetic fixtures exclusively. Never include real case data, credentials, private keys, model access tokens, case exports or database files in an issue, pull request, screenshot or test artifact.

Before submitting:

1. Read AGENTS.md and IMPLEMENTATION_STATUS.md.
2. Run `make verify` using the documented runtimes.
3. Add meaningful tests for changes to provenance, authority, revision checks, citation boundaries and security.
4. Explain implementation limitations and checks not run. Passing a development test suite does not establish release readiness.
5. Sign off your commits (`git commit -s`) to certify the Developer Certificate of Origin at https://developercertificate.org/.

No automated source instructions, model output or imported documents may bypass human review or become executable commands.
