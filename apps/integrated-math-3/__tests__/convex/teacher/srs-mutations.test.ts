import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import {
  updateObjectivePriorityHandler,
  resetStudentCardsHandler,
  addExtraCardsHandler,
  VALID_PRIORITIES,
} from '@/convex/teacher/srs-mutations';
import type { MutationCtx } from '@/convex/_generated/server';

function makeMutationMockCtx(overrides: {
  profiles?: Array<{
    _id: Id<'profiles'>;
    username: string;
    displayName?: string;
    role: 'student' | 'teacher' | 'admin';
    organizationId: Id<'organizations'>;
  }>;
  classes?: Array<{
    _id: Id<'classes'>;
    name: string;
    teacherId: Id<'profiles'>;
  }>;
  enrollments?: Array<{
    _id: Id<'class_enrollments'>;
    classId: Id<'classes'>;
    studentId: Id<'profiles'>;
    status: 'active' | 'withdrawn' | 'completed';
    enrolledAt: number;
    createdAt: number;
    updatedAt: number;
  }>;
  standards?: Array<{
    _id: Id<'competency_standards'>;
    code: string;
    description: string;
    isActive: boolean;
    createdAt: number;
  }>;
  objectivePolicies?: Array<{
    _id: Id<'objective_policies'>;
    standardId: Id<'competency_standards'>;
    policy: string;
    courseKey: string;
    priority: number;
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
    componentKey: string;
    displayName: string;
    description: string;
    objectiveIds: string[];
    difficulty: string;
  }>;
} = {}) {
  const {
    profiles = [],
    classes = [],
    enrollments = [],
    standards = [],
    objectivePolicies = [],
    cards = [],
    problemFamilies = [],
  } = overrides;

  const enrollmentQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedClassId: Id<'classes'> | null = null;
        let capturedStudentId: Id<'profiles'> | null = null;
        const mockQ = {
          eq: vi.fn().mockImplementation((field: string, value: unknown) => {
            if (field === 'classId') capturedClassId = value as Id<'classes'>;
            if (field === 'studentId') capturedStudentId = value as Id<'profiles'>;
            return mockQ;
          }),
        };
        fn(mockQ);
        const cClassId = capturedClassId;
        const cStudentId = capturedStudentId;
        return {
          collect: vi.fn().mockResolvedValue(
            enrollments.filter((e) => {
              if (cClassId && e.classId !== cClassId) return false;
              if (cStudentId && e.studentId !== cStudentId) return false;
              return true;
            })
          ),
          first: vi.fn().mockResolvedValue(
            enrollments.find((e) => {
              if (cClassId && e.classId !== cClassId) return false;
              if (cStudentId && e.studentId !== cStudentId) return false;
              return true;
            }) ?? null
          ),
        };
      }
    ),
  };

  const standardQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedCode: string | null = null;
        let capturedStandardId: Id<'competency_standards'> | null = null;
        if (fn) {
          const mockQ: { eq: (field: string, value: unknown) => unknown } = {
            eq: (field: string, value: unknown) => {
              if (field === 'code') capturedCode = value as string;
              if (field === 'standardId') capturedStandardId = value as Id<'competency_standards'>;
              return mockQ;
            },
          };
          fn(mockQ);
        }
        const cCode = capturedCode;
        const cStandardId = capturedStandardId;
        return {
          first: vi.fn().mockResolvedValue(
            standards.find((s) => {
              if (cCode && s.code !== cCode) return false;
              if (cStandardId && s._id !== cStandardId) return false;
              return true;
            }) ?? null
          ),
          collect: vi.fn().mockResolvedValue(
            standards.filter((s) => {
              if (cCode && s.code !== cCode) return false;
              if (cStandardId && s._id !== cStandardId) return false;
              return true;
            })
          ),
        };
      }
    ),
  };

  const policyQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedStandardId: Id<'competency_standards'> | null = null;
        let capturedCourseKey: string | null = null;
        if (fn) {
          const mockQ: { eq: (field: string, value: unknown) => unknown } = {
            eq: (field: string, value: unknown) => {
              if (field === 'standardId') capturedStandardId = value as Id<'competency_standards'>;
              if (field === 'courseKey') capturedCourseKey = value as string;
              return mockQ;
            },
          };
          fn(mockQ);
        }
        const cStandardId = capturedStandardId;
        const cCourseKey = capturedCourseKey;
        return {
          first: vi.fn().mockResolvedValue(
            objectivePolicies.find((p) => {
              if (cStandardId && p.standardId !== cStandardId) return false;
              if (cCourseKey && p.courseKey !== cCourseKey) return false;
              return true;
            }) ?? null
          ),
          collect: vi.fn().mockResolvedValue(
            objectivePolicies.filter((p) => {
              if (cStandardId && p.standardId !== cStandardId) return false;
              if (cCourseKey && p.courseKey !== cCourseKey) return false;
              return true;
            })
          ),
        };
      }
    ),
  };

  const cardQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => void) => {
        let capturedStudentId: Id<'profiles'> | null = null;
        let capturedObjectiveId: string | null = null;
        let capturedProblemFamilyId: string | null = null;
        if (fn) {
          const mockQ: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } } = {
            eq: (field: string, value: unknown) => {
              if (field === 'studentId') capturedStudentId = value as Id<'profiles'>;
              if (field === 'objectiveId') capturedObjectiveId = value as string;
              if (field === 'problemFamilyId') capturedProblemFamilyId = value as string;
              return mockQ;
            },
          };
          fn(mockQ);
        }
        const cStudentId = capturedStudentId;
        const cObjectiveId = capturedObjectiveId;
        const cProblemFamilyId = capturedProblemFamilyId;
        return {
          first: vi.fn().mockResolvedValue(
            cards.find((c) => {
              if (cStudentId && c.studentId !== cStudentId) return false;
              if (cObjectiveId && c.objectiveId !== cObjectiveId) return false;
              if (cProblemFamilyId && c.problemFamilyId !== cProblemFamilyId) return false;
              return true;
            }) ?? null
          ),
          collect: vi.fn().mockResolvedValue(
            cards.filter((c) => {
              if (cStudentId && c.studentId !== cStudentId) return false;
              if (cObjectiveId && c.objectiveId !== cObjectiveId) return false;
              if (cProblemFamilyId && c.problemFamilyId !== cProblemFamilyId) return false;
              return true;
            })
          ),
        };
      }
    ),
  };

  const problemFamilyQueryMock = {
    withIndex: vi.fn().mockImplementation(
      (_indexName: string, fn?: (q: { eq: (field: string, value: unknown) => unknown }) => void) => {
        let capturedObjectiveId: string | null = null;
        if (fn) {
          const mockQ: { eq: (field: string, value: unknown) => unknown } = {
            eq: (field: string, value: unknown) => {
              if (field === 'objectiveIds') capturedObjectiveId = value as string;
              return mockQ;
            },
          };
          fn(mockQ);
        }
        const cObjectiveId = capturedObjectiveId;
        return {
          first: vi.fn().mockResolvedValue(
            problemFamilies.find((pf) => {
              if (cObjectiveId) return pf.objectiveIds.includes(cObjectiveId);
              return true;
            }) ?? null
          ),
          collect: vi.fn().mockResolvedValue(
            problemFamilies.filter((pf) => {
              if (cObjectiveId) return pf.objectiveIds.includes(cObjectiveId);
              return true;
            })
          ),
        };
      }
    ),
  };

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'class_enrollments') return enrollmentQueryMock;
    if (tableName === 'competency_standards') return standardQueryMock;
    if (tableName === 'objective_policies') return policyQueryMock;
    if (tableName === 'srs_cards') return cardQueryMock;
    if (tableName === 'problem_families') return problemFamilyQueryMock;
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

  const mockPatch = vi.fn().mockResolvedValue(undefined);
  const mockReplace = vi.fn().mockResolvedValue(undefined);
  const mockInsert = vi.fn().mockResolvedValue('new-id' as Id<never>);

  return {
    db: {
      query: mockQuery,
      get: mockGet,
      patch: mockPatch,
      replace: mockReplace,
      insert: mockInsert,
    },
    mockQuery,
    mockGet,
    mockPatch,
    mockReplace,
    mockInsert,
  };
}

describe('updateObjectivePriorityHandler', () => {
  it('changes essential to triaged in objective_policies', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const standardId = 'std-1' as Id<'competency_standards'>;
    const policyId = 'policy-1' as Id<'objective_policies'>;

    const { db, mockPatch } = makeMutationMockCtx({
      profiles: [{ _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      standards: [{ _id: standardId, code: 'A-SSE.2', description: 'Factor', isActive: true, createdAt: Date.now() }],
      objectivePolicies: [{ _id: policyId, standardId, policy: 'essential', courseKey: 'integrated-math-3', priority: 0 }],
    });

    const result = await updateObjectivePriorityHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, objectiveId: 'A-SSE.2', priority: 'triaged', courseKey: 'integrated-math-3' }
    );

    expect(result).toEqual({ success: true });
    expect(mockPatch).toHaveBeenCalledWith(policyId, { policy: 'triaged', priority: 3 });
  });

  it('changes triaged to essential in objective_policies', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const standardId = 'std-1' as Id<'competency_standards'>;
    const policyId = 'policy-1' as Id<'objective_policies'>;

    const { db, mockPatch } = makeMutationMockCtx({
      profiles: [{ _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      standards: [{ _id: standardId, code: 'A-SSE.2', description: 'Factor', isActive: true, createdAt: Date.now() }],
      objectivePolicies: [{ _id: policyId, standardId, policy: 'triaged', courseKey: 'integrated-math-3', priority: 3 }],
    });

    const result = await updateObjectivePriorityHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, objectiveId: 'A-SSE.2', priority: 'essential', courseKey: 'integrated-math-3' }
    );

    expect(result).toEqual({ success: true });
    expect(mockPatch).toHaveBeenCalledWith(policyId, { policy: 'essential', priority: 0 });
  });

  it('rejects when teacher does not own the class', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const otherTeacherId = 'teacher-2' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;

    const { db, mockPatch } = makeMutationMockCtx({
      profiles: [{ _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId: otherTeacherId }],
    });

    const result = await updateObjectivePriorityHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, objectiveId: 'A-SSE.2', priority: 'triaged', courseKey: 'integrated-math-3' }
    );

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('rejects invalid priority values', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;

    const { db, mockPatch } = makeMutationMockCtx({
      profiles: [{ _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId }],
    });

    await expect(
      updateObjectivePriorityHandler(
        { db } as unknown as MutationCtx,
        { userId: teacherId, classId, objectiveId: 'A-SSE.2', priority: 'invalid' as never, courseKey: 'integrated-math-3' }
      )
    ).rejects.toThrow('Invalid priority');
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('rejects non-teacher users', async () => {
    const studentId = 'student-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;

    const { db, mockPatch } = makeMutationMockCtx({
      profiles: [{ _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId: 'teacher-1' as Id<'profiles'> }],
    });

    const result = await updateObjectivePriorityHandler(
      { db } as unknown as MutationCtx,
      { userId: studentId, classId, objectiveId: 'A-SSE.2', priority: 'triaged', courseKey: 'integrated-math-3' }
    );

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockPatch).not.toHaveBeenCalled();
  });
});

describe('resetStudentCardsHandler', () => {
  it('resets card state to new for specified objective and student', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;
    const cardId = 'card-1' as Id<'srs_cards'>;

    const { db, mockReplace, mockInsert } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [{
        _id: cardId,
        studentId,
        objectiveId: 'A-SSE.2',
        problemFamilyId: 'pf-1',
        stability: 50,
        difficulty: 3,
        state: 'review',
        dueDate: '2026-04-20T00:00:00.000Z',
        elapsedDays: 10,
        scheduledDays: 5,
        reps: 5,
        lapses: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }],
    });

    const result = await resetStudentCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: true, resetCount: 1 });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(cardId, expect.objectContaining({
      state: 'new',
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
    }));
    expect(mockInsert).toHaveBeenCalledWith('srs_review_log', expect.objectContaining({
      cardId,
      studentId,
      rating: 'manual_reset',
      evidence: expect.objectContaining({ action: 'teacher_reset' }),
    }));
  });

  it('clears scheduling data on reset', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;
    const cardId = 'card-1' as Id<'srs_cards'>;

    const { db, mockReplace } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [{
        _id: cardId,
        studentId,
        objectiveId: 'A-SSE.2',
        problemFamilyId: 'pf-1',
        stability: 100,
        difficulty: 5,
        state: 'review',
        dueDate: '2026-04-20T00:00:00.000Z',
        elapsedDays: 100,
        scheduledDays: 30,
        reps: 20,
        lapses: 5,
        lastReview: '2026-04-01T00:00:00.000Z',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }],
    });

    await resetStudentCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    const replaceCall = mockReplace.mock.calls[0];
    expect(replaceCall[1].stability).toBe(0);
    expect(replaceCall[1].difficulty).toBe(0);
    expect(replaceCall[1].elapsedDays).toBe(0);
    expect(replaceCall[1].scheduledDays).toBe(0);
    expect(replaceCall[1].reps).toBe(0);
    expect(replaceCall[1].lapses).toBe(0);
    expect(replaceCall[1].lastReview).toBeUndefined();
    expect(replaceCall[1].state).toBe('new');
  });

  it('validates teacher owns the students class', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const otherTeacherId = 'teacher-2' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockReplace } = makeMutationMockCtx({
      profiles: [{ _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId: otherTeacherId }],
    });

    const result = await resetStudentCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('handles card not found as no-op', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockReplace } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [],
    });

    const result = await resetStudentCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: true, resetCount: 0 });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('addExtraCardsHandler', () => {
  it('creates new card for student on specified objective', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;
    const familyId = 'pf-1' as Id<'problem_families'>;

    const { db, mockInsert } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [],
      problemFamilies: [{ _id: familyId, problemFamilyId: 'family-1', componentKey: 'key', displayName: 'Family', description: 'Desc', objectiveIds: ['A-SSE.2'], difficulty: 'medium' }],
    });

    const result = await addExtraCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: true, cardId: 'new-id' });
    expect(mockInsert).toHaveBeenCalledWith('srs_cards', expect.objectContaining({
      studentId,
      objectiveId: 'A-SSE.2',
      problemFamilyId: 'family-1',
      state: 'new',
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
    }));
  });

  it('sets card state to new', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockInsert } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [],
      problemFamilies: [{ _id: 'pf-1' as Id<'problem_families'>, problemFamilyId: 'family-1', componentKey: 'key', displayName: 'Family', description: 'Desc', objectiveIds: ['A-SSE.2'], difficulty: 'medium' }],
    });

    await addExtraCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    const insertCall = mockInsert.mock.calls[0];
    expect(insertCall[1].state).toBe('new');
  });

  it('validates teacher owns the students class', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const otherTeacherId = 'teacher-2' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockInsert } = makeMutationMockCtx({
      profiles: [{ _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> }],
      classes: [{ _id: classId, name: 'Math', teacherId: otherTeacherId }],
    });

    const result = await addExtraCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('rejects if card already exists for that objective', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockInsert } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [{
        _id: 'card-1' as Id<'srs_cards'>,
        studentId,
        objectiveId: 'A-SSE.2',
        problemFamilyId: 'pf-1',
        stability: 50,
        difficulty: 3,
        state: 'review',
        dueDate: '2026-04-20T00:00:00.000Z',
        elapsedDays: 10,
        scheduledDays: 5,
        reps: 5,
        lapses: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }],
    });

    const result = await addExtraCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: false, error: 'Card already exists' });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('links to problem family from objective', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockInsert } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [],
      problemFamilies: [
        { _id: 'pf-1' as Id<'problem_families'>, problemFamilyId: 'family-alpha', componentKey: 'key', displayName: 'Family A', description: 'Desc', objectiveIds: ['A-SSE.2', 'OTHER'], difficulty: 'medium' },
        { _id: 'pf-2' as Id<'problem_families'>, problemFamilyId: 'family-beta', componentKey: 'key', displayName: 'Family B', description: 'Desc', objectiveIds: ['OTHER'], difficulty: 'medium' },
      ],
    });

    await addExtraCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    const insertCall = mockInsert.mock.calls[0];
    expect(insertCall[1].problemFamilyId).toBe('family-alpha');
  });

  it('returns error when no problem family found for objective', async () => {
    const teacherId = 'teacher-1' as Id<'profiles'>;
    const classId = 'class-1' as Id<'classes'>;
    const studentId = 'student-1' as Id<'profiles'>;

    const { db, mockInsert } = makeMutationMockCtx({
      profiles: [
        { _id: teacherId, username: 'teacher1', role: 'teacher', organizationId: 'org-1' as Id<'organizations'> },
        { _id: studentId, username: 'student1', role: 'student', organizationId: 'org-1' as Id<'organizations'> },
      ],
      classes: [{ _id: classId, name: 'Math', teacherId }],
      enrollments: [{ _id: 'enr-1' as Id<'class_enrollments'>, classId, studentId, status: 'active', enrolledAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() }],
      cards: [],
      problemFamilies: [],
    });

    const result = await addExtraCardsHandler(
      { db } as unknown as MutationCtx,
      { userId: teacherId, classId, studentId, objectiveId: 'A-SSE.2' }
    );

    expect(result).toEqual({ success: false, error: 'No problem family found for objective' });
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

describe('VALID_PRIORITIES', () => {
  it('contains expected priority values', () => {
    expect(VALID_PRIORITIES).toContain('essential');
    expect(VALID_PRIORITIES).toContain('supporting');
    expect(VALID_PRIORITIES).toContain('extension');
    expect(VALID_PRIORITIES).toContain('triaged');
  });
});
