// Failing tests for Phase 4 — Task 1: Wire the IM3 new-student placement flow.
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §5, Phase 4:
//   - Convex mutation: valid placement input → persisted knowledge state
//   - Idempotency: calling twice with same student ID yields same state
//   - Guard: student with existing knowledge state → skip placement
//   - Routing: new-student flow triggers placement; returning student does not
//
// Per spec.md FR6 + AC5: IM3 new-student placement flow persists the
// initial knowledge state via a Convex mutation backed by the
// `placement_results` table (see convex/schema.ts:716).
//
// These tests target the Convex-layer handlers in
//   apps/integrated-math-3/convex/placement.ts
// that do not exist yet (Red phase). The pure orchestrator that lives
// in lib/placement/placement-flow.ts is covered by
//   __tests__/lib/placement/placement-flow.test.ts
// This file is concerned with the Convex wiring:
//   - seedPlacementResultsHandler: idempotent persistence
//   - hasPlacementResultsHandler:    guard query
//   - getStudentPlacementResultsHandler: read query
//
// The mock ctx pattern follows the existing __tests__/convex/study.test.ts
// and __tests__/convex/dev.test.ts conventions.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates
//   apps/integrated-math-3/convex/placement.ts
// exporting seedPlacementResultsHandler, hasPlacementResultsHandler,
// and getStudentPlacementResultsHandler.
import {
  seedPlacementResultsHandler,
  hasPlacementResultsHandler,
  getStudentPlacementResultsHandler,
} from '@/convex/placement';

// ---------------------------------------------------------------------------
// Types — mirror the convex schema for placement_results
// ---------------------------------------------------------------------------

type PlacementResultRow = {
  _id: Id<'placement_results'>;
  _creationTime: number;
  studentId: Id<'profiles'>;
  nodeId: string;
  masteryEstimate: number;
  confidence: 'low' | 'medium';
  source: string;
  createdAt: number;
};

// ---------------------------------------------------------------------------
// Mock Convex ctx builder
// ---------------------------------------------------------------------------
//
// Mirrors the existing makeMockCtx pattern in study.test.ts and dev.test.ts.
// Provides a tiny in-memory `placement_results` table with the three
// indexes the schema declares: by_student, by_student_and_node,
// by_student_and_createdAt.

interface PlacementResultsQueryMock {
  withIndex: ReturnType<typeof vi.fn>;
}

interface MakeMockCtxOptions {
  placementResults?: PlacementResultRow[];
}

interface MockCtx {
  db: {
    query: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  placementResultsQueryMock: PlacementResultsQueryMock;
  placementResults: PlacementResultRow[];
  insertSpy: ReturnType<typeof vi.fn>;
}

function makeMockCtx(options: MakeMockCtxOptions = {}): MockCtx {
  const { placementResults: initial = [] } = options;
  const placementResults: PlacementResultRow[] = [...initial];
  let insertIdCounter = 1;

  const placementResultsQueryMock: PlacementResultsQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (
        indexName: string,
        builder?: (q: {
          eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown };
        }) => unknown,
      ) => {
        let filtered: PlacementResultRow[] = [...placementResults];
        const eqChain = {
          eq: (field: string, value: unknown) => {
            filtered = filtered.filter((d) => (d as unknown as Record<string, unknown>)[field] === value);
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
  };

  const insertSpy = vi.fn().mockImplementation(
    (table: string, doc: Record<string, unknown>) => {
      const id = `placement_results_${insertIdCounter++}` as Id<'placement_results'>;
      if (table === 'placement_results') {
        placementResults.push({ _id: id, ...doc } as PlacementResultRow);
      }
      return Promise.resolve(id);
    },
  );

  const ctx: MockCtx = {
    db: {
      query: vi.fn().mockImplementation((tableName: string) => {
        if (tableName === 'placement_results') {
          return placementResultsQueryMock;
        }
        return {
          withIndex: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue([]),
        };
      }),
      insert: insertSpy,
      get: vi.fn().mockImplementation((id: string) => {
        const found = placementResults.find((d) => d._id === id);
        return Promise.resolve(found ?? null);
      }),
      patch: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    placementResultsQueryMock,
    placementResults,
    insertSpy,
  };
  return ctx;
}

const STUDENT_A = 'student-im3-a' as Id<'profiles'>;
const STUDENT_B = 'student-im3-b' as Id<'profiles'>;
const FIXED_NOW_MS = 1_780_000_000_000;

function makeArgs(studentId: Id<'profiles'>) {
  return {
    studentId,
    results: [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.85,
        confidence: 'medium' as const,
      },
      {
        nodeId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
        masteryEstimate: 0.15,
        confidence: 'low' as const,
      },
      {
        nodeId: 'math.im3.skill.2.3.multiply-polynomials',
        masteryEstimate: 0.4,
        confidence: 'low' as const,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Task 4.2.a — seedPlacementResultsHandler: persistence + idempotency
// ---------------------------------------------------------------------------

describe('seedPlacementResultsHandler — persistence + idempotency', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('inserts one row per PlacementResult into the placement_results table', async () => {
    const args = makeArgs(STUDENT_A);
    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);

    expect(ctx.insertSpy).toHaveBeenCalledTimes(args.results.length);
    for (const r of args.results) {
      expect(ctx.insertSpy).toHaveBeenCalledWith('placement_results', expect.objectContaining({
        studentId: STUDENT_A,
        nodeId: r.nodeId,
        masteryEstimate: r.masteryEstimate,
        confidence: r.confidence,
      }));
    }
  });

  it('persists createdAt from the supplied "now" timestamp', async () => {
    const args = makeArgs(STUDENT_A);
    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], { ...args, now: FIXED_NOW_MS });

    for (const call of ctx.insertSpy.mock.calls) {
      expect(call[1]).toMatchObject({ createdAt: FIXED_NOW_MS });
    }
  });

  it('defaults createdAt to Date.now() when "now" is not provided', async () => {
    const before = Date.now();
    const args = makeArgs(STUDENT_A);
    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);
    const after = Date.now();

    for (const call of ctx.insertSpy.mock.calls) {
      const createdAt = (call[1] as { createdAt: number }).createdAt;
      expect(createdAt).toBeGreaterThanOrEqual(before);
      expect(createdAt).toBeLessThanOrEqual(after);
    }
  });

  it('tags every persisted row with source="placement"', async () => {
    const args = makeArgs(STUDENT_A);
    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);

    for (const call of ctx.insertSpy.mock.calls) {
      expect(call[1]).toMatchObject({ source: 'placement' });
    }
  });

  it('returns an array of inserted row ids, one per PlacementResult', async () => {
    const args = makeArgs(STUDENT_A);
    const result = await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);

    expect(result).toBeDefined();
    expect(result.persistedIds).toHaveLength(args.results.length);
    for (const id of result.persistedIds) {
      expect(id).toMatch(/^placement_results_/);
    }
  });

  it('isolates rows by studentId (different students get separate inserts)', async () => {
    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], makeArgs(STUDENT_A));
    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], {
      ...makeArgs(STUDENT_B),
      results: [
        {
          nodeId: 'math.im3.skill.9.1.convert-between-degree-and-radian-measures',
          masteryEstimate: 0.6,
          confidence: 'medium' as const,
        },
      ],
    });

    const aInserts = ctx.insertSpy.mock.calls.filter(
      (c) => (c[1] as { studentId: Id<'profiles'> }).studentId === STUDENT_A,
    );
    const bInserts = ctx.insertSpy.mock.calls.filter(
      (c) => (c[1] as { studentId: Id<'profiles'> }).studentId === STUDENT_B,
    );

    expect(aInserts).toHaveLength(3);
    expect(bInserts).toHaveLength(1);
  });

  it('rejects PlacementResult with confidence="high" (placement seeds are low/medium only)', async () => {
    const sneaky = {
      studentId: STUDENT_A,
      results: [
        {
          nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
          masteryEstimate: 0.9,
          confidence: 'high' as unknown as 'medium',
        },
      ],
    };
    await expect(
      seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], sneaky),
    ).rejects.toThrowError(/confidence/i);
  });

  it('rejects PlacementResult with masteryEstimate out of [0, 1]', async () => {
    const oob = {
      studentId: STUDENT_A,
      results: [
        {
          nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
          masteryEstimate: 1.5,
          confidence: 'low' as const,
        },
      ],
    };
    await expect(
      seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], oob),
    ).rejects.toThrowError(/masteryEstimate/i);
  });
});

// ---------------------------------------------------------------------------
// Task 4.2.b — Idempotency: calling twice with the same student+node
// ---------------------------------------------------------------------------
//
// Per test strategy §3 "Concurrent placement attempts: Convex mutation must
// be idempotent per student" and §5 "Idempotency: calling twice with same
// student ID yields same state".

describe('seedPlacementResultsHandler — idempotency', () => {
  it('calling twice with the same input yields a stable set of (studentId, nodeId) rows', async () => {
    const ctx = makeMockCtx();
    const args = makeArgs(STUDENT_A);

    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);
    const firstIds = ctx.placementResults
      .filter((r) => r.studentId === STUDENT_A)
      .map((r) => r.nodeId)
      .sort();

    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);
    const secondIds = ctx.placementResults
      .filter((r) => r.studentId === STUDENT_A)
      .map((r) => r.nodeId)
      .sort();

    // Same set of (studentId, nodeId) pairs: no growth, no loss.
    expect(secondIds).toEqual(firstIds);
  });

  it('upsert semantics: the second call replaces the existing (studentId, nodeId) row, not appends', async () => {
    const ctx = makeMockCtx();

    const initial: PlacementResultRow[] = [
      {
        _id: 'placement_results_existing' as Id<'placement_results'>,
        _creationTime: FIXED_NOW_MS - 1_000,
        studentId: STUDENT_A,
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.3,
        confidence: 'low',
        source: 'placement',
        createdAt: FIXED_NOW_MS - 1_000,
      },
    ];
    ctx.placementResults.push(...initial);
    // Build a separate mock where the existing row shows up in withIndex.
    const seededCtx = makeMockCtx({ placementResults: initial });

    const updated = {
      studentId: STUDENT_A,
      results: [
        {
          nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
          masteryEstimate: 0.7,
          confidence: 'medium' as const,
        },
      ],
      now: FIXED_NOW_MS,
    };

    await seedPlacementResultsHandler(seededCtx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], updated);

    // Implementation strategy: the existing row is patched in place OR
    // deleted + re-inserted. Either way the persisted (studentId, nodeId)
    // count is exactly 1, and the new value reflects the update.
    const rowsForStudent = seededCtx.placementResults.filter((r) => r.studentId === STUDENT_A);
    expect(rowsForStudent).toHaveLength(1);
    expect(rowsForStudent[0]!.masteryEstimate).toBe(0.7);
    expect(rowsForStudent[0]!.confidence).toBe('medium');
  });
});

// ---------------------------------------------------------------------------
// Task 4.2.c — hasPlacementResultsHandler: returning-student guard
// ---------------------------------------------------------------------------

describe('hasPlacementResultsHandler — guard query', () => {
  it('returns true for a student with at least one placement_results row', async () => {
    const ctx = makeMockCtx({
      placementResults: [
        {
          _id: 'placement_results_1' as Id<'placement_results'>,
          _creationTime: FIXED_NOW_MS,
          studentId: STUDENT_A,
          nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
          masteryEstimate: 0.5,
          confidence: 'low',
          source: 'placement',
          createdAt: FIXED_NOW_MS,
        },
      ],
    });

    const result = await hasPlacementResultsHandler(
      ctx as unknown as Parameters<typeof hasPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );

    expect(result).toBe(true);
  });

  it('returns false for a student with no placement_results rows', async () => {
    const ctx = makeMockCtx();

    const result = await hasPlacementResultsHandler(
      ctx as unknown as Parameters<typeof hasPlacementResultsHandler>[0],
      { studentId: STUDENT_B },
    );

    expect(result).toBe(false);
  });

  it('uses the by_student index (does not full-table-scan)', async () => {
    const ctx = makeMockCtx();
    await hasPlacementResultsHandler(
      ctx as unknown as Parameters<typeof hasPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );
    expect(ctx.placementResultsQueryMock.withIndex).toHaveBeenCalledWith('by_student', expect.any(Function));
  });
});

// ---------------------------------------------------------------------------
// Task 4.2.d — getStudentPlacementResultsHandler: read query
// ---------------------------------------------------------------------------

describe('getStudentPlacementResultsHandler — read query', () => {
  it('returns all placement rows for the given student', async () => {
    const rows: PlacementResultRow[] = [
      {
        _id: 'placement_results_1' as Id<'placement_results'>,
        _creationTime: FIXED_NOW_MS,
        studentId: STUDENT_A,
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.85,
        confidence: 'medium',
        source: 'placement',
        createdAt: FIXED_NOW_MS,
      },
      {
        _id: 'placement_results_2' as Id<'placement_results'>,
        _creationTime: FIXED_NOW_MS,
        studentId: STUDENT_A,
        nodeId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
        masteryEstimate: 0.15,
        confidence: 'low',
        source: 'placement',
        createdAt: FIXED_NOW_MS,
      },
      {
        _id: 'placement_results_3' as Id<'placement_results'>,
        _creationTime: FIXED_NOW_MS,
        studentId: STUDENT_B,
        nodeId: 'math.im3.skill.9.1.convert-between-degree-and-radian-measures',
        masteryEstimate: 0.6,
        confidence: 'medium',
        source: 'placement',
        createdAt: FIXED_NOW_MS,
      },
    ];
    const ctx = makeMockCtx({ placementResults: rows });

    const result = await getStudentPlacementResultsHandler(
      ctx as unknown as Parameters<typeof getStudentPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );

    expect(result).toHaveLength(2);
    for (const r of result) {
      expect(r.studentId).toBe(STUDENT_A);
    }
  });

  it('returns an empty array for a student with no placement results', async () => {
    const ctx = makeMockCtx();

    const result = await getStudentPlacementResultsHandler(
      ctx as unknown as Parameters<typeof getStudentPlacementResultsHandler>[0],
      { studentId: STUDENT_B },
    );

    expect(result).toEqual([]);
  });

  it('every returned row has confidence in {"low","medium"} (never "high")', async () => {
    const rows: PlacementResultRow[] = [
      {
        _id: 'placement_results_1' as Id<'placement_results'>,
        _creationTime: FIXED_NOW_MS,
        studentId: STUDENT_A,
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.85,
        confidence: 'medium',
        source: 'placement',
        createdAt: FIXED_NOW_MS,
      },
    ];
    const ctx = makeMockCtx({ placementResults: rows });

    const result = await getStudentPlacementResultsHandler(
      ctx as unknown as Parameters<typeof getStudentPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );

    for (const r of result) {
      expect(['low', 'medium']).toContain(r.confidence);
      expect(r.confidence).not.toBe('high');
    }
  });
});

// ---------------------------------------------------------------------------
// Task 4.2.e — Routing integration: new student is placed; returning is not
// ---------------------------------------------------------------------------
//
// Per test strategy §5 "Routing: new-student flow triggers placement;
// returning student does not." This section covers the
// Convex-level routing interaction (mutation + guard query) without
// going through a real answer source — it pre-populates the
// `placement_results` table to model a returning student and verifies
// the guard flow at the persistence layer.

describe('Convex placement wiring — new vs returning student routing', () => {
  it('a new student passes the guard and gets persistence', async () => {
    const ctx = makeMockCtx();
    const hasExisting = await hasPlacementResultsHandler(
      ctx as unknown as Parameters<typeof hasPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );
    expect(hasExisting).toBe(false);

    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], {
      ...makeArgs(STUDENT_A),
      now: FIXED_NOW_MS,
    });

    const hasExistingAfter = await hasPlacementResultsHandler(
      ctx as unknown as Parameters<typeof hasPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );
    expect(hasExistingAfter).toBe(true);
  });

  it('a returning student is short-circuited by the guard (no second seed)', async () => {
    const ctx = makeMockCtx({
      placementResults: [
        {
          _id: 'placement_results_existing' as Id<'placement_results'>,
          _creationTime: FIXED_NOW_MS - 1_000,
          studentId: STUDENT_A,
          nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
          masteryEstimate: 0.7,
          confidence: 'medium',
          source: 'placement',
          createdAt: FIXED_NOW_MS - 1_000,
        },
      ],
    });

    // Caller pattern: check guard first, only invoke mutation when absent.
    const hasExisting = await hasPlacementResultsHandler(
      ctx as unknown as Parameters<typeof hasPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );
    expect(hasExisting).toBe(true);

    // Caller skips the mutation when guard is true — no insert calls.
    if (!hasExisting) {
      await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], makeArgs(STUDENT_A));
    }

    const inserts = ctx.insertSpy.mock.calls.filter(
      (c) => c[0] === 'placement_results',
    );
    expect(inserts).toHaveLength(0);
  });

  it('after a placement run, getStudentPlacementResults returns the persisted rows', async () => {
    const ctx = makeMockCtx();
    const args = { ...makeArgs(STUDENT_A), now: FIXED_NOW_MS };

    await seedPlacementResultsHandler(ctx as unknown as Parameters<typeof seedPlacementResultsHandler>[0], args);

    const rows = await getStudentPlacementResultsHandler(
      ctx as unknown as Parameters<typeof getStudentPlacementResultsHandler>[0],
      { studentId: STUDENT_A },
    );

    expect(rows).toHaveLength(args.results.length);
    const byNode = new Map<string, PlacementResultRow>(
      rows.map((r: PlacementResultRow) => [r.nodeId, r] as const),
    );
    for (const r of args.results) {
      const persisted = byNode.get(r.nodeId);
      expect(persisted).toBeDefined();
      expect(persisted!.masteryEstimate).toBe(r.masteryEstimate);
      expect(persisted!.confidence).toBe(r.confidence);
    }
  });
});
