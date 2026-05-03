import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_4Result> => {
    const now = Date.now();
    const lessonSlug = "5-4-tangents-and-secants";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Tangents and Secants",
          slug: lessonSlug,
          description: "Students explore tangent and secant line relationships with circles.",
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
          title: "Tangents and Secants",
          description: "Students explore tangent and secant line relationships with circles.",
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
              markdown: "## Explore: Tangent Lines\n\nA tangent line touches a circle at exactly one point. Draw a radius to the point of tangency. What angle does the tangent form with the radius?",
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
                    question: "A tangent line is perpendicular to the radius at the point of tangency. The angle is:",
                    options: ["45°", "60°", "90°", "180°"],
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
              markdown: "## Tangent and Secant Theorems\n\n### Tangent Theorems\n1. A tangent is perpendicular to the radius at the point of tangency\n2. Tangent segments from the same external point are congruent\n\n### Secant-Tangent Angle\nAn angle formed by a tangent and a chord equals half the intercepted arc.\n\n### Secant-Secant, Secant-Tangent, Tangent-Tangent\nAngles formed outside the circle equal half the difference of the intercepted arcs.\n$$m\\angle = \\frac{1}{2}(\\text{large arc} - \\text{small arc})$$",
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
              markdown: "## Example: Secant-Tangent Angle\n\nA tangent and secant form an angle outside the circle. The intercepted arcs are 150° and 50°. Find the angle.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "secant_tangent_angle",
                equation: "m∠ = 1/2(large arc - small arc)",
                steps: [
                  { expression: "m∠ = 1/2(150° - 50°)", explanation: "Half the difference of arcs" },
                  { expression: "m∠ = 1/2(100°)", explanation: "Subtract" },
                  { expression: "m∠ = 50°", explanation: "The angle is 50°" },
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
                    question: "Two tangent segments from an external point are 8 and x. x equals:",
                    options: ["4", "8", "16", "Cannot be determined"],
                    correctIndex: 1,
                  },
                  {
                    question: "An angle outside a circle intercepts arcs of 200° and 80°. The angle is:",
                    options: ["60°", "70°", "120°", "140°"],
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
                    question: "The radius is 5 and the tangent segment from an external point to the point of tangency is 12. The distance from the external point to the center is:",
                    options: ["7", "13", "17", "√119"],
                    correctIndex: 1,
                  },
                  {
                    question: "A tangent-chord angle intercepts an arc of 100°. The angle is:",
                    options: ["50°", "80°", "100°", "200°"],
                    correctIndex: 0,
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
