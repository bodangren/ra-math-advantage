import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson8_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson8_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson8_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-8-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 8,
          title: "Using Statistical Experiments",
          slug: lessonSlug,
          description:
            "Students compare theoretical and experimental probabilities and determine whether models are consistent with results from simulations.",
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
          title: "Using Statistical Experiments",
          description:
            "Students compare theoretical and experimental probabilities and determine whether models are consistent with results from simulations.",
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
                "## Explore: Fair Decisions\n\nUse a real-world situation to complete the explore.\n\n**Inquiry Question:**\nHow can you use probability to make a fair decision?",
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
                    question: "A restaurant uses a random number generator to pick a daily winner from 200 customers. Which best describes the probability of any single customer winning?",
                    options: ["1/200", "50/200", "1/100", "200/200"],
                    correctIndex: 0,
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
                "## Key Terms\n\n- **theoretical probability**: What is expected to happen\n- **experimental probability**: Based on actual data from an experiment\n- **probability model**: Represents a random event using its sample space and the probability of each outcome\n- **simulation**: Imitates a process or situation so it can be studied when real experimentation is difficult or impractical",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Theoretical and Experimental Probability",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Theoretical and Experimental Probability\n\n**Theoretical probability** is what is expected to happen.\n\n**Experimental probability** is based on actual data from an experiment.\n\n### Key Concept: Law of Large Numbers\n\nAs sample size increases, variation decreases and experimental probability tends to approach theoretical probability.",
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
                "## Example 1 — Find Probabilities\n\nA fair eight-sided die is rolled `200` times. The result `8` occurs `42` times.\n\n- **Theoretical probability** of rolling `8`: `1/8 = 12.5%`\n- **Experimental probability** of rolling `8`: `42/200 = 21%`",
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
                    question: "What is the theoretical probability of rolling an 8 on a fair eight-sided die?",
                    options: ["1/8", "42/200", "1/6", "8/200"],
                    correctIndex: 0,
                  },
                  {
                    question: "As the number of rolls increases, what happens to experimental probability?",
                    options: ["It stays the same", "It approaches theoretical probability", "It moves away from theoretical probability", "It becomes random"],
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
        title: "Learn: Simulations",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Simulations\n\nA **probability model** represents a random event using its sample space and the probability of each outcome.\n\nA **simulation** imitates a process or situation so it can be studied when real experimentation is difficult or impractical.\n\n### Key Concept: Conducting a Simulation\n\n1. Determine each possible outcome and its theoretical probability\n2. Describe a probability model\n3. Define a trial and choose the number of trials\n4. Conduct the simulation\n5. Analyze the results",
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
                "## Example 2 — Design and Run a Simulation\n\nA water bottle company has a promotion where `1` out of every `8` bottle caps wins a free bottle.\n\n### Step 1: Describe the probability model\n\n- win: `1/8`\n- not win: `7/8`\n\n### Step 2: Define the trial and number of trials\n\nUse a random number generator from `1` to `8`.\n\n- `1` represents winning\n- `2` through `8` represent not winning\n\nRun `100` trials.\n\n### Step 3: Conduct the simulation\n\nGenerate `100` random integers from `1` to `8`.\n\n### Step 4: Analyze the results\n\nIf `1` appears `12` times, then the experimental probability of winning is `12%`.",
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
                    question: "In a 1-in-8 promotion, what number represents a win using a 1-8 random number generator?",
                    options: ["Any number", "1 only", "8 only", "2 through 8"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is the first step in conducting a simulation?",
                    options: ["Choose the number of trials", "Describe the probability model", "Determine each possible outcome and its theoretical probability", "Generate random numbers"],
                    correctIndex: 2,
                  },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Run and Evaluate a Simulation\n\nA health club sells tickets where `1` in `10` wins free training sessions. A customer buys `20` tickets in a row and wins nothing. Determine whether the complaint is legitimate.\n\n### Step 1: Describe the model\n\n- win: `1/10`\n- not win: `9/10`\n\n### Step 2: Define the simulation\n\nUse a spinner:\n\n- winning sector: `10%`\n- losing sector: `90%`\n\nRun `100` trials.\n\n### Step 3: Conduct the simulation\n\nSpin `100` times and record wins.\n\n### Step 4: Analyze and evaluate\n\nIf `11` out of `100` simulations contain a losing streak of at least `20`, the complaint is not legitimate because the outcome is not unlikely.",
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
                    question: "Why might a customer buying 20 tickets and winning nothing still be consistent with a 1-in-10 probability?",
                    options: ["The tickets are biased", "Multiple simulations show long losing streaks can occur naturally", "The customer is unlucky", "The store is cheating"],
                    correctIndex: 1,
                  },
                  {
                    question: "When evaluating a simulation, why might running multiple simulations be necessary?",
                    options: ["To make the results more complicated", "To check whether an outcome is unusual or expected by chance", "To prove the customer wrong", "To waste time"],
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
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How does the phrase \"The house always wins\" relate to experimental and theoretical probability?\n2. Why is it important to run multiple simulations when evaluating a probability model?\n3. How can simulations help when real experimentation is difficult or impractical?\n4. What factors might cause experimental probability to differ from theoretical probability?",
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
                    question: "What does the Law of Large Numbers describe?",
                    options: ["Experimental probability stays the same as sample size increases", "Experimental probability approaches theoretical probability as sample size increases", "Theoretical probability changes with more data", "Probability is always exact"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is a simulation used for?",
                    options: ["To replace real experiments entirely", "To imitate a process when real experimentation is impractical", "To make probability problems harder", "To avoid using probability entirely"],
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
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about theoretical and experimental probability and how simulations are used to study real-world situations. Consider the following:\n\n- How do theoretical and experimental probability differ?\n- What is the Law of Large Numbers and why is it important?\n- How do you design and conduct a simulation?\n- What questions do you still have about probability and simulations?",
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