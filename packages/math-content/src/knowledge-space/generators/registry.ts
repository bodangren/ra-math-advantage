// Math generator registry
//
// Maps generatorKey → deterministic generator implementation.
// Generators conform to the knowledge-space-practice DeterministicGenerator contract.
// Pilot generators produce deterministic output for Module 1 skills.

import type { GeneratorInput, GeneratorOutput, GradingMetadata } from '@math-platform/knowledge-space-practice';

export interface MathGenerator {
  key: string;
  nodeIds: string[];
  description?: string;
  generate: (input: GeneratorInput) => GeneratorOutput;
}

// ---------------------------------------------------------------------------
// Deterministic generators for Module 1 pilot
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const quadraticGraphAnalysisGenerator: MathGenerator = {
  key: 'quadratic-graph-analysis',
  nodeIds: ['math.im3.skill.1.1.graph-quadratic-functions'],
  description: 'Generates quadratic function graph analysis problems. Students identify vertex, intercepts, and direction.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const a = Math.round((rand() * 2 + 1) * 10) / 10; // a ∈ [1, 3]
    const b = Math.round((rand() * 8 - 4) * 10) / 10; // b ∈ [-4, 4]
    const c = Math.round((rand() * 12 - 6) * 10) / 10; // c ∈ [-6, 6]
    const difficulty = input.difficulty ?? 0.5;

    const vertexX = Math.round((-b / (2 * a)) * 100) / 100;
    const vertexY = Math.round((a * vertexX * vertexX + b * vertexX + c) * 100) / 100;
    const direction = a > 0 ? 'upward' : 'downward';

    const prompt = difficulty < 0.4
      ? `Graph the quadratic function f(x) = ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} and identify its key features.`
      : `Graph f(x) = ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}, find the vertex, axis of symmetry, intercepts, and determine if it opens up or down.`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { vertex_x: vertexX, vertex_y: vertexY, direction, y_intercept: c },
      partMaxScores: { vertex_x: 2, vertex_y: 2, direction: 1, y_intercept: 1 },
      partGradingRules: { vertex_x: 'numeric_tolerance', vertex_y: 'numeric_tolerance', direction: 'exact_match', y_intercept: 'numeric_tolerance' },
      partTolerances: { vertex_x: 0.01, vertex_y: 0.01, y_intercept: 0.01 },
    };

    return {
      prompt,
      data: { a, b, c, difficulty },
      expectedAnswer: { vertex_x: vertexX, vertex_y: vertexY, direction, y_intercept: c },
      solutionSteps: [
        { description: 'Identify coefficients', expression: `a = ${a}, b = ${b}, c = ${c}`, value: { a, b, c } },
        { description: 'Calculate vertex x-coordinate', expression: `h = -b/(2a) = ${vertexX}`, value: vertexX },
        { description: 'Calculate vertex y-coordinate', expression: `k = f(${vertexX}) = ${vertexY}`, value: vertexY },
        { description: 'Determine direction', expression: `a = ${a} ${a > 0 ? '> 0 (opens upward)' : '< 0 (opens downward)'}`, value: direction },
        { description: 'Find y-intercept', expression: `f(0) = ${c}`, value: c },
      ],
      gradingMetadata,
    };
  },
};

const averageRateOfChangeGenerator: MathGenerator = {
  key: 'average-rate-of-change',
  nodeIds: ['math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change'],
  description: 'Generates average rate of change problems. Students compute (f(b)-f(a))/(b-a).',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const a = Math.round((rand() * 2 + 1) * 10) / 10; // coefficient a ∈ [1, 3]
    const bCoeff = Math.round((rand() * 6 - 3) * 10) / 10; // b ∈ [-3, 3]
    const c = Math.round((rand() * 10 - 5) * 10) / 10; // c ∈ [-5, 5]
    const intervalStart = Math.round(rand() * 3); // ∈ [0, 3]
    const intervalEnd = intervalStart + Math.round(rand() * 4 + 4); // ∈ [4, 8]

    const fAtStart = Math.round((a * intervalStart * intervalStart + bCoeff * intervalStart + c) * 100) / 100;
    const fAtEnd = Math.round((a * intervalEnd * intervalEnd + bCoeff * intervalEnd + c) * 100) / 100;
    const rate = Math.round(((fAtEnd - fAtStart) / (intervalEnd - intervalStart)) * 100) / 100;

    const prompt = `Find the average rate of change of f(x) = ${a}x² ${bCoeff >= 0 ? '+' : ''}${bCoeff}x ${c >= 0 ? '+' : ''}${c} on the interval [${intervalStart}, ${intervalEnd}].`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { f_a: fAtStart, f_b: fAtEnd, rate },
      partMaxScores: { f_a: 2, f_b: 2, rate: 3 },
      partGradingRules: { f_a: 'numeric_tolerance', f_b: 'numeric_tolerance', rate: 'numeric_tolerance' },
      partTolerances: { f_a: 0.01, f_b: 0.01, rate: 0.01 },
    };

    return {
      prompt,
      data: { a, b: bCoeff, c, intervalStart, intervalEnd },
      expectedAnswer: { f_a: fAtStart, f_b: fAtEnd, rate },
      solutionSteps: [
        { description: `Evaluate f(${intervalStart})`, expression: `f(${intervalStart}) = ${a}(${intervalStart})² + ${bCoeff}(${intervalStart}) + ${c} = ${fAtStart}`, value: fAtStart },
        { description: `Evaluate f(${intervalEnd})`, expression: `f(${intervalEnd}) = ${a}(${intervalEnd})² + ${bCoeff}(${intervalEnd}) + ${c} = ${fAtEnd}`, value: fAtEnd },
        { description: 'Compute average rate of change', expression: `(${fAtEnd} - ${fAtStart}) / (${intervalEnd} - ${intervalStart}) = ${rate}`, value: rate },
      ],
      gradingMetadata,
    };
  },
};

const solveQuadraticByGraphingGenerator: MathGenerator = {
  key: 'solve-quadratic-by-graphing',
  nodeIds: ['math.im3.skill.1.2.solve-quadratic-equations-by-graphing'],
  description: 'Generates quadratic equations solvable by graphing. Students find x-intercepts.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const r1 = Math.round((rand() * 6 - 3) * 10) / 10; // first root ∈ [-3, 3]
    const r2 = Math.round((rand() * 6 - 3) * 10) / 10; // second root

    const leadingA = 1;
    const bCoeff = Math.round((-(r1 + r2)) * 100) / 100;
    const cConst = Math.round((r1 * r2) * 100) / 100;

    const prompt = `Solve x² ${bCoeff >= 0 ? '+' : ''}${bCoeff}x ${cConst >= 0 ? '+' : ''}${cConst} = 0 by finding the x-intercepts of the graph.`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { solution_1: r1, solution_2: r2 },
      partMaxScores: { solution_1: 3, solution_2: 3 },
      partGradingRules: { solution_1: 'numeric_tolerance', solution_2: 'numeric_tolerance' },
      partTolerances: { solution_1: 0.01, solution_2: 0.01 },
    };

    return {
      prompt,
      data: { a: leadingA, b: bCoeff, c: cConst, roots: [r1, r2] },
      expectedAnswer: { solution_1: r1, solution_2: r2 },
      solutionSteps: [
        { description: 'Identify the quadratic function', expression: `f(x) = x² ${bCoeff >= 0 ? '+' : ''}${bCoeff}x ${cConst >= 0 ? '+' : ''}${cConst}`, value: { a: leadingA, b: bCoeff, c: cConst } },
        { description: 'Factor the quadratic', expression: `f(x) = (x ${r1 >= 0 ? '-' : '+'} ${Math.abs(r1)})(x ${r2 >= 0 ? '-' : '+'} ${Math.abs(r2)})`, value: [r1, r2] },
        { description: 'Set each factor to zero', expression: `x = ${r1} or x = ${r2}`, value: { solution_1: r1, solution_2: r2 } },
      ],
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// Stub generators (pilot scaffolding)
// ---------------------------------------------------------------------------

const algebraicStepSolverGenerator: MathGenerator = {
  key: 'algebraic-step-solver',
  nodeIds: [
    'math.im3.skill.1.3.understand-and-use-the-imaginary-unit-i',
    'math.im3.skill.1.3.perform-operations-with-complex-numbers',
    'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
    'math.im3.skill.1.5.solve-quadratic-equations-by-completing-the-square',
    'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
  ],
  description: 'Algebraic step-by-step solver (pilot stub — returns deterministic scaffolding)',
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
        partGradingRules: { result: 'exact_match' },
      },
    };
  },
};

const graphingExplorerStubGenerator: MathGenerator = {
  key: 'graphing-explorer',
  nodeIds: [
    'math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables',
    'math.im3.skill.1.8.solve-systems-involving-a-linear-and-a-quadratic-equation',
  ],
  description: 'Graphing explorer (pilot stub)',
  generate: (input: GeneratorInput): GeneratorOutput => ({
    prompt: `Graph the function (variant ${input.seed})`,
    data: { seed: input.seed, difficulty: input.difficulty },
    expectedAnswer: { graph_result: `variant-${input.seed}` },
    solutionSteps: [
      { description: 'Identify the function type', expression: 'See curriculum' },
    ],
    gradingMetadata: {
      partAnswers: { graph_result: `variant-${input.seed}` },
      partMaxScores: { graph_result: 5 },
      partGradingRules: { graph_result: 'exact_match' },
    },
  }),
};

const statisticsStubGenerator: MathGenerator = {
  key: 'statistics',
  nodeIds: [],
  description: 'Statistics generator (pilot stub)',
  generate: (input: GeneratorInput): GeneratorOutput => ({
    prompt: `Statistics problem (variant ${input.seed})`,
    data: { seed: input.seed, difficulty: input.difficulty },
    expectedAnswer: { result: `variant-${input.seed}` },
    solutionSteps: [
      { description: 'Analyze the data', expression: 'See curriculum' },
    ],
    gradingMetadata: {
      partAnswers: { result: `variant-${input.seed}` },
      partMaxScores: { result: 5 },
      partGradingRules: { result: 'exact_match' },
    },
  }),
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const GENERATOR_REGISTRY: Record<string, MathGenerator> = {
  [quadraticGraphAnalysisGenerator.key]: quadraticGraphAnalysisGenerator,
  [averageRateOfChangeGenerator.key]: averageRateOfChangeGenerator,
  [solveQuadraticByGraphingGenerator.key]: solveQuadraticByGraphingGenerator,
  [algebraicStepSolverGenerator.key]: algebraicStepSolverGenerator,
  [graphingExplorerStubGenerator.key]: graphingExplorerStubGenerator,
  [statisticsStubGenerator.key]: statisticsStubGenerator,
};

export const GENERATOR_KEYS = Object.keys(GENERATOR_REGISTRY) as string[];

export function getGenerator(key: string): MathGenerator {
  const generator = GENERATOR_REGISTRY[key];
  if (!generator) {
    throw new Error(`Unknown generator key: "${key}"`);
  }
  return generator;
}