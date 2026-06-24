/**
 * FR-4 Red — Multi-module projection tests.
 *
 * These tests assert that `getStudentVisualizationHandler` and
 * `projectParentVisualizationHandler` produce output containing nodes from
 * more than one module when placements span modules.
 *
 * At HEAD (pre-fix), both handlers statically import only
 * `module-1/{nodes,edges}.json`. A placement in module 2 will produce a
 * `learnerState` entry for a module-2 nodeId, but the projection will
 * filter it out because the module-2 node is not in the loaded graph.
 * Therefore `modulesSeen.size` will be 1 (only module 1), and the
 * module-2 nodeId will be absent from `result.nodes`.
 *
 * Red assertion: `modulesSeen.size >= 2` AND the specific module-2 nodeId
 * is present. Both FAIL at HEAD.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import { readFileSync } from 'node:fs';
import path from 'path';

import { getStudentVisualizationHandler } from '@/convex/student';
import { projectParentVisualizationHandler } from '@/convex/parent/visualization';

import {
  multiModulePlacementRows,
  STUDENT_ID,
} from './_fixtures/multi-module-placements';

// ---------------------------------------------------------------------------
// Mock Convex ctx (student handler)
// Reuses the pattern from studentVisualization.test.ts.
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

function makeStudentMockCtx(placements: PlacementResultRow[] = []) {
  const rowsByTable: Record<string, unknown[]> = {
    placement_results: placements,
    student_misconception_state: [],
    student_competency: [],
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

// ---------------------------------------------------------------------------
// Mock Convex ctx (parent handler)
// The parent handler also needs `parent_links` query and `profiles` get.
// ---------------------------------------------------------------------------

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

const PARENT_ID = 'profiles_test_parent' as Id<'profiles'>;

function makeParentMockCtx(placements: PlacementResultRow[] = []) {
  const parentLinks: ParentLinkRow[] = [
    {
      _id: 'parent_links_1' as Id<'parent_links'>,
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
    const all = [...profiles];
    return Promise.resolve(all.find((r) => r._id === id) ?? null);
  });

  return {
    db: { query: queryMock, get: getMock },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FR-4 — student projection loads all modules', () => {
  it('includes nodes from >1 module when placements span modules', async () => {
    const ctx = makeStudentMockCtx(multiModulePlacementRows);
    const result = await getStudentVisualizationHandler(
      ctx as unknown as Parameters<typeof getStudentVisualizationHandler>[0],
      { userId: STUDENT_ID },
    );

    // StudentVisualizationV1 partitions nodes into separate buckets
    // (mastered/ready/blocked/reviewDue/recommendedNext); gather all of
    // them for the modulesSeen count.
    const nodeIds: string[] = [
      ...result.mastered.map((n: { nodeId: string }) => n.nodeId),
      ...result.ready.map((n: { nodeId: string }) => n.nodeId),
      ...result.blocked.map((n: { nodeId: string }) => n.nodeId),
      ...result.reviewDue.map((n: { nodeId: string }) => n.nodeId),
      ...result.recommendedNext.map((n: { nodeId: string }) => n.nodeId),
    ];
    const modulesSeen = new Set(
      nodeIds
        .filter((id: string) => id.startsWith('math.im3.skill.'))
        .map((id: string) => id.split('.')[3]),
    );

    // Core assertion: the output must contain nodes from at least 2 modules.
    // At HEAD, only module-1 nodes are loaded, so this will be 1 → FAIL.
    expect(modulesSeen.size).toBeGreaterThanOrEqual(2);
    expect(modulesSeen).toContain('1');
    expect(modulesSeen).toContain('2');
  });

  it('contains the specific module-2 node from the placement', async () => {
    const ctx = makeStudentMockCtx(multiModulePlacementRows);
    const result = await getStudentVisualizationHandler(
      ctx as unknown as Parameters<typeof getStudentVisualizationHandler>[0],
      { userId: STUDENT_ID },
    );

    const nodeIds: string[] = [
      ...result.mastered.map((n: { nodeId: string }) => n.nodeId),
      ...result.ready.map((n: { nodeId: string }) => n.nodeId),
      ...result.blocked.map((n: { nodeId: string }) => n.nodeId),
      ...result.reviewDue.map((n: { nodeId: string }) => n.nodeId),
      ...result.recommendedNext.map((n: { nodeId: string }) => n.nodeId),
    ];
    // At HEAD, this node is not in the graph → absent from output → FAIL.
    expect(nodeIds).toContain(
      'math.im3.skill.2.1.graph-and-analyze-polynomial-functions',
    );
  });
});

describe('FR-4 — parent projection loads all modules', () => {
  it('includes nodes from >1 module when placements span modules', async () => {
    const ctx = makeParentMockCtx(multiModulePlacementRows);
    const result = await projectParentVisualizationHandler(
      ctx as unknown as Parameters<typeof projectParentVisualizationHandler>[0],
      { studentId: STUDENT_ID, parentProfileId: PARENT_ID },
    );

    const nodeIds = result.nodes.map((n: { nodeId: string }) => n.nodeId);
    const modulesSeen = new Set(
      nodeIds
        .filter((id: string) => id.startsWith('math.im3.skill.'))
        .map((id: string) => id.split('.')[3]),
    );

    // Same assertion: at HEAD, only module-1 → FAIL.
    expect(modulesSeen.size).toBeGreaterThanOrEqual(2);
    expect(modulesSeen).toContain('1');
    expect(modulesSeen).toContain('2');
  });

  it('contains the specific module-2 node from the placement', async () => {
    const ctx = makeParentMockCtx(multiModulePlacementRows);
    const result = await projectParentVisualizationHandler(
      ctx as unknown as Parameters<typeof projectParentVisualizationHandler>[0],
      { studentId: STUDENT_ID, parentProfileId: PARENT_ID },
    );

    const nodeIds = result.nodes.map((n: { nodeId: string }) => n.nodeId);
    expect(nodeIds).toContain(
      'math.im3.skill.2.1.graph-and-analyze-polynomial-functions',
    );
  });
});

describe('FR-4 — architecture lint: no module-1-only imports in production handlers', () => {
  it('student.ts does not import module-1/*.json', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../../convex/student.ts'),
      'utf-8',
    );
    // At HEAD, line 15-16: `import module1NodesJson from "../curriculum/skill-graph/module-1/nodes.json"`
    // This assertion FAILS at HEAD.
    expect(src).not.toMatch(/skill-graph\/module-1\//);
  });

  it('parent/visualization.ts does not import module-1/*.json', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../../convex/parent/visualization.ts'),
      'utf-8',
    );
    // At HEAD, line 48-49: `import module1NodesJson from '../../curriculum/skill-graph/module-1/nodes.json'`
    // This assertion FAILS at HEAD.
    expect(src).not.toMatch(/skill-graph\/module-1\//);
  });
});
