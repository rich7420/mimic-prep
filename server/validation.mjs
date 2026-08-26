import { validateCtestPassage } from '../src/ctest.js';
import { analyzeAcademic, analyzeDaily, validateProvenance } from '../src/content-intelligence.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value, label, { min = 1, max = 4000 } = {}) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string.`);
  const normalized = value.trim();
  if (normalized.length < min) throw new Error(`${label} is too short.`);
  if (normalized.length > max) throw new Error(`${label} is too long.`);
  return normalized;
}

function uniqueStrings(values, { caseInsensitive = false } = {}) {
  const normalized = values.map((value) => caseInsensitive ? String(value).trim().toLowerCase() : String(value));
  return new Set(normalized).size === normalized.length;
}

function validateStringList(values, label, { length = null, minItems = 1, minLength = 1, maxLength = 100, caseInsensitiveUnique = true } = {}) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array.`);
  if (length != null && values.length !== length) throw new Error(`${label} must contain exactly ${length} entries.`);
  if (values.length < minItems) throw new Error(`${label} must contain at least ${minItems} entry.`);
  const normalized = values.map((value, index) => text(value, `${label}[${index}]`, { min: minLength, max: maxLength }));
  if (!uniqueStrings(normalized, { caseInsensitive: caseInsensitiveUnique })) throw new Error(`${label} entries must be distinct.`);
  return normalized;
}

function validateBuild(payload) {
  if (!Array.isArray(payload.items) || payload.items.length !== 10) {
    throw new Error('Build set must contain exactly 10 items.');
  }
  const itemIds = payload.items.map((item) => text(item?.id, 'Build item ID', { max: 120 }));
  if (!uniqueStrings(itemIds, { caseInsensitive: true })) throw new Error('Build item IDs must be unique.');

  payload.items.forEach((item, index) => {
    const label = `Build item ${index + 1}`;
    if (!isObject(item)) throw new Error(`${label} must be an object.`);
    text(item.promptA, `${label} promptA`, { min: 3, max: 500 });
    if (item.prefix != null && typeof item.prefix !== 'string') throw new Error(`${label} prefix must be a string.`);
    if (item.suffix != null && typeof item.suffix !== 'string') throw new Error(`${label} suffix must be a string.`);
    if (!String(item.prefix || '').trim() && !String(item.suffix || '').trim()) {
      throw new Error(`${label} needs a fixed prefix or suffix to anchor the response.`);
    }
    if (!Number.isInteger(item.slots) || item.slots < 2 || item.slots > 8) {
      throw new Error(`${label} must have 2–8 slots.`);
    }
    if (!Array.isArray(item.choices) || item.choices.length <= item.slots || item.choices.length > 14) {
      throw new Error(`${label} must include at least one distractor and no more than 14 choices.`);
    }

    const choiceIds = [];
    const choiceTexts = [];
    item.choices.forEach((choice, choiceIndex) => {
      if (!isObject(choice)) throw new Error(`${label} choice ${choiceIndex + 1} must be an object.`);
      choiceIds.push(text(choice.id, `${label} choice ${choiceIndex + 1} ID`, { max: 80 }));
      choiceTexts.push(text(choice.text, `${label} choice ${choiceIndex + 1} text`, { max: 120 }));
    });
    if (!uniqueStrings(choiceIds, { caseInsensitive: true })) throw new Error(`${label} choice IDs must be unique.`);
    if (!uniqueStrings(choiceTexts, { caseInsensitive: true })) throw new Error(`${label} choice texts must be unique.`);

    if (!Array.isArray(item.accepted) || item.accepted.length < 1 || item.accepted.length > 5) {
      throw new Error(`${label} needs 1–5 accepted sequences.`);
    }
    const sequenceKeys = [];
    for (const sequence of item.accepted) {
      if (!Array.isArray(sequence) || sequence.length !== item.slots) {
        throw new Error(`${label} has an accepted sequence with the wrong slot count.`);
      }
      if (sequence.some((id) => !choiceIds.includes(String(id)))) {
        throw new Error(`${label} accepted sequence references an unknown choice.`);
      }
      if (!uniqueStrings(sequence, { caseInsensitive: false })) {
        throw new Error(`${label} accepted sequence reuses the same tile.`);
      }
      sequenceKeys.push(sequence.join('\u0000'));
    }
    if (!uniqueStrings(sequenceKeys)) throw new Error(`${label} accepted sequences must be distinct.`);

    text(item.explanation, `${label} explanation`, { min: 12, max: 1200 });
    validateStringList(item.grammar, `${label} grammar`, { minLength: 2, maxLength: 80 });
  });
  return payload;
}

function validateEmail(payload) {
  text(payload.scenario, 'Email scenario', { min: 40, max: 1400 });
  text(payload.recipient, 'Email recipient', { min: 2, max: 120 });
  text(payload.subject, 'Email subject', { min: 2, max: 160 });
  validateStringList(payload.goals, 'Email goals', { length: 3, minLength: 8, maxLength: 220 });

  const groups = payload.rubricHints?.purposeGroups;
  if (!Array.isArray(groups) || groups.length !== 3) throw new Error('Email needs exactly three purposeGroups.');
  groups.forEach((group, index) => {
    validateStringList(group, `Email purposeGroups[${index}]`, { minLength: 2, maxLength: 80 });
  });
  return payload;
}

function validateDiscussion(payload) {
  text(payload.course, 'Discussion course', { min: 2, max: 120 });
  text(payload.professor, 'Discussion professor', { min: 2, max: 120 });
  text(payload.question, 'Discussion question', { min: 60, max: 1800 });
  if (!Array.isArray(payload.students) || payload.students.length !== 2) {
    throw new Error('Discussion needs exactly two student posts.');
  }
  const names = [];
  const posts = [];
  payload.students.forEach((student, index) => {
    if (!isObject(student)) throw new Error(`Discussion student ${index + 1} must be an object.`);
    names.push(text(student.name, `Discussion student ${index + 1} name`, { min: 2, max: 80 }));
    posts.push(text(student.post, `Discussion student ${index + 1} post`, { min: 30, max: 900 }));
  });
  if (!uniqueStrings(names, { caseInsensitive: true })) throw new Error('Discussion student names must be distinct.');
  if (!uniqueStrings(posts, { caseInsensitive: true })) throw new Error('Discussion student posts must be distinct.');
  if (Array.isArray(payload.keywords)) {
    validateStringList(payload.keywords, 'Discussion keywords', { minLength: 2, maxLength: 80 });
  }
  return payload;
}

function withOriginalProvenance(payload) {
  if (payload.provenance) return payload;
  return {
    ...payload,
    provenance: {
      kind: 'original',
      generated: true,
      operationalItem: false,
      leaked: false,
      recalled: false
    }
  };
}

function enforceProvenance(payload) {
  const normalized = withOriginalProvenance(payload);
  const result = validateProvenance(normalized);
  if (!result.valid) throw new Error(`Invalid provenance: ${result.errors.join(' ')}`);
  return normalized;
}

function validateDaily(payload) {
  const normalized = enforceProvenance(payload);
  const result = analyzeDaily(normalized);
  if (!result.valid) throw new Error(`Invalid Daily Life item: ${result.errors.join(' ')}`);
  return { ...normalized, editorialAnalysis: result };
}

function validateAcademic(payload) {
  const normalized = enforceProvenance(payload);
  const result = analyzeAcademic(normalized);
  if (!result.valid) throw new Error(`Invalid Academic Passage item: ${result.errors.join(' ')}`);
  return { ...normalized, editorialAnalysis: result };
}

export function validateGenerated(taskType, payload, { allowCuratedCtw = false } = {}) {
  if (!isObject(payload)) throw new Error('Generated payload is not an object.');
  if (taskType === 'ctw') {
    const normalized = enforceProvenance(payload);
    const options = allowCuratedCtw && normalized.targetLexicalPositions
      ? { targetLexicalPositions: normalized.targetLexicalPositions, targetPolicy: normalized.targetPolicy }
      : {};
    const validation = validateCtestPassage(normalized.sourceText || '', options);
    if (!validation.valid) throw new Error(`Invalid C-test: ${validation.errors.join(' ')}`);
    return { ...normalized, ctest: validation.ctest, warnings: validation.warnings };
  }
  if (taskType === 'daily') return validateDaily(payload);
  if (taskType === 'academic') return validateAcademic(payload);
  if (taskType === 'build') return validateBuild(enforceProvenance(payload));
  if (taskType === 'email') return validateEmail(enforceProvenance(payload));
  if (taskType === 'discussion') return validateDiscussion(enforceProvenance(payload));
  throw new Error(`Unsupported task type: ${taskType}`);
}
