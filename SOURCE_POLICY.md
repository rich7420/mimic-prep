# Source and item-security policy

## Objective

Protect item integrity, copyright, measurement quality, and learner trust while using public research to build original TOEFL-style practice.

## Allowed source uses

### Official public ETS specifications and research

Allowed:

- derive task blueprints;
- compare public interface behavior;
- measure category coverage;
- align rubric terminology;
- cite public facts;
- record source metadata.

Not allowed:

- republish complete official questions or answer keys;
- use official items as a public training corpus;
- prompt a model to make superficial paraphrases;
- reconstruct operational forms;
- imply ETS endorsement.

### Original content

Allowed when:

- authored independently;
- provenance is recorded;
- deterministic task checks pass;
- duplicate screening passes;
- a human reviewer approves it;
- pilot evidence is collected before difficulty claims.

### Licensed content

Allowed only when:

- the license explicitly permits the intended use;
- the license, owner, term, and restrictions are recorded;
- attribution and distribution requirements are followed.

## Prohibited sources

The platform rejects:

- leaked secure items;
- recalled current/live items;
- answer-dump or reconstruction communities;
- scraped TPO/commercial questions without permission;
- screenshots or transcriptions of protected practice products;
- unknown-copy items that resemble an external source;
- prompts asking an LLM to disguise copied questions;
- user submissions containing operational question text.

## Candidate handling

Every generated/imported candidate must carry:

```json
{
  "provenance": {
    "kind": "original",
    "operationalItem": false,
    "leaked": false,
    "recalled": false,
    "authoringVersion": "6.0.0"
  }
}
```

Conflicting flags fail validation.

## Human reports about test experience

Permitted high-level observations:

- perceived time pressure;
- interface usability;
- general topic/domain distribution;
- accessibility or technical issues;
- navigation behavior.

Do not store:

- verbatim or reconstructed prompts;
- answer choices;
- correct answers;
- screenshots from a secure test;
- distinctive passages that enable reconstruction.

## Takedown and incident response

When potentially protected or secure content is reported:

1. quarantine the item;
2. stop serving it;
3. preserve audit metadata without redistributing the content;
4. review provenance and similarity;
5. remove confirmed protected content;
6. invalidate affected forms/attempt interpretations if necessary;
7. document the decision;
8. update filters and reviewer guidance.

## Public claims

Permitted:

- unofficial;
- aligned to public 2026 task specifications;
- original practice content;
- practice raw score;
- uncalibrated practice route;
- provider-generated practice estimate.

Prohibited without new evidence:

- official TOEFL questions;
- official score predictor;
- ETS-equivalent;
- psychometrically equivalent;
- guaranteed score improvement;
- licensed or endorsed by ETS.
