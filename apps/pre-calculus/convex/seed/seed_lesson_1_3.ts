import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
} from "../activities";
import {
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
} from "../../lib/learning-evidence/precalc-pilot";
import {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
} from "@math-platform/math-content/knowledge-space";

interface SeedLesson1_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_3Result> => {
    const now = Date.now();
    const lessonSlug = "1-3-rates-of-change-linear-quadratic";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rates of Change in Linear and Quadratic Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.3: Rates of Change in Linear and Quadratic Functions",
          orderIndex: 3,
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
          title: "Rates of Change in Linear and Quadratic Functions",
          description: "AP Precalculus Topic 1.3: Rates of Change in Linear and Quadratic Functions",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
  {
    "phaseNumber": 1,
    "title": "Explore",
    "phaseType": "explore",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "Consider this table:\n\n| x | 1 | 2 | 4 | 8 |\n|---|---|---|---|---|\n| f(x) | 4 | 7 | 10 | 13 |\n\nThe output differences are all $3$. Does that mean $f$ is linear? Before answering, check the input intervals: $2 - 1 = 1$, $4 - 2 = 2$, $8 - 4 = 4$. The input intervals are **unequal**, so constant output differences alone do not guarantee linearity. This lesson explores what the pattern of average rates of change *over equal-length intervals* tells us about function type."
        }
      }
    ]
  },
  {
    "phaseNumber": 2,
    "title": "Vocabulary",
    "phaseType": "vocabulary",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "- **Equal-length input intervals**: Input values spaced the same distance apart (e.g., $x = 1, 3, 5, 7$ — intervals of width 2).\n- **Successive differences**: The differences between consecutive output values in a table.\n- **Second differences**: The differences of the successive differences.\n- **Concave up**: The average rate of change over equal-length intervals is *increasing*. The graph curves upward like a cup.\n- **Concave down**: The average rate of change over equal-length intervals is *decreasing*. The graph curves downward like a frown."
        }
      }
    ]
  },
  {
    "phaseNumber": 3,
    "title": "Learn",
    "phaseType": "learn",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Linear functions**: For a linear function, the average rate of change over *any* equal-length input interval is **constant**. This constant is the slope. If the successive differences in a table are the same and the input intervals are equal, the function could be linear.\n\n**Quadratic functions**: For a quadratic function, the average rate of change over equal-length intervals **changes linearly** — the successive differences form an arithmetic sequence. Equivalently, the **second differences** (differences of differences) are constant.\n\n**Concavity**:\n- **Concave up**: AROCs over equal-length intervals are increasing → second differences are positive → graph curves upward.\n- **Concave down**: AROCs over equal-length intervals are decreasing → second differences are negative → graph curves downward.\n\n**Key insight**: For $g(x) = x^2$, computing AROCs over equal-width intervals of 2:\n\n| x | -3 | -1 | 1 | 3 | 5 |\n|---|---|---|---|---|---|\n| g(x) | 9 | 1 | 1 | 9 | 25 |\n\nAROCs: $\\frac{1-9}{2} = -4$, $\\frac{1-1}{2} = 0$, $\\frac{9-1}{2} = 4$, $\\frac{25-9}{2} = 8$. Each AROC increases by 4 — a linear pattern, confirming quadratic behavior with concave up.\n\n**Common misconception**: Constant output differences do NOT mean a function is linear unless the input intervals are also equal length."
        }
      }
    ]
  },
  {
    "phaseNumber": 4,
    "title": "Worked Example",
    "phaseType": "worked_example",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Example 1:** Could each function be linear, quadratic, or neither?\n\na) $x: 1, 2, 3, 4$ → $f(x): 0, 1, 4, 9$\n\n**Solution:** Successive differences: 1, 3, 5. These increase by 2 (constant second differences). Since input intervals are equal (width 1), $f$ could be **quadratic** (concave up).\n\nb) $x: 1, 2, 5, 10$ → $g(x): 0, 1, 4, 9$\n\n**Solution:** Successive differences: 1, 3, 5 (same values as part a). But input intervals are unequal (widths 1, 3, 5). The average rates are $1/1=1$, $3/3=1$, and $5/5=1$. They are equal, so a linear model $g(x)=x-1$ fits all four points. Unequal intervals require divided differences rather than raw output differences.\n\nc) $x: 1, 1.1, 1.2, 1.3$ → $p(x): 1, 7, 11, 13$\n\n**Solution:** Successive differences: 6, 4, 2. These decrease by 2 (constant second differences of $-2$). Input intervals are equal (width 0.1). $p$ could be **quadratic** (concave down).\n\n**Example 2:** Determine concavity.\n\n$x: 1, 1.1, 1.2, 1.3$ → $k(x): 4, 1, -1, -2$\n\n**Solution:** Differences: $-3$, $-2$, $-1$. These are *increasing* (from -3 to -2 to -1). The function is **concave up**."
        }
      }
    ]
  },
  {
    "phaseNumber": 5,
    "title": "Guided Practice",
    "phaseType": "guided_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** $x: 0, 2, 4, 6, 8$ → $q(x): 0, 5, 8, 9, 8$. Find the successive differences, then the second differences. Could $q$ be quadratic?\n\n**Hint:** Successive differences are 5, 3, 1, -1. Second differences are -2, -2, -2 — constant! Input intervals are equal (width 2), so yes, $q$ could be quadratic (concave down).\n\n**Problem 2:** $x: 2, 4, 6, 8$ → $f(x): 3, 7, 13, 21$. Could $f$ be quadratic? Justify using differences.\n\n**Hint:** Differences: 4, 6, 8. Second differences: 2, 2 — constant. Yes, could be quadratic (concave up)."
        }
      }
    ]
  },
  {
    "phaseNumber": 6,
    "title": "Independent Practice",
    "phaseType": "independent_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** $x: 1, 3, 5, 7, 9$ → $f(x): -2, -5, -4, 1, 10$. Could $f$ be linear? Could it be quadratic? Justify.\n\n**Problem 2:** $x: 1, 3, 5, 7, 9$ → $m(x): -2, -2, -2, -2, -2$. What type of function could produce these values?\n\n**Problem 3:** $x: 1, 3, 5, 7$ → $h(x): -1, 1, 2, 2$. Determine if the function is concave up, concave down, or neither."
        }
      }
    ]
  },
  {
    "phaseNumber": 7,
    "title": "Reflection",
    "phaseType": "reflection",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Exit Ticket:** Given $x: 2, 4, 6, 8$ → $f(x): 3, 7, 13, 21$. Could $f$ be quadratic? Justify using differences.\n\n**Lesson Summary:** Linear functions have constant average rates of change over equal-length intervals. Quadratic functions have AROCs that change linearly — their second differences are constant. Always verify that input intervals are equal before drawing conclusions. Concave up means AROCs are increasing; concave down means AROCs are decreasing."
        }
      }
    ]
  }
] as const;

    let activitiesCreated = 0;

    const ratePatternWorkedVariant = generateTopic13RatePatternClassification(0);
    const ratePatternWorkedOutput = generateTopic13RatePatternClassificationOutput(0);
    const ratePatternWorkedExpectedAnswer = ratePatternWorkedOutput.expectedAnswer as Record<string, string>;
    const existingRatePatternWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const ratePatternWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
      displayName: "Worked Example: Classify Rate Patterns",
      description: "Use the table values to classify each function.",
      props: {
        prompt: ratePatternWorkedVariant.prompt,
        cases: ratePatternWorkedVariant.cases,
        presentationMode: "worked_example" as const,
        correctClassifications: ratePatternWorkedExpectedAnswer,
        steps: ratePatternWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "a) quadratic; b) linear; c) quadratic.",
      },
      gradingConfig: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingRatePatternWorkedActivity) {
      await ctx.db.patch(existingRatePatternWorkedActivity._id, ratePatternWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...ratePatternWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const ratePatternGuidedVariant = generateTopic13RatePatternClassification(1);
    const existingRatePatternGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const ratePatternGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
      displayName: "Guided Practice: Classify Rate Patterns",
      description: "Use the table values to classify each function.",
      props: {
        prompt: ratePatternGuidedVariant.prompt,
        cases: ratePatternGuidedVariant.cases,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Find each input width.",
          "Divide each output change by its input width.",
          "Compare the average rates and their second divided differences.",
          "Classify each function.",
        ],
        fieldHelp: "Compute average rates using the actual input widths. Equal first divided differences fit a line. Equal nonzero second divided differences fit a quadratic.",
      },
      gradingConfig: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingRatePatternGuidedActivity) {
      await ctx.db.patch(existingRatePatternGuidedActivity._id, ratePatternGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...ratePatternGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const ratePatternIndependentOutput = generateTopic13RatePatternClassificationOutput(2);
    const ratePatternIndependentProps = (ratePatternIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const existingRatePatternIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const ratePatternIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_COMPONENT_KEY,
      displayName: "Independent Practice: Classify Rate Patterns",
      description: "Classify each function from its table values.",
      props: ratePatternIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingRatePatternIndependentActivity) {
      await ctx.db.patch(existingRatePatternIndependentActivity._id, ratePatternIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...ratePatternIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const concavityWorkedVariant = generateTopic13ConcavityFromRateChange(0);
    const concavityWorkedOutput = generateTopic13ConcavityFromRateChangeOutput(0);
    const concavityWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
      displayName: "Worked Example: Determine Concavity",
      description: "Determine concavity from a table of values.",
      props: {
        prompt: concavityWorkedVariant.prompt,
        functionName: concavityWorkedVariant.functionName,
        xValues: concavityWorkedVariant.xValues,
        yValues: concavityWorkedVariant.yValues,
        presentationMode: "worked_example" as const,
        correctClassification: concavityWorkedOutput.expectedAnswer.classification,
        steps: concavityWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "concave up.",
      },
      gradingConfig: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingConcavityWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (existingConcavityWorkedActivity) {
      await ctx.db.patch(existingConcavityWorkedActivity._id, concavityWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...concavityWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const concavityGuidedVariant = generateTopic13ConcavityFromRateChange(1);
    const concavityGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
      displayName: "Guided Practice: Determine Concavity",
      description: "Determine concavity from a table of values.",
      props: {
        prompt: concavityGuidedVariant.prompt,
        functionName: concavityGuidedVariant.functionName,
        xValues: concavityGuidedVariant.xValues,
        yValues: concavityGuidedVariant.yValues,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Check whether the input widths are equal.",
          "Find the first differences.",
          "Decide whether the first differences increase, decrease, or reverse direction.",
          "Classify the function's concavity.",
        ],
        fieldHelp: "Increasing first differences indicate concave up. Decreasing first differences indicate concave down.",
      },
      gradingConfig: PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingConcavityGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    if (existingConcavityGuidedActivity) {
      await ctx.db.patch(existingConcavityGuidedActivity._id, concavityGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...concavityGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const concavityIndependentOutput = generateTopic13ConcavityFromRateChangeOutput(2);
    const { rendererProps: concavityIndependentProps } = concavityIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    };
    const concavityIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_13_CONCAVITY_COMPONENT_KEY,
      displayName: "Independent Practice: Determine Concavity",
      description: "Determine concavity from a table of values.",
      props: concavityIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingConcavityIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    if (existingConcavityIndependentActivity) {
      await ctx.db.patch(existingConcavityIndependentActivity._id, concavityIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...concavityIndependentActivityFields,
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
