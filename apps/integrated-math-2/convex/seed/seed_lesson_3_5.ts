import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_5Result> => {
    const now = Date.now();
    const lessonSlug = "3-5-applications-similarity";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Applications of Similarity",
          slug: lessonSlug,
          description: "Students apply similarity concepts to real-world problems including scale drawings and maps.",
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
          title: "Applications of Similarity",
          description: "Students apply similarity concepts to real-world problems including scale drawings and maps.",
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
              markdown: "## Explore: Scale Drawings\n\nMaps, blueprints, and models use scale factors. A scale of 1:100 means 1 unit on the drawing equals 100 units in real life.",
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
                    question: "A map scale is 1 inch = 50 miles. If two cities are 3 inches apart on the map, the actual distance is:",
                    options: ["53 miles", "100 miles", "150 miles", "50 miles"],
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
              markdown: "## Real-World Similarity Applications\n\n### Scale Drawings\n- Scale factor = drawing length / actual length\n- A scale of 1:200 means 1 cm represents 200 cm\n\n### Maps\n- Convert map distances to real distances using the scale\n- Always check units!\n\n### Similar Triangles in Architecture\n- Engineers use similar triangles to find heights and distances\n- Surveyors use triangulation to map terrain\n\n### Area and Volume Scaling\n- If a figure is scaled by factor $k$:\n  - Perimeter scales by $k$\n  - Area scales by $k^2$\n  - Volume scales by $k^3$",
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
              markdown: "## Example: Scale Model\n\nA model car is built at a scale of 1:18. If the real car is 4.5 meters long, how long is the model?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "scale_model",
                equation: "model/real = 1/18",
                steps: [
                  { expression: "model / 4.5 = 1 / 18", explanation: "Set up the proportion" },
                  { expression: "model = 4.5 / 18", explanation: "Solve for model length" },
                  { expression: "model = 0.25 meters = 25 cm", explanation: "Convert to convenient units" },
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
                    question: "A blueprint scale is 1/4 inch = 1 foot. A room measures 2 inches on the blueprint. Actual room length?",
                    options: ["4 feet", "8 feet", "16 feet", "2 feet"],
                    correctIndex: 1,
                  },
                  {
                    question: "If a figure is enlarged by scale factor 3, the area increases by a factor of:",
                    options: ["3", "6", "9", "27"],
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
                    question: "A photograph is enlarged by 150%. If the original area was 20 sq inches, the new area is:",
                    options: ["30 sq in", "45 sq in", "60 sq in", "22.5 sq in"],
                    correctIndex: 1,
                  },
                  {
                    question: "Two similar buildings have heights in ratio 2:5. If the smaller has floor area 4000 sq ft, the larger has:",
                    options: ["10000 sq ft", "25000 sq ft", "8000 sq ft", "20000 sq ft"],
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
