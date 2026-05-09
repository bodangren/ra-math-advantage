// Math generator registry
//
// Maps generatorKey → deterministic generator implementation.
// Generators conform to the Track 6 generator contract (stubbed here for T2.5).

export interface MathGenerator {
  key: string;
  generate: (variantSeed: number) => unknown;
}

// ---------------------------------------------------------------------------
// Stub generators
// ---------------------------------------------------------------------------

const algebraicStepSolverGenerator: MathGenerator = {
  key: 'algebraic-step-solver',
  generate: (variantSeed: number) => ({
    type: 'algebraic',
    problem: `Algebraic problem variant ${variantSeed}`,
    steps: [],
  }),
};

const graphingExplorerGenerator: MathGenerator = {
  key: 'graphing-explorer',
  generate: (variantSeed: number) => ({
    type: 'graphing',
    problem: `Graphing problem variant ${variantSeed}`,
    initialView: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },
  }),
};

const statisticsGenerator: MathGenerator = {
  key: 'statistics',
  generate: (variantSeed: number) => ({
    type: 'statistics',
    problem: `Statistics problem variant ${variantSeed}`,
    dataset: [],
  }),
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const GENERATOR_REGISTRY: Record<string, MathGenerator> = {
  [algebraicStepSolverGenerator.key]: algebraicStepSolverGenerator,
  [graphingExplorerGenerator.key]: graphingExplorerGenerator,
  [statisticsGenerator.key]: statisticsGenerator,
};

export const GENERATOR_KEYS = Object.keys(GENERATOR_REGISTRY) as string[];

export function getGenerator(key: string): MathGenerator {
  const generator = GENERATOR_REGISTRY[key];
  if (!generator) {
    throw new Error(`Unknown generator key: "${key}"`);
  }
  return generator;
}
