# TOEFL 2026 Practice Lab v6.0.0

An unofficial, research-grounded Reading and Writing practice platform for the TOEFL iBT format introduced in January 2026.

v6.0.0 combines two original full Reading forms, the complete updated Writing sequence, focused Reading practice, persistent attempts, provider-neutral generation and grading, and a new **Content Intelligence** layer that audits source provenance, task blueprints, editorial coverage, duplicate risk, and release readiness.

All bundled questions are original practice material. The repository does **not** contain leaked, recalled operational, secure, TPO, or copied official questions. It does not claim to reproduce ETS proprietary item calibration, adaptive routing, equating, automated scoring, or official 1–6 section scores.

## What changed in v6

- two complete original Reading forms instead of one;
- official-source metadata registry with 15 ETS/ETS Research references;
- explicit task blueprints for all six implemented task types;
- deterministic content audit and downloadable Coverage Matrix;
- all 14 public Daily Life format families represented across the bank;
- all six Academic domain families represented;
- all 15 editorial Build grammar families represented;
- focused Daily Life and Academic Passage practice modes;
- generation and validation support for CTW, Daily, Academic, Build, Email, and Discussion;
- provenance gates that reject leaked, recalled-live, operational, and unknown-copy sources;
- 73 unit/contract/API tests plus full Chromium E2E coverage;
- a release gate that detects missing/empty deliverables and writes a hash manifest.

## Product modes

### Mock Test

A restrained, English-only examination shell with no answer feedback before submission.

**Reading**

- two selectable original forms;
- Module 1/router: 35 presented, 20 practice-scored, 15 hidden research items, 21 minutes;
- Module 2: 15 practice-scored, 9 minutes;
- Complete the Words, Read in Daily Life, and Read an Academic Passage;
- Back/Next within the current module;
- irreversible Module 1 boundary;
- route hidden until review;
- deterministic, explicitly uncalibrated practice routing;
- item-level review with scored/research disclosure.

**Writing**

- 10 Build a Sentence items;
- 1 Write an Email task;
- 1 Academic Discussion task;
- directions and untimed transitions;
- 7-minute Email and 10-minute Discussion windows;
- 6-minute Build rehearsal allocation so the full practice sequence totals 23 minutes.

The 6-minute Build allocation is a product rehearsal choice, not an independently published ETS task limit.

### Focused Practice

- Daily Life by stimulus format and reading skill;
- Academic Passage by domain and question skill;
- immediate post-submit explanation;
- explicit `GUIDED PRACTICE · NOT A MOCK` labeling;
- provider-generated items are validated before use.

Focused Practice is currently session-oriented. Formal Reading, Writing, and CTW attempts are the records intended for long-term history and retry.

### Guided Review and Vocabulary

- CTW gap-by-gap review;
- Reading task/skill review;
- Writing rubric feedback when a provider is available;
- vocabulary notebook;
- Again / Hard / Good review scheduling;
- JSON backup/import and CSV attempt export.

## Content Intelligence

The Content Intelligence page exposes the content-production layer instead of treating item quality as an invisible LLM prompt.

It includes:

- official source registry;
- permitted and prohibited source uses;
- six task blueprints;
- Coverage Matrix;
- provenance validation;
- schema and deterministic task validation;
- duplicate and near-duplicate screening;
- editorial lifecycle guidance;
- downloadable JSON audit.

The current audit reports **100/100 editorial category coverage**. This means all declared format/domain/skill/grammar/purpose categories are represented. It does **not** mean psychometric validity, official difficulty equivalence, adequate item volume, fairness validation, or readiness for official score interpretation.

Current original-bank counts:

| Content | Count |
|---|---:|
| Complete the Words passages | 12 |
| Full Reading forms | 2 |
| Daily Life stimuli | 17 |
| Daily Life questions | 42 |
| Academic passages | 6 |
| Academic questions | 30 |
| Build sets | 4 |
| Build items | 40 |
| Email tasks | 8 |
| Discussion tasks | 8 |
| Structured vocabulary entries | 80 |

## Source policy

Allowed inputs:

- public official ETS specifications, technical documents, rubrics, lesson plans, and public practice resources for blueprint analysis;
- original human-authored items;
- original AI-assisted items that pass deterministic validation and human review;
- properly licensed content whose license is recorded.

Rejected inputs:

- leaked or secure operational questions;
- recalled live questions or answer reconstructions;
- TPO or commercial content without a redistribution license;
- near-copies or superficial paraphrases of official prompts;
- items with unknown provenance that appear copied.

See `SOURCE_POLICY.md` for the complete policy.

## Scoring boundaries

### Deterministic tasks

- CTW: exact missing-letter match;
- Build: accepted tile-ID sequence;
- Reading multiple choice: exact answer ID.

### Constructed responses

With a configured provider:

1. independent rubric rater A;
2. independent rubric rater B;
3. adjudication when scores differ by at least one point;
4. evidence-span validation;
5. task-specific 0–5 **practice estimate**.

Without a provider, a nonblank Email or Discussion is marked **Unscored** and receives only transparent local diagnostics. The app deliberately does not fabricate a 0–5 score from word count or keyword matches.

No raw result is converted to an official 1–6 score because the project has no operational calibration/equating data.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm start
```

Open:

```text
http://127.0.0.1:4173
```

The static app and local provider work without third-party credentials.

## Build the standalone version

```bash
npm run build
```

Open `standalone.html` directly in a browser. The standalone build supports local content, attempts, review, vocabulary, and Content Intelligence. Remote generation/grading requires the server build.

## Provider configuration

The server supports:

- OpenAI;
- Anthropic;
- Gemini;
- OpenAI-compatible endpoints, including vLLM and SGLang.

Keep credentials server-side. Example:

```bash
export LLM_PROVIDER=openai-compatible
export OPENAI_BASE_URL=http://127.0.0.1:8000/v1
export OPENAI_MODEL=your-model
npm start
```

Useful API endpoints:

```text
GET  /api/health
GET  /api/content/coverage
GET  /api/content/sources
GET  /api/content/blueprints
POST /api/generate
POST /api/grade
```

## Verification

```bash
npm test
npm run content:audit
npm run build
npm run test:e2e
npm run release:check
```

`npm run release:check` verifies the complete project, runs the Chromium flow, rejects missing or empty required files, checks version consistency and source/content gates, and writes `RELEASE_MANIFEST.json`.

## Current release position

v6.0.0 is suitable as a **controlled-pilot content and interaction prototype**. It is not yet a production-scale standardized assessment platform.

Before public high-stakes use, the project still needs:

- substantially more parallel forms and exposure control;
- expert construct, language, fairness, and sensitivity review;
- representative pilot response data and item calibration;
- a human-scored Writing benchmark;
- account/cloud synchronization if used across devices;
- a formal editorial/admin workflow rather than JSON/code review;
- accessibility and cross-browser audits on real devices;
- legal review of public claims, privacy, terms, and trademark presentation.

## Trademark and independence

TOEFL and TOEFL iBT are trademarks of ETS. This project is independent, unofficial, and not endorsed by ETS.

## Complete-source package additions

The `complete-source` distribution also includes:

- `package-lock.json` for reproducible `npm ci` installs;
- `.env.example` and `npm run start:env`;
- Dockerfile and Docker Compose configuration;
- POSIX and PowerShell launchers;
- architecture, API, deployment, and project-structure documentation;
- contribution, security, and license-decision notices;
- a clean-install verification script.

Start with `START_HERE.md` after extracting the archive.
