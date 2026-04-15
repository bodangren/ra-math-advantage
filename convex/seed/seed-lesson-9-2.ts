import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson9_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson9_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson9_2Result> => {
    const now = Date.now();
    const lessonSlug = "module-9-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 9,
          title: "Trigonometric Functions of General Angles",
          slug: lessonSlug,
          description:
            "Students find values of trigonometric functions for acute angles, general angles, and by using reference angles.",
          orderIndex: 2,
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
          title: "Trigonometric Functions of General Angles",
          description:
            "Students find values of trigonometric functions for acute angles, general angles, and by using reference angles.",
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
                "## Explore: Trigonometric Functions\n\nUse the online activity to complete the explore.\n\n**Inquiry Question:**\nHow do you evaluate trigonometric functions for angles that are not acute?",
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
                title: "Trig Function Explorer",
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
                "## Key Terms\n\n- **trigonometry**: the study of relationships among sides and angles of triangles\n- **trigonometric ratio**: a ratio of the lengths of two sides of a right triangle\n- **trigonometric function**: a function of an angle that expresses a relationship between the lengths of sides\n- **sine**: `sin theta = opp/hyp`\n- **cosine**: `cos theta = adj/hyp`\n- **tangent**: `tan theta = opp/adj`\n- **cosecant**: `csc theta = hyp/opp`\n- **secant**: `sec theta = hyp/adj`\n- **cotangent**: `cot theta = adj/opp`\n- **quadrantal angle**: an angle whose terminal side lies on an axis\n- **reference angle**: the acute angle between the terminal side of an angle and the x-axis",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Trigonometric Functions in Right Triangles",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Trigonometric Functions in a Right Triangle\n\nFor angle `theta` in a right triangle:\n\n- `sin theta = opp/hyp`\n- `cos theta = adj/hyp`\n- `tan theta = opp/adj`\n- `csc theta = hyp/opp`\n- `sec theta = hyp/adj`\n- `cot theta = adj/opp`",
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
                "## Example 1 — Evaluate Trigonometric Functions\n\nGiven a right triangle with:\n\n- opposite `= 28`\n- adjacent `= 45`\n- hypotenuse `= 53`\n\nFind the six trigonometric functions.\n\n- `sin theta = 28/53`\n- `cos theta = 45/53`\n- `tan theta = 28/45`\n- `csc theta = 53/28`\n- `sec theta = 53/45`\n- `cot theta = 45/28`",
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
                    question: "What is sin theta given opp=28, hyp=53?",
                    options: ["28/53", "45/53", "28/45"],
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
                "## Example 2 — Find Trigonometric Ratios\n\nIf `cos A = 9/13`, find the other five trigonometric functions.\n\nUse a right triangle with adjacent `9` and hypotenuse `13`.\n\nBy the Pythagorean Theorem: `a^2 + 9^2 = 13^2` → `a^2 = 88` → `a = 2sqrt(22)`\n\n- `sin A = 2sqrt(22)/13`\n- `cos A = 9/13`\n- `tan A = 2sqrt(22)/9`\n- `csc A = 13/(2sqrt(22))`\n- `sec A = 13/9`\n- `cot A = 9/(2sqrt(22))`",
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
                    question: "If cos A = 9/13, what is sin A?",
                    options: ["9/13", "2sqrt(22)/13", "13/9"],
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
        title: "Learn: Trigonometric Functions of General Angles",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Trigonometric Functions of General Angles\n\nIf point `P(x, y)` lies on the terminal side of angle `theta`, and `r = sqrt(x^2 + y^2)`, then:\n\n- `sin theta = y/r`\n- `cos theta = x/r`\n- `tan theta = y/x`\n- `csc theta = r/y`\n- `sec theta = r/x`\n- `cot theta = x/y`\n\nA **quadrantal angle** has its terminal side on an axis.",
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
                "## Example 3 — Evaluate Trig Functions Given a Point\n\nThe terminal side of `theta` contains `(-6, 4)`.\n\nFirst find `r = sqrt((-6)^2 + 4^2) = sqrt(52) = 2sqrt(13)`.\n\nThen:\n\n- `sin theta = 4/(2sqrt(13)) = 2sqrt(13)/13`\n- `cos theta = -6/(2sqrt(13)) = -3sqrt(13)/13`\n- `tan theta = 4/(-6) = -2/3`\n- `csc theta = sqrt(13)/2`\n- `sec theta = -sqrt(13)/3`\n- `cot theta = -3/2`",
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
                    question: "For terminal side through (-6, 4), what is tan theta?",
                    options: ["4/(-6)", "-3/2", "-2/3"],
                    correctIndex: 2,
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
                "## Example 4 — Evaluate Trig Functions of Quadrantal Angles\n\nThe terminal side contains `(-5, 0)`, so `theta = 180°`.\n\nUsing `x = -5`, `y = 0`, and `r = 5`:\n\n- `sin theta = 0`\n- `cos theta = -1`\n- `tan theta = 0`\n- `csc theta` is undefined\n- `sec theta = -1`\n- `cot theta` is undefined",
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
                    question: "For theta = 180°, what is cos theta?",
                    options: ["0", "-1", "1"],
                    correctIndex: 1,
                  },
                  {
                    question: "For theta = 180°, what is csc theta?",
                    options: ["0", "1", "undefined"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Learn: Trigonometric Functions with Reference Angles",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reference Angles\n\nThe **reference angle** is the acute angle between the terminal side and the x-axis.\n\n### Key Concept: Evaluating with Reference Angles\n\n1. Find the reference angle\n2. Evaluate the function at the reference angle\n3. Apply the correct sign based on the quadrant",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Find Reference Angles\n\n### a. `155°`\n\nThis lies in Quadrant II, so: `theta' = 180° - 155° = 25°`\n\n### b. `-8pi/3`\n\nFirst find a positive coterminal angle: `-8pi/3 + 4pi = 4pi/3`\n\nThis lies in Quadrant III, so: `theta' = 4pi/3 - pi = pi/3`",
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
                    question: "What is the reference angle for 155°?",
                    options: ["25°", "35°", "155°"],
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
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Use a Reference Angle to Find a Trigonometric Value\n\nFind the exact value of `tan(7pi/4)`.\n\nThe angle lies in Quadrant IV.\n\nReference angle: `2pi - 7pi/4 = pi/4`\n\nSince tangent is negative in Quadrant IV: `tan(7pi/4) = -tan(pi/4) = -1`",
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
                    question: "What is tan(7pi/4)?",
                    options: ["1", "-1", "0"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Use Trigonometric Functions\n\nA softball pitcher has arm length `28` inches and shoulder height `57` inches. Find the height of the ball when the arm is positioned with reference angle `42°`.\n\nUse: `sin 42° = y/28`\n\nSo: `y = 28 sin 42° ≈ 18.7`\n\nAdd shoulder height: `18.7 + 57 = 75.7`\n\nThe ball is about `75.7` inches high.",
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
                    question: "If arm length is 28 inches and sin 42° ≈ 0.669, what is y?",
                    options: ["18.7 inches", "28 inches", "57 inches"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How do you evaluate trigonometric functions for angles beyond 90°?\n2. Why are reference angles useful?\n3. How do you determine the sign of a trigonometric function in each quadrant?",
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
                    question: "What is the reference angle for an angle in Quadrant II?",
                    options: ["180° minus the angle", "90° minus the angle", "the angle"],
                    correctIndex: 0,
                  },
                  {
                    question: "Which trigonometric functions are positive in Quadrant III?",
                    options: ["sine only", "tangent only", "cosine and sine"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 14,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about trigonometric functions of general angles. Consider the following:\n\n- How do you evaluate trigonometric functions using the unit circle?\n- How do reference angles help evaluate trigonometric functions?\n- What questions do you still have about trigonometric functions?",
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