import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  getTimingBaseline as _getTimingBaseline,
  recomputeTimingBaseline as _recomputeTimingBaseline,
  getStaleBaselines as _getStaleBaselines,
} from '@/convex/timing_baseline';

const getTimingBaseline = _getTimingBaseline as any;
const recomputeTimingBaseline = _recomputeTimingBaseline as any;
const getStaleBaselines = _getStaleBaselines as any;

function createMockDb(documents: Record<string, Record<string, unknown>[]>) {
  const tables: Record<string, Record<string, unknown>[]> = { ...documents };
  const patches: Record<string, Record<string, unknown>> = {};
  let insertIdCounter = 1;

  function makeQuery(table: string) {
    const data = tables[table] || [];
    return {
      take: (n: number) => Promise.resolve(data.slice(0, n)),
      withIndex: (indexName: string, builder: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => unknown) => {
        let filtered = [...data];
        const eqChain = {
          eq: (field: string, value: unknown) => {
            filtered = filtered.filter((d) => d[field] === value);
            return eqChain;
          },
        };
        builder(eqChain);
        return {
          unique: () => Promise.resolve(filtered[0] ?? null),
          take: (n: number) => Promise.resolve(filtered.slice(0, n)),
        };
      },
    };
  }

  return {
    query: vi.fn((table: string) => makeQuery(table)),
    get: vi.fn((id: string) => {
      for (const table of Object.keys(tables)) {
        const found = tables[table].find((d) => d._id === id);
        if (found) return Promise.resolve(found);
      }
      return Promise.resolve(null);
    }),
    insert: vi.fn((table: string, doc: Record<string, unknown>) => {
      const id = `id_${table}_${insertIdCounter++}`;
      tables[table] = tables[table] || [];
      tables[table].push({ _id: id, ...doc });
      return Promise.resolve(id);
    }),
    patch: vi.fn((id: string, updates: Record<string, unknown>) => {
      patches[id] = { ...(patches[id] || {}), ...updates };
      for (const table of Object.keys(tables)) {
        const idx = tables[table].findIndex((d) => d._id === id);
        if (idx !== -1) {
          tables[table][idx] = { ...tables[table][idx], ...updates };
          break;
        }
      }
      return Promise.resolve();
    }),
    _tables: tables,
    _patches: patches,
  };
}

function makeSubmission(
  id: string,
  activityId: string,
  activeMs: number,
  confidence: 'high' | 'medium' | 'low'
) {
  return {
    _id: id,
    userId: 'profile1' as Id<'profiles'>,
    activityId: activityId as Id<'activities'>,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId,
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-01-01T00:00:00.000Z',
      answers: {},
      parts: [],
      timing: {
        startedAt: '2026-01-01T00:00:00.000Z',
        submittedAt: '2026-01-01T00:00:00.000Z',
        wallClockMs: activeMs,
        activeMs,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence,
      },
    },
    score: 1,
    maxScore: 1,
    submittedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

describe('getTimingBaseline', () => {
  it('returns null when no baseline exists', async () => {
    const mockDb = createMockDb({
      timing_baselines: [],
    });

    const baseline = await getTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof getTimingBaseline>[0],
      { problemFamilyId: 'family-a' }
    );

    expect(baseline).toBeNull();
  });

  it('returns existing baseline for problem family', async () => {
    const existingBaseline = {
      _id: 'baseline1',
      problemFamilyId: 'family-a',
      sampleCount: 10,
      medianActiveMs: 10000,
      lastComputedAt: '2026-01-01T00:00:00.000Z',
      minSamplesMet: true,
    };
    const mockDb = createMockDb({
      timing_baselines: [existingBaseline],
    });

    const baseline = await getTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof getTimingBaseline>[0],
      { problemFamilyId: 'family-a' }
    );

    expect(baseline).toEqual(existingBaseline);
  });
});

describe('recomputeTimingBaseline', () => {
  it('creates new baseline when none exists', async () => {
    const activityId = 'activity1' as Id<'activities'>;
    const submissions = [
      makeSubmission('sub1', activityId, 10000, 'high'),
      makeSubmission('sub2', activityId, 12000, 'high'),
      makeSubmission('sub3', activityId, 8000, 'medium'),
    ];
    const mockDb = createMockDb({
      activity_submissions: submissions,
      timing_baselines: [],
    });
    (mockDb.query as any) = vi.fn((table: string) => {
      if (table === 'activity_submissions') {
        return {
          withIndex: () => ({
            take: () => Promise.resolve(submissions),
          }),
        };
      }
      return {
        withIndex: () => ({
          unique: () => Promise.resolve(null),
          take: () => Promise.resolve([]),
        }),
      };
    });

    const baseline = await recomputeTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof recomputeTimingBaseline>[0],
      {
        problemFamilyId: 'family-a',
        activityIds: [activityId],
      }
    );

    expect(baseline.problemFamilyId).toBe('family-a');
    expect(baseline.sampleCount).toBe(3);
    expect(baseline.medianActiveMs).toBe(10000);
    expect(baseline.minSamplesMet).toBe(false);
    expect(mockDb.insert).toHaveBeenCalledWith('timing_baselines', expect.objectContaining({
      problemFamilyId: 'family-a',
      sampleCount: 3,
    }));
  });

  it('patches existing baseline on recomputation', async () => {
    const activityId = 'activity1' as Id<'activities'>;
    const existingBaseline = {
      _id: 'baseline1',
      problemFamilyId: 'family-a',
      sampleCount: 5,
      medianActiveMs: 8000,
      lastComputedAt: '2026-01-01T00:00:00.000Z',
      minSamplesMet: false,
    };
    const submissions = [
      makeSubmission('sub1', activityId, 10000, 'high'),
      makeSubmission('sub2', activityId, 12000, 'high'),
      makeSubmission('sub3', activityId, 8000, 'high'),
      makeSubmission('sub4', activityId, 15000, 'high'),
      makeSubmission('sub5', activityId, 9000, 'high'),
    ];
    const mockDb = createMockDb({
      activity_submissions: submissions,
      timing_baselines: [existingBaseline],
    });
    (mockDb.query as any) = vi.fn((table: string) => {
      if (table === 'activity_submissions') {
        return {
          withIndex: () => ({
            take: () => Promise.resolve(submissions),
          }),
        };
      }
      if (table === 'timing_baselines') {
        return {
          withIndex: () => ({
            unique: () => Promise.resolve(existingBaseline),
            take: () => Promise.resolve([existingBaseline]),
          }),
        };
      }
      return {
        withIndex: () => ({
          unique: () => Promise.resolve(null),
          take: () => Promise.resolve([]),
        }),
      };
    });

    const baseline = await recomputeTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof recomputeTimingBaseline>[0],
      {
        problemFamilyId: 'family-a',
        activityIds: [activityId],
      }
    );

    expect(baseline.problemFamilyId).toBe('family-a');
    expect(baseline.sampleCount).toBe(5);
    expect(baseline.minSamplesMet).toBe(false);
    expect(mockDb.patch).toHaveBeenCalledWith('baseline1', expect.objectContaining({
      sampleCount: 5,
      medianActiveMs: expect.any(Number),
    }));
  });

  it('excludes low-confidence submissions from baseline', async () => {
    const activityId = 'activity1' as Id<'activities'>;
    const submissions = [
      makeSubmission('sub1', activityId, 10000, 'high'),
      makeSubmission('sub2', activityId, 999999, 'low'),
    ];
    const mockDb = createMockDb({
      activity_submissions: submissions,
      timing_baselines: [],
    });
    (mockDb.query as any) = vi.fn((table: string) => {
      if (table === 'activity_submissions') {
        return {
          withIndex: () => ({
            take: () => Promise.resolve(submissions),
          }),
        };
      }
      return {
        withIndex: () => ({
          unique: () => Promise.resolve(null),
          take: () => Promise.resolve([]),
        }),
      };
    });

    const baseline = await recomputeTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof recomputeTimingBaseline>[0],
      {
        problemFamilyId: 'family-a',
        activityIds: [activityId],
      }
    );

    expect(baseline.sampleCount).toBe(1);
    expect(baseline.medianActiveMs).toBe(10000);
  });

  it('uses custom minSamples when provided', async () => {
    const activityId = 'activity1' as Id<'activities'>;
    const submissions = [
      makeSubmission('sub1', activityId, 10000, 'high'),
      makeSubmission('sub2', activityId, 12000, 'high'),
    ];
    const mockDb = createMockDb({
      activity_submissions: submissions,
      timing_baselines: [],
    });
    (mockDb.query as any) = vi.fn((table: string) => {
      if (table === 'activity_submissions') {
        return {
          withIndex: () => ({
            take: () => Promise.resolve(submissions),
          }),
        };
      }
      return {
        withIndex: () => ({
          unique: () => Promise.resolve(null),
          take: () => Promise.resolve([]),
        }),
      };
    });

    const baseline = await recomputeTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof recomputeTimingBaseline>[0],
      {
        problemFamilyId: 'family-a',
        activityIds: [activityId],
        minSamples: 2,
      }
    );

    expect(baseline.minSamplesMet).toBe(true);
  });
});

describe('getStaleBaselines', () => {
  it('returns baselines older than maxAgeMs', async () => {
    const oldBaseline = {
      _id: 'baseline1',
      problemFamilyId: 'family-a',
      sampleCount: 10,
      medianActiveMs: 10000,
      lastComputedAt: '2026-01-01T00:00:00.000Z',
      minSamplesMet: true,
    };
    const recentBaseline = {
      _id: 'baseline2',
      problemFamilyId: 'family-b',
      sampleCount: 10,
      medianActiveMs: 10000,
      lastComputedAt: new Date().toISOString(),
      minSamplesMet: true,
    };
    const mockDb = createMockDb({
      timing_baselines: [oldBaseline, recentBaseline],
    });

    const stale = await getStaleBaselines(
      { db: mockDb } as unknown as Parameters<typeof getStaleBaselines>[0],
      { maxAgeMs: 86400000 }
    );

    expect(stale).toHaveLength(1);
    expect(stale[0]._id).toBe('baseline1');
  });
});

describe('aggregation idempotency', () => {
  it('running recompute twice produces same result', async () => {
    const activityId = 'activity1' as Id<'activities'>;
    const submissions = [
      makeSubmission('sub1', activityId, 10000, 'high'),
      makeSubmission('sub2', activityId, 12000, 'high'),
    ];
    const mockDb = createMockDb({
      activity_submissions: submissions,
      timing_baselines: [],
    });
    (mockDb.query as any) = vi.fn((table: string) => {
      if (table === 'activity_submissions') {
        return {
          withIndex: () => ({
            take: () => Promise.resolve(submissions),
          }),
        };
      }
      return {
        withIndex: () => ({
          unique: () => Promise.resolve(null),
          take: () => Promise.resolve([]),
        }),
      };
    });

    const baseline1 = await recomputeTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof recomputeTimingBaseline>[0],
      {
        problemFamilyId: 'family-a',
        activityIds: [activityId],
      }
    );

    const baseline2 = await recomputeTimingBaseline(
      { db: mockDb } as unknown as Parameters<typeof recomputeTimingBaseline>[0],
      {
        problemFamilyId: 'family-a',
        activityIds: [activityId],
      }
    );

    expect(baseline1.medianActiveMs).toBe(baseline2.medianActiveMs);
    expect(baseline1.sampleCount).toBe(baseline2.sampleCount);
  });
});