# TOEFL 2026 Practice Lab v6.0.0 — research basis

Last verified: **2026-08-26**

This document separates public ETS information from Practice Lab design decisions. Public sources are used to derive task blueprints, content categories, interaction constraints, and evaluation boundaries. Official question text is not bundled or paraphrased into the public item bank.

## Primary public sources

The in-app registry is implemented in `src/official-sources.js` and currently contains 15 ETS/ETS Research references.

Core sources:

- TOEFL iBT Test Content and Structure  
  https://www.ets.org/toefl/test-takers/ibt/about/content.html
- TOEFL iBT Technical Manual (RR-106)  
  https://rr.ets.org/index.php/etsrr/article/download/28/17/34
- TOEFL iBT 2026 Test Blueprint and Specifications  
  https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf
- TOEFL iBT Writing Scoring Guide  
  https://www.ets.org/content/dam/ets-org/pdfs/toefl/writing-rubrics.pdf
- TOEFL Sample Test January 2026  
  https://www.ets.org/toefl/test-takers/ibt/prepare/sample-test-jan-2026-1.html
- TOEFL iBT Full-Length Practice Tests 1 and 2  
  https://www.ets.org/toefl/teachers-advisors-agents/ibt/teaching/preparing-students.html
- TOEFL iBT Teacher Resources Practice Tests 1–5  
  https://www.ets.org/toefl/teachers-advisors-agents/ibt/teaching/preparing-students.html
- TOEFL Reading and Writing lesson plans  
  https://www.ets.org/toefl/teachers-advisors-agents/ibt/teaching/preparing-students.html
- TOEFL TestReady  
  https://www.ets.org/toefl/test-takers/ibt/prepare/toefl-testready.html

Public pages and documents may change. Every source record therefore carries a `verifiedAt` date and must be rechecked before claims are updated.

## Current structure represented by the app

### Reading

Public materials describe three task types:

- Complete the Words;
- Read in Daily Life;
- Read an Academic Passage.

The public blueprint describes a two-stage adaptive Reading design with approximately 50 presented items, 35 raw points, an 18–21 minute router, and a 9-minute second module. Public practice instructions permit Back/Next within a module but state that a test taker cannot return to Module 1 after beginning Module 2.

Practice Lab implements two original forms with:

- 35 presented items in Module 1;
- 20 practice-scored and 15 hidden research items;
- 21 minutes for the router;
- 15 scored items and 9 minutes in Module 2;
- a deterministic lower/upper practice route;
- no return to Module 1 after transition.

The route is explicitly **uncalibrated**. Editorial seed difficulties and a transparent practice 1PL/EAP rule are not operational ETS item parameters.

### Writing

Public materials specify:

- 10 Build a Sentence items;
- 1 Write an Email task;
- 1 Academic Discussion task;
- 12 total tasks and approximately 23 minutes;
- Email: 7 minutes;
- Academic Discussion: 10 minutes;
- Discussion guidance that an effective response is typically at least 100 words.

Public Email directions do not specify a fixed minimum word count. Practice Lab therefore displays a word count but does not impose a hard Email minimum.

The remaining 6 minutes are used as a product-level Build rehearsal allocation. This is not represented as an independently published ETS limit.

## Task blueprint findings

### Complete the Words

Public design characteristics used by the validator:

- coherent, self-contained academic paragraph;
- approximately 70–100 words;
- first sentence intact;
- after the first sentence, the second half of every second lexical word is deleted;
- exactly 10 truncated words;
- standard written English;
- accessible topic;
- avoid excessive technical terminology, proper nouns, chat, and reported dialogue.

Practice Lab applies deterministic deletion and reconstruction. The LLM may propose source text, but it cannot decide where the gaps go or how correctness is scored.

### Read in Daily Life

Public stimulus families represented in the Coverage Matrix:

- poster;
- sign;
- notice;
- menu;
- social post;
- webpage;
- schedule;
- email;
- message chain;
- advertisement;
- news article;
- form;
- invoice;
- receipt.

Public materials describe short functional texts of roughly 15–150 words with two or three questions. Skills include navigating nonlinear information, purpose, informal language, idiom, inference, telegraphic language, skimming, scanning, and applying information.

### Read an Academic Passage

Practice Lab uses the public blueprint families:

- history;
- art and music;
- business and economics;
- life science;
- physical science;
- social science.

Each original passage is approximately 200 words and has five multiple-choice questions. The Coverage Matrix tracks main idea, factual information, vocabulary in context, inference, idea relationships, and rhetorical purpose.

### Build a Sentence

The task measures sentence structure through movable words or phrases. Practice Lab tracks 15 editorial grammar families:

- relative clauses;
- agreement;
- indirect questions;
- passive voice;
- conditionals;
- verb complements;
- comparison;
- reported speech;
- modal meaning;
- perfect aspect;
- auxiliary inversion;
- noun clauses;
- negation;
- clause combination;
- temporal clauses.

Each Build item is deterministically checked for choice IDs, blank count, distractors, and declared accepted sequences. Human review is still needed to identify unintended alternative answers and unnatural dialogue.

### Write an Email

The content audit tracks seven communication-purpose families:

- request;
- giving information;
- recommendation;
- problem solution;
- explanation;
- invitation;
- status inquiry.

Every bundled task has a scenario, recipient, subject, and three distinct communication goals. The app does not treat length as an official scoring formula.

### Academic Discussion

Each prompt contains a professor question and two student posts. Validators require distinct students and nonduplicate views. Human review must still judge whether the issue is genuinely discussable, accessible without specialist knowledge, and fair across backgrounds.

## Public practice resources and use boundaries

ETS currently exposes two regular full-length practice tests and five teacher-resource practice tests aligned to the updated test. They are useful for:

- task blueprint analysis;
- content and skill distribution analysis;
- instruction and paper-layout comparison;
- distractor and prompt-quality benchmarking.

They are paper adaptations and should not be treated as a complete source of computer-interface behavior. The public interactive sample is the stronger UI reference.

The project stores only source metadata and derived blueprint categories. It does not package official prompts, answer keys, TPO content, or transformed copies.

## Item-development evidence and project boundary

The ETS Technical Manual describes large-scale prototype, pilot, and field-test work, together with expert review and psychometric analysis. That process cannot be replaced by an LLM verifier or a 100/100 Coverage Matrix.

Practice Lab therefore distinguishes:

- **structural validity:** schema, mechanics, answer integrity;
- **editorial coverage:** represented task categories;
- **human review:** construct, naturalness, fairness, alternative answers;
- **pilot evidence:** observed item difficulty and discrimination;
- **operational validity:** not claimed.

## Writing scoring boundary

Public rubrics use task-specific holistic 0–5 scales. Practice Lab uses two independent rubric calls, adjudication on disagreement, and evidence validation. Diagnostic dimensions do not get summed into an invented weighted formula.

The system still requires a substantial set of double-human-rated responses before a model score can be treated as reliable. No local or provider score is converted into an official 1–6 section score.
