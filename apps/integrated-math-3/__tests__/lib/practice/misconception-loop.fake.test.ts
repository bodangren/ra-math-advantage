/**
 * Phase 3 — Red direct unit test for the `fakeT6Loop` harness.
 *
 * Per the prompt's "fake mode intercepts the exact command path" rule, the
 * fake must be proven to work in isolation before the wiring test depends
 * on it. These tests exercise `fakeT6Loop` against seeded
 * `PracticeSubmissionEnvelope` fixtures and assert the four output
 * buckets (detected, active, resolved, injected) without touching the
 * real (not-yet-shipped) T6 mechanism.
 *
 * Source under test: `misconception-loop.fake.ts` — exists at HEAD; this
 * test passes once the fake is correctly written and fails on a buggy
 * implementation.
 */

import { describe, expect, it } from 'vitest';

import {
  IM3_MISCONCEPTION_TAGS,
  type Im3MisconceptionTagSlug,
} from '@/lib/practice/misconception-taxonomy';
import { IM3_MISCONCEPTION_REMEDIATIONS } from '@/lib/practice/misconception-remediations';

import {
  fakeT6Loop,
  emptyFakeStudentMisconceptionState,
  fakeT6RecognizedSlugs,
  type FakeStudentMisconceptionState,
} from './misconception-loop.fake';

import {
  makeAlgebraicSubmission,
  MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
} from './misconception-content.fixtures';

const KNOWN_SLUG = 'sign-error-in-factored-form';
const KNOWN_SLUG_2 = 'quadratic-formula-sign-flip';

describe('fakeT6Loop — detection step', () => {
  it('returns an empty detected list for a clean submission with no tags', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = fakeT6Loop({
      submission,
      state: emptyFakeStudentMisconceptionState(),
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.detected).toEqual([]);
  });

  it('collects every canonical IM3 tag from parts[*].misconceptionTags, deduped', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
      { partId: 'p2', isCorrect: false, misconceptionTags: [KNOWN_SLUG, KNOWN_SLUG_2] },
    ]);
    const result = fakeT6Loop({
      submission,
      state: emptyFakeStudentMisconceptionState(),
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(new Set(result.detected)).toEqual(new Set([KNOWN_SLUG, KNOWN_SLUG_2]));
    expect(result.detected.length).toBe(2);
  });

  it('ignores tags that are not canonical IM3 taxonomy entries', () => {
    const submission = makeAlgebraicSubmission([
      {
        partId: 'p1',
        isCorrect: false,
        misconceptionTags: ['not-an-im3-tag', KNOWN_SLUG, 'another-fake'],
      },
    ]);
    const result = fakeT6Loop({
      submission,
      state: emptyFakeStudentMisconceptionState(),
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.detected).toEqual([KNOWN_SLUG]);
  });

  it('exposes a recognized-slug set that matches the live IM3 taxonomy', () => {
    expect(fakeT6RecognizedSlugs().size).toBe(
      Object.keys(IM3_MISCONCEPTION_TAGS).length,
    );
  });
});

describe('fakeT6Loop — transition step (active lifecycle)', () => {
  it('moves a newly detected slug from inactive to active', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result = fakeT6Loop({
      submission,
      state: emptyFakeStudentMisconceptionState(),
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.active).toContain(KNOWN_SLUG);
  });

  it('preserves pre-existing active slugs that are not detected in this submission', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG_2],
      cleanStreaks: { [KNOWN_SLUG_2]: 0 },
    };
    const result = fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.active).toEqual(
      expect.arrayContaining([KNOWN_SLUG, KNOWN_SLUG_2]),
    );
  });

  it('resets a detected active slug\'s clean streak (a fresh wrong-answer refreshes the flag)', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG],
      cleanStreaks: { [KNOWN_SLUG]: 2 },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    const result = fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.active).toContain(KNOWN_SLUG);
    expect(result.resolved).not.toContain(KNOWN_SLUG);
  });

  it('is a pure function — does not mutate the input state', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG_2],
      cleanStreaks: { [KNOWN_SLUG_2]: 1 },
    };
    const snapshot = JSON.stringify(prior);
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: false, misconceptionTags: [KNOWN_SLUG] },
    ]);
    fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(JSON.stringify(prior)).toBe(snapshot);
  });
});

describe('fakeT6Loop — resolve step (N consecutive clean attempts)', () => {
  it('does NOT resolve a slug on the first clean attempt after a wrong-answer', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG],
      cleanStreaks: { [KNOWN_SLUG]: 0 },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.resolved).toEqual([]);
    expect(result.active).toContain(KNOWN_SLUG);
  });

  it('resolves a slug after N consecutive clean attempts (the threshold)', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG],
      cleanStreaks: { [KNOWN_SLUG]: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD - 1 },
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.resolved).toContain(KNOWN_SLUG);
    expect(result.active).not.toContain(KNOWN_SLUG);
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
    const result = fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.resolved).toEqual([KNOWN_SLUG]);
    expect(result.active).toEqual([KNOWN_SLUG_2]);
  });
});

describe('fakeT6Loop — inject step (remediation routing)', () => {
  it('returns the union of remediated_by activities for every post-transition active slug', () => {
    const prior: FakeStudentMisconceptionState = {
      active: [KNOWN_SLUG, KNOWN_SLUG_2],
      cleanStreaks: {},
    };
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = fakeT6Loop({
      submission,
      state: prior,
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    const expectedIds = new Set<string>();
    for (const slug of [KNOWN_SLUG, KNOWN_SLUG_2] satisfies Im3MisconceptionTagSlug[]) {
      for (const rem of IM3_MISCONCEPTION_REMEDIATIONS[slug] ?? []) {
        expectedIds.add(rem.activityId);
      }
    }
    const actualIds = new Set(result.injected.map((r) => r.activityId));
    expect(actualIds).toEqual(expectedIds);
  });

  it('returns an empty injection list when no misconception is active', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    const result = fakeT6Loop({
      submission,
      state: emptyFakeStudentMisconceptionState(),
      resolutionThreshold: MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD,
    });
    expect(result.injected).toEqual([]);
  });
});

describe('fakeT6Loop — input validation', () => {
  it('throws on a non-positive resolution threshold', () => {
    const submission = makeAlgebraicSubmission([
      { partId: 'p1', isCorrect: true },
    ]);
    expect(() =>
      fakeT6Loop({
        submission,
        state: emptyFakeStudentMisconceptionState(),
        resolutionThreshold: 0,
      }),
    ).toThrow();
  });
});
