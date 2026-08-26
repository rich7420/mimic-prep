import test from 'node:test';
import assert from 'node:assert/strict';
import { CTEST_SETS } from '../src/data.js';
import { countWords, createCtest, gradeCtest, reconstructCtest, validateCtestPassage } from '../src/ctest.js';

function optionsFor(set) {
  return {
    targetLexicalPositions: set.targetLexicalPositions || null,
    targetPolicy: set.targetPolicy || (set.targetLexicalPositions ? 'curated-reviewed' : 'canonical-every-second-word')
  };
}

for (const set of CTEST_SETS) {
  test(`C-test set ${set.id} is structurally valid and reversible`, () => {
    const validation = validateCtestPassage(set.sourceText, optionsFor(set));
    assert.equal(validation.valid, true, validation.errors.join(' '));
    const ctest = validation.ctest;
    assert.ok(ctest.wordCount >= 70 && ctest.wordCount <= 100, `word count ${ctest.wordCount}`);
    assert.equal(countWords(ctest.sourceText), ctest.wordCount);
    assert.equal(ctest.gaps.length, 10);
    assert.equal(reconstructCtest(ctest), ctest.sourceText);
    assert.ok(ctest.firstSentence.endsWith('.') || ctest.firstSentence.endsWith('!') || ctest.firstSentence.endsWith('?'));

    const expectedPositions = set.targetLexicalPositions || Array.from({ length: 10 }, (_, index) => (index + 1) * 2);
    assert.deepEqual(ctest.targetLexicalPositions, expectedPositions);
    for (const [index, gap] of ctest.gaps.entries()) {
      assert.equal(gap.lexicalPosition, expectedPositions[index]);
      assert.equal(gap.visibleLength, Math.floor(gap.word.length / 2));
      assert.equal(gap.missingLength, Math.ceil(gap.word.length / 2));
      assert.equal(`${gap.visible}${gap.answer}`, gap.word);
      assert.ok(gap.visible.length >= 1);
      assert.ok(gap.answer.length >= 1);
    }
  });
}

test('Canonical C-test generation uses lexical positions 2,4,...,20', () => {
  const ctest = createCtest(CTEST_SETS.find((set) => !set.targetLexicalPositions).sourceText);
  assert.deepEqual(ctest.gaps.map((gap) => gap.lexicalPosition), [2,4,6,8,10,12,14,16,18,20]);
});

test('C-test scoring accepts only the exact missing letters', () => {
  const set = CTEST_SETS[0];
  const ctest = createCtest(set.sourceText, optionsFor(set));
  const correctAnswers = Object.fromEntries(ctest.gaps.map((gap) => [gap.id, gap.answer.toUpperCase()]));
  const result = gradeCtest(ctest, correctAnswers);
  assert.equal(result.score, 10);
  assert.equal(result.unanswered, 0);

  const fullWords = Object.fromEntries(ctest.gaps.map((gap) => [gap.id, gap.word]));
  assert.equal(gradeCtest(ctest, fullWords).score, 0);
});

test('Unsafe canonical target words are rejected rather than silently skipped', () => {
  const unsafe = 'This first sentence stays complete. One safe word a target follows with enough additional language to create ten alternating gaps in this deliberately invalid example passage for testing and validation purposes today.';
  assert.throws(() => createCtest(unsafe), /Unsafe C-test target word|Expected 10/);
});

test('Curated target positions must be explicit, unique, and exactly ten', () => {
  const set = CTEST_SETS[0];
  assert.throws(() => createCtest(set.sourceText, { targetLexicalPositions: [2,4,6] }), /exactly 10/);
  assert.throws(() => createCtest(set.sourceText, { targetLexicalPositions: [2,2,4,6,8,10,12,14,16,18] }), /unique/);
});


test('C-test idPrefix namespaces gap IDs without changing the source reconstruction', () => {
  const set = CTEST_SETS[0];
  const first = createCtest(set.sourceText, { ...optionsFor(set), idPrefix: 'module-a' });
  const second = createCtest(set.sourceText, { ...optionsFor(set), idPrefix: 'module-b' });
  assert.ok(first.gaps.every((gap) => gap.id.startsWith('module-a-')));
  assert.ok(second.gaps.every((gap) => gap.id.startsWith('module-b-')));
  assert.equal(new Set([...first.gaps, ...second.gaps].map((gap) => gap.id)).size, 20);
  assert.equal(reconstructCtest(first), set.sourceText);
});
