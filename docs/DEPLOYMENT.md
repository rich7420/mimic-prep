# Deployment

## Docker Compose

```bash
cp .env.example .env
# edit .env; set HOST=0.0.0.0 for the container

docker compose up -d --build
```

Open `http://localhost:4173`.

## Direct Node deployment

```bash
npm ci --omit=dev
HOST=0.0.0.0 PORT=4173 npm start
```

Place the service behind a TLS reverse proxy for any non-local deployment.

## Important boundary

The server does not implement user accounts, tenant isolation, database-backed cloud history, payments, or high-stakes score reporting. For public deployment, add an identity layer, authorization, abuse controls, privacy/retention policies, centralized logs, and provider-cost monitoring.
