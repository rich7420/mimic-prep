import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BUILD_SETS, CTEST_SETS, DISCUSSION_TASKS, EMAIL_TASKS } from '../src/data.js';
import { READING_FORMS } from '../src/reading-data.js';
import { SUPPLEMENTAL_DAILY_BANK, SUPPLEMENTAL_ACADEMIC_BANK } from '../src/focused-reading-data.js';
import { buildCoverageReport } from '../src/content-intelligence.js';

const report = buildCoverageReport({
  ctestSets: CTEST_SETS,
  readingForms: READING_FORMS,
  buildSets: BUILD_SETS,
  emailTasks: EMAIL_TASKS,
  discussionTasks: DISCUSSION_TASKS,
  focusedDaily: SUPPLEMENTAL_DAILY_BANK,
  focusedAcademic: SUPPLEMENTAL_ACADEMIC_BANK
});

const output = resolve(process.argv[2] || 'CONTENT_AUDIT.json');
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Content audit written to ${output}`);
console.log(`Structural gate: ${report.releaseGate.structuralPass ? 'PASS' : 'FAIL'}`);
console.log(`Editorial coverage score: ${report.editorialCoverageScore}/100`);
console.log(`Reading forms: ${report.counts.readingForms}`);
console.log(`Daily Life formats covered: ${report.coverage.dailyFormats.covered.length}/${report.coverage.dailyFormats.covered.length + report.coverage.dailyFormats.missing.length}`);
console.log(`Academic domains covered: ${report.coverage.academicDomains.covered.length}/${report.coverage.academicDomains.covered.length + report.coverage.academicDomains.missing.length}`);
console.log(`Build grammar families covered: ${report.coverage.buildGrammar.covered.length}/${report.coverage.buildGrammar.covered.length + report.coverage.buildGrammar.missing.length}`);
console.log(`Warnings requiring editorial review: ${report.warnings.length}`);
console.log(`Near-duplicate pairs requiring review: ${report.duplicates.nearDuplicates.length}`);

if (!report.releaseGate.structuralPass) process.exitCode = 1;
