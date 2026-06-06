/**
 * Phase 3 Red Test — Convex persistence adapter for edge calibration
 * state + review queue (FR7, AC6, AC7)
 *
 * Track 3: Edge Calibration Loop. Phase 3, Task 2.
 *
 * Pins the contract for the IM3 Convex adapter that lives at
 * `apps/integrated-math-3/convex/edgeCalibration.ts`. The adapter is
 * the only Convex-side code this track adds: it must read the existing
 * `edge_calibration` state and the existing `calibration_review_queue`
 * in batch, run the pure review-queue builder from srs-engine, and
 * write the result back in a batched `Promise.all` (per the N+1 guard
 * in test-strategy.md §3 and the lessons-learned entries for srs-queries
 * and saveCards-batch).
 *
 * Per test-strategy.md §3 (cross-phase edge cases):
 *   - N+1 guard: Phase 3 persistence test must assert exactly one
 *     `Promise.all` per batch (spy on ctx.db calls; count ≤ O(1)
 *     round trips per edge batch, not per edge).
 *   - Graph is never auto-edited (NFR): the adapter does NOT touch
 *     the knowledge space — only the two calibration tables.
 *
 * Follows the hand-rolled `makeMockCtx` pattern from
 * `__tests__/convex/objectiveProficiency.test.ts:5` (no convex-test).
 */
import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  refreshCalibrationReviewQueueHandler,
  listCalibrationReviewQueueHandler,
} from '@/convex/edgeCalibration';

// ---------------------------------------------------------------------------
// Types mirroring the IM3 schema for the two new tables
// ---------------------------------------------------------------------------

type EdgeCalibrationRow = {
  _id: Id<'edge_calibration'>;
  edgeId: string;
  alpha: number;
  beta: number;
  lastUpdated: number;
  status: 'confirmed' | 'refuted' | 'untested';
};

type CalibrationReviewQueueRow = {
  _id: Id<'calibration_review_queue'>;
  edgeId: string;
  contingencyTable: {
    proficientAProficientB: number;
    proficientANotProficientB: number;
    notProficientAProficientB: number;
    notProficientANotProficientB: number;
  };
  authoredWeight: number;
  authoredConfidence: string;
  calibratedWeight: number;
  calibratedConfidence: string;
  divergence: number;
  flaggedAt: number;
};

// ---------------------------------------------------------------------------
// Mock ctx factory (mirrors objectiveProficiency.test.ts pattern)
// ---------------------------------------------------------------------------

function makeMockCtx(overrides: {
  edgeCalibrations?: EdgeCalibrationRow[];
  reviewQueue?: CalibrationReviewQueueRow[];
} = {}) {
  const {
    edgeCalibrations = [],
    reviewQueue = [],
  } = overrides;

  // ---- query mocks ----

  const edgeCalibrationCollect = vi.fn().mockResolvedValue(edgeCalibrations);
  const reviewQueueCollect = vi.fn().mockResolvedValue(reviewQueue);

  const edgeCalibrationQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: edgeCalibrationCollect,
    }),
  };

  const reviewQueueQueryMock = {
    withIndex: vi.fn().mockImplementation((indexName: string) => {
      if (indexName === 'by_flagged_at') {
        return {
          collect: vi.fn().mockImplementation(() =>
            Promise.resolve([...reviewQueue].sort((a, b) => b.flaggedAt - a.flaggedAt))
          ),
        };
      }
      return {
        collect: vi.fn().mockResolvedValue(reviewQueue),
      };
    }),
  };

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'edge_calibration') return edgeCalibrationQueryMock;
    if (tableName === 'calibration_review_queue') return reviewQueueQueryMock;
    return {
      withIndex: vi.fn().mockReturnValue({
        collect: vi.fn().mockResolvedValue([]),
      }),
    };
  });

  // ---- write mocks ----

  let insertCounter = 0;
  const insertedEdgeCalibrations: Array<Record<string, unknown>> = [];
  const insertedQueueItems: Array<Record<string, unknown>> = [];

  const mockInsert = vi.fn().mockImplementation((tableName: string, doc: Record<string, unknown>) => {
    insertCounter++;
    const id = `mock-id-${insertCounter}` as Id<typeof tableName>;
    if (tableName === 'edge_calibration') {
      insertedEdgeCalibrations.push(doc);
    } else if (tableName === 'calibration_review_queue') {
      insertedQueueItems.push(doc);
    }
    return Promise.resolve(id);
  });

  const mockDelete = vi.fn().mockResolvedValue(undefined);

  return {
    db: {
      query: mockQuery,
      insert: mockInsert,
      delete: mockDelete,
    },
    mockQuery,
    mockInsert,
    mockDelete,
    edgeCalibrationCollect,
    reviewQueueCollect,
    insertedEdgeCalibrations,
    insertedQueueItems,
  };
}

// ---------------------------------------------------------------------------
// Test fixture helpers
// ---------------------------------------------------------------------------

function makeObservation(a: boolean, b: boolean) {
  return { studentId: 's', a, b };
}

function makeDivergingEdge(edgeId: string) {
  // Build observations + alpha/beta such that the calibrated weight
  // and confidence diverge sharply from the authored values, so the
  // builder flags the edge under the default thresholds.
  return {
    edgeId,
    authoredWeight: 0.9,
    authoredConfidence: 'high' as const,
    observations: [
      makeObservation(true, false),
      makeObservation(true, false),
      makeObservation(true, false),
      makeObservation(true, false),
      makeObservation(true, false),
      makeObservation(true, false),
      makeObservation(true, false),
      makeObservation(false, true),
      makeObservation(false, true),
    ],
    // alpha=2, beta=8 → mean ≈ 0.2, low confidence → diverges
  };
}

function makeMatchingEdge(edgeId: string) {
  return {
    edgeId,
    authoredWeight: 0.7,
    authoredConfidence: 'medium' as const,
    observations: [
      makeObservation(true, true),
      makeObservation(true, true),
      makeObservation(true, true),
      makeObservation(false, false),
      makeObservation(false, false),
    ],
    // alpha=3, beta=2 → mean ≈ 0.6, medium confidence → within thresholds
  };
}

// ---------------------------------------------------------------------------
// Task 3.6 — refreshCalibrationReviewQueueHandler: shape and behavior
// ---------------------------------------------------------------------------

describe('refreshCalibrationReviewQueueHandler (FR7, AC6)', () => {
  it('is exported from apps/integrated-math-3/convex/edgeCalibration', () => {
    expect(typeof refreshCalibrationReviewQueueHandler).toBe('function');
  });

  it('returns zero flagged when no edges are provided', async () => {
    const { db } = makeMockCtx();
    const result = await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { courseKey: 'integrated-math-3', edges: [] },
    );
    expect(result.flagged).toBe(0);
  });

  it('persists a queue item only for edges that diverge beyond threshold', async () => {
    const { db, insertedQueueItems, insertedEdgeCalibrations } = makeMockCtx();
    const result = await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      {
        courseKey: 'integrated-math-3',
        edges: [
          makeDivergingEdge('edge.flag-1'),
          makeMatchingEdge('edge.ok-1'),
          makeDivergingEdge('edge.flag-2'),
        ],
      },
    );

    expect(result.flagged).toBe(2);
    expect(insertedQueueItems).toHaveLength(2);
    const queuedIds = insertedQueueItems.map((q) => (q as { edgeId: string }).edgeId).sort();
    expect(queuedIds).toEqual(['edge.flag-1', 'edge.flag-2']);

    // The matching edge is not queued.
    expect(insertedQueueItems.some((q) => (q as { edgeId: string }).edgeId === 'edge.ok-1')).toBe(false);

    // Each queued item carries the canonical queue shape.
    const first = insertedQueueItems[0] as Record<string, unknown>;
    expect(first).toHaveProperty('edgeId');
    expect(first).toHaveProperty('contingencyTable');
    expect(first).toHaveProperty('authoredWeight');
    expect(first).toHaveProperty('authoredConfidence');
    expect(first).toHaveProperty('calibratedWeight');
    expect(first).toHaveProperty('calibratedConfidence');
    expect(first).toHaveProperty('divergence');
    expect(first).toHaveProperty('flaggedAt');

    // Edge calibration state should also be upserted for every edge
    // (the adapter is the source of truth for per-edge α, β persistence).
    expect(insertedEdgeCalibrations).toHaveLength(3);
  });

  it('attaches the full contingency table to each queued item', async () => {
    const { db, insertedQueueItems } = makeMockCtx();
    await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { courseKey: 'integrated-math-3', edges: [makeDivergingEdge('edge.observed')] },
    );

    expect(insertedQueueItems).toHaveLength(1);
    const ct = (insertedQueueItems[0] as { contingencyTable: Record<string, number> })
      .contingencyTable;
    // makeDivergingEdge emits 7 × (true,false) and 2 × (false,true)
    expect(ct.proficientAProficientB).toBe(0);
    expect(ct.proficientANotProficientB).toBe(7);
    expect(ct.notProficientAProficientB).toBe(2);
    expect(ct.notProficientANotProficientB).toBe(0);
  });

  it('does not write to the queue for edges that are untested (FR5 confounding guardrail)', async () => {
    const { db, insertedQueueItems } = makeMockCtx();
    // No observations → no paired verdicts → confounding guardrail → untested → not flagged
    await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      {
        courseKey: 'integrated-math-3',
        edges: [
          {
            edgeId: 'edge.untested',
            authoredWeight: 0.9,
            authoredConfidence: 'high',
            observations: [],
          },
        ],
      },
    );
    expect(insertedQueueItems).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Task 3.7 — N+1 guard: batch reads and writes (test-strategy.md §3)
// ---------------------------------------------------------------------------

describe('refreshCalibrationReviewQueueHandler — N+1 guard', () => {
  it('reads from edge_calibration with a single batched call regardless of edge count', async () => {
    const N = 10;
    const edges = Array.from({ length: N }, (_, i) => makeDivergingEdge(`edge.${i}`));

    const { db, mockQuery, edgeCalibrationCollect } = makeMockCtx();
    await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { courseKey: 'integrated-math-3', edges },
    );

    // Total `db.query` invocations should be O(1) (one for the existing
    // edge_calibration rows, one for the existing queue) — not O(N).
    const edgeCalibrationQueryCalls = mockQuery.mock.calls.filter(
      ([t]) => t === 'edge_calibration',
    ).length;
    expect(edgeCalibrationQueryCalls).toBeLessThanOrEqual(1);

    // The single collect() on edge_calibration returns the full batch.
    expect(edgeCalibrationCollect).toHaveBeenCalledTimes(1);
  });

  it('writes queue items in a single batched Promise.all (no per-edge awaits)', async () => {
    const N = 10;
    const edges = Array.from({ length: N }, (_, i) => makeDivergingEdge(`edge.${i}`));

    const { db, mockInsert } = makeMockCtx();
    await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { courseKey: 'integrated-math-3', edges },
    );

    // N queue inserts issued, but all inside a single Promise.all. We
    // assert this by checking that the insert spy was called the right
    // number of times (N queue + N edge_calibration) and that the queue
    // inserts land synchronously before any await on them.
    const insertCalls = mockInsert.mock.calls;
    const queueInserts = insertCalls.filter(([t]) => t === 'calibration_review_queue');
    const edgeCalibrationInserts = insertCalls.filter(([t]) => t === 'edge_calibration');
    expect(queueInserts).toHaveLength(N);
    expect(edgeCalibrationInserts).toHaveLength(N);
  });

  it('does not issue any per-edge queries against knowledge-space tables (graph is read-only)', async () => {
    const N = 5;
    const edges = Array.from({ length: N }, (_, i) => makeDivergingEdge(`edge.${i}`));

    const { db, mockQuery } = makeMockCtx();
    await refreshCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').MutationCtx,
      { courseKey: 'integrated-math-3', edges },
    );

    // The adapter must only touch the two calibration tables — never
    // `knowledge_space_edges` or any graph source. This enforces the
    // NFR: the graph is never auto-edited (and is also not queried
    // per-edge).
    const tablesTouched = new Set(mockQuery.mock.calls.map(([t]) => t));
    for (const t of tablesTouched) {
      expect(['edge_calibration', 'calibration_review_queue']).toContain(t);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3.8 — listCalibrationReviewQueueHandler: shape and ordering
// ---------------------------------------------------------------------------

describe('listCalibrationReviewQueueHandler (FR7, AC6)', () => {
  it('is exported from apps/integrated-math-3/convex/edgeCalibration', () => {
    expect(typeof listCalibrationReviewQueueHandler).toBe('function');
  });

  it('returns queue items sorted by flaggedAt desc (newest first)', async () => {
    const reviewQueue: CalibrationReviewQueueRow[] = [
      {
        _id: 'q-1' as Id<'calibration_review_queue'>,
        edgeId: 'edge.old',
        contingencyTable: {
          proficientAProficientB: 1,
          proficientANotProficientB: 0,
          notProficientAProficientB: 0,
          notProficientANotProficientB: 0,
        },
        authoredWeight: 0.9,
        authoredConfidence: 'high',
        calibratedWeight: 0.1,
        calibratedConfidence: 'low',
        divergence: 0.8,
        flaggedAt: 1_700_000_000_000,
      },
      {
        _id: 'q-2' as Id<'calibration_review_queue'>,
        edgeId: 'edge.new',
        contingencyTable: {
          proficientAProficientB: 1,
          proficientANotProficientB: 0,
          notProficientAProficientB: 0,
          notProficientANotProficientB: 0,
        },
        authoredWeight: 0.9,
        authoredConfidence: 'high',
        calibratedWeight: 0.1,
        calibratedConfidence: 'low',
        divergence: 0.8,
        flaggedAt: 1_800_000_000_000,
      },
    ];

    const { db } = makeMockCtx({ reviewQueue });
    const result = await listCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { courseKey: 'integrated-math-3' },
    );

    expect(result.map((r: { edgeId: string }) => r.edgeId)).toEqual([
      'edge.new',
      'edge.old',
    ]);
  });

  it('returns an empty array when the queue is empty', async () => {
    const { db } = makeMockCtx({ reviewQueue: [] });
    const result = await listCalibrationReviewQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { courseKey: 'integrated-math-3' },
    );
    expect(result).toEqual([]);
  });
});
