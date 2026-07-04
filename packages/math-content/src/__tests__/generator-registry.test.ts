import { describe, it, expect } from 'vitest';
import {
  generatePolynomialOperation,
  generatePolynomialDivision,
  generateRationalProblem,
  generateExpLogProblem,
  generateLinearEquation,
  generateSystemOfEquations,
  generateQuadraticFactoring,
  generateQuadraticFormula,
  addPoly,
  subtractPoly,
  multiplyPoly,
  checkEquivalence,
} from '../index';
import { getGenerator } from '../knowledge-space/generators/registry';

// ---------------------------------------------------------------------------
// Index re-export contract tests
// ---------------------------------------------------------------------------

describe('index.ts re-exports', () => {
  it('re-exports generatePolynomialOperation', () => {
    expect(typeof generatePolynomialOperation).toBe('function');
  });

  it('re-exports generatePolynomialDivision', () => {
    expect(typeof generatePolynomialDivision).toBe('function');
  });

  it('re-exports generateRationalProblem', () => {
    expect(typeof generateRationalProblem).toBe('function');
  });

  it('re-exports generateExpLogProblem', () => {
    expect(typeof generateExpLogProblem).toBe('function');
  });

  it('re-exports addPoly, subtractPoly, multiplyPoly', () => {
    expect(typeof addPoly).toBe('function');
    expect(typeof subtractPoly).toBe('function');
    expect(typeof multiplyPoly).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Behavioral correctness — `expectedAnswer` / `result` matches the
// actual math (FR-19).
//
// These tests verify the generator's declared answer field against the
// operation the prompt asks the student to perform, computed via the
// same polynomial / exponential primitives the generator uses. This is
// a behavioral check (the answer changes when the operands change) and
// is NOT a parity oracle (it does not re-implement the generator's
// interior — it invokes the same library primitives the generator
// composes).
// ---------------------------------------------------------------------------

describe('FR-19 behavioral: generator `result` matches the actual math', () => {
  it('polynomial-operations seed 523 — operator is \'−\' (523 % 3 = 1, index 1 of [+,\u2212,\u00d7]) and result equals subtractPoly(dividend, divisor)', () => {
    const problem = generatePolynomialOperation({ seed: 523 });

    expect(problem.operator).toBe('\u2212');
    expect(Math.abs(523) % 3).toBe(1);

    expect(problem.result).toEqual(subtractPoly(problem.dividend, problem.divisor));
  });

  it('polynomial-operations seed 0 — operator is \'+\' (0 % 3 = 0) and result equals addPoly', () => {
    const problem = generatePolynomialOperation({ seed: 0 });
    expect(problem.operator).toBe('+');
    expect(problem.result).toEqual(addPoly(problem.dividend, problem.divisor));
  });

  it('polynomial-operations seed 2 — operator is \'×\' (2 % 3 = 2) and result equals multiplyPoly', () => {
    const problem = generatePolynomialOperation({ seed: 2 });
    expect(problem.operator).toBe('\u00d7');
    expect(problem.result).toEqual(multiplyPoly(problem.dividend, problem.divisor));
  });

  it('polynomial-operations cycles through all three operators across 9 consecutive seeds', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 9; seed++) {
      seen.add(generatePolynomialOperation({ seed }).operator);
    }
    expect(seen).toEqual(new Set(['+', '\u2212', '\u00d7']));
  });

  it('polynomial-division seed 1 — dividend equals divisor * quotient + remainder', () => {
    const problem = generatePolynomialDivision({ seed: 1 });
    const computed = addPoly(
      multiplyPoly(problem.divisor, problem.quotient),
      problem.remainder,
    );
    expect(computed).toEqual(problem.dividend);
  });

  it('rational seed 1 — xIntercepts are non-hole roots of numerator; verticalAsymptotes are non-hole roots of denominator', () => {
    const problem = generateRationalProblem({ seed: 1 });

    // For a degree-2 monic polynomial [c0, c1, 1] = c0 + c1*x + x²,
    // roots are r = (-c1 ± sqrt(c1² - 4*c0)) / 2.
    const quadraticRoots = (coeffs: number[]): number[] => {
      const [c0, c1, c2] = coeffs;
      if (c2 === 0) return [];
      const disc = c1 * c1 - 4 * c2 * c0;
      if (disc < 0) return [];
      const sq = Math.sqrt(disc);
      return [(-c1 + sq) / (2 * c2), (-c1 - sq) / (2 * c2)];
    };

    const holeSet = new Set(problem.holes);
    const numRoots = quadraticRoots(problem.numerator).filter((r) => !holeSet.has(r));
    const denRoots = quadraticRoots(problem.denominator).filter((r) => !holeSet.has(r));

    expect(problem.xIntercepts.sort((a, b) => a - b)).toEqual(
      numRoots.sort((a, b) => a - b),
    );
    expect(problem.verticalAsymptotes.sort((a, b) => a - b)).toEqual(
      denRoots.sort((a, b) => a - b),
    );
  });

  it('rational generator — across 50 seeds, every hole is also a root of both numerator and denominator (consistency)', () => {
    const quadraticRoots = (coeffs: number[]): number[] => {
      const [c0, c1, c2] = coeffs;
      if (c2 === 0) return [];
      const disc = c1 * c1 - 4 * c2 * c0;
      if (disc < 0) return [];
      const sq = Math.sqrt(disc);
      return [(-c1 + sq) / (2 * c2), (-c1 - sq) / (2 * c2)];
    };

    for (let seed = 1; seed <= 50; seed++) {
      const problem = generateRationalProblem({ seed });
      const numRoots = new Set(quadraticRoots(problem.numerator));
      const denRoots = new Set(quadraticRoots(problem.denominator));
      for (const hole of problem.holes) {
        expect(numRoots.has(hole)).toBe(true);
        expect(denRoots.has(hole)).toBe(true);
      }
    }
  });

  it('exp-log seed 1 — answer satisfies ln(-4x - 7) = 1', () => {
    const problem = generateExpLogProblem({ seed: 1 });
    expect(problem.problemType).toBe('ln');

    // Parse the equation "ln(-4x - 7) = 1" to recover A, C, target.
    // Equation form: ln(A*x + C) = D  →  answer = (e^D - C) / A
    const match = problem.equation.match(/^\\ln\((-?\d+)x\s*([+-])\s*(\d+)\)\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    const A = Number(match![1]);
    const sign = match![2];
    const C = Number(match![3]) * (sign === '+' ? 1 : -1);
    const D = Number(match![4]);

    const expected = (Math.exp(D) - C) / A;
    expect(problem.answer).toBeCloseTo(expected, 5);
  });

  it('exp-log answer is finite and within the declared domain across 50 seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const problem = generateExpLogProblem({ seed });
      expect(Number.isFinite(problem.answer)).toBe(true);
      if (problem.domain.min !== null) {
        expect(problem.answer).toBeGreaterThan(problem.domain.min);
      }
      if (problem.domain.max !== null) {
        expect(problem.answer).toBeLessThan(problem.domain.max);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// QA harness — edge case: sparse polynomial (missing middle terms)
// ---------------------------------------------------------------------------

describe('QA harness: sparse polynomial edge cases', () => {
  it('polynomial-operations seed 523 produces sparse result [8, 0, 0, 4] (8 + 4x³)', () => {
    // Seed 523: operator = '−' (523 % 3 = 1 → index 1 of [+, −, ×])
    //   dividend: [3, -1, 4, 1]  = 3 − x + 4x² + x³
    //   divisor:  [-5, -1, 4, -3] = −5 − x + 4x² − 3x³
    //   result:   [8, 0, 0, 4]   = 8 + 4x³  (x and x² terms cancel)
    const problem = generatePolynomialOperation({ seed: 523 });
    expect(problem.result).toEqual([8, 0, 0, 4]);
    expect(problem.result[1]).toBe(0);
    expect(problem.result[2]).toBe(0);
    expect(problem.result[0]).not.toBe(0);
    expect(problem.result[3]).not.toBe(0);
  });

  it('multiplyPoly handles sparse inputs correctly', () => {
    // (x − 1)(x² + x + 1) = x³ − 1  →  ascending [-1, 0, 0, 1]
    //   [-1, 1] × [1, 1, 1]
    const result = multiplyPoly([-1, 1], [1, 1, 1]);
    expect(result).toEqual([-1, 0, 0, 1]);
  });

  it('addPoly handles sparse arrays of different lengths', () => {
    // [1, 0, 0, 3] + [0, 2] = [1, 2, 0, 3]
    const result = addPoly([1, 0, 0, 3], [0, 2]);
    expect(result).toEqual([1, 2, 0, 3]);
  });

  it('subtractPoly produces sparse result from dense inputs', () => {
    // [3, -1, 4, 1] - [-5, -1, 4, -3] = [8, 0, 0, 4]
    const result = subtractPoly([3, -1, 4, 1], [-5, -1, 4, -3]);
    expect(result).toEqual([8, 0, 0, 4]);
  });
});

// ---------------------------------------------------------------------------
// T17 Phase 2 — Linear & Systems generator registry wiring
// ---------------------------------------------------------------------------

describe('T17 Phase 2 algebra generators', () => {
  it('re-exports generateLinearEquation from index', () => {
    expect(typeof generateLinearEquation).toBe('function');
  });

  it('re-exports generateSystemOfEquations from index', () => {
    expect(typeof generateSystemOfEquations).toBe('function');
  });

  it('registers the linear-equation-solver adapter and returns a GeneratorOutput-shaped object', () => {
    const generator = getGenerator('linear-equation-solver');
    expect(generator).toBeDefined();
    expect(generator.key).toBe('linear-equation-solver');

    const output = generator.generate({
      seed: 1,
      nodeId: 'math.im3.skill.test.linear-equation',
      difficulty: 0.5,
    });

    expect(output).toHaveProperty('prompt');
    expect(typeof output.prompt).toBe('string');
    expect(output).toHaveProperty('expectedAnswer');
    expect(output).toHaveProperty('solutionSteps');
    expect(Array.isArray(output.solutionSteps)).toBe(true);
    expect(output).toHaveProperty('gradingMetadata');
    expect(output.gradingMetadata).toHaveProperty('partAnswers');
    expect(output.gradingMetadata).toHaveProperty('partMaxScores');
    expect(output.gradingMetadata).toHaveProperty('partGradingRules');
  });

  it('registers the system-of-equations-solver adapter and returns a GeneratorOutput-shaped object', () => {
    const generator = getGenerator('system-of-equations-solver');
    expect(generator).toBeDefined();
    expect(generator.key).toBe('system-of-equations-solver');

    const output = generator.generate({
      seed: 1,
      nodeId: 'math.im3.skill.test.system-of-equations',
      difficulty: 0.5,
    });

    expect(output).toHaveProperty('prompt');
    expect(typeof output.prompt).toBe('string');
    expect(output).toHaveProperty('expectedAnswer');
    expect(output).toHaveProperty('solutionSteps');
    expect(Array.isArray(output.solutionSteps)).toBe(true);
    expect(output).toHaveProperty('gradingMetadata');
    expect(output.gradingMetadata).toHaveProperty('partAnswers');
    expect(output.gradingMetadata).toHaveProperty('partMaxScores');
    expect(output.gradingMetadata).toHaveProperty('partGradingRules');
  });

  it('adapter keys are unique and do not collide with existing registry keys', () => {
    const linear = getGenerator('linear-equation-solver');
    const system = getGenerator('system-of-equations-solver');
    expect(linear.key).not.toBe(system.key);
    expect(linear.key).not.toBe('polynomial-operations');
    expect(system.key).not.toBe('exp-log-solver');
  });
});

// ---------------------------------------------------------------------------
// T17 Phase 3 — Quadratic generators
// ---------------------------------------------------------------------------

describe('T17 Phase 3 quadratic generators', () => {
  it('re-exports generateQuadraticFactoring from index', () => {
    expect(typeof generateQuadraticFactoring).toBe('function');
  });

  it('re-exports generateQuadraticFormula from index', () => {
    expect(typeof generateQuadraticFormula).toBe('function');
  });

  it('re-exports checkEquivalence from index', () => {
    expect(typeof checkEquivalence).toBe('function');
  });

  it('registers the quadratic-factoring adapter and returns a GeneratorOutput-shaped object', () => {
    const generator = getGenerator('quadratic-factoring');
    expect(generator).toBeDefined();
    expect(generator.key).toBe('quadratic-factoring');

    const output = generator.generate({
      seed: 1,
      nodeId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      difficulty: 0.5,
    });

    expect(output).toHaveProperty('prompt');
    expect(typeof output.prompt).toBe('string');
    expect(output).toHaveProperty('expectedAnswer');
    expect(output).toHaveProperty('solutionSteps');
    expect(Array.isArray(output.solutionSteps)).toBe(true);
    expect(output).toHaveProperty('gradingMetadata');
    expect(output.gradingMetadata).toHaveProperty('partAnswers');
    expect(output.gradingMetadata).toHaveProperty('partMaxScores');
    expect(output.gradingMetadata).toHaveProperty('partGradingRules');

    const rules = Object.values(output.gradingMetadata.partGradingRules);
    expect(rules).toContain('expression_equivalence');
  });

  it('registers the quadratic-formula adapter and returns a GeneratorOutput-shaped object', () => {
    const generator = getGenerator('quadratic-formula');
    expect(generator).toBeDefined();
    expect(generator.key).toBe('quadratic-formula');

    const output = generator.generate({
      seed: 1,
      nodeId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      difficulty: 0.5,
    });

    expect(output).toHaveProperty('prompt');
    expect(typeof output.prompt).toBe('string');
    expect(output).toHaveProperty('expectedAnswer');
    expect(output).toHaveProperty('solutionSteps');
    expect(Array.isArray(output.solutionSteps)).toBe(true);
    expect(output).toHaveProperty('gradingMetadata');
    expect(output.gradingMetadata).toHaveProperty('partAnswers');
    expect(output.gradingMetadata).toHaveProperty('partMaxScores');
    expect(output.gradingMetadata).toHaveProperty('partGradingRules');

    const rules = Object.values(output.gradingMetadata.partGradingRules);
    expect(rules.some((rule) => rule === 'numeric_tolerance' || rule === 'expression_equivalence')).toBe(true);
  });

  it('adapter keys are unique and include the two new quadratic keys', () => {
    const expectedKeys = [
      'quadratic-graph-analysis',
      'average-rate-of-change',
      'solve-quadratic-by-graphing',
      'algebraic-step-solver',
      'graphing-explorer',
      'statistics',
      'polynomial-operations',
      'polynomial-division',
      'rational-analyzer',
      'exp-log-solver',
      'linear-equation-solver',
      'system-of-equations-solver',
      'quadratic-factoring',
      'quadratic-formula',
    ];
    expect(new Set(expectedKeys).size).toBe(expectedKeys.length);

    for (const key of expectedKeys) {
      expect(getGenerator(key)).toBeDefined();
    }
  });

  it('does not allow the algebraic-step-solver stub to claim the new quadratic nodeIds (Jr-Green will resolve overlap)', () => {
    const stub = getGenerator('algebraic-step-solver');
    expect(stub.nodeIds).not.toContain('math.im3.skill.1.4.solve-quadratic-equations-by-factoring');
    expect(stub.nodeIds).not.toContain('math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations');
  });
});
