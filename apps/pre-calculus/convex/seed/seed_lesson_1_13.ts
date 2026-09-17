import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_13Result> => {
    const now = Date.now();
    const lessonSlug = "1-13-function-model-selection";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Function Model Selection and Assumption Articulation",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.13: Function Model Selection and Assumption Articulation",
          orderIndex: 13,
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
          title: "Function Model Selection and Assumption Articulation",
          description: "AP Precalculus Topic 1.13: Function Model Selection and Assumption Articulation",
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
          "markdown": "You're given a table of data showing the weight of a baby at various ages. How do you decide whether to fit a linear, quadratic, or cubic model? Look at the **successive differences** in the data: if the first differences are roughly constant, the data is linear. If the second differences are roughly constant, it's quadratic. Today we learn how to select the right model and check our choice using residuals."
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
          "markdown": "- **Regression** — A statistical method for fitting a function to a set of data points.\n- **Residual** — The difference between an actual value and the predicted value: $Residual = y - ŷ$. Positive means the model underestimates; negative means it overestimates.\n- **Residual plot** — A scatter plot of x-values vs. residuals. No pattern suggests a good fit; a pattern suggests a poor fit.\n- **Interpolation** — Using the model to predict within the data's range.\n- **Extrapolation** — Using the model to predict beyond the data's range (less reliable)."
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
          "markdown": "**EK 1.13.A.1:** Model selection depends on data behavior:\n- **Linear** models fit data with approximately constant rates of change.\n- **Quadratic** models fit data with linearly changing rates of change.\n- **Cubic and higher** models fit data with more complex curvature.\n\n**EK 1.13.A.2:** Residuals measure model fit. A residual plot with **no pattern** suggests a good fit; a **pattern** suggests the model is inappropriate.\n\n**EK 1.13.A.3:** All models have domain restrictions and assumptions. You must articulate what the model assumes and identify where it breaks down.\n\n### Model Selection Framework\n\nBefore computing a regression, answer these questions:\n1. What pattern does the scatter plot show? (Rising, falling, curving?)\n2. What do the successive differences reveal?\n3. Which function type matches this pattern?\n4. **Justify your choice in writing.**"
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
          "markdown": "**Example 1:** Baby weight data: $t$ (weeks): 4, 5, 6, 8, 12 → $W(t)$ (kg): 4.2, 4.4, 4.8, 5.1, 5.7.\n\nThe input gaps are 1, 1, 2, and 4 weeks. Divide each output change by its input gap. The average rates are 0.2, 0.4, 0.15, and 0.15 kg per week. These rates vary. A linear regression is a candidate model for the overall trend. Inspect its residuals before you accept it.\n\n**(a)** Linear regression: $W(t) = 0.185t + 3.545$.\n\n**(b)** Predicted weight at 10 weeks: $W(10) = 0.185(10) + 3.545 = 5.395$ kg.\n\n**(c)** Residual for the 5-week-old baby (actual weight 4.4 kg): $ŷ = 0.185(5) + 3.545 = 4.470$. Residual = $4.4 - 4.470 = -0.070$ kg. \"The model slightly overestimates.\"\n\n**Example 2:** Data: $x$: 0, 0.4, 0.9, 1.2, 1.7, 2.2, 2.9, 3.4 → $y$: 5, 10.6, 15.4, 17.1, 18.0, 16.5, 10.2, 2.8.\n\nThe data rises then falls. First differences go positive then negative → **quadratic or cubic model** is appropriate. A quadratic model captures the single turning point well."
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
          "markdown": "**Problem 1:** A baby that was 7.5 weeks old had a residual of -0.7 kg. The model is $W(t) = 0.185t + 3.545$. What was the actual weight?\n*Hint:* Actual = Predicted + Residual. First compute $W(7.5)$.\n\n**Problem 2:** Justin Kickoff data: $t$: 0.1, 0.5, 0.9, 1.5, 1.9, 2.3, 2.6 → $H(t)$: 1.4, 5.7, 8.4, 9.6, 8.4, 5.6, 2.5. Is linear, quadratic, or cubic most appropriate? Explain using the shape of the data.\n*Hint:* The data rises to a peak then falls symmetrically.\n\n**Problem 3:** UK female doctors: $t$: 0, 4, 7, 13, 17, 22, 25 → $F(t)$: 23, 28, 30.5, 36, 42, 47, 50. Why is linear regression appropriate here?\n*Hint:* Compute first differences and check if they're approximately constant."
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
          "markdown": "**Problem 1:** Amazon stock: $t$: 0, 1, 13.5, 19, 26.5, 31.5, 35 → $A(t)$: 87.58, 124.15, 164.61, 185.97, 152.60, 122.42, 90.98. Is linear, quadratic, or cubic most appropriate? Justify by examining the rate of change pattern.\n\n**Problem 2:** A residual plot shows points curving upward then downward. What does this suggest about the model type?\n\n**Problem 3:** A model predicts a value of 42.5 for a data point where the actual value is 39.8. Compute the residual and interpret: does the model overestimate or underestimate?"
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
          "markdown": "**Exit Ticket:** Given a data table, which model type is most appropriate? Justify in one sentence using evidence from the data pattern.\n\n**Lesson Summary:** Model selection starts with examining the data's pattern through successive differences and scatter shape. Linear fits constant rates, quadratic fits linearly changing rates, and cubic fits more complex curves. Residuals — the gap between actual and predicted — tell you how well the model fits. Always justify your model choice before computing the regression."
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
