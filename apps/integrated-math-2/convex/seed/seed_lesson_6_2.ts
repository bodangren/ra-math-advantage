import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_2Result> => {
    const now = Date.now();
    const lessonSlug = "6-2-surface-area-3d";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Surface Area of 3D Figures",
          slug: lessonSlug,
          description: "Students calculate surface area of prisms, cylinders, pyramids, cones, and spheres.",
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
          title: "Surface Area of 3D Figures",
          description: "Students calculate surface area of prisms, cylinders, pyramids, cones, and spheres.",
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
              markdown: "## Explore: Wrapping a Gift\n\nSurface area is the total area of all faces of a 3D object. Imagine wrapping a gift — how much paper do you need?",
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
                    question: "A rectangular prism has 6 faces. To find surface area, you:",
                    options: ["Multiply length × width × height", "Add the area of all 6 faces", "Find 2 × base area", "Only measure the top"],
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
              markdown: "## Surface Area Formulas\n\n- **Rectangular Prism**: $SA = 2(lw + lh + wh)$\n- **Cylinder**: $SA = 2\\pi r^2 + 2\\pi rh$\n- **Sphere**: $SA = 4\\pi r^2$\n- **Cone**: $SA = \\pi r^2 + \\pi rl$ (where $l$ is slant height)\n- **Square Pyramid**: $SA = b^2 + 2bl$\n\n### Lateral vs Total Surface Area\n- **Lateral area** = surface area minus bases\n- **Total surface area** = lateral + bases",
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
              markdown: "## Example: Cylinder Surface Area\n\nFind the surface area of a cylinder with radius 3 and height 10.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "surface_area",
                equation: "SA = 2πr² + 2πrh",
                steps: [
                  { expression: "SA = 2π(3²) + 2π(3)(10)", explanation: "Substitute r = 3, h = 10" },
                  { expression: "SA = 18π + 60π", explanation: "Calculate each part" },
                  { expression: "SA = 78π ≈ 245.04", explanation: "Add and approximate" },
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
                    question: "A rectangular prism is 4 × 5 × 6. Surface area =",
                    options: ["120", "148", "74", "60"],
                    correctIndex: 1,
                  },
                  {
                    question: "A sphere with radius 5 has surface area = (4πr²)",
                    options: ["20π", "100π", "400π", "50π"],
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
                    question: "A cone has radius 4 and slant height 5. SA = πr² + πrl =",
                    options: ["16π + 20π = 36π", "16π + 10π = 26π", "16π + 20 = 16π + 20", "20π"],
                    correctIndex: 0,
                  },
                  {
                    question: "The lateral area of a cylinder (no bases) is:",
                    options: ["2πr²", "2πrh", "πrl", "πr² + 2πrh"],
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
