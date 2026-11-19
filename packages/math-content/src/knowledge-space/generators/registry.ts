// Math generator registry
//
// Maps generatorKey → deterministic generator implementation.
// Generators conform to the knowledge-space-practice DeterministicGenerator contract.
// Pilot generators produce deterministic output for Module 1 skills.

import type {
  GeneratorInput,
  GeneratorOutput,
  GradingMetadata,
} from "@math-platform/knowledge-space-practice";
import {
  polynomialOperationsAdapter,
  polynomialDivisionAdapter,
  rationalAnalyzerAdapter,
  expLogSolverAdapter,
} from "./advanced-math-adapters";
import {
  linearEquationAdapter,
  systemOfEquationsAdapter,
  quadraticFactoringAdapter,
  quadraticFormulaAdapter,
} from "./algebra-generators-adapters";
import { seededRandom } from "../../utils/prng";
import {
  generateTopic11IntervalGraphOutput,
  TOPIC11_INTERVAL_GRAPH_NODE_ID,
} from "./topic11-interval-graph";
import {
  generateTopic11PhysicalContextGraphChoiceOutput,
  TOPIC11_PHYSICAL_CONTEXT_GRAPH_CHOICE_NODE_ID,
} from "./topic11-physical-context-graph-choice";
import {
  generateTopic12TableAverageRateChoiceOutput,
  TOPIC12_TABLE_AVERAGE_RATE_CHOICE_NODE_ID,
} from "./topic12-table-average-rate-choice";
import {
  generateTopic12GraphAverageRateChoiceOutput,
  TOPIC12_GRAPH_AVERAGE_RATE_CHOICE_NODE_ID,
} from "./topic12-graph-average-rate-choice";
import {
  generateTopic12PointwiseLeastRateChoiceOutput,
  TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID,
} from "./topic12-pointwise-least-rate-choice";
import {
  generateTopic12PointwiseRateOrderingOutput,
  TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
} from "./topic12-pointwise-rate-ordering";
import {
  generateTopic12NegativeRateContextChoiceOutput,
  TOPIC12_NEGATIVE_RATE_CONTEXT_CHOICE_NODE_ID,
} from "./topic12-negative-rate-context-choice";
import {
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  TOPIC12_QUADRATIC_NEGATIVE_RATE_INTERVAL_CHOICE_NODE_ID,
} from "./topic12-quadratic-negative-rate-interval-choice";
import {
  generateTopic13RatePatternClassificationOutput,
  TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
} from "./topic13-rate-pattern-classification";
import {
  generateTopic13ConcavityFromRateChangeOutput,
  TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID,
} from "./topic13-concavity-from-rate-change";
import {
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  TOPIC14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
} from "./topic14-polynomial-degree-leading-coefficient";
import {
  generateTopic14PolynomialExtremaFromGraphOutput,
  TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID,
} from "./topic14-polynomial-extrema-from-graph";
import {
  generateTopic14RateSignAndTrendOutput,
  TOPIC14_RATE_SIGN_AND_TREND_NODE_ID,
} from "./topic14-rate-sign-and-trend";
import {
  generateTopic14PolynomialEndBehaviorOutput,
  TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID,
} from "./topic14-polynomial-end-behavior";
import {
  generateTopic15RealZerosAndMultiplicitiesOutput,
  TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
} from "./topic15-real-zeros-and-multiplicities";
import {
  generateTopic15LeastPolynomialDegreeOutput,
  TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID,
} from "./topic15-least-polynomial-degree";
import {
  generateTopic15PolynomialInequalityOutput,
  TOPIC15_POLYNOMIAL_INEQUALITY_SIGN_CHART_NODE_ID,
} from "./topic15-polynomial-inequality-sign-chart";
import {
  generateTopic16EquationEndBehaviorOutput,
  TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID,
} from "./topic16-equation-end-behavior";
import {
  generateTopic16LimitNotationEndBehaviorOutput,
  TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID,
} from "./topic16-limit-notation-end-behavior";
import { im1VerbalToNumericalGenerator } from "./im1-verbal-to-numerical-adapter";

export interface QaSkipSpec {
  readonly uniqueAnswer?: boolean;
  readonly reason: string;
}

export interface MathGenerator {
  key: string;
  nodeIds: string[];
  description?: string;
  readonly qaSkip?: QaSkipSpec;
  generate: (input: GeneratorInput) => GeneratorOutput;
}

// ---------------------------------------------------------------------------
// Deterministic generators for Module 1 pilot
// ---------------------------------------------------------------------------

const QUADRATIC_DOMAIN_RANGE_NODE_ID =
  "math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph";
const QUADRATIC_MAXIMUM_READING_NODE_ID =
  "math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph";
const QUADRATIC_SYMMETRY_NODE_ID =
  "math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry";
const QUADRATIC_COMPARISON_NODE_ID =
  "math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions";
const ONE_REAL_SOLUTION_NODE_ID =
  "math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing";
const TWO_REAL_SOLUTIONS_NODE_ID =
  "math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing";

const quadraticGraphAnalysisGenerator: MathGenerator = {
  key: "quadratic-graph-analysis",
  nodeIds: [
    "math.im3.skill.1.1.graph-quadratic-functions",
    QUADRATIC_DOMAIN_RANGE_NODE_ID,
    QUADRATIC_MAXIMUM_READING_NODE_ID,
    QUADRATIC_SYMMETRY_NODE_ID,
    QUADRATIC_COMPARISON_NODE_ID,
  ],
  description: "Generates quadratic table-and-graph problems.",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const randomA = rand() < 0.5 ? -1 : 1;
    const a = input.nodeId === QUADRATIC_MAXIMUM_READING_NODE_ID ? -1 : randomA;
    const bValues = [-1, 0, 1];
    const b = bValues[Math.min(bValues.length - 1, Math.floor(rand() * bValues.length))] ?? 0;
    const cValues = [-2, -1, 0, 1, 2];
    const c = cValues[Math.min(cValues.length - 1, Math.floor(rand() * cValues.length))] ?? 0;
    const quadraticTerm = a === 1 ? "x^2" : "-x^2";
    const linearTerm = b === 0 ? "" : b === 1 ? " + x" : " - x";
    const constantTerm = c === 0 ? "" : c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
    const equation = `y = ${quadraticTerm}${linearTerm}${constantTerm}`;

    if (input.nodeId === QUADRATIC_COMPARISON_NODE_ID) {
      const firstVertexX = 1 + Math.floor(rand() * 3);
      const secondVertexX = 1 + Math.floor(rand() * 2);
      const firstScale = -(1 + Math.floor(rand() * 3));
      const secondScale = -(1 + Math.floor(rand() * 3));
      const baseMaximum = -2 + Math.floor(rand() * 7);
      const gap = 1 + Math.floor(rand() * 3);
      const winnerBit = rand() < 0.5 ? 0 : 1;
      const firstMaximum = winnerBit === 0 ? baseMaximum + gap : baseMaximum;
      const secondMaximum = winnerBit === 0 ? baseMaximum : baseMaximum + gap;
      const firstLinearCoefficient = -2 * firstScale * firstVertexX;
      const secondLinearCoefficient = -2 * secondScale * secondVertexX;
      const firstYIntercept = firstScale * firstVertexX ** 2 + firstMaximum;
      const secondYIntercept = secondScale * secondVertexX ** 2 + secondMaximum;
      const firstQuadraticTerm = firstScale === -1 ? "-x^2" : `${firstScale}x^2`;
      const secondQuadraticTerm = secondScale === -1 ? "-x^2" : `${secondScale}x^2`;
      const firstLinearTerm = ` + ${firstLinearCoefficient}x`;
      const secondLinearTerm = ` + ${secondLinearCoefficient}x`;
      const firstConstantTerm =
        firstYIntercept === 0
          ? ""
          : firstYIntercept > 0
            ? ` + ${firstYIntercept}`
            : ` - ${Math.abs(firstYIntercept)}`;
      const secondConstantTerm =
        secondYIntercept === 0
          ? ""
          : secondYIntercept > 0
            ? ` + ${secondYIntercept}`
            : ` - ${Math.abs(secondYIntercept)}`;
      const firstEquation = `y = ${firstQuadraticTerm}${firstLinearTerm}${firstConstantTerm}`;
      const secondEquation = `y = ${secondQuadraticTerm}${secondLinearTerm}${secondConstantTerm}`;
      const firstMaximumFromCoefficients =
        firstYIntercept - firstLinearCoefficient ** 2 / (4 * firstScale);
      const secondVertexXFromCoefficients = -secondLinearCoefficient / (2 * secondScale);
      const secondMaximumFromCoefficients =
        secondYIntercept - secondLinearCoefficient ** 2 / (4 * secondScale);
      const comparisonOperator =
        firstMaximumFromCoefficients > secondMaximumFromCoefficients ? ">" : "<";
      const comparisonAnswer = comparisonOperator === ">" ? "first" : "second";
      const winnerFunction = comparisonAnswer === "first" ? "f(x)" : "g(x)";
      const comparisonQuestion = `The graph of f(x) is shown. Function g has a y-intercept of ${secondYIntercept} and a vertex at (${secondVertexXFromCoefficients}, ${secondMaximumFromCoefficients}). Which function has the greater maximum value?`;
      const rendererProps = {
        equation: firstEquation,
        variant: "compare_functions" as const,
        responseVariant: "compare_maximums" as const,
        comparisonEquation: secondEquation,
        comparisonQuestion,
        comparisonAnswer: comparisonAnswer as "first" | "second",
        vertex: [secondVertexXFromCoefficients, secondMaximumFromCoefficients] as [number, number],
        yIntercept: [0, secondYIntercept] as [number, number],
        domain: [-2, 6] as [number, number],
        range: [
          Math.min(firstMaximumFromCoefficients, secondMaximumFromCoefficients, secondYIntercept) -
            3,
          Math.max(firstMaximumFromCoefficients, secondMaximumFromCoefficients, secondYIntercept) +
            3,
        ] as [number, number],
      };
      const expectedAnswer = { greater_maximum: comparisonAnswer };
      const gradingMetadata: GradingMetadata = {
        partAnswers: expectedAnswer,
        partMaxScores: { greater_maximum: 1 },
        partGradingRules: { greater_maximum: "exact_match" },
      };

      return {
        prompt: comparisonQuestion,
        data: { difficulty: input.difficulty, rendererProps },
        expectedAnswer,
        solutionSteps: [
          {
            description: "Read f(x)'s maximum value from its graph",
            expression: `f maximum = ${firstMaximumFromCoefficients}`,
          },
          {
            description: "Use g(x)'s vertex to find its maximum value",
            expression: `g maximum = ${secondMaximumFromCoefficients}`,
          },
          {
            description: "Compare the two maximum values",
            expression: `${firstMaximumFromCoefficients} ${comparisonOperator} ${secondMaximumFromCoefficients}`,
          },
          {
            description: "State the greater function",
            expression: `${winnerFunction} has the greater maximum value.`,
          },
        ],
        gradingMetadata,
      };
    }

    if (input.nodeId === QUADRATIC_MAXIMUM_READING_NODE_ID) {
      const vertexX = -b / (2 * a);
      const vertexY = c - b ** 2 / (4 * a);
      const rendererProps = {
        equation,
        variant: "plot_from_equation" as const,
        responseVariant: "maximum_value" as const,
        domain: [-5, 5] as [number, number],
        range: [-10, 10] as [number, number],
      };
      const expectedAnswer = { maximum_value: vertexY };
      const gradingMetadata: GradingMetadata = {
        partAnswers: expectedAnswer,
        partMaxScores: { maximum_value: 1 },
        partGradingRules: { maximum_value: "numeric_tolerance" },
      };

      return {
        prompt: "Use the displayed graph to identify its maximum value.",
        data: { a, b, c, difficulty: input.difficulty, rendererProps },
        expectedAnswer,
        solutionSteps: [
          {
            description: "Locate the highest point on the displayed graph",
            expression: `Vertex = (${vertexX}, ${vertexY})`,
          },
          {
            description: "Take the y-coordinate of the vertex",
            expression: `Maximum = ${vertexY}`,
            value: vertexY,
          },
        ],
        gradingMetadata,
      };
    }

    if (input.nodeId === QUADRATIC_SYMMETRY_NODE_ID) {
      const vertexXValues = [1, 2];
      const vertexX =
        vertexXValues[
          Math.min(vertexXValues.length - 1, Math.floor(rand() * vertexXValues.length))
        ] ?? 1;
      const vertexYValues = [-3, -2, -1, 0, 1, 2, 3];
      const vertexY =
        vertexYValues[
          Math.min(vertexYValues.length - 1, Math.floor(rand() * vertexYValues.length))
        ] ?? 0;
      const verticalScaleValues = [-3, -2, -1, 1, 2, 3];
      const verticalScale =
        verticalScaleValues[
          Math.min(verticalScaleValues.length - 1, Math.floor(rand() * verticalScaleValues.length))
        ] ?? -1;
      const yInterceptY = verticalScale * vertexX ** 2 + vertexY;
      const symmetryB = -2 * verticalScale * vertexX;
      const quadraticTerm =
        verticalScale === 1 ? "x^2" : verticalScale === -1 ? "-x^2" : `${verticalScale}x^2`;
      const linearTerm =
        symmetryB === 0
          ? ""
          : symmetryB > 0
            ? ` + ${symmetryB === 1 ? "x" : `${symmetryB}x`}`
            : ` - ${Math.abs(symmetryB) === 1 ? "x" : `${Math.abs(symmetryB)}x`}`;
      const constantTerm =
        yInterceptY === 0
          ? ""
          : yInterceptY > 0
            ? ` + ${yInterceptY}`
            : ` - ${Math.abs(yInterceptY)}`;
      const equation = `y = ${quadraticTerm}${linearTerm}${constantTerm}`;
      const minimumY = Math.min(vertexY, yInterceptY);
      const verticalSpan = Math.ceil((Math.abs(vertexY - yInterceptY) + 6) / 10) * 10;
      const rendererProps = {
        equation,
        variant: "plot_from_equation" as const,
        responseVariant: "symmetry_graph" as const,
        vertex: [vertexX, vertexY] as [number, number],
        yIntercept: [0, yInterceptY] as [number, number],
        domain: [-3, 7] as [number, number],
        range: [minimumY - 3, minimumY - 3 + verticalSpan] as [number, number],
      };
      const expectedAnswer = {
        placed_points: [
          { x: vertexX, y: vertexY },
          { x: 0, y: yInterceptY },
          { x: 2 * vertexX, y: yInterceptY },
        ],
      };
      const gradingMetadata: GradingMetadata = {
        partAnswers: expectedAnswer,
        partMaxScores: { placed_points: 1 },
        partGradingRules: { placed_points: "custom" },
      };

      return {
        prompt: `The vertex is (${vertexX}, ${vertexY}), and the y-intercept is (0, ${yInterceptY}). Graph the quadratic by using symmetry.`,
        data: {
          a: verticalScale,
          b: symmetryB,
          c: yInterceptY,
          difficulty: input.difficulty,
          vertexX,
          vertexY,
          verticalScale,
          yInterceptY,
          rendererProps,
        },
        expectedAnswer,
        solutionSteps: [
          {
            description: `Plot the vertex (${vertexX}, ${vertexY}) and identify the axis of symmetry x = ${vertexX}`,
            expression: `(${vertexX}, ${vertexY}); x = ${vertexX}`,
          },
          {
            description: `Plot the y-intercept (0, ${yInterceptY})`,
            expression: `(0, ${yInterceptY})`,
          },
          {
            description: `Reflect the y-intercept across x = ${vertexX} to get (${2 * vertexX}, ${yInterceptY})`,
            expression: `(0, ${yInterceptY}) → (${2 * vertexX}, ${yInterceptY})`,
          },
          {
            description: `Draw the ${verticalScale < 0 ? "downward-opening" : "upward-opening"} parabola through the three points`,
            expression: expectedAnswer.placed_points.map(({ x, y }) => `(${x}, ${y})`).join(", "),
          },
        ],
        gradingMetadata,
      };
    }

    if (input.nodeId === QUADRATIC_DOMAIN_RANGE_NODE_ID) {
      const vertexY = c - b ** 2 / (4 * a);
      const rangeRelation = a > 0 ? "gte" : "lte";
      const expectedAnswer = {
        domain: "all_real_numbers",
        range: { relation: rangeRelation, boundary: vertexY },
      };
      const rendererProps = {
        equation,
        variant: "plot_from_equation" as const,
        responseVariant: "domain_range" as const,
        domain: [-5, 5] as [number, number],
        range: [-10, 10] as [number, number],
      };

      const gradingMetadata: GradingMetadata = {
        partAnswers: expectedAnswer,
        partMaxScores: { domain: 1, range: 1 },
        partGradingRules: { domain: "exact_match", range: "custom" },
      };

      return {
        prompt: `Use the displayed quadratic graph to state the domain and range of ${equation}.`,
        data: { a, b, c, difficulty: input.difficulty, rendererProps },
        expectedAnswer,
        solutionSteps: [
          {
            description: "State the domain of a quadratic function",
            expression: "Domain = all real numbers",
          },
          {
            description: "Use the vertex to find the range boundary",
            expression: `y = ${vertexY}`,
            value: vertexY,
          },
          {
            description: "State the range from the opening direction",
            expression: `Range: ${rangeRelation === "gte" ? "y ≥" : "y ≤"} ${vertexY}`,
            value: expectedAnswer.range,
          },
        ],
        gradingMetadata,
      };
    }

    const xValues = [-2, -1, 0, 1, 2];
    const tableValues = xValues.map((x) => ({ x, y: a * x * x + b * x + c }));
    const rendererProps = {
      equation,
      variant: "plot_from_equation" as const,
      responseVariant: "table_graph" as const,
      domain: [-5, 5] as [number, number],
      range: [-10, 10] as [number, number],
    };

    const gradingMetadata: GradingMetadata = {
      partAnswers: { table_values: tableValues, placed_points: tableValues },
      partMaxScores: { table_values: 1, placed_points: 1 },
      partGradingRules: { table_values: "custom", placed_points: "custom" },
    };

    return {
      prompt: `Complete the table for ${equation} using x = -2, -1, 0, 1, 2, then plot all five points.`,
      data: { a, b, c, difficulty: input.difficulty, tableValues, rendererProps },
      expectedAnswer: { table_values: tableValues, placed_points: tableValues },
      solutionSteps: [
        {
          description: "Substitute each x-value",
          expression: `${equation} for x = -2, -1, 0, 1, 2`,
        },
        {
          description: "Complete the table",
          expression: tableValues.map(({ x, y }) => `(${x}, ${y})`).join(", "),
        },
        {
          description: "Plot all five points",
          expression: tableValues.map(({ x, y }) => `(${x}, ${y})`).join(", "),
        },
      ],
      gradingMetadata,
    };
  },
};

const averageRateOfChangeGenerator: MathGenerator = {
  key: "average-rate-of-change",
  nodeIds: ["math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation"],
  description: "Generates average rate of change problems. Students compute (f(b)-f(a))/(b-a).",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const aValues = [-2, -1, 1, 2];
    const bValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    const cValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
    const intervalStartValues = [-4, -3, -2, -1, 0];
    const intervalWidthValues = [2, 3, 4, 5, 6];
    const a = aValues[Math.floor(rand() * aValues.length)];
    const bCoeff = bValues[Math.floor(rand() * bValues.length)];
    const c = cValues[Math.floor(rand() * cValues.length)];
    const intervalStart = intervalStartValues[Math.floor(rand() * intervalStartValues.length)];
    const intervalWidth = intervalWidthValues[Math.floor(rand() * intervalWidthValues.length)];
    const intervalEnd = intervalStart + intervalWidth;

    const quadraticTerm = a === 1 ? "x^2" : a === -1 ? "-x^2" : `${a}x^2`;
    const terms = [quadraticTerm];
    if (bCoeff !== 0) {
      const linearTerm = Math.abs(bCoeff) === 1 ? "x" : `${Math.abs(bCoeff)}x`;
      terms.push(`${bCoeff > 0 ? "+" : "-"} ${linearTerm}`);
    }
    if (c !== 0) {
      terms.push(`${c > 0 ? "+" : "-"} ${Math.abs(c)}`);
    }
    const rightHandSide = terms.join(" ");
    const equation = `f(x) = ${rightHandSide}`;
    const fAtStart = a * intervalStart ** 2 + bCoeff * intervalStart + c;
    const fAtEnd = a * intervalEnd ** 2 + bCoeff * intervalEnd + c;
    const rate = (fAtEnd - fAtStart) / intervalWidth;
    const prompt = `Find the average rate of change of ${equation} on the interval [${intervalStart}, ${intervalEnd}].`;
    const rendererProps = {
      sourceType: "function" as const,
      data: { expression: equation },
      interval: { start: intervalStart, end: intervalEnd },
    };

    const gradingMetadata: GradingMetadata = {
      partAnswers: { f_a: fAtStart, f_b: fAtEnd, rate },
      partMaxScores: { f_a: 2, f_b: 2, rate: 3 },
      partGradingRules: {
        f_a: "numeric_tolerance",
        f_b: "numeric_tolerance",
        rate: "numeric_tolerance",
      },
      partTolerances: { f_a: 0.01, f_b: 0.01, rate: 0.01 },
    };

    return {
      prompt,
      data: { a, b: bCoeff, c, intervalStart, intervalEnd, rendererProps },
      expectedAnswer: { f_a: fAtStart, f_b: fAtEnd, rate },
      solutionSteps: [
        {
          description: `Evaluate f(${intervalStart})`,
          expression: `f(${intervalStart}) = ${rightHandSide.replace(/x/g, `(${intervalStart})`)} = ${fAtStart}`,
          value: fAtStart,
        },
        {
          description: `Evaluate f(${intervalEnd})`,
          expression: `f(${intervalEnd}) = ${rightHandSide.replace(/x/g, `(${intervalEnd})`)} = ${fAtEnd}`,
          value: fAtEnd,
        },
        {
          description: "Compute average rate of change",
          expression: `(${fAtEnd} - (${fAtStart})) / (${intervalEnd} - (${intervalStart})) = ${rate}`,
          value: rate,
        },
      ],
      gradingMetadata,
    };
  },
};

const quadraticProfitModelGenerator: MathGenerator = {
  key: "quadratic-profit-model",
  nodeIds: [
    "math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context",
    "math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model",
  ],
  description: "Generates ski-pass profit models from price and sales changes.",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const priceIncrease = rand() < 0.5 ? 5 : 10;
    const salesDecrease = [10, 20, 30][Math.floor(rand() * 3)];
    const priceFactor = Math.floor(rand() * 7) + 22;
    const optimalIncreases = Math.floor(rand() * 5) + 2;

    const basePrice = priceIncrease * priceFactor;
    const baseSales = salesDecrease * (priceFactor + 2 * optimalIncreases);
    const coefficientA = -priceIncrease * salesDecrease;
    const coefficientB = priceIncrease * baseSales - basePrice * salesDecrease;
    const coefficientC = basePrice * baseSales;
    const priceExpression = `${basePrice} + ${priceIncrease}x`;
    const salesExpression = `${baseSales} - ${salesDecrease}x`;
    const profitExpression = `${coefficientA}x² + ${coefficientB}x + ${coefficientC}`;

    if (
      input.nodeId ===
      "math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model"
    ) {
      const optimalPrice = basePrice + priceIncrease * optimalIncreases;
      const maximumProfit =
        coefficientA * optimalIncreases ** 2 + coefficientB * optimalIncreases + coefficientC;
      const maximumAnswers = {
        optimalIncreases: String(optimalIncreases),
        optimalPrice: String(optimalPrice),
        maximumProfit: String(maximumProfit),
      };
      const rendererProps = {
        template: `A ski resort sells ${baseSales} passes at a base price of $${basePrice}. Each price increase is $${priceIncrease}, and ${salesDecrease} fewer passes are sold for each increase. Let x be the number of price increases. Given P(x) = ${coefficientA}x^2 + ${coefficientB}x + ${coefficientC}, enter the maximizing x value: {{blank:optimalIncreases}}. Enter the price per pass in dollars: {{blank:optimalPrice}}. Enter the maximum profit in dollars: {{blank:maximumProfit}}.`,
        blanks: [
          { id: "optimalIncreases", correctAnswer: maximumAnswers.optimalIncreases, isMath: true },
          { id: "optimalPrice", correctAnswer: maximumAnswers.optimalPrice, isMath: true },
          { id: "maximumProfit", correctAnswer: maximumAnswers.maximumProfit, isMath: true },
        ],
      };

      return {
        prompt: `A ski resort sells ${baseSales} passes at a base price of $${basePrice}. Each price increase is $${priceIncrease}, and ${salesDecrease} fewer passes are sold for each increase. Given P(x) = ${coefficientA}x^2 + ${coefficientB}x + ${coefficientC}, find the number of price increases that maximizes profit, the price per pass, and the maximum profit.`,
        data: {
          priceIncrease,
          salesDecrease,
          priceFactor,
          optimalIncreases,
          optimalPrice,
          maximumProfit,
          basePrice,
          baseSales,
          coefficients: { a: coefficientA, b: coefficientB, c: coefficientC },
          priceExpression,
          salesExpression,
          profitExpression,
          rendererProps,
        },
        expectedAnswer: maximumAnswers,
        solutionSteps: [
          {
            description: "Find the axis of symmetry.",
            expression: `x = -b/(2a) = -${coefficientB}/(2(${coefficientA})) = ${optimalIncreases}`,
            value: optimalIncreases,
          },
          {
            description: "Interpret the maximizing input as the price per pass.",
            expression: `${basePrice} + ${priceIncrease}(${optimalIncreases}) = ${optimalPrice} dollars per pass`,
            value: optimalPrice,
          },
          {
            description: "Evaluate P(x) at the maximum.",
            expression: `P(${optimalIncreases}) = ${coefficientA}(${optimalIncreases})^2 + ${coefficientB}(${optimalIncreases}) + ${coefficientC} = ${maximumProfit} dollars`,
            value: maximumProfit,
          },
        ],
        gradingMetadata: {
          partAnswers: maximumAnswers,
          partMaxScores: {
            optimalIncreases: 1,
            optimalPrice: 1,
            maximumProfit: 1,
          },
          partGradingRules: {
            optimalIncreases: "exact_match",
            optimalPrice: "exact_match",
            maximumProfit: "exact_match",
          },
        },
      };
    }

    const answers = {
      priceBase: String(basePrice),
      priceStep: String(priceIncrease),
      salesBase: String(baseSales),
      salesLoss: String(salesDecrease),
      coefficientA: String(coefficientA),
      coefficientB: String(coefficientB),
      coefficientC: String(coefficientC),
    };
    const rendererProps = {
      template: `A ski resort sells ${baseSales} passes at a base price of $${basePrice}. Each price increase is $${priceIncrease}, and ${salesDecrease} fewer passes are sold for each increase. Let x be the number of price increases. Write p(x) = {{blank:priceBase}} + {{blank:priceStep}}x; write s(x) = {{blank:salesBase}} - {{blank:salesLoss}}x; then expand P(x) = p(x)s(x) = {{blank:coefficientA}}x^2 + {{blank:coefficientB}}x + {{blank:coefficientC}}.`,
      blanks: [
        { id: "priceBase", correctAnswer: answers.priceBase, isMath: true },
        { id: "priceStep", correctAnswer: answers.priceStep, isMath: true },
        { id: "salesBase", correctAnswer: answers.salesBase, isMath: true },
        { id: "salesLoss", correctAnswer: answers.salesLoss, isMath: true },
        { id: "coefficientA", correctAnswer: answers.coefficientA, isMath: true },
        { id: "coefficientB", correctAnswer: answers.coefficientB, isMath: true },
        { id: "coefficientC", correctAnswer: answers.coefficientC, isMath: true },
      ],
    };

    const gradingMetadata: GradingMetadata = {
      partAnswers: answers,
      partMaxScores: {
        priceBase: 1,
        priceStep: 1,
        salesBase: 1,
        salesLoss: 1,
        coefficientA: 1,
        coefficientB: 1,
        coefficientC: 1,
      },
      partGradingRules: {
        priceBase: "exact_match",
        priceStep: "exact_match",
        salesBase: "exact_match",
        salesLoss: "exact_match",
        coefficientA: "exact_match",
        coefficientB: "exact_match",
        coefficientC: "exact_match",
      },
    };

    return {
      prompt: `A ski resort sells ${baseSales} passes at a base price of $${basePrice}. Each price increase is $${priceIncrease}, and ${salesDecrease} fewer passes are sold for each increase. Let x be the number of price increases. Write the price expression p(x), the sales expression s(x), and expand the profit model P(x) = p(x)s(x) into standard form.`,
      data: {
        priceIncrease,
        salesDecrease,
        priceFactor,
        optimalIncreases,
        basePrice,
        baseSales,
        coefficients: { a: coefficientA, b: coefficientB, c: coefficientC },
        priceExpression,
        salesExpression,
        profitExpression,
        rendererProps,
      },
      expectedAnswer: answers,
      solutionSteps: [
        {
          description: "Write the price expression.",
          expression: `p(x) = ${priceExpression}`,
          value: priceExpression,
        },
        {
          description: "Write the sales expression.",
          expression: `s(x) = ${salesExpression}`,
          value: salesExpression,
        },
        {
          description: "Form the profit model as a product.",
          expression: `P(x) = (${priceExpression})(${salesExpression})`,
          value: `(${priceExpression})(${salesExpression})`,
        },
        {
          description: "Expand the product.",
          expression: `P(x) = ${basePrice}(${baseSales}) - ${basePrice}(${salesDecrease}x) + ${priceIncrease}x(${baseSales}) - ${priceIncrease}x(${salesDecrease}x)`,
        },
        {
          description: "Collect like terms.",
          expression: `P(x) = ${profitExpression}`,
          value: profitExpression,
        },
        {
          description: "State the standard-form coefficients.",
          expression: `a = ${coefficientA}, b = ${coefficientB}, c = ${coefficientC}`,
          value: { a: coefficientA, b: coefficientB, c: coefficientC },
        },
      ],
      gradingMetadata,
    };
  },
};

const topic11IntervalGraphGenerator: MathGenerator = {
  key: "topic11-interval-graph",
  nodeIds: [TOPIC11_INTERVAL_GRAPH_NODE_ID],
  description: "Generates interval-classification graph variants for AP Precalculus Topic 1.1.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic11IntervalGraphOutput(input.seed),
};

const topic11PhysicalContextGraphChoiceGenerator: MathGenerator = {
  key: "topic11-physical-context-graph-choice",
  nodeIds: [TOPIC11_PHYSICAL_CONTEXT_GRAPH_CHOICE_NODE_ID],
  description: "Generates physical-context graph-choice variants for AP Precalculus Topic 1.1.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic11PhysicalContextGraphChoiceOutput(input.seed),
};

const topic12TableAverageRateChoiceGenerator: MathGenerator = {
  key: "topic12-table-average-rate-choice",
  nodeIds: [TOPIC12_TABLE_AVERAGE_RATE_CHOICE_NODE_ID],
  description: "Generates table-based average-rate choices for AP Precalculus Topic 1.2.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic12TableAverageRateChoiceOutput(input.seed),
};

const topic12GraphAverageRateChoiceGenerator: MathGenerator = {
  key: "topic12-graph-average-rate-choice",
  nodeIds: [TOPIC12_GRAPH_AVERAGE_RATE_CHOICE_NODE_ID],
  description: "Generates graph-based average-rate choices for AP Precalculus Topic 1.2.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic12GraphAverageRateChoiceOutput(input.seed),
};

const topic12PointwiseLeastRateChoiceGenerator: MathGenerator = {
  key: "topic12-pointwise-least-rate-choice",
  nodeIds: [TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID],
  description: "Generates labeled-point least-rate choices for AP Precalculus Topic 1.2.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic12PointwiseLeastRateChoiceOutput(input.seed),
};

const topic12PointwiseRateOrderingGenerator: MathGenerator = {
  key: "topic12-pointwise-rate-ordering",
  nodeIds: [TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID],
  description: "Generates pointwise rate orderings for AP Precalculus Topic 1.2.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic12PointwiseRateOrderingOutput(input.seed),
};

const topic12NegativeRateContextChoiceGenerator: MathGenerator = {
  key: "topic12-negative-rate-context-choice",
  nodeIds: [TOPIC12_NEGATIVE_RATE_CONTEXT_CHOICE_NODE_ID],
  description: "Generates negative-rate context choices for AP Precalculus Topic 1.2.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic12NegativeRateContextChoiceOutput(input.seed),
};

const topic12QuadraticNegativeRateIntervalChoiceGenerator: MathGenerator = {
  key: "topic12-quadratic-negative-rate-interval-choice",
  nodeIds: [TOPIC12_QUADRATIC_NEGATIVE_RATE_INTERVAL_CHOICE_NODE_ID],
  description: "Generates quadratic negative-rate interval choices for AP Precalculus Topic 1.2.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic12QuadraticNegativeRateIntervalChoiceOutput(input.seed),
};

const topic13RatePatternClassificationGenerator: MathGenerator = {
  key: "topic13-rate-pattern-classification",
  nodeIds: [TOPIC13_RATE_PATTERN_CLASSIFICATION_NODE_ID],
  description: "Generates rate-pattern classification cases for AP Precalculus Topic 1.3.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic13RatePatternClassificationOutput(input.seed),
};

const topic13ConcavityFromRateChangeGenerator: MathGenerator = {
  key: "topic13-concavity-from-rate-change",
  nodeIds: [TOPIC13_CONCAVITY_FROM_RATE_CHANGE_NODE_ID],
  description: "Generates concavity from rate-of-change tables for AP Precalculus Topic 1.3.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic13ConcavityFromRateChangeOutput(input.seed),
};

const topic14PolynomialDegreeLeadingCoefficientGenerator: MathGenerator = {
  key: "topic14-polynomial-degree-leading-coefficient",
  nodeIds: [TOPIC14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID],
  description:
    "Generates polynomial degree and leading-coefficient problems for AP Precalculus Topic 1.4.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic14PolynomialDegreeLeadingCoefficientOutput(input.seed),
};

const topic14PolynomialExtremaFromGraphGenerator: MathGenerator = {
  key: "topic14-polynomial-extrema-from-graph",
  nodeIds: [TOPIC14_POLYNOMIAL_EXTREMA_FROM_GRAPH_NODE_ID],
  description: "Generates polynomial extrema from graph problems for AP Precalculus Topic 1.4.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic14PolynomialExtremaFromGraphOutput(input.seed),
};

const topic14RateSignAndTrendGenerator: MathGenerator = {
  key: "topic14-rate-sign-and-trend",
  nodeIds: [TOPIC14_RATE_SIGN_AND_TREND_NODE_ID],
  description: "Generates rate sign and trend graph problems for AP Precalculus Topic 1.4.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic14RateSignAndTrendOutput(input.seed),
};

const topic14PolynomialEndBehaviorGenerator: MathGenerator = {
  key: "topic14-polynomial-end-behavior",
  nodeIds: [TOPIC14_POLYNOMIAL_END_BEHAVIOR_NODE_ID],
  description: "Generates polynomial end-behavior problems for AP Precalculus Topic 1.4.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic14PolynomialEndBehaviorOutput(input.seed),
};

const topic15RealZerosAndMultiplicitiesGenerator: MathGenerator = {
  key: "topic15-real-zeros-and-multiplicities-from-factored-form",
  nodeIds: [TOPIC15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID],
  description: "Generates real-zero and multiplicity problems for AP Precalculus Topic 1.5.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic15RealZerosAndMultiplicitiesOutput(input.seed),
};

const topic15LeastPolynomialDegreeGenerator: MathGenerator = {
  key: "topic15-least-polynomial-degree-from-zeros-and-conjugate-pairs",
  nodeIds: [TOPIC15_LEAST_POLYNOMIAL_DEGREE_NODE_ID],
  description: "Generates least polynomial degree problems for AP Precalculus Topic 1.5.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic15LeastPolynomialDegreeOutput(input.seed),
};

const topic15PolynomialInequalitySignChartGenerator: MathGenerator = {
  key: "topic15-polynomial-inequality-sign-chart",
  nodeIds: [TOPIC15_POLYNOMIAL_INEQUALITY_SIGN_CHART_NODE_ID],
  description: "Generates polynomial inequality sign-chart problems for AP Precalculus Topic 1.5.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic15PolynomialInequalityOutput(input.seed),
};

const topic16EquationEndBehaviorGenerator: MathGenerator = {
  key: "topic16-equation-end-behavior",
  nodeIds: [TOPIC16_EQUATION_END_BEHAVIOR_NODE_ID],
  description: "Generates polynomial equation end-behavior problems for AP Precalculus Topic 1.6.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic16EquationEndBehaviorOutput(input.seed),
};

const topic16LimitNotationEndBehaviorGenerator: MathGenerator = {
  key: "topic16-limit-notation-end-behavior",
  nodeIds: [TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID],
  description:
    "Generates polynomial end-behavior limit-notation problems for AP Precalculus Topic 1.6.",
  generate: (input: GeneratorInput): GeneratorOutput =>
    generateTopic16LimitNotationEndBehaviorOutput(input.seed),
};

const solveQuadraticByGraphingGenerator: MathGenerator = {
  key: "solve-quadratic-by-graphing",
  nodeIds: ["math.im3.skill.1.2.solve-quadratic-equations-by-graphing"],
  description: "Generates quadratic equations solvable by graphing. Students find x-intercepts.",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const r1 = Math.round((rand() * 6 - 3) * 10) / 10; // first root ∈ [-3, 3]
    const r2 = Math.round((rand() * 6 - 3) * 10) / 10; // second root

    const leadingA = 1;
    const bCoeff = Math.round(-(r1 + r2) * 100) / 100;
    const cConst = Math.round(r1 * r2 * 100) / 100;

    const prompt = `Solve x² ${bCoeff >= 0 ? "+" : ""}${bCoeff}x ${cConst >= 0 ? "+" : ""}${cConst} = 0 by finding the x-intercepts of the graph.`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { solution_1: r1, solution_2: r2 },
      partMaxScores: { solution_1: 3, solution_2: 3 },
      partGradingRules: { solution_1: "numeric_tolerance", solution_2: "numeric_tolerance" },
      partTolerances: { solution_1: 0.01, solution_2: 0.01 },
    };

    return {
      prompt,
      data: { a: leadingA, b: bCoeff, c: cConst, roots: [r1, r2] },
      expectedAnswer: { solution_1: r1, solution_2: r2 },
      solutionSteps: [
        {
          description: "Identify the quadratic function",
          expression: `f(x) = x² ${bCoeff >= 0 ? "+" : ""}${bCoeff}x ${cConst >= 0 ? "+" : ""}${cConst}`,
          value: { a: leadingA, b: bCoeff, c: cConst },
        },
        {
          description: "Factor the quadratic",
          expression: `f(x) = (x ${r1 >= 0 ? "-" : "+"} ${Math.abs(r1)})(x ${r2 >= 0 ? "-" : "+"} ${Math.abs(r2)})`,
          value: [r1, r2],
        },
        {
          description: "Set each factor to zero",
          expression: `x = ${r1} or x = ${r2}`,
          value: { solution_1: r1, solution_2: r2 },
        },
      ],
      gradingMetadata,
    };
  },
};

const oneRealSolutionGraphingGenerator: MathGenerator = {
  key: "one-real-solution-graphing",
  nodeIds: [ONE_REAL_SOLUTION_NODE_ID],
  description: "Generates atomic one-real-solution quadratic graphing problems.",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const root = input.seed === 0 ? -1 : -4 + Math.floor(rand() * 9);
    const scale = input.seed === 0 ? 1 : 1 + Math.floor(rand() * 3);
    const a = scale;
    const b = root === 0 ? 0 : -2 * scale * root;
    const c = scale * root ** 2;
    const quadraticTerm = a === 1 ? "x^2" : `${a}x^2`;
    const linearTerm =
      b === 0
        ? ""
        : b > 0
          ? ` + ${b === 1 ? "x" : `${b}x`}`
          : ` - ${Math.abs(b) === 1 ? "x" : `${Math.abs(b)}x`}`;
    const constantTerm = c === 0 ? "" : ` + ${c}`;
    const equation = `f(x) = ${quadraticTerm}${linearTerm}${constantTerm}`;
    const originalQuadraticTerm = a === 1 ? "x^2" : `${a}x^2`;
    const originalLinearTerm = b === 0 ? "" : b === 1 ? "x" : b === -1 ? "-x" : `${b}x`;
    const originalEquation =
      b === 0
        ? `7 - ${originalQuadraticTerm} = ${7 + c}`
        : `7 - ${originalQuadraticTerm} = ${originalLinearTerm} + ${7 + c}`;
    const xValues = [root - 2, root - 1, root, root + 1, root + 2];
    const tableValues = xValues.map((x) => ({
      x,
      y: a * (x - root) ** 2,
    }));
    const rendererProps = {
      equation,
      variant: "plot_from_equation" as const,
      responseVariant: "one_real_solution" as const,
      originalEquation,
      domain: [root - 3, root + 3] as [number, number],
      range: [-1, Math.max(10, 4 * scale + 2)] as [number, number],
    };
    const expectedAnswer = {
      table_values: tableValues,
      placed_points: tableValues,
      solution: root,
    };
    const gradingMetadata: GradingMetadata = {
      partAnswers: expectedAnswer,
      partMaxScores: {
        table_values: 1,
        placed_points: 1,
        solution: 1,
      },
      partGradingRules: {
        table_values: "custom",
        placed_points: "custom",
        solution: "numeric_tolerance",
      },
      partTolerances: { solution: 0.01 },
    };

    return {
      prompt: `Graph the related function ${equation}, complete the five-value table, plot the five points, and state the solution to ${originalEquation}.`,
      data: {
        root,
        scale,
        a,
        b,
        c,
        difficulty: input.difficulty,
        tableValues,
        rendererProps,
      },
      expectedAnswer,
      solutionSteps: [
        {
          description: "Rewrite the original equation as a quadratic function",
          expression: `0 = ${quadraticTerm}${linearTerm}${constantTerm}`,
        },
        {
          description: "Identify the axis of symmetry and repeated root",
          expression: `x = ${root}`,
        },
        {
          description: "Complete the table and graph the five points",
          expression: tableValues.map(({ x, y }) => `(${x}, ${y})`).join(", "),
        },
        { description: "State the solution", expression: `x = ${root}`, value: root },
      ],
      gradingMetadata,
    };
  },
};

const twoRealSolutionsGraphingGenerator: MathGenerator = {
  key: "two-real-solutions-graphing",
  nodeIds: [TWO_REAL_SOLUTIONS_NODE_ID],
  description: "Generates atomic two-real-solutions quadratic graphing problems.",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const axis = input.seed === 0 ? 12 : 8 + Math.floor(rand() * 9);
    const distance = input.seed === 0 ? 1 : 1 + Math.floor(rand() * 2);
    const roots = [axis - distance, axis + distance];
    const sum = 2 * axis;
    const product = axis ** 2 - distance ** 2;
    const a = 1;
    const b = -sum;
    const c = product;
    const xValues = [axis - 2, axis - 1, axis, axis + 1, axis + 2];
    const tableValues = xValues.map((x) => ({
      x,
      y: x ** 2 - sum * x + product,
    }));
    const points = tableValues.map(({ x, y }) => [x, y] as [number, number]);
    const domain: [number, number] = [axis - 4, axis + 4];
    const minimumTableY = Math.min(...tableValues.map(({ y }) => y));
    const maximumTableY = Math.max(...tableValues.map(({ y }) => y));
    const range: [number, number] = [minimumTableY - 1, maximumTableY + 5];
    const equation = `f(x) = x^2 - ${sum}x + ${product}`;
    const originalEquation = `x(${sum} - x) = ${product}`;
    const rendererProps = {
      equation,
      variant: "plot_from_equation" as const,
      responseVariant: "two_real_solutions" as const,
      originalEquation,
      points,
      domain,
      range,
      sum,
      product,
    };
    const expectedAnswer = {
      table_values: tableValues,
      placed_points: tableValues,
      solutions: roots,
    };
    const gradingMetadata: GradingMetadata = {
      partAnswers: expectedAnswer,
      partMaxScores: {
        table_values: 1,
        placed_points: 1,
        solutions: 1,
      },
      partGradingRules: {
        table_values: "custom",
        placed_points: "custom",
        solutions: "custom",
      },
    };

    return {
      prompt: `Find two real numbers with a sum of ${sum} and a product of ${product} by graphing.`,
      data: {
        axis,
        distance,
        sum,
        product,
        roots,
        a,
        b,
        c,
        difficulty: input.difficulty,
        tableValues,
        rendererProps,
      },
      expectedAnswer,
      solutionSteps: [
        {
          description: "Represent the two numbers with x and sum - x",
          expression: originalEquation,
        },
        {
          description: "Rewrite the equation in standard form",
          expression: `0 = x^2 - ${sum}x + ${product}`,
        },
        { description: "Find the axis of symmetry", expression: `x = ${axis}` },
        {
          description: "Make the five-point table and graph",
          expression: tableValues.map(({ x, y }) => `(${x}, ${y})`).join(", "),
        },
        {
          description: "Identify the zeros and contextual numbers",
          expression: `x = ${roots[0]} or x = ${roots[1]}; the two numbers are ${roots[0]} and ${roots[1]}`,
        },
      ],
      gradingMetadata,
    };
  },
};

const estimateRootsByGraphingGenerator: MathGenerator = {
  key: "estimate-roots-by-graphing",
  nodeIds: ["math.im3.skill.1.2.estimate-roots-by-graphing"],
  description: "Generates atomic quadratic root-interval estimation problems.",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const axisFloor = input.seed === 0 ? 1 : -3 + Math.floor(rand() * 7);
    const verticalShift = input.seed === 0 ? 9 : 7 + Math.floor(rand() * 3);
    const a = -1;
    const b = 2 * axisFloor + 1;
    const c = verticalShift - axisFloor * (axisFloor + 1);
    const quadraticTerm = "-x^2";
    const linearTerm =
      b === 1 ? " + x" : b === -1 ? " - x" : b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
    const constantTerm = c === 0 ? "" : c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
    const equationBody = `${quadraticTerm}${linearTerm}${constantTerm}`;
    const equation = `f(x) = ${equationBody}`;
    const originalEquation = `${equationBody} = 0`;
    const axis = axisFloor + 0.5;
    const xValues = Array.from({ length: 8 }, (_, index) => axisFloor - 3 + index);
    const tableValues = xValues.map((x) => ({
      x,
      y: a * x ** 2 + b * x + c,
    }));
    const points = tableValues.map(({ x, y }) => [x, y] as [number, number]);
    const rootIntervals = [
      [axisFloor - 3, axisFloor - 2],
      [axisFloor + 3, axisFloor + 4],
    ] as [[number, number], [number, number]];
    const rendererProps = {
      equation,
      variant: "plot_from_equation" as const,
      responseVariant: "estimated_root_intervals" as const,
      originalEquation,
      points,
    };
    const expectedAnswer = {
      table_values: tableValues,
      placed_points: tableValues,
      root_intervals: rootIntervals,
    };
    const prompt =
      input.seed === 0
        ? "Solve -x^2 + 3x + 7 = 0 by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located."
        : `Solve ${originalEquation} by graphing. State the consecutive integers between which the roots are located.`;
    const gradingMetadata: GradingMetadata = {
      partAnswers: expectedAnswer,
      partMaxScores: {
        table_values: 1,
        placed_points: 1,
        root_intervals: 1,
      },
      partGradingRules: {
        table_values: "custom",
        placed_points: "custom",
        root_intervals: "custom",
      },
    };

    return {
      prompt,
      data: {
        axisFloor,
        verticalShift,
        a,
        b,
        c,
        axis,
        difficulty: input.difficulty,
        tableValues,
        points,
        rootIntervals,
        rendererProps,
      },
      expectedAnswer,
      solutionSteps: [
        { description: "Rewrite the equation as the related function", expression: equation },
        { description: "Find the axis of symmetry", expression: `x = ${axis}` },
        {
          description: "Complete the table of values",
          expression: tableValues.map(({ x, y }) => `(${x}, ${y})`).join(", "),
        },
        {
          description: "Plot the points and connect the curve",
          expression: points.map(([x, y]) => `(${x}, ${y})`).join(", "),
        },
        {
          description: "State the consecutive-integer root intervals",
          expression: `x is between ${rootIntervals[0][0]} and ${rootIntervals[0][1]}, and x is between ${rootIntervals[1][0]} and ${rootIntervals[1][1]}`,
        },
      ],
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// Stub generators (pilot scaffolding)
// ---------------------------------------------------------------------------

const algebraicStepSolverGenerator: MathGenerator = {
  key: "algebraic-step-solver",
  nodeIds: [
    // Factoring (1.4) and quadratic formula (1.6) are now provided by the
    // real quadratic-factoring / quadratic-formula generators. Keep the
    // imaginary-unit / complex-ops / completing-the-square slots here.
    "math.im3.skill.1.3.understand-and-use-the-imaginary-unit-i",
    "math.im3.skill.1.3.perform-operations-with-complex-numbers",
    "math.im3.skill.1.5.solve-quadratic-equations-by-completing-the-square",
  ],
  description: "Algebraic step-by-step solver (pilot stub — returns deterministic scaffolding)",
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const stepCount = Math.max(3, Math.floor(rand() * 5 + 3));
    const steps = Array.from({ length: stepCount }, (_, i) => ({
      description: `Step ${i + 1}`,
      expression: `Expression for step ${i + 1}`,
    }));

    return {
      prompt: `Solve the algebraic problem (variant ${input.seed})`,
      data: { seed: input.seed, difficulty: input.difficulty },
      expectedAnswer: { result: `variant-${input.seed}` },
      solutionSteps: steps,
      gradingMetadata: {
        partAnswers: { result: `variant-${input.seed}` },
        partMaxScores: { result: 5 },
        partGradingRules: { result: "exact_match" },
      },
    };
  },
};

const graphingExplorerStubGenerator: MathGenerator = {
  key: "graphing-explorer",
  nodeIds: [
    "math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables",
    "math.im3.skill.1.8.solve-systems-involving-a-linear-and-a-quadratic-equation",
  ],
  description: "Graphing explorer (pilot stub)",
  generate: (input: GeneratorInput): GeneratorOutput => ({
    prompt: `Graph the function (variant ${input.seed})`,
    data: { seed: input.seed, difficulty: input.difficulty },
    expectedAnswer: { graph_result: `variant-${input.seed}` },
    solutionSteps: [{ description: "Identify the function type", expression: "See curriculum" }],
    gradingMetadata: {
      partAnswers: { graph_result: `variant-${input.seed}` },
      partMaxScores: { graph_result: 5 },
      partGradingRules: { graph_result: "exact_match" },
    },
  }),
};

const statisticsStubGenerator: MathGenerator = {
  key: "statistics",
  nodeIds: [],
  description: "Statistics generator (pilot stub)",
  generate: (input: GeneratorInput): GeneratorOutput => ({
    prompt: `Statistics problem (variant ${input.seed})`,
    data: { seed: input.seed, difficulty: input.difficulty },
    expectedAnswer: { result: `variant-${input.seed}` },
    solutionSteps: [{ description: "Analyze the data", expression: "See curriculum" }],
    gradingMetadata: {
      partAnswers: { result: `variant-${input.seed}` },
      partMaxScores: { result: 5 },
      partGradingRules: { result: "exact_match" },
    },
  }),
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const GENERATOR_REGISTRY: Record<string, MathGenerator> = {
  [im1VerbalToNumericalGenerator.key]: im1VerbalToNumericalGenerator,
  [quadraticGraphAnalysisGenerator.key]: quadraticGraphAnalysisGenerator,
  [averageRateOfChangeGenerator.key]: averageRateOfChangeGenerator,
  [quadraticProfitModelGenerator.key]: quadraticProfitModelGenerator,
  [topic11IntervalGraphGenerator.key]: topic11IntervalGraphGenerator,
  [topic11PhysicalContextGraphChoiceGenerator.key]: topic11PhysicalContextGraphChoiceGenerator,
  [topic12TableAverageRateChoiceGenerator.key]: topic12TableAverageRateChoiceGenerator,
  [topic12GraphAverageRateChoiceGenerator.key]: topic12GraphAverageRateChoiceGenerator,
  [topic12PointwiseLeastRateChoiceGenerator.key]: topic12PointwiseLeastRateChoiceGenerator,
  [topic12PointwiseRateOrderingGenerator.key]: topic12PointwiseRateOrderingGenerator,
  [topic12NegativeRateContextChoiceGenerator.key]: topic12NegativeRateContextChoiceGenerator,
  [topic12QuadraticNegativeRateIntervalChoiceGenerator.key]:
    topic12QuadraticNegativeRateIntervalChoiceGenerator,
  [topic13RatePatternClassificationGenerator.key]: topic13RatePatternClassificationGenerator,
  [topic13ConcavityFromRateChangeGenerator.key]: topic13ConcavityFromRateChangeGenerator,
  [topic14PolynomialDegreeLeadingCoefficientGenerator.key]:
    topic14PolynomialDegreeLeadingCoefficientGenerator,
  [topic14PolynomialExtremaFromGraphGenerator.key]: topic14PolynomialExtremaFromGraphGenerator,
  [topic14RateSignAndTrendGenerator.key]: topic14RateSignAndTrendGenerator,
  [topic14PolynomialEndBehaviorGenerator.key]: topic14PolynomialEndBehaviorGenerator,
  [topic15RealZerosAndMultiplicitiesGenerator.key]: topic15RealZerosAndMultiplicitiesGenerator,
  [topic15LeastPolynomialDegreeGenerator.key]: topic15LeastPolynomialDegreeGenerator,
  [topic15PolynomialInequalitySignChartGenerator.key]:
    topic15PolynomialInequalitySignChartGenerator,
  [topic16EquationEndBehaviorGenerator.key]: topic16EquationEndBehaviorGenerator,
  [topic16LimitNotationEndBehaviorGenerator.key]: topic16LimitNotationEndBehaviorGenerator,
  [solveQuadraticByGraphingGenerator.key]: solveQuadraticByGraphingGenerator,
  [oneRealSolutionGraphingGenerator.key]: oneRealSolutionGraphingGenerator,
  [twoRealSolutionsGraphingGenerator.key]: twoRealSolutionsGraphingGenerator,
  [estimateRootsByGraphingGenerator.key]: estimateRootsByGraphingGenerator,
  [algebraicStepSolverGenerator.key]: algebraicStepSolverGenerator,
  [graphingExplorerStubGenerator.key]: graphingExplorerStubGenerator,
  [statisticsStubGenerator.key]: statisticsStubGenerator,
  [polynomialOperationsAdapter.key]: polynomialOperationsAdapter,
  [polynomialDivisionAdapter.key]: polynomialDivisionAdapter,
  [rationalAnalyzerAdapter.key]: rationalAnalyzerAdapter,
  [expLogSolverAdapter.key]: expLogSolverAdapter,
  [linearEquationAdapter.key]: linearEquationAdapter,
  [systemOfEquationsAdapter.key]: systemOfEquationsAdapter,
  [quadraticFactoringAdapter.key]: quadraticFactoringAdapter,
  [quadraticFormulaAdapter.key]: quadraticFormulaAdapter,
};

export const GENERATOR_KEYS = Object.keys(GENERATOR_REGISTRY) as string[];

/**
 * Look up a math generator by its key.
 * @param {string} key - Generator key string
 * @returns {MathGenerator} - The matching MathGenerator
 * @throws Error if the key is not registered
 */
export function getGenerator(key: string): MathGenerator {
  const generator = GENERATOR_REGISTRY[key];
  if (!generator) {
    throw new Error(`Unknown generator key: "${key}"`);
  }
  return generator;
}
