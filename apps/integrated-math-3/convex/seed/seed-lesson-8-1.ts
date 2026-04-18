import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-8-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Random Sampling",
          slug: lessonSlug,
          description:
            "Students classify sampling methods, identify bias, and distinguish among sample surveys, experiments, and observational studies.",
          orderIndex: 1,
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
          title: "Random Sampling",
          description:
            "Students classify sampling methods, identify bias, and distinguish among sample surveys, experiments, and observational studies.",
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
                "## Explore: Sampling and Bias\n\nUse the interactive tool to explore how sample selection affects conclusions about a population.\n\n**Inquiry Question:**\nHow does the way you choose a sample affect whether it represents the whole population?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = 1/x",
                title: "Sampling Explorer",
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
                "## Key Terms\n\n- **Parameter**: a characteristic of a population\n- **Statistic**: a characteristic of a sample\n- **Population**: the full group of interest\n- **Bias**: an error that misrepresents the population\n- **Survey**: data are collected from responses about opinions, behaviors, or characteristics\n- **Experiment**: participants are divided into groups and the effect of a treatment is compared\n- **Observational study**: participants are observed without being affected by the study",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Randomness and Bias",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Randomness and Bias\n\nStatistics deals with collecting, analyzing, and interpreting data.\n\n### Key Concept: Types of Samples\n\n- **Simple random**: each member has an equal chance of selection\n- **Systematic**: members are selected at a regular interval\n- **Self-selected**: members volunteer\n- **Convenience**: readily available members are selected\n- **Stratified**: members are selected from similar, nonoverlapping groups",
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
                "## Example 1 — Classify a Random Sample\n\nA school asks students to complete an online questionnaire about a school app.\n\n- **Population**: the entire student body\n- **Sample**: the students who responded\n- **Classification**: **self-selected**",
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
                    question: "In the school app survey, what type of sample is used?",
                    options: ["Simple random", "Self-selected", "Stratified"],
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
                "## Example 2 — Identify Sample Bias\n\nA traffic commission uses a random sample of travelers on Route 15 during rush hour and proposes a major road expansion.\n\nThe sample is biased because:\n- the sample size is only 10\n- it is too small to represent all drivers using the road",
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
                    question: "Why is the traffic commission sample biased?",
                    options: ["It was taken during rush hour only", "The sample size is too small", "Both of the above"],
                    correctIndex: 2,
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
                '## Example 3 — Identify Biased Questions\n\nA restaurant owner asks:\n\n"Do you prefer a plain salad or a delicious steak?"\n\nThe question is biased because the wording favors the steak and is not neutral.',
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
                    question: "What makes the restaurant owner's question biased?",
                    options: ["It offers only two choices", "The wording favors steak", "It is too long"],
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
        title: "Learn: Types of Studies",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Types of Studies\n\n- In a **survey**, data are collected from responses about opinions, behaviors, or characteristics.\n- In an **experiment**, participants are divided into groups and the effect of a treatment is compared.\n- In an **observational study**, participants are observed without being affected by the study.",
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
                "## Example 4 — Classify Study Types\n\nA research team shows football uniform designs to 100 young adults and records their reactions.\n\n- **Purpose**: determine whether the uniforms appeal to young adults\n- **Study type**: **observational study**\n- **Sample**: the 100 young adults\n- **Population**: all young adults",
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
                    question: "What type of study is the football uniform research?",
                    options: ["Experiment", "Survey", "Observational study"],
                    correctIndex: 2,
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
                "## Example 5 — Design a Survey\n\nA company owner wants to know whether employees would use an exercise room if a conference room were converted.\n\n**Step 1**: State the objective — Determine employee interest in converting the room.\n\n**Step 2**: Identify the population — All employees who work in the building.\n\n**Step 3**: Write an unbiased question — \"If available, would you use an exercise room in the building if it were created by converting a conference room?\"",
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
                    question: "Which step identifies who the survey targets?",
                    options: ["State the objective", "Identify the population", "Write an unbiased question"],
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
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Draw Conclusions from a Study\n\nResearchers test different virtual reality goggles.\n\n| Type | Number of People | Positive Reactions |\n| -- | -- | -- |\n| A | 11 | 45% |\n| B | 17 | 53% |\n| C | 45 | 91% |\n| D | 52 | 92% |\n| E | 6 | 33% |\n\n**Conclusion**: Types C and D appear to be preferred by the most people and have the highest positive reaction rates, so those goggles should be recommended for production.",
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
                    question: "Which goggles should be recommended for production?",
                    options: ["Types A and B", "Types C and D", "Type E"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Identify Bias in Studies\n\nA teacher gives one class a test in silence and another class the same test with music playing, then concludes that music helps testing because the second class scored higher.\n\n**Flaws**:\n- the groups were not randomly selected\n- the classes differ in more than just the presence of music\n- the classes may have different skill levels\n\n**Improved design**: Use students with similar ability levels and randomly assign them to control and experimental groups.",
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
                    question: "What is a major flaw in the music study?",
                    options: ["The test was too hard", "The groups were not randomly selected", "Music was too loud"],
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
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How do you determine whether a sample represents a population fairly?\n2. What are some common sources of bias in survey questions?\n3. How do surveys, experiments, and observational studies differ?\n4. Why is random assignment important in an experiment?",
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
                    question: "Which sampling method gives every member an equal chance of selection?",
                    options: ["Simple random", "Convenience", "Self-selected"],
                    correctIndex: 0,
                  },
                  {
                    question: "In which type of study is the effect of a treatment compared?",
                    options: ["Observational study", "Experiment", "Survey"],
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
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about random sampling and types of studies. Consider the following:\n\n- How do you classify sampling methods?\n- What makes a sample or question biased?\n- How do surveys, experiments, and observational studies differ?\n- What questions do you still have about statistics?",
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
