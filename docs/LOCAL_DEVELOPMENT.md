# Local development

## Requirements

- Node.js 20 or newer
- npm 10 or newer recommended
- Python 3.10+ and Playwright only for optional browser E2E tests

## Install and run

```bash
npm ci
npm run dev
```

`npm run dev` uses Node watch mode. The app listens on `127.0.0.1:4173` unless overridden.

## Provider configuration

Copy `.env.example` to `.env`, fill only the provider being used, then run:

```bash
npm run start:env
```

For vLLM or SGLang, use `LLM_PROVIDER=openai-compatible`, point `OPENAI_BASE_URL` to the local `/v1` endpoint, and set the served model name.

## Tests

```bash
npm test
npm run content:audit
npm run build
```

Optional E2E:

```bash
python -m pip install -r requirements-e2e.txt
python -m playwright install chromium
npm run test:e2e
```

Set `CHROMIUM_EXECUTABLE=/path/to/chromium` to use a system browser, or omit it to use Playwright's browser.
