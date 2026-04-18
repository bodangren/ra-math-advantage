import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Graphing Sine and Cosine Functions",
          slug: lessonSlug,
          description:
            "Students graph and analyze sine and cosine functions, and model periodic real-world situations with sine and cosine functions.",
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
          title: "Graphing Sine and Cosine Functions",
          description:
            "Students graph and analyze sine and cosine functions, and model periodic real-world situations with sine and cosine functions.",
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
                "## Explore: Graphing Sine and Cosine Functions\n\nUse the online activity to explore how sine and cosine functions behave.\n\n**Inquiry Question:**\nHow do the parameters a and b in y = a sin(bx) and y = a cos(bx) affect the graph's amplitude and period?",
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
                title: "Sine and Cosine Graphing Explorer",
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
                "## Key Terms\n\n- **oscillation**: a back-and-forth movement between two points\n- **midline**: the horizontal line halfway between the maximum and minimum values of a periodic function\n- **amplitude**: half the distance between the maximum and minimum values; for y = a sin(bx) or y = a cos(bx), amplitude = |a|\n- **sinusoidal function**: a function that produces a sine or cosine wave\n- **frequency**: the number of cycles per unit time; the reciprocal of the period",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Graphing Sine and Cosine Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Graphing Sine and Cosine Functions\n\nSine and cosine are oscillating functions.\n\n- the **midline** is halfway between the maximum and minimum\n- the **amplitude** is half the distance between the maximum and minimum\n\nFor `y = a sin bx` or `y = a cos bx`:\n\n- amplitude `= |a|`\n- period `= 360°/|b|` or `2pi/|b|`",
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
                "## Example 1 — Identify the Amplitude and Period from a Graph\n\nFrom the graph:\n\n- maximum `= 4`\n- minimum `= -4`\n\nAmplitude:\n\n`(4 - (-4))/2 = 4`\n\nMidline:\n\n`y = 0`\n\nThe graph repeats every `pi`, so the period is:\n\n`pi`",
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
                    question: "If a graph has maximum = 4 and minimum = -4, what is the amplitude?",
                    options: ["2", "4", "8"],
                    correctIndex: 1,
                  },
                  {
                    question: "If the graph repeats every pi, what is the period?",
                    options: ["pi", "2pi", "360"],
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
                "## Example 2 — Identify the Amplitude and Period from an Equation\n\nFor `f(x) = 3 cos 5x`:\n\n- amplitude `= 3`\n- period `= 360°/5 = 72°`",
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
                    question: "What is the amplitude of f(x) = 3 cos 5x?",
                    options: ["3", "5", "15"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the period of f(x) = 3 cos 5x in degrees?",
                    options: ["72°", "360°", "5°"],
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
                "## Example 3 — Graph a Sine Function\n\nGraph: `y = 0.5 sin 4x`\n\n### Step 1: Find the amplitude\n\n`|a| = 0.5`\n\n### Step 2: Find the period\n\n`360°/4 = 90°`\n\n### Step 3: Find key points\n\nx-intercepts: `(0, 0)`, `(45°, 0)`, `(90°, 0)`\n\nMaximum: `(22.5°, 0.5)`\n\nMinimum: `(67.5°, -0.5)`\n\nPlot these points and draw the sine curve.",
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
                    question: "What is the amplitude of y = 0.5 sin 4x?",
                    options: ["0.5", "4", "0.125"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the period of y = 0.5 sin 4x in degrees?",
                    options: ["90°", "360°", "45°"],
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
                "## Example 4 — Graph a Cosine Function\n\nGraph: `y = 2 cos 3x`\n\n### Step 1: Find the amplitude\n\n`|a| = 2`\n\n### Step 2: Find the period\n\n`360°/3 = 120°`\n\n### Step 3: Find key points\n\n- maximum at `(0, 2)`\n- x-intercepts at `(30°, 0)` and `(90°, 0)`\n- minimum at `(60°, -2)`\n\nPlot the points and sketch the curve.",
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
                    question: "What is the amplitude of y = 2 cos 3x?",
                    options: ["2", "3", "6"],
                    correctIndex: 0,
                  },
                  {
                    question: "At what x-value does y = 2 cos 3x first reach its maximum?",
                    options: ["0", "30°", "60°"],
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
        title: "Learn: Modeling with Sine and Cosine Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Modeling with Sine and Cosine Functions\n\nSine and cosine functions are also called **sinusoidal functions**.\n\nThe **frequency** is the number of cycles per unit time and is the reciprocal of the period.\n\n### Key Concept: Modeling with `y = a sin bx` and `y = a cos bx`\n\n1. Use the amplitude to find `a`\n2. Use the period or frequency to find `b`\n3. Write the function",
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
                "## Example 5 — Characteristics of the Sine and Cosine Functions\n\nFor: `y = 40 cos(pi t)`\n\n### Part A: Find period and frequency\n\n`period = 2pi/pi = 2`\n\n`frequency = 1/2`\n\nInterpretation: The object completes half a cycle per second and reaches its maximum every `2` seconds.\n\n### Part B: Identify domain and range in context\n\n- relevant domain: `[0, infinity)`\n- range: `[-40, 40]`",
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
                    question: "What is the period of y = 40 cos(pi t)?",
                    options: ["2", "pi", "40"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the frequency of y = 40 cos(pi t)?",
                    options: ["1/2", "2", "pi"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the range of y = 40 cos(pi t)?",
                    options: ["[-40, 40]", "[0, 40]", "[-40, 0]"],
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
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Model Periodic Situations\n\nThe voltage in an outlet oscillates between `-120` and `120` volts with frequency `50` cycles per second. Write a function for voltage `v` as a function of time `t`.\n\n### Step 1: Find the amplitude\n\n`a = 120`\n\n### Step 2: Find the period and `b`\n\n`period = 1/50`\n\nUse: `2pi/b = 1/50`\n\nSo: `b = 100pi`\n\n### Step 3: Write the function\n\n`v = 120 sin(100pi t)`\n\nThis models the voltage as a periodic sine function.",
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
                    question: "What is the amplitude of the voltage function?",
                    options: ["120", "50", "100"],
                    correctIndex: 0,
                  },
                  {
                    question: "If frequency is 50 cycles per second, what is b in v = a sin(bt)?",
                    options: ["100pi", "50", "2pi"],
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
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How does the value of a in y = a sin(bx) affect the graph?\n2. How does the value of b affect the period of the function?\n3. What is the difference between amplitude and frequency?\n4. How can you determine the midline of a sine or cosine graph?",
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
                    question: "What does amplitude measure?",
                    options: [
                      "Half the distance between max and min",
                      "The number of cycles per unit time",
                      "The horizontal length of one cycle",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "What does frequency measure?",
                    options: [
                      "Half the distance between max and min",
                      "The number of cycles per unit time",
                      "The horizontal length of one cycle",
                    ],
                    correctIndex: 1,
                  },
                  {
                    question: "For y = sin(x), what is the amplitude?",
                    options: ["1", "2pi", "0"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about graphing sine and cosine functions. Consider the following:\n\n- How do you find the amplitude and period from an equation?\n- How does changing a affect the graph of y = a sin(bx)?\n- How does changing b affect the period?\n- What questions do you still have about graphing trigonometric functions?",
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
