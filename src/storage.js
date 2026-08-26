const STORAGE_KEY = 'toefl-2026-practice-lab:v6';
const LEGACY_KEYS = ['toefl-2026-practice-lab:v4', 'toefl-2026-practice-lab:v3', 'toefl-2026-practice-lab:v2'];
const SCHEMA_VERSION = 6;
const APP_VERSION = '6.0.0';
const MAX_ATTEMPTS = 200;
const WRITE_DEBOUNCE_MS = 180;

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    attempts: [],
    currentAttempt: null,
    notebook: [],
    preferences: {
      practiceMode: 'exam', ctwBand: 'mixed', readingFormId: 'reading-form-01', buildSetId: 'build-core-01', provider: 'local', model: '',
      generatorModel: '', verifierModel: '', graderModel: '', adjudicatorModel: '', apiBase: '', gradeRoute: '/api/grade', generateRoute: '/api/generate',
      theme: 'light', showTimer: true, autoSaveMistakes: true
    }
  };
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

function nonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function normalizeNotebookItem(item) {
  if (!isObject(item) || !String(item.word || '').trim()) return null;
  const now = item.savedAt || new Date().toISOString();
  return {
    reviewCount: 0,
    intervalDays: 0,
    ease: 2.5,
    nextReviewAt: now,
    lastReviewedAt: null,
    ...item,
    word: String(item.word).trim()
  };
}

function normalizeStageTimings(value) {
  const source = isObject(value) ? value : {};
  return Object.fromEntries(
    ['ctw', 'router', 'module2', 'build', 'email', 'discussion'].map((key) => [key, nonNegativeNumber(source[key], 0)])
  );
}

function normalizeAttempt(item, { current = false } = {}) {
  if (!isObject(item)) return null;
  const taskType = ['ctw', 'writing', 'reading'].includes(item.taskType) ? item.taskType : null;
  if (!taskType) return null;
  const validWritingStages = new Set(['writing-intro', 'build', 'email-intro', 'email', 'discussion-intro', 'discussion']);
  const validReadingStages = new Set(['reading-intro', 'router', 'reading-transition', 'module2']);
  const stage = taskType === 'ctw'
    ? 'ctw'
    : taskType === 'reading'
      ? (validReadingStages.has(item.stage) ? item.stage : 'reading-intro')
      : (validWritingStages.has(item.stage) ? item.stage : 'writing-intro');
  const remaining = item.remainingSec == null ? null : nonNegativeNumber(item.remainingSec, null);
  return {
    ...item,
    id: String(item.id || makeId()),
    taskType,
    stage,
    status: current ? 'in_progress' : item.status === 'completed' ? 'completed' : 'in_progress',
    answers: isObject(item.answers) ? item.answers : {},
    elapsedSec: nonNegativeNumber(item.elapsedSec, 0),
    remainingSec: remaining,
    stageTimings: normalizeStageTimings(item.stageTimings),
    attemptSchemaVersion: item.attemptSchemaVersion || SCHEMA_VERSION,
    appVersion: item.appVersion || '2.x'
  };
}

function migrate(input) {
  const base = defaultState();
  if (!isObject(input)) return base;
  const attempts = Array.isArray(input.attempts)
    ? input.attempts.map((item) => normalizeAttempt(item)).filter(Boolean).slice(0, MAX_ATTEMPTS)
    : [];
  const notebook = Array.isArray(input.notebook)
    ? input.notebook.map(normalizeNotebookItem).filter(Boolean)
    : [];
  return {
    ...base,
    ...input,
    schemaVersion: SCHEMA_VERSION,
    attempts,
    notebook,
    preferences: { ...base.preferences, ...(isObject(input.preferences) ? input.preferences : {}) },
    currentAttempt: normalizeAttempt(input.currentAttempt, { current: true })
  };
}

let memoryFallback = defaultState();
let stateCache = null;
let cacheRaw = null;
let persistedRaw = null;
let pendingWriteTimer = null;
let lastStorageError = null;

function markStorageHealthy() {
  lastStorageError = null;
}

function markStorageUnavailable(error) {
  lastStorageError = error instanceof Error ? error.message : String(error || 'Browser storage is unavailable.');
}

function readStoredSnapshot() {
  try {
    const direct = localStorage.getItem(STORAGE_KEY);
    if (direct != null) {
      markStorageHealthy();
      return { available: true, key: STORAGE_KEY, raw: direct };
    }
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        markStorageHealthy();
        return { available: true, key, raw };
      }
    }
    markStorageHealthy();
    return { available: true, key: null, raw: null };
  } catch (error) {
    markStorageUnavailable(error);
    return { available: false, key: null, raw: null };
  }
}

function cancelPendingWrite() {
  if (pendingWriteTimer != null) {
    clearTimeout(pendingWriteTimer);
    pendingWriteTimer = null;
  }
}

function writeRawNow(raw = cacheRaw) {
  cancelPendingWrite();
  if (raw == null) return false;
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    persistedRaw = raw;
    markStorageHealthy();
    return true;
  } catch (error) {
    markStorageUnavailable(error);
    return false;
  }
}

function scheduleWrite() {
  cancelPendingWrite();
  pendingWriteTimer = setTimeout(() => writeRawNow(), WRITE_DEBOUNCE_MS);
}

export function flushState() {
  if (cacheRaw == null) return false;
  if (cacheRaw === persistedRaw && pendingWriteTimer == null) return true;
  return writeRawNow(cacheRaw);
}

export function loadState() {
  const snapshot = readStoredSnapshot();
  if (!snapshot.available) {
    if (stateCache) return stateCache;
    stateCache = migrate(memoryFallback);
    cacheRaw = JSON.stringify(stateCache);
    return stateCache;
  }

  // The browser copy has not changed since our last successful write. Keep the
  // newer in-memory state while a debounced autosave is pending.
  if (stateCache && snapshot.key === STORAGE_KEY && snapshot.raw === persistedRaw) return stateCache;
  if (stateCache && snapshot.key === STORAGE_KEY && snapshot.raw === cacheRaw) {
    persistedRaw = snapshot.raw;
    cancelPendingWrite();
    return stateCache;
  }

  // A missing/different value means another tab, a test reset, or a manual
  // storage clear changed the source of truth. Do not overwrite it with stale cache.
  cancelPendingWrite();
  const parsed = snapshot.raw == null ? null : safeParse(snapshot.raw);
  const state = migrate(parsed);
  stateCache = state;
  memoryFallback = state;
  cacheRaw = JSON.stringify(state);
  persistedRaw = snapshot.key === STORAGE_KEY ? snapshot.raw : null;

  // Migrate a legacy key or recover malformed/unnormalized state once, rather
  // than rewriting localStorage on every read.
  if (snapshot.key !== STORAGE_KEY || snapshot.raw !== cacheRaw) writeRawNow(cacheRaw);
  return stateCache;
}

export function saveState(state, { defer = false } = {}) {
  const normalized = migrate(state);
  stateCache = normalized;
  memoryFallback = normalized;
  cacheRaw = JSON.stringify(normalized);
  if (defer) scheduleWrite();
  else writeRawNow(cacheRaw);
  return normalized;
}

export function getStorageStatus() {
  return {
    persistent: !lastStorageError,
    pending: pendingWriteTimer != null,
    maxAttempts: MAX_ATTEMPTS,
    message: lastStorageError || `Saved in this browser. Up to ${MAX_ATTEMPTS} recent attempts are retained.`
  };
}

export function updateState(updater, { defer = false } = {}) {
  const state = loadState();
  const next = typeof updater === 'function' ? updater(structuredClone(state)) : { ...state, ...updater };
  return saveState(next, { defer });
}

export function makeId(prefix = 'attempt') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function beginAttempt(partial) {
  const now = new Date().toISOString();
  const attempt = {
    id: makeId(),
    status: 'in_progress',
    startedAt: now,
    updatedAt: now,
    elapsedSec: 0,
    remainingSec: null,
    stageTimings: normalizeStageTimings(partial?.stageTimings),
    answers: {},
    attemptSchemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    ...partial
  };
  updateState((state) => {
    state.currentAttempt = normalizeAttempt(attempt, { current: true });
    return state;
  });
  return loadState().currentAttempt;
}

export function patchCurrentAttempt(patch) {
  let currentAttempt = null;
  updateState((state) => {
    if (!state.currentAttempt) return state;
    const resolved = typeof patch === 'function'
      ? patch(structuredClone(state.currentAttempt))
      : { ...state.currentAttempt, ...patch };
    currentAttempt = normalizeAttempt({ ...resolved, updatedAt: new Date().toISOString() }, { current: true });
    state.currentAttempt = currentAttempt;
    return state;
  }, { defer: true });
  return currentAttempt;
}

export function finishCurrentAttempt(resultPatch = {}) {
  let completed = null;
  updateState((state) => {
    if (!state.currentAttempt) return state;
    const now = new Date().toISOString();
    completed = normalizeAttempt({
      ...state.currentAttempt,
      ...resultPatch,
      status: 'completed',
      updatedAt: now,
      completedAt: now
    });
    state.attempts = [completed, ...state.attempts.filter((item) => item.id !== completed.id)].slice(0, MAX_ATTEMPTS);
    state.currentAttempt = null;
    return state;
  });
  return completed;
}

export function discardCurrentAttempt() {
  updateState((state) => {
    state.currentAttempt = null;
    return state;
  });
}

export function updatePreferences(patch) {
  return updateState((state) => {
    state.preferences = { ...state.preferences, ...patch };
    return state;
  }, { defer: true }).preferences;
}

export function addNotebookEntry(entry) {
  let saved = null;
  updateState((state) => {
    const key = String(entry.word || '').toLowerCase();
    const existing = state.notebook.find((item) => String(item.word).toLowerCase() === key);
    if (existing) {
      saved = normalizeNotebookItem({ ...existing, ...entry, savedAt: existing.savedAt });
      state.notebook = state.notebook.map((item) => item === existing ? saved : item);
    } else {
      const now = new Date().toISOString();
      saved = normalizeNotebookItem({ id: makeId('word'), savedAt: now, nextReviewAt: now, ...entry });
      if (saved) state.notebook = [saved, ...state.notebook];
    }
    return state;
  }, { defer: true });
  return saved;
}

export function removeNotebookEntry(id) {
  updateState((state) => {
    state.notebook = state.notebook.filter((item) => item.id !== id);
    return state;
  }, { defer: true });
}

export function reviewNotebookEntry(id, rating = 'good') {
  let reviewed = null;
  updateState((state) => {
    state.notebook = state.notebook.map((item) => {
      if (item.id !== id) return item;
      const previous = Math.max(0, Number(item.intervalDays) || 0);
      let interval;
      if (rating === 'again') interval = 1;
      else if (previous < 1) interval = rating === 'hard' ? 1 : 2;
      else interval = Math.max(1, Math.round(previous * (rating === 'hard' ? 1.4 : 2.3)));
      const ease = Math.max(1.3, Math.min(3, Number(item.ease || 2.5) + (rating === 'again' ? -0.2 : rating === 'hard' ? -0.05 : 0.05)));
      const now = new Date();
      const next = new Date(now.getTime() + interval * 86400000).toISOString();
      reviewed = {
        ...item,
        reviewCount: (item.reviewCount || 0) + 1,
        intervalDays: interval,
        ease,
        nextReviewAt: next,
        lastReviewedAt: now.toISOString(),
        lastRating: rating
      };
      return reviewed;
    });
    return state;
  }, { defer: true });
  return reviewed;
}

export function dueNotebookEntries(state = loadState(), now = Date.now()) {
  return state.notebook
    .filter((item) => !item.nextReviewAt || new Date(item.nextReviewAt).getTime() <= now)
    .sort((a, b) => String(a.nextReviewAt || '').localeCompare(String(b.nextReviewAt || '')));
}

export function clearAttempts() {
  updateState((state) => {
    state.attempts = [];
    state.currentAttempt = null;
    return state;
  });
}

export function importState(payload) {
  const incoming = migrate(payload);
  const current = loadState();
  const attempts = [...incoming.attempts, ...current.attempts]
    .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((a, b) => String(b.completedAt || b.updatedAt).localeCompare(String(a.completedAt || a.updatedAt)))
    .slice(0, MAX_ATTEMPTS);
  const notebook = [...incoming.notebook, ...current.notebook]
    .filter((item, index, list) => list.findIndex((candidate) => String(candidate.word).toLowerCase() === String(item.word).toLowerCase()) === index);
  return saveState({
    ...current,
    attempts,
    notebook,
    currentAttempt: current.currentAttempt || incoming.currentAttempt || null,
    preferences: { ...current.preferences, ...incoming.preferences }
  });
}

export function exportState() {
  return { exportedAt: new Date().toISOString(), app: 'TOEFL 2026 Practice Lab', ...loadState() };
}

function csvValue(value) {
  const raw = String(value ?? '');
  const safe = /^[=+@]/.test(raw) || /^-[^0-9.]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function attemptsToCsv(attempts = loadState().attempts) {
  const rows = [[
    'id', 'task', 'set', 'started_at', 'completed_at', 'duration_seconds',
    'ctw_seconds', 'reading_router_seconds', 'reading_module2_seconds', 'build_seconds', 'email_seconds', 'discussion_seconds',
    'score', 'max_score', 'reading_route', 'reading_theta', 'email_score', 'discussion_score', 'grading_source',
    'error_tags', 'writing_dimensions', 'app_version'
  ]];
  for (const item of attempts) {
    const errors = item.result?.details?.filter?.((entry) => !entry.correct).map((entry) => entry.word || entry.skill || entry.itemId || entry.id).join('|') || '';
    const dimensions = JSON.stringify({
      email: item.result?.email?.dimensions || null,
      discussion: item.result?.discussion?.dimensions || null
    });
    const timings = normalizeStageTimings(item.stageTimings);
    rows.push([
      item.id, item.taskType, item.setId || '', item.startedAt || '', item.completedAt || '', item.elapsedSec ?? '',
      timings.ctw, timings.router, timings.module2, timings.build, timings.email, timings.discussion,
      item.result?.score ?? item.result?.buildScore ?? '', item.result?.maxScore ?? item.result?.buildMaxScore ?? '',
      item.result?.route ?? item.route ?? '', item.result?.routing?.theta ?? item.routing?.theta ?? '',
      item.result?.email?.score ?? '', item.result?.discussion?.score ?? '', item.result?.gradingSource ?? '',
      errors, dimensions, item.appVersion || ''
    ]);
  }
  return rows.map((row) => row.map(csvValue).join(',')).join('\n');
}

if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || LEGACY_KEYS.includes(event.key) || event.key == null) {
      cancelPendingWrite();
      stateCache = null;
      cacheRaw = null;
      persistedRaw = null;
    }
  });
}

export const __test = { MAX_ATTEMPTS, WRITE_DEBOUNCE_MS };
