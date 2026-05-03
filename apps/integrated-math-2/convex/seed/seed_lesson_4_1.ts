import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_1Result> => {
    const now = Date.now();
    const lessonSlug = "4-1-pythagorean-theorem";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Pythagorean Theorem",
          slug: lessonSlug,
          description: "Students apply the Pythagorean Theorem and its converse to solve problems.",
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
          title: "Pythagorean Theorem",
          description: "Students apply the Pythagorean Theorem and its converse to solve problems.",
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
              markdown: "## Explore: Right Triangle Sides\n\nDraw a right triangle with legs of length 3 and 4. Use a ruler to measure the hypotenuse. Now try squaring each side: $3^2 + 4^2 = 9 + 16 = 25 = 5^2$. What pattern do you see?",
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
                    question: "In a right triangle, the side opposite the right angle is called the:",
                    options: ["Leg", "Base", "Hypotenuse", "Altitude"],
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
              markdown: "## Pythagorean Theorem\n\n### The Theorem\nFor a right triangle with legs $a$ and $b$ and hypotenuse $c$:\n$$a^2 + b^2 = c^2$$\n\n### Converse\nIf $a^2 + b^2 = c^2$ for a triangle with sides $a$, $b$, $c$, then the triangle is a right triangle.\n\n### Classification by Converse\n- $a^2 + b^2 = c^2$: Right triangle\n- $a^2 + b^2 > c^2$: Acute triangle\n- $a^2 + b^2 < c^2$: Obtuse triangle\n\n### Pythagorean Triples\nCommon integer triples: (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)",
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
              markdown: "## Example: Find the Hypotenuse\n\nFind the hypotenuse of a right triangle with legs 6 and 8.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "pythagorean",
                equation: "a² + b² = c²",
                steps: [
                  { expression: "6² + 8² = c²", explanation: "Substitute the legs" },
                  { expression: "36 + 64 = c²", explanation: "Square each leg" },
                  { expression: "100 = c²", explanation: "Add" },
                  { expression: "c = 10", explanation: "Take the square root" },
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
                    question: "A right triangle has legs 5 and 12. The hypotenuse is:",
                    options: ["13", "17", "√119", "7"],
                    correctIndex: 0,
                  },
                  {
                    question: "A triangle has sides 9, 12, 15. Is it a right triangle?",
                    options: ["Yes", "No"],
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
                    question: "A right triangle has hypotenuse 13 and one leg 5. The other leg is:",
                    options: ["8", "12", "√194", "18"],
                    correctIndex: 1,
                  },
                  {
                    question: "A ladder 10 ft long leans against a wall. The base is 6 ft from the wall. How high does it reach?",
                    options: ["4 ft", "8 ft", "√64 ft", "16 ft"],
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
