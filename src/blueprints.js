import { sourceById } from './official-sources.js';

const official = (...ids) => ids.map((id) => {
  if (!sourceById(id)) throw new Error(`Unknown official source: ${id}`);
  return id;
});

export const TASK_BLUEPRINTS = {
  ctw: {
    id: 'ctw',
    label: 'Complete the Words',
    cefr: ['B1', 'B2', 'C1+'],
    context: ['academic'],
    scoring: { type: 'deterministic', pointsPerGap: 1 },
    constraints: {
      wordCount: [70, 100],
      intactFirstSentence: true,
      deletionRule: 'second half of every second lexical word after the first sentence',
      gaps: 10,
      coherentSelfContained: true,
      standardWrittenEnglish: true,
      avoid: ['technical-jargon', 'excessive-proper-nouns', 'chat', 'reported-dialogue', 'background-knowledge-dependence']
    },
    learningSignals: ['lexical-knowledge', 'morphology', 'syntax', 'contextual-comprehension'],
    sourceIds: official('ets-technical-manual-rr106', 'ets-blueprint-specification-2026', 'ets-practice-test-1')
  },
  daily: {
    id: 'daily',
    label: 'Read in Daily Life',
    cefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
    context: ['social-interpersonal', 'public', 'academic-navigational'],
    scoring: { type: 'multiple-choice', pointsPerQuestion: 1 },
    constraints: {
      wordCount: [15, 150],
      questionsPerStimulus: [2, 3],
      formats: ['poster', 'sign', 'notice', 'menu', 'social-post', 'webpage', 'schedule', 'email', 'messages', 'advertisement', 'news-article', 'form', 'invoice', 'receipt'],
      skills: ['nonlinear-information', 'purpose', 'informal-language', 'idiom', 'inference', 'telegraphic-language', 'skim', 'scan', 'apply-information'],
      stimulusVisibleDuringQuestions: true
    },
    sourceIds: official('ets-technical-manual-rr106', 'ets-blueprint-specification-2026', 'ets-practice-test-1', 'ets-practice-test-2')
  },
  academic: {
    id: 'academic',
    label: 'Read an Academic Passage',
    cefr: ['B1', 'B2', 'C1', 'C2'],
    context: ['academic'],
    scoring: { type: 'multiple-choice', pointsPerQuestion: 1 },
    constraints: {
      approximateWordCount: 200,
      acceptedWordCount: [170, 260],
      questionsPerPassage: 5,
      backgroundKnowledgeRequired: false,
      domains: ['history', 'art-and-music', 'business-and-economics', 'life-science', 'physical-science', 'social-science'],
      skills: ['main-idea', 'factual-information', 'vocabulary-in-context', 'inference', 'idea-relationships', 'rhetorical-purpose']
    },
    sourceIds: official('ets-technical-manual-rr106', 'ets-blueprint-specification-2026', 'ets-practice-test-1', 'ets-practice-test-2')
  },
  build: {
    id: 'build',
    label: 'Build a Sentence',
    cefr: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    context: ['social-interpersonal'],
    scoring: { type: 'deterministic', pointsPerItem: 1 },
    constraints: {
      itemsPerSection: 10,
      interaction: 'move words or phrases into blanks',
      mayIncludeDistractors: true,
      uniqueAnswerOrDeclaredAlternatives: true,
      grammarFamilies: ['indirect-question', 'auxiliary-inversion', 'relative-clause', 'noun-clause', 'conditional', 'passive', 'perfect-aspect', 'verb-complement', 'comparison', 'negation', 'reported-speech', 'clause-combination', 'temporal-clause', 'modal', 'agreement']
    },
    sourceIds: official('ets-content-structure-2026', 'ets-blueprint-specification-2026', 'ets-practice-test-1')
  },
  email: {
    id: 'email',
    label: 'Write an Email',
    cefr: ['B1', 'B2', 'C1', 'C2'],
    context: ['academic-navigational', 'social-interpersonal'],
    scoring: { type: 'holistic-rubric', range: [0, 5] },
    constraints: {
      timeSeconds: 420,
      communicationGoals: 3,
      minimumWordCount: null,
      instruction: 'Write as much as you can and in complete sentences.',
      purposes: ['request', 'give-information', 'status-inquiry', 'recommendation', 'invitation', 'problem-solution', 'explanation'],
      optionalVisualContext: true,
      socialConventions: true
    },
    sourceIds: official('ets-content-structure-2026', 'ets-technical-manual-rr106', 'ets-writing-rubrics-2026', 'ets-practice-test-1')
  },
  discussion: {
    id: 'discussion',
    label: 'Write for an Academic Discussion',
    cefr: ['B1', 'B2', 'C1', 'C2'],
    context: ['academic'],
    scoring: { type: 'holistic-rubric', range: [0, 5] },
    constraints: {
      timeSeconds: 600,
      studentPosts: 2,
      effectiveResponseGuidanceWords: 100,
      minimumWordCountAsHardRule: false,
      requirements: ['express-and-support-opinion', 'contribute-in-own-words', 'respond-to-accessible-question']
    },
    sourceIds: official('ets-content-structure-2026', 'ets-technical-manual-rr106', 'ets-writing-rubrics-2026', 'ets-practice-test-1')
  }
};

export const FORM_BLUEPRINT = {
  reading: {
    totalPresented: 50,
    scored: 35,
    router: { presented: 35, scored: 20, research: 15, seconds: [1080, 1260] },
    module2: { presented: 15, scored: 15, seconds: 540 },
    taskTypes: ['ctw', 'daily', 'academic'],
    adaptive: true,
    operationalEquivalenceClaimAllowed: false
  },
  writing: {
    totalItems: 12,
    rawPoints: 20,
    approximateSeconds: 1380,
    linear: true,
    sequence: ['build', 'email', 'discussion']
  }
};

export const SOURCE_POLICY = {
  allowedProvenance: ['original', 'public-domain', 'licensed'],
  prohibitedProvenance: ['leaked', 'recalled-live-item', 'operational', 'unknown-copy'],
  rules: [
    'Do not ingest or reconstruct live, leaked, or recalled operational questions.',
    'Do not paraphrase an official practice question closely enough to preserve its distinctive content or distractors.',
    'Use public ETS materials to derive specifications, coverage targets, and interaction patterns only.',
    'Every generated item must pass deterministic validation and human editorial review before pilot or active status.',
    'Practice scores must not be described as official or operationally equivalent without calibration evidence.'
  ]
};

export function blueprintFor(taskType) {
  return TASK_BLUEPRINTS[taskType] || null;
}
