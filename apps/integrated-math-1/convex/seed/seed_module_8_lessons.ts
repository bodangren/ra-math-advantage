import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedResult {
  lessonsCreated: number;
  phasesCreated: number;
}

export const seedModule8Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedResult> => {
    const now = Date.now();

    const lessonsData = [
      {
        slug: "module-8-lesson-1",
        title: "Exponential Functions",
        description:
          "Students analyze exponential functions, identifying key features like initial value, growth/decay factor, domain, range, and asymptote, and compare them to linear functions.",
        orderIndex: 1,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Exponential function** — A function of the form [ y = ab^x ], where [ a \\ne 0 ], [ b > 0 ], and [ b \\ne 1 ].\n- **Exponential growth** — A situation modeled by an exponential function with base [ b > 1 ], where values increase over time.\n- **Exponential decay** — A situation modeled by an exponential function with base [ 0 < b < 1 ], where values decrease over time.\n- **Half-life** — The time required for a quantity to decrease to half its initial value.\n- **Asymptote** — A line that a graph approaches but never touches; for basic exponential functions, the horizontal asymptote is [ y = 0 ].\n- **Common ratio** — The constant factor by which each term in an exponential sequence is multiplied to get the next term.\n- **Initial value** — The value of [ y ] when [ x = 0 ], represented by the parameter [ a ] in [ y = ab^x ].",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Recognizing Exponential Behavior",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Recognizing Exponential Behavior\n\nTo determine whether a table displays exponential behavior, check whether the ratio of successive outputs is constant.\n\n### Key Concept: Common Ratio Test\n\n- For equally spaced [ x ]-values, divide each [ y ]-value by the previous [ y ]-value.\n- If the ratio is constant, the data is exponential.\n- If the ratio is not constant (for example, first differences are constant), the data may be linear instead.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn: Key Features of Exponential Functions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Key Features of Exponential Functions\n\nExponential functions have a distinctive shape and predictable properties that make them useful for modeling growth and decay.\n\n### Key Concept: Exponential Function Features\n\n- The graph passes through [ (0, a) ], so the [ y ]-intercept is the initial value [ a ].\n- The domain is all real numbers: [ (-\\infty, \\infty) ].\n- The range depends on the sign of [ a ]: if [ a > 0 ], range is [ (0, \\infty) ]; if [ a < 0 ], range is [ (-\\infty, 0) ].\n- The horizontal asymptote is [ y = 0 ] unless the function is shifted vertically.\n- For [ b > 1 ], the function shows growth; for [ 0 < b < 1 ], it shows decay.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1: Identify Exponential Behavior from Data",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Exponential Behavior from Data\n\nDetermine whether a given table of values represents an exponential relationship. Write yes or no and explain.\n\n### Step 1: Check the Common Ratio\n\nFor a table with equally spaced [ x ]-values, divide consecutive [ y ]-values to test for a constant ratio.\n\nFor example, given:\n[\n\\begin{array}{c|c}\nx & y \\\\\n\\hline\n0 & 3 \\\\\n1 & 6 \\\\\n2 & 12 \\\\\n3 & 24 \\\\\n\\end{array}\n]\n\nCompute ratios:\n[\n\\frac{6}{3} = 2, \\quad \\frac{12}{6} = 2, \\quad \\frac{24}{12} = 2\n]\n\nSince the ratio is constant, the data displays exponential behavior.\n\n### Step 2: Explain the Reasoning\n\nState whether the relationship is exponential based on the common ratio test. If the ratios are not constant, identify what type of relationship the data does represent (for example, linear if first differences are constant).\n\n### Application: Picture Frames\n\nA table shows the relationship between picture area and frame length for a line of frames. Apply the common ratio test to determine whether the relationship is exponential and justify the answer.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Examples 2 and 3: Analyze Exponential Functions in Context",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 2 and 3 — Analyze Exponential Functions in Context\n\nGiven an exponential function that models a real-world situation, identify key features, graph the function, and determine the relevant domain and range.\n\n### Step 1: Identify Key Features\n\nFor a function such as:\n[\ny = 1000(2)^{0.3x}\n]\n\nIdentify:\n- Initial value: [ a = 1000 ] \n- Base: [ b = 2 ] \n- Growth or decay: since [ b > 1 ], this is exponential growth\n- Horizontal asymptote: [ y = 0 ] \n\nFor a half-life function such as:\n[\ny = 50\\left(\\frac{1}{2}\\right)^{\\frac{x}{8.02}}\n]\n\nIdentify:\n- Initial amount: [ a = 50 ] milligrams\n- Decay factor: [ \\frac{1}{2} ] \n- Half-life: [ 8.02 ] days\n- Horizontal asymptote: [ y = 0 ] \n\n### Step 2: Graph the Function\n\nPlot the [ y ]-intercept at [ (0, a) ]. Use the growth or decay factor to find additional points. Sketch a smooth curve approaching the horizontal asymptote.\n\n### Step 3: Identify Relevant Domain and Range\n\nFor real-world contexts, the domain is often restricted to non-negative values:\n[\n\\text{Domain: } \\lbrack 0, \\infty)\n]\n\nThe range depends on the initial value and whether the function represents growth or decay:\n[\n\\text{Range: } (0, a] \\text{ for decay, or } [a, \\infty) \\text{ for growth}\n]\n\n### Step 4: Evaluate the Function\n\nTo find a value at a specific input, substitute into the equation. For example, given:\n[\ny = 4000(0.87)^x\n]\n\nto find the value 5 years after purchase, evaluate:\n[\ny = 4000(0.87)^5\n]\n\nRound to the nearest dollar as appropriate.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with exponential functions. Students graph functions, find [ y ]-intercepts, and state the domain, range, and equation of the horizontal asymptote. The exercises include functions with various bases and coefficients, such as:\n[\ny = 2\\left(\\frac{1}{6}\\right)^x, \\quad y = \\left(\\frac{1}{12}\\right)^x, \\quad y = -3(9)^x, \\quad y = -4(10)^x, \\quad y = 3(11)^x, \\quad y = 4^x + 3\n]\n\nWord problems apply exponential functions to atmospheric pressure, requiring students to evaluate the function at sea level and at a given altitude and to describe how pressure changes as altitude increases. Additional problems ask students to compare exponential and linear functions using tables and graphs, create an exponential function passing through two given points, analyze whether an exponential graph can have an [ x ]-intercept, and write a real-world situation modeled by an exponential function.",
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
                    "## Review Notes\n\n- Problems 1–4 contain tables of values presented as images; the specific [ x ] and [ y ] values were not transcribed. A human reviewer should verify the table contents from the original worksheet.\n- Problem 5 contains a table (picture area versus frame length) presented as an image; the specific values should be verified from the original worksheet.\n- Graphing grids for problems 6b, 7b, and 9–14 are presented as images and cannot be displayed in this source file. These are standard coordinate-plane grids for hand-sketching exponential curves.\n- The half-life of Iodine 131 is stated as approximately 8.02 days in the original worksheet.\n- The meteorology problem uses the function [ f(x) = 1038(1.000134)^{-x} ] for atmospheric pressure at altitude [ x ] meters, where [ 0 \\le x \\le 10{,}000 ].",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-2",
        title: "Transformations of Exponential Functions",
        description:
          "Students describe and apply transformations to exponential functions, write equations from graphs, and model real-world situations involving exponential growth and decay.",
        orderIndex: 2,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Parent function** — The simplest form of a function in a family, e.g. [ f(x) = b^x ] \n- **Vertical translation (shift)** — A transformation of the form [ g(x) = f(x) + k ] that moves the graph up or down\n- **Horizontal translation (shift)** — A transformation of the form [ g(x) = f(x - h) ] that moves the graph left or right\n- **Vertical stretch/compression** — A transformation of the form [ g(x) = a \\cdot f(x) ] that scales the output values\n- **Horizontal stretch/compression** — A transformation of the form [ g(x) = f(cx) ] that scales the input values\n- **Reflection** — A transformation that flips the graph over an axis; [ g(x) = -f(x) ] reflects over the [ x ]-axis and [ g(x) = f(-x) ] reflects over the [ y ]-axis\n- **Dilation** — A stretch or compression of a graph by a scale factor\n- **Depreciation** — The decrease in the value of an item over time due to age or wear",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Transformations of Exponential Functions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Transformations of Exponential Functions\n\nExponential functions can be transformed in the same ways as other function families. Understanding how each parameter affects the graph allows you to predict and describe changes.\n\n### Key Concept: General Form of a Transformed Exponential Function\n\nThe general form of a transformed exponential function is:\n\n[\ng(x) = a \\cdot b^{c(x - h)} + k\n]\n\nwhere:\n\n- [ a ] controls vertical stretch, compression, and reflection over the [ x ]-axis\n- [ b ] is the base of the exponential function\n- [ c ] controls horizontal stretch, compression, and reflection over the [ y ]-axis\n- [ h ] controls horizontal translation (shift right if [ h > 0 ], left if [ h < 0 ])\n- [ k ] controls vertical translation (shift up if [ k > 0 ], down if [ k < 0 ])\n\n### Key Concept: Identifying Transformations\n\n- [ g(x) = f(x) + k ] — vertical shift up by [ k ] units (or down if [ k ] is negative)\n- [ g(x) = f(x - h) ] — horizontal shift right by [ h ] units (or left if [ h ] is negative)\n- [ g(x) = a \\cdot f(x) ] — vertical stretch by factor [ |a| ] if [ |a| > 1 ], compression if [ 0 < |a| < 1 ]; reflection over [ x ]-axis if [ a < 0 ] \n- [ g(x) = f(cx) ] — horizontal compression by factor [ \\frac{1}{|c|} ] if [ |c| > 1 ], stretch if [ 0 < |c| < 1 ]; reflection over [ y ]-axis if [ c < 0 ]",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1: Describe Transformations from Equations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Describe Transformations from Equations\n\nGiven a parent exponential function [ f(x) ] and a transformed function [ g(x) ], identify and describe the transformation(s) that map [ f(x) ] to [ g(x) ].\n\n### Step 1: Compare the Structures\n\nWrite both functions side by side and note any differences in form.\n\nFor example, given:\n[\nf(x) = 6^x \\quad \\text{and} \\quad g(x) = 6^x + 8\n]\n\n### Step 2: Identify the Transformation Type\n\nDetermine whether the change is a vertical shift, horizontal shift, stretch, compression, reflection, or combination.\n\n- [ g(x) = 6^x + 8 ] is a vertical shift up 8 units\n- [ g(x) = -5^x ] is a reflection across the [ x ]-axis\n- [ g(x) = 3^{2x} + 1 ] is a horizontal compression by a factor of [ \\frac{1}{2} ] \n- [ g(x) = 2^{-x} + 1 ] is a reflection across the [ y ]-axis and a vertical shift up 1 unit\n- [ g(x) = 2(3^x + 1) ] is a vertical stretch by a factor of 2\n- [ g(x) = 4^{x - 3} ] is a horizontal shift right 3 units\n\n### Step 3: State the Complete Description\n\nWrite a clear sentence describing how [ g(x) ] relates to [ f(x) ].",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2: Write Equations from Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write Equations from Graphs\n\nEach graph shows a transformation of the parent function [ y = 2^x ]. Use key points and asymptote behavior to determine the equation of the transformed function.\n\n### Step 1: Identify the Parent Function\n\nThe parent function is [ f(x) = 2^x ], which passes through [ (0, 1) ] and has a horizontal asymptote at [ y = 0 ].\n\n### Step 2: Locate Transformed Key Points\n\nFind where the transformed graph crosses the [ y ]-axis or other identifiable points, and compare to the parent.\n\n### Step 3: Determine the Transformation Parameters\n\nUse the shifted points and asymptote to solve for [ a ], [ h ], and [ k ] in:\n[\ng(x) = a \\cdot 2^{x - h} + k\n]\n\nFor example, if the asymptote moves to [ y = -3 ] and the graph is reflected:\n[\ng(x) = -2^x - 3\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3: Apply Transformations to Real-World Models",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Apply Transformations to Real-World Models\n\nUse exponential transformations to model and compare real-world situations involving growth and decay.\n\n### Step 1: Identify the Parent Model\n\nFor example, the parent function for compound interest at rate [ r ] is:\n[\nf(x) = (1 + r)^x\n]\n\n### Step 2: Interpret the Transformation in Context\n\nGiven [ g(x) = 2000(1.0125)^x ], recognize this as a vertical stretch by factor 2000 of the parent [ f(x) = 1.0125^x ]. The stretch factor represents the initial principal.\n\n### Step 3: Compare Models\n\nWhen comparing two exponential models, describe one as a transformation of the other:\n\n- [ f(x) = 100(0.89)^x ] models caffeine from coffee\n- [ g(x) = 25(0.89)^x ] models caffeine from green tea\n\nHere, [ g(x) ] is a vertical compression of [ f(x) ] by factor [ \\frac{1}{4} ], reflecting the lower initial caffeine content.\n\n### Step 4: Solve Contextual Questions\n\nUse the models to answer specific questions such as calculating values after a given time or finding the difference between two quantities.\n\nFor example, to compare depreciation of a 12000-dollar car ([ g(x) = 12000(0.85)^x ]) and a 20000-dollar car at the same rate:\n[\nh(x) = 20000(0.85)^x\n]\n\nAfter 5 years, find [ h(5) - g(5) ] to determine the value difference.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice across all transformation types and applications. Problems include:\n\n- Describing transformations of [ g(x) = 2^x + 6 ], [ g(x) = 3(2)^x ], [ g(x) = -\\frac{1}{4}(2)^x ], [ g(x) = (2)^{-x} ], and others relative to the parent [ f(x) = 2^x ] \n- Writing functions [ g(x) ] to represent described transformations (translations, stretches, compressions) of given parent functions [ f(x) = 2^x ], [ f(x) = 8^x ], [ f(x) = 5^x ], [ f(x) = 3^x ], [ f(x) = 6^x ], and [ f(x) = 4^x ] \n- Writing equations for graphs that are transformations of [ f(x) = 5^x ] \n- Analyzing a graph showing assets over time for two people with identical bank accounts but one also owning an antique; describing the graph as a transformation and extrapolating the antique's value\n- Graphing and describing combined transformations such as [ g(x) = 5 \\cdot 3^{x + 2} - 4 ] and [ g(x) = -3 \\cdot 2^{-x} + 1 ] \n- Reasoning and proof problems including finding intersection points, using properties of exponents to justify equivalent forms, analyzing the effect of negative scale factors, identifying errors in transformation descriptions, and describing constraints on model parameters",
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
                    "## Review Notes\n\n- Problems 13–16 and 37–40 include graphs (images) that cannot be described textually. These require visual inspection to determine transformation parameters and write equations.\n- Problem 41 includes a graph showing assets over time that must be visually inspected to describe the transformation and extrapolate the value of the antique toy automobile.\n- Problem 50 includes a graph of a parent function [ f(x) ] that must be visually inspected to identify the parent function, write a transformation [ g(x) ], describe the transformation, and graph the result.\n- Problem 49 includes an image showing four pairs of transformations labeled A, B, C, D for a \"Which One Doesn't Belong?\" task.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-3",
        title: "Writing Exponential Functions",
        description:
          "Students write exponential functions from two points, graphs, and real-world scenarios, and apply the compound-interest formula to investment and depreciation problems.",
        orderIndex: 3,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Exponential function** — A function of the form [ y = ab^x ] where [ a \\ne 0 ], [ b > 0 ], and [ b \\ne 1 ].\n- **Growth factor** — The base [ b ] in an exponential function when [ b > 1 ]; the quantity increases by a constant percent each time period.\n- **Decay factor** — The base [ b ] in an exponential function when [ 0 < b < 1 ]; the quantity decreases by a constant percent each time period.\n- **Compound interest** — Interest earned on both the principal and any previously accumulated interest.\n- **Depreciation** — The decrease in value of an asset over time, often modeled with exponential decay.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Writing Exponential Functions from Points",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Writing Exponential Functions from Points\n\nAn exponential function has the form [ y = ab^x ]. When two points on the graph are known, substitute them into the equation to create a system. Dividing the equations eliminates [ a ] and lets you solve for [ b ]. Then substitute [ b ] back to find [ a ].\n\n### Key Concept: Two-Point Method\n\n- Substitute each point into [ y = ab^x ] to obtain two equations.\n- Divide one equation by the other to eliminate [ a ] and solve for [ b ].\n- Substitute [ b ] into either equation to solve for [ a ].\n- Write the final function [ f(x) = ab^x ].",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn: Compound Interest and Growth Models",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Compound Interest and Growth Models\n\nReal-world quantities that grow or decay by a fixed percentage are modeled exponentially. For compound interest, the formula is:\n\n[\nA = P\\left(1 + \\frac{r}{n}\\right)^{nt}\n]\n\nwhere [ P ] is the principal, [ r ] is the annual rate, [ n ] is the number of compounding periods per year, and [ t ] is time in years.\n\n### Key Concept: Modeling with Exponential Functions\n\n- Identify the initial amount [ a ] (or principal [ P ]).\n- Determine the growth or decay factor from the rate: [ b = 1 + r ] for growth, [ b = 1 - r ] for decay.\n- For compound interest, adjust the rate per period and the total number of periods.\n- Substitute values and solve for the unknown quantity or time.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1: Write a Function from Two Points",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Write a Function from Two Points\n\nGiven two points on an exponential graph, determine the function [ y = ab^x ].\n\n### Step 1: Set Up the System\n\nSubstitute each point into [ y = ab^x ].\n\nFor example, with points [ (2, 16) ] and [ (3, 32) ]:\n[\n16 = ab^2 \\quad \\text{and} \\quad 32 = ab^3\n]\n\n### Step 2: Solve for the Growth Factor\n\nDivide the second equation by the first to eliminate [ a ]:\n[\n\\frac{32}{16} = \\frac{ab^3}{ab^2} \\implies 2 = b\n]\n\n### Step 3: Solve for the Initial Value\n\nSubstitute [ b = 2 ] back into [ 16 = ab^2 ]:\n[\n16 = a(2)^2 \\implies 16 = 4a \\implies a = 4\n]\n\nThe function is [ y = 4(2)^x ].",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2: Write a Function from a Graph",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write a Function from a Graph\n\nGiven the graph of an exponential function, write its equation.\n\n### Step 1: Read Coordinates from the Graph\n\nIdentify two clearly marked points on the curve, such as the y-intercept and another point.\n\n### Step 2: Apply the Two-Point Method\n\nUse the same process as Example 1: set up [ y = ab^x ], divide to find [ b ], and solve for [ a ].",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3: Model Real-World Growth and Decay",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Model Real-World Growth and Decay\n\nWrite an exponential function to describe a real-world scenario, then use it to answer questions.\n\n### Step 1: Identify the Model Type\n\nDetermine whether the situation represents growth or decay, and identify the initial value and rate.\n\n- Bacteria doubling: [ y = 50(2)^x ] where [ x ] is the number of 30-minute periods.\n- Depreciation at 12% per year: [ y = 32500(0.88)^x ].\n\n### Step 2: Write and Evaluate the Function\n\nSubstitute the appropriate time or other known value to find the desired quantity.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Examples 4–6: Apply Compound Interest and Exponential Models",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 4–6 — Apply Compound Interest and Exponential Models\n\nSolve multi-step financial and population problems using the compound-interest formula or exponential growth/decay models.\n\n### Step 1: Choose the Correct Formula\n\nFor compound interest:\n[\nA = P\\left(1 + \\frac{r}{n}\\right)^{nt}\n]\n\nFor continuous exponential growth or decay:\n[\ny = ab^x \\quad \\text{or} \\quad y = a(1 + r)^t\n]\n\n### Step 2: Substitute Known Values\n\nIdentify [ P ], [ r ], [ n ], and [ t ] from the problem statement. Watch for whether the rate is given as a percent or decimal.\n\n### Step 3: Solve and Interpret\n\nEvaluate the expression to find the account balance, population, or remaining value. Round as directed by the problem context.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises combine all skills from the lesson:\n\n- Writing exponential functions from two given points.\n- Modeling population growth and decline with exponential functions.\n- Applying the compound-interest formula to investments and savings accounts.\n- Working with half-life and decay models in medicine and science contexts.\n- Analyzing whether an investment is increasing or decreasing from its equation.\n- Using technology to estimate when an investment reaches a target value.\n- Comparing exponential and linear growth through average rate of change.\n- Explaining structural features of exponential models and justifying arguments about growth rates.\n- Creating original exponential models for combined investment and depreciation scenarios.",
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
                    "## Review Notes\n\n- Example 2 (problems 7–10) requires four graph images (`media/image1.png` through `media/image4.png`) that cannot be described in text. A teacher or curriculum reviewer should verify the coordinates shown on each graph so that the two-point method can be applied.\n- Problem 18 includes a table of average annual college costs (`media/image5.png`) that must be reviewed to extract the dollar amounts for public-college tuition, fees, room, and board.\n- Problem 29 includes a table of deer-population data (`media/image6.png`) that must be reviewed to extract the year-by-year population values needed to fit an exponential function.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-4",
        title: "Transforming Exponential Expressions",
        description:
          "Students rewrite exponential functions to compare rates with different compounding periods and calculate effective annual, quarterly, and monthly rates using properties of exponents.",
        orderIndex: 4,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Compound interest** — Interest calculated on the initial principal and on the accumulated interest from previous periods\n- **Effective rate** — The equivalent rate over a specified time period that produces the same final amount as a given compounding rate\n- **Exponential growth/decay** — A quantity that increases or decreases by a constant percent rate per unit time, modeled by [ A(t) = A_0(1 + r)^t ] or [ A(t) = A_0(1 - r)^t ]",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Transforming Exponential Expressions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Transforming Exponential Expressions\n\nWhen two exponential models use different compounding periods, rewrite one function so both use the same time unit. Use the exponent property:\n\n[\n(a^m)^n = a^{mn}\n]\n\nFor example, to convert an annual growth factor to a quarterly equivalent, adjust the exponent to match the number of compounding periods per year.\n\n### Key Concept: Comparing Rates with Different Compounding Periods\n\n- Rewrite [ A(t) = A_0(1 + r_{\\text{annual}})^t ] as an equivalent function with a different compounding period by adjusting the base and exponent\n- To compare two rates directly, ensure both functions use the same time unit (annual, quarterly, monthly, etc.)\n- The effective annual rate reveals the true yearly growth when compounding occurs more than once per year",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1: Compare Compounding Interest and Growth Rates",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Compare Compounding Interest and Growth Rates\n\nGiven two exponential growth or decay scenarios with different compounding periods, write equivalent functions using the same time unit and determine which rate is more favorable.\n\n### Step 1: Write the Initial Function\n\nFor an investment or quantity with periodic rate [ r ]:\n\n[\nA(t) = A_0(1 + r_{\\text{period}})^{\\text{number of periods in } t}\n]\n\n### Step 2: Rewrite with a Common Time Unit\n\nUse properties of exponents to convert one function so both use the same compounding period.\n\nConvert an annual rate to a quarterly equivalent:\n\n[\nA(t) = A_0(1.021)^t = A_0\\left((1.021)^{\\frac{1}{4}}\\right)^{4t}\n]\n\nConvert a quarterly rate to an annual effective rate:\n\n[\nA(t) = A_0(1.008)^{4t} = A_0\\left((1.008)^4\\right)^t \\approx A_0(1.0324)^t\n]\n\n### Step 3: Compare and Explain\n\nCompare the effective rates or growth factors. The larger effective rate corresponds to faster growth (or, for decay, a faster decrease). Explain which plan, item, or population is increasing or decreasing at the faster rate.\n\nVariations include:\n- Comparing annual vs. quarterly vs. monthly compounding for investments\n- Comparing growth rates per minute vs. per second for populations\n- Comparing decay rates per quarter vs. per year for declining populations",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises apply the skill of transforming exponential expressions to a range of contexts. Students:\n- Interpret population data from tables to write exponential functions [ P(t) ] and find effective monthly rates\n- Compare bank accounts, investments, certificate of deposit plans, and car depreciation rates with different compounding periods\n- Rewrite a cooling function so the coefficient of [ t ] in the exponent is 1\n- Explain in writing why consumers must compare rates in the same unit before making financial decisions\n- Create an original scenario comparing two accounts with different compounding periods\n- Analyze and correct a common error when comparing a monthly interest rate directly to an annual interest rate",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problems 6 and 12 reference tables (images) showing population data for two towns and hawk populations in two nature preserves. The tables must be described or recreated from the original worksheet.\n- Problem 13 involves the cooling function [ T(t) = 72 + (212 - 72)(2.72)^{-0.4t} ]. The value 2.72 may be an approximation of [ e ]; verify the base and coefficients against the original worksheet.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-5",
        title: "Geometric Sequences",
        description:
          "Students identify geometric sequences, find missing terms, write explicit formulas, and apply sequences to real-world contexts involving exponential growth and decay.",
        orderIndex: 5,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Geometric sequence** — A sequence in which the ratio of any term to the previous term is constant.\n- **Common ratio** — The constant factor [ r ] by which each term in a geometric sequence is multiplied to obtain the next term, where [ r = \\frac{a_n}{a_{n-1}} ].\n- **Explicit formula** — A formula for the [ n ]th term of a sequence that depends only on [ n ], written as [ a_n = a_1 \\cdot r^{n-1} ] for geometric sequences.\n- **Exponential equation** — An equation of the form [ f(x) = a \\cdot b^x ] that can represent a geometric sequence when [ x ] is a positive integer.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Identifying Geometric Sequences",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Identifying Geometric Sequences\n\nA sequence is geometric if the ratio between consecutive terms is constant. This is different from an arithmetic sequence, where the difference between consecutive terms is constant.\n\n### Key Concept: Common Ratio Test\n\n- Divide each term by the term that precedes it.\n- If all ratios are equal, the sequence is geometric and the constant value is the common ratio [ r ].\n- If the ratios are not equal, the sequence is not geometric (it may be arithmetic, or neither).\n\nFor example, given the sequence [ 4, 20, 100, \\dots ]:\n[\n\\frac{20}{4} = 5, \\quad \\frac{100}{20} = 5\n]\n\nThe common ratio is [ r = 5 ], so the sequence is geometric.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn: Explicit Formula for a Geometric Sequence",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Explicit Formula for a Geometric Sequence\n\nOnce the first term [ a_1 ] and common ratio [ r ] are known, any term can be found directly without listing all intermediate terms.\n\n### Key Concept: Explicit Formula\n\n[\na_n = a_1 \\cdot r^{n-1}\n]\n\n- [ a_n ] is the [ n ]th term.\n- [ a_1 ] is the first term.\n- [ r ] is the common ratio.\n- [ n ] is the term number.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1: Determine Whether a Sequence Is Geometric",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Whether a Sequence Is Geometric\n\nGiven a list of terms, determine whether the sequence is geometric. Explain your reasoning by computing the ratio between consecutive terms.\n\n### Step 1: Compute Consecutive Ratios\n\nFor each pair of adjacent terms, divide the later term by the earlier term.\n\nFor example, for [ 212, 106, 53, \\dots ]:\n[\n\\frac{106}{212} = \\frac{1}{2}, \\quad \\frac{53}{106} = \\frac{1}{2}\n]\n\nThe common ratio is [ r = \\frac{1}{2} ], so the sequence is geometric.\n\nFor [ 10, 20, 30, 40, \\dots ]:\n[\n\\frac{20}{10} = 2, \\quad \\frac{30}{20} = \\frac{3}{2}\n]\n\nThe ratios are not equal, so the sequence is not geometric.\n\n### Step 2: State the Conclusion\n\nClassify the sequence as geometric (and state [ r ]), arithmetic (and state the common difference), or neither. Sequences involving fractions and negative numbers should be checked with the same ratio test.\n\nFor example, for [ \\frac{7}{3}, 14, 84, 504, \\dots ]:\n[\n\\frac{14}{\\frac{7}{3}} = 6, \\quad \\frac{84}{14} = 6\n]\n\nThe common ratio is [ r = 6 ].",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2: Explain Your Reasoning for Non-Geometric Sequences",
            phaseType: "worked_example" as const,
            estimatedMinutes: 8,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Explain Your Reasoning for Non-Geometric Sequences\n\nSome sequences may have an inconsistent ratio or may follow a different pattern altogether. Students must verify the ratio across all consecutive pairs and explain why the sequence fails the geometric test.\n\nFor example, for [ 3, 9, 81, 6561, \\dots ]:\n[\n\\frac{9}{3} = 3, \\quad \\frac{81}{9} = 9\n]\n\nSince [ 3 \\ne 9 ], the sequence is not geometric.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3: Find the Next Three Terms",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Find the Next Three Terms\n\nGiven a geometric sequence, identify the common ratio and extend the pattern to find the next three terms.\n\n### Step 1: Identify the Common Ratio\n\nDivide any term by its preceding term. For [ 36, 12, 4, \\dots ]:\n[\nr = \\frac{12}{36} = \\frac{1}{3}\n]\n\n### Step 2: Multiply to Find Subsequent Terms\n\nMultiply the last given term by [ r ] repeatedly to generate the next three terms:\n[\n4 \\cdot \\frac{1}{3} = \\frac{4}{3}, \\quad \\frac{4}{3} \\cdot \\frac{1}{3} = \\frac{4}{9}, \\quad \\frac{4}{9} \\cdot \\frac{1}{3} = \\frac{4}{27}\n]\n\nSequences may have negative or fractional common ratios, such as [ -4, 24, -144, \\dots ] where [ r = -6 ], or [ 1024, -128, 16, \\dots ] where [ r = -\\frac{1}{8} ].",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4: Find the 10th Term Using the Explicit Formula",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Find the 10th Term Using the Explicit Formula\n\nUse the explicit formula [ a_n = a_1 \\cdot r^{n-1} ] to find a specific term without listing all terms.\n\n### Step 1: Identify [ a_1 ] and [ r ] \n\nFor the sequence [ 1, 9, 81, 729, \\dots ]:\n[\na_1 = 1, \\quad r = \\frac{9}{1} = 9\n]\n\n### Step 2: Substitute into the Explicit Formula\n\nTo find the 10th term, substitute [ n = 10 ]:\n[\na_{10} = 1 \\cdot 9^{10-1} = 9^9\n]\n\nFor the sequence [ 6, -24, 96, -384, \\dots ]:\n[\na_1 = 6, \\quad r = \\frac{-24}{6} = -4\n]\n\n[\na_{10} = 6 \\cdot (-4)^{10-1} = 6 \\cdot (-4)^9\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5: Apply Geometric Sequences to Real-World Situations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Apply Geometric Sequences to Real-World Situations\n\nWrite and use an explicit formula to model exponential growth or decay in context.\n\n### Museums\n\nA table shows projected annual museum visitors (in millions) over several years. Identify the pattern as geometric, determine the common ratio, and write an equation for the projected number of visitors after [ n ] years.\n\n### World Population Growth\n\nThe world population grows at a fixed annual percentage rate. Given an initial population and a growth rate:\n\n- Write an equation for the population after [ n ] years in the form:\n[\nP(n) = P_0 \\cdot (1 + r)^n\n]\n- Evaluate the equation for a specific future year by determining the correct value of [ n ].\n\n### Depreciation\n\nAn asset loses a fixed fraction of its value each year. Given an initial value and an annual decay factor, calculate the remaining value after a specified number of years using the explicit formula.\n\nFor example, a computer system purchased for $5000 loses one-fifth of its value each year. The decay factor is [ \\frac{4}{5} ], so the value after 6 years is:\n[\nV(6) = 5000 \\cdot \\left(\\frac{4}{5}\\right)^6\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with geometric sequences across a range of skills and contexts. Students identify whether sequences are geometric or arithmetic, find missing terms and specific terms using the explicit formula, and apply geometric sequences to real-world scenarios including savings accounts with monthly interest, population projections, salary growth, and depreciation.\n\nAdditional problem types include:\n\n- Writing an explicit formula for a given geometric sequence and then finding a specific term, such as the 5th, 7th, 8th, or 9th term. Sequences include positive, negative, and fractional values, such as [ 1000, 200, 40, \\dots ] with [ r = \\frac{1}{5} ], and [ -8, -2, -\\frac{1}{2}, \\dots ] with [ r = \\frac{1}{4} ].\n- Filling in missing terms of a geometric sequence, writing the corresponding exponential equation, and using it to determine the 10th term.\n- Finding previous terms by working backwards: divide by the common ratio instead of multiplying.\n- Comparing two geometric sequences that start with the same initial value but have reciprocal common ratios (for example, [ r ] and [ \\frac{1}{r} ]), then analyzing and graphing their behavior including intercepts, asymptotes, and end behavior.\n- Comparing two payment plans—one linear and one geometric—described in a table, writing equations for each, and choosing the better plan for a two-year commitment.\n- Comparing two sequences given in different forms (one by explicit formula, one by two known terms) to determine which has the greater common ratio and identifying the initial term of each.\n- Investigating whether the relationship between the number of sides of a polygon and the sum of its interior angles forms a geometric sequence, using known angle sums to justify the answer.\n- Finding a sequence that is both geometric and arithmetic, and explaining why this is possible.\n- Error analysis: evaluating two students' work for finding a term of a geometric sequence and determining who is correct.\n- Writing a sequence that is neither arithmetic nor geometric and justifying the reasoning.\n- Open-ended writing prompts about how graphs of geometric sequences and exponential functions are similar and different, and summarizing how to find a specific term of a geometric sequence.\n- Creating a counterexample to the statement that as [ n ] increases in a geometric sequence, the value of [ a_n ] always moves farther away from zero.\n- Writing an original geometric sequence and explaining why it satisfies the definition.",
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
                    "## Review Notes\n\n- Problem 29 contains a table of annual museum visitors presented as an image. The specific values should be verified from the original worksheet.\n- Problem 32 contains a table of projected U.S. population through 2060 presented as an image. The specific values should be verified from the original worksheet.\n- Problem 40 is a multi-part structure problem asking students to fill in missing terms, write an exponential equation, and find the 10th term for two different geometric sequences.\n- Problem 42 asks students to graph two geometric sequences with reciprocal common ratios. No graphing grid is provided in the source text; a standard coordinate plane should be used.\n- Problem 43 contains a table comparing two payment methods presented as an image. The specific payment values and structure should be verified from the original worksheet.\n- Problem 44 defines one sequence with the formula [ a_n = 512(0.5)^x ] and gives two terms of a second sequence, [ b_3 = 7168 ] and [ b_7 = 28 ]. Students must find the common ratio and initial term of the second sequence.\n- Problem 47 contains an image showing the work of two students (Haro and Matthew) finding the ninth term of the geometric sequence [ -5, 10, -20, \\dots ]. The specific work shown should be verified from the original worksheet.\n- An additional image (image4.png) appears near problem 46 in the original document; its intended placement or association should be verified by a human reviewer.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-8-lesson-6",
        title: "Recursive Formulas",
        description:
          "Students find terms from recursive formulas, write recursive formulas for sequences and graphs, and convert between recursive and explicit forms for arithmetic and geometric sequences.",
        orderIndex: 6,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Recursive formula** — A formula that defines each term of a sequence using one or more of the preceding terms\n- **Explicit formula** — A formula that defines the [ n ]th term of a sequence directly as a function of [ n ] \n- **Sequence** — An ordered list of numbers called terms\n- **Arithmetic sequence** — A sequence in which the difference between consecutive terms is constant\n- **Geometric sequence** — A sequence in which the ratio between consecutive terms is constant\n- **First term** — The initial term of a sequence, often denoted [ a_1 ]",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Recursive Formulas",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Recursive Formulas\n\nA recursive formula defines each term of a sequence based on previous terms. To use a recursive formula, you need an initial term (or terms) and a rule for generating subsequent terms.\n\n### Key Concept: Recursive Formulas\n\n- A recursive formula has two parts: an initial value [ a_1 ] and a rule that relates [ a_n ] to previous terms such as [ a_{n-1} ] \n- For an arithmetic sequence, the recursive formula has the form [ a_n = a_{n-1} + d ] where [ d ] is the common difference\n- For a geometric sequence, the recursive formula has the form [ a_n = r \\cdot a_{n-1} ] where [ r ] is the common ratio",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1: Find Terms from a Recursive Formula",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Find Terms from a Recursive Formula\n\nGiven a recursive formula, find the first five terms of the sequence by repeatedly applying the rule.\n\n### Step 1: Identify the Initial Term and Rule\n\nRead the given first term [ a_1 ] and the recursive rule for [ a_n ] in terms of [ a_{n-1} ].\n\n### Step 2: Generate Subsequent Terms\n\nSubstitute the previous term into the recursive rule to find the next term.\n\nFor an arithmetic-type rule:\n[\na_1 = 23, \\quad a_n = a_{n-1} + 7, \\quad n \\ge 2\n]\n\nFor a geometric-type rule with an added constant:\n[\na_1 = 48, \\quad a_n = -0.5a_{n-1} + 8, \\quad n \\ge 2\n]\n\nContinue until you have found the required number of terms.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2: Find Terms from a Recursive Formula (Variations)",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Find Terms from a Recursive Formula (Variations)\n\nApply the same process as Example 1 to sequences with different recursive rules.\n\n### Step 1: Identify the Rule Type\n\nDetermine whether the rule involves addition, multiplication, or a combination of operations.\n\n### Step 2: Compute Terms Systematically\n\nFor a pure geometric rule:\n[\na_1 = 8, \\quad a_n = 2.5a_{n-1}, \\quad n \\ge 2\n]\n\nFor a geometric rule with a subtracted constant:\n[\na_1 = 12, \\quad a_n = 3a_{n-1} - 21, \\quad n \\ge 2\n]\n\nFor rules involving fractions:\n[\na_1 = \\frac{1}{2}, \\quad a_n = a_{n-1} + \\frac{3}{2}, \\quad n \\ge 2\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3: Write a Recursive Formula for a Sequence",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Write a Recursive Formula for a Sequence\n\nGiven the first several terms of a sequence, write a recursive formula by finding the relationship between consecutive terms.\n\n### Step 1: Find the Relationship Between Terms\n\nCalculate the difference or ratio between consecutive terms.\n\nFor an arithmetic sequence such as [ 27, 41, 55, 69, \\dots ]:\n[\n41 - 27 = 14, \\quad 55 - 41 = 14, \\quad 69 - 55 = 14\n]\nThe common difference is [ 14 ].\n\nFor a geometric sequence such as [ 81, 27, 9, 3, \\dots ]:\n[\n\\frac{27}{81} = \\frac{1}{3}, \\quad \\frac{9}{27} = \\frac{1}{3}, \\quad \\frac{3}{9} = \\frac{1}{3}\n]\nThe common ratio is [ \\frac{1}{3} ].\n\n### Step 2: Write the Recursive Formula\n\nState the first term and the rule. For the arithmetic example above:\n[\na_1 = 27, \\quad a_n = a_{n-1} + 14, \\quad n \\ge 2\n]\n\nFor the geometric example above:\n[\na_1 = 81, \\quad a_n = \\frac{1}{3}a_{n-1}, \\quad n \\ge 2\n]\n\nSome sequences alternate signs, such as [ 40, -60, 90, -135, \\dots ], which requires a negative common ratio.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4: Write a Recursive Formula from a Graph",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Write a Recursive Formula from a Graph\n\nGiven a graph of a sequence (discrete points), write a recursive formula by reading coordinates and finding the pattern.\n\n### Step 1: Read Coordinates from the Graph\n\nIdentify the [ (n, a_n) ] coordinates of the plotted points.\n\n### Step 2: Determine the Pattern\n\nCompute differences or ratios between consecutive terms to decide whether the sequence is arithmetic, geometric, or neither.\n\n### Step 3: Write the Formula\n\nState [ a_1 ] and the recursive rule based on the pattern found.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 5: Apply Recursive Formulas to Real-World Problems",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Apply Recursive Formulas to Real-World Problems\n\nUse recursive formulas to model situations that change by a constant amount or constant factor over time.\n\n### Step 1: Identify the Pattern in the Data\n\nRead the given information and determine whether the situation represents an arithmetic or geometric pattern.\n\nA viral video gets [ 175 ] views in hour 1, [ 350 ] in hour 2, [ 525 ] in hour 3, and so on. This is arithmetic with common difference [ 175 ].\n\nA piece of paper folded repeatedly doubles the number of sections. This is geometric with common ratio [ 2 ].\n\nA snowman melting loses height by a constant ratio each hour. This is geometric.\n\n### Step 2: Write the Recursive Formula\n\nState the initial term and the rule.\n\nFor the video example:\n[\na_1 = 175, \\quad a_n = a_{n-1} + 175, \\quad n \\ge 2\n]\n\n### Step 3: Write the Explicit Formula (when requested)\n\nConvert to explicit form:\n[\na_n = a_1 + (n-1)d \\quad \\text{(arithmetic)}\n]\n[\na_n = a_1 \\cdot r^{n-1} \\quad \\text{(geometric)}\n]\n\nFor the video example:\n[\na_n = 175n\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 6: Convert Between Recursive and Explicit Formulas",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Convert Between Recursive and Explicit Formulas\n\nGiven one form of a formula, write the equivalent formula in the other form.\n\n### Step 1: Identify the Sequence Type\n\nExamine the given formula to determine whether it represents an arithmetic or geometric sequence.\n\n### Step 2: Convert Recursive to Explicit\n\nFor an arithmetic recursive formula [ a_1 = -2, \\; a_n = a_{n-1} - 12, \\; n \\ge 2 ]:\n[\na_n = a_1 + (n-1)d = -2 + (n-1)(-12) = -12n + 10\n]\n\nFor a geometric recursive formula [ a_1 = 38, \\; a_n = \\frac{1}{2}a_{n-1}, \\; n \\ge 2 ]:\n[\na_n = a_1 \\cdot r^{n-1} = 38 \\left(\\frac{1}{2}\\right)^{n-1}\n]\n\n### Step 3: Convert Explicit to Recursive\n\nFor an explicit arithmetic formula [ a_n = -7n + 52 ]:\n[\nd = -7, \\quad a_1 = -7(1) + 52 = 45\n]\n[\na_1 = 45, \\quad a_n = a_{n-1} - 7, \\quad n \\ge 2\n]\n\nFor an explicit geometric formula [ a_n = 3(4)^{n-1} ]:\n[\nr = 4, \\quad a_1 = 3\n]\n[\na_1 = 3, \\quad a_n = 4a_{n-1}, \\quad n \\ge 2\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson, including:\n\n- Converting explicit formulas to recursive formulas in real-world contexts (cost models, savings accounts)\n- Developing and comparing explicit formulas for two related quantities (population and widget production)\n- Using spreadsheet models to explore the Fibonacci sequence and ratios of consecutive terms\n- Analyzing classic puzzles (Tower of Hanoi) with recursive reasoning\n- Finding errors, analyzing structure, and writing explanations about recursive vs. explicit formulas\n- Solving challenge problems such as finding an initial term given a later term, finding recursive formulas for non-standard sequences, and exploring Gauss's method for summing arithmetic sequences",
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
                    "## Review Notes\n\n- Problems 13–18 require graphs shown as images (image1.png through image6.png). These graphs display discrete sequences as plotted points; students must read coordinates and determine recursive formulas.\n- Problem 19 includes an image (image7.png) showing a graph of the viral video views over time.\n- Problem 20 includes an image (image8.png) showing the number of paper sections after each fold.\n- Problem 32 includes an image (image9.png) showing a graph of widget production per person.\n- Problem 34 includes an image (image10.png) showing a graph of Gauss's pairing method for summing 1 to 100.\n- Problem 35 includes an image (image11.png) showing a spreadsheet with Fibonacci numbers and ratios.",
                },
              },
            ],
          },
        ],
      },
    ];

    let lessonsCreated = 0;
    let phasesCreated = 0;

    for (const lessonData of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lessonData.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 8,
            title: lessonData.title,
            slug: lessonData.slug,
            description: lessonData.description,
            orderIndex: lessonData.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      if (!existingLesson) {
        lessonsCreated++;
      }

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
    }

    return { lessonsCreated, phasesCreated };
  },
});
