import test from 'node:test';
import assert from 'node:assert/strict';
import { CTEST_SETS } from '../src/data.js';
import { READING_FORMS } from '../src/reading-data.js';
import {
  buildReadingModule,
  estimateRouterAbility,
  gradeReadingAttempt,
  gradeReadingModule,
  moduleAnsweredCount,
  moduleUnansweredCount,
  validateReadingForm
} from '../src/reading.js';

function setsFor(form) {
  const ids = new Set(['router', 'lower', 'upper'].flatMap((name) => (form[name]?.ctw || []).map((spec) => spec.setId)));
  return CTEST_SETS.filter((set) => ids.has(set.id));
}

function correctAnswers(module) {
  const answers = {};
  for (const page of module.pages) {
    if (page.type === 'ctw') page.ctest.gaps.forEach((gap) => { answers[gap.id] = gap.answer; });
    else answers[page.question.id] = page.question.answer;
  }
  return answers;
}

test('every bundled Reading form matches the 50-presented / 35-scored practice blueprint', () => {
  assert.ok(READING_FORMS.length >= 2);
  for (const form of READING_FORMS) {
    const sets = setsFor(form);
    const validation = validateReadingForm(form, sets);
    assert.equal(validation.valid, true, validation.errors.join(' '));
    const router = buildReadingModule(form, sets, 'router');
    const lower = buildReadingModule(form, sets, 'lower');
    const upper = buildReadingModule(form, sets, 'upper');
    assert.equal(router.totalItems, 35);
    assert.equal(router.scoredItems, 20);
    assert.equal(router.researchItems, 15);
    assert.equal(router.seconds, 1260);
    assert.equal(lower.totalItems, 15);
    assert.equal(lower.scoredItems, 15);
    assert.equal(lower.seconds, 540);
    assert.equal(upper.totalItems, 15);
    assert.equal(upper.scoredItems, 15);
    assert.equal(upper.seconds, 540);
    assert.ok(router.pages.some((page) => page.type === 'ctw'));
    assert.ok(router.pages.some((page) => page.type === 'daily'));
    assert.ok(router.pages.some((page) => page.type === 'academic'));
  }
});

test('Reading CTW IDs are namespaced so answers cannot collide across passages or modules', () => {
  const form = READING_FORMS[0];
  const sets = setsFor(form);
  const modules = ['router', 'lower', 'upper'].map((name) => buildReadingModule(form, sets, name));
  const ids = modules.flatMap((module) => module.pages.filter((page) => page.type === 'ctw').flatMap((page) => page.ctest.gaps.map((gap) => gap.id)));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => id.startsWith(form.id)));
});

test('research items are reviewable but excluded from the 0–35 scored result', () => {
  const form = READING_FORMS[0];
  const sets = setsFor(form);
  const router = buildReadingModule(form, sets, 'router');
  const lower = buildReadingModule(form, sets, 'lower');
  const answers = { ...correctAnswers(router), ...correctAnswers(lower) };
  const result = gradeReadingAttempt(form, sets, answers, 'lower');
  assert.equal(result.score, 35);
  assert.equal(result.maxScore, 35);
  assert.equal(result.allPracticeScore, 50);
  assert.equal(result.allPracticeMaxScore, 50);
  assert.equal(result.researchScore, 15);
  assert.equal(result.researchMaxScore, 15);
  assert.equal(result.details.filter((item) => item.scored).length, 35);
  assert.equal(result.details.filter((item) => item.research).length, 15);
  assert.ok(result.details.every((item) => ['router', 'lower'].includes(item.moduleName)));
});

test('module answer counts include all CTW gaps and MCQs', () => {
  const form = READING_FORMS[0];
  const sets = setsFor(form);
  const router = buildReadingModule(form, sets, 'router');
  assert.equal(moduleAnsweredCount(router, {}), 0);
  assert.equal(moduleUnansweredCount(router, {}), 35);
  const firstCtw = router.pages.find((page) => page.type === 'ctw');
  const oneAnswer = { [firstCtw.ctest.gaps[0].id]: firstCtw.ctest.gaps[0].answer };
  assert.equal(moduleAnsweredCount(router, oneAnswer), 1);
  assert.equal(moduleUnansweredCount(router, oneAnswer), 34);
});

test('practice routing is deterministic and explicitly uncalibrated', () => {
  const form = READING_FORMS[0];
  const sets = setsFor(form);
  const router = buildReadingModule(form, sets, 'router');
  const perfect = gradeReadingModule(router, correctAnswers(router));
  const blank = gradeReadingModule(router, {});
  const high = estimateRouterAbility(perfect.details);
  const low = estimateRouterAbility(blank.details);
  assert.equal(high.route, 'upper');
  assert.equal(low.route, 'lower');
  assert.equal(high.calibrated, false);
  assert.equal(high.method, 'practice-eap-1pl');
  assert.ok(high.theta > low.theta);
});
