import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  PRECALCULUS_TOPIC_12_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
} from "../activities";
import {
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
} from "../../lib/learning-evidence/precalc-pilot";
import {
  generateTopic12GraphAverageRateChoice,
  generateTopic12GraphAverageRateChoiceOutput,
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  generateTopic12PointwiseLeastRateChoice,
  generateTopic12PointwiseLeastRateChoiceOutput,
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
  generateTopic12TableAverageRateChoice,
  generateTopic12TableAverageRateChoiceOutput,
} from "@math-platform/math-content/knowledge-space";

interface SeedLesson1_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_2Result> => {
    const now = Date.now();
    const lessonSlug = "1-2-rates-of-change";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rates of Change",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.2: Rates of Change",
          orderIndex: 2,
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
          title: "Rates of Change",
          description: "AP Precalculus Topic 1.2: Rates of Change",
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
          "markdown": "A town's population is recorded every 5 years:\n\n| Year | 2000 | 2005 | 2010 | 2015 |\n|---|---|---|---|---|\n| Population | 12,400 | 15,800 | 18,600 | 20,200 |\n\nHow fast is the population growing per year between 2000 and 2005? Between 2010 and 2015? Is the growth rate speeding up or slowing down? This lesson formalizes the \"how fast\" question into a precise calculation."
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
          "markdown": "- **Average rate of change (AROC)**: The ratio $\\frac{f(b) - f(a)}{b - a}$ — measures how fast the output changes per unit of input over the interval $[a, b]$.\n- **Secant line**: The line passing through $(a, f(a))$ and $(b, f(b))$ on the graph. Its slope equals the average rate of change.\n- **Slope**: The rate of change is essentially the same as slope. Anytime you see \"rate of change,\" think \"slope.\"\n- **Numerator**: $f(b) - f(a)$ — the total change in output.\n- **Denominator**: $b - a$ — the total change in input."
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
          "markdown": "The **average rate of change** of a function $f$ over the interval $[a, b]$ is:\n\n$$\\frac{f(b) - f(a)}{b - a}$$\n\nThis represents the **slope of the secant line** connecting $(a, f(a))$ and $(b, f(b))$.\n\nKey ideas:\n- A **positive average** rate means the final output is greater than the initial output.\n- A **negative average** rate means the final output is less than the initial output.\n- A **zero average** rate means the endpoint outputs are equal. The function can vary between them.\n- The units of rate of change are units of **output** divided by units of **input** (e.g., feet per second, dollars per year).\n\n**Roller coaster analogy**: \"Going up\" = positive rate of change. \"Going down\" = negative rate of change. At the very top of a peak or bottom of a valley, the rate of change is zero — the instant between going up and going down.\n\n**Important**: In AP Precalculus, we cannot find the exact rate of change *at* a single point (that requires calculus). But we can determine whether the rate of change at a point is positive, negative, or zero by looking at the graph.\n\n**Common mistake**: Computing $f(b) - f(a)$ alone gives the *total change*, not the *rate*. Always divide by $b - a$."
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
          "markdown": "**Example 1:** Find the average rate of change of $f(x) = x^2$ on $[1, 4]$.\n\n**Solution:**\n- $f(1) = 1^2 = 1$\n- $f(4) = 4^2 = 16$\n- AROC = $\\frac{16 - 1}{4 - 1} = \\frac{15}{3} = 5$\n- Interpretation: \"The function increases by an average of 5 units for each 1-unit increase in $x$ on the interval $[1, 4]$.\"\n\n**Example 2:** A population table shows town population at 5-year intervals:\n\n| t (years) | 0 | 5 | 10 | 15 |\n|---|---|---|---|---|\n| P(t) | 12,400 | 15,800 | 18,600 | 20,200 |\n\n**Solution:**\n- AROC on $[0, 5]$: $\\frac{15800 - 12400}{5} = \\frac{3400}{5} = 680$ people/year\n- AROC on $[5, 10]$: $\\frac{18600 - 15800}{5} = \\frac{2800}{5} = 560$ people/year\n- AROC on $[10, 15]$: $\\frac{20200 - 18600}{5} = \\frac{1600}{5} = 320$ people/year\n- The growth rate is slowing — the town is adding fewer people per year each interval.\n\n**Example 3:** Find the average rate of change of $C(t) = 500(1.08)^t$ from $t = 2$ to $t = 5$.\n\n**Solution:**\n- $C(2) = 500(1.08)^2 \\approx 583.20$\n- $C(5) = 500(1.08)^5 \\approx 734.6640384$\n- AROC = $\\frac{734.6640384 - 583.20}{3} \\approx 50.49$ dollars per year\n- Interpretation: \"The cost increases by an average of approximately $50.49 per year from year 2 to year 5.\""
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
          "markdown": "**Problem 1:** Find the average rate of change of $g(x) = 3x - 7$ on $[2, 6]$.\n\n**Hint:** Evaluate $g(2)$ and $g(6)$, then apply the formula $\\frac{g(6) - g(2)}{6 - 2}$.\n\n**Problem 2:** The function $h(t)$ gives the temperature in degrees Fahrenheit after $t$ hours. $h(3) = 72$ and $h(7) = 58$. Find the average rate of change and interpret it with units.\n\n**Hint:** The units will be degrees Fahrenheit per hour."
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
          "markdown": "**Problem 1:** Find the average rate of change of $f(x) = x^2 + 2x$ on $[1, 3]$. Interpret your result.\n\n**Problem 2:** A car's distance from home is modeled by $d(t)$ where $t$ is in hours. $d(1) = 30$ miles and $d(4) = 150$ miles. Find the average rate of change and explain what it means in context.\n\n**Problem 3:** The average rate of change of a function $k$ on $[2, 5]$ is $-4$. If $k(2) = 10$, find $k(5)$."
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
          "markdown": "**Exit Ticket:** Find the average rate of change of $g(x) = 3x - 7$ on $[2, 6]$ and state what it means.\n\n**Lesson Summary:** The average rate of change is $\\frac{f(b) - f(a)}{b - a}$ — it equals the slope of the secant line. The sign describes the net change between endpoints. It does not prove that the function increases, decreases, or stays constant throughout the interval. Always include units in your interpretation, and remember: rate of change measures *direction of movement*, not *position*."
        }
      }
    ]
  }
] as const;

    let activitiesCreated = 0;

    const workedVariant = generateTopic12TableAverageRateChoice(0);
    const existingWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const workedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: "Worked Example: Find the Greatest Average Rate",
      description: "Compare average rates of change across the four table intervals.",
      props: {
        prompt: workedVariant.prompt,
        inputLabel: workedVariant.inputLabel,
        outputLabel: workedVariant.outputLabel,
        rows: workedVariant.rows,
        options: workedVariant.options,
        presentationMode: "worked_example" as const,
        correctOptionId: workedVariant.correctOptionId,
        steps: [...workedVariant.solutionSteps],
        finalAnswer: "The average rate of change is greatest over 1900-1950 (option C).",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingWorkedActivity) {
      await ctx.db.patch(existingWorkedActivity._id, workedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...workedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const guidedVariant = generateTopic12TableAverageRateChoice(1);
    const existingGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const guidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: "Guided Practice: Compare Average Rates",
      description: "Calculate and compare the average rate of change for each interval.",
      props: {
        prompt: guidedVariant.prompt,
        inputLabel: guidedVariant.inputLabel,
        outputLabel: guidedVariant.outputLabel,
        rows: guidedVariant.rows,
        options: guidedVariant.options,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "For each interval, calculate change in output divided by change in input.",
          "Select the interval with the greatest average rate of change.",
        ],
        fieldHelp: "Calculate change in output divided by change in input for each option.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingGuidedActivity) {
      await ctx.db.patch(existingGuidedActivity._id, guidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...guidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const independentOutput = generateTopic12TableAverageRateChoiceOutput(2);
    const independentProps = (independentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const existingIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const independentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: "Independent Practice: Compare Average Rates",
      description: "Select the interval with the greatest average rate of change.",
      props: independentProps,
      gradingConfig: PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingIndependentActivity) {
      await ctx.db.patch(existingIndependentActivity._id, independentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...independentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const graphWorkedVariant = generateTopic12GraphAverageRateChoice(0);
    const existingGraphWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const graphWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
      displayName: "Worked Example: Find the Greatest Graph Rate",
      description: "Compare average rates of change across graph intervals.",
      props: {
        prompt: graphWorkedVariant.prompt,
        domain: graphWorkedVariant.domain,
        range: graphWorkedVariant.range,
        xLabel: graphWorkedVariant.xLabel,
        yLabel: graphWorkedVariant.yLabel,
        graphPoints: graphWorkedVariant.graphPoints,
        options: graphWorkedVariant.options,
        presentationMode: "worked_example" as const,
        correctOptionId: graphWorkedVariant.correctOptionId,
        steps: [...graphWorkedVariant.solutionSteps],
        finalAnswer: "The greatest average rate is on 5 to 7 (option C).",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingGraphWorkedActivity) {
      await ctx.db.patch(existingGraphWorkedActivity._id, graphWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...graphWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const graphGuidedVariant = generateTopic12GraphAverageRateChoice(1);
    const existingGraphGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const graphGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
      displayName: "Guided Practice: Compare Graph Rates",
      description: "Calculate and compare average rates of change from a graph.",
      props: {
        prompt: graphGuidedVariant.prompt,
        domain: graphGuidedVariant.domain,
        range: graphGuidedVariant.range,
        xLabel: graphGuidedVariant.xLabel,
        yLabel: graphGuidedVariant.yLabel,
        graphPoints: graphGuidedVariant.graphPoints,
        options: graphGuidedVariant.options,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Calculate (change in output)/(change in input) for each interval.",
          "Compare the four average rates and select the greatest.",
        ],
        fieldHelp: "Use the endpoint values for each option.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingGraphGuidedActivity) {
      await ctx.db.patch(existingGraphGuidedActivity._id, graphGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...graphGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const graphIndependentOutput = generateTopic12GraphAverageRateChoiceOutput(2);
    const { seed: _graphIndependentSeed, ...graphIndependentProps } = graphIndependentOutput.data as Record<string, unknown>;
    const existingGraphIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const graphIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
      displayName: "Independent Practice: Compare Graph Rates",
      description: "Select the interval with the greatest average rate of change.",
      props: {
        ...graphIndependentProps,
        presentationMode: "independent_practice" as const,
      },
      gradingConfig: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingGraphIndependentActivity) {
      await ctx.db.patch(existingGraphIndependentActivity._id, graphIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...graphIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const negativeRateContextWorkedVariant = generateTopic12NegativeRateContextChoice(0);
    const negativeRateContextWorkedOutput = generateTopic12NegativeRateContextChoiceOutput(0);
    const negativeRateContextWorkedExpectedAnswer = negativeRateContextWorkedOutput.expectedAnswer as {
      selectedOptionId: string;
    };
    const existingNegativeRateContextWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const negativeRateContextWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
      displayName: "Worked Example: Model a Negative Rate",
      description: "Choose variables that model an always-negative rate.",
      props: {
        prompt: negativeRateContextWorkedVariant.prompt,
        options: negativeRateContextWorkedVariant.options,
        presentationMode: "worked_example" as const,
        correctOptionId: negativeRateContextWorkedExpectedAnswer.selectedOptionId,
        steps: negativeRateContextWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "Option B is correct because x increases while y decreases.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingNegativeRateContextWorkedActivity) {
      await ctx.db.patch(existingNegativeRateContextWorkedActivity._id, negativeRateContextWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...negativeRateContextWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const negativeRateContextGuidedVariant = generateTopic12NegativeRateContextChoice(1);
    const existingNegativeRateContextGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const negativeRateContextGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
      displayName: "Guided Practice: Model a Negative Rate",
      description: "Check how y changes as x increases.",
      props: {
        prompt: negativeRateContextGuidedVariant.prompt,
        options: negativeRateContextGuidedVariant.options,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Determine how y changes as x increases in each option.",
          "Select the option in which y always decreases as x increases.",
        ],
        fieldHelp: "A negative rate of change means y decreases as x increases.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingNegativeRateContextGuidedActivity) {
      await ctx.db.patch(existingNegativeRateContextGuidedActivity._id, negativeRateContextGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...negativeRateContextGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const negativeRateContextIndependentOutput = generateTopic12NegativeRateContextChoiceOutput(2);
    const negativeRateContextIndependentProps = (negativeRateContextIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const existingNegativeRateContextIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const negativeRateContextIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
      displayName: "Independent Practice: Model a Negative Rate",
      description: "Select variables that model an always-negative rate.",
      props: negativeRateContextIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingNegativeRateContextIndependentActivity) {
      await ctx.db.patch(existingNegativeRateContextIndependentActivity._id, negativeRateContextIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...negativeRateContextIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const quadraticNegativeRateIntervalWorkedVariant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
    const quadraticNegativeRateIntervalWorkedOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
    const quadraticNegativeRateIntervalWorkedExpectedAnswer = quadraticNegativeRateIntervalWorkedOutput.expectedAnswer as {
      selectedOptionId: string;
    };
    const existingQuadraticNegativeRateIntervalWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const quadraticNegativeRateIntervalWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
      displayName: "Worked Example: Find a Negative Rate Interval",
      description: "Use the vertex to find where a quadratic decreases.",
      props: {
        prompt: quadraticNegativeRateIntervalWorkedVariant.prompt,
        functionName: quadraticNegativeRateIntervalWorkedVariant.functionName,
        constantTerm: quadraticNegativeRateIntervalWorkedVariant.constantTerm,
        linearCoefficient: quadraticNegativeRateIntervalWorkedVariant.linearCoefficient,
        quadraticCoefficient: quadraticNegativeRateIntervalWorkedVariant.quadraticCoefficient,
        domain: quadraticNegativeRateIntervalWorkedVariant.domain,
        options: quadraticNegativeRateIntervalWorkedVariant.options,
        presentationMode: "worked_example" as const,
        correctOptionId: quadraticNegativeRateIntervalWorkedExpectedAnswer.selectedOptionId,
        steps: quadraticNegativeRateIntervalWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "Option D is correct because the rate is negative to the right of the vertex.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingQuadraticNegativeRateIntervalWorkedActivity) {
      await ctx.db.patch(existingQuadraticNegativeRateIntervalWorkedActivity._id, quadraticNegativeRateIntervalWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...quadraticNegativeRateIntervalWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const quadraticNegativeRateIntervalGuidedVariant = generateTopic12QuadraticNegativeRateIntervalChoice(1);
    const existingQuadraticNegativeRateIntervalGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const quadraticNegativeRateIntervalGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
      displayName: "Guided Practice: Find a Negative Rate Interval",
      description: "Use the vertex to find where a quadratic decreases.",
      props: {
        prompt: quadraticNegativeRateIntervalGuidedVariant.prompt,
        functionName: quadraticNegativeRateIntervalGuidedVariant.functionName,
        constantTerm: quadraticNegativeRateIntervalGuidedVariant.constantTerm,
        linearCoefficient: quadraticNegativeRateIntervalGuidedVariant.linearCoefficient,
        quadraticCoefficient: quadraticNegativeRateIntervalGuidedVariant.quadraticCoefficient,
        domain: quadraticNegativeRateIntervalGuidedVariant.domain,
        options: quadraticNegativeRateIntervalGuidedVariant.options,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Identify that the negative quadratic coefficient makes the parabola open downward.",
          "Find the vertex with x = -b/(2a).",
          "Use the right side of the vertex as the negative-rate interval.",
          "Select the one true statement.",
        ],
        fieldHelp: "A downward-opening quadratic has a negative rate of change to the right of its vertex.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingQuadraticNegativeRateIntervalGuidedActivity) {
      await ctx.db.patch(existingQuadraticNegativeRateIntervalGuidedActivity._id, quadraticNegativeRateIntervalGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...quadraticNegativeRateIntervalGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const quadraticNegativeRateIntervalIndependentOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(2);
    const { rendererProps: quadraticNegativeRateIntervalIndependentProps } = quadraticNegativeRateIntervalIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    };
    const existingQuadraticNegativeRateIntervalIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const quadraticNegativeRateIntervalIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
      displayName: "Independent Practice: Find a Negative Rate Interval",
      description: "Select where the quadratic has a negative rate of change.",
      props: {
        ...quadraticNegativeRateIntervalIndependentProps,
        presentationMode: "independent_practice" as const,
      },
      gradingConfig: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingQuadraticNegativeRateIntervalIndependentActivity) {
      await ctx.db.patch(existingQuadraticNegativeRateIntervalIndependentActivity._id, quadraticNegativeRateIntervalIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...quadraticNegativeRateIntervalIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const pointwiseWorkedVariant = generateTopic12PointwiseLeastRateChoice(0);
    const existingPointwiseWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const pointwiseWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      displayName: "Worked Example: Find the Least Pointwise Rate",
      description: "Compare local direction and steepness at labeled graph points.",
      props: {
        prompt: pointwiseWorkedVariant.prompt,
        domain: pointwiseWorkedVariant.domain,
        range: pointwiseWorkedVariant.range,
        xLabel: pointwiseWorkedVariant.xLabel,
        yLabel: pointwiseWorkedVariant.yLabel,
        graphPoints: pointwiseWorkedVariant.graphPoints,
        labeledPoints: pointwiseWorkedVariant.labeledPoints,
        options: pointwiseWorkedVariant.options,
        presentationMode: "worked_example" as const,
        correctOptionId: pointwiseWorkedVariant.correctOptionId,
        steps: [...pointwiseWorkedVariant.solutionSteps],
        finalAnswer: "Point D has the least rate of change (option D).",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingPointwiseWorkedActivity) {
      await ctx.db.patch(existingPointwiseWorkedActivity._id, pointwiseWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...pointwiseWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const pointwiseGuidedVariant = generateTopic12PointwiseLeastRateChoice(1);
    const existingPointwiseGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const pointwiseGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      displayName: "Guided Practice: Compare Pointwise Rates",
      description: "Use local direction and steepness to compare labeled graph points.",
      props: {
        prompt: pointwiseGuidedVariant.prompt,
        domain: pointwiseGuidedVariant.domain,
        range: pointwiseGuidedVariant.range,
        xLabel: pointwiseGuidedVariant.xLabel,
        yLabel: pointwiseGuidedVariant.yLabel,
        graphPoints: pointwiseGuidedVariant.graphPoints,
        labeledPoints: pointwiseGuidedVariant.labeledPoints,
        options: pointwiseGuidedVariant.options,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Compare whether the graph is rising or falling at each labeled point.",
          "Among the falling points, compare steepness and select the most negative rate.",
        ],
        fieldHelp: "A steeper downward graph has a smaller rate of change.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingPointwiseGuidedActivity) {
      await ctx.db.patch(existingPointwiseGuidedActivity._id, pointwiseGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...pointwiseGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const pointwiseIndependentOutput = generateTopic12PointwiseLeastRateChoiceOutput(2);
    const { seed: _pointwiseIndependentSeed, ...pointwiseIndependentProps } = pointwiseIndependentOutput.data as Record<string, unknown>;
    const existingPointwiseIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const pointwiseIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      displayName: "Independent Practice: Find the Least Pointwise Rate",
      description: "Select the labeled point with the least rate of change.",
      props: {
        ...pointwiseIndependentProps,
        presentationMode: "independent_practice" as const,
      },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingPointwiseIndependentActivity) {
      await ctx.db.patch(existingPointwiseIndependentActivity._id, pointwiseIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...pointwiseIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const pointwiseOrderingWorkedVariant = generateTopic12PointwiseRateOrdering(0);
    const pointwiseOrderingWorkedOutput = generateTopic12PointwiseRateOrderingOutput(0);
    const pointwiseOrderingExpectedAnswer = pointwiseOrderingWorkedOutput.expectedAnswer as {
      orderedPointIds: readonly string[];
    };
    const existingPointwiseOrderingWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID)
      ))
      .unique();
    const pointwiseOrderingWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      displayName: "Worked Example: Order Pointwise Rates",
      description: "Compare local direction and steepness at labeled graph points.",
      props: {
        prompt: pointwiseOrderingWorkedVariant.prompt,
        domain: pointwiseOrderingWorkedVariant.domain,
        range: pointwiseOrderingWorkedVariant.range,
        xLabel: pointwiseOrderingWorkedVariant.xLabel,
        yLabel: pointwiseOrderingWorkedVariant.yLabel,
        graphPoints: pointwiseOrderingWorkedVariant.graphPoints,
        labeledPoints: pointwiseOrderingWorkedVariant.labeledPoints,
        presentationMode: "worked_example" as const,
        orderedPointIds: [...pointwiseOrderingExpectedAnswer.orderedPointIds],
        steps: [...pointwiseOrderingWorkedVariant.solutionSteps],
        finalAnswer: "The least-to-greatest order is B < C < A.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingPointwiseOrderingWorkedActivity) {
      await ctx.db.patch(existingPointwiseOrderingWorkedActivity._id, pointwiseOrderingWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...pointwiseOrderingWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const pointwiseOrderingGuidedVariant = generateTopic12PointwiseRateOrdering(1);
    const existingPointwiseOrderingGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    const pointwiseOrderingGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      displayName: "Guided Practice: Order Pointwise Rates",
      description: "Use local direction and steepness to order graph points.",
      props: {
        prompt: pointwiseOrderingGuidedVariant.prompt,
        domain: pointwiseOrderingGuidedVariant.domain,
        range: pointwiseOrderingGuidedVariant.range,
        xLabel: pointwiseOrderingGuidedVariant.xLabel,
        yLabel: pointwiseOrderingGuidedVariant.yLabel,
        graphPoints: pointwiseOrderingGuidedVariant.graphPoints,
        labeledPoints: pointwiseOrderingGuidedVariant.labeledPoints,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Compare local direction and steepness at each labeled point.",
          "Order the rates from least to greatest.",
        ],
        fieldHelp: "A steeper downward graph has a smaller rate of change.",
      },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingPointwiseOrderingGuidedActivity) {
      await ctx.db.patch(existingPointwiseOrderingGuidedActivity._id, pointwiseOrderingGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...pointwiseOrderingGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const pointwiseOrderingIndependentOutput = generateTopic12PointwiseRateOrderingOutput(2);
    const { seed: _pointwiseOrderingIndependentSeed, ...pointwiseOrderingIndependentProps } = pointwiseOrderingIndependentOutput.data as Record<string, unknown>;
    const existingPointwiseOrderingIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    const pointwiseOrderingIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      displayName: "Independent Practice: Order Pointwise Rates",
      description: "Order the rates at labeled graph points.",
      props: {
        ...pointwiseOrderingIndependentProps,
        presentationMode: "independent_practice" as const,
      },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    if (existingPointwiseOrderingIndependentActivity) {
      await ctx.db.patch(existingPointwiseOrderingIndependentActivity._id, pointwiseOrderingIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...pointwiseOrderingIndependentActivityFields,
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
