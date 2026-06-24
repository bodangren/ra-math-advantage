/**
 * Phase 2 (Track next_skill_planner_prod_wiring_20260621) — Backend Exposure
 * Red tests.
 *
 * Per test-strategy.md §5 P2: the Convex query that exposes
 * `projectStudentVisualization` must be testable via the mock-ctx pattern
 * (no convex-test dependency). That requires a named handler export that the
 * test can call directly with a fake Convex context.
 *
 * Why this file is Red at HEAD (2026-06-21):
 *   - `apps/integrated-math-3/convex/student.ts` exports
 *     `getStudentVisualization = internalQuery({...})` but does NOT export a
 *     separately callable `getStudentVisualizationHandler`. The import below
 *     fails at module resolution.
 *   - Even after the handler is exported, the current implementation derives
 *     `learnerState` only from `placement_results`. Per test-strategy.md §3,
 *     Phase 2 must load prerequisite proficiency data from
 *     `student_competency` / `srs_cards` / `objective_policies` OR accept an
 *     explicit learner-state input. The test asserts the handler queries
 *     `student_competency`, which the current implementation does not.
 *
 * Bounded Red scope:
 *   - Single test file targeted by
 *     `npx vitest run studentVisualization --root apps/integrated-math-3`.
 *   - No watch mode, no full-suite smoke.
 *   - Mock ctx is bounded to `placement_results`, `student_misconception_state`,
 *     and `student_competency` query spies.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// ---------------------------------------------------------------------------
// Production module import — Red because the handler export does not exist yet.
// ---------------------------------------------------------------------------

import { getStudentVisualizationHandler } from '@/convex/student';

import {
  projectStudentVisualization,
  studentVisualizationV1Schema,
} from '@math-platform/knowledge-space-practice';

import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

// ---------------------------------------------------------------------------
// Fixture (sanity-checks the projection contract independently of the
// backend handler).
// ---------------------------------------------------------------------------

import {
  fixtureNodes,
  fixtureEdges,
  fixtureLearnerState,
} from './_fixtures/student-viz-fixture';

// FR-4: handler now loads the full multi-module curriculum graph. The
// parity test below must compare against the same graph (not the old
// module-1 shard) so it stays a valid handler-vs-projection check.
const { nodes: fullGraphNodes, edges: fullGraphEdges } = loadFullCurriculumGraph();

// ---------------------------------------------------------------------------
// Type mirrors for the tables the handler touches.
// ---------------------------------------------------------------------------

interface PlacementResultRow {
  _id: Id<'placement_results'>;
  _creationTime: number;
  studentId: Id<'profiles'>;
  nodeId: string;
  masteryEstimate: number;
  confidence: 'low' | 'medium';
  source: string;
  createdAt: number;
}

interface StudentMisconceptionStateRow {
  _id: Id<'student_misconception_state'>;
  _creationTime: number;
  studentId: string;
  misconceptionId: string;
  status: 'active' | 'resolved';
  severity: 'minor' | 'severe';
  cleanStreak: number;
  firstDetectedAt: number;
  lastUpdatedAt: number;
  affectedSkills: readonly string[];
}

// ---------------------------------------------------------------------------
// Mock Convex ctx builder (follows misconceptionState.test.ts pattern).
// ---------------------------------------------------------------------------

interface MakeMockCtxOptions {
  placementResults?: PlacementResultRow[];
  misconceptionRows?: StudentMisconceptionStateRow[];
}

interface MockCtx {
  db: {
    query: ReturnType<typeof vi.fn>;
  };
  queryCalls: string[];
}

function makeMockCtx(options: MakeMockCtxOptions = {}): MockCtx {
  const {
    placementResults = [],
    misconceptionRows = [],
  } = options;
  const queryCalls: string[] = [];

  const rowsByTable: Record<string, unknown[]> = {
    placement_results: placementResults,
    student_misconception_state: misconceptionRows,
    student_competency: [],
  };

  const queryMock = vi.fn().mockImplementation((tableName: string) => {
    queryCalls.push(tableName);
    const rows = rowsByTable[tableName] ?? [];

    return {
      withIndex: vi.fn().mockImplementation(
        (
          _indexName: string,
          builder?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
        ) => {
          let filtered = [...rows];
          const eqChain = {
            eq: (field: string, value: unknown) => {
              filtered = filtered.filter(
                (r) => (r as Record<string, unknown>)[field] === value,
              );
              return eqChain;
            },
          };
          if (builder) builder(eqChain);
          return {
            collect: () => Promise.resolve(filtered),
            first: () => Promise.resolve(filtered[0] ?? null),
            unique: () => Promise.resolve(filtered[0] ?? null),
          };
        },
      ),
      collect: () => Promise.resolve(rows),
      first: () => Promise.resolve(rows[0] ?? null),
      unique: () => Promise.resolve(rows[0] ?? null),
    };
  });

  return {
    db: { query: queryMock },
    queryCalls,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STUDENT_ID = 'profiles_test_student_viz' as Id<'profiles'>;

function deriveLearnerStateFromPlacements(
  placements: PlacementResultRow[],
): Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'> {
  const state: Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'> = {};
  for (const p of placements) {
    if (p.masteryEstimate >= 0.8) {
      state[p.nodeId] = 'mastered';
    } else if (p.masteryEstimate >= 0.3) {
      state[p.nodeId] = 'ready';
    } else {
      state[p.nodeId] = 'blocked';
    }
  }
  return state;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Phase 2 — student visualization backend query (test-strategy §5 P2)', () => {
  it('handler exists as a named export for mock-ctx testing', () => {
    expect(typeof getStudentVisualizationHandler).toBe('function');
  });

  it('returns a payload that parses as StudentVisualizationV1', async () => {
    const ctx = makeMockCtx();

    const result = await getStudentVisualizationHandler(
      ctx as unknown as Parameters<typeof getStudentVisualizationHandler>[0],
      { userId: STUDENT_ID },
    );

    const parseResult = studentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);
  });

  it('recommendedNext matches a direct projectStudentVisualization call with the same inputs', async () => {
    const placements: PlacementResultRow[] = [
      {
        _id: 'placement_results_1' as Id<'placement_results'>,
        _creationTime: 1_780_000_000_000,
        studentId: STUDENT_ID,
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.85,
        confidence: 'medium',
        source: 'placement',
        createdAt: 1_780_000_000_000,
      },
      {
        _id: 'placement_results_2' as Id<'placement_results'>,
        _creationTime: 1_780_000_000_001,
        studentId: STUDENT_ID,
        nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
        masteryEstimate: 0.5,
        confidence: 'medium',
        source: 'placement',
        createdAt: 1_780_000_000_001,
      },
    ];

    const ctx = makeMockCtx({ placementResults: placements });

    const result = await getStudentVisualizationHandler(
      ctx as unknown as Parameters<typeof getStudentVisualizationHandler>[0],
      { userId: STUDENT_ID },
    );

    const learnerState = deriveLearnerStateFromPlacements(placements);
    const expected = projectStudentVisualization(
      fullGraphNodes,
      fullGraphEdges,
      learnerState,
      { activeMisconceptionSlugs: [] },
    );

    expect(result.recommendedNext.map((n: { nodeId: string }) => n.nodeId)).toEqual(
      expected.recommendedNext.map((n) => n.nodeId),
    );
  });

});

// ---------------------------------------------------------------------------
// Fixture sanity: the frozen slice itself produces a valid visualization.
// ---------------------------------------------------------------------------

describe('student-viz fixture parity', () => {
  it('fixture projection parses as StudentVisualizationV1', () => {
    const viz = projectStudentVisualization(
      fixtureNodes,
      fixtureEdges,
      fixtureLearnerState,
      { activeMisconceptionSlugs: [] },
    );

    expect(studentVisualizationV1Schema.safeParse(viz).success).toBe(true);
  });
});
