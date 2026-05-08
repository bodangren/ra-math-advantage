import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule8LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
  }>;
}

export const seedModule8Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule8LessonsResult> => {
    const now = Date.now();
    const unitNumber = 8;

    const lessonsData = [
      {
        slug: "module-8-lesson-1",
        title: "Functions and Continuity",
        orderIndex: 1,
        description:
          "Identify the domain, range, and codomain of a function; determine whether a function is one-to-one, onto, both, or neither; classify a function as discrete, continuous, or neither.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Can a Function Look Like?\n\nStudents consider functions as relationships between sets and examine how the choice of domain and codomain affects whether a function is one-to-one or onto.\n\n**Inquiry Question:**\nHow can changing the codomain change whether a function is onto?",
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
                    "## Vocabulary\n\n- **Domain** — The set of all possible input values (x-values) of a function.\n- **Range** — The set of all actual output values of a function.\n- **Codomain** — The set of all possible output values; the range is a subset of the codomain.\n- **One-to-One** — A function where each element in the domain maps to a unique element in the range; no range value is repeated.\n- **Onto (Surjective)** — A function where every element in the codomain has at least one corresponding input in the domain.\n- **Discrete Function** — A function with a domain that consists of isolated, individual points.\n- **Continuous Function** — A function with an unbroken domain, often an interval, with no gaps or jumps.",
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
                    "## Learn: Analyzing Functions\n\n### Key Concept: One-to-One and Onto\n\n- A function is **one-to-one** if each element of the domain maps to a unique element in the range — no range value is used more than once.\n- A function is **onto** if every element in the codomain has at least one preimage in the domain — the range equals the codomain.\n- A function can be one-to-one but not onto, onto but not one-to-one, both, or neither.\n\n### Key Concept: Discrete vs. Continuous\n\n- A function is **discrete** when its domain consists of isolated points (e.g., whole numbers).\n- A function is **continuous** when its domain is an unbroken interval with no gaps.\n- Some functions are neither discrete nor continuous — for example, a function with domain {1, 3, 5}.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Domain, Range, Codomain, and Determine If Onto\n\nUse the codomain and range to determine whether the function is onto.\n\n### Step 1: Examine the Graphs\n\nFor each graph, identify the domain (all x-values covered), the range (all y-values actually attained), and the codomain (as stated or implied).\n\nThe function is onto when every value in the codomain also appears in the range.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Analyze Functions from Tables\n\nDefine the domain and range of each function and state whether it is one-to-one, onto, both, or neither.\n\n### Step 1: Analyze the Sales Data\n\nA table shows Cool Athletics' Power Sneaker sales over 6 weeks.\n\n### Step 2: Interpret Temperatures\n\nA table shows low temperatures in degrees Fahrenheit for a week in Sioux Falls, Idaho.\n\n### Step 3: Examine Planetary Data\n\nA table shows the orbital period of the eight major planets given their mean distance from the Sun.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Determine One-to-One, Onto, Both, or Neither\n\nFor each graphed function, determine whether it is one-to-one, onto, both, or neither.\n\n### Step 1: Analyze Each Graph\n\nUse the vertical line test (one-to-one) and compare range to codomain (onto).",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Classify Functions as Discrete or Continuous\n\nExamine each graph. Determine whether each function is discrete, continuous, or neither discrete nor continuous. Then state the domain and range of each function.\n\n### Step 1: Identify the Type\n\nLook at the domain — is it an unbroken interval (continuous) or a set of isolated points (discrete)?",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Real-World Discrete and Continuous Functions\n\nDetermine whether the function that models each situation is discrete, continuous, or neither. Then state the domain and range.\n\n### Step 1: Probability (Rolling a Number Cube)\n\nThe outcome of rolling a number cube produces a discrete function with domain {1, 2, 3, 4, 5, 6} and range {1, 2, 3, 4, 5, 6}.\n\n### Step 2: Amusement Park Pricing\n\nTicket price based on group size is discrete because group size is measured in whole people.\n\n### Step 3: Grocery Pricing (Grapes)\n\nGrapes sold at $1.99 per pound produce a continuous function — weight can be any nonnegative real number.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Examples 6 and 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 6 and 7 — Write Domain and Range in Set-Builder and Interval Notation\n\nFor each graph, write the domain and range in both set-builder and interval notation.\n\n### Step 1: Analyze the Graphs\n\nUse the visual extent of the graph to determine which x-values and y-values are covered. Then convert to both notation forms.",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 22–39 provide practice with all skills from the lesson:\n\n- Write domain and range in set-builder and interval notation.\n- Determine whether each function is one-to-one, onto, both, or neither.\n- State whether each function is discrete, continuous, or neither.\n- Research a real-world example of a function (baseball team wins over five seasons).\n- Analyze the spring function L(w) = (1/2)w + 4 for domain, range, one-to-one, onto, and continuity.\n- Analyze cashew pricing at $12.79 per pound.\n- Examine a CPI graph and a town's annual jobless rate graph.\n- Computer calculation time function T(n) = 0.0000000015n.\n- Shipping cost table problem.\n- Sketch a function that is onto but not one-to-one with codomain [y >= -3].\n- True/false: If a function is onto, then it must be one-to-one.\n- Analyze f(x) = 1/x.\n- Use a specific domain, codomain, and range to create a function that is neither one-to-one nor onto.\n- Compare and contrast the vertical and horizontal line tests.",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- ![](media/image1.png)![](media/image2.png)![](media/image3.png) — Graphs for problems 1–3 (domain, range, codomain)\n- ![](media/image4.png) — SALES table (problem 4)\n- ![](media/image5.png)![](media/image6.png) — TEMPERATURES table and BAR GRAPH for problems 5–6\n- ![](media/image7.png)![](media/image8.png)![](media/image9.png) — Graphs for problems 7–9 (one-to-one/onto)\n- ![](media/image10.png)![](media/image11.png)![](media/image12.png) — Graphs for problems 10–12 (discrete/continuous)\n- ![](media/image13.png) — PROBABILITY table (problem 13)\n- ![](media/image14.png) — AMUSEMENT PARK table (problem 14)\n- ![](media/image15.png)![](media/image16.png)![](media/image17.png) — Graphs for problems 16–18 (domain/range notation)\n- ![](media/image18.png)![](media/image19.png)![](media/image20.png) — Graphs for problems 19–21 (domain/range notation)\n- ![](media/image21.png)![](media/image22.png)![](media/image23.png) — Mixed exercise graphs (problems 22–24)\n- ![](media/image24.png)![](media/image25.png)![](media/image26.png) — Mixed exercise graphs (problems 25–27)\n- ![](media/image27.png) — CPI graph (problem 31)\n- ![](media/image28.png) — Labor/jobless rate graph (problem 32)\n- ![](media/image29.png) — SHIPPING table (problem 34)",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-2",
        title: "Linearity, Intercepts, and Symmetry",
        orderIndex: 2,
        description:
          "Determine whether a function is linear or nonlinear; estimate and interpret x- and y-intercepts; identify symmetry in a graph and determine whether a function is even, odd, or neither.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Lines and Their Properties\n\nStudents examine what makes a function linear and how symmetry appears in different types of functions.\n\n**Inquiry Question:**\nWhat do the intercepts of a linear function tell you about the situation it models?",
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
                    "## Vocabulary\n\n- **Linear Function** — A function that can be written in the form y = mx + b, where m and b are constants; its graph is a straight line.\n- **Nonlinear Function** — Any function that does not form a straight line when graphed.\n- **x-Intercept** — The point where a graph crosses the x-axis; (a, 0).\n- **y-Intercept** — The point where a graph crosses the y-axis; (0, b).\n- **Line Symmetry (Reflectional Symmetry)** — A graph is symmetric about a line if one half is a mirror image of the other across that line.\n- **Point Symmetry (Rotational Symmetry)** — A graph has point symmetry if it looks the same after a 180° rotation about a point.\n- **Even Function** — A function where f(-x) = f(x) for all x in the domain; symmetric about the y-axis.\n- **Odd Function** — A function where f(-x) = -f(x) for all x in the domain; symmetric about the origin.",
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
                    "## Learn: Linearity, Intercepts, and Symmetry\n\n### Key Concept: Identifying Linear Functions\n\nA function is linear if it can be written as y = mx + b and its graph is a straight line. Nonlinear functions include quadratics, absolute value, radicals, and any equation where x appears with an exponent other than 1.\n\n### Key Concept: Finding Intercepts\n\n- **x-intercept:** Set y = 0 and solve for x.\n- **y-intercept:** Set x = 0 and solve for y.\n\n### Key Concept: Symmetry Types\n\n- **Line symmetry** — the graph mirrors across a vertical or horizontal line.\n- **Point symmetry** — the graph looks the same when rotated 180°.\n\n### Key Concept: Even vs. Odd Functions\n\nTest algebraically:\n- Even: f(-x) = f(x)\n- Odd: f(-x) = -f(x)",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Linear Functions\n\nDetermine whether each equation represents a linear function. Justify your answer.\n\n### Step 1: Check the Equation Form\n\n- y = 3x — linear (in the form y = mx + b)\n- y = -2 + 5x — linear\n- 2x + y = 10 — linear (rearranges to y = -2x + 10)\n- y = 4x² — nonlinear (exponent on x is 2)",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Linear vs. Nonlinear Graphs\n\nDetermine whether each graph represents a linear or nonlinear function.\n\n### Step 1: Examine the Shape\n\nLinear graphs are straight lines. Any curve or bend indicates a nonlinear function.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Tables: Linear or Nonlinear?\n\nDetermine whether the relationship in each table can be modeled by a linear or nonlinear function.\n\n### Step 1: Check for Constant Rate of Change\n\nIn a linear function, the difference in y values is constant for equal steps in x.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Examples 4 and 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 4 and 5 — Estimate Intercepts from Graphs\n\nUse the graph to estimate the x- and y-intercepts.\n\n### Step 1: Read the Intercept Values\n\nFind where the graph crosses each axis. Estimate coordinates to the nearest tenth if needed.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Interpret Intercepts in Context\n\nInterpret the x- and y-intercepts in the context of each situation.\n\n### Step 1: Money Problem (Aksa's Lunch Account)\n\nA deposit of $20 at the start of the week. The x-intercept represents when the account reaches zero; the y-intercept represents the starting balance.\n\n### Step 2: Golf Problem\n\nHeight of a golf ball after being hit off a tee. The x-intercept represents when the ball hits the ground; the y-intercept represents the initial height.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 7 — Identify Symmetry Type\n\nIdentify the type of symmetry for the graph of each function.\n\n### Step 1: Visual Inspection\n\nDetermine whether the graph has line symmetry (mirror image across a line) or point symmetry (looks the same after 180° rotation).",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Example 8",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 8 — Determine Even, Odd, or Neither\n\nDetermine whether each function is even, odd, or neither. Confirm algebraically. If the function is odd or even, describe the symmetry.\n\n### Step 1: Test with f(-x)\n\n- f(x) = 2x³ - 8x — odd (symmetric about the origin)\n- f(x) = x³ + x² — neither\n- f(x) = x² + 2 — even (symmetric about the y-axis)",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 25–44 provide additional practice:\n\n- Determine whether each equation represents a linear function; algebraically determine even, odd, or neither.\n- Analyze graphs to identify linear vs. nonlinear, estimate intercepts, and identify symmetry.\n- Games: racquetball ball motion across a screen (line or point symmetry).\n- Basketball: height of a tossed basketball — would the graph have symmetry if extended to all real numbers?\n- Profit problem: Stefon charges $25 to test air quality, device costs $500. Linear function y = 25x - 500.\n- Playgrounds: perimeter problem involving line or point symmetry.\n- Pools: draining a 720-gallon pool — intercepts and symmetry in context.\n- Volume of a sphere: f(r) = (4/3)πr³ — odd function.\n- Find a car's braking distance equation.\n- Find the error: Javier's claim that all cubic functions are odd.\n- Analyze a gift-wrapping table to determine linearity.\n- Determine whether x = a is always, sometimes, or never a linear function.\n- Which one doesn't belong? Four functions shown.",
                },
              },
            ],
          },
          {
            phaseNumber: 12,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- ![](media/image1.png)![](media/image2.png) — Graphs for problems 5–6\n- ![](media/image3.png)![](media/image4.png) — Graphs for problems 7–8\n- ![](media/image5.png) — MEASUREMENT table (problem 9)\n- ![](media/image6.png) — ASTRONOMY table (problem 10)\n- ![](media/image7.png)![](media/image8.png)![](media/image9.png) — Graphs for problems 11–13\n- ![](media/image10.png)![](media/image11.png)![](media/image12.png) — Graphs for problems 14–16\n- ![](media/image13.png) — MONEY table (problem 17)\n- ![](media/image14.png) — GOLF table (problem 18)\n- ![](media/image15.png)![](media/image16.png)![](media/image17.png) — Graphs for problems 19–21\n- ![](media/image18.png)![](media/image19.png)![](media/image20.png) — Graphs for problems 22–24\n- ![](media/image21.png)![](media/image22.png)![](media/image23.png) — Mixed exercise graphs (problems 31–33)\n- ![](media/image24.png) — Graph for problem 34\n- ![](media/image25.png) — GAMES graph (problem 34)\n- ![](media/image26.png) — BASKETBALL graph (problem 35)\n- ![](media/image27.png) — PLAYGROUNDS diagram (problem 37)\n- ![](media/image28.png) — ANALYZE table (problem 42)\n- ![](media/image29.png) — WHICH ONE DOESN'T BELONG graphs (problem 44)",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-3",
        title: "Extrema and End Behavior",
        orderIndex: 3,
        description:
          "Identify and estimate relative maxima and minima (extrema) from a graph; describe the end behavior of a function; connect extrema and end behavior to real-world contexts.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Reading Graphs at the Extremes\n\nStudents consider what the highest and lowest points on a graph tell us and how the behavior at the edges of a graph relates to the function's nature.\n\n**Inquiry Question:**\nHow does the end behavior of a polynomial relate to the degree and leading coefficient of the polynomial?",
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
                    "## Vocabulary\n\n- **Relative Maximum** — A point where a function changes from increasing to decreasing; a \"peak\" in the graph.\n- **Relative Minimum** — A point where a function changes from decreasing to increasing; a \"valley\" in the graph.\n- **Extrema** — Collective term for relative maxima and minima.\n- **End Behavior** — The behavior of a function as x approaches very large positive values (infinity) or very large negative values (-infinity).",
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
                    "## Learn: Extrema and End Behavior\n\n### Key Concept: Identifying Extrema\n\nRelative maxima and minima are found where the function changes direction. Estimate x- and y-values to the nearest tenth when necessary.\n\n### Key Concept: End Behavior Patterns\n\n- Even-degree polynomials: both ends go the same direction.\n- Odd-degree polynomials: ends go in opposite directions.\n- Positive leading coefficient (even degree): as x → ±∞, f(x) → +∞\n- Negative leading coefficient (even degree): as x → ±∞, f(x) → -∞\n- Positive leading coefficient (odd degree): as x → -∞, f(x) → -∞ and as x → +∞, f(x) → +∞\n- Negative leading coefficient (odd degree): as x → -∞, f(x) → +∞ and as x → +∞, f(x) → -∞",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Examples 1 and 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 1 and 2 — Identify and Estimate Extrema\n\nIdentify and estimate the x- and y-values of the extrema. Round to the nearest tenth if necessary.\n\n### Step 1: Read the Graph\n\nFind the peaks and valleys. Record the coordinates.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Examples 3–5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 3–5 — Describe End Behavior\n\nDescribe the end behavior of each function.\n\n### Step 1: Analyze the Graph's Ends\n\nLook at both the left and right ends of the graph and describe where f(x) goes as x goes to ±∞.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Interpret End Behavior in Context\n\nThe roller coaster problem describes the height of a coaster as a function of distance from the start.\n\n### Step 1: Contextualize the Ends\n\nAs the coaster moves away from the start, its height eventually decreases — interpret what happens to height as distance increases.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 11–35 provide additional practice:\n\n- Model problem: fish thrown to a dolphin from a 64-foot platform with h(t) = -16t² + 48t + 64.\n- Estimate extrema and describe end behavior for multiple graphs.\n- Bubbles: volume formula V = 4πr² — describe end behavior.\n- Science: water density at various temperatures — interpret end behavior as temperature increases.\n- Use a graphing calculator to estimate x-coordinates of extrema for polynomial functions.\n- CONSTRUCT ARGUMENTS: Sheena's claim about relative maxima at B and G and relative minimum at A.\n- Chemistry: dynamic pressure q(v) = (1/2)pv² — what happens as velocity increases?\n- Engineering: watermelon launched from a catapult — appropriate domain, maximum height, when it occurs.\n- Drilling: drill bit volume V = (√3/9)πr³ — describe end behavior.\n- Table of values — describe end behavior.\n- Reaction rate: R(x) = (0.5x)/(x + 10) — interpret end behavior in context.\n- Sketch a graph with 2 relative maxima, 2 relative minima, and specific end behavior.\n- FIND THE ERROR: Joshua's incorrect end behavior description.",
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
                    "## Review Notes\n\n- ![](media/image1.png)![](media/image2.png) — Graphs for problems 1–2 (extrema)\n- ![](media/image3.png)![](media/image4.png) — Graphs for problems 3–4 (extrema)\n- ![](media/image5.png) — LANDSCAPES graph (problem 5)\n- ![](media/image6.png)![](media/image7.png) — Graphs for problems 6–7 (end behavior)\n- ![](media/image8.png)![](media/image9.png) — Graphs for problems 8–9 (end behavior)\n- ![](media/image10.png) — ROLLER COASTER graph (problem 10)\n- ![](media/image11.png) — MODEL problem graph (problem 11)\n- ![](media/image12.png)![](media/image13.png) — Graphs for problems 12–13 (extrema and end behavior)\n- ![](media/image14.png)![](media/image15.png) — Graphs for problems 14–15 (extrema and end behavior)\n- ![](media/image16.png)![](media/image17.png) — Graphs for problems 16–17 (extrema and end behavior)\n- ![](media/image18.png) — BUBBLES graph (problem 18)\n- ![](media/image19.png) — SCIENCE water density table (problem 19)\n- ![](media/image20.png)![](media/image21.png) — Graphs for problems 20–21 (extrema and end behavior)\n- ![](media/image22.png) — CONSTRUCT ARGUMENTS graph (problem 26)\n- ![](media/image23.png) — CHEMISTRY graph (problem 27)\n- ![](media/image24.png) — Graph for problem 28\n- ![](media/image25.png) — ENGINEERING catapult graph (problem 28)\n- ![](media/image26.png) — Table of values (problem 30)\n- ![](media/image27.png) — Graph for problem 33 (catalyst reaction rate)\n- ![](media/image28.png) — Graph for problem 34 (sketch with 2 maxima and 2 minima)",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-4",
        title: "Sketching Graphs and Comparing Functions",
        orderIndex: 4,
        description:
          "Use key features (intercepts, linearity, continuity, symmetry, extrema, end behavior) to sketch the graph of a function; compare key features of functions represented in different formats; model real-world situations.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Building Graphs from Descriptions\n\nStudents consider how to translate a verbal description of key features into a sketch of the graph.\n\n**Inquiry Question:**\nHow can you use key features to sketch a graph if you don't have an equation?",
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
                    "## Vocabulary\n\n- **Key Features** — Important characteristics of a function including x-intercept, y-intercept, linearity, continuity, symmetry, positive/negative intervals, increasing/decreasing intervals, extrema, and end behavior.\n- **Set-Builder Notation** — A way to describe a set by specifying the conditions that all members satisfy, e.g., {x | x > 2}.\n- **Interval Notation** — A way to describe an interval using brackets: parentheses for open endpoints, brackets for closed endpoints.",
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
                    "## Learn: Sketching Graphs from Key Features\n\n### Key Concept: Key Features to Identify\n\n- **x-intercept(s):** where the graph crosses the x-axis\n- **y-intercept:** where the graph crosses the y-axis\n- **Linearity:** linear (straight line) or nonlinear\n- **Continuity:** continuous (no breaks) or discrete (isolated points)\n- **Positive/Negative:** where the graph is above/below the x-axis\n- **Increasing/Decreasing:** where the function rises or falls as you move left to right\n- **Symmetry:** line symmetry (about a vertical/horizontal line) or point symmetry\n- **Extrema:** relative maxima and minima\n- **End Behavior:** what happens to f(x) as x → ±∞\n\n### Key Concept: Sketching from Key Features\n\n1. Plot the intercepts.\n2. Determine whether the function is linear or nonlinear.\n3. Identify positive/negative regions and increasing/decreasing behavior.\n4. Draw the graph consistent with all features, including end behavior.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Examples 1 and 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 1 and 2 — Sketch from Key Features\n\nUse the given key features to sketch each graph.\n\n### Step 1: Plot Key Points and Determine Shape\n\n- Problem 1: x-intercept (2, 0), y-intercept (0, -6), linear, continuous, positive for x > 2, increasing for all x, end behavior both infinity.\n- Problem 2: x-intercept (0, 0), y-intercept (0, 0), linear, continuous, positive for x < 0, negative for x > 0, decreasing for all x, end behavior opposite.\n- Problems 3–8: continue with various combinations of linear and nonlinear functions with different key feature sets.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Real-World Graph Sketches\n\nUse key features to sketch graphs for real-world situations.\n\n### Step 1: Pelicans\n\nA pelican descends from 6 feet to 0 feet over 3 seconds. Linear function.\n\n### Step 2: Scooters\n\nGreg's scooter ride: starts at 0 mph, reaches 35 mph at 5 minutes, speed behavior over 20 minutes with increases and decreases.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Examples 4 and 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 4 and 5 — Compare Functions Across Representations\n\nCompare the key features of functions represented with a graph, a table, and a verbal description.\n\n### Step 1: Graph and Table Comparison\n\n### Step 2: Graph and Verbal Description\n\n### Step 3: Table and Verbal Description\n\n### Step 4: More Comparisons",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 17–27 provide additional practice:\n\n- USE A MODEL: Sketch a linear function with specific key features.\n- WATER: Sia fills a pitcher from 0 to 64 ounces in 8 seconds, linear function.\n- USE TOOLS: Monica walks for 60 minutes, maximum 2 miles from home at 30 minutes, then returns.\n- USE A SOURCE: Research a new car's depreciation over time.\n- SKI LIFTS: A ski lift descends from 1800 feet to ground level in 4 minutes.\n- CONSTRUCT ARGUMENTS: Keisha babysitting at $9/hour — why does the graph only exist for positive x and y?\n- CREATE: Choose a function, list key features, and sketch it.\n- WRITE: Describe the relationship between slope of a linear function and increasing/decreasing.\n- ANALYZE: Determine if a graph with more than one x-intercept must be nonlinear.\n- PERSEVERE: Deborah fills a tub — maximum 50 gallons at 10 minutes, then decreases to 0 at 30 minutes.\n- FIND THE ERROR: Linda and Rubio's conflicting sketches for the same key features.",
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
                    "## Review Notes\n\n- ![](media/image1.png) — Graph and table comparison (problem 11)\n- ![](media/image2.png) — Graph and verbal comparison (problem 12)\n- ![](media/image3.png) — Table and verbal comparison (problem 13)\n- ![](media/image4.png) — Graph and verbal comparison (problem 14)\n- ![](media/image5.png) — Table and verbal comparison (problem 15)\n- ![](media/image6.png) — Graph and table comparison (problem 16)\n- ![](media/image7.png) — SKI LIFTS graph (problem 21)\n- ![](media/image8.png) — PERSEVERE Deborah's tub graph (problem 26)",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-5",
        title: "Graphing Linear Functions and Inequalities",
        orderIndex: 5,
        description:
          "Graph linear equations using a table, intercepts, or slope-intercept form y = mx + b; graph linear inequalities and identify the solution set; apply linear equations and inequalities to real-world resource and constraint problems.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Lines and Half-Planes\n\nStudents consider how the graph of a linear inequality differs from a linear equation and what determines which side of the boundary line is shaded.\n\n**Inquiry Question:**\nHow does the inequality symbol determine which side of the boundary line is part of the solution set?",
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
                    "## Vocabulary\n\n- **Slope-Intercept Form** — y = mx + b, where m is the slope and b is the y-intercept.\n- **x-Intercept** — The point where the line crosses the x-axis; found by setting y = 0.\n- **y-Intercept** — The point where the line crosses the y-axis; found by setting x = 0.\n- **Boundary Line** — The line that defines the boundary of an inequality; dashed for > or <, solid for ≥ or ≤.\n- **Solution Set** — The set of all points that satisfy an inequality.",
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
                    "## Learn: Graphing Linear Functions and Inequalities\n\n### Key Concept: Three Methods for Graphing Lines\n\n1. **Table method:** Choose x-values, compute y-values, plot points, draw line.\n2. **Intercept method:** Find where the line crosses each axis, plot those points, draw the line through them.\n3. **Slope-intercept method (m and b):** Plot the y-intercept (0, b), use the slope m to find another point, draw the line.\n\n### Key Concept: Graphing Linear Inequalities\n\n1. Graph the boundary line (solid for ≤ / ≥, dashed for < / >).\n2. Test a point not on the line (commonly the origin) to determine which side to shade.\n3. Shade the appropriate half-plane.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Graph Using a Table\n\nGraph each equation by using a table.\n\n### Step 1: Make a Table of Values\n\nChoose x-values, compute corresponding y-values, plot the points, and connect them.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Graph Using Intercepts\n\nGraph each equation by using the x- and y-intercepts.\n\n### Step 1: Find Both Intercepts\n\nSet y = 0 to find the x-intercept; set x = 0 to find the y-intercept. Plot both and draw the line through them.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Graph Using m and b\n\nGraph each equation by using m and b.\n\n### Step 1: Identify m and b\n\nWrite each equation in the form y = mx + b, identify m and b, plot the y-intercept, use the slope to find another point, draw the line.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Examples 4 and 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 4 and 5 — Graph Inequalities\n\nGraph each inequality.\n\n### Step 1: Graph the Boundary, then Shade",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Real-World Inequality Problems\n\nWrite and graph inequalities for real-world constraint situations.\n\n### Step 1: CRAFT FAIR\n\nKylie wants to sell two paintings for at least $400 total. If x is the price of the first painting and y is the price of the second: x + y ≥ 400.\n\n### Step 2: BUILDING CODES\n\nBuilding height must be less than 0.1x, where x is distance in hundreds of feet from the park center: y < 0.1x.\n\n### Step 3: WEIGHT\n\nTruck weight limit: 200t + 60c < 1200, where t is tables and c is chairs.\n\n### Step 4: ART\n\nArtist sells drawings at $100 and watercolors at $400, wants at least $2000: 100d + 400w ≥ 2000.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 35–65 provide extensive practice:\n\n- Graph equations and inequalities (problems 35–52).\n- ANIMALS: Horse needs 36 liters/day, sheep needs 3.6 liters/day, farmer has 300 liters total. Write and graph equation or inequality.\n- COMPUTERS: Desktops at $1000, notebooks at $1200, budget max $80,000.\n- BAKED GOODS: Mary sells chocolate chip cookies at $1.25 and peanut butter at $1.00, wants at least $25/day.\n- FUNDRAISING: Drama club costs $400 to put on a play, 300 students and 150 adults attend, want $1400 profit.\n- CONSTRUCTION: Rectangular sandbox with no more than 20 linear feet of lumber.\n- SPIRITWEAR: Long-sleeved shirts profit $7, short-sleeved profit $4, want at least $280 profit.\n- MONEY: Gemma buys candles at $9 and soaps at $4, needs at least $50 for free shipping.\n- FIND THE ERROR: Paulo and Janette's graphs of x - y ≥ 2.\n- CREATE: Write an inequality with a dashed boundary line.\n- ANALYZE: Counterexample for \"every point in the first quadrant is a solution for 3y > -x + 6.\"\n- PERSEVERE: Write an equation of a line with the same slope as 2x - 8y = 7 and the same y-intercept as 4x + 3y = 15.",
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
                    "## Review Notes\n\n- ![](media/image1.png) — FIND THE ERROR problem graph (problem 61)",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-6",
        title: "Special Functions",
        orderIndex: 6,
        description:
          "Graph piecewise-defined functions and identify their key features; graph and analyze greatest integer (floor) functions; graph and analyze absolute value functions; apply special functions to real-world situations.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: When Different Rules Apply\n\nStudents consider situations where the rule governing a relationship changes depending on the input — for example, pricing that changes at quantity thresholds.\n\n**Inquiry Question:**\nWhy do real-world situations often result in piecewise functions rather than a single algebraic rule?",
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
                    "## Vocabulary\n\n- **Piecewise Function** — A function defined by different rules for different parts of its domain.\n- **Greatest Integer Function (Floor Function)** — ⌊x⌋ equals the greatest integer less than or equal to x.\n- **Absolute Value Function** — A function of the form f(x) = |x|; outputs the distance of x from 0.\n- **Step Function** — A function that jumps or steps from one value to another; greatest integer functions are step functions.",
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
                    "## Learn: Special Functions\n\n### Key Concept: Piecewise Functions\n\nA piecewise function uses different expressions for different intervals of the domain. The notation indicates which expression applies in which interval.\n\n### Key Concept: Greatest Integer Functions\n\n⌊x⌋ rounds down to the nearest integer. Graphing f(x) = ⌊x⌋ produces a step function with jumps at each integer.\n\n### Key Concept: Absolute Value Functions\n\nf(x) = |x| produces a V-shaped graph that is symmetric about the y-axis. Transformations shift, stretch, and reflect this graph.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Graph a Piecewise Function\n\nGraph each function. Then analyze the key features.\n\n### Step 1: Graph Each Piece\n\nFor f(x) = {-1 if x ≤ 0; 2x if 0 < x ≤ 3; 6 if x > 3}, draw each branch in its corresponding domain interval.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Another Piecewise Function\n\nGraph f(x) = {-x if x < -1; 0 if -1 ≤ x ≤ 1; x if x > 1} and analyze its key features.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Write a Piecewise Function from a Description\n\n### Step 1: TILE\n\nMark buys tile at $48/box for 3 or fewer, $45/box for 4–8 boxes, $42/box for 9–19 boxes, $38/box for more than 19.\n\nf(x) = {48x if x ≤ 3; 45x if 3 < x ≤ 8; 42x if 8 < x ≤ 19; 38x if x > 19}\n\n### Step 2: BOOKLETS\n\nDigital media company orders booklets with quantity discounts and a $10 shipping charge per order.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Examples 3 and 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 3 and 4 — Graph Greatest Integer Functions\n\nGraph each function. State the domain and range.\n\n### Step 1: Identify the Steps\n\nf(x) = ⌊x⌋ - 6, h(x) = ⌊3x⌋ - 8, f(x) = ⌊x + 1⌋, f(x) = ⌊x - 3⌋",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Examples 5 and 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 5 and 6 — Graph Absolute Value Functions\n\nGraph each function. State the domain and range.\n\n### Step 1: Apply Transformations\n\nf(x) = |x - 5|, g(x) = |x + 2|, h(x) = |2x| - 8, k(x) = |-3x| + 3, f(x) = 2|x - 4| + 6, h(x) = -3|0.5x + 1| - 2",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 21–54 provide extensive practice:\n\n- Graph piecewise functions and identify domain and range.\n- PARKING: Rates at $5 for 2 hours or less, $10 for 4 hours or less, $15 for 6 hours or less, $20 for 8 hours or less.\n- BOWLING: $30 for 1 hour or less, $45 for 2 hours or less, $60 for unlimited after 2 hours.\n- FINANCE: 5% commission on every transaction modeled with absolute value.\n- GAMING: Monthly fee graph — write the function.\n- ROUNDING: Write a formula for rounding measurements.\n- REUNIONS: Banquet hall $500 plus $17.50/guest for first 40, $14.75/guest thereafter. Maximum guests on a $900 budget.\n- SAVINGS: v = 200⌊m⌋ — how much after 105 days?\n- POLITICS: Approval rating graph over a 9-month term — formulate piecewise function.\n- STRUCTURE: Compare f(x) = 3⌊x⌋ vs g(x) = ⌊3x⌋ for 0 ≤ x ≤ 2. Same for 4.\n- Write piecewise-defined functions from given graphs (problems 42–45).\n- SKYSCRAPERS: Window cleaning carriage at 0.75 floor/hour: f(t) = |0.75t - 12|.\n- TAXIS: Table of cost vs. miles — graph, state domain and range.\n- WALKING: Jackson walks away from home 2 miles in 20 minutes, returns in 30 minutes — absolute value or piecewise model?\n- CREATE: Write an absolute value relation with domain all nonnegative numbers and range all real numbers.\n- PERSEVERE: Graph |y| = 2|x + 3| - 5.\n- ANALYZE: Counterexample to \"round x to nearest integer to find ⌊x⌋ when x is not an integer.\"\n- CREATE: Write an absolute value function where f(5) = -3.",
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
                    "## Review Notes\n\n- ![](media/image1.png) — FINANCE graph (problem 34)\n- ![](media/image2.png) — POLITICS approval rating graph (problem 39)\n- ![](media/image3.png)![](media/image4.png) — Write piecewise from graphs (problems 42–43)\n- ![](media/image5.png)![](media/image6.png) — Write piecewise from graphs (problems 44–45)\n- ![](media/image7.png) — TAXIS table (problem 47)",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-7",
        title: "Transformations of Functions",
        orderIndex: 7,
        description:
          "Describe translations (shifts) of functions as they relate to the parent function; describe dilations and reflections; write equations for transformed functions given their graphs; apply transformations to real-world situations.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Moving the Graph\n\nStudents consider how changing the equation of a function shifts, stretches, or flips its graph relative to the parent function.\n\n**Inquiry Question:**\nHow can you look at an equation and know exactly how the graph will be transformed?",
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
                    "## Vocabulary\n\n- **Parent Function** — The simplest function in a family of functions (e.g., y = x², y = |x|, y = x³).\n- **Translation (Shift)** — A transformation that moves a graph horizontally or vertically without changing its shape.\n- **Dilation** — A transformation that stretches or compresses a graph.\n- **Reflection** — A transformation that flips a graph across a line (typically the x-axis or y-axis).\n- **Horizontal Translation** — A shift left or right; occurs when a value is added or subtracted inside the function (e.g., y = (x - h)²).\n- **Vertical Translation** — A shift up or down; occurs when a value is added or subtracted outside the function (e.g., y = x² + k).",
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
                    "## Learn: Transformations of Functions\n\n### Key Concept: Translation Patterns\n\n- y = x² + k — vertical shift up by k (or down if k is negative)\n- y = x² - h — horizontal shift right by h (note: y = (x - h)² shifts right by h)\n- y = |x| + k — vertical shift\n- y = |x + h| — horizontal shift left by h\n\n### Key Concept: Dilation and Reflection Patterns\n\n- y = ax² — vertical dilation (stretch if |a| > 1, compress if 0 < |a| < 1)\n- y = -ax² — reflection across the x-axis combined with dilation\n- y = (bx)² — horizontal dilation (compress if |b| > 1, stretch if 0 < |b| < 1)\n- y = -|x| — reflection across the x-axis\n- y = |-x| — reflection across the y-axis\n\n### Key Concept: Combined Transformations\n\nWhen multiple transformations are present, apply them in order: horizontal shifts, dilations/reflections, then vertical shifts.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Describe Translations\n\nDescribe each translation as it relates to the graph of the parent function.\n\n### Step 1: Identify the Type of Shift\n\n- y = x² + 4 — shift up 4\n- y = |x| - 3 — shift down 3\n- y = x - 1 — shift right 1\n- y = x + 2 — shift left 2\n- y = (x - 5)² — shift right 5\n- y = |x + 6| — shift left 6",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write Equations from Graphs\n\nUse the graph of each translated parent function to write its equation.\n\n### Step 1: Identify the Parent Function and the Shift\n\nDetermine which parent function the graph comes from, then measure how it has been shifted.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Examples 3 and 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 3 and 4 — Describe Dilations and Reflections\n\nDescribe each dilation and reflection as it relates to the parent function.\n\n### Step 1: Analyze the Transformation\n\n- y = (-3x)² — horizontal compression by factor of 3, then reflection over y-axis (net effect equals y = 9x²)\n- y = -6x — reflection over x-axis, vertical stretch\n- y = -4|x| — reflection over x-axis, vertical stretch by factor of 4\n- y = |-2x| — horizontal compression by factor of 2, then reflection over y-axis (net effect: V-shape opening up)\n- y = -(2/3)x — reflection over x-axis, dilation\n- y = -(1/2)x² — reflection over x-axis, vertical compression",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Describe Combined Transformations\n\nDescribe each transformation as it relates to the graph of the parent function.\n\n### Step 1: Break Down the Transformation\n\n- y = -6|x| - 4 — reflect over x-axis, vertical stretch 6, shift down 4\n- y = 3x + 11 — slope increase from 1 to 3, shift up 11 (but this is a linear function, not a dilation of y = x in the traditional sense)\n- y = (1/3)x² - 2 — vertical compression by 1/3, shift down 2\n- y = (1/2)|x - 1| + 14 — horizontal shift right 1, vertical compression 1/2, shift up 14\n- y = -0.8(x + 3) — shift left 3, reflection/dilation\n- y = (1.5x)² + 22 — horizontal stretch, shift up 22",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Real-World Transformation Problems\n\n### Step 1: BILLIARDS\n\ng(x) = |0.5x| models a cue ball path. The absolute value creates the V-shape; the 0.5 compresses it horizontally. The x-axis represents the edge of the table.\n\n### Step 2: SALAD\n\nc(x) = 4.5 + 0.32x — vertical shift up 4.5 and slope 0.32 (linear, not a transformation of a parent quadratic or absolute value function in the traditional sense).\n\n### Step 3: TRAVEL\n\nc(x) = 0.75|x| + 25 — absolute value makes cost the same east or west; shift up 25 represents base fare.\n\n### Step 4: ARCHERY\n\nh(x) = -0.03x² + 6 — this is a vertical dilation (compress by 0.03), reflection over x-axis (negative), and vertical shift up 6 of y = x².",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 7 — Write Equations from Graphs\n\nWrite an equation for each function.\n\n### Step 1: Identify the Parent Function and All Transformations\n\nDetermine the parent function, then measure each transformation from the graph.",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nProblems 37–59 provide extensive practice:\n\n- Describe and graph transformations: y = |x| - 2, y = (x + 1)², y = -x, y = -|x|, y = 3x, y = 2x².\n- Describe the translation in y = x² - 4.\n- Describe the reflection in y = -x³.\n- Describe the type of transformation in f(x) = (5x)².\n- ARCHITECTURE: Write an absolute value function for a roof cross-section.\n- SPEED: y = |x - 8| — difference between actual and displayed speed.\n- GRAPHIC DESIGN: f(x) = -1.25(x - 1)² + 18.75 — describe all transformations.\n- GEOMETRY: Perimeter of a square as side length increases — relation to y = x.\n- BUSINESS: Maria's income as a function of hours worked — modification of y = x.\n- ANALYZE: What determines whether a transformation affects the graph vertically or horizontally?\n- PERSEVERE: Model rocket launch — identify function type, axis of reflection, translations, and write the equation.\n- ANALYZE: Graph g(x) = -3|x + 5| - 1 — describe transformations and state domain and range.\n- ANALYZE: f(x) = |2x|, g(x) = x + 2, h(x) = 2x², k(x) = 2x³ — graph each with its y-axis reflection and determine even/odd.\n- PERSEVERE: Horizontal then vertical translation vs. vertical then horizontal — do they produce the same result?\n- CREATE: Draw a graph in Quadrant II, then use transformations to move it to Quadrant IV.\n- WRITE: Explain why g(x) = (-x)² appears the same as f(x) = x². Is this always true for quadratic reflections?",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- ![](media/image1.png)![](media/image2.png) — Graphs for problems 7–8\n- ![](media/image3.png)![](media/image4.png) — Graphs for problems 9–10\n- ![](media/image5.png)![](media/image6.png) — Graphs for problems 11–12\n- ![](media/image7.png) — Write equation from graph (problem 31)\n- ![](media/image8.png) — Write equation from graph (problem 32)\n- ![](media/image9.png)![](media/image10.png) — Graphs for problems 33–34\n- ![](media/image11.png)![](media/image12.png) — Graphs for problems 35–36\n- ![](media/image13.png) — ARCHITECTURE roof figure (problem 46)\n- ![](media/image14.png) — GEOMETRY graph (problem 49)\n- ![](media/image15.png) — BUSINESS Maria income graph (problem 51)\n- ![](media/image16.png) — PERSEVERE model rocket graph (problem 53)",
                },
              },
            ],
          },
        ],
      },
    ];

    const results = [];

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
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
            title: lesson.title,
            description: lesson.description,
            status: "published",
            createdAt: now,
          });

      let phasesCreated = 0;

      for (const phase of lesson.phases) {
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
        slug: lesson.slug,
        phasesCreated,
      });
    }

    return { lessons: results };
  },
});
