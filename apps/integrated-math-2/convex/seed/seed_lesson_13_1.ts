import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson13_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson13_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson13_1Result> => {
    const now = Date.now();
    const lessonSlug = "13-1-fundamental-trig-identities";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Fundamental Trig Identities",
          slug: lessonSlug,
          description: "Students learn and apply reciprocal, quotient, and cofunction trigonometric identities.",
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
          title: "Fundamental Trig Identities",
          description: "Students learn and apply reciprocal, quotient, and cofunction trigonometric identities.",
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
              markdown: "## Explore: Hidden Connections\n\nOn a unit circle at 30°: sin(30°) = 1/2 and cos(30°) = √3/2.\n\nWhat is tan(30°)? What is 1/cos(30°)? Can you express tan in terms of sin and cos?",
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
                    question: "tan(θ) equals:",
                    options: ["sin(θ) × cos(θ)", "sin(θ) / cos(θ)", "cos(θ) / sin(θ)", "1 / sin(θ)"],
                    correctIndex: 1,
                  },
                  {
                    question: "csc(θ) is the reciprocal of:",
                    options: ["cos(θ)", "sin(θ)", "tan(θ)", "sec(θ)"],
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
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Fundamental Trig Identities\n\n### Reciprocal Identities\ncsc(θ) = 1/sin(θ)\nsec(θ) = 1/cos(θ)\ncot(θ) = 1/tan(θ)\n\n### Quotient Identities\ntan(θ) = sin(θ)/cos(θ)\ncot(θ) = cos(θ)/sin(θ)\n\n### Cofunction Identities\nsin(θ) = cos(90° − θ)\ntan(θ) = cot(90° − θ)\nsec(θ) = csc(90° − θ)\n\n### Even-Odd Identities\nsin(−θ) = −sin(θ) (odd)\ncos(−θ) = cos(θ) (even)\ntan(−θ) = −tan(θ) (odd)",
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
              markdown: "## Example: Simplify Using Identities\n\nSimplify sin(θ) × sec(θ).",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "identity-simplification",
                equation: "sin(θ) × sec(θ)",
                steps: [
                  { expression: "sin(θ) × sec(θ)", explanation: "Original expression" },
                  { expression: "sin(θ) × 1/cos(θ)", explanation: "Apply reciprocal identity: sec = 1/cos" },
                  { expression: "sin(θ)/cos(θ)", explanation: "Multiply" },
                  { expression: "= tan(θ)", explanation: "Apply quotient identity" },
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "cos(θ) × csc(θ) simplifies to:",
                    options: ["sin(θ)", "cot(θ)", "tan(θ)", "1"],
                    correctIndex: 1,
                  },
                  {
                    question: "sin(40°) equals:",
                    options: ["cos(40°)", "cos(50°)", "sin(50°)", "tan(50°)"],
                    correctIndex: 1,
                  },
                  {
                    question: "sec(θ) × cos(θ) equals:",
                    options: ["1", "sin(θ)", "tan(θ)", "csc(θ)"],
                    correctIndex: 0,
                  },
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
                    question: "sin(θ)/csc(θ) simplifies to:",
                    options: ["sin²(θ)", "1", "tan(θ)", "cos(θ)"],
                    correctIndex: 0,
                  },
                  {
                    question: "If sin(−θ) = −0.6, then sin(θ) =",
                    options: ["-0.6", "0.6", "0.4", "-0.4"],
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
