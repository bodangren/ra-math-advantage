// Placement test fixtures for Integrated Math 3 (Phase 3 — Reference Implementation).
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §2:
//   - Im3ProbeBankFixture — 20-30 nodeId→problem entries
//   - InMemoryKnowledgeStateStore — stub for getKnowledgeState
//   - createDeterministicAnswerSource — preset evaluator for the probe adapter
//
// All exports are test-only. Production wiring (Convex-backed store, real
// problem-bank lookups) lands in Phase 4.

import type { ProbeResult, PlacementResult } from '@math-platform/knowledge-space-core';

// ---------------------------------------------------------------------------
// Im3ProblemEntry — shape of a single problem-bank entry
// ---------------------------------------------------------------------------

export interface Im3ProblemEntry {
  /** Stable problem identifier (kebab-case, prefixed with `im3-`). */
  problemId: string;
  /** IM3 graph node ID this problem probes (e.g. math.im3.skill.1.4...). */
  nodeId: string;
  /** Module number (1-9) the problem belongs to. */
  module: number;
  /** Lesson number within the module. */
  lesson: number;
  /** Human-readable prompt for the diagnostic problem. */
  prompt: string;
  /** Coarse difficulty band used for ordering / sampling. */
  difficulty: 'easy' | 'medium' | 'hard';
}

// ---------------------------------------------------------------------------
// IM3_PROBLEM_BANK — 25 representative IM3 diagnostic problems
// ---------------------------------------------------------------------------
//
// Each entry references a lesson-level skill node from the IM3 curriculum
// (see apps/integrated-math-3/curriculum/skill-graph/nodes.json). Coverage
// spans all 9 modules with at least one entry per module so the adaptive
// tree-walk has a viable frontier no matter where the learner starts.

export const IM3_PROBLEM_BANK: ReadonlyArray<Im3ProblemEntry> = Object.freeze([
  // Module 1 — Quadratic Functions
  {
    problemId: 'im3-m1-l1-graph-quadratic',
    nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
    module: 1,
    lesson: 1,
    prompt: 'Sketch the parabola y = x^2 - 4x + 3 and identify its vertex.',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m1-l2-roots-by-graphing',
    nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
    module: 1,
    lesson: 2,
    prompt: 'Estimate the roots of y = x^2 - 5x + 6 from its graph.',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m1-l3-imaginary-unit',
    nodeId: 'math.im3.skill.1.3.understand-and-use-the-imaginary-unit-i',
    module: 1,
    lesson: 3,
    prompt: 'Simplify sqrt(-49) using the imaginary unit i.',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m1-l4-factor-quadratic',
    nodeId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
    module: 1,
    lesson: 4,
    prompt: 'Solve x^2 - 7x + 12 = 0 by factoring.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m1-l6-quadratic-formula',
    nodeId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
    module: 1,
    lesson: 6,
    prompt: 'Use the quadratic formula to solve 2x^2 + 3x - 5 = 0.',
    difficulty: 'medium',
  },
  // Module 2 — Polynomials
  {
    problemId: 'im3-m2-l1-graph-polynomial',
    nodeId: 'math.im3.skill.2.1.graph-and-analyze-polynomial-functions',
    module: 2,
    lesson: 1,
    prompt: 'Sketch p(x) = x^3 - 3x and identify end behavior.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m2-l3-multiply-polynomials',
    nodeId: 'math.im3.skill.2.3.multiply-polynomials',
    module: 2,
    lesson: 3,
    prompt: 'Expand (x + 2)(x^2 - 5x + 1).',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m2-l4-synthetic-division',
    nodeId: 'math.im3.skill.2.4.divide-polynomials-by-using-synthetic-division',
    module: 2,
    lesson: 4,
    prompt: 'Divide x^3 - 4x^2 + x + 6 by (x - 1) using synthetic division.',
    difficulty: 'hard',
  },
  // Module 3 — Polynomial Equations
  {
    problemId: 'im3-m3-l1-poly-equation-graphing',
    nodeId: 'math.im3.skill.3.1.solve-polynomial-equations-by-graphing',
    module: 3,
    lesson: 1,
    prompt: 'Solve x^3 - 2x^2 - 5x + 6 = 0 by graphing.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m3-l2-poly-equation-factoring',
    nodeId: 'math.im3.skill.3.2.solve-polynomial-equations-by-factoring',
    module: 3,
    lesson: 2,
    prompt: 'Factor and solve x^3 - 9x = 0.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m3-l4-synthetic-substitution',
    nodeId: 'math.im3.skill.3.4.evaluate-functions-by-using-synthetic-substitution',
    module: 3,
    lesson: 4,
    prompt: 'Use synthetic substitution to evaluate f(2) for f(x) = x^3 - 4x + 1.',
    difficulty: 'hard',
  },
  // Module 4 — Inverses & Radicals
  {
    problemId: 'im3-m4-l1-inverse-functions',
    nodeId: 'math.im3.skill.4.1.find-inverse-functions',
    module: 4,
    lesson: 1,
    prompt: 'Find the inverse of f(x) = 2x + 5.',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m4-l3-radical-equations',
    nodeId: 'math.im3.skill.4.3.solve-radical-equations',
    module: 4,
    lesson: 3,
    prompt: 'Solve sqrt(2x + 1) = x - 1.',
    difficulty: 'hard',
  },
  // Module 5 — Exponential Functions
  {
    problemId: 'im3-m5-l1-graph-exponential',
    nodeId: 'math.im3.skill.5.1.graph-exponential-functions',
    module: 5,
    lesson: 1,
    prompt: 'Sketch y = 2^x and identify asymptotes.',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m5-l3-solve-exponential',
    nodeId: 'math.im3.skill.5.3.solve-exponential-equations',
    module: 5,
    lesson: 3,
    prompt: 'Solve 3^(x+1) = 27.',
    difficulty: 'medium',
  },
  // Module 6 — Logarithmic Functions
  {
    problemId: 'im3-m6-l1-evaluate-logs',
    nodeId: 'math.im3.skill.6.1.evaluate-logarithms',
    module: 6,
    lesson: 1,
    prompt: 'Evaluate log_2(32).',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m6-l3-log-properties',
    nodeId: 'math.im3.skill.6.3.apply-properties-of-logarithms',
    module: 6,
    lesson: 3,
    prompt: 'Expand log(x^2 y / z) using log properties.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m6-l4-solve-log-equation',
    nodeId: 'math.im3.skill.6.4.solve-logarithmic-equations',
    module: 6,
    lesson: 4,
    prompt: 'Solve log_3(x) + log_3(x - 2) = 1.',
    difficulty: 'hard',
  },
  // Module 7 — Rational Functions
  {
    problemId: 'im3-m7-l1-graph-rational',
    nodeId: 'math.im3.skill.7.1.graph-rational-functions',
    module: 7,
    lesson: 1,
    prompt: 'Sketch f(x) = (x - 1)/(x + 2) and identify asymptotes.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m7-l3-solve-rational',
    nodeId: 'math.im3.skill.7.3.solve-rational-equations',
    module: 7,
    lesson: 3,
    prompt: 'Solve 1/x + 1/(x+1) = 5/6.',
    difficulty: 'hard',
  },
  // Module 8 — Inferential Statistics
  {
    problemId: 'im3-m8-l1-mean-stddev',
    nodeId: 'math.im3.skill.8.1.calculate-mean-and-standard-deviation',
    module: 8,
    lesson: 1,
    prompt: 'Find the mean and standard deviation of {4, 8, 10, 12, 16}.',
    difficulty: 'easy',
  },
  {
    problemId: 'im3-m8-l3-confidence-interval',
    nodeId: 'math.im3.skill.8.3.compute-confidence-intervals',
    module: 8,
    lesson: 3,
    prompt: 'Compute a 95% confidence interval for a sample mean of 50 with sample standard deviation 5 and n = 100.',
    difficulty: 'hard',
  },
  // Module 9 — Trigonometric Functions
  {
    problemId: 'im3-m9-l1-unit-circle',
    nodeId: 'math.im3.skill.9.1.use-the-unit-circle',
    module: 9,
    lesson: 1,
    prompt: 'Find sin(2π/3) using the unit circle.',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m9-l3-graph-sine',
    nodeId: 'math.im3.skill.9.3.graph-sine-and-cosine-functions',
    module: 9,
    lesson: 3,
    prompt: 'Sketch y = 2 sin(x) over [0, 2π].',
    difficulty: 'medium',
  },
  {
    problemId: 'im3-m9-l5-trig-equation',
    nodeId: 'math.im3.skill.9.5.solve-trigonometric-equations',
    module: 9,
    lesson: 5,
    prompt: 'Solve 2 sin(x) - 1 = 0 on [0, 2π).',
    difficulty: 'hard',
  },
]);

// ---------------------------------------------------------------------------
// createDeterministicAnswerSource — preset answer evaluator for tests
// ---------------------------------------------------------------------------
//
// The IM3 probe adapter delegates "did the student answer correctly?" to an
// `Im3ProbeAnswerSource` (production: Convex-backed; tests: this stub). The
// adapter maps a `nodeId` to a `problemId` (via IM3_PROBLEM_BANK) and then
// asks the answer source for the result.

export interface Im3ProbeAnswerSource {
  /** Returns the recorded probe result for a given problemId. */
  evaluate(problemId: string): ProbeResult;
}

export interface DeterministicAnswerSource extends Im3ProbeAnswerSource {
  /** Ordered list of problemIds queried via this source. */
  readonly evaluations: ReadonlyArray<string>;
  /** Total number of evaluate() calls. */
  readonly callCount: number;
  /** Reset the call log. */
  reset(): void;
}

export interface DeterministicAnswerSourceOptions {
  /** Result returned when a problemId is absent from the preset. Defaults to 'partial'. */
  defaultResult?: ProbeResult;
}

export function createDeterministicAnswerSource(
  preset: Record<string, ProbeResult>,
  options: DeterministicAnswerSourceOptions = {},
): DeterministicAnswerSource {
  const defaultResult: ProbeResult = options.defaultResult ?? 'partial';
  const calls: string[] = [];

  return {
    evaluations: calls,
    get callCount() {
      return calls.length;
    },
    evaluate(problemId: string): ProbeResult {
      calls.push(problemId);
      return preset[problemId] ?? defaultResult;
    },
    reset(): void {
      calls.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// InMemoryKnowledgeStateStore — Phase 4 store stub
// ---------------------------------------------------------------------------
//
// In Phase 4 this interface is implemented by a Convex-backed store that
// persists placement_results and exposes a getKnowledgeState-shaped read.
// In Phase 3 the InMemory variant lets us unit-test the seeding logic
// without a real database. Per test strategy §3 "Confidence seeding
// consistency P3→P4" the store must:
//   1. Persist placement seeds keyed by (studentId, nodeId)
//   2. Be idempotent on repeat upserts
//   3. Never override an existing high-confidence SRS-derived entry
// (3) is enforced by callers that pre-check the store before seeding;
// the store itself stays a thin key-value with last-write-wins semantics
// within its own namespace.

export interface PlacementKnowledgeStateSeed {
  /** IM3 graph node id seeded into the knowledge state. */
  nodeId: string;
  /** Mastery estimate in [0, 1] derived from the probe outcome. */
  masteryEstimate: number;
  /** Confidence band — placement seeds are 'low' or 'medium' only. */
  confidence: 'low' | 'medium';
  /** Source tag — always 'placement' for entries from this pipeline. */
  source: 'placement';
  /** Unix ms timestamp the seed was produced. */
  seededAt: number;
}

export interface InMemoryKnowledgeStateStore {
  /**
   * Upserts placement seeds for a student. Existing seeds for the same
   * (studentId, nodeId) tuple are replaced.
   */
  upsertPlacementSeeds(
    studentId: string,
    seeds: ReadonlyArray<PlacementKnowledgeStateSeed>,
  ): Promise<void>;
  /** Returns all placement seeds for a student (empty array if none). */
  getPlacementSeeds(studentId: string): Promise<PlacementKnowledgeStateSeed[]>;
  /** Test helper: clear all persisted state. */
  clear(): void;
  /** Test helper: total number of seeds across all students. */
  readonly size: number;
}

export function createInMemoryKnowledgeStateStore(): InMemoryKnowledgeStateStore {
  const byStudent = new Map<string, Map<string, PlacementKnowledgeStateSeed>>();

  return {
    async upsertPlacementSeeds(studentId, seeds) {
      let bucket = byStudent.get(studentId);
      if (!bucket) {
        bucket = new Map();
        byStudent.set(studentId, bucket);
      }
      for (const seed of seeds) {
        bucket.set(seed.nodeId, { ...seed });
      }
    },
    async getPlacementSeeds(studentId) {
      const bucket = byStudent.get(studentId);
      if (!bucket) return [];
      return Array.from(bucket.values()).map((s) => ({ ...s }));
    },
    clear() {
      byStudent.clear();
    },
    get size() {
      let total = 0;
      for (const bucket of byStudent.values()) total += bucket.size;
      return total;
    },
  };
}

// ---------------------------------------------------------------------------
// createMockPlacementResult — convenience re-export style factory
// ---------------------------------------------------------------------------
//
// knowledge-space-core ships its own placement-fixtures with a generic mock
// factory whose default nodeId is a synthetic test ID. IM3 placement seeding
// tests need realistic IM3 node IDs in their PlacementResult fixtures.

const DEFAULT_IM3_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';

export interface MockIm3PlacementResultOverrides {
  nodeId?: string;
  masteryEstimate?: number;
  confidence?: PlacementResult['confidence'];
  metadata?: Record<string, unknown>;
}

export function createMockIm3PlacementResult(
  overrides: MockIm3PlacementResultOverrides = {},
): PlacementResult {
  return {
    nodeId: overrides.nodeId ?? DEFAULT_IM3_NODE_ID,
    masteryEstimate: overrides.masteryEstimate ?? 0.5,
    confidence: overrides.confidence ?? 'low',
    ...(overrides.metadata !== undefined ? { metadata: overrides.metadata } : {}),
  };
}
