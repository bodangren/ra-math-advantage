import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_7Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-7";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Inverse Trigonometric Functions",
          slug: lessonSlug,
          description:
            "Students find values of angle measures by using inverse trigonometric functions.",
          orderIndex: 7,
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
          title: "Inverse Trigonometric Functions",
          description:
            "Students find values of angle measures by using inverse trigonometric functions.",
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
              markdown:
                "## Explore: Inverse Trigonometric Functions\n\nUse the online activity to complete the explore.\n\n**Inquiry Question:**\nHow can you use inverse trigonometric functions to find angle measures?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = sin(x)",
                title: "Inverse Trigonometric Functions Explorer",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **inverse trigonometric functions**: functions that return angle measures; also called arc functions\n- **principal values**: the restricted outputs of inverse trigonometric functions that ensure they are functions",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Inverse Trigonometric Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Inverse Trigonometric Functions\n\nInverse trigonometric functions return angle measures.\n\nBecause sine, cosine, and tangent are not one-to-one over all real numbers, their domains must be restricted so the inverses are functions. These restricted outputs are called **principal values**.\n\n### Key Concept: Inverse Trigonometric Functions\n\n- `Arcsin x` or `Sin^-1 x`\n  - domain: `-1 <= x <= 1`\n  - range: `-pi/2 <= y <= pi/2`\n- `Arccos x` or `Cos^-1 x`\n  - domain: `-1 <= x <= 1`\n  - range: `0 <= y <= pi`\n- `Arctan x` or `Tan^-1 x`\n  - domain: all real numbers\n  - range: `-pi/2 <= y <= pi/2`",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Evaluate Inverse Trigonometric Functions\n\nFind:\n\n`Tan^-1(sqrt(3))`\n\nUse the principal range for tangent, `-90°` to `90°`.\n\nSince:\n\n`tan 60° = sqrt(3)`\n\nwe have:\n\n`Tan^-1(sqrt(3)) = 60° = pi/3`",
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
                    question: "What is Tan^-1(sqrt(3))?",
                    options: ["60° = pi/3", "30° = pi/6", "45° = pi/4"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the principal range for tangent?",
                    options: ["-90° to 90°", "0° to 180°", "-180° to 180°"],
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
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Find a Trigonometric Value by Using a Calculator\n\nFind:\n\n`sin(Cos^-1(0.36))`\n\nUsing a calculator:\n\n`sin(Cos^-1(0.36)) ≈ 0.93`",
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
                    question: "What is sin(Cos^-1(0.36)) approximately?",
                    options: ["0.93", "0.36", "0.64"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the domain of Cos^-1 x?",
                    options: ["-1 <= x <= 1", "all real numbers", "x > 0"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Find an Angle Measure by Using a Graphing Calculator\n\nIf:\n\n`Sin theta = -0.17`\n\nthen:\n\n`theta = Arcsin(-0.17) ≈ -9.79°`",
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
                    question: "If Sin theta = -0.17, what is theta approximately?",
                    options: ["-9.79°", "9.79°", "-0.17°"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the range of Arcsin x?",
                    options: ["-pi/2 <= y <= pi/2", "0 <= y <= pi", "all real numbers"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Use Inverse Trigonometric Functions\n\nA plane has `30` miles to land from an elevation of `15,000` feet. Find the angle of descent.\n\n### Step 1: Draw the triangle\n\nOpposite side:\n\n`15,000` feet\n\nAdjacent side:\n\n`30` miles\n\n### Step 2: Write and solve the trig equation\n\nConvert miles to feet:\n\n`30 * 5280 = 158,400`\n\nUse tangent:\n\n`tan theta = 15,000 / 158,400`\n\nTake the inverse tangent:\n\n`theta = Tan^-1(15,000 / 158,400) ≈ 5.4°`\n\nSo the angle of descent is about `5.4°`.",
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
                    question: "How many feet are in 30 miles?",
                    options: ["158,400", "15,000", "5280"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the angle of descent approximately?",
                    options: ["5.4°", "15,000°", "30°"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why must the domain of sine, cosine, and tangent be restricted for their inverses to be functions?\n2. What are the principal values for Arcsin, Arccos, and Arctan?\n3. How can you use a calculator to find an angle measure given a trigonometric value?\n4. When might inverse trigonometric functions be useful in real-world situations?",
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
                    question: "Why must domains be restricted for inverse trig functions?",
                    options: [
                      "Sine, cosine, and tangent are not one-to-one over all real numbers",
                      "Their values are always positive",
                      "They have no inverses",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "Which inverse trig function has all real numbers as its domain?",
                    options: ["Arctan", "Arcsin", "Arccos"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about inverse trigonometric functions. Consider the following:\n\n- How do you find the principal value of an inverse trigonometric function?\n- What are the domain and range restrictions for Arcsin, Arccos, and Arctan?\n- What questions do you still have about inverse trigonometric functions?",
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
