import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson12_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson12_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson12_5Result> => {
    const now = Date.now();
    const lessonSlug = "12-5-quadratic-applications";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 12,
          title: "Quadratic Applications",
          slug: lessonSlug,
          description: "Students model and solve real-world problems using quadratic functions.",
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
          title: "Quadratic Applications",
          description: "Students model and solve real-world problems using quadratic functions.",
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
              markdown: "## Explore: Real-World Parabolas\n\nWhen you throw a ball, its height follows a quadratic path:\nh(t) = −16t² + 32t + 6\n\nWhat does each term represent? When does the ball reach its maximum height? When does it hit the ground?",
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
                    question: "In h(t) = -16t² + 32t + 6, the -16t² represents:",
                    options: ["Initial height", "Effect of gravity", "Initial velocity", "Time squared"],
                    correctIndex: 1,
                  },
                  {
                    question: "The maximum height of a projectile occurs at the:",
                    options: ["Y-intercept", "X-intercept", "Vertex", "Origin"],
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
              markdown: "## Quadratic Applications\n\n### Common Applications\n1. **Projectile motion**: h(t) = −16t² + v₀t + h₀\n2. **Area problems**: Find dimensions given area\n3. **Revenue/profit**: Price × quantity models\n4. **Geometry**: Maximum/minimum values\n\n### Problem-Solving Strategy\n1. Define variables\n2. Write the quadratic model\n3. Find key features (vertex, zeros, y-intercept)\n4. Interpret in context\n\n### Key Interpretations\n- Vertex: maximum or minimum value\n- Zeros: break-even points, landing times\n- Positive/negative regions: when something is above/below a threshold",
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
              markdown: "## Example: Projectile Motion\n\nA ball is thrown upward with initial velocity 48 ft/s from a height of 5 ft.\nh(t) = −16t² + 48t + 5\nFind the maximum height and when the ball hits the ground.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "quadratic-application",
                equation: "h(t) = -16t² + 48t + 5",
                steps: [
                  { expression: "t = -48/(2 × -16) = 1.5 seconds", explanation: "Time of maximum height" },
                  { expression: "h(1.5) = -16(2.25) + 48(1.5) + 5 = -36 + 72 + 5 = 41 ft", explanation: "Maximum height" },
                  { expression: "Maximum height is 41 feet at t = 1.5 seconds", explanation: "Interpret vertex" },
                  { expression: "0 = -16t² + 48t + 5", explanation: "Set h(t) = 0 for when ball hits ground" },
                  { expression: "t = (-48 ± √(2304 + 320)) / (-32) ≈ 3.1 seconds", explanation: "Use quadratic formula" },
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
                    question: "A farmer has 100 ft of fencing. Area = x(50 - x). Maximum area occurs at x =",
                    options: ["25", "50", "100", "0"],
                    correctIndex: 0,
                  },
                  {
                    question: "Revenue R = -2p² + 80p. The price that maximizes revenue is:",
                    options: ["$20", "$40", "$80", "$10"],
                    correctIndex: 0,
                  },
                  {
                    question: "The zeros of a quadratic model represent:",
                    options: ["Maximum values", "Times or values where the output is zero", "The vertex", "The y-intercept"],
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
                    question: "h(t) = -16t² + 64t. Maximum height is:",
                    options: ["64 ft", "16 ft", "48 ft", "32 ft"],
                    correctIndex: 0,
                  },
                  {
                    question: "If a quadratic models profit, the vertex represents:",
                    options: ["Break-even point", "Maximum or minimum profit", "Starting profit", "Time of zero profit"],
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
