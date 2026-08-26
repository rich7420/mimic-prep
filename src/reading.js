import { createCtest, gradeCtest, countWords } from './ctest.js';

function readingCtestOptionsForSet(set, idPrefix) {
  return {
    targetLexicalPositions: set?.targetLexicalPositions || null,
    targetPolicy: set?.targetPolicy || (set?.targetLexicalPositions ? 'curated' : 'canonical-every-second-word'),
    idPrefix
  };
}

function resolveSet(ctestSets, setId) {
  const set = ctestSets.find((item) => item.id === setId);
  if (!set) throw new Error(`Reading form references unknown CTW set: ${setId}`);
  return set;
}

function cloneStimulus(stimulus) {
  return {
    id: stimulus.id,
    type: stimulus.type,
    title: stimulus.title,
    label: stimulus.label || '',
    text: stimulus.text,
    domain: stimulus.domain || '',
    scored: stimulus.scored !== false
  };
}

export function buildReadingModule(form, ctestSets, moduleName = 'router') {
  if (!form || !['router', 'lower', 'upper'].includes(moduleName)) throw new Error('Unknown Reading module.');
  const module = form[moduleName];
  if (!module) throw new Error(`Missing Reading module: ${moduleName}`);
  const pages = [];
  let itemNumber = 1;

  for (const [index, spec] of (module.ctw || []).entries()) {
    const set = resolveSet(ctestSets, spec.setId);
    const pageId = `${form.id}-${moduleName}-ctw-${index + 1}`;
    const ctest = createCtest(set.sourceText, readingCtestOptionsForSet(set, pageId));
    pages.push({
      id: pageId,
      type: 'ctw',
      taskLabel: 'Complete the Words',
      set,
      ctest,
      scored: spec.scored !== false,
      research: spec.scored === false,
      difficulty: Array.isArray(spec.difficulty) ? spec.difficulty : Array(10).fill(0),
      itemStart: itemNumber,
      itemEnd: itemNumber + ctest.gaps.length - 1,
      itemCount: ctest.gaps.length
    });
    itemNumber += ctest.gaps.length;
  }

  for (const stimulus of (module.daily || [])) {
    for (const question of stimulus.questions || []) {
      pages.push({
        id: question.id,
        type: 'daily',
        taskLabel: 'Read in Daily Life',
        stimulus: cloneStimulus(stimulus),
        question: structuredClone(question),
        scored: stimulus.scored !== false,
        research: stimulus.scored === false,
        difficulty: Number(question.difficulty) || 0,
        itemStart: itemNumber,
        itemEnd: itemNumber,
        itemCount: 1
      });
      itemNumber += 1;
    }
  }

  if (module.academic) {
    const passage = module.academic;
    for (const question of passage.questions || []) {
      pages.push({
        id: question.id,
        type: 'academic',
        taskLabel: 'Read an Academic Passage',
        stimulus: cloneStimulus({ ...passage, type: 'academic' }),
        question: structuredClone(question),
        scored: passage.scored !== false,
        research: passage.scored === false,
        difficulty: Number(question.difficulty) || 0,
        itemStart: itemNumber,
        itemEnd: itemNumber,
        itemCount: 1
      });
      itemNumber += 1;
    }
  }

  return {
    name: moduleName,
    seconds: Number(module.seconds) || 0,
    pages,
    totalItems: itemNumber - 1,
    scoredItems: pages.reduce((sum, page) => sum + (page.scored ? page.itemCount : 0), 0),
    researchItems: pages.reduce((sum, page) => sum + (page.research ? page.itemCount : 0), 0)
  };
}

export function pageAnswerCount(page, answers = {}) {
  if (page.type === 'ctw') return page.ctest.gaps.filter((gap) => String(answers[gap.id] || '').trim()).length;
  return String(answers[page.question.id] || '').trim() ? 1 : 0;
}

export function moduleAnsweredCount(module, answers = {}) {
  return module.pages.reduce((sum, page) => sum + pageAnswerCount(page, answers), 0);
}

export function moduleUnansweredCount(module, answers = {}) {
  return Math.max(0, module.totalItems - moduleAnsweredCount(module, answers));
}

export function gradeReadingModule(module, answers = {}) {
  const details = [];
  for (const page of module.pages) {
    if (page.type === 'ctw') {
      const result = gradeCtest(page.ctest, answers);
      result.details.forEach((detail, index) => {
        details.push({
          id: detail.id,
          pageId: page.id,
          type: 'ctw',
          taskLabel: page.taskLabel,
          moduleName: module.name,
          itemNumber: page.itemStart + index,
          response: detail.response,
          answer: detail.answer,
          word: detail.word,
          visible: detail.visible,
          correct: detail.correct,
          scored: page.scored,
          research: page.research,
          difficulty: Number(page.difficulty[index]) || 0,
          explanation: `The complete word is “${detail.word}.”`
        });
      });
    } else {
      const response = String(answers[page.question.id] || '');
      details.push({
        id: page.question.id,
        pageId: page.id,
        type: page.type,
        taskLabel: page.taskLabel,
        moduleName: module.name,
        itemNumber: page.itemStart,
        response,
        answer: page.question.answer,
        correct: response === page.question.answer,
        scored: page.scored,
        research: page.research,
        difficulty: Number(page.difficulty) || 0,
        skill: page.question.skill,
        stem: page.question.stem,
        explanation: page.question.explanation || ''
      });
    }
  }
  const scored = details.filter((item) => item.scored);
  return {
    score: scored.filter((item) => item.correct).length,
    maxScore: scored.length,
    allPracticeScore: details.filter((item) => item.correct).length,
    allPracticeMaxScore: details.length,
    unanswered: details.filter((item) => !String(item.response || '').trim()).length,
    details
  };
}

function logNormalPrior(theta) {
  return -0.5 * theta * theta;
}

function logBernoulli(theta, difficulty, correct) {
  const z = Math.max(-20, Math.min(20, theta - difficulty));
  const p = 1 / (1 + Math.exp(-z));
  return correct ? Math.log(Math.max(1e-12, p)) : Math.log(Math.max(1e-12, 1 - p));
}

/**
 * Transparent practice routing estimate. This is deliberately not presented as
 * ETS operational routing: the items have not been psychometrically calibrated.
 */
export function estimateRouterAbility(details = []) {
  const scored = details.filter((item) => item.scored);
  const grid = Array.from({ length: 121 }, (_, index) => -3 + index * 0.05);
  const logs = grid.map((theta) => logNormalPrior(theta) + scored.reduce(
    (sum, item) => sum + logBernoulli(theta, Number(item.difficulty) || 0, item.correct), 0
  ));
  const maxLog = Math.max(...logs);
  const weights = logs.map((value) => Math.exp(value - maxLog));
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  const theta = weights.reduce((sum, value, index) => sum + value * grid[index], 0) / total;
  const variance = weights.reduce((sum, value, index) => sum + value * (grid[index] - theta) ** 2, 0) / total;
  const rawScore = scored.filter((item) => item.correct).length;
  return {
    theta: Number(theta.toFixed(3)),
    standardError: Number(Math.sqrt(Math.max(0, variance)).toFixed(3)),
    rawScore,
    maxScore: scored.length,
    route: theta >= 0 ? 'upper' : 'lower',
    method: 'practice-eap-1pl',
    calibrated: false
  };
}

export function gradeReadingAttempt(form, ctestSets, answers = {}, route = null) {
  const routerModule = buildReadingModule(form, ctestSets, 'router');
  const routerResult = gradeReadingModule(routerModule, answers);
  const routing = estimateRouterAbility(routerResult.details);
  const chosenRoute = route === 'lower' || route === 'upper' ? route : routing.route;
  const module2 = buildReadingModule(form, ctestSets, chosenRoute);
  const module2Result = gradeReadingModule(module2, answers);
  const scoredDetails = [...routerResult.details, ...module2Result.details].filter((item) => item.scored);
  const allDetails = [...routerResult.details, ...module2Result.details];
  const byType = Object.fromEntries(['ctw', 'daily', 'academic'].map((type) => {
    const subset = scoredDetails.filter((item) => item.type === type);
    return [type, {
      score: subset.filter((item) => item.correct).length,
      maxScore: subset.length
    }];
  }));
  return {
    score: scoredDetails.filter((item) => item.correct).length,
    maxScore: scoredDetails.length,
    allPracticeScore: allDetails.filter((item) => item.correct).length,
    allPracticeMaxScore: allDetails.length,
    routerScore: routerResult.score,
    routerMaxScore: routerResult.maxScore,
    module2Score: module2Result.score,
    module2MaxScore: module2Result.maxScore,
    researchScore: allDetails.filter((item) => item.research && item.correct).length,
    researchMaxScore: allDetails.filter((item) => item.research).length,
    route: chosenRoute,
    routing,
    byType,
    details: allDetails
  };
}

function validateQuestion(question, errors, context) {
  if (!question?.id || !question?.stem || !Array.isArray(question.options) || question.options.length !== 4) errors.push(`${context}: invalid question structure.`);
  const optionIds = new Set((question?.options || []).map((option) => option.id));
  if (!optionIds.has(question?.answer)) errors.push(`${context}: answer is not one of the option IDs.`);
  if (optionIds.size !== (question?.options || []).length) errors.push(`${context}: duplicate option IDs.`);
}

export function validateReadingForm(form, ctestSets) {
  const errors = [];
  const warnings = [];
  if (!form?.id || !form?.title) errors.push('Reading form needs an id and title.');
  for (const moduleName of ['router', 'lower', 'upper']) {
    let module;
    try { module = buildReadingModule(form, ctestSets, moduleName); }
    catch (error) { errors.push(error.message); continue; }
    const expectedItems = moduleName === 'router' ? 35 : 15;
    const expectedScored = moduleName === 'router' ? 20 : 15;
    if (module.totalItems !== expectedItems) errors.push(`${moduleName} must present ${expectedItems} items; received ${module.totalItems}.`);
    if (module.scoredItems !== expectedScored) errors.push(`${moduleName} must contain ${expectedScored} scored items; received ${module.scoredItems}.`);
    if (moduleName === 'router' && module.researchItems !== 15) errors.push(`router must contain 15 research items; received ${module.researchItems}.`);
  }

  const stimuli = [
    ...(form.router?.daily || []), ...(form.lower?.daily || []),
    ...(form.upper?.daily || [])
  ];
  for (const stimulus of stimuli) {
    const words = countWords(stimulus.text);
    if (words < 15 || words > 150) errors.push(`${stimulus.id}: Daily Life text should contain 15–150 words; received ${words}.`);
    if (![2, 3].includes(stimulus.questions?.length)) errors.push(`${stimulus.id}: Daily Life text needs 2 or 3 questions.`);
    (stimulus.questions || []).forEach((question) => validateQuestion(question, errors, `${stimulus.id}/${question.id}`));
  }

  for (const passage of [form.router?.academic, form.lower?.academic, form.upper?.academic].filter(Boolean)) {
    const words = countWords(passage.text);
    if (words < 170 || words > 260) warnings.push(`${passage.id}: Academic passage is ${words} words; public guidance describes approximately 200 words.`);
    if (passage.questions?.length !== 5) errors.push(`${passage.id}: Academic passage needs 5 questions.`);
    (passage.questions || []).forEach((question) => validateQuestion(question, errors, `${passage.id}/${question.id}`));
  }
  return { valid: errors.length === 0, errors, warnings };
}
