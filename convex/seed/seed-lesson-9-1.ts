import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_1Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Angles and Angle Measure",
          slug: lessonSlug,
          description:
            "Students draw angles in standard position, identify coterminal angles, and convert between degree and radian measures.",
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
          title: "Angles and Angle Measure",
          description:
            "Students draw angles in standard position, identify coterminal angles, and convert between degree and radian measures.",
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
                "## Explore: Arc Length\n\nUse the online activity to complete the explore.\n\n**Inquiry Question:**\nHow can you use a central angle to determine the length of an arc?",
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
                    question: "A circle has radius 5. What is the arc length subtended by a central angle of 2 radians?",
                    options: ["10", "25", "5/2"],
                    correctIndex: 0,
                  },
                  {
                    question: "How many radians are in one full revolution?",
                    options: ["π", "2π", "360"],
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
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **standard position**: an angle with its vertex at the origin and initial side on the positive x-axis\n- **initial side**: the starting position of a rotating ray in standard position\n- **terminal side**: the final position of a rotating ray in standard position\n- **coterminal angles**: angles that share the same terminal side\n- **radian**: the measure of a central angle whose intercepted arc has the same length as the radius\n- **central angle of a circle**: an angle whose vertex is at the center of a circle",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Angles in Standard Position",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Angles in Standard Position\n\nAn angle is in **standard position** if:\n\n- its vertex is at the origin\n- its initial side lies on the positive x-axis\n\nPositive angles rotate counterclockwise. Negative angles rotate clockwise.\n\nAngles with the same terminal side are **coterminal angles**.\n\nYou can find coterminal angles by adding or subtracting multiples of `360°`.",
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
                "## Example 1 — Draw an Angle in Standard Position\n\nDraw an angle measuring `200°`.\n\nBecause the angle is positive, rotate counterclockwise.\n\nSince `200° = 180° + 20°`, the terminal side is `20°` past the negative x-axis.",
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
                    question: "To draw a 200° angle in standard position, which direction do you rotate?",
                    options: ["Clockwise", "Counterclockwise"],
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
                "## Example 2 — Draw an Angle with More Than One Rotation\n\nDraw an angle measuring `475°`.\n\n`475° = 360° + 115°`\n\nSo the angle makes one full counterclockwise rotation and then continues to `115°`.",
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
                    question: "How many full rotations does 475° represent?",
                    options: ["0", "1", "2"],
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
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Identify Coterminal Angles\n\nFind one positive and one negative angle coterminal with `35°`.\n\n- positive: `35° + 360° = 395°`\n- negative: `35° - 360° = -325°`\n\nFour different angles coterminal with `x°` are: `x° + 360°`, `x° - 360°`, `x° + 720°`, `x° - 720°`.",
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
                    question: "Which angle is coterminal with 35°?",
                    options: ["325°", "395°", "-35°"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn: Degrees and Radians",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Degrees and Radians\n\nA **radian** is the measure of an angle whose intercepted arc has the same length as the radius.\n\nOne full revolution is `2π` radians.\n\n### Key Concept: Convert Between Degrees and Radians\n\n- degrees to radians: multiply by `π/180`\n- radians to degrees: multiply by `180/π`\n\nCommon angle measures:\n\n- `30° = π/6`\n- `45° = π/4`\n- `60° = π/3`\n- `90° = π/2`\n\n### Key Concept: Arc Length\n\nFor radius `r` and central angle `θ` in radians: `s = rθ`",
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
                "## Example 4 — Convert Degrees to Radians\n\nRewrite `-100°` in radians.\n\n`-100 × π/180 = -5π/9`\n\nSo `-100° = -5π/9`.",
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
                    question: "What is -100° in radians?",
                    options: ["-5π/9", "-10π/18", "-π/2"],
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
                "## Example 5 — Convert Radians to Degrees\n\nRewrite `11π/4` in degrees.\n\n`(11π/4) × 180/π = 495°`",
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
                    question: "What is 11π/4 in degrees?",
                    options: ["450°", "495°", "540°"],
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
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Find Arc Length\n\nA traffic circle has diameter `160` feet. How far does a car travel if it goes three-fourths of the way around?\n\n**Step 1**: Find the angle in radians. Three-fourths of a full rotation is `(3/4)(2π) = 3π/2`.\n\n**Step 2**: Find the arc length. Radius `r = 80`. Arc length `s = 80 × 3π/2 = 120π ≈ 377`.\n\nSo the car travels about `377` feet.",
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
                    question: "What is the arc length for three-fourths of a 160-ft diameter circle?",
                    options: ["120π feet", "160π feet", "80π feet"],
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
                "## Discussion Questions\n\n1. How do you determine whether two angles are coterminal?\n2. Why is radian measure useful when finding arc length?\n3. What is the relationship between degrees and radians for a full circle?",
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
                    question: "How many radians are in a full circle?",
                    options: ["π", "2π", "360"],
                    correctIndex: 1,
                  },
                  {
                    question: "What is the formula for arc length?",
                    options: ["s = rθ", "s = r/θ", "s = θ/r"],
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
                "## Reflection\n\nToday you learned about angles and angle measure. Consider the following:\n\n- How do you draw an angle in standard position?\n- How do you find coterminal angles?\n- How do you convert between degrees and radians?\n- What questions do you still have about angle measure?",
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
