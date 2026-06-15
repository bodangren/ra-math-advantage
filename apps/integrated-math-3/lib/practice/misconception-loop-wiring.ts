/**
 * IM3 misconception loop wiring — bridges the practice.v1 submission
 * envelope into the T6 misconception lifecycle mechanism.
 *
 * Per spec FR5 + kst-srs.v2 §9.3–§9.4, this module:
 *   - Accepts a T6 loop function via dependency injection (real in
 *     production, fake in tests).
 *   - Carries the per-student misconception state across loop calls.
 *   - Surfaces the `detected / active / resolved / injected` result
 *     buckets plus an `updatedState` for the caller to persist.
 *   - Knows the IM3 `resolutionThreshold` default (3 clean attempts).
 *
 * The DI pattern keeps the fake interception honest — the wiring
 * module cannot accidentally call a not-yet-shipped real T6 in tests.
 */

import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

import type { RemediationActivityRef } from './misconception-remediations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Per-student misconception lifecycle state. */
export interface Im3StudentMisconceptionState {
  readonly active: readonly string[];
  readonly cleanStreaks: Record<string, number>;
}

/** Input to the wiring runner. */
export interface Im3MisconceptionLoopInput {
  readonly submission: PracticeSubmissionEnvelope;
  readonly studentId: string;
  readonly resolutionThreshold: number;
}

/** Shape the T6 loop function must satisfy. */
export type T6LoopFunction = (input: {
  submission: PracticeSubmissionEnvelope;
  state: Im3StudentMisconceptionState;
  resolutionThreshold: number;
}) => T6LoopOutput;

/** Output from the T6 loop. */
export interface T6LoopOutput {
  readonly detected: readonly string[];
  readonly active: readonly string[];
  readonly resolved: readonly string[];
  readonly injected: readonly RemediationActivityRef[];
}

/** Output from the wiring runner, augmented with persisted state. */
export interface Im3MisconceptionLoopOutput {
  readonly detected: readonly string[];
  readonly active: readonly string[];
  readonly resolved: readonly string[];
  readonly injected: readonly RemediationActivityRef[];
  readonly updatedState: Im3StudentMisconceptionState;
}

// ---------------------------------------------------------------------------
// Default constants
// ---------------------------------------------------------------------------

/**
 * Default resolution threshold for IM3: 3 consecutive clean attempts
 * on the affected skills to transition a misconception from active to
 * resolved. Matches kst-srs.v2 §9.3.
 */
const IM3_DEFAULT_RESOLUTION_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an IM3 misconception loop runner wired to the given T6
 * mechanism. Dependency injection lets tests supply the fake T6 while
 * production uses the real one.
 *
 * @param t6 - The T6 loop function (real or fake).
 * @returns A `runIm3MisconceptionLoop` function that accepts an input
 *   and prior state, delegates to the T6, and augments the output
 *   with `updatedState`.
 */
export function createIm3MisconceptionLoop(
  t6: T6LoopFunction,
): (
  input: Im3MisconceptionLoopInput,
  priorState: Im3StudentMisconceptionState,
) => Im3MisconceptionLoopOutput {
  return (input, priorState) => {
    const threshold =
      input.resolutionThreshold > 0
        ? input.resolutionThreshold
        : IM3_DEFAULT_RESOLUTION_THRESHOLD;

    const t6Output = t6({
      submission: input.submission,
      state: priorState,
      resolutionThreshold: threshold,
    });

    const updatedState: Im3StudentMisconceptionState = {
      active: [...t6Output.active],
      cleanStreaks: { ...priorState.cleanStreaks },
    };

    return {
      detected: t6Output.detected,
      active: t6Output.active,
      resolved: t6Output.resolved,
      injected: t6Output.injected,
      updatedState,
    };
  };
}
