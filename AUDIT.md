# TOEFL 2026 Practice Lab v6.0.0 — completeness and production-readiness audit

Reviewed: **2026-08-26**

## Executive assessment

v6.0.0 is a **controlled-pilot candidate** for unofficial TOEFL Reading and Writing practice. The software provides a stable mock flow, original content, persistent formal attempts, focused Reading drills, provider-neutral item generation/grading, and a transparent content-quality layer.

It is not production-ready for high-stakes score claims or unrestricted public operation. The largest remaining gaps are measurement validation, content scale, editorial workflow, user accounts/cloud synchronization, and independent accessibility/security review.

## Capability matrix

| Capability | Status | Assessment |
|---|---|---|
| Complete the Words mechanics | Implemented | deterministic, reversible, 10-gap validation |
| Daily Life | Implemented | 14 format families represented across mock/focused bank |
| Academic Passage | Implemented | six domain families and core skill coverage |
| Reading module flow | Implemented | two original forms, router/module transition/lock |
| Practice adaptive route | Prototype | deterministic and transparent, not calibrated |
| Hidden research items | Implemented | excluded from raw result and disclosed after submission |
| Build a Sentence | Implemented | 4 sets / 40 items / deterministic scoring |
| Write an Email | Implemented | 8 original prompts, three communication goals |
| Academic Discussion | Implemented | 8 original prompts, two distinct posts |
| Writing provider grading | Implemented | dual rater + adjudication + evidence validation |
| Offline Writing score | Deliberately absent | nonblank responses are Unscored, not heuristically scored |
| Source Registry | Implemented | 15 official public ETS/ETS Research records |
| Task Blueprint Registry | Implemented | all six task types plus form-level blueprint |
| Coverage Matrix | Implemented | 100/100 category coverage, not psychometric evidence |
| Provenance policy | Implemented | rejects leaked/recalled-live/operational/unknown-copy inputs |
| Duplicate audit | Implemented | ID and normalized near-duplicate screening |
| Focused Daily/Academic | Implemented | guided post-submit feedback |
| Formal attempt history | Implemented | Reading, Writing, CTW snapshots and retry |
| Focused-practice history | Partial | current guided session not persisted as a formal record |
| Multiple parallel forms | Partial | two forms; insufficient for public exposure control |
| Psychometric calibration | Missing | no representative response sample or fitted item bank |
| Writing human benchmark | Missing | no double-rated reference corpus |
| Official 1–6 conversion | Deliberately absent | unsupported without operational linking/equating |
| Human editorial workflow | Partial | lifecycle documented; no full role/revision UI |
| Accounts/cloud sync | Missing | browser-local records only |
| Listening/Speaking | Out of scope | not implemented |

## Content release gate

The automated gate currently reports:

- 2 Reading forms;
- 12 CTW passages;
- 17 Daily stimuli / 42 questions;
- 6 Academic passages / 30 questions;
- 40 Build items;
- 8 Email prompts;
- 8 Discussion prompts;
- all declared Daily formats represented;
- all declared Daily skills represented;
- all six Academic domains represented;
- all six Academic skill families represented;
- all 15 Build grammar families represented;
- all seven Email purpose families represented;
- zero hard content errors;
- zero flagged near-duplicate pairs.

The gate still marks `humanReviewRequired: true` and `pilotRequired: true`. Passing it means the software bank is structurally coherent enough for review, not that every item is valid or calibrated.

## Production risk register

### P0 — before score claims

1. Collect double-human-rated Email and Discussion responses.
2. Benchmark exact/adjacent agreement, bias, QWK, task slices, proficiency slices, and length effects.
3. Collect representative item responses and timing data.
4. Estimate item difficulty/discrimination and examine route classification.
5. Perform form comparability and reliability analysis.
6. Define an external validation plan before showing any 1–6 estimate.

### P0 — before unrestricted public accounts

1. Add authentication, account recovery, verification, and abuse protection.
2. Add server-side records, revisioned synchronization, deletion/export, and retention controls.
3. Complete a privacy policy, terms, trademark/legal review, and incident-response plan.
4. Commission independent security and authorization review.

### P1 — content operations

1. Replace code/JSON promotion with role-based Draft → Review → Pilot → Active → Retired workflow.
2. Store immutable revisions, reviewer identity, decision rationale, and exposure counts.
3. Add alternative-answer adjudication for Build.
4. Add fairness/sensitivity and regional-accessibility checklists.
5. Expand to enough parallel forms to control memorization and exposure.

### P1 — learner product

1. Persist Focused Practice results and mastery trends.
2. Add skill-level drill assignment based on validated history.
3. Add teacher/reviewer exports without exposing secure answer keys to learners.
4. Add accessible textual representations for nonlinear Daily Life layouts.

### P2 — broader coverage

1. Listening and Speaking if the product scope expands.
2. Proctored-session controls only after legal and accessibility review.
3. Institutional cohort analytics only after privacy and consent design.

## Security and privacy observations

- provider secrets stay server-side;
- static server sets baseline security headers;
- body size, provider timeout, and concurrency constraints exist;
- no account or sensitive demographic data is currently required;
- local history remains in browser storage and can be exported/deleted by the user;
- local storage is not a substitute for encrypted server-side persistence or cross-device conflict handling.

## Accessibility observations

Implemented:

- semantic buttons and form controls;
- keyboard Build interaction;
- visible focus treatment;
- modal focus containment and Escape;
- responsive layouts;
- timer hiding;
- no color-only correctness indication in review.

Still required:

- screen-reader testing with NVDA, JAWS, and VoiceOver;
- WCAG 2.2 AA audit;
- zoom/reflow and forced-colors testing;
- Firefox/Safari/Edge device matrix;
- reduced-motion and high-contrast review;
- accessibility review of table, receipt, schedule, and form-like Daily stimuli.

## Release assessment

Recommended label:

> **Unofficial controlled-pilot candidate — content and interaction validation required**

Not recommended:

- official TOEFL simulator;
- score predictor;
- psychometrically equivalent mock;
- production standardized assessment;
- replacement for TestReady/TPO.
