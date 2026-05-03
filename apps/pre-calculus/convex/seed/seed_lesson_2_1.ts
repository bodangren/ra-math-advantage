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
    const lessonSlug = "2-1-arithmetic-geometric-sequences";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Arithmetic vs. Geometric Sequences",
          slug: lessonSlug,
          description: "Students distinguish between arithmetic (additive) and geometric (multiplicative) sequences and write explicit and recursive formulas.",
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
          title: "Arithmetic vs. Geometric Sequences",
          description: "Students distinguish between arithmetic (additive) and geometric (multiplicative) sequences and write explicit and recursive formulas.",
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
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "Which sequence is arithmetic: 2, 5, 8, 11, ... or 2, 6, 18, 54, ...?",
                    options: ["First is arithmetic", "Second is arithmetic", "Both are arithmetic", "Neither is arithmetic"],
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
              markdown: "## Arithmetic vs. Geometric Sequences\n\n### Arithmetic Sequences\n- **Pattern**: Add a constant difference $d$ each term\n- **Recursive**: $a_n = a_{n-1} + d$\n- **Explicit**: $a_n = a_1 + (n-1)d$\n- **Graph**: Points lie on a straight line\n\n### Geometric Sequences\n- **Pattern**: Multiply by a constant ratio $r$ each term\n- **Recursive**: $a_n = r \\cdot a_{n-1}$\n- **Explicit**: $a_n = a_1 \\cdot r^{n-1}$\n- **Graph**: Points lie on an exponential curve\n\n### How to Identify\n- Look at **differences**: Constant → arithmetic\n- Look at **ratios**: Constant → geometric",
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
              markdown: "## Example: Identify and Write Formulas\n\nClassify each sequence and write the explicit formula.\n\na) 5, 9, 13, 17, ...\nb) 3, 12, 48, 192, ...",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Sequence analysis",
                steps: [
                  { expression: "a) Differences: 9-5=4, 13-9=4, 17-13=4", explanation: "Constant difference of 4" },
                  { expression: "Arithmetic: a_n = 5 + (n-1)(4) = 4n + 1", explanation: "Explicit formula" },
                  { expression: "b) Ratios: 12/3=4, 48/12=4, 192/48=4", explanation: "Constant ratio of 4" },
                  { expression: "Geometric: a_n = 3 · 4^(n-1)", explanation: "Explicit formula" },
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
                    question: "The 10th term of the arithmetic sequence 7, 11, 15, ... is:",
                    options: ["43", "47", "39", "35"],
                    correctIndex: 0,
                  },
                  {
                    question: "The 5th term of the geometric sequence 2, 6, 18, ... is:",
                    options: ["48", "162", "54", "324"],
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
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Sequence: 100, 80, 64, 51.2, ...",
                steps: [
                  { expression: "Ratios: 80/100=0.8, 64/80=0.8", explanation: "Check ratios" },
                  { expression: "Geometric with r = 0.8", explanation: "Constant ratio" },
                  { expression: "a_n = 100 · (0.8)^(n-1)", explanation: "Explicit formula" },
                  { expression: "a_6 = 100 · (0.8)^5 = 100 · 0.32768 ≈ 32.77", explanation: "Find the 6th term" },
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
