# Content Intelligence architecture

## Purpose

Content Intelligence turns public task specifications into explicit, testable editorial rules. It prevents the product from relying on one opaque prompt such as “generate a realistic TOEFL question.”

The system has five layers:

```text
Official Source Registry
        ↓
Task and Form Blueprints
        ↓
Original Item Bank / Generated Candidate
        ↓
Structural + Provenance + Duplicate Audit
        ↓
Human Review → Pilot → Active
```

Only the first four are automated in v6. Human review and pilot remain mandatory release steps.

## Source Registry

`src/official-sources.js` stores metadata only. It does not store official question text or answer keys.

Each record includes:

- stable source ID;
- publisher;
- title and URL;
- source type;
- content fidelity;
- UI fidelity;
- format alignment;
- relevant task types;
- verification date;
- allowed uses;
- prohibited uses.

The registry validator accepts only ETS or ETS Research entries in the official registry and requires explicit republication restrictions.

## Task Blueprints

`src/blueprints.js` defines:

- CTW mechanics and text-quality constraints;
- Daily Life formats, word range, question count, and skills;
- Academic domains, passage range, five-question rule, and skills;
- Build interaction and grammar-family targets;
- Email goals, timing, communication purposes, and absence of an official hard minimum word count;
- Discussion structure, timing, 100-word guidance, and holistic scoring boundary;
- form-level Reading and Writing composition.

Blueprints cite source IDs rather than copying source passages.

## Provenance model

Accepted provenance:

- `original`;
- `licensed` with recorded license metadata;
- `official-public-reference` for metadata/benchmark records, not bundled learner items.

Rejected provenance:

- `leaked`;
- `recalled-live`;
- `operational`;
- `secure`;
- `unknown-copy`;
- an item labeled original while carrying a leaked/recalled/operational flag.

## Structural analyzers

### CTW

Checks:

- word count;
- first sentence intact;
- 10-gap construction;
- canonical or declared curated target positions;
- exact reconstruction;
- sentence count;
- dialogue/chat signal;
- proper-noun estimate;
- long-word/jargon proxy;
- target part-of-speech coverage;
- provenance.

### Daily Life

Checks:

- 15–150 words;
- two or three questions;
- exactly four answer options;
- valid answer ID;
- format and skill tags;
- register/information structure;
- provenance.

### Academic Passage

Checks:

- accepted 170–260 word window around the approximately 200-word target;
- exactly five questions;
- answer integrity;
- domain mapping;
- core skill coverage;
- provenance.

### Build

Checks:

- exactly 10 items per set;
- two to eight blanks;
- unique choice IDs;
- accepted sequence length;
- no tile reuse;
- accepted IDs exist;
- distractor warning;
- grammar-family tags;
- provenance.

### Email

Checks:

- scenario, recipient, subject;
- exactly three distinct goals;
- communication-purpose inference;
- no hard minimum-word requirement;
- provenance.

### Discussion

Checks:

- professor prompt;
- exactly two distinct students;
- nonduplicate student posts;
- accessible topic metadata;
- provenance.

## Coverage Matrix

Current category coverage:

| Dimension | Covered | Total |
|---|---:|---:|
| Daily Life formats | 14 | 14 |
| Daily Life skills | 9 | 9 |
| Academic domains | 6 | 6 |
| Academic skills | 6 | 6 |
| Build grammar families | 15 | 15 |
| Email purpose families | 7 | 7 |

The score is calculated from category representation. It is intentionally called **editorial coverage**, not difficulty coverage, fairness, reliability, or validity.

## Duplicate screening

The audit checks:

- duplicate item IDs;
- normalized text similarity;
- candidate pairs that exceed the near-duplicate threshold.

This catches obvious internal duplication. It does not prove originality against every external commercial or official corpus. Human review and legally obtained comparison sources are still necessary.

## Lifecycle

Recommended content status model:

```text
Draft
→ Automated Validation
→ Construct/Language Review
→ Fairness/Sensitivity Review
→ Pilot
→ Statistical Review
→ Active
→ Retired
```

A future editorial service should store:

- immutable item revision;
- generator/model/prompt version;
- source provenance;
- validator version;
- reviewer identity;
- review rationale;
- pilot sample and statistics;
- exposure count;
- retirement reason.

## API

Server endpoints:

```text
GET /api/content/coverage
GET /api/content/sources
GET /api/content/blueprints
```

The in-app Content Intelligence page uses the bundled report so the standalone version remains functional.

## Release interpretation

A candidate may pass the automated structural gate and still be rejected by an editor or pilot. The release report deliberately contains:

```json
{
  "structuralPass": true,
  "humanReviewRequired": true,
  "pilotRequired": true
}
```

This is the intended behavior, not an incomplete implementation.
