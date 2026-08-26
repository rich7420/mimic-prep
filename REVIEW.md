# TOEFL 2026 Practice Lab v6.0.0 — review and improvement report

Review date: **2026-08-26**

## Important release correction

The previously presented `v5.0.0` ZIP in the conversation was an empty archive rather than a usable project. v6.0.0 was therefore rebuilt from the last verifiable v4 codebase, not incrementally based on a functional v5 repository.

This release adds an explicit `npm run release:check` gate that rejects missing or empty required files, checks version consistency, reruns the application and browser tests, and writes a SHA-256 file manifest. The packaging process also re-extracts and retests the final ZIP.

## Review objective

The previous version was structurally close to a formal Reading and Writing simulation but still had a content-production weakness:

- only one complete Reading form;
- no visible source registry;
- no machine-readable task blueprints;
- no Coverage Matrix;
- no focused Daily/Academic practice;
- no explicit source-safety gate;
- only four LLM generation task types;
- no release integrity guard against an empty deliverable.

The v6 review therefore prioritized **content intelligence and repeatable release quality**, not cosmetic changes.

## v4 → v6 improvements

| Area | v4 | v6.0.0 |
|---|---|---|
| Complete Reading forms | 1 | 2 original forms |
| Source grounding | documentation only | 15-record official source registry |
| Task definitions | distributed in code | six explicit task blueprints |
| Content coverage | manually inferred | deterministic Coverage Matrix |
| Daily Life coverage | limited mock formats | all 14 public format families represented |
| Academic coverage | limited domains | all six domain families represented |
| Build grammar | 30 items / partial family coverage | 40 items / 15 editorial families |
| Focused Reading | absent | Daily and Academic guided practice |
| Generator types | CTW, Build, Email, Discussion | all six implemented tasks |
| Provenance | disclaimer | code-level allowed/rejected provenance |
| Duplicate screening | basic | exact-ID and normalized near-duplicate audit |
| Content audit | absent | JSON report + in-app Content Intelligence page |
| Release integrity | manual | mandatory release gate + manifest |
| Tests | 59 | 73 unit/contract/API tests + E2E |

## Content Intelligence design

The new layer separates four concepts that should never be collapsed into one score:

1. **Source integrity** — where a rule or item came from.
2. **Structural correctness** — whether the item can be administered and scored.
3. **Editorial category coverage** — whether declared blueprint categories are represented.
4. **Measurement quality** — whether real response data supports difficulty, discrimination, reliability, and score interpretation.

The current Content Intelligence page reports 100/100 for category coverage. The UI explicitly says that this is not psychometric validation.

## Source Registry review

The registry contains only ETS or ETS Research sources and records:

- source ID;
- title;
- URL;
- source type;
- content fidelity;
- UI fidelity;
- format alignment;
- task coverage;
- verification date;
- permitted and prohibited uses.

Every source prohibits public republication, near-copy generation, operational-item reconstruction, and training-corpus export.

## Item-bank review

Current counts:

- 12 CTW passages;
- 2 full Reading forms;
- 17 Daily Life stimuli / 42 questions;
- 6 Academic passages / 30 questions;
- 4 Build sets / 40 items;
- 8 Email tasks;
- 8 Discussion tasks;
- 80 vocabulary entries.

This is meaningfully better for controlled testing, but still too small for repeated high-frequency public mock testing. Two forms do not solve exposure and memorization at scale.

## Focused Practice review

The new Daily and Academic drills are deliberately separated from Mock Test mode:

- the header states `GUIDED PRACTICE · NOT A MOCK`;
- the stimulus remains visible;
- no answer is revealed before submission;
- post-submit review shows skill and explanation;
- provider-generated content passes the same task validators.

A remaining limitation is that these focused drills are session-oriented and are not yet included in the persistent longitudinal attempt history.

## Generation pipeline review

All six implemented task types now use:

```text
Request
→ task blueprint
→ provider/local generator
→ JSON/schema validation
→ deterministic task validator
→ provenance policy
→ duplicate screening
→ verifier
→ temporary practice snapshot
```

Generated content is not silently promoted into the permanent bundled bank. A real production editorial workflow still needs Draft, Expert Review, Pilot, Active, and Retired states with named reviewers and immutable revision history.

## Scoring review

Machine-scored tasks remain deterministic. Email and Discussion preserve the conservative behavior from earlier versions:

- provider unavailable: nonblank response is Unscored;
- provider available: dual holistic rating, adjudication, evidence validation;
- no invented diagnostic-weight formula;
- no official 1–6 conversion.

## UX review

The exam shell remains restrained and separate from the learning dashboard. v6 adds useful learning surfaces without adding coaching to the mock environment:

- Content Intelligence is outside the test shell;
- Focused Practice is visibly not a mock;
- route/research status remains hidden during formal Reading;
- answer feedback remains post-submit;
- second Reading form selection appears on the dashboard;
- mobile layouts remain responsive but are not claimed as test-day fidelity.

## Release-quality review

The new release gate checks:

- required files exist and are nonempty;
- package, app, storage, and standalone versions agree;
- standalone build exceeds a minimum size;
- source registry validates;
- content audit has no hard errors or unreviewed near-duplicate pairs;
- two Reading forms are present;
- human review and pilot requirements remain explicit;
- no native `window.confirm` regression;
- a per-file SHA-256 manifest is generated.

## Final assessment

v6.0.0 is a credible **controlled-pilot content and interaction prototype**. It is closer to a production content system than v4 because item-development rules are now inspectable and testable.

It is not yet a public standardized-assessment platform. The most important next evidence is not another visual redesign; it is expert item review, pilot responses, Writing human ratings, and form-level measurement analysis.
