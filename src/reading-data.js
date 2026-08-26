import { READING_FORM_02 } from './reading-form-02.js';

/**
 * Original, non-operational practice form modeled on the public 2026 TOEFL
 * Reading blueprint. The router contains 35 presented items (20 scored + 15
 * research items); Module 2 contains 15 scored items. Research flags are hidden
 * from the test runner and are exposed only after the section is completed.
 */

const choices = (...entries) => entries.map(([id, text]) => ({ id, text }));

const routerDailyScored = [
  {
    id: 'daily-router-bike-repair',
    type: 'notice',
    title: 'Campus Bicycle Repair Day',
    label: 'Student Services Notice',
    text: `Free bicycle safety checks will be offered behind the Recreation Center on Thursday from 11:00 a.m. to 3:00 p.m. Mechanics can adjust brakes, tighten loose parts, and explain basic maintenance. They cannot replace damaged tires or complete major repairs. Students should bring their campus identification and arrive at least twenty minutes before the service closes. No appointment is needed, but assistance will be provided in the order that students arrive.`,
    scored: true,
    questions: [
      {
        id: 'daily-bike-q1',
        stem: 'Why should students arrive before 2:40 p.m.?',
        options: choices(
          ['A', 'To have enough time to receive service before closing'],
          ['B', 'To register for a maintenance class'],
          ['C', 'To purchase replacement tires'],
          ['D', 'To meet the recreation staff']
        ),
        answer: 'A', skill: 'scan-detail', difficulty: -0.65,
        explanation: 'The notice asks students to arrive at least twenty minutes before the 3:00 p.m. closing time.'
      },
      {
        id: 'daily-bike-q2',
        stem: 'Which problem can the mechanics address?',
        options: choices(
          ['A', 'A tire that must be replaced'],
          ['B', 'A bicycle with loose parts'],
          ['C', 'A frame that requires major repair'],
          ['D', 'A missing campus identification card']
        ),
        answer: 'B', skill: 'explicit-detail', difficulty: -0.9,
        explanation: 'The mechanics can tighten loose parts, but they cannot replace tires or complete major repairs.'
      }
    ]
  },
  {
    id: 'daily-router-library-email',
    type: 'email',
    title: 'Change to a Library Workshop',
    label: 'From: Research Help Desk',
    text: `You registered for Friday's workshop, “Finding Reliable Historical Sources.” Because the instructor will be attending a conference, the workshop has been moved to Monday at 4:30 p.m. in Library Room 204. Your registration will automatically transfer to the new session. If you cannot attend, cancel through the registration page by Sunday evening so that another student can take your place. A shorter online recording will be posted next week, but it will not include the individual search exercise used in the live workshop.`,
    scored: true,
    questions: [
      {
        id: 'daily-library-q1',
        stem: 'What will happen to a student’s existing registration?',
        options: choices(
          ['A', 'It will be canceled immediately.'],
          ['B', 'It will be moved to the Monday session.'],
          ['C', 'It will be changed to an online recording.'],
          ['D', 'It will be placed on a waiting list.']
        ),
        answer: 'B', skill: 'explicit-detail', difficulty: -0.7,
        explanation: 'The email says registration will automatically transfer to the new session.'
      },
      {
        id: 'daily-library-q2',
        stem: 'Why are students asked to cancel by Sunday evening?',
        options: choices(
          ['A', 'So the instructor can prepare a different exercise'],
          ['B', 'So another student can use the available place'],
          ['C', 'So the recording can be posted earlier'],
          ['D', 'So the workshop can return to Friday']
        ),
        answer: 'B', skill: 'purpose', difficulty: -0.15,
        explanation: 'Canceling releases the place for another student.'
      },
      {
        id: 'daily-library-q3',
        stem: 'What can be inferred about the online recording?',
        options: choices(
          ['A', 'It will provide less practice than the live workshop.'],
          ['B', 'It will be available before the Monday workshop.'],
          ['C', 'It requires a separate fee.'],
          ['D', 'It will be taught by a different instructor.']
        ),
        answer: 'A', skill: 'inference', difficulty: 0.35,
        explanation: 'The recording is shorter and omits the individual search exercise, so it provides less practice.'
      }
    ]
  }
];

const routerDailyResearch = [
  {
    id: 'daily-router-museum-flyer',
    type: 'flyer',
    title: 'Evening at the City Museum',
    label: 'Friday Program',
    text: `The museum will remain open until 9:00 p.m. this Friday. Admission after 5:00 p.m. is half price. At 6:15, a curator will give a twenty-minute introduction to the new photography exhibit in Gallery 3. Visitors who want to join the 7:00 behind-the-scenes tour must reserve a place online; the tour is limited to twelve people and is not included with general admission. The museum café will close at its usual time of 6:30.`,
    scored: false,
    questions: [
      {
        id: 'daily-museum-q1', stem: 'Which activity requires an online reservation?',
        options: choices(['A','Entering after 5:00 p.m.'],['B','The curator’s introduction'],['C','The behind-the-scenes tour'],['D','Visiting the museum café']),
        answer: 'C', skill: 'scan-detail', difficulty: -0.55,
        explanation: 'Only the 7:00 behind-the-scenes tour requires an online reservation.'
      },
      {
        id: 'daily-museum-q2', stem: 'What should a visitor do to buy food at the museum?',
        options: choices(['A','Arrive before 6:30 p.m.'],['B','Pay the full admission price'],['C','Go to Gallery 3'],['D','Join the 7:00 tour']),
        answer: 'A', skill: 'apply-information', difficulty: -0.1,
        explanation: 'The café closes at 6:30 even though the museum remains open later.'
      }
    ]
  },
  {
    id: 'daily-router-job-messages',
    type: 'messages',
    title: 'Campus Job Messages',
    label: 'Conversation',
    text: `Maya: I just saw the message about tomorrow's bookstore shift. The delivery is arriving early, so they want us there at 7:30 instead of 9:00.\nEvan: I have a chemistry lab until 8:15. Did the manager say everyone has to come early?\nMaya: No. People who cannot change their schedule should reply tonight. She will assign them to the afternoon inventory count instead.\nEvan: That works for me. Do I need to find someone to trade with?\nMaya: I don't think so. Just explain your lab schedule in the reply.`,
    scored: false,
    questions: [
      {
        id: 'daily-job-q1', stem: 'Why was the morning shift changed?',
        options: choices(['A','A delivery will arrive earlier than expected.'],['B','The bookstore will close in the afternoon.'],['C','The manager scheduled a chemistry lab.'],['D','Too few employees signed up.']),
        answer: 'A', skill: 'main-purpose', difficulty: -0.65,
        explanation: 'Maya says the delivery is arriving early.'
      },
      {
        id: 'daily-job-q2', stem: 'What will Evan most likely do?',
        options: choices(['A','Skip his chemistry lab'],['B','Ask Maya to work his shift'],['C','Reply and request the afternoon inventory count'],['D','Arrive at the bookstore at 7:30']),
        answer: 'C', skill: 'inference', difficulty: 0.05,
        explanation: 'He cannot attend early and says the afternoon alternative works for him.'
      },
      {
        id: 'daily-job-q3', stem: 'What does Maya imply about trading shifts?',
        options: choices(['A','The manager has forbidden it.'],['B','It is probably unnecessary in this situation.'],['C','It must be completed before the delivery.'],['D','Evan should trade with an afternoon worker.']),
        answer: 'B', skill: 'speaker-intent', difficulty: 0.45,
        explanation: 'Maya says “I don’t think so” and tells Evan simply to explain his schedule.'
      }
    ]
  }
];

const lowerDaily = [
  {
    id: 'daily-lower-community-center', type: 'schedule', title: 'Community Learning Center', label: 'Saturday Schedule',
    text: `9:00–10:00  Beginner Computer Skills — Room 1\n10:15–11:45  Résumé Writing — Room 3\n12:00–1:00  Center Closed for Lunch\n1:15–2:15  Conversation Club — Garden Room\n2:30–4:00  Tax Form Help — Room 2\n\nAll programs are free. Registration is required only for Tax Form Help because volunteers meet with visitors individually. Children under twelve must remain with an adult.`,
    scored: true,
    questions: [
      { id:'daily-center-q1', stem:'Which program requires registration?', options:choices(['A','Beginner Computer Skills'],['B','Résumé Writing'],['C','Conversation Club'],['D','Tax Form Help']), answer:'D', skill:'scan-detail', difficulty:-0.85, explanation:'The schedule says registration is required only for Tax Form Help.' },
      { id:'daily-center-q2', stem:'When is the center unavailable for programs?', options:choices(['A','Before 9:00'],['B','From 12:00 to 1:00'],['C','From 1:15 to 2:15'],['D','After 2:30']), answer:'B', skill:'scan-detail', difficulty:-0.95, explanation:'The center is closed for lunch from noon to 1:00.' }
    ]
  },
  {
    id:'daily-lower-lost-item', type:'email', title:'Lost Item Follow-up', label:'From: Transit Office',
    text:`We found a blue backpack that matches the description in your report. It was left on Bus 18 on Tuesday evening. Please visit the Transit Office in the West Station before Friday at 5:00 p.m. Bring a photo identification card and be prepared to describe one item inside the bag. If you cannot come by Friday, call us so we can keep the backpack for an additional week. Otherwise, unclaimed items are moved to the city property center on Monday.`,
    scored:true,
    questions:[
      { id:'daily-lost-q1', stem:'What must the student bring to the Transit Office?', options:choices(['A','A bus ticket'],['B','A photo identification card'],['C','The original report'],['D','A city property form']), answer:'B', skill:'explicit-detail', difficulty:-0.9, explanation:'The email explicitly asks for photo identification.' },
      { id:'daily-lost-q2', stem:'Why must the student describe an item inside the backpack?', options:choices(['A','To show that the backpack belongs to the student'],['B','To help the office repair the backpack'],['C','To update the bus driver’s report'],['D','To transfer the bag to the property center']), answer:'A', skill:'purpose', difficulty:-0.25, explanation:'Describing an inside item helps confirm ownership.' },
      { id:'daily-lost-q3', stem:'What should the student do if unable to visit by Friday?', options:choices(['A','Go directly to Bus 18'],['B','Submit a second online report'],['C','Call and ask the office to hold the backpack longer'],['D','Wait until the following Monday']), answer:'C', skill:'apply-information', difficulty:-0.45, explanation:'Calling lets the office keep the backpack for an additional week.' }
    ]
  }
];

const routerAcademic = {
  id: 'academic-router-urban-streams',
  title: 'Restoring Urban Streams',
  domain: 'Environmental science',
  scored: true,
  text: `For much of the twentieth century, many cities treated small streams mainly as drainage channels. Engineers straightened them, covered them with concrete, or placed them underground so rainwater could leave developed areas quickly. These changes reduced local flooding in some places, but they also removed habitat and caused water to travel downstream with greater force. As a result, communities located farther along the watershed sometimes experienced more erosion and sudden flooding.\n\nRecent restoration projects take a different approach. Instead of forcing water through a narrow channel, planners may reconnect a stream to parts of its former floodplain. During heavy rain, water can spread temporarily across planted areas, slowing its movement and allowing some of it to enter the soil. Designers also add rocks, bends, and native vegetation to create varied conditions for fish and insects. Restoration does not mean returning a stream to an untouched historical state; roads and buildings often make that impossible. Rather, the goal is to recover selected ecological functions while still protecting nearby property. Because each watershed has different constraints, successful projects require long-term monitoring rather than a single standard design.`,
  questions: [
    { id:'academic-stream-q1', stem:'What is the passage mainly about?', options:choices(['A','Why cities originally built roads beside streams'],['B','How approaches to managing urban streams have changed'],['C','Why native fish cannot survive in cities'],['D','How underground drainage systems are constructed']), answer:'B', skill:'main-idea', difficulty:-0.1, explanation:'The passage contrasts older drainage-focused modifications with newer restoration approaches.' },
    { id:'academic-stream-q2', stem:'According to paragraph 1, one possible effect of straightening streams is', options:choices(['A','slower water movement near cities'],['B','more habitat for insects'],['C','greater erosion downstream'],['D','less rainfall entering the watershed']), answer:'C', skill:'factual-information', difficulty:-0.35, explanation:'Faster downstream movement can increase erosion and sudden flooding.' },
    { id:'academic-stream-q3', stem:'The word “constraints” in the passage is closest in meaning to', options:choices(['A','limitations'],['B','measurements'],['C','advantages'],['D','materials']), answer:'A', skill:'vocabulary-in-context', difficulty:0.05, explanation:'Constraints are conditions that limit what can be done.' },
    { id:'academic-stream-q4', stem:'Why does the author mention roads and buildings?', options:choices(['A','To explain why a complete return to historical conditions may be impossible'],['B','To argue that cities should remove all structures near water'],['C','To identify the main sources of native vegetation'],['D','To show where engineers first developed concrete channels']), answer:'A', skill:'rhetorical-purpose', difficulty:0.4, explanation:'The examples support the point that restoration must work within modern physical limits.' },
    { id:'academic-stream-q5', stem:'What can be inferred about successful restoration projects?', options:choices(['A','They always eliminate downstream flooding.'],['B','They use exactly the same design in every watershed.'],['C','Their effectiveness must be evaluated over time.'],['D','They focus only on protecting fish populations.']), answer:'C', skill:'inference', difficulty:0.55, explanation:'The passage says different constraints require long-term monitoring rather than one standard design.' }
  ]
};

const upperAcademic = {
  id: 'academic-upper-tool-use',
  title: 'Cumulative Tool Traditions',
  domain: 'Anthropology / cognition',
  scored: true,
  text: `Many animals use tools, but human tool traditions are unusual in the degree to which improvements accumulate across generations. A person may learn an existing technique, make a small modification, and pass the revised method to others. Over time, the final tool can become too complex for any one individual to invent independently. Researchers often describe this process as cumulative culture.\n\nFor accumulation to occur, useful changes must survive transmission. Accurate imitation can help, but copying every movement is not always necessary. Learners may instead understand the result that a technique is intended to produce and discover their own way to achieve it. This distinction matters because different environments reward different learning strategies. When materials are predictable and errors are costly, close copying may be advantageous. When conditions vary, understanding the goal may allow a learner to adapt more effectively.\n\nExperiments that compare these strategies usually simplify the social world. Participants might observe a model briefly, receive only the finished object, or work in chains where each person learns from the previous participant. Such designs reveal how information changes as it moves through a group, but they cannot reproduce all the motivations and relationships present in real communities. Consequently, researchers combine experiments with field observations before drawing broad conclusions about how cumulative traditions develop.`,
  questions:[
    { id:'academic-tools-q1', stem:'What is the main purpose of the passage?', options:choices(['A','To explain how tool traditions can accumulate and how researchers study the process'],['B','To prove that animals never copy human behavior'],['C','To compare the materials used in ancient and modern tools'],['D','To argue that imitation is the only reliable learning strategy']), answer:'A', skill:'main-idea', difficulty:0.35, explanation:'The passage defines cumulative culture, discusses transmission strategies, and evaluates research methods.' },
    { id:'academic-tools-q2', stem:'According to paragraph 1, a cumulative tool tradition may produce a tool that', options:choices(['A','cannot be used outside a laboratory'],['B','is simpler than the earliest version'],['C','no single person would likely invent alone'],['D','is copied only by closely related individuals']), answer:'C', skill:'factual-information', difficulty:0.05, explanation:'Accumulated modifications can create complexity beyond individual invention.' },
    { id:'academic-tools-q3', stem:'The word “advantageous” in the passage is closest in meaning to', options:choices(['A','beneficial'],['B','unusual'],['C','temporary'],['D','observable']), answer:'A', skill:'vocabulary-in-context', difficulty:0.15, explanation:'In predictable settings with costly errors, close copying may be beneficial.' },
    { id:'academic-tools-q4', stem:'What does paragraph 2 suggest about understanding a technique’s goal?', options:choices(['A','It prevents learners from changing a technique.'],['B','It can support adaptation when conditions differ.'],['C','It is useful only when materials are predictable.'],['D','It requires copying every movement accurately.']), answer:'B', skill:'inference', difficulty:0.65, explanation:'Goal understanding can help learners adapt their actions when conditions vary.' },
    { id:'academic-tools-q5', stem:'Why does the author discuss limitations of experiments?', options:choices(['A','To explain why researchers also use field observations'],['B','To show that experimental participants refuse to use tools'],['C','To argue that information never changes in groups'],['D','To identify the oldest cumulative tradition']), answer:'A', skill:'rhetorical-purpose', difficulty:0.85, explanation:'Simplified experiments omit real social factors, so researchers combine them with field observations.' }
  ]
};

export const READING_FORMS = [
  {
    id: 'reading-form-01',
    title: 'Reading Practice Form 1',
    version: '2026.08',
    router: {
      seconds: 1260,
      ctw: [
        { setId: 'ctw-community-gardens', scored: true, difficulty: [-0.8,-0.6,-0.5,-0.35,-0.2,-0.1,0.05,0.15,0.3,0.45] },
        { setId: 'ctw-pollination-networks', scored: false, difficulty: [-0.5,-0.35,-0.25,-0.1,0.05,0.15,0.3,0.4,0.55,0.7] }
      ],
      daily: [...routerDailyScored, ...routerDailyResearch],
      academic: routerAcademic
    },
    lower: {
      seconds: 540,
      ctw: [{ setId: 'ctw-repair-cafes', scored: true, difficulty: [-1.15,-1.0,-0.9,-0.8,-0.65,-0.55,-0.4,-0.3,-0.15,0] }],
      daily: lowerDaily
    },
    upper: {
      seconds: 540,
      ctw: [{ setId: 'ctw-maps-arguments', scored: true, difficulty: [0.1,0.2,0.35,0.45,0.55,0.7,0.8,0.95,1.05,1.2] }],
      academic: upperAcademic
    }
  },
  READING_FORM_02
];
