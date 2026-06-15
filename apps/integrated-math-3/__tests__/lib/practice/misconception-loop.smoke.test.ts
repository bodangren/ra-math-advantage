/**
 * Phase 3 — Red bounded non-fake smoke test for the real T6 mechanism.
 *
 * Per `test-strategy.md` §"Per-Phase Test Approach › Phase 3" and the
 * "Bounded non-fake smoke test" rule, this file imports the REAL T6
 * exports from the dep track (`misconception-loop_20260521`) so a
 * broken real T6 cannot be masked by the `fakeT6Loop` harness the
 * wiring tests use.
 *
 * Scope (deliberately narrow):
 *   (a) the function exists and has the expected `function` type
 *       (i.e., the export shipped, with the right name and arity),
 *   (b) calling it with a minimal valid input does not throw.
 *
 * It does NOT assert behavioral correctness (active/resolved
 * transition, remediation injection, rating-cap rule, etc.). Those
 * assertions live in the `misconception-loop_20260521` track's own
 * tests — we are the smoke gate, not the unit-test suite.
 *
 * The current HEAD has no T6 exports (the dep track's phases are all
 * `[ ]`), so this file is expected to fail at module-resolution time
 * for the duration of the dep track. It is **intentionally red** —
 * see `test-strategy.md` §"Intentionally-Red Test Files" — and goes
 * green when the dep track ships its `remediated_by` edge type,
 * lifecycle engine, and rating-cap reconciliation exports.
 *
 * The import path is the planned location based on the existing
 * `knowledge-space-practice` package surface
 * (`packages/knowledge-space-practice/src/misconception-loop.ts`,
 * re-exported from the package root). Green phase may update the
 * import path if the dep track lands at a different path, as long as
 * the exported function keeps the name `runRealT6Loop` (or this file
 * is updated to match).
 */

import { describe, expect, it } from 'vitest';

import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

import {
  makeAlgebraicSubmission,
  MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
} from './misconception-content.fixtures';

interface MinimalStudentMisconceptionState {
  active: readonly string[];
  cleanStreaks: Record<string, number>;
}

interface MinimalT6LoopInput {
  submission: PracticeSubmissionEnvelope;
  state: MinimalStudentMisconceptionState;
  resolutionThreshold: number;
}

const REAL_T6_PATH =
  '@math-platform/knowledge-space-practice/misconception-loop';

describe('real T6 mechanism — bounded smoke gate', () => {
  it('exports `runRealT6Loop` as a function from the planned dep-track path', async () => {
    const mod = await import(REAL_T6_PATH);
    expect(mod).toBeDefined();
    expect(typeof mod.runRealT6Loop).toBe('function');
  });

  it('does not throw when called with a minimal valid input', async () => {
    const { runRealT6Loop } = await import(REAL_T6_PATH);
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const state: MinimalStudentMisconceptionState = {
      active: [],
      cleanStreaks: {},
    };
    const input: MinimalT6LoopInput = {
      submission,
      state,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    };
    expect(() => runRealT6Loop(input)).not.toThrow();
  });

  it('returns an object with the four output buckets (no shape assertion beyond existence)', async () => {
    const { runRealT6Loop } = await import(REAL_T6_PATH);
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const input: MinimalT6LoopInput = {
      submission,
      state: { active: [], cleanStreaks: {} },
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    };
    const result = runRealT6Loop(input);
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
  });
});
