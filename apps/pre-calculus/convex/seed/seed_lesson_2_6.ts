import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_6Result> => {
    const now = Date.now();
    const lessonSlug = "2-6-model-validation";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Competing Function Model Validation",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.6: Competing Function Model Validation",
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
          title: "Competing Function Model Validation",
          description: "AP Precalculus Topic 2.6: Competing Function Model Validation",
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
          "markdown": "You fit a linear model to world population data from 1950 to 2020. The model predicts well at the endpoints but consistently overestimates in the middle years. How can you determine whether the linear model is truly appropriate or whether a different model would fit better? What diagnostic tool reveals what the raw scatterplot might hide?"
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
          "markdown": "- **Residual**: The difference between the actual output and the predicted output: $e_i = y_i - \\hat{y}_i$. Positive residuals mean the model underestimates; negative residuals mean it overestimates.\n- **Residual plot**: A scatterplot of input values versus residuals. If the model is appropriate, the plot shows no pattern — points are scattered randomly around zero.\n- **Constant rate of change**: Data whose successive differences are approximately equal — a signature of a **linear** model.\n- **Constant proportional change**: Data whose successive ratios are approximately equal — a signature of an **exponential** model.\n- **U-shaped pattern**: A quadratic signature — residuals alternate sign in a systematic way, indicating the model misses the curvature."
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
          "markdown": "Choosing the right model type is essential for accurate predictions. Three model types and their data signatures:\n\n| Model | Formula | Data signature |\n|---|---|---|\n| Linear | $f(x) = mx + b$ | Constant differences in $y$ over equal $x$-intervals |\n| Quadratic | $f(x) = ax^2 + bx + c$ | Rates of change increase or decrease at a constant rate |\n| Exponential | $f(x) = a \\cdot b^x$ | Successive outputs are roughly proportional |\n\n**Residual analysis** is the primary validation tool. Steps:\n1. Fit a model to the data.\n2. Compute the residual at each point: $e_i = y_i - \\hat{y}_i$.\n3. Plot residuals versus input values.\n4. If the residual plot shows no pattern (random scatter), the model is appropriate.\n5. If there is a clear pattern (U-shape, trend, fan shape), the model is inappropriate.\n\n**Context matters**: Sometimes one direction of error is more costly. For example, when estimating paint for a mural, underestimating means running out of paint — so the model should underestimate (slightly negative residuals are preferred)."
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
          "markdown": "**Example 1:** Determine the best model type from a scatterplot.\n\na) $x$: 0, 2, 4, 6, 8 \\quad $f(x)$: 11, 8.2, 5, 2.3, -1\n**Linear** — differences are approximately -3 per 2 input units (a rate of -1.5 per input unit).\n\nb) $x$: -1, 1.5, 4, 6.5, 9 \\quad $g(x)$: 2, 5.5, 10.5, 5.75, 2.25\n**Quadratic** — values rise then fall in a U-shape.\n\nc) $x$: 1, 3, 5, 7, 9 \\quad $h(x)$: 10, 5.2, 2.4, 1.3, 0.7\n**Exponential** — ratios are approximately 0.5.\n\n**Example 2:** A linear model for baby weight gives $\\hat{W}(2.5) = 5.6$ kg. The actual weight is 5.5 kg.\n\n**Solution:**\nResidual = $5.5 - 5.6 = -0.1$ kg. The model overestimates by 0.1 kg."
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
          "markdown": "**Problem 1:** A residual plot for an exponential model shows a clear U-shaped pattern. What does this tell you about the model?\n\n**Hint:** A pattern in residuals means the systematic variation is not captured by the model.\n\n**Problem 2:** Classify each as linear, quadratic, exponential, or neither:\n\na) $x$: 1, 3, 5, 7, 9 \\quad $h(x)$: 9, 7.1, 1, 7.2, 9.1\n\nb) A mutual fund grows approximately 10.4% per year.\n\n**Hint:** For (a), check whether the values follow a U-shape. For (b), proportional growth indicates exponential."
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
          "markdown": "**Problem 1:** World population data (1950–2020) is fit with a linear model. At year 1990, the model predicts 5.2 billion but the actual population is 5.3 billion. Compute the residual and interpret its meaning.\n\n**Problem 2:** A scatterplot shows residuals that are all positive for low $x$-values and all negative for high $x$-values, with a smooth transition. What does this pattern suggest about the linear model that was used?\n\n**Problem 3:** After creating an exponential model for a data set, what should the residual plot look like if the model is appropriate?"
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
          "markdown": "**Exit Ticket:** A residual plot for an exponential model shows a clear U-shaped pattern. What does this tell you?\n\n**Lesson Summary:** Residuals diagnose model fit. A residual equals actual minus predicted. If the residual plot shows no pattern, the model captures the systematic variation in the data. Patterns — U-shapes, trends, fan shapes — indicate the wrong model type. Linear fits constant differences, exponential fits proportional growth, and quadratic fits data with consistent curvature in rates of change. Context can make one direction of error more meaningful than the other."
        }
      }
    ]
  }
] as const;

    const activitiesCreated = 0;

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
