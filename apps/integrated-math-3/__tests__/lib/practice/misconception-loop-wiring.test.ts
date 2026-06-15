/**
 * Phase 3 — Red test for the IM3 T6 loop wiring.
 *
 * Integration test using the fake T6 harness (`misconception-loop.fake.ts`).
 * Per `test-strategy.md` §"Per-Phase Test Approach › Phase 3", the fake
 * intercepts the real T6 mechanism's call site so the wiring logic can
 * be exercised end-to-end without depending on the un-shipped
 * `misconception-loop_20260521` exports. The companion smoke test
 * (`misconception-loop.smoke.test.ts`) imports the REAL T6 exports
 * separately to prevent the fake from masking a broken real T6.
 *
 * What the wiring logic owns (per spec FR5 + kst-srs.v2 §9.3–§9.4):
 *   - Wires the practice.v1 submission envelope into the T6 loop.
 *   - Carries the per-student misconception state across loop calls.
 *   - Surfaces the `detected / active / resolved / injected` result
 *     buckets in the shape the planner + teacher views consume.
 *   - Knows the IM3 `resolutionThreshold` (3 clean attempts on the
 *     affected skills) by default.
 *
 * Source under test (does NOT exist at HEAD; this is the Red signal):
 * `apps/integrated-math-3/lib/practice/misconception-loop-wiring.ts`.
 * The expected public API exposes a `createIm3MisconceptionLoop(t6)`
 * factory that accepts a T6 loop function (the real T6 in production,
 * the fake in this test) and returns `runIm3MisconceptionLoop(input,
 * priorState)`. Dependency injection keeps the fake interception
 * honest — the wiring module cannot accidentally call a not-yet-shipped
 * real T6 in this test, and the companion smoke test catches a broken
 * real T6 at its own import site.
 *
 * The fake's interception is further proven in
 * `misconception-loop.fake.test.ts` (the prompt's "fake mode intercepts
 * the exact command path" rule). This test exercises the wiring
 * module's contract through the fake.
 */

import { describe, expect, it } from 'vitest';

import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

import {
  makeAlgebraicSubmission,
  MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
} from './misconception-content.fixtures';
import {
  fakeT6Loop,
  emptyFakeStudentMisconceptionState,
  type FakeStudentMisconceptionState,
  type FakeT6LoopInput,
  type FakeT6LoopOutput,
} from './misconception-loop.fake';

import {
  createIm3MisconceptionLoop,
  type Im3MisconceptionLoopInput,
  type Im3MisconceptionLoopOutput,
} from '@/lib/practice/misconception-loop-wiring';

const KNOWN_SLUG = 'sign-error-in-factored-form';
const KNOWN_SLUG_2 = 'quadratic-formula-sign-flip';

function buildInput(
  submission: PracticeSubmissionEnvelope,
  overrides: Partial<Im3MisconceptionLoopInput> = {},
): Im3MisconceptionLoopInput {
  return {
    submission,
    studentId: 'student-im3-test',
    resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    ...overrides,
  };
}

type T6LoopFn = (input: FakeT6LoopInput) => FakeT6LoopOutput;

describe('createIm3MisconceptionLoop — factory wiring', () => {
  it('exposes a callable factory that returns a runIm3MisconceptionLoop function', () => {
    expect(typeof createIm3MisconceptionLoop).toBe('function');
    const run = createIm3MisconceptionLoop(fakeT6Loop);
    expect(typeof run).toBe('function');
  });

  it('the returned runner has the expected input/output shape', () => {
    const run = createIm3MisconceptionLoop(fakeT6Loop);
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result: Im3MisconceptionLoopOutput = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    for (const key of [
      'detected',
      'active',
      'resolved',
      'injected',
      'updatedState',
    ] as const) {
      expect(result, `output key '${key}' missing`).toHaveProperty(key);
    }
  });

  it('routes every call through the supplied T6 loop function (interception is provable)', () => {
    let calls = 0;
    const spy: T6LoopFn = (input) => {
      calls += 1;
      return fakeT6Loop(input);
    };
    const run = createIm3MisconceptionLoop(spy);
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    run(buildInput(submission), emptyFakeStudentMisconceptionState());
    expect(calls).toBe(1);
  });
});

describe('createIm3MisconceptionLoop — (a) detection fires on seeded wrong-answer patterns', () => {
  const run = createIm3MisconceptionLoop(fakeT6Loop);

  it('surfaces the seeded misconception slug in `detected`', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    expect(result.detected).toContain(KNOWN_SLUG);
  });

  it('surfaces multiple seeded slugs across multiple parts', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
      { partId: 'p2', isCorrect: false, misconceptionTags: [KNOWN_SLUG_2] },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    expect(new Set(result.detected)).toEqual(
      new Set([KNOWN_SLUG, KNOWN_SLUG_2]),
    );
  });

  it('moves a newly detected slug from inactive to active in the updated state', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    expect(result.active).toContain(KNOWN_SLUG);
    expect(result.updatedState.active).toContain(KNOWN_SLUG);
  });

  it('returns an empty detected list for a clean submission', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    expect(result.detected).toEqual([]);
  });
});

describe('createIm3MisconceptionLoop — (b) active→resolved transition after N clean attempts', () => {
  const run = createIm3MisconceptionLoop(fakeT6Loop);

  it('does NOT resolve a slug on the first clean attempt after a wrong-answer', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG],
      cleanStreaks: { [KNOWN_SLUG]: 0 },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = run(buildInput(submission), prior);
    expect(result.resolved).toEqual([]);
    expect(result.active).toContain(KNOWN_SLUG);
  });

  it('resolves a slug after N consecutive clean attempts (the IM3 threshold)', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG],
      cleanStreaks: {
        [KNOWN_SLUG]: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD - 1,
      },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = run(buildInput(submission), prior);
    expect(result.resolved).toContain(KNOWN_SLUG);
    expect(result.active).not.toContain(KNOWN_SLUG);
    expect(result.updatedState.active).not.toContain(KNOWN_SLUG);
  });

  it('resolves each active slug independently based on its own clean streak', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG, KNOWN_SLUG_2],
      cleanStreaks: {
        [KNOWN_SLUG]: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD - 1,
        [KNOWN_SLUG_2]: 0,
      },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = run(buildInput(submission), prior);
    expect(result.resolved).toEqual([KNOWN_SLUG]);
    expect(result.active).toEqual([KNOWN_SLUG_2]);
  });

  it('a re-detected wrong-answer refreshes the active flag and resets the clean streak', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG],
      cleanStreaks: { [KNOWN_SLUG]: 2 },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result = run(buildInput(submission), prior);
    expect(result.resolved).toEqual([]);
    expect(result.active).toContain(KNOWN_SLUG);
  });
});

describe('createIm3MisconceptionLoop — (c) remediation activity is injected for active misconceptions', () => {
  const run = createIm3MisconceptionLoop(fakeT6Loop);

  it('injects at least one remediated_by activity for a freshly detected active slug', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    expect(result.injected.length).toBeGreaterThan(0);
  });

  it('every injected activity has the expected activity-kind shape', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
      { partId: 'p2', isCorrect: false, misconceptionTags: [KNOWN_SLUG_2] },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    for (const activity of result.injected) {
      expect(typeof activity.activityId).toBe('string');
      expect(activity.activityId.length).toBeGreaterThan(0);
      expect(['worked_example', 'task_blueprint', 'skill']).toContain(
        activity.activityKind,
      );
      expect(typeof activity.label).toBe('string');
    }
  });

  it('returns an empty injection list when no misconception is active', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = run(
      buildInput(submission),
      emptyFakeStudentMisconceptionState(),
    );
    expect(result.injected).toEqual([]);
  });
});

describe('createIm3MisconceptionLoop — error semantics', () => {
  it('propagates errors from the underlying T6 (does not swallow)', () => {
    const exploding: T6LoopFn = () => {
      throw new Error('T6 exploded');
    };
    const run = createIm3MisconceptionLoop(exploding);
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    expect(() =>
      run(buildInput(submission), emptyFakeStudentMisconceptionState()),
    ).toThrow(/T6 exploded/);
  });
});
