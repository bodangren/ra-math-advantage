import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-4-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "nth Roots and Rational Exponents",
          slug: lessonSlug,
          description: "Students simplify expressions involving radicals and rational exponents, and convert between exponential and radical forms.",
          orderIndex: 3,
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
          title: "nth Roots and Rational Exponents",
          description: "Students simplify expressions involving radicals and rational exponents, and convert between exponential and radical forms.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
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
              markdown: "## Explore: Inverses of Power Functions\n\nUse a calculator to complete the explore.\n\n**Inquiry Question:**\nWhat conjectures can you make about $f(x) = x^n$ and $g(x) = \\sqrt[n]{x}$ for all odd positive values of $n$?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = x^3",
                title: "Explore nth Roots",
              },
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
              markdown: "## Key Terms\n\n- **nth root**: The number $a$ such that $a^n = b$\n- **index**: The number $n$ in $\\sqrt[n]{b}$\n- **radicand**: The number $b$ under the radical symbol\n- **principal root**: The nonnegative root when there are both positive and negative roots\n- **rational exponent**: An exponent that is a fraction, such as $\\frac{1}{2}$ or $\\frac{3}{4}$",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: nth Roots",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## nth Roots\n\nFinding a square root and squaring are inverse operations.\n\nMore generally, the inverse of raising a number to the $n$th power is finding the $n$th root.\n\nFor any real numbers $a$ and $b$ and positive integer $n$:\n\n- if $a^n = b$, then $a$ is an $n$th root of $b$\n\n### Key Concept: Real nth Roots\n\nSuppose $n > 1$ and $a$ is a real number.\n\n- If $n$ is even and $a > 0$, there is one positive and one negative real root: $\\pm \\sqrt[n]{a}$\n- If $n$ is even and $a < 0$, there are no real roots\n- If $n$ is odd and $a > 0$, there is one positive real root\n- If $n$ is odd and $a < 0$, there is one negative real root\n- If $a = 0$, then the root is $0$\n\nA radical expression is simplified when:\n- the radicand contains no fractions\n- no radicals appear in the denominator",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 1 — Find Roots\n\nSimplify.\n\n### a. $\\pm \\sqrt{25x^4}$\n\n$\\pm \\sqrt{(5x^2)^2} = \\pm 5x^2$\n\n### b. $-\\sqrt{(y^2 + 7)^{12}}$\n\n$= -\\sqrt{[(y^2 + 7)^6]^2} = -(y^2 + 7)^6$\n\n### c. $\\sqrt[3]{343a^{18}b^6}$\n\n$= \\sqrt[3]{(7a^6b^2)^3} = 7a^6b^2$\n\n### d. $\\sqrt{-289c^8d^4}$\n\nThere are no real roots of $\\sqrt{-289}$, but the principal square root is imaginary:\n\n$\\sqrt{-289c^8d^4} = 17ic^4d^2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "sqrt(25x^4)",
                steps: [
                  { expression: "Recognize perfect square", explanation: "25x^4 = (5x^2)^2" },
                  { expression: "Apply square root", explanation: "sqrt((5x^2)^2) = |5x^2| = 5x^2 (for real x)" },
                  { expression: "Consider both signs", explanation: "±sqrt(25x^4) = ±5x^2" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 2 — Simplify Using Absolute Value\n\nWhen you find an even root of an even power and the result is an odd power, use absolute value to keep the principal root nonnegative.\n\n### a. $\\sqrt[4]{81x^4}$\n\n$= \\sqrt[4]{(3x)^4} = 3|x|$\n\n### b. $\\sqrt[8]{256(y^2 - 2)^{24}}$\n\n$= \\sqrt[8]{256} \\cdot \\sqrt[8]{(y^2 - 2)^{24}}$\n\n$= 2 |(y^2 - 2)^3|$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "sqrt[4](81x^4)",
                steps: [
                  { expression: "Recognize perfect fourth power", explanation: "81x^4 = (3x)^4" },
                  { expression: "Apply fourth root", explanation: "sqrt[4]((3x)^4) = |3x|" },
                  { expression: "Simplify absolute value", explanation: "|3x| = 3|x|" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Rational Exponents",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Rational Exponents\n\nYou can translate between radical and exponential form using exponent properties.\n\nFor any real number $b$ and positive integer $n$:\n\n- $b^{1/n} = \\sqrt[n]{b}$\n\nexcept when $b < 0$ and $n$ is even.\n\n### Key Concept: Rational Exponents\n\nFor nonzero $b$ and integers $x$, $y$ with $y > 1$:\n\n$$b^{x/y} = \\sqrt[y]{b^x} = (\\sqrt[y]{b})^x$$\n\nExamples:\n\n- $125^{2/3} = (\\sqrt[3]{125})^2 = 25$\n- $(-49)^{3/2} = (\\sqrt{-49})^3 = (7i)^3 = -343i$\n\n### Key Concept: Simplest Form of Expressions with Rational Exponents\n\nAn expression is in simplest form when:\n\n- it has no negative exponents\n- it has no non-integer exponents in the denominator\n- it is not a complex fraction\n- any remaining radical has the least possible index",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3 — Radical and Exponential Forms\n\nSimplify.\n\n### a. Write $x^{4/3}$ in radical form\n\n$$x^{4/3} = \\sqrt[3]{x^4}$$\n\n### b. Write $\\sqrt[5]{x^2}$ in exponential form\n\n$$\\sqrt[5]{x^2} = x^{2/5}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x^(4/3)",
                steps: [
                  { expression: "Apply rational exponent rule", explanation: "b^(x/y) = y-root(b^x)" },
                  { expression: "x^(4/3) = sqrt[3](x^4)", explanation: "Denominator becomes root index" },
                  { expression: "Can also write as (sqrt[3](x))^4", explanation: "Alternative form" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4 — Use Rational Exponents\n\nThe expression $c(1 + r)^t$ estimates future cost due to inflation.\n\nWrite the expression in radical form for an item $3$ months from now if the annual inflation rate is $4.7\\%$.\n\nSince $3$ months is $\\frac{1}{4}$ year:\n\n$$c(1 + r)^t = c(1 + 0.047)^{1/4}$$\n\n$$= c(1.047)^{1/4}$$\n\n$$= c \\cdot \\sqrt[4]{1.047}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "c(1.047)^(1/4)",
                steps: [
                  { expression: "Convert time to years", explanation: "3 months = 3/12 = 1/4 year" },
                  { expression: "Apply exponent t = 1/4", explanation: "c(1 + 0.047)^(1/4)" },
                  { expression: "Convert to radical form", explanation: "c * fourth-root(1.047)" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5 — Evaluate Expressions with Rational Exponents\n\nEvaluate:\n\n$$32^{-2/5}$$\n\n$$= \\frac{1}{32^{2/5}}$$\n\n$$= \\frac{1}{(2^5)^{2/5}}$$\n\n$$= \\frac{1}{2^2}$$\n\n$$= \\frac{1}{4}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "32^(-2/5)",
                steps: [
                  { expression: "Apply negative exponent rule", explanation: "b^(-n) = 1/b^n" },
                  { expression: "= 1/32^(2/5)", explanation: "Rewrite with positive exponent" },
                  { expression: "= 1/(2^5)^(2/5)", explanation: "Write 32 as 2^5" },
                  { expression: "= 1/2^2", explanation: "Apply (b^x)^y = b^(xy)" },
                  { expression: "= 1/4", explanation: "Simplify" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6 — Simplify Expressions with Rational Exponents\n\n### a. $x^{2/3} \\cdot x^{1/6}$\n\n$= x^{2/3 + 1/6}$\n\n$= x^{4/6 + 1/6}$\n\n$= x^{5/6}$\n\n### b. $y^{-2/3}$\n\n$= \\frac{1}{y^{2/3}}$\n\n### c. $z^{-1/3} \\cdot z^{3/4}$\n\n$= z^{-1/3 + 3/4}$\n\n$= z^{-4/12 + 9/12}$\n\n$= z^{5/12}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x^(2/3) * x^(1/6)",
                steps: [
                  { expression: "Add exponents", explanation: "b^m * b^n = b^(m+n)" },
                  { expression: "2/3 + 1/6 = 4/6 + 1/6 = 5/6", explanation: "Find common denominator" },
                  { expression: "= x^(5/6)", explanation: "Simplify exponent" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How do you determine the sign of an $n$th root?\n2. When do you need to use absolute value when simplifying radical expressions?\n3. How do you convert between rational exponent form and radical form?\n4. Why does $\\sqrt[n]{b^x} = (\\sqrt[n]{b})^x$?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "What is the value of 16^(3/4)?",
                    options: [
                      "8",
                      "12",
                      "6",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "The expression x^(2/3) in radical form is:",
                    options: [
                      "sqrt(x^3)",
                      "cuberoot(x^2)",
                      "sqrt[3](x)^2",
                    ],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about $n$th roots and rational exponents. Consider the following:\n\n- How does understanding the relationship between radicals and exponents help you simplify expressions?\n- What strategies help you remember when to use absolute value with even roots?\n- What questions do you still have about rational exponents and their simplified forms?\n\n**Tip**: When converting between radical and rational exponent forms, remember that the denominator of the exponent becomes the index of the radical.",
            },
          },
        ],
      },
    ];

    let phasesCreated = 0;
    let activitiesCreated = 0;

    for (const phase of phaseData) {
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
          const activityContent = section.content as {
            componentKey: string;
            props: Record<string, unknown>;
          };

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props,
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

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});