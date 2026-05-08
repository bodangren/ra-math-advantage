import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule7LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

const lessonsData = [
  {
    slug: "module-7-lesson-1",
    title: "Sample Spaces",
    description:
      "Students define and describe sample spaces, use organized lists, tables, and tree diagrams to represent sample spaces, classify sample spaces as finite or infinite, and apply the Fundamental Counting Principle.",
    orderIndex: 1,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: What Are All the Possible Outcomes?\n\nStudents consider how to systematically list all outcomes of simple experiments and why organized counting methods matter for accuracy.\n\n**Inquiry Question:**\nHow can you be sure you have listed all possible outcomes of an experiment without missing any?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Sample Space** — The set of all possible outcomes of an experiment.\n- **Outcome** — A single possible result of an experiment.\n- **Event** — A subset of the sample space; a specific outcome or set of outcomes.\n- **Finite Sample Space** — A sample space with a countable number of outcomes.\n- **Infinite Sample Space** — A sample space with an uncountable number of outcomes.\n- **Discrete Sample Space** — An infinite sample space where outcomes can be listed (e.g., whole numbers).\n- **Continuous Sample Space** — An infinite sample space where any value in an interval is possible.\n- **Tree Diagram** — A visual representation of the possible outcomes of a multi-stage experiment.\n- **Fundamental Counting Principle** — If one event has [m] possible outcomes and a second event has [n] possible outcomes, the combined event has [m \\times n] possible outcomes.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Sample Spaces\n\n### Key Concept: Describing Sample Spaces\n\nA sample space can be represented in multiple ways:\n\n- **Organized List:** Write outcomes in a clear sequence.\n- **Table:** Arrange outcomes in rows and columns for multi-stage experiments.\n- **Tree Diagram:** Branch out to show all possible combinations of outcomes across stages.\n\nFor a coin tossed once, the sample space is [S = {H, T}] or [S = {heads, tails}].\n\nFor a spinner with five equal parts labeled A, B, C, D, E, the sample space is [S = {A, B, C, D, E}].\n\n### Key Concept: Classifying Sample Spaces\n\n- **Finite:** Can be counted completely. Example: drawing a tile from a bag of colored tiles.\n- **Infinite Discrete:** Can be listed but continues without end. Example: spinning a spinner until it lands on a specific number.\n- **Infinite Continuous:** Any value in a range is possible. Example: measuring the distance a fishing line travels.\n\n### Key Concept: The Fundamental Counting Principle\n\nFor multi-stage experiments where each stage has a fixed number of choices:\n\nIf a experiment has [k] stages and stage 1 has [n_1] outcomes, stage 2 has [n_2] outcomes, and so on, the total number of outcomes is:\n\n[P = n_1 \\times n_2 \\times \\cdots \\times n_k]\n\nExample: A bedroom can be decorated using 3 paint colors, 2 furniture sets, and 4 lamp styles. The total combinations are [3 \\times 2 \\times 4 = 24].",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Define Sample Spaces\n\nDefine the sample space and represent it using an organized list, table, or tree diagram for each experiment.\n\n### Step 1: Identify the Experiment and List Outcomes\n\n**Experiment 1:** A fair coin is tossed once.\nThe sample space is [S = {heads, tails}] or [S = {H, T}].\n\n**Experiment 2:** A numbered spinner with six equal parts is spun once.\nThe sample space is [S = {1, 2, 3, 4, 5, 6}].\n\n**Event — Landing on a prime number:** The primes from 1 to 6 are [2, 3, 5], so the event set is [E = {2, 3, 5}].\n\n**Experiment 3:** A regular dodecagon (12-sided polygon) is rolled once.\nThe sample space is [S = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}].\n\n**Event — Rolling an even number:** [E = {2, 4, 6, 8, 10, 12}].\n\n**Experiment 4:** A lettered spinner with five equal parts (A through E) is spun once.\nThe sample space is [S = {A, B, C, D, E}].\n\n**Event — Landing on a vowel:** [E = {A, E}].",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Represent Multi-Stage Sample Spaces\n\nUse tables and tree diagrams to represent the sample space for multi-stage experiments.\n\n### Step 1: Identify Stages and List Outcomes\n\n**Experiment:** A baseball team can wear blue or white shirts with blue or white pants for away games.\n\nStage 1: Shirt color — [2] choices (blue, white)\nStage 2: Pants color — [2] choices (blue, white)\n\nUse a table or tree diagram to show all four combinations:\n[{(blue shirt, blue pants), (blue shirt, white pants), (white shirt, blue pants), (white shirt, white pants)}]\n\n**Experiment:** A baby can drink apple juice or milk from a bottle or a toddler cup.\n\nStage 1: Drink type — [2] choices (apple juice, milk)\nStage 2: Container type — [2] choices (bottle, toddler cup)\n\nTotal outcomes: [2 \\times 2 = 4]",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Classify Sample Spaces\n\nClassify each sample space as finite or infinite. If finite, write the sample space. If infinite, classify as discrete or continuous.\n\n### Step 1: Determine if the Number of Outcomes is Countable\n\n**Problem 7:** A color tile is drawn from a cup containing 1 yellow, 2 blue, 3 green, and 4 red tiles.\nThis is finite. The sample space is [S = {yellow, blue, green, red}] with [1 + 2 + 3 + 4 = 10] total tiles.\n\n**Problem 8:** A numbered spinner with eight equal parts is spun until it lands on 2.\nThis is infinite discrete — theoretically the spinner could take an unbounded number of spins to land on 2.\n\n**Problem 9:** An angler casts a fishing line and its distance is recorded in centimeters.\nThis is infinite continuous — any positive real number is possible for the distance.\n\n**Problem 10:** A letter is randomly chosen from the alphabet.\nThis is finite. The sample space has [26] outcomes.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Apply the Fundamental Counting Principle\n\nFind the number of possible outcomes for each situation using the Fundamental Counting Principle.\n\n### Step 1: Identify Each Stage and Its Options\n\n**Problem 11:** A video game lets you decorate a bedroom with one choice from each category:\n[The total = n_1 \\times n_2 \\times n_3 \\times \\cdots]\n\n**Problem 12:** A cafeteria meal includes one choice from each category:\n[Multiply the number of options at each stage.]\n\n**Problem 13:** A patio set includes 4 stone types, 3 edging types, 5 dining sets, and 6 grills.\n[4 \\times 3 \\times 5 \\times 6 = 360] different patio sets.\n\n**Problem 14:** Auditions for 6 roles with 5, 3, 8, 4, 2, and 3 applicants respectively.\n[5 \\times 3 \\times 8 \\times 4 \\times 2 \\times 3 = 2880] possible casts.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 15–31 provide practice with all skills from the lesson, including:\n\n- A spinner spun 4 times — find total outcomes.\n- A 14-player basketball roster with specific position counts — find 5-player team combinations.\n- Vacation rental choices in two cities with different stay lengths and bedroom options.\n- Maurice's packing list with suits, shirts, and ties — draw a tree diagram.\n- Tala's school uniform with multiple clothing options — find total outfit combinations.\n- A sandwich shop with bread, meats, and cheeses — find total sandwich combinations.\n- License plates with three letters followed by three numbers (no O or 0).\n- Internship options across 3 months, 4 departments, and 3 companies (July constraint applied).\n- Bicycle lock combinations with and without repeated digits.\n- Rolling two fair dice — find outcomes with sum of 8 and outcomes with odd sum.\n- Justify when to use tree diagrams versus the Fundamental Counting Principle.\n- A multi-stage experiment with [n] outcomes per stage over [k] stages.\n- Drawing three objects from [n] objects without replacement.\n- Describe an asymmetrical two-stage experiment and sketch its tree diagram.\n- Explain why tables cannot represent all multi-stage experiments.\n- Analyze whether an outcome outside the sample space represents a failure.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Images referenced in the worksheet (spinner diagrams, packing list, school uniform outfit table, sandwich shop menu) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and visual elements.\n- The worksheet contains 31 practice problems across four examples and mixed exercises.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-2",
    title: "Probability and Counting",
    description:
      "Students find intersections and unions of events, determine joint and combined probabilities, calculate probabilities of complements, and use Venn diagrams to organize outcomes and solve probability problems.",
    orderIndex: 2,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: How Do Events Overlap?\n\nStudents consider situations where two events may share outcomes and how to describe those shared outcomes mathematically.\n\n**Inquiry Question:**\nWhen two events share some outcomes, how do you count the total number of outcomes in either event without double-counting?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Intersection** — The set of outcomes common to two events, denoted [A \\cap B].\n- **Union** — The set of all outcomes in either event or both events, denoted [A \\cup B].\n- **Complement** — The set of outcomes not in the event, denoted [A'] or [A^c].\n- **Mutually Exclusive** — Two events that have no outcomes in common; [A \\cap B = \\emptyset].\n- **Venn Diagram** — A diagram using overlapping circles to represent sets and their relationships.\n- **Conditional Probability** — The probability of an event given that another event has occurred.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Probability and Counting\n\n### Key Concept: Intersections of Events\n\nThe intersection [A \\cap B] contains the outcomes that are in both event [A] and event [B].\n\n**Example:** When rolling a fair die, let [A] be the event of rolling an even number and [B] be the event of rolling a number greater than 4.\n\n[A = {2, 4, 6}]\n[B = {5, 6}]\n[A \\cap B = {6}]\n\n**Example:** When rolling a fair die, let [A] be the event of rolling an even number and [B] be the event of rolling an odd number.\n\n[A = {2, 4, 6}]\n[B = {1, 3, 5}]\n[A \\cap B = \\emptyset] — these events are mutually exclusive.\n\n### Key Concept: Unions of Events\n\nThe union [A \\cup B] contains all outcomes in [A], in [B], or in both.\n\nWhen events share outcomes, use:\n\n[P(A \\cup B) = P(A) + P(B) - P(A \\cap B)]\n\n**Example:** For a spinner with sections labeled 1–10, let [A] be landing on a vowel and [B] be landing on J.\n\n[A = {A, E}]\n[B = {J}]\n[A \\cup B = {A, E, J}]\n\n### Key Concept: Probability of the Complement\n\n[P(A') = 1 - P(A)]\n\n**Example:** Probability of not drawing a spade from a standard deck:\n[P(\\text{not spade}) = 1 - P(\\text{spade}) = 1 - \\frac{13}{52} = \\frac{39}{52}]",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Find Intersections\n\n### Step 1: List Outcomes for Each Event\n\n**Problem 1:** A fair die is rolled. [A] = even numbers, [B] = greater than 4.\n[A = {2, 4, 6}]\n[B = {5, 6}]\n[A \\cap B = {6}]\n\n**Problem 2:** A fair die is rolled. [A] = even numbers, [B] = odd numbers.\n[A = {2, 4, 6}]\n[B = {1, 3, 5}]\n[A \\cap B = \\emptyset]\n\n**Problems 3–4:** For the spinner:\n[A] = landing on 4 or 10, [B] = landing on a section with a number divisible by 4.\n[P] = landing on a prime number, [Q] = landing on a multiple of 3.\nFind [A \\cap B] and [P \\cap Q] by listing each set and identifying common elements.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Probability of Intersections\n\n### Step 1: Identify Favorable and Total Outcomes\n\n**Problem 5:** A card is drawn from a standard deck. What is the probability it is a diamond and a seven?\nThere is only one seven of diamonds in a 52-card deck.\n[P(\\text{diamond} \\cap \\text{seven}) = \\frac{1}{52}]\n\n**Problem 6:** A card is drawn from a standard deck. What is the probability it has an even number and is black?\nEven-numbered black cards: 2, 4, 6, 8, 10 of clubs and spades = 10 cards.\n[P(\\text{even} \\cap \\text{black}) = \\frac{10}{52} = \\frac{5}{26}]",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Find Unions\n\n### Step 1: List Outcomes and Combine\n\n**Problems 7–10:** For each pair of events, list the outcomes of each event, then find the union.\n\n**Problem 9:** Generator produces integers from 1 to 20. [C] = multiples of 5, [D] = less than 12.\n[C = {5, 10, 15, 20}]\n[D = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}]\n[C \\cup D = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 20}]\n\n**Problem 10:** Generator produces integers from 1 to 100. [A] = multiples of 10, [B] = factors of 30.\n[A = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100}]\n[B = {1, 2, 3, 5, 6, 10, 15, 30}]\n[A \\cup B = {1, 2, 3, 5, 6, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100}]",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Probability of Complements\n\n### Step 1: Apply Complement Rule\n\n**Problem 11:** Not drawing a spade from a standard deck.\n[P(\\text{not spade}) = 1 - \\frac{13}{52} = \\frac{39}{52}]\n\n**Problem 12:** Not landing on tails when flipping a coin.\n[P(\\text{not tails}) = 1 - \\frac{1}{2} = \\frac{1}{2}]\n\n**Problem 13:** Carmela has 10 raffle tickets out of 250 sold. Probability her ticket is not drawn.\n[P(\\text{not drawn}) = 1 - \\frac{10}{250} = \\frac{24}{25}]\n\n**Problem 14:** Spinner numbered 1–6. Probability of not landing on 5.\n[P(\\text{not 5}) = 1 - \\frac{1}{6} = \\frac{5}{6}]",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 15–26 provide practice with all skills:\n\n- Survey data: 90% of 100 juniors are right-handed — find probability of left-handed student.\n- Raffle: 24 tickets out of 1545 sold — probability of not winning.\n- Mascot survey: 120 students, lion vs. timber wolf preferences.\n- College plans: 85% of 240 seniors attending college — probability of not attending.\n- Venn diagram of drama cast members in Act I and Act II — find intersection and probability.\n- Spinner probability of landing on a prime number.\n- Shopping survey Venn diagram — find probability of someone who visited for both shopping and dining.\n- Rectangle with perimeter 52 — find side measures and intersection with triangle side measure.\n- Create a Venn diagram for months with 31 days and months beginning with J.\n- Explain intersections and unions to someone with no prior knowledge.\n- Analyze whether the union of two sets always has more elements than their intersection.\n- Error analysis: Truc says [A \\cup B = {A, E, O, U, J}], Alan says [A \\cup B = \\emptyset] — determine who is correct.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Images referenced in the worksheet (spinner diagrams, Venn diagrams for drama club and shopping survey, table data for jersey colors) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- The worksheet contains 26 practice problems across four examples and mixed exercises.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-3",
    title: "Geometric Probability",
    description:
      "Students calculate geometric probability using lengths and areas, apply geometric probability to real-world scenarios involving distances, times, and regions, and use area ratios to find the probability of landing in specific regions of geometric shapes.",
    orderIndex: 3,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: Probability from Geometry\n\nStudents consider how probability can be determined from geometric figures where any point in a region is equally likely to be chosen.\n\n**Inquiry Question:**\nHow can you use the dimensions of a figure to find the probability that a randomly chosen point falls in a specific region?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Geometric Probability** — A probability calculated using ratios of lengths, areas, or volumes.\n- **Geometric Model** — A representation where outcomes depend on geometric measures such as length or area.\n- **Continuous Sample Space** — A sample space where any value in an interval is possible.\n- **Favorable Region** — The part of a geometric figure where the desired outcome occurs.\n- **Total Region** — The entire geometric figure representing all possible outcomes.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Geometric Probability\n\n### Key Concept: Length-Based Geometric Probability\n\nWhen a point is chosen at random on a line segment, the probability it falls in a particular subsegment equals the ratio of the subsegment length to the total length.\n\n[P(\\text{point in region}) = \\frac{\\text{length of region}}{\\text{total length}}]\n\n**Example:** On a 15-foot log with frogs at positions Z, Q, and R, the probability a fourth frog lands between the first two (5 feet apart) is [\\frac{5}{15} = \\frac{1}{3}].\n\n### Key Concept: Area-Based Geometric Probability\n\nWhen a point is chosen at random in a two-dimensional region, the probability it falls in a particular subregion equals the ratio of the subregion area to the total area.\n\n[P(\\text{point in region}) = \\frac{\\text{area of region}}{\\text{total area}}]\n\n**Example:** A circular target with diameter 4 feet inside a rectangular field 120 yards by 30 yards. First find the target radius and area, then the field area, then compute the ratio.\n\n### Key Concept: Time-Based Geometric Probability\n\nConvert all time measures to the same unit, then use the ratio of favorable time to total time.\n\n**Example:** A traffic light is green for 2 minutes 27 seconds, yellow for 6 seconds, and red for 2 minutes 27 seconds in a 5-minute cycle.\n[P(\\text{green}) = \\frac{2\\text{ min }27\\text{ s}}{5\\text{ min}} = \\frac{147\\text{ s}}{300\\text{ s}}]",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Length-Based Probability\n\n### Step 1: Identify Total Length and Favorable Length\n\nPoint [M] is chosen at random on segment [ZP]. Find each probability:\n\n**Problem 1:** [P(M] is on [ZQ)]\n**Problem 2:** [P(M] is on [QR)]\n**Problem 3:** [P(M] is on [RP)]\n**Problem 4:** [P(M] is on [QP)]\n\nPoint [X] is chosen at random on segment [LP]. Find each probability:\n\n**Problem 5:** [P(X] is on [LN)]\n**Problem 6:** [P(X] is on [MO)]",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Time-Based and Real-World Probability\n\n### Step 1: Convert All Measures and Compute Ratios\n\n**Problem 7:** A 15-foot log with frogs 5 feet apart and third frog 10 feet from the second. Find probability fourth frog lands between first two.\n[P = \\frac{5}{15}]\n\n**Problem 9:** Traffic light green for 2 min 27 s, yellow for 6 s, red for 2 min 27 s in a 5-minute cycle.\n[P(\\text{green}) = \\frac{147}{300}]\n\n**Problem 10:** Battery takes 2 hours to fully charge. Probability battery is between [\\frac{1}{4}] and [\\frac{1}{2}] charged when checked randomly.\n[P = \\frac{\\frac{1}{2} - \\frac{1}{4}}{1} = \\frac{1}{4}]\n\n**Problem 11:** A 2-hour movie with a 6 minute 31 second song. Probability a random customer hears the song playing.\n[P = \\frac{6\\text{ min }31\\text{ s}}{120\\text{ min}}]\n\n**Problem 12:** A song is 2 minutes 40 seconds played sometime between noon and 4 P.M. (4 hours = 240 minutes). Find probability of hearing it.\n[P = \\frac{160\\text{ s}}{14400\\text{ s}}]",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Area-Based Probability\n\n### Step 1: Calculate Areas and Find Ratio\n\n**Problem 13:** A fish charm lands on a circular landing pad. Center circle has 4-foot diameter. Find probability of landing in center.\n[P = \\frac{\\text{area of center circle}}{\\text{area of entire pad}} = \\frac{\\pi (2)^2}{\\pi r^2}]\n\n**Problem 14:** Circular target with 10-yard radius inside a rectangular field 120 yards by 30 yards.\n[P = \\frac{\\text{area of target}}{\\text{area of field}}]",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Spinner Probability\n\n### Step 1: Determine Favorable and Total Outcomes\n\n**Problems 15–19:** Use the spinner to find each probability. If the spinner lands on a line, spin again.\n\n[P(\\text{red}) = \\frac{\\text{red sections}}{\\text{total sections}}]\n[P(\\text{blue}) = \\frac{\\text{blue sections}}{\\text{total sections}}]\n[P(\\text{green}) = \\frac{\\text{green sections}}{\\text{total sections}}]\n[P(\\text{green or blue}) = P(\\text{green}) + P(\\text{blue})]\n[P(\\text{neither red nor yellow}) = 1 - P(\\text{red}) - P(\\text{yellow})]",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Assumptions in Geometric Probability\n\n### Step 1: State Assumptions and Calculate\n\n**Problem 20:** Deangelo waits for the Crimson bus (every 8 minutes) or Gold bus (every 15 minutes) with a 5-minute maximum wait.\n\n**a.** Assumption: Buses arrive at consistent intervals and passengers arrive randomly.\n\n**b.** Probability of waiting 5 minutes or less for both buses.\n[P(\\text{Crimson} \\leq 5) = \\frac{5}{8} = 0.625]\n[P(\\text{Gold} \\leq 5) = \\frac{5}{15} = 0.333]\nAssuming independence: [P(\\text{both}) = 0.625 \\times 0.333 \\approx 0.208 = 20.8\\%]\n\n**c.** Probability of waiting 5 minutes or less for only one bus.\n[0.625 \\times (1 - 0.333) + (1 - 0.625) \\times 0.333 \\approx 0.417 + 0.125 = 0.542 = 54.2\\%]",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 21–35 provide practice with all skills:\n\n- Describe an event with 33% probability using three different geometric models.\n- Find probability a point lies in the shaded region of given figures.\n- Darts: equally likely to land anywhere on the dart board — find probability of landing in a shaded sector.\n- Washers game: 17-inch by 17-inch square pit with 4-inch diameter circular region. Find probability of landing in the circle.\n- Dance stage illuminated by two overlapping circles passing through each other's centers. Find probability of landing in illuminated area and in the overlap.\n- Prove probability in shaded circular region equals [\\frac{x}{360}].\n- Find probability in a complex shaded figure (rounded to nearest tenth of a percent).\n- Isosceles triangle with perimeter 32 cm and integer side lengths — find probability area is exactly 48 sq cm.\n- Explain whether athletic events can be considered random.\n- Create three different geometric representations of 20% probability.\n- Compare why probability of landing in shaded region is the same for two different squares.",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- ![](media/image1.png) — Line segment ZP diagram for Problems 1–4\n- ![](media/image2.png) — Line segment LP diagram for Problems 5–6\n- ![](media/image3.png) — Wildlife frog on log diagram for Problem 7\n- ![](media/image4.png) — Livestock pigs diagram for Problem 8\n- ![](media/image5.png) — Circular landing pad for Problem 13\n- ![](media/image6.png) — Colored spinner for Problems 15–19\n- ![](media/image7.png), ![](media/image8.png) — Geometric models for Problems 21–22\n- ![](media/image9.jpg) — Geometric figure for Problem 23\n- ![](media/image10.png), ![](media/image11.png), ![](media/image12.png), ![](media/image13.png) — Shaded region figures for Problems 24–27\n- ![](media/image14.png) — Dart board sector diagram for Problem 27\n- ![](media/image15.png) — Washers game diagram for Problem 28\n- ![](media/image16.png) — Dance stage with overlapping circles for Problem 29\n- ![](media/image17.png) — Shaded circular region for Problem 30\n- ![](media/image18.png) — Complex shaded figure for Problem 31",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-4",
    title: "Probability with Permutations and Combinations",
    description:
      "Students calculate probabilities using permutations and combinations, apply permutation and combination formulas to find favorable outcomes and total outcomes, distinguish between situations requiring permutations and combinations, and use probability formulas involving permutations and combinations.",
    orderIndex: 4,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: When Order Matters\n\nStudents consider situations where the order of selection changes the outcome and situations where only the selection matters.\n\n**Inquiry Question:**\nWhy is the probability of being chosen as captain and co-captain different from the probability of being chosen as just one of two leaders, even if both people end up leading?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Permutation** — An arrangement of objects where order matters; formula: [nPr = \\frac{n!}{(n-r)!}]\n- **Combination** — A selection of objects where order does not matter; formula: [nCr = \\frac{n!}{r!(n-r)!}]\n- **Favorable Outcomes** — The outcomes that satisfy the event of interest.\n- **Total Outcomes** — All possible outcomes in the sample space.\n- **Probability with Permutations** — [P(E) = \\frac{\\text{favorable permutations}}{\\text{total permutations}}]",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Probability with Permutations and Combinations\n\n### Key Concept: Probability with Permutations\n\nWhen finding the probability that specific items are selected in a particular order, use permutations for both favorable outcomes and total outcomes.\n\n[P(E) = \\frac{_{n}P_{r}}{\\,_{n}P_{r}}] or use counts directly\n\n**Example:** Cheerleading squad of 12 girls, captain and co-captain selected randomly. Probability that Chantel and Clover are chosen as the two leaders (in any order).\n\nTotal ways to choose 2 leaders from 12: [_{12}P_{2} = 12 \\times 11 = 132]\nFavorable ways (Chantel and Clover as the pair): There is only 1 way for them to be the two chosen, but since they can be in either order (captain/co-captain or co-captain/captain), we need to check the problem's interpretation.\n\n### Key Concept: Probability with Combinations\n\nWhen order does not matter, use combinations.\n\n[P(E) = \\frac{\\binom{n}{r}}{\\binom{N}{R}}]\n\n**Example:** From 20 flavors of frozen yogurt, choosing 3 flavors. Probability the chosen flavors are vanilla, chocolate, and strawberry (in any order).\n\nTotal ways to choose 3 from 20: [\\binom{20}{3} = 1140]\nFavorable ways (the specific 3 flavors): [\\binom{3}{3} = 1] (since the set {vanilla, chocolate, strawberry} is one specific combination)\n[P = \\frac{1}{1140}]\n\n### Key Concept: Distinguishing Permutations from Combinations\n\n- **Permutations:** Positions, sequences, arrangements where order matters.\n- **Combinations:** Groups, sets, selections where order does not matter.\n\n**Example:** Selecting a class president, vice president, and secretary — order matters (permutations).\n**Example:** Selecting 4 books to put on a shelf — order matters on the shelf (permutations).\n**Example:** Selecting 4 dogs for an extra trip — order does not matter (combinations).",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Probability with Permutations\n\n### Step 1: Identify When Order Matters\n\n**Problem 1:** 12 girls, captain and co-captain selected. Probability Chantel and Clover are chosen.\nTotal ways: [_{12}P_{2} = 132]\nIf the two positions are distinct (captain vs. co-captain), there are 2 ways to assign Chantel and Clover to the two positions. But if only the pair matters and positions are randomly assigned, there is 1 favorable pair out of 132.\n\n**Problem 2:** 6 textbooks (Spanish, English, Chemistry, Geometry, History, Psychology). Choosing 4 to arrange on a shelf. Probability Geometry is first and Chemistry is second from the left.\nTotal arrangements of 4 from 6: [_{6}P_{4} = 360]\nFavorable: Geometry in position 1 AND Chemistry in position 2 — only 1 specific sequence.\n\n**Problem 3:** 50 raffle tickets, Alfonso gets 14 and Cordell gets 23. Probability their specific tickets are drawn.\nTotal ways to assign 2 specific tickets: [50 \\times 49 = 2450]\nFavorable: 1 specific assignment.\n[P = \\frac{1}{2450}]\n\n**Problem 4:** Row of seats C11 and C12, Ciro in C11 and Nia in C12. Probability of this specific seating.\nTotal pairs of seats available: depends on row length.\nFavorable: 1 specific assignment.\n[P = \\frac{1}{\\text{total possible seat pairs}}]",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Examples 2 and 3 — Permutations with Repetition and Specific Sequences\n\n### Step 1: Count Total and Favorable Outcomes\n\n**Problem 5:** Phone number generated using digits 2, 3, 2, 5, 2, 7, 3. Probability of getting 222-3357.\nTotal possible arrangements of the 7 digits: [\\frac{7!}{3! \\times 2! \\times 2!} = 210]\nOnly 1 favorable arrangement (the exact sequence).\n[P = \\frac{1}{210}]\n\n**Problem 6:** 5-digit identification numbers from digits 1–9, no repetition. Probability of 25938.\nTotal: [_{9}P_{5} = 15,120]\nFavorable: 1\n[P = \\frac{1}{15,120}]\n\n**Problem 7a:** Class president finalists — probability Denny, Kelli, and Chaminade are the first 3 speakers in any order.\nTotal ways to arrange 3 speakers from the full list of finalists: use permutation if order matters among the 3.\nFavorable: the specific set {Denny, Kelli, Chaminade} in any of their 3! = 6 possible orders.\n\n**Problem 7b:** Same finalists but Denny first, Kelli second, Chaminade third (specific order).\nOnly 1 favorable arrangement out of the total possible arrangements.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Probability with Combinations\n\n### Step 1: Use Combinations for Unordered Selection\n\n**Problem 8:** Taryn has 15 soccer trophies, displays 9. Probability that trophies from 1st through 9th grades are all chosen.\nTotal ways to choose 9 from 15: [\\binom{15}{9}]\nFavorable ways: only 1 way to select those specific 9 trophies.\n[P = \\frac{1}{\\binom{15}{9}}]\n\n**Problem 9:** 20 frozen yogurt flavors, choosing 3. Probability of vanilla, chocolate, and strawberry.\nTotal: [\\binom{20}{3} = 1140]\nFavorable: 1\n[P = \\frac{1}{1140}]\n\n**Problem 10:** Kaja serves 9 dogs, chooses 4 randomly for an extra trip. Probability that Cherish, Taffy, Haunter, and Maverick are chosen.\nTotal: [\\binom{9}{4} = 126]\nFavorable: 1\n[P = \\frac{1}{126}]\n\n**Problem 11:** 10 food trucks, trying half (5). Probability of selecting 5 specific trucks.\nTotal: [\\binom{10}{5} = 252]\nFavorable: 1\n[P = \\frac{1}{252}]\n\n**Problem 12:** Emily has 20 collectible dolls, donates 10. Probability of selecting 10 specific country dolls.\nTotal: [\\binom{20}{10}]\nFavorable: 1\n[P = \\frac{1}{\\binom{20}{10}}]\n\n**Problem 13:** 12 attractions (4 roller coasters, 2 carousels, 2 drop towers, 2 gravity rides, 2 dark rides). App suggests 4 in order. Probability the first 4 suggested are the four roller coasters.\nTotal ordered sequences of 4 from 12: [_{12}P_{4} = 11,880]\nFavorable: specific sequence of the 4 roller coasters = 1\n[P = \\frac{1}{11,880}]",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 14–30 provide practice with all skills:\n\n- Department manager selects 4 team members from 20 for conferences in Los Angeles, Atlanta, Chicago, and New York. Probability Jariah, Sherry, Emilio, and Lavon are chosen.\n- Silverware placement at a formal place setting — probability knife and spoon placed correctly.\n- Line of 5 cards — probability ace is first and 10 is second.\n- Points A, B, C, D, E coplanar, no 3 collinear — find probability that line AB is randomly selected.\n- Permutation of letters shown — probability of forming \"photography\".\n- Email to 20 contacts, 6 respond — probability that specific 6 (Michaelsons, Rodriquezes, etc.) responded.\n- Game show contestants — probability Wyatt, Gabe, and Isaac are first three.\n- Hair salon coupons (6 different coupons to 6 customers) — probability first customer gets 10% and second gets 25%; how many different groups of 2 coupons.\n- 12 donated trees planted in alphabetical order by donor; probability of alphabetical order; probability 4 randomly chosen are all dogwoods.\n- Parking stickers with 5 digits (1–9, no repeats) — probability of 54321.\n- Prove [_{n}C_{n-r} = \\,_{n}C_{r}].\n- 15 boys and 15 girls entered drawing for 4 movie tickets — probability all 4 won by girls.\n- Analyze when [_{n}P_{r} = \\,_{n}C_{r}].\n- Compare and contrast permutations and combinations.\n- Describe situation with probability [\\frac{1}{n}].\n- Show algebraically why [r! \\times \\,_{n}C_{r} = \\,_{n}P_{r}].\n- Evaluate Charlie's claim that [nP_{n} = \\,_{n}P_{n-1}].",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- ![](media/image1.png) — Row of seats diagram for Problem 4\n- ![](media/image2.png) — Class president finalists table for Problem 7\n- ![](media/image3.png) — Conference selection diagram for Problem 14\n- ![](media/image4.png) — Silverware place setting for Problem 15\n- ![](media/image5.png) — Five card lineup for Problem 16\n- ![](media/image6.png) — Decorative letters for Problem 18\n- ![](media/image7.png) — Game show contestant list for Problem 20\n- ![](media/image8.png) — Hair salon discount coupons for Problem 21",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-5",
    title: "Probability and the Multiplication Rule",
    description:
      "Students apply the multiplication rule for independent events to find joint probabilities, distinguish between independent and dependent events, apply the multiplication rule for dependent events with and without replacement, and calculate conditional probabilities from joint probability information.",
    orderIndex: 5,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: When Does One Event Affect Another?\n\nStudents consider situations where the outcome of one event changes the probabilities for subsequent events.\n\n**Inquiry Question:**\nIf you draw a card from a deck and do not put it back, how does that change the probability of what you might draw next?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Independent Events** — Two events where the occurrence of one does not affect the probability of the other; [P(A | B) = P(A)].\n- **Dependent Events** — Two events where the occurrence of one affects the probability of the other.\n- **Joint Probability** — The probability of two events occurring together; [P(A \\text{ and } B)].\n- **Conditional Probability** — [P(B | A)] — the probability of event B given that event A has occurred.\n- **With Replacement** — Drawing an item and returning it before the next draw; events remain independent.\n- **Without Replacement** — Drawing an item and not returning it; events become dependent.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Probability and the Multiplication Rule\n\n### Key Concept: Multiplication Rule for Independent Events\n\nFor independent events A and B:\n\n[P(A \\text{ and } B) = P(A) \\times P(B)]\n\n**Example:** Flipping a coin and rolling a die — the coin flip does not affect the die roll.\n[P(\\text{heads and 3}) = \\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}]\n\n### Key Concept: Multiplication Rule for Dependent Events\n\nFor dependent events (without replacement):\n\n[P(A \\text{ and } B) = P(A) \\times P(B | A)]\n\n**Example:** Drawing two aces from a standard deck without replacement:\n[P(\\text{first ace}) = \\frac{4}{52}]\n[P(\\text{second ace} | \\text{first ace}) = \\frac{3}{51}]\n[P(\\text{both aces}) = \\frac{4}{52} \\times \\frac{3}{51} = \\frac{1}{221}]\n\n### Key Concept: Testing for Independence\n\nEvents A and B are independent if and only if:\n\n[P(A \\text{ and } B) = P(A) \\times P(B)]\nor equivalently\n[P(B) = P(B | A)]",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Independent Events and Joint Probability\n\n### Step 1: Identify Events and Apply Multiplication Rule\n\n**Problem 1:** Omari has 2 red sock pairs, 2 white sock pairs, 2 red T-shirts, 1 white T-shirt. Choosing a red sock pair and a white T-shirt.\n[P(\\text{red socks}) = \\frac{2}{4} = \\frac{1}{2}]\n[P(\\text{white T-shirt}) = \\frac{1}{3}]\n[P(\\text{both}) = \\frac{1}{2} \\times \\frac{1}{3} = \\frac{1}{6}]\n\n**Problem 2:** Dropping two coins — probability both land tails.\n[P(\\text{both tails}) = \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}]\n\n**Problem 3:** Rolling a 2 on a die and landing on tails with a penny.\n[P(2 \\text{ and tails}) = \\frac{1}{6} \\times \\frac{1}{2} = \\frac{1}{12}]\n\n**Problem 4:** Drawing a blue marble (with replacement) and then drawing another blue marble.\n[P(\\text{first blue}) = \\frac{4}{9}]\n[P(\\text{second blue}) = \\frac{4}{9}]\n[P(\\text{both blue}) = \\frac{4}{9} \\times \\frac{4}{9} = \\frac{16}{81}]\n\n**Problem 5:** Rain on Tuesday (40%) and Wednesday (60%), independent.\n[P(\\text{rain both days}) = 0.4 \\times 0.6 = 0.24 = 24\\%]",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Independent vs. Dependent Events\n\n### Step 1: Determine Whether One Event Affects the Other\n\n**Problem 6:** Rolling an even number, then spinning an odd number on a 1–5 spinner.\nIndependent — rolling the die does not affect the spinner.\n\n**Problem 7:** Drawing an ace, not replacing it, then drawing another ace.\nDependent — the first ace reduces the number of aces remaining.\n\n**Problem 8:** Drawing a blue marble, not replacing, then drawing another blue marble.\nDependent — the first blue marble reduces the count.\n\n**Problem 9:** Rolling a 5 on each of two fair dice.\nIndependent — each die roll is independent.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Dependent Events Without Replacement\n\n### Step 1: Adjust Probabilities After Each Draw\n\n**Problem 10:** Drawing Sofia then Joe from 4 students (Joe, Sofia, Hayden, Bonita).\n[P(\\text{Sofia first}) = \\frac{1}{4}]\n[P(\\text{Joe second} | \\text{Sofia first}) = \\frac{1}{3}]\n[P(\\text{Sofia then Joe}) = \\frac{1}{4} \\times \\frac{1}{3} = \\frac{1}{12}]\n\n**Problem 11:** Drawing a jack of spades first, then a black card (without replacement).\n[P(\\text{jack of spades first}) = \\frac{1}{52}]\n[P(\\text{black second} | \\text{first jack of spades}) = \\frac{25}{51}]\n[P(\\text{both}) = \\frac{1}{52} \\times \\frac{25}{51} = \\frac{25}{2652}]\n\n**Problem 12:** Jersey colors table — first jersey is red, second jersey is red.\nFind P(red first) and P(red second | red first) based on table data, then multiply.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 13–29 provide practice with all skills:\n\n- Best-of-seven series — probability of winning first four games (assuming equal probability).\n- Director and assistant director team — probability of selecting 3 directors and 1 assistant from 3+3 people.\n- Magic trick with 3 people each drawing a card (without replacement) — probability all 3 draw hearts.\n- Given P(Geometry and French) = 0.064 and P(French) = 0.45, find P(Geometry | French) for dependent events.\n- At Bell High School, 43% in club and 28% play sports — find P(club | sports) assuming independence.\n- Derek selects chip from Box B without replacement — find P(both defective) from table.\n- Sunita selects from Box A — given P(both defective) = 1/625, did she replace the first chip?\n- Travel agency survey with P(D) = 0.6, P(D and F) = 0.2, P(no vacation) = 0.1 — find P(F) and P(F | D).\n- Business expansion with good/bad economy probabilities and different outcomes — create tree diagram.\n- Spinner twice — find P(orange and green) and show P(O) · P(G | O) = P(G) · P(O | G).\n- Card trick with Tracy drawing and replacing — are Sam's and Tracy's picks independent? Find P(both queen of spades).\n- Derive conditional probability formula from P(A and B) for dependent events.\n- Kelly's tennis serve: 40% first serve, 70% second serve — draw tree diagram, find P(double fault).\n- Bag with n objects — given P(A and B without replacement) = 0.024, find n.\n- Explain how to determine if left-handedness and parent left-handedness are independent.\n- Describe a pair of independent events and a pair of dependent events.\n- Given P(A | B) = P(A) and P(B | A) = P(B), what can be concluded about A and B?",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- ![](media/image1.png) — Intramural volleyball jersey color and number table for Problem 12\n- ![](media/image2.png) — Microchip box table for Problems 18–19\n- ![](media/image3.png) — Probability model for Problems 20–22\n- ![](media/image4.png) — Spinner for Problems 22–23",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-6",
    title: "Probability and the Addition Rule",
    description:
      "Students determine whether events are mutually exclusive or not mutually exclusive, apply the addition rule for mutually exclusive events, apply the general addition rule for non-mutually exclusive events, and use Venn diagrams to organize outcomes and apply addition rules.",
    orderIndex: 6,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: When Events Cannot Happen Together\n\nStudents consider situations where two events cannot both occur and situations where both can occur simultaneously.\n\n**Inquiry Question:**\nHow do you correctly add probabilities when two events share some outcomes?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Mutually Exclusive** — Two events that cannot occur at the same time; they have no outcomes in common.\n- **Not Mutually Exclusive** — Two events that share at least one outcome.\n- **Addition Rule** — A rule for finding the probability of the union of two events.\n- **Overlap** — The intersection of two events; must be subtracted when events are not mutually exclusive.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Probability and the Addition Rule\n\n### Key Concept: Mutually Exclusive Events\n\nEvents A and B are mutually exclusive if [A \\cap B = \\emptyset].\n\nFor mutually exclusive events:\n[P(A \\cup B) = P(A) + P(B)]\n\n**Example:** Rolling a die — event A = rolling a 6, event B = rolling an even number.\nA = {6}, B = {2, 4, 6}\nThese are not mutually exclusive because 6 is in both.\nIf A = rolling a 6 and B = rolling a 3, these are mutually exclusive.\n\n### Key Concept: Not Mutually Exclusive Events\n\nFor events that share outcomes:\n[P(A \\cup B) = P(A) + P(B) - P(A \\cap B)]\n\n**Example:** Drawing from a deck — event A = drawing a heart, event B = drawing a face card.\nA has 13 cards, B has 12 cards, intersection (heart face cards) has 3 cards.\n[P(A \\cup B) = \\frac{13}{52} + \\frac{12}{52} - \\frac{3}{52} = \\frac{22}{52}]\n\n### Key Concept: Complementary Events\n\n[P(A') = 1 - P(A)]\n\nThis is useful when it is easier to find the probability that an event does NOT occur.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Classify Events as Mutually Exclusive or Not\n\n### Step 1: Check for Common Outcomes\n\n**Problem 1:** Rolling a die — event of rolling a 6 and event of rolling an even number.\nThese events are not mutually exclusive because 6 is both a 6 and an even number.\n\n**Problem 2:** T-shirt selection — blue or large.\nCheck whether being blue and being large are mutually exclusive based on the table data.\nIf there are blue large shirts, they are not mutually exclusive.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Examples 2 and 3 — Apply the Addition Rule\n\n### Step 1: Identify Mutually Exclusive or Not, Then Apply Appropriate Rule\n\n**Problem 3:** Student of month chooses from 9 gift certificates, 8 T-shirts, 6 water bottles, 5 gift cards. What is probability of choosing a T-shirt or water bottle?\nThese are mutually exclusive (a student cannot choose both a T-shirt and water bottle as the single award).\n[P = \\frac{8}{28} + \\frac{6}{28} = \\frac{14}{28} = \\frac{1}{2}]\n\n**Problem 4:** Store envelopes — 10 with coupons, 8 with gift cards, 2 with $100. Probability of gift card or $100.\nMutually exclusive.\n[P = \\frac{8}{20} + \\frac{2}{20} = \\frac{10}{20} = \\frac{1}{2}]\n\n**Problem 5:** Traffic light — 35% chance of green. Probability of yellow or red.\nMutually exclusive to green (only one color at a time).\n[P = 1 - 0.35 = 0.65]\n\n**Problem 6:** Graduate students — 4 of 5 females are international, 2 of 3 males are international. Probability of male or international student.\nNot mutually exclusive — some males are international, some internationals are male.\nUse general addition rule:\nTotal females = 5, total males = 3+2 = 5 (2 international males included)\nTotal students = 10\nP(male) = 5/10 = 0.5, P(international) = (4+2)/10 = 0.6\nP(male and international) = 2/10 = 0.2\nP(male or international) = 0.5 + 0.6 - 0.2 = 0.9",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 7–30 provide practice with all skills:\n\n- Standard 52-card deck problems:\n  - P(4), P(red), P(face card), P(not face card)\n  - P(queen or heart), P(jack or spade), P(five or prime), P(ace or black)\n- Drawing ticket numbered 1–80 — probability of multiple of 4 or factor of 12.\n- Venn diagram of senior class extracurricular activities (athletics, drama, band) — find total students, athletics participants, P(athletics or drama), P(only drama and band).\n- Cindy's bowling: 30% strike, 45% spare, 25% neither — P(spare or strike).\n- Dario's cards: 145 baseball, 102 football, 48 basketball — P(baseball or football).\n- Scholarship essays: 3000 reviewed, 2865 correct length, 2577 minimum GPA, 2486 both — P(length or GPA).\n- Ruby's cat kittens: 2 orange female, 3 mixed female, 1 orange male, 2 mixed male — P(female or orange).\n- Sports complex: age and participants table — P(14 or basketball).\n- Dice game: find P(sum of 7), P(sum of even or not 2).\n- Parks and Recreation: drama and 8-year-old participants table.\n- Flower garden: bulb type and color table — P(yellow flower or dahlia).\n- Roll 3 dice — P(at least two dice ≤ 4).\n- Teo and Mason: red marble probability from bag of 4 red, 7 blue, 5 green, 2 purple.\n- Analyze mutually exclusive: square and rectangle, equilateral and equiangular triangle, complex number and natural number.\n- Explain why sum of probabilities of mutually exclusive events is not always 1.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- ![](media/image1.png) — T-shirt colors and sizes table for Problem 2\n- ![](media/image2.png) — Senior class Venn diagram for Problem 16\n- ![](media/image3.png) — Sports complex age and participation table for Problem 21\n- ![](media/image4.png) — Dice game probability table for Problem 22\n- ![](media/image5.png) — Parks and Recreation table for Problem 23\n- ![](media/image6.png) — Flower garden bulb table for Problem 24\n- ![](media/image7.png) — Teo and Mason's marble probability comparison",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-7",
    title: "Conditional Probability",
    description:
      "Students calculate conditional probabilities using the definition, find probabilities given new information that restricts the sample space, determine whether two events are independent using conditional probability, and apply conditional probability to real-world scenarios involving Venn diagrams and two-way tables.",
    orderIndex: 7,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: How New Information Changes Probability\n\nStudents consider how knowing that one event has occurred changes the possible outcomes for another event.\n\n**Inquiry Question:**\nIf you know that a card drawn from a deck is a face card, what is the probability it is a king? How does the given information change your calculation?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Conditional Probability** — The probability of an event occurring given that another event has already occurred; [P(B | A)].\n- **Given Information** — The event that has already occurred, which restricts the sample space.\n- **Restricted Sample Space** — The set of outcomes that satisfy the given condition.\n- **Independence** — Two events A and B are independent if [P(B | A) = P(B)] or equivalently [P(A | B) = P(A)].",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Conditional Probability\n\n### Key Concept: Definition of Conditional Probability\n\n[P(B | A) = \\frac{P(A \\cap B)}{P(A)}]\n\nThis formula arises from restricting the sample space to only the outcomes in event A.\n\n**Example:** From a standard deck, P(king | face card):\nFace cards = {Jacks, Queens, Kings} of all 4 suits = 12 cards\nKings among face cards = 4 kings\n[P(king | face card) = \\frac{4}{12} = \\frac{1}{3}]\n\n### Key Concept: Conditional Probability from Tables\n\nWhen data is presented in a Venn diagram or two-way table, conditional probability restricts to the row or column of the given event.\n\n[P(B | A) = \\frac{\\text{count in } A \\cap B}{\\text{count in } A}]\n\n### Key Concept: Testing for Independence\n\nEvents A and B are independent if:\n[P(B | A) = P(B)] or [P(A | B) = P(A)]\n\nIf knowing A occurred does not change the probability of B, the events are independent.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Conditional Probability\n\n### Step 1: Identify the Given Event and Apply Definition\n\n**Problem 1:** Spanish Club — 10 students draw cards 1–10. Odd numbers bring main dishes, even numbers bring desserts. Given Cynthia is bringing a dessert, what is P(she drew 10)?\nGiven: Cynthia drew an even number (1, 2, 4, 6, 8, 10) — sample space size = 5\nFavorable: 10 is one of the options\n[P(10 | even) = \\frac{1}{5}]\n\n**Problem 2:** Card drawn from standard deck. P(king of diamonds | card is a king).\nGiven: card is a king (4 possible kings)\n[P(king of diamonds | king) = \\frac{1}{4}]\n\n**Problem 3:** Spinner with 7 colors of the rainbow. P(blue | primary color).\nPrimary colors: red, yellow, blue — only 3 possible outcomes in restricted space.\n[P(blue | primary) = \\frac{1}{3}]\n\n**Problem 4:** Cards 1–15 in a hat. P(multiple of 3 | odd).\nOdd numbers: {1, 3, 5, 7, 9, 11, 13, 15} — 8 cards\nMultiples of 3 among these: {3, 9, 15}\n[P(multiple of 3 | odd) = \\frac{3}{8}]",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 5–14 provide practice with all skills:\n\n- Blue marble selected (not replaced) from 3 red and 9 blue — find P(second blue).\n- Die rolled — P(2 | number < 5).\n- Two dice rolled — P(sum = 4 | first die odd).\n- Spinner 1–12 — P(11 | odd number spun).\n- Two dice rolled — P(sum = 8 | first die even).\n- Picnic: 60% order hamburger, 48% order hamburger and chips.\n  - P(chips | hamburger)\n  - If 50% ordered chips, are ordering hamburger and chips independent?\n  - If 80% of hot dog orderers also order drinks and 35% ordered hot dogs, find P(hot dog and drink).\n- Venn diagram of library (L) and home (H) study preferences for 60 students.\n  - Find number who study neither.\n  - P(L and H | student selected library).\n  - Determine if studying at library and studying at home are independent events.\n- House ownership (A) and car ownership (B) — independent or dependent? Compare P(A | B) to P(B | A).\n- North High School: 25% in Algebra, 20% in Algebra and Health.\n  - P(Health | Algebra)\n  - If 50% in Health, are Algebra and Health independent?\n  - Accounting (20%) and Accounting and Spanish (5%) — if independent, what percent in Spanish?\n- Standard deck face-value cards (2–10), two drawn without replacement.\n  - P(two face-value cards)\n  - P(exactly one is a 4)",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- ![](media/image1.png) — Venn diagram of library and home study preferences for Problem 11",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-7-lesson-8",
    title: "Two-Way Frequency Tables",
    description:
      "Students create and interpret two-way frequency tables, construct and interpret relative frequency tables, find conditional probabilities from two-way tables, and determine whether two events are independent using two-way table data.",
    orderIndex: 8,
    phases: [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: Organizing Data with Two Variables\n\nStudents consider how two-way tables help organize and analyze data involving two categorical variables simultaneously.\n\n**Inquiry Question:**\nHow can a table that organizes data by two different categories help you find probabilities that are not immediately obvious from the raw counts?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Two-Way Frequency Table** — A table that displays the frequencies of two categorical variables.\n- **Joint Frequency** — The count in a cell where both row and column categories apply.\n- **Marginal Frequency** — The total in each row or column (excluding the cell itself).\n- **Relative Frequency** — A proportion or percentage; frequency divided by the total.\n- **Conditional Probability** — Probability of an event given that another condition is satisfied; found by restricting to a row or column.\n- **Independence** — Events A and B are independent if [P(A | B) = P(A)] or equivalently [P(B | A) = P(B)].",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Two-Way Frequency Tables\n\n### Key Concept: Reading Two-Way Frequency Tables\n\nA two-way table has:\n* Rows representing one categorical variable\n* Columns representing another categorical variable\n* Marginals (row and column totals) along the edges\n* A grand total in the bottom-right corner\n\n**Example:** Survey of 100 people about vehicle type and gender:\n|  | SUV | Truck | Total |\n|--|-----|-------|-------|\n| Male | 15 | 35 | 50 |\n| Female | 40 | 10 | 50 |\n| Total | 55 | 45 | 100 |\n\n### Key Concept: Relative Frequency Tables\n\nRelative frequency can be calculated three ways:\n* **Overall:** Each cell divided by the grand total\n* **By Row:** Each cell divided by its row total (gives conditional distribution on the row variable)\n* **By Column:** Each cell divided by its column total (gives conditional distribution on the column variable)\n\n### Key Concept: Conditional Probability from Tables\n\n[P(A | B)] is found by restricting to the row or column representing B:\n[P(A | B) = \\frac{\\text{count in } A \\cap B}{\\text{count in } B}]\n\n**Example:** From vehicle survey, P(Female | SUV) = [40/55] — restrict to SUV column.\n\n### Key Concept: Testing Independence\n\nEvents are independent if:\n[P(A | B) = P(A)] — the conditional probability equals the marginal probability.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Create Two-Way Frequency and Relative Frequency Tables\n\n### Step 1: Organize Data into Rows and Columns\n\n**Problem 1:** 100 people surveyed — 15 males and 40 females drive SUVs, 35 males and 10 females drive trucks.\n\n**a.** Two-way frequency table:\n|  | SUV | Truck | Total |\n|--|-----|-------|-------|\n| Male | 15 | 35 | 50 |\n| Female | 40 | 10 | 50 |\n| Total | 55 | 45 | 100 |\n\n**b.** Relative frequency table (overall):\n|  | SUV | Truck |\n|--|-----|-------|\n| Male | 0.15 | 0.35 |\n| Female | 0.40 | 0.10 |\n\n**Problem 2:** 100 students surveyed about social media — 25 males and 35 females have accounts, 25 males and 15 females do not.\n\n**a.** Two-way frequency table:\n|  | Has Account | No Account | Total |\n|--|-------------|------------|-------|\n| Male | 25 | 25 | 50 |\n| Female | 35 | 15 | 50 |\n| Total | 60 | 40 | 100 |\n\n**b.** Relative frequency table (overall):\n|  | Has Account | No Account |\n|--|-------------|------------|\n| Male | 0.25 | 0.25 |\n| Female | 0.35 | 0.15 |",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — College Student Survey with Independence Test\n\n### Step 1: Build Table and Calculate Relative Frequencies\n\n**Problem 3:** 2000 college students surveyed — in-state vs. out-of-state and visit home frequency.\n\n**a.** Two-way frequency table:\n|  | >4 visits | ≤4 visits | Total |\n|--|-----------|-----------|-------|\n| In-state | 928 | 332 | 1260 |\n| Out-of-state | 118 | 622 | 740 |\n| Total | 1046 | 954 | 2000 |\n\n**b.** Relative frequency table (rounded to nearest tenth percent):\n|  | >4 visits | ≤4 visits |\n|--|-----------|-----------|\n| In-state | 46.4% | 16.6% |\n| Out-of-state | 5.9% | 31.1% |\n\n**c.** Test independence: Is visiting home frequency independent of in-state/out-of-state status?\nCompare P(>4 visits | in-state) to P(>4 visits overall).\nP(>4 | in-state) = 928/1260 ≈ 0.7365\nP(>4 overall) = 1046/2000 = 0.523\nSince these are not equal, the events are **not independent**.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Movie Theater Ticket Analysis\n\n### Step 1: Complete Table and Find Conditional Probability\n\n**Problem 4:** 800 tickets sold — 578 adult, 222 student. Adult: 136 animated, 442 documentary. Student: 181 animated, 41 documentary.\n\n**a.** Two-way frequency table:\n|  | Animated | Documentary | Total |\n|--|----------|-------------|-------|\n| Adult | 136 | 442 | 578 |\n| Student | 181 | 41 | 222 |\n| Total | 317 | 483 | 800 |\n\n**b.** Relative frequency table (rounded to nearest tenth):\n|  | Animated | Documentary |\n|--|----------|-------------|\n| Adult | 17.0% | 55.3% |\n| Student | 22.6% | 5.1% |\n\n**c.** P(adult | documentary) = [442/483 ≈ 0.9152]",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nProblems 5–10 provide practice with all skills:\n\n- Two-way frequency table of homework completion vs. exam pass/fail — find number who completed homework and passed. Identify marginal vs. joint frequencies.\n- Relative frequency table of gender vs. movie preference (drama or comedy) — determine if gender is independent of movie type preference.\n- Technology survey: 72 shoppers, smart phone and tablet ownership — find P(tablet | smart phone). Justify reasoning.\n- Car and job ownership survey in two-way relative frequency table — verify P(job | car) = 46.7%.\n- Exit poll results (vote by gender and age) — find mutually exclusive events, P(male 46-60 votes A), P(female votes A), P(female age 18-30 votes B), identify demographics Candidate A and B should focus on.\n- Market research: 240 adults and students, 2-D vs. 3-D movie preference.\n  - Organize into two-way frequency table.\n  - Convert to relative frequency table, round to nearest tenth. Out of every 10 surveyed, about how many prefer 3-D?\n  - Find P(3-D | adult).\n  - Verify analyst claim: P(child | does not prefer 3-D) = 10.8%.\n  - Determine if 2-D/3-D preference is independent of age.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- ![](media/image1.png) — Partial two-way table for Problem 4 (missing values to complete)\n- ![](media/image2.png) — Homework/exam two-way frequency table for Problem 5\n- ![](media/image3.png) — Movies/gender relative frequency table for Problem 6\n- ![](media/image4.png) — Technology ownership two-way table for Problem 7\n- ![](media/image5.png) — Exit poll results table for Problem 9",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule7Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule7LessonsResult> => {
    const now = Date.now();
    const results = [];

    for (const lessonData of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lessonData.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 7,
            title: lessonData.title,
            slug: lessonData.slug,
            description: lessonData.description,
            orderIndex: lessonData.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      const existingLessonVersion = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .first();

      const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
        ? existingLessonVersion._id
        : await ctx.db.insert("lesson_versions", {
            lessonId,
            version: 1,
            title: lessonData.title,
            description: lessonData.description,
            status: "published",
            createdAt: now,
          });

      let phasesCreated = 0;

      for (const phase of lessonData.phases) {
        const existingPhase = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version_and_phase", (q) =>
            q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
          )
          .first();

        if (existingPhase) continue;

        const phaseId = await ctx.db.insert("phase_versions", {
          lessonVersionId,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          estimatedMinutes: phase.estimatedMinutes,
          phaseType: phase.phaseType,
          createdAt: now,
        });

        phasesCreated++;

        for (const section of phase.sections) {
          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: section.content,
            createdAt: now,
          });
        }
      }

      results.push({
        lessonId,
        lessonVersionId,
        phasesCreated,
        activitiesCreated: 0,
      });
    }

    return { lessons: results };
  },
});