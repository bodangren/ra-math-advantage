/**
 * Shared fixtures for the IM3 misconception content authoring track.
 *
 * Phase 1 (Taxonomy Schema & Detection Mapping), Phase 2 (Author Prioritized
 * Content), and Phase 3 (Loop Wiring & Verification) all pull from this file.
 * Keep the data source-grounded (research / curriculum), not invented at the
 * keyboard.
 */

import type { DistractorType } from '@math-platform/math-content/algebraic';
import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
  type PracticeSubmissionPart,
} from '@math-platform/practice-core/contract';
import { toConvexActivityId } from '@math-platform/practice-core';

/**
 * Prioritized IM3 Module 1 + common-algebra skill set the misconception
 * taxonomy must cover. Source: `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
 * (`kind: "skill"` rows) plus the common-algebra prerequisite skills exercised
 * in M1 activities.
 *
 * Phase 2 expands this to the full M1+M2+M3 surface; Phase 1 only requires
 * the M1 + common-algebra set to keep the Red-phase surface bounded.
 */
export const IM3_M1_SKILL_SET: readonly string[] = [
  'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change',
  'math.im3.skill.1.1.graph-quadratic-functions',
  'math.im3.skill.1.2.interpret-solutions-roots-in-context',
  'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
  'math.im3.skill.1.4.recognize-special-factor-patterns-gcf-trinomials-difference',
  'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
  'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
  'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
  'math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables',
  'math.im3.skill.1.7.solve-quadratic-inequalities-in-one-variable-by-graphing',
] as const;

/**
 * The canonical algebraic distractor types available in
 * `packages/math-content/src/algebraic/distractors.ts`. Re-exported here so
 * tests don't need to import from the source package directly (keeps the
 * fixture file as the single source of truth for the supported distractor
 * surface).
 */
export const ALGEBRAIC_DISTRACTOR_TYPES: readonly DistractorType[] = [
  'factoring',
  'linear',
  'quadratic_formula',
  'complex',
  'completing_square',
  'discriminant',
  'system',
] as const;

/**
 * Closed set of categories for the IM3 misconception taxonomy. Aligned with
 * the BM2 taxonomy category set so `aggregateMisconceptionTags` (in
 * `@math-platform/practice-core/error-analysis`) can group IM3 and BM2 tags
 * consistently in the teacher error view.
 */
export const MISCONCEPTION_CATEGORIES = [
  'mechanics',
  'classification',
  'computation',
  'completeness',
] as const;

export type MisconceptionCategory = (typeof MISCONCEPTION_CATEGORIES)[number];

/**
 * Closed set of remediation activity kinds the Phase 2 `remediated_by` edge
 * may point at. Mirrors the kst-srs.v2 §9.1 endpoint pair
 * (`misconception → worked_example | task_blueprint | skill`).
 */
export const REMEDIATION_ACTIVITY_KINDS = [
  'worked_example',
  'task_blueprint',
  'skill',
] as const;

export type RemediationActivityKindFixture =
  (typeof REMEDIATION_ACTIVITY_KINDS)[number];

/**
 * Stub misconception node shape used by the Phase 2 integrity-check edge
 * cases — lets a test construct a synthetic taxonomy entry without coupling
 * to the live `Im3MisconceptionTagDefinition` import path.
 */
export interface MisconceptionNodeFixture {
  slug: string;
  label: string;
  description: string;
  category: MisconceptionCategory;
  affectedSkills: readonly string[];
  detectionSignals: readonly { distractorType: DistractorType; description: string }[];
}

/**
 * Build a synthetic misconception taxonomy node for integrity-check tests.
 * Defaults are intentionally minimal-but-valid so a test can override one
 * field to construct a negative path (e.g., unknown affected skill).
 */
export function makeMisconceptionNode(
  overrides: Partial<MisconceptionNodeFixture> = {},
): MisconceptionNodeFixture {
  return {
    slug: 'test-misconception',
    label: 'Test Misconception',
    description: 'A synthetic misconception used by integrity-check tests.',
    category: 'mechanics',
    affectedSkills: ['math.im3.skill.1.1.graph-quadratic-functions'],
    detectionSignals: [
      {
        distractorType: 'factoring',
        description: 'Synthetic detection signal for integrity-check tests.',
      },
    ],
    ...overrides,
  };
}

/**
 * Stub remediation activity reference used by the Phase 2 integrity-check
 * edge cases — lets a test construct a synthetic `remediated_by` target
 * without coupling to the live `RemediationActivityRef` import path.
 */
export interface RemediationActivityFixture {
  activityId: string;
  activityKind: RemediationActivityKindFixture;
  label: string;
  sourceRef: string;
}

/**
 * Build a synthetic remediation-activity ref pointing at the given
 * `nodeId`. `kind` defaults to `worked_example` because that is the most
 * common pairing in the IM3 M1 curriculum; pass `'skill'` or
 * `'task_blueprint'` to construct the other endpoint variants.
 */
export function makeRemediationActivity(
  nodeId: string,
  overrides: Partial<RemediationActivityFixture> = {},
): RemediationActivityFixture {
  return {
    activityId: nodeId,
    activityKind: 'worked_example',
    label: `Remediation pointing at ${nodeId}`,
    sourceRef:
      'apps/integrated-math-3/__tests__/lib/practice/misconception-content.fixtures.ts',
    ...overrides,
  };
}

/**
 * Default activityId used by `makeAlgebraicSubmission` when none is supplied.
 * Source: a real worked-example activity in the IM3 M1 curriculum.
 */
export const DEFAULT_ALGEBRAIC_ACTIVITY_ID = 'math.im3.example.1.1.001';

/**
 * Build a `PracticeSubmissionEnvelope` (validated against
 * `practiceSubmissionEnvelopeSchema`) seeded with the given misconception tags
 * and per-part answer data. The factory is the single seam for the
 * Phase 3 loop-wiring tests to drive seeded wrong-answer patterns into the
 * T6 mechanism (real or fake) — see `test-strategy.md` §"Shared Fixtures &
 * Mocks".
 *
 * Each `partsSpec` entry produces a `PracticeSubmissionPart` with a
 * unique `partId` and the requested `misconceptionTags`. Pass an empty
 * `misconceptionTags` array for a clean (correct) attempt; pass tags
 * matching the authored taxonomy to drive a wrong-answer pattern.
 */
export interface AlgebraicSubmissionPartSpec {
  partId: string;
  isCorrect: boolean;
  misconceptionTags?: readonly string[];
  hintsUsed?: number;
  revealStepsSeen?: number;
}

export function makeAlgebraicSubmission(
  partsSpec: readonly AlgebraicSubmissionPartSpec[],
  overrides: {
    activityId?: string;
    attemptNumber?: number;
  } = {},
): PracticeSubmissionEnvelope {
  const submittedAt = new Date('2026-06-15T12:00:00.000Z').toISOString();
  const parts: PracticeSubmissionPart[] = partsSpec.map((spec) => ({
    partId: spec.partId,
    rawAnswer: spec.isCorrect ? 'correct' : 'incorrect',
    isCorrect: spec.isCorrect,
    misconceptionTags: spec.misconceptionTags
      ? [...spec.misconceptionTags]
      : [],
    hintsUsed: spec.hintsUsed ?? 0,
    revealStepsSeen: spec.revealStepsSeen ?? 0,
  }));
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: 'practice.v1',
    activityId: toConvexActivityId(overrides.activityId ?? DEFAULT_ALGEBRAIC_ACTIVITY_ID),
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: overrides.attemptNumber ?? 1,
    submittedAt,
    answers: Object.fromEntries(
      partsSpec.map((spec) => [spec.partId, spec.isCorrect ? 'correct' : 'incorrect']),
    ),
    parts,
  });
}

/**
 * N consecutive clean attempts on a misconception's affected skills required
 * to transition the misconception from `active` to `resolved`. Matches the
 * kst-srs.v2 §9.3 lifecycle rule.
 */
export const MISCONCEPTION_LOOP_RESOLUTION_THRESHOLD = 3 as const;