import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-8-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Normal Distributions",
          slug: lessonSlug,
          description:
            "Students classify variables, analyze probability distributions, apply the Empirical Rule, and use z-values for standardization.",
          orderIndex: 4,
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
          title: "Normal Distributions",
          description:
            "Students classify variables, analyze probability distributions, apply the Empirical Rule, and use z-values for standardization.",
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
                "## Explore: Probability Distributions\n\nUse a simulation to complete the explore.\n\n**Inquiry Question:**\nWhat is the relationship between the expected value of a discrete random variable and the mean of the distribution of that variable as the sample size increases?",
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
                "## Key Terms\n\n- **probability distribution**: maps each outcome of a random variable to its probability\n- **discrete random variable**: a random variable that is countable\n- **continuous random variable**: a random variable that can take on any value in an interval\n- **outcome**: a possible result of a random process\n- **sample space**: the set of all possible outcomes\n- **normal distribution**: a continuous, bell-shaped, symmetric distribution\n- **z-value**: a standardized score showing how many standard deviations a value is from the mean\n- **standard normal distribution**: a normal distribution with mean 0 and standard deviation 1",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Probability Distributions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Probability Distributions\n\nA **probability distribution** maps each outcome of a random variable to its probability.\n\n- a **discrete random variable** is countable\n- a **continuous random variable** can take on any value in an interval\n\n### Conditions for a Probability Distribution\n\n- each probability is between `0` and `1`\n- the probabilities of all outcomes add to `1`",
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
                "## Example 1 — Classify Random Variables\n\nClassify each variable as discrete or continuous.\n\n- number of songs on smartphones: **discrete**\n- air pressure in basketballs: **continuous**",
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
                    question: "Which of these is a continuous random variable?",
                    options: [
                      "Number of cars in a parking lot",
                      "Height of students in a class",
                      "Number of books on a shelf",
                      "Number of emails received"
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "Which of these is a discrete random variable?",
                    options: [
                      "Weight of a laptop",
                      "Time to complete a race",
                      "Temperature",
                      "Number of siblings"
                    ],
                    correctIndex: 3,
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
                "## Example 2 — Analyze a Probability Distribution\n\nA candy company records the number of prize-winning wrappers for each cash amount.\n\nConstruct a relative frequency table by dividing each frequency by the total number of winning wrappers, `4000`.\n\nSample probabilities:\n\n- `$5`: `0.3125`\n- `$10`: `0.2500`\n- `$20`: `0.1875`\n- `$50`: `0.1500`\n\nGraph the distribution with separated bars because the outcomes are discrete.",
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
                    question: "What is the probability of winning $10 if there are 1000 $10 winners out of 4000 total?",
                    options: ["0.10", "0.25", "0.50", "0.75"],
                    correctIndex: 1,
                  },
                  {
                    question: "Why are the bars separated in the graph?",
                    options: [
                      "The company prefers that style",
                      "Because the outcomes are discrete values",
                      "To make the graph look longer",
                      "Because the probabilities are small"
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
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Misleading Distributions\n\nA business publishes a salary probability distribution to suggest that most employees earn at least `$40,000`.\n\nMisleading features:\n\n- the x-axis bins are uneven, especially above `$70,000`\n- the y-axis scale uses very small increments that exaggerate differences\n\nConclusion:\n\nThe graph visually overstates how much more likely the `$40,000` to `$50,000` range is compared to actual probabilities.",
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
                    question: "What makes the salary distribution graph misleading?",
                    options: [
                      "It uses too many colors",
                      "Uneven x-axis bins and exaggerated y-axis scale",
                      "It shows all employees earn $40,000",
                      "The probabilities add to more than 1"
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "When interpreting a distribution graph, what should you check for?",
                    options: [
                      "Whether it has a title",
                      "Whether axes are evenly scaled and bins are consistent",
                      "How many colors are used",
                      "The company's logo"
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
        phaseNumber: 7,
        title: "Learn: Normal Distributions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## The Normal Distribution\n\nThe **normal distribution** is a continuous, bell-shaped, symmetric distribution.\n\n### Key Concept: The Normal Distribution\n\n- the graph is bell-shaped and symmetric\n- the mean, median, and mode are equal\n- the curve approaches but never touches the x-axis\n- the total area under the curve is `1`\n\n### Key Concept: The Empirical Rule\n\nFor a normal distribution with mean `mu` and standard deviation `sigma`:\n\n- about `68%` of the data lies within `1 sigma` of the mean\n- about `95%` lies within `2 sigma` of the mean\n- about `99.7%` lies within `3 sigma` of the mean",
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
                "## Example 4 — Approximate Data by Using a Normal Distribution\n\nA histogram of goals scored by soccer players is skewed.\n\nConclusion:\n\nThe data cannot be approximated by a normal distribution because it is not symmetric. Only symmetric, bell-shaped data follows a normal distribution.",
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
                    question: "Why can't the soccer player data be approximated by a normal distribution?",
                    options: [
                      "There are too many players",
                      "The data is skewed (not symmetric)",
                      "The mean is too high",
                      "There are not enough goals"
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "What shape must data have to be modeled by a normal distribution?",
                    options: [
                      "Bell-shaped and symmetric",
                      "Skewed to the right",
                      "Skewed to the left",
                      "Uniform"
                    ],
                    correctIndex: 0,
                  },
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
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Use the Empirical Rule to Analyze Data\n\nA normal distribution has:\n\n- mean `= 42`\n- standard deviation `= 6`\n\n### a. Find the middle `95%`\n\nUse `mu ± 2sigma`:\n\n- `42 - 12 = 30`\n- `42 + 12 = 54`\n\nSo the middle `95%` is from `30` to `54`.\n\n### b. What percent of the data is greater than `36`?\n\n`36` is one standard deviation below the mean.\n\nArea greater than `36`:\n\n- `50%` above the mean\n- `34%` between `36` and the mean\n\nTotal: `84%`",
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
                    question: "For a normal distribution with mean 42 and standard deviation 6, what is the range for the middle 95%?",
                    options: ["24 to 60", "30 to 54", "36 to 48", "18 to 66"],
                    correctIndex: 1,
                  },
                  {
                    question: "What percent of data falls between 36 and 42 in this distribution?",
                    options: ["34%", "50%", "68%", "95%"],
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
        title: "Learn: The Standard Normal Distribution",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## The Standard Normal Distribution\n\nData can be standardized using **z-values**:\n\n`z = (X - mu) / sigma`\n\nThe **standard normal distribution** has:\n\n- mean `0`\n- standard deviation `1`\n\nAreas under the curve correspond to probabilities.",
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Use z-Values to Locate Position\n\nFind `z` if:\n\n- `X = 24`\n- `mu = 19`\n- `sigma = 3.8`\n\n`z = (24 - 19) / 3.8 = 5 / 3.8 ≈ 1.316`\n\nA z-value of `1.316` means the value `24` is about `1.316` standard deviations above the mean.",
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
                    question: "If X = 24, mu = 19, and sigma = 3.8, what is the z-value?",
                    options: ["0.76", "1.32", "2.63", "5.00"],
                    correctIndex: 1,
                  },
                  {
                    question: "A z-value of 1.316 means the value is...",
                    options: [
                      "1.316 below the mean",
                      "1.316 above the mean",
                      "Equal to the mean",
                      "Too far from the mean to calculate"
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
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Find Area Under the Standard Normal Curve by Using a Table\n\nFind the area under the normal curve for:\n\n`z < -1.18`\n\nFrom the standard normal table:\n\n`P(z < -1.18) = 0.1190`\n\nSo the area to the left of `z = -1.18` is `0.1190` (or about `11.9%`).",
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
                    question: "What does P(z < -1.18) represent?",
                    options: [
                      "The area to the right of z = -1.18",
                      "The area to the left of z = -1.18",
                      "The area between z = -1.18 and z = 1.18",
                      "The z-value at the 1.18th percentile"
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "If P(z < -1.18) = 0.1190, what percent of data falls below z = -1.18?",
                    options: ["1.19%", "11.90%", "50%", "88.10%"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Worked Example 8",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 8 — Find Area Under the Standard Normal Curve by Using a Calculator\n\nDaily hits to a website are normally distributed with:\n\n- `mu = 98,452`\n- `sigma = 10,325`\n\nFind: `P(X > 100,000)`\n\n### Step 1: Find the z-value\n\n`z = (100,000 - 98,452) / 10,325 ≈ 0.150`\n\n### Step 2: Use a calculator\n\nUse `normalcdf` to find the area from `z = 0.150` to a large upper bound.\n\nProbability: `≈ 0.44`\n\nSo the probability is about `44.0%`.",
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
                    question: "What is the z-value for X = 100,000?",
                    options: ["0.015", "0.150", "1.500", "15.00"],
                    correctIndex: 1,
                  },
                  {
                    question: "If P(X > 100,000) ≈ 0.44, what does this mean?",
                    options: [
                      "44% of days have exactly 100,000 hits",
                      "44% of days have more than 100,000 hits",
                      "The average hits is 44,000",
                      "44 days have more than 100,000 hits"
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
        phaseNumber: 14,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why is the normal distribution useful for describing real-world data?\n2. How does the Empirical Rule help us understand data spread?\n3. What does a negative z-value indicate about a data point?\n4. Why do we standardize values using z-scores instead of comparing raw scores directly?",
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
                    question: "What does it mean when a z-value is negative?",
                    options: [
                      "The value is below the mean",
                      "The value is above the mean",
                      "The value is impossible",
                      "The standard deviation is negative"
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "Why might we prefer z-scores over raw values for comparison?",
                    options: [
                      "Z-scores are always positive",
                      "Z-scores standardize different scales to a common scale",
                      "Z-scores are easier to calculate",
                      "Raw values cannot be compared"
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
        phaseNumber: 15,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about normal distributions and z-values. Consider the following:\n\n- What is the difference between a discrete and continuous random variable?\n- How does the Empirical Rule describe data spread in a normal distribution?\n- How do you calculate and interpret a z-value?\n- Why is the standard normal distribution useful?\n- What questions do you still have about normal distributions and z-scores?",
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