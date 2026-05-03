import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_8Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_8 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_8Result> => {
    const now = Date.now();
    const lessonSlug = "2-8-inverse-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Inverse Functions",
          slug: lessonSlug,
          description: "Students find inverse functions algebraically and graphically, and verify compositions.",
          orderIndex: 8,
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
          title: "Inverse Functions",
          description: "Students find inverse functions algebraically and graphically, and verify compositions.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "compare_functions",
                equations: ["y = 2x + 3", "y = (x - 3)/2"],
                title: "Explore Inverse Functions",
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
              markdown: "## Inverse Functions\n\n### Definition\n\n$f^{-1}$ is the inverse of $f$ if $f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$.\n\n### Finding the Inverse\n\n1. Replace $f(x)$ with $y$\n2. Swap $x$ and $y$\n3. Solve for $y$\n4. Replace $y$ with $f^{-1}(x)$\n\n### Properties\n\n- The graph of $f^{-1}$ is the reflection of $f$ over $y = x$\n- Domain of $f$ = Range of $f^{-1}$\n- Range of $f$ = Domain of $f^{-1}$\n- A function has an inverse iff it is **one-to-one** (passes horizontal line test)",
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
              markdown: "## Example: Finding an Inverse\n\nFind the inverse of $f(x) = 3x - 7$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "f(x) = 3x - 7",
                steps: [
                  { expression: "y = 3x - 7", explanation: "Replace f(x) with y" },
                  { expression: "x = 3y - 7", explanation: "Swap x and y" },
                  { expression: "x + 7 = 3y", explanation: "Solve for y" },
                  { expression: "y = (x + 7)/3", explanation: "Divide by 3" },
                  { expression: "f⁻¹(x) = (x + 7)/3", explanation: "Write the inverse" },
                  { expression: "Verify: f(f⁻¹(x)) = 3·((x+7)/3) - 7 = x ✓", explanation: "Check composition" },
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "The inverse of $f(x) = 2x + 5$ is:",
                    options: ["f⁻¹(x) = 2x - 5", "f⁻¹(x) = (x - 5)/2", "f⁻¹(x) = (x + 5)/2", "f⁻¹(x) = x/2 - 5"],
                    correctIndex: 1,
                  },
                  {
                    question: "The graph of an inverse function is a reflection over:",
                    options: ["The x-axis", "The y-axis", "The line y = x", "The origin"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "g(x) = (x + 1)/(x - 2)",
                steps: [
                  { expression: "y = (x + 1)/(x - 2)", explanation: "Replace g(x) with y" },
                  { expression: "x = (y + 1)/(y - 2)", explanation: "Swap x and y" },
                  { expression: "x(y - 2) = y + 1", explanation: "Cross multiply" },
                  { expression: "xy - 2x = y + 1", explanation: "Distribute" },
                  { expression: "xy - y = 2x + 1", explanation: "Collect y terms" },
                  { expression: "y(x - 1) = 2x + 1", explanation: "Factor" },
                  { expression: "g⁻¹(x) = (2x + 1)/(x - 1)", explanation: "Solve for y" },
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
