import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_6Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-6";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Translations of Trigonometric Graphs",
          slug: lessonSlug,
          description:
            "Students graph horizontal and vertical translations of trigonometric functions and model real-world situations.",
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
          title: "Translations of Trigonometric Graphs",
          description:
            "Students graph horizontal and vertical translations of trigonometric functions and model real-world situations.",
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
                "## Explore: Analyzing Trigonometric Functions by Using Technology\n\nUse the online activity to complete the explore.\n\n**Inquiry Question:**\nHow does adding a constant to, subtracting a constant from, or multiplying a constant by a function affect the graph of a trigonometric function?",
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
                title: "Trigonometric Transformations Explorer",
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
                "## Key Terms\n\n- **phase shift**: A horizontal translation of a trigonometric graph\n- **vertical shift**: A vertical translation of a trigonometric graph",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Horizontal Translations",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Horizontal Translations of Trigonometric Functions\n\nA horizontal translation of a trigonometric graph is called a **phase shift**.\n\n### Key Concept: Phase Shift\n\nFor:\n\n- `y = a sin b(x - h)`\n- `y = a cos b(x - h)`\n- `y = a tan b(x - h)`\n\nthe phase shift is `h`.\n\n- if `h > 0`, shift right\n- if `h < 0`, shift left",
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
                "## Example 1 — Graph a Phase Shift\n\nFor:\n\n`y = cos(x - 270°)`\n\n- amplitude `= 1`\n- period `= 360°`\n- phase shift `= 270°` right\n\nThe domain is all real numbers, and the range is `-1 <= y <= 1`.",
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
                    question: "What is the phase shift of y = cos(x - 270°)?",
                    options: ["270° right", "270° left", "135° right"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the period of y = cos(x - 270°)?",
                    options: ["360°", "180°", "720°"],
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
                "## Example 2 — Graph a Transformation of a Trigonometric Function\n\nFor:\n\n`y = 3 sin(x + pi/4)`\n\n- amplitude `= 3`\n- period `= 2pi`\n- phase shift `= pi/4` left\n\nThe graph is stretched vertically and shifted left.\n\nDomain: all real numbers  \nRange: `-3 <= y <= 3`",
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
                    question: "What is the amplitude of y = 3 sin(x + pi/4)?",
                    options: ["3", "pi/4", "2pi"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the phase shift of y = 3 sin(x + pi/4)?",
                    options: ["pi/4 left", "pi/4 right", "3 left"],
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
        title: "Learn: Vertical Translations",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vertical Translations of Trigonometric Functions\n\nA vertical translation is called a **vertical shift**.\n\n### Key Concept: Vertical Shift\n\nFor:\n\n- `y = a sin(bx) + k`\n- `y = a cos(bx) + k`\n- `y = a tan(bx) + k`\n\nthe vertical shift is `k`.\n\nThe midline is:\n\n`y = k`",
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
                "## Example 3 — Graph a Vertical Shift\n\nFor:\n\n`y = tan(1/2 x) - 1`\n\n- period `= 180° / (1/2) = 360°`\n- vertical shift `= -1`\n- midline `= y = -1`\n\nThe graph is shifted down `1` unit.\n\nDomain: all real numbers except `180n°`\n\nRange: all real numbers",
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
                    question: "What is the vertical shift of y = tan(1/2 x) - 1?",
                    options: ["-1", "1", "1/2"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the midline of y = tan(1/2 x) - 1?",
                    options: ["y = -1", "y = 0", "y = 1"],
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
                "## Example 4 — Model Translations of Trigonometric Functions\n\nA jump rope oscillates between heights `0` and `108` inches and hits the ground twice each second. It begins at height `0`.\n\nUse a cosine model.\n\n### Step 1: Find the midline and amplitude\n\n- midline `= (0 + 108)/2 = 54`\n- amplitude `= (108 - 0)/2 = 54`\n\n### Step 2: Find the period and `b`\n\nThe rope completes one cycle in `0.5` second, so:\n\n`0.5 = 2pi / b`\n\n`b = 4pi`\n\n### Step 3: Find the phase shift\n\nBecause cosine starts at a maximum and the rope starts at `0`, the graph is shifted to the right by `0.25`.\n\n### Step 4: Write the function\n\n`y = 54 cos(4pi(x - 0.25)) + 54`\n\nThis models the jump rope height.",
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
                    question: "What is the amplitude of the jump rope model?",
                    options: ["54", "108", "27"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the midline of the jump rope model?",
                    options: ["y = 54", "y = 0", "y = 108"],
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
                "## Example 5 — Write a Trigonometric Function from a Graph\n\nFrom the graph:\n\n- maximum `= 5`\n- minimum `= -1`\n\nSo:\n\n- midline `= 2`\n- amplitude `= 3`\n\nThe maximum has shifted right by `pi`, so:\n\n- phase shift `= pi`\n\nThe period is `4pi`, so:\n\n`4pi = 2pi/|b|`\n\n`b = 0.5`\n\nFunction:\n\n`y = 3 cos(0.5(x - pi)) + 2`",
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
                    question: "What is the amplitude of the function?",
                    options: ["3", "2", "5"],
                    correctIndex: 0,
                  },
                  {
                    question: "What is the midline of the function?",
                    options: ["y = 2", "y = 5", "y = -1"],
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
                "## Discussion Questions\n\n1. How does a phase shift affect the domain of a trigonometric function?\n2. How does a vertical shift affect the range of a trigonometric function?\n3. How can you determine the phase shift from an equation in the form y = a sin b(x - h)?\n4. How does the midline relate to the vertical shift?",
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
                    question: "How does a phase shift affect the domain?",
                    options: [
                      "It shifts the domain left or right",
                      "It changes the range",
                      "It changes the period",
                    ],
                    correctIndex: 0,
                  },
                  {
                    question: "How does a vertical shift affect the range?",
                    options: [
                      "It moves the range up or down",
                      "It changes the period",
                      "It changes the amplitude",
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
                "## Reflection\n\nToday you learned about graphing translations of trigonometric functions. Consider the following:\n\n- How do you identify the phase shift from an equation?\n- How do you find the midline from an equation?\n- What questions do you still have about graphing trigonometric transformations?",
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