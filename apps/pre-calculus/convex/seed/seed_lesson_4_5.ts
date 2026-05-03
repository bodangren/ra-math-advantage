import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_5Result> => {
    const now = Date.now();
    const lessonSlug = "4-5-implicit-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Implicit Functions",
          slug: lessonSlug,
          description: "Students differentiate implicitly, find slopes of tangent lines to implicitly defined curves, and solve related problems.",
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
          title: "Implicit Functions",
          description: "Students differentiate implicitly, find slopes of tangent lines to implicitly defined curves, and solve related problems.",
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
                    question: "When differentiating $y^2$ with respect to $x$, the result is:",
                    options: ["2y", "2y · dy/dx", "2x", "y²"],
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
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Implicit Differentiation\n\n### Core Idea\n\nWhen $y$ is defined implicitly by $F(x, y) = 0$, differentiate both sides with respect to $x$, treating $y$ as a function of $x$.\n\n### Chain Rule for Implicit\n\n$$\\frac{d}{dx}[y^n] = ny^{n-1} \\cdot \\frac{dy}{dx}$$\n\n$$\\frac{d}{dx}[xy] = y + x\\frac{dy}{dx}$$  (product rule)\n\n### Steps\n\n1. Differentiate every term with respect to $x$\n2. Collect all $\\frac{dy}{dx}$ terms on one side\n3. Factor out $\\frac{dy}{dx}$\n4. Solve for $\\frac{dy}{dx}$\n\n### Tangent Lines\n\nOnce you have $\\frac{dy}{dx}$, evaluate at the given point to find the slope, then use point-slope form.\n\n### Second Derivative\n\nDifferentiate $\\frac{dy}{dx}$ again with respect to $x$ (may need implicit differentiation again).",
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
              markdown: "## Example: Implicit Differentiation\n\nFind $\\frac{dy}{dx}$ for $x^2 + xy + y^2 = 7$ at the point $(1, 2)$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "algebraic",
                equation: "Implicit diff: x² + xy + y² = 7",
                steps: [
                  { expression: "2x + (y + x·dy/dx) + 2y·dy/dx = 0", explanation: "Differentiate each term" },
                  { expression: "x·dy/dx + 2y·dy/dx = -2x - y", explanation: "Collect dy/dx terms" },
                  { expression: "dy/dx(x + 2y) = -2x - y", explanation: "Factor out dy/dx" },
                  { expression: "dy/dx = -(2x + y)/(x + 2y)", explanation: "Solve for dy/dx" },
                  { expression: "At (1,2): dy/dx = -(2+2)/(1+4) = -4/5", explanation: "Evaluate at the point" },
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
                    question: "For $x^2 + y^2 = 25$, $\\frac{dy}{dx}$ equals:",
                    options: ["-x/y", "x/y", "-y/x", "y/x"],
                    correctIndex: 0,
                  },
                  {
                    question: "Implicit differentiation is necessary when:",
                    options: ["y is isolated", "y cannot be easily solved for", "The equation is linear", "x does not appear"],
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
                equation: "Find dy/dx for x³ + y³ = 6xy",
                steps: [
                  { expression: "3x² + 3y²·dy/dx = 6y + 6x·dy/dx", explanation: "Differentiate (product rule on 6xy)" },
                  { expression: "3y²·dy/dx - 6x·dy/dx = 6y - 3x²", explanation: "Collect dy/dx terms" },
                  { expression: "dy/dx(3y² - 6x) = 6y - 3x²", explanation: "Factor" },
                  { expression: "dy/dx = (6y - 3x²)/(3y² - 6x) = (2y - x²)/(y² - 2x)", explanation: "Simplify" },
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
