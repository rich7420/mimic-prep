/**
 * Public-source registry used to ground blueprints and editorial checks.
 * The application stores metadata and permitted uses only. It does not bundle
 * or reproduce ETS questions, answer keys, live items, leaked items, or TPO.
 */

export const SOURCE_REGISTRY_VERSION = '2026-08-26';

const referenceOnly = {
  license: 'reference-only',
  allowedUses: ['blueprint-analysis', 'interface-comparison', 'coverage-benchmark', 'rubric-alignment'],
  prohibitedUses: ['public-republication', 'near-copy-generation', 'operational-item-reconstruction', 'training-corpus-export']
};

export const OFFICIAL_SOURCE_REGISTRY = [
  {
    id: 'ets-content-structure-2026',
    publisher: 'ETS',
    title: 'TOEFL iBT Test Content and Structure',
    url: 'https://www.ets.org/toefl/test-takers/ibt/about/content.html',
    sourceType: 'official-operational-overview',
    contentFidelity: 'official-summary',
    uiFidelity: 'none',
    formatAlignment: '2026-operational',
    taskTypes: ['reading', 'writing', 'listening', 'speaking'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-technical-manual-rr106',
    publisher: 'ETS Research',
    title: 'TOEFL iBT Technical Manual (RR-106)',
    url: 'https://rr.ets.org/index.php/etsrr/article/download/28/17/34',
    sourceType: 'technical-manual',
    contentFidelity: 'official-technical',
    uiFidelity: 'selected-figures',
    formatAlignment: '2026-design-rationale',
    taskTypes: ['reading', 'writing', 'scoring', 'fairness', 'adaptivity'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-blueprint-specification-2026',
    publisher: 'ETS',
    title: 'TOEFL iBT 2026 Test Blueprint and Specifications',
    url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf',
    sourceType: 'official-specification',
    contentFidelity: 'official-blueprint',
    uiFidelity: 'none',
    formatAlignment: '2026-blueprint',
    taskTypes: ['reading', 'writing', 'timing', 'cefr', 'scoring'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-writing-rubrics-2026',
    publisher: 'ETS',
    title: 'TOEFL iBT Writing Scoring Guide',
    url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/writing-rubrics.pdf',
    sourceType: 'official-rubric',
    contentFidelity: 'official-rubric',
    uiFidelity: 'none',
    formatAlignment: '2026-operational',
    taskTypes: ['email', 'discussion'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-sample-test-2026',
    publisher: 'ETS',
    title: 'TOEFL Sample Test January 2026',
    url: 'https://www.ets.org/toefl/test-takers/ibt/prepare/sample-test-jan-2026-1.html',
    sourceType: 'official-interactive-sample',
    contentFidelity: 'official-sample',
    uiFidelity: 'highest-public-reference',
    formatAlignment: '2026-interactive',
    taskTypes: ['reading', 'writing', 'interaction'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-practice-test-1',
    publisher: 'ETS',
    title: 'TOEFL iBT Full-Length Practice Test 1',
    url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-full-length-practice-test-1.pdf',
    sourceType: 'official-public-practice',
    contentFidelity: 'official-practice-content',
    uiFidelity: 'paper-adaptation',
    formatAlignment: '2026-paper-adaptation',
    taskTypes: ['reading', 'writing'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-practice-test-2',
    publisher: 'ETS',
    title: 'TOEFL iBT Full-Length Practice Test 2',
    url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-full-length-practice-test-2.pdf',
    sourceType: 'official-public-practice',
    contentFidelity: 'official-practice-content',
    uiFidelity: 'paper-adaptation',
    formatAlignment: '2026-paper-adaptation',
    taskTypes: ['reading', 'writing'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  ...[1, 2, 3, 4, 5].map((number) => ({
    id: `ets-teacher-practice-test-${number}`,
    publisher: 'ETS',
    title: `TOEFL iBT Teacher Resources Practice Test ${number}`,
    url: `https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-${number}.pdf`,
    sourceType: 'official-public-teacher-practice',
    contentFidelity: 'official-practice-content',
    uiFidelity: 'paper-adaptation',
    formatAlignment: '2026-paper-adaptation',
    taskTypes: ['reading', 'writing'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  })),
  {
    id: 'ets-reading-lesson-plan-2026',
    publisher: 'ETS',
    title: 'TOEFL iBT Reading Lesson Plan',
    url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-lesson-plan-reading.pdf',
    sourceType: 'official-teaching-resource',
    contentFidelity: 'official-instructional',
    uiFidelity: 'none',
    formatAlignment: '2026',
    taskTypes: ['ctw', 'daily', 'academic'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-writing-lesson-plan-2026',
    publisher: 'ETS',
    title: 'TOEFL iBT Writing Lesson Plan',
    url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-lesson-plan-writing.pdf',
    sourceType: 'official-teaching-resource',
    contentFidelity: 'official-instructional',
    uiFidelity: 'selected-task-layout',
    formatAlignment: '2026',
    taskTypes: ['build', 'email', 'discussion'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  },
  {
    id: 'ets-testready',
    publisher: 'ETS',
    title: 'TOEFL TestReady',
    url: 'https://www.ets.org/toefl/test-takers/ibt/prepare/toefl-testready.html',
    sourceType: 'official-preparation-platform',
    contentFidelity: 'official-platform',
    uiFidelity: 'product-benchmark',
    formatAlignment: 'current',
    taskTypes: ['mock', 'section-practice', 'focused-practice', 'feedback'],
    verifiedAt: SOURCE_REGISTRY_VERSION,
    ...referenceOnly
  }
];

export function sourceById(id) {
  return OFFICIAL_SOURCE_REGISTRY.find((source) => source.id === id) || null;
}

export function validateSourceRegistry(sources = OFFICIAL_SOURCE_REGISTRY) {
  const errors = [];
  const ids = new Set();
  for (const source of sources) {
    if (!source.id || !source.title || !source.url) errors.push('Every source needs id, title, and URL.');
    if (ids.has(source.id)) errors.push(`Duplicate source id: ${source.id}`);
    ids.add(source.id);
    if (source.publisher !== 'ETS' && source.publisher !== 'ETS Research') errors.push(`${source.id}: official registry accepts ETS sources only.`);
    if (!Array.isArray(source.allowedUses) || !source.allowedUses.length) errors.push(`${source.id}: allowedUses missing.`);
    if (!Array.isArray(source.prohibitedUses) || !source.prohibitedUses.includes('public-republication')) errors.push(`${source.id}: republication policy missing.`);
  }
  return { valid: errors.length === 0, errors };
}
