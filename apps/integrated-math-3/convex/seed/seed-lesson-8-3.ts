import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-8-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Analyzing Population Data",
          slug: lessonSlug,
          description:
            "Students describe distributions by finding their mean and standard deviation.",
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
          title: "Analyzing Population Data",
          description:
            "Students describe distributions by finding their mean and standard deviation.",
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
                "## Explore: Distribution of Data\n\nUse the interactive tool to explore how data is spread around the mean.\n\n**Inquiry Question:**\nHow can you describe the spread of data in a population?",
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
                    question: "A population has values {2, 4, 6, 8, 10}. What is the mean of this population?",
                    options: ["5", "6", "7", "8"],
                    correctIndex: 1,
                  },
                ],
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
                "## Key Terms\n\n- **descriptive statistics**: measures of center and spread used to describe data\n- **distribution**: a graph or table showing the frequency of possible data values\n- **symmetric distribution**: a distribution where the mean and median are approximately equal\n- **outlier**: a data value that is much greater or less than most other values\n- **variance**: the average of the squared differences from the mean\n- **standard deviation**: the square root of the variance, measuring spread",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Describing Distributions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Describing Distributions\n\nMeasures of center and measures of spread are called **descriptive statistics**.\n\nA **distribution** is a graph or table showing the frequency of possible data values.\n\n### Key Concept: Finding the Standard Deviation\n\n1. Find the mean `mu`\n2. Find each squared difference `(x - mu)^2`\n3. Add those squared differences\n4. Divide by the number of data values to get variance\n5. Take the square root to get standard deviation\n\nFormula: `sigma = sqrt(sum((x - mu)^2) / n)`",
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
                "## Example 1 — Find a Standard Deviation\n\nA coach records `400`-meter race times:\n\n`57.1, 59.3, 54.6, 55.2, 55.9, 54.9, 50.3, 53.5`\n\n### Step 1: Find the mean\n\n`mu = 55.1`\n\n### Step 2: Find the squared differences\n\nThese sum to `48.18`\n\n### Step 3: Find the variance\n\n`48.18 / 8 = 6.0225`\n\n### Step 4: Find the standard deviation\n\n`sqrt(6.0225) ≈ 2.45`\n\nThe standard deviation is small compared with the running times, so most team times are close to the mean. The interval within `2` standard deviations is approximately `50.2` to `60.0` seconds.",
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
                    question: "What is the mean of the race times?",
                    options: ["53.5", "55.1", "57.1", "50.3"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is the standard deviation of the race times?",
                    options: ["6.02", "48.18", "2.45", "8"],
                    correctIndex: 2,
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
                "## Example 2 — Calculate Statistics\n\nUse a graphing calculator to find the mean and standard deviation of:\n\n`26, 12, 15, 20, 17, 19, 18, 16, 14, 23, 13, 18, 19, 20, 22`\n\nCalculator results:\n\n- mean `≈ 18.1`\n- standard deviation `≈ 3.7`",
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
                    question: "What is the approximate mean of the data set?",
                    options: ["17.0", "18.1", "19.2", "20.0"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is the approximate standard deviation?",
                    options: ["2.5", "3.7", "4.1", "5.0"],
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
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Compare Distributions\n\nCompare exam score distributions for two Algebra 2 classes using the mean and standard deviation.\n\n- **Mr. Jackson's class**: mean `= 93.2`, standard deviation `= 2.3`\n- **Ms. Hettrick's class**: mean `= 79.9`, standard deviation `= 7.2`\n\nInterpretation:\n\n- Mr. Jackson's class scored higher on average\n- Ms. Hettrick's class scores are more spread out",
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
                    question: "Which class scored higher on average?",
                    options: ["Mr. Jackson's class", "Ms. Hettrick's class", "They scored the same", "Not enough information"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which class has scores that are more spread out?",
                    options: ["Mr. Jackson's class", "Ms. Hettrick's class", "They have the same spread", "Not enough information"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. In what case would a standard deviation of `2.45` be considered large? Give a real-world example.\n2. How do the mean and standard deviation together describe a distribution?\n3. Why is the mean less reliable for skewed distributions or data with outliers?\n4. When might you prefer to use a graphing calculator instead of manual calculation for standard deviation?",
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
                    question: "For symmetric distributions, which measure describes the center well?",
                    options: ["Median only", "Mean", "Mode only", "Range"],
                    correctIndex: 1,
                  },
                  {
                    question: "What describes the spread of a symmetric distribution?",
                    options: ["Mean and median", "Variance and standard deviation", "Mode and range", "Outliers only"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about describing distributions by finding their mean and standard deviation. Consider the following:\n\n- How do you find the standard deviation of a data set?\n- What is the difference between variance and standard deviation?\n- How can you use the mean and standard deviation to compare two distributions?\n- What questions do you still have about analyzing population data?",
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
