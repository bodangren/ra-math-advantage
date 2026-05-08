import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule12LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
    slug: string;
  }>;
}

export const seedModule12Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule12LessonsResult> => {
    const now = Date.now();

    const lessonsData = [
      {
        slug: "module-12-lesson-1",
        title: "Conjectures and Counterexamples",
        orderIndex: 1,
        description:
          "Students analyze numerical, geometric, and real-world sequences; write conjectures; and test them using counterexamples.",
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
                    "## Explore: How Can We Predict What Comes Next?\n\nStudents examine sequences and geometric patterns to discover how observation leads to prediction. They discuss whether a pattern always continues in the same way and what happens when a prediction fails.\n\n**Inquiry Question:**\nWhat makes a prediction based on a pattern reliable, and how can we know when it might be wrong?",
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
                    "## Vocabulary\n\n- **Conjecture** — An unproven statement based on observations or patterns.\n- **Counterexample** — A specific case that shows a conjecture is false.\n- **Sequence** — An ordered list of numbers or objects.\n- **Prime Number** — A number greater than 1 that is divisible only by itself and 1.\n- **Supplementary Angles** — Two angles whose measures add to 180 degrees.\n- **Linear Pair** — Two adjacent angles whose non-common sides are opposite rays.\n- **Noncollinear** — Points that do not all lie on the same line.\n- **Right Triangle** — A triangle with one 90-degree angle.\n- **Midpoint** — A point that divides a segment into two congruent segments.",
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
                    "## Learn: Making and Testing Conjectures\n\nA conjecture is a statement believed to be true based on observed patterns. To test a conjecture, we look for a counterexample — a single case where the statement fails.\n\n### Key Concept: Writing a Conjecture from a Pattern\n\n- Observe how terms change from one to the next.\n- Identify whether the change is additive, multiplicative, or follows another rule.\n- State the rule as a general sentence that applies to all terms.\n- Use the rule to predict the next term.\n\n### Key Concept: Proving or Disproving a Conjecture\n\n- To support a conjecture, test it with many examples.\n- To disprove a conjecture, find one counterexample.\n- A single counterexample is enough to show a conjecture is false.",
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
                    "## Example 1 — Write Conjectures for Sequences\n\nWrite a conjecture that describes the pattern in a given sequence, then use it to find the next term.\n\n### Step 1: Identify Additive Patterns\n\nDetermine whether the sequence grows by adding the same value each time.\n\nA sequence that increases by 4:\n[\n4, 8, 12, 16, 20, \\dots\n]\nConjecture: Each term is 4 more than the previous term. The next term is:\n[\n24\n]\n\nA sequence of arrival times that decreases by a fixed interval:\n[\n3\\!:\\!00 \\text{ P.M.},\\; 12\\!:\\!30 \\text{ P.M.},\\; 10\\!:\\!00 \\text{ A.M.},\\; \\dots\n]\nConjecture: Each arrival is 2 hours 30 minutes earlier. The next arrival is:\n[\n7\\!:\\!30 \\text{ A.M.}\n]\n\nA sequence of percent humidity that decreases by a fixed amount:\n[\n100\\%, \\; 93\\%, \\; 86\\%, \\; \\dots\n]\nConjecture: Each value is 7 percentage points lower. The next value is:\n[\n79\\%\n]\n\n### Step 2: Identify Multiplicative and Fractional Patterns\n\nDetermine whether the sequence changes by multiplication or by a fixed fractional amount.\n\nA sequence where each term is half the previous term:\n[\n1, \\frac{1}{2}, \\frac{1}{4}, \\frac{1}{8}, \\dots\n]\nConjecture: Each term is one-half the previous term. The next term is:\n[\n\\frac{1}{16}\n]\n\nA sequence that decreases by one-half each time, alternating between whole numbers and fractions:\n[\n6, \\frac{11}{2}, 5, \\frac{9}{2}, 4, \\dots\n]\nConjecture: Each term is one-half less than the previous term. The next term is:\n[\n\\frac{7}{2}\n]\n\n### Step 3: Identify Digit and Visual Patterns\n\nDescribe patterns based on repeated digits or geometric figures.\n\nA sequence built by repeating the same digit:\n[\n2, 22, 222, 2222, \\dots\n]\nConjecture: Each term adds another digit 2. The next term is:\n[\n22222\n]\n\nFor visual sequences shown in diagrams, describe how the figure changes from step to step and predict the next figure.",
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
                    "## Examples 2 and 3 — Make Conjectures about Numbers and Geometry\n\nMake a conjecture about a numerical value, algebraic relationship, or geometric property.\n\n### Step 1: Conjectures about Numbers\n\nState a general rule based on testing numerical examples.\n\nThe product of two odd numbers:\n[\n\\text{odd} \\times \\text{odd} = \\text{odd}\n]\nConjecture: The product of two odd numbers is always odd.\n\nThe product of two and a number, plus one:\n[\n2n + 1\n]\nConjecture: The result is always an odd number.\n\n### Step 2: Conjectures from Equations\n\nExamine an equation to infer a relationship between variables.\n\nGiven [ab = bc] with [b \\neq 0]:\n[\na = c\n]\nConjecture: [a] and [c] are equal because both multiply by the same nonzero [b] to produce the same product.\n\nGiven [ab = 1]:\n[\na = \\frac{1}{b}\n]\nConjecture: [a] and [b] are reciprocals.\n\n### Step 3: Conjectures about Geometric Relationships\n\nUse definitions and properties to state relationships.\n\nTwo intersecting lines that form four congruent angles:\nConjecture: The lines are perpendicular.\n\nA triangle with all sides congruent:\nConjecture: All three angles are congruent, and each measures 60 degrees.\n\nIf point [P] is the midpoint of segment [NQ]:\n[\nNP = PQ\n]\nConjecture: The two segments created by the midpoint are congruent.\n\nA prism and a pyramid with the same base and equal heights:\nConjecture: The volume of the prism is three times the volume of the pyramid.",
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
                    "## Example 4 — Make a Conjecture from a Table\n\nUse data organized in a table to identify a pattern and make a prediction.\n\n### Step 1: Examine the Data\n\nRead the values in the table to see how a quantity changes over equal time intervals.\n\n### Step 2: State the Conjecture\n\nDescribe the rule that relates time to distance traveled.\n\n### Step 3: Predict the Next Value\n\nApply the rule to find the distance at the next time interval.",
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
                    "## Example 5 — Determine Whether Conjectures Are True or False\n\nTest given conjectures. If a conjecture is false, find a counterexample.\n\n### Step 1: Test Numerical Conjectures\n\nCheck several cases to see if the statement holds.\n\nConjecture: If [n] is prime, then [n + 1] is not prime.\nThis is false. Counterexample:\n[\nn = 2 \\quad \\Rightarrow \\quad n + 1 = 3 \\text{, which is prime.}\n]\n\nConjecture: If [x] is an integer, then [-x] is positive.\nThis is false. Counterexample:\n[\nx = 3 \\quad \\Rightarrow \\quad -x = -3 \\text{, which is negative.}\n]\n\n### Step 2: Test Geometric Conjectures\n\nApply definitions and diagrams to verify geometric statements.\n\nConjecture: If two angles are supplementary, then they form a linear pair.\nThis is false. Counterexample: Two non-adjacent angles whose measures add to 180 degrees.\n\nConjecture: If three points [A], [B], and [C] are given, then they are noncollinear.\nThis is false. Counterexample: Three points that all lie on the same straight line.\n\nConjecture: In [\\triangle ABC], if [(AB)^2 + (BC)^2 = (AC)^2], then [\\triangle ABC] is a right triangle.\nThis is true by the converse of the Pythagorean Theorem.\n\nConjecture: If the area of a rectangle is 20 square meters, then the length is 10 meters and the width is 2 meters.\nThis is false. Counterexample: A rectangle with length 5 meters and width 4 meters also has area 20 square meters.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: recognizing patterns, writing conjectures, finding counterexamples, and applying reasoning to geometric and real-world situations. Problems include:\n\n- Writing a counterexample to show that a conjecture about solving an equation is false.\n- Constructing a logical argument about whether an assertion involving division of items among teams must be true.\n- Using visual tools to sketch the next figure in a sequence of ancestry diagrams.\n- Identifying regularity in tile patterns and making conjectures about the number of tiles needed for larger figures.\n- Analyzing the structure of line-segment patterns and comparing the number of segments to the number of points.\n- Finding a counterexample to a conjecture about prime numbers of the form [2^n - 1].\n- Using a repeated shortening process to make a conjecture about the length of a segment after [n] iterations.\n- Applying perseverance to a complex problem about points on a circle and the regions they create.\n- Creating an original number sequence that can be generated by two different patterns.\n- Analyzing whether a conjecture about equidistant points and collinearity is true or false.\n- Using undefined terms, definitions, and postulates to justify conjectures about planes and lines.\n- Analyzing a tile-path pattern to make a conjecture about the number of tiles for any length and testing whether a specific tile count is possible.\n\n## Review Notes\n\n- Images referenced in the worksheet (sequence diagrams for problems 7 and 8, ramp data table for problem 17, ancestry sketches for problem 26, square tile sequences for problem 27, line-segment patterns for problem 28, shortened line-segment diagrams for problem 30, point-and-circle region diagrams for problem 31, patio tile paths for problem 36, and geometric figures for problems 34 and 35) could not be fully described without visual reference. Teachers should consult the original worksheet for exact values and diagrams.\n- The worksheet labels the example group as \"Examples 2 and 3\" — there is no separate Example 2 or 3 heading in the original document; these are grouped together under one heading.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-2",
        title: "Statements, Conditionals, and Biconditionals",
        orderIndex: 2,
        description:
          "Students evaluate compound statements, identify hypothesis and conclusion in conditional statements, write converses and contrapositives, and analyze biconditional statements.",
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
                    "## Explore: How Do Simple Statements Combine to Form New Truths?\n\nStudents discuss how the truth of individual statements affects the truth of compound statements. Consider whether knowing one part of an \"and\" statement or an \"or\" statement is enough to know the whole statement's truth value.\n\n**Inquiry Question:**\nIf you know that one simple statement is true and another is false, can you predict whether \"p and q\" and \"p or q\" are true?",
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
                    "## Vocabulary\n\n- **Statement** — A sentence that is either true or false.\n- **Negation** — A statement that has the opposite truth value of the original statement.\n- **Conjunction** — A compound statement formed by joining two statements with the word \"and,\" symbolized by [\\land].\n- **Disjunction** — A compound statement formed by joining two statements with the word \"or,\" symbolized by [\\lor].\n- **Conditional Statement** — A statement of the form \"if p, then q,\" symbolized by [p \\rightarrow q].\n- **Hypothesis** — The \"if\" part of a conditional statement.\n- **Conclusion** — The \"then\" part of a conditional statement.\n- **Converse** — The statement formed by exchanging the hypothesis and conclusion of a conditional.\n- **Inverse** — The statement formed by negating both the hypothesis and conclusion of a conditional.\n- **Contrapositive** — The statement formed by negating and exchanging the hypothesis and conclusion of a conditional.\n- **Biconditional Statement** — A statement of the form \"p if and only if q,\" symbolized by [p \\leftrightarrow q], which is true when both the conditional and its converse are true.\n- **Counterexample** — A specific case that shows a statement is false.\n- **Truth Value** — Whether a statement is true or false.",
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
                    "## Learn: Logic, Conditionals, and Related Statements\n\nLogical reasoning uses simple statements and logical connectives to build compound statements. A conditional statement relates a hypothesis to a conclusion. Related conditionals — the converse, inverse, and contrapositive — are formed by rearranging or negating the parts of the original conditional. A biconditional states that both a conditional and its converse are true.\n\n### Key Concept: Compound Statements and Truth Values\n\n- A **conjunction** [p \\land q] is true only when both p and q are true.\n- A **disjunction** [p \\lor q] is true when at least one of p or q is true.\n- The **negation** of a statement p, written [\\sim p], has the opposite truth value.\n\n### Key Concept: Conditional Statements\n\n- A conditional statement has the form \"If hypothesis, then conclusion.\"\n- Symbolically: [p \\rightarrow q], where p is the hypothesis and q is the conclusion.\n\n### Key Concept: Related Conditionals\n\n- **Converse:** Exchange the hypothesis and conclusion: [q \\rightarrow p]\n- **Inverse:** Negate both parts: [\\sim p \\rightarrow \\sim q]\n- **Contrapositive:** Negate and exchange: [\\sim q \\rightarrow \\sim p]\n- A conditional and its contrapositive always have the same truth value.\n- The converse and inverse always have the same truth value.\n\n### Key Concept: Biconditional Statements\n\n- A biconditional [p \\leftrightarrow q] means \"p if and only if q.\"\n- It is true only when both [p \\rightarrow q] and [q \\rightarrow p] are true.",
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
                    "## Example 1 — Evaluate Conjunctions and Disjunctions\n\nGiven several simple statements with known truth values, write compound statements using conjunction or disjunction and determine whether each compound statement is true or false. Explain the reasoning by referring to the truth values of the individual statements.\n\n### Step 1: Determine the Truth Value of Each Simple Statement\n\nEvaluate whether each given simple statement is true or false before combining them.\n\n### Step 2: Write the Compound Statement\n\nForm a conjunction using \"and\" or a disjunction using \"or\" from the given statements.\n\n[\np \\land q\n]\n\n### Step 3: Evaluate the Compound Statement\n\nUse the rules for conjunction and disjunction to determine the final truth value. A conjunction is true only if both parts are true; a disjunction is true if at least one part is true.",
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
                    "## Example 2 — Evaluate Negations of Compound Statements\n\nDetermine the truth value of compound statements that involve negations of simple statements. Combine negated statements using conjunction or disjunction and explain the reasoning.\n\n### Step 1: Find the Negation of Each Statement\n\nDetermine [\\sim p], [\\sim q], and [\\sim r] by reversing the truth value of each simple statement.\n\n### Step 2: Form the Compound Statement\n\nWrite the expression using the negated statements and the given connective.\n\n[\n\\sim p \\land \\sim q\n]\n\n### Step 3: Evaluate Using Truth Value Rules\n\nApply the rules for conjunction or disjunction to the negated statements to find the final truth value.",
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
                    "## Example 3 — Identify Hypothesis and Conclusion\n\nGiven conditional statements in if-then form, identify the hypothesis (the \"if\" part) and the conclusion (the \"then\" part).\n\n### Step 1: Locate the \"If\" Clause\n\nRead the statement and identify the condition being assumed. This is the hypothesis.\n\n### Step 2: Locate the \"Then\" Clause\n\nIdentify the result or outcome that follows from the hypothesis. This is the conclusion.\n\n### Step 3: State Hypothesis and Conclusion Clearly\n\nWrite the hypothesis and conclusion in your own words for each conditional statement.",
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
                    "## Example 4 — Rewrite Statements in If-Then Form\n\nGiven statements that are not written as conditionals, identify the implied hypothesis and conclusion, then rewrite each statement in standard if-then form.\n\n### Step 1: Identify the Condition\n\nDetermine what condition must be met or what action must be taken. This becomes the hypothesis.\n\n### Step 2: Identify the Result\n\nDetermine what follows from that condition. This becomes the conclusion.\n\n### Step 3: Write the If-Then Statement\n\nCombine the hypothesis and conclusion into the standard conditional form: \"If [hypothesis], then [conclusion].\"",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Write Converse, Inverse, and Contrapositive\n\nFor a given true conditional statement, write the converse, inverse, and contrapositive. Determine whether each related conditional is true or false, and provide a counterexample for any false statement.\n\n### Step 1: Identify the Hypothesis and Conclusion\n\nWrite the original conditional as [p \\rightarrow q], clearly identifying p and q.\n\n### Step 2: Write the Converse\n\nExchange the hypothesis and conclusion to form [q \\rightarrow p]. Determine whether the converse is true or false.\n\n### Step 3: Write the Inverse\n\nNegate both the hypothesis and conclusion to form [\\sim p \\rightarrow \\sim q]. Determine whether the inverse is true or false.\n\n### Step 4: Write the Contrapositive\n\nNegate and exchange the hypothesis and conclusion to form [\\sim q \\rightarrow \\sim p]. Determine whether the contrapositive is true or false.\n\n### Step 5: Provide Counterexamples\n\nFor any related conditional that is false, give a specific counterexample that shows the statement does not hold in all cases.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Analyze Conditionals and Form Biconditionals\n\nWrite the conditional and the converse for a given statement. Determine the truth value of each. If both are true, write a biconditional statement. If either is false, provide a counterexample.\n\n### Step 1: Write the Conditional in If-Then Form\n\nIdentify the hypothesis and conclusion and express the statement as [p \\rightarrow q].\n\n### Step 2: Write the Converse\n\nExchange the hypothesis and conclusion to form [q \\rightarrow p].\n\n### Step 3: Determine Truth Values\n\nDecide whether the conditional is true and whether the converse is true.\n\n### Step 4: Write the Biconditional if Possible\n\nIf both the conditional and its converse are true, write the biconditional as [p \\leftrightarrow q] or \"p if and only if q.\" If one is false, explain why a biconditional cannot be written.",
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
                    "## Example 7 — Analyze Biconditional Statements\n\nWrite a given biconditional statement as a conditional and its converse. Determine whether the biconditional is true or false. If false, provide a counterexample.\n\n### Step 1: Write the Conditional\n\nExtract the forward direction from the biconditional: \"If [first part], then [second part].\"\n\n### Step 2: Write the Converse\n\nExtract the reverse direction: \"If [second part], then [first part].\"\n\n### Step 3: Evaluate the Biconditional\n\nThe biconditional is true only if both the conditional and its converse are true. If either is false, the biconditional is false.\n\n### Step 4: Provide a Counterexample if Needed\n\nIf the biconditional is false, give a specific example that demonstrates why one direction fails.",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all skills from the lesson. Problems include:\n\n- Evaluating the truth value of compound statements with conjunctions, disjunctions, and negations.\n- Determining the truth value of logical expressions given the truth values of individual statements.\n- Identifying hypotheses and conclusions in conditional statements from real-world and mathematical contexts.\n- Rewriting everyday and mathematical statements in if-then form.\n- Writing the converse, inverse, and contrapositive of conditional statements and determining their truth values.\n- Finding counterexamples to show that related conditionals are false.\n- Writing biconditionals when both a conditional and its converse are true.\n- Determining whether biconditional statements are true or false and justifying with counterexamples.\n- Analyzing logical statements in real-world contexts such as travel, games, medicine, and raffles.\n- Reasoning through multi-step logic puzzles involving multiple conditional statements.\n- Negating statements that contain quantifiers such as \"all,\" \"every,\" and \"there exists.\"\n- Creating original conditional statements with specified properties for the converse, inverse, and contrapositive.\n- Evaluating errors in student reasoning about conditional statements.\n- Describing the relationships among a conditional, its converse, its inverse, and its contrapositive.\n- Using truth tables to prove logical equivalences between conditionals and contrapositives.\n\n## Review Notes\n\n- Images referenced in the worksheet (segment diagram for problem 38, student work for problem 49) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams.\n- Problem 38 requires interpreting a segment diagram to write a statement with a specified truth value.\n- Problem 49 involves evaluating student work shown in an image; visual reference is essential.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-3",
        title: "Deductive Reasoning",
        orderIndex: 3,
        description:
          "Students distinguish inductive from deductive reasoning, apply the Law of Detachment and Law of Syllogism, and determine whether conclusions are valid or invalid.",
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
                    "## Explore: When Does a Conclusion Follow Logically?\n\nStudents examine everyday arguments and decide whether the conclusions are guaranteed to be true or only likely to be true. Consider how the structure of an argument determines whether the conclusion is certain.\n\n**Inquiry Question:**\nWhat makes a conclusion logically certain rather than merely probable?",
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
                    "## Vocabulary\n\n- **Deductive Reasoning** — Using facts, rules, definitions, or properties to reach a logical conclusion.\n- **Inductive Reasoning** — Using specific examples, patterns, or observations to make a general conclusion.\n- **Conditional Statement** — A logical statement of the form \"if [p], then [q],\" where [p] is the hypothesis and [q] is the conclusion.\n- **Law of Detachment** — If a conditional statement [p \\to q] is true and the hypothesis [p] is true, then the conclusion [q] must also be true.\n- **Law of Syllogism** — If [p \\to q] and [q \\to r] are both true, then [p \\to r] is also true.\n- **Valid Conclusion** — A conclusion that logically follows from the given statements using a recognized law of logic.\n- **Invalid Conclusion** — A conclusion that does not logically follow from the given statements.\n- **Conjunction** — A compound statement formed by joining two statements with \"and,\" symbolized as [p \\land q].\n- **Disjunction** — A compound statement formed by joining two statements with \"or,\" symbolized as [p \\lor q].",
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
                    "## Learn: Deductive Reasoning and Logical Laws\n\nDeductive reasoning moves from general statements to specific, certain conclusions. Two fundamental laws govern valid deductions from conditional statements.\n\n### Key Concept: Inductive vs. Deductive Reasoning\n\n- **Inductive reasoning** uses specific observations or examples to reach a general conclusion. The conclusion is probable but not guaranteed.\n- **Deductive reasoning** uses facts, rules, definitions, or properties to reach a specific conclusion. If the premises are true, the conclusion is guaranteed.\n\n### Key Concept: Law of Detachment\n\n- Given a true conditional [p \\to q] and a true hypothesis [p], the conclusion [q] must be true.\n- Symbolically: [(p \\to q) \\land p \\Rightarrow q]\n\n### Key Concept: Law of Syllogism\n\n- Given two true conditionals [p \\to q] and [q \\to r], the conditional [p \\to r] must also be true.\n- Symbolically: [(p \\to q) \\land (q \\to r) \\Rightarrow (p \\to r)]\n- The conclusion of the first statement must match the hypothesis of the second statement exactly.\n\n### Key Concept: Validity vs. Truth\n\n- A conclusion is **valid** when it is correctly derived from the given statements using a law of logic.\n- A conclusion is **invalid** when it commits a logical error, such as affirming the converse or denying the hypothesis.",
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
                    "## Example 1 — Distinguish Inductive and Deductive Reasoning\n\nGiven a set of arguments, determine whether each conclusion was reached using inductive or deductive reasoning.\n\n### Step 1: Identify the Structure of the Argument\n\nDetermine whether the argument moves from specific examples to a general rule (inductive) or from general rules to a specific conclusion (deductive).\n\n- Arguments that apply a general rule to a specific case are deductive. For example, applying a school policy about tardiness to a specific student uses deductive reasoning.\n- Arguments that infer a future event from repeated past observations are inductive. For example, predicting that a habitually late patient will be late again uses inductive reasoning.\n\n### Step 2: Classify Each Argument\n\nRepresentative argument types include:\n- Applying an \"if-then\" school rule to a specific student — deductive.\n- Predicting future behavior from a pattern of past behavior — inductive.\n- Applying a membership requirement to a specific person observed at a gym — deductive.\n- Inferring a consequence from a stated decision — deductive.\n- Predicting a weekly phone call based on a repeated pattern — inductive.\n- Predicting improved grades from a tutoring pattern — inductive.",
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
                    "## Example 2 — Determine Whether a Conclusion Is Valid\n\nGiven a set of premises and a stated conclusion, determine whether the conclusion is valid or invalid and explain the reasoning.\n\n### Step 1: Identify the Logical Form\n\nDetermine whether the argument follows the Law of Detachment, affirms the converse, denies the hypothesis, or makes another common error.\n\n- **Valid (Law of Detachment):** The argument affirms the hypothesis of a conditional. Given [p \\to q] and [p], concluding [q] is valid.\n[\n  p \\to q \\\\\n  p \\\\\n  \\therefore q\n]\n\n- **Invalid (Converse Error):** The argument affirms the conclusion and tries to infer the hypothesis. Given [p \\to q] and [q], concluding [p] is invalid.\n[\n  p \\to q \\\\\n  q \\\\\n  \\therefore p \\quad \\text{(invalid)}\n]\n\n### Step 2: Evaluate Each Argument\n\nRepresentative argument types include:\n- Given that all right angles are congruent and that two angles are right angles, concluding they are congruent — valid by definition.\n- Given \"if square then four right angles\" and observing four right angles, concluding the figure is a square — invalid (converse error; the figure could be a rectangle).\n- Given \"if lights on then battery dies\" and observing a dead battery, concluding the lights were left on — invalid (converse error; other causes are possible).\n- Given \"if part-time job then afford car payment\" and observing the ability to afford a car payment, concluding a part-time job was obtained — invalid (converse error).\n- Given \"if 75% of tickets sold then prom at country club\" and observing 75% of tickets sold, concluding the prom will be at the country club — valid by the Law of Detachment.",
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
                    "## Example 3 — Apply the Law of Syllogism\n\nGiven a pair of conditional statements, use the Law of Syllogism to draw a valid conclusion if possible. If no valid conclusion can be drawn, explain why.\n\n### Step 1: Check for a Chain of Conditionals\n\nIdentify whether the conclusion of the first conditional matches the hypothesis of the second conditional exactly.\n\n- If the statements have the form [p \\to q] and [q \\to r], then the valid conclusion is [p \\to r].\n[\n  p \\to q \\\\\n  q \\to r \\\\\n  \\therefore p \\to r\n]\n\n- If the conclusion of the first statement does not match the hypothesis of the second, no valid conclusion can be drawn by the Law of Syllogism.\n\n### Step 2: Draw or Reject the Conclusion\n\nRepresentative cases include:\n- Two conditionals sharing the same hypothesis but different conclusions — no valid conclusion by syllogism (the chain is broken).\n- A chain connecting grade point average to honor roll to school paper — valid conclusion links grade point average to name in the paper.\n- A conditional about perpendicular lines and a statement that two lines form right angles — no valid conclusion (the second statement is not a conditional with the first conclusion as its hypothesis).\n- A chain connecting obtuse angles to not acute — valid conclusion links angle measure between 90° and 180° to not acute.\n- A chain connecting non-parallel lines to intersecting to intersecting in a point — valid conclusion links non-parallel lines to intersecting in a point.\n- Two conditionals with unrelated hypotheses (ending in 0 vs. ending in 4) and the same conclusion — no valid conclusion by syllogism.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises consolidate reasoning skills with a variety of problem types:\n\n- **Construct arguments:** Given conditional statements, draw a valid conclusion and identify whether the Law of Detachment or the Law of Syllogism was used. If no valid conclusion can be drawn, justify why.\n- **Determine validity with Venn diagrams:** Given a conditional statement and additional information, decide whether a stated conclusion is valid or invalid and explain using a Venn diagram.\n- **Real-world reasoning:** Apply logical laws to everyday situations involving tutoring schedules, music history, building directions, and energy costs.\n- **Writing and analysis:** Explain why the Law of Syllogism fails for a given pair of conditionals; compare and contrast inductive and deductive reasoning.\n- **Symbolic logic:** Use symbols for conjunction, disjunction, and implication to represent the Law of Detachment and the Law of Syllogism.\n- **Create and write original statements:** Write pairs of statements that illustrate the Law of Detachment and the Law of Syllogism, and specify the conclusion reached.\n- **Persevere and analyze:** Solve logic puzzles involving truth-tellers and liars, and determine which statement among a set does not belong with the others.\n\n## Review Notes\n\n- Problem 29 references an image (`media/image1.png`) of two posted signs outside a trampoline park. The signs contain rules about age and supervision requirements. Teachers should consult the original worksheet for the exact text on the signs.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-4",
        title: "Writing Proofs",
        orderIndex: 4,
        description:
          "Students apply geometric postulates, classify statements as always/sometimes/never true, and write two-column, flow, and paragraph proofs.",
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
                    "## Explore: How Do We Know a Statement Is True?\n\nStudents discuss how mathematicians justify claims about geometric figures. They consider the difference between a postulate, which is accepted without proof, and a theorem, which must be proven using logical reasoning.\n\n**Inquiry Question:**\nWhat is the difference between a postulate and a proof, and when do we need each one?",
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
                    "## Vocabulary\n\n- **Postulate** — A statement accepted as true without proof.\n- **Collinear** — Points that lie on the same line.\n- **Coplanar** — Points or lines that lie in the same plane.\n- **Two-Column Proof** — A proof format with statements in one column and corresponding reasons in another.\n- **Flow Proof** — A proof format that uses arrows to show how statements connect from given information to the conclusion.\n- **Paragraph Proof** — A proof written in sentences that explains the logical argument from given information to the conclusion.\n- **Congruent Segments** — Segments that have the same length.\n- **Midpoint** — A point that divides a segment into two congruent segments.\n- **Transitive Property** — If two quantities are equal to the same quantity, then they are equal to each other.\n- **Substitution Property** — If two quantities are equal, then one may be substituted for the other in any equation.",
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
                    "## Learn: Writing Geometric Proofs\n\nA proof is a logical argument that uses definitions, postulates, and previously proven statements to show that a conclusion follows from given information. Different proof formats — two-column, flow, and paragraph — organize the same logical reasoning in different ways.\n\n### Key Concept: Points, Lines, and Planes Postulates\n\n- Through any two points, there is exactly one line.\n- Through any three noncollinear points, there is exactly one plane.\n- A line contains at least two points.\n- A plane contains at least three noncollinear points.\n- If two points lie in a plane, then the line containing them lies in the plane.\n- The intersection of two lines is a point.\n- The intersection of two planes is a line.\n\n### Key Concept: Two-Column Proof Structure\n\n- List each statement in the left column.\n- List the reason for each statement in the right column.\n- Start with the given information.\n- End with the statement to be proven.\n- Each statement must follow logically from previous statements or from given information.\n\n### Key Concept: Flow Proof Structure\n\n- Write each statement inside a box.\n- Draw an arrow from the reason to the new statement it justifies.\n- Show how the given information leads step by step to the conclusion.\n\n### Key Concept: Paragraph Proof Structure\n\n- Write the proof as a coherent paragraph of sentences.\n- State the given information and what is to be proven.\n- Connect each step with logical transitions such as \"because,\" \"since,\" or \"therefore.\"\n- Reference definitions, postulates, and properties by name.",
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
                    "## Example 1 — Apply Postulates about Points, Lines, and Planes\n\nUse postulates about points, lines, and planes to justify statements about geometric figures. Identify which postulate supports each statement.\n\n### Step 1: Identify the Geometric Relationship\n\nExamine the figure to determine what relationship exists between the given points, lines, or planes.\n\n### Step 2: State the Appropriate Postulate\n\nSelect the postulate that explains why the statement is true. For example:\n\nIf two planes intersect, their intersection is a line:\n[\n\\text{If plane } O \\text{ and plane } M \\text{ intersect, then they intersect in exactly one line.}\n]\n\nIf a line lies in a plane:\n[\n\\text{If two points of a line lie in a plane, then the entire line lies in that plane.}\n]\n\nIf points are collinear:\n[\n\\text{Through any two points, there is exactly one line.}\n]\n\nIf points are coplanar:\n[\n\\text{If three points lie in a plane, then they are coplanar.}\n]",
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
                    "## Example 2 — Determine Whether Statements Are Always, Sometimes, or Never True\n\nAnalyze statements about geometric relationships and classify each as always true, sometimes true, or never true. Justify each classification using postulates, definitions, or counterexamples.\n\n### Step 1: Test with Definitions and Postulates\n\nConsider whether the statement is guaranteed by a postulate or definition.\n\nFor example, three noncollinear points determine a plane:\n[\n\\text{Always true. Through any three noncollinear points, there is exactly one plane.}\n]\n\n### Step 2: Look for Counterexamples\n\nIf a statement is not guaranteed, try to find a case where it fails.\n\nFor example, three points in a plane are collinear:\n[\n\\text{Sometimes true. Three points in a plane may lie on the same line, but they need not.}\n]\n\n### Step 3: Consider Extreme Cases\n\nIf two planes intersect:\n[\n\\text{The intersection of two planes is always a line, never a point.}\n]",
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
                    "## Example 3 — Write and Complete Two-Column Proofs\n\nWrite a two-column proof from given information, or complete a partially written proof by supplying missing statements or reasons.\n\n### Step 1: List the Given Information and the Prove Statement\n\nIdentify what is assumed and what must be shown.\n\nGiven: Point [Y] is the midpoint of segment [XZ]. Point [W] is collinear with [X], [Y], and [Z]. Point [Z] is the midpoint of segment [YW].\n\nProve: Segment [XY] is congruent to segment [ZW].\n\n### Step 2: Apply the Definition of Midpoint\n\nSince [Y] is the midpoint of [XZ]:\n[\nXY = YZ\n]\n\nSince [Z] is the midpoint of [YW]:\n[\nYZ = ZW\n]\n\n### Step 3: Apply the Transitive Property\n\nBecause [XY] and [ZW] are both equal to [YZ]:\n[\nXY = ZW\n]\n\nTherefore:\n[\n\\overline{XY} \\cong \\overline{ZW}\n]\n\n### Step 4: Complete a Proof with Algebraic Expressions\n\nGiven two congruent segments with expressions for their lengths, set the expressions equal and solve for the variable.\n\nGiven: Segment [JK] is congruent to segment [LM].\n\nSet the expressions equal:\n[\nJK = LM\n]\n\nSubstitute the expressions and solve:\n[\nw = 3.5\n]\n\n### Step 5: Complete a Proof Using Substitution\n\nGiven equal segment lengths, use substitution and the definition of midpoint to prove that a point is the midpoint of two different segments.\n\nGiven: [SR = RT], [SR = UR], and [RT = RV].\n\nBy substitution:\n[\nRT = UR \\quad \\text{and} \\quad SR = RV\n]\n\nTherefore [R] is the midpoint of segment [ST] and segment [UV].\n\n### Step 6: Prove a Variable Value from a Midpoint\n\nGiven that a point is the midpoint of a segment with algebraic expressions for the segment parts, set the expressions equal and solve.\n\nGiven: [H] is the midpoint of segment [FG].\n\nSet the expressions for [FH] and [HG] equal:\n[\nFH = HG\n]\n\nSolve for [x]:\n[\nx = 1.25\n]",
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
                    "## Example 4 — Write and Complete Flow Proofs\n\nUse flow proof format to show the logical connection between given information and the conclusion.\n\n### Step 1: Start with the Given Information\n\nPlace the given facts in boxes. Draw arrows to show how each fact leads to the next statement.\n\nGiven: Point [L] is the midpoint of segment [JK]. Segment [JK] intersects segment [MK] at point [K]. Segment [MK] is congruent to segment [JL].\n\nProve: Segment [LK] is congruent to segment [MK].\n\n### Step 2: Apply the Definition of Midpoint\n\nFrom the given that [L] is the midpoint of [JK]:\n[\n\\overline{JL} \\cong \\overline{LK}\n]\n\n### Step 3: Use Substitution or Transitive Property\n\nGiven that [MK] is congruent to [JL], and [JL] is congruent to [LK]:\n[\n\\overline{LK} \\cong \\overline{MK}\n]\n\n### Step 4: Complete a Flow Proof with Algebraic Reasoning\n\nGiven: Segment [MN] is congruent to segment [PQ], with [MN = 5x - 10] and [PQ = 4x + 10].\n\nSet the expressions equal:\n[\n5x - 10 = 4x + 10\n]\n\nSolve for [x]:\n[\nx = 20\n]\n\nSubstitute back to find [MN]:\n[\nMN = 5(20) - 10 = 90\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Write Paragraph Proofs\n\nWrite a proof in paragraph form, connecting statements with logical transitions and referencing definitions and properties.\n\n### Step 1: State the Given Information and Goal\n\nBegin by stating what is given and what is to be proven.\n\nGiven: Point [B] is the midpoint of segment [AC], and point [C] is the midpoint of segment [BD].\n\nProve: [AB = CD].\n\n### Step 2: Apply Definitions and Properties\n\nSince [B] is the midpoint of [AC], the definition of midpoint tells us that [AB = BC]. Since [C] is the midpoint of [BD], we know that [BC = CD]. By the transitive property, [AB = CD].\n\n### Step 3: Write a Paragraph Proof with Substitution\n\nGiven expressions for segment lengths and a value for the variable, substitute and simplify to show congruence.\n\nGiven: [PQ = 4(x - 3) + 1], [QR = x + 10], and [x = 7].\n\nSubstitute [x = 7] into each expression:\n[\nPQ = 4(7 - 3) + 1 = 4(4) + 1 = 17\n]\n[\nQR = 7 + 10 = 17\n]\n\nSince [PQ = QR], segment [PQ] is congruent to segment [QR].",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: applying postulates, classifying statements, and writing proofs. Problems include:\n\n- Identifying the postulate that justifies a statement about points and lines.\n- Applying postulates about planes to determine whether a real-world structure is geometrically possible.\n- Evaluating whether a student is correct about the intersection of a line and a plane and explaining the reasoning.\n- Using the definition of midpoint to find a segment length in a real-world context and writing a paragraph proof.\n- Explaining how a definition was used within a paragraph proof.\n- Counting the number of lines determined by pairs of noncollinear points in a combinatorics setting.\n- Finding the maximum number of segments connecting pairs of points and applying the result to a departmental grouping problem.\n- Evaluating two student paragraph proofs to find errors and determine which approach is correct.\n- Creating a figure that satisfies five of the seven postulates and explaining each choice.\n- Applying the definition of perpendicular planes to determine what must be true in a given configuration.\n- Reflecting on how logical thinking is required when writing a proof.\n- Classifying statements about planes and lines as always, sometimes, or never true with justification.\n\n## Review Notes\n\n- Images referenced in the worksheet (geometric figures for problems 1–4, 11, 13, 14, 15, 17; roofing diagram for problem 20; student drawings for problem 21; marathon course diagram for problem 22; airline and small-business diagrams for problems 23–24; student work samples for problem 25; created figure for problem 26; perpendicular planes figure for problem 27) could not be fully described without visual reference. Teachers should consult the original worksheet for exact values and diagrams.\n- Problem 11 requires interpreting a diagram showing points on a line; visual reference is essential.\n- Problems 13 and 14 require interpreting partially completed two-column proofs shown in images; visual reference is essential.\n- Problems 15 and 16 require interpreting flow proof diagrams shown in images; visual reference is essential.\n- Problem 17 requires interpreting a geometric figure with collinear points; visual reference is essential.\n- Problems 25 and 27 involve evaluating student work shown in images; visual reference is essential.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-5",
        title: "Proving Segment Relationships",
        orderIndex: 5,
        description:
          "Students write two-column proofs about segments, apply reflexive/symmetric/transitive properties of congruence, and use the Segment Addition Postulate.",
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
                    "## Explore: How Do We Know Two Segments Are Congruent?\n\nStudents examine diagrams with overlapping or connected segments and discuss what information is needed to conclude that two segments are congruent. Consider how properties like substitution and transitivity allow us to chain known facts together.\n\n**Inquiry Question:**\nWhat properties of equality and congruence allow us to connect one known fact to another in a logical chain?",
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
                    "## Vocabulary\n\n- **Two-Column Proof** — A formal proof that lists statements in one column and corresponding reasons in another.\n- **Paragraph Proof** — A proof written in complete sentences, like a paragraph.\n- **Segment Congruence** — The relationship between two segments that have the same length.\n- **Reflexive Property of Congruence** — Any segment is congruent to itself: [\\overline{AB} \\cong \\overline{AB}].\n- **Symmetric Property of Congruence** — If [\\overline{AB} \\cong \\overline{CD}], then [\\overline{CD} \\cong \\overline{AB}].\n- **Transitive Property of Congruence** — If [\\overline{AB} \\cong \\overline{CD}] and [\\overline{CD} \\cong \\overline{EF}], then [\\overline{AB} \\cong \\overline{EF}].\n- **Substitution Property** — If two quantities are equal, one can be substituted for the other in any equation.\n- **Segment Addition Postulate** — If point [B] is between points [A] and [C], then [AB + BC = AC].\n- **Midpoint** — A point that divides a segment into two congruent segments.\n- **Definition of Midpoint** — If [M] is the midpoint of [\\overline{AB}], then [\\overline{AM} \\cong \\overline{MB}].",
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
                    "## Learn: Writing Proofs About Segment Relationships\n\nGeometric proofs use definitions, postulates, and properties to establish new facts from given information. Two-column proofs organize the reasoning into statements and reasons, while paragraph proofs present the same logic in prose.\n\n### Key Concept: Properties of Segment Congruence\n\n- **Reflexive Property:** [\\overline{AB} \\cong \\overline{AB}] for any segment [\\overline{AB}].\n- **Symmetric Property:** If [\\overline{AB} \\cong \\overline{CD}], then [\\overline{CD} \\cong \\overline{AB}].\n- **Transitive Property:** If [\\overline{AB} \\cong \\overline{CD}] and [\\overline{CD} \\cong \\overline{EF}], then [\\overline{AB} \\cong \\overline{EF}].\n\n### Key Concept: The Segment Addition Postulate and Substitution\n\n- If point [B] is between [A] and [C], then [AB + BC = AC].\n- If two segments are congruent, their lengths are equal and can be substituted in equations.\n\n### Key Concept: Using Midpoints in Proofs\n\n- A midpoint divides a segment into two congruent segments.\n- If two segments are congruent, their halves are also congruent.\n- If a point is the midpoint of two congruent segments, the resulting subsegments are congruent.",
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
                    "## Example 1 — Complete a Two-Column Proof\n\nGiven information about segment relationships including midpoints and congruent segments, supply the missing statements and reasons to complete a two-column proof.\n\n### Step 1: Identify the Given Information\n\nRead the problem to extract the givens: which segments are congruent, which points are midpoints, and what segment must be proved congruent.\n\n### Step 2: State the Prove Statement\n\nIdentify the conclusion that the proof must establish.\n\n### Step 3: Fill in the Proof Table\n\nUse definitions, postulates, and properties to supply each missing statement and its justification. Common reasons include:\n- Definition of midpoint\n- Definition of congruent segments\n- Segment Addition Postulate\n- Substitution Property\n- Transitive Property of Congruence",
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
                    "## Example 2 — Write a Two-Column Proof\n\nGiven conditions about congruent segments or a midpoint, write a complete two-column proof to show that a target segment is congruent to another segment.\n\n### Step 1: Draw or Interpret the Diagram\n\nUse the diagram to identify collinear points and overlapping segments.\n\n### Step 2: List the Givens and the Prove Statement\n\nRestate the given information and what must be proved.\n\n### Step 3: Build the Logical Chain\n\nWrite each statement with its corresponding reason:\n- Use the definition of congruent segments to convert between congruence and equality of lengths.\n- Apply the Segment Addition Postulate to express a whole segment as a sum of parts.\n- Use substitution to replace equal lengths in an equation.\n- Use the definition of congruent segments to conclude segment congruence from equal lengths.",
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
                    "## Example 3 — Apply Segment Properties to Real-World Situations\n\nUse properties of segment congruence, the transitive property, and midpoint relationships to analyze and solve real-world problems.\n\n### Step 1: Model the Situation with Segments\n\nRepresent real-world quantities such as heights, lengths of planks, or distances between houses as segments on a line.\n\n### Step 2: Apply Properties of Congruence and Equality\n\nUse the transitive property to compare quantities that are not directly measured against each other. Use the definition of midpoint to reason about halfway points.\n\n### Step 3: Draw Conclusions\n\nState what can be concluded about the real-world quantities based on the geometric properties applied.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises consolidate proof-writing and reasoning skills with a variety of problem types:\n\n- **Complete two-column proofs:** Given midpoint conditions and congruent segments, fill in missing statements and reasons to prove a segment relationship.\n- **Write two-column proofs:** Given diagrams with collinear points and congruent segments, write original proofs to establish congruence.\n- **Paragraph proofs:** Write proofs in paragraph form for the Reflexive and Symmetric Properties of segment congruence.\n- **Find the error:** Examine student reasoning about segment congruence, substitution, and the Segment Addition Postulate; identify mistakes and explain the correct approach.\n- **Real-world applications:** Apply segment properties to situations involving aligned lights, lumberyard planks, park paths, and neighborhoods on a line.\n- **Create and analyze:** Draw a segment representation of the Segment Addition Postulate with specific constraints; create examples that distinguish the Transitive Property from the Substitution Property.\n- **Compare and contrast:** Explain similarities and differences between paragraph proofs and two-column proofs.\n- **Prove with given lengths:** Given three congruent segments and an equation relating their lengths, prove that two intermediate segments are congruent.\n- **Multi-step reasoning:** Prove that if one point is the midpoint of a segment and two outer segments are congruent, then another point must also be a midpoint.\n\n## Review Notes\n\n- Images referenced in the worksheet (segment diagrams for problems 1, 2, 3, 4, 9, 10, 11, 13, and 15; proof tables for problems 1, 2, 8, 10, and 11; student work for problem 13) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and proof table layouts.\n- Problem 1 involves a diagram with overlapping segments and a partially completed two-column proof table.\n- Problem 2 involves a diagram with collinear points and a partially completed two-column proof table.\n- Problems 3 and 4 involve diagrams with collinear points that require writing original two-column proofs.\n- Problem 8 involves a diagram of five aligned lights and a partially completed two-column proof table.\n- Problem 10 involves a diagram of collinear points on a line and a partially completed two-column proof table.\n- Problem 11 involves a diagram of two paths with a monument at their common midpoint and a partially completed two-column proof table.\n- Problem 13 involves a diagram with multiple congruent segments for evaluating student reasoning.\n- Problem 15 requires drawing a segment diagram that satisfies specific constraints.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-6",
        title: "Proving Angle Relationships",
        orderIndex: 6,
        description:
          "Students apply the Angle Addition Postulate, solve for unknown angle measures using linear pairs, and write two-column proofs for angle congruence.",
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
                    "## Explore: How Can We Prove Angle Measures Without Measuring?\n\nStudents consider how geometric relationships allow us to determine angle measures through logical deduction rather than direct measurement. They explore what information is needed to find an unknown angle and how given angle relationships create a chain of reasoning.\n\n**Inquiry Question:**\nIf you know that two angles form a linear pair and one angle measures [70^\\circ], can you prove the measure of the other angle without using a protractor?",
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
                    "## Vocabulary\n\n- **Angle Addition Postulate** — If point D lies in the interior of [\\angle ABC], then [m\\angle ABD + m\\angle DBC = m\\angle ABC].\n- **Linear Pair** — Two adjacent angles whose non-common sides form opposite rays.\n- **Supplementary Angles** — Two angles whose measures sum to [180^\\circ].\n- **Complementary Angles** — Two angles whose measures sum to [90^\\circ].\n- **Congruent Angles** — Angles that have equal measure.\n- **Right Angle** — An angle whose measure is exactly [90^\\circ].\n- **Perpendicular Lines** — Two lines that intersect to form right angles.\n- **Two-Column Proof** — A deductive argument organized into statements and reasons in two columns.\n- **Congruent Supplements Theorem** — If two angles are supplementary to the same angle (or to congruent angles), then they are congruent.\n- **Congruent Complements Theorem** — If two angles are complementary to the same angle (or to congruent angles), then they are congruent.",
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
                    "## Learn: Angle Relationships and Deductive Proofs\n\nAngle relationships such as supplementary, complementary, and linear pairs form the foundation for deductive proofs in geometry. By applying postulates and previously proven theorems, we can establish new conclusions about angle measures and congruence.\n\n### Key Concept: Angle Addition Postulate\n\nWhen a ray divides an angle into two smaller adjacent angles, the measure of the whole angle equals the sum of the measures of its parts:\n[\nm\\angle ABD + m\\angle DBC = m\\angle ABC\n]\n\n### Key Concept: Supplementary and Complementary Relationships\n\n- If two angles form a linear pair, they are supplementary.\n- If two angles are complementary, their measures sum to [90^\\circ].\n- If two angles are supplementary, their measures sum to [180^\\circ].\n\n### Key Concept: Congruent Supplements and Complements\n\n- Angles supplementary to the same angle (or to congruent angles) are congruent to each other.\n- Angles complementary to the same angle (or to congruent angles) are congruent to each other.\n\n### Key Concept: Perpendicular Lines and Right Angles\n\n- Perpendicular lines intersect to form four right angles.\n- If two lines are perpendicular, they form congruent adjacent angles.\n- If two angles are congruent and supplementary, each is a right angle.\n- If two congruent angles form a linear pair, they are right angles.",
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
                    "## Example 1 — Apply the Angle Addition Postulate\n\nUse the Angle Addition Postulate to find unknown angle measures when given the measures of adjacent angles or the total angle measure.\n\n### Step 1: Identify the Relationship\n\nDetermine whether the problem gives two adjacent angle measures and asks for the total, or gives the total and one part to find the other part.\n\nWhen two adjacent angles are given, add their measures:\n[\nm\\angle ABC = m\\angle ABD + m\\angle DBC\n]\n\n### Step 2: Solve for the Unknown Measure\n\nWhen the total and one part are known, subtract to find the missing angle:\n[\nm\\angle ABD = m\\angle ABC - m\\angle DBC\n]\n\n### Step 3: Apply to a Diagram with Multiple Angles\n\nWhen a diagram contains several adjacent angles, use the same postulate with the appropriate angle labels. Identify which angles share a common ray and vertex.",
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
                    "## Example 2 — Solve Real-World Problems Using Linear Pairs\n\nApply the property that angles forming a linear pair are supplementary to solve problems presented in real-world contexts.\n\n### Step 1: Recognize a Linear Pair\n\nIdentify two adjacent angles whose non-common sides form a straight line. These angles must sum to [180^\\circ].\n\n### Step 2: Set Up and Solve\n\nGiven one angle in a linear pair, subtract from [180^\\circ] to find the other:\n[\nm\\angle 2 = 180^\\circ - m\\angle 1\n]\n\n### Step 3: Apply to Construction Contexts\n\nWhen a structure contains intersecting lines or a window frame creates adjacent angles along a straight edge, use the same supplementary relationship to find unknown angle measures.",
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
                    "## Example 3 — Write Two-Column Proofs with Congruent Angles\n\nConstruct logical arguments using two-column proofs to show that angles are congruent based on given information about angle relationships.\n\n### Step 1: Analyze the Given Information\n\nIdentify what is known from the diagram and the given statements. Determine which angles are marked as congruent or supplementary.\n\n### Step 2: Identify the Target Conclusion\n\nDetermine what must be proven. Common targets include showing two angles are congruent or that a pair of angles are supplementary.\n\n### Step 3: Build the Proof\n\nState each logical step in the left column and justify it with a definition, postulate, or theorem in the right column. Common reasons include:\n- Given\n- Definition of congruent angles\n- Angle Addition Postulate\n- Substitution Property of Equality\n- Subtraction Property of Equality\n\nFor example, to prove that [\\angle 1 \\cong \\angle 3] given that [\\angle 2 \\cong \\angle 4]:\n- Use the fact that [\\angle 1] and [\\angle 2] form a linear pair, as do [\\angle 3] and [\\angle 4].\n- Apply the definition of supplementary angles.\n- Use substitution and subtraction to show the remaining angles are equal in measure.",
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
                    "## Example 4 — Prove Angle Congruence Using Supplements\n\nWrite a two-column proof to establish that two angles are congruent when they are supplementary to congruent angles.\n\n### Step 1: State the Given and Prove\n\nIdentify the angles that are given as congruent and the angles that must be proven congruent.\n\n### Step 2: Use Supplement Relationships\n\nShow that the target angles are supplementary to the given congruent angles, either because they form linear pairs or because they are explicitly stated as supplementary.\n\n### Step 3: Apply the Congruent Supplements Theorem\n\nConclude that angles supplementary to congruent angles are themselves congruent.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Prove Theorems About Right Angles and Perpendicular Lines\n\nWrite two-column proofs for theorems involving right angles, supplementary congruent angles, and perpendicular lines.\n\n### Step 1: Prove Two Supplementary Congruent Angles Are Right Angles\n\nGiven that two angles are both congruent and supplementary:\n- Let [m\\angle ABC = m\\angle DEF = x].\n- Since they are supplementary: [x + x = 180^\\circ].\n- Solve to show [x = 90^\\circ], proving each is a right angle.\n\n### Step 2: Prove Perpendicular Lines Create Congruent Adjacent Angles\n\nGiven that a line is perpendicular to another line:\n- Use the definition of perpendicular lines to establish right angles.\n- Apply the property that all right angles are congruent.\n\n### Step 3: Prove Angle Congruence with a Perpendicular Line\n\nWhen a perpendicular line creates multiple right angles, use the fact that all right angles are congruent to prove that a specified angle is congruent to another angle in the diagram.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson:\n\n- Applying the Angle Addition Postulate to find unknown angle measures from diagrams.\n- Solving for angle measures when two adjacent angles form a known total.\n- Finding numbered angle measures and naming the theorems used to justify each step.\n- Setting up and solving equations for angle measures expressed in terms of [x], including complementary and supplementary relationships.\n- Writing two-column proofs for the Supplement Theorem, Complement Theorem, Congruent Supplements Theorem, and Congruent Complements Theorem.\n- Proving theorems about perpendicular lines using diagrams with intersecting lines.\n- Constructing arguments about geometric quality control using angle comparison and congruence.\n- Analyzing triangle angle measures using supplementary angle relationships and algebraic solving.\n- Creating constructions and making conjectures about resulting angle measures.\n- Writing proof steps for segment congruence using given midpoint relationships.\n- Explaining why theorems about congruent supplements and complements have multiple cases and writing proofs for the alternate cases.\n\n## Review Notes\n\n- Images referenced in the worksheet (angle diagrams for Examples 1–5, flag and construction diagrams for Example 2, proof diagrams for Examples 3–5 and Mixed Exercises) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and angle labels.\n- The worksheet labels individual problems within example groups rather than using separate example headings for all groups. Problems 6–7 correspond to Example 3, Problem 8 corresponds to Example 4, and Problems 9–10 correspond to Example 5.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-7",
        title: "Parallel Lines and Transversals",
        orderIndex: 7,
        description:
          "Students identify parallel, skew, and perpendicular segments, classify angle pairs formed by a transversal, and apply parallel line theorems to find unknown measures.",
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
                    "## Explore: How Can We Describe Relationships Between Lines and Angles?\n\nStudents investigate how lines in space relate to one another — intersecting, parallel, or skew — and what happens when a third line crosses two or more lines. They consider how angle positions reveal hidden relationships and allow us to determine whether lines are parallel.\n\n**Inquiry Question:**\nIf two lines are cut by a transversal, what can the positions of the angles tell us about whether the lines are parallel?",
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
                    "## Vocabulary\n\n- **Parallel Lines** — Coplanar lines that do not intersect.\n- **Skew Lines** — Lines that do not intersect and are not coplanar.\n- **Parallel Planes** — Planes that do not intersect.\n- **Transversal** — A line that intersects two or more coplanar lines at distinct points.\n- **Alternate Interior Angles** — Nonadjacent interior angles that lie on opposite sides of a transversal.\n- **Alternate Exterior Angles** — Nonadjacent exterior angles that lie on opposite sides of a transversal.\n- **Corresponding Angles** — Angles that lie in the same relative position at each intersection where a transversal crosses two lines.\n- **Consecutive Interior Angles** — Interior angles that lie on the same side of a transversal; also called same-side interior angles.\n- **Perpendicular Transversal Theorem** — If a transversal is perpendicular to one of two parallel lines, then it is perpendicular to the other.\n- **Consecutive Interior Angles Theorem** — If two parallel lines are cut by a transversal, then each pair of consecutive interior angles is supplementary.\n- **Alternate Exterior Angles Theorem** — If two parallel lines are cut by a transversal, then each pair of alternate exterior angles is congruent.",
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
                    "## Learn: Parallel Lines, Transversals, and Angle Relationships\n\nWhen parallel lines are cut by a transversal, special angle relationships emerge that allow us to find unknown measures and prove geometric theorems.\n\n### Key Concept: Parallel, Skew, and Perpendicular Relationships\n\n- Parallel lines are coplanar and never intersect.\n- Skew lines are non-coplanar and never intersect.\n- Perpendicular lines intersect at right angles.\n- In three-dimensional figures, parallel segments and skew segments can be identified by examining faces and edges.\n\n### Key Concept: Angle Pairs Formed by a Transversal\n\n- Alternate interior angles are on opposite sides of the transversal and inside the two lines.\n- Alternate exterior angles are on opposite sides of the transversal and outside the two lines.\n- Corresponding angles are in the same position at each intersection.\n- Consecutive interior angles are on the same side of the transversal and inside the two lines.\n\n### Key Concept: Parallel Line Angle Theorems\n\nWhen two parallel lines are cut by a transversal:\n\n- Corresponding angles are congruent.\n- Alternate interior angles are congruent.\n- Alternate exterior angles are congruent.\n- Consecutive interior angles are supplementary.",
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
                    "## Example 1 — Identify Parallel, Skew, and Perpendicular Segments\n\nUse spatial reasoning to identify relationships between segments and faces in a three-dimensional figure.\n\n### Step 1: Recognize Parallel Segments\n\nIdentify segments that lie in the same plane and never intersect. Look for edges on opposite faces or along the same direction in a prism.\n\n### Step 2: Recognize Skew Segments\n\nIdentify segments that do not intersect and are not coplanar. These typically lie on edges that are neither parallel nor intersecting.\n\n### Step 3: Analyze Plane Relationships\n\nDetermine whether two faces of a three-dimensional figure are parallel or perpendicular by examining whether their edges are parallel or perpendicular.",
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
                    "## Examples 2 and 3 — Identify Transversals and Classify Angle Pairs\n\nIdentify the transversal connecting pairs of angles and classify the relationship between each pair using the vocabulary of parallel line angle pairs.\n\n### Step 1: Locate the Transversal\n\nDetermine which line intersects the two lines containing the given angles.\n\n### Step 2: Classify the Angle Pair\n\nUse the positions of the angles relative to the transversal and the two lines:\n\n- Same side, both interior → Consecutive Interior\n- Opposite sides, both interior → Alternate Interior\n- Opposite sides, both exterior → Alternate Exterior\n- Same relative position → Corresponding\n\n### Step 3: Apply to Multiple Diagrams\n\nRepeat the classification process for different pairs of angles across several figures, including diagrams with multiple transversals.\n\n### Step 4: Connect to Real-World Contexts\n\nApply the concept of transversals to real-world situations such as escalator railings crossing horizontal floor lines.",
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
                    "## Example 4 — Find Angle Measures Using Parallel Line Properties\n\nUse the theorems for parallel lines and transversals to find unknown angle measures when one angle measure is known.\n\n### Step 1: Identify the Given Angle Measure\n\nFrom the diagram, note the measure of the given angle. For example:\n[\nm\\angle 7 = 100^{\\circ}\n]\n\n### Step 2: Apply Corresponding and Alternate Angle Relationships\n\nWhen two parallel lines are cut by a transversal, corresponding angles and alternate interior or exterior angles have equal measures:\n[\nm\\angle 9 = m\\angle 7\n]\n[\nm\\angle 5 = m\\angle 7\n]\n[\nm\\angle 11 = m\\angle 7\n]\n\n### Step 3: Apply Supplementary Relationships\n\nConsecutive interior angles and linear pairs sum to [180^{\\circ}]. Use subtraction to find the complement of a known angle:\n[\nm\\angle 8 = 180^{\\circ} - m\\angle 7 = 80^{\\circ}\n]\n[\nm\\angle 6 = 180^{\\circ} - m\\angle 7 = 80^{\\circ}\n]\n[\nm\\angle 2 = 180^{\\circ} - m\\angle 7 = 80^{\\circ}\n]\n\n### Step 4: Solve Real-World Angle Problems\n\nApply the same reasoning to real-world contexts such as parking garage ramps and city street intersections where parallel lines and transversals model physical structures.",
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
                    "## Example 5 — Solve for Variables in Figures with Parallel Lines\n\nSet up and solve equations using parallel line relationships to find unknown variable values in geometric figures.\n\n### Step 1: Identify the Angle Relationship\n\nDetermine whether the angles in the figure are congruent or supplementary based on their positions relative to parallel lines and a transversal.\n\n### Step 2: Write an Equation\n\nIf the angles are congruent, set their expressions equal. If supplementary, set their sum equal to [180^{\\circ}].\n\nFor congruent angles:\n[\nx + 15 = 2x - 5\n]\n\nFor supplementary angles:\n[\n3x + 20 + 2x = 180\n]\n\n### Step 3: Solve for the Variable\n\nIsolate the variable using algebraic techniques:\n[\nx = 20\n]\n\n### Step 4: Verify the Solution\n\nSubstitute the value back into the original expressions to confirm the angle measures are consistent with the identified relationship.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson:\n\n- Identifying parallel, skew, and perpendicular segments in three-dimensional figures.\n- Naming transversals and classifying angle pairs as alternate interior, alternate exterior, corresponding, or consecutive interior.\n- Finding unknown angle measures using parallel line theorems when one angle measure is given.\n- Setting up and solving equations for variables in figures with parallel lines and transversals.\n- Applying parallel line concepts to real-world contexts such as carpentry, mapping, and city engineering.\n- Writing paragraph proofs for the Alternate Exterior Angles Theorem.\n- Writing two-column proofs for the Consecutive Interior Angles Theorem and the Perpendicular Transversal Theorem.\n- Finding angle measures in trapezoids and justifying each step with a theorem or definition.\n- Analyzing whether statements about lines in parallel planes are always, sometimes, or never true.\n- Comparing and contrasting the Alternate Interior Angles Theorem and the Consecutive Interior Angles Theorem.\n- Creating figures based on descriptions involving parallel, skew, and intersecting lines in space.\n- Determining the minimum number of angle measures needed to find all angles formed by two parallel lines cut by a transversal.\n\n## Review Notes\n\n- Images referenced in the worksheet (three-dimensional figure for Example 1, angle diagrams for Examples 2–4 and Mixed Exercises, ramp and street diagrams for Example 4, variable figures for Example 5, flag diagram, proof diagrams, and mapping figures for Mixed Exercises) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams, angle labels, and values.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-8",
        title: "Slope and Equations of Lines",
        orderIndex: 8,
        description:
          "Students calculate slope, determine whether lines are parallel or perpendicular by comparing slopes, and write equations of lines in slope-intercept form.",
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
                    "## Explore: How Can We Tell If Two Lines Never Meet or Cross at Right Angles?\n\nStudents investigate what information about two lines is needed to predict whether they are parallel, perpendicular, or neither. They explore whether examining graphs, equations, or pairs of points gives the same conclusion.\n\n**Inquiry Question:**\nIf two lines have the same slope, will they always be parallel? If the product of their slopes is [-1], will they always be perpendicular?",
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
                    "## Vocabulary\n\n- **Slope** — The ratio of vertical change to horizontal change between two points on a line, often denoted [m].\n- **Parallel Lines** — Lines in the same plane that never intersect; they have equal slopes.\n- **Perpendicular Lines** — Lines that intersect at a right angle; their slopes are negative reciprocals.\n- **Slope-Intercept Form** — The form [y = mx + b], where [m] is the slope and [b] is the [y]-intercept.\n- **Point-Slope Form** — The form [y - y_1 = m(x - x_1)], where [m] is the slope and [(x_1, y_1)] is a point on the line.\n- **Negative Reciprocal** — Two numbers whose product is [-1]; the slopes of perpendicular lines are negative reciprocals.\n- **Collinear** — Points that lie on the same straight line.\n- **Biconditional Statement** — A statement of the form \"[p] if and only if [q],\" combining a conditional and its converse.",
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
                    "## Learn: Slope and Relationships Between Lines\n\nThe slope of a line determines its direction and steepness. By comparing slopes, we can classify the relationship between two lines without graphing.\n\n### Key Concept: Calculating Slope\n\nGiven two points [(x_1, y_1)] and [(x_2, y_2)], the slope is:\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\n### Key Concept: Parallel Lines\n\n- Two non-vertical lines are parallel if and only if they have the same slope.\n- Parallel lines never intersect.\n- Vertical lines are parallel to each other.\n\n### Key Concept: Perpendicular Lines\n\n- Two non-vertical lines are perpendicular if and only if the product of their slopes is [-1], which means their slopes are negative reciprocals.\n- If one line has slope [m], a perpendicular line has slope [\\text{-}\\frac{1}{m}].\n- A horizontal line is perpendicular to a vertical line.\n\n### Key Concept: Writing Equations of Parallel and Perpendicular Lines\n\nTo write the equation of a line through a given point that is parallel or perpendicular to a given line:\n- Identify the slope of the given line.\n- For a parallel line, use the same slope.\n- For a perpendicular line, use the negative reciprocal of the slope.\n- Substitute the slope and the given point into point-slope form, then convert to slope-intercept form.",
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
                    "## Example 1 — Determine Whether Lines Through Given Points Are Parallel, Perpendicular, or Neither\n\nGiven the coordinates of two pairs of points that define two lines, calculate each slope and compare them to classify the relationship.\n\n### Step 1: Calculate the Slope of Each Line\n\nUse the slope formula with the given coordinates for each line.\n\nFor a line through [(x_1, y_1)] and [(x_2, y_2)]:\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\n### Step 2: Compare the Slopes\n\n- If the slopes are equal, the lines are parallel.\n- If the product of the slopes is [-1], the lines are perpendicular.\n- Otherwise, the lines are neither parallel nor perpendicular.\n\n### Step 3: Verify by Graphing\n\nSketch both lines on a coordinate plane to confirm the algebraic conclusion.",
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
                    "## Example 2 — Determine Whether Graphed Lines Are Parallel, Perpendicular, or Neither\n\nGiven graphs of two lines on a coordinate plane, determine their relationship by analyzing their slopes visually and algebraically.\n\n### Step 1: Identify Points on Each Graphed Line\n\nRead the coordinates of two points that lie on each line from the graph.\n\n### Step 2: Calculate or Compare Slopes\n\nUse the identified points to compute each slope, or compare the rise-over-run visually.\n\n### Step 3: Classify the Relationship\n\nUse the slope comparison rules to state whether the lines are parallel, perpendicular, or neither.",
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
                    "## Example 3 — Determine Whether Lines Given by Equations Are Parallel, Perpendicular, or Neither\n\nGiven the equations of two lines, rewrite them in slope-intercept form if necessary, identify their slopes, and classify their relationship.\n\n### Step 1: Rewrite in Slope-Intercept Form\n\nConvert each equation to [y = mx + b] to identify the slope [m].\n\nFor example, an equation in point-slope form:\n[\ny - y_1 = m(x - x_1)\n]\nis solved for [y] to reveal the slope.\n\n### Step 2: Identify the Slopes\n\nExtract the slope from each equation in slope-intercept form.\n\n### Step 3: Compare the Slopes\n\n- Equal slopes indicate parallel lines.\n- Negative reciprocal slopes indicate perpendicular lines.\n- Special cases: a vertical line ([x = k]) has undefined slope, and a horizontal line ([y = k]) has slope [0]; they are perpendicular to each other.",
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
                    "## Example 4 — Graph Lines and Solve Real-World Problems Using Parallel and Perpendicular Relationships\n\nGraph a line that satisfies a given condition, such as passing through a specified point and being parallel or perpendicular to a line through two other points. Apply these concepts to real-world contexts.\n\n### Step 1: Find the Slope of the Reference Line\n\nCalculate the slope of the line through the given reference points.\n\n### Step 2: Determine the Slope of the Desired Line\n\n- For a parallel line, use the same slope.\n- For a perpendicular line, use the negative reciprocal slope.\n\n### Step 3: Graph the Line\n\nPlot the given point and use the slope to find a second point. Draw the line through these points.\n\n### Step 4: Write the Equation\n\nSubstitute the slope and the given point into point-slope form, then convert to slope-intercept form.\n\n### Step 5: Apply to Real-World Contexts\n\nIn applied problems, interpret the slope as a rate of change. Use parallel slopes to model objects moving in the same direction with the same steepness, and use perpendicular slopes to model right-angle turns or crossings.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Write Equations in Slope-Intercept Form for Parallel and Perpendicular Lines\n\nWrite the equation of a line in slope-intercept form that passes through a given point and is either parallel or perpendicular to a given line.\n\n### Step 1: Identify the Slope of the Given Line\n\nRead the slope from the given equation in slope-intercept form.\n\n### Step 2: Determine the New Slope\n\n- Parallel: [m_{\\text{new}} = m_{\\text{given}}]\n- Perpendicular: [m_{\\text{new}} = \\text{-}\\frac{1}{m_{\\text{given}}}]\n\n### Step 3: Use Point-Slope Form\n\nSubstitute the new slope and the given point [(x_1, y_1)] into point-slope form:\n[\ny - y_1 = m_{\\text{new}}(x - x_1)\n]\n\n### Step 4: Convert to Slope-Intercept Form\n\nSolve for [y] to write the final equation as [y = mx + b].",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson:\n\n- Finding the value of an unknown coordinate so that a line through two points is parallel or perpendicular to another line.\n- Writing both a parallel and a perpendicular equation in slope-intercept form through a given point.\n- Determining from a diagram whether any lines in a figure are parallel or perpendicular, and justifying the answer with slopes.\n- Applying slope concepts to a city map with parallel roads to find distances and slopes.\n- Finding possible coordinates for a point so that two lines are parallel, using the property that parallel lines have equal slopes.\n- Using a model to find where a perpendicular path meets an axis in a video game design context.\n- Finding slopes of two lines and determining possible values for variables that make the lines parallel.\n- Writing equations of parallel and perpendicular lines in point-slope and slope-intercept form using variables for coefficients.\n- Constructing arguments about whether a line equation can be written in a specified standard form.\n- Analyzing a square given opposite vertices by finding the other vertices and proving sides are parallel and angles are right angles.\n- Persevering through multi-step algebra to find an unknown value so that a perpendicular line passes through two given points.\n- Determining whether three points are collinear by comparing slopes between pairs of points.\n- Creating original equations for a pair of perpendicular lines that intersect at a given point.\n- Writing biconditional statements that use slopes to characterize parallel and perpendicular lines.\n- Finding and explaining errors in a student's work when writing the equation of a perpendicular line.\n\n## Review Notes\n\n- Images referenced in the worksheet (graphed lines for problems 7, 8, and 9; ski slope diagram for problem 20; marching band coordinate diagram for problem 21; graphs for problems 30 and 31; geometric figures for problems 32, 33, and 34; city blocks map for problem 35; helicopter path diagram for problem 37; student work for problem 46) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams, labels, and values.\n- Problem 7, 8, and 9 involve graphs of two lines on coordinate planes for visual slope comparison.\n- Problems 20 and 21 are multi-part real-world applications requiring equation writing and reasoning about coordinates.\n- Problems 32, 33, and 34 involve geometric figures with multiple lines; students must determine whether any pair is parallel or perpendicular and justify with slope calculations.\n- Problem 35 involves a city map with parallel roads and requires applying slope to find distances.\n- Problem 46 involves a diagram of student work showing an attempt to find the equation of a perpendicular line; students must identify and explain the error.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-9",
        title: "Proving Lines Parallel",
        orderIndex: 9,
        description:
          "Students use angle relationships formed by a transversal to prove that two lines are parallel, apply converse theorems, and solve for variables.",
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
                    "## Explore: What Makes Two Lines Parallel?\n\nStudents examine diagrams where two lines are cut by a transversal and discuss which angle relationships are enough to guarantee the lines are parallel. They consider whether one pair of congruent angles is sufficient, or whether supplementary angles can also prove parallelism.\n\n**Inquiry Question:**\nWhat angle relationships between two lines and a transversal provide enough evidence to prove the lines are parallel?",
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
                    "## Vocabulary\n\n- **Corresponding Angles Converse** — If two lines are cut by a transversal so that corresponding angles are congruent, then the lines are parallel.\n- **Alternate Interior Angles Converse** — If two lines are cut by a transversal so that alternate interior angles are congruent, then the lines are parallel.\n- **Alternate Exterior Angles Converse** — If two lines are cut by a transversal so that alternate exterior angles are congruent, then the lines are parallel.\n- **Consecutive Interior Angles Converse** — If two lines are cut by a transversal so that consecutive interior angles are supplementary, then the lines are parallel.\n- **Perpendicular Transversal Converse** — In a plane, if two lines are perpendicular to the same line, then they are parallel to each other.\n- **Parallel Postulate** — Through a point not on a given line, there is exactly one line parallel to the given line.\n- **Transversal** — A line that intersects two or more coplanar lines at different points.",
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
                    "## Learn: Converse Theorems for Parallel Lines\n\nThe converses of the parallel line theorems allow us to prove lines are parallel when certain angle relationships are known. Each converse reverses the direction of the original theorem.\n\n### Key Concept: Converse Theorems\n\n- **Corresponding Angles Converse:** Corresponding angles congruent implies the lines are parallel.\n- **Alternate Interior Angles Converse:** Alternate interior angles congruent implies the lines are parallel.\n- **Alternate Exterior Angles Converse:** Alternate exterior angles congruent implies the lines are parallel.\n- **Consecutive Interior Angles Converse:** Consecutive interior angles supplementary implies the lines are parallel.\n\n### Key Concept: Finding Values to Make Lines Parallel\n\nTo find a variable value that ensures two lines are parallel:\n- Identify the angle relationship that must hold for the lines to be parallel.\n- Set up an equation based on that relationship (congruence or supplementary).\n- Solve for the unknown variable.",
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
                    "## Example 1 — Determine Which Lines Are Parallel\n\nUse given information about angle congruence or supplementary relationships to determine which lines, if any, are parallel. State the converse theorem or postulate that justifies each conclusion.\n\n### Step 1: Recognize Corresponding Angles\n\nWhen corresponding angles formed by a transversal are congruent, the two lines cut by the transversal are parallel.\n\nFor example, if corresponding angles are congruent:\n[\n\\angle 3 \\cong \\angle 7 \\Rightarrow p \\parallel q\n]\nJustification: Corresponding Angles Converse.\n\n### Step 2: Recognize Alternate Exterior Angles\n\nWhen alternate exterior angles are congruent, the lines are parallel.\n\nFor example:\n[\n\\angle 2 \\cong \\angle 16 \\Rightarrow r \\parallel s\n]\nJustification: Alternate Exterior Angles Converse.\n\n### Step 3: Recognize Consecutive Interior Angles\n\nWhen consecutive interior angles are supplementary, the lines are parallel.\n\nFor example:\n[\nm\\angle 5 + m\\angle 12 = 180^\\circ \\Rightarrow p \\parallel q\n]\nJustification: Consecutive Interior Angles Converse.\n\n### Step 4: Recognize Alternate Interior Angles\n\nWhen alternate interior angles are congruent, the lines are parallel.\n\nFor example:\n[\n\\angle 1 \\cong \\angle 6 \\Rightarrow p \\parallel q\n]\nJustification: Alternate Interior Angles Converse.",
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
                    "## Example 2 — Find the Value of x That Makes Lines Parallel\n\nFind the value of a variable that ensures two lines are parallel by setting up and solving an equation based on the appropriate angle relationship.\n\n### Step 1: Use Corresponding Angles\n\nSet the expressions for corresponding angles equal and solve.\n\nFor example, if one corresponding angle measures [(3x + 5)^\\circ] and the other measures [80^\\circ]:\n[\n3x + 5 = 80\n]\n[\nx = 25\n]\n\n### Step 2: Use Alternate Interior Angles\n\nSet the expressions for alternate interior angles equal and solve.\n\nFor example:\n[\n2x + 10 = 3x - 20\n]\n[\nx = 30\n]\n\n### Step 3: Use Consecutive Interior Angles\n\nSet the sum of the consecutive interior angle expressions equal to [180^\\circ] and solve.\n\nFor example:\n[\n(4x + 15) + (5x - 30) = 180\n]\n[\n9x - 15 = 180\n]\n[\nx = \\frac{65}{3}\n]\n\n### Step 4: Use Angle Sums and Parallel Line Conditions\n\nWhen angles on a straight line or within a geometric figure relate to a parallel line condition, combine angle relationships to set up the equation.\n\nFor example:\n[\n(2x + 8) + (3x + 12) = 90\n]\n[\n5x + 20 = 90\n]\n[\nx = 14\n]\n\n### Step 5: Combine Vertical Angles with Alternate Exterior Angles\n\nUse vertical angle congruence together with the Alternate Exterior Angles Converse.\n\nFor example:\n[\n5x - 20 = 3x + 30\n]\n[\nx = 25\n]\n\n### Step 6: Use Corresponding Angles with Algebraic Expressions\n\n[\n7x + 5 = 9x - 15\n]\n[\nx = 10\n]\n\n### Step 7: Apply Triangle Angle Sum with Parallel Lines\n\nWhen a triangle is formed and one side must be parallel to a given line, use the triangle angle sum theorem together with corresponding angles.\n\nFor example:\n[\nx + 40 + 60 = 180\n]\n[\nx = 80\n]",
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
                    "## Example 3 — Apply Parallel Line Theorems to Real-World Problems\n\nUse the converse theorems for parallel lines to analyze and solve problems in real-world contexts.\n\n### Step 1: Books on a Shelf\n\nTwo books on a shelf each make the same angle with the base. Determine what can be concluded about the books.\n\nSince each book makes the same angle with the base, these are corresponding angles formed by the books with a common transversal (the base). By the Corresponding Angles Converse:\n[\n70^\\circ = 70^\\circ \\Rightarrow \\text{the books are parallel}\n]\n\n### Step 2: Patterns from Cutting a Rectangle\n\nA rectangle is cut along a slanted line and the two pieces are rearranged. Describe the shape of the new figure.\n\nBecause opposite sides of a rectangle are parallel and the cut creates congruent alternate interior angles, when the pieces are rearranged the matching angles ensure the new figure has two pairs of parallel sides. The resulting figure is a parallelogram.\n\n### Step 3: Fireworks Trajectories\n\nDesigners want fireworks to shoot along parallel trajectories from launchers at different heights. Determine what condition must be met for the trajectories to be parallel.\n\nFor the trajectories to be parallel, the angle that each trajectory makes with the horizontal must be equal. Using the Corresponding Angles Converse:\n[\nm\\angle 1 = \\text{the corresponding angle on the other launcher}\n]\n\n### Step 4: Constructing a Letter A\n\nFor the horizontal bar of a large letter A to be truly horizontal (parallel to the base), the angles where the diagonal sides meet the horizontal bar must satisfy certain conditions.\n\na. Angles 1 and 2 should each equal the base angles they correspond to, ensuring the horizontal bar is parallel to the base. By the Alternate Interior Angles Converse:\n[\nm\\angle 1 = m\\angle \\text{base angle}, \\quad m\\angle 2 = m\\angle \\text{base angle}\n]\n\nb. If angle 1 is correct but angle 2 is not, then the horizontal bar is not parallel to the base. The two diagonal sides are not symmetric, so the letter A is not perfectly formed.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: identifying parallel lines from angle relationships, finding values of variables that make lines parallel, applying parallel line theorems to real-world situations, and writing proofs. Problems include:\n\n- Completing a two-column proof of the Perpendicular Transversal Converse, given that two angles are complementary and one line is perpendicular to a transversal.\n- Writing a paragraph proof of the Alternate Interior Angles Converse from a given diagram.\n- Writing a paragraph proof of the Alternate Exterior Angles Converse from a given diagram.\n- Using a compass and straightedge to construct a line through a given point that is parallel to a given line.\n- Applying parallel line theorems to explain why opposite sides of a wooden picture frame with 45-degree cuts and right-angle corners are parallel.\n- Reasoning about how many corners of a rectangular frame must be checked to ensure opposite sides are parallel.\n- Finding and explaining errors in a student's reasoning about which lines are parallel based on a given pair of congruent angles.\n- Analyzing whether a theorem about parallel lines remains true when the two lines are not coplanar, and drawing a figure to justify the argument.\n- Creating a construction of a line parallel to one side of a triangle through the opposite vertex, and using measurements to justify that the constructed line is parallel.\n- Completing a two-column proof that if two lines are each parallel to a third line, then they are parallel to each other.\n- Exploring whether a pair of angles can be both supplementary and congruent, and explaining the reasoning.\n- Using given angle relationships in a diagram to prove that two lines are parallel, and then proving that a transversal is perpendicular to one of the lines.\n\n## Review Notes\n\n- Images referenced in the worksheet (angle diagrams for Example 1 problems 1–6 and the second diagram for problems 5–6, angle diagrams for Example 2 problems 7–13, bookshelf diagram for problem 14, rectangle cut pattern for problem 15, fireworks launcher diagram for problem 16, letter A sketch for problem 17, perpendicular transversal proof diagram for problem 18, alternate interior angles diagram for problem 19, alternate exterior angles diagram for problem 20, compass and straightedge construction diagrams for problems 21–22, picture frame diagram for problem 23, quadrilateral error-analysis diagram for problem 25, triangle construction diagram for problem 27, three-line proof diagram for problem 28, and final proof figure for problem 30) could not be fully described without visual reference. Teachers should consult the original worksheet for exact angle measures, labels, and diagrams.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-12-lesson-10",
        title: "Perpendiculars and Distance",
        orderIndex: 10,
        description:
          "Students find the distance from a point to a line, find the distance between parallel lines, and apply perpendicular distance concepts to real-world design and physics problems.",
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
                    "## Explore: What Is the Shortest Distance from a Point to a Line?\n\nStudents investigate why the perpendicular segment from a point to a line represents the shortest possible distance. Consider what happens if a non-perpendicular segment is drawn from the point to the line.\n\n**Inquiry Question:**\nWhy must the shortest distance from a point to a line always be measured along a perpendicular segment?",
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
                    "## Vocabulary\n\n- **Perpendicular Distance** — The shortest distance from a point to a line, measured along the segment perpendicular to the line.\n- **Parallel Lines** — Lines in the same plane that never intersect and are always the same distance apart.\n- **Equidistant** — Being the same distance from a given point or line.\n- **Slope** — The ratio of vertical change to horizontal change between two points on a line.\n- **Midpoint** — The point that divides a segment into two congruent segments.",
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
                    "## Learn: Distance from a Point to a Line and Between Parallel Lines\n\nThe distance from a point to a line is the length of the perpendicular segment from the point to the line. In the coordinate plane, this can be found using the slope of the given line, the slope of the perpendicular line, and the intersection point of the two lines. The distance between two parallel lines is the length of any perpendicular segment connecting them.\n\n### Key Concept: Distance from a Point to a Line\n\n- Find the slope of the given line.\n- Determine the slope of the perpendicular line (negative reciprocal).\n- Write the equation of the perpendicular line passing through the given point.\n- Find the intersection point of the two lines by solving the system.\n- Use the distance formula to find the length of the perpendicular segment from the point to the intersection point.\n\n### Key Concept: Distance Between Parallel Lines\n\n- Rewrite both equations in the same form (slope-intercept or standard form) to confirm they are parallel.\n- Choose any point on one of the lines.\n- Find the perpendicular distance from that point to the other line using the point-to-line distance method.\n- Alternatively, for lines in standard form [Ax + By + C = 0], use the formula:\n[\nd = \\frac{|C_2 - C_1|}{\\sqrt{A^2 + B^2}}\n]\nwhen the lines have the same [A] and [B] coefficients.",
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
                    "## Example 1 — Find the Distance from a Point to a Line (Slanted Lines)\n\nFind the perpendicular distance from a given point to a line defined by two points in the coordinate plane.\n\n### Step 1: Find the Slope of the Given Line\n\nUse the two given points on the line to calculate its slope.\n\nFor a line through [(0, -3)] and [(7, 4)]:\n[\nm = \\frac{4 - (-3)}{7 - 0} = \\frac{7}{7} = 1\n]\n\nFor a line through [(11, -1)] and [(-3, -11)]:\n[\nm = \\frac{-11 - (-1)}{-3 - 11} = \\frac{-10}{-14} = \\frac{5}{7}\n]\n\n### Step 2: Find the Slope of the Perpendicular Line\n\nTake the negative reciprocal of the original slope.\n\nIf the original slope is [1], the perpendicular slope is:\n[\nm_{\\perp} = -1\n]\n\nIf the original slope is [\\frac{5}{7}], the perpendicular slope is:\n[\nm_{\\perp} = -\\frac{7}{5}\n]\n\n### Step 3: Write the Equation of the Perpendicular Line\n\nUse point-slope form with the given point and the perpendicular slope.\n\nThrough point [(4, 3)] with slope [-1]:\n[\ny - 3 = -1(x - 4)\n]\n[\ny = -x + 7\n]\n\nThrough point [(-1, 1)] with slope [-\\frac{7}{5}]:\n[\ny - 1 = -\\frac{7}{5}(x + 1)\n]\n\n### Step 4: Find the Intersection Point\n\nSolve the system of the original line and the perpendicular line.\n\nOriginal: [y = x - 3]\nPerpendicular: [y = -x + 7]\n[\nx - 3 = -x + 7\n]\n[\n2x = 10\n]\n[\nx = 5, \\quad y = 2\n]\n\nIntersection point: [(5, 2)]\n\n### Step 5: Apply the Distance Formula\n\nFind the distance between the given point and the intersection point.\n\nFrom [(4, 3)] to [(5, 2)]:\n[\nd = \\sqrt{(5 - 4)^2 + (2 - 3)^2} = \\sqrt{1 + 1} = \\sqrt{2}\n]\n\nFrom [(-1, 1)] to the intersection point:\n[\nd = \\sqrt{(x_2 + 1)^2 + (y_2 - 1)^2}\n]",
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
                    "## Example 2 — Find the Distance from a Point to a Horizontal or Vertical Line\n\nFind the perpendicular distance when the given line is horizontal or vertical.\n\n### Step 1: Identify Horizontal or Vertical Lines\n\nA horizontal line has the form [y = k] and slope [0].\nA vertical line has the form [x = k] and undefined slope.\n\nFor a horizontal line through [(-2, 1)] and [(4, 1)]:\n[\ny = 1\n]\n\nFor a vertical line through [(4, -1)] and [(4, 9)]:\n[\nx = 4\n]\n\n### Step 2: Find the Perpendicular Distance\n\nFor a horizontal line, the perpendicular distance is the absolute difference of the [y]-coordinates.\n\nFrom point [(5, 7)] to line [y = 1]:\n[\nd = |7 - 1| = 6\n]\n\nFrom point [(-2, 4)] to line [y = 1]:\n[\nd = |4 - 1| = 3\n]\n\nFor a vertical line, the perpendicular distance is the absolute difference of the [x]-coordinates.\n\nFrom point [(1, 6)] to line [x = 4]:\n[\nd = |1 - 4| = 3\n]\n\n### Step 3: Apply the Full Method for Oblique Lines\n\nFor a slanted line through [(1, 5)] and [(4, -4)]:\n[\nm = \\frac{-4 - 5}{4 - 1} = \\frac{-9}{3} = -3\n]\n[\nm_{\\perp} = \\frac{1}{3}\n]\n\nWrite the perpendicular through [(-1, 1)], find the intersection with the original line, then apply the distance formula.",
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
                    "## Example 3 — Find the Distance Between Parallel Lines\n\nFind the distance between pairs of parallel lines given their equations.\n\n### Step 1: Verify the Lines Are Parallel\n\nConfirm both lines have the same slope.\n\nFor [y = 7] and [y = -1]:\nBoth are horizontal with slope [0].\n\nFor [x = -6] and [x = 5]:\nBoth are vertical with undefined slope.\n\nFor [y = 3x] and [y = 3x + 10]:\nBoth have slope [3].\n\nFor [y = -5x] and [y = -5x + 26]:\nBoth have slope [-5].\n\nFor [y = x + 9] and [y = x + 3]:\nBoth have slope [1].\n\nFor [y = -2x + 5] and [y = -2x - 5]:\nBoth have slope [-2].\n\n### Step 2: Find the Distance Between Horizontal Lines\n\nFor [y = 7] and [y = -1]:\n[\nd = |7 - (-1)| = 8\n]\n\n### Step 3: Find the Distance Between Vertical Lines\n\nFor [x = -6] and [x = 5]:\n[\nd = |5 - (-6)| = 11\n]\n\n### Step 4: Find the Distance Between Slanted Lines\n\nFor [y = 3x] and [y = 3x + 10]:\n\nChoose a point on the first line, such as [(0, 0)].\nRewrite the second line in standard form:\n[\n3x - y + 10 = 0\n]\n\nUse the point-to-line distance formula:\n[\nd = \\frac{|3(0) - 1(0) + 10|}{\\sqrt{3^2 + (-1)^2}} = \\frac{10}{\\sqrt{10}} = \\sqrt{10}\n]\n\nFor [y = -5x] and [y = -5x + 26]:\n\nChoose [(0, 0)] on the first line.\nStandard form of second line: [5x + y - 26 = 0]\n[\nd = \\frac{|5(0) + 1(0) - 26|}{\\sqrt{5^2 + 1^2}} = \\frac{26}{\\sqrt{26}} = \\sqrt{26}\n]\n\nFor [y = x + 9] and [y = x + 3]:\n\nChoose [(0, 9)] on the first line.\nStandard form of second line: [x - y + 3 = 0]\n[\nd = \\frac{|0 - 9 + 3|}{\\sqrt{1^2 + (-1)^2}} = \\frac{6}{\\sqrt{2}} = 3\\sqrt{2}\n]\n\nFor [y = -2x + 5] and [y = -2x - 5]:\n\nChoose [(0, 5)] on the first line.\nStandard form of second line: [2x + y + 5 = 0]\n[\nd = \\frac{|2(0) + 5 + 5|}{\\sqrt{2^2 + 1^2}} = \\frac{10}{\\sqrt{5}} = 2\\sqrt{5}\n]\n\n### Step 5: Find the Distance with Fractional Slopes\n\nFor [y = \\frac{1}{4}x + 2] and [4y - x = -60] (which becomes [y = \\frac{1}{4}x - 15]):\n\nBoth have slope [\\frac{1}{4}].\nChoose [(0, 2)] on the first line.\nStandard form of second line: [x - 4y - 60 = 0]\n[\nd = \\frac{|0 - 4(2) - 60|}{\\sqrt{1^2 + (-4)^2}} = \\frac{68}{\\sqrt{17}} = 4\\sqrt{17}\n]\n\nFor [3x + y = 3] (which becomes [y = -3x + 3]) and [y + 17 = -3x] (which becomes [y = -3x - 17]):\n\nBoth have slope [-3].\nChoose [(0, 3)] on the first line.\nStandard form of second line: [3x + y + 17 = 0]\n[\nd = \\frac{|3(0) + 3 + 17|}{\\sqrt{3^2 + 1^2}} = \\frac{20}{\\sqrt{10}} = 2\\sqrt{10}\n]\n\nFor [y = -\\frac{5}{4}x + 3.5] and [4y + 10.6 = -5x] (which becomes [y = -\\frac{5}{4}x - 2.65]):\n\nBoth have slope [-\\frac{5}{4}].\nChoose [(0, 3.5)] on the first line.\nStandard form of second line: [5x + 4y + 10.6 = 0]\n[\nd = \\frac{|5(0) + 4(3.5) + 10.6|}{\\sqrt{5^2 + 4^2}} = \\frac{24.6}{\\sqrt{41}} = \\frac{123}{5\\sqrt{41}} = \\frac{123\\sqrt{41}}{205}\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: finding the perpendicular distance from a point to a line, finding the distance between parallel lines, and applying these concepts to real-world situations and geometric reasoning. Problems include:\n\n- Finding the distance from a given point to a horizontal line, a line with fractional slope, and a vertical line.\n- Applying perpendicular distance to determine whether telephone wires are parallel by measuring perpendicular distances at different points.\n- Using perpendicular distance to verify whether a park entrance meets a minimum distance requirement from a street represented on a coordinate plane.\n- Constructing a perpendicular line from a given point to a given line or segment using a compass and straightedge.\n- Reasoning about whether a path represents the shortest possible distance from a starting point to an ending point.\n- Finding endpoint coordinates of perpendicular segments given slopes and midpoints.\n- Explaining what it means when the distance from a point to a line is zero, or when the distance between two lines is zero.\n- Completing a two-column proof that if two lines are each equidistant from a third line, then they are parallel to each other.\n- Summarizing the steps needed to find the distance between parallel lines given their equations.\n- Solving for an unknown coordinate given the distance between parallel lines and points where a perpendicular transversal intersects them.\n- Analyzing whether the distance between a line and a plane can always be found.\n- Creating and justifying a perpendicular construction in an irregular convex pentagon.\n- Rewriting a theorem about equidistant lines in terms of planes and sketching an example.\n- Finding the error in a claim about whether two drawn segments, if extended, would intersect or remain parallel.\n\n## Review Notes\n\n- Images referenced in the worksheet (telephone wires diagram, geometric construction diagrams, golf path diagram, segments for error analysis) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and visual details.\n- The worksheet groups problems 1–6 and 7–8 under \"Examples 1 and 2\" and problems 9–17 under \"Example 3.\"\n- The two-column proof in problem 28 references Theorem 3.24, which states that two lines equidistant from a third line are parallel to each other.",
                },
              },
            ],
          },
        ],
      },
    ];

    const results = [];

    for (const lessonData of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lessonData.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 12,
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
      let activitiesCreated = 0;

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
        slug: lessonData.slug,
      });
    }

    return { lessons: results };
  },
});