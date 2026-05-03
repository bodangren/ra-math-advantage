import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_1Result> => {
    const now = Date.now();
    const lessonSlug = "2-1-polygon-basics-angle-sums";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Polygon Basics and Angle Sums",
          slug: lessonSlug,
          description: "Students classify polygons and apply the Polygon Angle-Sum Theorem.",
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
          title: "Polygon Basics and Angle Sums",
          description: "Students classify polygons and apply the Polygon Angle-Sum Theorem.",
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
              markdown: "## Explore: Sums of Interior Angles\n\nFor a triangle, the interior angles sum to 180\\degree. Draw a quadrilateral and split it into triangles. What is the sum of its interior angles? Try a pentagon next.",
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
                    question: "What is the sum of interior angles of a quadrilateral?",
                    options: ["180\\degree", "360\\degree", "540\\degree", "720\\degree"],
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
              markdown: "## Polygon Angle-Sum Theorem\n\n### Interior Angles\nThe sum of interior angles of an $n$-gon is:\n$$S = (n - 2) \\times 180\\degree$$\n\n| Polygon | n | Sum |\n|---------|---|-----|\n| Triangle | 3 | 180\\degree |\n| Quadrilateral | 4 | 360\\degree |\n| Pentagon | 5 | 540\\degree |\n| Hexagon | 6 | 720\\degree |\n\n### Exterior Angles\nThe sum of exterior angles of **any** convex polygon is 360\\degree.\n\n### Regular Polygon\nEach interior angle of a regular $n$-gon: $\\frac{(n-2) \\times 180}{n}$\nEach exterior angle of a regular $n$-gon: $\\frac{360}{n}$",
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
              markdown: "## Example: Find the Sum of Interior Angles\n\nFind the sum of interior angles of a regular octagon.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "angle_sum",
                equation: "S = (n - 2) × 180, n = 8",
                steps: [
                  { expression: "S = (8 - 2) × 180", explanation: "Substitute n = 8" },
                  { expression: "S = 6 × 180", explanation: "Simplify" },
                  { expression: "S = 1080\\degree", explanation: "Sum of interior angles" },
                  { expression: "Each angle = 1080 / 8 = 135\\degree", explanation: "For a regular octagon" },
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
                    question: "What is the sum of interior angles of a hexagon?",
                    options: ["540\\degree", "720\\degree", "900\\degree", "1080\\degree"],
                    correctIndex: 1,
                  },
                  {
                    question: "Each interior angle of a regular pentagon measures:",
                    options: ["72\\degree", "108\\degree", "120\\degree", "135\\degree"],
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
                    question: "A polygon has interior angles summing to 1440\\degree. How many sides does it have?",
                    options: ["8", "9", "10", "12"],
                    correctIndex: 2,
                  },
                  {
                    question: "What is each exterior angle of a regular hexagon?",
                    options: ["30\\degree", "45\\degree", "60\\degree", "72\\degree"],
                    correctIndex: 2,
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
