/**
 * Original parallel Reading form. No ETS item wording is reproduced.
 * The form follows the public 2026 blueprint: a 35-item router containing
 * 20 scored + 15 research items, followed by a 15-item lower or upper module.
 */

const choices2 = (...entries) => entries.map(([id, text]) => ({ id, text }));

const router2DailyScored = [
  {
    id: 'daily2-router-course-schedule',
    type: 'schedule',
    title: 'Short Course Schedule',
    label: 'Community Learning Center',
    text: `Saturday Workshops\n9:00–10:15  Introduction to Digital Photography — Studio B\n9:30–11:00  Repairing Small Appliances — Workshop 2\n10:30–11:45  Planning a Balcony Garden — Room 104\n12:15–1:30  Writing a Strong Résumé — Computer Lab\n\nParticipants may attend one morning workshop and the résumé session. Photography students should bring a fully charged camera or phone. The repair workshop provides tools, but participants must bring one small appliance that does not use fuel. Registration closes Thursday at noon.`,
    scored: true,
    questions: [
      {
        id: 'daily2-schedule-q1',
        stem: 'Which two workshops can the same participant attend?',
        options: choices2(
          ['A', 'Digital Photography and Repairing Small Appliances'],
          ['B', 'Repairing Small Appliances and Balcony Garden'],
          ['C', 'Balcony Garden and Writing a Strong Résumé'],
          ['D', 'Digital Photography and Balcony Garden']
        ),
        answer: 'C', skill: 'apply-information', difficulty: -0.2,
        explanation: 'The balcony workshop ends before the résumé session begins, and the notice permits one morning workshop plus the résumé session.'
      },
      {
        id: 'daily2-schedule-q2',
        stem: 'What must a participant in the repair workshop provide?',
        options: choices2(
          ['A', 'A set of tools'],
          ['B', 'A small appliance'],
          ['C', 'A charged phone'],
          ['D', 'A printed résumé']
        ),
        answer: 'B', skill: 'scan-detail', difficulty: -0.75,
        explanation: 'Tools are provided, but participants must bring a small appliance that does not use fuel.'
      }
    ]
  },
  {
    id: 'daily2-router-device-invoice',
    type: 'invoice',
    title: 'Laptop Service Invoice',
    label: 'Northside Device Repair',
    text: `Customer: Jordan Lee\nDevice received: May 6\nService completed: May 8\n\nDiagnostic check .......... $25\nReplacement charging port  $48\nLabor ..................... $42\nStudent discount .......... −$15\nTotal due ................. $100\n\nThe diagnostic fee is included in the total even when no repair is approved. Replaced parts are covered for ninety days. Pick up the device within ten business days. After that period, a storage fee of $4 per day will be added. Payment is due when the device is collected.`,
    scored: true,
    questions: [
      {
        id: 'daily2-invoice-q1',
        stem: 'How much money was removed from the bill because the customer is a student?',
        options: choices2(['A', '$4'], ['B', '$15'], ['C', '$25'], ['D', '$42']),
        answer: 'B', skill: 'scan-detail', difficulty: -0.85,
        explanation: 'The invoice lists a student discount of $15.'
      },
      {
        id: 'daily2-invoice-q2',
        stem: 'When must the customer pay the bill?',
        options: choices2(
          ['A', 'When the device is collected'],
          ['B', 'Within ninety days'],
          ['C', 'Before the repair is approved'],
          ['D', 'Ten business days after collection']
        ),
        answer: 'A', skill: 'explicit-detail', difficulty: -0.55,
        explanation: 'The invoice states that payment is due when the device is collected.'
      },
      {
        id: 'daily2-invoice-q3',
        stem: 'Why should the customer collect the laptop promptly?',
        options: choices2(
          ['A', 'The replacement part will be removed.'],
          ['B', 'The diagnostic fee will increase.'],
          ['C', 'A daily storage charge may be added.'],
          ['D', 'The student discount will expire immediately.']
        ),
        answer: 'C', skill: 'purpose', difficulty: -0.1,
        explanation: 'A $4 daily storage fee begins after ten business days.'
      }
    ]
  }
];

const router2DailyResearch = [
  {
    id: 'daily2-router-club-messages',
    type: 'messages',
    title: 'Science Club Messages',
    label: 'Group chat',
    text: `Nora: The weather office now expects heavy rain during Friday's field visit.\nLuis: Should we cancel the water-quality survey?\nNora: Dr. Shah says the indoor lab is available from 2:00 to 4:00. We can analyze the samples collected last week instead.\nMei: I already borrowed the testing kits. Should I return them today?\nNora: Keep them. If the river path reopens Saturday morning, a smaller group may collect fresh samples then. I will confirm by Friday at 6:00 p.m.\nLuis: I can join Saturday, but only before noon.`,
    scored: false,
    questions: [
      {
        id: 'daily2-messages-q1',
        stem: 'What will the group most likely do on Friday?',
        options: choices2(
          ['A', 'Collect samples in heavy rain'],
          ['B', 'Analyze previously collected samples'],
          ['C', 'Return every testing kit'],
          ['D', 'Meet on the river path before noon']
        ),
        answer: 'B', skill: 'inference', difficulty: -0.05,
        explanation: 'The indoor lab is available, and the group can analyze samples collected the previous week.'
      },
      {
        id: 'daily2-messages-q2',
        stem: 'Why does Nora tell Mei to keep the testing kits?',
        options: choices2(
          ['A', 'The lab does not have any equipment.'],
          ['B', 'The kits must be repaired.'],
          ['C', 'The group may conduct fieldwork on Saturday.'],
          ['D', 'Dr. Shah wants to examine them on Friday.']
        ),
        answer: 'C', skill: 'purpose', difficulty: 0.1,
        explanation: 'A smaller group may collect fresh samples on Saturday if the path reopens.'
      },
      {
        id: 'daily2-messages-q3',
        stem: 'What does Luis mean when he says “only before noon”?',
        options: choices2(
          ['A', 'He cannot participate Saturday afternoon.'],
          ['B', 'He wants the Friday lab to begin earlier.'],
          ['C', 'He will confirm the weather before noon.'],
          ['D', 'He must return the kits in the morning.']
        ),
        answer: 'A', skill: 'telegraphic-language', difficulty: 0.35,
        explanation: 'Luis can join the possible Saturday activity, but his availability ends at noon.'
      }
    ]
  },
  {
    id: 'daily2-router-gallery-webpage',
    type: 'webpage',
    title: 'Community Gallery Open Studio',
    label: 'Event page',
    text: `OPEN STUDIO SUNDAY\nMeet local printmakers and watch short demonstrations between 1:00 and 4:00 p.m. Visitors may try one beginner activity at no charge. Space at each table is limited, so free activity tickets will be distributed at the entrance beginning at 12:45. Finished professional prints are available for purchase, but the artists cannot accept cash. Children under twelve must work with an adult. The gallery entrance on Pine Street is temporarily closed; use the courtyard entrance on Hill Avenue.`,
    scored: false,
    questions: [
      {
        id: 'daily2-webpage-q1',
        stem: 'What should visitors do if they want to try the free activity?',
        options: choices2(
          ['A', 'Buy a professional print'],
          ['B', 'Get a ticket at the entrance'],
          ['C', 'Pay cash at an activity table'],
          ['D', 'Enter through Pine Street']
        ),
        answer: 'B', skill: 'apply-information', difficulty: -0.55,
        explanation: 'Free activity tickets are distributed at the entrance because table space is limited.'
      },
      {
        id: 'daily2-webpage-q2',
        stem: 'What is temporarily different about visiting the gallery?',
        options: choices2(
          ['A', 'Demonstrations begin before noon.'],
          ['B', 'Children are not permitted.'],
          ['C', 'Visitors must use another entrance.'],
          ['D', 'Artists are not selling prints.']
        ),
        answer: 'C', skill: 'explicit-detail', difficulty: -0.8,
        explanation: 'The Pine Street entrance is closed, so visitors must use the Hill Avenue courtyard entrance.'
      }
    ]
  }
];

const router2Academic = {
  id: 'academic2-router-subscription-choices2',
  title: 'How Subscription Choices Are Framed',
  domain: 'Business and economics',
  scored: true,
  text: `Companies that sell digital subscriptions often offer several plans rather than a single price. At first glance, this arrangement appears to give customers more freedom. However, the design of the choices2 can also influence which plan seems reasonable. A very expensive premium plan, for example, may make the middle plan look affordable even when customers originally intended to buy the least expensive option. Behavioral economists call this comparison effect anchoring because an initial number becomes a reference point for later judgments.\n\nThe effect does not mean that customers ignore useful information. People still compare features, cancellation rules, and expected use. Yet the order and visual prominence of plans can affect how much attention each feature receives. Some companies highlight a “recommended” plan, while others display monthly costs more prominently than the larger annual payment.\n\nResearchers study these designs by changing one feature at a time and observing whether purchase patterns shift. Such experiments can reveal an influence, but they do not prove that every customer responds identically. Previous experience, budget limits, and the importance of particular features all modify the effect. For this reason, researchers treat choice design as one factor among several rather than as a method that determines behavior completely.`,
  questions: [
    {
      id: 'academic2-subscription-q1',
      stem: 'What is the passage mainly about?',
      options: choices2(
        ['A', 'Why digital services should offer only one subscription plan'],
        ['B', 'How the presentation of subscription plans can affect customer judgments'],
        ['C', 'Why annual subscriptions are always less expensive than monthly plans'],
        ['D', 'How companies calculate the technical cost of digital services']
      ),
      answer: 'B', skill: 'main-idea', difficulty: 0.05,
      explanation: 'The passage explains choice framing and its limited but measurable influence on subscription decisions.'
    },
    {
      id: 'academic2-subscription-q2',
      stem: 'According to paragraph 1, what can an expensive premium plan do?',
      options: choices2(
        ['A', 'Make the middle plan appear more affordable'],
        ['B', 'Prevent customers from seeing the least expensive plan'],
        ['C', 'Eliminate the need to compare plan features'],
        ['D', 'Guarantee that customers will purchase it']
      ),
      answer: 'A', skill: 'factual-information', difficulty: -0.35,
      explanation: 'The premium price can serve as an anchor that changes how the middle price is perceived.'
    },
    {
      id: 'academic2-subscription-q3',
      stem: 'The word “prominence” in the passage is closest in meaning to',
      options: choices2(['A', 'visibility'], ['B', 'accuracy'], ['C', 'complexity'], ['D', 'availability']),
      answer: 'A', skill: 'vocabulary-in-context', difficulty: 0.2,
      explanation: 'Visual prominence refers to how noticeable or visible a plan is.'
    },
    {
      id: 'academic2-subscription-q4',
      stem: 'What can be inferred about experiments on subscription design?',
      options: choices2(
        ['A', 'They can identify influences without predicting every individual decision.'],
        ['B', 'They are useful only when every customer has the same budget.'],
        ['C', 'They show that feature differences never matter.'],
        ['D', 'They require companies to remove recommended plans.']
      ),
      answer: 'A', skill: 'inference', difficulty: 0.55,
      explanation: 'The passage says experiments reveal influences but do not show identical responses from all customers.'
    },
    {
      id: 'academic2-subscription-q5',
      stem: 'Why does the author mention previous experience and budget limits?',
      options: choices2(
        ['A', 'To identify factors that can change the strength of a framing effect'],
        ['B', 'To argue that anchoring occurs only among experienced customers'],
        ['C', 'To explain how companies set annual prices'],
        ['D', 'To show why laboratory studies are impossible']
      ),
      answer: 'A', skill: 'rhetorical-purpose', difficulty: 0.6,
      explanation: 'The examples support the point that choice design is only one influence on behavior.'
    }
  ]
};

const lower2Daily = [
  {
    id: 'daily2-lower-cafe-menu',
    type: 'menu',
    title: 'Library Café Lunch Menu',
    label: 'Served 11:30 a.m.–2:30 p.m.',
    text: `SOUP + BREAD ........ $6\nVegetable soup; ask about the soup of the day.\n\nGARDEN WRAP ........ $8\nRoasted vegetables, spinach, and lemon sauce.\n\nCHICKEN RICE BOWL ... $9\nIncludes cucumber salad.\n\nAdd fruit to any meal for $2. Hot drinks are $1 off when purchased with food. The kitchen stops taking hot-food orders at 2:15 p.m. Gluten-free bread is available for the soup, but customers should request it when ordering.`,
    scored: true,
    questions: [
      {
        id: 'daily2-menu-q1',
        stem: 'Which meal includes a salad in its listed price?',
        options: choices2(['A', 'Soup and Bread'], ['B', 'Garden Wrap'], ['C', 'Chicken Rice Bowl'], ['D', 'Fruit']),
        answer: 'C', skill: 'scan-detail', difficulty: -0.85,
        explanation: 'The chicken rice bowl includes cucumber salad.'
      },
      {
        id: 'daily2-menu-q2',
        stem: 'What should a customer do to receive gluten-free bread?',
        options: choices2(
          ['A', 'Order before 11:30 a.m.'],
          ['B', 'Request it while ordering'],
          ['C', 'Add fruit to the meal'],
          ['D', 'Purchase a hot drink']
        ),
        answer: 'B', skill: 'apply-information', difficulty: -0.6,
        explanation: 'The menu asks customers to request gluten-free bread when they order.'
      }
    ]
  },
  {
    id: 'daily2-lower-health-form',
    type: 'form',
    title: 'Recreation Center Activity Form',
    label: 'Complete before your first class',
    text: `Participant name: __________\nEmergency contact and phone: __________\nActivity: __________\n\nCheck one:\n□ I have no condition that limits ordinary exercise.\n□ I have discussed participation with a health professional.\n\nList any allergy the instructor should know about: __________\n\nSign and date the form. Participants under eighteen must also obtain a parent or guardian signature. Return the form to the front desk, not directly to the instructor. Forms sent by email are accepted only as PDF files; photographs of forms cannot be processed.`,
    scored: true,
    questions: [
      {
        id: 'daily2-form-q1',
        stem: 'Who needs an additional signature?',
        options: choices2(
          ['A', 'Anyone with an allergy'],
          ['B', 'Anyone sending the form by email'],
          ['C', 'A participant younger than eighteen'],
          ['D', 'A participant in an ordinary exercise class']
        ),
        answer: 'C', skill: 'explicit-detail', difficulty: -0.8,
        explanation: 'Participants under eighteen need a parent or guardian signature.'
      },
      {
        id: 'daily2-form-q2',
        stem: 'Where should a paper form be returned?',
        options: choices2(['A', 'To the front desk'], ['B', 'To the instructor'], ['C', 'To a health professional'], ['D', 'To the emergency contact']),
        answer: 'A', skill: 'scan-detail', difficulty: -0.95,
        explanation: 'The form must be returned to the front desk.'
      },
      {
        id: 'daily2-form-q3',
        stem: 'Which emailed document can be processed?',
        options: choices2(
          ['A', 'A photograph of the signed form'],
          ['B', 'A PDF copy of the form'],
          ['C', 'A message listing only allergies'],
          ['D', 'A note from the instructor']
        ),
        answer: 'B', skill: 'apply-information', difficulty: -0.5,
        explanation: 'Emailed forms are accepted only in PDF format.'
      }
    ]
  }
];

const upper2Academic = {
  id: 'academic2-upper-mural-pigments',
  title: 'Why Mural Pigments Change',
  domain: 'Art and physical science',
  scored: true,
  text: `The colors visible in an old wall painting may differ substantially from those chosen by the original artist. This change is not always caused by simple fading. A pigment can react chemically with moisture, air pollution, or materials in the wall itself. For example, a bright compound may be transformed into a darker substance even when little paint has been physically lost. The binder that holds pigment particles together can also yellow, altering the appearance of every color above it.\n\nConservators therefore begin by identifying materials rather than immediately adding new paint. They may examine tiny samples under a microscope or use light that reveals compounds invisible to the human eye. Historical records are useful, but artists sometimes used local mixtures that were never documented.\n\nAny treatment must account for future change as well as present appearance. Removing a discolored surface layer might reveal a brighter color, yet the process could also weaken fragile paint. Similarly, applying a protective coating can slow contact with moisture but may make later treatment more difficult. Conservation decisions are consequently based on a balance of evidence, risk, and reversibility. The goal is not necessarily to make a mural look new; it is to preserve as much reliable information as possible while keeping the work stable.`,
  questions: [
    {
      id: 'academic2-pigment-q1',
      stem: 'What is the main purpose of the passage?',
      options: choices2(
        ['A', 'To explain why mural colors change and how conservators respond'],
        ['B', 'To identify the first artists who used wall paintings'],
        ['C', 'To compare murals with modern digital photographs'],
        ['D', 'To argue that every old mural should be repainted']
      ),
      answer: 'A', skill: 'main-idea', difficulty: 0.35,
      explanation: 'The passage discusses chemical and material changes, investigation methods, and treatment decisions.'
    },
    {
      id: 'academic2-pigment-q2',
      stem: 'According to paragraph 1, how can a binder affect a mural?',
      options: choices2(
        ['A', 'It can make all overlying colors appear different.'],
        ['B', 'It can document the artist’s original mixture.'],
        ['C', 'It can prevent every chemical reaction.'],
        ['D', 'It can replace pigment that has been lost.']
      ),
      answer: 'A', skill: 'factual-information', difficulty: 0.05,
      explanation: 'A yellowing binder changes the appearance of the colors above it.'
    },
    {
      id: 'academic2-pigment-q3',
      stem: 'The word “substantially” in the passage is closest in meaning to',
      options: choices2(['A', 'considerably'], ['B', 'temporarily'], ['C', 'accurately'], ['D', 'unexpectedly']),
      answer: 'A', skill: 'vocabulary-in-context', difficulty: 0.2,
      explanation: 'Substantially means to a considerable or significant degree.'
    },
    {
      id: 'academic2-pigment-q4',
      stem: 'What can be inferred about historical records of mural materials?',
      options: choices2(
        ['A', 'They are useful but may not describe every mixture an artist used.'],
        ['B', 'They are more reliable than physical examination in every case.'],
        ['C', 'They usually explain how to reverse a treatment.'],
        ['D', 'They show that local pigments never changed color.']
      ),
      answer: 'A', skill: 'inference', difficulty: 0.65,
      explanation: 'Local mixtures were sometimes undocumented, so records can be incomplete.'
    },
    {
      id: 'academic2-pigment-q5',
      stem: 'Why does the author discuss protective coatings?',
      options: choices2(
        ['A', 'To illustrate a treatment that has both benefits and possible costs'],
        ['B', 'To show that moisture is the only threat to murals'],
        ['C', 'To recommend one coating for every painting'],
        ['D', 'To explain how artists originally mixed pigments']
      ),
      answer: 'A', skill: 'rhetorical-purpose', difficulty: 0.75,
      explanation: 'A coating can reduce moisture exposure but complicate future treatment, illustrating the need to balance risks.'
    }
  ]
};

export const READING_FORM_02 = {
  id: 'reading-form-02',
  title: 'Reading Practice Form 2',
  version: '2026.09-content-intelligence',
  provenance: { kind: 'original', authoring: 'human-authored and validator-reviewed', sourcePolicy: 'no operational, leaked, or recalled items' },
  router: {
    seconds: 1260,
    ctw: [
      { setId: 'ctw-sleep-memory', scored: true, difficulty: [-0.75,-0.6,-0.45,-0.3,-0.15,0,0.15,0.25,0.4,0.55] },
      { setId: 'ctw-thermal-mass', scored: false, difficulty: [-0.45,-0.3,-0.15,0,0.15,0.3,0.45,0.6,0.75,0.9] }
    ],
    daily: [...router2DailyScored, ...router2DailyResearch],
    academic: router2Academic
  },
  lower: {
    seconds: 540,
    ctw: [{ setId: 'ctw-urban-heat', scored: true, difficulty: [-1.1,-0.95,-0.8,-0.65,-0.5,-0.35,-0.2,-0.1,0,0.15] }],
    daily: lower2Daily
  },
  upper: {
    seconds: 540,
    ctw: [{ setId: 'ctw-archaeological-pollen', scored: true, difficulty: [0.15,0.25,0.4,0.5,0.65,0.75,0.9,1.0,1.15,1.3] }],
    academic: upper2Academic
  }
};
