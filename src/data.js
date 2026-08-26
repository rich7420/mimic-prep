import { SUPPLEMENTAL_BUILD_SET } from './supplemental-writing-data.js';

export const CTEST_SETS = [
  {
    id: 'ctw-community-gardens',
    title: 'Community Gardens',
    level: 'B1–B2',
    band: 'core',
    domain: 'Daily life / community',
    sourceText: 'Many neighborhoods are creating small gardens in unused public spaces. These gardens can provide fresh produce while giving local residents somewhere to meet and cooperate. Volunteers often share tools, divide routine tasks, and exchange practical advice about local growing conditions. The projects may also reduce food waste because participants can compost leaves and kitchen scraps. Although a garden requires regular attention, its benefits can extend beyond the harvest. People who work together frequently develop stronger social ties and a greater sense of responsibility for their surroundings.',
    vocabulary: [
      { word: 'residents', cefr: 'B1', pos: 'noun', meaning: 'people who live in a place', family: 'reside · resident · residential', collocation: 'local residents' },
      { word: 'cooperate', cefr: 'B1', pos: 'verb', meaning: 'work together toward a result', family: 'cooperate · cooperation · cooperative', collocation: 'cooperate with others' },
      { word: 'practical', cefr: 'B1–B2', pos: 'adjective', meaning: 'useful in real situations', family: 'practice · practical · practically', collocation: 'practical advice' },
      { word: 'maintain', cefr: 'B2', pos: 'verb', meaning: 'keep something in good condition', family: 'maintain · maintenance', collocation: 'maintain over time' }
    ]
  },
  {
    id: 'ctw-sleep-memory',
    title: 'Sleep and Memory',
    level: 'B2',
    band: 'core',
    domain: 'Life science',
    sourceText: 'Sleep plays an important role in how people learn and remember information. During sleep, the brain continues to organize recent experiences and strengthen useful connections. This process does not simply preserve every detail; instead, it appears to select patterns that may be valuable later. Researchers have found that people often perform better on a practiced task after a full night of rest. However, sleep cannot replace focused study. It works best when learners first engage actively with material and then allow enough time for memory to stabilize.',
    vocabulary: [
      { word: 'organize', cefr: 'B1', pos: 'verb', meaning: 'arrange into a clear structure', family: 'organize · organization · organized', collocation: 'organize information' },
      { word: 'preserve', cefr: 'B2', pos: 'verb', meaning: 'keep something from being lost or changed', family: 'preserve · preservation', collocation: 'preserve a detail' },
      { word: 'pattern', cefr: 'B1–B2', pos: 'noun', meaning: 'a repeated or regular arrangement', family: 'pattern · patterned', collocation: 'select patterns' },
      { word: 'stabilize', cefr: 'B2–C1', pos: 'verb', meaning: 'become steady or secure', family: 'stable · stability · stabilize', collocation: 'memory stabilizes' }
    ]
  },
  {
    id: 'ctw-repair-cafes',
    title: 'Repair Cafés',
    level: 'B1–B2',
    band: 'core',
    domain: 'Daily life / sustainability',
    sourceText: 'A repair café is a community event where people fix damaged household objects together. Visitors bring lamps, clothing, small appliances, or bicycles, and volunteers offer tools and guidance. The goal is not only to save money but also to reduce waste and share practical knowledge. Because each object has a different problem, participants must observe carefully and test possible solutions. Some repairs cannot be completed during one event, yet even an unsuccessful attempt can teach useful skills. Over time, these gatherings may change how people think about ownership, maintenance, and disposal.',
    vocabulary: [
      { word: 'appliance', cefr: 'B1–B2', pos: 'noun', meaning: 'a machine used in the home', family: 'appliance', collocation: 'small appliances' },
      { word: 'guidance', cefr: 'B2', pos: 'noun', meaning: 'advice or direction', family: 'guide · guidance', collocation: 'offer guidance' },
      { word: 'maintenance', cefr: 'B2', pos: 'noun', meaning: 'work that keeps something usable', family: 'maintain · maintenance', collocation: 'regular maintenance' },
      { word: 'disposal', cefr: 'B2–C1', pos: 'noun', meaning: 'the act of getting rid of something', family: 'dispose · disposal', collocation: 'waste disposal' }
    ]
  },
  {
    id: 'ctw-maps-arguments',
    title: 'Maps as Arguments',
    level: 'B2–C1',
    band: 'advanced',
    domain: 'Social science / history',
    sourceText: 'Public maps do more than show where streets, rivers, and buildings are located. Every map reflects choices about what to include, emphasize, simplify, or omit entirely. Transit maps, for example, may distort geographic distance so that passengers can understand routes more quickly. Historical maps can also reveal how earlier societies interpreted political borders or valuable resources. For this reason, researchers examine maps as arguments rather than perfectly neutral images. Reading them critically involves asking who created the map, which audience it served, and what decisions shaped its design.',
    vocabulary: [
      { word: 'emphasize', cefr: 'B2', pos: 'verb', meaning: 'give particular importance to something', family: 'emphasis · emphasize · emphatic', collocation: 'emphasize a feature' },
      { word: 'distort', cefr: 'C1', pos: 'verb', meaning: 'change the appearance or meaning inaccurately', family: 'distort · distortion', collocation: 'distort distance' },
      { word: 'interpret', cefr: 'B2', pos: 'verb', meaning: 'explain or understand the meaning of something', family: 'interpret · interpretation', collocation: 'interpret evidence' },
      { word: 'neutral', cefr: 'B2', pos: 'adjective', meaning: 'not supporting a particular side', family: 'neutral · neutrality', collocation: 'neutral image' }
    ]
  },
  {
    id: 'ctw-pollination-networks', title: 'Pollination Networks', level: 'B2', band: 'core', domain: 'Life science', sourceGenre: 'Academic explanation',
    sourceText: 'Many flowering plants depend on animals to carry pollen between blossoms. These partnerships connect plants with bees, butterflies, birds, and other visitors across an ecosystem. A single pollinator may visit several plant species, while one plant can attract many different animals. Researchers describe these relationships as networks because changes in one population can affect several others. When diverse pollinators remain available, plants have more opportunities to reproduce even if one visitor becomes scarce. Protecting varied habitats can therefore support both individual species and the broader ecological connections among them.',
    vocabulary: [{word:'pollinator',cefr:'B2',pos:'noun',meaning:'an animal that carries pollen between flowers',family:'pollinate · pollination · pollinator',collocation:'pollinator species'},{word:'diverse',cefr:'B2',pos:'adjective',meaning:'including many different types',family:'diverse · diversity',collocation:'diverse habitats'}]
  },
  {
    id: 'ctw-thermal-mass', title: 'Thermal Mass in Buildings', level: 'B2–C1', band: 'advanced', domain: 'Environmental design', sourceGenre: 'Academic explanation',
    sourceText: 'Some building materials can absorb heat and release it slowly over time. Thick concrete, brick, and stone often moderate indoor temperature because they store energy when surrounding air becomes warm. Later, as the air cools, the materials release part of that stored heat. Designers call this property thermal mass. Used carefully, it can reduce rapid temperature changes and lower the need for mechanical heating or cooling. Its effectiveness still depends on climate, insulation, window placement, and daily patterns of sunlight, so designers must evaluate the whole building rather than one material alone.',
    vocabulary: [{word:'moderate',cefr:'B2',pos:'verb',meaning:'make less extreme',family:'moderate · moderation',collocation:'moderate temperature'},{word:'insulation',cefr:'C1',pos:'noun',meaning:'material that slows heat transfer',family:'insulate · insulation',collocation:'building insulation'}]
  },
  {
    id: 'ctw-collective-memory', title: 'Collective Memory', level: 'B2–C1', band: 'advanced', domain: 'Social science', sourceGenre: 'Academic explanation',
    sourceText: 'Communities remember the past through more than individual personal memories. Public ceremonies, monuments, school lessons, family stories, and museums all help shape shared interpretations of earlier events. These interpretations can change as new generations ask different questions or previously ignored evidence becomes visible. Scholars sometimes call this process collective memory. The term does not imply that everyone remembers history in exactly the same way. Instead, it draws attention to the social practices that make certain stories familiar, preserve particular symbols, and influence which parts of the past remain important in public life.',
    vocabulary: [{word:'interpretation',cefr:'B2',pos:'noun',meaning:'an explanation of meaning',family:'interpret · interpretation',collocation:'shared interpretation'},{word:'collective',cefr:'B2',pos:'adjective',meaning:'shared by a group',family:'collect · collective',collocation:'collective memory'}]
  },
  {
    id: 'ctw-soil-microbes', title: 'Soil Microbes', level: 'B2', band: 'core', domain: 'Life science', sourceGenre: 'Academic explanation',
    sourceText: 'Healthy soil contains enormous communities of organisms too small to see without magnification. Bacteria and fungi break down dead material, release nutrients, and interact with plant roots in complex ways. Some microbes help plants obtain minerals that would otherwise be difficult to absorb. Others compete with harmful organisms or influence how much water the soil can retain. Because these interactions occur below ground, their importance was once easy to overlook. Modern research increasingly treats soil as a living system whose biological diversity can affect crop growth, forest health, and the movement of carbon through ecosystems.',
    vocabulary: [{word:'microbe',cefr:'B2',pos:'noun',meaning:'a microscopic organism',family:'microbe · microbial',collocation:'soil microbes'},{word:'retain',cefr:'B2',pos:'verb',meaning:'continue to hold',family:'retain · retention',collocation:'retain water'}]
  },
  {
    id: 'ctw-urban-heat', title: 'Urban Heat Islands', level: 'B1–B2', band: 'core', domain: 'Environmental science', sourceGenre: 'Academic explanation',
    sourceText: 'Cities are often warmer than nearby rural areas, especially after sunset. Roads and buildings absorb solar energy during the day and release heat slowly at night, while limited vegetation provides less cooling through shade and evaporation. This pattern is known as the urban heat island effect. Its strength varies among neighborhoods because surfaces, tree cover, building density, and airflow are not distributed evenly. Planners can reduce local heat by adding vegetation, using reflective materials, and protecting shaded public spaces. Such measures may also improve comfort during increasingly frequent periods of extreme summer weather.',
    vocabulary: [{word:'evaporation',cefr:'B2',pos:'noun',meaning:'the process by which liquid becomes vapor',family:'evaporate · evaporation',collocation:'water evaporation'},{word:'reflective',cefr:'B2',pos:'adjective',meaning:'able to send light or heat back',family:'reflect · reflection · reflective',collocation:'reflective material'}]
  },
  {
    id: 'ctw-archaeological-pollen', title: 'Pollen and Ancient Landscapes', level: 'B2–C1', band: 'advanced', domain: 'Archaeology', sourceGenre: 'Academic explanation',
    sourceText: 'Tiny grains of pollen can remain preserved in lake mud for thousands of years. Different plants produce pollen with distinctive shapes, so researchers can identify which kinds of vegetation were present when each layer of sediment formed. By comparing layers, they can reconstruct broad changes in ancient landscapes. A rise in grass pollen, for example, may indicate that forests became more open. These records cannot describe every local detail, but they provide evidence about climate, farming, fire, and other processes that altered vegetation long before written observations were available.',
    vocabulary: [{word:'sediment',cefr:'C1',pos:'noun',meaning:'material that settles in layers',family:'sediment · sedimentary',collocation:'sediment layer'},{word:'reconstruct',cefr:'B2',pos:'verb',meaning:'build an account of something from evidence',family:'construct · reconstruct · reconstruction',collocation:'reconstruct change'}]
  },
  {
    id: 'ctw-market-signals', title: 'Market Signals', level: 'B2–C1', band: 'advanced', domain: 'Economics', sourceGenre: 'Academic explanation', targetPolicy: 'curated-public-rule-safe', targetLexicalPositions: [2,6,8,10,12,14,16,18,20,24],
    sourceText: 'Prices can communicate information even when buyers and sellers never meet directly. When demand for a product increases while supply remains limited, rising prices may encourage producers to make more of it or consumers to seek alternatives. Economists often describe such changes as market signals. A signal does not guarantee an efficient outcome because people may lack information, face unequal choices, or respond slowly. Still, changes in price and quantity can reveal shifting preferences and constraints. Interpreting those signals requires attention to the institutions and conditions surrounding a particular market.',
    vocabulary: [{word:'constraint',cefr:'C1',pos:'noun',meaning:'a limit on choices or action',family:'constrain · constraint',collocation:'economic constraint'},{word:'quantity',cefr:'B2',pos:'noun',meaning:'an amount or number',family:'quantity · quantitative',collocation:'price and quantity'}]
  },
  {
    id: 'ctw-bird-migration', title: 'Navigation in Migrating Birds', level: 'B2–C1', band: 'advanced', domain: 'Life science', sourceGenre: 'Academic explanation', targetPolicy: 'curated-public-rule-safe', targetLexicalPositions: [2,4,6,8,10,12,16,18,20,22],
    sourceText: 'Migrating birds can travel across vast regions and still return to familiar places. Their navigation appears to combine several sources of information, including the position of the sun, patterns of stars, landmarks, odors, and cues related to Earth’s magnetic field. Different species rely on these signals in different ways. Young birds may inherit a general direction of travel, while experienced individuals can refine routes through learning. Weather can also push birds away from an intended path, so successful migration requires flexible correction rather than a single fixed internal map.',
    vocabulary: [{word:'navigation',cefr:'B2',pos:'noun',meaning:'the process of finding a route',family:'navigate · navigation',collocation:'animal navigation'},{word:'refine',cefr:'C1',pos:'verb',meaning:'improve through small adjustments',family:'refine · refinement',collocation:'refine a route'}]
  }
];

const CORE_BUILD_SETS = [
  {
    id: 'build-core-01',
    title: 'Campus and Daily Communication',
    level: 'B1–C1',
    items: [
      {
        id: 'bs-01',
        promptA: 'How was the volunteer orientation?',
        prefix: 'The',
        suffix: 'very helpful.',
        slots: 5,
        choices: [
          { id: 'advisor', text: 'advisor' },
          { id: 'who', text: 'who' },
          { id: 'explained', text: 'explained' },
          { id: 'requirements', text: 'the requirements' },
          { id: 'was', text: 'was' },
          { id: 'were', text: 'were' },
          { id: 'which', text: 'which' }
        ],
        accepted: [['advisor', 'who', 'explained', 'requirements', 'was']],
        grammar: ['relative clause', 'subject–verb agreement'],
        explanation: '“Who” introduces a relative clause describing the singular noun “advisor,” so the main verb is “was.”'
      },
      {
        id: 'bs-02',
        promptA: 'I heard the workshop location changed.',
        prefix: '',
        suffix: '?',
        slots: 7,
        choices: [
          { id: 'do', text: 'Do' },
          { id: 'you', text: 'you' },
          { id: 'know', text: 'know' },
          { id: 'where', text: 'where' },
          { id: 'workshop', text: 'the workshop' },
          { id: 'will', text: 'will be held' },
          { id: 'today', text: 'today' },
          { id: 'does', text: 'does' },
          { id: 'held', text: 'is holding' }
        ],
        accepted: [['do', 'you', 'know', 'where', 'workshop', 'will', 'today']],
        grammar: ['embedded question', 'future passive'],
        explanation: 'After “Do you know,” the embedded question uses statement order: “where the workshop will be held.”'
      },
      {
        id: 'bs-03',
        promptA: 'The library website is not clear.',
        prefix: '',
        suffix: '?',
        slots: 7,
        choices: [
          { id: 'could', text: 'Could' },
          { id: 'you', text: 'you' },
          { id: 'tell', text: 'tell me' },
          { id: 'whether', text: 'whether' },
          { id: 'library', text: 'the library' },
          { id: 'open', text: 'is open' },
          { id: 'sundays', text: 'on Sundays' },
          { id: 'does', text: 'does' },
          { id: 'opened', text: 'opened' }
        ],
        accepted: [['could', 'you', 'tell', 'whether', 'library', 'open', 'sundays']],
        grammar: ['indirect yes/no question', 'polite request'],
        explanation: '“Whether” introduces an indirect yes/no question, which uses statement word order.'
      },
      {
        id: 'bs-04',
        promptA: 'Has the instructor seen your report?',
        prefix: 'The',
        suffix: '.',
        slots: 6,
        choices: [
          { id: 'report', text: 'report' },
          { id: 'that', text: 'that' },
          { id: 'submitted', text: 'we submitted' },
          { id: 'yesterday', text: 'yesterday' },
          { id: 'has', text: 'has already been' },
          { id: 'reviewed', text: 'reviewed' },
          { id: 'have', text: 'have already been' },
          { id: 'who', text: 'who' }
        ],
        accepted: [['report', 'that', 'submitted', 'yesterday', 'has', 'reviewed']],
        grammar: ['relative clause', 'present perfect passive'],
        explanation: 'The relative clause modifies “report”; the singular subject then takes “has already been reviewed.”'
      },
      {
        id: 'bs-05',
        promptA: 'Is the field trip still happening?',
        prefix: '',
        suffix: '.',
        slots: 7,
        choices: [
          { id: 'if', text: 'If' },
          { id: 'weather', text: 'the weather' },
          { id: 'improves', text: 'improves' },
          { id: 'trip', text: 'the field trip' },
          { id: 'will', text: 'will continue' },
          { id: 'as', text: 'as' },
          { id: 'planned', text: 'planned' },
          { id: 'would', text: 'would continue' },
          { id: 'improve', text: 'will improve' }
        ],
        accepted: [['if', 'weather', 'improves', 'trip', 'will', 'as', 'planned']],
        grammar: ['first conditional', 'time reference'],
        explanation: 'A likely future condition uses present simple in the if-clause and “will” in the result clause.'
      },
      {
        id: 'bs-06',
        promptA: 'The concert sold out immediately.',
        prefix: 'I was',
        suffix: '.',
        slots: 6,
        choices: [
          { id: 'surprised', text: 'surprised' },
          { id: 'by', text: 'by' },
          { id: 'how', text: 'how' },
          { id: 'quickly', text: 'quickly' },
          { id: 'tickets', text: 'the tickets' },
          { id: 'sold', text: 'sold out' },
          { id: 'what', text: 'what' },
          { id: 'were', text: 'were sold out' }
        ],
        accepted: [['surprised', 'by', 'how', 'quickly', 'tickets', 'sold']],
        grammar: ['exclamative clause', 'adverb position'],
        explanation: '“How quickly” introduces a clause describing the surprising degree of speed.'
      },
      {
        id: 'bs-07',
        promptA: 'What did the professor ask you to do?',
        prefix: 'She',
        suffix: '.',
        slots: 6,
        choices: [
          { id: 'asked', text: 'asked' },
          { id: 'us', text: 'us' },
          { id: 'to', text: 'to compare' },
          { id: 'two', text: 'the two' },
          { id: 'approaches', text: 'approaches' },
          { id: 'carefully', text: 'carefully' },
          { id: 'that', text: 'that' },
          { id: 'comparing', text: 'comparing' }
        ],
        accepted: [['asked', 'us', 'to', 'two', 'approaches', 'carefully']],
        grammar: ['verb + object + infinitive', 'adverb position'],
        explanation: '“Ask” takes an object followed by a to-infinitive: “asked us to compare.”'
      },
      {
        id: 'bs-08',
        promptA: 'Did anyone know the schedule had changed?',
        prefix: 'Neither',
        suffix: '.',
        slots: 7,
        choices: [
          { id: 'students', text: 'the students' },
          { id: 'nor', text: 'nor' },
          { id: 'instructor', text: 'the instructor' },
          { id: 'was', text: 'was' },
          { id: 'aware', text: 'aware' },
          { id: 'of', text: 'of' },
          { id: 'change', text: 'the change' },
          { id: 'were', text: 'were' },
          { id: 'or', text: 'or' }
        ],
        accepted: [['students', 'nor', 'instructor', 'was', 'aware', 'of', 'change']],
        grammar: ['neither…nor', 'proximity agreement'],
        explanation: 'With “neither…nor,” the verb agrees with the nearer subject, “the instructor,” so “was” is used.'
      },
      {
        id: 'bs-09',
        promptA: 'Why did the department change the class time?',
        prefix: 'The new schedule',
        suffix: '.',
        slots: 6,
        choices: [
          { id: 'makes', text: 'makes' },
          { id: 'it', text: 'it' },
          { id: 'easier', text: 'easier' },
          { id: 'for', text: 'for commuters' },
          { id: 'to', text: 'to attend' },
          { id: 'classes', text: 'classes' },
          { id: 'make', text: 'make' },
          { id: 'attending', text: 'attending' }
        ],
        accepted: [['makes', 'it', 'easier', 'for', 'to', 'classes']],
        grammar: ['dummy object “it”', 'comparative complement'],
        explanation: 'The pattern is “make it + adjective + for someone + to-infinitive.”'
      },
      {
        id: 'bs-10',
        promptA: 'What was most valuable about the workshop?',
        prefix: '',
        suffix: '.',
        slots: 8,
        choices: [
          { id: 'what', text: 'What' },
          { id: 'found', text: 'I found' },
          { id: 'most', text: 'most useful' },
          { id: 'was', text: 'was' },
          { id: 'feedback', text: 'the feedback' },
          { id: 'from', text: 'from' },
          { id: 'my', text: 'my classmates' },
          { id: 'gave', text: 'gave me' },
          { id: 'were', text: 'were' },
          { id: 'which', text: 'Which' }
        ],
        accepted: [['what', 'found', 'most', 'was', 'feedback', 'from', 'my', 'gave']],
        grammar: ['fused relative clause', 'subject complement'],
        explanation: '“What I found most useful” acts as the subject; the singular clause takes “was.”'
      }
    ]
  },
  {
    id: 'build-core-02', title: 'Student Services and Plans', level: 'A2–B2', items: [
      {id:'bs2-01',promptA:'Do you know when the advising office closes?',prefix:'I',suffix:'.',slots:6,choices:[{id:'think',text:'think'},{id:'it',text:'it'},{id:'closes',text:'closes'},{id:'at',text:'at'},{id:'five',text:'five'},{id:'today',text:'today'},{id:'close',text:'close'}],accepted:[['think','it','closes','at','five','today']],grammar:['present simple','embedded information'],explanation:'Use “closes” with singular “it,” followed by time information.'},
      {id:'bs2-02',promptA:'Why are you carrying those forms?',prefix:'I',suffix:'.',slots:6,choices:[{id:'need',text:'need'},{id:'to',text:'to'},{id:'submit',text:'submit'},{id:'them',text:'them'},{id:'before',text:'before'},{id:'lunch',text:'lunch'},{id:'submitted',text:'submitted'}],accepted:[['need','to','submit','them','before','lunch']],grammar:['infinitive','time phrase'],explanation:'“Need to submit” is followed by the object and deadline.'},
      {id:'bs2-03',promptA:'Did Maya reserve the study room?',prefix:'She',suffix:'.',slots:6,choices:[{id:'said',text:'said'},{id:'she',text:'she'},{id:'would',text:'would'},{id:'do',text:'do'},{id:'it',text:'it'},{id:'today',text:'today'},{id:'will',text:'will'}],accepted:[['said','she','would','do','it','today']],grammar:['reported speech','modal'],explanation:'Past reporting commonly shifts “will” to “would.”'},
      {id:'bs2-04',promptA:'Which bus should we take?',prefix:'The',suffix:'.',slots:6,choices:[{id:'one',text:'one'},{id:'that',text:'that'},{id:'stops',text:'stops'},{id:'near',text:'near'},{id:'campus',text:'campus'},{id:'is',text:'is number 8'},{id:'stop',text:'stop'}],accepted:[['one','that','stops','near','campus','is']],grammar:['relative clause','subject complement'],explanation:'The relative clause “that stops near campus” modifies “one.”'},
      {id:'bs2-05',promptA:'Can I still change my course?',prefix:'You',suffix:'.',slots:7,choices:[{id:'can',text:'can'},{id:'change',text:'change'},{id:'it',text:'it'},{id:'as',text:'as long as'},{id:'you',text:'you'},{id:'do',text:'do so'},{id:'today',text:'today'},{id:'did',text:'did'}],accepted:[['can','change','it','as','you','do','today']],grammar:['condition','modal'],explanation:'“As long as” introduces the condition.'},
      {id:'bs2-06',promptA:'Why did you email the librarian?',prefix:'I wanted',suffix:'.',slots:6,choices:[{id:'to',text:'to know'},{id:'whether',text:'whether'},{id:'the',text:'the article'},{id:'was',text:'was'},{id:'available',text:'available'},{id:'online',text:'online'},{id:'did',text:'did'}],accepted:[['to','whether','the','was','available','online']],grammar:['indirect question','copular clause'],explanation:'After “to know whether,” use statement order.'},
      {id:'bs2-07',promptA:'How did the presentation go?',prefix:'It',suffix:'.',slots:6,choices:[{id:'went',text:'went'},{id:'better',text:'better'},{id:'than',text:'than'},{id:'I',text:'I'},{id:'had',text:'had'},{id:'expected',text:'expected'},{id:'expecting',text:'expecting'}],accepted:[['went','better','than','I','had','expected']],grammar:['comparison','past perfect'],explanation:'“Better than I had expected” gives a comparison to an earlier expectation.'},
      {id:'bs2-08',promptA:'Are you attending the training session?',prefix:'I will',suffix:'.',slots:6,choices:[{id:'if',text:'if'},{id:'my',text:'my schedule'},{id:'does',text:'does not'},{id:'change',text:'change'},{id:'before',text:'before'},{id:'then',text:'then'},{id:'will',text:'will not'}],accepted:[['if','my','does','change','before','then']],grammar:['first conditional','present in if-clause'],explanation:'The condition uses present tense after “if.”'},
      {id:'bs2-09',promptA:'Who can approve this request?',prefix:'The',suffix:'.',slots:6,choices:[{id:'coordinator',text:'coordinator'},{id:'who',text:'who'},{id:'handles',text:'handles'},{id:'student',text:'student services'},{id:'can',text:'can approve'},{id:'it',text:'it'},{id:'which',text:'which'}],accepted:[['coordinator','who','handles','student','can','it']],grammar:['relative clause','modal'],explanation:'“Who handles student services” identifies the coordinator.'},
      {id:'bs2-10',promptA:'Why are you checking the course page?',prefix:'I am',suffix:'.',slots:6,choices:[{id:'trying',text:'trying'},{id:'to',text:'to see'},{id:'whether',text:'whether'},{id:'deadline',text:'the deadline'},{id:'was',text:'was'},{id:'extended',text:'extended'},{id:'extend',text:'extend'}],accepted:[['trying','to','whether','deadline','was','extended']],grammar:['indirect yes/no question','passive'],explanation:'“Whether the deadline was extended” is an embedded clause.'}
    ]
  },
  {
    id: 'build-core-03', title: 'Academic Interaction and Complex Forms', level: 'B2–C2', items: [
      {id:'bs3-01',promptA:'What did the professor emphasize?',prefix:'She',suffix:'.',slots:6,choices:[{id:'said',text:'said'},{id:'that',text:'that'},{id:'evidence',text:'the evidence'},{id:'should',text:'should be'},{id:'interpreted',text:'interpreted'},{id:'carefully',text:'carefully'},{id:'interpret',text:'interpret'}],accepted:[['said','that','evidence','should','interpreted','carefully']],grammar:['reported clause','modal passive'],explanation:'“Should be interpreted” forms a modal passive.'},
      {id:'bs3-02',promptA:'Why did the survey results surprise you?',prefix:'I had',suffix:'.',slots:7,choices:[{id:'expected',text:'expected'},{id:'the',text:'the two groups'},{id:'to',text:'to respond'},{id:'more',text:'more'},{id:'similarly',text:'similarly'},{id:'than',text:'than'},{id:'they',text:'they did'},{id:'similar',text:'similar'}],accepted:[['expected','the','to','more','similarly','than','they']],grammar:['complex object','comparison'],explanation:'“Expected the two groups to respond...” uses an object plus infinitive.'},
      {id:'bs3-03',promptA:'Do we need to repeat the experiment?',prefix:'That depends',suffix:'.',slots:6,choices:[{id:'on',text:'on'},{id:'whether',text:'whether'},{id:'the',text:'the initial result'},{id:'can',text:'can be'},{id:'replicated',text:'replicated'},{id:'reliably',text:'reliably'},{id:'does',text:'does'}],accepted:[['on','whether','the','can','replicated','reliably']],grammar:['prepositional complement','passive'],explanation:'“Depends on whether...” takes an embedded clause.'},
      {id:'bs3-04',promptA:'What makes this source useful?',prefix:'What matters',suffix:'.',slots:6,choices:[{id:'is',text:'is'},{id:'not',text:'not only'},{id:'who',text:'who wrote it'},{id:'but',text:'but also'},{id:'when',text:'when'},{id:'it',text:'it was written'},{id:'because',text:'because'}],accepted:[['is','not','who','but','when','it']],grammar:['not only...but also','fused relative'],explanation:'The paired structure connects two embedded questions.'},
      {id:'bs3-05',promptA:'Did the committee accept the proposal?',prefix:'They accepted it',suffix:'.',slots:6,choices:[{id:'provided',text:'provided that'},{id:'the',text:'the budget'},{id:'could',text:'could be'},{id:'reduced',text:'reduced'},{id:'without',text:'without'},{id:'delay',text:'delay'},{id:'reducing',text:'reducing'}],accepted:[['provided','the','could','reduced','without','delay']],grammar:['condition','modal passive'],explanation:'“Provided that” introduces a condition.'},
      {id:'bs3-06',promptA:'Why is the conclusion cautious?',prefix:'The data',suffix:'.',slots:7,choices:[{id:'are',text:'are'},{id:'not',text:'not consistent enough'},{id:'to',text:'to support'},{id:'a',text:'a stronger claim'},{id:'without',text:'without'},{id:'further',text:'further'},{id:'evidence',text:'evidence'},{id:'is',text:'is'}],accepted:[['are','not','to','a','without','further','evidence']],grammar:['adjective complement','infinitive'],explanation:'Plural “data” takes “are” in this formal academic sentence.'},
      {id:'bs3-07',promptA:'What did the reviewer recommend?',prefix:'She suggested',suffix:'.',slots:6,choices:[{id:'that',text:'that'},{id:'the',text:'the introduction'},{id:'be',text:'be'},{id:'revised',text:'revised'},{id:'before',text:'before'},{id:'publication',text:'publication'},{id:'was',text:'was'}],accepted:[['that','the','be','revised','before','publication']],grammar:['mandative subjunctive','passive'],explanation:'After “suggested that,” formal English can use the base form “be.”'},
      {id:'bs3-08',promptA:'Why are the two studies difficult to compare?',prefix:'They',suffix:'.',slots:7,choices:[{id:'used',text:'used'},{id:'different',text:'different methods'},{id:'for',text:'for measuring'},{id:'what',text:'what'},{id:'appears',text:'appears'},{id:'to',text:'to be'},{id:'same',text:'the same outcome'},{id:'use',text:'use'}],accepted:[['used','different','for','what','appears','to','same']],grammar:['gerund complement','fused relative'],explanation:'“What appears to be...” functions as the object of “measuring.”'},
      {id:'bs3-09',promptA:'Could the policy have caused the change?',prefix:'It',suffix:'.',slots:7,choices:[{id:'may',text:'may have'},{id:'contributed',text:'contributed'},{id:'but',text:'but'},{id:'the',text:'the evidence'},{id:'does',text:'does not'},{id:'establish',text:'establish'},{id:'causation',text:'causation'},{id:'caused',text:'caused'}],accepted:[['may','contributed','but','the','does','establish','causation']],grammar:['modal perfect','coordination'],explanation:'“May have contributed” expresses a cautious past possibility.'},
      {id:'bs3-10',promptA:'What should we do with the conflicting findings?',prefix:'We need',suffix:'.',slots:7,choices:[{id:'to',text:'to determine'},{id:'which',text:'which differences'},{id:'are',text:'are'},{id:'substantive',text:'substantive'},{id:'and',text:'and which'},{id:'reflect',text:'reflect'},{id:'measurement',text:'measurement error'},{id:'is',text:'is'}],accepted:[['to','which','are','substantive','and','reflect','measurement']],grammar:['embedded wh-clause','parallelism'],explanation:'The parallel clauses contrast substantive differences with measurement error.'}
    ]
  }
];

export const BUILD_SETS = [...CORE_BUILD_SETS, SUPPLEMENTAL_BUILD_SET];

export const EMAIL_TASKS = [
  {
    id: 'email-room-reservation',
    title: 'Room Reservation',
    setting: 'Academic / campus organization',
    recipient: 'Ms. Perez, Student Activities Coordinator',
    subject: 'Saturday room reservation',
    scenario: 'You are part of a student research club. The club booked a campus room for a project meeting on Saturday, but the reservation system now shows the booking as canceled.',
    goals: [
      'Explain what the meeting is for.',
      'Describe the reservation problem.',
      'Ask Ms. Perez to restore the booking or suggest another room.'
    ],
    visual: { type: 'calendar', date: 'SAT 12', label: 'Research Club Meeting', status: 'CANCELED', detail: 'Library Room 204 · 2:00–4:00 p.m.' },
    rubricHints: {
      purposeGroups: [
        ['research club', 'project meeting', 'research meeting', 'club meeting'],
        ['canceled', 'cancelled', 'reservation', 'booking', 'room'],
        ['restore', 'reinstate', 'another room', 'alternative room', 'available room', 'suggest']
      ]
    }
  },
  {
    id: 'email-volunteer-invitation',
    title: 'Volunteer Invitation',
    setting: 'Social / community',
    recipient: 'Mr. Okafor, Community Center Director',
    subject: 'Neighborhood clean-up event',
    scenario: 'Your student group is organizing a neighborhood clean-up. You would like the community center to participate, but the event poster currently lists the wrong starting time.',
    goals: [
      'Invite the community center and explain why its participation would help.',
      'Point out the incorrect time on the poster.',
      'Ask Mr. Okafor to share the corrected information with community members.'
    ],
    visual: { type: 'poster', date: 'SUN 20', label: 'Neighborhood Clean-up', status: 'POSTER: 8:00', detail: 'Correct start time: 9:30 a.m.' },
    rubricHints: {
      purposeGroups: [
        ['invite', 'participate', 'join', 'community center'],
        ['wrong time', 'incorrect time', '8:00', '9:30', 'poster'],
        ['share', 'announce', 'inform', 'corrected information', 'community members']
      ]
    }
  },
  {
    id: 'email-lab-equipment',
    title: 'Lab Equipment Problem',
    setting: 'Academic / laboratory',
    recipient: 'Dr. Silva, Laboratory Manager',
    subject: 'Problem with the shared microscope',
    scenario: 'You used a shared microscope for a class project. The image became blurry even after you followed the posted adjustment instructions, and another group needs the microscope tomorrow morning.',
    goals: [
      'Explain when and how you noticed the problem.',
      'Describe what you did to check or solve it.',
      'Ask Dr. Silva what you should do next and mention the next group’s schedule.'
    ],
    visual: { type: 'equipment', date: 'LAB B', label: 'Microscope 3', status: 'IMAGE BLURRY', detail: 'Next booking: tomorrow · 9:00 a.m.' },
    rubricHints: {
      purposeGroups: [
        ['microscope', 'blurry', 'image', 'noticed', 'used'],
        ['instructions', 'adjusted', 'checked', 'cleaned', 'tried'],
        ['what should', 'next', 'repair', 'tomorrow', '9:00', 'another group']
      ]
    }
  },
  {id:'email-advising-conflict',title:'Advising Appointment Conflict',setting:'Academic / advising',recipient:'Mr. Wallace, Academic Adviser',subject:'Advising appointment on Thursday',scenario:'You have an advising appointment on Thursday afternoon, but a required laboratory session has just been moved to the same time.',goals:['Explain why you can no longer attend the original appointment.','Give information about the new laboratory schedule.','Ask for another appointment time and mention when you are available.'],visual:{type:'calendar',date:'THU 14',label:'Advising appointment',status:'TIME CONFLICT',detail:'Lab moved to 3:00–5:00 p.m.'},rubricHints:{purposeGroups:[['appointment','cannot attend','conflict'],['lab','laboratory','3:00','5:00'],['another time','reschedule','available']]}},
  {id:'email-library-hold',title:'Library Hold Problem',setting:'Academic / library',recipient:'Ms. Bennett, Library Services',subject:'Hold request for course book',scenario:'The library notified you that a course book you placed on hold is ready, but your online account shows that the hold has expired even though the pickup deadline is tomorrow.',goals:['Identify the book request and explain why you need it.','Describe the conflicting hold information.','Ask whether the hold can be restored or the book kept until tomorrow.'],visual:{type:'notice',date:'DUE 25',label:'Course book hold',status:'EXPIRED?',detail:'Email says pickup by tomorrow'},rubricHints:{purposeGroups:[['book','course','hold'],['expired','deadline','tomorrow'],['restore','keep','pickup']]}},
  {id:'email-campus-job',title:'Campus Job Schedule',setting:'Academic / employment',recipient:'Ms. Romero, Shift Supervisor',subject:'Shift during exam week',scenario:'Your campus job schedule includes a Friday evening shift, but your department has added a required review session at the same time before a major exam.',goals:['Explain the new academic commitment.','Describe the scheduling conflict clearly.','Ask to exchange the shift or work at another time.'],visual:{type:'calendar',date:'FRI 18',label:'Campus job shift',status:'CONFLICT',detail:'Required review session · 6:00 p.m.'},rubricHints:{purposeGroups:[['review session','exam','required'],['shift','friday','conflict'],['exchange','swap','another time']]}},
  {id:'email-missing-data',title:'Missing Project Data',setting:'Academic / research',recipient:'Dr. Patel, Project Supervisor',subject:'Missing files for project analysis',scenario:'Your research group is preparing a report, but a shared folder is missing one set of survey data that your team needs before analysis can be completed.',goals:['Explain what part of the project you are working on.','Describe which data appear to be missing and what you checked.','Ask Dr. Patel how to obtain the files or proceed without them.'],visual:{type:'notice',date:'REPORT',label:'Shared data folder',status:'FILES MISSING',detail:'Survey set B not visible'},rubricHints:{purposeGroups:[['project','report','analysis'],['data','missing','folder','survey'],['obtain','files','proceed','what should']]}},
  {id:'email-workshop-waitlist',title:'Workshop Waitlist',setting:'Academic / professional development',recipient:'Ms. Kim, Workshop Coordinator',subject:'Data visualization workshop waitlist',scenario:'You registered for a data visualization workshop and received a waitlist notice. A class assignment now requires the software covered in the workshop before next week.',goals:['Explain why the workshop has become especially relevant to you.','Mention the waitlist notice and your deadline.','Ask whether a place may be available or whether another resource is recommended.'],visual:{type:'notice',date:'NEXT WK',label:'Visualization workshop',status:'WAITLIST',detail:'Assignment due next week'},rubricHints:{purposeGroups:[['assignment','software','relevant'],['waitlist','deadline','next week'],['place','available','resource','alternative']]} }
];

export const DISCUSSION_TASKS = [
  {
    id: 'discussion-campus-cars',
    course: 'Urban Planning',
    professor: 'Professor Chen',
    question: 'Some universities are reducing parking and limiting private cars on campus so they can use the space for transit, bicycle facilities, green areas, or study spaces. Others argue that students and staff still need convenient car access, especially commuters. Should universities actively reduce private-car access on campus? Why or why not?',
    students: [
      { name: 'Lena', avatar: 'L', post: 'I support reducing car access if universities also provide reliable transit. Fewer cars can reduce noise and make walking safer, while valuable land can be used for spaces that benefit more students.' },
      { name: 'Marcus', avatar: 'M', post: 'I would not restrict cars until alternatives are strong. Many commuters have jobs, family responsibilities, or mobility needs, so flexibility matters. Universities should improve options first.' }
    ],
    keywords: ['cars', 'parking', 'campus', 'transit', 'commuters', 'space', 'access']
  },
  {
    id: 'discussion-group-projects',
    course: 'Education',
    professor: 'Professor Mensah',
    question: 'In many university courses, a large part of the final grade comes from group projects. Supporters say group work develops communication and collaboration skills, while critics say individual effort is difficult to evaluate fairly. Should major group projects make up a large portion of a course grade? Explain your position.',
    students: [
      { name: 'Aiko', avatar: 'A', post: 'Yes, because most workplaces require people to coordinate with others. A well-designed group project can teach students how to divide responsibilities and combine different strengths.' },
      { name: 'Daniel', avatar: 'D', post: 'I prefer a smaller group-project percentage. One student may do much more work than another, so the grade may not accurately represent each person’s learning.' }
    ],
    keywords: ['group project', 'grade', 'collaboration', 'individual', 'fair', 'work']
  },
  {
    id: 'discussion-digital-museums',
    course: 'Museum Studies',
    professor: 'Professor Alvarez',
    question: 'Museums increasingly publish high-quality digital images and virtual tours of their collections. Some people think this access may reduce the number of in-person visitors, while others believe it encourages more people to visit. Should museums invest heavily in digital access even if it might change on-site attendance? Why?',
    students: [
      { name: 'Priya', avatar: 'P', post: 'Digital access expands education because people who live far away or cannot travel can still study the collection. It may also motivate viewers to see the original objects later.' },
      { name: 'Jonas', avatar: 'J', post: 'Museums should be cautious. Creating digital experiences is expensive, and visitors may decide that viewing objects online is sufficient instead of buying tickets.' }
    ],
    keywords: ['museum', 'digital', 'virtual', 'visit', 'access', 'collection', 'attendance']
  },
  {id:'discussion-open-textbooks',course:'Education Policy',professor:'Professor Reed',question:'Some universities support open digital textbooks that students can use free of charge, while others prefer commercially published materials selected by instructors. Should universities invest more heavily in open textbooks even if doing so requires faculty time to create and update them?',students:[{name:'Nora',avatar:'N',post:'I support open textbooks because high book prices can prevent students from getting materials on time. Faculty effort is worthwhile if the resources remain available to many future classes.'},{name:'Omar',avatar:'O',post:'I think quality and flexibility matter more than price alone. Commercial books are often professionally edited and updated, so instructors should choose whichever resource best fits a course.'}],keywords:['textbooks','open','students','cost','faculty','quality']},
  {id:'discussion-city-trees',course:'Environmental Planning',professor:'Professor Brooks',question:'Cities often have limited budgets for climate adaptation. Should they prioritize planting and maintaining street trees, even when trees require years of care before they provide their full benefits?',students:[{name:'Mei',avatar:'M',post:'Yes. Trees provide shade, reduce heat, and improve public space. Because they take time to mature, cities should begin early rather than waiting until heat becomes worse.'},{name:'Lucas',avatar:'L',post:'Trees are useful, but some neighborhoods first need urgent improvements such as drainage or safer housing. A fixed priority could ignore more immediate local problems.'}],keywords:['trees','cities','heat','budget','maintenance','neighborhood']},
  {id:'discussion-recorded-lectures',course:'Learning Sciences',professor:'Professor Ahmed',question:'Should university instructors routinely record lectures and make the recordings available to all enrolled students, or can easy access to recordings reduce attendance and participation?',students:[{name:'Sofia',avatar:'S',post:'Recordings improve access for students who are sick or need to review difficult material. They should be treated as a study resource rather than a replacement for class.'},{name:'Ethan',avatar:'E',post:'I worry that routine recordings make it easier to postpone learning. In discussion-based courses, students also lose something when many classmates stop attending in person.'}],keywords:['recordings','lecture','attendance','students','review','participation']},
  {id:'discussion-local-food',course:'Sustainable Food Systems',professor:'Professor Vega',question:'University dining services can purchase more food from nearby farms, but local products may cost more or vary by season. Should universities set a strong target for locally produced food?',students:[{name:'Hana',avatar:'H',post:'A clear target can support regional farms and reduce some transportation impacts. Menus can change with the seasons instead of expecting the same products all year.'},{name:'Ben',avatar:'B',post:'I prefer flexible purchasing. A local product is not automatically more sustainable, and higher costs could make meal plans less affordable for students.'}],keywords:['local','food','university','cost','farms','sustainable']},
  {id:'discussion-ai-office-hours',course:'Higher Education',professor:'Professor Okoye',question:'Some universities are experimenting with AI assistants that answer routine course questions outside normal office hours. Should instructors use these tools if students are clearly told that the answers are generated by AI and may contain errors?',students:[{name:'Rina',avatar:'R',post:'They can be useful for simple questions about schedules or definitions when instructors are unavailable. Clear warnings and links to official course information could reduce the risk of mistakes.'},{name:'Tomas',avatar:'T',post:'I would be cautious because students may trust a confident answer even after seeing a warning. Instructor time might be better spent improving course FAQs and peer support.'}],keywords:['AI','students','answers','instructors','errors','course']}
];

export const VOCABULARY_BANK = [
  { word: 'access', cefr: 'B1', category: 'campus', pos: 'noun/verb', meaning: 'the ability or right to use or enter something', family: 'access · accessible · accessibility', collocation: 'gain access to' },
  { word: 'available', cefr: 'B1', category: 'campus', pos: 'adjective', meaning: 'ready for use or free at a particular time', family: 'avail · available · availability', collocation: 'available space' },
  { word: 'coordinate', cefr: 'B2', category: 'campus', pos: 'verb', meaning: 'organize people or activities so they work together', family: 'coordinate · coordinator · coordination', collocation: 'coordinate a meeting' },
  { word: 'deadline', cefr: 'B1', category: 'campus', pos: 'noun', meaning: 'the latest time by which something must be completed', family: 'deadline', collocation: 'meet a deadline' },
  { word: 'requirement', cefr: 'B1–B2', category: 'campus', pos: 'noun', meaning: 'something that is needed or demanded', family: 'require · required · requirement', collocation: 'course requirement' },
  { word: 'reservation', cefr: 'B1–B2', category: 'campus', pos: 'noun', meaning: 'an arrangement to keep a place or service for someone', family: 'reserve · reservation', collocation: 'room reservation' },
  { word: 'indicate', cefr: 'B1–B2', category: 'academic', pos: 'verb', meaning: 'show, suggest, or point to something', family: 'indicate · indication · indicator', collocation: 'results indicate that' },
  { word: 'significant', cefr: 'B2', category: 'academic', pos: 'adjective', meaning: 'important or large enough to be noticed', family: 'signify · significant · significance', collocation: 'significant change' },
  { word: 'contribute', cefr: 'B2', category: 'academic', pos: 'verb', meaning: 'help cause or improve something', family: 'contribute · contribution · contributor', collocation: 'contribute to a result' },
  { word: 'assess', cefr: 'B2', category: 'academic', pos: 'verb', meaning: 'evaluate the quality, value, or importance of something', family: 'assess · assessment', collocation: 'assess performance' },
  { word: 'approach', cefr: 'B1–B2', category: 'academic', pos: 'noun/verb', meaning: 'a way of dealing with a problem or subject', family: 'approach', collocation: 'adopt an approach' },
  { word: 'evidence', cefr: 'B1–B2', category: 'academic', pos: 'noun', meaning: 'information supporting a conclusion', family: 'evidence · evident · evidently', collocation: 'provide evidence' },
  { word: 'relevant', cefr: 'B2', category: 'academic', pos: 'adjective', meaning: 'closely connected to the subject', family: 'relevant · relevance · irrelevant', collocation: 'relevant information' },
  { word: 'maintain', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'keep something in a particular condition', family: 'maintain · maintenance', collocation: 'maintain quality' },
  { word: 'vary', cefr: 'B1–B2', category: 'morphology', pos: 'verb', meaning: 'differ or change', family: 'vary · various · variety · variation', collocation: 'vary considerably' },
  { word: 'distribute', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'give or spread things among people or places', family: 'distribute · distribution · distributor', collocation: 'distribute resources' },
  { word: 'interpret', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'understand or explain meaning', family: 'interpret · interpretation · interpreter', collocation: 'interpret findings' },
  { word: 'coherent', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'logical, clear, and well organized', family: 'cohere · coherent · coherence', collocation: 'coherent argument' },
  { word: 'facilitate', cefr: 'C1', category: 'advanced', pos: 'verb', meaning: 'make a process easier or more likely', family: 'facilitate · facilitation · facilitator', collocation: 'facilitate learning' },
  { word: 'mitigate', cefr: 'C1', category: 'advanced', pos: 'verb', meaning: 'make a harmful effect less severe', family: 'mitigate · mitigation', collocation: 'mitigate risk' },
  { word: 'viable', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'capable of working successfully', family: 'viable · viability', collocation: 'viable option' },
  { word: 'constrain', cefr: 'C1', category: 'advanced', pos: 'verb', meaning: 'limit what can be done', family: 'constrain · constraint · constrained', collocation: 'constrain growth' },
  { word: 'cumulative', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'increasing as more is added over time', family: 'accumulate · accumulation · cumulative', collocation: 'cumulative effect' },
  { word: 'prevalent', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'common or widespread', family: 'prevail · prevalence · prevalent', collocation: 'widely prevalent' },
  { word: 'allocate', cefr: 'C1', category: 'advanced', pos: 'verb', meaning: 'assign resources for a purpose', family: 'allocate · allocation', collocation: 'allocate funds' },
  { word: 'sustain', cefr: 'B2–C1', category: 'advanced', pos: 'verb', meaning: 'continue or support over time', family: 'sustain · sustainable · sustainability', collocation: 'sustain progress' },
  { word: 'however', cefr: 'B1–B2', category: 'cohesion', pos: 'adverb', meaning: 'introduces a contrast', family: 'however', collocation: 'However, the result…' },
  { word: 'therefore', cefr: 'B1–B2', category: 'cohesion', pos: 'adverb', meaning: 'introduces a result or conclusion', family: 'therefore', collocation: 'therefore conclude' },
  { word: 'whereas', cefr: 'B2', category: 'cohesion', pos: 'conjunction', meaning: 'contrasts two facts or situations', family: 'whereas', collocation: 'X increases, whereas Y falls' },
  { word: 'consequently', cefr: 'C1', category: 'cohesion', pos: 'adverb', meaning: 'as a result', family: 'consequence · consequent · consequently', collocation: 'Consequently, …' },
  { word: 'although', cefr: 'B1–B2', category: 'cohesion', pos: 'conjunction', meaning: 'introduces an unexpected contrast', family: 'although', collocation: 'although it appears' },
  { word: 'infer', cefr: 'C1', category: 'reading', pos: 'verb', meaning: 'reach a conclusion from evidence rather than a direct statement', family: 'infer · inference · inferential', collocation: 'infer from context' },
  { word: 'imply', cefr: 'B2', category: 'reading', pos: 'verb', meaning: 'suggest without stating directly', family: 'imply · implication · implicit', collocation: 'the author implies' },
  { word: 'distinguish', cefr: 'B2', category: 'reading', pos: 'verb', meaning: 'recognize a difference', family: 'distinguish · distinction · distinctive', collocation: 'distinguish between' },
  { word: 'context', cefr: 'B1–B2', category: 'reading', pos: 'noun', meaning: 'surrounding information that helps explain meaning', family: 'context · contextual', collocation: 'meaning in context' },
  { word: 'elaborate', cefr: 'B2–C1', category: 'writing', pos: 'verb/adjective', meaning: 'add relevant detail or develop an idea', family: 'elaborate · elaboration', collocation: 'elaborate on a reason' },
  { word: 'precise', cefr: 'B2', category: 'writing', pos: 'adjective', meaning: 'exact and clearly expressed', family: 'precise · precision · precisely', collocation: 'precise wording' },
  { word: 'register', cefr: 'C1', category: 'writing', pos: 'noun', meaning: 'a level or style of language suited to a situation', family: 'register', collocation: 'formal register' },
  { word: 'idiomatic', cefr: 'C1', category: 'writing', pos: 'adjective', meaning: 'natural for fluent speakers of a language', family: 'idiom · idiomatic · idiomatically', collocation: 'idiomatic expression' },
  { word: 'cohesive', cefr: 'C1', category: 'writing', pos: 'adjective', meaning: 'connected so that parts form a clear whole', family: 'cohere · cohesion · cohesive', collocation: 'cohesive response' },
  { word: 'analyze', cefr: 'B1–B2', category: 'academic', pos: 'verb', meaning: 'examine carefully to understand', family: 'analyze · analysis · analytical', collocation: 'analyze data' },
  { word: 'derive', cefr: 'B2', category: 'academic', pos: 'verb', meaning: 'obtain something from a source', family: 'derive · derivation · derivative', collocation: 'derive from evidence' },
  { word: 'establish', cefr: 'B2', category: 'academic', pos: 'verb', meaning: 'show something to be true or create firmly', family: 'establish · establishment', collocation: 'establish a relationship' },
  { word: 'factor', cefr: 'B1–B2', category: 'academic', pos: 'noun', meaning: 'a circumstance that influences a result', family: 'factor', collocation: 'important factor' },
  { word: 'function', cefr: 'B1–B2', category: 'academic', pos: 'noun/verb', meaning: 'the purpose or way something works', family: 'function · functional', collocation: 'serve a function' },
  { word: 'method', cefr: 'B1', category: 'academic', pos: 'noun', meaning: 'a systematic way of doing something', family: 'method · methodology', collocation: 'research method' },
  { word: 'occur', cefr: 'B1–B2', category: 'academic', pos: 'verb', meaning: 'happen or take place', family: 'occur · occurrence', collocation: 'occur frequently' },
  { word: 'principle', cefr: 'B2', category: 'academic', pos: 'noun', meaning: 'a basic rule or idea', family: 'principle · principled', collocation: 'general principle' },
  { word: 'process', cefr: 'B1', category: 'academic', pos: 'noun/verb', meaning: 'a series of actions or changes', family: 'process · processing', collocation: 'learning process' },
  { word: 'respond', cefr: 'B1', category: 'academic', pos: 'verb', meaning: 'react or answer', family: 'respond · response · responsive', collocation: 'respond to change' },
  { word: 'alternative', cefr: 'B1–B2', category: 'campus', pos: 'noun/adjective', meaning: 'another possible choice', family: 'alternative · alternatively', collocation: 'alternative option' },
  { word: 'appointment', cefr: 'B1', category: 'campus', pos: 'noun', meaning: 'an arranged meeting time', family: 'appoint · appointment', collocation: 'advising appointment' },
  { word: 'assignment', cefr: 'B1', category: 'campus', pos: 'noun', meaning: 'a piece of academic work', family: 'assign · assignment', collocation: 'complete an assignment' },
  { word: 'enroll', cefr: 'B1–B2', category: 'campus', pos: 'verb', meaning: 'officially join a course or program', family: 'enroll · enrollment', collocation: 'enroll in a course' },
  { word: 'schedule', cefr: 'B1', category: 'campus', pos: 'noun/verb', meaning: 'a plan of times for activities', family: 'schedule · scheduled', collocation: 'class schedule' },
  { word: 'submit', cefr: 'B1', category: 'campus', pos: 'verb', meaning: 'give work formally for review', family: 'submit · submission', collocation: 'submit an application' },
  { word: 'eligible', cefr: 'B2', category: 'campus', pos: 'adjective', meaning: 'meeting the conditions to participate', family: 'eligible · eligibility', collocation: 'eligible for funding' },
  { word: 'facility', cefr: 'B1–B2', category: 'campus', pos: 'noun', meaning: 'a building or service for a purpose', family: 'facility · facilities', collocation: 'campus facility' },
  { word: 'supervisor', cefr: 'B1–B2', category: 'campus', pos: 'noun', meaning: 'a person responsible for overseeing work', family: 'supervise · supervision · supervisor', collocation: 'project supervisor' },
  { word: 'participate', cefr: 'B1', category: 'campus', pos: 'verb', meaning: 'take part in an activity', family: 'participate · participant · participation', collocation: 'participate in a workshop' },
  { word: 'adapt', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'change to suit new conditions', family: 'adapt · adaptation · adaptable', collocation: 'adapt to change' },
  { word: 'compare', cefr: 'B1', category: 'morphology', pos: 'verb', meaning: 'examine similarities and differences', family: 'compare · comparison · comparable', collocation: 'compare results' },
  { word: 'define', cefr: 'B1–B2', category: 'morphology', pos: 'verb', meaning: 'state the meaning or limits clearly', family: 'define · definition · definitive', collocation: 'define a term' },
  { word: 'evaluate', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'judge quality or importance', family: 'evaluate · evaluation', collocation: 'evaluate evidence' },
  { word: 'influence', cefr: 'B1–B2', category: 'morphology', pos: 'noun/verb', meaning: 'affect how something develops', family: 'influence · influential', collocation: 'influence behavior' },
  { word: 'observe', cefr: 'B1–B2', category: 'morphology', pos: 'verb', meaning: 'watch or notice carefully', family: 'observe · observation · observable', collocation: 'observe a pattern' },
  { word: 'predict', cefr: 'B1–B2', category: 'morphology', pos: 'verb', meaning: 'say what is likely to happen', family: 'predict · prediction · predictable', collocation: 'predict an outcome' },
  { word: 'regulate', cefr: 'B2–C1', category: 'morphology', pos: 'verb', meaning: 'control according to rules or mechanisms', family: 'regulate · regulation · regulatory', collocation: 'regulate temperature' },
  { word: 'retain', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'continue to have, keep, or remember something', family: 'retain · retention · retentive', collocation: 'retain information' },
  { word: 'transform', cefr: 'B2', category: 'morphology', pos: 'verb', meaning: 'change substantially in form or character', family: 'transform · transformation · transformative', collocation: 'transform a process' },
  { word: 'moreover', cefr: 'B2', category: 'cohesion', pos: 'adverb', meaning: 'adds another supporting point', family: 'moreover', collocation: 'Moreover, the evidence…' },
  { word: 'nevertheless', cefr: 'C1', category: 'cohesion', pos: 'adverb', meaning: 'marks contrast despite what came before', family: 'nevertheless', collocation: 'Nevertheless, the pattern…' },
  { word: 'similarly', cefr: 'B2', category: 'cohesion', pos: 'adverb', meaning: 'introduces a comparable point', family: 'similar · similarly', collocation: 'Similarly, another study…' },
  { word: 'in contrast', cefr: 'B2', category: 'cohesion', pos: 'phrase', meaning: 'introduces an important difference', family: 'contrast · contrasting', collocation: 'In contrast, …' },
  { word: 'for instance', cefr: 'B1–B2', category: 'cohesion', pos: 'phrase', meaning: 'introduces an example', family: 'instance', collocation: 'For instance, …' },
  { word: 'plausible', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'reasonable or believable', family: 'plausible · plausibility', collocation: 'plausible explanation' },
  { word: 'robust', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'strong and reliable under varied conditions', family: 'robust · robustness', collocation: 'robust result' },
  { word: 'subsequent', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'coming after something else', family: 'subsequent · subsequently', collocation: 'subsequent study' },
  { word: 'underlying', cefr: 'B2–C1', category: 'advanced', pos: 'adjective', meaning: 'basic but not immediately visible', family: 'underlie · underlying', collocation: 'underlying cause' },
  { word: 'ambiguous', cefr: 'C1', category: 'advanced', pos: 'adjective', meaning: 'having more than one possible meaning', family: 'ambiguous · ambiguity', collocation: 'ambiguous wording' }
];

export const APP_META = {
  version: '6.0.0',
  updated: '2026-08-26',
  disclaimer: 'Unofficial practice software. TOEFL and TOEFL iBT are trademarks of ETS. Practice content in this project is original and is not copied from operational test forms.'
};
