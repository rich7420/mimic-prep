import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { APP_META, BUILD_SETS, CTEST_SETS, DISCUSSION_TASKS, EMAIL_TASKS } from '../src/data.js';
import { READING_FORMS } from '../src/reading-data.js';
import { SUPPLEMENTAL_DAILY_BANK, SUPPLEMENTAL_ACADEMIC_BANK } from '../src/focused-reading-data.js';
import { OFFICIAL_SOURCE_REGISTRY, validateSourceRegistry } from '../src/official-sources.js';
import { buildCoverageReport } from '../src/content-intelligence.js';

const root = resolve(new URL('../', import.meta.url).pathname);
const failures = [];
const checks = [];
const required = [
  'package.json', 'index.html', 'standalone.html', 'styles.css', 'server.mjs',
  'README.md', 'RESEARCH.md', 'REVIEW.md', 'AUDIT.md', 'CONTENT_INTELLIGENCE.md',
  'SOURCE_POLICY.md', 'CHANGELOG.md', 'QA_RESULTS.txt', 'CONTENT_AUDIT.json',
  'src/app.js', 'src/data.js', 'src/reading-data.js', 'src/reading-form-02.js',
  'src/official-sources.js', 'src/blueprints.js', 'src/content-intelligence.js',
  'server/validation.mjs', 'server/prompts.mjs', 'scripts/content-audit.mjs',
  'scripts/e2e-smoke.py'
];

function record(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  if (!pass) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

for (const file of required) {
  try {
    const info = await stat(join(root, file));
    record(`required:${file}`, info.isFile() && info.size > 0, `${info.size} bytes`);
  } catch {
    record(`required:${file}`, false, 'missing');
  }
}

const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const storageSource = await readFile(join(root, 'src/storage.js'), 'utf8');
const standalone = await readFile(join(root, 'standalone.html'), 'utf8');
const appSource = await readFile(join(root, 'src/app.js'), 'utf8');

record('version:package-vs-app', packageJson.version === APP_META.version, `${packageJson.version} / ${APP_META.version}`);
record('version:storage', storageSource.includes(`const APP_VERSION = '${APP_META.version}'`), APP_META.version);
record('standalone:min-size', Buffer.byteLength(standalone) > 250_000, `${Buffer.byteLength(standalone)} bytes`);
record('standalone:version', standalone.includes(`version: '${APP_META.version}'`) || standalone.includes(`v${APP_META.version}`), APP_META.version);
record('interaction:no-native-confirm', !appSource.includes('window.confirm(') && !standalone.includes('window.confirm('));
record('source-registry:valid', validateSourceRegistry(OFFICIAL_SOURCE_REGISTRY).valid, `${OFFICIAL_SOURCE_REGISTRY.length} sources`);
record('source-registry:official-only', OFFICIAL_SOURCE_REGISTRY.every((source) => ['ETS', 'ETS Research'].includes(source.publisher)));

const report = buildCoverageReport({
  ctestSets: CTEST_SETS,
  readingForms: READING_FORMS,
  buildSets: BUILD_SETS,
  emailTasks: EMAIL_TASKS,
  discussionTasks: DISCUSSION_TASKS,
  focusedDaily: SUPPLEMENTAL_DAILY_BANK,
  focusedAcademic: SUPPLEMENTAL_ACADEMIC_BANK
});
record('content:structural-gate', report.releaseGate.structuralPass);
const hardErrorCount = Array.isArray(report.hardErrors) ? report.hardErrors.length : Number.POSITIVE_INFINITY;
record('content:no-hard-errors', hardErrorCount === 0, `${hardErrorCount}`);
record('content:no-unreviewed-near-duplicates', !report.releaseGate.nearDuplicateReviewRequired, `${report.duplicates.nearDuplicates.length}`);
record('content:two-reading-forms', report.counts.readingForms >= 2, `${report.counts.readingForms}`);
record('content:editorial-coverage', report.editorialCoverageScore === 100, `${report.editorialCoverageScore}/100`);
record('claims:human-review-still-required', report.releaseGate.humanReviewRequired === true);
record('claims:pilot-still-required', report.releaseGate.pilotRequired === true);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', '.git'].includes(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const manifestFiles = [];
for (const full of await walk(root)) {
  const rel = relative(root, full).replaceAll('\\', '/');
  if (rel === 'RELEASE_MANIFEST.json' || rel.startsWith('qa/v4-') || rel.startsWith('qa/debug-')) continue;
  const body = await readFile(full);
  manifestFiles.push({
    path: rel,
    bytes: body.byteLength,
    sha256: createHash('sha256').update(body).digest('hex')
  });
}
manifestFiles.sort((a, b) => a.path.localeCompare(b.path));

const manifest = {
  product: 'TOEFL 2026 Practice Lab',
  version: APP_META.version,
  generatedAt: new Date().toISOString(),
  releasePositioning: 'unofficial controlled-pilot candidate; not official TOEFL-equivalent',
  sourceRegistryVersion: report.sourceRegistryVersion,
  editorialCoverageScore: report.editorialCoverageScore,
  psychometricCalibration: false,
  humanEditorialReviewRequired: true,
  pilotRequired: true,
  counts: report.counts,
  checks,
  files: manifestFiles
};
await writeFile(join(root, 'RELEASE_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

for (const check of checks) console.log(`${check.pass ? 'PASS' : 'FAIL'}  ${check.name}${check.detail ? ` — ${check.detail}` : ''}`);
console.log(`Release manifest written: RELEASE_MANIFEST.json (${manifestFiles.length} files)`);
if (failures.length) {
  console.error(`\nRelease gate failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`\nRELEASE_GATE_OK v${APP_META.version}`);
