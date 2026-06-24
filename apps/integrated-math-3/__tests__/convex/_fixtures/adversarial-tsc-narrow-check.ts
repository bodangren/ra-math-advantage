// TSC assignability check fixture for the Phase 2 FR-6 narrowing.
//
// This file is loaded by `apps/integrated-math-3/__tests__/convex/
// studentVisualizationAdversarial.test.ts` (smoke check) and is
// typechecked by `measure/tracks/code-review-remediation_20260624/
// scripts/adversarial-tests-phase2.sh` (the actual assignability gate).
//
// Purpose:
//   FR-6 narrowed the handler-local learner-state union to
//   `'mastered' | 'ready' | 'blocked'` and passes that narrower
//   type into `projectStudentVisualization`, which still accepts
//   the broader `'mastered' | 'ready' | 'blocked' | 'review_due'`
//   union. The narrowing must be **assignable** — TypeScript allows
//   a narrower type in a position that expects a wider one (covariant
//   record values), but the test-strategy flagged this as worth a
//   tsc-only spot check.
//
// What this file does:
//   1. Loads the full curriculum graph via the shared helper.
//   2. Constructs a learnerState of the HANDLER-LOCAL narrow union
//      type (the same shape as `getStudentVisualizationHandler`
//      in `student.ts` and `parent/visualization.ts`).
//   3. Calls `projectStudentVisualization` with that narrow type.
//   4. Calls `projectParentVisualization` with the same narrow type.
//
// If the narrowing is NOT assignable, `npx tsc --noEmit` will
// report a TS2322 / TS2345 error on the call sites below. The
// runner greps for this filename in the tsc output; any error
// containing `adversarial-tsc-narrow-check.ts` is a failure.
//
// This file is intentionally not a vitest test (it is a pure tsc
// fixture) and is excluded from vitest's include pattern by being
// in `_fixtures/`. It is, however, included in the apps/integrated-
// math-3 tsconfig's ts/tsx glob, so tsc picks it up.

import { projectStudentVisualization, projectParentVisualization } from '@math-platform/knowledge-space-practice';
import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

// Pull the canonical graph once.
const { nodes, edges } = loadFullCurriculumGraph();

// 1. HANDLER-LOCAL narrow union — exactly the shape the handlers use
//    after FR-6. Note: this is the BROADEST observable subset; any
//    further narrowing is also fine, but this matches the actual
//    production annotations at HEAD (aee13927).
const narrowLearnerState: Record<string, 'mastered' | 'ready' | 'blocked'> = {
  'math.im3.skill.1.1.graph-quadratic-functions': 'mastered',
  'math.im3.skill.2.1.graph-and-analyze-polynomial-functions': 'ready',
};

// 2. projectStudentVisualization must accept the narrow union. The
//    downstream signature expects
//    `Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'>`.
//    A narrower value type is assignable to a wider one (covariant
//    Record values), so this MUST typecheck cleanly.
const studentViz = projectStudentVisualization(nodes, edges, narrowLearnerState, {
  activeMisconceptionSlugs: [],
});

// 3. projectParentVisualization takes `Record<string, string>`, so any
//    union-typed record is trivially assignable. This is a smoke
//    call to ensure the parent path also compiles.
const parentViz = projectParentVisualization(nodes, edges, narrowLearnerState);

// Reference the variables so tsc's noUnusedLocals-style checks (if
// enabled) do not flag them. Also force a concrete access of the
// payload shape so tsc exercises the structural types.
const _schemaVersion: 'v1' = studentViz.schemaVersion;
const _canDo: string = parentViz.canDoSummary;

// Suppress "all imports unused" if a stricter config enables it.
export const _adversarialAssignabilityProbed = {
  studentVizSchema: _schemaVersion,
  parentCanDoSummary: _canDo,
  narrowUnionType: typeof narrowLearnerState['math.im3.skill.1.1.graph-quadratic-functions'],
} as const;
