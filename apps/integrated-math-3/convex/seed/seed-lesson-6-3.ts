import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-6-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Common Logarithms",
          slug: lessonSlug,
          description: "Students solve exponential equations by using common logarithms and evaluate logarithmic expressions by using the Change of Base Formula.",
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
          title: "Common Logarithms",
          description: "Students solve exponential equations by using common logarithms and evaluate logarithmic expressions by using the Change of Base Formula.",
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
                "## Explore: Common Logarithms and Exponential Equations\n\nUse the interactive tool to complete the explore.\n\n**Inquiry Question:**\nHow can you use common logarithms to solve exponential equations?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = log(x)",
                title: "Common Logarithms",
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
                "## Key Terms\n\n- **Common logarithm**: A logarithm with base 10, usually written without the subscript 10.\n- **Change of Base Formula**: A formula that allows you to write equivalent logarithmic expressions with different bases.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Common Logarithms",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Common Logarithms\n\nBase `10` logarithms are called **common logarithms** and are usually written without the subscript `10`.\n\n`log10 x = log x`, for `x > 0`\n\nThe common logarithm function can be evaluated with a calculator.\n\nCommon logarithms of numbers that differ by powers of ten are closely related:\n\n- `log 1 = 0` because `10^0 = 1`\n- `log 10 = 1` because `10^1 = 10`\n- `log 100 = 2` because `10^2 = 100`\n- `log 10^m = m`\n\n### Think About It\n\nDescribe the meaning of `log 8 ≈ 0.9031` in the context of exponents and the definition of a common logarithm.",
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
                "## Example 1 — Find Common Logarithms by Using Technology\n\nUse a calculator to evaluate `log 8` to the nearest ten-thousandth.\n\n`log 8 ≈ 0.9031`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log 8",
                steps: [
                  { expression: "log 8", explanation: "Start with the common logarithm expression" },
                  { expression: "log 8 ≈ 0.9031", explanation: "Use a calculator to evaluate to the nearest ten-thousandth" },
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
                "## Example 2 — Solve a Logarithmic Equation by Using Exponential Form\n\nThe amount of energy `E` in ergs released by an earthquake is related to its Richter scale magnitude `M` by:\n\n`log E = 11.8 + 1.5M`\n\nAn earthquake in Cyprus in `1222` is estimated to have measured `7` on the Richter scale. How much energy was released?\n\nSubstitute `M = 7`:\n\n`log E = 11.8 + 1.5(7)`\n\n`log E = 22.3`\n\nWrite in exponential form:\n\n`E = 10^22.3`\n\nUse a calculator:\n\n`E ≈ 2 * 10^22`\n\nSo the earthquake released approximately `2 * 10^22` ergs of energy.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log E = 11.8 + 1.5M",
                steps: [
                  { expression: "log E = 11.8 + 1.5(7)", explanation: "Substitute M = 7 into the equation" },
                  { expression: "log E = 22.3", explanation: "Simplify the right side" },
                  { expression: "E = 10^{22.3}", explanation: "Rewrite in exponential form" },
                  { expression: "E ≈ 2 × 10^{22}", explanation: "Use a calculator to evaluate" },
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
                "## Example 3 — Solve an Exponential Equation by Using Logarithms\n\nSolve:\n\n`11^x = 101`\n\nRound to the nearest ten-thousandth.\n\nTake the common logarithm of both sides:\n\n`log 11^x = log 101`\n\nUse the Power Property:\n\n`x log 11 = log 101`\n\nSolve for `x`:\n\n`x = log 101 / log 11`\n\n`x ≈ 1.9247`\n\n### Check\n\nThe solution can also be checked graphically by comparing `y = 11^x` and `y = 101`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "11^x = 101",
                steps: [
                  { expression: "11^x = 101", explanation: "Start with the exponential equation" },
                  { expression: "log 11^x = log 101", explanation: "Take the common logarithm of both sides" },
                  { expression: "x log 11 = log 101", explanation: "Apply the Power Property of Logarithms" },
                  { expression: "x = log 101 / log 11", explanation: "Divide both sides by log 11" },
                  { expression: "x ≈ 1.9247", explanation: "Evaluate with a calculator" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Solve an Exponential Inequality by Using Logarithms\n\nSolve:\n\n`6^(2y - 5) < 5^(3y)`\n\nRound to the nearest ten-thousandth.\n\nTake common logarithms:\n\n`log(6^(2y - 5)) < log(5^(3y))`\n\nApply the Power Property:\n\n`(2y - 5) log 6 < 3y log 5`\n\nDistribute:\n\n`2y log 6 - 5 log 6 < 3y log 5`\n\nMove the `y`-terms:\n\n`-5 log 6 < y(3 log 5 - 2 log 6)`\n\nSolve:\n\n`(-5 log 6) / (3 log 5 - 2 log 6) < y`\n\n`y > -7.1970`\n\n### Watch Out\n\nWhen multiplying or dividing an inequality by a negative value, the inequality sign reverses. Evaluate expressions if needed to confirm the sign.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "6^{2y - 5} < 5^{3y}",
                steps: [
                  { expression: "log(6^{2y - 5}) < log(5^{3y})", explanation: "Take common logarithms of both sides" },
                  { expression: "(2y - 5) log 6 < 3y log 5", explanation: "Apply the Power Property" },
                  { expression: "2y log 6 - 5 log 6 < 3y log 5", explanation: "Distribute log 6 on the left side" },
                  { expression: "-5 log 6 < y(3 log 5 - 2 log 6)", explanation: "Collect y-terms on the right side" },
                  { expression: "y > (-5 log 6) / (3 log 5 - 2 log 6)", explanation: "Divide; the denominator is positive, so inequality direction stays the same" },
                  { expression: "y > -7.1970", explanation: "Evaluate with a calculator" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Learn: Change of Base Formula",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Change of Base Formula\n\nThe Change of Base Formula allows you to write equivalent logarithmic expressions with different bases.\n\n### Key Concept: Change of Base Formula\n\nFor positive numbers `a`, `b`, and `n`, where `a ≠ 1` and `b ≠ 1`:\n\n`log_a n = log_b n / log_b a`\n\nA common choice is to rewrite in terms of common logarithms:\n\n`log_a n = log n / log a`\n\n### Talk About It\n\nIs it possible to evaluate `log_π 5`? Explain.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Change of Base Formula\n\nEvaluate `log2 11` by writing it in terms of common logarithms. Round to the nearest ten-thousandth.\n\n`log2 11 = log 11 / log 2`\n\n`≈ 3.4594`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "log_2 11",
                steps: [
                  { expression: "log_2 11 = log 11 / log 2", explanation: "Apply the Change of Base Formula with common logarithms" },
                  { expression: "≈ 3.4594", explanation: "Evaluate with a calculator" },
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
              markdown:
                "## Example 6 — Use the Change of Base Formula\n\nThe musical cent is a unit of relative pitch. One octave consists of `1200` cents. The formula for the difference `n` in cents between two notes with beginning frequency `a` and ending frequency `b` is:\n\n`n = 1200(log2(a/b))`\n\nFind the frequency of pitch `a` if pitch `b` is `1661.22` and the difference between the pitches is `1600` cents.\n\n### Step 1: Write the equation in terms of common logarithms\n\nSubstitute the known values:\n\n`1600 = 1200(log2(a/1661.22))`\n\nDivide by `1200`:\n\n`4/3 = log2(a/1661.22)`\n\nUse Change of Base:\n\n`4/3 = log(a/1661.22) / log 2`\n\n### Step 2: Use a graphing calculator to solve for `a`\n\nGraph `y = 4/3` and `y = log(a/1661.22) / log 2`.\n\nThe functions intersect at approximately `a = 4186.0121`.\n\nSo pitch `a` has a frequency of about `4186.01` hertz.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "n = 1200(log_2(a/1661.22))",
                steps: [
                  { expression: "1600 = 1200(log_2(a/1661.22))", explanation: "Substitute known values n = 1600 and b = 1661.22" },
                  { expression: "4/3 = log_2(a/1661.22)", explanation: "Divide both sides by 1200" },
                  { expression: "4/3 = log(a/1661.22) / log 2", explanation: "Apply the Change of Base Formula" },
                  { expression: "a ≈ 4186.01", explanation: "Solve using a graphing calculator" },
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
              markdown:
                "## Discussion Questions\n\n1. Why are common logarithms useful for solving exponential equations?\n2. When would you use the Change of Base Formula?\n3. How can you check whether a solution to an exponential inequality is reasonable?",
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
                    question: "What is the approximate value of log 8 to the nearest ten-thousandth?",
                    options: ["0.8031", "0.9031", "1.9031"],
                    correctIndex: 1,
                  },
                  {
                    question: "Which expression is equivalent to log_2 11 using the Change of Base Formula?",
                    options: ["log 2 / log 11", "log 11 / log 2", "11 / log 2"],
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
              markdown:
                "## Reflection\n\nToday you learned about common logarithms and the Change of Base Formula. Consider the following:\n\n- How do you solve exponential equations using common logarithms?\n- When is the Change of Base Formula helpful?\n- What questions do you still have about common logarithms?",
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
