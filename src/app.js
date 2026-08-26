import {
  APP_META,
  BUILD_SETS,
  CTEST_SETS,
  DISCUSSION_TASKS,
  EMAIL_TASKS,
  VOCABULARY_BANK
} from './data.js';
import { READING_FORMS } from './reading-data.js';
import { SUPPLEMENTAL_ACADEMIC_BANK, SUPPLEMENTAL_DAILY_BANK } from './focused-reading-data.js';
import { buildCoverageReport, collectReadingContent } from './content-intelligence.js';
import { OFFICIAL_SOURCE_REGISTRY } from './official-sources.js';
import { SOURCE_POLICY, TASK_BLUEPRINTS } from './blueprints.js';
import { countWords, createCtest, gradeCtest } from './ctest.js';
import {
  buildReadingModule,
  gradeReadingAttempt,
  gradeReadingModule,
  estimateRouterAbility,
  moduleAnsweredCount,
  moduleUnansweredCount,
  pageAnswerCount,
  validateReadingForm
} from './reading.js';
import {
  addNotebookEntry,
  attemptsToCsv,
  beginAttempt,
  clearAttempts,
  discardCurrentAttempt,
  exportState,
  finishCurrentAttempt,
  flushState,
  getStorageStatus,
  importState,
  loadState,
  patchCurrentAttempt,
  removeNotebookEntry,
  reviewNotebookEntry,
  dueNotebookEntries,
  updatePreferences
} from './storage.js';
import {
  estimateDiscussionLocally,
  estimateEmailLocally,
  gradeBuild,
  wordCount,
  writingRubricPayload
} from './scoring.js';

const app = document.querySelector('#app');

const READING_CONTENT = collectReadingContent(READING_FORMS);
const DAILY_PRACTICE_BANK = [...READING_CONTENT.daily, ...SUPPLEMENTAL_DAILY_BANK]
  .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
const ACADEMIC_PRACTICE_BANK = [...READING_CONTENT.academic, ...SUPPLEMENTAL_ACADEMIC_BANK]
  .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
const CONTENT_REPORT = buildCoverageReport({
  ctestSets: CTEST_SETS,
  readingForms: READING_FORMS,
  buildSets: BUILD_SETS,
  emailTasks: EMAIL_TASKS,
  discussionTasks: DISCUSSION_TASKS,
  focusedDaily: SUPPLEMENTAL_DAILY_BANK,
  focusedAcademic: SUPPLEMENTAL_ACADEMIC_BANK
});

const ui = {
  view: 'home',
  detailAttemptId: null,
  exam: null,
  timerId: null,
  timerMode: null,
  timerDeadline: null,
  timerElapsedBase: 0,
  timerStartedAt: 0,
  timerCountdownStartSeconds: 0,
  timerAttemptElapsedBase: 0,
  timerStageElapsedBase: 0,
  timerCallback: null,
  lastPersistSecond: -1,
  timerHidden: false,
  helpOpen: false,
  helpPreviousFocus: null,
  wordCountHidden: false,
  internalClipboard: '',
  textHistory: {
    email: { entries: [''], index: 0, lock: false },
    discussion: { entries: [''], index: 0, lock: false }
  },
  vocabFilter: 'all',
  vocabSearch: '',
  recordFilter: 'all',
  toast: null,
  grading: false,
  generating: null,
  generationMessage: '',
  selectedBuildTileId: null,
  focused: null
};

let activeConfirmationCleanup = null;

/**
 * Render an in-app confirmation dialog instead of relying on a native browser
 * confirmation. Some embedded/sandboxed preview surfaces suppress native
 * dialogs, which made Submit and Exit appear unresponsive.
 */
function pauseActiveTimerForDialog() {
  if (!ui.exam || !ui.timerMode) return null;
  const paused = {
    mode: ui.timerMode,
    value: timerSeconds(),
    callback: ui.timerCallback,
    stage: currentData().currentAttempt?.stage || null
  };
  persistCurrentTimer(paused.value);
  stopTimer();
  updateTimerDom(paused.value);
  return paused;
}

function resumePausedTimer(paused) {
  if (!paused || !ui.exam || ui.grading) return;
  if (paused.mode === 'elapsed') startElapsedTimer(paused.value);
  else startCountdown(paused.value, paused.callback || stageTimeoutCallback(paused.stage));
  updateTimerDom(paused.value);
}

function askConfirmation({
  title = 'Please confirm',
  message = '',
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  destructive = false
} = {}) {
  if (activeConfirmationCleanup) activeConfirmationCleanup(false);
  const pausedTimer = pauseActiveTimerForDialog();

  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const layer = document.createElement('div');
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const titleId = `confirm-title-${suffix}`;
    const descriptionId = `confirm-description-${suffix}`;
    layer.id = 'confirm-dialog-layer';
    layer.className = 'modal-backdrop confirm-backdrop';
    layer.innerHTML = `
      <section class="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="${titleId}" aria-describedby="${descriptionId}">
        <div class="confirm-icon" aria-hidden="true">${destructive ? '!' : '?'}</div>
        <div class="confirm-copy">
          <h2 id="${titleId}">${esc(title)}</h2>
          <p id="${descriptionId}">${esc(message)}</p>
        </div>
        <div class="confirm-actions">
          <button type="button" class="button ghost" data-confirm-action="cancel">${esc(cancelLabel)}</button>
          <button type="button" class="button ${destructive ? 'danger-solid' : 'primary'}" data-confirm-action="confirm">${esc(confirmLabel)}</button>
        </div>
      </section>`;

    let settled = false;
    function finish(value) {
      if (settled) return;
      settled = true;
      document.removeEventListener('keydown', keyHandler, true);
      layer.remove();
      document.body.classList.remove('confirm-open');
      activeConfirmationCleanup = null;
      if (!value) resumePausedTimer(pausedTimer);
      if (previousFocus && typeof previousFocus.focus === 'function' && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
      resolve(value);
    }

    function keyHandler(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...layer.querySelectorAll('button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    layer.addEventListener('click', (event) => {
      const button = event.target.closest('[data-confirm-action]');
      if (button?.dataset.confirmAction === 'confirm') finish(true);
      else if (button?.dataset.confirmAction === 'cancel' || event.target === layer) finish(false);
    });
    document.addEventListener('keydown', keyHandler, true);
    document.body.appendChild(layer);
    document.body.classList.add('confirm-open');
    activeConfirmationCleanup = finish;
    requestAnimationFrame(() => layer.querySelector('[data-confirm-action="cancel"]')?.focus());
  });
}

const ICONS = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
  practice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7a3 3 0 0 1 3 3v13a4 4 0 0 0-4-4H4zM20 4h-3a3 3 0 0 0-3 3v13a4 4 0 0 1 4-4h2z"/></svg>',
  records: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></svg>',
  vocab: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 9h8M8 13h5"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3.1h5l.4-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2.1-1.5a7 7 0 0 0 .1-1z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
  help: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.1.9-1.1 1.8M12 17h.01"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 20h16"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0 5 5m-5-5L7 9M4 20h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/></svg>',
  target: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/></svg>'
};

function icon(name) {
  return `<span class="icon">${ICONS[name] || ''}</span>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function attr(value) {
  return esc(value).replace(/`/g, '&#96;');
}

function formatDate(value, withTime = true) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(date);
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function showToast(message, tone = 'success') {
  ui.toast = { message, tone };
  renderToast();
  setTimeout(() => {
    ui.toast = null;
    renderToast();
  }, 3200);
}

function renderToast() {
  let node = document.querySelector('#toast-region');
  if (!node) {
    node = document.createElement('div');
    node.id = 'toast-region';
    node.className = 'toast-region';
    document.body.appendChild(node);
  }
  node.innerHTML = ui.toast
    ? `<div class="toast toast-${ui.toast.tone}" role="status">${esc(ui.toast.message)}</div>`
    : '';
}

function currentData() {
  return loadState();
}

function findCtestSet(id) {
  return CTEST_SETS.find((item) => item.id === id) || CTEST_SETS[0];
}

function findReadingForm(id) {
  return READING_FORMS.find((item) => item.id === id) || READING_FORMS[0];
}

function taskTypeName(taskType) {
  if (taskType === 'reading') return 'Reading Section';
  if (taskType === 'ctw') return 'Complete the Words';
  return 'Writing Section';
}

function taskTypeMark(taskType) {
  return taskType === 'writing' ? 'W' : 'R';
}

function findBuildSet(id) {
  return BUILD_SETS.find((item) => item.id === id) || BUILD_SETS[0];
}

function findEmailTask(id) {
  return EMAIL_TASKS.find((item) => item.id === id) || EMAIL_TASKS[0];
}

function findDiscussionTask(id) {
  return DISCUSSION_TASKS.find((item) => item.id === id) || DISCUSSION_TASKS[0];
}

function navItem(view, label, iconName) {
  return `<button class="app-nav-item ${ui.view === view ? 'active' : ''}" data-action="nav" data-view="${view}">
    ${icon(iconName)}<span>${label}</span>
  </button>`;
}

function appShell(content) {
  const data = currentData();
  const storage = getStorageStatus();
  return `
    <div class="app-layout">
      <aside class="app-sidebar">
        <button class="brand-lockup" data-action="nav" data-view="home" aria-label="TOEFL Practice Lab home">
          <span class="brand-mark">T</span>
          <span><strong>Practice Lab</strong><small>2026 TOEFL format</small></span>
        </button>
        <nav class="app-nav" aria-label="Main navigation">
          ${navItem('home', '總覽', 'home')}
          ${navItem('practice', '開始練習', 'practice')}
          ${navItem('records', '作答紀錄', 'records')}
          ${navItem('vocabulary', '單字範圍', 'vocab')}
          ${navItem('content', '題庫品質', 'layers')}
          ${navItem('settings', '模型與設定', 'settings')}
        </nav>
        <div class="sidebar-foot">
          <div class="storage-indicator ${storage.persistent ? '' : 'warning'}" title="${attr(storage.message)}"><span></span>${storage.persistent ? '本機自動儲存' : '僅本次工作階段'}</div>
          <small>v${APP_META.version} · 非 ETS 官方產品</small>
        </div>
      </aside>
      <div class="app-content-wrap">
        <header class="app-mobile-header">
          <button class="brand-lockup compact" data-action="nav" data-view="home"><span class="brand-mark">T</span><strong>Practice Lab</strong></button>
          <select class="mobile-nav-select" data-action="mobile-nav" aria-label="Navigate">
            <option value="home" ${ui.view === 'home' ? 'selected' : ''}>總覽</option>
            <option value="practice" ${ui.view === 'practice' ? 'selected' : ''}>開始練習</option>
            <option value="records" ${ui.view === 'records' ? 'selected' : ''}>作答紀錄</option>
            <option value="vocabulary" ${ui.view === 'vocabulary' ? 'selected' : ''}>單字範圍</option>
            <option value="content" ${ui.view === 'content' ? 'selected' : ''}>題庫品質</option>
            <option value="settings" ${ui.view === 'settings' ? 'selected' : ''}>模型與設定</option>
          </select>
        </header>
        <main class="app-content">${content}</main>
      </div>
    </div>
    ${data.currentAttempt ? '' : ''}
  `;
}

function pageHeading(kicker, title, description, actions = '') {
  return `<div class="page-heading">
    <div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${description}</p></div>
    ${actions ? `<div class="page-actions">${actions}</div>` : ''}
  </div>`;
}

function computeStats(attempts) {
  const completed = attempts.filter((item) => item.status === 'completed');
  const reading = completed.filter((item) => item.taskType === 'reading');
  const ctw = completed.filter((item) => item.taskType === 'ctw');
  const writing = completed.filter((item) => item.taskType === 'writing');
  const readingPoints = reading.reduce((sum, item) => sum + (item.result?.score || 0), 0);
  const readingMax = reading.reduce((sum, item) => sum + (item.result?.maxScore || 0), 0);
  const ctwDetails = [
    ...ctw.flatMap((item) => item.result?.details || []),
    ...reading.flatMap((item) => (item.result?.details || []).filter((detail) => detail.type === 'ctw' && detail.scored))
  ];
  const buildPoints = writing.reduce((sum, item) => sum + (item.result?.buildScore || 0), 0);
  const buildMax = writing.reduce((sum, item) => sum + (item.result?.buildMaxScore || 0), 0);
  const writingScores = writing.flatMap((item) => [item.result?.email?.score, item.result?.discussion?.score]).filter(Number.isFinite);
  return {
    total: completed.length,
    readingAccuracy: readingMax ? Math.round(readingPoints / readingMax * 100) : null,
    ctwAccuracy: ctwDetails.length ? Math.round(ctwDetails.filter((item) => item.correct).length / ctwDetails.length * 100) : null,
    buildAccuracy: buildMax ? Math.round(buildPoints / buildMax * 100) : null,
    writingAverage: writingScores.length ? (writingScores.reduce((a, b) => a + b, 0) / writingScores.length).toFixed(1) : null
  };
}

function ctestOptionsForSet(set) {
  return {
    targetLexicalPositions: set?.targetLexicalPositions || null,
    targetPolicy: set?.targetPolicy || (set?.targetLexicalPositions ? 'curated' : 'canonical-every-second-word')
  };
}

function weakSkills(attempts) {
  const map = new Map();
  attempts.forEach((attempt) => {
    if (attempt.taskType === 'ctw') {
      (attempt.result?.details || []).filter((d) => !d.correct).forEach((d) => {
        const key = `CTW · ${d.word}`; map.set(key, (map.get(key) || 0) + 1);
      });
    } else if (attempt.taskType === 'reading') {
      (attempt.result?.details || []).filter((d) => d.scored && !d.correct).forEach((d) => {
        const label = d.type === 'ctw' ? `CTW · ${d.word}` : `${d.type === 'daily' ? 'Daily Life' : 'Academic'} · ${d.skill || 'reading comprehension'}`;
        map.set(label, (map.get(label) || 0) + 1);
      });
    } else {
      (attempt.result?.buildDetails || []).filter((d) => !d.correct).forEach((d) => {
        (d.grammar || ['sentence structure']).forEach((tag) => { const key = `Build · ${tag}`; map.set(key, (map.get(key) || 0) + 1); });
      });
    }
  });
  return [...map.entries()].map(([label, misses]) => ({ label, misses })).sort((a,b)=>b.misses-a.misses).slice(0,5);
}

function sparkline(attempts, type) {
  const values = attempts
    .filter((item) => item.taskType === type && item.status === 'completed')
    .map((item) => {
      if (type === 'ctw' || type === 'reading') return (item.result?.score || 0) / Math.max(1, item.result?.maxScore || (type === 'reading' ? 35 : 10)) * 100;
      const email = item.result?.email?.score;
      const discussion = item.result?.discussion?.score;
      return Number.isFinite(email) && Number.isFinite(discussion) ? (email + discussion) / 10 * 100 : null;
    })
    .filter(Number.isFinite)
    .slice(0, 8)
    .reverse();
  if (!values.length) return `<div class="spark-empty">尚無趨勢</div>`;
  const width = 180, height = 48, pad = 4;
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : pad + index * ((width - pad * 2) / (values.length - 1));
    const y = height - pad - value / 100 * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="Recent score trend"><polyline points="${points}" fill="none" vector-effect="non-scaling-stroke"/><line x1="0" x2="${width}" y1="${height - pad}" y2="${height - pad}"/></svg>`;
}

function renderHome() {
  const data = currentData();
  const stats = computeStats(data.attempts);
  const recent = data.attempts.slice(0, 4);
  const current = data.currentAttempt;
  const dueWords = dueNotebookEntries(data);
  const weaknesses = weakSkills(data.attempts);
  const resumeCard = current ? `
    <section class="resume-banner">
      <div class="resume-icon">${icon('clock')}</div>
      <div class="resume-copy"><span>未完成作答</span><strong>${taskTypeName(current.taskType)} · ${stageLabel(current.stage)}</strong><small>最後儲存 ${formatDate(current.updatedAt)}</small></div>
      <div class="resume-actions"><button class="button ghost" data-action="discard-current">捨棄</button><button class="button primary" data-action="resume-current">繼續作答</button></div>
    </section>` : '';

  const recentRows = recent.length ? recent.map((item) => `
    <button class="recent-row" data-action="view-attempt" data-id="${attr(item.id)}">
      <span class="recent-task-icon ${item.taskType}">${taskTypeMark(item.taskType)}</span>
      <span class="recent-main"><strong>${taskTypeName(item.taskType)}</strong><small>${formatDate(item.completedAt)} · ${formatDuration(item.elapsedSec)}</small></span>
      <span class="recent-score">${attemptScoreLabel(item)}</span>
      ${icon('next')}
    </button>`).join('') : `<div class="empty-state compact"><strong>還沒有作答紀錄</strong><span>完成第一回後，這裡會顯示趨勢與可回看的答案。</span></div>`;

  return appShell(`
    ${pageHeading('TOEFL 2026 MOCK PRACTICE', '先用接近正式測驗的流程作答，再用練習系統看清弱點。', '正式模式包含 directions、分模組計時、模組鎖定與交卷後統一檢討；研究題在測驗中不會被標示。')}
    ${resumeCard}
    <section class="hero-grid formal-mock-grid">
      <article class="hero-card reading-card full-section-card">
        <div class="hero-card-top"><span class="section-chip">READING</span><span class="format-chip">2-stage · 50 presented</span></div>
        <h2>Full Reading Section</h2>
        <p>Module 1 混合 Complete the Words、日常文本與學術文章；完成後依作答進入 Module 2。兩個模組合計約 30 分鐘，跨模組不能返回。</p>
        <div class="module-diagram" aria-hidden="true"><span>MODULE 1<br><b>35 items</b></span><i>adaptive route</i><span>MODULE 2<br><b>15 items</b></span></div>
        <div class="hero-card-footer"><span>35 scored · 15 research · 2 original forms</span><button class="button light" data-action="start-reading">開始 Reading 模考 ${icon('next')}</button></div>
      </article>
      <article class="hero-card writing-card full-section-card">
        <div class="hero-card-top"><span class="section-chip">WRITING</span><span class="format-chip">10 + 1 + 1 tasks</span></div>
        <h2>Full Writing Section</h2>
        <p>Build a Sentence、7 分鐘 Email、10 分鐘 Academic Discussion；每一大題開始前有 directions，切換後不能返回上一大題。</p>
        <div class="writing-stages" aria-hidden="true"><span>BUILD</span><i></i><span>EMAIL</span><i></i><span>DISCUSS</span></div>
        <div class="hero-card-footer"><span>約 23 分鐘 · 無拼字輔助</span><button class="button light" data-action="start-writing">開始 Writing 模考 ${icon('next')}</button></div>
      </article>
    </section>
    <section class="targeted-practice-strip">
      <div><span class="eyebrow">FOCUSED PRACTICE</span><h2>先補單項弱點，再回完整模考。</h2><p>CTW、Daily Life 與 Academic Passage 都有原創單項練習；題庫品質頁可查看格式、domain、skill 與 grammar coverage。</p></div>
      <div class="targeted-actions"><button class="button ghost large" data-action="start-ctw">CTW 單篇</button><button class="button primary large" data-action="nav" data-view="practice">Focused Reading</button><button class="button ghost large" data-action="nav" data-view="content">題庫品質</button></div>
    </section>
    <section class="stats-grid">
      <article class="stat-card"><div class="stat-label">完成回數</div><strong>${stats.total}</strong><span>所有正式交卷</span></article>
      <article class="stat-card"><div class="stat-label">Reading 計分題</div><strong>${stats.readingAccuracy == null ? '—' : `${stats.readingAccuracy}%`}</strong>${sparkline(data.attempts, 'reading')}</article>
      <article class="stat-card"><div class="stat-label">CTW 正確率</div><strong>${stats.ctwAccuracy == null ? '—' : `${stats.ctwAccuracy}%`}</strong><span>含模考中的計分 CTW</span></article>
      <article class="stat-card"><div class="stat-label">寫作平均估分</div><strong>${stats.writingAverage == null ? '—' : `${stats.writingAverage}/5`}</strong>${sparkline(data.attempts, 'writing')}</article>
    </section>
    <section class="dashboard-grid">
      <article class="panel">
        <div class="panel-heading"><div><span class="eyebrow">RECENT ATTEMPTS</span><h2>最近作答</h2></div><button class="text-button" data-action="nav" data-view="records">查看全部 ${icon('next')}</button></div>
        <div class="recent-list">${recentRows}</div>
      </article>
      <article class="panel alignment-panel">
        <div class="panel-heading"><div><span class="eyebrow">NEXT REVIEW</span><h2>弱點與複習</h2></div><span class="status-pill">${dueWords.length} due</span></div>
        <div class="skill-list">${weaknesses.length ? weaknesses.map((x)=>`<div class="skill-row"><strong>${esc(x.label)}</strong><span>${x.misses} misses</span></div>`).join('') : '<div class="empty-state compact"><strong>還沒有弱點資料</strong><span>完成 Reading 或 Writing 後會自動整理。</span></div>'}</div>
        <button class="button subtle full" data-action="nav" data-view="vocabulary">複習到期單字</button>
      </article>
    </section>
  `);
}

function renderPractice() {
  const data = currentData();
  const prefs = data.preferences;
  const ctwOptions = CTEST_SETS.map((item) => `<option value="${item.id}">${esc(item.title)} · ${esc(item.level)}</option>`).join('');
  const readingOptions = READING_FORMS.map((item) => `<option value="${item.id}" ${prefs.readingFormId===item.id?'selected':''}>${esc(item.title)}</option>`).join('');
  const buildOptions = BUILD_SETS.map((item) => `<option value="${item.id}" ${prefs.buildSetId===item.id?'selected':''}>${esc(item.title)} · ${esc(item.level)}</option>`).join('');
  const dailyOptions = DAILY_PRACTICE_BANK.map((item) => `<option value="${item.id}">${esc(item.title)} · ${esc(String(item.type || '').replaceAll('-', ' '))}</option>`).join('');
  const academicOptions = ACADEMIC_PRACTICE_BANK.map((item) => `<option value="${item.id}">${esc(item.title)} · ${esc(item.domain || 'Academic')}</option>`).join('');
  const generatorLabel = prefs.provider === 'local'
    ? 'Validated local item bank'
    : `${prefs.provider} · ${prefs.generatorModel || prefs.model || 'server default'}`;
  const generationBusy = Boolean(ui.generating);
  return appShell(`
    ${pageHeading('PRACTICE', '選擇正式模考或單項訓練', 'Exam mode 會使用英文答題畫面、分模組計時與不可返回規則；中文只留在開始前與交卷後。')}
    <div class="mode-toggle" role="group" aria-label="Practice mode">
      <button class="${prefs.practiceMode === 'exam' ? 'active' : ''}" data-action="set-mode" data-mode="exam"><strong>Exam mode</strong><span>模組內可回看；跨模組與跨大題不可返回</span></button>
      <button class="${prefs.practiceMode === 'study' ? 'active' : ''}" data-action="set-mode" data-mode="study"><strong>Study mode</strong><span>測驗流程不變，交卷後顯示更完整解析</span></button>
    </div>
    <section class="practice-grid formal-practice-grid">
      <article class="practice-card featured-practice-card">
        <div class="practice-visual reading-module-visual"><div class="mock-top"></div><div class="mini-module"><b>Module 1</b><span>CTW · Daily Life · Academic</span><i></i><b>Module 2</b></div></div>
        <div class="practice-body">
          <div class="practice-title-row"><span class="section-chip teal">READING</span><span class="verified-chip">2-stage mock</span></div>
          <h2>Full Reading Section</h2>
          <p>呈現 50 題、35 題計分。第一模組 35 題／21 分鐘，第二模組 15 題／9 分鐘；15 題研究題只在交卷後揭露。</p>
          <label class="field"><span>模考題本</span><select id="reading-form-select">${readingOptions}</select></label>
          <div class="stage-summary"><span><b>35</b> Module 1</span><span><b>route</b> adaptive</span><span><b>15</b> Module 2</span></div>
          <button class="button primary full large" data-action="start-reading">Start Reading Section</button>
        </div>
      </article>
      <article class="practice-card featured-practice-card">
        <div class="practice-visual build-visual"><div class="mock-top"></div><div class="mock-bubbles"><span>Do</span><span>you</span><span>know</span><span>where</span></div></div>
        <div class="practice-body">
          <div class="practice-title-row"><span class="section-chip navy">WRITING</span><span class="verified-chip">Full sequence</span></div>
          <h2>Writing Section</h2>
          <p>10 題 Build、Email、Academic Discussion。每一大題有獨立 directions／計時，進入下一大題後無法返回。</p>
          <label class="field"><span>Build 題組</span><select id="build-set-select">${buildOptions}</select></label>
          <div class="stage-summary"><span><b>10</b> Build</span><span><b>7m</b> Email</span><span><b>10m</b> Discussion</span></div>
          <button class="button primary full large" data-action="start-writing">Start Writing Section</button>
        </div>
      </article>
      <article class="practice-card compact-practice-card">
        <div class="practice-body">
          <div class="practice-title-row"><span class="section-chip teal">DRILL</span><span class="verified-chip">Rule-checked</span></div>
          <h2>Complete the Words</h2>
          <p>單篇 70–100 words、完整第一句、10 個缺口。這是技能訓練，不會偽裝成完整 Reading section。</p>
          <label class="field"><span>題組</span><select id="ctw-set-select">${ctwOptions}</select></label>
          <button class="button ghost full large" data-action="start-ctw">Start CTW Drill</button>
        </div>
      </article>
      <article class="practice-card compact-practice-card focused-practice-card">
        <div class="practice-body">
          <div class="practice-title-row"><span class="section-chip teal">FOCUSED</span><span class="verified-chip">14 formats covered</span></div>
          <h2>Read in Daily Life</h2>
          <p>依 notice、schedule、social post、menu、invoice、receipt 等真實生活格式練習；交卷後立即看 skill 與解析。</p>
          <label class="field"><span>Stimulus</span><select id="focused-daily-select">${dailyOptions}</select></label>
          <div class="card-action-pair"><button class="button ghost" data-action="generate-focused" data-kind="daily" ${generationBusy ? 'disabled' : ''}>${ui.generating === 'daily' ? 'Generating…' : prefs.provider === 'local' ? 'Random' : 'Generate'}</button><button class="button primary" data-action="start-focused" data-kind="daily">Start</button></div>
        </div>
      </article>
      <article class="practice-card compact-practice-card focused-practice-card">
        <div class="practice-body">
          <div class="practice-title-row"><span class="section-chip navy">FOCUSED</span><span class="verified-chip">6 domains covered</span></div>
          <h2>Academic Passage</h2>
          <p>約 200 字原創文章與五題 skill blueprint；目前涵蓋 history、science、economics、arts、life 與 social science。</p>
          <label class="field"><span>Passage</span><select id="focused-academic-select">${academicOptions}</select></label>
          <div class="card-action-pair"><button class="button ghost" data-action="generate-focused" data-kind="academic" ${generationBusy ? 'disabled' : ''}>${ui.generating === 'academic' ? 'Generating…' : prefs.provider === 'local' ? 'Random' : 'Generate'}</button><button class="button primary" data-action="start-focused" data-kind="academic">Start</button></div>
        </div>
      </article>
    </section>
    <section class="panel generator-panel">
      <div class="panel-heading"><div><span class="eyebrow">QUESTION ENGINE</span><h2>生成 → 驗證 → 立即作答</h2><p>目前來源：${esc(generatorLabel)}。LLM 可生成 CTW、Daily Life、Academic Passage 或 Writing tasks；完整 adaptive Reading form 必須經題本層級審查，不會由單次生成直接拼裝。</p></div><span class="status-pill ${prefs.provider === 'local' ? 'neutral' : ''}">${prefs.provider === 'local' ? 'LOCAL BANK' : 'LLM + VERIFY'}</span></div>
      <div class="generator-actions">
        <button class="button ghost large" data-action="generate-ctw" ${generationBusy ? 'disabled' : ''}>${ui.generating === 'ctw' ? 'Generating CTW…' : prefs.provider === 'local' ? 'Random validated CTW' : 'Generate CTW with LLM'}</button>
        <button class="button primary large" data-action="generate-writing" ${generationBusy ? 'disabled' : ''}>${ui.generating === 'writing' ? 'Generating Writing…' : prefs.provider === 'local' ? 'Random full Writing set' : 'Generate full Writing set'}</button>
      </div>
      ${ui.generationMessage ? `<div class="generation-message">${esc(ui.generationMessage)}</div>` : ''}
      <p class="small-note">完整 Reading form 的難度與研究題配置需要人工與作答資料驗證；因此 LLM 生成內容不會自動晉升為正式模考題本。</p>
    </section>
    <section class="notice-card">
      <div class="notice-icon">i</div><div><strong>關於 adaptive routing</strong><p>v6 使用透明的練習用 1PL/EAP 路由，依 Module 1 的 20 個計分題選擇 Module 2；題目尚未經大樣本 psychometric calibration，因此路由與 0–35 raw score 都是研究型模擬，不宣稱等同 ETS operational scoring。</p></div>
    </section>
  `);
}

function attemptScoreLabel(attempt) {
  if (attempt.taskType === 'ctw') return `${attempt.result?.score ?? 0}/${attempt.result?.maxScore ?? 10}`;
  if (attempt.taskType === 'reading') return `${attempt.result?.score ?? 0}/${attempt.result?.maxScore ?? 35} · ${attempt.result?.route === 'upper' ? 'Route U' : 'Route L'}`;
  const build = attempt.result?.buildScore ?? 0;
  const email = Number.isFinite(attempt.result?.email?.score) ? attempt.result.email.score : '—';
  const discussion = Number.isFinite(attempt.result?.discussion?.score) ? attempt.result.discussion.score : '—';
  return `${build}/10 · ${email}/${discussion}`;
}

function stageLabel(stage) {
  return ({
    'reading-intro': 'Section Directions', router: 'Module 1', 'reading-transition': 'Module Transition', module2: 'Module 2',
    'writing-intro': 'Section Directions', build: 'Build a Sentence', 'email-intro': 'Email Directions', email: 'Write an Email',
    'discussion-intro': 'Discussion Directions', discussion: 'Academic Discussion', ctw: 'Complete the Words'
  })[stage] || stage || '';
}

function renderRecords() {
  const data = currentData();
  const storage = getStorageStatus();
  const attempts = data.attempts.filter((item) => ui.recordFilter === 'all' || item.taskType === ui.recordFilter);
  const rows = attempts.length ? attempts.map((item) => `
    <tr>
      <td><span class="record-type ${item.taskType}">${taskTypeMark(item.taskType)}</span></td>
      <td><button class="record-title" data-action="view-attempt" data-id="${attr(item.id)}">${taskTypeName(item.taskType)}<small>${esc(item.setTitle || item.setId || '')}</small></button></td>
      <td>${formatDate(item.completedAt)}</td>
      <td>${formatDuration(item.elapsedSec)}</td>
      <td><strong>${attemptScoreLabel(item)}</strong></td>
      <td><button class="icon-button" data-action="view-attempt" data-id="${attr(item.id)}" aria-label="Review attempt">${icon('next')}</button></td>
    </tr>`).join('') : `<tr><td colspan="6"><div class="empty-state"><strong>找不到符合條件的紀錄</strong><span>完成練習後，全文、答案、路由與時間都會保留在這裡。</span></div></td></tr>`;

  return appShell(`
    ${pageHeading('HISTORY', '作答紀錄', `最近 ${storage.maxAttempts} 回保存在這台瀏覽器；完整 Reading 會保存 Module 路由、計分題與研究題結果。`, `
      <button class="button ghost" data-action="export-csv">${icon('download')} CSV</button>
      <button class="button ghost" data-action="export-json">${icon('download')} JSON</button>
      <button class="button primary" data-action="trigger-import">${icon('upload')} 匯入</button>
      <input id="import-file" type="file" accept="application/json" hidden>
    `)}
    <section class="records-toolbar">
      <div class="segmented">
        <button class="${ui.recordFilter === 'all' ? 'active' : ''}" data-action="record-filter" data-filter="all">全部</button>
        <button class="${ui.recordFilter === 'reading' ? 'active' : ''}" data-action="record-filter" data-filter="reading">Reading 模考</button>
        <button class="${ui.recordFilter === 'ctw' ? 'active' : ''}" data-action="record-filter" data-filter="ctw">CTW 單篇</button>
        <button class="${ui.recordFilter === 'writing' ? 'active' : ''}" data-action="record-filter" data-filter="writing">Writing</button>
      </div>
      <div class="record-count">顯示 ${attempts.length} 回 · 已保留 ${data.attempts.length}/${storage.maxAttempts}</div>
    </section>
    <section class="panel table-panel">
      <div class="table-wrap"><table class="records-table">
        <thead><tr><th></th><th>練習</th><th>日期</th><th>用時</th><th>成績</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </section>
    ${data.attempts.length ? `<div class="danger-row"><button class="text-button danger" data-action="clear-records">清除所有作答紀錄</button></div>` : ''}
  `);
}

function errorWordFrequency(attempts) {
  const map = new Map();
  attempts.forEach((attempt) => {
    const details = attempt.taskType === 'ctw'
      ? (attempt.result?.details || [])
      : attempt.taskType === 'reading'
        ? (attempt.result?.details || []).filter((detail) => detail.type === 'ctw' && detail.scored)
        : [];
    details.filter((detail) => !detail.correct && detail.word).forEach((detail) => {
      const key = String(detail.word).toLowerCase();
      const current = map.get(key) || { word: detail.word, misses: 0, attempts: 0 };
      current.misses += 1;
      current.attempts += 1;
      map.set(key, current);
    });
  });
  return [...map.values()].sort((a, b) => b.misses - a.misses);
}

function renderVocabulary() {
  const data = currentData();
  const query = ui.vocabSearch.trim().toLowerCase();
  const mistakes = errorWordFrequency(data.attempts);
  const mistakeWords = new Set(mistakes.map((item) => item.word.toLowerCase()));
  const dueEntries = dueNotebookEntries(data);
  let words = ui.vocabFilter === 'saved'
    ? data.notebook
    : ui.vocabFilter === 'due'
      ? dueEntries
    : ui.vocabFilter === 'mistakes'
      ? VOCABULARY_BANK.filter((item) => mistakeWords.has(item.word.toLowerCase()))
      : VOCABULARY_BANK.filter((item) => ui.vocabFilter === 'all' || item.category === ui.vocabFilter);
  if (query) {
    words = words.filter((item) => [item.word, item.meaning, item.family, item.collocation, item.category, item.cefr].some((value) => String(value || '').toLowerCase().includes(query)));
  }
  const cards = words.length ? words.map((item) => {
    const savedEntry = data.notebook.find((entry) => entry.word.toLowerCase() === item.word.toLowerCase());
    const saved = Boolean(savedEntry);
    const misses = mistakes.find((entry) => entry.word.toLowerCase() === item.word.toLowerCase())?.misses || 0;
    const isDue = savedEntry && (!savedEntry.nextReviewAt || new Date(savedEntry.nextReviewAt).getTime() <= Date.now());
    return `<article class="word-card ${isDue ? 'due-word' : ''}">
      <div class="word-head"><div><h3>${esc(item.word)}</h3><span>${esc(item.pos || '')}</span></div><button class="bookmark-button ${saved ? 'saved' : ''}" data-action="toggle-word" data-word="${attr(item.word)}" aria-label="${saved ? 'Remove from notebook' : 'Save word'}">${icon('bookmark')}</button></div>
      <div class="word-tags"><span>${esc(item.cefr || '—')}</span><span>${esc(item.category || 'saved')}</span>${misses ? `<span class="miss-tag">錯 ${misses} 次</span>` : ''}${isDue ? '<span class="due-tag">Due now</span>' : ''}</div>
      <p>${esc(item.meaning || '')}</p>
      <dl><div><dt>Word family</dt><dd>${esc(item.family || '—')}</dd></div><div><dt>Common use</dt><dd>${esc(item.collocation || '—')}</dd></div></dl>
      ${savedEntry ? `<div class="review-meta"><span>Reviewed ${savedEntry.reviewCount || 0}×</span><span>${isDue ? 'Ready to review' : `Next ${formatDate(savedEntry.nextReviewAt, false)}`}</span></div>` : ''}
      ${isDue ? `<div class="review-buttons"><button data-action="review-word" data-id="${attr(savedEntry.id)}" data-rating="again">Again</button><button data-action="review-word" data-id="${attr(savedEntry.id)}" data-rating="hard">Hard</button><button data-action="review-word" data-id="${attr(savedEntry.id)}" data-rating="good">Good</button></div>` : ''}
    </article>`;
  }).join('') : `<div class="empty-state wide"><strong>目前沒有符合的單字</strong><span>可從 CTW 檢討頁加入單字本，或調整篩選條件。</span></div>`;

  return appShell(`
    ${pageHeading('VOCABULARY', '新托福單字範圍', '不是背一份「官方清單」，而是依題型分配一般字彙、校園語境、學術高頻字、詞族與篇章銜接。')}
    <section class="vocab-scope panel">
      <div class="scope-copy"><span class="eyebrow">RANGE MODEL</span><h2>A1–C2 全量能力，練習預設聚焦 B1–C1</h2><p>Complete the Words 偏向可從語境與詞形恢復的常見文字；Academic Passage 才需要更廣的跨領域學術字彙。生成器會限制術語密度、專有名詞與背景知識需求。</p></div>
      <div class="cefr-track"><span>A1</span><span>A2</span><span class="focus">B1</span><span class="focus">B2</span><span class="focus">C1</span><span>C2</span></div>
    </section>
    <section class="vocab-toolbar">
      <label class="search-field"><span aria-hidden="true">⌕</span><input data-vocab-search value="${attr(ui.vocabSearch)}" placeholder="搜尋單字、詞族或搭配…"></label>
      <div class="filter-scroll">
        ${[
          ['all', '全部'], ['academic', '學術核心'], ['campus', '校園'], ['morphology', '詞族'], ['cohesion', '銜接'], ['advanced', '進階'], ['mistakes', '常錯'], ['due', `到期 ${dueEntries.length}`], ['saved', `單字本 ${data.notebook.length}`]
        ].map(([key, label]) => `<button class="filter-chip ${ui.vocabFilter === key ? 'active' : ''}" data-action="vocab-filter" data-filter="${key}">${label}</button>`).join('')}
      </div>
    </section>
    <section class="word-grid">${cards}</section>
  `);
}


function coverageMeter(label, coverage, description = '') {
  const total = coverage.covered.length + coverage.missing.length;
  const percent = total ? Math.round(coverage.covered.length / total * 100) : 100;
  return `<article class="coverage-meter">
    <div class="coverage-meter-head"><div><strong>${esc(label)}</strong>${description ? `<span>${esc(description)}</span>` : ''}</div><b>${coverage.covered.length}/${total}</b></div>
    <div class="coverage-track" aria-label="${attr(label)} ${percent}% covered"><i style="width:${percent}%"></i></div>
    <div class="coverage-tags">${coverage.covered.map((item) => `<span class="covered">${esc(item)}</span>`).join('')}${coverage.missing.map((item) => `<span class="missing">${esc(item)}</span>`).join('')}</div>
  </article>`;
}

function renderContentIntelligence() {
  const report = CONTENT_REPORT;
  const counts = report.counts;
  const sourceRows = OFFICIAL_SOURCE_REGISTRY.map((source) => `
    <tr>
      <td><strong>${esc(source.title)}</strong><small>${esc(source.publisher)} · verified ${esc(source.verifiedAt)}</small></td>
      <td>${esc(source.sourceType.replaceAll('-', ' '))}</td>
      <td>${esc(source.uiFidelity.replaceAll('-', ' '))}</td>
      <td><span class="source-license">${esc(source.license)}</span></td>
      <td><a class="text-link" href="${attr(source.url)}" target="_blank" rel="noreferrer">Open source</a></td>
    </tr>`).join('');
  const sectionCards = [
    ['CTW passages', counts.ctwPassages, `${report.sections.ctw.valid}/${report.sections.ctw.count} structural pass`],
    ['Daily Life', counts.dailyStimuli, `${counts.dailyQuestions} questions · ${counts.focusedDailyStimuli} focused-only`],
    ['Academic', counts.academicPassages, `${counts.academicQuestions} questions · ${counts.focusedAcademicPassages} focused-only`],
    ['Build', counts.buildItems, `${counts.buildSets} complete sets`],
    ['Email', counts.emailTasks, '3 communication goals each'],
    ['Discussion', counts.discussionTasks, '2 distinct student posts each']
  ].map(([label, value, note]) => `<article class="content-kpi"><span>${esc(label)}</span><strong>${value}</strong><small>${esc(note)}</small></article>`).join('');
  return appShell(`
    ${pageHeading('CONTENT INTELLIGENCE', '題庫不只要像 TOEFL，還要可追溯、可驗證、可審核。', '此頁將官方公開規格轉為結構化藍圖與 release gates。Coverage 只代表內容面向已覆蓋，不代表題目已完成心理計量校準。', `<button class="button ghost" data-action="download-content-audit">${icon('download')} 匯出 Audit</button>`)}
    <section class="content-hero panel">
      <div class="content-score-ring"><strong>${report.editorialCoverageScore}</strong><span>/100</span><small>editorial coverage</small></div>
      <div><span class="eyebrow">RELEASE GATE</span><h2>${report.releaseGate.structuralPass ? 'Structural checks pass' : 'Structural blockers found'}</h2><p>${report.hardErrors.length} hard errors、${report.warnings.length} editorial warnings、${report.duplicates.nearDuplicates.length} near-duplicate pairs。所有題目仍需 human review 與 pilot；這個分數不是難度、鑑別度或官方成績可信度。</p><div class="gate-pills"><span class="pass">Deterministic validation</span><span class="pass">Source policy</span><span class="required">Human review required</span><span class="required">Pilot required</span></div></div>
    </section>
    <section class="content-kpi-grid">${sectionCards}</section>
    <section class="content-grid">
      <article class="panel coverage-panel">
        <div class="panel-heading"><div><span class="eyebrow">COVERAGE MATRIX</span><h2>官方公開題型範圍</h2><p>綠色為目前原創題庫已覆蓋；橘色代表需要新增內容。</p></div><span class="status-pill">${counts.readingForms} PARALLEL FORMS</span></div>
        <div class="coverage-list">
          ${coverageMeter('Daily Life formats', report.coverage.dailyFormats, '14 public stimulus families')}
          ${coverageMeter('Daily Life skills', report.coverage.dailySkills, 'purpose, scan, inference, informal language and more')}
          ${coverageMeter('Academic domains', report.coverage.academicDomains, 'six public domain families')}
          ${coverageMeter('Academic skills', report.coverage.academicSkills, 'five-question passage blueprints')}
          ${coverageMeter('Build grammar', report.coverage.buildGrammar, '15 tracked grammar families')}
          ${coverageMeter('Email purposes', report.coverage.emailPurposes, 'communication-purpose diversity')}
        </div>
      </article>
      <aside class="panel content-policy-panel">
        <div class="panel-heading"><div><span class="eyebrow">CONTENT SAFETY</span><h2>來源政策</h2></div></div>
        <div class="policy-rule allow"><b>Allowed</b><p>原創、正式授權、public-domain material，以及從公開 ETS 文件抽取的規格與 coverage targets。</p></div>
        <div class="policy-rule deny"><b>Never ingest</b><p>外流題、live item 回憶、operational item、未知來源的改寫題，或保留官方題幹與 distractor 結構的近似重製。</p></div>
        <ol class="lifecycle-list"><li><b>Draft</b><span>Original generation only</span></li><li><b>Validate</b><span>Schema + deterministic gates</span></li><li><b>Review</b><span>Language, construct, fairness</span></li><li><b>Pilot</b><span>Responses + timing</span></li><li><b>Active</b><span>Only after evidence review</span></li></ol>
      </aside>
    </section>
    <section class="panel source-registry-panel">
      <div class="panel-heading"><div><span class="eyebrow">OFFICIAL SOURCE REGISTRY</span><h2>${OFFICIAL_SOURCE_REGISTRY.length} 個公開 ETS 來源</h2><p>只保存 metadata、用途與禁止事項；不把官方題目文字打包進題庫或生成 prompt。</p></div><span class="status-pill neutral">REFERENCE ONLY</span></div>
      <div class="table-wrap"><table class="source-table"><thead><tr><th>Source</th><th>Type</th><th>UI fidelity</th><th>Use</th><th></th></tr></thead><tbody>${sourceRows}</tbody></table></div>
    </section>
    <section class="notice-card measurement-note"><div class="notice-icon">i</div><div><strong>Coverage is not calibration</strong><p>${esc(report.psychometricCalibration.note)} 目前 routing、difficulty 與 1–6 score 都不會被描述成官方等效。</p></div></section>
  `);
}

function focusedBank(kind) {
  return kind === 'academic' ? ACADEMIC_PRACTICE_BANK : DAILY_PRACTICE_BANK;
}

function startFocusedPractice(kind, itemId = null, itemOverride = null, generationMeta = null) {
  const bank = focusedBank(kind);
  const item = itemOverride || bank.find((candidate) => candidate.id === itemId) || bank[Math.floor(Math.random() * bank.length)];
  ui.focused = {
    kind,
    item: structuredClone(item),
    answers: {},
    submitted: false,
    startedAt: Date.now(),
    generationMeta
  };
  ui.exam = null;
  ui.view = 'focused';
  render();
  requestAnimationFrame(() => document.querySelector('[data-focused-option]')?.focus());
}

function focusedResult(session = ui.focused) {
  const questions = session?.item?.questions || [];
  const details = questions.map((question) => ({
    id: question.id,
    response: session.answers?.[question.id] || '',
    answer: question.answer,
    correct: session.answers?.[question.id] === question.answer,
    skill: question.skill,
    explanation: question.explanation || ''
  }));
  return {
    score: details.filter((item) => item.correct).length,
    maxScore: details.length,
    unanswered: details.filter((item) => !item.response).length,
    details
  };
}

function renderFocusedPractice() {
  const session = ui.focused;
  if (!session?.item) {
    ui.view = 'practice';
    return renderPractice();
  }
  const item = session.item;
  const result = focusedResult(session);
  const kindLabel = session.kind === 'academic' ? 'Read an Academic Passage' : 'Read in Daily Life';
  const metadata = session.kind === 'academic'
    ? `${item.domain || 'Academic'} · ${countWords(item.text)} words · 5 questions`
    : `${String(item.type || 'daily').replaceAll('-', ' ')} · ${countWords(item.text)} words · ${(item.questions || []).length} questions`;
  const questions = (item.questions || []).map((question, index) => {
    const selected = session.answers[question.id] || '';
    const options = question.options.map((option) => {
      const correct = session.submitted && option.id === question.answer;
      const incorrect = session.submitted && option.id === selected && selected !== question.answer;
      return `<label class="focused-option ${correct ? 'correct' : ''} ${incorrect ? 'incorrect' : ''}"><input type="radio" name="focused-${attr(question.id)}" value="${attr(option.id)}" data-focused-option data-question-id="${attr(question.id)}" ${selected === option.id ? 'checked' : ''} ${session.submitted ? 'disabled' : ''}><span class="option-letter">${esc(option.id)}</span><span>${esc(option.text)}</span></label>`;
    }).join('');
    const detail = result.details[index];
    return `<article class="focused-question ${session.submitted ? (detail.correct ? 'answered-correct' : 'answered-wrong') : ''}"><div class="focused-question-head"><span>Question ${index + 1}</span>${session.submitted ? `<b>${detail.correct ? 'Correct' : 'Incorrect'} · ${esc(question.skill || '')}</b>` : ''}</div><h3>${esc(question.stem)}</h3><div class="focused-options">${options}</div>${session.submitted ? `<div class="focused-explanation"><strong>Answer: ${esc(question.answer)}</strong><p>${esc(question.explanation || 'No explanation available.')}</p></div>` : ''}</article>`;
  }).join('');
  return appShell(`
    <div class="focused-topbar"><button class="text-button" data-action="close-focused">${icon('back')} 回到練習選單</button><span class="status-pill neutral">GUIDED PRACTICE · NOT A MOCK</span></div>
    ${pageHeading('FOCUSED READING', kindLabel, metadata, session.submitted ? `<div class="result-badge big">${result.score}<span>/${result.maxScore}</span></div>` : '')}
    <section class="focused-layout">
      <article class="panel focused-stimulus"><div class="focused-stimulus-meta"><span>${esc(item.label || item.domain || kindLabel)}</span><b>Original practice item</b></div><h2>${esc(item.title)}</h2><div class="focused-stimulus-text">${esc(item.text).replace(/\n/g, '<br>')}</div></article>
      <div class="focused-question-list">${questions}</div>
    </section>
    <section class="focused-actions panel">
      <div>${session.submitted ? `<strong>${result.score}/${result.maxScore}</strong><span>檢查每題解析後，可換下一篇同題型原創練習。</span>` : `<strong>${Object.keys(session.answers).length}/${result.maxScore} answered</strong><span>Focused Practice 交卷後立即顯示答案與 skill；正式模考不會即時回饋。</span>`}</div>
      <div>${session.submitted ? `<button class="button ghost" data-action="restart-focused">再做一次</button><button class="button primary" data-action="next-focused">下一篇</button>` : `<button class="button primary" data-action="submit-focused">Check Answers</button>`}</div>
    </section>
  `);
}

function renderSettings() {
  const { preferences } = currentData();
  return appShell(`
    ${pageHeading('SYSTEM', '模型、批改與題目框架', 'API Key 只放在伺服器環境變數；瀏覽器只呼叫你自己的 generate / grade routes。')}
    <section class="settings-grid">
      <article class="panel settings-card">
        <div class="panel-heading"><div><span class="eyebrow">LLM PROVIDER</span><h2>Provider-neutral adapter</h2></div><span class="status-pill neutral">Server-side</span></div>
        <div class="form-grid two">
          <label class="field"><span>Provider</span><select data-setting="provider">
            <option value="local" ${preferences.provider === 'local' ? 'selected' : ''}>Local analysis only · no 0–5 score</option>
            <option value="openai-compatible" ${preferences.provider === 'openai-compatible' ? 'selected' : ''}>OpenAI-compatible / vLLM / SGLang</option>
            <option value="anthropic" ${preferences.provider === 'anthropic' ? 'selected' : ''}>Anthropic</option>
            <option value="gemini" ${preferences.provider === 'gemini' ? 'selected' : ''}>Gemini</option>
          </select></label>
          <label class="field"><span>Default model</span><input data-setting="model" value="${attr(preferences.model)}" placeholder="server default if blank"></label>
          <label class="field"><span>Generator model</span><input data-setting="generatorModel" value="${attr(preferences.generatorModel || '')}" placeholder="optional override"></label>
          <label class="field"><span>Verifier model</span><input data-setting="verifierModel" value="${attr(preferences.verifierModel || '')}" placeholder="optional override"></label>
          <label class="field"><span>Grader model</span><input data-setting="graderModel" value="${attr(preferences.graderModel || '')}" placeholder="optional override"></label>
          <label class="field"><span>Adjudicator model</span><input data-setting="adjudicatorModel" value="${attr(preferences.adjudicatorModel || '')}" placeholder="optional override"></label>
          <label class="field"><span>API base（可留空）</span><input data-setting="apiBase" value="${attr(preferences.apiBase)}" placeholder="same-origin by default"></label>
          <label class="field"><span>Grade route</span><input data-setting="gradeRoute" value="${attr(preferences.gradeRoute)}"></label>
          <label class="field"><span>Generate route</span><input data-setting="generateRoute" value="${attr(preferences.generateRoute)}"></label>
        </div>
        <div class="settings-actions"><button class="button ghost" data-action="test-provider">測試後端連線</button><span id="provider-status" class="muted">未測試</span></div>
      </article>
      <article class="panel settings-card">
        <div class="panel-heading"><div><span class="eyebrow">SCORING PIPELINE</span><h2>題型分流批改</h2></div></div>
        <div class="pipeline-list">
          <div><span class="pipeline-num">01</span><p><strong>CTW</strong>缺少字母 exact match，不讓 LLM 決定正誤。</p></div>
          <div><span class="pipeline-num">02</span><p><strong>Build</strong>依 tile ID 排列與可接受答案 key-scoring。</p></div>
          <div><span class="pipeline-num">03</span><p><strong>Email / Discussion</strong>以 0–5 holistic rubric 評分，回傳引用片段、診斷與信心。</p></div>
          <div><span class="pipeline-num">04</span><p><strong>Dual pass</strong>兩次評分相差 ≥1 分時進入 adjudication。</p></div>
        </div>
      </article>
      <article class="panel settings-card wide-card">
        <div class="panel-heading"><div><span class="eyebrow">QUESTION QUALITY GATE</span><h2>生成後不直接上線</h2></div></div>
        <div class="quality-grid">
          <div><strong>Schema</strong><span>欄位、數量、答案格式完整</span></div>
          <div><strong>C-test validator</strong><span>完整第一句、隔詞截半、10 缺口</span></div>
          <div><strong>Language fit</strong><span>CEFR、詞族、術語與專名密度</span></div>
          <div><strong>Uniqueness</strong><span>Build 排列唯一或明列多解</span></div>
          <div><strong>Fairness</strong><span>不依賴專門背景或文化內梗</span></div>
          <div><strong>Verifier + dedupe</strong><span>第二模型品質審查＋與本地題庫 n-gram 近重複檢查</span></div>
        </div>
      </article>
      <article class="panel settings-card wide-card source-card">
        <div><span class="eyebrow">OFFICIAL ALIGNMENT</span><h2>本版採用的規則基線</h2></div>
        <ul class="source-list">
          <li><strong>Reading structure:</strong> 兩階段 adaptive module；本模考呈現 50 題，其中 35 題列入練習 raw score，Module 1 後不可返回。</li>
          <li><strong>Complete the Words:</strong> C-test；第一句完整、每隔一詞刪後半、每篇 10 個截斷詞。</li>
          <li><strong>Read in Daily Life:</strong> 短篇日常文本搭配 2–3 題單選；題材包含 notice、email、schedule 與 message exchange。</li>
          <li><strong>Academic Passage:</strong> 約 200 words 的跨領域短文，通常搭配 5 題理解、詞彙、推論與篇章目的題。</li>
          <li><strong>Build a Sentence:</strong> 拖曳錯序單字／片語形成正確句子或問句；每題 0/1。</li>
          <li><strong>Write an Email:</strong> 7 分鐘；達成溝通目的、展開、句法詞彙、社交慣例、語言正確性。</li>
          <li><strong>Academic Discussion:</strong> 10 分鐘；建議至少 100 字；題目與同學貼文持續顯示。</li>
          <li><strong>Writing controls:</strong> 有 word count，沒有 spell-check。</li>
        </ul>
        <p class="small-note">完整研究來源與實作界線收錄於專案的 <code>RESEARCH.md</code>。Practice Lab 不輸出「官方 1–6 分」假換算。Reading 路由使用透明但未校準的 practice EAP/1PL 模型；它只能模擬流程，不能聲稱複製 ETS 營運路由。Writing 未接 rubric grader 時不產生 0–5；即使接上 LLM，1–6 section score 仍需正式校準與 equating。</p>
      </article>
    </section>
  `);
}

function renderAttemptDetail(attempt) {
  if (!attempt) {
    ui.view = 'records';
    return renderRecords();
  }
  const content = attempt.taskType === 'ctw'
    ? renderCtwReview(attempt)
    : attempt.taskType === 'reading'
      ? renderReadingReview(attempt)
      : renderWritingReview(attempt);
  return appShell(`
    <div class="detail-back"><button class="text-button" data-action="nav" data-view="records">${icon('back')} 回到作答紀錄</button></div>
    ${content}
  `);
}

function renderCtwReview(attempt) {
  const set = findCtestSet(attempt.setId);
  const sourceText = attempt.questionSnapshot?.sourceText || set.sourceText;
  const snapshotSet = { ...set, ...(attempt.questionSnapshot || {}), id: attempt.setId, title: attempt.questionSnapshot?.title || attempt.setTitle || set.title };
  const ctest = createCtest(sourceText, ctestOptionsForSet(snapshotSet));
  const details = attempt.result?.details || gradeCtest(ctest, attempt.answers).details;
  const detailMap = new Map(details.map((item) => [item.id, item]));
  const passage = ctest.segments.map((segment) => {
    if (segment.type === 'text') return esc(segment.text);
    const detail = detailMap.get(segment.id) || segment;
    return `<span class="review-gap ${detail.correct ? 'correct' : 'incorrect'}"><span>${esc(segment.visible)}</span><b>${esc(segment.answer)}</b><small>${detail.correct ? '✓' : esc(detail.response || 'blank')}</small></span>`;
  }).join('');
  const rows = details.map((item) => `
    <tr><td>${item.number}</td><td><strong>${esc(item.word)}</strong></td><td>${esc(item.visible)} + <b>${esc(item.answer)}</b></td><td class="${item.correct ? 'answer-ok' : 'answer-bad'}">${esc(item.response || '—')}</td><td>${item.correct ? '<span class="result-ok">Correct</span>' : '<span class="result-bad">Incorrect</span>'}</td><td><button class="bookmark-button small" data-action="save-review-word" data-word="${attr(item.word)}" data-set="${attr(attempt.setId)}">${icon('bookmark')}</button></td></tr>`).join('');
  return `
    ${pageHeading('READING REVIEW', snapshotSet.title, `${snapshotSet.domain} · ${snapshotSet.level} · ${formatDate(attempt.completedAt)}`, `<div class="result-badge big">${attempt.result?.score ?? 0}<span>/10</span></div>`)}
    <section class="panel review-passage"><div class="review-legend"><span><i class="correct"></i>正確</span><span><i class="incorrect"></i>錯誤／空白</span></div><p>${passage}</p></section>
    <section class="panel table-panel"><div class="panel-heading"><div><span class="eyebrow">ANSWER DETAILS</span><h2>10 個截斷詞</h2></div><span class="muted">只補 missing letters</span></div><div class="table-wrap"><table class="review-table"><thead><tr><th>#</th><th>完整單字</th><th>Target split</th><th>你的輸入</th><th>結果</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="review-actions"><button class="button ghost" data-action="nav" data-view="vocabulary">查看單字本</button><button class="button primary" data-action="retry-attempt" data-id="${attr(attempt.id)}">再做一回</button></section>
  `;
}


function renderReadingReview(attempt) {
  const result = attempt.result || {};
  const details = result.details || [];
  const scored = details.filter((item) => item.scored);
  const research = details.filter((item) => item.research);
  const typeLabel = { ctw: 'Complete the Words', daily: 'Read in Daily Life', academic: 'Academic Passage' };
  const routeLabel = result.route === 'upper' ? 'Upper-difficulty practice route' : 'Lower-difficulty practice route';
  const rows = details.map((item) => {
    const answer = item.type === 'ctw' ? item.word : item.answer;
    const response = item.type === 'ctw' ? (item.response ? `${item.visible}${item.response}` : '—') : (item.response || '—');
    return `<tr class="${item.research ? 'research-row' : ''}">
      <td>${item.moduleName === 'router' ? 'M1' : 'M2'} · ${item.itemNumber}</td><td>${esc(typeLabel[item.type] || item.type)}</td><td>${esc(item.skill || (item.type === 'ctw' ? 'word completion' : ''))}</td>
      <td>${esc(response)}</td><td>${esc(answer)}</td><td>${item.correct ? '<span class="result-ok">Correct</span>' : '<span class="result-bad">Incorrect</span>'}</td>
      <td>${item.research ? '<span class="research-chip">Research</span>' : '<span class="scored-chip">Scored</span>'}</td>
    </tr>`;
  }).join('');
  const skillCards = Object.entries(result.byType || {}).map(([type, value]) => `<article><span>${esc(typeLabel[type] || type)}</span><strong>${value.score}<small>/${value.maxScore}</small></strong><p>${value.maxScore ? Math.round(value.score / value.maxScore * 100) : 0}% of scored items</p></article>`).join('');
  return `
    ${pageHeading('READING REVIEW', attempt.setTitle || 'Reading Section', `${formatDate(attempt.completedAt)} · ${formatDuration(attempt.elapsedSec)}`, `<div class="result-badge big">${result.score ?? 0}<span>/${result.maxScore ?? 35}</span></div>`)}
    <section class="reading-result-hero panel">
      <div><span class="eyebrow">PRACTICE ROUTING</span><h2>${routeLabel}</h2><p>Module 1 計分題 ${result.routerScore ?? 0}/${result.routerMaxScore ?? 20}；練習 EAP θ = ${Number.isFinite(result.routing?.theta) ? result.routing.theta.toFixed(2) : '—'}。這是未校準的研究型路由，不是官方能力分數。</p></div>
      <div class="route-flow"><span>Module 1<br><b>${result.routerScore ?? 0}/${result.routerMaxScore ?? 20}</b></span><i>→</i><span>Module 2<br><b>${result.module2Score ?? 0}/${result.module2MaxScore ?? 15}</b></span></div>
    </section>
    <section class="result-score-grid reading-score-grid">
      ${skillCards}
      <article class="calibration-card"><span>Official 1–6 scale</span><strong>Not converted</strong><p>需要正式 calibration / equating</p></article>
    </section>
    <section class="timing-breakdown" aria-label="Time by Reading module">
      <span><small>Module 1</small><b>${formatDuration(attempt.stageTimings?.router)}</b></span>
      <span><small>Module 2</small><b>${formatDuration(attempt.stageTimings?.module2)}</b></span>
      <span><small>Scored raw</small><b>${result.score ?? 0}/${result.maxScore ?? 35}</b></span>
      <span><small>All presented</small><b>${result.allPracticeScore ?? 0}/${result.allPracticeMaxScore ?? 50}</b></span>
    </section>
    <section class="notice-card review-disclosure"><div class="notice-icon">i</div><div><strong>Research items disclosed after the test</strong><p>${research.length} items in Module 1 were not included in the 0–35 scored raw result. They are shown below only for practice review; during the test, they were intentionally indistinguishable from scored items.</p></div></section>
    <section class="panel table-panel"><div class="panel-heading"><div><span class="eyebrow">ALL ITEM DETAILS</span><h2>${scored.length} scored + ${research.length} research items</h2></div><span class="muted">Original practice content</span></div><div class="table-wrap"><table class="review-table reading-review-table"><thead><tr><th>#</th><th>Task</th><th>Skill</th><th>Your answer</th><th>Key</th><th>Result</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="review-actions"><button class="button ghost" data-action="nav" data-view="records">回到紀錄</button><button class="button primary" data-action="retry-attempt" data-id="${attr(attempt.id)}">再做一回</button></section>
  `;
}

function tileText(item, id) {
  return item.choices.find((choice) => choice.id === id)?.text || id;
}

function buildSentenceText(item, sequence) {
  const middle = (sequence || []).filter(Boolean).map((id) => tileText(item, id)).join(' ');
  return [item.prefix, middle, item.suffix].filter((piece) => piece !== '').join(' ').replace(/\s+([?.!,])/g, '$1').replace(/\s+/g, ' ').trim();
}

function renderWritingReview(attempt) {
  const buildSet = attempt.questionSnapshot?.buildSet || findBuildSet(attempt.setId);
  const emailTask = attempt.questionSnapshot?.emailTask || findEmailTask(attempt.emailTaskId);
  const discussionTask = attempt.questionSnapshot?.discussionTask || findDiscussionTask(attempt.discussionTaskId);
  const result = attempt.result || {};
  const buildRows = buildSet.items.map((item, index) => {
    const detail = result.buildDetails?.find((entry) => entry.itemId === item.id);
    const response = attempt.answers?.build?.[item.id] || [];
    const correct = Boolean(detail?.correct);
    const accepted = item.accepted[0];
    return `<details class="build-review-item" ${!correct ? 'open' : ''}><summary><span>${index + 1}</span><strong>${esc(buildSentenceText(item, response)) || 'No answer'}</strong><em class="${correct ? 'ok' : 'bad'}">${correct ? 'Correct' : 'Incorrect'}</em></summary><div><p><b>Answer:</b> ${esc(buildSentenceText(item, accepted))}</p><p>${esc(item.explanation)}</p><div class="tag-row">${item.grammar.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div></div></details>`;
  }).join('');
  const email = result.email || {};
  const discussion = result.discussion || {};
  return `
    ${pageHeading('WRITING REVIEW', 'Writing Section', `${formatDate(attempt.completedAt)} · ${formatDuration(attempt.elapsedSec)}`)}
    <section class="result-score-grid">
      <article><span>Build a Sentence</span><strong>${result.buildScore ?? 0}<small>/10</small></strong><p>deterministic key score</p></article>
      <article><span>Write an Email</span><strong>${Number.isFinite(email.score) ? email.score : '—'}<small>/5</small></strong><p>${esc(gradingSourceLabel(email.source || result.gradingSource))}</p></article>
      <article><span>Academic Discussion</span><strong>${Number.isFinite(discussion.score) ? discussion.score : '—'}<small>/5</small></strong><p>${esc(gradingSourceLabel(discussion.source || result.gradingSource))}</p></article>
      <article class="calibration-card"><span>Official 1–6 scale</span><strong>Not converted</strong><p>需要正式校準與 equating</p></article>
    </section>
    <section class="timing-breakdown" aria-label="Time by writing task">
      <span><small>Build</small><b>${formatDuration(attempt.stageTimings?.build)}</b></span>
      <span><small>Email</small><b>${formatDuration(attempt.stageTimings?.email)}</b></span>
      <span><small>Discussion</small><b>${formatDuration(attempt.stageTimings?.discussion)}</b></span>
      <span><small>Total</small><b>${formatDuration(attempt.elapsedSec)}</b></span>
    </section>
    <section class="review-writing-grid">
      <article class="panel"><div class="panel-heading"><div><span class="eyebrow">TASK 1 · 10 ITEMS</span><h2>Build a Sentence</h2></div></div><div class="build-review-list">${buildRows}</div></article>
      <article class="panel writing-response-card"><div class="panel-heading"><div><span class="eyebrow">TASK 2 · 7 MINUTES</span><h2>${esc(emailTask.title)}</h2></div><span class="result-badge">${Number.isFinite(email.score) ? `${email.score}/5` : 'Unscored'}</span></div><div class="response-text">${esc(attempt.answers?.email || '').replace(/\n/g, '<br>') || '<em>No response</em>'}</div>${diagnosticsHtml(email)}</article>
      <article class="panel writing-response-card"><div class="panel-heading"><div><span class="eyebrow">TASK 3 · 10 MINUTES</span><h2>${esc(discussionTask.course)}</h2></div><span class="result-badge">${Number.isFinite(discussion.score) ? `${discussion.score}/5` : 'Unscored'}</span></div><div class="response-text">${esc(attempt.answers?.discussion || '').replace(/\n/g, '<br>') || '<em>No response</em>'}</div>${diagnosticsHtml(discussion)}</article>
    </section>
    <section class="review-actions"><button class="button ghost" data-action="nav" data-view="records">回到紀錄</button><button class="button primary" data-action="retry-attempt" data-id="${attr(attempt.id)}">再做一回</button></section>
  `;
}

function gradingSourceLabel(source) {
  if (source === 'llm_dual' || source === 'llm_adjudicated') return source === 'llm_adjudicated' ? 'LLM dual + adjudication' : 'LLM dual rubric';
  if (source === 'provider') return 'LLM rubric';
  if (source === 'rule_zero') return 'Rule-based blank score';
  return '本機分析（不輸出 0–5）';
}

function diagnosticsHtml(score) {
  const diagnostics = score?.diagnostics || score?.feedback || [];
  const dimensions = score?.dimensions && typeof score.dimensions === 'object' ? Object.entries(score.dimensions).filter(([,v])=>v!==null&&v!==undefined) : [];
  return `<div class="diagnostic-box"><strong>Feedback</strong><ul>${diagnostics.length ? diagnostics.map((item) => `<li>${esc(typeof item === 'string' ? item : item.message || JSON.stringify(item))}</li>`).join('') : '<li>No detailed feedback was returned.</li>'}</ul>${dimensions.length ? `<div class="dimension-grid">${dimensions.map(([k,v])=>`<span><small>${esc(k.replaceAll('_',' '))}</small><b>${Number.isFinite(Number(v))?`${Number(v).toFixed(1)}/5`:esc(v)}</b></span>`).join('')}</div>` : ''}<small>${Number.isFinite(score?.score) ? 'Holistic 0–5 is primary; diagnostics are explanatory, not an additive official formula.' : 'No holistic score was produced because no rubric grader was connected.'}</small></div>`;
}

function render() {
  stopTimer();
  document.documentElement.dataset.theme = currentData().preferences.theme || 'light';
  if (ui.exam) {
    app.innerHTML = renderExam();
    bindExamAfterRender();
    renderModal();
    return;
  }
  switch (ui.view) {
    case 'practice': app.innerHTML = renderPractice(); break;
    case 'records': app.innerHTML = renderRecords(); break;
    case 'vocabulary': app.innerHTML = renderVocabulary(); break;
    case 'content': app.innerHTML = renderContentIntelligence(); break;
    case 'focused': app.innerHTML = renderFocusedPractice(); break;
    case 'settings': app.innerHTML = renderSettings(); break;
    case 'detail': {
      const attempt = currentData().attempts.find((item) => item.id === ui.detailAttemptId);
      app.innerHTML = renderAttemptDetail(attempt);
      break;
    }
    default: app.innerHTML = renderHome();
  }
  renderToast();
}

function chooseCtwSet() {
  const selected = document.querySelector('#ctw-set-select')?.value;
  if (selected) return findCtestSet(selected);
  const prefs = currentData().preferences;
  const candidates = prefs.ctwBand === 'advanced'
    ? CTEST_SETS.filter((item) => item.band === 'advanced')
    : CTEST_SETS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

async function ensureFreshAttempt() {
  const current = currentData().currentAttempt;
  if (!current) return true;
  const ok = await askConfirmation({
    title: 'Replace unfinished practice?',
    message: 'You already have an unfinished attempt. Starting a new one will discard that saved draft.',
    confirmLabel: 'Discard and start',
    destructive: true
  });
  if (!ok) return false;
  discardCurrentAttempt();
  ui.exam = null;
  return true;
}

function startCtwWithSet(rawSet, generationMeta = null) {
  const set = {
    id: rawSet.id || `generated-ctw-${Date.now()}`,
    title: rawSet.title || 'Generated Complete the Words',
    level: rawSet.level || 'B1–C1+',
    domain: rawSet.domain || 'Mixed academic',
    sourceGenre: rawSet.sourceGenre || 'Academic explanation',
    ...rawSet
  };
  const ctest = createCtest(set.sourceText, ctestOptionsForSet(set));
  const attempt = beginAttempt({
    taskType: 'ctw',
    stage: 'ctw',
    setId: set.id,
    setTitle: set.title,
    mode: currentData().preferences.practiceMode,
    answers: Object.fromEntries(ctest.gaps.map((gap) => [gap.id, ''])),
    elapsedSec: 0,
    stageTimings: { ctw: 0, build: 0, email: 0, discussion: 0 },
    generationMeta,
    questionSnapshot: { sourceText: set.sourceText, title: set.title, level: set.level, domain: set.domain, sourceGenre: set.sourceGenre, targetPolicy: set.targetPolicy, targetLexicalPositions: set.targetLexicalPositions || null }
  });
  ui.exam = { attempt, ctest, set, kind: 'ctw' };
  ui.helpOpen = false;
  ui.timerHidden = !currentData().preferences.showTimer;
  render();
  requestAnimationFrame(() => document.querySelector('[data-ctw-gap]')?.focus());
}

async function startCtw(setId = null) {
  if (!(await ensureFreshAttempt())) return;
  const set = setId ? findCtestSet(setId) : chooseCtwSet();
  startCtwWithSet(set);
}

function readingCtestSnapshot(form) {
  const ids = new Set(['router', 'lower', 'upper'].flatMap((name) => (form[name]?.ctw || []).map((spec) => spec.setId)));
  return CTEST_SETS.filter((set) => ids.has(set.id)).map((set) => structuredClone(set));
}

function startReadingWithForm(rawForm, providedCtestSets = null) {
  const form = structuredClone(rawForm || READING_FORMS[0]);
  const ctestSets = providedCtestSets ? structuredClone(providedCtestSets) : readingCtestSnapshot(form);
  const validation = validateReadingForm(form, ctestSets);
  if (!validation.valid) throw new Error(`Reading form failed validation: ${validation.errors.join(' ')}`);
  const router = buildReadingModule(form, ctestSets, 'router');
  const attempt = beginAttempt({
    taskType: 'reading',
    stage: 'reading-intro',
    moduleName: 'router',
    pageIndex: 0,
    formId: form.id,
    setId: form.id,
    setTitle: form.title,
    mode: currentData().preferences.practiceMode,
    answers: {},
    elapsedSec: 0,
    remainingSec: router.seconds,
    route: null,
    routing: null,
    stageTimings: { ctw: 0, router: 0, module2: 0, build: 0, email: 0, discussion: 0 },
    questionSnapshot: { readingForm: form, ctestSets }
  });
  ui.exam = { attempt, kind: 'reading', form, ctestSets };
  ui.helpOpen = false;
  ui.timerHidden = !currentData().preferences.showTimer;
  render();
}

async function startReading(formId = null) {
  if (!(await ensureFreshAttempt())) return;
  const selectedId = formId || document.querySelector('#reading-form-select')?.value || currentData().preferences.readingFormId || READING_FORMS[0].id;
  updatePreferences({ readingFormId: selectedId });
  startReadingWithForm(findReadingForm(selectedId));
}

function normalizeGeneratedEmail(task) {
  const visual = task.visual && typeof task.visual === 'object' ? task.visual : {};
  return {
    id: task.id || `generated-email-${Date.now()}`,
    title: task.title || 'Generated Email Task',
    ...task,
    visual: {
      type: visual.type || 'notice',
      date: visual.date || 'Campus notice',
      label: visual.label || 'Situation update',
      detail: visual.detail || 'Read the situation and respond by email.',
      status: visual.status || 'Action needed'
    }
  };
}

function normalizeGeneratedDiscussion(task) {
  return {
    id: task.id || `generated-discussion-${Date.now()}`,
    course: task.course || 'Academic Discussion',
    professor: task.professor || 'Professor',
    ...task,
    students: (task.students || []).map((student, index) => ({ avatar: student.avatar || String(student.name || '?')[0]?.toUpperCase() || String(index + 1), ...student }))
  };
}

function startWritingWithTasks(rawSet, rawEmailTask, rawDiscussionTask, generationMeta = null) {
  const set = { id: rawSet.id || `generated-build-${Date.now()}`, title: rawSet.title || 'Generated Build Set', level: rawSet.level || 'A1–C2', ...rawSet };
  const emailTask = normalizeGeneratedEmail(rawEmailTask);
  const discussionTask = normalizeGeneratedDiscussion(rawDiscussionTask);
  const answers = {
    build: Object.fromEntries(set.items.map((item) => [item.id, Array(item.slots).fill(null)])),
    email: '',
    discussion: ''
  };
  const attempt = beginAttempt({
    taskType: 'writing',
    stage: 'writing-intro',
    itemIndex: 0,
    setId: set.id,
    setTitle: set.title,
    emailTaskId: emailTask.id,
    discussionTaskId: discussionTask.id,
    mode: currentData().preferences.practiceMode,
    answers,
    elapsedSec: 0,
    remainingSec: 360,
    stageTimings: { ctw: 0, router: 0, module2: 0, build: 0, email: 0, discussion: 0 },
    generationMeta,
    questionSnapshot: { buildSet: structuredClone(set), emailTask: structuredClone(emailTask), discussionTask: structuredClone(discussionTask) }
  });
  ui.exam = { attempt, kind: 'writing', buildSet: set, emailTask, discussionTask };
  ui.selectedBuildTileId = null;
  ui.helpOpen = false;
  ui.timerHidden = !currentData().preferences.showTimer;
  resetTextHistory('email', '');
  resetTextHistory('discussion', '');
  render();
}

async function startWriting({ setId = null, emailTaskId = null, discussionTaskId = null, buildSet = null, emailTask = null, discussionTask = null, generationMeta = null } = {}) {
  if (!(await ensureFreshAttempt())) return;
  if (buildSet && emailTask && discussionTask) return startWritingWithTasks(buildSet, emailTask, discussionTask, generationMeta);
  const selectedSetId = setId || document.querySelector('#build-set-select')?.value || currentData().preferences.buildSetId || BUILD_SETS[0].id;
  const set = findBuildSet(selectedSetId);
  updatePreferences({ buildSetId: selectedSetId });
  const selectedEmail = emailTaskId ? findEmailTask(emailTaskId) : EMAIL_TASKS[Math.floor(Math.random() * EMAIL_TASKS.length)];
  const selectedDiscussion = discussionTaskId ? findDiscussionTask(discussionTaskId) : DISCUSSION_TASKS[Math.floor(Math.random() * DISCUSSION_TASKS.length)];
  startWritingWithTasks(set, selectedEmail, selectedDiscussion);
}

function resumeCurrent() {
  const attempt = currentData().currentAttempt;
  if (!attempt) return;
  try {
    if (attempt.taskType === 'ctw') {
      const set = findCtestSet(attempt.setId);
      const snapshotSet = { ...set, ...(attempt.questionSnapshot || {}) };
      if (!snapshotSet.sourceText) throw new Error('The saved CTW passage is missing.');
      ui.exam = { attempt, ctest: createCtest(snapshotSet.sourceText, ctestOptionsForSet(snapshotSet)), set: snapshotSet, kind: 'ctw' };
    } else if (attempt.taskType === 'reading') {
      const form = attempt.questionSnapshot?.readingForm || findReadingForm(attempt.formId || attempt.setId);
      const ctestSets = attempt.questionSnapshot?.ctestSets || readingCtestSnapshot(form);
      const validation = validateReadingForm(form, ctestSets);
      if (!validation.valid) throw new Error('The saved Reading form is incomplete.');
      ui.exam = { attempt, kind: 'reading', form, ctestSets };
    } else {
      const buildSet = attempt.questionSnapshot?.buildSet || findBuildSet(attempt.setId);
      const emailTask = attempt.questionSnapshot?.emailTask || findEmailTask(attempt.emailTaskId);
      const discussionTask = attempt.questionSnapshot?.discussionTask || findDiscussionTask(attempt.discussionTaskId);
      if (!Array.isArray(buildSet?.items) || buildSet.items.length !== 10 || !emailTask?.scenario || !discussionTask?.question) {
        throw new Error('The saved Writing question snapshot is incomplete.');
      }
      ui.exam = { attempt, kind: 'writing', buildSet, emailTask, discussionTask };
      resetTextHistory('email', attempt.answers?.email || '');
      resetTextHistory('discussion', attempt.answers?.discussion || '');
    }
    ui.helpOpen = false;
    ui.timerHidden = !currentData().preferences.showTimer;
    render();
  } catch (error) {
    console.warn('Discarded an invalid saved attempt.', error);
    discardCurrentAttempt();
    ui.exam = null;
    ui.view = 'home';
    render();
    showToast('未完成紀錄已損壞或版本不相容，已安全移除；其他歷史紀錄仍保留。', 'warning');
  }
}

function defaultStageSeconds(stage) {
  return ({ router: 1260, module2: 540, build: 360, email: 420, discussion: 600 })[stage] || 0;
}

function stageTimeoutCallback(stage) {
  if (stage === 'router' || stage === 'module2') return () => finishReadingModule({ timedOut: true });
  if (stage === 'build') return () => advanceToEmail({ timedOut: true });
  if (stage === 'email') return () => advanceToDiscussion({ timedOut: true });
  return () => submitWriting({ timedOut: true });
}

function renderExam() {
  const attempt = currentData().currentAttempt || ui.exam.attempt;
  ui.exam.attempt = attempt;
  if (ui.exam.kind === 'ctw') return renderCtwExam(attempt);
  if (ui.exam.kind === 'reading') {
    if (attempt.stage === 'reading-intro') return renderReadingIntro(attempt);
    if (attempt.stage === 'reading-transition') return renderReadingTransition(attempt);
    return renderReadingModuleExam(attempt);
  }
  if (attempt.stage === 'writing-intro') return renderWritingIntro(attempt);
  if (attempt.stage === 'email-intro') return renderWritingTaskTransition(attempt, 'email');
  if (attempt.stage === 'discussion-intro') return renderWritingTaskTransition(attempt, 'discussion');
  if (attempt.stage === 'email') return renderEmailExam(attempt);
  if (attempt.stage === 'discussion') return renderDiscussionExam(attempt);
  return renderBuildExam(attempt);
}


function currentReadingModule(attempt = currentData().currentAttempt) {
  const moduleName = attempt?.stage === 'router' ? 'router' : (attempt?.route || 'lower');
  return buildReadingModule(ui.exam.form, ui.exam.ctestSets, moduleName);
}

function renderSectionDirections({ section, title, description, bullets, meta, action, actionLabel }) {
  return `<div class="exam-screen directions-screen">
    ${examTop({ section, progress: 'Directions', showTimer: false })}
    <main class="directions-main">
      <section class="directions-card">
        <div class="directions-kicker">${esc(section)}</div>
        <h1>${esc(title)}</h1>
        <p class="directions-lead">${esc(description)}</p>
        <ul class="directions-list">${bullets.map((item) => `<li><span>${icon('check')}</span><p>${item}</p></li>`).join('')}</ul>
        <div class="directions-meta">${meta}</div>
      </section>
    </main>
    ${examFooter({ next: { action, label: actionLabel }, status: '<span>Directions time is not counted.</span>' })}
    ${renderExamOverlay()}
  </div>`;
}

function renderReadingIntro() {
  return renderSectionDirections({
    section: 'READING',
    title: 'Reading Section Directions',
    description: 'This practice section has two timed modules. Complete the first module, then continue to the second module selected by the practice routing engine.',
    bullets: [
      '<b>Module 1:</b> 35 presented items in 21 minutes, including Complete the Words, Read in Daily Life, and an Academic Passage.',
      '<b>Module 2:</b> 15 items in 9 minutes. You cannot return to Module 1 after it ends.',
      'Within a module, use Back and Next to review questions while time remains. Blank answers receive no credit.',
      'Some questions may be used for research purposes. They are not identified during the test and do not affect the scored result.'
    ],
    meta: '<span><b>50</b> items</span><span><b>2</b> timed modules</span><span><b>30 min</b> practice allocation</span>',
    action: 'begin-reading-module',
    actionLabel: 'Begin Module 1'
  });
}

function renderReadingTransition(attempt) {
  return `<div class="exam-screen directions-screen module-transition-screen">
    ${examTop({ section: 'READING', progress: 'Between Modules', showTimer: false })}
    <main class="directions-main">
      <section class="directions-card transition-card">
        <div class="transition-check">${icon('check')}</div>
        <div class="directions-kicker">MODULE 1 COMPLETE</div>
        <h1>Continue to Module 2</h1>
        <p class="directions-lead">Your answers from Module 1 have been submitted. You cannot return to that module.</p>
        <div class="module-lock"><span>Module 1</span><b>Locked</b></div>
        <p class="transition-note">Module 2 contains 15 items and has a 9-minute timer. The interface does not reveal which difficulty route was selected.</p>
      </section>
    </main>
    ${examFooter({ next: { action: 'begin-reading-module2', label: 'Begin Module 2' }, status: '<span>Directions time is not counted.</span>' })}
    ${renderExamOverlay()}
  </div>`;
}

function renderWritingIntro() {
  return renderSectionDirections({
    section: 'WRITING',
    title: 'Writing Section Directions',
    description: 'The section contains three task types. Each task has its own directions and timer. Once you continue to the next task type, you cannot return.',
    bullets: [
      '<b>Build a Sentence:</b> 10 questions. Move words or phrases into the blanks to make an appropriate sentence.',
      '<b>Write an Email:</b> 7 minutes. Address all three communication goals in complete sentences.',
      '<b>Academic Discussion:</b> 10 minutes. State and support your position; an effective response contains at least 100 words.',
      'Word count is available for extended writing. Spell-check and writing-assistance tools are disabled.'
    ],
    meta: '<span><b>12</b> tasks</span><span><b>23 min</b> practice allocation</span><span><b>20</b> raw points</span>',
    action: 'begin-writing-section',
    actionLabel: 'Begin Writing'
  });
}

function renderWritingTaskTransition(attempt, taskType) {
  const email = taskType === 'email';
  return renderSectionDirections({
    section: 'WRITING',
    title: email ? 'Write an Email' : 'Academic Discussion',
    description: email
      ? 'Read a short situation and write an email that fulfills the three communication goals.'
      : 'Read the professor’s question and two student posts, then contribute your own supported response.',
    bullets: email ? [
      'You have 7 minutes to read the prompt and write your response.',
      'Use appropriate email conventions and a suitable level of politeness.',
      'You cannot return to Build a Sentence after beginning this task.'
    ] : [
      'You have 10 minutes to read and respond.',
      'Express and support your own position in your own words.',
      'You cannot return to the Email task after beginning this task.'
    ],
    meta: email ? '<span><b>7 min</b> total</span><span><b>3</b> communication goals</span>' : '<span><b>10 min</b> total</span><span><b>100+</b> words recommended</span>',
    action: 'begin-writing-task',
    actionLabel: email ? 'Begin Email' : 'Begin Discussion'
  });
}

function readingTextHtml(text, type) {
  const normalized = String(text || '').trim();
  if (type === 'schedule' || type === 'messages') {
    return `<div class="daily-formatted-text">${normalized.split('\n').map((line) => esc(line)).join('<br>')}</div>`;
  }
  return normalized.split(/\n\s*\n/).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');
}

function renderReadingCtwPage(page, attempt) {
  const answers = attempt.answers || {};
  const passage = page.ctest.segments.map((segment) => {
    if (segment.type === 'text') return esc(segment.text);
    const value = answers[segment.id] || '';
    return `<span class="ctw-gap" data-gap-wrap="${segment.id}"><span class="ctw-prefix">${esc(segment.visible)}</span><input data-ctw-gap="${segment.id}" value="${attr(value)}" maxlength="${segment.missingLength}" size="${segment.missingLength}" style="--letters:${segment.missingLength}" spellcheck="false" autocomplete="off" autocapitalize="none" aria-label="Question ${page.itemStart + segment.number - 1}, type ${segment.missingLength} missing letters"></span>`;
  }).join('');
  return `<section class="ctw-paper reading-ctw-paper" aria-label="Complete the Words passage">
    <div class="ctw-question-label">Questions ${page.itemStart}–${page.itemEnd}</div>
    <p class="ctw-passage">${passage}</p>
  </section>`;
}

function renderReadingMcqPage(page, attempt) {
  const selected = attempt.answers?.[page.question.id] || '';
  const stimulusClass = page.type === 'academic' ? 'academic-stimulus' : 'daily-stimulus';
  return `<div class="reading-question-layout ${page.type}">
    <section class="reading-stimulus-pane ${stimulusClass}">
      <div class="stimulus-label">${esc(page.stimulus.label || page.taskLabel)}</div>
      <h2>${esc(page.stimulus.title)}</h2>
      ${readingTextHtml(page.stimulus.text, page.stimulus.type)}
    </section>
    <section class="reading-question-pane">
      <div class="question-number">Question ${page.itemStart}</div>
      <h3>${esc(page.question.stem)}</h3>
      <div class="reading-options" role="radiogroup" aria-label="Answer choices">
        ${page.question.options.map((option) => `<label class="reading-option"><input type="radio" name="${attr(page.question.id)}" data-reading-option data-question-id="${attr(page.question.id)}" value="${attr(option.id)}" ${selected === option.id ? 'checked' : ''}><span class="option-letter">${esc(option.id)}</span><span class="option-text">${esc(option.text)}</span></label>`).join('')}
      </div>
    </section>
  </div>`;
}

function renderReadingModuleExam(attempt) {
  const module = currentReadingModule(attempt);
  const index = Math.max(0, Math.min(module.pages.length - 1, Number(attempt.pageIndex) || 0));
  const page = module.pages[index];
  const moduleNumber = attempt.stage === 'router' ? 1 : 2;
  const answered = moduleAnsweredCount(module, attempt.answers || {});
  const directions = page.type === 'ctw'
    ? '<strong>Fill in the missing letters.</strong><span>Type only the missing part of each word.</span>'
    : page.type === 'daily'
      ? '<strong>Read the text and answer the question.</strong><span>Select the best answer.</span>'
      : '<strong>Read the academic passage and answer the question.</strong><span>Select the best answer.</span>';
  return `<div class="exam-screen">
    ${examTop({ section: `READING · ${page.taskLabel}`, progress: `Module ${moduleNumber} · ${page.itemStart === page.itemEnd ? `Question ${page.itemStart}` : `Questions ${page.itemStart}–${page.itemEnd}`} of ${module.totalItems}`, timerLabel: 'Time Remaining' })}
    <div class="exam-instructions"><div>${directions}</div><button data-action="toggle-help">View Directions</button></div>
    <main class="exam-main reading-module-main">${page.type === 'ctw' ? renderReadingCtwPage(page, attempt) : renderReadingMcqPage(page, attempt)}</main>
    ${examFooter({
      back: { action: 'prev-reading-page', label: 'Back', disabled: index === 0 },
      next: { action: index === module.pages.length - 1 ? 'end-reading-module' : 'next-reading-page', label: index === module.pages.length - 1 ? 'End Module' : 'Next' },
      status: `<span class="answer-progress"><b>${answered}</b> of ${module.totalItems} answered</span>`
    })}
    ${renderExamOverlay()}
  </div>`;
}

function examTop({ section, progress, timerLabel = 'Time', timerMode = 'countdown', showTimer = true }) {
  return `<header class="exam-topbar">
    <div class="exam-brand"><span class="exam-brand-mark">T</span><strong>TOEFL Practice</strong></div>
    <div class="exam-section"><span>${esc(section)}</span><strong>${esc(progress)}</strong></div>
    <div class="exam-tools">
      <button data-action="leave-exam" class="exam-exit-control" aria-label="Exit practice">${icon('close')}<span>Exit</span></button>
      <button data-action="toggle-help">${icon('help')}<span>Help</span></button>
      ${showTimer ? `<button data-action="toggle-timer" class="timer-control">${icon('clock')}<span class="timer-copy"><small>${esc(timerLabel)}</small><b id="exam-timer" data-mode="${timerMode}">${ui.timerHidden ? 'Hidden' : '--:--'}</b></span></button>` : ''}
    </div>
  </header>`;
}

function examFooter({ back = null, next = null, status = '' }) {
  return `<footer class="exam-footer">
    <div>${back ? `<button class="exam-nav-button secondary" data-action="${back.action}" ${back.disabled ? 'disabled' : ''}>${icon('back')}${esc(back.label || 'Back')}</button>` : ''}</div>
    <div class="exam-footer-status">${status}</div>
    <div>${next ? `<button class="exam-nav-button primary" data-action="${next.action}">${esc(next.label || 'Next')}${icon('next')}</button>` : ''}</div>
  </footer>`;
}

function renderCtwExam(attempt) {
  const ctest = ui.exam.ctest;
  const answers = attempt.answers || {};
  const passage = ctest.segments.map((segment) => {
    if (segment.type === 'text') return esc(segment.text);
    const value = answers[segment.id] || '';
    return `<span class="ctw-gap" data-gap-wrap="${segment.id}"><span class="ctw-prefix">${esc(segment.visible)}</span><input data-ctw-gap="${segment.id}" value="${attr(value)}" maxlength="${segment.missingLength}" size="${segment.missingLength}" style="--letters:${segment.missingLength}" spellcheck="false" autocomplete="off" autocapitalize="none" aria-label="Question ${segment.number}, type ${segment.missingLength} missing letters"></span>`;
  }).join('');
  const answered = ctest.gaps.filter((gap) => String(answers[gap.id] || '').length > 0).length;
  return `<div class="exam-screen">
    ${examTop({ section: 'READING · Complete the Words', progress: 'Questions 1–10 of 10', timerLabel: 'Practice Time', timerMode: 'elapsed' })}
    <div class="exam-instructions"><div><strong>Fill in the missing letters in the paragraph.</strong><span>Type only the missing part of each word.</span></div><button data-action="toggle-help">View Directions</button></div>
    <main class="exam-main ctw-main">
      <section class="ctw-paper" aria-label="Complete the Words passage">
        <div class="ctw-question-label">Questions 1–10</div>
        <p class="ctw-passage">${passage}</p>
      </section>
    </main>
    ${examFooter({ next: { action: 'submit-ctw', label: 'Submit' }, status: `<span class="answer-progress"><b>${answered}</b> of 10 answered</span>` })}
    ${renderExamOverlay()}
  </div>`;
}

function renderBuildExam(attempt) {
  const set = ui.exam.buildSet;
  const index = Math.max(0, Math.min(set.items.length - 1, attempt.itemIndex || 0));
  const item = set.items[index];
  const sequence = attempt.answers?.build?.[item.id] || Array(item.slots).fill(null);
  const used = new Set(sequence.filter(Boolean));
  const slots = Array.from({ length: item.slots }, (_, slotIndex) => {
    const tokenId = sequence[slotIndex];
    const text = tokenId ? tileText(item, tokenId) : '';
    return `<button class="sentence-slot ${tokenId ? 'filled' : ''}" data-action="clear-slot" data-slot-index="${slotIndex}" data-drop-slot="${slotIndex}" aria-label="Sentence position ${slotIndex + 1}${text ? `, ${attr(text)}` : ', empty'}">${text ? esc(text) : '<span></span>'}</button>`;
  }).join('');
  const choices = item.choices.map((choice) => { const selected=ui.selectedBuildTileId===choice.id; return `<button class="word-tile ${used.has(choice.id) ? 'used' : ''} ${selected ? 'selected' : ''}" data-action="select-tile" data-tile-id="${choice.id}" draggable="${used.has(choice.id) ? 'false' : 'true'}" aria-pressed="${selected}" ${used.has(choice.id) ? 'disabled' : ''}>${esc(choice.text)}</button>`; }).join('');
  const nav = set.items.map((entry, itemIndex) => {
    const response = attempt.answers?.build?.[entry.id] || [];
    const answered = response.filter(Boolean).length === entry.slots;
    return `<button class="question-dot ${itemIndex === index ? 'current' : ''} ${answered ? 'answered' : ''}" data-action="go-build-item" data-index="${itemIndex}" aria-label="Question ${itemIndex + 1}${answered ? ', answered' : ''}">${itemIndex + 1}</button>`;
  }).join('');
  return `<div class="exam-screen">
    ${examTop({ section: 'WRITING · Build a Sentence', progress: `Question ${index + 1} of 10`, timerLabel: 'Time Remaining' })}
    <div class="exam-instructions"><div><strong>Make an appropriate sentence.</strong><span>Drag the words or phrases into the blanks.</span></div><button data-action="toggle-help">View Directions</button></div>
    <main class="exam-main build-main">
      <section class="build-card">
        <div class="dialogue-row"><div class="speaker-avatar speaker-a">A</div><div class="speech-bubble"><span>Speaker A</span><p>${esc(item.promptA)}</p></div></div>
        <div class="dialogue-row answer-row"><div class="speaker-avatar speaker-b">B</div><div class="speech-bubble answer-bubble"><span>Speaker B</span><div class="sentence-builder"><span class="fixed-text">${esc(item.prefix)}</span><div class="sentence-slots">${slots}</div><span class="fixed-text suffix">${esc(item.suffix)}</span></div></div></div>
        <div class="tile-area"><div class="tile-instruction">Words and phrases</div><div class="word-tiles">${choices}</div><div class="build-selection-status" id="build-selection-status" aria-live="polite">${ui.selectedBuildTileId ? `Selected: ${esc(tileText(item, ui.selectedBuildTileId))}. Choose a blank.` : 'Drag a choice to a blank, or select a choice and then choose a blank.'}</div></div>
      </section>
      <nav class="question-map" aria-label="Build a Sentence question navigation">${nav}</nav>
    </main>
    ${examFooter({ back: { action: 'prev-build', label: 'Back', disabled: index === 0 }, next: { action: index === 9 ? 'advance-email' : 'next-build', label: index === 9 ? 'Continue' : 'Next' }, status: `<span class="answer-progress"><b>${set.items.filter((entry) => (attempt.answers?.build?.[entry.id] || []).filter(Boolean).length === entry.slots).length}</b> of 10 answered</span>` })}
    ${renderExamOverlay()}
  </div>`;
}

function editorToolbar(kind, text) {
  const count = wordCount(text);
  return `<div class="editor-toolbar">
    <div><button data-action="editor-cut" data-kind="${kind}">Cut</button><button data-action="editor-paste" data-kind="${kind}">Paste</button><span class="toolbar-divider"></span><button data-action="editor-undo" data-kind="${kind}">Undo</button><button data-action="editor-redo" data-kind="${kind}">Redo</button></div>
    <button data-action="toggle-word-count">${ui.wordCountHidden ? 'Show Word Count' : 'Hide Word Count'}</button>
  </div><div class="word-count ${ui.wordCountHidden ? 'hidden' : ''}" id="word-count">Word Count: ${count}</div>`;
}

function renderEmailExam(attempt) {
  const task = ui.exam.emailTask;
  const response = attempt.answers?.email || '';
  return `<div class="exam-screen">
    ${examTop({ section: 'WRITING · Write an Email', progress: 'Task 2 of 3', timerLabel: 'Time Remaining' })}
    <div class="exam-instructions"><div><strong>Write an email based on the situation below.</strong><span>Write as much as you can in complete sentences.</span></div><button data-action="toggle-help">View Directions</button></div>
    <main class="exam-main split-writing-main">
      <section class="prompt-pane">
        <div class="task-kicker">Write an Email</div>
        <p>${esc(task.scenario)}</p>
        <p>Write an email to <strong>${esc(task.recipient)}</strong>. In your email, do the following:</p>
        <ul>${task.goals.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul>
      </section>
      <section class="editor-pane">
        <div class="email-fields"><div><span>To:</span><strong>${esc(task.recipient)}</strong></div><div><span>Subject:</span><strong>${esc(task.subject)}</strong></div></div>
        ${editorToolbar('email', response)}
        <textarea class="writing-editor" data-writing-field="email" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" data-gramm="false" aria-label="Email response">${esc(response)}</textarea>
      </section>
    </main>
    ${examFooter({ next: { action: 'advance-discussion', label: 'Continue' }, status: '' })}
    ${renderExamOverlay()}
  </div>`;
}

function renderDiscussionExam(attempt) {
  const task = ui.exam.discussionTask;
  const response = attempt.answers?.discussion || '';
  return `<div class="exam-screen">
    ${examTop({ section: 'WRITING · Academic Discussion', progress: 'Task 3 of 3', timerLabel: 'Time Remaining' })}
    <div class="exam-instructions"><div><strong>Write a post responding to the professor’s question.</strong><span>Express and support your opinion. Make a contribution in your own words.</span></div><button data-action="toggle-help">View Directions</button></div>
    <main class="exam-main split-writing-main discussion-layout">
      <section class="prompt-pane discussion-context-pane">
        <div class="course-header"><span>Discussion Board</span><strong>${esc(task.course)}</strong></div>
        <div class="task-kicker">Professor's question</div>
        <article class="discussion-post professor-post"><div class="post-avatar professor">${esc(task.professor.split(' ').at(-1)?.[0] || 'P')}</div><div><strong>${esc(task.professor)}</strong><p>${esc(task.question)}</p></div></article>
        <p class="minimum-note">An effective response will contain at least 100 words.</p>
      </section>
      <section class="editor-pane discussion-response-pane">
        <div class="discussion-peer-list" aria-label="Student responses">
          ${task.students.map((student) => `<article class="discussion-post"><div class="post-avatar">${esc(student.avatar)}</div><div><strong>${esc(student.name)}</strong><p>${esc(student.post)}</p></div></article>`).join('')}
        </div>
        ${editorToolbar('discussion', response)}
        <textarea class="writing-editor discussion-editor" data-writing-field="discussion" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" data-gramm="false" aria-label="Academic discussion response">${esc(response)}</textarea>
      </section>
    </main>
    ${examFooter({ next: { action: 'submit-writing', label: 'Submit' }, status: `<span class="word-progress"><b>${wordCount(response)}</b> words</span>` })}
    ${renderExamOverlay()}
  </div>`;
}

function renderExamOverlay() {
  const overlays = [];
  if (ui.grading) overlays.push(`<div class="grading-overlay"><div class="grading-card"><div class="spinner"></div><strong>Scoring responses…</strong><span>Deterministic tasks first, then the configured writing rubric.</span></div></div>`);
  if (ui.helpOpen) overlays.push(renderHelpModal());
  return overlays.join('');
}

function renderHelpModal() {
  const attempt = currentData().currentAttempt;
  const stage = attempt?.stage;
  let body;
  if (attempt?.taskType === 'reading' && (stage === 'router' || stage === 'module2')) {
    const module = currentReadingModule(attempt);
    const page = module.pages[Math.max(0, Math.min(module.pages.length - 1, Number(attempt.pageIndex) || 0))];
    body = page.type === 'ctw'
      ? `<h2>Complete the Words</h2><p>The first sentence is complete. Beginning after it, the second half of every second word has been removed.</p><ul><li>Type only the missing letters.</li><li>There are 10 incomplete words on this page.</li><li>You may return to other pages in this module while time remains.</li></ul>`
      : page.type === 'daily'
        ? `<h2>Read in Daily Life</h2><p>Read a short everyday text such as a notice, email, schedule, or message exchange.</p><ul><li>Select the best answer for each question.</li><li>Use information stated or implied in the text.</li><li>You may return to other pages in this module while time remains.</li></ul>`
        : `<h2>Read an Academic Passage</h2><p>Read the passage and answer questions about its content, organization, vocabulary, and implications.</p><ul><li>Select the best answer.</li><li>The passage remains visible for all five questions.</li><li>You may return to other pages in this module while time remains.</li></ul>`;
  } else if (stage === 'ctw') {
    body = `<h2>Complete the Words</h2><p>The first sentence is complete. Beginning with the text after it, the second half of every second word has been removed. Type only the missing letters in each box.</p><ul><li>There are 10 incomplete words.</li><li>Spelling must be exact.</li><li>Use Tab and Shift+Tab to move between boxes.</li></ul>`;
  } else if (stage === 'build') {
    body = `<h2>Build a Sentence</h2><p>Move the words and phrases into the blanks to make an appropriate sentence or question.</p><ul><li>Not every option must be used.</li><li>Keyboard: press Space on a choice, move to the target blank with Tab/Shift+Tab, then press Space again.</li><li>You may move between the 10 questions while time remains.</li></ul>`;
  } else if (stage === 'email') {
    body = `<h2>Write an Email</h2><p>Read the situation and complete all requested communication goals. Use appropriate social conventions and write in complete sentences.</p><ul><li>You have 7 minutes to read and respond.</li><li>Word count is available.</li><li>Spell-check is not available.</li></ul>`;
  } else if (stage === 'discussion') {
    body = `<h2>Academic Discussion</h2><p>State and support your own position while contributing to the discussion. The professor’s question and student posts remain visible.</p><ul><li>You have 10 minutes.</li><li>An effective response will contain at least 100 words.</li><li>Spell-check is not available.</li></ul>`;
  } else {
    body = `<h2>Section Directions</h2><p>Read the directions before beginning. The timer starts only after you select the Begin button.</p><ul><li>Use Back and Next only where those buttons are available.</li><li>After a module or task is submitted, you cannot return to it.</li></ul>`;
  }
  return `<div class="modal-backdrop help-backdrop"><section class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title" tabindex="-1"><button class="modal-close" data-action="toggle-help" aria-label="Close directions">${icon('close')}</button><div id="help-modal-content">${body.replace('<h2>', '<h2 id="help-modal-title">')}</div><button class="button primary full" data-action="toggle-help">Return to the test</button></section></div>`;
}

function bindExamAfterRender() {
  const attempt = currentData().currentAttempt;
  if (!attempt) return;
  const untimedStages = new Set(['reading-intro', 'reading-transition', 'writing-intro', 'email-intro', 'discussion-intro']);
  if (untimedStages.has(attempt.stage)) {
    stopTimer();
  } else if (ui.exam.kind === 'ctw') {
    startElapsedTimer(attempt.elapsedSec || 0);
  } else {
    startCountdown(Number.isFinite(attempt.remainingSec) ? attempt.remainingSec : defaultStageSeconds(attempt.stage), stageTimeoutCallback(attempt.stage));
  }
  updateTimerDom();
  if (ui.helpOpen) requestAnimationFrame(() => document.querySelector('.help-modal')?.focus());
}

function renderModal() {
  // Modal markup is rendered as part of the exam to keep focus and layout stable.
}

function stopTimer() {
  if (ui.timerId) clearInterval(ui.timerId);
  ui.timerId = null;
  ui.timerMode = null;
  ui.timerDeadline = null;
  ui.timerCallback = null;
  ui.timerCountdownStartSeconds = 0;
  ui.timerAttemptElapsedBase = 0;
  ui.timerStageElapsedBase = 0;
}

function startElapsedTimer(initialSeconds = 0) {
  stopTimer();
  ui.timerMode = 'elapsed';
  ui.timerElapsedBase = Math.max(0, Number(initialSeconds) || 0);
  ui.timerStageElapsedBase = ui.timerElapsedBase;
  ui.timerStartedAt = Date.now();
  ui.lastPersistSecond = -1;
  ui.timerId = setInterval(tickTimer, 250);
  tickTimer();
}

function startCountdown(seconds, callback) {
  stopTimer();
  const startingSeconds = Math.max(0, Number(seconds) || 0);
  ui.timerMode = 'countdown';
  ui.timerCountdownStartSeconds = startingSeconds;
  const attempt = currentData().currentAttempt;
  ui.timerAttemptElapsedBase = Math.max(0, Number(attempt?.elapsedSec) || 0);
  ui.timerStageElapsedBase = Math.max(0, Number(attempt?.stageTimings?.[attempt?.stage]) || 0);
  ui.timerDeadline = Date.now() + startingSeconds * 1000;
  ui.timerCallback = callback;
  ui.lastPersistSecond = -1;
  ui.timerId = setInterval(tickTimer, 250);
  tickTimer();
}

function timerSeconds() {
  if (ui.timerMode === 'elapsed') return ui.timerElapsedBase + Math.floor((Date.now() - ui.timerStartedAt) / 1000);
  if (ui.timerMode === 'countdown') return Math.max(0, Math.ceil((ui.timerDeadline - Date.now()) / 1000));
  return 0;
}

function tickTimer() {
  const seconds = timerSeconds();
  updateTimerDom(seconds);
  if (seconds !== ui.lastPersistSecond && seconds % 5 === 0) {
    ui.lastPersistSecond = seconds;
    if (ui.timerMode === 'elapsed') {
      const attempt = currentData().currentAttempt;
      patchCurrentAttempt({
        elapsedSec: seconds,
        stageTimings: { ...(attempt?.stageTimings || {}), ctw: seconds }
      });
    } else {
      const elapsedDuringRun = Math.max(0, ui.timerCountdownStartSeconds - seconds);
      const attempt = currentData().currentAttempt;
      const stage = attempt?.stage;
      patchCurrentAttempt({
        remainingSec: seconds,
        elapsedSec: ui.timerAttemptElapsedBase + elapsedDuringRun,
        stageTimings: stage ? { ...(attempt?.stageTimings || {}), [stage]: ui.timerStageElapsedBase + elapsedDuringRun } : attempt?.stageTimings
      });
    }
  }
  if (ui.timerMode === 'countdown' && seconds <= 0) {
    const callback = ui.timerCallback;
    stopTimer();
    callback?.({ timedOut: true });
  }
}

function updateTimerDom(value = timerSeconds()) {
  const node = document.querySelector('#exam-timer');
  if (!node) return;
  if (ui.timerHidden) {
    node.textContent = 'Hidden';
    node.classList.remove('warning');
    return;
  }
  node.textContent = formatDuration(value);
  node.classList.toggle('warning', ui.timerMode === 'countdown' && value <= 60);
}

function persistCurrentTimer(value = timerSeconds()) {
  const attempt = currentData().currentAttempt;
  if (!attempt) return null;
  if (ui.timerMode === 'elapsed') {
    return patchCurrentAttempt({
      elapsedSec: value,
      stageTimings: { ...(attempt.stageTimings || {}), ctw: value }
    });
  }
  if (ui.timerMode === 'countdown') {
    const remainingSec = value;
    const elapsedDuringRun = Math.max(0, ui.timerCountdownStartSeconds - remainingSec);
    const stage = attempt.stage;
    return patchCurrentAttempt({
      remainingSec,
      elapsedSec: ui.timerAttemptElapsedBase + elapsedDuringRun,
      stageTimings: {
        ...(attempt.stageTimings || {}),
        [stage]: ui.timerStageElapsedBase + elapsedDuringRun
      }
    });
  }
  return attempt;
}

function currentBuildItem() {
  const attempt = currentData().currentAttempt;
  return ui.exam.buildSet.items[attempt?.itemIndex || 0];
}

function selectTile(tileId) {
  const attempt = currentData().currentAttempt;
  const item = currentBuildItem();
  if (!attempt || !item) return;
  const current = [...(attempt.answers?.build?.[item.id] || Array(item.slots).fill(null))];
  if (current.includes(tileId)) return;
  ui.selectedBuildTileId = ui.selectedBuildTileId === tileId ? null : tileId;
  document.querySelectorAll('[data-tile-id]').forEach((tile) => { const selected = tile.dataset.tileId === ui.selectedBuildTileId; tile.classList.toggle('selected', selected); tile.setAttribute('aria-pressed', String(selected)); });
  const status = document.querySelector('#build-selection-status');
  if (status) status.textContent = ui.selectedBuildTileId ? `Selected: ${tileText(item, ui.selectedBuildTileId)}. Move to the target blank and press Space, or click it.` : 'Drag a choice, or select one and then choose a blank.';
}
function activateBuildSlot(slotIndex) {
  if (ui.selectedBuildTileId) { const id=ui.selectedBuildTileId; ui.selectedBuildTileId=null; placeTile(id,slotIndex); } else clearBuildSlot(slotIndex);
}

function placeTile(tileId, slotIndex) {
  const attempt = currentData().currentAttempt;
  const item = currentBuildItem();
  if (!attempt || !item) return;
  const current = [...(attempt.answers?.build?.[item.id] || Array(item.slots).fill(null))];
  const existing = current.indexOf(tileId);
  if (existing >= 0) current[existing] = null;
  current[slotIndex] = tileId;
  const answers = structuredClone(attempt.answers);
  answers.build[item.id] = current;
  patchCurrentAttempt({ answers });
  ui.selectedBuildTileId = null;
  rerenderExamKeepingTimer();
}

function clearBuildSlot(slotIndex) {
  const attempt = currentData().currentAttempt;
  const item = currentBuildItem();
  if (!attempt || !item) return;
  const current = [...(attempt.answers?.build?.[item.id] || Array(item.slots).fill(null))];
  current[slotIndex] = null;
  const answers = structuredClone(attempt.answers);
  answers.build[item.id] = current;
  patchCurrentAttempt({ answers });
  rerenderExamKeepingTimer();
}

function rerenderExamKeepingTimer() {
  persistCurrentTimer();
  app.innerHTML = renderExam();
  updateTimerDom();
  if (ui.helpOpen) requestAnimationFrame(() => document.querySelector('.help-modal')?.focus());
}


function beginReadingModule(moduleNumber = 1) {
  const attempt = currentData().currentAttempt;
  if (!attempt || attempt.taskType !== 'reading') return;
  const stage = moduleNumber === 1 ? 'router' : 'module2';
  const moduleName = moduleNumber === 1 ? 'router' : (attempt.route || 'lower');
  const module = buildReadingModule(ui.exam.form, ui.exam.ctestSets, moduleName);
  patchCurrentAttempt({ stage, moduleName, pageIndex: 0, remainingSec: module.seconds });
  render();
  requestAnimationFrame(() => document.querySelector('[data-ctw-gap], [data-reading-option]')?.focus());
}

function goReadingPage(index) {
  const attempt = currentData().currentAttempt;
  if (!attempt || attempt.taskType !== 'reading') return;
  persistCurrentTimer();
  const module = currentReadingModule(attempt);
  patchCurrentAttempt({ pageIndex: Math.max(0, Math.min(module.pages.length - 1, index)), remainingSec: timerSeconds() });
  rerenderExamKeepingTimer();
  requestAnimationFrame(() => document.querySelector('[data-ctw-gap], [data-reading-option]')?.focus());
}

async function finishReadingModule({ timedOut = false } = {}) {
  const attempt = currentData().currentAttempt;
  if (!attempt || attempt.taskType !== 'reading') return;
  if (ui.timerMode) persistCurrentTimer();
  const latestBeforeConfirm = currentData().currentAttempt || attempt;
  const module = currentReadingModule(latestBeforeConfirm);
  const unanswered = moduleUnansweredCount(module, latestBeforeConfirm.answers || {});
  if (!timedOut) {
    const ok = await askConfirmation({
      title: latestBeforeConfirm.stage === 'router' ? 'End Module 1?' : 'Submit Reading section?',
      message: `${unanswered ? `${unanswered} item(s) are unanswered. ` : ''}${latestBeforeConfirm.stage === 'router' ? 'After continuing, you cannot return to Module 1.' : 'This will submit both Reading modules.'}`,
      confirmLabel: latestBeforeConfirm.stage === 'router' ? 'End Module 1' : 'Submit Reading'
    });
    if (!ok) return;
  }
  if (ui.timerMode) persistCurrentTimer();
  stopTimer();
  const latest = currentData().currentAttempt || latestBeforeConfirm;
  if (latest.stage === 'router') {
    const router = buildReadingModule(ui.exam.form, ui.exam.ctestSets, 'router');
    const routerResult = gradeReadingModule(router, latest.answers || {});
    const routing = estimateRouterAbility(routerResult.details);
    patchCurrentAttempt({
      stage: 'reading-transition',
      moduleName: routing.route,
      pageIndex: 0,
      route: routing.route,
      routing,
      remainingSec: buildReadingModule(ui.exam.form, ui.exam.ctestSets, routing.route).seconds
    });
    render();
    return;
  }
  const result = gradeReadingAttempt(ui.exam.form, ui.exam.ctestSets, latest.answers || {}, latest.route);
  if (currentData().preferences.autoSaveMistakes) {
    result.details.filter((detail) => detail.scored && detail.type === 'ctw' && !detail.correct).forEach((detail) => addNotebookEntry(findVocabWord(detail.word)));
  }
  const completed = finishCurrentAttempt({
    elapsedSec: latest.elapsedSec,
    stageTimings: latest.stageTimings,
    route: result.route,
    routing: result.routing,
    result
  });
  ui.exam = null;
  ui.view = 'detail';
  ui.detailAttemptId = completed.id;
  render();
}

function beginWritingSection() {
  const attempt = currentData().currentAttempt;
  if (!attempt || attempt.taskType !== 'writing') return;
  patchCurrentAttempt({ stage: 'build', itemIndex: 0, remainingSec: 360 });
  render();
  requestAnimationFrame(() => document.querySelector('[data-tile-id]')?.focus());
}

function beginWritingTask(taskType) {
  const attempt = currentData().currentAttempt;
  if (!attempt || attempt.taskType !== 'writing') return;
  const stage = taskType === 'email' ? 'email' : 'discussion';
  patchCurrentAttempt({ stage, remainingSec: defaultStageSeconds(stage) });
  ui.wordCountHidden = false;
  render();
  requestAnimationFrame(() => document.querySelector(`[data-writing-field="${stage}"]`)?.focus());
}

function goBuildItem(index) {
  persistCurrentTimer();
  ui.selectedBuildTileId = null;
  patchCurrentAttempt({ itemIndex: Math.max(0, Math.min(ui.exam.buildSet.items.length - 1, index)), remainingSec: currentData().currentAttempt?.remainingSec });
  rerenderExamKeepingTimer();
}

async function advanceToEmail({ timedOut = false } = {}) {
  if (ui.timerMode) persistCurrentTimer();
  const attempt = currentData().currentAttempt;
  if (!attempt) return;
  const incomplete = ui.exam.buildSet.items.filter((item) => (attempt.answers?.build?.[item.id] || []).filter(Boolean).length !== item.slots).length;
  if (!timedOut) {
    const ok = await askConfirmation({
      title: 'Continue to Write an Email?',
      message: `${incomplete ? `${incomplete} Build question(s) are incomplete. ` : ''}After continuing, you cannot return to Build a Sentence.`,
      confirmLabel: 'Continue'
    });
    if (!ok) return;
  }
  if (ui.timerMode) persistCurrentTimer();
  stopTimer();
  patchCurrentAttempt({ stage: 'email-intro', itemIndex: 9, remainingSec: 420 });
  ui.wordCountHidden = false;
  render();
}

async function advanceToDiscussion({ timedOut = false } = {}) {
  if (ui.timerMode) persistCurrentTimer();
  const attempt = currentData().currentAttempt;
  if (!attempt) return;
  const blank = !String(attempt.answers?.email || '').trim();
  if (!timedOut) {
    const ok = await askConfirmation({
      title: 'Continue to Academic Discussion?',
      message: `${blank ? 'The Email response is blank. ' : ''}After continuing, you cannot return to the Email task.`,
      confirmLabel: 'Continue'
    });
    if (!ok) return;
  }
  if (ui.timerMode) persistCurrentTimer();
  stopTimer();
  patchCurrentAttempt({ stage: 'discussion-intro', remainingSec: 600 });
  ui.wordCountHidden = false;
  render();
}

async function submitCtw() {
  persistCurrentTimer();
  const attempt = currentData().currentAttempt;
  if (!attempt) return;
  const result = gradeCtest(ui.exam.ctest, attempt.answers);
  if (result.unanswered) {
    const ok = await askConfirmation({
      title: 'Submit incomplete answers?',
      message: `${result.unanswered} answer(s) are blank. Blank answers will be marked incorrect.`,
      confirmLabel: 'Submit anyway'
    });
    if (!ok) return;
  }
  persistCurrentTimer();
  stopTimer();
  const latest = currentData().currentAttempt || attempt;
  if (currentData().preferences.autoSaveMistakes) {
    result.details.filter((d)=>!d.correct).forEach((d)=>addNotebookEntry(findVocabWord(d.word, latest.setId)));
  }
  const completed = finishCurrentAttempt({ elapsedSec: latest.elapsedSec, stageTimings: latest.stageTimings, result });
  ui.exam = null;
  ui.view = 'detail';
  ui.detailAttemptId = completed.id;
  render();
}

async function submitWriting({ timedOut = false } = {}) {
  persistCurrentTimer();
  const attempt = currentData().currentAttempt;
  if (!attempt || ui.grading) return;
  const buildResult = gradeBuild(ui.exam.buildSet.items, attempt.answers?.build || {});
  const emailText = attempt.answers?.email || '';
  const discussionText = attempt.answers?.discussion || '';
  const localEmail = estimateEmailLocally(ui.exam.emailTask, emailText);
  const localDiscussion = estimateDiscussionLocally(ui.exam.discussionTask, discussionText);
  const blankCount = [emailText.trim(), discussionText.trim()].filter((item) => !item).length;
  if (blankCount && !timedOut) {
    const ok = await askConfirmation({
      title: 'Submit incomplete writing?',
      message: `${blankCount} extended writing response(s) are blank. Blank responses will receive no credit.`,
      confirmLabel: 'Submit anyway'
    });
    if (!ok) return;
  }

  ui.grading = true;
  stopTimer();
  app.innerHTML = renderExam();

  let email = localEmail;
  let discussion = localDiscussion;
  let gradingSource = 'local_analysis';
  const prefs = currentData().preferences;
  if (prefs.provider !== 'local') {
    try {
      [email, discussion] = await Promise.all([
        requestProviderGrade('email', ui.exam.emailTask, emailText),
        requestProviderGrade('discussion', ui.exam.discussionTask, discussionText)
      ]);
      gradingSource = email.source === 'llm_adjudicated' || discussion.source === 'llm_adjudicated' ? 'llm_adjudicated' : 'llm_dual';
    } catch (error) {
      console.warn('Provider grading failed; retaining local diagnostics only.', error);
      showToast('模型批改失敗；已保留本機診斷，但不會偽造 0–5 分數。', 'warning');
    }
  }

  const latest = currentData().currentAttempt || attempt;
  const result = {
    buildScore: buildResult.score,
    buildMaxScore: buildResult.maxScore,
    buildDetails: buildResult.details,
    email,
    discussion,
    rawScore: Number.isFinite(email.score) && Number.isFinite(discussion.score) ? buildResult.score + email.score + discussion.score : null,
    rawMaxScore: Number.isFinite(email.score) && Number.isFinite(discussion.score) ? 20 : null,
    gradingSource
  };
  const completed = finishCurrentAttempt({ result, elapsedSec: latest.elapsedSec || attempt.elapsedSec, stageTimings: latest.stageTimings || attempt.stageTimings });
  ui.grading = false;
  ui.exam = null;
  ui.view = 'detail';
  ui.detailAttemptId = completed.id;
  render();
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestProviderGrade(taskType, task, response) {
  const prefs = currentData().preferences;
  const base = prefs.apiBase ? prefs.apiBase.replace(/\/$/, '') : '';
  const route = prefs.gradeRoute.startsWith('/') ? prefs.gradeRoute : `/${prefs.gradeRoute}`;
  const { response: request, payload } = await fetchJsonWithTimeout(`${base}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: prefs.provider,
      model: prefs.graderModel || prefs.model || undefined,
      adjudicatorModel: prefs.adjudicatorModel || undefined,
      ...writingRubricPayload(taskType, task, response)
    })
  }, 120000);
  if (!request.ok) throw new Error(payload.error || `Grade API returned ${request.status}`);
  const score = Number(payload.score ?? payload.holistic_0_5);
  if (!Number.isFinite(score) || score < 0 || score > 5) throw new Error('Invalid holistic score returned by provider.');
  return {
    ...payload,
    score,
    source: payload.source || (payload.adjudicated ? 'llm_adjudicated' : 'llm_dual'),
    diagnostics: payload.diagnostics || payload.feedback || []
  };
}

function resetTextHistory(kind, value) {
  ui.textHistory[kind] = { entries: [value], index: 0, lock: false };
}

function pushTextHistory(kind, value) {
  const history = ui.textHistory[kind];
  if (!history || history.lock) return;
  if (history.entries[history.index] === value) return;
  history.entries = history.entries.slice(0, history.index + 1);
  history.entries.push(value);
  if (history.entries.length > 100) history.entries.shift();
  history.index = history.entries.length - 1;
}

function setWritingValue(kind, value) {
  const textarea = document.querySelector(`[data-writing-field="${kind}"]`);
  if (!textarea) return;
  const history = ui.textHistory[kind];
  history.lock = true;
  textarea.value = value;
  history.lock = false;
  updateWritingAnswer(kind, value, false);
  textarea.focus();
}

function updateWritingAnswer(kind, value, pushHistory = true) {
  const attempt = currentData().currentAttempt;
  if (!attempt) return;
  const answers = structuredClone(attempt.answers);
  answers[kind] = value;
  patchCurrentAttempt({ answers, remainingSec: timerSeconds() });
  if (pushHistory) pushTextHistory(kind, value);
  const words = wordCount(value);
  const count = document.querySelector('#word-count');
  if (count) count.textContent = `Word Count: ${words}`;
  const progress = document.querySelector('.word-progress');
  if (progress) progress.innerHTML = `<b>${words}</b> words`;
}

function editorAction(action, kind) {
  const textarea = document.querySelector(`[data-writing-field="${kind}"]`);
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  if (action === 'cut') {
    if (end > start) {
      ui.internalClipboard = textarea.value.slice(start, end);
      textarea.setRangeText('', start, end, 'start');
      updateWritingAnswer(kind, textarea.value);
    }
    textarea.focus();
  } else if (action === 'paste') {
    textarea.setRangeText(ui.internalClipboard, start, end, 'end');
    updateWritingAnswer(kind, textarea.value);
    textarea.focus();
  } else if (action === 'undo' || action === 'redo') {
    const history = ui.textHistory[kind];
    const delta = action === 'undo' ? -1 : 1;
    const nextIndex = Math.max(0, Math.min(history.entries.length - 1, history.index + delta));
    if (nextIndex !== history.index) {
      history.index = nextIndex;
      setWritingValue(kind, history.entries[nextIndex]);
    }
  }
}

function findVocabWord(word, setId = null) {
  const inBank = VOCABULARY_BANK.find((item) => item.word.toLowerCase() === String(word).toLowerCase());
  const inSet = setId ? findCtestSet(setId).vocabulary.find((item) => item.word.toLowerCase() === String(word).toLowerCase()) : null;
  return inBank || inSet || { word, cefr: 'Review', category: 'ctw', pos: '', meaning: '', family: '', collocation: '' };
}

function toggleWord(word) {
  const data = currentData();
  const existing = data.notebook.find((item) => item.word.toLowerCase() === word.toLowerCase());
  if (existing) {
    removeNotebookEntry(existing.id);
    showToast(`已從單字本移除 ${word}`);
  } else {
    addNotebookEntry(findVocabWord(word));
    showToast(`已加入單字本：${word}`);
  }
  render();
}

async function retryAttempt(attempt) {
  if (attempt.taskType === 'ctw') {
    if (!(await ensureFreshAttempt())) return;
    const base = findCtestSet(attempt.setId);
    const set = { ...base, ...(attempt.questionSnapshot || {}), id: attempt.setId, title: attempt.questionSnapshot?.title || attempt.setTitle || base.title };
    startCtwWithSet(set, attempt.generationMeta || null);
  } else if (attempt.taskType === 'reading') {
    if (!(await ensureFreshAttempt())) return;
    startReadingWithForm(
      attempt.questionSnapshot?.readingForm || findReadingForm(attempt.formId || attempt.setId),
      attempt.questionSnapshot?.ctestSets || null
    );
  } else if (attempt.questionSnapshot?.buildSet && attempt.questionSnapshot?.emailTask && attempt.questionSnapshot?.discussionTask) {
    if (!(await ensureFreshAttempt())) return;
    startWritingWithTasks(attempt.questionSnapshot.buildSet, attempt.questionSnapshot.emailTask, attempt.questionSnapshot.discussionTask, attempt.generationMeta || null);
  } else await startWriting({ setId: attempt.setId, emailTaskId: attempt.emailTaskId, discussionTaskId: attempt.discussionTaskId });
}

async function requestGeneratedItem(taskType) {
  const prefs = currentData().preferences;
  const base = prefs.apiBase ? prefs.apiBase.replace(/\/$/, '') : '';
  const route = prefs.generateRoute.startsWith('/') ? prefs.generateRoute : `/${prefs.generateRoute}`;
  const { response, payload } = await fetchJsonWithTimeout(`${base}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskType,
      provider: prefs.provider,
      model: prefs.model || undefined,
      generatorModel: prefs.generatorModel || undefined,
      verifierModel: prefs.verifierModel || undefined,
      level: taskType === 'ctw' ? 'B1–C1+' : 'A1–C2',
      verify: true
    })
  }, 120000);
  if (!response.ok) throw new Error(payload.error || `Generate API returned ${response.status}`);
  if (!payload.item) throw new Error('Generate API did not return an item.');
  return payload;
}


async function generateFocusedPractice(kind) {
  const prefs = currentData().preferences;
  if (prefs.provider === 'local') {
    const bank = focusedBank(kind);
    const item = bank[Math.floor(Math.random() * bank.length)];
    startFocusedPractice(kind, item.id, item, { source: 'local_bank', generatedAt: new Date().toISOString() });
    return;
  }
  ui.generating = kind;
  ui.generationMessage = `Generating an original ${kind === 'daily' ? 'Daily Life stimulus' : 'Academic Passage'}, then running structural, source-policy, duplicate, and verifier gates…`;
  render();
  try {
    const payload = await requestGeneratedItem(kind);
    ui.generating = null;
    ui.generationMessage = '';
    startFocusedPractice(kind, payload.item.id, payload.item, {
      source: payload.source,
      verifier: payload.verifier || null,
      duplicateScore: payload.duplicateScore ?? null,
      generatorVersion: payload.generatorVersion || null,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    ui.generating = null;
    ui.generationMessage = `Generation failed: ${error.message}`;
    render();
    showToast('Focused Reading 題目沒有通過全部品質閘門。', 'error');
  }
}

async function submitFocusedPractice() {
  if (!ui.focused || ui.focused.submitted) return;
  const result = focusedResult();
  if (result.unanswered) {
    const ok = await askConfirmation({
      title: 'Check incomplete practice?',
      message: `${result.unanswered} question(s) are unanswered. They will be marked incorrect in this guided review.`,
      confirmLabel: 'Check answers'
    });
    if (!ok) return;
  }
  ui.focused.submitted = true;
  ui.focused.completedAt = Date.now();
  render();
}

function nextFocusedPractice() {
  if (!ui.focused) return;
  const kind = ui.focused.kind;
  const bank = focusedBank(kind);
  const currentId = ui.focused.item.id;
  const currentIndex = Math.max(0, bank.findIndex((item) => item.id === currentId));
  const next = bank[(currentIndex + 1) % bank.length];
  startFocusedPractice(kind, next.id, next);
}

async function generateCtwPractice() {
  const existing = currentData().currentAttempt;
  if (existing) {
    const ok = await askConfirmation({
      title: 'Generate a replacement CTW?',
      message: 'Your current draft will remain until generation succeeds. After that, the new item will replace it.',
      confirmLabel: 'Generate replacement'
    });
    if (!ok) return;
  }
  const prefs = currentData().preferences;
  if (prefs.provider === 'local') {
    const set = CTEST_SETS[Math.floor(Math.random() * CTEST_SETS.length)];
    if (existing) discardCurrentAttempt();
    startCtwWithSet(set, { source: 'local_bank', generatedAt: new Date().toISOString() });
    return;
  }
  ui.generating = 'ctw';
  ui.generationMessage = 'Generating an original paragraph, then running deterministic C-test validation and a second-pass verifier…';
  render();
  try {
    const payload = await requestGeneratedItem('ctw');
    ui.generating = null;
    ui.generationMessage = '';
    if (existing) discardCurrentAttempt();
    startCtwWithSet(payload.item, { source: payload.source, verifier: payload.verifier || null, duplicateScore: payload.duplicateScore ?? null, generatorVersion: payload.generatorVersion || null, generatedAt: new Date().toISOString() });
  } catch (error) {
    ui.generating = null;
    ui.generationMessage = `Generation failed: ${error.message}`;
    render();
    showToast('題目生成沒有通過品質閘門；未建立作答。', 'error');
  }
}

async function generateWritingPractice() {
  const existing = currentData().currentAttempt;
  if (existing) {
    const ok = await askConfirmation({
      title: 'Generate a replacement Writing section?',
      message: 'Your current draft will remain until every generated task passes validation. The new section will then replace it.',
      confirmLabel: 'Generate replacement'
    });
    if (!ok) return;
  }
  const prefs = currentData().preferences;
  if (prefs.provider === 'local') {
    const buildSet = BUILD_SETS[Math.floor(Math.random() * BUILD_SETS.length)];
    const emailTask = EMAIL_TASKS[Math.floor(Math.random() * EMAIL_TASKS.length)];
    const discussionTask = DISCUSSION_TASKS[Math.floor(Math.random() * DISCUSSION_TASKS.length)];
    if (existing) discardCurrentAttempt();
    startWritingWithTasks(buildSet, emailTask, discussionTask, { source: 'local_bank', generatedAt: new Date().toISOString() });
    return;
  }
  ui.generating = 'writing';
  ui.generationMessage = 'Generating Build, Email, and Discussion independently; each task must pass its structural gate and verifier before the section starts…';
  render();
  try {
    const [build, email, discussion] = await Promise.all([
      requestGeneratedItem('build'), requestGeneratedItem('email'), requestGeneratedItem('discussion')
    ]);
    ui.generating = null;
    ui.generationMessage = '';
    if (existing) discardCurrentAttempt();
    startWritingWithTasks(build.item, email.item, discussion.item, {
      source: 'provider',
      generatorVersion: build.generatorVersion || email.generatorVersion || discussion.generatorVersion || null,
      verification: { build: build.verifier || null, email: email.verifier || null, discussion: discussion.verifier || null },
      duplicateScores: { build: build.duplicateScore ?? null, email: email.duplicateScore ?? null, discussion: discussion.duplicateScore ?? null },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    ui.generating = null;
    ui.generationMessage = `Generation failed: ${error.message}`;
    render();
    showToast('Writing 題組生成沒有全部通過品質閘門；未建立半套題目。', 'error');
  }
}

async function testProvider() {
  const status = document.querySelector('#provider-status');
  const prefs = currentData().preferences;
  if (prefs.provider === 'local') {
    if (status) {
      status.textContent = '✓ 本機題庫與離線診斷可用；不需要 API key';
      status.className = 'status-success';
    }
    return;
  }
  if (status) status.textContent = '連線中…';
  try {
    const base = prefs.apiBase ? prefs.apiBase.replace(/\/$/, '') : '';
    const query = new URLSearchParams({ provider: prefs.provider, ...(prefs.model ? { model: prefs.model } : {}) });
    const { response, payload } = await fetchJsonWithTimeout(`${base}/api/health?${query}`, { headers: { Accept: 'application/json' } }, 12000);
    if (!response.ok) throw new Error(payload.error || String(response.status));
    if (status) {
      status.textContent = payload.configured ? `✓ ${payload.provider} 已設定` : `後端可連線，但 ${payload.provider} 的模型或金鑰尚未設定`;
      status.className = payload.configured ? 'status-success' : 'status-warning';
    }
  } catch {
    if (status) {
      status.textContent = '無法連線；請先執行 node server.mjs';
      status.className = 'status-error';
    }
  }
}

async function handleClick(event) {
  if (event.target.classList?.contains('help-backdrop')) {
    ui.helpOpen = false;
    rerenderExamKeepingTimer();
    requestAnimationFrame(() => document.querySelector('.exam-tools [data-action="toggle-help"]')?.focus());
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'nav') {
    persistCurrentTimer();
    ui.exam = null;
    ui.focused = null;
    ui.view = target.dataset.view;
    ui.detailAttemptId = null;
    render();
  } else if (action === 'start-reading') await startReading();
  else if (action === 'start-focused') {
    const kind = target.dataset.kind === 'academic' ? 'academic' : 'daily';
    const selected = document.querySelector(`#focused-${kind}-select`)?.value;
    startFocusedPractice(kind, selected);
  }
  else if (action === 'generate-focused') await generateFocusedPractice(target.dataset.kind === 'academic' ? 'academic' : 'daily');
  else if (action === 'submit-focused') await submitFocusedPractice();
  else if (action === 'next-focused') nextFocusedPractice();
  else if (action === 'restart-focused') { if (ui.focused) startFocusedPractice(ui.focused.kind, ui.focused.item.id, ui.focused.item, ui.focused.generationMeta); }
  else if (action === 'close-focused') { ui.focused = null; ui.view = 'practice'; render(); }
  else if (action === 'download-content-audit') downloadFile(`toefl-content-audit-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(CONTENT_REPORT, null, 2));
  else if (action === 'start-ctw') await startCtw();
  else if (action === 'start-writing') await startWriting();
  else if (action === 'generate-ctw') await generateCtwPractice();
  else if (action === 'generate-writing') await generateWritingPractice();
  else if (action === 'resume-current') resumeCurrent();
  else if (action === 'discard-current') {
    const ok = await askConfirmation({
      title: 'Discard saved attempt?',
      message: 'This unfinished attempt and its answers will be permanently removed.',
      confirmLabel: 'Discard attempt',
      destructive: true
    });
    if (ok) {
      discardCurrentAttempt();
      render();
    }
  } else if (action === 'set-mode') {
    updatePreferences({ practiceMode: target.dataset.mode });
    render();
  } else if (action === 'record-filter') {
    ui.recordFilter = target.dataset.filter;
    render();
  } else if (action === 'view-attempt') {
    ui.view = 'detail';
    ui.detailAttemptId = target.dataset.id;
    render();
  } else if (action === 'retry-attempt') {
    const attempt = currentData().attempts.find((item) => item.id === target.dataset.id);
    if (attempt) await retryAttempt(attempt);
  } else if (action === 'export-json') {
    downloadFile(`toefl-practice-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(exportState(), null, 2));
  } else if (action === 'export-csv') {
    downloadFile(`toefl-practice-records-${new Date().toISOString().slice(0, 10)}.csv`, attemptsToCsv(), 'text/csv;charset=utf-8');
  } else if (action === 'trigger-import') document.querySelector('#import-file')?.click();
  else if (action === 'clear-records') {
    const ok = await askConfirmation({
      title: 'Clear all practice records?',
      message: 'Every completed attempt and the current draft will be permanently removed. Vocabulary notebook entries are not affected.',
      confirmLabel: 'Clear records',
      destructive: true
    });
    if (ok) {
      clearAttempts();
      render();
    }
  } else if (action === 'vocab-filter') {
    ui.vocabFilter = target.dataset.filter;
    render();
  } else if (action === 'toggle-word') toggleWord(target.dataset.word);
  else if (action === 'review-word') {
    const reviewed = reviewNotebookEntry(target.dataset.id, target.dataset.rating);
    if (reviewed) showToast(`${reviewed.word}: next review in ${reviewed.intervalDays} day${reviewed.intervalDays===1?'':'s'}.`);
    render();
  }
  else if (action === 'save-review-word') {
    const entry = findVocabWord(target.dataset.word, target.dataset.set);
    addNotebookEntry(entry);
    showToast(`已加入單字本：${entry.word}`);
  } else if (action === 'test-provider') testProvider();
  else if (action === 'toggle-help') {
    const opening = !ui.helpOpen;
    ui.helpOpen = opening;
    rerenderExamKeepingTimer();
    requestAnimationFrame(() => {
      if (opening) document.querySelector('.help-modal')?.focus();
      else document.querySelector('.exam-tools [data-action="toggle-help"]')?.focus();
    });
  } else if (action === 'toggle-timer') {
    ui.timerHidden = !ui.timerHidden;
    updatePreferences({ showTimer: !ui.timerHidden });
    updateTimerDom();
  } else if (action === 'leave-exam') {
    persistCurrentTimer();
    const ok = await askConfirmation({
      title: 'Leave this practice?',
      message: 'Your progress is already saved. You can resume this attempt from the dashboard.',
      confirmLabel: 'Save and exit'
    });
    if (ok) {
      stopTimer();
      ui.exam = null;
      ui.view = 'home';
      render();
    }
  } else if (action === 'begin-reading-module') beginReadingModule(1);
  else if (action === 'begin-reading-module2') beginReadingModule(2);
  else if (action === 'prev-reading-page') goReadingPage((currentData().currentAttempt?.pageIndex || 0) - 1);
  else if (action === 'next-reading-page') goReadingPage((currentData().currentAttempt?.pageIndex || 0) + 1);
  else if (action === 'end-reading-module') await finishReadingModule();
  else if (action === 'begin-writing-section') beginWritingSection();
  else if (action === 'begin-writing-task') beginWritingTask(currentData().currentAttempt?.stage === 'email-intro' ? 'email' : 'discussion');
  else if (action === 'submit-ctw') await submitCtw();
  else if (action === 'select-tile') selectTile(target.dataset.tileId);
  else if (action === 'clear-slot') activateBuildSlot(Number(target.dataset.slotIndex));
  else if (action === 'go-build-item') goBuildItem(Number(target.dataset.index));
  else if (action === 'prev-build') goBuildItem((currentData().currentAttempt?.itemIndex || 0) - 1);
  else if (action === 'next-build') goBuildItem((currentData().currentAttempt?.itemIndex || 0) + 1);
  else if (action === 'advance-email') await advanceToEmail();
  else if (action === 'advance-discussion') await advanceToDiscussion();
  else if (action === 'submit-writing') await submitWriting();
  else if (action === 'editor-cut') editorAction('cut', target.dataset.kind);
  else if (action === 'editor-paste') editorAction('paste', target.dataset.kind);
  else if (action === 'editor-undo') editorAction('undo', target.dataset.kind);
  else if (action === 'editor-redo') editorAction('redo', target.dataset.kind);
  else if (action === 'toggle-word-count') {
    ui.wordCountHidden = !ui.wordCountHidden;
    document.querySelector('#word-count')?.classList.toggle('hidden', ui.wordCountHidden);
    target.textContent = ui.wordCountHidden ? 'Show Word Count' : 'Hide Word Count';
  }
}

function handleInput(event) {
  const target = event.target;
  if (target.matches('[data-ctw-gap]')) {
    const gapId = target.dataset.ctwGap;
    const cleaned = target.value.replace(/[^A-Za-z]/g, '').slice(0, Number(target.maxLength));
    if (cleaned !== target.value) target.value = cleaned;
    const attempt = currentData().currentAttempt;
    if (!attempt) return;
    const answers = { ...attempt.answers, [gapId]: cleaned };
    patchCurrentAttempt({ answers });
    const progress = document.querySelector('.answer-progress');
    if (progress) {
      if (attempt.taskType === 'reading') {
        const module = currentReadingModule({ ...attempt, answers });
        progress.innerHTML = `<b>${moduleAnsweredCount(module, answers)}</b> of ${module.totalItems} answered`;
      } else {
        const answered = Object.values(answers).filter((value) => String(value).length > 0).length;
        progress.innerHTML = `<b>${answered}</b> of 10 answered`;
      }
    }
  } else if (target.matches('[data-writing-field]')) {
    updateWritingAnswer(target.dataset.writingField, target.value);
  } else if (target.matches('[data-vocab-search]')) {
    ui.vocabSearch = target.value;
    window.clearTimeout(handleInput.vocabTimer);
    handleInput.vocabTimer = window.setTimeout(render, 180);
  }
}

function handleChange(event) {
  const target = event.target;
  if (target.matches('[data-focused-option]')) {
    if (!ui.focused || ui.focused.submitted) return;
    ui.focused.answers[target.dataset.questionId] = target.value;
    const count = document.querySelector('.focused-actions strong');
    if (count) count.textContent = `${Object.keys(ui.focused.answers).length}/${ui.focused.item.questions.length} answered`;
  } else if (target.matches('[data-reading-option]')) {
    const attempt = currentData().currentAttempt;
    if (!attempt || attempt.taskType !== 'reading') return;
    const answers = { ...(attempt.answers || {}), [target.dataset.questionId]: target.value };
    patchCurrentAttempt({ answers });
    const module = currentReadingModule({ ...attempt, answers });
    const progress = document.querySelector('.answer-progress');
    if (progress) progress.innerHTML = `<b>${moduleAnsweredCount(module, answers)}</b> of ${module.totalItems} answered`;
  } else if (target.matches('[data-action="mobile-nav"]')) {
    ui.focused = null;
    ui.view = target.value;
    render();
  } else if (target.matches('[data-setting]')) {
    updatePreferences({ [target.dataset.setting]: target.value });
  } else if (target.id === 'reading-form-select') {
    updatePreferences({ readingFormId: target.value });
  } else if (target.id === 'build-set-select') {
    updatePreferences({ buildSetId: target.value });
  } else if (target.id === 'import-file') {
    const file = target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const payload = JSON.parse(text);
      importState(payload);
      showToast('紀錄已匯入。');
      render();
    }).catch(() => showToast('匯入失敗：檔案不是有效的 Practice Lab JSON。', 'error'));
  }
}

function handleDragStart(event) {
  const tile = event.target.closest('[data-tile-id]');
  if (!tile || tile.disabled) return;
  event.dataTransfer.setData('text/plain', tile.dataset.tileId);
  event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
  const slot = event.target.closest('[data-drop-slot]');
  if (!slot) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  slot.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.target.closest('[data-drop-slot]')?.classList.remove('drag-over');
}

function handleDrop(event) {
  const slot = event.target.closest('[data-drop-slot]');
  if (!slot) return;
  event.preventDefault();
  slot.classList.remove('drag-over');
  const tileId = event.dataTransfer.getData('text/plain');
  if (tileId) placeTile(tileId, Number(slot.dataset.dropSlot));
}

function handleBeforeUnload() {
  persistCurrentTimer();
  flushState();
}

document.addEventListener('click', (event) => {
  handleClick(event).catch((error) => {
    console.error('Action failed', error);
    showToast(`Action failed: ${error?.message || 'Unknown error'}`, 'error');
    if (ui.exam && !ui.timerMode && !ui.grading) bindExamAfterRender();
  });
});
document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);
document.addEventListener('dragstart', handleDragStart);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('dragleave', handleDragLeave);
document.addEventListener('drop', handleDrop);
window.addEventListener('beforeunload', handleBeforeUnload);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') handleBeforeUnload(); });

document.addEventListener('keydown', (event) => {
  if (!ui.helpOpen) return;
  const modal = document.querySelector('.help-modal');
  if (event.key === 'Escape') {
    event.preventDefault();
    ui.helpOpen = false;
    rerenderExamKeepingTimer();
    requestAnimationFrame(() => document.querySelector('.exam-tools [data-action="toggle-help"]')?.focus());
    return;
  }
  if (event.key !== 'Tab' || !modal) return;
  const focusable = [...modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) {
    event.preventDefault();
    modal.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

render();

const preview = new URLSearchParams(location.search).get('preview');
if (preview === 'ctw' && !currentData().currentAttempt) {
  startCtw('ctw-maps-arguments');
} else if (['writing','email','discussion'].includes(preview) && !currentData().currentAttempt) {
  startWriting({ emailTaskId: 'email-room-reservation', discussionTaskId: 'discussion-campus-cars' });
  if (preview === 'email') { patchCurrentAttempt({ stage:'email', remainingSec:420 }); resumeCurrent(); }
  if (preview === 'discussion') { patchCurrentAttempt({ stage:'discussion', remainingSec:600 }); resumeCurrent(); }
}
