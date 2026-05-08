import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedActivityContent {
  componentKey: string;
  props: Record<string, unknown>;
  gradingConfig?: { autoGrade: boolean; partialCredit: boolean } | undefined;
}

interface SeedResult {
  lessonsSeeded: number;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedModule6Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedResult> => {
    const now = Date.now();
    let lessonsSeeded = 0;
    let totalPhasesCreated = 0;
    let totalActivitiesCreated = 0;

    const lessons = [
      {
        slug: "6-1-one-step-inequalities",
        title: "Solving One-Step Inequalities",
        description:
          "Graph the solution set of a one-step inequality on a number line. Write an inequality that matches a given number-line graph. Solve one-step inequalities using addition, subtraction, multiplication, and division, including when the coefficient is negative. Translate real-world situations into inequalities, solve them, and interpret the solutions.",
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
                    "## Key Terms\n\n- **inequality** — A mathematical statement that compares two expressions using symbols such as $[<]$, $[>]$,$[\\le]$, or$[\\ge]$.\n- **solution set** — The set of all values that make an inequality true.\n- **open circle** — Used on a number line to show that a boundary value is *not* included in the solution.\n- **closed circle** — Used on a number line to show that a boundary value *is* included in the solution.\n- **at least** — Means greater than or equal to,$[\\ge]$.\n- **at most** — Means less than or equal to,$[\\le]$.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving One-Step Inequalities\n\nSolving a one-step inequality uses the same inverse-operation strategy as solving a one-step equation. The goal is to isolate the variable on one side.\n\n### Key Concept: One-Step Inequalities\n\n- To undo addition, subtract the same number from both sides.\n- To undo subtraction, add the same number to both sides.\n- To undo multiplication, divide both sides by the same nonzero number.\n- To undo division, multiply both sides by the same nonzero number.\n- **Critical rule:** When you multiply or divide both sides of an inequality by a *negative* number, you **must reverse** the inequality symbol.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Graph Solution Sets\n\nGraph the solution set of each inequality on a number line.\n\n### Step 1: Identify the Boundary and Direction\n\nDetermine whether the boundary value is included (closed circle for$[\\le]$ or$[\\ge]$) or excluded (open circle for$[<]$ or$[>]$). Then shade the number line in the direction indicated by the inequality symbol.\n\nRepresentative inequalities: $[x \\le -5]$, $[y \\ge -2]$, $[g > 5]$, $[a < 7]$",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write Inequalities from Graphs\n\nWrite an inequality that represents each number-line graph.\n\n### Step 1: Read the Graph\n\nIdentify the boundary value, whether the circle is open or closed, and the direction of the shaded ray. Translate these features into the correct inequality symbol and value.",
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
                    "## Examples 3–5 — Solve One-Step Inequalities (Addition and Subtraction)\n\nSolve each inequality.\n\n### Step 1: Isolate the Variable\n\nUse the inverse operation to move the constant to the other side.\n\nRepresentative problems: $[m - 4 < 3]$, $[p - 6 \\ge 3]$, $[b + 2 \\ge 4]$, $[13 > 18 + r]$\n\n### Step 2: Variables on Both Sides\n\nWhen the variable appears on both sides, collect variable terms on one side first by adding or subtracting the smaller variable term.\n\nRepresentative problems: $[2a \\le -4 + a]$, $[z + 4 \\ge 2z]$, $[3y \\le 2y - 6]$, $[6x + 5 \\ge 7x]$",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Apply Inequalities to Real-World Problems\n\nDefine a variable, write an inequality, and solve.\n\n### Step 1: Pizza Cost\n\nTara eats 3 of 10 slices and pays $4.50, which is at least her fair share. Write and solve an inequality to find the total cost of the pizza.\n\n### Step 2: Tornado Wind Speeds\n\nUse the Fujita tornado classification table to write and solve inequalities about wind speeds.\n\n- **Part a:** An F3 tornado has winds of 162 mph. Determine how much the winds must increase to become an F4 tornado.\n- **Part b:** A tornado has wind speeds of at least 158 mph. Describe how much greater these speeds are than the slowest tornado.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 7 — Mixed Real-World Applications\n\nDefine a variable, write an inequality, and solve each problem.\n\n### Step 1: Garbage and Recycling\n\nThe average American creates 4.6 pounds of garbage daily. If at least 2.5 pounds could be recycled, determine how much still goes to a landfill.\n\n### Step 2: Supreme Court Service\n\nJohn Jay served 2,079 days as Chief Justice, which is 10,463 days fewer than John Marshall. Determine how many days the current Chief Justice must serve to surpass Marshall's record.\n\n### Step 3: Lost Luggage\n\nAt least 25,000 pieces of luggage are lost daily, and 98% are located within 5 days. Find the minimum number still lost after 5 days.\n\n### Step 4: Test Average\n\nGilberto earned scores of 86, 88, and 78 on three tests. Find the lowest score he can earn on the fourth test to have an average of at least 83.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Examples 8–10",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 8–10 — Solve and Graph Inequalities (Multiplication and Division)\n\nSolve each inequality and graph the solution on a number line.\n\n### Step 1: Undo Multiplication or Division\n\nDivide or multiply both sides by the coefficient of the variable. Remember to reverse the inequality symbol when multiplying or dividing by a negative number.\n\nRepresentative problems with fractions: $[\\frac{1}{4}m \\le -17]$,$[\\frac{2}{3}h > 14]$,$[-\\frac{3}{4}j \\ge 12]$\n\nRepresentative problems with negative divisors: $[-10 \\le \\frac{x}{-2}]$,$[\\-72 < \\frac{f}{-6}]$\n\nRepresentative problems with negative coefficients: $[-2d < 5]$,$[\\-7f > 5]$,$[\\-33 \\ge -3z]$",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills in the lesson:\n\n- **Matching (55–60):** Match symbolic inequalities such as[$3n < 9$],[$\\frac{1}{3}n \\ge 9$], and[$-3n > 9$] to their corresponding verbal descriptions.\n- **Translate and Solve (61–66):** Define a variable, write a one-step inequality from a verbal statement, solve it, and check the solution. Statements include \"seven more than a number is less than or equal to[$-18$]\" and \"one eighth of a number is less than or equal to 3.\"\n- **Structure Problems (67–74):** Solve an inequality, check the solution, and graph it on a number line. Problems involve integer, decimal, and fractional coefficients.\n- **Extended Applications (75–78):** Solve multi-step word problems involving event-planning costs, vitamin requirements, sound-level comparisons, and exam-score interpretations.\n- **Reasoning (79–82):** Identify which inequality does not belong to a given solution set, analyze a worked error example, solve inequalities with a literal coefficient[$a$], and determine whether a reciprocal statement is sometimes, always, or never true.",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- **Example 2:** Number-line graphs for problems 7–12 are image-based and must be reviewed from the original worksheet.\n- **Example 6 (problem 32):** The Fujita tornado classification table is an image and must be reviewed from the original worksheet.\n- **Example 7 (problem 77):** The image of the African cicada and blue whale must be reviewed from the original worksheet.\n- **Mixed Exercises (problem 80):** Marty and Heath's worked solutions are shown in an image and must be reviewed from the original worksheet.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "6-2-multi-step-inequalities",
        title: "Solving Multi-Step Inequalities",
        description:
          "Solve multi-step linear inequalities using the Distributive Property, combining like terms, and inverse operations. Translate real-world situations and verbal sentences into algebraic inequalities, then solve and interpret the results. Graph the solution set of an inequality on a number line, including solutions with fractions and decimals. Recognize and explain special solution sets such as 'no solution' and 'all real numbers'.",
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
                    "## Key Terms\n\n- **inequality** — a mathematical statement that compares two expressions using[$<$],[$>$],[$\\le$],[$\\ge$], or[$\\ne$]\n- **solution set** — the set of all values that make an inequality true\n- **Addition Property of Inequality** — adding the same number to both sides of an inequality preserves the inequality relationship\n- **Division Property of Inequality** — dividing both sides by a positive number preserves the inequality; dividing by a negative number reverses the inequality symbol\n- **Distributive Property** — multiplying a sum by a number yields the same result as multiplying each addend by the number and adding the products",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Multi-Step Inequalities\n\nSolving multi-step inequalities follows the same general process as solving multi-step equations, with one critical difference: whenever you multiply or divide both sides by a negative number, you must reverse the inequality symbol.\n\n### Key Concept: Solving Process\n\n- Simplify each side of the inequality by applying the Distributive Property and combining like terms\n- Use addition or subtraction to isolate the variable term on one side\n- Use multiplication or division to isolate the variable; reverse the inequality symbol if multiplying or dividing by a negative number\n- Graph the solution on a number line using an open circle for[$<$] or[$>$] and a closed circle for[$\\le$] or[$\\ge$]",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Write and Solve Real-World Inequalities\n\nTranslate contextual situations into inequalities, solve them, and interpret the solution in the original context. Problems involve fixed fees plus variable rates, sums with constraints, and tiered pricing structures.\n\n### Step 1: Define the Variable and Identify Quantities\n\nRead the situation to identify the unknown quantity, the fixed value, and the rate or relationship. For example, a one-time fee of 15 dollars plus 2 dollars per hour with a budget of 35 dollars:\n\n[$15 + 2h \\le 35$]\n\n### Step 2: Solve the Inequality\n\nUse inverse operations to isolate the variable. Subtract the fixed fee from both sides, then divide by the rate:\n\n[$2h \\le 20 \\quad \\Rightarrow \\quad h \\le 10$]\n\n### Step 3: Interpret the Solution\n\nState the answer in the context of the problem. The maximum number of hours is 10. Some problems ask for a generalized method when parameters change, such as a first[$\\frac{1}{a}$] mile at one rate and each additional[$\\frac{1}{a}$] mile at another rate.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Translate Verbal Sentences into Inequalities\n\nConvert English sentences into symbolic inequalities, solve them, and graph the solution on a number line. These problems test careful reading of phrases such as \"greater than,\" \"less than or equal to,\" \"the sum of,\" and \"the difference of.\"\n\n### Step 1: Translate Words to Symbols\n\nIdentify the variable, the operations described, and the comparison. For example, \"Five times a number minus one is greater than or equal to negative eleven\" becomes:\n\n[$5n - 1 \\ge -11$]\n\nOther common translations include:\n\n- \"Twenty-one is greater than the sum of fifteen and two times a number\" →[$21 > 15 + 2n$]\n- \"A number divided by eight minus thirteen is greater than negative six\" →[$\\frac{n}{8} - 13 > -6$]\n- \"The difference of three times a number and six is greater than or equal to the sum of fifteen and twenty-four times a number\" →[$3n - 6 \\ge 15 + 24n$]\n\n### Step 2: Solve the Inequality\n\nSimplify and isolate the variable using inverse operations. Remember to reverse the inequality symbol when multiplying or dividing by a negative number.\n\n### Step 3: Graph on a Number Line\n\nDraw a number line. Use a closed circle for[$\\le$] or[$\\ge$] and an open circle for[$<$] or[$>$]. Shade in the direction of the solutions.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Solve and Graph Multi-Step Inequalities\n\nSolve algebraic inequalities that require the Distributive Property and combining like terms, then graph the solution on a number line.\n\n### Step 1: Simplify Each Side\n\nApply the Distributive Property where needed. For example:\n\n[$-3(7n + 3) < 6n \\quad \\Rightarrow \\quad -21n - 9 < 6n$]\n\nAnother example:\n\n[$21 \\ge 3(a - 7) + 9 \\quad \\Rightarrow \\quad 21 \\ge 3a - 21 + 9 \\quad \\Rightarrow \\quad 21 \\ge 3a - 12$]\n\n### Step 2: Isolate the Variable\n\nCollect variable terms on one side and constants on the other. When a variable term disappears, check whether the remaining statement is always true (all real numbers) or always false (no solution).\n\n### Step 3: Graph the Solution\n\nGraph the final solution on a number line. Watch for solutions that involve reversing the inequality symbol when dividing by a negative number.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills from the lesson. The problem set includes:\n\n- Solving multi-step inequalities with the Distributive Property and combining like terms, then checking the solution\n- Inequalities involving fractions, such as[$\\frac{2x - 4}{6} \\ge -5x + 2$]\n- Inequalities with decimal coefficients, such as[$5.6z + 1.5 < 2.5z - 4.7$]\n- Using a graphing calculator to solve and verify inequalities\n- Real-world application problems involving geometric constraints (perimeter, area), budgeting, averaging, and dosage calculations\n- Conceptual reasoning problems asking students to construct arguments, analyze structure, explain when a solution set is empty or all real numbers, and create original inequalities with specified properties\n- Solving inequalities in terms of a parameter, such as[$ax + 5 < 11$] where[$a \\ne 0$]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problem 38b references a medicine label image (`media/image1.png`) that was not extracted; a human reviewer should supply the label text or dosage table\n- Problem 43 references an image (`media/image2.png`) that was not extracted; the problem asks students to write and solve an inequality for an exam average\n- Problem 44 references an image (`media/image3.png`) that was not extracted; the problem involves a triangular carpet with constraints on side lengths\n- Problem 45 references a graph image (`media/image3.png`) showing a solution set on a number line; students are asked to write an inequality that produces that graph\n- Problem 50 references an image (`media/image4.png`) displaying four inequalities for a \"Which One Doesn't Belong?\" task; a human reviewer should supply the four inequality expressions",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "6-3-compound-inequalities",
        title: "Solving Compound Inequalities",
        description:
          "Solve compound inequalities involving 'and' and 'or' and express the solution algebraically. Graph the solution set of a compound inequality on a number line. Write compound inequalities that model real-world situations and interpret the solutions in context. Translate number-line graphs into compound inequality notation.",
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
                    "## Key Terms\n\n- **compound inequality** — two or more inequalities joined by the word \"and\" or \"or.\"\n- **intersection** — the solution set of a compound inequality with \"and\"; includes only values that satisfy both inequalities.\n- **union** — the solution set of a compound inequality with \"or\"; includes all values that satisfy at least one of the inequalities.\n- **bounded interval** — a solution set with finite upper and lower endpoints.\n- **unbounded interval** — a solution set that extends to infinity in at least one direction.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Compound Inequalities\n\nA compound inequality can be written as two separate inequalities joined by \"and\" or \"or.\" When the same expression is bounded between two values, it can often be solved as a single three-part inequality.\n\n### Key Concept: Compound Inequality Types\n\n- **\"And\" inequalities (intersection):** Both conditions must be true. The solution is the overlap of the two individual solution sets.\n[$a < x < b \\quad \\text{means} \\quad x > a \\; \\text{and} \\; x < b$]\n- **\"Or\" inequalities (union):** Either condition may be true. The solution includes all values from both individual solution sets.\n[$x < a \\; \\text{or} \\; x > b$]\n- When solving a three-part inequality, perform the same operation on all three parts to isolate the variable.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Compound Inequalities\n\nSolve compound inequalities involving \"and\" or \"or.\" Graph the solution set on a number line.\n\n### Step 1: Identify the Structure\n\nDetermine whether the inequality uses \"and\" or \"or.\" For three-part inequalities such as[$-5 < 3p + 7 \\le 22$], recognize it as an \"and\" statement.\n\n### Step 2: Solve Each Part\n\nFor separate inequalities, solve each one independently using the Addition and Division Properties of Inequality.\n\nRepresentative \"and\" problem:[$f - 6 < 5 \\quad \\text{and} \\quad f - 4 \\ge 2$]\n\nRepresentative \"or\" problem:[$y - 1 \\ge 7 \\quad \\text{or} \\quad y + 3 < -1$]\n\nRepresentative three-part inequality:[$-3 \\le 7c + 4 < 18$]\n\n### Step 3: Find the Combined Solution\n\n- For \"and,\" the final solution is the intersection of the two intervals.\n- For \"or,\" the final solution is the union of the two intervals.\n\n### Step 4: Graph the Solution\n\nShade the number line to represent the final interval. Use open circles for[$<$] or[$>$] and closed circles for[$\\le$] or[$\\ge$].",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Model Real-World Situations\n\nDefine a variable, write a compound inequality, and solve word problems in context.\n\n### Step 1: Define the Variable\n\nIdentify the unknown quantity and assign a variable.\n\n### Step 2: Write the Inequality\n\nTranslate the verbal description into a compound inequality. For example, a combined height that must be less than 20 feet or greater than 35 feet translates to:\n[$x + 8 < 20 \\quad \\text{or} \\quad x + 8 > 35$]\n\n### Step 3: Solve and Interpret\n\nSolve for the variable and interpret the solution within the constraints of the problem. Check that the answer is reasonable in context.",
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
                    "## Example 3 — Write Inequalities from Graphs\n\nGiven a number-line graph, write the compound inequality it represents.\n\n### Step 1: Identify Endpoints and Boundaries\n\nRead the endpoints shown on the graph. Note whether each endpoint is open or closed.\n\n### Step 2: Determine \"And\" or \"Or\"\n\n- If the shaded regions overlap or form a single continuous segment, use \"and.\"\n- If the shaded regions are separated, use \"or.\"\n\n### Step 3: Write the Inequality\n\nExpress the graph algebraically. For example, a graph shaded between[$-2$] and[$3$] with closed circles is:\n[$-2 \\le x \\le 3$]\n\nA graph shaded to the left of[$-1$] or to the right of[$4$] is:\n[$x < -1 \\quad \\text{or} \\quad x > 4$]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises integrate all skills from the lesson:\n\n- Solving and graphing compound inequalities with \"and\" and \"or.\"\n- Solving three-part inequalities.\n- Translating verbal descriptions into compound inequalities and checking solutions.\n- Writing inequalities from number-line graphs.\n- Real-world applications involving temperature ranges, BMI, the Triangle Inequality, density, and budgeting.\n- Error analysis, reasoning, and construction of arguments about the structure of compound inequalities.\n\nProblems include multiple-choice analysis, finding errors in student work, and creating original compound inequalities that meet specified constraints.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Example 2, problem 17: Image of a store sign diagram (`image1.png`) is present but not described in the extracted text.\n- Examples 5 and 6, problems 19–26: Number-line graphs (`image2.png` through `image9.png`) are referenced but not described.\n- Mixed Exercise 35: Weather forecast number-line graph (`image10.png`) is referenced but not described.\n- Mixed Exercise 39: Triangle diagram (`image11.png`) is referenced but not described.\n- Mixed Exercise 41: Number-line graph (`image12.png`) is referenced but not described.\n- Mixed Exercise 42: Density table (`image13.png`) is referenced but not described.\n- Mixed Exercise 44: Number-line graph (`image14.png`) is referenced but not described.\n- Mixed Exercise 46: Error-analysis work (`image15.png`) is referenced but not described.\n- Mixed Exercises 47–49: Two number-line graphs (`image16.png` and `image17.png`) are referenced but not described.\n- Mixed Exercise 50: Triangular flower bed diagram (`image18.png`) is referenced but not described.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "6-4-absolute-value-inequalities",
        title: "Solving Absolute Value Inequalities",
        description:
          "Solve absolute value inequalities and rewrite them as compound inequalities using and or or. Graph the solution set of an absolute value inequality on a number line. Model real-world situations with absolute value inequalities and interpret the solutions. Recognize special cases where an absolute value inequality has no solution or all real numbers as solutions.",
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
                    "## Key Terms\n\n- **absolute value inequality** — An inequality that contains an absolute value expression, such as[$|x - 3| < 5$].\n- **compound inequality** — Two inequalities joined by the word *and* or *or*.\n- **solution set** — The set of all values that make an inequality true.\n- **margin of error** — The maximum allowable difference between a measured or claimed value and the actual value.\n- **open sentence** — A mathematical statement that contains a variable and becomes true or false when values are substituted.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Absolute Value Inequalities\n\nAn absolute value inequality can be rewritten as a compound inequality. The direction of the inequality symbol and the sign of the right-hand side determine the form of the compound inequality.\n\n### Key Concept: Rewriting Absolute Value Inequalities\n\n- If[$|X| < a$] and[$a > 0$], rewrite as[$-a < X < a$] (compound inequality with *and*).\n- If[$|X| \\le a$] and[$a > 0$], rewrite as[$-a \\le X \\le a$] (compound inequality with *and*).\n- If[$|X| > a$] and[$a > 0$], rewrite as[$X < -a$] or[$X > a$] (compound inequality with *or*).\n- If[$|X| \\ge a$] and[$a > 0$], rewrite as[$X \\le -a$] or[$X \\ge a$] (compound inequality with *or*).\n- If[$a < 0$] and the symbol is[$<$] or[$\\le$], there is **no solution** because absolute value is never negative.\n- If[$a < 0$] and the symbol is[$>$] or[$\\ge$], the solution is **all real numbers** because absolute value is always non-negative.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Less-Than Absolute Value Inequalities\n\nSolve absolute value inequalities with less-than or less-than-or-equal-to symbols, then graph the solution set on a number line.\n\n### Step 1: Identify the Form\n\nDetermine whether the inequality uses[$<$] or[$\\le$] and whether the right-hand side is positive or negative.\n\nFor[$|x + 8| < 16$]:\n[$-16 < x + 8 < 16$]\n\n### Step 2: Solve the Compound Inequality\n\nIsolate the variable in the middle by subtracting or adding the same value to all three parts.\n\n[$-16 - 8 < x < 16 - 8$]\n[$-24 < x < 8$]\n\nFor inequalities with a coefficient on the variable inside the absolute value, such as[$|2c - 1| \\le 7$]:\n[$-7 \\le 2c - 1 \\le 7$]\n[$-6 \\le 2c \\le 8$]\n[$-3 \\le c \\le 4$]\n\n### Step 3: Graph the Solution\n\nGraph the solution set on a number line using open or closed circles depending on the inequality symbol.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Solve Greater-Than Absolute Value Inequalities\n\nSolve absolute value inequalities with greater-than or greater-than-or-equal-to symbols, then graph the solution set on a number line.\n\n### Step 1: Identify the Form\n\nDetermine whether the inequality uses[$>$] or[$\\ge$] and whether the right-hand side is positive or negative.\n\nFor[$|r + 2| > 6$]:\n[$r + 2 < -6 \\quad \\text{or} \\quad r + 2 > 6$]\n\n### Step 2: Solve Each Inequality\n\nSolve each part of the compound inequality separately.\n\n[$r < -8 \\quad \\text{or} \\quad r > 4$]\n\nFor inequalities with a coefficient, such as[$|2h - 3| \\ge 9$]:\n[$2h - 3 \\le -9 \\quad \\text{or} \\quad 2h - 3 \\ge 9$]\n[$2h \\le -6 \\quad \\text{or} \\quad 2h \\ge 12$]\n[$h \\le -3 \\quad \\text{or} \\quad h \\ge 6$]\n\n### Step 3: Graph the Solution\n\nGraph both parts of the solution on a number line. The solution is the union of the two intervals.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Real-World Applications\n\nWrite and solve absolute value inequalities that model real-world situations involving tolerance, margin of error, or acceptable ranges.\n\n### Step 1: Translate the Situation\n\nIdentify the target value and the allowable deviation from that value.\n\nFor a speedometer accurate within[$± 2.5\\%$] at 60 mph:\n[$|s - 60| \\le 0.025(60)$]\n[$|s - 60| \\le 1.5$]\n\n### Step 2: Solve and Interpret\n\nSolve the inequality and interpret the result in the context of the problem.\n\n[$-1.5 \\le s - 60 \\le 1.5$]\n[$58.5 \\le s \\le 61.5$]\n\nThe car could actually be traveling between 58.5 mph and 61.5 mph.\n\nOther situations include baking temperatures within a range, paint amounts within a tolerance, healthy weight ranges, and SAT scores within standard deviations of the mean.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Special Cases\n\nRecognize and explain absolute value inequalities that have no solution or all real numbers as solutions.\n\n### No Solution\n\nWhen the right-hand side is negative and the symbol is[$<$] or[$\\le$], the inequality has no solution because an absolute value can never be less than a negative number.\n\n[$|m + 4| < -2 \\quad \\Rightarrow \\quad \\text{no solution}$]\n\n[$\\left|\\frac{7c + 3}{2}\\right| \\le -5 \\quad \\Rightarrow \\quad \\text{no solution}$]\n\n### All Real Numbers\n\nWhen the right-hand side is negative and the symbol is[$>$] or[$\\ge$], the solution is all real numbers because an absolute value is always non-negative.\n\n[$|5v + 3| > -9 \\quad \\Rightarrow \\quad \\text{all real numbers}$]\n\n[$\\left|\\frac{2g + 3}{2}\\right| > -7 \\quad \\Rightarrow \\quad \\text{all real numbers}$]",
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
                    "## Example 5 — Fractional Coefficients and Mixed Practice\n\nSolve more complex absolute value inequalities that include fractional expressions or negative coefficients inside the absolute value, then graph each solution set.\n\n### Fractional Expressions\n\nFor inequalities such as[$\\left|\\frac{3h + 1}{2}\\right| < 8$]:\n[$-8 < \\frac{3h + 1}{2} < 8$]\n[$-16 < 3h + 1 < 16$]\n[$-17 < 3h < 15$]\n[$-\\frac{17}{3} < h < 5$]\n\n### Negative Coefficients\n\nFor inequalities such as[$|-6r - 4| < 8$], first isolate the absolute value, then proceed as usual. The negative coefficient does not change the solving process.\n\n[$-8 < -6r - 4 < 8$]\n[$-4 < -6r < 12$]\n\nRemember to reverse the inequality symbols when dividing by a negative number:\n[$\\frac{2}{3} > r > -2 \\quad \\text{or} \\quad -2 < r < \\frac{2}{3}$]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice across all skills from this lesson. Students write absolute value open sentences from number line graphs, match inequalities to their graphical solutions, model real-world scenarios with absolute value inequalities and then solve and graph them, solve a variety of absolute value inequalities with and without fractional coefficients, and engage in reasoning tasks such as finding errors in worked solutions, constructing arguments about solution sets, analyzing the relationship between absolute value and compound inequalities, and creating their own inequalities.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problems 26–31 require number line graphs that are not described in the source text. Each graph shows a solution interval (or union of intervals) on a number line; students must write the corresponding absolute value open sentence.\n- Problems 32–35 require matching absolute value inequalities to their number line graph solutions. The graphs are not described in the source text.\n- Problem 51 includes an image showing the work of Jordan and Chloe solving[$|x + 3| > 10$]. The image is not described; human review is needed to evaluate their reasoning.\n- Problem 53 includes a number line graph image showing the solution to[$2 < |n + 1| \\le 7$]. The graph is not described in the source text.\n- Problem 54 includes a number line graph image. The graph is not described in the source text.\n- Problem 55 includes an image showing Lucita's graph of[$|2a - 3| > 1$]. The image is not described; human review is needed to evaluate her work.\n- Problem 60 includes an image showing four absolute value inequalities and asks which one does not belong. The image is not described; human review is needed.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "6-5-graphing-inequalities-two-variables",
        title: "Graphing Inequalities in Two Variables",
        description:
          "Graph linear inequalities in two variables written in slope-intercept and standard form. Write linear inequalities to model real-world constraints and verify solution points. Analyze boundary lines, half-planes, and test points to determine solution regions.",
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
                    "## Key Terms\n\n- **linear inequality in two variables** — An inequality that can be written in the form[$ax + by < c$],[$ax + by > c$],[$ax + by \\le c$], or[$ax + by \\ge c$] where[$a$],[$b$], and[$c$] are constants.\n- **boundary line** — The line[$ax + by = c$] that separates the coordinate plane into two half-planes.\n- **half-plane** — The region on one side of a boundary line that contains all points satisfying the inequality.\n- **test point** — A point, often[$(0, 0)$] when it is not on the boundary line, used to determine which half-plane contains the solutions.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Graphing Linear Inequalities\n\nTo graph a linear inequality in two variables, first graph the boundary line from the corresponding equation. Then use a test point to determine which half-plane represents the solution set.\n\n### Key Concept: Boundary Lines and Shading\n\n- If the inequality symbol is[$<$] or[$>$], draw a **dashed** boundary line to show that points on the line are not solutions.\n- If the inequality symbol is[$\\le$] or[$\\ge$], draw a **solid** boundary line to show that points on the line are solutions.\n- Choose a test point not on the boundary line, usually[$(0, 0)$], and substitute its coordinates into the inequality.\n- If the test point makes the inequality true, shade the half-plane containing that point. If false, shade the opposite half-plane.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Graph Inequalities in Slope-Intercept Form\n\nGraph linear inequalities that are given in slope-intercept form.\n\n### Step 1: Graph the Boundary Line\n\nRewrite the inequality as an equation and graph the line. Use a dashed line for[$<$] or[$>$] and a solid line for[$\\le$] or[$\\ge$].\n\n[$y < x - 3 \\quad \\text{(dashed)}$]\n\n[$y \\ge 3x - 1 \\quad \\text{(solid)}$]\n\n### Step 2: Test a Point\n\nSubstitute[$(0, 0)$] or another convenient point not on the line into the original inequality.\n\n### Step 3: Shade the Appropriate Half-Plane\n\nShade the region that contains the test point if the inequality is satisfied; otherwise shade the opposite side.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Graph Inequalities in Standard Form\n\nGraph linear inequalities written in standard form[$ax + by \\mathbin{\\square} c$].\n\n### Step 1: Graph the Boundary Line\n\nGraph[$ax + by = c$] by finding the intercepts or solving for[$y$].\n\n[$5x + y > 10$]\n\n[$-24x + 8y \\ge -48$]\n\n### Step 2: Test a Point and Shade\n\nUse[$(0, 0)$] or another test point to determine which side of the boundary line contains the solutions, then shade that half-plane.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Write and Graph Inequalities from Context\n\nTranslate real-world situations into linear inequalities, graph them, and verify whether given points are solutions.\n\n### Step 1: Define the Variables\n\nIdentify what each variable represents in the problem situation.\n\n### Step 2: Write the Inequality\n\nTranslate the verbal description into a linear inequality.\n\nFor a median yearly income of[$48200$] growing at[$1240$] per year, write an inequality for incomes less than the median[$x$] years after 2006:\n\n[$y < 48200 + 1240x$]\n\nFor fundraising with small donut boxes at[$1.25$] and cider at[$2.50$] per gallon, requiring at least[$100$]:\n\n[$1.25d + 2.50c \\ge 100$]\n\n### Step 3: Graph and Verify Solutions\n\nGraph the inequality on a coordinate plane. Determine whether given ordered pairs satisfy the inequality by substituting their coordinates.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Graph Special-Case Inequalities\n\nGraph inequalities that simplify to a single variable, resulting in horizontal or vertical boundary lines.\n\n### Step 1: Simplify the Inequality\n\nSolve for the single variable to identify the boundary.\n\n[$2y + 6 \\ge 0 \\implies y \\ge -3$]\n\n[$\\frac{1}{2}x + 1 < 3 \\implies x < 4$]\n\n### Step 2: Graph the Boundary and Shade\n\nGraph the resulting horizontal or vertical line and shade the appropriate half-plane.\n\n[$\\frac{2}{3}x - \\frac{10}{3} > -4$]",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice graphing linear inequalities in various forms, including slope-intercept form, standard form, and special cases involving single variables. Real-world problems ask students to write inequalities from verbal descriptions, graph the solutions, identify feasible combinations, and interpret points in context. Higher-order thinking problems include constructing mathematical arguments about half-planes, analyzing why boundary points cannot be used as test points, creating original inequalities with specified solution conditions, finding and explaining errors in student work, and summarizing the complete graphing procedure.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problem 28 includes an image showing two students' graphing attempts for[$4y \\le \\frac{8}{3}x$]. The image could not be described and requires human review to determine whether Reiko or Kristin is correct.\n- Problem 26b references a coordinate plane shown in the original worksheet for graphing the triathlon training inequality.",
                },
              },
            ],
          },
        ],
      },
    ];

    for (const lesson of lessons) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 6,
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
          if (section.sectionType === "activity") {
            const activityContent = section.content as SeedActivityContent;

            const insertedActivityId = await ctx.db.insert("activities", {
              componentKey: activityContent.componentKey,
              displayName: `${phase.title} - ${activityContent.componentKey}`,
              description: `Activity for ${phase.title}`,
              props: activityContent.props as never,
              gradingConfig: { autoGrade: true, partialCredit: true },
              createdAt: now,
              updatedAt: now,
            });

            totalActivitiesCreated++;

            await ctx.db.insert("phase_sections", {
              phaseVersionId: phaseId,
              sequenceOrder: section.sequenceOrder,
              sectionType: section.sectionType,
              content: {
                ...activityContent,
                activityId: insertedActivityId,
              },
              createdAt: now,
            });
          } else {
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

      totalPhasesCreated += phasesCreated;
      lessonsSeeded++;
    }

    return {
      lessonsSeeded,
      phasesCreated: totalPhasesCreated,
      activitiesCreated: totalActivitiesCreated,
    };
  },
});
