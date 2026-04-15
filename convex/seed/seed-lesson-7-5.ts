import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson7_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson7_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson7_5Result> => {
    const now = Date.now();
    const lessonSlug = "module-7-lesson-5";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 7,
          title: "Variation",
          slug: lessonSlug,
          description:
            "Students recognize and solve direct, joint, inverse, and combined variation equations.",
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
          title: "Variation",
          description:
            "Students recognize and solve direct, joint, inverse, and combined variation equations.",
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
                "## Explore: Variation\n\nUse the interactive tool to complete the explore.\n\n**Inquiry Question:**\nHow can you relate the dimensions of a rectangle with its area?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = kx",
                title: "Variation",
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
                "## Key Terms\n\n- **Direct variation**: A relationship where `y = kx` for some constant `k`.\n- **Constant of variation**: The constant `k` in a variation equation.\n- **Joint variation**: A relationship where one quantity varies directly as the product of two or more other quantities: `y = kxz`.\n- **Inverse variation**: A relationship where `xy = k` or `y = k/x`.\n- **Combined variation**: A relationship where one quantity varies directly and/or inversely with multiple others.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Direct Variation and Joint Variation",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Direct Variation and Joint Variation\n\nTwo quantities `x` and `y` are related by a **direct variation** if:\n\n`y = kx`\n\nwhere `k` is the constant of variation.\n\nThe graph of a direct variation is a line through the origin.\n\nIn **joint variation**, one quantity varies directly as the product of two or more other quantities:\n\n`y = kxz`",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Direct Variation\n\nIf `y` varies directly as `x` and `y = -3` when `x = 24`, find `y` when `x = -16`.\n\nUse a proportion:\n\n`y1/x1 = y2/x2`\n\n`-3/24 = y/(-16)`\n\nSo:\n\n`y = 2`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = kx",
                steps: [
                  { expression: "y1/x1 = y2/x2", explanation: "Set up the direct variation proportion" },
                  { expression: "-3/24 = y/(-16)", explanation: "Substitute the known values" },
                  { expression: "y = 2", explanation: "Solve for y" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Joint Variation\n\nSuppose `y` varies jointly as `x` and `z`. Find `y` when `x = 4` and `z = -3`, if `y = -15` when `x = -6` and `z = 1`.\n\nUse:\n\n`y1/(x1z1) = y2/(x2z2)`\n\n`y/(4(-3)) = -15/(-6(1))`\n\n`y/(-12) = -15/(-6)`\n\n`y = -30`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "y = kxz",
                steps: [
                  { expression: "y1/(x1z1) = y2/(x2z2)", explanation: "Set up the joint variation proportion" },
                  { expression: "y/(4(-3)) = -15/(-6(1))", explanation: "Substitute the known values" },
                  { expression: "y/(-12) = -15/(-6)", explanation: "Simplify the denominators" },
                  { expression: "y = -30", explanation: "Solve for y" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Learn: Inverse Variation and Combined Variation",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Inverse Variation and Combined Variation\n\nTwo quantities vary inversely if:\n\n`xy = k`\n\nor\n\n`y = k/x`\n\nIn **combined variation**, one quantity varies directly and/or inversely with multiple others.\n\nFor example, if `y` varies directly as `x` and inversely as `z`, then:\n\n`y = kx/z`",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Inverse Variation\n\nIf `m` varies inversely as `n`, and `m = -4` when `n = 6`, find `m` when `n = -10`.\n\nUse a proportion:\n\n`m1/n2 = m2/n1`\n\n`-4/(-10) = m/6`\n\nCross multiply:\n\n`-24 = -10m`\n\n`m = 2.4`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "m = k/n",
                steps: [
                  { expression: "m1/n2 = m2/n1", explanation: "Set up the inverse variation proportion" },
                  { expression: "-4/(-10) = m/6", explanation: "Substitute the known values" },
                  { expression: "-24 = -10m", explanation: "Cross multiply to solve for m" },
                  { expression: "m = 2.4", explanation: "Solve for m" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Combined Variation\n\nSuppose `a` varies directly as `b` and inversely as `c`. Find `b` when `a = 6` and `c = 28`, if `b = 7` when `a = -49` and `c = 3`.\n\nBecause:\n\n`a = kb/c`\n\nset the two expressions for `k` equal:\n\n`a1c1/b1 = a2c2/b2`\n\n`6(28)/b = (-49)(3)/7`\n\nSolve:\n\n`b = -8`",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "a = kb/c",
                steps: [
                  { expression: "a1c1/b1 = a2c2/b2", explanation: "Set up the combined variation proportion using constant k" },
                  { expression: "6(28)/b = (-49)(3)/7", explanation: "Substitute the known values" },
                  { expression: "168/b = -21", explanation: "Simplify both sides" },
                  { expression: "b = -8", explanation: "Solve for b" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Write and Solve a Combined Variation\n\nA rider's speed varies jointly with pedal RPM and front gear teeth, and inversely with rear gear teeth.\n\nGiven:\n\n- speed `= 17.1` mph\n- front gear `= 50`\n- rear gear `= 16`\n- pedal rate `= 70` RPM\n\nFind the speed when:\n\n- front gear `= 34`\n- rear gear `= 23`\n- pedal rate `= 70` RPM\n\nSince speed varies jointly with `p` and `f` and inversely with `r`:\n\n`x = kpf/r`\n\nSet up the proportion:\n\n`x1r1/(p1f1) = x2r2/(p2f2)`\n\nSubstitute:\n\n`17.1(16)/(70(50)) = x(23)/(70(34))`\n\nSolve:\n\n`x ≈ 8.1`\n\nSo the uphill speed is about `8.1` mph.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "x = kpf/r",
                steps: [
                  { expression: "x1r1/(p1f1) = x2r2/(p2f2)", explanation: "Set up the combined variation proportion for gear speed" },
                  { expression: "17.1(16)/(70(50)) = x(23)/(70(34))", explanation: "Substitute the known values" },
                  { expression: "273.6/3500 = 23x/2380", explanation: "Simplify both sides" },
                  { expression: "x ≈ 8.1", explanation: "Solve for x to get approximately 8.1 mph" },
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
                "## Discussion Questions\n\n1. What is the difference between direct and inverse variation?\n2. How can you identify joint variation from an equation?\n3. In combined variation, how do you determine when to use direct vs. inverse proportionality?\n4. What does the constant of variation tell you about the relationship between variables?",
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
                    question: "Which equation represents direct variation?",
                    options: ["y = kx", "xy = k", "y = kx/z", "y = k/x"],
                    correctIndex: 0,
                  },
                  {
                    question: "If y varies jointly as x and z, which equation represents this relationship?",
                    options: ["y = kx + z", "y = kxz", "y = kx/z", "y = kx - z"],
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
                "## Reflection\n\nToday you learned about variation. Consider the following:\n\n- How do you identify the type of variation from a problem situation?\n- What strategies help you set up variation proportions correctly?\n- How can you check if your answer makes sense in a variation problem?\n- What questions do you still have about variation?",
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