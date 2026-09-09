import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedLesson5_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

/**
 * Convex internalMutation wrapper: seed lesson5_3.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedLesson5_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_3Result> => {
    const now = Date.now();
    const lessonSlug = "module-5-lesson-3";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Special Exponential Functions",
          slug: lessonSlug,
          description: "Students analyze expressions and functions involving the natural base e.",
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
          title: "Special Exponential Functions",
          description: "Students analyze expressions and functions involving the natural base e.",
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
                "## Explore: Finding the Value of e\n\nUse a table to complete the explore.\n\n\n**Inquiry Question:**\nHow can you best approximate the value of $e$?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              displayName: "The Natural Base e",
              props: {
                variant: "explore",
                equation: "y = e^x",
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
                "## Key Terms\n\n- **$e$**: The natural base, an irrational number approximately equal to $2.7182818...$\n- **Continuously compounded interest**: Interest calculated using the formula $A = Pe^{rt}$, where interest is earned on the principal and all accumulated interest at every instant",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Exponential Functions with Base e",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Exponential Functions with Base e\n\nThe constant $e$ is an irrational number approached by:\n\n$$(1 + 1/n)^n$$\n\nas $n \\to \\infty$.\n\nApproximate value:\n\n$$e \\approx 2.7182818...$$\n\nGraphs of functions with base $e$ behave like other exponential functions.\n\nFor $f(x) = e^x$:\n\n\n- asymptote: $y = 0$ as $x \\to -\\infty$\n- $f(x) \\to \\infty$ as $x \\to \\infty$\n- y-intercept: $1$\n\nContinuously compounded interest is modeled by:\n\n$$A = Pe^{rt}$$\n\nwhere:\n\n\n- $A$ is the amount after $t$ years\n- $P$ is the principal\n- $r$ is the annual interest rate",
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
                "## Example 1 — Expressions with Base e\n\nSimplify each expression.\n\n### Part a: $e^7 \\cdot e^{-2}$\n\n$$= e^{7 + (-2)} = e^5$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "text" as const,
            content: {
              markdown:
                "### Part b: $(-3e^{2x})^4$\n\n\n$$= (-3)^4 (e^{2x})^4$$\n\n$$= 81e^{8x}$$",
            },
          },
          {
            sequenceOrder: 3,
            sectionType: "text" as const,
            content: {
              markdown:
                "### Part c: $(42e^7) / (14e^5)$\n\n\n$$= 3e^{7 - 5}$$\n\n$$= 3e^2$$\n\n### Watch Out\n\nUse exponent properties before evaluating on a calculator so answers stay exact.",
            },
          },
          {
            sequenceOrder: 4,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Simplify: e^7 * e^-2, (-3e^(2x))^4, (42e^7)/(14e^5)",
                steps: [
                  { id: "step-1", description: "Product of powers property", expression: "e^7 * e^-2 = e^(7-2)", explanation: "Product of powers property" },
                  { id: "step-2", description: "Simplify exponent", expression: "= e^5", explanation: "Simplify exponent" },
                  { id: "step-3", description: "Power of a product property", expression: "(-3e^(2x))^4 = (-3)^4 * (e^(2x))^4", explanation: "Power of a product property" },
                  { id: "step-4", description: "Apply power and simplify (-3)^4 = 81", expression: "= 81 * e^(8x)", explanation: "Apply power and simplify (-3)^4 = 81" },
                  { id: "step-5", description: "Quotient of powers property", expression: "(42e^7)/(14e^5) = (42/14) * e^(7-5)", explanation: "Quotient of powers property" },
                  { id: "step-6", description: "Simplify", expression: "= 3e^2", explanation: "Simplify" },
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
                "## Example 2 — Graph Functions with Base e\n\nConsider:\n\n$$g(x) = -2e^{x - 3} + 2$$\n\n### Part A: Graph the function\n\nThis is a transformation of $f(x) = e^x$.\n\n\n- $a = -2$: reflect across the x-axis and stretch vertically\n- $h = 3$: shift $3$ units right\n- $k = 2$: shift $2$ units up\n\n### Part B: Determine the domain and range\n\n- domain: all real numbers\n- range: all real numbers less than $2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "g(x) = -2e^(x-3) + 2",
                steps: [
                  { id: "step-1", description: "Identify the parent function", expression: "Parent: f(x) = e^x", explanation: "Identify the parent function" },
                  { id: "step-2", description: "Negative a reflects across x-axis; |a| > 1 stretches", expression: "a = -2: reflect and stretch vertically", explanation: "Negative a reflects across x-axis; |a| > 1 stretches" },
                  { id: "step-3", description: "x - 3 means shift right by 3", expression: "h = 3: shift 3 units right", explanation: "x - 3 means shift right by 3" },
                  { id: "step-4", description: "+2 at the end shifts up by 2", expression: "k = 2: shift 2 units up", explanation: "+2 at the end shifts up by 2" },
                  { id: "step-5", description: "Horizontal asymptote shifts up with k", expression: "Asymptote: y = 2", explanation: "Horizontal asymptote shifts up with k" },
                  { id: "step-6", description: "e^x is defined for all x", expression: "Domain: all real numbers", explanation: "e^x is defined for all x" },
                  { id: "step-7", description: "All output values less than 2", expression: "Range: (-∞, 2)", explanation: "All output values less than 2" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Apply Functions with Base e\n\nLaShawndra deposits $1500 in an account paying $2.5\\%$ annual interest compounded continuously.\n\n\nFind the balance after $4$ years.\n\n\n$$A = Pe^{rt}$$\n\n\n$$= 1500e^{0.025 \\cdot 4}$$\n\n\n$$= 1657.76$$\n\nSo after $4$ years, the account balance is:\n\n\n**$1657.76**",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "A = 1500e^(0.025*4)",
                steps: [
                  { id: "step-1", description: "Identify given values", expression: "P = 1500, r = 0.025, t = 4", explanation: "Identify given values" },
                  { id: "step-2", description: "Continuously compounded interest formula", expression: "A = 1500e^(0.025*4)", explanation: "Continuously compounded interest formula" },
                  { id: "step-3", description: "Calculate exponent", expression: "0.025 * 4 = 0.1", explanation: "Calculate exponent" },
                  { id: "step-4", description: "Substitute", expression: "A = 1500e^0.1", explanation: "Substitute" },
                  { id: "step-5", description: "Evaluate e^0.1", expression: "e^0.1 ≈ 1.10517", explanation: "Evaluate e^0.1" },
                  { id: "step-6", description: "Calculate final amount", expression: "A ≈ 1500 × 1.10517 ≈ 1657.76", explanation: "Calculate final amount" },
                  { id: "step-7", description: "Result", expression: "Balance after 4 years: $1657.76", explanation: "Result" },
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
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Solve an Exponential Equation by Using Technology\n\nUse a graphing calculator to solve:\n\n$$5 = 2e^x$$\n\nby using a system.\n### Step 1: Write a system\n\n- $y = 5$\n- $y = 2e^x$\n\n### Step 2: Graph the system\n\nGraph both.\n### Step 3: Find the intersection\n\nThe solution is the x-coordinate:\n\n$$x \\approx 0.916$$\n\n### Step 4: Use a table\n\nUsing a table near $x = 0.916$ confirms the two y-values are nearly equal.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "5 = 2e^x",
                steps: [
                  { id: "step-1", description: "Rewrite equation as a system", expression: "Set up system: y = 5 and y = 2e^x", explanation: "Rewrite equation as a system" },
                  { id: "step-2", description: "Where both equations equal", expression: "Find intersection point", explanation: "Where both equations equal" },
                  { id: "step-3", description: "Set equations equal to solve", expression: "2e^x = 5", explanation: "Set equations equal to solve" },
                  { id: "step-4", description: "Divide both sides by 2", expression: "e^x = 2.5", explanation: "Divide both sides by 2" },
                  { id: "step-5", description: "Take natural logarithm: ln(2.5) ≈ 0.916", expression: "x ≈ 0.916", explanation: "Take natural logarithm: ln(2.5) ≈ 0.916" },
                  { id: "step-6", description: "Check the solution", expression: "Verify: 2e^0.916 ≈ 2(2.5) ≈ 5", explanation: "Check the solution" },
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
                "## Discussion Questions\n\n1. Does a base-$e$ exponential function behave in the same way as other exponential functions? Explain.\n2. If another account offers $2.5\\%$ annual interest compounded monthly, which should LaShawndra choose? Explain.\n3. Why is $e$ considered a \"natural\" base for exponential functions?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  { id: "question-1", type: "multiple_choice", prompt: "What is the approximate value of e?", options: ["2.71828...", "3.14159...", "1.41421..."], correctAnswer: "2.71828..." },
                  { id: "question-2", type: "multiple_choice", prompt: "In continuously compounded interest, what does A = Pe^(rt) represent?", options: ["A is the annual interest rate", "A is the amount after t years", "A is the principal"], correctAnswer: "A is the amount after t years" },
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
                "## Reflection\n\nToday you learned about special exponential functions with base $e$. Consider the following:\n\n- How does the value of $e$ relate to compound interest?\n- How do transformations of base-$e$ functions compare to transformations of other exponential functions?\n- What questions do you still have about base-$e$ functions and their applications?\n\n**Tip**: The natural logarithm $\\ln(x)$ is the inverse of $e^x$, so $\\ln(e^x) = x$.",
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
          const activityContent = section.content as SeedActivityContent;

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: (section.content as { displayName?: string }).displayName ?? `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props as never,
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
              activityId: insertedActivityId,
              componentKey: activityContent.componentKey,
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