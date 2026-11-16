import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
} from "../activities";
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from "../../lib/learning-evidence/precalc-pilot";
import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  generateTopic14PolynomialExtremaFromGraphOutput,
  generateTopic14PolynomialEndBehaviorOutput,
  generateTopic14RateSignAndTrendOutput,
} from "@math-platform/math-content/knowledge-space";

interface SeedLesson1_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_4Result> => {
    const now = Date.now();
    const lessonSlug = "1-4-polynomial-functions-rates";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Polynomial Functions and Rates of Change",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.4: Polynomial Functions and Rates of Change",
          orderIndex: 4,
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
          title: "Polynomial Functions and Rates of Change",
          description: "AP Precalculus Topic 1.4: Polynomial Functions and Rates of Change",
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
          "markdown": "Consider the polynomial $f(x) = -2x^5 + 3x^3 - x + 6$. What is the highest power of $x$? What is its coefficient? These two pieces of information — the **degree** and the **leading coefficient** — control the overall shape of the polynomial. Now look at a graph of a polynomial: where does it reach its lowest and highest points? Where does it change from curving upward to curving downward? This lesson builds the vocabulary to describe these features precisely."
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
          "markdown": "- **Polynomial function**: Any function equivalent to $p(x) = a_n x^n + a_{n-1}x^{n-1} + \\cdots + a_1 x + a_0$, where $n$ is a positive integer, each $a_i$ is a real number, and $a_n \\neq 0$.\n- **Degree**: The highest power of $x$ with a nonzero coefficient.\n- **Leading coefficient (LC)**: The coefficient $a_n$ of the highest-degree term.\n- **Leading term**: The term $a_n x^n$ — determines the polynomial's end behavior.\n- **Relative minimum / Relative maximum**: A point where the function switches between decreasing and increasing (local extrema).\n- **Absolute minimum / Absolute maximum**: The smallest / largest value of the function over its entire domain (global extrema).\n- **Point of inflection**: A point where the function changes concavity — where the rate of change switches between increasing and decreasing."
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
          "markdown": "A **polynomial function** has the form $p(x) = a_n x^n + a_{n-1}x^{n-1} + \\cdots + a_1 x + a_0$.\n\n**Extrema** are the minimums and maximums of a function:\n- A **relative (local) extremum** is the highest or lowest point within a neighborhood.\n- An **absolute (global) extremum** is the highest or lowest point over the entire domain.\n\nKey facts about polynomials:\n- Between any two real zeros of a polynomial, there must be at least one relative minimum or relative maximum.\n- Polynomials of odd degree must have at least one relative minimum or relative maximum.\n- A polynomial of even degree with positive leading coefficient has an absolute minimum; with negative leading coefficient, it has an absolute maximum.\n- A polynomial of odd degree has neither an absolute minimum nor an absolute maximum.\n\nA **point of inflection** occurs when the graph changes from concave up to concave down (or vice versa). At a point of inflection, the rate of change switches between increasing and decreasing.\n\nConnecting graph behavior to rate of change language:\n- \"Rate of change is positive and increasing\" → graph is rising and getting steeper.\n- \"Rate of change is positive and decreasing\" → graph is rising but flattening out.\n- \"Rate of change is negative and decreasing\" → graph is falling and getting steeper (more negative).\n- \"Rate of change is negative and increasing\" → graph is falling but leveling off."
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
          "markdown": "**Example 1:** Find the leading coefficient and degree.\n\na) $f(x) = 3x^4 + 2x - 7$ → **LC: 3, Degree: 4**\nb) $y = \\frac{1}{2}x - 7x^3 + 11$ → Rewrite: $-7x^3 + \\frac{1}{2}x + 11$. **LC: -7, Degree: 3**\nc) $g(x) = 4$ → This is $4x^0$. **LC: 4, Degree: 0**\n\n**Example 2:** On $[0,5]$, let $g(x)=-2x^3+15x^2-24x$. Its graph has a minimum at $(1,-11)$ and a maximum at $(4,16)$ on this restricted domain. At $x = 1$, the graph switches from decreasing to increasing: this is a **relative minimum**. At $x = 4$, the graph switches from increasing to decreasing: this is a **relative maximum**. The lowest value overall is at $x = 1$, so $g(1)$ is the **absolute minimum**.\n\n**Example 3:** Let $h(x)=-(x-4)^2+8$. On the interval $(3,4)$: the graph is rising (positive rate of change) but the curve is flattening (rate of change is decreasing). So the rate of change is **positive and decreasing** on $(3, 4)$.\n\n**Example 4:** $f(x) = -3x^4$. Leading term is $-3x^4$. Since degree 4 is even and LC is negative: lim(x to -infty) f(x) = -infty and lim(x to infty) f(x) = -infty."
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
          "markdown": "**Problem 1:** Use the graph of $g(x)=-2x^3+15x^2-24x$ on the full real line. Its turning points are $(1,-11)$ and $(4,16)$, and its inflection point is $(5/2,5/2)$. Identify: (a) the $x$-value of any relative minimum, (b) the $x$-value of any relative maximum, (c) any point of inflection, (d) is there an absolute maximum? Why or why not?\n\n**Hint:** Relative extrema occur where the graph switches between increasing and decreasing. Inflection points occur where concavity changes.\n\n**Problem 2:** The function $f(x) = x^4 - 3x^5 + x + 6$ is a polynomial. Does it have an absolute minimum, absolute maximum, or neither? Explain.\n\n**Hint:** The leading term is $-3x^5$ — odd degree, negative LC. The graph rises to the left and falls to the right, so it has neither an absolute maximum nor an absolute minimum."
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
          "markdown": "**Problem 1:** Sketch a polynomial with two points of inflection, one absolute maximum, and no absolute minimum.\n\n**Problem 2:** Let $f(x)=-(x-4)^2+8$ on $[-1,7]$. Plot the points $(-1,-17),(0,-8),(2,4),(4,8),(6,4),(7,-1)$ and draw the parabola. Find the open interval where $f$ increases and is concave down.\n\n**Problem 3:** Use $h(x)=-(x-4)^2+8$ on $[-1,7]$. Find the open interval where the rate of change is positive and decreasing."
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
          "markdown": "**Exit Ticket:** Sketch a polynomial with one relative maximum, one relative minimum, and one point of inflection. Label each feature.\n\n**Lesson Summary:** Polynomials are defined by their degree and leading coefficient. Extrema are points where the function switches between increasing and decreasing. Points of inflection mark changes in concavity. On the AP Exam, you must describe function behavior and rate of change on specific intervals using precise language."
        }
      }
    ]
  }
] as const;

    let activitiesCreated = 0;

    const polynomialWorkedVariant = generateTopic14PolynomialDegreeLeadingCoefficient(0);
    const polynomialWorkedOutput = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
    const polynomialWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
      displayName: "Worked Example: Degree and Leading Coefficient",
      description: "Identify the degree and leading coefficient of each polynomial.",
      props: {
        prompt: polynomialWorkedVariant.prompt,
        items: polynomialWorkedVariant.items,
        presentationMode: "worked_example" as const,
        correctAnswers: polynomialWorkedOutput.expectedAnswer,
        steps: polynomialWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialWorkedActivity) {
      await ctx.db.patch(existingPolynomialWorkedActivity._id, polynomialWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialGuidedVariant = generateTopic14PolynomialDegreeLeadingCoefficient(1);
    const polynomialGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
      displayName: "Guided Practice: Degree and Leading Coefficient",
      description: "Identify the degree and leading coefficient of each polynomial.",
      props: {
        prompt: polynomialGuidedVariant.prompt,
        items: polynomialGuidedVariant.items,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Find the term with the greatest exponent in each expression.",
          "Use that exponent as the degree.",
          "Use the coefficient of that term as the leading coefficient.",
          "Treat a nonzero constant as a degree-0 polynomial.",
        ],
        fieldHelp: "Inspect exponents before you use the written term order.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialGuidedActivity) {
      await ctx.db.patch(existingPolynomialGuidedActivity._id, polynomialGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialIndependentOutput = generateTopic14PolynomialDegreeLeadingCoefficientOutput(2);
    const { rendererProps: polynomialIndependentProps } = polynomialIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    };
    const polynomialIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_COMPONENT_KEY,
      displayName: "Independent Practice: Degree and Leading Coefficient",
      description: "Identify the degree and leading coefficient of each polynomial.",
      props: polynomialIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialIndependentActivity) {
      await ctx.db.patch(existingPolynomialIndependentActivity._id, polynomialIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialExtremaWorkedOutput = generateTopic14PolynomialExtremaFromGraphOutput(0);
    const polynomialExtremaWorkedPublicProps = (polynomialExtremaWorkedOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const polynomialExtremaWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
      displayName: "Worked Example: Identify Extrema from a Graph",
      description: "Identify relative and absolute extrema from a polynomial graph.",
      props: {
        ...polynomialExtremaWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswers: polynomialExtremaWorkedOutput.expectedAnswer,
        steps: polynomialExtremaWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "x = 1 is a relative minimum and the absolute minimum; x = 4 is a relative maximum.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialExtremaWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialExtremaWorkedActivity) {
      await ctx.db.patch(existingPolynomialExtremaWorkedActivity._id, polynomialExtremaWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialExtremaWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialExtremaGuidedOutput = generateTopic14PolynomialExtremaFromGraphOutput(1);
    const polynomialExtremaGuidedPublicProps = (polynomialExtremaGuidedOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const polynomialExtremaGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
      displayName: "Guided Practice: Identify Extrema from a Graph",
      description: "Identify relative and absolute extrema from a polynomial graph.",
      props: {
        ...polynomialExtremaGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Find where the graph changes from decreasing to increasing.",
          "Find where the graph changes from increasing to decreasing.",
          "Compare the displayed y-values to identify the absolute minimum.",
        ],
        fieldHelp: "A relative extremum occurs where the graph changes direction. The absolute minimum is the lowest displayed value.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialExtremaGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialExtremaGuidedActivity) {
      await ctx.db.patch(existingPolynomialExtremaGuidedActivity._id, polynomialExtremaGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialExtremaGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialExtremaIndependentOutput = generateTopic14PolynomialExtremaFromGraphOutput(2);
    const polynomialExtremaIndependentProps = (polynomialExtremaIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const polynomialExtremaIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_COMPONENT_KEY,
      displayName: "Independent Practice: Identify Extrema from a Graph",
      description: "Identify relative and absolute extrema from a polynomial graph.",
      props: polynomialExtremaIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialExtremaIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialExtremaIndependentActivity) {
      await ctx.db.patch(existingPolynomialExtremaIndependentActivity._id, polynomialExtremaIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialExtremaIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const rateSignWorkedOutput = generateTopic14RateSignAndTrendOutput(0);
    const rateSignWorkedPublicProps = (rateSignWorkedOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const rateSignWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
      displayName: "Worked Example: Rate Sign and Trend",
      description: "Determine the sign and trend of the rate of change on an interval.",
      props: {
        ...rateSignWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswers: rateSignWorkedOutput.expectedAnswer,
        steps: rateSignWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "The rate of change is positive and decreasing on (3, 4).",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingRateSignWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (existingRateSignWorkedActivity) {
      await ctx.db.patch(existingRateSignWorkedActivity._id, rateSignWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...rateSignWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const rateSignGuidedOutput = generateTopic14RateSignAndTrendOutput(1);
    const rateSignGuidedPublicProps = (rateSignGuidedOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const rateSignGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
      displayName: "Guided Practice: Rate Sign and Trend",
      description: "Determine the sign and trend of the rate of change on an interval.",
      props: {
        ...rateSignGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Determine whether h rises or falls on the interval.",
          "Determine whether the rate of change increases or decreases as x increases.",
        ],
        fieldHelp: "A positive rate means h rises. A decreasing rate means the graph flattens as x increases.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingRateSignGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    if (existingRateSignGuidedActivity) {
      await ctx.db.patch(existingRateSignGuidedActivity._id, rateSignGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...rateSignGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const rateSignIndependentOutput = generateTopic14RateSignAndTrendOutput(2);
    const rateSignIndependentProps = (rateSignIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const rateSignIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_COMPONENT_KEY,
      displayName: "Independent Practice: Rate Sign and Trend",
      description: "Determine the sign and trend of the rate of change on an interval.",
      props: rateSignIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingRateSignIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    if (existingRateSignIndependentActivity) {
      await ctx.db.patch(existingRateSignIndependentActivity._id, rateSignIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...rateSignIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialEndWorkedOutput = generateTopic14PolynomialEndBehaviorOutput(0);
    const polynomialEndWorkedPublicProps = (polynomialEndWorkedOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const polynomialEndWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
      displayName: "Worked Example: Polynomial End Behavior",
      description: "Determine polynomial end behavior from the leading term.",
      props: {
        ...polynomialEndWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswers: polynomialEndWorkedOutput.expectedAnswer,
        steps: polynomialEndWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "As x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches negative infinity.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialEndWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialEndWorkedActivity) {
      await ctx.db.patch(existingPolynomialEndWorkedActivity._id, polynomialEndWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialEndWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialEndGuidedOutput = generateTopic14PolynomialEndBehaviorOutput(1);
    const polynomialEndGuidedPublicProps = (polynomialEndGuidedOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const polynomialEndGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
      displayName: "Guided Practice: Polynomial End Behavior",
      description: "Determine polynomial end behavior from the leading term.",
      props: {
        ...polynomialEndGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Identify whether the degree is even or odd.",
          "Identify whether the leading coefficient is positive or negative.",
          "Use the degree parity and leading-coefficient sign to determine both ends.",
        ],
        fieldHelp: "An even degree sends both ends in the same direction. An odd degree sends them in opposite directions. The leading coefficient determines the right end.",
      },
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialEndGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialEndGuidedActivity) {
      await ctx.db.patch(existingPolynomialEndGuidedActivity._id, polynomialEndGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialEndGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialEndIndependentOutput = generateTopic14PolynomialEndBehaviorOutput(2);
    const polynomialEndIndependentProps = (polynomialEndIndependentOutput.data as {
      rendererProps: Record<string, unknown>;
    }).rendererProps;
    const polynomialEndIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_COMPONENT_KEY,
      displayName: "Independent Practice: Polynomial End Behavior",
      description: "Determine polynomial end behavior from the leading term.",
      props: polynomialEndIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialEndIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) => (
        query.eq("stableActivityId", PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID)
      ))
      .unique();
    if (existingPolynomialEndIndependentActivity) {
      await ctx.db.patch(existingPolynomialEndIndependentActivity._id, polynomialEndIndependentActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...polynomialEndIndependentActivityFields,
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
