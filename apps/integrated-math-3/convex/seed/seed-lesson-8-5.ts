import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-8-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Estimating Population Parameters",
          slug: lessonSlug,
          description:
            "Students use sample data to infer population means and proportions by using confidence intervals and maximum error of the estimate.",
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
          title: "Estimating Population Parameters",
          description:
            "Students use sample data to infer population means and proportions by using confidence intervals and maximum error of the estimate.",
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
                "## Explore: Sampling and Estimation\n\nUse the interactive tool to explore how sample size affects the precision of population estimates.\n\n**Inquiry Question:**\nHow does increasing the sample size change the width of a confidence interval?",
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
                "## Key Terms\n\n- **inferential statistics**: using sample data to make statements about a population\n- **sampling error**: the random variation between samples of the same population\n- **standard error of the mean**: `sigma_x = sigma / sqrt(n)`\n- **confidence interval**: an interval estimate for a population parameter\n- **maximum error of the estimate**: `E = z * s / sqrt(n)`\n- **population proportion**: the proportion of the population with a given characteristic",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Estimating the Population Mean",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Estimating the Population Mean\n\nUsing sample data to make statements about a population is called **inferential statistics**.\n\n**Sampling error** is the random variation between samples of the same population. As sample size increases, sampling error decreases.\n\nThe standard error of the mean is:\n\n`sigma_x = sigma / sqrt(n)`\n\nThe maximum error of the estimate is:\n\n`E = z * s / sqrt(n)`\n\nCommon confidence levels:\n\n- `90%`: `z = 1.645`\n- `95%`: `z = 1.960`\n- `99%`: `z = 2.576`\n\n### Key Concept: Estimating the Population Mean\n\n1. Find the sample mean `x-bar`\n2. Choose the confidence level\n3. Find the maximum error `E`\n4. Use the interval `(x-bar - E, x-bar + E)`",
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
                "## Example 1 — Find the Maximum Error of the Estimate\n\nA poll of `315` chess club members gives:\n\n- sample mean `= 4.6` hours per week\n- sample standard deviation `= 1.2`\n\nUse a `90%` confidence interval.\n\n`E = 1.645 * 1.2 / sqrt(315) ≈ 0.11`\n\nSo, with `90%` confidence, the population mean is within `0.11` hour of the sample mean.",
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
                    question: "What is the maximum error of the estimate for the chess club poll?",
                    options: ["0.05", "0.11", "0.22", "1.645"],
                    correctIndex: 1,
                  },
                  {
                    question: "What does the maximum error tell us?",
                    options: [
                      "The exact population mean",
                      "How far the sample mean may be from the population mean",
                      "The sample size needed",
                      "The standard deviation of the population"
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
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Estimate a Population Mean\n\nA survey of `50` students gives:\n\n- sample mean `= 8.61`\n- sample standard deviation `= 2.6`\n\nUse a `95%` confidence level.\n\n### Step 1: Find `E`\n\n`E = 1.960 * 2.6 / sqrt(50) ≈ 0.72`\n\n### Step 2: Form the interval\n\n- `8.61 - 0.72 = 7.89`\n- `8.61 + 0.72 = 9.33`\n\nConfidence interval: `7.89 <= mu <= 9.33`\n\nInterpretation: We are `95%` confident that the population mean lies between `7.89` and `9.33`.",
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
                    question: "What is the confidence interval for the student survey?",
                    options: ["7.89 to 9.33", "8.61 to 9.33", "6.01 to 11.21", "7.17 to 10.05"],
                    correctIndex: 0,
                  },
                  {
                    question: "What does a 95% confidence level mean?",
                    options: [
                      "95% of sample means equal 8.61",
                      "We are 95% confident the population mean is between 7.89 and 9.33",
                      "95% of students scored between 7.89 and 9.33",
                      "The population mean is exactly 8.61"
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
        phaseNumber: 6,
        title: "Learn: Estimating the Population Proportion",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Estimating the Population Proportion\n\nThe **population proportion** `p` is the proportion of the population with a given characteristic.\n\nThe sample estimate is:\n\n`p-hat = x/n`\n\nand\n\n`q-hat = 1 - p-hat`\n\nThe maximum error for a population proportion is:\n\n`E = z * sqrt((p-hat * q-hat) / n)`\n\nThe confidence interval is:\n\n`p-hat ± E`",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Apply Example 3 — Estimate a Population Proportion\n\nA survey of `150` students asks whether they agree with a lunch-period change. `72` say yes.\n\nUse a `90%` confidence level.\n\n`p-hat = 72/150 = 0.48`\n\n`q-hat = 0.52`\n\nCheck sample size:\n\n- `np-hat = 72`\n- `nq-hat = 78`\n\nSo the sample is large enough.\n\nThe confidence interval is `[0.413, 0.547]`.\n\nInterpretation: With `90%` confidence, between `41.3%` and `54.7%` of students agree with the plan.",
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
                    question: "What is p-hat for the lunch-period survey?",
                    options: ["0.52", "0.48", "0.72", "0.50"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is the 90% confidence interval for the population proportion?",
                    options: ["[0.413, 0.547]", "[0.480, 0.520]", "[0.350, 0.610]", "[0.450, 0.550]"],
                    correctIndex: 0,
                  },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Misleading Population Estimates\n\nA lobbying group claims that with `90%` confidence the proportion of people who support a ballot measure is `50%`, but could be as low as `40%` with a margin of error of `5%`.\n\nGiven sample size: `n = 200`\n\nThe misleading part is that the sample proportion is actually `0.45`, not `0.50`.\n\nSo instead of honestly reporting `45% ± 5%`, the group reports the highest possible estimate to make support appear stronger than it is.",
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
                    question: "What makes the lobbying group's estimate misleading?",
                    options: [
                      "The sample size is too small",
                      "They reported 50% instead of the actual sample proportion 45%",
                      "The margin of error is too large",
                      "The confidence level is too low"
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "What should the group have honestly reported?",
                    options: [
                      "50% ± 5%",
                      "45% ± 5%",
                      "40% ± 10%",
                      "90% support"
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
                "## Discussion Questions\n\n1. Why does a larger sample size produce a narrower confidence interval?\n2. What is the difference between estimating a population mean and a population proportion?\n3. How can someone mislead others with confidence intervals?\n4. Why is it important to check that `np-hat` and `nq-hat` are both large enough?",
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
                    question: "What happens to the width of a confidence interval as sample size increases?",
                    options: [
                      "It gets wider",
                      "It gets narrower",
                      "It stays the same",
                      "It becomes negative"
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "Which of the following is a way estimates can be misleading?",
                    options: [
                      "Using a 95% confidence level",
                      "Reporting the most favorable point estimate instead of the actual sample proportion",
                      "Using a large sample size",
                      "Checking np-hat and nq-hat"
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
                "## Reflection\n\nToday you learned about estimating population parameters. Consider the following:\n\n- What is the relationship between sample size and the precision of an estimate?\n- How do you construct a confidence interval for a population mean?\n- How do you construct a confidence interval for a population proportion?\n- What questions do you still have about confidence intervals and estimation?",
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
