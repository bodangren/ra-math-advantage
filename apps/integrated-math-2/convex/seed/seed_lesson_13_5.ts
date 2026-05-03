import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson13_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson13_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson13_5Result> => {
    const now = Date.now();
    const lessonSlug = "13-5-solving-trig-equations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Solving Trig Equations",
          slug: lessonSlug,
          description: "Students solve trigonometric equations using identities and algebraic techniques.",
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
          title: "Solving Trig Equations",
          description: "Students solve trigonometric equations using identities and algebraic techniques.",
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
              markdown: "## Explore: Finding All Solutions\n\nSolve sin(θ) = 1/2 for 0° ≤ θ < 360°.\n\nYou know sin(30°) = 1/2. Is that the only answer? Think about the unit circle — where else is y = 1/2?",
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
                    question: "sin(θ) = 1/2 on [0°, 360°) has solutions:",
                    options: ["30° only", "30° and 150°", "30° and 330°", "150° and 330°"],
                    correctIndex: 1,
                  },
                  {
                    question: "Trig equations typically have:",
                    options: ["One solution", "Two solutions only", "Multiple solutions depending on domain", "No solutions"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving Trig Equations\n\n### Strategy\n1. Isolate the trig function\n2. Find the reference angle\n3. Use the unit circle or quadrants to find all solutions in the given domain\n4. Express general solutions using periodicity\n\n### General Solutions\n- sin(θ) = k: θ = α + 360°n or θ = 180° − α + 360°n\ncos(θ) = k: θ = ±α + 360°n\ntan(θ) = k: θ = α + 180°n\n\n### Using Identities\nSome equations require factoring or using identities to simplify before solving.\n\nExample: 2sin²θ − sin θ = 0 → sin θ(2sin θ − 1) = 0",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Solve a Trig Equation\n\nSolve 2cos(θ) + √3 = 0 for 0° ≤ θ < 360°.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "trig-equation",
                equation: "2cos(θ) + √3 = 0",
                steps: [
                  { expression: "cos(θ) = -√3/2", explanation: "Isolate cos(θ)" },
                  { expression: "Reference angle: 30°", explanation: "cos(30°) = √3/2" },
                  { expression: "cos is negative in QII and QIII", explanation: "Determine quadrants" },
                  { expression: "θ = 180° - 30° = 150°", explanation: "QII solution" },
                  { expression: "θ = 180° + 30° = 210°", explanation: "QIII solution" },
                  { expression: "Solutions: θ = 150°, 210°", explanation: "All solutions in [0°, 360°)" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Guided Practice",
        phaseType: "guided_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "trig-equation",
                equation: "2sin²θ - sin θ = 0 on [0°, 360°)",
                steps: [
                  { expression: "sin θ(2sin θ - 1) = 0", explanation: "Factor" },
                  { expression: "sin θ = 0 → θ = 0°, 180°", explanation: "First factor" },
                  { expression: "sin θ = 1/2 → θ = 30°, 150°", explanation: "Second factor" },
                  { expression: "Solutions: 0°, 30°, 150°, 180°", explanation: "Combine all solutions" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "Solve tan(θ) = 1 on [0°, 360°):",
                    options: ["45° only", "45° and 225°", "45° and 135°", "45° and 315°"],
                    correctIndex: 1,
                  },
                  {
                    question: "Solve cos(θ) = 0 on [0°, 360°):",
                    options: ["0°, 180°", "90°, 270°", "0°, 90°, 180°, 270°", "180° only"],
                    correctIndex: 1,
                  },
                ],
              },
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
