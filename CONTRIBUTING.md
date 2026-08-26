# Contributing

This repository separates software correctness from assessment-content quality.

## Before opening a change

1. Do not submit leaked, recalled-live, operational, TPO, or copied commercial questions.
2. New items must declare provenance and pass the task-specific deterministic validator.
3. Do not claim official score equivalence, calibrated adaptive routing, or ETS endorsement.
4. Preserve exam-mode behavior: no feedback before submission, irreversible Reading module boundary, and no spell-check assistance in Writing.

## Development checks

```bash
npm ci
npm test
npm run content:audit
npm run build
```

For browser E2E checks:

```bash
python -m pip install -r requirements-e2e.txt
python -m playwright install chromium
npm run test:e2e
```

## Pull-request expectations

- explain the user-facing change;
- add or update tests;
- include content-audit implications for item-bank changes;
- document any new environment variable or API field;
- avoid committing secrets, `.env`, `node_modules`, or copied official questions.
