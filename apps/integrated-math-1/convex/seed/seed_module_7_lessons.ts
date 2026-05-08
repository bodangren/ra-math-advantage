import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule7LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
    slug: string;
  }>;
}

export const seedModule7Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule7LessonsResult> => {
    const now = Date.now();

    const lessonsData = [
      {
        slug: "module-7-lesson-1",
        title: "Graphing Systems of Equations",
        orderIndex: 1,
        description:
          "Students analyze systems of linear equations, classify solutions as consistent/inconsistent and independent/dependent, and use graphing to solve.",
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
                    "## Today's Goals\n\n- Graph systems of linear equations and determine the number of solutions.\n- Classify systems as consistent or inconsistent and as independent or dependent.\n- Write and solve systems of equations to model real-world situations.\n- Use graphing to solve linear equations and systems with decimal coefficients.",
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
                    "## Vocabulary\n\n- **system of equations** — a set of two or more equations with the same variables\n- **solution of a system** — an ordered pair that satisfies all equations in the system\n- **consistent** — a system that has at least one solution\n- **inconsistent** — a system that has no solution\n- **independent** — a consistent system with exactly one solution\n- **dependent** — a consistent system with infinitely many solutions",
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
                    "## Learn: Graphing Systems of Linear Equations\n\nA system of two linear equations can be graphed on the same coordinate plane. The point(s) of intersection represent the solution(s).\n\n### Key Concept: Number of Solutions\n\n- **One solution** — The lines intersect at exactly one point. The system is consistent and independent.\n- **No solution** — The lines are parallel and never intersect. The system is inconsistent.\n- **Infinitely many solutions** — The lines coincide (are the same line). The system is consistent and dependent.\n\n### Key Concept: Classification from Slope-Intercept Form\n\nWhen both equations are written as [ y = mx + b ], compare slopes and y-intercepts:\n\n- Different slopes → one solution (consistent, independent)\n- Same slope, different intercepts → no solution (inconsistent)\n- Same slope, same intercept → infinitely many solutions (consistent, dependent)",
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
                    "## Example 1 — Determine Solutions from a Graph\n\nUse a provided graph to identify how many times the two lines intersect, then classify the system.\n\n### Step 1: Inspect the Graph\n\nLocate the point(s) where the two lines cross.\n\n### Step 2: Classify the System\n\n- If the lines intersect once, state the solution and classify as consistent and independent.\n- If the lines are parallel, classify as inconsistent.\n- If the lines overlap, classify as consistent and dependent.\n\n[\ny = x - 1 \\quad \\text{and} \\quad y = -x + 1\n]\n\n> Review Note: The graph for Examples 1–2 (image1.png) is not described here.",
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
                    "## Example 2 — Determine Solutions Algebraically\n\nWithout graphing, determine the number of solutions and classify the system by rewriting each equation in slope-intercept form.\n\n### Step 1: Rewrite in Slope-Intercept Form\n\nSolve each equation for [ y ]:\n\n[\n4x - 6y = 12 \\quad \\Rightarrow \\quad y = \\frac{2}{3}x - 2\n]\n\n[\n-2x + 3y = -6 \\quad \\Rightarrow \\quad y = \\frac{2}{3}x - 2\n]\n\n### Step 2: Compare Slopes and Intercepts\n\n- Same slope, same intercept → infinitely many solutions (consistent, dependent)\n- Same slope, different intercepts → no solution (inconsistent)\n- Different slopes → one solution (consistent, independent)\n\nRepresentative systems include:\n\n[\ny = \\frac{1}{2}x \\quad \\text{and} \\quad y = x + 2\n]\n\n[\n8x - 4y = 16 \\quad \\text{and} \\quad -5x - 5y = 5\n]\n\n[\ny = -\\frac{3}{2}x + 5 \\quad \\text{and} \\quad y = -\\frac{2}{3}x + 5\n]",
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
                    "## Example 3 — Graph a System and Find the Solution\n\nGraph each system of equations on the same coordinate plane. Determine the number of solutions. If there is exactly one solution, identify its coordinates.\n\n### Step 1: Graph Each Equation\n\nUse slope-intercept form or intercepts to graph each line.\n\n### Step 2: Identify the Intersection\n\nRead the coordinates of the intersection point, if it exists.\n\nRepresentative systems include:\n\n[\ny = -3 \\quad \\text{and} \\quad y = x - 3\n]\n\n[\ny = 4x + 2 \\quad \\text{and} \\quad y = -2x - 4\n]\n\n[\nx + y = 4 \\quad \\text{and} \\quad 3x + 3y = 12\n]\n\n[\n2x + 3y = 12 \\quad \\text{and} \\quad 2x - y = 4\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Write and Solve a System from a Word Problem\n\nDefine variables, write a system of equations, and solve graphically to answer questions about a real-world scenario.\n\n### Aviation Problem\n\nTwo planes are in flight. One starts at 1000 meters and ascends at 400 meters per minute. The other starts at 5900 meters and descends at 300 meters per minute. Write a system where [ x ] is time in minutes and [ y ] is altitude in meters, graph the system, and predict when the planes will be at the same altitude.\n\n[\ny = 400x + 1000\n]\n\n[\ny = -300x + 5900\n]\n\n### Table-Seating Problem\n\nRound tables seat 8 people; rectangular tables seat 10 people. Set up tables for 124 people using 2 more round tables than rectangular tables. Define variables, write a system, and solve graphically.\n\nLet [ r ] = number of round tables and [ t ] = number of rectangular tables.\n\n[\n8r + 10t = 124\n]\n\n[\nr = t + 2\n]",
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
                    "## Example 5 — Solve a Linear Equation by Graphing a System\n\nRewrite a single linear equation as a system of two equations, then graph the system to find the solution.\n\n### Step 1: Split the Equation\n\nWrite the left side as one equation and the right side as another, both in terms of [ x ].\n\nFor [ 3x + 6 = 6 ]:\n\n[\ny = 3x + 6 \\quad \\text{and} \\quad y = 6\n]\n\n### Step 2: Graph and Find the Intersection\n\nThe [ x ]-coordinate of the intersection is the solution to the original equation.\n\nOther representative equations include:\n\n[\n2x - 17 = x - 10\n]\n\n[\n-12x + 90 = 30\n]\n\n[\n2x + 5 = 2x + 5\n]\n\n[\nx + 1 = x + 3\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Solve Decimal Systems\n\nSolve systems of linear equations with decimal coefficients. State the solution to the nearest hundredth.\n\n### Step 1: Choose a Method\n\nGraphing or substitution/elimination may be used. Graphing is often practical with decimal coefficients.\n\n### Step 2: Round Appropriately\n\nIf the solution is not exact, round each coordinate to the nearest hundredth.\n\nRepresentative systems include:\n\n[\n2.5x + 3.75y = 10.5 \\quad \\text{and} \\quad 1.25x - 8.5y = -5.25\n]\n\n[\n2.2x + 1.8y = -3.6 \\quad \\text{and} \\quad -4.8x + 12.4y = 10.6\n]\n\n[\n1.12x - 2.24y = 4.96 \\quad \\text{and} \\quad -3.56x - 2.48y = -7.32\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 7 — More Word Problems with Systems\n\nWrite and solve systems of equations to interpret real-world scenarios.\n\n### Elevator Problem\n\nOne elevator starts on the 4th floor, 35 feet above ground, descending at 2.2 feet per second. Another starts at ground level, rising at 1.7 feet per second. Write and solve a system to find when both elevators are at the same height, and interpret the result.\n\n[\ny = -2.2x + 35 \\quad \\text{and} \\quad y = 1.7x\n]\n\n### Bookstore Profit Problem\n\nA store makes [ 2.50 ] profit per book and [ 0.75 ] profit per magazine. Total profit for the week is [ 450 ], and total publications sold is 260. Find the number of books and magazines sold.\n\nLet [ x ] = books and [ y ] = magazines.\n\n[\n2.50x + 0.75y = 450\n]\n\n[\nx + y = 260\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice across all skills from this lesson. Problems include:\n\n- Graphing systems and determining the number of solutions, then classifying as consistent/inconsistent and independent/dependent\n- Systems with integer, fractional, and decimal coefficients\n- Parallel and coincident lines\n- Word problems involving business, racing, and daily routines\n- Error analysis and reasoning about the nature of solutions\n- Construction of systems with specified numbers of solutions\n\nStudents must apply graphing skills, algebraic classification, and contextual interpretation throughout.",
                },
              },
            ],
          },
          {
            phaseNumber: 12,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- The graph for Examples 1–2 (image1.png) could not be described; it should show two linear equations for visual classification.\n- The graph for problem 40 (image2.png) could not be described; it shows two parallel lines for a business application.\n- The calculator screen for problem 42 (image3.png) could not be described; it shows a graphed system used in an argument about whether the system has no solution.\n- The four systems for problem 47 (image4.png) could not be described; students must identify which system does not belong.\n- The discussion between Francisca and Alan for problem 51 (image5.png) could not be described; it presents two students' reasoning about comparing a 10% discount versus a 10-dollar discount.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-7-lesson-2",
        title: "Substitution",
        orderIndex: 2,
        description:
          "Students solve systems of linear equations using the substitution method and apply it to real-world problems.",
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
                    "## Today's Goals\n\n- Solve systems of linear equations using the substitution method\n- Write and solve systems of equations to model real-world situations\n- Solve systems containing decimals, fractions, and special angle or digit relationships\n- Analyze and compare solution methods for systems of equations",
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
                    "## Vocabulary\n\n- **system of equations** — a set of two or more equations containing the same variables\n- **substitution method** — an algebraic technique for solving a system by replacing a variable with an equivalent expression from another equation\n- **solution of a system** — an ordered pair that satisfies every equation in the system simultaneously",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: The Substitution Method\n\nThe substitution method solves a system of equations by expressing one variable in terms of another and replacing that variable in the second equation.\n\n### Key Concept: Solving by Substitution\n\n- Isolate one variable in one of the equations (if it is not already isolated).\n- Substitute the resulting expression into the other equation.\n- Solve the new equation for the remaining variable.\n- Substitute that value back into the isolated equation to find the first variable.\n- Check the ordered pair in both original equations.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Systems by Substitution\n\nUse substitution to solve linear systems. The problems fall into three categories based on how the equations are structured.\n\n### Step 1: Substitute When One Variable Is Isolated\n\nWhen one equation is already solved for [ y ] or [ x ], substitute that expression directly into the other equation.\n\nFor example, given:\n[\ny = 5x + 1\n]\n[\n4x + y = 10\n]\n\nSubstitute [ 5x + 1 ] for [ y ] in the second equation:\n[\n4x + (5x + 1) = 10\n]\n\nSolve for [ x ], then substitute back to find [ y ].\n\nOther problems in this group provide the system with [ x ] isolated, such as:\n[\nx = y - 1\n]\n[\n-x + y = -1\n]\n\n### Step 2: Set Equal When Both Equations Are Solved for the Same Variable\n\nWhen both equations express [ y ] in terms of [ x ], set the two expressions equal to each other.\n\nFor example:\n[\ny = 3x - 2\n]\n[\ny = 2x - 5\n]\n\nSet the right sides equal:\n[\n3x - 2 = 2x - 5\n]\n\nSolve for [ x ], then substitute into either equation to find [ y ].\n\n### Step 3: Isolate First, Then Substitute\n\nWhen neither equation is solved for a variable, isolate a variable in one equation before substituting.\n\nFor example:\n[\n2x + y = 3\n]\n[\n4x + 4y = 8\n]\n\nSolve the first equation for [ y ]:\n[\ny = 3 - 2x\n]\n\nThen substitute into the second equation and solve.\n\nSome problems involve negative coefficients or require careful simplification, such as:\n[\n-1 = 2x - y\n]\n[\n8x - 4y = -4\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Applications of Systems of Equations\n\nSet up systems of equations from verbal descriptions and solve them using substitution.\n\n### Step 1: Define Variables and Write the System\n\nIdentify the unknown quantities, assign variables, and translate the words into two equations.\n\nFor example, Harvey has [ x ] [ 1 ]-dollar bills and [ y ] [ 5 ]-dollar bills. He has 6 bills worth [ 22 ] dollars total:\n[\nx + y = 6\n]\n[\nx + 5y = 22\n]\n\n### Step 2: Solve and Interpret\n\nUse substitution to solve the system, then state the answer in the context of the problem.\n\nIn the chemistry problem, Shelby and Calvin need 5 milliliters of a 65% acid solution by mixing from two beakers: Beaker A (70% acid) and Beaker B (20% acid). Let [ a ] be milliliters from Beaker A and [ b ] be milliliters from Beaker B.\n\nThe system is:\n[\na + b = 5\n]\n[\n0.70a + 0.20b = 3.25\n]\n\nSolve by substitution to find how many milliliters are needed from each beaker.",
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
                    "## Mixed Exercises\n\nThe mixed exercises extend substitution practice to a variety of problem types and contexts.\n\n- **Decimals and fractions:** Solve systems with decimal coefficients, such as [ y = 3.2x + 1.9 ] and [ 2.3x + 2y = 17.72 ], and systems with fractional coefficients, such as [ y = \\frac{1}{4}x - \\frac{1}{2} ] and [ 8x + 12y = -\\frac{1}{2} ].\n- **Geometry:** Angle [ A ] and angle [ B ] are complementary with a difference of [ 20^\\circ ]. Write and solve a system to find their measures, then generalize the method.\n- **Number theory:** A two-digit number decreases by 45 when its digits are interchanged. The tens digit is 1 more than 3 times the units digit. Define variables and write a system to find the original number.\n- **Data modeling:** Use data from a table of zoo visitors to write equations relating adults and children at different exhibits, solve the system, and extend to a ticket-sales problem.\n- **Error analysis:** Evaluate two students' work solving a system about pounds of apples and bananas, determine who is correct, and explain the reasoning.\n- **Ratios:** A charity has 60 volunteers with a boy-to-girl ratio of 7:5. Find the number of boys and girls.\n- **Method comparison:** Compare and contrast solving the same system by graphing versus by substitution.\n- **Creation and explanation:** Create a real-world system with one solution and explain how to choose what to substitute.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problem 24 references a table of zoo visitors (`image2.png`) that is not described in the extracted text. The table data is needed to model the relationships in parts a–c.\n- Problem 25 includes student work (`image3.png`) that cannot be described. Human review is needed to evaluate Guillermo's and Cara's solutions.\n- Problem 22 has an adjacent image (`image1.png`) preceding the problem text that cannot be described.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-7-lesson-3",
        title: "Elimination Using Addition and Subtraction",
        orderIndex: 3,
        description:
          "Students solve systems of linear equations using elimination by addition or subtraction.",
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
                    "## Today's Goals\n\n- Solve systems of linear equations using elimination by addition or subtraction.\n- Recognize when adding or subtracting equations will eliminate a variable.\n- Write and solve systems of equations to model real-world situations.\n- Solve systems containing decimals, fractions, and expressions that require simplification first.",
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
                    "## Vocabulary\n\n- **elimination method** — an algebraic technique for solving a system by adding or subtracting equations to eliminate one variable.\n- **system of equations** — a set of two or more equations containing the same variables.\n- **solution of a system** — an ordered pair that satisfies every equation in the system simultaneously.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Elimination by Addition and Subtraction\n\nThe elimination method solves a system by combining equations so that one variable cancels out. When the coefficients of one variable are opposites, add the equations. When the coefficients of one variable are identical, subtract the equations.\n\n### Key Concept: Elimination by Addition\n\n- Look for a variable whose coefficients are opposites (e.g., [ 3x ] and [ -3x ]).\n- Add the two equations term by term.\n- The opposite coefficients sum to zero, eliminating that variable.\n- Solve the resulting equation for the remaining variable.\n- Substitute the value back into either original equation to find the eliminated variable.\n\n### Key Concept: Elimination by Subtraction\n\n- Look for a variable whose coefficients are identical (e.g., [ 5y ] and [ 5y ]).\n- Subtract one equation from the other term by term.\n- The identical coefficients subtract to zero, eliminating that variable.\n- Solve the resulting equation for the remaining variable.\n- Substitute the value back into either original equation to find the eliminated variable.",
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
                    "## Example 1 — Solve by Elimination (Addition)\n\nUse elimination by addition to solve linear systems. These problems are structured so that one variable has opposite coefficients.\n\n### Step 1: Align and Add\n\nWrite the equations with like terms aligned. Add the left sides and add the right sides.\n\nFor example:\n[\n-v + w = 7\n]\n[\nv + w = 1\n]\n\nAdding eliminates [ v ]:\n[\n2w = 8\n]\n\n### Step 2: Solve and Back-Substitute\n\nSolve for the remaining variable, then substitute to find the eliminated variable.\n\nOther representative systems include:\n[\n4x + 5y = 17 \\quad \\text{and} \\quad 4x + 6y = -6\n]\n\n[\n6r - 6t = 6 \\quad \\text{and} \\quad 3r - 6t = 15\n]\n\n[\n3x - 8y = -24 \\quad \\text{and} \\quad 3x - 5y = 4.5\n]",
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
                    "## Example 2 — Word Problems with Elimination\n\nTranslate verbal descriptions into systems of equations, then solve by elimination.\n\n### Step 1: Define Variables and Write the System\n\nIdentify the two unknown quantities and assign variables. Translate each sentence into an equation.\n\nFor example, twice a number added to another number is 15, and the sum of the two numbers is 11.\n\nLet [ x ] and [ y ] be the two numbers.\n[\n2x + y = 15\n]\n[\nx + y = 11\n]\n\n### Step 2: Solve and Interpret\n\nSubtract the second equation from the first to eliminate [ y ], solve for [ x ], substitute back, and state the answer in context.\n\nOther problems in this group involve differences and sums of two numbers, requiring students to choose whether to add or subtract based on the coefficients.",
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
                    "## Example 3 — Solve by Elimination (Subtraction)\n\nUse elimination by subtraction to solve linear systems. These problems are structured so that one variable has identical coefficients.\n\n### Step 1: Align and Subtract\n\nWrite the equations with like terms aligned. Subtract one equation from the other.\n\nFor example:\n[\n6c - 9d = 111\n]\n[\n5c - 9d = 103\n]\n\nSubtracting eliminates [ d ]:\n[\nc = 8\n]\n\n### Step 2: Solve and Back-Substitute\n\nSubstitute [ c = 8 ] into either original equation to find [ d ].\n\nOther representative systems include:\n[\n11f + 14g = 13 \\quad \\text{and} \\quad 11f + 10g = 25\n]\n\n[\nx - y = 1 \\quad \\text{and} \\quad x + y = 3\n]\n\n[\n3x + 4y = 2 \\quad \\text{and} \\quad 4x - 4y = 12\n]\n\n[\n5x - y = -6 \\quad \\text{and} \\quad -x + y = 2\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Real-World Applications\n\nSet up and solve systems from real-world contexts involving government, sports, and business.\n\n### Government Problem\n\nThe Texas State Legislature has state representatives and state senators. The sum of the two is 181, and the difference (representatives minus senators) is 119. Write a system, define variables, and solve by elimination.\n\nLet [ r ] = number of representatives and [ s ] = number of senators.\n[\nr + s = 181\n]\n[\nr - s = 119\n]\n\n### Sports Problem\n\nThe difference of World Series championships won by the Yankees and twice the number won by the Cardinals is 5. The sum of the two teams' championships is 38. Write a system, define variables, and solve by elimination.\n\nLet [ y ] = Yankees championships and [ x ] = Cardinals championships.\n[\ny - 2x = 5\n]\n[\ny + x = 38\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises extend elimination practice to a variety of problem types and contexts.\n\n- **Simplification first:** Solve systems that require distributing or simplifying before elimination, such as [ 4(x + 2y) = 8 ] and [ 4x + 4y = 12 ], or [ 5(x + y) = 5 ] paired with another equation.\n- **Decimal coefficients:** Solve systems with decimal coefficients, such as [ 0.3x - 2y = -28 ] and [ 0.8x + 2y = 28 ].\n- **Fractional coefficients:** Solve systems with fractional coefficients, such as [ \\frac{1}{2}q - 4r = -2 ] and [ \\frac{1}{6}q - 4r = 10 ], or [ \\frac{1}{2}x + \\frac{1}{3}y = -1 ] and [ -\\frac{1}{2}x + \\frac{2}{3}y = 10 ].\n- **Modeling with tables:** Use data from tables about snacks, jogging, and walking to write systems of equations, define variables, solve by elimination, and interpret the results.\n- **Reasoning about elimination:** Determine the first step in solving a given system by elimination, explain the reasoning, and predict how the solution would change if an equation were altered.\n- **Error analysis:** Evaluate statements about elimination results such as [ 0 = 0 ] or [ 0 = 2 ], provide counterexamples, and justify the argument.\n- **Creation tasks:** Create a system that can be solved by addition, formulate a general rule, and find a second equation given a solution and one equation.\n- **Number theory:** A two-digit number has a digit sum of 8, and subtracting the units digit from the tens digit gives [ -4 ]. Define variables, write a system, and find the number.\n- **Method comparison:** Describe when elimination is most beneficial compared to other solution methods.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problem 40 references an image of two bouquet types (`image1.png`) that cannot be described. The image shows the number of tulips in a Spring Mix bouquet and a Garden Delight bouquet, which is needed to write the system in parts a–b.\n- Problem 41 references a table (`image2.png`) showing the number of bags of popcorn and plates of nachos purchased by Jeremy and Kendrick, along with total costs. The table data is needed to write and solve the system in parts a–b.\n- Problem 42 references a table (`image3.png`) showing Erin's jogging and walking times and distances for Saturday and Sunday. The table data is needed to write the system in parts a–b.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-7-lesson-4",
        title: "Elimination Using Multiplication",
        orderIndex: 4,
        description:
          "Students solve systems of linear equations using elimination when multiplication of one or both equations is required.",
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
                    "## Today's Goals\n\n- Solve systems of linear equations using elimination when multiplication of one or both equations is required.\n- Recognize when to multiply one equation versus both equations to create opposite coefficients.\n- Write and solve systems of equations to model real-world situations.\n- Evaluate and compare solution methods for systems of linear equations.",
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
                    "## Vocabulary\n\n- **elimination method** — an algebraic technique for solving a system by combining equations to eliminate one variable.\n- **system of equations** — a set of two or more equations containing the same variables.\n- **solution of a system** — an ordered pair that satisfies every equation in the system simultaneously.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Elimination Using Multiplication\n\nWhen the coefficients of a variable are not already opposites or identical, multiply one or both equations by constants to create opposite coefficients. Then add the equations to eliminate a variable.\n\n### Key Concept: Elimination with Multiplication\n\n- Identify which variable to eliminate by finding the least common multiple of its coefficients.\n- Multiply one or both equations by constants so that the chosen variable has opposite coefficients.\n- Add the modified equations to eliminate that variable, then solve for the remaining variable.\n- Substitute the found value back into either original equation to solve for the eliminated variable.\n- Check the solution in both original equations.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve by Elimination (Multiplication)\n\nUse elimination to solve systems of linear equations. Determine whether to multiply one equation, both equations, or neither to create opposite coefficients.\n\n### Step 1: Choose a Variable to Eliminate\n\nExamine the coefficients of [ x ] and [ y ] in both equations. Select the variable whose coefficients have the smallest least common multiple.\n\nRepresentative systems include:\n[\nx + y = 2 \\quad \\text{and} \\quad -3x + 4y = 15\n]\n\n[\n8x + 3y = 4 \\quad \\text{and} \\quad -7x + 5y = -34\n]\n\n### Step 2: Multiply to Create Opposite Coefficients\n\nMultiply one or both equations by constants so that the chosen variable has opposite coefficients.\n\nFor example, to eliminate [ y ] in:\n[\n2x + 5y = 11 \\quad \\text{and} \\quad 4x + 3y = 1\n]\n\nMultiply the first equation by 3 and the second by 5:\n[\n6x + 15y = 33\n]\n[\n20x + 15y = 5\n]\n\nOr, to eliminate [ x ] in:\n[\n4x + 7y = -80 \\quad \\text{and} \\quad 3x + 5y = -58\n]\n\nMultiply the first equation by 3 and the second by 4.\n\nSome systems require multiplying only one equation. For example:\n[\n3x + 4y = 29 \\quad \\text{and} \\quad 6x + 5y = 43\n]\n\nMultiply the first equation by 2 to match the [ x ]-coefficients.\n\n### Step 3: Add and Solve\n\nAdd the modified equations to eliminate one variable, then solve for the remaining variable.\n\n### Step 4: Substitute and Verify\n\nSubstitute the value found into either original equation to find the other variable. Check the solution in both equations.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Applications of Systems of Equations\n\nWrite and solve systems of equations to model real-world situations.\n\n### Step 1: Define Variables\n\nIdentify the two unknown quantities and assign variables.\n\n### Step 2: Write a System of Equations\n\nTranslate the given information into two equations.\n\n**Sports Problem:** A family of four spends [ 592.30 ] to attend two MLB games and one NBA game. The same family would spend [ 691.31 ] to attend one MLB game and two NBA games.\n\nLet [ m ] = cost of one MLB game and [ n ] = cost of one NBA game.\n[\n2m + n = 592.30\n]\n[\nm + 2n = 691.31\n]\n\n**Art Supplies Problem:** A curator makes two purchases of firing clay and polymer clay. Use data from a table showing the quantities purchased in each order to write a system and find the cost per kilogram of each product.\n\nLet [ f ] = cost per kilogram of firing clay and [ p ] = cost per kilogram of polymer clay.\n\n> Review Note: The purchase table for problem 14 (`media/image1.png`) cannot be described here. It shows the kilograms of firing clay and polymer clay purchased in two separate orders.\n\n### Step 3: Solve and Interpret\n\nUse elimination with multiplication to solve the system. State the answer in the context of the problem.",
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
                    "## Mixed Exercises\n\nThe mixed exercises extend practice across a variety of problem types and contexts.\n\n- **Translation problems:** Convert verbal descriptions into systems of equations and solve. For example, \"Two times a number plus three times another number equals 13. The sum of the two numbers is 7.\"\n- **Real-world applications:** Solve contextual problems involving car washing and vacuuming rates to raise money.\n- **Structure and reasoning:** Consider a given system and describe two different ways to solve it by elimination. Explain why a particular multiplication strategy (such as multiplying the first equation by 6 and the second by 5) is not useful for solving the system, then solve correctly.\n- **Mixture problems:** Use a table to write a system of equations for mixing two juice drinks to obtain a desired amount and concentration. Solve the system and explain what the solution represents.\n- **Modeling with currency:** Write a system to find the number of five-dollar and ten-dollar bills given the total number of bills and total value. Define variables, solve, and interpret.\n- **Error analysis:** Examine worked solutions from two students solving a system and determine whether either is correct. Explain the reasoning.\n- **True/false analysis:** Determine whether a statement about systems having infinitely many solutions is true or false, and justify the argument.\n- **Creation tasks:** Write a system of equations that can be solved by multiplying one equation by [ -3 ] and then adding.\n- **Persevere in problem solving:** Given that [ (3, a) ] is the solution to a system with an unknown constant [ b ], find the values of [ a ] and [ b ] and discuss the steps used.\n- **Method comparison:** Explain why substitution is sometimes more helpful than elimination, and vice versa.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problem 14 references a table of purchase data for firing clay and polymer clay (`media/image1.png`). The table shows two purchases with different quantities of each product, which is needed to write the system in parts a–b.\n- Problem 19 references a juice mixture table or diagram (`media/image2.png`) for mixing Tropical Breeze and Kona Cooler. The image data is needed to write the system in parts a–b.\n- Problem 21 shows worked student solutions from Jason and Daniela (`media/image3.png`). The image displays their steps for solving a system of equations and is needed for the error analysis.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-7-lesson-5",
        title: "Systems of Inequalities",
        orderIndex: 5,
        description:
          "Students graph systems of linear inequalities, identify the overlapping solution region, and write systems to model real-world constraints.",
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
                    "## Today's Goals\n\n- Graph systems of linear inequalities and identify the overlapping solution region.\n- Write systems of inequalities to represent real-world constraints with two variables.\n- Determine whether an ordered pair is a solution to a system without graphing.\n- Write a system of inequalities that corresponds to a given graph.",
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
                    "## Vocabulary\n\n- **system of inequalities** — A set of two or more inequalities with the same variables.\n- **solution of a system of inequalities** — An ordered pair that makes every inequality in the system true.\n- **boundary line** — The line formed by replacing the inequality symbol with an equal sign; dashed for strict inequalities, solid for non-strict inequalities.\n- **feasible region** — The overlapping shaded region where all inequalities in the system are satisfied.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Graphing Systems of Linear Inequalities\n\nA system of linear inequalities is graphed by shading each inequality on the same coordinate plane. The solution to the system is the intersection of all shaded regions.\n\n### Key Concept: Graphing a System of Inequalities\n\n- Graph each inequality separately: draw the boundary line (dashed for `<` or `>`, solid for `≤` or `≥`), then shade the appropriate half-plane.\n- The solution region is where all shaded areas overlap.\n- If the boundary lines are parallel, the system may have no solution, a bounded strip of solutions, or an unbounded region depending on the inequality directions.\n- To test a point without graphing, substitute its coordinates into every inequality; it must satisfy all of them.",
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
                    "## Example 1 — Graph Systems in Slope-Intercept Form\n\nGraph systems where both inequalities are given in or easily converted to slope-intercept form. Identify the overlapping feasible region.\n\n### Step 1: Graph the First Inequality\n\nDraw the boundary line and shade the appropriate side.\n\n[\ny < 6\n]\n\n### Step 2: Graph the Second Inequality\n\nOn the same axes, draw the second boundary line and shade.\n\n[\ny > x + 3\n]\n\n### Step 3: Identify the Solution Region\n\nThe solution is the overlapping shaded area. Points in this region satisfy both inequalities.\n\nOther representative systems include:\n\n[\ny \\ge x + 10 \\quad \\text{and} \\quad y \\le x - 3\n]\n\n[\ny < 5x - 5 \\quad \\text{and} \\quad y > 5x + 9\n]",
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
                    "## Example 2 — Graph Systems with Horizontal, Vertical, and Standard-Form Boundaries\n\nGraph systems that include vertical lines, horizontal lines, or inequalities in standard form.\n\n### Step 1: Handle Vertical and Horizontal Boundaries\n\nVertical and horizontal lines divide the plane differently than sloped lines.\n\n[\nx > -1 \\quad \\text{and} \\quad y \\le -3\n]\n\n[\ny > 2 \\quad \\text{and} \\quad x < -2\n]\n\n### Step 2: Convert Standard Form to Convenient Form\n\nFor inequalities like [ x + y \\le -1 ], graph using intercepts or solve for [ y ].\n\n[\nx + y \\le -1 \\quad \\text{and} \\quad x + y \\ge 3\n]\n\n[\ny - x > 4 \\quad \\text{and} \\quad x + y > 2\n]\n\n### Step 3: Identify the Overlap\n\nThe feasible region is where all conditions are satisfied simultaneously.",
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
                    "## Example 3 — Model Real-World Situations\n\nWrite, graph, and interpret systems of inequalities based on contextual constraints.\n\n### Step 1: Define the Variables\n\nIdentify what each variable represents in the situation.\n\n### Step 2: Write the System\n\nTranslate each constraint into an inequality.\n\nFor an exercise program where a person walks from 9 to 12 miles and works out from 4.5 to 6 hours per week:\n\n[\n9 \\le m \\le 12\n]\n\n[\n4.5 \\le h \\le 6\n]\n\nFor souvenir stones costing either [ 4 ] or [ 6 ] with a budget of no more than [ 30 ], buying at least 4 stones:\n\n[\nf + s \\ge 4\n]\n\n[\n4f + 6s \\le 30\n]\n\nwhere [ f ] is the number of [ 4 ]-dollar stones and [ s ] is the number of [ 6 ]-dollar stones.\n\n### Step 3: Graph and Interpret\n\nGraph the system and list viable solutions as ordered pairs that satisfy all constraints and make sense in context.",
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
                    "## Mixed Exercises\n\nThe mixed exercises integrate all skills from the lesson:\n\n- Writing systems of inequalities from given graphs.\n- Verifying whether a point is a solution by substitution.\n- Solving word problems by defining variables, writing systems, graphing, and interpreting solutions.\n- Analyzing conceptual questions about parallel boundaries, equivalent systems, and special cases.\n- Creating original systems to match given conditions, such as a system with no solution or a system equivalent to an absolute-value inequality.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Problems 15–18 require images of graphed systems that could not be described in the extracted source. A human reviewer should inspect the original worksheet images and translate each graph into a system of inequalities.\n- Problem 18 references a graph \"shown at the right\" that was not available in extracted form.",
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
            unitNumber: 7,
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
      let activitiesCreated = 0;

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

            activitiesCreated++;

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

      results.push({
        lessonId,
        lessonVersionId,
        phasesCreated,
        activitiesCreated,
        slug: lesson.slug,
      });
    }

    return { lessons: results };
  },
});
