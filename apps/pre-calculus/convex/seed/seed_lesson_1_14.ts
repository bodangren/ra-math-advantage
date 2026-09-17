import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_14Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_14 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_14Result> => {
    const now = Date.now();
    const lessonSlug = "1-14-function-model-construction";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Function Model Construction and Application",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.14: Function Model Construction and Application",
          orderIndex: 14,
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
          title: "Function Model Construction and Application",
          description: "AP Precalculus Topic 1.14: Function Model Construction and Application",
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
          "markdown": "In Topic 1.13, you learned to select a model type. Now you'll build the model and use it to make predictions. But here's the critical question: is every prediction equally trustworthy? If a model is built from data spanning 2010–2020, can you reliably predict what happens in 2050? Today we explore interpolation vs. extrapolation and learn to critically evaluate when a model's predictions are appropriate."
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
          "markdown": "- **Regression equation** — The function obtained by fitting a model to data using technology.\n- **Interpolation** — Predicting output values for inputs **within** the data range (generally reliable).\n- **Extrapolation** — Predicting output values for inputs **beyond** the data range (less reliable).\n- **Model appropriateness** — Whether the model's long-term behavior matches real-world constraints.\n- **Domain restriction** — The range of input values where the model is valid."
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
          "markdown": "**EK 1.14.A.1:** A regression model constructed from data can predict outputs for inputs within the data range (interpolation) and beyond it (extrapolation).\n\n**EK 1.14.A.2:** Extrapolation carries risk because the model may not continue to behave as the real-world situation does. Assess whether the model's end behavior is consistent with the context.\n\n**EK 1.14.A.3:** A residual plot with random scatter indicates a good fit. Systematic patterns indicate a poor fit or a better model type.\n\n### The Four Components of Every Regression Problem\n\n1. **Select** and justify the model type.\n2. **Write** the regression equation.\n3. **Predict** using the model (state whether it's interpolation or extrapolation).\n4. **Evaluate** appropriateness — especially for extrapolation.\n\n### Extrapolation Warnings\n\n- **Cubic models:** End behavior goes to $±∞$. Unrealistic for bounded quantities like population, stock prices, or weight.\n- **Linear models:** Extrapolation is safer when the trend is stable and the prediction is close to the data range.\n- **Always ask:** Does the prediction make sense in context?"
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
          "markdown": "**Example 1:** Baby weight: $W(t) = 0.185t + 3.545$. Predict weight at $t = 10$ weeks.\n\n$W(10) = 0.185(10) + 3.545 = 5.395$ kg.\n\nThis is **interpolation** because 10 falls within the data range $4 ≤ t ≤ 12$.\n\n**Example 2:** Federal Funds Rate data: $t$: 0, 1, 2, 3, 5 → $R(t)$: 1.5, 2.5, 1.9, 0.5, 4.5.\n\nCubic regression: $R(t) = at³ + bt² + ct + d$.\n\nPredicted rate at $t = 8$ (year 2026): extrapolation.\n\n**Is this useful for long-term prediction?** No — cubic end behavior goes to $±∞$, but interest rates cannot realistically become arbitrarily large or negative.\n\n**Example 3:** UK female doctors: $F(t) = 1.06t + 23.8$. Predicted percentage for 2021 ($t = 33$):\n\n$F(33) = 1.06(33) + 23.8 = 58.78$%.\n\nThis is **extrapolation**, but it's reasonable because the linear trend is stable and the prediction isn't far beyond the data range. Actual value was 55%. Residual = $55 - 58.78 = -3.78$%. The model slightly overestimates."
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
          "markdown": "**Problem 1:** Natural gas consumption: $t$: 0, 10, 22, 30, 37 → $N(t)$: 12.4, 21.8, 20.4, 19.3, 22.6. Cubic regression gives $N(t)$. Predict consumption for 1967 ($t = 7$). Is this interpolation or extrapolation?\n*Hint:* Check whether $t = 7$ falls within the data range.\n\n**Problem 2:** Amazon stock at $t = 16$ (April 6, 2021). The data range is $0 ≤ t ≤ 35$. Is this interpolation or extrapolation? The actual price was $168.61. If the model predicts$159.40, compute the residual.\n*Hint:* Residual = Actual − Predicted.\n\n**Problem 3:** A cubic model predicts a population will be negative in the year 2080. What does this tell you about the model's appropriateness for long-term prediction?\n*Hint:* Can population ever be negative?"
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
          "markdown": "**Problem 1:** Using the linear regression $W(t) = 0.185t + 3.545$ from the baby weight data, predict the weight at $t = 3$ weeks. Is this interpolation or extrapolation? Discuss reliability.\n\n**Problem 2:** A model predicts the number of registered voters will be 95,000 in 2035. The original data spans 2000–2020. The model is quadratic. Evaluate whether this extrapolation is reasonable, considering that quadratic functions have unbounded end behavior.\n\n**Problem 3:** For the UK doctors model $F(t) = 1.06t + 23.8$, the actual percentage in 2021 was 55%. Compute the residual, interpret it in context, and discuss whether the linear model remains appropriate."
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
          "markdown": "**Exit Ticket:** A cubic model predicts the population will be negative in 2080. What does this tell you about the model's appropriateness?\n\n**Lesson Summary:** Building a regression model is only half the task — you must also evaluate when the model's predictions are trustworthy. Interpolation within the data range is generally reliable. Extrapolation beyond the data range requires critical evaluation of the model's end behavior and real-world constraints. Always state whether a prediction is interpolation or extrapolation, and assess its reliability."
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
