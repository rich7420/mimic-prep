/**
 * Original focused-practice bank. These stimuli are not copied or closely
 * paraphrased from ETS practice material. They extend format/skill coverage
 * without being inserted into a formal mock form before pilot review.
 */

const provenance = {
  kind: 'original',
  authoringVersion: '6.0.0',
  operationalItem: false,
  leaked: false,
  recalled: false
};

const focusedChoices = (...entries) => entries.map(([id, text]) => ({ id, text }));

export const SUPPLEMENTAL_DAILY_BANK = [
  {
    id: 'focused-daily-music-room-sign',
    type: 'sign',
    title: 'Music Practice Rooms',
    label: 'Posted outside Rooms B12–B16',
    text: `Practice rooms are for currently enrolled students only. Maximum use: 45 minutes when others are waiting. Food and uncovered drinks are not permitted. Before leaving, return the music stand to the wall and switch off all electronic equipment. Report damaged equipment at the front desk. Rooms B15 and B16 contain pianos and may be reserved online; the other rooms are available on a first-come, first-served basis.`,
    register: 'neutral',
    informationStructure: 'telegraphic',
    provenance,
    questions: [
      {
        id: 'focused-music-sign-q1',
        stem: 'What does “first-come, first-served” mean in the sign?',
        options: focusedChoices(
          ['A', 'Students use the unreserved rooms in the order they arrive.'],
          ['B', 'First-year students receive priority.'],
          ['C', 'The front desk assigns every available room.'],
          ['D', 'Students must reserve all rooms before arriving.']
        ),
        answer: 'A',
        skill: 'idiom',
        explanation: 'The phrase means that access is given according to arrival order.'
      },
      {
        id: 'focused-music-sign-q2',
        stem: 'A student wants to practice piano at a specific time. What should the student do?',
        options: focusedChoices(
          ['A', 'Bring a covered drink.'],
          ['B', 'Reserve Room B15 or B16 online.'],
          ['C', 'Ask another student to hold a room.'],
          ['D', 'Report to the front desk after practicing.']
        ),
        answer: 'B',
        skill: 'apply-information',
        explanation: 'The two piano rooms may be reserved online, which is useful when a specific time is needed.'
      }
    ]
  },
  {
    id: 'focused-daily-tool-library-post',
    type: 'social-post',
    title: 'Neighborhood Tool Library Update',
    label: '@RiversideToolShare · Community post',
    text: `Big news: our borrowing hours are expanding! Starting next week, members can drop by Tuesday and Thursday evenings from 5:30 to 8:00, as well as Saturday mornings. We are also adding sewing machines and small garden tools. New to the tool library? No worries—volunteers can show you the ropes before you borrow anything. Please remember that popular items disappear quickly in spring, so reserve those online rather than counting on finding one at the last minute.`,
    register: 'informal',
    informationStructure: 'linear',
    provenance,
    questions: [
      {
        id: 'focused-tool-post-q1',
        stem: 'What is the main purpose of the post?',
        options: focusedChoices(
          ['A', 'To announce new hours and equipment'],
          ['B', 'To recruit professional repair workers'],
          ['C', 'To explain why membership fees increased'],
          ['D', 'To cancel Saturday borrowing hours']
        ),
        answer: 'A',
        skill: 'purpose',
        explanation: 'The post announces expanded hours and newly available tools.'
      },
      {
        id: 'focused-tool-post-q2',
        stem: 'What does “show you the ropes” most nearly mean?',
        options: focusedChoices(
          ['A', 'Teach you how the service works'],
          ['B', 'Give you free gardening supplies'],
          ['C', 'Help you carry heavy equipment'],
          ['D', 'Ask you to repair damaged tools']
        ),
        answer: 'A',
        skill: 'informal-language',
        explanation: 'In this context, the informal expression means to teach a newcomer the basic procedures.'
      },
      {
        id: 'focused-tool-post-q3',
        stem: 'What can be inferred about some tools in spring?',
        options: focusedChoices(
          ['A', 'They are often unavailable without a reservation.'],
          ['B', 'They can be borrowed for a longer period.'],
          ['C', 'They are moved to another location.'],
          ['D', 'They may be used only by volunteers.']
        ),
        answer: 'A',
        skill: 'inference',
        explanation: 'The warning that popular items disappear quickly implies that walk-in availability is limited.'
      }
    ]
  },
  {
    id: 'focused-daily-transit-ad',
    type: 'advertisement',
    title: 'Weekend Explorer Transit Pass',
    label: 'City Transit Advertisement',
    text: `Ride buses, streetcars, and the harbor ferry all weekend for one price. The Weekend Explorer Pass costs $14 and is valid from 6:00 a.m. Saturday through the final scheduled service on Sunday. Buy the pass in the transit app or at station ticket machines. The airport express and privately operated sightseeing buses are not included. Children under six ride free with a pass-holding adult.`,
    register: 'neutral',
    informationStructure: 'mixed',
    provenance,
    questions: [
      {
        id: 'focused-transit-ad-q1',
        stem: 'Which trip is covered by the pass?',
        options: focusedChoices(
          ['A', 'A Sunday ride on the harbor ferry'],
          ['B', 'A Saturday airport express trip'],
          ['C', 'A private sightseeing bus tour'],
          ['D', 'A Friday evening streetcar ride']
        ),
        answer: 'A',
        skill: 'scan',
        explanation: 'The harbor ferry is included, and the pass is valid on Sunday.'
      },
      {
        id: 'focused-transit-ad-q2',
        stem: 'Why does the advertisement mention children under six?',
        options: focusedChoices(
          ['A', 'To explain an additional fare benefit'],
          ['B', 'To identify who may buy the pass'],
          ['C', 'To describe a weekend activity'],
          ['D', 'To warn riders about crowded vehicles']
        ),
        answer: 'A',
        skill: 'purpose',
        explanation: 'The information tells families that young children may travel without an additional fare.'
      }
    ]
  },
  {
    id: 'focused-daily-owl-news',
    type: 'news-article',
    title: 'Park Path Temporarily Rerouted Near Owl Nest',
    label: 'Westside Community News · May 8',
    text: `A short section of the Riverside Park walking path will be rerouted for approximately six weeks after a pair of owls began nesting in a tree beside the path. Park staff installed signs on Wednesday and created a marked detour that adds about three minutes to the usual walk. The rest of the park remains open. Wildlife specialists say the temporary distance reduces disturbance while the adult birds care for their young. Staff will inspect the site weekly and remove the detour after the young owls have left the nest.`,
    register: 'neutral',
    informationStructure: 'linear',
    provenance,
    questions: [
      {
        id: 'focused-owl-news-q1',
        stem: 'Which statement best summarizes the article?',
        options: focusedChoices(
          ['A', 'A park path has been temporarily changed to protect nesting owls.'],
          ['B', 'A city park is closing while staff repair a damaged path.'],
          ['C', 'Wildlife specialists are moving owls to a safer tree.'],
          ['D', 'A new walking path will permanently replace an older one.']
        ),
        answer: 'A',
        skill: 'skim',
        explanation: 'The central point is the temporary rerouting made to reduce disturbance to the nesting birds.'
      },
      {
        id: 'focused-owl-news-q2',
        stem: 'How much longer will the marked route take?',
        options: focusedChoices(
          ['A', 'About three minutes'],
          ['B', 'About six minutes'],
          ['C', 'About one week'],
          ['D', 'About six weeks']
        ),
        answer: 'A',
        skill: 'scan',
        explanation: 'The article states that the detour adds about three minutes.'
      },
      {
        id: 'focused-owl-news-q3',
        stem: 'What will determine when the original path reopens?',
        options: focusedChoices(
          ['A', 'Whether the young owls have left the nest'],
          ['B', 'Whether more signs can be installed'],
          ['C', 'Whether the marked detour becomes crowded'],
          ['D', 'Whether the adult owls move to another park']
        ),
        answer: 'A',
        skill: 'inference',
        explanation: 'The detour will be removed after the young birds leave, so their development determines the reopening date.'
      }
    ]
  },
  {
    id: 'focused-daily-camera-receipt',
    type: 'receipt',
    title: 'Media Center Equipment Receipt',
    label: 'Borrower Copy',
    text: `MEDIA CENTER LOAN\nStudent: R. Chen\nPickup: April 14, 3:20 p.m.\nDue: April 16, 5:00 p.m.\nItems: Digital camera ×1; Tripod ×1; Memory card ×2\nDeposit held: $40.00\nLate fee: $5.00 per item per day\nReturn location: Media Center Desk, Building C\nNote: Memory cards must be erased before return.`,
    register: 'telegraphic',
    informationStructure: 'nonlinear',
    provenance,
    questions: [
      {
        id: 'focused-camera-receipt-q1',
        stem: 'How many physical items are listed on the receipt?',
        options: focusedChoices(
          ['A', 'Two'],
          ['B', 'Three'],
          ['C', 'Four'],
          ['D', 'Five']
        ),
        answer: 'C',
        skill: 'nonlinear-information',
        explanation: 'The loan includes one camera, one tripod, and two memory cards, for four items total.'
      },
      {
        id: 'focused-camera-receipt-q2',
        stem: 'What must the borrower do before returning the equipment?',
        options: focusedChoices(
          ['A', 'Remove the files from the memory cards.'],
          ['B', 'Pay the deposit again.'],
          ['C', 'Return the camera to Building A.'],
          ['D', 'Purchase a replacement memory card.']
        ),
        answer: 'A',
        skill: 'apply-information',
        explanation: 'The note says that the memory cards must be erased before return.'
      }
    ]
  }
];

export const SUPPLEMENTAL_ACADEMIC_BANK = [
  {
    id: 'focused-academic-roadside-inns',
    type: 'academic',
    title: 'Roadside Inns and Historical Travel',
    domain: 'History',
    provenance,
    text: `Before railroads made long-distance travel faster, roadside inns formed an important part of transportation networks. They offered food, shelter, and fresh animals to travelers moving by foot, horse, or carriage. Yet historians value inns for more than the services they provided. Surviving account books sometimes record where guests came from, what they purchased, and how long they stayed. Such records can reveal patterns of movement that are difficult to reconstruct from official maps alone.\n\nThe location of an inn also influenced the community around it. Craftspeople might settle nearby to repair wheels, make harnesses, or supply food. In some regions, regular stopping places gradually developed into small market centers. This does not mean that every inn created a town. A route could lose importance after a new bridge or road was built, causing a once-busy establishment to decline. For this reason, historians compare business records with archaeological evidence and changes in road construction. Together, these sources show how travel facilities both responded to existing routes and sometimes encouraged new local activity.`,
    questions: [
      {
        id: 'focused-inns-q1',
        stem: 'What is the passage mainly about?',
        options: focusedChoices(
          ['A', 'How roadside inns provide evidence about travel and local development'],
          ['B', 'Why railroads immediately caused all roadside inns to close'],
          ['C', 'How official maps were produced before modern transportation'],
          ['D', 'Why craftspeople preferred to travel by carriage']
        ),
        answer: 'A', skill: 'main-idea',
        explanation: 'The passage explains both the evidence inns provide and their relationship to surrounding communities.'
      },
      {
        id: 'focused-inns-q2',
        stem: 'What information might historians find in an inn’s account book?',
        options: focusedChoices(
          ['A', 'The origins and purchases of guests'],
          ['B', 'The design of future railroad stations'],
          ['C', 'The exact boundaries of every nearby town'],
          ['D', 'The weather on all regional roads']
        ),
        answer: 'A', skill: 'factual-information',
        explanation: 'The passage explicitly mentions guests’ origins, purchases, and length of stay.'
      },
      {
        id: 'focused-inns-q3',
        stem: 'The word “decline” in the passage is closest in meaning to',
        options: focusedChoices(
          ['A', 'become less active'],
          ['B', 'move farther away'],
          ['C', 'refuse a request'],
          ['D', 'change ownership']
        ),
        answer: 'A', skill: 'vocabulary-in-context',
        explanation: 'A route losing importance could make the inn less busy or active.'
      },
      {
        id: 'focused-inns-q4',
        stem: 'What can be inferred about an inn after a new road redirected travelers?',
        options: focusedChoices(
          ['A', 'Its business might become less active.'],
          ['B', 'Its account books would become official maps.'],
          ['C', 'It would necessarily develop into a market center.'],
          ['D', 'It would stop offering food to local craftspeople.']
        ),
        answer: 'A', skill: 'inference',
        explanation: 'The passage says a route could lose importance after a new road was built, causing a once-busy inn to decline.'
      },
      {
        id: 'focused-inns-q5',
        stem: 'How are the first and second paragraphs related?',
        options: focusedChoices(
          ['A', 'The first describes evidence from inns, and the second explains their wider local effects.'],
          ['B', 'The first criticizes account books, and the second replaces them with maps.'],
          ['C', 'The first discusses railroads, and the second gives instructions for building them.'],
          ['D', 'The first presents a theory, and the second proves that it is always correct.']
        ),
        answer: 'A', skill: 'idea-relationships',
        explanation: 'The passage moves from records of travel to the relationship between inns and nearby communities.'
      }
    ]
  },
  {
    id: 'focused-academic-freeze-thaw',
    type: 'academic',
    title: 'How Repeated Freezing Breaks Rock',
    domain: 'Physical science / geology',
    provenance,
    text: `Rock may appear solid and permanent, but small cracks allow weather to change it gradually. In cold regions, water can enter these cracks during warmer parts of the day. If the temperature later falls below freezing, the water becomes ice. Because ice occupies more volume than liquid water, it can press against the sides of the crack. A single freezing event usually causes little visible damage. Repetition is what matters. As water freezes and thaws many times, the crack may slowly widen until a fragment separates from the larger rock.\n\nThis process, often called freeze-thaw weathering, depends on local conditions. Temperatures must cross the freezing point often enough for repeated cycles to occur, and water must be available to enter the rock. Extremely cold places are not always ideal, because water may remain frozen for long periods instead of repeatedly melting and freezing. The structure of the rock also matters: rocks with connected cracks allow water to move farther inside. Scientists therefore examine temperature records, moisture, and rock structure together when estimating where freeze-thaw weathering will be most effective.`,
    questions: [
      {
        id: 'focused-freeze-q1',
        stem: 'What is the main purpose of the passage?',
        options: focusedChoices(
          ['A', 'To explain how repeated freezing can break rock and what conditions affect the process'],
          ['B', 'To compare the temperatures of several extremely cold regions'],
          ['C', 'To show why all rock changes at the same rate'],
          ['D', 'To describe how scientists manufacture ice in laboratories']
        ),
        answer: 'A', skill: 'main-idea',
        explanation: 'The passage explains the mechanism and then the environmental conditions that influence it.'
      },
      {
        id: 'focused-freeze-q2',
        stem: 'Why can ice put pressure on a crack?',
        options: focusedChoices(
          ['A', 'It occupies more volume than liquid water.'],
          ['B', 'It makes the rock chemically softer.'],
          ['C', 'It removes all moisture from the rock.'],
          ['D', 'It raises the temperature inside the crack.']
        ),
        answer: 'A', skill: 'factual-information',
        explanation: 'The passage states that ice takes up more space than liquid water.'
      },
      {
        id: 'focused-freeze-q3',
        stem: 'The word “fragment” in the passage is closest in meaning to',
        options: focusedChoices(
          ['A', 'a broken piece'],
          ['B', 'a hidden liquid'],
          ['C', 'a temperature record'],
          ['D', 'a connected crack']
        ),
        answer: 'A', skill: 'vocabulary-in-context',
        explanation: 'The fragment is a piece that separates from the larger rock.'
      },
      {
        id: 'focused-freeze-q4',
        stem: 'Why might an extremely cold place have limited freeze-thaw weathering?',
        options: focusedChoices(
          ['A', 'Water may not melt often enough to create repeated cycles.'],
          ['B', 'All rocks there contain no cracks.'],
          ['C', 'Ice occupies less space at very low temperatures.'],
          ['D', 'Temperature records cannot be collected there.']
        ),
        answer: 'A', skill: 'inference',
        explanation: 'If water remains frozen, the repeated melting and freezing needed for the process occurs less often.'
      },
      {
        id: 'focused-freeze-q5',
        stem: 'How does the second paragraph develop the explanation in the first?',
        options: focusedChoices(
          ['A', 'It identifies conditions that make the described mechanism more or less effective.'],
          ['B', 'It argues that the mechanism described in the first paragraph is impossible.'],
          ['C', 'It introduces a different process that does not involve water.'],
          ['D', 'It lists the names of scientists who discovered the process.']
        ),
        answer: 'A', skill: 'idea-relationships',
        explanation: 'The first paragraph explains the mechanism; the second explains the conditions controlling it.'
      }
    ]
  }
];
