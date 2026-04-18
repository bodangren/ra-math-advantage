import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  getWeakObjectivesHandler,
  getStrugglingStudentsHandler,
  getMisconceptionSummaryHandler,
} from '@/convex/teacher/srs-queries';
import type {
  TeacherProficiencyView,
  ObjectivePriority,
} from '@/lib/practice/objective-proficiency';

function makeTeacherSrsMockCtx(overrides: {
  enrollments?: Array<{
    _id: Id<'class_enrollments'>;
    classId: Id<'classes'>;
    studentId: Id<'profiles'>;
    status: 'active' | 'withdrawn' | 'completed';
    enrolledAt: number;
    createdAt: number;
    updatedAt: number;
  }>;
  profiles?: Array<{
    _id: Id<'profiles'>;
    username: string;
    displayName?: string | null;
    role: 'student' | 'teacher' | 'admin';
    organizationId: Id<'organizations'>;
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
  sessions?: Array<{
    _id: Id<'srs_sessions'>;
    studentId: Id<'profiles'>;
    startedAt: number;
    completedAt?: number;
    plannedCards: number;
    completedCards: number;
    config: unknown;
  }>;
  classes?: Array<{
    _id: Id<'classes'>;
    name: string;
    teacherId: Id<'profiles'>;
  }>;
  reviews?: Array<{
    _id: Id<'srs_review_log'>;
    cardId: Id<'srs_cards'>;
    studentId: Id<'profiles'>;
    rating: string;
    reviewedAt: number;
    evidence: { misconceptionTags?: string[]; [key: string]: unknown };
  }>;
} = {}) {
  const {
    enrollments = [],
    profiles = [],
    cards = [],
    sessions = [],
    classes = [],
    reviews = [],
  } = overrides;

  const enrollmentQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedClassId: Id<'classes'> | null = null;
        const mockQ = {
          eq: vi.fn().mockImplementation((field: string, value: unknown) => {
            if (field === 'classId') {
              capturedClassId = value as Id<'classes'>;
            }
            return mockQ;
          }),
        };
        fn(mockQ);
        const captured = capturedClassId;
        return {
          collect: vi.fn().mockResolvedValue(
            enrollments.filter((e) => e.classId === captured)
          ),
        };
      }
    ),
  };

  const profileQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedOrgId: Id<'organizations'> | null = null;
        if (fn) {
          const mockQ: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } } = {
            eq: (field: string, value: unknown) => {
              if (field === 'organizationId') {
                capturedOrgId = value as Id<'organizations'>;
              }
              return mockQ;
            },
          };
          fn(mockQ as Parameters<typeof fn>[0]);
        }
        return {
          collect: vi.fn().mockResolvedValue(
            profiles.filter((p) => !capturedOrgId || p.organizationId === capturedOrgId)
          ),
        };
      }
    ),
  };

  const cardQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => void) => {
        let capturedStudentId: Id<'profiles'> | null = null;
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
          collect: vi.fn().mockResolvedValue(
            cards.filter((c) => !capturedStudentId || c.studentId === capturedStudentId)
          ),
        };
      }
    ),
  };

  const sessionQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => void) => {
        let capturedStudentId: Id<'profiles'> | null = null;
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
          collect: vi.fn().mockResolvedValue(
            sessions.filter((s) => !capturedStudentId || s.studentId === capturedStudentId)
          ),
          order: vi.fn().mockReturnThis(),
        };
      }
    ),
  };

  const classQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedClassId: Id<'classes'> | null = null;
        if (fn) {
          const mockQ: { eq: (field: string, value: unknown) => unknown } = {
            eq: (field: string, value: unknown) => {
              if (field === '_id') {
                capturedClassId = value as Id<'classes'>;
              }
              return mockQ;
            },
          };
          fn(mockQ);
        }
        return {
          first: vi.fn().mockResolvedValue(
            classes.find((c) => c._id === capturedClassId) ?? null
          ),
        };
      }
    ),
  };

  const reviewQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => void) => {
        let capturedStudentId: Id<'profiles'> | null = null;
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
          collect: vi.fn().mockResolvedValue(
            reviews.filter((r) => !capturedStudentId || r.studentId === capturedStudentId)
          ),
          order: vi.fn().mockReturnThis(),
        };
      }
    ),
  };

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'class_enrollments') return enrollmentQueryMock;
    if (tableName === 'profiles') return profileQueryMock;
    if (tableName === 'srs_cards') return cardQueryMock;
    if (tableName === 'srs_sessions') return sessionQueryMock;
    if (tableName === 'classes') return classQueryMock;
    if (tableName === 'srs_review_log') return reviewQueryMock;
    return {
      withIndex: vi.fn().mockReturnValue({
        collect: vi.fn().mockResolvedValue([]),
        first: vi.fn().mockResolvedValue(null),
      }),
    };
  });

  const mockGet = vi.fn().mockImplementation((tableName: string, id: string) => {
    if (tableName === 'profiles') {
      return Promise.resolve(profiles.find((p) => p._id === id) ?? null);
    }
    if (tableName === 'classes') {
      return Promise.resolve(classes.find((c) => c._id === id) ?? null);
    }
    if (tableName === 'srs_cards') {
      return Promise.resolve(cards.find((c) => c._id === id) ?? null);
    }
    return Promise.resolve(null);
  });

  return {
    db: {
      query: mockQuery,
      get: mockGet,
    },
    mockQuery,
    mockGet,
  };
}

async function getClassSrsHealthHandler(
  ctx: import('@/convex/_generated/server').QueryCtx,
  args: { classId: string }
) {
  const classDocId = args.classId as Id<'classes'>;

  const enrollments = await ctx.db
    .query('class_enrollments')
    .withIndex('by_class', (q) => q.eq('classId', classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === 'active');
  const studentIds = activeStudents.map((e) => e.studentId);

  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  let totalActiveStudents = 0;
  let practicedToday = 0;
  let totalRetention = 0;
  let cardCount = 0;

  for (const studentId of studentIds) {
    const cards = await ctx.db
      .query('srs_cards')
      .withIndex('by_student', (q) => q.eq('studentId', studentId))
      .collect();

    if (cards.length > 0) {
      totalActiveStudents++;
      for (const card of cards) {
        totalRetention += card.stability;
        cardCount++;
      }
    }

    const sessions = await ctx.db
      .query('srs_sessions')
      .withIndex('by_student', (q) => q.eq('studentId', studentId))
      .collect();

    const completedToday = sessions.some(
      (s) => s.completedAt && s.completedAt >= todayStartMs
    );
    if (completedToday) {
      practicedToday++;
    }
  }

  const avgRetention = cardCount > 0 ? totalRetention / cardCount : 0;

  return {
    totalActiveStudents,
    practicedToday,
    avgRetention,
    totalCards: cardCount,
  };
}

async function getOverdueLoadHandler(
  ctx: import('@/convex/_generated/server').QueryCtx,
  args: { classId: string }
) {
  const classDocId = args.classId as Id<'classes'>;

  const enrollments = await ctx.db
    .query('class_enrollments')
    .withIndex('by_class', (q) => q.eq('classId', classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === 'active');
  const studentIds = activeStudents.map((e) => e.studentId);

  const now = new Date().toISOString();

  const perStudent: Array<{ studentId: string; overdueCount: number }> = [];
  let totalOverdue = 0;

  for (const studentId of studentIds) {
    const cards = await ctx.db
      .query('srs_cards')
      .withIndex('by_student', (q) => q.eq('studentId', studentId))
      .collect();

    const overdueCards = cards.filter((c) => c.dueDate < now);
    const overdueCount = overdueCards.length;
    totalOverdue += overdueCount;
    perStudent.push({ studentId, overdueCount });
  }

  return {
    totalOverdue,
    perStudent,
  };
}

async function getPracticeStreaksHandler(
  ctx: import('@/convex/_generated/server').QueryCtx,
  args: { classId: string; limit?: number }
) {
  const limit = args.limit ?? 5;
  const classDocId = args.classId as Id<'classes'>;

  const enrollments = await ctx.db
    .query('class_enrollments')
    .withIndex('by_class', (q) => q.eq('classId', classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === 'active');

  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

  const studentStreaks: Array<{ studentId: string; displayName: string; streak: number }> = [];

  for (const enrollment of activeStudents) {
    const profile = await ctx.db.get('profiles', enrollment.studentId);
    if (!profile) continue;

    const sessions = await ctx.db
      .query('srs_sessions')
      .withIndex('by_student', (q) => q.eq('studentId', enrollment.studentId))
      .collect();

    const completedSessions = sessions.filter((s) => s.completedAt !== undefined);

    if (completedSessions.length === 0) continue;

    const uniqueDays = Array.from(
      new Set(completedSessions.map((s) => {
        const d = new Date(s.completedAt!);
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      }))
    ).sort((a, b) => b - a);

    const mostRecent = uniqueDays[0];
    let streak = 0;

    if (mostRecent === todayMs || mostRecent === yesterdayMs) {
      streak = 1;
      let checkDay = mostRecent;
      for (let i = 1; i < uniqueDays.length; i++) {
        const expected = checkDay - 24 * 60 * 60 * 1000;
        if (uniqueDays[i] === expected) {
          streak++;
          checkDay = uniqueDays[i];
        } else if (uniqueDays[i] < expected) {
          break;
        }
      }
    }

    if (streak > 0) {
      studentStreaks.push({
        studentId: enrollment.studentId,
        displayName: profile.displayName ?? profile.username,
        streak,
      });
    }
  }

  studentStreaks.sort((a, b) => b.streak - a.streak);
  return studentStreaks.slice(0, limit);
}

describe('getClassSrsHealthHandler', () => {
  it('returns zero counts when no students enrolled', async () => {
    const { db } = makeTeacherSrsMockCtx({ classes: [] });

    const result = await getClassSrsHealthHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'nonexistent' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalActiveStudents).toBe(0);
    expect(result!.practicedToday).toBe(0);
    expect(result!.avgRetention).toBe(0);
    expect(result!.totalCards).toBe(0);
  });

  it('returns zero counts for class with no enrollments', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [],
    });

    const result = await getClassSrsHealthHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalActiveStudents).toBe(0);
    expect(result!.practicedToday).toBe(0);
    expect(result!.avgRetention).toBe(0);
    expect(result!.totalCards).toBe(0);
  });

  it('returns total active students count correctly', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 50, difficulty: 3, state: 'review', dueDate: '2026-04-20T00:00:00.000Z', elapsedDays: 2, scheduledDays: 5, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-2' as Id<'srs_cards'>, studentId: student2Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2026-04-20T00:00:00.000Z', elapsedDays: 1, scheduledDays: 3, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      sessions: [],
    });

    const result = await getClassSrsHealthHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalActiveStudents).toBe(2);
    expect(result!.totalCards).toBe(2);
  });

  it('calculates average retention across all cards', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 60, difficulty: 3, state: 'review', dueDate: '2026-04-20T00:00:00.000Z', elapsedDays: 2, scheduledDays: 5, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-2' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-2', stability: 40, difficulty: 3, state: 'review', dueDate: '2026-04-20T00:00:00.000Z', elapsedDays: 1, scheduledDays: 3, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      sessions: [],
    });

    const result = await getClassSrsHealthHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalCards).toBe(2);
    expect(result!.avgRetention).toBe(50);
  });

  it('counts students who practiced today', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [],
      sessions: [
        { _id: 'session-1' as Id<'srs_sessions'>, studentId: student1Id, startedAt: yesterdayMs, completedAt: yesterdayMs + 30 * 60 * 1000, plannedCards: 10, completedCards: 10, config: {} },
        { _id: 'session-2' as Id<'srs_sessions'>, studentId: student2Id, startedAt: todayMs, completedAt: todayMs + 30 * 60 * 1000, plannedCards: 5, completedCards: 5, config: {} },
      ],
    });

    const result = await getClassSrsHealthHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).not.toBeNull();
    expect(result!.practicedToday).toBe(1);
  });
});

describe('getOverdueLoadHandler', () => {
  it('returns zero overdue when no students enrolled', async () => {
    const { db } = makeTeacherSrsMockCtx({ classes: [] });

    const result = await getOverdueLoadHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'nonexistent' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalOverdue).toBe(0);
    expect(result!.perStudent).toEqual([]);
  });

  it('returns zero overdue for class with no cards', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [],
      cards: [],
    });

    const result = await getOverdueLoadHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalOverdue).toBe(0);
    expect(result!.perStudent).toEqual([]);
  });

  it('correctly identifies overdue cards', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2020-01-01T00:00:00.000Z', elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-2' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-3' as Id<'srs_cards'>, studentId: student2Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2020-01-01T00:00:00.000Z', elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const result = await getOverdueLoadHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).not.toBeNull();
    expect(result!.totalOverdue).toBe(2);
    expect(result!.perStudent).toHaveLength(2);
    const s1Overdue = result!.perStudent.find((s) => s.studentId === student1Id);
    const s2Overdue = result!.perStudent.find((s) => s.studentId === student2Id);
    expect(s1Overdue!.overdueCount).toBe(1);
    expect(s2Overdue!.overdueCount).toBe(1);
  });
});

describe('getPracticeStreaksHandler', () => {
  it('returns empty array for class with no students', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [],
    });

    const result = await getPracticeStreaksHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toEqual([]);
  });

  it('returns students sorted by streak length descending', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;
    const twoDaysAgoMs = todayMs - 2 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      profiles: [
        { _id: student1Id, username: 'student1', displayName: 'Alice Student', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
        { _id: student2Id, username: 'student2', displayName: 'Bob Student', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      sessions: [
        { _id: 'session-s1-1' as Id<'srs_sessions'>, studentId: student1Id, startedAt: todayMs, completedAt: todayMs + 30 * 60 * 1000, plannedCards: 10, completedCards: 10, config: {} },
        { _id: 'session-s1-2' as Id<'srs_sessions'>, studentId: student1Id, startedAt: yesterdayMs, completedAt: yesterdayMs + 30 * 60 * 1000, plannedCards: 10, completedCards: 10, config: {} },
        { _id: 'session-s1-3' as Id<'srs_sessions'>, studentId: student1Id, startedAt: twoDaysAgoMs, completedAt: twoDaysAgoMs + 30 * 60 * 1000, plannedCards: 10, completedCards: 10, config: {} },
        { _id: 'session-s2-1' as Id<'srs_sessions'>, studentId: student2Id, startedAt: todayMs, completedAt: todayMs + 30 * 60 * 1000, plannedCards: 5, completedCards: 5, config: {} },
        { _id: 'session-s2-2' as Id<'srs_sessions'>, studentId: student2Id, startedAt: yesterdayMs, completedAt: yesterdayMs + 30 * 60 * 1000, plannedCards: 5, completedCards: 5, config: {} },
      ],
    });

    const result = await getPracticeStreaksHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].displayName).toBe('Alice Student');
    expect(result[0].streak).toBe(3);
    expect(result[1].displayName).toBe('Bob Student');
    expect(result[1].streak).toBe(2);
  });

  it('caps at top 5 by default', async () => {
    const classId = 'class-1' as Id<'classes'>;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

    const enrollments = [];
    const sessions = [];
    const profiles = [];

    for (let i = 0; i < 10; i++) {
      const studentId = `student-${i}` as Id<'profiles'>;
      enrollments.push({
        _id: `enr-${i}` as Id<'class_enrollments'>,
        classId,
        studentId,
        status: 'active' as const,
        enrolledAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      profiles.push({
        _id: studentId,
        username: `student${i}`,
        displayName: `Student ${i}`,
        role: 'student' as const,
        organizationId: 'org-1' as Id<'organizations'>,
      });
      sessions.push({
        _id: `session-${i}` as Id<'srs_sessions'>,
        studentId,
        startedAt: todayMs,
        completedAt: todayMs + 30 * 60 * 1000,
        plannedCards: 5,
        completedCards: 5,
        config: {},
      });
      sessions.push({
        _id: `session-${i}-y` as Id<'srs_sessions'>,
        studentId,
        startedAt: yesterdayMs,
        completedAt: yesterdayMs + 30 * 60 * 1000,
        plannedCards: 5,
        completedCards: 5,
        config: {},
      });
    }

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments,
      profiles,
      sessions,
    });

    const result = await getPracticeStreaksHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(5);
  });

  it('excludes students with no completed sessions', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      profiles: [
        { _id: student1Id, username: 'student1', displayName: 'Active Student', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
        { _id: student2Id, username: 'student2', displayName: 'Inactive Student', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      sessions: [
        { _id: 'session-1' as Id<'srs_sessions'>, studentId: student1Id, startedAt: Date.now(), completedAt: Date.now(), plannedCards: 10, completedCards: 10, config: {} },
      ],
    });

    const result = await getPracticeStreaksHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Active Student');
  });
});

function makeMockProficiencyView(
  overrides: Partial<TeacherProficiencyView> &
    Pick<TeacherProficiencyView, 'objectiveId' | 'classProficientCount'>
): TeacherProficiencyView {
  return {
    standardCode: overrides.objectiveId,
    standardDescription: '',
    priority: 'essential' as ObjectivePriority,
    proficiencyLabel: 'in_progress',
    retentionStrength: 0.5,
    practiceCoverage: 0.5,
    fluencyConfidence: 'medium',
    evidenceConfidence: 'medium',
    isProficient: false,
    problemFamilyDetails: [],
    missingBaselines: [],
    lowConfidenceReasons: [],
    guidance: '',
    classAvgRetention: 0.5,
    classStrugglingStudents: [],
    ...overrides,
  };
}

describe('getWeakObjectivesHandler', () => {
  it('returns empty array when no students enrolled', async () => {
    const { db } = makeTeacherSrsMockCtx({ enrollments: [] });

    const result = await getWeakObjectivesHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' },
      async () => []
    );

    expect(result).toEqual([]);
  });

  it('returns only objectives where <50% of class is proficient', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const mockProficiency: TeacherProficiencyView[] = [
      makeMockProficiencyView({
        objectiveId: 'obj-1',
        classProficientCount: 0,
        classAvgRetention: 0.3,
        classStrugglingStudents: [student1Id, student2Id],
        priority: 'essential',
        standardCode: 'S1',
        standardDescription: 'Objective 1',
      }),
      makeMockProficiencyView({
        objectiveId: 'obj-2',
        classProficientCount: 2,
        classAvgRetention: 0.9,
        classStrugglingStudents: [],
        priority: 'essential',
        standardCode: 'S2',
        standardDescription: 'Objective 2',
      }),
    ];

    const result = await getWeakObjectivesHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' },
      async () => mockProficiency
    );

    expect(result).toHaveLength(1);
    expect(result[0].objectiveId).toBe('obj-1');
    expect(result[0].proficientPercent).toBe(0);
    expect(result[0].avgRetention).toBe(0.3);
    expect(result[0].strugglingStudentCount).toBe(2);
    expect(result[0].standardCode).toBe('S1');
    expect(result[0].standardDescription).toBe('Objective 1');
  });

  it('sorts by essential priority first, then proficiency ascending', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const mockProficiency: TeacherProficiencyView[] = [
      makeMockProficiencyView({
        objectiveId: 'obj-supporting',
        classProficientCount: 0,
        classAvgRetention: 0.3,
        priority: 'supporting',
      }),
      makeMockProficiencyView({
        objectiveId: 'obj-essential-low',
        classProficientCount: 0,
        classAvgRetention: 0.2,
        priority: 'essential',
      }),
      makeMockProficiencyView({
        objectiveId: 'obj-essential-high',
        classProficientCount: 0,
        classAvgRetention: 0.5,
        priority: 'essential',
      }),
      makeMockProficiencyView({
        objectiveId: 'obj-extension',
        classProficientCount: 0,
        classAvgRetention: 0.1,
        priority: 'extension',
      }),
    ];

    const result = await getWeakObjectivesHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' },
      async () => mockProficiency
    );

    expect(result).toHaveLength(4);
    expect(result[0].objectiveId).toBe('obj-essential-low');
    expect(result[1].objectiveId).toBe('obj-essential-high');
    expect(result[2].objectiveId).toBe('obj-supporting');
    expect(result[3].objectiveId).toBe('obj-extension');
  });

  it('returns empty result when all objectives proficient', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const mockProficiency: TeacherProficiencyView[] = [
      makeMockProficiencyView({
        objectiveId: 'obj-1',
        classProficientCount: 1,
        classAvgRetention: 0.9,
        priority: 'essential',
      }),
    ];

    const result = await getWeakObjectivesHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' },
      async () => mockProficiency
    );

    expect(result).toEqual([]);
  });

  it('returns empty result when no proficiency data yet', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const result = await getWeakObjectivesHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' },
      async () => []
    );

    expect(result).toEqual([]);
  });
});

describe('getStrugglingStudentsHandler', () => {
  it('returns empty array when no students enrolled', async () => {
    const { db } = makeTeacherSrsMockCtx({ enrollments: [] });

    const result = await getStrugglingStudentsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toEqual([]);
  });

  it('returns empty array when no students have SRS cards', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [],
    });

    const result = await getStrugglingStudentsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toEqual([]);
  });

  it('returns students ranked by overdue count then avg retention', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const student2Id = 'student-2' as Id<'profiles'>;
    const student3Id = 'student-3' as Id<'profiles'>;

    const pastDue = '2020-01-01T00:00:00.000Z';
    const futureDue = '2030-01-01T00:00:00.000Z';

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-2' as Id<'class_enrollments'>, classId, studentId: student2Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'enr-3' as Id<'class_enrollments'>, classId, studentId: student3Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      profiles: [
        { _id: student1Id, username: 'student1', displayName: 'Alice', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
        { _id: student2Id, username: 'student2', displayName: 'Bob', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
        { _id: student3Id, username: 'student3', displayName: 'Carol', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-a', problemFamilyId: 'pf-1', stability: 10, difficulty: 3, state: 'review', dueDate: pastDue, elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-2' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-b', problemFamilyId: 'pf-2', stability: 20, difficulty: 3, state: 'review', dueDate: pastDue, elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-3' as Id<'srs_cards'>, studentId: student2Id, objectiveId: 'obj-a', problemFamilyId: 'pf-1', stability: 15, difficulty: 3, state: 'review', dueDate: pastDue, elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-4' as Id<'srs_cards'>, studentId: student2Id, objectiveId: 'obj-b', problemFamilyId: 'pf-2', stability: 25, difficulty: 3, state: 'review', dueDate: futureDue, elapsedDays: 0, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-5' as Id<'srs_cards'>, studentId: student3Id, objectiveId: 'obj-a', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: futureDue, elapsedDays: 0, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-6' as Id<'srs_cards'>, studentId: student3Id, objectiveId: 'obj-b', problemFamilyId: 'pf-2', stability: 40, difficulty: 3, state: 'review', dueDate: futureDue, elapsedDays: 0, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const result = await getStrugglingStudentsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].studentId).toBe(student1Id);
    expect(result[0].overdueCount).toBe(2);
    expect(result[0].avgRetention).toBe(15);
    expect(result[0].weakestObjective).toBe('obj-a');

    expect(result[1].studentId).toBe(student2Id);
    expect(result[1].overdueCount).toBe(1);
    expect(result[1].avgRetention).toBe(20);

    expect(result[2].studentId).toBe(student3Id);
    expect(result[2].overdueCount).toBe(0);
    expect(result[2].avgRetention).toBe(35);
  });

  it('includes correct student names', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      profiles: [
        { _id: student1Id, username: 'student1', displayName: 'Alice Student', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 50, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const result = await getStrugglingStudentsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Alice Student');
  });

  it('limits to top 10 students by default', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const enrollments = [];
    const profiles = [];
    const cards = [];

    for (let i = 0; i < 15; i++) {
      const studentId = `student-${i}` as Id<'profiles'>;
      enrollments.push({
        _id: `enr-${i}` as Id<'class_enrollments'>,
        classId,
        studentId,
        status: 'active' as const,
        enrolledAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      profiles.push({
        _id: studentId,
        username: `student${i}`,
        displayName: `Student ${i}`,
        role: 'student' as const,
        organizationId: 'org-1' as Id<'organizations'>,
      });
      cards.push({
        _id: `card-${i}` as Id<'srs_cards'>,
        studentId,
        objectiveId: 'obj-1',
        problemFamilyId: 'pf-1',
        stability: 50 - i,
        difficulty: 3,
        state: 'review' as const,
        dueDate: '2020-01-01T00:00:00.000Z',
        elapsedDays: 100,
        scheduledDays: 7,
        reps: 3,
        lapses: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments,
      profiles,
      cards,
    });

    const result = await getStrugglingStudentsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(10);
  });

  it('breaks ties on weakest objective by lowest avg stability then most overdue', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const pastDue = '2020-01-01T00:00:00.000Z';
    const futureDue = '2030-01-01T00:00:00.000Z';

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      profiles: [
        { _id: student1Id, username: 'student1', displayName: 'Alice', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-a', problemFamilyId: 'pf-1', stability: 20, difficulty: 3, state: 'review', dueDate: pastDue, elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-2' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-a', problemFamilyId: 'pf-2', stability: 20, difficulty: 3, state: 'review', dueDate: futureDue, elapsedDays: 0, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: 'card-3' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-b', problemFamilyId: 'pf-3', stability: 10, difficulty: 3, state: 'review', dueDate: pastDue, elapsedDays: 100, scheduledDays: 7, reps: 3, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
    });

    const result = await getStrugglingStudentsHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].weakestObjective).toBe('obj-b');
  });
});

describe('getMisconceptionSummaryHandler', () => {
  it('returns empty array when no students enrolled', async () => {
    const { db } = makeTeacherSrsMockCtx({ enrollments: [] });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toEqual([]);
  });

  it('returns empty array when no review logs exist', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: 'card-1' as Id<'srs_cards'>, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [],
    });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toEqual([]);
  });

  it('aggregates misconceptionTags from review logs in last 7 days', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const card1Id = 'card-1' as Id<'srs_cards'>;

    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: card1Id, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [
        { _id: 'rev-1' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: threeDaysAgo, evidence: { misconceptionTags: ['sign-error'] } },
        { _id: 'rev-2' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: tenDaysAgo, evidence: { misconceptionTags: ['sign-error'] } },
      ],
    });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('sign-error');
    expect(result[0].count).toBe(1);
  });

  it('returns tags with frequency count and affected objectives', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const card1Id = 'card-1' as Id<'srs_cards'>;
    const card2Id = 'card-2' as Id<'srs_cards'>;

    const now = Date.now();
    const recentTime = now - 2 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: card1Id, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: card2Id, studentId: student1Id, objectiveId: 'obj-2', problemFamilyId: 'pf-2', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [
        { _id: 'rev-1' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['sign-error', 'distribution-error'] } },
        { _id: 'rev-2' as Id<'srs_review_log'>, cardId: card2Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['sign-error'] } },
      ],
    });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].tag).toBe('sign-error');
    expect(result[0].count).toBe(2);
    expect(result[0].affectedObjectives).toContain('obj-1');
    expect(result[0].affectedObjectives).toContain('obj-2');

    expect(result[1].tag).toBe('distribution-error');
    expect(result[1].count).toBe(1);
    expect(result[1].affectedObjectives).toContain('obj-1');
  });

  it('sorts by frequency descending', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const card1Id = 'card-1' as Id<'srs_cards'>;
    const card2Id = 'card-2' as Id<'srs_cards'>;
    const card3Id = 'card-3' as Id<'srs_cards'>;

    const now = Date.now();
    const recentTime = now - 2 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: card1Id, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: card2Id, studentId: student1Id, objectiveId: 'obj-2', problemFamilyId: 'pf-2', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: card3Id, studentId: student1Id, objectiveId: 'obj-3', problemFamilyId: 'pf-3', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [
        { _id: 'rev-1' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['rare-error'] } },
        { _id: 'rev-2' as Id<'srs_review_log'>, cardId: card2Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['common-error', 'common-error'] } },
        { _id: 'rev-3' as Id<'srs_review_log'>, cardId: card3Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['common-error'] } },
      ],
    });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].tag).toBe('common-error');
    expect(result[0].count).toBe(3);
    expect(result[1].tag).toBe('rare-error');
    expect(result[1].count).toBe(1);
  });

  it('respects configurable time window', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const card1Id = 'card-1' as Id<'srs_cards'>;

    const now = Date.now();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: card1Id, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [
        { _id: 'rev-1' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: fiveDaysAgo, evidence: { misconceptionTags: ['recent-error'] } },
        { _id: 'rev-2' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: tenDaysAgo, evidence: { misconceptionTags: ['old-error'] } },
      ],
    });

    const result7Days = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );
    expect(result7Days).toHaveLength(1);
    expect(result7Days[0].tag).toBe('recent-error');

    const result14Days = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1', sinceDays: 14 }
    );
    expect(result14Days).toHaveLength(2);
  });

  it('handles reviews with no misconceptionTags', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const card1Id = 'card-1' as Id<'srs_cards'>;
    const card2Id = 'card-2' as Id<'srs_cards'>;

    const now = Date.now();
    const recentTime = now - 2 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: card1Id, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
        { _id: card2Id, studentId: student1Id, objectiveId: 'obj-2', problemFamilyId: 'pf-2', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [
        { _id: 'rev-1' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'good', reviewedAt: recentTime, evidence: {} },
        { _id: 'rev-2' as Id<'srs_review_log'>, cardId: card2Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['sign-error'] } },
      ],
    });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('sign-error');
    expect(result[0].count).toBe(1);
  });

  it('deduplicates tags across reviews for same objective', async () => {
    const classId = 'class-1' as Id<'classes'>;
    const student1Id = 'student-1' as Id<'profiles'>;
    const card1Id = 'card-1' as Id<'srs_cards'>;

    const now = Date.now();
    const recentTime = now - 2 * 24 * 60 * 60 * 1000;

    const { db } = makeTeacherSrsMockCtx({
      classes: [{ _id: classId, name: 'Math Class', teacherId: 'teacher-1' as Id<'profiles'> }],
      enrollments: [
        { _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId: student1Id, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
      cards: [
        { _id: card1Id, studentId: student1Id, objectiveId: 'obj-1', problemFamilyId: 'pf-1', stability: 30, difficulty: 3, state: 'review', dueDate: '2030-01-01T00:00:00.000Z', elapsedDays: 0, scheduledDays: 7, reps: 1, lapses: 0, createdAt: Date.now(), updatedAt: Date.now() },
      ],
      reviews: [
        { _id: 'rev-1' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime, evidence: { misconceptionTags: ['sign-error'] } },
        { _id: 'rev-2' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime + 1000, evidence: { misconceptionTags: ['sign-error'] } },
        { _id: 'rev-3' as Id<'srs_review_log'>, cardId: card1Id, studentId: student1Id, rating: 'again', reviewedAt: recentTime + 2000, evidence: { misconceptionTags: ['sign-error'] } },
      ],
    });

    const result = await getMisconceptionSummaryHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { classId: 'class-1' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('sign-error');
    expect(result[0].count).toBe(3);
    expect(result[0].affectedObjectives).toEqual(['obj-1']);
  });
});