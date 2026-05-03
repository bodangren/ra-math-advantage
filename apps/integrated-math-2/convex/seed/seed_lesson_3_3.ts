import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_3Result> => {
    const now = Date.now();
    const lessonSlug = "3-3-proportions-indirect-measurement";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Proportions and Indirect Measurement",
          slug: lessonSlug,
          description: "Students use similar triangles to solve indirect measurement problems.",
          orderIndex: 3,
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
          title: "Proportions and Indirect Measurement",
          description: "Students use similar triangles to solve indirect measurement problems.",
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
              markdown: "## Explore: Measuring the Unmeasurable\n\nHow can you find the height of a tall building without climbing it? Use shadows! If a 6-foot person casts a 4-foot shadow, and the building casts a 40-foot shadow, you can set up a proportion.",
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
                    question: "If a 5-ft person casts a 3-ft shadow, and a tree casts a 15-ft shadow, how tall is the tree?",
                    options: ["9 ft", "25 ft", "15 ft", "45 ft"],
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
              markdown: "## Indirect Measurement\n\n### Shadow Method\nWhen the sun hits two objects at the same angle, the triangles formed are similar by AA.\n\n$$\\frac{\\text{height}_1}{\\text{shadow}_1} = \\frac{\\text{height}_2}{\\text{shadow}_2}$$\n\n### Mirror Method\nPlace a mirror on the ground between you and an object. When you can see the top of the object in the mirror, the angle of incidence equals the angle of reflection, creating similar triangles.\n\n### Proportion Setup\n1. Identify the two similar triangles\n2. Match corresponding parts\n3. Set up the proportion\n4. Cross-multiply and solve",
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
              markdown: "## Example: Shadow Problem\n\nA flagpole casts a 24-foot shadow. At the same time, a 5-foot person casts a 4-foot shadow. Find the height of the flagpole.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "proportion",
                equation: "h/24 = 5/4",
                steps: [
                  { expression: "h/24 = 5/4", explanation: "Set up proportion (height/shadow)" },
                  { expression: "4h = 120", explanation: "Cross-multiply" },
                  { expression: "h = 30", explanation: "Divide by 4" },
                  { expression: "The flagpole is 30 feet tall", explanation: "State the answer" },
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
                    question: "A 6-ft person casts a 4-ft shadow. A building casts a 30-ft shadow. Building height?",
                    options: ["20 ft", "45 ft", "180 ft", "120 ft"],
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
                    question: "Two similar triangles have corresponding sides 8 and 20. A third side of the smaller triangle is 12. What is the corresponding side of the larger?",
                    options: ["15", "24", "30", "60"],
                    correctIndex: 2,
                  },
                  {
                    question: "Why does the shadow method work for finding heights?",
                    options: ["Shadows stretch at different rates", "The sun's rays create similar triangles", "The ground is always flat", "Shadows are always proportional to width"],
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
