# Security policy and current boundary

## Supported use

This release is designed for local use or a controlled pilot behind a trusted network/reverse proxy. It does not implement user accounts, multi-tenant authorization, payments, or high-stakes score reporting.

## Secrets

Provider API keys must be supplied only through server-side environment variables. Never place keys in `src/`, `index.html`, `standalone.html`, browser storage, screenshots, or committed `.env` files.

## Network exposure

The default host is `127.0.0.1`. When exposing the service publicly:

- terminate TLS at a reverse proxy;
- add authentication and authorization outside or ahead of this app;
- configure request and concurrency limits;
- monitor provider cost and failures;
- keep the app process non-root;
- pin and scan the container image.

## Reporting

Report security problems privately to the repository owner. Do not include active secrets, private user responses, or secure test content in a public issue.
