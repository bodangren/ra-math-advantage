/**
 * Generator Registry
 *
 * Maps generator keys to their deterministic generator implementations.
 * Each generator follows the convention: `generate(options: { seed: number }) → T`.
 *
 * Keys are namespaced by the generator's domain (e.g. 'polynomial-operations',
 * 'rational-analyzer') so the IM3 blueprints can reference them by topic.
 */

import { generatePolynomialOperation } from './polynomial-operations';
import { generatePolynomialDivision } from './polynomial-division';
import { generateRationalProblem } from './rational-analyzer';
import { generateExpLogProblem } from './exp-log-solver';

// ---------------------------------------------------------------------------
// Registry interface
// ---------------------------------------------------------------------------

export interface GeneratorEntry {
  /** Deterministic generator function. Same seed → same output. */
  generate: (options: { seed: number }) => unknown;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const GENERATOR_REGISTRY: Record<string, GeneratorEntry> = {
  'polynomial-operations': { generate: generatePolynomialOperation },
  'polynomial-division': { generate: generatePolynomialDivision },
  'rational-analyzer': { generate: generateRationalProblem },
  'exp-log-solver': { generate: generateExpLogProblem },
};
