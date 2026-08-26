/** Original Build a Sentence set that closes grammar-family coverage gaps. */
export const SUPPLEMENTAL_BUILD_SET = {
  id: 'build-coverage-04',
  title: 'Expanded Grammar Coverage',
  level: 'B1–C1',
  provenance: {
    kind: 'original',
    authoringVersion: '6.0.0',
    operationalItem: false,
    leaked: false,
    recalled: false
  },
  items: [
    {
      id: 'bs-31',
      promptA: 'I heard the lecture ended earlier than planned.',
      prefix: '',
      suffix: '?',
      slots: 5,
      choices: [
        { id: 'why', text: 'Why' }, { id: 'did', text: 'did' }, { id: 'lecture', text: 'the lecture' },
        { id: 'end', text: 'end' }, { id: 'early', text: 'early' }, { id: 'ended', text: 'ended' }, { id: 'does', text: 'does' }
      ],
      accepted: [['why', 'did', 'lecture', 'end', 'early']],
      grammar: ['auxiliary inversion', 'question word order'],
      explanation: 'A past-tense information question uses “did” followed by the base form “end.”'
    },
    {
      id: 'bs-32',
      promptA: 'What do you like about the new work schedule?',
      prefix: '',
      suffix: '.',
      choices: [
        { id: 'what', text: 'What' }, { id: 'appreciate', text: 'I appreciate' }, { id: 'most', text: 'most' },
        { id: 'is', text: 'is' }, { id: 'flexibility', text: 'its flexibility' }, { id: 'offers', text: 'offers' }, { id: 'that', text: 'that' }
      ],
      accepted: [['what', 'appreciate', 'most', 'is', 'flexibility']],
      slots: 5,
      grammar: ['noun clause', 'subject–verb agreement'],
      explanation: 'The noun clause “What I appreciate most” functions as the singular subject of “is.”'
    },
    {
      id: 'bs-33',
      promptA: 'Can I bring lunch into the laboratory?',
      prefix: 'The rules say that',
      suffix: '.',
      slots: 6,
      choices: [
        { id: 'lab', text: 'the laboratory' }, { id: 'does', text: 'does' }, { id: 'not', text: 'not' },
        { id: 'allow', text: 'allow' }, { id: 'food', text: 'food' }, { id: 'inside', text: 'inside' }, { id: 'allows', text: 'allows' }
      ],
      accepted: [['lab', 'does', 'not', 'allow', 'food', 'inside']],
      grammar: ['negation', 'auxiliary support'],
      explanation: 'Present-tense negation with a singular subject uses “does not” plus the base form “allow.”'
    },
    {
      id: 'bs-34',
      promptA: 'Why was the workshop canceled?',
      prefix: 'It was canceled',
      suffix: '.',
      choices: [
        { id: 'because', text: 'because' }, { id: 'instructor', text: 'the instructor' }, { id: 'became', text: 'became' },
        { id: 'ill', text: 'ill' }, { id: 'morning', text: 'that morning' }, { id: 'although', text: 'although' }, { id: 'becomes', text: 'becomes' }
      ],
      accepted: [['because', 'instructor', 'became', 'ill', 'morning']],
      slots: 5,
      grammar: ['clause combination', 'cause clause'],
      explanation: '“Because” introduces the reason for the cancellation and is followed by a complete clause.'
    },
    {
      id: 'bs-35',
      promptA: 'How will I know that you reached the station?',
      prefix: 'Please call me',
      suffix: '.',
      choices: [
        { id: 'when', text: 'when' }, { id: 'you', text: 'you' }, { id: 'arrive', text: 'arrive' },
        { id: 'at', text: 'at' }, { id: 'station', text: 'the station' }, { id: 'will-arrive', text: 'will arrive' }, { id: 'where', text: 'where' }
      ],
      accepted: [['when', 'you', 'arrive', 'at', 'station']],
      slots: 5,
      grammar: ['temporal clause', 'present for future time'],
      explanation: 'A future-time clause after “when” normally uses the simple present “arrive,” not “will arrive.”'
    },
    {
      id: 'bs-36',
      promptA: 'The application page is not loading.',
      prefix: '',
      suffix: '?',
      choices: [
        { id: 'have', text: 'Have' }, { id: 'you', text: 'you' }, { id: 'tried', text: 'tried' },
        { id: 'using', text: 'using' }, { id: 'browser', text: 'a different browser' }, { id: 'did', text: 'Did' }, { id: 'try', text: 'try' }
      ],
      accepted: [['have', 'you', 'tried', 'using', 'browser']],
      slots: 5,
      grammar: ['auxiliary inversion', 'perfect aspect', 'verb complement'],
      explanation: 'A present-perfect question places “Have” before the subject, and “try” is followed by a gerund here.'
    },
    {
      id: 'bs-37',
      promptA: 'Did the committee make a decision?',
      prefix: 'No one knows',
      suffix: '.',
      choices: [
        { id: 'whether', text: 'whether' }, { id: 'committee', text: 'the committee' }, { id: 'has', text: 'has' },
        { id: 'reached', text: 'reached' }, { id: 'decision', text: 'a decision' }, { id: 'did', text: 'did' }, { id: 'reach', text: 'reach' }
      ],
      accepted: [['whether', 'committee', 'has', 'reached', 'decision']],
      slots: 5,
      grammar: ['noun clause', 'indirect question', 'perfect aspect'],
      explanation: 'Inside a noun clause introduced by “whether,” normal statement word order is used.'
    },
    {
      id: 'bs-38',
      promptA: 'Does the museum charge students for admission?',
      prefix: 'Students',
      suffix: '.',
      slots: 6,
      choices: [
        { id: 'do', text: 'do' }, { id: 'not', text: 'not' }, { id: 'have', text: 'have' },
        { id: 'to', text: 'to' }, { id: 'pay', text: 'pay' }, { id: 'admission', text: 'admission' }, { id: 'does', text: 'does' }
      ],
      accepted: [['do', 'not', 'have', 'to', 'pay', 'admission']],
      grammar: ['negation', 'modal meaning'],
      explanation: '“Do not have to” expresses the absence of an obligation or charge.'
    },
    {
      id: 'bs-39',
      promptA: 'Should I submit the form before I speak to the advisor?',
      prefix: 'Wait',
      suffix: '.',
      choices: [
        { id: 'until', text: 'until' }, { id: 'you', text: 'you' }, { id: 'have', text: 'have' },
        { id: 'spoken', text: 'spoken' }, { id: 'to', text: 'to' }, { id: 'advisor', text: 'the advisor' }, { id: 'will-have', text: 'will have' }, { id: 'speak', text: 'speak' }
      ],
      accepted: [['until', 'you', 'have', 'spoken', 'to', 'advisor']],
      slots: 6,
      grammar: ['temporal clause', 'perfect aspect'],
      explanation: 'The “until” clause uses present perfect to mark completion before the next action.'
    },
    {
      id: 'bs-40',
      promptA: 'The café was crowded, but we found a quiet table outside.',
      prefix: '',
      suffix: '.',
      slots: 7,
      choices: [
        { id: 'although', text: 'Although' }, { id: 'cafe', text: 'the café' }, { id: 'was', text: 'was' },
        { id: 'crowded', text: 'crowded' }, { id: 'we', text: 'we' }, { id: 'found', text: 'found' }, { id: 'table', text: 'a quiet table outside' }, { id: 'because', text: 'because' }
      ],
      accepted: [['although', 'cafe', 'was', 'crowded', 'we', 'found', 'table']],
      grammar: ['clause combination', 'concession clause'],
      explanation: '“Although” combines the contrasting ideas in one complex sentence.'
    }
  ]
};
