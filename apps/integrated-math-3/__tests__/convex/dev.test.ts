import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  listReviewQueueHandler,
  submitReviewHandler,
  getAuditContextHandler,
} from '@/convex/dev';

function createMockDb(documents: Record<string, Record<string, unknown>[]>) {
  const tables: Record<string, Record<string, unknown>[]> = { ...documents };
  const patches: Record<string, Record<string, unknown>> = {};
  let insertIdCounter = 1;

  function makeQuery(table: string) {
    const data = tables[table] || [];
    return {
      take: (n: number) => Promise.resolve(data.slice(0, n)),
      withIndex: (_index: string, builder: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => unknown) => {
        // We only support chained .eq().eq() for by_component index
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
          filter: (filterBuilder: (q: { eq: (accessor: unknown, value: unknown) => unknown }) => unknown) => {
            // Build a simple filter evaluator for q.eq(q.field('resolvedAt'), undefined)
            const qProxy = {
              eq: (accessor: unknown, value: unknown) => {
                if (typeof accessor === 'function') {
                  const fieldName = (accessor as { _fieldName?: string })._fieldName;
                  if (fieldName) {
                    filtered = filtered.filter((d) => d[fieldName] === value);
                  }
                }
                return true;
              },
              field: (name: string) => {
                const fn = (doc: Record<string, unknown>) => doc[name];
                (fn as unknown as { _fieldName: string })._fieldName = name;
                return fn;
              },
            };
            filterBuilder(qProxy);
            return {
              take: (n: number) => Promise.resolve(filtered.slice(0, n)),
            };
          },
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

describe('listReviewQueueHandler', () => {
  it('surfaces an unreviewed activity in the queue', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: { equation: 'y = x^2' },
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      phase_sections: [],
      component_approvals: [],
      activities: [activity],
    });

    const items = await listReviewQueueHandler({ db: mockDb } as unknown as Parameters<typeof listReviewQueueHandler>[0], {});
    expect(items).toHaveLength(1);
    expect(items[0].componentKind).toBe('activity');
    expect(items[0].componentId).toBe('act1');
    expect(items[0].approval).toBeUndefined();
  });

  it('discovers example targets from worked_example phase sections', async () => {
    const section = {
      _id: 'sec1',
      phaseVersionId: 'phase1',
      sequenceOrder: 1,
      sectionType: 'activity',
      content: { activityId: 'act1', componentKey: 'step-by-step-solver' },
      createdAt: 1,
    };
    const phase = {
      _id: 'phase1',
      lessonVersionId: 'lv1',
      phaseNumber: 1,
      phaseType: 'worked_example',
      createdAt: 1,
    };
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Example: Factoring',
      props: { problemType: 'factoring' },
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      phase_sections: [section],
      component_approvals: [],
      activities: [activity],
    });
    mockDb.get = vi.fn((id: string) => {
      if (id === 'phase1') return Promise.resolve(phase);
      return Promise.resolve(null);
    });

    const items = await listReviewQueueHandler({ db: mockDb } as unknown as Parameters<typeof listReviewQueueHandler>[0], {});
    expect(items).toHaveLength(1);
    expect(items[0].componentKind).toBe('example');
    expect(items[0].componentId).toBe('act1');
  });

  it('discovers practice targets from guided_practice phase sections', async () => {
    const section = {
      _id: 'sec1',
      phaseVersionId: 'phase1',
      sequenceOrder: 1,
      sectionType: 'activity',
      content: { activityId: 'act1', componentKey: 'comprehension-quiz' },
      createdAt: 1,
    };
    const phase = {
      _id: 'phase1',
      lessonVersionId: 'lv1',
      phaseNumber: 1,
      phaseType: 'guided_practice',
      createdAt: 1,
    };
    const activity = {
      _id: 'act1',
      componentKey: 'comprehension-quiz',
      displayName: 'Practice: Quiz',
      props: { questions: [] },
      gradingConfig: { autoGrade: true },
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      phase_sections: [section],
      component_approvals: [],
      activities: [activity],
    });
    mockDb.get = vi.fn((id: string) => {
      if (id === 'phase1') return Promise.resolve(phase);
      return Promise.resolve(null);
    });

    const items = await listReviewQueueHandler({ db: mockDb } as unknown as Parameters<typeof listReviewQueueHandler>[0], {});
    expect(items).toHaveLength(1);
    expect(items[0].componentKind).toBe('practice');
    expect(items[0].componentId).toBe('act1');
  });

  it('marks approved item as stale when content hash changes', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: { equation: 'y = x^2' },
      gradingConfig: undefined,
      approval: { status: 'approved', contentHash: 'old-hash', reviewedAt: 1, reviewedBy: 'profile1' as Id<'profiles'> },
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      phase_sections: [],
      component_approvals: [],
      activities: [activity],
    });

    const items = await listReviewQueueHandler({ db: mockDb } as unknown as Parameters<typeof listReviewQueueHandler>[0], {});
    expect(items).toHaveLength(1);
    expect(items[0].isStale).toBe(true);
  });

  it('does not mark approved item as stale when hash matches current content', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      phase_sections: [],
      component_approvals: [],
      activities: [activity],
    });

    const items = await listReviewQueueHandler({ db: mockDb } as unknown as Parameters<typeof listReviewQueueHandler>[0], {});
    expect(items).toHaveLength(1);
    expect(items[0].isStale).toBe(false);
  });

  it('includes orphaned component approvals for non-activity kinds', async () => {
    const approval = {
      _id: 'ca1',
      componentKind: 'example',
      componentId: 'deleted-act',
      componentKey: 'deleted-example',
      status: 'approved',
      contentHash: 'hash1',
      reviewedAt: 1,
      reviewedBy: 'profile1' as Id<'profiles'>,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      phase_sections: [],
      component_approvals: [approval],
      activities: [],
    });

    const items = await listReviewQueueHandler({ db: mockDb } as unknown as Parameters<typeof listReviewQueueHandler>[0], {});
    expect(items).toHaveLength(1);
    expect(items[0].componentKind).toBe('example');
    expect(items[0].componentId).toBe('deleted-act');
  });
});

describe('submitReviewHandler', () => {
  it('inserts a component review and updates activity approval for activity kind', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      component_reviews: [],
      component_approvals: [],
    });

    const result = await submitReviewHandler(
      { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
      {
        componentKind: 'activity',
        componentId: 'act1',
        status: 'approved',
        createdBy: 'profile1' as Id<'profiles'>,
      },
    );

    expect(result.reviewId).toBeDefined();
    expect(mockDb._tables.component_reviews).toHaveLength(1);
    const review = mockDb._tables.component_reviews[0];
    expect(review.status).toBe('approved');
    expect(review.componentId).toBe('act1');

    const patchedActivity = mockDb._tables.activities[0];
    const patchedApproval = patchedActivity.approval as { status: string; reviewedBy: string };
    expect(patchedApproval.status).toBe('approved');
    expect(patchedApproval.reviewedBy).toBe('profile1');
  });

  it('upserts component_approvals for example kind', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Example',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      component_reviews: [],
      component_approvals: [],
    });

    const result = await submitReviewHandler(
      { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
      {
        componentKind: 'example',
        componentId: 'act1',
        status: 'approved',
        createdBy: 'profile1' as Id<'profiles'>,
      },
    );

    expect(result.reviewId).toBeDefined();
    expect(mockDb._tables.component_approvals).toHaveLength(1);
    const approval = mockDb._tables.component_approvals[0];
    expect(approval.status).toBe('approved');
    expect(approval.componentKind).toBe('example');
  });

  it('patches existing component_approval on subsequent review', async () => {
    const existingApproval = {
      _id: 'ca1',
      componentKind: 'practice',
      componentId: 'act1',
      componentKey: 'quiz',
      status: 'unreviewed',
      createdAt: 1,
      updatedAt: 1,
    };
    const activity = {
      _id: 'act1',
      componentKey: 'comprehension-quiz',
      displayName: 'Quiz',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      component_reviews: [],
      component_approvals: [existingApproval],
    });

    const result = await submitReviewHandler(
      { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
      {
        componentKind: 'practice',
        componentId: 'act1',
        status: 'needs_changes',
        comment: 'Fix wording',
        createdBy: 'profile1' as Id<'profiles'>,
      },
    );

    expect(result.reviewId).toBeDefined();
    expect(mockDb._tables.component_approvals).toHaveLength(1);
    const approval = mockDb._tables.component_approvals[0];
    expect(approval.status).toBe('needs_changes');
    expect(approval.reviewId).toBe(result.reviewId);
  });

  it('throws when activity is not found', async () => {
    const mockDb = createMockDb({
      activities: [],
      component_reviews: [],
      component_approvals: [],
    });

    await expect(
      submitReviewHandler(
        { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
        {
          componentKind: 'activity',
          componentId: 'missing',
          status: 'approved',
          createdBy: 'profile1' as Id<'profiles'>,
        },
      ),
    ).rejects.toThrow('Activity not found');
  });

  it('throws when comment is missing for needs_changes', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      component_reviews: [],
      component_approvals: [],
    });

    await expect(
      submitReviewHandler(
        { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
        {
          componentKind: 'activity',
          componentId: 'act1',
          status: 'needs_changes',
          createdBy: 'profile1' as Id<'profiles'>,
        },
      ),
    ).rejects.toThrow('Comment is required');
  });

  it('throws when comment is missing for rejected', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      component_reviews: [],
      component_approvals: [],
    });

    await expect(
      submitReviewHandler(
        { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
        {
          componentKind: 'activity',
          componentId: 'act1',
          status: 'rejected',
          createdBy: 'profile1' as Id<'profiles'>,
        },
      ),
    ).rejects.toThrow('Comment is required');
  });

  it('derives componentKind from placement.phaseType when provided', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Practice Problem',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const phaseVersion = {
      _id: 'phase1',
      phaseType: 'guided_practice',
      phaseNumber: 3,
      lessonVersionId: 'lv1',
      createdAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      phase_versions: [phaseVersion],
      component_reviews: [],
      component_approvals: [],
    });

    const result = await submitReviewHandler(
      { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
      {
        componentKind: 'example',
        componentId: 'act1',
        status: 'approved',
        createdBy: 'profile1' as Id<'profiles'>,
        placement: {
          phaseId: 'phase1',
          sectionId: 'section1',
        },
      },
    );

    expect(result.reviewId).toBeDefined();
    expect(mockDb._tables.component_reviews).toHaveLength(1);
    const review = mockDb._tables.component_reviews[0] as { componentKind: string; componentContentHash: string };
    expect(review.componentKind).toBe('practice');
    expect(mockDb._tables.component_approvals).toHaveLength(1);
    const approval = mockDb._tables.component_approvals[0] as { status: string; contentHash: string; componentKind: string };
    expect(approval.status).toBe('approved');
    expect(approval.componentKind).toBe('practice');
    expect(approval.contentHash).toBe(review.componentContentHash);
  });

  it('derives componentKind as example for worked_example phaseType', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Example',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const phaseVersion = {
      _id: 'phase1',
      phaseType: 'worked_example',
      phaseNumber: 2,
      lessonVersionId: 'lv1',
      createdAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      phase_versions: [phaseVersion],
      component_reviews: [],
      component_approvals: [],
    });

    const result = await submitReviewHandler(
      { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
      {
        componentKind: 'activity',
        componentId: 'act1',
        status: 'approved',
        createdBy: 'profile1' as Id<'profiles'>,
        placement: {
          phaseId: 'phase1',
          sectionId: 'section1',
        },
      },
    );

    expect(result.reviewId).toBeDefined();
    expect(mockDb._tables.component_reviews).toHaveLength(1);
    const review = mockDb._tables.component_reviews[0] as { componentKind: string };
    expect(review.componentKind).toBe('example');
    expect(mockDb._tables.component_approvals).toHaveLength(1);
    const approval = mockDb._tables.component_approvals[0] as { componentKind: string };
    expect(approval.componentKind).toBe('example');
  });

  it('falls back to args.componentKind when placement is absent', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
      createdAt: 1,
      updatedAt: 1,
    };
    const mockDb = createMockDb({
      activities: [activity],
      component_reviews: [],
      component_approvals: [],
    });

    const result = await submitReviewHandler(
      { db: mockDb } as unknown as Parameters<typeof submitReviewHandler>[0],
      {
        componentKind: 'activity',
        componentId: 'act1',
        status: 'approved',
        createdBy: 'profile1' as Id<'profiles'>,
      },
    );

    expect(result.reviewId).toBeDefined();
    expect(mockDb._tables.component_reviews).toHaveLength(1);
    const review = mockDb._tables.component_reviews[0] as { componentKind: string };
    expect(review.componentKind).toBe('activity');
  });
});

describe('getAuditContextHandler', () => {
  it('returns unresolved needs_changes reviews', async () => {
    const mockDb = createMockDb({
      component_reviews: [
        { _id: 'r1', status: 'needs_changes', componentId: 'act1', componentContentHash: 'h1', createdBy: 'p1' as Id<'profiles'>, createdAt: 1 },
        { _id: 'r2', status: 'needs_changes', componentId: 'act2', componentContentHash: 'h2', createdBy: 'p1' as Id<'profiles'>, createdAt: 1, resolvedAt: 100 },
      ],
    });

    const items = await getAuditContextHandler({ db: mockDb } as unknown as Parameters<typeof getAuditContextHandler>[0]);
    expect(items.some((i) => i._id === 'r1')).toBe(true);
    expect(items.some((i) => i._id === 'r2')).toBe(false);
  });

  it('returns unresolved rejected reviews', async () => {
    const mockDb = createMockDb({
      component_reviews: [
        { _id: 'r1', status: 'rejected', componentId: 'act1', componentContentHash: 'h1', createdBy: 'p1' as Id<'profiles'>, createdAt: 1 },
        { _id: 'r2', status: 'rejected', componentId: 'act2', componentContentHash: 'h2', createdBy: 'p1' as Id<'profiles'>, createdAt: 1, resolvedAt: 100 },
      ],
    });

    const items = await getAuditContextHandler({ db: mockDb } as unknown as Parameters<typeof getAuditContextHandler>[0]);
    expect(items.some((i) => i._id === 'r1')).toBe(true);
    expect(items.some((i) => i._id === 'r2')).toBe(false);
  });
});
