import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_SETS, CTEST_SETS, DISCUSSION_TASKS, EMAIL_TASKS } from '../src/data.js';
import { collectReadingContent } from '../src/content-intelligence.js';
import { SUPPLEMENTAL_ACADEMIC_BANK, SUPPLEMENTAL_DAILY_BANK } from '../src/focused-reading-data.js';
import { READING_FORMS } from '../src/reading-data.js';
import { validateGenerated } from '../server/validation.mjs';

function clone(value) {
  return structuredClone(value);
}

test('every bundled item passes the same structural gate used for provider generation', () => {
  const reading = collectReadingContent(READING_FORMS);
  CTEST_SETS.forEach((item) => validateGenerated('ctw', item, { allowCuratedCtw: true }));
  [...reading.daily, ...SUPPLEMENTAL_DAILY_BANK].forEach((item) => validateGenerated('daily', item));
  [...reading.academic, ...SUPPLEMENTAL_ACADEMIC_BANK].forEach((item) => validateGenerated('academic', item));
  BUILD_SETS.forEach((item) => validateGenerated('build', item));
  EMAIL_TASKS.forEach((item) => validateGenerated('email', item));
  DISCUSSION_TASKS.forEach((item) => validateGenerated('discussion', item));
});

test('Build validation rejects reused tiles and duplicate visible choices', () => {
  const reused = clone(BUILD_SETS[0]);
  reused.items[0].accepted[0][1] = reused.items[0].accepted[0][0];
  assert.throws(() => validateGenerated('build', reused), /reuses the same tile/);

  const duplicateText = clone(BUILD_SETS[0]);
  duplicateText.items[0].choices[1].text = duplicateText.items[0].choices[0].text.toUpperCase();
  assert.throws(() => validateGenerated('build', duplicateText), /choice texts must be unique/);
});

test('Email validation rejects empty diagnostic purpose groups', () => {
  const item = clone(EMAIL_TASKS[0]);
  item.rubricHints.purposeGroups[1] = [];
  assert.throws(() => validateGenerated('email', item), /purposeGroups\[1\]/);
});

test('Discussion validation rejects duplicated positions or student identities', () => {
  const repeatedPost = clone(DISCUSSION_TASKS[0]);
  repeatedPost.students[1].post = repeatedPost.students[0].post;
  assert.throws(() => validateGenerated('discussion', repeatedPost), /posts must be distinct/);

  const repeatedName = clone(DISCUSSION_TASKS[0]);
  repeatedName.students[1].name = repeatedName.students[0].name.toUpperCase();
  assert.throws(() => validateGenerated('discussion', repeatedName), /names must be distinct/);
});


test('Daily Life validation rejects the wrong question count and prohibited provenance', () => {
  const item = clone(SUPPLEMENTAL_DAILY_BANK[0]);
  item.questions = item.questions.slice(0, 1);
  assert.throws(() => validateGenerated('daily', item), /2 or 3 questions/i);

  const leaked = clone(SUPPLEMENTAL_DAILY_BANK[0]);
  leaked.provenance = { kind: 'recalled-live-item' };
  assert.throws(() => validateGenerated('daily', leaked), /Prohibited item provenance/i);
});

test('Academic validation rejects short passages and missing five-question structure', () => {
  const tooShort = clone(SUPPLEMENTAL_ACADEMIC_BANK[0]);
  tooShort.text = 'This passage is much too short to satisfy the public blueprint.';
  assert.throws(() => validateGenerated('academic', tooShort), /170–260 words/i);

  const wrongCount = clone(SUPPLEMENTAL_ACADEMIC_BANK[0]);
  wrongCount.questions = wrongCount.questions.slice(0, 4);
  assert.throws(() => validateGenerated('academic', wrongCount), /exactly 5 questions/i);
});
