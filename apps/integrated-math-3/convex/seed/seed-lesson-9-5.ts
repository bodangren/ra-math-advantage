import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Graphing Other Trigonometric Functions",
          slug: lessonSlug,
          description:
            "Students graph and analyze tangent functions and reciprocal trigonometric functions.",
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
          title: "Graphing Other Trigonometric Functions",
          description:
            "Students graph and analyze tangent functions and reciprocal trigonometric functions.",
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
                "## Explore: Graphing Other Trigonometric Functions\n\nUse the online activity to explore how tangent and reciprocal trigonometric functions behave.\n\n**Inquiry Question:**\nHow do the parameters a and b in y = a tan(bx) affect the graph's asymptotes and period?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = tan(x)",
                title: "Tangent and Reciprocal Graphing Explorer",
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
                "## Key Terms\n\n- **reciprocal trigonometric functions**: cosecant, secant, and cotangent, defined as the reciprocals of sine, cosine, and tangent respectively",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Tangent Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Tangent Functions\n\nBecause `tan x = sin x / cos x`, tangent is undefined where `cos x = 0`, so its graph has vertical asymptotes there.\n\nFor `y = tan x`:\n\n- domain: all real numbers except `(90 + 180n)°`\n- range: all real numbers\n- period: `180°`\n- midline: `y = 0`\n- one x-intercept per cycle\n\nFor `y = a tan bx`:\n\n- period `= 180°/|b|`\n- asymptotes at `(90 + 180n)° / |b|`\n- `a` controls vertical stretch/compression and reflection\n- `b` controls horizontal stretch/compression",
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
                "## Example 1 — Graph a Tangent Function with a Dilation\n\nGraph: `y = tan 3x`\n\n- period `= 180°/3 = 60°`\n- asymptotes at `(90 + 180n)° / 3 = 30° + 60n°`\n- x-intercepts at integer multiples of `60°`\n- midline: `y = 0`\n\nThe graph is horizontally compressed relative to `y = tan x`.",
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
                    question: "What is the period of y = tan 3x?",
                    options: ["60°", "180°", "90°"],
                    correctIndex: 0,
                  },
                  {
                    question: "Where are the asymptotes of y = tan 3x?",
                    options: ["30° + 60n°", "90° + 180n°", "60° + 180n°"],
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
                "## Example 2 — Graph a Tangent Function with a Dilation and a Reflection\n\nGraph: `y = -(1/3) tan 2x`\n\n- period `= pi/2`\n- asymptotes at `pi/4 + n(pi/2)`\n- x-intercepts at multiples of `pi/2`\n- midline: `y = 0`\n\nTransformations:\n\n- vertically compressed\n- horizontally compressed\n- reflected across the x-axis",
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
                    question: "What is the period of y = -(1/3) tan 2x?",
                    options: ["pi/2", "pi", "2pi"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which transformation is applied to y = -(1/3) tan 2x?",
                    options: [
                      "Reflected across the x-axis",
                      "Reflected across the y-axis",
                      "Shifted up by 1/3",
                    ],
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
        title: "Learn: Graphing Reciprocal Trigonometric Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Reciprocal Trigonometric Functions\n\nThe reciprocal trigonometric functions are:\n\n- `csc x = 1/sin x`\n- `sec x = 1/cos x`\n- `cot x = 1/tan x`\n\nTheir asymptotes occur where the corresponding sine, cosine, or tangent value is `0`.\n\n### Key Concept: Graphs of Reciprocal Functions\n\n- `y = csc x`\n  - period `360°`\n  - range `y <= -1` or `y >= 1`\n- `y = sec x`\n  - period `360°`\n  - range `y <= -1` or `y >= 1`\n- `y = cot x`\n  - period `180°`\n  - range all real numbers",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Graph a Cosecant Function\n\nGraph: `y = csc 0.5x`\n\nSince it is the reciprocal of `sin 0.5x`:\n\n- period `= 2pi/0.5 = 4pi`\n- asymptotes occur where `sin 0.5x = 0`, so `x = 2pi n`\n- midline: `y = 0`\n\nRelative extrema occur at the same x-values as the corresponding maxima and minima of `sin 0.5x`.",
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
                    question: "What is the period of y = csc 0.5x?",
                    options: ["4pi", "2pi", "pi"],
                    correctIndex: 0,
                  },
                  {
                    question: "Where do the asymptotes of y = csc 0.5x occur?",
                    options: ["x = 2pi n", "x = pi n", "x = pi/2 n"],
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
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Graph a Cotangent Function\n\nGraph: `y = -4 cot 2x`\n\nSince cotangent is the reciprocal of tangent:\n\n- period `= 180°/2 = 90°`\n- asymptotes at `x = 90n°`\n- x-intercepts at odd multiples of `45°`\n- midline: `y = 0`",
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
                    question: "What is the period of y = -4 cot 2x?",
                    options: ["90°", "180°", "45°"],
                    correctIndex: 0,
                  },
                  {
                    question: "Where are the asymptotes of y = -4 cot 2x?",
                    options: ["x = 90n°", "x = 45n°", "x = 180n°"],
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
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Apply a Reciprocal Trigonometric Function\n\nA banner plane is `1200` feet above a festival. Let `d` be the distance from the crowd to the banner and `x` the angle of elevation.\n\n### Part A: Write a function\n\nUse: `sin x = 1200/d`\n\nSo: `d = 1200/sin x = 1200 csc x`\n\n### Part B: Graph the function\n\n- period `= 360°`\n- asymptotes where `sin x = 0`, so `x = 180n°`\n\n### Part C: Analyze key features in context\n\nFor `0° < x < 180°`:\n\n- domain: `0 < x < 180`\n- range: `d >= 1200`\n- x-intercept: none\n- y-intercept: none\n- relative minimum: `(90, 1200)`\n- decreasing on `(0, 90)`\n- increasing on `(90, 180)`",
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
                    question: "What function models the distance d from the crowd to the banner?",
                    options: ["d = 1200 csc x", "d = 1200 sin x", "d = 1200 sec x"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the range of d for 0° < x < 180°?",
                    options: ["d >= 1200", "d <= 1200", "d > 0"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Where do the vertical asymptotes of y = tan x occur, and why?\n2. How does the period of y = tan x compare to the period of y = sin x?\n3. What is the relationship between the asymptotes of y = sec x and the zeros of y = cos x?\n4. How do amplitude and period affect the graph of a reciprocal trigonometric function?",
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
                    question: "Where do the vertical asymptotes of y = tan x occur?",
                    options: [
                      "Where cos x = 0",
                      "Where sin x = 0",
                      "Where tan x = 0",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the period of y = cot x?",
                    options: ["180°", "360°", "90°"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which function is the reciprocal of sin x?",
                    options: ["csc x", "sec x", "cot x"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about graphing tangent and reciprocal trigonometric functions. Consider the following:\n\n- How do you find the period and asymptotes of a tangent function?\n- How do the graphs of csc x, sec x, and cot x relate to sin x, cos x, and tan x?\n- What questions do you still have about graphing trigonometric functions?",
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
