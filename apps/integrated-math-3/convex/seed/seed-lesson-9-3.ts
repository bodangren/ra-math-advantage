import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Circular and Periodic Functions",
          slug: lessonSlug,
          description:
            "Students find values of trigonometric functions given a point on a unit circle or the measure of a special angle, and find values of trigonometric functions that model periodic events.",
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
          title: "Circular and Periodic Functions",
          description:
            "Students find values of trigonometric functions given a point on a unit circle or the measure of a special angle, and find values of trigonometric functions that model periodic events.",
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
                "## Explore: Trigonometric Functions of Special Angles\n\nUse the online activity to complete the explore.\n\n**Inquiry Question:**\nHow can you use special right triangles and the unit circle to find the exact trigonometric values of special angles?",
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
                title: "Special Angles Explorer",
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
                "## Key Terms\n\n- **unit circle**: a circle with radius 1 and center at the origin\n- **circular function**: a function that describes points on the unit circle as functions of angle\n- **periodic function**: a function that repeats its values at regular intervals\n- **cycle**: one full repeating pattern of a periodic function\n- **period**: the horizontal length of one cycle",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Circular Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Circular Functions\n\nA **unit circle** has radius `1` and center at the origin.\n\nIf the terminal side of angle `theta` intersects the unit circle at `P(x, y)`, then:\n\n- `cos theta = x`\n- `sin theta = y`\n\nSo `P(x, y) = P(cos theta, sin theta)`.\n\nThese are **circular functions** because they describe points on the unit circle as functions of angle.",
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
                "## Example 1 — Find Sine and Cosine Given a Point on the Unit Circle\n\nIf the terminal side intersects the unit circle at `(-12/13, 5/13)`, then:\n\n- `cos theta = -12/13`\n- `sin theta = 5/13`",
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
                    question: "If P(-12/13, 5/13) is on the unit circle, what is cos theta?",
                    options: ["5/13", "-12/13", "12/13"],
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
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Find Trigonometric Values of Special Angles\n\nFind the six trigonometric functions for `5pi/4`.\n\nOn the unit circle: `(cos theta, sin theta) = (-sqrt(2)/2, -sqrt(2)/2)`\n\nSo:\n\n- `sin theta = -sqrt(2)/2`\n- `cos theta = -sqrt(2)/2`\n- `tan theta = 1`\n- `csc theta = -sqrt(2)`\n- `sec theta = -sqrt(2)`\n- `cot theta = 1`",
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
                    question: "What is tan(5pi/4)?",
                    options: ["-1", "1", "0"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Periodic Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Periodic Functions\n\nA **periodic function** repeats its values at regular intervals.\n\n- one full repeating pattern is a **cycle**\n- the horizontal length of a cycle is the **period**\n\nFor sine and cosine:\n\n- `sin(x + 2pi) = sin x`\n- `cos(x + 2pi) = cos x`\n\nso both have period `2pi`.",
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
                "## Example 3 — Identify the Period of a Function\n\nFrom the graph, the pattern repeats every `3pi/2`.\n\nSo the period is `3pi/2`.",
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
                    question: "If a graph repeats every 3pi/2, what is the period?",
                    options: ["3pi/2", "2pi", "pi/2"],
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
                "## Example 4 — Graph Periodic Functions\n\nA carousel rider starts at the point closest to a wall, `20` feet away. The carousel diameter is `50` feet and it completes `10` rotations per minute.\n\n- closest distance: `20` ft\n- farthest distance: `70` ft\n\nSince the carousel completes `10` rotations per minute: `60` seconds / `10` rotations = `6` seconds per rotation.\n\nSo the period is `6` seconds.\n\nKey points: (0, 20), (1.5, 45), (3, 70), (4.5, 45), (6, 20).\n\nThe graph repeats every `6` seconds.",
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
                    question: "If a carousel completes 10 rotations per minute, what is the period in seconds?",
                    options: ["6 seconds", "10 seconds", "60 seconds"],
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
                "## Example 5 — Evaluate Trigonometric Expressions\n\nFind `cos(10pi/3)`.\n\nUse periodicity:\n\n`cos(10pi/3) = cos(4pi/3 + 2pi) = cos(4pi/3)`\n\nFrom the unit circle: `cos(4pi/3) = -1/2`\n\nSo `cos(10pi/3) = -1/2`.",
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
                    question: "What is cos(10pi/3)?",
                    options: ["1/2", "-1/2", "sqrt(3)/2"],
                    correctIndex: 1,
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
                "## Discussion Questions\n\n1. How does the unit circle help you find exact trigonometric values?\n2. What does it mean for a function to be periodic?\n3. How can you use periodicity to evaluate trigonometric expressions?",
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
                    question: "What is the period of sine and cosine?",
                    options: ["pi", "2pi", "1"],
                    correctIndex: 1,
                  },
                  {
                    question: "If P(x, y) is on the unit circle, what is sin theta?",
                    options: ["x", "y", "1"],
                    correctIndex: 1,
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
                "## Reflection\n\nToday you learned about circular and periodic functions. Consider the following:\n\n- How do you find trigonometric values using the unit circle?\n- What is the relationship between angle measure and coordinates on the unit circle?\n- How does periodicity simplify evaluating trigonometric expressions?\n- What questions do you still have about circular and periodic functions?",
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
