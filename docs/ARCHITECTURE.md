# Architecture

## Browser layer

The browser application is framework-free ES modules. `src/app.js` owns navigation, exam state transitions, modal behavior, timers, provider calls, review rendering, and focused-practice flows. The UI reads immutable question snapshots so later bank edits do not silently change completed attempts.

## Assessment engines

- CTW is deterministic: canonical target selection, exact missing-letter scoring, and source reconstruction.
- Reading multiple choice is deterministic: exact option IDs.
- Build a Sentence is deterministic: accepted tile-ID sequences.
- Email and Discussion use task-specific holistic 0–5 practice grading only when a configured provider is available. Offline nonblank responses remain `Unscored`.

## Reading routing

The two-stage route is an explicitly uncalibrated practice prototype. It stores method metadata and never claims to reproduce ETS operational parameters, equating, or score conversion.

## Persistence

Formal attempts, records, preferences, vocabulary review, and draft state are stored in browser `localStorage`, with an in-memory fallback if persistence is unavailable. Writes are debounced and flushed on page hide/unload. History is bounded to avoid storage exhaustion.

## Server layer

`server.mjs` uses Node's built-in HTTP server and has no runtime package dependency. It serves static files and exposes health, content intelligence, item generation, and writing grading endpoints.

## Provider layer

Provider keys remain server-side. OpenAI-compatible endpoints support OpenAI, vLLM, SGLang, and compatible services. Anthropic and Gemini use their native HTTP APIs. All provider responses must be JSON and pass task-specific validators.
