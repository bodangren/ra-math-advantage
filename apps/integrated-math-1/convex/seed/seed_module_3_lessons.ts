import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule3Result {
  lessons: {
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
  }[];
}

export const seedModule3Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule3Result> => {
    const now = Date.now();
    const result: SeedModule3Result["lessons"] = [];

    const lessonsData = [
      {
        slug: "module-3-lesson-1",
        title: "Representing Relations",
        description:
          "Express a relation as a table, a graph, a mapping, and a set of ordered pairs. Identify the domain and range of a relation. Distinguish independent and dependent variables in real-world situations. Interpret the meaning of axes, scale, and origin on a graph of data.",
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
                    "## Key Terms\n\n- **Relation** — a set of ordered pairs.\n- **Domain** — the set of all first coordinates (x-values) in a relation.\n- **Range** — the set of all second coordinates (y-values) in a relation.\n- **Independent variable** — the input variable whose value is chosen or controlled.\n- **Dependent variable** — the output variable whose value depends on the input.\n- **Mapping** — a diagram that shows how each element of the domain is paired with elements of the range.\n- **Ordered pair** — a pair of numbers [(x, y)] used to locate a point on a coordinate plane.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Representing Relations",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Representing Relations\n\nA relation can be represented in multiple ways: as a set of ordered pairs, a table of values, a graph on the coordinate plane, or a mapping diagram. Each representation shows the same pairing between two quantities.\n\n### Key Concept: Representations of a Relation\n\n- **Ordered pairs:** a list such as [\\{ (-1, -1), (1, 1), (2, 1), (3, 2) \\}]\n- **Table:** columns for the domain and range values.\n- **Graph:** points plotted on the coordinate plane.\n- **Mapping:** two ovals with arrows showing which domain values pair with which range values.\n\n### Key Concept: Domain and Range\n\n- **Domain:** the set of all x-values. For [\\{ (-1, -1), (1, 1), (2, 1), (3, 2) \\}], the domain is [\\{ -1, 1, 2, 3 \\}].\n- **Range:** the set of all y-values. For the same relation, the range is [\\{ -1, 1, 2 \\}].",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn: Independent and Dependent Variables",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Independent and Dependent Variables\n\nIn a real-world situation, the quantity that is controlled or changed is the independent variable (usually on the horizontal axis). The quantity that responds or is measured is the dependent variable (usually on the vertical axis).\n\n### Key Concept: Identifying Variables\n\n- The independent variable is the input; the dependent variable is the output.\n- On a graph, the horizontal axis typically shows the independent variable and the vertical axis shows the dependent variable.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1 — Multiple Representations of a Relation",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Multiple Representations of a Relation\n\nGiven a set of ordered pairs, express the relation as a table, a graph, and a mapping. Then state the domain and range.\n\n### Step 1: Create a Table\n\nList each ordered pair in a two-column table with [x] and [y] headers.\n\n### Step 2: Graph the Relation\n\nPlot each ordered pair as a point on the coordinate plane.\n\n### Step 3: Draw a Mapping\n\nPlace the domain values in one oval and the range values in another. Draw arrows from each domain value to its corresponding range value(s).\n\n### Step 4: State Domain and Range\n\nList the set of all x-values as the domain and all y-values as the range.\n\n[\\text{Example: } \\{ (-1, -1), (1, 1), (2, 1), (3, 2) \\}]\n\n[\\text{Domain: } \\{ -1, 1, 2, 3 \\}, \\quad \\text{Range: } \\{ -1, 1, 2 \\}]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2 — Independent and Dependent Variables from Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Independent and Dependent Variables from Graphs\n\nAnalyze a graph that represents a real-world situation.\n\n### Step 1: Identify the Variables\n\nDetermine which quantity is the input (independent) and which is the output (dependent) based on the context.\n\n### Step 2: Describe the Graph\n\nExplain what happens to the dependent variable as the independent variable increases. Describe any trends, increases, decreases, or constant sections.\n\n[\\text{Example contexts: hours worked vs. paycheck amount; price vs. demand; flight time vs. altitude}]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3 — Graph Data from a Table",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Graph Data from a Table\n\nGiven a table of real-world data, plot the points on a coordinate plane.\n\n### Step 1: Identify the Variables\n\nDetermine which column represents the independent variable and which represents the dependent variable.\n\n### Step 2: Set Up the Axes\n\nChoose an appropriate scale for each axis based on the range of values in the table.\n\n### Step 3: Plot the Points\n\nPlot each row of the table as an ordered pair and label the graph with a title.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4 — Graph Data from Ordered Pairs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Graph Data from Ordered Pairs\n\nGiven a set of ordered pairs representing measured data, plot the points on a coordinate plane.\n\n### Step 1: Identify the Variables\n\nDetermine what each coordinate represents in the context.\n\n### Step 2: Choose a Scale\n\nSelect scales for the axes that fit all data points.\n\n### Step 3: Plot and Label\n\nPlot each ordered pair and label the axes with units.\n\n[\\text{Example: } \\{ (5.5, 4.5), (3, 0.5), (3, 2), (8, 4.5), (2, 0.5) \\}]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5 — Interpret Axes, Scale, and Origin",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Interpret Axes, Scale, and Origin\n\nGiven a table of real-world data, explain what the axes, scale, and origin represent in the corresponding graph.\n\n### Step 1: Identify What Each Axis Represents\n\nState the quantity and unit shown on the horizontal axis and the vertical axis.\n\n### Step 2: Explain the Scale\n\nDescribe what each unit or grid line on each axis represents.\n\n### Step 3: Interpret the Origin\n\nExplain what the point [(0, 0)] means in the context of the situation.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice across all skills from the lesson:\n\n- Converting relations shown as tables, graphs, or mappings into sets of ordered pairs.\n- Interpreting real-world graphs and expressing them as ordered pairs.\n- Identifying reasonable domains for real-world functions.\n- Analyzing mappings to find domain, range, and ordered pairs.\n- Selecting the correct graph to represent a proportional relationship.\n- Drawing reasonable graphs for real-world motion problems.\n- Creating relations from given domains and ranges and expressing them in all four forms.\n- Analyzing statements about domain and range and providing counterexamples.\n- Comparing and contrasting independent and dependent variables.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-3-lesson-2",
        title: "Functions",
        description:
          "Determine whether a relation represented as a graph, table, mapping, set of ordered pairs, or equation is a function. Find the domain and range of a relation and identify whether it is a function. Evaluate functions using function notation for numerical and algebraic inputs. Interpret function values in real-world contexts.",
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
                    "## Key Terms\n\n- **Function** — A relation in which each input (x-value) is paired with exactly one output (y-value).\n- **Relation** — A set of ordered pairs, a table, a graph, or a mapping that pairs inputs with outputs.\n- **Domain** — The set of all possible input values (x-values) of a relation.\n- **Range** — The set of all possible output values (y-values) of a relation.\n- **Function notation** — A way to write a function using [f(x)] to represent the output when the input is [x].\n- **Mapping** — A diagram that shows how each element of the domain is paired with an element of the range.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Identifying Functions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Identifying Functions\n\nA relation is a function if no input value is paired with more than one output value.\n\n### Key Concept: Representations of Relations\n\n- **Graph:** Use the vertical line test. If any vertical line intersects the graph more than once, it is not a function.\n- **Set of ordered pairs:** Check that no x-coordinate is repeated with different y-coordinates.\n- **Equation:** Solve for [y]. If a single [x] produces more than one [y], it is not a function.\n- **Table or mapping:** Check that each input appears only once or is always paired with the same output.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Determine Whether a Relation Is a Function",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Whether a Relation Is a Function\n\nGiven a relation in various forms, decide whether it is a function and explain why.\n\n### Step 1: Analyze the Representation\n\nFor a set of ordered pairs such as [\\{(2, 5), (4, -2), (3, 3), (5, 4), (-2, 5)\\}], check whether any x-value is repeated with a different y-value.\n\nFor an equation such as [y = 2x - 5], verify that each [x] produces exactly one [y].\n\n### Step 2: Apply the Function Test\n\nIf each input maps to exactly one output, the relation is a function. For example, [y = 11] is a function because every [x] gives the same single [y]-value.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Domain and Range from Real-World Data",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Domain and Range from Real-World Data\n\nCreate a table from a real-world situation, identify the domain and range, and determine whether the relation is a function.\n\n\n### Step 1: Make a Table\n\nOrganize the given data as ordered pairs. For example, turnpike costs:\n\n[\\begin{array}{c|c}\n\\text{Cars} & \\text{Cost} \\\\\n\\hline\n1 & 0.75 \\\\\n2 & 1.50 \\\\\n3 & 2.25 \\\\\n4 & 3.00 \\\\\n5 & 3.75\n\\end{array}]\n\n### Step 2: Identify Domain and Range\n\n- Domain: [\\{1, 2, 3, 4, 5\\}]\n- Range: [\\{0.75, 1.50, 2.25, 3.00, 3.75\\}]\n\n### Step 3: Determine Whether It Is a Function\n\nCheck that each input (number of cars) corresponds to exactly one output (cost). If so, the relation is a function.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Evaluate Functions",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Evaluate Functions\n\nGiven functions such as [f(x) = 3x + 2] and [g(x) = x^2 - x], find output values for numerical and algebraic inputs.\n\n\n### Step 1: Substitute the Input\n\nReplace [x] with the given value. For example, to find [f(4)]:\n\n[f(4) = 3(4) + 2 = 14]\n\n### Step 2: Simplify\n\nPerform the arithmetic. For [g(-3)]:\n\n[g(-3) = (-3)^2 - (-3) = 9 + 3 = 12]\n\n### Step 3: Evaluate Expressions Involving Functions\n\nFor combined expressions such as [f(2) + 1], first evaluate [f(2)], then add 1.\n\nFor algebraic inputs such as [g(3b)]:\n\n[g(3b) = (3b)^2 - (3b) = 9b^2 - 3b]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4 — Interpret Functions in Context",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Interpret Functions in Context\n\nApply function evaluation to real-world scenarios and explain the meaning of the result.\n\n### Step 1: Identify the Function and Input\n\nFor a cell phone plan modeled by [f(x) = 25x + 200], where [x] is the number of phones, find [f(3)].\n\n### Step 2: Evaluate and Interpret\n\n[f(3) = 25(3) + 200 = 275]\n\nInterpret the result in context: the monthly cost for 3 phones is 275 dollars.\n\nSimilarly, for a square with side length [x], the area is [f(x) = x^2]. Evaluating [f(3.5)] gives the area of a square with side length 3.5 units.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice across all skills:\n\n- Determining whether tables, mappings, and graphs represent functions.\n- Evaluating functions with numerical and algebraic inputs, including combined expressions such as [g(-2) + 2], [f(0) - 7], and [5[f(d)]].\n- Working with real-world models: graphing linear relationships, finding function values, and solving for inputs given an output.\n- Reasoning about domain restrictions and finding the range when the domain is limited.\n- Constructing arguments about missing values and whether given relations are functions.\n- Writing explanations of how to determine whether a relation represents a function.\n- Finding a possible expression for [f(x)] given a composite input such as [f(3b - 1) = 9b - 1].",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-3-lesson-3",
        title: "Linearity and Continuity of Graphs",
        description:
          "Determine whether a function represented by a graph, equation, table, or real-world situation is discrete, continuous, or neither, and justify the classification. Determine whether a function represented by an equation, graph, or table is linear or nonlinear. Analyze and justify properties of linear and continuous functions in abstract and real-world contexts.",
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
                    "## Key Terms\n\n- **Discrete function** — a function whose graph consists of distinct, unconnected points, typically because the domain is restricted to countable values.\n- **Continuous function** — a function whose graph is an unbroken curve or line, meaning it can be drawn without lifting the pencil.\n- **Linear function** — a function that can be written in the form [y = mx + b] and whose graph is a straight line with a constant rate of change.\n- **Nonlinear function** — a function whose graph is not a straight line and whose rate of change is not constant.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Discrete, Continuous, and Neither",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Discrete, Continuous, and Neither\n\nA function's graph reveals whether it is discrete, continuous, or neither. Look at how the points are connected—or not connected—to classify the function.\n\n### Key Concept: Classifying Functions by Graph Type\n\n- **Discrete:** The graph shows isolated points (e.g., counting people, whole numbers of items).\n- **Continuous:** The graph is an unbroken line or curve (e.g., time, distance, temperature).\n- **Neither:** The graph has breaks or gaps that do not follow a single continuous path.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn: Linear and Nonlinear Functions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Linear and Nonlinear Functions\n\nA function is linear if it has a constant rate of change and can be written in standard form or slope-intercept form. Nonlinear functions include quadratics, cubics, reciprocals, and other curves.\n\n### Key Concept: Recognizing Linearity\n\n- **From an equation:** Simplify to standard form. If all variable terms are degree 1 and there are no products of variables, the function is linear.\n- **From a graph:** The graph is a straight line.\n- **From a table:** The first differences (change in [y] over change in [x]) are constant.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1 — Classify Functions from Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Classify Functions from Graphs\n\nExamine each graph and determine whether the function it represents is discrete, continuous, or neither. Explain your reasoning by describing the visual features of the graph.\n\n### Step 1: Inspect the Graph\n\nLook for whether the points are connected by a line or curve, whether they are isolated dots, or whether there are gaps or breaks.\n\n### Step 2: Classify and Justify\n\nState the classification and explain based on the visual evidence:\n\n- Discrete: isolated points only\n- Continuous: unbroken line or curve\n- Neither: gaps, jumps, or disconnected segments",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2 — Classify Real-World Functions from Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Classify Real-World Functions from Graphs\n\nGiven a graph that models a real-world situation, determine whether the function is discrete, continuous, or neither. Consider whether the quantities involved can take on any value in an interval or only specific, separate values.\n\n### Step 1: Interpret the Context\n\nRead the problem to identify what the variables represent (e.g., hours worked, cups of flour, hours of homework).\n\n### Step 2: Connect Context to Classification\n\n- Discrete: quantities that must be whole numbers or counted individually\n- Continuous: quantities that can take any value within a range, such as time or distance\n- Neither: situations that involve breaks or restrictions not captured by either category",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3 — Determine Linearity from Equations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Determine Linearity from Equations\n\nDetermine whether each equation represents a linear or nonlinear function. Simplify the equation by collecting like terms and checking the degree of each variable term.\n\n### Step 1: Simplify the Equation\n\nRearrange terms to isolate [y] or bring all terms to one side. Expand any squared expressions and simplify radicals when possible.\n\n\nFor example:\n[y - \\frac{1}{x} = 11]\n[y = 2x + 5]\n\n### Step 2: Identify the Degree\n\n- Linear: the highest power of any variable is 1, and variables are not multiplied together or in denominators.\n- Nonlinear: any variable has degree 2 or higher, variables appear in denominators, or variables are multiplied together.\n\nRepresentative forms:\n[2y + \\frac{x}{3} = -6 \\quad \\text{(linear)}]\n[y = 3x^2 - x + 5 \\quad \\text{(nonlinear)}]\n[y = -x^3 + 2x \\quad \\text{(nonlinear)}]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4 — Determine Linearity from Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Determine Linearity from Graphs\n\nExamine each graph and determine whether the function it represents is linear or nonlinear. A linear graph is a single straight line; any curve indicates a nonlinear function.\n\n### Step 1: Examine the Shape\n\nLook at the overall shape of the graph. Is it a straight line, or does it curve?\n\n### Step 2: Classify\n\n- Linear: the graph is a straight line with a constant slope.\n- Nonlinear: the graph curves, changes direction, or is not a single straight line.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5 — Determine Linearity from Tables",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Determine Linearity from Tables\n\nGiven a table of values representing a real-world situation, determine whether the function is linear or nonlinear. If linear, graph the function.\n\n### Step 1: Calculate First Differences\n\nCompute the change in [y] for each constant change in [x]:\n[\\frac{\\Delta y}{\\Delta x}]\n\n### Step 2: Determine Linearity\n\n- Linear: the ratio [\\frac{\\Delta y}{\\Delta x}] is constant for all pairs of consecutive points.\n- Nonlinear: the ratio changes from one interval to the next.\n\n### Step 3: Graph (if linear)\n\nPlot the points from the table. If the function is linear, the points will lie on a single straight line.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice combining all skills from the lesson. Students classify functions as discrete, continuous, or neither, and as linear or nonlinear, using graphs, equations, tables, and real-world contexts. The exercises also include analysis questions that ask students to justify their reasoning about properties of linear and continuous functions in general cases.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-3-lesson-4",
        title: "Intercepts of Graphs",
        description:
          "Estimate the [x]- and [y]-intercepts of a function from its graph and describe where the function is positive and negative. Find and interpret intercepts in real-world contexts using graphs and tables. Solve linear and quadratic equations by graphing and check the solution. Find the zero of a linear function and explain what it means in the context of a situation.",
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
                    "## Key Terms\n\n- **[x]-intercept** — the point where a graph crosses the [x]-axis, where [y = 0]\n- **[y]-intercept** — the point where a graph crosses the [y]-axis, where [x = 0]\n- **Zero of a function** — the [x]-value for which [f(x) = 0]; corresponds to the [x]-intercept\n- **Positive function** — the graph lies above the [x]-axis on an interval\n- **Negative function** — the graph lies below the [x]-axis on an interval",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Intercepts of a Function",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Intercepts of a Function\n\nThe intercepts of a function are the points where its graph crosses the axes. These values are often the most meaningful in real-world situations because they represent starting amounts or the point at which a quantity reaches zero.\n\n### Key Concept: Finding Intercepts\n\n- To find the [x]-intercept, set [y = 0] and solve for [x]\n- To find the [y]-intercept, set [x = 0] and solve for [y]\n- On a graph, the [x]-intercept is where the curve crosses the horizontal axis; the [y]-intercept is where it crosses the vertical axis",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Examples 1 and 2 — Estimate Intercepts from a Graph",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 1 and 2 — Estimate Intercepts from a Graph\n\nGiven the graph of a function, estimate the coordinates of the [x]- and [y]-intercepts, then describe the intervals where the function is positive and where it is negative.\n\n### Step 1: Locate the [x]-intercept\n\nFind where the graph crosses the [x]-axis. Read the [x]-coordinate of that point.\n\n[y = 0 \\text{ at the } x\\text{-intercept}]\n\n### Step 2: Locate the [y]-intercept\n\nFind where the graph crosses the [y]-axis. Read the [y]-coordinate of that point.\n\n[x = 0 \\text{ at the } y\\text{-intercept}]\n\n\n### Step 3: Identify Positive and Negative Intervals\n\nDetermine where the graph lies above the [x]-axis (function is positive) and where it lies below the [x]-axis (function is negative).",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 3 — Interpret Intercepts in Context",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Interpret Intercepts in Context\n\nGiven a real-world graph (such as the height of a football after being kicked, or earnings over time), estimate the [x]- and [y]-intercepts, identify where the function is positive and negative, and interpret each value in the context of the situation.\n\n### Step 1: Estimate Intercepts from the Graph\n\nRead the [x]-intercept and [y]-intercept from the labeled axes.\n\n### Step 2: Identify Positive and Negative Intervals\n\nNote where the graph is above or below the [x]-axis.\n\n### Step 3: Interpret in Context\n\nDescribe what each intercept means for the real-world quantity being modeled. For example, the [y]-intercept may represent an initial height or starting amount, and the [x]-intercept may represent when a quantity reaches zero.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 4 — Find and Interpret Intercepts from a Table",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Find and Interpret Intercepts from a Table\n\nGiven a table that models a real-world linear relationship (such as a climber's height decreasing over time, or a loan balance decreasing with each payment), find the intercepts and describe what they mean in context.\n\n### Step 1: Find the [y]-intercept\n\nLook for the entry where [x = 0], or extend the pattern backward to the starting value.\n\n### Step 2: Find the [x]-intercept\n\nDetermine the [x]-value that makes the output equal to zero. This may require extending the table or using the rate of change.\n\n### Step 3: Interpret the Intercepts\n\nExplain what each intercept represents. For example:\n\n[\\text{Starting height} = 182.5 \\text{ m}, \\quad \\text{Starting debt} = \\$1950]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Examples 5, 6, and 7 — Solve Equations by Graphing",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 5, 6, and 7 — Solve Equations by Graphing\n\nSolve an equation by graphing each side as a separate function and finding the [x]-coordinate of the intersection point. Check the solution by substituting back into the original equation.\n\n### Step 1: Rewrite Each Side as a Function\n\nLet [y] equal the left side and [y] equal the right side. For example, rewrite [2x - 3 = 3] as:\n\n[y = 2x - 3 \\quad \\text{and} \\quad y = 3]\n\n### Step 2: Graph Both Functions\n\nGraph each function on the same coordinate plane. For linear equations, this is a line and a horizontal line. For quadratic equations, graph the parabola and the line.\n\n\nRepresentative forms include:\n\n[2x - 3 = 3]\n[4 = \\frac{1}{2}x + 5]\n[x^2 = 6x - 8]\n[x^2 + x = 6]\n\n### Step 3: Find the Intersection\n\nThe [x]-coordinate(s) of the intersection point(s) give the solution(s) to the equation.\n\n### Step 4: Check for Special Cases\n\nSome equations have no solution, which appears as parallel lines that never intersect:\n\n[-4x + 2 = -4x + 1]\n[3x - 5 = 3x - 3]\n\n### Step 5: Check the Solution\n\nSubstitute the [x]-value back into the original equation to verify.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 8 — Find and Interpret the Zero of a Function",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 8 — Find and Interpret the Zero of a Function\n\nGiven a linear function that models a real-world situation (such as money left after mailing invitations, or ribbon left after tying gift bags), find the zero of the function and describe what it means in context.\n\n### Step 1: Set the Function Equal to Zero\n\nThe zero occurs where the output equals zero:\n\n[m = 50 - 1.25w = 0]\n[r = 24 - 0.75g = 0]\n\n### Step 2: Solve for the Input Variable\n\nSolve the equation to find the value of the independent variable.\n\n### Step 3: Interpret the Zero\n\nDescribe what the zero represents in the situation. For example, it is the number of items that can be purchased or used before the remaining amount reaches zero.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides cumulative practice across all skills from the lesson. Problems include:\n\n- Estimating [x]- and [y]-intercepts from graphs and describing positive and negative intervals\n- Interpreting intercepts in real-world contexts from graphs (such as a bird's height compared to sea level)\n- Solving equations by graphing and then finding the [x]- and [y]-intercepts of the related functions, including:\n[3x + 1 = -5]\n[9x - 7 = -6x + 8]\n- Analyzing whether linear equations sometimes, always, or never have [x]- and [y]-intercepts and justifying the argument\n- Writing a description of how to find intercepts by graphing and by using tables\n- Creating an original word problem for a given linear function, finding its zero, and interpreting the result\n- Describing the steps to solve a multi-step equation by graphing and explaining how to check the solution",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-3-lesson-5",
        title: "Shapes of Graphs",
        description:
          "Identify line symmetry in the graph of a function and explain its meaning. Determine the intervals where a function is increasing, decreasing, or constant. Locate relative maxima and minima on a graph and interpret them in context. Describe the end behavior of a function using limit notation.",
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
                    "## Key Terms\n\n- **Line symmetry** — A graph has line symmetry if it can be reflected across a vertical line (often the [y]-axis) and map onto itself.\n- **Increasing** — A function is increasing on an interval if, as [x] increases, [f(x)] also increases (the graph rises from left to right).\n- **Decreasing** — A function is decreasing on an interval if, as [x] increases, [f(x)] decreases (the graph falls from left to right).\n- **Relative maximum** — A point on the graph where the function changes from increasing to decreasing, forming a \"peak.\"\n- **Relative minimum** — A point on the graph where the function changes from decreasing to increasing, forming a \"valley.\"\n- **End behavior** — The direction the graph tends as [x] approaches [+\\infty] or [-\\infty].",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Symmetry of Graphs",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Symmetry of Graphs\n\nA function's graph may be symmetric with respect to a vertical line. The most common type is symmetry about the [y]-axis, where [f(-x) = f(x)] for all [x] in the domain. When a graph has this symmetry, the left side mirrors the right side.\n\n### Key Concept: Identifying Symmetry\n\n- Visually inspect whether the left and right halves of the graph are mirror images across a vertical line.\n- If the graph is symmetric about [x = 0], then [f(-a) = f(a)] for any value [a].\n- Explain your conclusion by naming the line of symmetry or stating that no line symmetry exists.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Determine Line Symmetry",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Line Symmetry\n\nExamine each graph and decide whether it has line symmetry. If it does, state the line of symmetry and explain why.\n\n### Step 1: Visually Inspect the Graph\n\nLook at the left and right sides of the curve relative to a vertical line (often the [y]-axis).\n\n### Step 2: State and Justify Your Conclusion\n\nFor a graph symmetric about the [y]-axis:\n[f(-x) = f(x)]\n\nIf no mirror image exists across any vertical line, state that there is no line symmetry.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Interpret Symmetry in Context",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Interpret Symmetry in Context\n\nApply symmetry concepts to real-world scenarios modeled by graphs.\n\n### Step 1: Read the Scenario and Identify the Graph's Features\n\nUnderstand what the variables represent (e.g., width vs. area, horizontal distance vs. height).\n\n### Step 2: Find and Interpret the Symmetry\n\nDetermine whether the graph has a line of symmetry. If so, describe what that symmetry means in the situation.\n\nFor a sprinkler spraying water symmetrically:\n[\\text{The path is symmetric about the vertical line through the maximum height.}]\nThis means the water lands the same distance to the left and right of the center line.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Learn: Increasing and Decreasing Intervals",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Increasing and Decreasing Intervals\n\nA function can be described as increasing, decreasing, or constant over specific intervals of [x]. These intervals are read from left to right along the [x]-axis.\n\n\n### Key Concept: Reading Direction\n\n- **Increasing:** The graph rises as you move from left to right.\n- **Decreasing:** The graph falls as you move from left to right.\n- State intervals using open interval notation (or inequalities) based on the [x]-values.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3 — Determine Where f(x) Is Increasing and/or Decreasing",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Determine Where [f(x)] Is Increasing and/or Decreasing\n\nFor each graphed function, identify the [x]-intervals where the function is increasing and where it is decreasing.\n\n### Step 1: Trace the Graph Left to Right\n\nStarting at the leftmost point, observe whether the [y]-values are going up or down.\n\n### Step 2: Record the Intervals\n\nWrite the intervals using [x]-values. For example:\n[\\text{Increasing on } (-\\infty, 0); \\quad \\text{Decreasing on } (0, \\infty)]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Learn: Extrema of a Function",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Extrema of a Function\n\nExtrema are the high and low points on a graph. A **relative maximum** is a point higher than all nearby points; a **relative minimum** is lower than all nearby points.\n\n### Key Concept: Identifying Extrema\n\n- A relative maximum occurs where the function changes from increasing to decreasing.\n- A relative minimum occurs where the function changes from decreasing to increasing.\n- Read the coordinates [(x, y)] of each extremum from the graph.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 4 — Determine Extrema",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Determine Extrema\n\nFor each graphed function, locate all relative maxima and relative minima. State the coordinates of each point.\n\n### Step 1: Locate Turning Points\n\nFind the \"peaks\" (relative maxima) and \"valleys\" (relative minima) on the graph.\n\n### Step 2: Identify and Label Each Point\n\nState the coordinates and classify each. For example:\n[\\text{Relative maximum at } (-1, 4)]\n[\\text{Relative minimum at } (2, -3)]",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Example 5 — Interpret Extrema in Context",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Interpret Extrema in Context\n\nUse the concept of extrema to analyze real-world graphs and explain what each point means in the given situation.\n\n### Step 1: Locate the Given Point on the Graph\n\nIdentify the coordinates of the marked point (e.g., point [A] on a golf-ball-height graph).\n\n### Step 2: Classify the Point\n\nDecide whether the point is a relative maximum, relative minimum, or neither by examining the behavior of the graph around it.\n\n### Step 3: Describe the Meaning in Context\n\nExplain what the value represents. For a golf ball height graph:\n[\\text{Relative maximum at point } A \\text{ means the ball reaches its highest height at that distance from the tee.}]\n\nFor a rollercoaster height graph, each labeled point ([B], [C], [D], [F]) is classified and interpreted similarly.",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Learn: End Behavior",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: End Behavior\n\nEnd behavior describes what happens to [f(x)] as [x] becomes very large in the positive or negative direction.\n\n### Key Concept: Describing End Behavior\n\n- As [x \\to +\\infty], observe whether [f(x) \\to +\\infty], [f(x) \\to -\\infty], or [f(x) \\to k] (some constant).\n- As [x \\to -\\infty], observe the same.\n- Write the end behavior using arrow notation or limit-style statements.",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Examples 6 and 7 — Determine End Behavior",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 6 and 7 — Determine End Behavior\n\nFor each graphed function, describe the end behavior as [x] approaches [+\\infty] and as [x] approaches [-\\infty].\n\n### Step 1: Examine the Right Side of the Graph\n\nAs [x] gets larger (moves to the right), determine whether the graph rises or falls.\n[x \\to +\\infty]\n\n### Step 2: Examine the Left Side of the Graph\n\nAs [x] gets smaller (moves to the left), determine whether the graph rises or falls.\n[x \\to -\\infty]\n\n### Step 3: Summarize\n\nWrite the complete end behavior. For example:\n[\\text{As } x \\to +\\infty, \\; f(x) \\to +\\infty]\n[\\text{As } x \\to -\\infty, \\; f(x) \\to -\\infty]",
                },
              },
            ],
          },
          {
            phaseNumber: 12,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThese exercises combine all skills from the lesson: line symmetry, increasing/decreasing intervals, extrema (relative maxima and minima), and end behavior.\n\nFor problems 21–22, analyze a single graph and provide a complete description: state whether it has line symmetry, identify all intervals of increase and decrease, locate and classify all extrema, and describe the end behavior.\n\nProblems 23–24 present real-world contexts (a rock thrown into the air; computers affected by a virus) and ask students to apply the appropriate graphical analysis skill.\n\nProblem 25 is a \"Which One Doesn't Belong?\" activity: students evaluate four statements about a single graph and determine which statement is false, then justify their conclusion using evidence from the graph.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-3-lesson-6",
        title: "Sketching Graphs and Comparing Functions",
        description:
          "Sketch graphs of real-world functions from verbal descriptions, identifying intercepts, intervals of increase and decrease, end behavior, extrema, and symmetry. Compare two functions by interpreting their key features from descriptions and graphs. Write and analyze linear functions that model cost, revenue, and profit in a business context. Use technology to verify hand-sketched graphs of functions.",
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
                    "## Key Terms\n\n- **[x]-intercept** — The point where the graph crosses the [x]-axis; the input value for which the output is zero.\n- **[y]-intercept** — The point where the graph crosses the [y]-axis; the output value when the input is zero.\n- **Linear function** — A function whose graph is a straight line and has a constant rate of change.\n- **Nonlinear function** — A function whose graph is not a straight line and may have curves or turning points.\n- **Increasing** — The function values rise as the input values increase.\n- **Decreasing** — The function values fall as the input values increase.\n- **Relative maximum** — A point where the function changes from increasing to decreasing, forming a local high point.\n- **Relative minimum** — A point where the function changes from decreasing to increasing, forming a local low point.\n- **End behavior** — A description of what happens to the function values as the input approaches positive or negative infinity.\n- **Symmetry** — A property where one part of the graph mirrors another part across a line or point.\n- **Revenue** — The total income generated from selling a number of items.\n- **Cost** — The total amount spent to produce or acquire items, including fixed and variable costs.\n- **Profit** — The amount remaining when total cost is subtracted from total revenue.\n- **Break-even point** — The point where revenue equals cost, resulting in zero profit.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Key Features of Functions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Key Features of Functions\n\nFunctions can be described and sketched by analyzing their key features. Recognizing whether a function is linear or nonlinear is the first step. Linear functions have straight-line graphs and constant rates of change, while nonlinear functions may curve and have turning points.\n\n### Key Concept: Describing a Function's Graph\n\n- **Intercepts:** Locate where the graph crosses the axes. The [y]-intercept is at [(0, b)] and the [x]-intercept is where [y = 0].\n- **Intervals:** Determine where the function is positive ([y > 0]) or negative ([y < 0]), and where it is increasing or decreasing.\n- **Extrema:** Identify any relative maximum or minimum points.\n- **End Behavior:** Describe what happens to [y] as [x \\to \\infty] or [x \\to -\\infty].\n- **Symmetry:** Note whether the graph is symmetric about a vertical line or the origin.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn: Modeling with Functions",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Modeling with Functions\n\nReal-world situations can be represented by functions. By translating words into mathematical expressions, you can sketch graphs, compare trends, and make predictions.\n\n### Key Concept: Writing Functions from Context\n\n- Identify the independent and dependent variables.\n- Determine whether the relationship is linear (constant rate) or nonlinear.\n- Write an equation using appropriate formulas, such as [y = mx + b] for linear situations.\n- Use the function to calculate specific values, sketch a graph, and interpret key features in context.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1 — Sketch Linear Functions from Verbal Descriptions",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Sketch Linear Functions from Verbal Descriptions\n\nSketch a graph that models a real-world linear relationship by using the given key features.\n\n### Step 1: Identify the Function Type and Intercept\n\nDetermine whether the relationship is linear or nonlinear. For a linear situation, note the [y]-intercept. For example, a savings account starts with an initial amount:\n\n[\\text{y-intercept} = 1400]\n\n### Step 2: Determine Direction and Sign\n\nDecide whether the function is increasing or decreasing and whether the outputs are positive or negative for the relevant domain. For time greater than zero, the amount saved increases:\n\n[\\text{Increasing for } x > 0]\n\n### Step 3: Sketch the Graph\n\nDraw a straight line that passes through the [y]-intercept and continues in the correct direction. Label the axes and indicate the scale. State the end behavior:\n\n[\\text{As } x \\to \\infty,\\; y \\to \\infty]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2 — Sketch Nonlinear Functions and Interpret Key Features",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Sketch Nonlinear Functions and Interpret Key Features\n\nSketch a nonlinear graph from a verbal description and interpret intercepts, intervals of increase and decrease, relative extrema, end behavior, and symmetry.\n\n### Step 1: Identify the Shape and Intercepts\n\nRecognize that the situation is nonlinear. A football's height over time is a parabolic curve. Note any intercepts:\n\n[\\text{y-intercept at } (0, 0)]\n\n### Step 2: Locate the Turning Point and Intervals\n\nFind the relative maximum and the intervals where the function is increasing or decreasing. For the football:\n\n[\\text{Relative maximum at } (2, 9)]\n\n[\\text{Increasing for } x < 2,\\quad \\text{Decreasing for } x > 2]\n\n### Step 3: Describe Sign, Symmetry, and End Behavior\n\nState where the outputs are positive or negative, describe any symmetry, and give the end behavior. The height is positive while the ball is in the air:\n\n\n[\\text{Positive for } 0 < x < 5]\n\n[\\text{Symmetry about } x = 2]\n\n[\\text{As } x \\to \\infty,\\; y \\to -\\infty]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3 — Sketch and Interpret Real-World Data Trends",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Sketch and Interpret Real-World Data Trends\n\nSketch a graph that models survey or poll data over time, then interpret intercepts, extrema, intervals of increase and decrease, and end behavior.\n\n### Step 1: Plot the Initial Value\n\nUse the given [y]-intercept to anchor the graph. For example, a poll shows about 60 people responded yes at the start:\n\n[(0, 60)]\n\n### Step 2: Trace the Trend\n\nDetermine whether the function increases, decreases, or changes direction over the domain. Some polls rise steadily:\n\n[\\text{Increasing for all } x > 0]\n\nOthers may rise, fall, and rise again, producing a relative maximum and minimum:\n\n[\\text{Relative maximum at } (10, 39)]\n\n\n[\\text{Relative minimum at } (65, 31)]\n\n\n### Step 3: Interpret the End Behavior\n\n\nDescribe what happens as time continues. Because the data represent people, the output is bounded by the survey size:\n\n[\\text{As } x \\to \\infty,\\; y \\text{ increases toward the maximum surveyed.}]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4 — Compare Functions from Descriptions and Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Compare Functions from Descriptions and Graphs\n\nUse a verbal description and a graph to compare two related functions, writing statements about their key features over the same interval.\n\n### Step 1: Extract Key Features from the Description\n\nRead the description to find intercepts, changes in direction, and end behavior for the first function. For example, Internet use at home started at about 10,000 users:\n\n[(0, 10000)]\n\n\nIt decreased to 7,000 users after 36 months, then increased again.\n\n\n### Step 2: Extract Key Features from the Graph\n\nExamine the second function's graph to find its intercept, trends, and end behavior over the same time period.\n\n### Step 3: Write Comparison Statements\n\nCompare the two functions by stating which has a greater initial value, which decreases or increases faster, and how their end behaviors differ. Use specific values when possible:\n\n[\\text{At } x = 0,\\; y_{\\text{home}} = 10000 \\quad \\text{and} \\quad y_{\\text{away}} = \\text{value from graph.}]",
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
                    "## Mixed Exercises\n\nThe mixed exercises apply the lesson skills to new contexts and integrate earlier topics.\n\n- **Modeling geometry:** Given a cone with a fixed slant height of [20] inches, sketch the graph of the lateral area as a function of the base radius [x]. Write the function [y = \\pi x (20)], enter it into a graphing calculator with an appropriate window, and compare the calculator graph to the hand-drawn sketch.\n- **Business applications:** Given a fixed cost of [840] dollars, a per-unit cost of [47] dollars, and a selling price of [75] dollars per bicycle, write revenue and cost functions [R(x)] and [C(x)], combine them into a profit function [P(x) = R(x) - C(x)], list key features, sketch the profit graph, and identify the break-even point as the [x]-intercept where [P(x) = 0].\n- **Research and create:** Gather population data for your state over a 10-year period, sketch a graph to model the data, and list the key features of the graph.",
                },
              },
            ],
          },
        ],
      },
    ];

    for (const lessonData of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lessonData.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 3,
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

        await ctx.db.insert("phase_versions", {
          lessonVersionId,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          estimatedMinutes: phase.estimatedMinutes,
          phaseType: phase.phaseType,
          createdAt: now,
        });

        phasesCreated++;
      }

      result.push({
        lessonId,
        lessonVersionId,
        slug: lessonData.slug,
        phasesCreated,
      });
    }

    return { lessons: result };
  },
});
