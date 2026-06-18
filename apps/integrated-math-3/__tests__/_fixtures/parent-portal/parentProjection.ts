// Phase 2 — Parent Portal test fixtures.
//
// Each fixture is validated against `parentVisualizationV1Schema` at module-load
// time. This guards against fixture drift: a typo in a field name or a missing
// required key throws immediately when the test file imports the fixture, long
// before the assertion runs. The whole point of the v1 schema is to keep the
// parent payload contract a single source of truth; the fixtures are derived
// from it, not from ad-hoc object literals that could silently disagree.
//
// The boundary rule (per spec FR5 + test-strategy §1) is that the UI must
// consume the parent projection payload only — never raw graph state, never
// teacher-only fields. The fixtures therefore include:
//
//   - rich payload (mastered + ready + blocked + review-due nodes, multiple
//     blockers, a real canDoSummary / nextFocus, a real progressTrend).
//   - minimal payload (zero nodes, the empty-graph branch, real schema fields
//     so the v1 Zod parse still succeeds).
//   - per-student fixtures for the multi-student switcher and the
//     cross-student privacy isolation test. The student IDs and node IDs are
//     distinct on purpose so a leakage bug (e.g. a wrong studentId in the
//     payload, or a non-linked student's nodes being rendered) shows up in the
//     snapshot/JSON assertions.

import { parentVisualizationV1Schema } from '@math-platform/knowledge-space-practice';
import type {
  ParentVisualizationV1,
  VisualNodeV1,
} from '@math-platform/knowledge-space-practice';

export type { ParentVisualizationV1, VisualNodeV1 };

// ---------------------------------------------------------------------------
// Node id constants
// ---------------------------------------------------------------------------
// Synthetic, parent-portal-only ids. They are NOT the same as the
// `syntheticMathFixture` ids used by the projection unit tests — using a
// distinct id space here makes it easy to assert that the parent component
// renders these exact ids (and never leaks ids from other fixtures).

export const PARENT_FIXTURE_NODE_ALPHA = 'parent.skill.alpha.quadratics';
export const PARENT_FIXTURE_NODE_BETA = 'parent.skill.beta.polynomials';
export const PARENT_FIXTURE_NODE_GAMMA = 'parent.skill.gamma.functions';
export const PARENT_FIXTURE_NODE_DELTA = 'parent.skill.delta.trig';

// Other-student node id, used by the cross-student privacy test. It must never
// appear in a render of student A's parent dashboard.
export const PARENT_FIXTURE_OTHER_STUDENT_NODE = 'parent.skill.epsilon.calculus';
export const PARENT_FIXTURE_OTHER_STUDENT_ID = 'other_student_profile_id';

// ---------------------------------------------------------------------------
// Minimal payload — covers the empty-graph / no-activity branch (Phase 3 will
// exercise empty+pending states explicitly, but Phase 2 needs the empty
// payload to render the dashboard with zero nodes).
// ---------------------------------------------------------------------------

export const emptyParentProjection: ParentVisualizationV1 = parentVisualizationV1Schema.parse({
  schemaVersion: 'v1',
  canDoSummary: 'No skills mastered yet',
  nextFocus: 'Continue current practice',
  blockers: [],
  progressTrend: 'unknown',
  nodes: [],
});

// ---------------------------------------------------------------------------
// Rich payload — student `student_alpha` has mastered alpha, is ready for
// beta, is blocked on gamma, and has a review due on delta. This is the
// canonical fixture the dashboard tests render against.
// ---------------------------------------------------------------------------

const alphaNodes: VisualNodeV1[] = [
  {
    nodeId: PARENT_FIXTURE_NODE_ALPHA,
    title: 'Quadratic basics',
    state: 'mastered',
  },
  {
    nodeId: PARENT_FIXTURE_NODE_BETA,
    title: 'Polynomials',
    state: 'ready',
  },
  {
    nodeId: PARENT_FIXTURE_NODE_GAMMA,
    title: 'Function composition',
    state: 'blocked',
  },
  {
    nodeId: PARENT_FIXTURE_NODE_DELTA,
    title: 'Trig identities',
    state: 'review_due',
  },
];

export const richParentProjection: ParentVisualizationV1 = parentVisualizationV1Schema.parse({
  schemaVersion: 'v1',
  canDoSummary: 'Can Quadratic basics',
  nextFocus: 'Practice: Polynomials',
  blockers: ['Function composition'],
  progressTrend: 'improving',
  nodes: alphaNodes,
});

// ---------------------------------------------------------------------------
// Per-student fixtures for the multi-student switcher and the cross-student
// privacy isolation test. Each student's payload uses distinct, non-overlapping
// node ids so the privacy tests can prove no leakage between students.
// ---------------------------------------------------------------------------

const betaNodes: VisualNodeV1[] = [
  {
    nodeId: PARENT_FIXTURE_OTHER_STUDENT_NODE,
    title: 'Calculus foundations',
    state: 'mastered',
  },
  {
    nodeId: 'parent.skill.zeta.vectors',
    title: 'Vector basics',
    state: 'ready',
  },
];

export const otherStudentParentProjection: ParentVisualizationV1 = parentVisualizationV1Schema.parse({
  schemaVersion: 'v1',
  canDoSummary: 'Can Calculus foundations',
  nextFocus: 'Practice: Vector basics',
  blockers: [],
  progressTrend: 'stable',
  nodes: betaNodes,
});

// ---------------------------------------------------------------------------
// Payload keyed by student id — convenience for the switcher test. The map's
// shape mirrors what a server-component page would pass to the dashboard
// after consulting `listParentLinks` + per-student projection calls.
// ---------------------------------------------------------------------------

export const parentProjectionsByStudentId: Record<string, ParentVisualizationV1> = {
  student_alpha: richParentProjection,
  student_beta: otherStudentParentProjection,
};

// ---------------------------------------------------------------------------
// Negative fixture — a `teacherVisualizationV1`-shaped object that the privacy
// test will try to leak. The privacy assertions must prove that none of these
// keys (`heatmap`, `bottleneckNodes`, `prerequisiteGaps`,
// `misconceptionClusters`, `interventionGroups`, `standardsCoverage`,
// `activeMisconceptionStudentCount`) ever appear in the parent dashboard's
// rendered output.
// ---------------------------------------------------------------------------

export const TEACHER_ONLY_KEYS = [
  'heatmap',
  'bottleneckNodes',
  'prerequisiteGaps',
  'misconceptionClusters',
  'interventionGroups',
  'standardsCoverage',
  'activeMisconceptionStudentCount',
] as const;

export type TeacherOnlyKey = (typeof TEACHER_ONLY_KEYS)[number];
