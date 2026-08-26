import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_SETS, CTEST_SETS, DISCUSSION_TASKS, EMAIL_TASKS } from '../src/data.js';
import { TASK_BLUEPRINTS, SOURCE_POLICY } from '../src/blueprints.js';
import {
  analyzeAcademic,
  analyzeDaily,
  buildCoverageReport,
  collectReadingContent,
  validateCandidate,
  validateProvenance
} from '../src/content-intelligence.js';
import { SUPPLEMENTAL_ACADEMIC_BANK, SUPPLEMENTAL_DAILY_BANK } from '../src/focused-reading-data.js';
import { OFFICIAL_SOURCE_REGISTRY, validateSourceRegistry } from '../src/official-sources.js';
import { READING_FORMS } from '../src/reading-data.js';

function makeReport() {
  return buildCoverageReport({
    ctestSets: CTEST_SETS,
    readingForms: READING_FORMS,
    buildSets: BUILD_SETS,
    emailTasks: EMAIL_TASKS,
    discussionTasks: DISCUSSION_TASKS,
    focusedDaily: SUPPLEMENTAL_DAILY_BANK,
    focusedAcademic: SUPPLEMENTAL_ACADEMIC_BANK
  });
}

test('official-source registry is unique, policy-limited, and contains the seven public full-length forms', () => {
  const result = validateSourceRegistry();
  assert.equal(result.valid, true, result.errors.join(' '));
  assert.equal(OFFICIAL_SOURCE_REGISTRY.length, 15);
  assert.equal(new Set(OFFICIAL_SOURCE_REGISTRY.map((source) => source.id)).size, OFFICIAL_SOURCE_REGISTRY.length);
  assert.ok(OFFICIAL_SOURCE_REGISTRY.every((source) => source.prohibitedUses.includes('public-republication')));
  assert.equal(OFFICIAL_SOURCE_REGISTRY.filter((source) => source.sourceType === 'official-public-practice').length, 2);
  assert.equal(OFFICIAL_SOURCE_REGISTRY.filter((source) => source.sourceType === 'official-public-teacher-practice').length, 5);
});

test('v6 editorial coverage gate covers all declared public task families without claiming psychometric calibration', () => {
  const report = makeReport();
  assert.equal(report.releaseGate.structuralPass, true);
  assert.equal(report.hardErrors.length, 0);
  assert.equal(report.warnings.length, 0);
  assert.equal(report.duplicates.duplicateIds.length, 0);
  assert.equal(report.duplicates.nearDuplicates.length, 0);
  assert.equal(report.editorialCoverageScore, 100);
  for (const category of Object.values(report.coverage)) {
    assert.deepEqual(category.missing, []);
    assert.equal(category.ratio, 1);
  }
  assert.equal(report.psychometricCalibration.status, 'not-calibrated');
  assert.equal(report.releaseGate.humanReviewRequired, true);
  assert.equal(report.releaseGate.pilotRequired, true);
});

test('content inventory includes two full Reading forms plus focused Daily and Academic banks', () => {
  const report = makeReport();
  assert.equal(report.counts.readingForms, 2);
  assert.equal(report.counts.ctwPassages, 12);
  assert.equal(report.counts.dailyStimuli, 17);
  assert.equal(report.counts.dailyQuestions, 42);
  assert.equal(report.counts.academicPassages, 6);
  assert.equal(report.counts.academicQuestions, 30);
  assert.equal(report.counts.buildSets, 4);
  assert.equal(report.counts.buildItems, 40);
  const reading = collectReadingContent(READING_FORMS);
  assert.equal(reading.daily.length, 12);
  assert.equal(reading.academic.length, 4);
});

test('supplemental focused-practice items pass their task-specific structural validators', () => {
  for (const item of SUPPLEMENTAL_DAILY_BANK) {
    const result = analyzeDaily(item);
    assert.equal(result.valid, true, `${item.id}: ${result.errors.join(' ')}`);
    assert.equal(validateCandidate('daily', item).valid, true);
  }
  for (const item of SUPPLEMENTAL_ACADEMIC_BANK) {
    const result = analyzeAcademic(item);
    assert.equal(result.valid, true, `${item.id}: ${result.errors.join(' ')}`);
    assert.equal(validateCandidate('academic', item).valid, true);
  }
});

test('source policy rejects leaked, recalled-live, operational, and conflicting original provenance', () => {
  for (const kind of SOURCE_POLICY.prohibitedProvenance) {
    const result = validateProvenance({ provenance: { kind } });
    assert.equal(result.valid, false, `${kind} should be prohibited`);
  }
  const conflicting = validateProvenance({ provenance: { kind: 'original', leaked: true, operationalItem: false, recalled: false } });
  assert.equal(conflicting.valid, false);
  assert.match(conflicting.errors.join(' '), /conflicts/i);
});

test('writing blueprint preserves official-facing word-count boundaries', () => {
  assert.equal(TASK_BLUEPRINTS.email.constraints.timeSeconds, 420);
  assert.equal(TASK_BLUEPRINTS.email.constraints.minimumWordCount, null);
  assert.match(TASK_BLUEPRINTS.email.constraints.instruction, /complete sentences/i);
  assert.equal(TASK_BLUEPRINTS.discussion.constraints.timeSeconds, 600);
  assert.equal(TASK_BLUEPRINTS.discussion.constraints.effectiveResponseGuidanceWords, 100);
  assert.equal(TASK_BLUEPRINTS.discussion.constraints.minimumWordCountAsHardRule, false);
});
