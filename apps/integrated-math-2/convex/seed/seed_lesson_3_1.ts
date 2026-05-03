import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_1Result> => {
    const now = Date.now();
    const lessonSlug = "3-1-similar-figures-scale-factors";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Similar Figures and Scale Factors",
          slug: lessonSlug,
          description: "Students identify similar figures and compute scale factors.",
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
          title: "Similar Figures and Scale Factors",
          description: "Students identify similar figures and compute scale factors.",
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
              markdown: "## Explore: What Makes Figures Similar?\n\nTwo figures are **similar** if they have the same shape but not necessarily the same size. Corresponding angles are congruent and corresponding sides are proportional.",
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
                    question: "For two similar figures, corresponding angles are:",
                    options: ["Supplementary", "Congruent", "Complementary", "Proportional"],
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
              markdown: "## Similar Figures\n\n### Definition\nTwo figures are similar ($\\sim$) if:\n1. All pairs of corresponding angles are congruent\n2. All pairs of corresponding sides are proportional\n\n### Scale Factor\nThe ratio of corresponding side lengths is the **scale factor**.\n\nIf $\\triangle ABC \\sim \\triangle DEF$ with scale factor $k$:\n- $\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF} = k$\n\n### Perimeter and Area Ratios\n- Perimeter ratio = scale factor ($k$)\n- Area ratio = $k^2$\n- Volume ratio = $k^3$ (for 3D figures)",
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
              markdown: "## Example: Find the Scale Factor\n\nTriangle ABC has sides 3, 4, 5. Triangle DEF has sides 6, 8, 10. Find the scale factor from ABC to DEF.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "scale_factor",
                equation: "Find scale factor from △ABC to △DEF",
                steps: [
                  { expression: "6/3 = 2", explanation: "Ratio of first pair of sides" },
                  { expression: "8/4 = 2", explanation: "Ratio of second pair" },
                  { expression: "10/5 = 2", explanation: "Ratio of third pair" },
                  { expression: "Scale factor = 2", explanation: "All ratios are equal" },
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
                    question: "Two similar rectangles have sides 5 and 15. The scale factor is:",
                    options: ["1/3", "3", "10", "75"],
                    correctIndex: 1,
                  },
                  {
                    question: "If the scale factor is 3, the area ratio is:",
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
                    question: "Similar triangles have a scale factor of 4. If the smaller has perimeter 15, the larger has perimeter:",
                    options: ["19", "30", "60", "240"],
                    correctIndex: 2,
                  },
                  {
                    question: "All squares are similar to each other because:",
                    options: ["They have equal sides", "All angles are 90° and all sides are proportional", "They have the same area", "Diagonals are equal"],
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
