/**
 * Adapters for the Phase 2 linear-algebra generators so they conform to the
 * knowledge-space-practice `GeneratorInput → GeneratorOutput` contract.
 *
 * These adapters wrap the lower-level generators (`generateLinearEquation` and
 * `generateSystemOfEquations`, which take `{ seed: number }` and return
 * domain-specific objects) into `MathGenerator` entries that can be looked up
 * via `getGenerator` in `registry.ts`.
 *
 * Node-IDs: The IM3 M1 skill slot currently served by the
 * `algebraicStepSolverGenerator` pilot stub is reserved for quadratics (1.3
 * imaginary/complex, 1.4 factoring, 1.5 completing-the-square, 1.6 quadratic
 * formula). Linear equations and systems live in IM1's skill graph, so the
 * adapters claim the real IM1 skill IDs that exist in `cross-course-edges.json`
 * (see Phase 4 notes in plan.md for the eventual IM3 wiring via blueprint
 * resolution).
 */

import type {
  GeneratorInput,
  GeneratorOutput,
  GradingMetadata,
} from '@math-platform/knowledge-space-practice';
import { generateLinearEquation } from '../../linear-equation-solver';
import { generateSystemOfEquations } from '../../system-of-equations-solver';
import { generateQuadraticFactoring } from '../../quadratic-factoring';
import { generateQuadraticFormula } from '../../quadratic-formula';
import type { MathGenerator } from './registry';

// ---------------------------------------------------------------------------
// linear-equation-solver adapter
// ---------------------------------------------------------------------------

export const linearEquationAdapter: MathGenerator = {
  key: 'linear-equation-solver',
  nodeIds: [
    // Real IM1 skill IDs that exist in packages/math-content/src/knowledge-space/cross-course-edges.json
    'math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides',
  ],
  description:
    'Generates single-variable linear equations of the form a*x + b = c via backward construction. The answer is sometimes integer, sometimes rational.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateLinearEquation({ seed: input.seed });

    const prompt = `Solve the equation ${problem.equation} for x.`;

    // Numeric tolerance is appropriate because the answer can be a fraction
    // (e.g. 1/2) whose decimal representation is exact. The 1e-9 tolerance
    // matches the parser test's `toBeCloseTo(..., 9)` precision.
    const gradingMetadata: GradingMetadata = {
      partAnswers: { x: problem.answer },
      partMaxScores: { x: 1 },
      partGradingRules: { x: 'numeric_tolerance' },
      partTolerances: { x: 1e-9 },
    };

    return {
      prompt,
      data: {
        equation: problem.equation,
        a: problem.a,
        b: problem.b,
        c: problem.c,
        familyId: problem.familyId,
      },
      expectedAnswer: { x: problem.answer },
      solutionSteps: problem.steps.map((description) => ({ description })),
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// system-of-equations-solver adapter
// ---------------------------------------------------------------------------

export const systemOfEquationsAdapter: MathGenerator = {
  key: 'system-of-equations-solver',
  nodeIds: [
    // Real IM1 skill IDs that exist in packages/math-content/src/knowledge-space/cross-course-edges.json
    'math.im1.skill.7.2.solve-systems-of-linear-equations-using-the-substitution-met',
    'math.im1.skill.7.3.solve-systems-of-linear-equations-using-elimination-by-addit',
  ],
  description:
    'Generates 2×2 systems of linear equations with a unique integer solution. Backward construction guarantees the answer satisfies both equations.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateSystemOfEquations({ seed: input.seed });

    const prompt = `Solve the system of equations: ${problem.equations[0]} and ${problem.equations[1]}.`;

    // Both x and y are guaranteed integers by construction (the backward
    // generator picks integer solutions). Exact match is therefore sufficient,
    // but numeric_tolerance with 1e-9 covers the symbolic recovery path
    // inside `generateSystemOfEquations` (which divides by `det`).
    const gradingMetadata: GradingMetadata = {
      partAnswers: { x: problem.answer.x, y: problem.answer.y },
      partMaxScores: { x: 1, y: 1 },
      partGradingRules: { x: 'numeric_tolerance', y: 'numeric_tolerance' },
      partTolerances: { x: 1e-9, y: 1e-9 },
    };

    return {
      prompt,
      data: {
        equations: problem.equations,
        a1: problem.a1,
        b1: problem.b1,
        c1: problem.c1,
        a2: problem.a2,
        b2: problem.b2,
        c2: problem.c2,
        familyId: problem.familyId,
      },
      expectedAnswer: { x: problem.answer.x, y: problem.answer.y },
      solutionSteps: problem.steps.map((description) => ({ description })),
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// quadratic-factoring adapter
// ---------------------------------------------------------------------------

export const quadraticFactoringAdapter: MathGenerator = {
  key: 'quadratic-factoring',
  nodeIds: [
    'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
  ],
  description:
    'Generates quadratic factoring problems (monic, a>1, perfect square, difference of squares) via backward construction. The expected answer is the factored form; grading uses expression_equivalence so (x+3)(x-2) and (x-2)(x+3) both score.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateQuadraticFactoring({ seed: input.seed });

    const prompt = `Factor the quadratic expression: ${problem.quadratic}.`;

    const gradingMetadata: GradingMetadata = {
      partAnswers: { factoredForm: problem.factoredForm },
      partMaxScores: { factoredForm: 1 },
      partGradingRules: { factoredForm: 'expression_equivalence' },
    };

    return {
      prompt,
      data: {
        quadratic: problem.quadratic,
        a: problem.a,
        b: problem.b,
        c: problem.c,
        roots: problem.roots,
      },
      expectedAnswer: { factoredForm: problem.factoredForm },
      solutionSteps: problem.steps.map((description) => ({ description })),
      gradingMetadata,
    };
  },
};

// ---------------------------------------------------------------------------
// quadratic-formula adapter
// ---------------------------------------------------------------------------

export const quadraticFormulaAdapter: MathGenerator = {
  key: 'quadratic-formula',
  nodeIds: [
    'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
  ],
  description:
    'Generates quadratic equations covering integer, repeated, irrational, and complex-conjugate root regimes. Applies the quadratic formula and presents simplified roots.',
  generate: (input: GeneratorInput): GeneratorOutput => {
    const problem = generateQuadraticFormula({ seed: input.seed });

    const prompt = `Solve using the quadratic formula: ${problem.quadratic} = 0.`;

    const partAnswers: Record<string, unknown> = { discriminant: problem.discriminant };
    const partMaxScores: Record<string, number> = { discriminant: 1 };
    const partGradingRules: Record<string, string> = { discriminant: 'numeric_tolerance' };
    const partTolerances: Record<string, number> = { discriminant: 1e-9 };

    for (let i = 0; i < problem.roots.length; i++) {
      const key = `x${i + 1}`;
      const root = problem.roots[i];
      partAnswers[key] = root.value;
      partMaxScores[key] = 1;
      if (typeof root.value === 'number') {
        partGradingRules[key] = 'numeric_tolerance';
        partTolerances[key] = 1e-9;
      } else {
        partGradingRules[key] = 'exact_match';
      }
    }

    const gradingMetadata: GradingMetadata = {
      partAnswers,
      partMaxScores,
      partGradingRules,
      partTolerances,
    };

    const expectedAnswer: Record<string, unknown> = { discriminant: problem.discriminant };
    for (let i = 0; i < problem.roots.length; i++) {
      expectedAnswer[`x${i + 1}`] = problem.roots[i].value;
    }

    return {
      prompt,
      data: {
        quadratic: problem.quadratic,
        a: problem.a,
        b: problem.b,
        c: problem.c,
        discriminant: problem.discriminant,
      },
      expectedAnswer,
      solutionSteps: problem.steps.map((description) => ({ description })),
      gradingMetadata,
    };
  },
};