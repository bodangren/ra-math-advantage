import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-6-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Using Exponential and Logarithmic Functions",
          slug: lessonSlug,
          description:
            "Students write and solve exponential growth equations and inequalities, and write and solve exponential decay equations.",
          orderIndex: 5,
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
          title: "Using Exponential and Logarithmic Functions",
          description:
            "Students write and solve exponential growth equations and inequalities, and write and solve exponential decay equations.",
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
                "## Explore: Continuous Exponential Growth and Decay\n\nUse the interactive tool to explore exponential growth and decay models.\n\n**Inquiry Question:**\nHow can you use exponential functions to model real-world situations involving growth and decay?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = e^{0.1x}",
                title: "Exponential Growth",
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
                "## Key Terms\n\n- **Continuous exponential growth**: Growth modeled by `f(x) = ae^(kt)` where `k > 0`.\n- **Continuous exponential decay**: Decay modeled by `f(x) = ae^(-kt)` where `k > 0`.\n- **Continuously compounded interest**: Interest modeled by `A = Pe^(rt)`.\n- **Half-life**: The time required for a quantity to decrease to half its initial value.\n- **Decay constant**: The positive constant `k` in the exponential decay model.\n- **Radiocarbon dating**: A method of determining the age of objects containing carbon-14.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Using Logarithms to Solve Exponential Growth Problems",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Continuous Exponential Growth\n\nExponential functions with base `e` are frequently used to represent situations involving continuous growth.\n\n### Key Concept: Continuous Exponential Growth\n\nExponential growth can be modeled by:\n\n`f(x) = ae^(kt)`\n\nwhere:\n\n* `a` is the initial value\n* `t` is time in years\n* `k` is the constant rate of continuous growth\n\nThis is the same form as the continuously compounded interest formula:\n\n`A = Pe^(rt)`\n\n### Think About It\n\nWrite an exponential growth equation to represent a population that grows at a rate of `6%` per year and has an initial population of `250`.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Continuous Exponential Growth\n\nIn `2016`, the population of Florida was `20.61` million people. In `2000`, it was `15.98` million.\n\n### Part A: Write an exponential growth equation\n\nUse:\n\n`y = ae^(kt)`\n\nSince `t` is years after `2000`:\n\n* `a = 15.98`\n* `y = 20.61` when `t = 16`\n\nSubstitute:\n\n`20.61 = 15.98e^(16k)`\n\nDivide by `15.98`:\n\n`20.61 / 15.98 = e^(16k)`\n\nTake natural logarithms:\n\n`ln(20.61 / 15.98) = 16k`\n\nSolve:\n\n`k = ln(20.61 / 15.98) / 16`\n\n`k ≈ 0.0159`\n\nSo the model is:\n\n`y = 15.98e^(0.0159t)`\n\n### Part B: Predict when the population will reach `25` million people\n\nSubstitute `y = 25`:\n\n`25 = 15.98e^(0.0159t)`\n\n`1.564 = e^(0.0159t)`\n\nTake natural logarithms:\n\n`ln 1.564 = 0.0159t`\n\n`t = ln 1.564 / 0.0159`\n\n`t ≈ 28.129`\n\nFlorida's population reaches `25` million about `28.129` years after `2000`, or in `2028`.\n\n### Part C: Compare the populations of Florida and California\n\nCalifornia's population in `2000` was `33.9` million and can be modeled by:\n\n`y = 33.9e^(0.0092t)`\n\nDetermine when Florida's population will surpass California's.\n\nSet up the inequality:\n\n`15.98e^(0.0159t) > 33.9e^(0.0092t)`\n\nSolve:\n\n`t > 112.25`\n\nSo, if the trend continues, Florida is on track to surpass California in `2112`.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = 15.98e^{0.0159t}",
                steps: [
                  { expression: "y = 15.98e^(0.0159t)", explanation: "Florida population model with a=15.98, k≈0.0159" },
                  { expression: "25 = 15.98e^(0.0159t)", explanation: "Set y=25 to find when population reaches 25 million" },
                  { expression: "25/15.98 = e^(0.0159t)", explanation: "Divide both sides by 15.98" },
                  { expression: "ln(25/15.98) = 0.0159t", explanation: "Take natural logarithm of both sides" },
                  { expression: "t = ln(25/15.98)/0.0159", explanation: "Solve for t" },
                  { expression: "t ≈ 28.1 years after 2000", explanation: "In year 2028" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Learn: Using Logarithms to Solve Exponential Decay Problems",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Continuous Exponential Decay\n\nExponential functions with base `e` are also used to represent continuous decay.\n\n### Key Concept: Continuous Exponential Decay\n\nExponential decay can be modeled by:\n\n`f(x) = ae^(-kt)`\n\nwhere:\n\n* `a` is the initial value\n* `t` is time\n* `k` is a positive constant representing the rate of continuous decay\n\n### Watch Out\n\nTime units must match the rate. If the half-life is measured in days, then the decay constant is per day, not per year.\n\n### Think About It\n\nGiven time in months and a rate per year, how would you find the value of `t` to substitute into the continuous exponential decay function?",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Continuous Exponential Decay\n\nThorium-230 has a half-life of `75,381` years.\n\n### Part A: Determine `k` and write the decay equation\n\nAfter one half-life period, the amount remaining is `0.5a`.\n\nUse:\n\n`y = ae^(-kt)`\n\nSubstitute:\n\n`0.5a = ae^(-k(75,381))`\n\nDivide by `a`:\n\n`0.5 = e^(-75,381k)`\n\nTake natural logarithms:\n\n`ln 0.5 = -75,381k`\n\nSolve:\n\n`k = ln 0.5 / (-75,381)`\n\n`k ≈ 0.0000092`\n\nSo the decay equation is:\n\n`y = ae^(-0.0000092t)`\n\n### Part B: How much of a `2`-gram sample remains after `1500` years?\n\nSubstitute `a = 2` and `t = 1500`:\n\n`y = 2e^(-0.0000092(1500))`\n\n`= 2e^(-0.0138)`\n\n`≈ 1.97`\n\nAfter `1500` years, about `1.97` grams remain.\n\n### Check\n\nIodine-131 has a half-life of `8.02` days.\n\n* Write the continuous exponential decay equation\n* Find how much of a `15`-gram sample remains after `20` days",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = 2e^{-0.0000092t}",
                steps: [
                  { expression: "0.5 = e^(-75,381k)", explanation: "After one half-life, y = 0.5a" },
                  { expression: "ln 0.5 = -75,381k", explanation: "Take natural logarithm of both sides" },
                  { expression: "k = ln 0.5 / (-75,381)", explanation: "Solve for k" },
                  { expression: "k ≈ 0.0000092", explanation: "Decay constant" },
                  { expression: "y = 2e^(-0.0000092(1500))", explanation: "Substitute a=2, t=1500" },
                  { expression: "≈ 1.97 grams", explanation: "Calculate remaining amount" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Apply Example 3 — Radiocarbon Dating\n\nCarbon-14 is used in radiocarbon dating. It has a half-life of `5730` years and a decay constant `k = 0.00012`.\n\nIn `2016`, charcoal flakes from an excavation site in Canada were found to contain about `18.6%` as much Carbon-14 as they would have originally contained. How old are the charcoal flakes to the nearest year?\n\n### 1. What is the task?\n\nUse the Carbon-14 decay information to find the age of the charcoal flakes.\n\n### 2. How will you approach the task?\n\nEstimate the age using half-lives, then write and solve an exponential decay equation.\n\n### 3. What is your solution?\n\n#### Estimate first\n\nAfter two half-lives, `25%` remains.\n\nAfter three half-lives, `12.5%` remains.\n\nBecause `18.6%` lies between `25%` and `12.5%`, the sample is between:\n\n* `11,460` years old\n* `17,190` years old\n\n#### Write the equation\n\nBecause the sample has `18.6%` of its original Carbon-14:\n\n`0.186 = e^(-0.00012t)`\n\nSolving gives:\n\n`t ≈ 14,017`\n\nSo the charcoal flakes are about `14,017` years old.\n\n### 4. How can you know that your solution is reasonable?\n\nThe solution lies within the estimated interval.\n\nChecking the model:\n\n`y = e^(-0.00012(14,017))`\n\n`≈ 0.186`\n\nSo the result is consistent with the given percent remaining.\n\n### Check\n\nAn archaeologist estimates that a prehistoric painting contains about `2.34%` as much Carbon-14 as it would have contained when it was painted. Use the decay model below to determine how long ago the painting was created.\n\n`y = ae^(-0.00012t)`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = e^{-0.00012t}",
                steps: [
                  { expression: "0.186 = e^(-0.00012t)", explanation: "18.6% of original Carbon-14 remains" },
                  { expression: "ln 0.186 = -0.00012t", explanation: "Take natural logarithm of both sides" },
                  { expression: "t = ln 0.186 / (-0.00012)", explanation: "Solve for t" },
                  { expression: "t ≈ 14,017 years", explanation: "Calculate age of charcoal flakes" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Pause and Reflect",
        phaseType: "reflection" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Pause and Reflect\n\nDid you struggle with anything in this lesson? If so, how did you deal with it?\n\nConsider the following questions:\n\n1. How do you set up an exponential growth or decay model from a real-world situation?\n2. What steps do you follow to solve exponential equations using logarithms?\n3. How do you interpret the results of exponential growth and decay problems in context?",
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