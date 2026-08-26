import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

globalThis.localStorage = new MemoryStorage();
const storage = await import('../src/storage.js');

test('current attempt autosaves, resumes, and moves into completed history', () => {
  localStorage.clear();
  const started = storage.beginAttempt({ taskType: 'ctw', stage: 'ctw', setId: 'demo', answers: { 'gap-1': '' } });
  storage.patchCurrentAttempt({ answers: { 'gap-1': 'tion' }, elapsedSec: 19 });
  const resumed = storage.loadState().currentAttempt;
  assert.equal(resumed.id, started.id);
  assert.equal(resumed.answers['gap-1'], 'tion');
  assert.equal(resumed.elapsedSec, 19);
  const completed = storage.finishCurrentAttempt({ result: { score: 1, maxScore: 1 } });
  const state = storage.loadState();
  assert.equal(state.currentAttempt, null);
  assert.equal(state.attempts.length, 1);
  assert.equal(state.attempts[0].id, completed.id);
  assert.equal(state.attempts[0].status, 'completed');
  assert.equal(state.attempts[0].appVersion, '6.0.0');
});

test('v2 JSON import migrates records into the v6 schema, restores a draft, and keeps preferences', () => {
  localStorage.clear();
  const incoming = {
    schemaVersion: 2,
    attempts: [{ id: 'old-1', taskType: 'ctw', status: 'completed', result: { score: 7, maxScore: 10 } }],
    currentAttempt: { id: 'draft-1', taskType: 'writing', stage: 'email', status: 'in_progress', answers: { email: 'Saved draft' } },
    notebook: [{ id: 'word-1', word: 'cohesive' }],
    preferences: { practiceMode: 'study', provider: 'local' }
  };
  storage.importState(incoming);
  const state = storage.loadState();
  assert.equal(state.schemaVersion, 6);
  assert.equal(state.attempts[0].id, 'old-1');
  assert.equal(state.currentAttempt.id, 'draft-1');
  assert.equal(state.currentAttempt.answers.email, 'Saved draft');
  assert.equal(state.notebook[0].word, 'cohesive');
  assert.equal(state.preferences.practiceMode, 'study');
});

test('Reading attempts preserve module stage, route, and timing fields', () => {
  localStorage.clear();
  storage.beginAttempt({ taskType: 'reading', stage: 'router', formId: 'reading-form-01', answers: {}, remainingSec: 1200, stageTimings: { router: 60 } });
  storage.patchCurrentAttempt({ stage: 'reading-transition', route: 'upper', routing: { theta: 0.42 }, stageTimings: { router: 1260 } });
  const draft = storage.loadState().currentAttempt;
  assert.equal(draft.stage, 'reading-transition');
  assert.equal(draft.route, 'upper');
  const completed = storage.finishCurrentAttempt({ result: { score: 27, maxScore: 35, route: 'upper', routing: { theta: 0.42 } } });
  const csv = storage.attemptsToCsv([completed]);
  assert.match(csv, /reading_router_seconds/);
  assert.match(csv, /reading_module2_seconds/);
  assert.match(csv, /"upper"/);
  assert.match(csv, /"0\.42"/);
});

test('spaced review updates due dates and due queue', () => {
  localStorage.clear();
  const item = storage.addNotebookEntry({ word: 'mitigate', cefr: 'C1' });
  assert.equal(storage.dueNotebookEntries().length, 1);
  const reviewed = storage.reviewNotebookEntry(item.id, 'good');
  assert.equal(reviewed.reviewCount, 1);
  assert.ok(reviewed.intervalDays >= 2);
  assert.equal(storage.dueNotebookEntries().length, 0);
});

test('CSV export contains timing, task scores, dimensions, and app version', () => {
  const csv = storage.attemptsToCsv([{ id:'a1', taskType:'writing', setId:'set', startedAt:'s', completedAt:'c', elapsedSec:42, appVersion:'3.0.0', result:{ buildScore:8, buildMaxScore:10, email:{score:4,dimensions:{task_fulfillment:4}}, discussion:{score:5}, gradingSource:'llm_dual' } }]);
  assert.match(csv, /duration_seconds/);
  assert.match(csv, /build_seconds/);
  assert.match(csv, /discussion_seconds/);
  assert.match(csv, /writing_dimensions/);
  assert.match(csv, /app_version/);
  assert.match(csv, /"42"/);
  assert.match(csv, /"8"/);
  assert.match(csv, /"4"/);
  assert.match(csv, /"5"/);
  assert.match(csv, /3\.0\.0/);
});


test('malformed imported attempts are sanitized instead of becoming unsafe resumable drafts', () => {
  localStorage.clear();
  storage.importState({
    attempts: [{ id: 'bad', taskType: 'unknown', status: 'completed' }],
    currentAttempt: { id: 'draft', taskType: 'writing', stage: 'nonsense', answers: 'not-an-object', elapsedSec: -5 }
  });
  const state = storage.loadState();
  assert.equal(state.attempts.length, 0);
  assert.equal(state.currentAttempt.stage, 'writing-intro');
  assert.deepEqual(state.currentAttempt.answers, {});
  assert.equal(state.currentAttempt.elapsedSec, 0);
});

test('stage timings are normalized and exported', () => {
  localStorage.clear();
  storage.beginAttempt({ taskType: 'writing', stage: 'build', answers: {}, stageTimings: { build: 12 } });
  storage.patchCurrentAttempt({ stageTimings: { build: 13, email: 20, discussion: 30 } });
  const completed = storage.finishCurrentAttempt({ result: { buildScore: 0, buildMaxScore: 10 } });
  assert.equal(completed.stageTimings.build, 13);
  assert.equal(completed.stageTimings.email, 20);
  assert.match(storage.attemptsToCsv([completed]), /"13","20","30"/);
});

test('rapid draft patches are cached immediately and coalesced into one browser write', () => {
  localStorage.clear();
  localStorage.writeCount = 0;
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key, value) => { localStorage.writeCount += 1; originalSetItem(key, value); };
  storage.loadState();
  storage.beginAttempt({ taskType: 'writing', stage: 'email', answers: { email: '' } });
  localStorage.writeCount = 0;
  for (let index = 0; index < 20; index += 1) {
    storage.patchCurrentAttempt({ answers: { email: `draft ${index}` } });
  }
  assert.equal(storage.loadState().currentAttempt.answers.email, 'draft 19');
  assert.equal(localStorage.writeCount, 0);
  storage.flushState();
  assert.equal(localStorage.writeCount, 1);
  localStorage.setItem = originalSetItem;
});

test('history retention is bounded so full question snapshots do not exhaust localStorage', () => {
  localStorage.clear();
  const attempts = Array.from({ length: 260 }, (_, index) => ({
    id: `history-${index}`,
    taskType: 'ctw',
    stage: 'ctw',
    status: 'completed',
    completedAt: new Date(2026, 0, index + 1).toISOString(),
    answers: {},
    result: { score: 0, maxScore: 10 }
  }));
  storage.importState({ attempts });
  assert.equal(storage.loadState().attempts.length, storage.__test.MAX_ATTEMPTS);
  assert.equal(storage.__test.MAX_ATTEMPTS, 200);
});

test('CSV cells that resemble spreadsheet formulas are neutralized', () => {
  const csv = storage.attemptsToCsv([{ id: '=HYPERLINK("bad")', taskType: 'ctw', setId: '@cmd', result: { score: 1, maxScore: 10 } }]);
  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'@cmd"/);
});
