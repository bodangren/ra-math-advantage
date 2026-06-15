/**
 * Fake T6 misconception-loop harness for the IM3 Phase 3 loop-wiring tests.
 *
 * The real T6 mechanism (`misconception-loop_20260521` track) is not yet
 * shipped. Per `test-strategy.md` §"Per-Phase Test Approach › Phase 3" and
 * the "Fake harness covers runner plumbing only" rule, the loop-wiring
 * tests inject THIS fake into the IM3 wiring module via `vi.mock(...)` so
 * the wiring logic can be exercised end-to-end without depending on the
 * un-shipped real T6.
 *
 * The smoke test (`misconception-loop.smoke.test.ts`) imports the REAL
 * T6 exports separately so a broken real T6 cannot be masked by this
 * fake.
 *
 * **Design rule (per the prompt):** this fake intercepts the exact call
 * site. The wiring test asserts the wiring module imports
 * `@math-platform/knowledge-space-practice/misconception-loop` (the
 * planned real-T6 path) and the fake replaces THAT module so the wiring
 * module's call is intercepted. See `misconception-loop-wiring.test.ts`
 * for the `vi.mock` setup that proves the interception.
 */

import { getDistractorTypesForMisconception } from '@/lib/practice/misconception-mapping';
import {
  IM3_MISCONCEPTION_TAGS,
  isCanonicalIm3MisconceptionTag,
} from '@/lib/practice/misconception-taxonomy';
import {
  IM3_MISCONCEPTION_REMEDIATIONS,
  type RemediationActivityRef,
} from '@/lib/practice/misconception-remediations';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';

/**
 * Per-student misconception lifecycle state, as it would be persisted by
 * the real T6 mechanism. Tracks:
 *   - `active`: slugs currently flagged active
 *   - `cleanStreaks`: per-slug consecutive clean-attempt counter
 *     (a clean attempt is a part with that slug's tag in the
 *     `affectedSkills` list, where the answer was correct AND no
 *     misconception tags were emitted)
 *   - `resolved`: slugs that have transitioned to resolved during this
 *     run (a snapshot of the just-resolved set; persisted resolved
 *     slugs are the caller's responsibility).
 */
export interface FakeStudentMisconceptionState {
  active: readonly string[];
  cleanStreaks: Record<string, number>;
}

/**
 * Input to the fake T6 loop. Mirrors the shape the real T6 is expected to
 * accept (per kst-srs.v2 §9.3 + §9.4): a submission, the student's
 * current misconception state, and the resolution threshold.
 */
export interface FakeT6LoopInput {
  submission: PracticeSubmissionEnvelope;
  state: FakeStudentMisconceptionState;
  resolutionThreshold: number;
}

/**
 * Output of the fake T6 loop. Mirrors the shape the real T6 is expected
 * to return: detected tags, post-transition active set, just-resolved
 * tags, and the remediation activities to inject for the planner.
 */
export interface FakeT6LoopOutput {
  /** Tags surfaced from the submission's `parts[*].misconceptionTags`. */
  detected: readonly string[];
  /** Slugs that are `active` after the transition step. */
  active: readonly string[];
  /** Slugs that just transitioned from `active` to `resolved`. */
  resolved: readonly string[];
  /**
   * Remediation activities to inject for every active misconception,
   * in registry order. Empty when no misconception is active.
   */
  injected: readonly RemediationActivityRef[];
}

const ALL_TAXONOMY_SLUGS: ReadonlySet<string> = new Set(
  Object.keys(IM3_MISCONCEPTION_TAGS),
);

/**
 * The fake T6 mechanism.
 *
 * Steps (in order):
 *   1. Detect — collect every canonical IM3 tag from the submission's
 *      parts[*].misconceptionTags, deduped, in the order they appear.
 *   2. Transition — for every detected tag:
 *        - If the student has no active record, mark it `active` and
 *          reset the clean streak.
 *        - Otherwise, leave it active and reset the streak (a
 *          wrong-answer pattern refreshes the active flag).
 *   3. Resolve — for every slug currently `active` that did NOT
 *      appear in this submission's detected tags, increment the clean
 *      streak. When the streak meets the resolution threshold, move
 *      the slug from `active` to `resolved` and reset its streak.
 *   4. Inject — collect every `remediated_by` activity for the
 *      post-transition `active` set, in registry order.
 *
 * Pure function — does not mutate `input.state`. Returns a fresh
 * `FakeT6LoopOutput`.
 */
export function fakeT6Loop(input: FakeT6LoopInput): FakeT6LoopOutput {
  const { submission, state, resolutionThreshold } = input;

  if (!Number.isInteger(resolutionThreshold) || resolutionThreshold < 1) {
    throw new Error(
      `fakeT6Loop: resolutionThreshold must be a positive integer (got ${resolutionThreshold})`,
    );
  }

  const detectedSet = new Set<string>();
  for (const part of submission.parts) {
    for (const tag of part.misconceptionTags ?? []) {
      if (ALL_TAXONOMY_SLUGS.has(tag)) {
        detectedSet.add(tag);
      }
    }
  }
  const detected = Array.from(detectedSet);

  const activeSet = new Set<string>(state.active);
  const cleanStreaks: Record<string, number> = { ...state.cleanStreaks };

  for (const slug of detected) {
    activeSet.add(slug);
    cleanStreaks[slug] = 0;
  }

  const resolved: string[] = [];
  for (const slug of activeSet) {
    if (detectedSet.has(slug)) continue;
    const current = cleanStreaks[slug] ?? 0;
    const next = current + 1;
    cleanStreaks[slug] = next;
    if (next >= resolutionThreshold) {
      resolved.push(slug);
    }
  }
  for (const slug of resolved) {
    activeSet.delete(slug);
    cleanStreaks[slug] = 0;
  }

  const injected: RemediationActivityRef[] = [];
  for (const slug of Array.from(activeSet).sort()) {
    const remediations = IM3_MISCONCEPTION_REMEDIATIONS[slug] ?? [];
    for (const rem of remediations) {
      injected.push(rem);
    }
  }

  return {
    detected,
    active: Array.from(activeSet).sort(),
    resolved: resolved.sort(),
    injected,
  };
}

/**
 * Build an empty per-student misconception state. Convenience helper for
 * the wiring tests so the first wrong-answer submission starts from a
 * clean slate.
 */
export function emptyFakeStudentMisconceptionState(): FakeStudentMisconceptionState {
  return { active: [], cleanStreaks: {} };
}

/**
 * Returns the canonical IM3 taxonomy slug set the fake recognizes.
 * Exposed so the wiring test can assert interception (the fake only
 * recognizes IM3 tags, matching the wiring module's scope).
 */
export function fakeT6RecognizedSlugs(): ReadonlySet<string> {
  return ALL_TAXONOMY_SLUGS;
}

/**
 * Re-export a few IM3 taxonomy helpers the wiring test imports via the
 * fake's namespace — proves the wiring module's runtime data is
 * consistent with the fake's classification logic (a
 * `mapDistractorToMisconception` output is recognized by the fake).
 */
export { getDistractorTypesForMisconception, isCanonicalIm3MisconceptionTag };
