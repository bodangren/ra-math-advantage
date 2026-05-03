import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson6_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson6_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6_5Result> => {
    const now = Date.now();
    const lessonSlug = "6-5-cross-sections-composite";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 6,
          title: "Cross Sections and Composite Solids",
          slug: lessonSlug,
          description: "Students analyze cross sections of 3D figures and calculate volumes of composite solids.",
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
          title: "Cross Sections and Composite Solids",
          description: "Students analyze cross sections of 3D figures and calculate volumes of composite solids.",
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
              markdown: "## Explore: Slicing Shapes\n\nA **cross section** is the 2D shape you get when you slice through a 3D figure. What shape do you get when you slice a cylinder parallel to its base? Perpendicular?",
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
                    question: "A cross section of a sphere is always a:",
                    options: ["Square", "Rectangle", "Circle", "Triangle"],
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
              markdown: "## Cross Sections and Composite Solids\n\n### Cross Sections\n- **Cylinder**: parallel to base → circle; perpendicular → rectangle\n- **Cone**: parallel to base → circle; through vertex → triangle\n- **Rectangular prism**: any parallel slice → rectangle\n- **Sphere**: any slice → circle\n\n### Composite Solids\nTo find volume of composite solids:\n1. Break the solid into simpler shapes\n2. Find the volume of each part\n3. Add (or subtract) volumes\n\n### Example\nA cylinder with a cone on top: $V = \\pi r^2 h_{\\text{cyl}} + \\frac{1}{3}\\pi r^2 h_{\\text{cone}}$",
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
              markdown: "## Example: Composite Solid Volume\n\nA capsule shape consists of a cylinder (radius 3, height 10) with hemispheres on both ends. Find total volume.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "composite_volume",
                equation: "V = V_cylinder + 2 × V_hemisphere",
                steps: [
                  { expression: "V_cyl = π(3²)(10) = 90π", explanation: "Cylinder volume" },
                  { expression: "V_hemi = 2/3 π(3³) = 18π", explanation: "Each hemisphere" },
                  { expression: "V_total = 90π + 2(18π) = 90π + 36π = 126π", explanation: "Add all parts" },
                  { expression: "V ≈ 395.84", explanation: "Approximate" },
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
                    question: "A silo is a cylinder (r=4, h=20) topped with a hemisphere (r=4). Total volume = cylinder + hemisphere.",
                    options: ["320π + 128/3 π", "320π + 64π", "320π + 256/3 π", "320π + 32π"],
                    correctIndex: 2,
                  },
                  {
                    question: "A cross section of a cone cut parallel to the base is a:",
                    options: ["Triangle", "Rectangle", "Circle", "Ellipse"],
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
                    question: "To find volume of a composite solid, you should:",
                    options: ["Use one formula", "Break it into simpler shapes and add volumes", "Measure the outside only", "Average all dimensions"],
                    correctIndex: 1,
                  },
                  {
                    question: "A rectangular prism (4×5×6) with a pyramid (same base, h=3) on top. Total V =",
                    options: ["120 + 20 = 140", "120 + 60 = 180", "120 + 30 = 150", "120 + 120 = 240"],
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
