import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-5-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Solving Exponential Equations and Inequalities",
          slug: lessonSlug,
          description: "Students solve exponential equations and inequalities in one variable.",
          orderIndex: 2,
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
          title: "Solving Exponential Equations and Inequalities",
          description: "Students solve exponential equations and inequalities in one variable.",
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
              markdown:
                "## Explore: Solving Exponential Equations\n\nUse the interactive tool to complete the explore.\n\n**Inquiry Question:**\nHow can you rewrite expressions to solve exponential equations?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = b^x",
                title: "Exponential Equations",
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
              markdown:
                "## Key Terms\n\n- **Exponential equation**: An equation in which the independent variable is an exponent\n- **Compound interest**: Interest calculated on both the initial principal and accumulated interest\n- **Exponential inequality**: An inequality in which the independent variable is an exponent",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Solving Exponential Equations",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Exponential Equations\n\nIn an **exponential equation**, the independent variable is an exponent.\n\n### Key Concept: Property of Equality for Exponential Equations\n\nIf $b > 0$ and $b \\neq 1$, then:\n\n$$b^x = b^y \\text{ if and only if } x = y$$\n\nExponential equations can be solved algebraically or by graphing a system.\n\n### Key Concept: Compound Interest\n\nCompound interest is calculated with:\n\n$$A = P(1 + r/n)^{nt}$$\n\nwhere:\n\n- $A$ is the amount after $t$ years\n- $P$ is the principal\n- $r$ is the annual interest rate\n- $n$ is the number of compounding periods per year",
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
              markdown:
                "## Example 1 — Solve Exponential Equations Algebraically\n\nSolve each equation.\n\n### Part a: $4^{5x + 1} = 64^7$\n\nRewrite:\n\n- $64 = 4^3$\n\nSo:\n\n$$4^{5x + 1} = (4^3)^7 = 4^{21}$$\n\nThen:\n\n$$5x + 1 = 21$$\n\n$$5x = 20$$\n\n$$x = 4$$\n\n### Part b: $(1/2)^{4x - 16} = 16^{2x - 5}$\n\nRewrite in base $2$:\n\n- $(1/2) = 2^{-1}$\n- $16 = 2^4$\n\nSo:\n\n$$(2^{-1})^{4x - 16} = (2^4)^{2x - 5}$$\n\n$$2^{-4x + 16} = 2^{8x - 20}$$\n\nThen:\n\n$$-4x + 16 = 8x - 20$$\n\n$$-12x = -36$$\n\n$$x = 3$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "4^(5x+1) = 64^7",
                steps: [
                  { expression: "64 = 4^3", explanation: "Rewrite 64 with base 4" },
                  { expression: "4^(5x+1) = (4^3)^7", explanation: "Substitute the rewritten form" },
                  { expression: "4^(5x+1) = 4^21", explanation: "Apply power of a power rule" },
                  { expression: "5x + 1 = 21", explanation: "Using property of equality: if b^x = b^y, then x = y" },
                  { expression: "5x = 20", explanation: "Subtract 1 from both sides" },
                  { expression: "x = 4", explanation: "Divide both sides by 5" },
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
              markdown:
                "## Example 2 — Solve an Exponential Equation by Graphing\n\nA Super Bowl ad cost can be modeled by:\n\n$$C = 0.058(1.099)^x$$\n\nwhere $C$ is in millions of dollars and $x$ is the Super Bowl number.\n\n\nFind when the cost first surpassed $1 million.\n\n### Part A: Write the model\n\nInitial cost:\n\n$$58{,}000 = 0.058 \\text{ million}$$\n\n\nGrowth rate:\n\n\n$$9.9\\% = 0.099$$\n\nSo:\n\n$$C = 0.058(1.099)^x$$\n\n### Part B: Solve by graphing\n\nSet up the system:\n\n- $y = 1$\n- $y = 0.058(1.099)^x$\n\nThe intersection is at about:\n\n$$x \\approx 30.16$$\n\nSo the cost had not yet surpassed $1 million during Super Bowl $30$.\n\nIt first surpassed $1 million during **Super Bowl 31**.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "C = 0.058(1.099)^x, find when C > 1",
                steps: [
                  { expression: "Initial cost: 0.058 million", explanation: "Convert $58,000 to millions" },
                  { expression: "Growth rate: 0.099", explanation: "Convert 9.9% to decimal" },
                  { expression: "Set up y = 1 and y = 0.058(1.099)^x", explanation: "System to solve" },
                  { expression: "Intersection at x ≈ 30.16", explanation: "Solve using technology" },
                  { expression: "Super Bowl 30: C < 1 million", explanation: "At x = 30, cost has not surpassed $1 million" },
                  { expression: "Super Bowl 31: C > 1 million", explanation: "First time cost surpasses $1 million" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Use the Compound Interest Formula\n\nLuciana deposits $1700 into a savings account paying $1.8\\%$ annual interest compounded monthly.\n\nFind the balance after $5$ years.\n\n$$A = P(1 + r/n)^{nt}$$\n\n$$= 1700(1 + 0.018/12)^{12 \\cdot 5}$$\n\n$$\\approx 1859.97$$\n\nSo after $5$ years, the balance is about:\n\n**$1859.97**",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "A = 1700(1 + 0.018/12)^(12*5)",
                steps: [
                  { expression: "P = 1700, r = 0.018, n = 12, t = 5", explanation: "Identify given values" },
                  { expression: "A = 1700(1 + 0.018/12)^(12*5)", explanation: "Substitute into compound interest formula" },
                  { expression: "1 + 0.018/12 = 1.0015", explanation: "Calculate monthly rate" },
                  { expression: "(1.0015)^60 ≈ 1.0941", explanation: "Calculate compound factor" },
                  { expression: "A ≈ 1700 × 1.0941 ≈ 1859.97", explanation: "Multiply to find final amount" },
                  { expression: "Balance after 5 years: $1859.97", explanation: "Result" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Solving Exponential Inequalities",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Solving Exponential Inequalities\n\nAn **exponential inequality** is an inequality in which the independent variable is an exponent.\n\n### Key Concept: Property of Inequality for Exponential Equations\n\nIf $b > 1$, then:\n\n- $b^x > b^y$ if and only if $x > y$\n- $b^x < b^y$ if and only if $x < y$",
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
              markdown:
                "## Example 4 — Solve Exponential Inequalities Algebraically\n\nSolve:\n\n$$27^{2x + 6} \\geq 81^{x - 5}$$\n\nRewrite with base $3$:\n\n- $27 = 3^3$\n- $81 = 3^4$\n\nSo:\n\n$$(3^3)^{2x + 6} \\geq (3^4)^{x - 5}$$\n\n$$3^{6x + 18} \\geq 3^{4x - 20}$$\n\nThus:\n\n$$6x + 18 \\geq 4x - 20$$\n\n$$2x \\geq -38$$\n\n$$x \\geq -19$$\n\nSolution set:\n\n$$\\{x \\mid x \\geq -19\\}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "27^(2x+6) >= 81^(x-5)",
                steps: [
                  { expression: "27 = 3^3", explanation: "Rewrite 27 with base 3" },
                  { expression: "81 = 3^4", explanation: "Rewrite 81 with base 3" },
                  { expression: "(3^3)^(2x+6) >= (3^4)^(x-5)", explanation: "Substitute the rewritten forms" },
                  { expression: "3^(6x+18) >= 3^(4x-20)", explanation: "Apply power of a power rule" },
                  { expression: "6x + 18 >= 4x - 20", explanation: "Using property of inequality for exponential equations" },
                  { expression: "2x >= -38", explanation: "Isolate x terms" },
                  { expression: "x >= -19", explanation: "Divide both sides by 2" },
                  { expression: "Solution set: {x | x >= -19}", explanation: "Express in interval notation or set notation" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How do you determine which base to use when rewriting exponential equations?\n2. Why is it important to check the sign of the base when solving exponential inequalities?\n3. How does the compound interest formula relate to exponential functions?",
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
                    question: "To solve 4^(5x+1) = 64^7, what base should you rewrite 64 as?",
                    options: ["2", "4", "8"],
                    correctIndex: 1,
                  },
                  {
                    question: "If b > 1 and b^x < b^y, what can you conclude about x and y?",
                    options: ["x < y", "x > y", "x = y"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about solving exponential equations and inequalities. Consider the following:\n\n- How does the property of equality for exponential equations help you solve equations?\n- What strategies help you choose the correct base when rewriting exponential expressions?\n- How does solving exponential inequalities differ from solving exponential equations?\n\n**Tip**: When solving exponential inequalities, remember that if $0 < b < 1$, the inequality direction reverses when comparing exponents.",
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
