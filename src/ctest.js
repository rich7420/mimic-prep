const WORD_RE = /[A-Za-z]+(?:[’'][A-Za-z]+)?/g;

export function countWords(text) {
  return (String(text).match(WORD_RE) || []).length;
}

export function splitFirstSentence(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^.*?[.!?](?=\s|$)/);
  if (!match) throw new Error('C-test passage needs a complete first sentence ending in punctuation.');
  return { firstSentence: match[0], remainder: normalized.slice(match[0].length) };
}

function defaultTargets(requiredGaps) {
  return Array.from({ length: requiredGaps }, (_, index) => (index + 1) * 2);
}

function validateTargets(targets, requiredGaps) {
  if (!Array.isArray(targets) || targets.length !== requiredGaps) {
    throw new Error(`C-test needs exactly ${requiredGaps} target lexical positions.`);
  }
  if (targets.some((value) => !Number.isInteger(value) || value < 1)) {
    throw new Error('C-test target lexical positions must be positive integers.');
  }
  if (new Set(targets).size !== targets.length) throw new Error('C-test target lexical positions must be unique.');
  return [...targets].sort((a, b) => a - b);
}

function splitWord(word) {
  if (!/^[A-Za-z]{2,}$/.test(word)) {
    throw new Error(`Unsafe C-test target word “${word}”. Regenerate or explicitly curate the source text; do not silently skip a target.`);
  }
  const visibleLength = Math.floor(word.length / 2);
  return { visible: word.slice(0, visibleLength), answer: word.slice(visibleLength) };
}

export function createCtest(sourceText, {
  requiredGaps = 10,
  targetLexicalPositions = null,
  targetPolicy = targetLexicalPositions ? 'curated' : 'canonical-every-second-word',
  idPrefix = 'gap'
} = {}) {
  const normalized = String(sourceText || '').replace(/\s+/g, ' ').trim();
  const { firstSentence, remainder } = splitFirstSentence(normalized);
  const targets = validateTargets(targetLexicalPositions || defaultTargets(requiredGaps), requiredGaps);
  const targetSet = new Set(targets);
  const segments = [{ type: 'text', text: firstSentence }];
  const gaps = [];
  let lexicalPosition = 0;
  let cursor = 0;
  WORD_RE.lastIndex = 0;
  for (const match of remainder.matchAll(WORD_RE)) {
    const word = match[0];
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ type: 'text', text: remainder.slice(cursor, index) });
    lexicalPosition += 1;
    if (targetSet.has(lexicalPosition)) {
      const { visible, answer } = splitWord(word);
      const gap = {
        id: `${String(idPrefix || 'gap').replace(/[^A-Za-z0-9_-]/g, '-')}-${gaps.length + 1}`,
        number: gaps.length + 1,
        lexicalPosition,
        word,
        visible,
        answer,
        visibleLength: visible.length,
        missingLength: answer.length
      };
      gaps.push(gap);
      segments.push({ type: 'gap', ...gap });
    } else {
      segments.push({ type: 'text', text: word });
    }
    cursor = index + word.length;
  }
  if (cursor < remainder.length) segments.push({ type: 'text', text: remainder.slice(cursor) });
  if (gaps.length !== requiredGaps) throw new Error(`Expected ${requiredGaps} truncated words but generated ${gaps.length}.`);
  return {
    sourceText: normalized,
    firstSentence,
    remainder,
    segments,
    gaps,
    wordCount: countWords(normalized),
    targetPolicy,
    targetLexicalPositions: targets
  };
}

export function reconstructCtest(ctest) {
  return ctest.segments.map((segment) => segment.type === 'gap' ? `${segment.visible}${segment.answer}` : segment.text).join('').replace(/\s+/g, ' ').trim();
}

export function normalizeGapAnswer(value) {
  return String(value ?? '').trim().replace(/[’]/g, "'").toLowerCase();
}

export function gradeCtest(ctest, answers = {}) {
  const details = ctest.gaps.map((gap) => {
    const response = String(answers[gap.id] ?? '').trim();
    const correct = normalizeGapAnswer(response) === normalizeGapAnswer(gap.answer);
    return { ...gap, response, correct };
  });
  return { score: details.filter((item) => item.correct).length, maxScore: details.length, details, unanswered: details.filter((item) => !item.response).length };
}

export function validateCtestPassage(sourceText, options = {}) {
  const warnings = [];
  const errors = [];
  let ctest = null;
  try {
    ctest = createCtest(sourceText, options);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { valid: false, errors, warnings, ctest };
  }
  if (ctest.wordCount < 70 || ctest.wordCount > 100) errors.push(`Complete the Words passage must contain about 70–100 words; received ${ctest.wordCount}.`);
  const properNouns = (ctest.sourceText.match(/(?<![.!?]\s)(?<!^)[A-Z][a-z]+/g) || []).length;
  if (properNouns > 5) warnings.push('The passage may contain too many proper nouns for an accessible C-test.');
  if (reconstructCtest(ctest) !== ctest.sourceText) errors.push('The generated C-test does not reconstruct to the original passage exactly.');
  return { valid: errors.length === 0, errors, warnings, ctest };
}
