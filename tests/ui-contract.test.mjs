import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const serverSource = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

test('all confirmations are rendered in-app rather than using native browser dialogs', () => {
  assert.doesNotMatch(appSource, /window\.confirm\s*\(/);
  assert.match(appSource, /function askConfirmation\s*\(/);
  assert.match(styles, /\.confirm-modal\s*\{/);
});

test('incomplete CTW and Writing submissions use the in-app confirmation flow', () => {
  assert.match(appSource, /title: 'Submit incomplete answers\?'/);
  assert.match(appSource, /title: 'Submit incomplete writing\?'/);
  assert.match(appSource, /confirmLabel: 'Submit anyway'/);
});

test('Exit saves the draft and uses an explicit in-app confirmation', () => {
  assert.match(appSource, /title: 'Leave this practice\?'/);
  assert.match(appSource, /confirmLabel: 'Save and exit'/);
  assert.match(appSource, /ui\.view = 'home'/);
});


test('confirmation dialogs pause active exam timing and resume only on cancellation', () => {
  assert.match(appSource, /function pauseActiveTimerForDialog\s*\(/);
  assert.match(appSource, /persistCurrentTimer\(paused\.value\)/);
  assert.match(appSource, /if \(!value\) resumePausedTimer\(pausedTimer\)/);
});

test('provider requests have client-side timeouts rather than hanging indefinitely', () => {
  assert.match(appSource, /function fetchJsonWithTimeout\s*\(/);
  assert.match(appSource, /controller\.abort\(\)/);
  assert.match(appSource, /120000/);
});

test('Email and Discussion exam copy follows the public task presentation more closely', () => {
  assert.doesNotMatch(appSource, /\$\{visualCard\(task\)\}/);
  assert.match(appSource, /An effective response will contain at least 100 words\./);
  assert.doesNotMatch(appSource, /minimum of 100 words/);
});

test('compact practice view removes the former 720px forced exam width', () => {
  assert.doesNotMatch(styles, /\.exam-screen\s*\{\s*min-width:\s*720px/);
  assert.match(styles, /\.split-writing-main\s*\{[\s\S]*display:\s*block/);
  assert.match(styles, /overflow-x:\s*hidden/);
});

test('directions modal is labelled and keyboard-contained', () => {
  assert.match(appSource, /aria-labelledby="help-modal-title"/);
  assert.match(appSource, /focusable = \[\.\.\.modal\.querySelectorAll/);
  assert.match(appSource, /document\.querySelector\('\.help-modal'\)\?\.focus/);
});

test('autosave is flushed when the page is hidden or unloaded', () => {
  assert.match(appSource, /flushState\(\)/);
  assert.match(appSource, /visibilitychange/);
});

test('provider health check follows the provider selected in the UI', () => {
  assert.match(appSource, /URLSearchParams\(\{ provider: prefs\.provider/);
  assert.match(appSource, /本機題庫與離線診斷可用/);
});


test('full Reading mock exposes formal directions, two locked modules, and post-test research disclosure', () => {
  assert.match(appSource, /Reading Section Directions/);
  assert.match(appSource, /Begin Module 1/);
  assert.match(appSource, /MODULE 1 COMPLETE/);
  assert.match(appSource, /You cannot return to that module/);
  assert.match(appSource, /Research items disclosed after the test/);
  assert.match(appSource, /finishReadingModule/);
});

test('Reading exam implements CTW, Daily Life, and Academic Passage pages with native answer controls', () => {
  assert.match(appSource, /Complete the Words/);
  assert.match(appSource, /Read in Daily Life/);
  assert.match(appSource, /Read an Academic Passage/);
  assert.match(appSource, /type="radio"/);
  assert.match(appSource, /data-reading-option/);
  assert.match(styles, /\.reading-question-layout/);
  assert.match(styles, /\.reading-option:has\(input:checked\)/);
});

test('section intro and module transition screens are explicitly untimed', () => {
  assert.match(appSource, /showTimer: false/);
  assert.match(appSource, /Directions time is not counted/);
  assert.match(appSource, /new Set\(\['reading-intro', 'reading-transition', 'writing-intro', 'email-intro', 'discussion-intro'\]\)/);
});


test('Content Intelligence view exposes source policy, editorial coverage, and calibration limits', () => {
  assert.match(appSource, /題庫品質/);
  assert.match(appSource, /CONTENT INTELLIGENCE/i);
  assert.match(appSource, /editorial coverage/i);
  assert.match(appSource, /psychometric/i);
  assert.match(appSource, /Draft[\s\S]*Validate[\s\S]*Review[\s\S]*Pilot[\s\S]*Active/);
  assert.match(appSource, /data-action="download-content-audit"/);
  assert.match(styles, /\.content-hero/);
  assert.match(styles, /\.source-table/);
});

test('Focused Daily and Academic practice are explicitly separated from formal mock mode', () => {
  assert.match(appSource, /Focused Practice/);
  assert.match(appSource, /GUIDED PRACTICE · NOT A MOCK/);
  assert.match(appSource, /data-action="start-focused" data-kind="daily"/);
  assert.match(appSource, /data-action="start-focused" data-kind="academic"/);
  assert.match(appSource, /data-action="submit-focused"/);
  assert.match(appSource, /data-action="generate-focused"/);
  assert.match(styles, /\.focused-layout/);
  assert.match(styles, /\.focused-option:has\(input:checked\)/);
});

test('provider generation supports all six implemented task families', () => {
  assert.match(serverSource, /GENERATABLE_TYPES=\['ctw','daily','academic','build','email','discussion'\]/);
  assert.match(appSource, /requestGeneratedItem\('ctw'\)/);
  assert.match(appSource, /requestGeneratedItem\('build'\)/);
  assert.match(appSource, /requestGeneratedItem\('email'\)/);
  assert.match(appSource, /requestGeneratedItem\('discussion'\)/);
  assert.match(appSource, /generateFocusedPractice\(kind\)/);
  assert.match(appSource, /requestGeneratedItem\(kind\)/);
});
