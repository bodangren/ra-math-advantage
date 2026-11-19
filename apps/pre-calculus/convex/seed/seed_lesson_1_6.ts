import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from "../activities";
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from "../../lib/learning-evidence/precalc-pilot";
import { generateTopic16EquationEndBehaviorOutput } from "@math-platform/math-content/knowledge-space";

interface SeedLesson1_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_6Result> => {
    const now = Date.now();
    const lessonSlug = "1-6-polynomial-functions-end-behavior";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Polynomial Functions and End Behavior",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.6: Polynomial Functions and End Behavior",
          orderIndex: 6,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId).eq("version", 2))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 2,
          title: "Polynomial Functions and End Behavior",
          description: "AP Precalculus Topic 1.6: Polynomial Functions and End Behavior",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "As $x$ gets very large — say $x = 1000$ or $x = 1{,}000{,}000$ — what happens to $f(x) = 3x^2 - 5$? The $3x^2$ term dominates, so $f(x)$ grows very large and positive. What about $g(x) = -x^3 + 100x$? The $-x^3$ dominates, sending $g(x)$ to negative infinity. This lesson formalizes how polynomials behave as $x$ moves infinitely far to the left and right — their **end behavior**.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "- **End behavior**: How a function behaves as $x$ moves infinitely to the right ($x \\to \\infty$) and infinitely to the left ($x \\to -\\infty$).\n- **Limit notation**: lim(x to infty) f(x) and lim(x to -infty) f(x) describe the output values that $f$ approaches.\n- **Without bound**: Moving infinitely far in the positive or negative direction.\n- **Leading term**: The term $a_n x^n$ — the only term that matters for end behavior.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "The end behavior of a polynomial is determined entirely by its **leading term** $a_n x^n$.\n\n**Step 1 — Determine the RIGHT side** (as $x \\to \\infty$):\n- If the leading coefficient is **positive**: the right end goes **up** — lim(x to infty) f(x) = infty.\n- If the leading coefficient is **negative**: the right end goes **down** — lim(x to infty) f(x) = -infty.\n\n**Step 2 — Determine the LEFT side** (as $x \\to -\\infty$):\n- If the degree is **even**: the left end goes in the **same direction** as the right.\n- If the degree is **odd**: the left end goes in the **opposite direction** from the right.\n\n**Four end behavior patterns:**\n\n| Degree | LC | Left | Right |\n|---|---|---|---|\n| Even | + | up | up |\n| Even | - | down | down |\n| Odd | + | down | up |\n| Odd | - | up | down |\n\n**Common mistake**: Trying to evaluate $f(x)$ at large numbers. Instead, just look at the leading term.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Example 1:** Determine end behavior and write limit statements.\n\na) $f(x) = 4x^5$ → Leading term: $4x^5$. Odd degree, positive LC.\n   - Right: up. lim(x to infty) f(x) = infty.\n   - Left: down (opposite). lim(x to -infty) f(x) = -infty.\n\nb) $g(x) = \\frac{1}{2}x^4$ → Even degree, positive LC.\n   - Right: up. lim(x to infty) g(x) = infty.\n   - Left: up (same direction). lim(x to -infty) g(x) = infty.\n\nc) $y = -2(x+3)^6$ → Leading term: $-2x^6$. Even degree, negative LC.\n   - Right: down. lim(x to infty) y = -infty.\n   - Left: down (same). lim(x to -infty) y = -infty.\n\n**Example 2:** The leading term may be hidden.\n\na) $h(x) = 3 - x^5 = -x^5 + 3$ → Leading term: $-x^5$. Odd, negative.\n   - Right: down. Left: up.\n   - lim(x to infty) h(x) = -infty, lim(x to -infty) h(x) = infty.\n\nb) $k(x) = 8x^2 + 4 - x^5$ → Leading term: $-x^5$. Odd, negative.\n   - Right: down. Left: up.\n\nc) $m(x) = 2x(x - 1)(6 - x)$ → Multiply leading terms: $2x \\cdot x \\cdot (-x) = -2x^3$. Odd, negative.\n   - Right: down. Left: up.\n\n**Example 3:** Write limit statements for $f(x) = -3x^4 + x - 7$.\n- Even degree, negative LC → both ends down.\n- lim(x to -infty) f(x) = -infty, lim(x to infty) f(x) = -infty.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Guided Practice",
        phaseType: "guided_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Write limit statements for $g(x) = -2x^4 + x - 3$.\n\n**Hint:** Leading term is $-2x^4$. Even degree, negative LC — both ends go down.\n\n**Problem 2:** Sketch a polynomial where lim(x to -infty) f(x) = -infty and lim(x to infty) f(x) = infty.\n\n**Hint:** This requires an odd degree with positive LC — shape is similar to $x^3$.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Independent Practice",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Determine end behavior and write limit statements for $f(x) = -4x^3 + 2x - 1$.\n\n**Problem 2:** $k(x) = 8x^2 + 4 - x^5$. Find the leading term, determine end behavior, and write limit statements.\n\n**Problem 3:** Match the four graph descriptions to the four equations.\n\n- Graph A: both ends rise.\n- Graph B: both ends fall.\n- Graph C: the left end falls and the right end rises.\n- Graph D: the left end rises and the right end falls.\n\nEquations: $y=-2x^3+x$, $y=3x^4-1$, $y=x^5-2x$, and $y=-x^6+4$.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Exit Ticket:** Write limit statements for $g(x) = -2x^4 + x - 3$.\n\n**Lesson Summary:** End behavior is controlled entirely by the leading term. Start with the right side: positive LC means up, negative LC means down. Then determine the left side using the degree: even means same direction, odd means opposite. Write end behavior using limit notation: lim(x to infty) and lim(x to -infty).",
            },
          },
        ],
      },
    ] as const;

    let activitiesCreated = 0;

    const equationEndBehaviorWorkedOutput = generateTopic16EquationEndBehaviorOutput(0);
    const equationEndBehaviorWorkedPublicProps = (
      equationEndBehaviorWorkedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const equationEndBehaviorWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
      displayName: "Worked Example: Polynomial Equation End Behavior",
      description: "Determine the left and right polynomial end behavior from equations.",
      props: {
        ...equationEndBehaviorWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswers: equationEndBehaviorWorkedOutput.expectedAnswer,
        steps: equationEndBehaviorWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "The six polynomial end behaviors are shown above.",
      },
      gradingConfig: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingEquationEndBehaviorWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingEquationEndBehaviorWorkedActivity) {
      await ctx.db.patch(
        existingEquationEndBehaviorWorkedActivity._id,
        equationEndBehaviorWorkedActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...equationEndBehaviorWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const equationEndBehaviorGuidedOutput = generateTopic16EquationEndBehaviorOutput(1);
    const equationEndBehaviorGuidedPublicProps = (
      equationEndBehaviorGuidedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const equationEndBehaviorGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
      displayName: "Guided Practice: Polynomial Equation End Behavior",
      description: "Determine the left and right polynomial end behavior from equations.",
      props: {
        ...equationEndBehaviorGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Identify the leading term for each polynomial.",
          "Use degree parity and the leading coefficient.",
          "Record whether each left and right end goes up or down.",
        ],
        fieldHelp: "Choose Up or Down for the left and right end of each polynomial.",
      },
      gradingConfig: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingEquationEndBehaviorGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingEquationEndBehaviorGuidedActivity) {
      await ctx.db.patch(
        existingEquationEndBehaviorGuidedActivity._id,
        equationEndBehaviorGuidedActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...equationEndBehaviorGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const equationEndBehaviorIndependentOutput = generateTopic16EquationEndBehaviorOutput(2);
    const equationEndBehaviorIndependentPublicProps = (
      equationEndBehaviorIndependentOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const equationEndBehaviorIndependentActivityFields = {
      stableActivityId:
        PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_COMPONENT_KEY,
      displayName: "Independent Practice: Polynomial Equation End Behavior",
      description: "Determine the left and right polynomial end behavior from equations.",
      props: equationEndBehaviorIndependentPublicProps,
      gradingConfig:
        PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingEquationEndBehaviorIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingEquationEndBehaviorIndependentActivity) {
      await ctx.db.patch(
        existingEquationEndBehaviorIndependentActivity._id,
        equationEndBehaviorIndependentActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...equationEndBehaviorIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
