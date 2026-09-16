# Public site and local casework

The owner selected local casework with a public product site and explicitly synthetic demonstration on Vercel. `apps/site` is a separate static build. It imports only the six synthetic TXT fixture originals and the 32-record fictional case; it has no case API, account system, upload form, model calls, or telemetry. The Content Security Policy prohibits connections and form submissions.

The public site is deployable independently. Deployment is not acceptance of the investigative application: the existing 57 release gates and `make release` guard remain authoritative. No real case files, pairing secrets, credentials, or local databases belong in Git or a Vercel deployment.

Vercel builds from the repository root with `npm ci` and `npm run build:site`, publishing only `apps/site/dist`. No runtime environment variables are required. Local operation remains through Docker or the documented native setup.
