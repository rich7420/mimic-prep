# Start here

This archive contains the complete runnable source code, not only the standalone HTML build.

## Fastest local start

```bash
npm ci
npm start
```

Open `http://127.0.0.1:4173`.

The default bundled item bank works without an LLM. To use a remote model:

```bash
cp .env.example .env
# edit .env
npm run start:env
```

## Standalone/offline mode

Open `standalone.html` directly in a browser. Remote generation and rubric grading require the Node server.

## Main code locations

- `src/app.js`: application UI and exam flows
- `src/data.js`: CTW, Build, Email, Discussion, and vocabulary banks
- `src/reading-data.js`: Reading form 1
- `src/reading-form-02.js`: Reading form 2
- `src/reading.js`: routing and Reading scoring helpers
- `src/storage.js`: local persistence, migration, export, and review scheduling
- `src/content-intelligence.js`: source, coverage, duplicate, and release checks
- `server.mjs`: static server and REST API
- `server/provider.mjs`: OpenAI-compatible, Anthropic, and Gemini adapters
- `server/validation.mjs`: generated-item hard validators
- `tests/`: unit, contract, storage, API, and UI-contract tests

Read `docs/PROJECT_STRUCTURE.md` for the full map.
