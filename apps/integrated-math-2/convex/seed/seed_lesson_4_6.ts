import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_6Result> => {
    const now = Date.now();
    const lessonSlug = "4-6-law-of-cosines";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Law of Cosines",
          slug: lessonSlug,
          description: "Students apply the Law of Cosines to solve non-right triangles.",
          orderIndex: 6,
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
          title: "Law of Cosines",
          description: "Students apply the Law of Cosines to solve non-right triangles.",
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
              markdown: "## Explore: SAS and SSS\n\nWhen you know two sides and the included angle (SAS), or all three sides (SSS), the Law of Sines alone isn't enough. The Law of Cosines extends the Pythagorean Theorem to all triangles.",
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
                    question: "When the angle is 90°, the Law of Cosines reduces to:",
                    options: ["Law of Sines", "Pythagorean Theorem", "Area formula", "Nothing useful"],
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
              markdown: "## Law of Cosines\n\n### Formula\n$$c^2 = a^2 + b^2 - 2ab\\cos C$$\n\nSimilarly:\n- $a^2 = b^2 + c^2 - 2bc\\cos A$\n- $b^2 = a^2 + c^2 - 2ac\\cos B$\n\n### When to Use\n- **SAS**: Two sides and the included angle → find the third side\n- **SSS**: Three sides → find an angle (rearrange to solve for cos)\n\n### Finding an Angle from SSS\n$$\\cos C = \\frac{a^2 + b^2 - c^2}{2ab}$$",
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
              markdown: "## Example: Find a Side (SAS)\n\nIn triangle ABC, $a = 8$, $b = 11$, $\\angle C = 37\\degree$. Find $c$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "law_of_cosines",
                equation: "c² = a² + b² - 2ab cos C",
                steps: [
                  { expression: "c² = 8² + 11² - 2(8)(11)cos 37°", explanation: "Substitute values" },
                  { expression: "c² = 64 + 121 - 176(0.7986)", explanation: "Calculate terms" },
                  { expression: "c² = 185 - 140.55", explanation: "Multiply" },
                  { expression: "c² = 44.45", explanation: "Subtract" },
                  { expression: "c ≈ 6.67", explanation: "Square root" },
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
                    question: "With sides a=7, b=10, c=12, find cos C: (7²+10²-12²)/(2×7×10)",
                    options: ["0.136", "0.864", "-0.136", "0.5"],
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
                    question: "For SAS, which formula do you use first?",
                    options: ["Law of Sines", "Law of Cosines", "Pythagorean Theorem", "Area formula"],
                    correctIndex: 1,
                  },
                  {
                    question: "If a=5, b=7, C=60°, then c² equals:",
                    options: ["39", "74", "25", "51"],
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
