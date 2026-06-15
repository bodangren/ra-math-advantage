// Phase 3 (Track 6 misconception-loop_20260521) — Convex persistence Red
// tests for the per-student misconception state table.
//
// kst-srs.v2 §9.3 + spec.md FR3: a misconception is `active` on detection
// and becomes `resolved` after N consecutive clean attempts on its
// affected skills. The per-student state row in
// `apps/integrated-math-3/convex/schema.ts:772-783` is the persisted
// artifact; the Phase 3 Convex handlers are the read/write path that the
// IM3 wiring layer calls into.
//
// Per `test-strategy.md` §"Per-Phase Test Approach › Phase 3", this is the
// LIVE-BEHAVIOR proof for FR3 (Convex persistence). The Phase 1 sibling
// test (`misconceptionStateSchema.test.ts`) is the ARTIFACT test — it
// proves the table + validators exist; this file proves the round-trip:
//
//   - `recordMisconceptionDetectionHandler` upserts the
//     `student_misconception_state` row keyed by
//     `(studentId, misconceptionId)`. On first detection: inserts a new
//     `active` row with `cleanStreak: 0` and the supplied
//     `severity` + `affectedSkills`. On a re-detection: patches the
//     existing row in place (refreshes severity, resets `cleanStreak`
//     to 0, updates `lastUpdatedAt`, preserves `firstDetectedAt`).
//
//   - `recordCleanAttemptHandler` increments `cleanStreak` on the row.
//     When the streak reaches the supplied `resolutionThreshold`, the
//     row transitions to `resolved` and `cleanStreak` resets to 0. A
//     clean attempt on a row that is already `resolved` is a no-op
//     (idempotent — re-resolving a resolved row is not a regression).
//
//   - `getStudentActiveMisconceptionsHandler` reads every `active` row
//     for the given `studentId` via the `by_student_status` index and
//     returns them sorted for deterministic output. For a student with
//     no rows (stale-state default, per `test-strategy.md` §3), it
//     returns `[]` — it must not throw.
//
// Why this file is Red at HEAD: the three Convex handlers do not exist
// in `apps/integrated-math-3/convex/misconceptionState.ts` (only the
// three validators do). The `@/convex/misconceptionState` import
// fails at module resolution, so the suite reports a module-resolution
// error. This is an "implementation missing" Red, not a stale-durable
// Red.
//
// The mock-ctx pattern follows the existing
// `__tests__/convex/placement.test.ts` and `__tests__/convex/study.test.ts`
// conventions (no `convex-test` dependency). The Phase 1
// `misconceptionStateSchema.test.ts` artifact test is a sibling; this
// file is the live-behavior round-trip.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// ---------------------------------------------------------------------------
// Production module — does not exist yet (Red phase).
//
// The Green-phase implementer extends
// `apps/integrated-math-3/convex/misconceptionState.ts` (which already
// exports the three validators from Phase 1) with three new handler
// exports:
//
//   export const recordMisconceptionDetectionHandler: MutationHandler<...>
//   export const recordCleanAttemptHandler: MutationHandler<...>
//   export const getStudentActiveMisconceptionsHandler: QueryHandler<...>
//
// Until then, the import below fails at module resolution.
// ---------------------------------------------------------------------------

import {
  recordMisconceptionDetectionHandler,
  recordCleanAttemptHandler,
  getStudentActiveMisconceptionsHandler,
} from '@/convex/misconceptionState';

// ---------------------------------------------------------------------------
// Types — mirror the IM3 schema for `student_misconception_state` (the
// table is defined at apps/integrated-math-3/convex/schema.ts:772-783).
// ---------------------------------------------------------------------------

type MisconceptionLifecycleStatus = 'active' | 'resolved';
type MisconceptionSeverity = 'minor' | 'severe';

interface StudentMisconceptionStateRow {
  _id: Id<'student_misconception_state'>;
  _creationTime: number;
  studentId: string;
  misconceptionId: string;
  status: MisconceptionLifecycleStatus;
  severity: MisconceptionSeverity;
  cleanStreak: number;
  firstDetectedAt: number;
  lastUpdatedAt: number;
  affectedSkills: readonly string[];
}

// ---------------------------------------------------------------------------
// Mock Convex ctx builder (mirrors placement.test.ts pattern).
// ---------------------------------------------------------------------------

interface MakeMockCtxOptions {
  rows?: StudentMisconceptionStateRow[];
}

interface MockCtx {
  db: {
    query: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  rows: StudentMisconceptionStateRow[];
  insertSpy: ReturnType<typeof vi.fn>;
  patchSpy: ReturnType<typeof vi.fn>;
}

function makeMockCtx(options: MakeMockCtxOptions = {}): MockCtx {
  const { rows: initial = [] } = options;
  const rows: StudentMisconceptionStateRow[] = [...initial];
  let insertIdCounter = 1;

  const insertSpy = vi.fn().mockImplementation(
    (table: string, doc: Record<string, unknown>) => {
      if (table === 'student_misconception_state') {
        const id = `student_misconception_state_${insertIdCounter++}` as Id<'student_misconception_state'>;
        const row: StudentMisconceptionStateRow = {
          _id: id,
          _creationTime: (doc.lastUpdatedAt as number) ?? Date.now(),
          studentId: doc.studentId as string,
          misconceptionId: doc.misconceptionId as string,
          status: doc.status as MisconceptionLifecycleStatus,
          severity: doc.severity as MisconceptionSeverity,
          cleanStreak: (doc.cleanStreak as number) ?? 0,
          firstDetectedAt: (doc.firstDetectedAt as number) ?? Date.now(),
          lastUpdatedAt: (doc.lastUpdatedAt as number) ?? Date.now(),
          affectedSkills: (doc.affectedSkills as readonly string[]) ?? [],
        };
        rows.push(row);
        return Promise.resolve(id);
      }
      return Promise.resolve(`unknown_${insertIdCounter++}` as Id<'student_misconception_state'>);
    },
  );

  const patchSpy = vi.fn().mockImplementation(
    (id: Id<'student_misconception_state'>, patch: Record<string, unknown>) => {
      const row = rows.find((r) => r._id === id);
      if (!row) {
        return Promise.resolve(null);
      }
      Object.assign(row, patch);
      return Promise.resolve(null);
    },
  );

  const queryMock = vi.fn().mockImplementation((tableName: string) => {
    if (tableName !== 'student_misconception_state') {
      return {
        withIndex: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue([]),
        first: vi.fn().mockResolvedValue(null),
        unique: vi.fn().mockResolvedValue(null),
      };
    }
    return {
      withIndex: vi.fn().mockImplementation(
        (
          _indexName: string,
          builder?: (q: {
            eq: (field: string, value: unknown) => unknown;
          }) => unknown,
        ) => {
          let filtered: StudentMisconceptionStateRow[] = [...rows];
          const eqChain = {
            eq: (field: string, value: unknown) => {
              filtered = filtered.filter(
                (r) => (r as unknown as Record<string, unknown>)[field] === value,
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
    };
  });

  const ctx: MockCtx = {
    db: {
      query: queryMock,
      insert: insertSpy,
      get: vi.fn().mockImplementation((id: Id<'student_misconception_state'>) => {
        const row = rows.find((r) => r._id === id);
        return Promise.resolve(row ?? null);
      }),
      patch: patchSpy,
      delete: vi.fn().mockResolvedValue(undefined),
    },
    rows,
    insertSpy,
    patchSpy,
  };
  return ctx;
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const STUDENT_A = 'student-im3-test-a';
const STUDENT_B = 'student-im3-test-b';
const MISCONCEPTION_SIGN_ERROR = 'math.im3.misconception.sign-error';
const MISCONCEPTION_LINEAR_MISUSE = 'math.im3.misconception.linear-misuse';
const SKILL_FACTORING = 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring';
const SKILL_GRAPHING = 'math.im3.skill.1.1.graph-quadratic-functions';
const FIXED_NOW_MS = 1_780_000_000_000;
const RESOLUTION_THRESHOLD = 3;

function makeDetectionArgs(overrides: Record<string, unknown> = {}) {
  return {
    studentId: STUDENT_A,
    misconceptionId: MISCONCEPTION_SIGN_ERROR,
    severity: 'minor' as MisconceptionSeverity,
    affectedSkills: [SKILL_FACTORING],
    now: FIXED_NOW_MS,
    ...overrides,
  };
}

function makeCleanAttemptArgs(overrides: Record<string, unknown> = {}) {
  return {
    studentId: STUDENT_A,
    misconceptionId: MISCONCEPTION_SIGN_ERROR,
    resolutionThreshold: RESOLUTION_THRESHOLD,
    now: FIXED_NOW_MS,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. recordMisconceptionDetectionHandler — upsert the active row.
// ---------------------------------------------------------------------------

describe('recordMisconceptionDetectionHandler — upsert (spec FR3, test-strategy §5 P3)', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('inserts a new active row when no (studentId, misconceptionId) row exists', async () => {
    const args = makeDetectionArgs();
    await recordMisconceptionDetectionHandler(
      ctx as unknown as Parameters<typeof recordMisconceptionDetectionHandler>[0],
      args,
    );

    expect(ctx.insertSpy).toHaveBeenCalledTimes(1);
    expect(ctx.insertSpy).toHaveBeenCalledWith(
      'student_misconception_state',
      expect.objectContaining({
        studentId: STUDENT_A,
        misconceptionId: MISCONCEPTION_SIGN_ERROR,
        status: 'active',
        severity: 'minor',
        cleanStreak: 0,
        affectedSkills: [SKILL_FACTORING],
      }),
    );
    const inserted = ctx.insertSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(inserted.firstDetectedAt).toBe(FIXED_NOW_MS);
    expect(inserted.lastUpdatedAt).toBe(FIXED_NOW_MS);
  });

  it('supports a `severe` severity passthrough (spec FR2 → FR3 handoff)', async () => {
    const args = makeDetectionArgs({ severity: 'severe' });
    await recordMisconceptionDetectionHandler(
      ctx as unknown as Parameters<typeof recordMisconceptionDetectionHandler>[0],
      args,
    );
    const inserted = ctx.insertSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(inserted.severity).toBe('severe');
  });

  it('preserves a multi-skill affectedSkills list as-is on insert', async () => {
    const args = makeDetectionArgs({
      affectedSkills: [SKILL_FACTORING, SKILL_GRAPHING],
    });
    await recordMisconceptionDetectionHandler(
      ctx as unknown as Parameters<typeof recordMisconceptionDetectionHandler>[0],
      args,
    );
    const inserted = ctx.insertSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(inserted.affectedSkills).toEqual([SKILL_FACTORING, SKILL_GRAPHING]);
  });

  it('patches (not appends) when a (studentId, misconceptionId) row already exists', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS - 5_000,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'active',
      severity: 'minor',
      cleanStreak: 2,
      firstDetectedAt: FIXED_NOW_MS - 5_000,
      lastUpdatedAt: FIXED_NOW_MS - 5_000,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    const args = makeDetectionArgs({ now: FIXED_NOW_MS, severity: 'severe' });
    await recordMisconceptionDetectionHandler(
      ctx as unknown as Parameters<typeof recordMisconceptionDetectionHandler>[0],
      args,
    );

    // No new insert; one patch instead.
    expect(ctx.insertSpy).not.toHaveBeenCalled();
    expect(ctx.patchSpy).toHaveBeenCalledTimes(1);
    const patchCall = ctx.patchSpy.mock.calls[0] as [
      Id<'student_misconception_state'>,
      Record<string, unknown>,
    ];
    expect(patchCall[0]).toBe(seeded._id);
    expect(patchCall[1]).toMatchObject({
      status: 'active',
      severity: 'severe',
      cleanStreak: 0,
      lastUpdatedAt: FIXED_NOW_MS,
    });
    // firstDetectedAt MUST be preserved on re-detection.
    expect(patchCall[1].firstDetectedAt).toBeUndefined();
  });

  it('isolates rows by (studentId, misconceptionId) — a different student inserts a new row', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'active',
      severity: 'minor',
      cleanStreak: 0,
      firstDetectedAt: FIXED_NOW_MS,
      lastUpdatedAt: FIXED_NOW_MS,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    const args = makeDetectionArgs({ studentId: STUDENT_B });
    await recordMisconceptionDetectionHandler(
      ctx as unknown as Parameters<typeof recordMisconceptionDetectionHandler>[0],
      args,
    );

    expect(ctx.insertSpy).toHaveBeenCalledTimes(1);
    expect(ctx.rows).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// 2. recordCleanAttemptHandler — increment streak, resolve at threshold.
// ---------------------------------------------------------------------------

describe('recordCleanAttemptHandler — increment + resolve (spec FR3, kst-srs.v2 §9.3)', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('increments cleanStreak by 1 on an active row', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'active',
      severity: 'minor',
      cleanStreak: 1,
      firstDetectedAt: FIXED_NOW_MS,
      lastUpdatedAt: FIXED_NOW_MS,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    await recordCleanAttemptHandler(
      ctx as unknown as Parameters<typeof recordCleanAttemptHandler>[0],
      makeCleanAttemptArgs(),
    );

    expect(ctx.patchSpy).toHaveBeenCalledWith(
      seeded._id,
      expect.objectContaining({
        cleanStreak: 2,
        lastUpdatedAt: FIXED_NOW_MS,
      }),
    );
  });

  it('does NOT resolve when cleanStreak is one short of the threshold (N-1)', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'active',
      severity: 'minor',
      cleanStreak: RESOLUTION_THRESHOLD - 1,
      firstDetectedAt: FIXED_NOW_MS,
      lastUpdatedAt: FIXED_NOW_MS,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    // Use a threshold one higher than the current streak, so the increment
    // lands at exactly the threshold. The handler must not resolve
    // mid-increment; it must first persist the incremented streak and
    // THEN flip status to 'resolved' in a subsequent patch.
    await recordCleanAttemptHandler(
      ctx as unknown as Parameters<typeof recordCleanAttemptHandler>[0],
      makeCleanAttemptArgs({ resolutionThreshold: RESOLUTION_THRESHOLD + 1 }),
    );

    const patched = ctx.patchSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(patched.cleanStreak).toBe(RESOLUTION_THRESHOLD);
    expect(patched.status).toBeUndefined();
  });

  it('transitions to resolved when the increment meets the threshold, and resets cleanStreak to 0', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'active',
      severity: 'minor',
      cleanStreak: RESOLUTION_THRESHOLD - 1,
      firstDetectedAt: FIXED_NOW_MS,
      lastUpdatedAt: FIXED_NOW_MS,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    await recordCleanAttemptHandler(
      ctx as unknown as Parameters<typeof recordCleanAttemptHandler>[0],
      makeCleanAttemptArgs(),
    );

    expect(ctx.patchSpy).toHaveBeenCalledWith(
      seeded._id,
      expect.objectContaining({
        status: 'resolved',
        cleanStreak: 0,
        lastUpdatedAt: FIXED_NOW_MS,
      }),
    );
    // The persisted row must reflect the new status.
    expect(ctx.rows[0]?.status).toBe('resolved');
  });

  it('is a no-op on an already-resolved row (idempotent — re-resolving is not a regression)', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS - 10_000,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'resolved',
      severity: 'minor',
      cleanStreak: 0,
      firstDetectedAt: FIXED_NOW_MS - 10_000,
      lastUpdatedAt: FIXED_NOW_MS - 10_000,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    await recordCleanAttemptHandler(
      ctx as unknown as Parameters<typeof recordCleanAttemptHandler>[0],
      makeCleanAttemptArgs(),
    );

    // No patch on a resolved row.
    expect(ctx.patchSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-positive resolution threshold before mutating state', async () => {
    const seeded: StudentMisconceptionStateRow = {
      _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
      _creationTime: FIXED_NOW_MS,
      studentId: STUDENT_A,
      misconceptionId: MISCONCEPTION_SIGN_ERROR,
      status: 'active',
      severity: 'minor',
      cleanStreak: 1,
      firstDetectedAt: FIXED_NOW_MS,
      lastUpdatedAt: FIXED_NOW_MS,
      affectedSkills: [SKILL_FACTORING],
    };
    ctx.rows.push(seeded);

    await expect(
      recordCleanAttemptHandler(
        ctx as unknown as Parameters<typeof recordCleanAttemptHandler>[0],
        makeCleanAttemptArgs({ resolutionThreshold: 0 }),
      ),
    ).rejects.toThrow(/resolutionThreshold/);
    expect(ctx.patchSpy).not.toHaveBeenCalled();
    expect(ctx.rows[0]?.cleanStreak).toBe(1);
    expect(ctx.rows[0]?.status).toBe('active');
  });

  it('handles a missing row gracefully (returns null without throwing) — caller is responsible for detection-first', async () => {
    await expect(
      recordCleanAttemptHandler(
        ctx as unknown as Parameters<typeof recordCleanAttemptHandler>[0],
        makeCleanAttemptArgs(),
      ),
    ).resolves.toBeNull();
    expect(ctx.patchSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 3. getStudentActiveMisconceptionsHandler — read active set.
// ---------------------------------------------------------------------------

describe('getStudentActiveMisconceptionsHandler — read active set (test-strategy §3 stale-state default)', () => {
  it('returns an empty array for a student with no rows (stale state default)', async () => {
    const ctx = makeMockCtx();
    const result = await getStudentActiveMisconceptionsHandler(
      ctx as unknown as Parameters<typeof getStudentActiveMisconceptionsHandler>[0],
      { studentId: STUDENT_A },
    );
    expect(result).toEqual([]);
  });

  it('returns only the active rows for the given studentId', async () => {
    const rows: StudentMisconceptionStateRow[] = [
      {
        _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
        _creationTime: FIXED_NOW_MS - 3_000,
        studentId: STUDENT_A,
        misconceptionId: MISCONCEPTION_SIGN_ERROR,
        status: 'active',
        severity: 'minor',
        cleanStreak: 2,
        firstDetectedAt: FIXED_NOW_MS - 3_000,
        lastUpdatedAt: FIXED_NOW_MS - 3_000,
        affectedSkills: [SKILL_FACTORING],
      },
      {
        _id: 'student_misconception_state_2' as Id<'student_misconception_state'>,
        _creationTime: FIXED_NOW_MS - 2_000,
        studentId: STUDENT_A,
        misconceptionId: MISCONCEPTION_LINEAR_MISUSE,
        status: 'active',
        severity: 'severe',
        cleanStreak: 0,
        firstDetectedAt: FIXED_NOW_MS - 2_000,
        lastUpdatedAt: FIXED_NOW_MS - 2_000,
        affectedSkills: [SKILL_GRAPHING],
      },
      {
        _id: 'student_misconception_state_3' as Id<'student_misconception_state'>,
        _creationTime: FIXED_NOW_MS - 1_000,
        studentId: STUDENT_A,
        misconceptionId: 'math.im3.misconception.already-resolved',
        status: 'resolved',
        severity: 'minor',
        cleanStreak: 0,
        firstDetectedAt: FIXED_NOW_MS - 1_000,
        lastUpdatedAt: FIXED_NOW_MS - 1_000,
        affectedSkills: [SKILL_FACTORING],
      },
      {
        _id: 'student_misconception_state_4' as Id<'student_misconception_state'>,
        _creationTime: FIXED_NOW_MS,
        studentId: STUDENT_B,
        misconceptionId: MISCONCEPTION_SIGN_ERROR,
        status: 'active',
        severity: 'minor',
        cleanStreak: 0,
        firstDetectedAt: FIXED_NOW_MS,
        lastUpdatedAt: FIXED_NOW_MS,
        affectedSkills: [SKILL_FACTORING],
      },
    ];
    const ctx = makeMockCtx({ rows });

    const result = await getStudentActiveMisconceptionsHandler(
      ctx as unknown as Parameters<typeof getStudentActiveMisconceptionsHandler>[0],
      { studentId: STUDENT_A },
    );

    // Two active rows for STUDENT_A — the resolved row and the
    // STUDENT_B row are filtered out by the (studentId, status) index.
    expect(result).toHaveLength(2);
    const misconceptionIds = result.map((r) => r.misconceptionId).sort();
    expect(misconceptionIds).toEqual(
      [MISCONCEPTION_LINEAR_MISUSE, MISCONCEPTION_SIGN_ERROR].sort(),
    );
  });

  it('returns an empty array for a student whose rows are all resolved', async () => {
    const rows: StudentMisconceptionStateRow[] = [
      {
        _id: 'student_misconception_state_1' as Id<'student_misconception_state'>,
        _creationTime: FIXED_NOW_MS,
        studentId: STUDENT_A,
        misconceptionId: MISCONCEPTION_SIGN_ERROR,
        status: 'resolved',
        severity: 'minor',
        cleanStreak: 0,
        firstDetectedAt: FIXED_NOW_MS,
        lastUpdatedAt: FIXED_NOW_MS,
        affectedSkills: [SKILL_FACTORING],
      },
    ];
    const ctx = makeMockCtx({ rows });

    const result = await getStudentActiveMisconceptionsHandler(
      ctx as unknown as Parameters<typeof getStudentActiveMisconceptionsHandler>[0],
      { studentId: STUDENT_A },
    );

    expect(result).toEqual([]);
  });
});
