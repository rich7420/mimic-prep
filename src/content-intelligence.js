import { countWords, validateCtestPassage } from './ctest.js';
import { FORM_BLUEPRINT, SOURCE_POLICY, TASK_BLUEPRINTS } from './blueprints.js';
import { OFFICIAL_SOURCE_REGISTRY, validateSourceRegistry } from './official-sources.js';

const TOKEN_RE = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;
const SENTENCE_RE = /[^.!?]+[.!?]+/g;

const DAILY_FORMAT_ALIASES = {
  flyer: 'poster',
  post: 'social-post',
  social: 'social-post',
  messages: 'messages',
  message: 'messages',
  'message-thread': 'messages',
  ad: 'advertisement',
  advertisement: 'advertisement',
  webpage: 'webpage',
  web: 'webpage',
  email: 'email',
  notice: 'notice',
  schedule: 'schedule',
  menu: 'menu',
  form: 'form',
  invoice: 'invoice',
  receipt: 'receipt',
  sign: 'sign',
  poster: 'poster',
  'news-article': 'news-article',
  news: 'news-article'
};

const ACADEMIC_DOMAIN_ALIASES = [
  [/history|archaeolog|ancient|histor/i, 'history'],
  [/art|music|mural|painting|visual/i, 'art-and-music'],
  [/business|economic|market|consumer|subscription/i, 'business-and-economics'],
  [/life science|biology|ecology|environment|animal|plant|microbe|pollination|bird/i, 'life-science'],
  [/physical science|physics|chemistry|geology|thermal|pigment|material/i, 'physical-science'],
  [/social science|anthropology|sociology|psychology|cognition|urban planning/i, 'social-science']
];

const SKILL_ALIASES = {
  'scan-detail': 'scan',
  'explicit-detail': 'factual-information',
  detail: 'factual-information',
  purpose: 'purpose',
  inference: 'inference',
  'apply-information': 'apply-information',
  'main-idea': 'main-idea',
  vocabulary: 'vocabulary-in-context',
  'vocabulary-in-context': 'vocabulary-in-context',
  'rhetorical-purpose': 'rhetorical-purpose',
  'idea-relationship': 'idea-relationships',
  'idea-relationships': 'idea-relationships',
  'nonlinear-information': 'nonlinear-information',
  scan: 'scan',
  skim: 'skim',
  idiom: 'idiom',
  'informal-language': 'informal-language',
  'telegraphic-language': 'telegraphic-language'
};

const BUILD_GRAMMAR_ALIASES = [
  [/indirect question|embedded question/i, 'indirect-question'],
  [/inversion|question word order|auxiliary/i, 'auxiliary-inversion'],
  [/relative clause/i, 'relative-clause'],
  [/noun clause/i, 'noun-clause'],
  [/conditional/i, 'conditional'],
  [/passive/i, 'passive'],
  [/perfect/i, 'perfect-aspect'],
  [/verb complement|infinitive|gerund/i, 'verb-complement'],
  [/comparative|comparison/i, 'comparison'],
  [/negation|negative/i, 'negation'],
  [/reported speech/i, 'reported-speech'],
  [/clause combination|clause order|subordinate/i, 'clause-combination'],
  [/temporal|time clause/i, 'temporal-clause'],
  [/modal/i, 'modal'],
  [/agreement|subject.?verb/i, 'agreement']
];

const PURPOSE_PATTERNS = [
  ['request', /\bask\b|\brequest\b|could you|would you|please|need .* help/i],
  ['give-information', /explain|describe|inform|let .* know|provide .* information/i],
  ['status-inquiry', /status|whether|when .* available|follow up|update/i],
  ['recommendation', /recommend|suggest|advice/i],
  ['invitation', /invite|join|attend|participate/i],
  ['problem-solution', /problem|issue|restore|replace|alternative|resolve|solution|fix/i],
  ['explanation', /explain|reason|because|why/i]
];

function tokens(text) {
  return (String(text || '').toLowerCase().match(TOKEN_RE) || []).map((token) => token.replace('’', "'"));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeLabel(value) {
  return String(value || '').trim().toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '-');
}

export function normalizeDailyFormat(value) {
  const key = normalizeLabel(value);
  return DAILY_FORMAT_ALIASES[key] || key || 'unknown';
}

export function canonicalAcademicDomain(value) {
  const text = String(value || '');
  const hits = ACADEMIC_DOMAIN_ALIASES.filter(([pattern]) => pattern.test(text)).map(([, domain]) => domain);
  return hits[0] || 'unclassified';
}

export function normalizeSkill(value) {
  const key = normalizeLabel(value);
  return SKILL_ALIASES[key] || key || 'unclassified';
}

function normalizeBuildGrammar(value) {
  const text = String(value || '');
  for (const [pattern, label] of BUILD_GRAMMAR_ALIASES) if (pattern.test(text)) return label;
  return normalizeLabel(text) || 'unclassified';
}

function estimatePartOfSpeech(word) {
  const value = String(word || '').toLowerCase();
  if (/ly$/.test(value)) return 'adverb';
  if (/(tion|sion|ment|ness|ity|ance|ence|ship|ism|age|ery|al)$/.test(value)) return 'noun';
  if (/(ous|ive|able|ible|ful|less|ic|ical|ary|ory|ent|ant)$/.test(value)) return 'adjective';
  if (/(ize|ise|ify|ate|en)$/.test(value)) return 'verb';
  if (/(ed|ing)$/.test(value)) return 'verb-or-adjective';
  return 'other';
}

function textFingerprint(text, n = 5) {
  const list = tokens(text);
  const grams = new Set();
  for (let index = 0; index <= list.length - n; index += 1) grams.add(list.slice(index, index + n).join(' '));
  return grams;
}

function jaccard(left, right) {
  if (!left.size && !right.size) return 0;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return intersection / Math.max(1, left.size + right.size - intersection);
}

function itemText(type, item) {
  if (type === 'ctw') return item.sourceText || '';
  if (type === 'daily' || type === 'academic') return [item.title, item.label, item.text, ...(item.questions || []).map((question) => `${question.stem} ${(question.options || []).map((option) => option.text).join(' ')}`)].join(' ');
  if (type === 'build') return (item.items || []).map((question) => [question.promptA, question.prefix, question.suffix, ...(question.choices || []).map((choice) => choice.text)].join(' ')).join(' ');
  if (type === 'email') return [item.title, item.setting, item.scenario, ...(item.goals || [])].join(' ');
  if (type === 'discussion') return [item.course, item.question, ...(item.students || []).map((student) => student.post)].join(' ');
  return JSON.stringify(item || {});
}

export function contentFingerprint(type, item) {
  return textFingerprint(itemText(type, item));
}

export function validateProvenance(item = {}) {
  const provenance = item.provenance?.kind || item.provenance || 'original';
  const errors = [];
  const warnings = [];
  if (SOURCE_POLICY.prohibitedProvenance.includes(provenance)) errors.push(`Prohibited item provenance: ${provenance}.`);
  if (!SOURCE_POLICY.allowedProvenance.includes(provenance)) warnings.push(`Unrecognized provenance “${provenance}”; human review is required.`);
  if (provenance === 'original' && item.provenance && typeof item.provenance === 'object') {
    if (item.provenance.operationalItem === true || item.provenance.leaked === true || item.provenance.recalled === true) {
      errors.push('Original provenance conflicts with an operational, leaked, or recalled-item flag.');
    }
  }
  return { valid: errors.length === 0, provenance, errors, warnings };
}

export function analyzeCtw(set) {
  const options = {
    targetLexicalPositions: set.targetLexicalPositions || null,
    targetPolicy: set.targetPolicy || (set.targetLexicalPositions ? 'curated' : 'canonical-every-second-word')
  };
  const validation = validateCtestPassage(set.sourceText, options);
  const source = String(set.sourceText || '');
  const sourceTokens = source.match(TOKEN_RE) || [];
  const sentences = source.match(SENTENCE_RE) || [];
  const capitalizedInsideSentence = (source.match(/(?<!^)(?<![.!?]\s)[A-Z][a-z]+/g) || []).length;
  const dialogueDetected = /(^|\s)[“"][^”"]+[”"]|\b(said|asked|replied|told)\b.{0,30}[“"]/i.test(source);
  const chatDetected = /(^|\n)\s*(from|to|subject|[A-Z][A-Za-z ]{0,20}:)\s/i.test(source);
  const longWordRatio = sourceTokens.length ? sourceTokens.filter((word) => word.length >= 13).length / sourceTokens.length : 0;
  const targetPos = validation.ctest ? validation.ctest.gaps.map((gap) => estimatePartOfSpeech(gap.word)) : [];
  const warnings = [...validation.warnings];
  if (sentences.length < 3) warnings.push('CTW passage has fewer than three complete sentences; coherence should be reviewed.');
  if (capitalizedInsideSentence > 5) warnings.push('CTW passage may rely on too many proper nouns.');
  if (dialogueDetected || chatDetected) warnings.push('CTW passage appears to contain dialogue, chat, or message formatting.');
  if (longWordRatio > 0.08) warnings.push('CTW passage contains an unusually high share of very long words; check jargon load.');
  const provenance = validateProvenance(set);
  return {
    id: set.id,
    valid: validation.valid && provenance.valid,
    errors: [...validation.errors, ...provenance.errors],
    warnings: [...warnings, ...provenance.warnings],
    wordCount: validation.ctest?.wordCount ?? countWords(source),
    sentenceCount: sentences.length,
    gapCount: validation.ctest?.gaps.length || 0,
    targetPolicy: options.targetPolicy,
    targetPartOfSpeech: targetPos,
    targetPartOfSpeechCoverage: unique(targetPos),
    properNounEstimate: capitalizedInsideSentence,
    dialogueDetected: dialogueDetected || chatDetected,
    longWordRatio: Number(longWordRatio.toFixed(3)),
    domain: set.domain || 'Unclassified',
    level: set.level || 'Unclassified',
    provenance: provenance.provenance
  };
}

function validateMcqQuestion(question, context) {
  const errors = [];
  const warnings = [];
  if (!question?.id || !question?.stem) errors.push(`${context}: question needs an id and stem.`);
  if (!Array.isArray(question?.options) || question.options.length !== 4) errors.push(`${context}: question needs exactly four options.`);
  const ids = (question?.options || []).map((option) => option.id);
  if (new Set(ids).size !== ids.length) errors.push(`${context}: option IDs must be unique.`);
  if (!ids.includes(question?.answer)) errors.push(`${context}: answer must match an option ID.`);
  if (!question?.skill) warnings.push(`${context}: skill tag is missing.`);
  return { errors, warnings };
}

export function analyzeDaily(stimulus) {
  const blueprint = TASK_BLUEPRINTS.daily.constraints;
  const errors = [];
  const warnings = [];
  const wordCountValue = countWords(stimulus.text || '');
  const format = normalizeDailyFormat(stimulus.type || stimulus.format);
  const questionCount = Array.isArray(stimulus.questions) ? stimulus.questions.length : 0;
  if (!stimulus?.id || !stimulus?.title || !stimulus?.text) errors.push('Daily Life stimulus needs id, title, and text.');
  if (wordCountValue < blueprint.wordCount[0] || wordCountValue > blueprint.wordCount[1]) errors.push(`Daily Life stimulus must contain ${blueprint.wordCount[0]}–${blueprint.wordCount[1]} words; received ${wordCountValue}.`);
  if (!blueprint.questionsPerStimulus.includes(questionCount)) errors.push(`Daily Life stimulus needs 2 or 3 questions; received ${questionCount}.`);
  if (!blueprint.formats.includes(format)) warnings.push(`Daily Life format “${format}” is outside the public format list.`);
  const skills = [];
  for (const question of stimulus.questions || []) {
    const result = validateMcqQuestion(question, `${stimulus.id}/${question.id || 'question'}`);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    skills.push(normalizeSkill(question.skill));
  }
  const provenance = validateProvenance(stimulus);
  return {
    id: stimulus.id,
    valid: errors.length === 0 && provenance.valid,
    errors: [...errors, ...provenance.errors],
    warnings: [...warnings, ...provenance.warnings],
    format,
    wordCount: wordCountValue,
    questionCount,
    skills: unique(skills),
    register: stimulus.register || 'unclassified',
    informationStructure: stimulus.informationStructure || (['schedule', 'menu', 'invoice', 'receipt', 'form'].includes(format) ? 'nonlinear-or-mixed' : 'linear'),
    provenance: provenance.provenance
  };
}

export function analyzeAcademic(passage) {
  const blueprint = TASK_BLUEPRINTS.academic.constraints;
  const errors = [];
  const warnings = [];
  const wordCountValue = countWords(passage.text || '');
  const questionCount = Array.isArray(passage.questions) ? passage.questions.length : 0;
  if (!passage?.id || !passage?.title || !passage?.text) errors.push('Academic passage needs id, title, and text.');
  if (wordCountValue < blueprint.acceptedWordCount[0] || wordCountValue > blueprint.acceptedWordCount[1]) errors.push(`Academic passage must contain ${blueprint.acceptedWordCount[0]}–${blueprint.acceptedWordCount[1]} words; received ${wordCountValue}.`);
  if (questionCount !== blueprint.questionsPerPassage) errors.push(`Academic passage needs exactly ${blueprint.questionsPerPassage} questions; received ${questionCount}.`);
  const skills = [];
  for (const question of passage.questions || []) {
    const result = validateMcqQuestion(question, `${passage.id}/${question.id || 'question'}`);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    skills.push(normalizeSkill(question.skill));
  }
  const canonicalDomain = canonicalAcademicDomain(passage.domain || passage.title);
  if (canonicalDomain === 'unclassified') warnings.push('Academic domain could not be mapped to the six public blueprint families.');
  const missingCore = ['main-idea', 'factual-information', 'vocabulary-in-context', 'inference'].filter((skill) => !skills.includes(skill));
  if (missingCore.length) warnings.push(`Academic set does not cover all common core skills: ${missingCore.join(', ')}.`);
  const provenance = validateProvenance(passage);
  return {
    id: passage.id,
    valid: errors.length === 0 && provenance.valid,
    errors: [...errors, ...provenance.errors],
    warnings: [...warnings, ...provenance.warnings],
    wordCount: wordCountValue,
    questionCount,
    skills: unique(skills),
    domain: canonicalDomain,
    declaredDomain: passage.domain || '',
    provenance: provenance.provenance
  };
}

export function analyzeBuildSet(set) {
  const errors = [];
  const warnings = [];
  const items = set.items || [];
  if (!set.id || !set.title) errors.push('Build set needs id and title.');
  if (items.length !== TASK_BLUEPRINTS.build.constraints.itemsPerSection) errors.push(`Build set needs 10 items; received ${items.length}.`);
  const grammarFamilies = [];
  for (const item of items) {
    const choiceIds = (item.choices || []).map((choice) => choice.id);
    if (!item.id || !item.promptA) errors.push(`${set.id}: each Build item needs id and dialogue context.`);
    if (!Number.isInteger(item.slots) || item.slots < 2 || item.slots > 8) errors.push(`${item.id}: slots must be between 2 and 8.`);
    if (choiceIds.length <= item.slots) warnings.push(`${item.id}: item has no distractor.`);
    if (new Set(choiceIds).size !== choiceIds.length) errors.push(`${item.id}: duplicate choice IDs.`);
    for (const accepted of item.accepted || []) {
      if (accepted.length !== item.slots) errors.push(`${item.id}: accepted sequence length must equal slots.`);
      if (new Set(accepted).size !== accepted.length) errors.push(`${item.id}: accepted sequence reuses a tile.`);
      if (accepted.some((id) => !choiceIds.includes(id))) errors.push(`${item.id}: accepted sequence references an unknown tile.`);
    }
    grammarFamilies.push(...(item.grammar || []).map(normalizeBuildGrammar));
  }
  const provenance = validateProvenance(set);
  return {
    id: set.id,
    valid: errors.length === 0 && provenance.valid,
    errors: [...errors, ...provenance.errors],
    warnings: [...warnings, ...provenance.warnings],
    itemCount: items.length,
    grammarFamilies: unique(grammarFamilies),
    provenance: provenance.provenance
  };
}

function emailPurposes(task) {
  const text = [task.scenario, ...(task.goals || [])].join(' ');
  return unique(PURPOSE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([purpose]) => purpose));
}

export function analyzeEmail(task) {
  const errors = [];
  const warnings = [];
  const goals = task.goals || [];
  if (!task.id || !task.scenario || !task.recipient || !task.subject) errors.push('Email task needs id, scenario, recipient, and subject.');
  if (goals.length !== 3) errors.push(`Email task needs exactly three communication goals; received ${goals.length}.`);
  if (new Set(goals.map((goal) => normalizeLabel(goal))).size !== goals.length) errors.push('Email communication goals must be distinct.');
  const purposes = emailPurposes(task);
  if (!purposes.length) warnings.push('Email purpose could not be classified from the scenario and goals.');
  const provenance = validateProvenance(task);
  return {
    id: task.id,
    valid: errors.length === 0 && provenance.valid,
    errors: [...errors, ...provenance.errors],
    warnings: [...warnings, ...provenance.warnings],
    goalCount: goals.length,
    purposes,
    setting: task.setting || 'unclassified',
    hasVisualContext: Boolean(task.visual || task.contextAsset),
    provenance: provenance.provenance
  };
}

export function analyzeDiscussion(task) {
  const errors = [];
  const warnings = [];
  const students = task.students || [];
  if (!task.id || !task.course || !task.question) errors.push('Discussion task needs id, course, and question.');
  if (students.length !== 2) errors.push(`Discussion task needs exactly two student posts; received ${students.length}.`);
  if (new Set(students.map((student) => normalizeLabel(student.name))).size !== students.length) errors.push('Discussion student identities must be distinct.');
  const postFingerprints = students.map((student) => textFingerprint(student.post || '', 3));
  if (postFingerprints.length === 2 && jaccard(postFingerprints[0], postFingerprints[1]) > 0.72) warnings.push('The two student posts may be too similar.');
  const domain = canonicalAcademicDomain(task.course);
  const provenance = validateProvenance(task);
  return {
    id: task.id,
    valid: errors.length === 0 && provenance.valid,
    errors: [...errors, ...provenance.errors],
    warnings: [...warnings, ...provenance.warnings],
    studentCount: students.length,
    domain,
    course: task.course,
    provenance: provenance.provenance
  };
}

export function collectReadingContent(forms = []) {
  const dailyMap = new Map();
  const academicMap = new Map();
  const ctwSetIds = new Set();
  for (const form of forms) {
    for (const moduleName of ['router', 'lower', 'upper']) {
      const module = form[moduleName] || {};
      for (const spec of module.ctw || []) ctwSetIds.add(spec.setId);
      for (const stimulus of module.daily || []) if (!dailyMap.has(stimulus.id)) dailyMap.set(stimulus.id, stimulus);
      if (module.academic?.id && !academicMap.has(module.academic.id)) academicMap.set(module.academic.id, module.academic);
    }
  }
  return { daily: [...dailyMap.values()], academic: [...academicMap.values()], ctwSetIds: [...ctwSetIds] };
}

function duplicatePairs(items, type, threshold = 0.55) {
  const fingerprints = items.map((item) => ({ id: item.id, fingerprint: contentFingerprint(type, item) }));
  const pairs = [];
  for (let left = 0; left < fingerprints.length; left += 1) {
    for (let right = left + 1; right < fingerprints.length; right += 1) {
      const score = jaccard(fingerprints[left].fingerprint, fingerprints[right].fingerprint);
      if (score >= threshold) pairs.push({ type, left: fingerprints[left].id, right: fingerprints[right].id, score: Number(score.toFixed(3)) });
    }
  }
  return pairs.sort((a, b) => b.score - a.score);
}

function idDuplicates(groups) {
  const all = groups.flatMap(([type, items]) => items.map((item) => ({ type, id: item.id })));
  const seen = new Map();
  const duplicates = [];
  for (const item of all) {
    if (seen.has(item.id)) duplicates.push({ id: item.id, firstType: seen.get(item.id), secondType: item.type });
    else seen.set(item.id, item.type);
  }
  return duplicates;
}

function coverageSet(values, targets) {
  const covered = unique(values).filter((value) => targets.includes(value));
  return { covered, missing: targets.filter((value) => !covered.includes(value)), ratio: targets.length ? Number((covered.length / targets.length).toFixed(3)) : 1 };
}

function summarizeAnalyses(items) {
  return {
    count: items.length,
    valid: items.filter((item) => item.valid).length,
    invalid: items.filter((item) => !item.valid).length,
    errors: items.flatMap((item) => item.errors.map((message) => ({ id: item.id, message }))),
    warnings: items.flatMap((item) => item.warnings.map((message) => ({ id: item.id, message })))
  };
}

export function buildCoverageReport({
  ctestSets = [],
  readingForms = [],
  buildSets = [],
  emailTasks = [],
  discussionTasks = [],
  focusedDaily = [],
  focusedAcademic = []
} = {}) {
  const reading = collectReadingContent(readingForms);
  const dailyBank = [...reading.daily, ...focusedDaily].filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
  const academicBank = [...reading.academic, ...focusedAcademic].filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
  const ctwAnalyses = ctestSets.map(analyzeCtw);
  const dailyAnalyses = dailyBank.map(analyzeDaily);
  const academicAnalyses = academicBank.map(analyzeAcademic);
  const buildAnalyses = buildSets.map(analyzeBuildSet);
  const emailAnalyses = emailTasks.map(analyzeEmail);
  const discussionAnalyses = discussionTasks.map(analyzeDiscussion);
  const registry = validateSourceRegistry();

  const dailyFormatCoverage = coverageSet(dailyAnalyses.map((item) => item.format), TASK_BLUEPRINTS.daily.constraints.formats);
  const dailySkillCoverage = coverageSet(dailyAnalyses.flatMap((item) => item.skills), TASK_BLUEPRINTS.daily.constraints.skills);
  const academicDomainCoverage = coverageSet(academicAnalyses.map((item) => item.domain), TASK_BLUEPRINTS.academic.constraints.domains);
  const academicSkillCoverage = coverageSet(academicAnalyses.flatMap((item) => item.skills), TASK_BLUEPRINTS.academic.constraints.skills);
  const buildGrammarCoverage = coverageSet(buildAnalyses.flatMap((item) => item.grammarFamilies), TASK_BLUEPRINTS.build.constraints.grammarFamilies);
  const emailPurposeCoverage = coverageSet(emailAnalyses.flatMap((item) => item.purposes), TASK_BLUEPRINTS.email.constraints.purposes);

  const duplicateIds = idDuplicates([
    ['ctw', ctestSets], ['daily', dailyBank], ['academic', academicBank],
    ['build', buildSets], ['email', emailTasks], ['discussion', discussionTasks]
  ]);
  const nearDuplicates = [
    ...duplicatePairs(ctestSets, 'ctw'),
    ...duplicatePairs(dailyBank, 'daily'),
    ...duplicatePairs(academicBank, 'academic'),
    ...duplicatePairs(buildSets, 'build'),
    ...duplicatePairs(emailTasks, 'email'),
    ...duplicatePairs(discussionTasks, 'discussion')
  ];

  const sections = {
    ctw: summarizeAnalyses(ctwAnalyses),
    daily: summarizeAnalyses(dailyAnalyses),
    academic: summarizeAnalyses(academicAnalyses),
    build: summarizeAnalyses(buildAnalyses),
    email: summarizeAnalyses(emailAnalyses),
    discussion: summarizeAnalyses(discussionAnalyses)
  };
  const hardErrors = [
    ...Object.entries(sections).flatMap(([type, section]) => section.errors.map((error) => ({ type, ...error }))),
    ...duplicateIds.map((item) => ({ type: 'id', id: item.id, message: `Duplicate item id across ${item.firstType} and ${item.secondType}.` })),
    ...registry.errors.map((message) => ({ type: 'source-registry', id: 'registry', message }))
  ];
  const coverageRatios = [dailyFormatCoverage.ratio, dailySkillCoverage.ratio, academicDomainCoverage.ratio, academicSkillCoverage.ratio, buildGrammarCoverage.ratio, emailPurposeCoverage.ratio];
  const editorialCoverageScore = Math.round(coverageRatios.reduce((sum, value) => sum + value, 0) / coverageRatios.length * 100);

  return {
    generatedAt: new Date().toISOString(),
    sourceRegistryVersion: OFFICIAL_SOURCE_REGISTRY[0]?.verifiedAt || null,
    sourceRegistry: { valid: registry.valid, count: OFFICIAL_SOURCE_REGISTRY.length, errors: registry.errors },
    formBlueprint: FORM_BLUEPRINT,
    counts: {
      readingForms: readingForms.length,
      ctwPassages: ctestSets.length,
      dailyStimuli: dailyBank.length,
      mockDailyStimuli: reading.daily.length,
      focusedDailyStimuli: focusedDaily.length,
      dailyQuestions: dailyBank.reduce((sum, item) => sum + (item.questions?.length || 0), 0),
      academicPassages: academicBank.length,
      mockAcademicPassages: reading.academic.length,
      focusedAcademicPassages: focusedAcademic.length,
      academicQuestions: academicBank.reduce((sum, item) => sum + (item.questions?.length || 0), 0),
      buildSets: buildSets.length,
      buildItems: buildSets.reduce((sum, item) => sum + (item.items?.length || 0), 0),
      emailTasks: emailTasks.length,
      discussionTasks: discussionTasks.length
    },
    sections,
    analyses: {
      ctw: ctwAnalyses,
      daily: dailyAnalyses,
      academic: academicAnalyses,
      build: buildAnalyses,
      email: emailAnalyses,
      discussion: discussionAnalyses
    },
    coverage: {
      dailyFormats: dailyFormatCoverage,
      dailySkills: dailySkillCoverage,
      academicDomains: academicDomainCoverage,
      academicSkills: academicSkillCoverage,
      buildGrammar: buildGrammarCoverage,
      emailPurposes: emailPurposeCoverage
    },
    duplicates: { duplicateIds, nearDuplicates },
    hardErrors,
    warnings: Object.entries(sections).flatMap(([type, section]) => section.warnings.map((warning) => ({ type, ...warning }))),
    editorialCoverageScore,
    psychometricCalibration: {
      status: 'not-calibrated',
      note: 'Coverage and structural validation do not establish item difficulty, discrimination, routing validity, equating, or official score equivalence.'
    },
    sourcePolicy: SOURCE_POLICY,
    releaseGate: {
      structuralPass: hardErrors.length === 0,
      nearDuplicateReviewRequired: nearDuplicates.length > 0,
      humanReviewRequired: true,
      pilotRequired: true
    }
  };
}

export function validateCandidate(taskType, item) {
  if (taskType === 'ctw') return analyzeCtw(item);
  if (taskType === 'daily') return analyzeDaily(item);
  if (taskType === 'academic') return analyzeAcademic(item);
  if (taskType === 'build') return analyzeBuildSet(item);
  if (taskType === 'email') return analyzeEmail(item);
  if (taskType === 'discussion') return analyzeDiscussion(item);
  return { id: item?.id || null, valid: false, errors: [`Unknown task type: ${taskType}.`], warnings: [] };
}
