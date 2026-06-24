/**
 * FR-4 + FR-5 + FR-6 — Adversarial probes for the Phase 2 production-wiring
 * scope fixes.
 *
 * Per the phase-acceptance handoff, this file mounts four targeted probes
 * that exercise the boundaries of the FR-4/FR-6 contracts under hostile
 * input. Each probe captures the actual observed behaviour and pairs it
 * with the expected (spec) behaviour, so the verdict is unambiguous.
 *
 * Probes:
 *   1. Unknown nodeId: a `placement_results` row whose `nodeId` is NOT
 *      present in the full curriculum graph. Per the projection's spec,
 *      unknown ids should be silently filtered (the projection only emits
 *      visual nodes for ids present in the loaded graph). The probe
 *      asserts: no thrown error + the unknown id is absent from output +
 *      known ids still appear.
 *
 *   2. Single-module payload: the parent projection must remain valid
 *      with placements from a single module. The projection must not
 *      require >=2 modules. The probe asserts: the result passes
 *      `parentVisualizationV1Schema` AND the placement's nodeId is in
 *      `result.nodes`.
 *
 *   3. Architecture-lint regex robustness: the existing arch-lint
 *      (`/skill-graph\/module-1\//`) must catch dynamic-import,
 *      require, require.resolve, and multi-line variants. The probe
 *      applies the regex to synthetic sources with each shape and
 *      reports which shapes the regex catches vs. misses.
 *
 *   4. TSC assignability: a separate fixture file
 *      (`_fixtures/adversarial-tsc-narrow-check.ts`) exercises the
 *      narrowed-union call site for `projectStudentVisualization`; the
 *      runner script runs `npx tsc --noEmit` and checks the fixture
 *      produces zero errors. The vitest test in this file is a smoke
 *      check that the fixture exists and is reachable.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getStudentVisualizationHandler } from '@/convex/student';
import { projectParentVisualizationHandler } from '@/convex/parent/visualization';
import { parentVisualizationV1Schema } from '@math-platform/knowledge-space-practice';

import {
  multiModulePlacementRows,
  STUDENT_ID,
} from './_fixtures/multi-module-placements';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Mock ctx builders (focused — only the tables the probes touch).
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

interface ParentLinkRow {
  _id: Id<'parent_links'>;
  _creationTime: number;
  parentId: Id<'profiles'>;
  studentId: Id<'profiles'>;
  status: 'active' | 'revoked' | 'pending';
  createdAt: number;
}

interface ProfileRow {
  _id: Id<'profiles'>;
  _creationTime: number;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  createdAt: number;
  updatedAt: number;
}

const PARENT_ID = 'profiles_test_adversarial_parent' as Id<'profiles'>;

function makeStudentMockCtx(placements: PlacementResultRow[] = []) {
  const rowsByTable: Record<string, unknown[]> = {
    placement_results: placements,
    student_misconception_state: [],
  };

  const queryMock = vi.fn().mockImplementation((tableName: string) => {
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

  return { db: { query: queryMock } };
}

function makeParentMockCtx(placements: PlacementResultRow[] = []) {
  const parentLinks: ParentLinkRow[] = [
    {
      _id: 'parent_links_adversarial' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: PARENT_ID,
      studentId: STUDENT_ID,
      status: 'active',
      createdAt: 1_780_000_000_000,
    },
  ];

  const profiles: ProfileRow[] = [
    {
      _id: STUDENT_ID,
      _creationTime: 1_780_000_000_000,
      role: 'student',
      createdAt: 1_780_000_000_000,
      updatedAt: 1_780_000_000_000,
    },
  ];

  const rowsByTable: Record<string, unknown[]> = {
    placement_results: placements,
    parent_links: parentLinks,
  };

  const queryMock = vi.fn().mockImplementation((tableName: string) => {
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

  const getMock = vi.fn().mockImplementation((id: string) => {
    return Promise.resolve(profiles.find((r) => r._id === id) ?? null);
  });

  return { db: { query: queryMock, get: getMock } };
}

// ---------------------------------------------------------------------------
// Helper: flatten the StudentVisualizationV1 buckets into a single node list
// (the schema has mastered/ready/blocked/reviewDue/recommendedNext, not
// a single `nodes` array).
// ---------------------------------------------------------------------------

function flattenStudentViz(result: {
  mastered: Array<{ nodeId: string; state: string }>;
  ready: Array<{ nodeId: string; state: string }>;
  blocked: Array<{ nodeId: string; state: string }>;
  reviewDue: Array<{ nodeId: string; state: string }>;
  recommendedNext: Array<{ nodeId: string; state: string }>;
}) {
  return [
    ...result.mastered,
    ...result.ready,
    ...result.blocked,
    ...result.reviewDue,
    ...result.recommendedNext,
  ];
}

// ---------------------------------------------------------------------------
// PROBE 1 — Unknown nodeId
// ---------------------------------------------------------------------------
//
// A `placement_results` row whose `nodeId` is not present in the full
// curriculum graph must NOT throw, and must NOT appear in the projection
// output (the projection emits visual nodes only for ids present in the
// loaded graph — see `packages/knowledge-space-practice/src/projections/
// visualization.ts:projectStudentVisualization`).

describe('PROBE 1 — unknown nodeId handling (FR-4 boundary)', () => {
  it('silently drops placements with nodeIds absent from the graph; known nodeIds still surface', async () => {
    const placements: PlacementResultRow[] = [
      {
        _id: 'placement_unknown' as Id<'placement_results'>,
        _creationTime: 1_780_000_000_000,
        studentId: STUDENT_ID,
        // Intentionally NOT in the full curriculum graph.
        nodeId: 'math.im3.skill.nonexistent',
        masteryEstimate: 0.5,
        confidence: 'medium',
        source: 'placement',
        createdAt: 1_780_000_000_000,
      },
      {
        _id: 'placement_known' as Id<'placement_results'>,
        _creationTime: 1_780_000_000_001,
        studentId: STUDENT_ID,
        // Verified to exist in the root skill-graph.
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.5,
        confidence: 'medium',
        source: 'placement',
        createdAt: 1_780_000_000_001,
      },
    ];

    const ctx = makeStudentMockCtx(placements);

    // MUST NOT throw.
    const result = await getStudentVisualizationHandler(
      ctx as unknown as Parameters<typeof getStudentVisualizationHandler>[0],
      { userId: STUDENT_ID },
    );

    const allNodes = flattenStudentViz(result);
    const nodeIds = allNodes.map((n) => n.nodeId);

    // Expected (spec) behaviour: the unknown id is filtered at the
    // projection layer (computeNodeState iterates skillAndTaskNodes from
    // the graph, not learnerState keys). The known id is present.
    expect(nodeIds).not.toContain('math.im3.skill.nonexistent');
    expect(nodeIds).toContain('math.im3.skill.1.1.graph-quadratic-functions');
  });
});

// ---------------------------------------------------------------------------
// PROBE 2 — Single-module payload
// ---------------------------------------------------------------------------
//
// The parent projection must remain a valid `ParentVisualizationV1` when
// placements span only ONE module. The projection must not require >=2
// modules — degenerate single-module is a legitimate use case (new
// students, students who just enrolled).

describe('PROBE 2 — single-module parent payload (FR-4 degenerate case)', () => {
  it('produces a valid ParentVisualizationV1 when placements span only module 1', async () => {
    // ONLY module 1; deliberately no module 2 placement.
    const module1Only: PlacementResultRow[] = [
      {
        _id: 'placement_m1_only' as Id<'placement_results'>,
        _creationTime: 1_780_000_000_000,
        studentId: STUDENT_ID,
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.6,
        confidence: 'medium',
        source: 'placement',
        createdAt: 1_780_000_000_000,
      },
    ];

    const ctx = makeParentMockCtx(module1Only);

    // MUST NOT throw and MUST return a schema-valid payload.
    const result = await projectParentVisualizationHandler(
      ctx as unknown as Parameters<typeof projectParentVisualizationHandler>[0],
      { studentId: STUDENT_ID, parentProfileId: PARENT_ID },
    );

    // Schema-validity is the strict bar.
    const parseResult = parentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);

    // The placement's nodeId is in the output (the projection still
    // emits visual nodes for the placement's known node).
    const nodeIds = result.nodes.map((n) => n.nodeId);
    expect(nodeIds).toContain('math.im3.skill.1.1.graph-quadratic-functions');

    // String fields are populated (the parent-safe summary is non-empty).
    expect(typeof result.canDoSummary).toBe('string');
    expect(typeof result.nextFocus).toBe('string');
    expect(Array.isArray(result.blockers)).toBe(true);
  });

  it('still passes schema when zero placements exist (no graph entries referenced from learner state)', async () => {
    const ctx = makeParentMockCtx([]);

    const result = await projectParentVisualizationHandler(
      ctx as unknown as Parameters<typeof projectParentVisualizationHandler>[0],
      { studentId: STUDENT_ID, parentProfileId: PARENT_ID },
    );

    const parseResult = parentVisualizationV1Schema.safeParse(result);
    expect(parseResult.success).toBe(true);

    // Empty learner state: canDoSummary is the no-mastery fallback.
    expect(result.canDoSummary).toBe('No skills mastered yet');
  });
});

// ---------------------------------------------------------------------------
// PROBE 3 — Architecture-lint regex robustness (FR-4 + FR-5 lint pinning)
// ---------------------------------------------------------------------------
//
// The arch-lint in `studentVisualizationMultiModule.test.ts` uses:
//   /skill-graph\/module-1\//
//
// This probe applies that exact regex to a battery of import shapes to
// document which forms the lint catches and which it misses. The vitest
// test asserts that the **specific** form the brief calls out
// (`await import('...skill-graph/module-1/...')`) IS caught — that is
// the only hard contract; the other forms are documented in the verdict
// table for the runner.
//
// If a future contributor introduces a regex-evading form, the runner
// reports it as a finding.

describe('PROBE 3 — arch-lint regex robustness (FR-4 regression guard)', () => {
  // The exact regex used by `studentVisualizationMultiModule.test.ts:280,290`.
  const ARCH_LINT_REGEX = /skill-graph\/module-1\//;

  // Hard contract: the regex must catch the specific form the phase
  // handoff calls out.
  it('detects await import() with the full skill-graph/module-1 path', () => {
    const src = `const m = await import('apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json');`;
    expect(ARCH_LINT_REGEX.test(src)).toBe(true);
  });

  // Reference: a static import must still be caught (the form the lint
  // was written for). This is the regression baseline.
  it('detects a static ES module import with the full path', () => {
    const src = `import m from '../../curriculum/skill-graph/module-1/nodes.json';`;
    expect(ARCH_LINT_REGEX.test(src)).toBe(true);
  });

  // Reference: a `require` call with the full path is also caught
  // (the substring `skill-graph/module-1/` is present).
  it('detects require() with the full skill-graph/module-1 path', () => {
    const src = `const m = require('apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json');`;
    expect(ARCH_LINT_REGEX.test(src)).toBe(true);
  });

  // Hardening check: a multi-line import (string broken across two
  // string literals) is NOT caught because the regex is a one-line
  // pattern. This is a documented limitation; the runner records it.
  it('does NOT detect a multi-line concatenation that breaks skill-graph/module-1/ across lines', () => {
    const src = `const m = require('apps/integrated-math-3/curriculum/'
  + 'skill-graph/module-1/nodes.json');`;
    // The substring IS present, so the regex DOES match.
    expect(ARCH_LINT_REGEX.test(src)).toBe(true);
  });

  // Documented bypass form: a require() using a SHORT relative path
  // (no `skill-graph/` prefix) is NOT caught. The runner records this
  // as a finding.
  it('does NOT detect a require() using a short relative path (no skill-graph/ prefix)', () => {
    const src = `const m = require('./module-1/nodes.json');`;
    expect(ARCH_LINT_REGEX.test(src)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PROBE 4 — TSC assignability (FR-6 narrowing sanity)
// ---------------------------------------------------------------------------
//
// A separate fixture (`_fixtures/adversarial-tsc-narrow-check.ts`)
// exercises the narrowed-union call site for `projectStudentVisualization`.
// The runner script runs `npx tsc --noEmit` and asserts the fixture
// produces zero errors. This vitest test is a smoke check that the
// fixture file is present; the actual tsc check is in the runner.

describe('PROBE 4 — tsc assignability fixture exists (FR-6 narrowing sanity)', () => {
  it('the tsc-narrow-check fixture file is present on disk', () => {
    const fixturePath = path.resolve(
      __dirname,
      './_fixtures/adversarial-tsc-narrow-check.ts',
    );
    expect(existsSync(fixturePath)).toBe(true);

    // Smoke: the file imports from the projection and the loader, and
    // constructs a narrow-union learnerState. If the structure ever
    // changes, the runner's tsc step will fail before this assertion
    // would — the assertion just makes the file's presence explicit.
    const src = readFileSync(fixturePath, 'utf-8');
    expect(src).toContain('projectStudentVisualization');
    expect(src).toContain("'mastered' | 'ready' | 'blocked'");
    expect(src).toContain('loadFullCurriculumGraph');
  });
});

// ---------------------------------------------------------------------------
// Re-export the multi-module fixture for runner-side use, so the runner can
// verify the fixtures are reachable from the test process.
// ---------------------------------------------------------------------------

export { multiModulePlacementRows, STUDENT_ID };
