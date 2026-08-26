import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_SETS, CTEST_SETS, DISCUSSION_TASKS, EMAIL_TASKS, VOCABULARY_BANK } from '../src/data.js';
import { estimateDiscussionLocally, estimateEmailLocally, gradeBuild, stimulusOverlap } from '../src/scoring.js';

test('Local item bank has enough breadth for the v6 mock and focused-practice seed bank', () => {
  assert.ok(CTEST_SETS.length >= 12);
  assert.ok(BUILD_SETS.length >= 4);
  assert.ok(BUILD_SETS.reduce((sum, set) => sum + set.items.length, 0) >= 40);
  assert.ok(EMAIL_TASKS.length >= 8);
  assert.ok(DISCUSSION_TASKS.length >= 8);
  assert.ok(VOCABULARY_BANK.length >= 80);
  assert.equal(new Set(VOCABULARY_BANK.map((item) => item.word.toLowerCase())).size, VOCABULARY_BANK.length, 'vocabulary entries should be unique');
});

test('Every Build set has ten deterministic, distractor-bearing items', () => {
  for (const set of BUILD_SETS) {
    assert.equal(set.items.length, 10);
    for (const item of set.items) {
      const ids = new Set(item.choices.map((choice) => choice.id));
      assert.ok(item.slots >= 2);
      assert.ok(item.choices.length > item.slots, `${item.id} should include at least one distractor`);
      assert.ok(item.accepted.length >= 1);
      for (const accepted of item.accepted) {
        assert.equal(accepted.length, item.slots);
        assert.ok(accepted.every((id) => ids.has(id)));
      }
    }
    const answers = Object.fromEntries(set.items.map((item) => [item.id, item.accepted[0]]));
    const result = gradeBuild(set.items, answers);
    assert.equal(result.score, 10);
    assert.equal(result.maxScore, 10);
  }
});

test('Every Email task has exactly three communication goals and diagnostic groups', () => {
  for (const task of EMAIL_TASKS) {
    assert.equal(task.goals.length, 3);
    assert.equal(task.rubricHints.purposeGroups.length, 3);
    assert.ok(task.recipient && task.subject && task.scenario && task.visual);
  }
});

test('Every Discussion task has one accessible question and exactly two distinct student posts', () => {
  for (const task of DISCUSSION_TASKS) {
    assert.ok(task.question.length > 80);
    assert.equal(task.students.length, 2);
    assert.notEqual(task.students[0].post, task.students[1].post);
    assert.ok((task.keywords || []).length >= 4);
  }
});

test('Offline writing analysis does not fabricate a holistic 0–5 score for nonblank work', () => {
  const emailTask = EMAIL_TASKS[0];
  const discussionTask = DISCUSSION_TASKS[0];
  const email = estimateEmailLocally(emailTask, 'Dear Coordinator, I am writing about our meeting. The room reservation was canceled. Could you please restore it or suggest another available room? Thank you for your help. Best, Alex');
  const discussion = estimateDiscussionLocally(discussionTask, 'I think universities should reduce private car access because shared space can be used for safer walking and public transit. For example, a campus can convert one parking area into a shaded pedestrian route. However, commuters still need reliable alternatives, so restrictions should be introduced gradually and paired with transit support.');
  assert.equal(email.score, null);
  assert.equal(email.source, 'local_analysis');
  assert.equal(discussion.score, null);
  assert.equal(discussion.source, 'local_analysis');
});

test('Blank writing is the only local case assigned the explicit zero rule', () => {
  assert.equal(estimateEmailLocally(EMAIL_TASKS[0], '').score, 0);
  assert.equal(estimateDiscussionLocally(DISCUSSION_TASKS[0], '   ').score, 0);
});

test('Stimulus overlap detects repeated six-word spans without using them as a score formula', () => {
  const copied = 'Digital access expands education because people who live far away or cannot travel can still study the collection.';
  const result = stimulusOverlap(copied, copied);
  assert.ok(result.count > 0);
});
