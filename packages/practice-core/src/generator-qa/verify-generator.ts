/**
 * Generator verification harness.
 *
 * Runs a set of correctness checks against a generator and produces a
 * structured report.  This module is domain-neutral — math-specific
 * oracles belong in math-content/app.
 */

import type { GeneratorCorrectnessContract } from './contract';

// ── Types ────────────────────────────────────────────────────────────

export interface VerifyGeneratorOptions {
  /** Number of seeds to test (default: 1). */
  readonly numSeeds?: number;
  /** Optional domain oracle that validates output beyond structural checks. */
  readonly oracle?: (output: GeneratorCorrectnessContract) => boolean;
}

export interface VerifyGeneratorCheck {
  /** Human-readable check name. */
  readonly name: string;
  /** Whether this check passed. */
  readonly passed: boolean;
  /** Optional detail message. */
  readonly message?: string;
}

export interface VerifyGeneratorError {
  /** Which check produced this error. */
  readonly checkName: string;
  /** Human-readable description of the failure. */
  readonly message: string;
}

export interface VerifyGeneratorSummary {
  /** Total checks executed. */
  readonly totalChecks: number;
  /** Checks that passed. */
  readonly passedChecks: number;
  /** Checks that failed. */
  readonly failedChecks: number;
}

export interface VerifyGeneratorReport {
  /** Overall verdict: "pass" if every check passed, "fail" otherwise. */
  readonly verdict: 'pass' | 'fail';
  /** Individual check results. */
  readonly checks: VerifyGeneratorCheck[];
  /** Failures extracted from checks. */
  readonly errors: VerifyGeneratorError[];
  /** Aggregate counts. */
  readonly summary: VerifyGeneratorSummary;
}

// ── Generator interface (structural, domain-neutral) ─────────────────

export interface GeneratorLike<TOutput = unknown> {
  generate(input: {
    readonly nodeId: string;
    readonly seed: number;
    readonly difficulty: number;
    readonly learnerContext?: Readonly<Record<string, unknown>>;
  }): TOutput;
}

// ── Helpers ──────────────────────────────────────────────────────────

function runDeterminismCheck(gen: GeneratorLike<unknown>, numSeeds: number): VerifyGeneratorCheck {
  for (let i = 0; i < numSeeds; i++) {
    const input = { nodeId: 'test-node', seed: i, difficulty: 1 };
    const a = gen.generate(input);
    const b = gen.generate(input);
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      return {
        name: 'determinism',
        passed: false,
        message: `Non-deterministic output for seed ${i}`,
      };
    }
  }
  return { name: 'determinism', passed: true };
}

// ── Public API ───────────────────────────────────────────────────────

export function verifyGenerator(
  gen: GeneratorLike<unknown>,
  opts: VerifyGeneratorOptions = {},
): VerifyGeneratorReport {
  const numSeeds = opts.numSeeds ?? 1;
  const checks: VerifyGeneratorCheck[] = [];

  // Determinism check (always runs)
  checks.push(runDeterminismCheck(gen, numSeeds));

  const errors: VerifyGeneratorError[] = checks
    .filter((c) => !c.passed)
    .map((c) => ({
      checkName: c.name,
      message: c.message ?? `${c.name} check failed`,
    }));

  const passedChecks = checks.filter((c) => c.passed).length;

  return {
    verdict: errors.length === 0 ? 'pass' : 'fail',
    checks,
    errors,
    summary: {
      totalChecks: checks.length,
      passedChecks,
      failedChecks: checks.length - passedChecks,
    },
  };
}
