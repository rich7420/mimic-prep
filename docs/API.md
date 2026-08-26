# HTTP API

Base URL in local development: `http://127.0.0.1:4173`.

## `GET /api/health`

Optional query parameters: `provider`, `model`.

Returns app/provider configuration status without exposing API keys.

## `GET /api/content/coverage`

Returns content counts, declared category coverage, hard errors, duplicate screening, and release-gate metadata.

## `GET /api/content/sources`

Returns the official public-source metadata registry and source-use policy.

## `GET /api/content/blueprints`

Returns machine-readable task and form blueprints.

## `POST /api/generate`

Example:

```json
{
  "taskType": "academic",
  "provider": "local"
}
```

Supported task types: `ctw`, `daily`, `academic`, `build`, `email`, `discussion`.

For a remote provider, include `provider`, `model` or provider-specific model fields. Candidate items must pass schema, provenance, task validation, duplicate screening, and optional verifier checks.

## `POST /api/grade`

Example:

```json
{
  "taskType": "email",
  "provider": "openai-compatible",
  "model": "your-model",
  "task": {},
  "response": "Dear ..."
}
```

Only `email` and `discussion` are accepted. Blank responses receive the explicit zero rule. Nonblank responses require a configured remote provider and use two independent raters plus adjudication on disagreement.

## Error format

```json
{
  "error": "Human-readable error message"
}
```

The server limits request bodies to 1 MB and rejects encoded path traversal.
