# Project structure

```text
.
├── index.html                     Modular browser entrypoint
├── standalone.html                Single-file offline build
├── styles.css                     Shared exam and dashboard styles
├── server.mjs                     Static server and REST endpoints
├── server/
│   ├── provider.mjs               LLM provider adapters
│   ├── prompts.mjs                Generation and grading contracts
│   └── validation.mjs             Generated-item validation
├── src/
│   ├── app.js                     UI state machine and user interactions
│   ├── data.js                    Core original question bank
│   ├── reading-data.js            Reading form 1
│   ├── reading-form-02.js         Reading form 2
│   ├── focused-reading-data.js    Focused Reading bank
│   ├── supplemental-writing-data.js Additional Writing sets
│   ├── ctest.js                   Complete-the-Words engine
│   ├── reading.js                 Reading assembly, route, and scoring
│   ├── scoring.js                 Writing diagnostics and text overlap
│   ├── storage.js                 Attempts, migration, CSV/JSON, SRS
│   ├── official-sources.js        Public-source metadata registry
│   ├── blueprints.js              Six task blueprints and source policy
│   └── content-intelligence.js    Coverage and duplicate audit
├── tests/                         Node test suite
├── scripts/
│   ├── build-standalone.mjs       Produces standalone.html
│   ├── content-audit.mjs          Produces CONTENT_AUDIT.json
│   ├── e2e-smoke.py               Chromium interaction test
│   ├── release-check.mjs          Release manifest and hard gates
│   ├── start.sh                   POSIX convenience launcher
│   ├── start.ps1                  PowerShell convenience launcher
│   └── verify-clean-install.sh    Clean-extraction verification
├── qa/                            Reference screenshots and audit output
├── docs/                          Architecture, API, and deployment docs
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── package-lock.json
```

No generated `node_modules` directory is included. Recreate dependencies reproducibly with `npm ci`.
