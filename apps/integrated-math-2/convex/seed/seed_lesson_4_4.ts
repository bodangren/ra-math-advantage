import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_4Result> => {
    const now = Date.now();
    const lessonSlug = "4-4-solving-right-triangles";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Solving Right Triangles",
          slug: lessonSlug,
          description: "Students use inverse trig functions to find missing angles and sides in right triangles.",
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
          title: "Solving Right Triangles",
          description: "Students use inverse trig functions to find missing angles and sides in right triangles.",
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
              markdown: "## Explore: Finding Angles\n\nIf you know two sides of a right triangle, you can find the angles using inverse trig functions. $\\theta = \\sin^{-1}(\\text{opp/hyp})$, $\\theta = \\cos^{-1}(\\text{adj/hyp})$, or $\\theta = \\tan^{-1}(\\text{opp/adj})$.",
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
                    question: "If sin θ = 0.5, then θ =",
                    options: ["30°", "45°", "60°", "90°"],
                    correctIndex: 0,
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
              markdown: "## Solving Right Triangles\n\n### Given Two Sides\n1. Use Pythagorean Theorem if needed to find the third side\n2. Use inverse trig to find one acute angle\n3. Subtract from 90° to find the other angle\n\n### Given One Side and One Angle\n1. Use trig to find the other sides\n2. Subtract from 90° to find the other angle\n\n### Inverse Functions\n- $\\sin^{-1}(x)$ or $\\arcsin(x)$: angle whose sine is $x$\n- $\\cos^{-1}(x)$ or $\\arccos(x)$: angle whose cosine is $x$\n- $\\tan^{-1}(x)$ or $\\arctan(x)$: angle whose tangent is $x$",
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
              markdown: "## Example: Solve a Right Triangle\n\nIn right triangle ABC, $a = 8$ and $c = 17$. Find all missing parts.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "solve_triangle",
                equation: "a = 8, c = 17, find b, ∠A, ∠B",
                steps: [
                  { expression: "b² = 17² - 8² = 289 - 64 = 225", explanation: "Pythagorean Theorem" },
                  { expression: "b = 15", explanation: "Square root" },
                  { expression: "sin A = 8/17, A = sin⁻¹(8/17) ≈ 28.1°", explanation: "Find angle A" },
                  { expression: "B = 90° - 28.1° = 61.9°", explanation: "Find angle B" },
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
                    question: "If cos θ = 3/5, then θ ≈",
                    options: ["36.9°", "53.1°", "45°", "30°"],
                    correctIndex: 1,
                  },
                  {
                    question: "In a right triangle, if one acute angle is 35°, the other is:",
                    options: ["35°", "45°", "55°", "65°"],
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
                    question: "A right triangle has legs 7 and 24. What is the angle opposite the side of length 7?",
                    options: ["16.3°", "73.7°", "28.1°", "61.9°"],
                    correctIndex: 0,
                  },
                  {
                    question: "In right triangle ABC with right angle at C, if ∠A = 42° and a = 10, what is the hypotenuse c?",
                    options: ["10 × sin 42°", "10 / sin 42°", "10 × cos 42°", "10 / cos 42°"],
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
