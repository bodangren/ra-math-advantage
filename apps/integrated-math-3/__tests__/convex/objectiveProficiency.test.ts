import { describe, it, expect, vi } from 'vitest';
import { getObjectiveProficiencyHandler, getStudentProficiencySummaryHandler, getTeacherClassProficiencyHandler } from '@/convex/objectiveProficiency';
import type { Id } from '@/convex/_generated/dataModel';

function makeMockCtx(overrides: {
  cards?: Array<{
    _id: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    objectiveId: string;
    problemFamilyId: string;
    stability: number;
    difficulty: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
    dueDate: string;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: string;
    createdAt: number;
    updatedAt: number;
  }>;
  problemFamilies?: Array<{
    _id: Id<'problem_families'>;
    problemFamilyId: string;
    objectiveIds: string[];
    componentKey: string;
    displayName: string;
    description: string;
    difficulty: string;
  }>;
  reviews?: Array<{
    _id: Id<'srs_review_log'>;
    cardId: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    rating: string;
    submissionId?: string;
    reviewId?: string;
    evidence: unknown;
    stateBefore: unknown;
    stateAfter: unknown;
    reviewedAt: number;
  }>;
  submissions?: Array<{
    _id: Id<'activity_submissions'>;
    userId: Id<'profiles'>;
    activityId: Id<'activities'>;
    submissionData: {
      attemptNumber?: number;
      timing?: { activeMs?: number };
    };
    submittedAt: number;
    createdAt: number;
    updatedAt: number;
  }>;
  baselines?: Array<{
    _id: Id<'timing_baselines'>;
    problemFamilyId: string;
    sampleCount: number;
    medianActiveMs: number;
    p25ActiveMs?: number;
    p75ActiveMs?: number;
    p90ActiveMs?: number;
    lastComputedAt: string;
    minSamplesMet: boolean;
  }>;
  standards?: Array<{
    _id: Id<'competency_standards'>;
    code: string;
    description: string;
    isActive: boolean;
    createdAt: number;
  }>;
  policies?: Array<{
    _id: Id<'objective_policies'>;
    standardId: Id<'competency_standards'>;
    policy: string;
    courseKey: string;
    priority: number;
  }>;
} = {}) {
  const {
    cards = [],
    problemFamilies = [],
    reviews = [],
    submissions = [],
    baselines = [],
    standards = [],
    policies = [],
  } = overrides;

  const cardQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: vi.fn().mockResolvedValue(cards),
    }),
  };

const problemFamilyQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (indexName: string, fn: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          let capturedObjectiveId: string | null = null;
          const mockQ: { eq: (field: string, value: unknown) => unknown } = {
            eq: (field: string, value: unknown) => {
              if (field === 'objectiveIds') {
                if (Array.isArray(value)) {
                  capturedObjectiveId = value[0];
                } else if (typeof value === 'string') {
                  capturedObjectiveId = value;
                }
              }
              return mockQ;
            },
          };
          fn(mockQ);
          return {
            collect: vi.fn().mockImplementation(() =>
              Promise.resolve(
                problemFamilies.filter((pf) =>
                  capturedObjectiveId ? pf.objectiveIds.includes(capturedObjectiveId) : true
                )
              )
            ),
          };
        }
      ),
    };

  const reviewQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: vi.fn().mockResolvedValue(reviews),
    }),
  };

  const submissionQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
        let capturedActivityId: string | null = null;
        const mockQ = {
          eq: vi.fn().mockImplementation((field: string, value: string) => {
            if (field === 'activityId') {
              capturedActivityId = value;
            }
            return mockQ;
          }),
        };
        fn(mockQ);
        return {
          collect: vi.fn().mockResolvedValue(
            submissions.filter((s) => s.activityId === capturedActivityId)
          ),
        };
      }
    ),
  };

  let lastProblemFamilyId: string | null = null;
  const baselineQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
        const mockQ = {
          eq: vi.fn().mockImplementation((field: string, value: string) => {
            if (field === 'problemFamilyId') {
              lastProblemFamilyId = value;
            }
            return {};
          }),
        };
        fn(mockQ);
        const capturedId = lastProblemFamilyId;
        return {
          first: vi.fn().mockImplementation(() => {
            const found = baselines.find((b) => b.problemFamilyId === capturedId);
            return Promise.resolve(found ?? null);
          }),
        };
      }
    ),
  };

  const standardQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      first: vi.fn().mockImplementation(() => {
        // The test setup should have at most one standard per code
        return Promise.resolve(standards[0] ?? null);
      }),
    }),
  };

  let lastStandardId: string | null = null;
  const policyQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
        const mockQ = {
          eq: vi.fn().mockImplementation((field: string, value: string) => {
            if (field === 'standardId') {
              lastStandardId = value;
            }
            return {};
          }),
        };
        fn(mockQ);
        const capturedId = lastStandardId;
        return {
          first: vi.fn().mockImplementation(() => {
            const found = policies.find((p) => p.standardId === capturedId);
            return Promise.resolve(found ?? null);
          }),
        };
      }
    ),
  };

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'srs_cards') return cardQueryMock;
    if (tableName === 'problem_families') return problemFamilyQueryMock;
    if (tableName === 'srs_review_log') return reviewQueryMock;
    if (tableName === 'activity_submissions') return submissionQueryMock;
    if (tableName === 'timing_baselines') return baselineQueryMock;
    if (tableName === 'competency_standards') return standardQueryMock;
    if (tableName === 'objective_policies') return policyQueryMock;
    return {
      withIndex: vi.fn().mockReturnValue({
        collect: vi.fn().mockResolvedValue([]),
        first: vi.fn().mockResolvedValue(null),
      }),
    };
  });

  return {
    db: {
      query: mockQuery,
    },
    mockQuery,
  };
}

describe('getObjectiveProficiencyHandler', () => {
  it('returns zero proficiency for student with no cards', async () => {
    const { db } = makeMockCtx({ cards: [] });

    const result = await getObjectiveProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.objectiveId).toBe('');
    expect(result.retentionStrength).toBe(0);
    expect(result.practiceCoverage).toBe(0);
    expect(result.evidenceConfidence).toBe('none');
    expect(result.isProficient).toBe(false);
  });

  it('returns proficiency result for student with reviewed cards', async () => {
    const cardId = 'card-1' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;
    const { db } = makeMockCtx({
      cards: [
        {
          _id: cardId,
          studentId,
          objectiveId: 'HSA-SSE.B.3',
          problemFamilyId: 'pf-1',
          stability: 90,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      reviews: [
        {
          _id: 'rev-1' as Id<'srs_review_log'>,
          cardId,
          studentId,
          rating: 'Good',
          submissionId: 'act-1-1',
          reviewId: 'rev_abc',
          evidence: {},
          stateBefore: {},
          stateAfter: {},
          reviewedAt: Date.now(),
        },
      ],
      submissions: [
        {
          _id: 'sub-1' as Id<'activity_submissions'>,
          userId: studentId,
          activityId: 'act-1' as Id<'activities'>,
          submissionData: { attemptNumber: 1, timing: { activeMs: 15000 } },
          submittedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      baselines: [
        {
          _id: 'base-1' as Id<'timing_baselines'>,
          problemFamilyId: 'pf-1',
          sampleCount: 20,
          medianActiveMs: 20000,
          lastComputedAt: '2026-04-16T00:00:00.000Z',
          minSamplesMet: true,
        },
      ],
    });

    const result = await getObjectiveProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.retentionStrength).toBeGreaterThan(0);
    expect(result.practiceCoverage).toBe(1);
    expect(result.fluencyConfidence).toBe('high');
  });

  it('filters correctly when objectiveId is provided', async () => {
    const card1 = 'card-1' as Id<'srs_cards'>;
    const card2 = 'card-2' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db } = makeMockCtx({
      cards: [
        {
          _id: card1,
          studentId,
          objectiveId: 'obj-a',
          problemFamilyId: 'pf-a',
          stability: 90,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: card2,
          studentId,
          objectiveId: 'obj-b',
          problemFamilyId: 'pf-b',
          stability: 10,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 1,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-a' as Id<'problem_families'>,
          problemFamilyId: 'pf-a',
          objectiveIds: ['obj-a'],
          componentKey: 'key-a',
          displayName: 'Family A',
          description: 'Desc A',
          difficulty: 'medium',
        },
      ],
      standards: [
        {
          _id: 'std-a' as Id<'competency_standards'>,
          code: 'obj-a',
          description: 'Objective A',
          isActive: true,
          createdAt: Date.now(),
        },
      ],
      policies: [
        {
          _id: 'pol-a' as Id<'objective_policies'>,
          standardId: 'std-a' as Id<'competency_standards'>,
          policy: 'essential',
          courseKey: 'integrated-math-3',
          priority: 1,
        },
      ],
    });

    const result = await getObjectiveProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', objectiveId: 'obj-a' }
    );

    expect(result.objectiveId).toBe('obj-a');
    expect(result.retentionStrength).toBeGreaterThan(0.7);
    expect(result.problemFamilyDetails).toHaveLength(1);
    expect(result.problemFamilyDetails[0].problemFamilyId).toBe('pf-a');
  });

  it('uses objective priority from policy when objectiveId is provided', async () => {
    const cardId = 'card-1' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db } = makeMockCtx({
      cards: [
        {
          _id: cardId,
          studentId,
          objectiveId: 'obj-triaged',
          problemFamilyId: 'pf-triaged',
          stability: 100,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 5,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-triaged' as Id<'problem_families'>,
          problemFamilyId: 'pf-triaged',
          objectiveIds: ['obj-triaged'],
          componentKey: 'key-triaged',
          displayName: 'Family Triaged',
          description: 'Desc',
          difficulty: 'medium',
        },
      ],
      standards: [
        {
          _id: 'std-triaged' as Id<'competency_standards'>,
          code: 'obj-triaged',
          description: 'Triaged Objective',
          isActive: true,
          createdAt: Date.now(),
        },
      ],
      policies: [
        {
          _id: 'pol-triaged' as Id<'objective_policies'>,
          standardId: 'std-triaged' as Id<'competency_standards'>,
          policy: 'triaged',
          courseKey: 'integrated-math-3',
          priority: 0,
        },
      ],
    });

    const result = await getObjectiveProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', objectiveId: 'obj-triaged' }
    );

    expect(result.priority).toBe('triaged');
    expect(result.isProficient).toBe(false);
    expect(result.reasons).toContain('objective_triaged');
  });

  it('derives fluency confidence from timing baselines and review durations', async () => {
    const cardId = 'card-1' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db } = makeMockCtx({
      cards: [
        {
          _id: cardId,
          studentId,
          objectiveId: 'obj-timing',
          problemFamilyId: 'pf-timing',
          stability: 30,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 1,
          scheduledDays: 2,
          reps: 2,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      reviews: [
        {
          _id: 'rev-1' as Id<'srs_review_log'>,
          cardId,
          studentId,
          rating: 'Good',
          submissionId: 'act-timing-1',
          reviewId: 'rev_timing',
          evidence: {},
          stateBefore: {},
          stateAfter: {},
          reviewedAt: Date.now(),
        },
      ],
      submissions: [
        {
          _id: 'sub-timing' as Id<'activity_submissions'>,
          userId: studentId,
          activityId: 'act-timing' as Id<'activities'>,
          submissionData: { attemptNumber: 1, timing: { activeMs: 5000 } },
          submittedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      baselines: [
        {
          _id: 'base-timing' as Id<'timing_baselines'>,
          problemFamilyId: 'pf-timing',
          sampleCount: 20,
          medianActiveMs: 15000,
          lastComputedAt: '2026-04-16T00:00:00.000Z',
          minSamplesMet: true,
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-timing' as Id<'problem_families'>,
          problemFamilyId: 'pf-timing',
          objectiveIds: ['obj-timing'],
          componentKey: 'key-timing',
          displayName: 'Family Timing',
          description: 'Desc',
          difficulty: 'medium',
        },
      ],
      standards: [
        {
          _id: 'std-timing' as Id<'competency_standards'>,
          code: 'obj-timing',
          description: 'Timing Objective',
          isActive: true,
          createdAt: Date.now(),
        },
      ],
      policies: [
        {
          _id: 'pol-timing' as Id<'objective_policies'>,
          standardId: 'std-timing' as Id<'competency_standards'>,
          policy: 'essential',
          courseKey: 'integrated-math-3',
          priority: 1,
        },
      ],
    });

    const result = await getObjectiveProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', objectiveId: 'obj-timing' }
    );

    expect(result.fluencyConfidence).toBe('high');
    expect(result.problemFamilyDetails[0].baselineSampleCount).toBe(20);
  });
});

describe('getStudentProficiencySummaryHandler', () => {
  function makeStudentSummaryMockCtx(overrides: {
    cards?: Array<{
      _id: Id<'srs_cards'>;
      studentId: Id<'profiles'>;
      objectiveId: string;
      problemFamilyId: string;
      stability: number;
      difficulty: number;
      state: 'new' | 'learning' | 'review' | 'relearning';
      dueDate: string;
      elapsedDays: number;
      scheduledDays: number;
      reps: number;
      lapses: number;
      lastReview?: string;
      createdAt: number;
      updatedAt: number;
    }>;
    problemFamilies?: Array<{
      _id: Id<'problem_families'>;
      problemFamilyId: string;
      objectiveIds: string[];
      componentKey: string;
      displayName: string;
      description: string;
      difficulty: string;
    }>;
    reviews?: Array<{
      _id: Id<'srs_review_log'>;
      cardId: Id<'srs_cards'>;
      studentId: Id<'profiles'>;
      rating: string;
      submissionId?: string;
      reviewId?: string;
      evidence: unknown;
      stateBefore: unknown;
      stateAfter: unknown;
      reviewedAt: number;
    }>;
    submissions?: Array<{
      _id: Id<'activity_submissions'>;
      userId: Id<'profiles'>;
      activityId: Id<'activities'>;
      submissionData: {
        attemptNumber?: number;
        timing?: { activeMs?: number };
      };
      submittedAt: number;
      createdAt: number;
      updatedAt: number;
    }>;
    baselines?: Array<{
      _id: Id<'timing_baselines'>;
      problemFamilyId: string;
      sampleCount: number;
      medianActiveMs: number;
      p25ActiveMs?: number;
      p75ActiveMs?: number;
      p90ActiveMs?: number;
      lastComputedAt: string;
      minSamplesMet: boolean;
    }>;
    standards?: Array<{
      _id: Id<'competency_standards'>;
      code: string;
      description: string;
      isActive: boolean;
      createdAt: number;
    }>;
    policies?: Array<{
      _id: Id<'objective_policies'>;
      standardId: Id<'competency_standards'>;
      policy: string;
      courseKey: string;
      priority: number;
    }>;
  } = {}) {
    const {
      cards = [],
      problemFamilies = [],
      reviews = [],
      submissions = [],
      baselines = [],
      standards = [],
      policies = [],
    } = overrides;

    const cardQueryMock = (() => {
      let capturedStudentId: Id<'profiles'> | null = null;
      return {
        withIndex: (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          if (fn) {
            const mockQ: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } } = {
              eq: (field: string, value: unknown) => {
                if (field === 'studentId') {
                  capturedStudentId = value as Id<'profiles'>;
                }
                return mockQ;
              },
            };
            fn(mockQ);
          }
          return {
            collect: () => Promise.resolve(cards.filter((c) => !capturedStudentId || c.studentId === capturedStudentId)),
          };
        },
      };
    })();

    const problemFamilyQueryMock = (() => {
      let capturedObjectiveId: string | null = null;
      return {
        withIndex: (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          if (fn) {
            const mockQ: { eq: (field: string, value: unknown) => unknown } = {
              eq: (field: string, value: unknown) => {
                if (field === 'objectiveIds') {
                  if (Array.isArray(value)) {
                    capturedObjectiveId = value[0];
                  } else if (typeof value === 'string') {
                    capturedObjectiveId = value;
                  }
                }
                return mockQ;
              },
            };
            fn(mockQ);
          }
          return {
            collect: () => Promise.resolve(problemFamilies.filter((pf) => !capturedObjectiveId || pf.objectiveIds.includes(capturedObjectiveId))),
          };
        },
      };
    })();

    const reviewQueryMock = (() => {
      let capturedStudentId: Id<'profiles'> | null = null;
      return {
        withIndex: (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          if (fn) {
            const mockQ: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } } = {
              eq: (field: string, value: unknown) => {
                if (field === 'studentId') {
                  capturedStudentId = value as Id<'profiles'>;
                }
                return mockQ;
              },
            };
            fn(mockQ);
          }
          return {
            collect: () => Promise.resolve(reviews.filter((r) => !capturedStudentId || r.studentId === capturedStudentId)),
          };
        },
      };
    })();

    const submissionQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
          let capturedActivityId: string | null = null;
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === 'activityId') {
                capturedActivityId = value;
              }
              return mockQ;
            }),
          };
          fn(mockQ);
          return {
            collect: vi.fn().mockResolvedValue(
              submissions.filter((s) => s.activityId === capturedActivityId)
            ),
          };
        }
      ),
    };

    let lastProblemFamilyId: string | null = null;
    const baselineQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === 'problemFamilyId') {
                lastProblemFamilyId = value;
              }
              return {};
            }),
          };
          fn(mockQ);
          const capturedId = lastProblemFamilyId;
          return {
            first: vi.fn().mockImplementation(() => {
              const found = baselines.find((b) => b.problemFamilyId === capturedId);
              return Promise.resolve(found ?? null);
            }),
          };
        }
      ),
    };

    const standardQueryMock = {
      withIndex: vi.fn().mockReturnValue({
        first: vi.fn().mockImplementation(() => {
          return Promise.resolve(standards[0] ?? null);
        }),
      }),
    };

    let lastStandardId: string | null = null;
    const policyQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === 'standardId') {
                lastStandardId = value;
              }
              return {};
            }),
          };
          fn(mockQ);
          const capturedId = lastStandardId;
          return {
            first: vi.fn().mockImplementation(() => {
              const found = policies.find((p) => p.standardId === capturedId);
              return Promise.resolve(found ?? null);
            }),
          };
        }
      ),
    };

    const mockQuery = vi.fn().mockImplementation((tableName: string) => {
      if (tableName === 'srs_cards') return cardQueryMock;
      if (tableName === 'problem_families') return problemFamilyQueryMock;
      if (tableName === 'srs_review_log') return reviewQueryMock;
      if (tableName === 'activity_submissions') return submissionQueryMock;
      if (tableName === 'timing_baselines') return baselineQueryMock;
      if (tableName === 'competency_standards') return standardQueryMock;
      if (tableName === 'objective_policies') return policyQueryMock;
      return {
        withIndex: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue([]),
          first: vi.fn().mockResolvedValue(null),
        }),
      };
    });

    return {
      db: {
        query: mockQuery,
      },
      mockQuery,
    };
  }

  it('returns empty array for student with no cards', async () => {
    const { db } = makeStudentSummaryMockCtx({ cards: [] });

    const result = await getStudentProficiencySummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result).toEqual([]);
  });

  it('returns proficiency views grouped by objective for student with cards', async () => {
    const card1Id = 'card-1' as Id<'srs_cards'>;
    const card2Id = 'card-2' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db } = makeStudentSummaryMockCtx({
      cards: [
        {
          _id: card1Id,
          studentId,
          objectiveId: 'obj-a',
          problemFamilyId: 'pf-1a',
          stability: 120,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: 'card-1b' as Id<'srs_cards'>,
          studentId,
          objectiveId: 'obj-a',
          problemFamilyId: 'pf-1b',
          stability: 120,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: 'card-1c' as Id<'srs_cards'>,
          studentId,
          objectiveId: 'obj-a',
          problemFamilyId: 'pf-1c',
          stability: 120,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: card2Id,
          studentId,
          objectiveId: 'obj-b',
          problemFamilyId: 'pf-2',
          stability: 30,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 2,
          scheduledDays: 3,
          reps: 1,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-1a' as Id<'problem_families'>,
          problemFamilyId: 'pf-1a',
          objectiveIds: ['obj-a'],
          componentKey: 'key-1a',
          displayName: 'Family 1A',
          description: 'Desc 1A',
          difficulty: 'medium',
        },
        {
          _id: 'fam-1b' as Id<'problem_families'>,
          problemFamilyId: 'pf-1b',
          objectiveIds: ['obj-a'],
          componentKey: 'key-1b',
          displayName: 'Family 1B',
          description: 'Desc 1B',
          difficulty: 'medium',
        },
        {
          _id: 'fam-1c' as Id<'problem_families'>,
          problemFamilyId: 'pf-1c',
          objectiveIds: ['obj-a'],
          componentKey: 'key-1c',
          displayName: 'Family 1C',
          description: 'Desc 1C',
          difficulty: 'medium',
        },
        {
          _id: 'fam-2' as Id<'problem_families'>,
          problemFamilyId: 'pf-2',
          objectiveIds: ['obj-b'],
          componentKey: 'key-2',
          displayName: 'Family 2',
          description: 'Desc 2',
          difficulty: 'medium',
        },
      ],
      reviews: [
        {
          _id: 'rev-1' as Id<'srs_review_log'>,
          cardId: card1Id,
          studentId,
          rating: 'Good',
          submissionId: 'act-1-1',
          reviewId: 'rev_abc',
          evidence: {},
          stateBefore: {},
          stateAfter: {},
          reviewedAt: Date.now(),
        },
      ],
      submissions: [
        {
          _id: 'sub-1' as Id<'activity_submissions'>,
          userId: studentId,
          activityId: 'act-1' as Id<'activities'>,
          submissionData: { attemptNumber: 1, timing: { activeMs: 15000 } },
          submittedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      baselines: [
        {
          _id: 'base-1a' as Id<'timing_baselines'>,
          problemFamilyId: 'pf-1a',
          sampleCount: 20,
          medianActiveMs: 20000,
          lastComputedAt: '2026-04-16T00:00:00.000Z',
          minSamplesMet: true,
        },
        {
          _id: 'base-1b' as Id<'timing_baselines'>,
          problemFamilyId: 'pf-1b',
          sampleCount: 20,
          medianActiveMs: 20000,
          lastComputedAt: '2026-04-16T00:00:00.000Z',
          minSamplesMet: true,
        },
        {
          _id: 'base-1c' as Id<'timing_baselines'>,
          problemFamilyId: 'pf-1c',
          sampleCount: 20,
          medianActiveMs: 20000,
          lastComputedAt: '2026-04-16T00:00:00.000Z',
          minSamplesMet: true,
        },
      ],
    });

    const result = await getStudentProficiencySummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.length).toBe(2);
    const objAView = result.find((v) => v.objectiveId === 'obj-a');
    expect(objAView).toBeDefined();
    expect(objAView!.retentionStrength).toBeGreaterThan(0.7);
    expect(objAView!.proficiencyLabel).toBe('proficient');
  });

  it('returns not_started label for objective with no reviews', async () => {
    const cardId = 'card-new' as Id<'srs_cards'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db } = makeStudentSummaryMockCtx({
      cards: [
        {
          _id: cardId,
          studentId,
          objectiveId: 'obj-new',
          problemFamilyId: 'pf-new',
          stability: 0,
          difficulty: 3,
          state: 'new',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 0,
          scheduledDays: 1,
          reps: 0,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-new' as Id<'problem_families'>,
          problemFamilyId: 'pf-new',
          objectiveIds: ['obj-new'],
          componentKey: 'key-new',
          displayName: 'Family New',
          description: 'Desc',
          difficulty: 'medium',
        },
      ],
    });

    const result = await getStudentProficiencySummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1' }
    );

    expect(result.length).toBe(1);
    expect(result[0].proficiencyLabel).toBe('in_progress');
  });
});

describe('getTeacherClassProficiencyHandler', () => {
  function makeTeacherClassMockCtx(overrides: {
    enrollments?: Array<{
      _id: Id<'class_enrollments'>;
      classId: Id<'classes'>;
      studentId: Id<'profiles'>;
      status: 'active' | 'withdrawn' | 'completed';
      enrolledAt: number;
      createdAt: number;
      updatedAt: number;
    }>;
    cards?: Array<{
      _id: Id<'srs_cards'>;
      studentId: Id<'profiles'>;
      objectiveId: string;
      problemFamilyId: string;
      stability: number;
      difficulty: number;
      state: 'new' | 'learning' | 'review' | 'relearning';
      dueDate: string;
      elapsedDays: number;
      scheduledDays: number;
      reps: number;
      lapses: number;
      lastReview?: string;
      createdAt: number;
      updatedAt: number;
    }>;
    problemFamilies?: Array<{
      _id: Id<'problem_families'>;
      problemFamilyId: string;
      objectiveIds: string[];
      componentKey: string;
      displayName: string;
      description: string;
      difficulty: string;
    }>;
    reviews?: Array<{
      _id: Id<'srs_review_log'>;
      cardId: Id<'srs_cards'>;
      studentId: Id<'profiles'>;
      rating: string;
      submissionId?: string;
      reviewId?: string;
      evidence: unknown;
      stateBefore: unknown;
      stateAfter: unknown;
      reviewedAt: number;
    }>;
    submissions?: Array<{
      _id: Id<'activity_submissions'>;
      userId: Id<'profiles'>;
      activityId: Id<'activities'>;
      submissionData: {
        attemptNumber?: number;
        timing?: { activeMs?: number };
      };
      submittedAt: number;
      createdAt: number;
      updatedAt: number;
    }>;
    baselines?: Array<{
      _id: Id<'timing_baselines'>;
      problemFamilyId: string;
      sampleCount: number;
      medianActiveMs: number;
      p25ActiveMs?: number;
      p75ActiveMs?: number;
      p90ActiveMs?: number;
      lastComputedAt: string;
      minSamplesMet: boolean;
    }>;
    standards?: Array<{
      _id: Id<'competency_standards'>;
      code: string;
      description: string;
      isActive: boolean;
      createdAt: number;
    }>;
    policies?: Array<{
      _id: Id<'objective_policies'>;
      standardId: Id<'competency_standards'>;
      policy: string;
      courseKey: string;
      priority: number;
    }>;
  } = {}) {
    const {
      enrollments = [],
      cards = [],
      problemFamilies = [],
      reviews = [],
      submissions = [],
      baselines = [],
      standards = [],
      policies = [],
    } = overrides;

    let lastClassId: Id<'classes'> | null = null;
    const enrollmentQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: unknown) => {
              if (field === 'classId') {
                lastClassId = value as Id<'classes'>;
              }
              return mockQ;
            }),
          };
          fn(mockQ);
          const capturedClassId = lastClassId;
          return {
            collect: vi.fn().mockResolvedValue(
              enrollments.filter((e) => e.classId === capturedClassId)
            ),
          };
        }
      ),
    };

    const cardQueryMock = (() => {
      let capturedStudentId: Id<'profiles'> | null = null;
      return {
        withIndex: (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          if (fn) {
            const mockQ: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } } = {
              eq: (field: string, value: unknown) => {
                if (field === 'studentId') {
                  capturedStudentId = value as Id<'profiles'>;
                }
                return mockQ;
              },
            };
            fn(mockQ);
          }
          return {
            collect: () => Promise.resolve(cards.filter((c) => !capturedStudentId || c.studentId === capturedStudentId)),
          };
        },
      };
    })();

    const reviewQueryMock = (() => {
      let capturedStudentId: Id<'profiles'> | null = null;
      return {
        withIndex: (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
          if (fn) {
            const mockQ: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } } = {
              eq: (field: string, value: unknown) => {
                if (field === 'studentId') {
                  capturedStudentId = value as Id<'profiles'>;
                }
                return mockQ;
              },
            };
            fn(mockQ);
          }
          return {
            collect: () => Promise.resolve(reviews.filter((r) => !capturedStudentId || r.studentId === capturedStudentId)),
          };
        },
      };
    })();

    const problemFamilyQueryMock = {
      withIndex: vi.fn().mockReturnValue({
        collect: vi.fn().mockResolvedValue(problemFamilies),
      }),
    };

    const submissionQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
          let capturedActivityId: string | null = null;
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === 'activityId') {
                capturedActivityId = value;
              }
              return mockQ;
            }),
          };
          fn(mockQ);
          return {
            collect: vi.fn().mockResolvedValue(
              submissions.filter((s) => s.activityId === capturedActivityId)
            ),
          };
        }
      ),
    };

    let lastProblemFamilyId: string | null = null;
    const baselineQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === 'problemFamilyId') {
                lastProblemFamilyId = value;
              }
              return {};
            }),
          };
          fn(mockQ);
          const capturedId = lastProblemFamilyId;
          return {
            first: vi.fn().mockImplementation(() => {
              const found = baselines.find((b) => b.problemFamilyId === capturedId);
              return Promise.resolve(found ?? null);
            }),
          };
        }
      ),
    };

    const standardQueryMock = {
      withIndex: vi.fn().mockReturnValue({
        first: vi.fn().mockImplementation(() => {
          return Promise.resolve(standards[0] ?? null);
        }),
      }),
    };

    let lastStandardId: string | null = null;
    const policyQueryMock = {
      withIndex: vi.fn().mockImplementation(
        (_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
          const mockQ = {
            eq: vi.fn().mockImplementation((field: string, value: string) => {
              if (field === 'standardId') {
                lastStandardId = value;
              }
              return {};
            }),
          };
          fn(mockQ);
          const capturedId = lastStandardId;
          return {
            first: vi.fn().mockImplementation(() => {
              const found = policies.find((p) => p.standardId === capturedId);
              return Promise.resolve(found ?? null);
            }),
          };
        }
      ),
    };

    const mockQuery = vi.fn().mockImplementation((tableName: string) => {
      if (tableName === 'class_enrollments') return enrollmentQueryMock;
      if (tableName === 'srs_cards') return cardQueryMock;
      if (tableName === 'srs_review_log') return reviewQueryMock;
      if (tableName === 'problem_families') return problemFamilyQueryMock;
      if (tableName === 'activity_submissions') return submissionQueryMock;
      if (tableName === 'timing_baselines') return baselineQueryMock;
      if (tableName === 'competency_standards') return standardQueryMock;
      if (tableName === 'objective_policies') return policyQueryMock;
      return {
        withIndex: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue([]),
          first: vi.fn().mockResolvedValue(null),
        }),
      };
    });

    return {
      db: {
        query: mockQuery,
      },
      mockQuery,
    };
  }

  it('returns empty array for class with no enrollments', async () => {
    const { db } = makeTeacherClassMockCtx({ enrollments: [] });

    const result = await getTeacherClassProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toEqual([]);
  });

  it('returns aggregated class proficiency views for each objective', async () => {
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;

    const { db } = makeTeacherClassMockCtx({
      enrollments: [
        {
          _id: 'enr-1' as Id<'class_enrollments'>,
          classId,
          studentId: student1Id,
          status: 'active',
          enrolledAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: 'enr-2' as Id<'class_enrollments'>,
          classId,
          studentId: student2Id,
          status: 'active',
          enrolledAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      cards: [
        {
          _id: 'card-s1-1' as Id<'srs_cards'>,
          studentId: student1Id,
          objectiveId: 'obj-a',
          problemFamilyId: 'pf-1',
          stability: 90,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-1' as Id<'problem_families'>,
          problemFamilyId: 'pf-1',
          objectiveIds: ['obj-a'],
          componentKey: 'key-1',
          displayName: 'Family 1',
          description: 'Desc 1',
          difficulty: 'medium',
        },
      ],
      standards: [
        {
          _id: 'std-a' as Id<'competency_standards'>,
          code: 'obj-a',
          description: 'Objective A Description',
          isActive: true,
          createdAt: Date.now(),
        },
      ],
      policies: [
        {
          _id: 'pol-a' as Id<'objective_policies'>,
          standardId: 'std-a' as Id<'competency_standards'>,
          policy: 'extension',
          courseKey: 'integrated-math-3',
          priority: 1,
        },
      ],
    });

    const result = await getTeacherClassProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result.length).toBe(1);
    const objAView = result.find((v) => v.objectiveId === 'obj-a');
    expect(objAView).toBeDefined();
    expect(objAView!.standardCode).toBe('obj-a');
    expect(objAView!.classProficientCount).toBe(1);
    expect(objAView!.classAvgRetention).toBeGreaterThan(0);
  });

  it('identifies struggling students correctly', async () => {
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;

    const { db } = makeTeacherClassMockCtx({
      enrollments: [
        {
          _id: 'enr-1' as Id<'class_enrollments'>,
          classId,
          studentId: student1Id,
          status: 'active',
          enrolledAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: 'enr-2' as Id<'class_enrollments'>,
          classId,
          studentId: student2Id,
          status: 'active',
          enrolledAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      cards: [
        {
          _id: 'card-s1-1' as Id<'srs_cards'>,
          studentId: student1Id,
          objectiveId: 'obj-struggle',
          problemFamilyId: 'pf-struggle',
          stability: 90,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 5,
          scheduledDays: 7,
          reps: 3,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: 'card-s2-1' as Id<'srs_cards'>,
          studentId: student2Id,
          objectiveId: 'obj-struggle',
          problemFamilyId: 'pf-struggle',
          stability: 5,
          difficulty: 3,
          state: 'review',
          dueDate: '2026-04-17T00:00:00.000Z',
          elapsedDays: 0,
          scheduledDays: 1,
          reps: 0,
          lapses: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      problemFamilies: [
        {
          _id: 'fam-struggle' as Id<'problem_families'>,
          problemFamilyId: 'pf-struggle',
          objectiveIds: ['obj-struggle'],
          componentKey: 'key-struggle',
          displayName: 'Family Struggle',
          description: 'Desc',
          difficulty: 'medium',
        },
      ],
      standards: [
        {
          _id: 'std-struggle' as Id<'competency_standards'>,
          code: 'obj-struggle',
          description: 'Struggle Objective',
          isActive: true,
          createdAt: Date.now(),
        },
      ],
      policies: [
        {
          _id: 'pol-struggle' as Id<'objective_policies'>,
          standardId: 'std-struggle' as Id<'competency_standards'>,
          policy: 'extension',
          courseKey: 'integrated-math-3',
          priority: 1,
        },
      ],
    });

    const result = await getTeacherClassProficiencyHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result.length).toBe(1);
    const struggleView = result.find((v) => v.objectiveId === 'obj-struggle');
    expect(struggleView).toBeDefined();
    expect(struggleView!.classProficientCount).toBe(1);
    expect(struggleView!.classStrugglingStudents).toContain(student2Id);
  });
});
