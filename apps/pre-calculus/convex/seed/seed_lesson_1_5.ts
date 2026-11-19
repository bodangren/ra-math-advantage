import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
} from "../activities";
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from "../../lib/learning-evidence/precalc-pilot";
import {
  generateTopic15LeastPolynomialDegreeOutput,
  generateTopic15PolynomialInequalityOutput,
  generateTopic15RealZerosAndMultiplicitiesOutput,
} from "@math-platform/math-content/knowledge-space";

interface SeedLesson1_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_5Result> => {
    const now = Date.now();
    const lessonSlug = "1-5-polynomial-functions-complex-zeros";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Polynomial Functions and Complex Zeros",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.5: Polynomial Functions and Complex Zeros",
          orderIndex: 5,
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
          title: "Polynomial Functions and Complex Zeros",
          description: "AP Precalculus Topic 1.5: Polynomial Functions and Complex Zeros",
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
                "Look at the graph of $y = -0.01(x+4)(x+1)^3(x-3)^2$. At $x = -4$, the graph crosses straight through the x-axis. At $x = -1$, it crosses but with an S-shape (inflection). At $x = 3$, it touches the x-axis and bounces back. Why does the same polynomial show three different behaviors at its zeros? The answer lies in the **multiplicity** of each factor.",
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
                "- **Zero (root)**: A value $a$ where $p(a) = 0$. If $a$ is real, then $(x - a)$ is a linear factor of $p(x)$.\n- **Factor**: An expression of the form $(x - a)$ corresponding to a zero.\n- **Multiplicity**: The power of a factor. If $(x - a)^k$ is a factor, the zero $a$ has multiplicity $k$.\n- **Conjugate pairs**: Complex zeros of polynomials with real coefficients always come in pairs: if $a + bi$ is a root, then $a - bi$ is also a root.\n- **Fundamental Theorem of Algebra**: A polynomial of degree $n$ has exactly $n$ complex zeros, counting multiplicities.\n- **Sign chart**: A number-line diagram used to solve polynomial inequalities.\n- **Even function**: Symmetric over the y-axis: $f(-x) = f(x)$.\n- **Odd function**: Symmetric about the origin: $f(-x) = -f(x)$.",
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
                "The conjugate-zero rule requires real coefficients. If a polynomial has real coefficients and a nonreal zero $a+bi$, then $a-bi$ is also a zero.\n\n**Multiplicity and graph behavior:**\n- **Odd multiplicity** (1, 3, 5, ...): The graph **crosses** the x-axis at the zero.\n  - Multiplicity 1: crosses cleanly.\n  - Multiplicity 3 (or higher odd): crosses with an inflection (S-shape).\n- **Even multiplicity** (2, 4, 6, ...): The graph is **tangent** to the x-axis — it touches and bounces back.\n\n**Complex zeros**: Some polynomials have zeros containing imaginary numbers. These never appear on the graph. All imaginary roots come in **conjugate pairs**: if $a + bi$ is a root, so is $a - bi$.\n\n**Fundamental Theorem of Algebra**: A polynomial of degree $n$ has exactly $n$ complex zeros when counting multiplicities.\n\n**Sign chart method** (4 steps):\n1. Solve $f(x) = 0$ to find all real zeros.\n2. Place zeros on a number line, creating intervals.\n3. Test a value in each interval to determine the sign of $f(x)$.\n4. Write the solution in interval notation, checking whether endpoints are included.",
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
                "**Example 1:** Find all real zeros with multiplicity.\n\na) $f(x) = -2x^3(x+1)(x-4)^2$ → Degree: $3 + 1 + 2 = 6$. Zeros: $x = 0$ (mult. 3), $x = -1$ (mult. 1), $x = 4$ (mult. 2).\n\nb) $g(x) = 3(x^2 - 4)(x - 2)^4 = 3(x-2)(x+2)(x-2)^4$ → Zeros: $x = 2$ (mult. 5), $x = -2$ (mult. 1).\n\n**Example 2:** The zero $x = isqrt{3}$ is given for polynomial $f$. Since complex zeros come in conjugate pairs, $x = -isqrt{3}$ is also a zero. The graph shows at least 3 real zeros. So: 2 complex + 3 real = least degree 5.\n\n**Example 3:** Solve $(x - 3)(x + 1)(x + 4) > 0$.\n\nRoots: $x = -4$, $x = -1$, $x = 3$. Test intervals:\n- $(-\\infty, -4)$: test $x = -5$ → $(-)(-)(-) = -$. Not part of solution.\n- $(-4, -1)$: test $x = -2$ → $(-)(+)(-) = +$. **Solution.**\n- $(-1, 3)$: test $x = 0$ → $(-)(+)(+) = -$. Not part of solution.\n- $(3, \\infty)$: test $x = 4$ → $(+)(+)(+) = +$. **Solution.**\n\nSolution: $(-4, -1) \\cup (3, \\infty)$.",
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
                "**Problem 1:** $f(x) = x^3 - 4x$. Factor completely, find all zeros with multiplicity, and state whether the graph crosses or is tangent at each zero.\n\n**Hint:** Factor: $x(x^2 - 4) = x(x-2)(x+2)$. All zeros have multiplicity 1 (odd), so the graph crosses at every zero.\n\n**Problem 2:** Solve $(x+2)^2(x-5) \\leq 0$.\n\n**Hint:** Root at $x = -2$ (even — tangent) and $x = 5$ (odd — crosses). Use a sign chart. Since the inequality is $\\leq$, include endpoints where $f(x) = 0$.",
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
                "**Problem 1:** $g(x) = -2x(x-5)^3(x+1)^2$. Find all zeros with multiplicity and describe the graph behavior at each.\n\n**Problem 2:** A polynomial has zeros $x = 3$ (mult. 2), $x = 3i$, and $x = 4 - i$. What is the least possible degree?\n\n**Problem 3:** Solve $(x+3)(x-1)(x-2) < 0$.",
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
                "**Exit Ticket:** Find all zeros of $f(x) = x^3 - 4x$ with multiplicity. State whether the graph crosses or is tangent at each zero.\n\n**Lesson Summary:** The multiplicity of a zero determines how the graph behaves at the x-axis: odd multiplicities cause crossing, even multiplicities cause tangency. The Fundamental Theorem of Algebra guarantees $n$ complex zeros for a degree-$n$ polynomial. Complex zeros come in conjugate pairs. Sign charts solve polynomial inequalities by testing intervals between real zeros.",
            },
          },
        ],
      },
    ] as const;

    let activitiesCreated = 0;

    const realZerosWorkedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(0);
    const realZerosWorkedPublicProps = (
      realZerosWorkedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const realZerosWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
      displayName: "Worked Example: Real Zeros and Multiplicities",
      description:
        "Find the real zeros and their multiplicities from a factored polynomial expression.",
      props: {
        ...realZerosWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswers: realZerosWorkedOutput.expectedAnswer,
        steps: realZerosWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer:
          "For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).",
      },
      gradingConfig: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingRealZerosWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingRealZerosWorkedActivity) {
      await ctx.db.patch(existingRealZerosWorkedActivity._id, realZerosWorkedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...realZerosWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const realZerosGuidedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(1);
    const realZerosGuidedPublicProps = (
      realZerosGuidedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const realZerosGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
      displayName: "Guided Practice: Real Zeros and Multiplicities",
      description:
        "Find the real zeros and their multiplicities from a factored polynomial expression.",
      props: {
        ...realZerosGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Identify each factor that can make the function equal zero.",
          "Count the repeated factors for each zero.",
        ],
        fieldHelp: "List the zeros in ascending order and give the multiplicity of each zero.",
      },
      gradingConfig: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingRealZerosGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingRealZerosGuidedActivity) {
      await ctx.db.patch(existingRealZerosGuidedActivity._id, realZerosGuidedActivityFields);
    } else {
      await ctx.db.insert("activities", {
        ...realZerosGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const realZerosIndependentOutput = generateTopic15RealZerosAndMultiplicitiesOutput(2);
    const realZerosIndependentProps = (
      realZerosIndependentOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const realZerosIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_COMPONENT_KEY,
      displayName: "Independent Practice: Real Zeros and Multiplicities",
      description:
        "Find the real zeros and their multiplicities from a factored polynomial expression.",
      props: realZerosIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingRealZerosIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingRealZerosIndependentActivity) {
      await ctx.db.patch(
        existingRealZerosIndependentActivity._id,
        realZerosIndependentActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...realZerosIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const leastPolynomialDegreeWorkedOutput = generateTopic15LeastPolynomialDegreeOutput(0);
    const leastPolynomialDegreeWorkedPublicProps = (
      leastPolynomialDegreeWorkedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const leastPolynomialDegreeWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
      displayName: "Worked Example: Least Polynomial Degree",
      description:
        "Determine the least possible degree of a real-coefficient polynomial by counting given zeros, multiplicities, and required conjugate zeros.",
      props: {
        ...leastPolynomialDegreeWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswer: leastPolynomialDegreeWorkedOutput.expectedAnswer.leastDegree,
        steps: leastPolynomialDegreeWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "The least possible degree is 5.",
      },
      gradingConfig: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingLeastPolynomialDegreeWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingLeastPolynomialDegreeWorkedActivity) {
      await ctx.db.patch(
        existingLeastPolynomialDegreeWorkedActivity._id,
        leastPolynomialDegreeWorkedActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...leastPolynomialDegreeWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const leastPolynomialDegreeGuidedOutput = generateTopic15LeastPolynomialDegreeOutput(1);
    const leastPolynomialDegreeGuidedPublicProps = (
      leastPolynomialDegreeGuidedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const leastPolynomialDegreeGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
      displayName: "Guided Practice: Least Polynomial Degree",
      description:
        "Determine the least possible degree of a real-coefficient polynomial by counting given zeros, multiplicities, and required conjugate zeros.",
      props: {
        ...leastPolynomialDegreeGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Identify the conjugate zero.",
          "Count the conjugate pair and the real zeros.",
        ],
        fieldHelp: "Add 2 for the conjugate pair to the number of real zeros.",
      },
      gradingConfig: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingLeastPolynomialDegreeGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingLeastPolynomialDegreeGuidedActivity) {
      await ctx.db.patch(
        existingLeastPolynomialDegreeGuidedActivity._id,
        leastPolynomialDegreeGuidedActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...leastPolynomialDegreeGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const leastPolynomialDegreeIndependentOutput = generateTopic15LeastPolynomialDegreeOutput(2);
    const leastPolynomialDegreeIndependentProps = (
      leastPolynomialDegreeIndependentOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const leastPolynomialDegreeIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_COMPONENT_KEY,
      displayName: "Independent Practice: Least Polynomial Degree",
      description:
        "Determine the least possible degree of a real-coefficient polynomial by counting given zeros, multiplicities, and required conjugate zeros.",
      props: leastPolynomialDegreeIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingLeastPolynomialDegreeIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingLeastPolynomialDegreeIndependentActivity) {
      await ctx.db.patch(
        existingLeastPolynomialDegreeIndependentActivity._id,
        leastPolynomialDegreeIndependentActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...leastPolynomialDegreeIndependentActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialInequalityWorkedOutput = generateTopic15PolynomialInequalityOutput(0);
    const polynomialInequalityWorkedPublicProps = (
      polynomialInequalityWorkedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const polynomialInequalityWorkedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
      displayName: "Worked Example: Polynomial Inequality Sign Chart",
      description:
        "Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.",
      props: {
        ...polynomialInequalityWorkedPublicProps,
        presentationMode: "worked_example" as const,
        correctAnswers: polynomialInequalityWorkedOutput.expectedAnswer,
        steps: polynomialInequalityWorkedOutput.solutionSteps.map((step) => step.description),
        finalAnswer: "The solution is (-4, -1) ∪ (3, ∞).",
      },
      gradingConfig: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialInequalityWorkedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq("stableActivityId", PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID),
      )
      .unique();
    if (existingPolynomialInequalityWorkedActivity) {
      await ctx.db.patch(
        existingPolynomialInequalityWorkedActivity._id,
        polynomialInequalityWorkedActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...polynomialInequalityWorkedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialInequalityGuidedOutput = generateTopic15PolynomialInequalityOutput(1);
    const polynomialInequalityGuidedPublicProps = (
      polynomialInequalityGuidedOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const polynomialInequalityGuidedActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
      displayName: "Guided Practice: Polynomial Inequality Sign Chart",
      description:
        "Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.",
      props: {
        ...polynomialInequalityGuidedPublicProps,
        presentationMode: "guided_practice" as const,
        guidedSteps: [
          "Find and sort the distinct real roots.",
          "Test one value in each interval and record the sign.",
          "Use the inequality operator to write the interval union.",
        ],
        fieldHelp: {
          roots: "Enter the sorted distinct real roots.",
          intervalSigns: "Enter one sign for each interval from left to right.",
          solution: "Write the solution as an interval union.",
        },
      },
      gradingConfig: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialInequalityGuidedActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq("stableActivityId", PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID),
      )
      .unique();
    if (existingPolynomialInequalityGuidedActivity) {
      await ctx.db.patch(
        existingPolynomialInequalityGuidedActivity._id,
        polynomialInequalityGuidedActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...polynomialInequalityGuidedActivityFields,
        createdAt: now,
      });
      activitiesCreated++;
    }

    const polynomialInequalityIndependentOutput = generateTopic15PolynomialInequalityOutput(2);
    const polynomialInequalityIndependentProps = (
      polynomialInequalityIndependentOutput.data as {
        rendererProps: Record<string, unknown>;
      }
    ).rendererProps;
    const polynomialInequalityIndependentActivityFields = {
      stableActivityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_COMPONENT_KEY,
      displayName: "Independent Practice: Polynomial Inequality Sign Chart",
      description:
        "Find the real zeros, test the sign on each interval, and write the solution to a polynomial inequality in interval notation.",
      props: polynomialInequalityIndependentProps,
      gradingConfig: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_GRADING_CONFIG,
      updatedAt: now,
    };
    const existingPolynomialInequalityIndependentActivity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (query) =>
        query.eq(
          "stableActivityId",
          PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
        ),
      )
      .unique();
    if (existingPolynomialInequalityIndependentActivity) {
      await ctx.db.patch(
        existingPolynomialInequalityIndependentActivity._id,
        polynomialInequalityIndependentActivityFields,
      );
    } else {
      await ctx.db.insert("activities", {
        ...polynomialInequalityIndependentActivityFields,
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
