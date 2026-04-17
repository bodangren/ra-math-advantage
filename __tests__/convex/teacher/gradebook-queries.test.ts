import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import type { QueryCtx } from '@/convex/_generated/server';
import {
  getTeacherCourseOverviewDataHandler,
  getTeacherGradebookDataHandler,
  getSubmissionDetailHandler,
  getTeacherCompetencyHeatmapDataHandler,
  getTeacherStudentCompetencyDetailHandler,
} from '@/convex/teacher';

// ---------------------------------------------------------------------------
// Mock DB factory
// ---------------------------------------------------------------------------

function createMockDb(documents: Record<string, Record<string, unknown>[]>) {
  const tables: Record<string, Record<string, unknown>[]> = JSON.parse(
    JSON.stringify(documents),
  );

  function makeQuery(table: string) {
    let data = tables[table] || [];

    return {
      collect: () => Promise.resolve([...data]),
      take: (n: number) => Promise.resolve(data.slice(0, n)),
      withIndex: (
        _index: string,
        builder: (q: { eq: (field: string, value: unknown) => { eq: (field: string, value: unknown) => unknown } }) => unknown,
      ) => {
        let filtered = [...data];
        const eqChain = {
          eq: (field: string, value: unknown) => {
            filtered = filtered.filter((d) => d[field] === value);
            return eqChain;
          },
        };
        builder(eqChain);
        data = filtered;
        return {
          collect: () => Promise.resolve([...data]),
          take: (n: number) => Promise.resolve(data.slice(0, n)),
          filter: (filterBuilder: (q: {
            eq: (accessor: unknown, value: unknown) => (doc: Record<string, unknown>) => boolean;
            field: (name: string) => (doc: Record<string, unknown>) => unknown;
            or: (...exprs: Array<(doc: Record<string, unknown>) => boolean>) => (doc: Record<string, unknown>) => boolean;
          }) => unknown) => {
            let filterData = [...data];

            const eq = (accessor: unknown, value: unknown) => {
              if (
                typeof accessor === 'function' &&
                ((accessor as unknown) as { _fieldName?: string })._fieldName
              ) {
                const fieldName = ((accessor as unknown) as { _fieldName: string })._fieldName;
                return (doc: Record<string, unknown>) => doc[fieldName] === value;
              }
              return () => true;
            };

            const field = (name: string) => {
              const fn = (doc: Record<string, unknown>) => doc[name];
              (fn as unknown as { _fieldName: string })._fieldName = name;
              return fn;
            };

            const or = (...exprs: Array<(doc: Record<string, unknown>) => boolean>) => {
              return (doc: Record<string, unknown>) => exprs.some((e) => e(doc));
            };

            const result = filterBuilder({ eq, field, or });
            if (typeof result === 'function') {
              filterData = filterData.filter(result as (doc: Record<string, unknown>) => boolean);
            }

            data = filterData;
            return {
              collect: () => Promise.resolve([...data]),
              take: (n: number) => Promise.resolve(data.slice(0, n)),
            };
          },
        };
      },
      filter: (filterBuilder: (q: {
        eq: (accessor: unknown, value: unknown) => (doc: Record<string, unknown>) => boolean;
        field: (name: string) => (doc: Record<string, unknown>) => unknown;
        or: (...exprs: Array<(doc: Record<string, unknown>) => boolean>) => (doc: Record<string, unknown>) => boolean;
      }) => unknown) => {
        let filterData = [...data];

        const eq = (accessor: unknown, value: unknown) => {
          if (
            typeof accessor === 'function' &&
            ((accessor as unknown) as { _fieldName?: string })._fieldName
          ) {
            const fieldName = ((accessor as unknown) as { _fieldName: string })._fieldName;
            return (doc: Record<string, unknown>) => doc[fieldName] === value;
          }
          return () => true;
        };

        const field = (name: string) => {
          const fn = (doc: Record<string, unknown>) => doc[name];
          (fn as unknown as { _fieldName: string })._fieldName = name;
          return fn;
        };

        const or = (...exprs: Array<(doc: Record<string, unknown>) => boolean>) => {
          return (doc: Record<string, unknown>) => exprs.some((e) => e(doc));
        };

        const result = filterBuilder({ eq, field, or });
        if (typeof result === 'function') {
          filterData = filterData.filter(result as (doc: Record<string, unknown>) => boolean);
        }

        data = filterData;
        return {
          collect: () => Promise.resolve([...data]),
          take: (n: number) => Promise.resolve(data.slice(0, n)),
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
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockOrgId = 'org1' as Id<'organizations'>;
const mockTeacherId = 'teacher1' as Id<'profiles'>;
const mockStudentId = 'student1' as Id<'profiles'>;
const mockOtherStudentId = 'student2' as Id<'profiles'>;
const mockLessonId = 'lesson1' as Id<'lessons'>;
const mockLessonVersionId = 'lv1' as Id<'lesson_versions'>;
const mockPhaseVersionId = 'pv1' as Id<'phase_versions'>;
const mockStandardId = 'std1' as Id<'competency_standards'>;
const mockActivityId = 'act1' as Id<'activities'>;

const teacherProfile = {
  _id: mockTeacherId,
  _creationTime: 1000,
  organizationId: mockOrgId,
  username: 'teacher1',
  role: 'teacher',
  displayName: 'Teacher One',
  createdAt: 1000,
  updatedAt: 1000,
};

const studentProfile = {
  _id: mockStudentId,
  _creationTime: 1000,
  organizationId: mockOrgId,
  username: 'student1',
  role: 'student',
  displayName: 'Student One',
  createdAt: 1000,
  updatedAt: 1000,
};

const otherStudentProfile = {
  _id: mockOtherStudentId,
  _creationTime: 1000,
  organizationId: mockOrgId,
  username: 'student2',
  role: 'student',
  displayName: 'Student Two',
  createdAt: 1000,
  updatedAt: 1000,
};

// ---------------------------------------------------------------------------
// getTeacherCourseOverviewDataHandler
// ---------------------------------------------------------------------------

describe('getTeacherCourseOverviewDataHandler', () => {
  it('returns null for unauthorized user', async () => {
    const mockDb = createMockDb({
      profiles: [{ _id: 'bad', role: 'student', organizationId: mockOrgId } as unknown as Record<string, unknown>],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCourseOverviewDataHandler(ctx, { userId: 'bad' as Id<'profiles'> });
    expect(result).toBeNull();
  });

  it('returns empty rows and units when no lessons exist', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCourseOverviewDataHandler(ctx, { userId: mockTeacherId });
    expect(result).toEqual({ rows: [], units: [] });
  });

  it('returns course overview with student list and module mastery', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile, otherStudentProfile],
      lessons: [
        { _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 },
      ],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      lesson_standards: [
        { _id: 'ls1', lessonVersionId: mockLessonVersionId, standardId: mockStandardId, isPrimary: true, createdAt: 1 },
      ],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
      student_competency: [
        { _id: 'sc1', studentId: mockStudentId, standardId: mockStandardId, masteryLevel: 85, lastUpdated: 1, createdAt: 1 },
        { _id: 'sc2', studentId: mockOtherStudentId, standardId: mockStandardId, masteryLevel: 65, lastUpdated: 1, createdAt: 1 },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCourseOverviewDataHandler(ctx, { userId: mockTeacherId });

    expect(result).not.toBeNull();
    expect(result?.units).toEqual([{ unitNumber: 1 }]);
    expect(result?.rows).toHaveLength(2);

    const studentOneRow = result?.rows.find((r) => r.studentId === mockStudentId);
    expect(studentOneRow?.cells[0].avgMastery).toBe(85);
    expect(studentOneRow?.cells[0].color).toBe('green');

    const studentTwoRow = result?.rows.find((r) => r.studentId === mockOtherStudentId);
    expect(studentTwoRow?.cells[0].avgMastery).toBe(65);
    expect(studentTwoRow?.cells[0].color).toBe('yellow');
  });

  it('returns gray cells when no competency data exists', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [
        { _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 },
      ],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      lesson_standards: [
        { _id: 'ls1', lessonVersionId: mockLessonVersionId, standardId: mockStandardId, isPrimary: true, createdAt: 1 },
      ],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
      student_competency: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCourseOverviewDataHandler(ctx, { userId: mockTeacherId });

    expect(result?.rows[0].cells[0].avgMastery).toBeNull();
    expect(result?.rows[0].cells[0].color).toBe('gray');
  });
});

// ---------------------------------------------------------------------------
// getTeacherGradebookDataHandler
// ---------------------------------------------------------------------------

describe('getTeacherGradebookDataHandler', () => {
  it('returns null for unauthorized user', async () => {
    const mockDb = createMockDb({
      profiles: [{ _id: 'bad', role: 'student', organizationId: mockOrgId } as unknown as Record<string, unknown>],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherGradebookDataHandler(ctx, { userId: 'bad' as Id<'profiles'>, unitNumber: 1 });
    expect(result).toBeNull();
  });

  it('returns empty rows and lessons when unit has no lessons', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherGradebookDataHandler(ctx, { userId: mockTeacherId, unitNumber: 99 });
    expect(result).toEqual({ rows: [], lessons: [] });
  });

  it('returns gradebook with per-lesson status and mastery badges', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [
        { _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 },
      ],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      phase_versions: [
        { _id: mockPhaseVersionId, lessonVersionId: mockLessonVersionId, phaseNumber: 1, phaseType: 'learn', createdAt: 1 },
      ],
      lesson_standards: [
        { _id: 'ls1', lessonVersionId: mockLessonVersionId, standardId: mockStandardId, isPrimary: true, createdAt: 1 },
      ],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
      student_progress: [
        { _id: 'sp1', userId: mockStudentId, phaseId: mockPhaseVersionId, status: 'completed', createdAt: 1, updatedAt: 1 },
      ],
      student_competency: [
        { _id: 'sc1', studentId: mockStudentId, standardId: mockStandardId, masteryLevel: 92, lastUpdated: 1, createdAt: 1 },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherGradebookDataHandler(ctx, { userId: mockTeacherId, unitNumber: 1 });

    expect(result).not.toBeNull();
    expect(result?.lessons).toHaveLength(1);
    expect(result?.rows).toHaveLength(1);

    const cell = result?.rows[0].cells[0];
    expect(cell?.completionStatus).toBe('completed');
    expect(cell?.masteryLevel).toBe(92);
    expect(cell?.color).toBe('green');
  });

  it('returns not_started when no progress exists', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [
        { _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 },
      ],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      phase_versions: [
        { _id: mockPhaseVersionId, lessonVersionId: mockLessonVersionId, phaseNumber: 1, phaseType: 'learn', createdAt: 1 },
      ],
      lesson_standards: [],
      student_progress: [],
      student_competency: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherGradebookDataHandler(ctx, { userId: mockTeacherId, unitNumber: 1 });

    expect(result?.rows[0].cells[0].completionStatus).toBe('not_started');
    expect(result?.rows[0].cells[0].color).toBe('gray');
  });
});

// ---------------------------------------------------------------------------
// getSubmissionDetailHandler
// ---------------------------------------------------------------------------

describe('getSubmissionDetailHandler', () => {
  it('returns null for unauthorized user', async () => {
    const mockDb = createMockDb({
      profiles: [{ _id: 'bad', role: 'student', organizationId: mockOrgId } as unknown as Record<string, unknown>],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getSubmissionDetailHandler(ctx, {
      userId: 'bad' as Id<'profiles'>,
      studentId: mockStudentId,
      lessonId: mockLessonId,
      studentName: 'Student One',
    });
    expect(result).toBeNull();
  });

  it('returns null when student is not in teacher org', async () => {
    const mockDb = createMockDb({
      profiles: [
        teacherProfile,
        { ...studentProfile, organizationId: 'other-org' },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getSubmissionDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
      lessonId: mockLessonId,
      studentName: 'Student One',
    });
    expect(result).toBeNull();
  });

  it('returns null when no published lesson versions exist', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [{ _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 }],
      lesson_versions: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getSubmissionDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
      lessonId: mockLessonId,
      studentName: 'Student One',
    });
    expect(result).toBeNull();
  });

  it('returns phase evidence and practice submissions', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [{ _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 }],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      phase_versions: [
        { _id: mockPhaseVersionId, lessonVersionId: mockLessonVersionId, phaseNumber: 1, phaseType: 'guided_practice', title: 'Practice', createdAt: 1 },
      ],
      student_progress: [
        { _id: 'sp1', userId: mockStudentId, phaseId: mockPhaseVersionId, status: 'completed', completedAt: 1000, createdAt: 1, updatedAt: 1 },
      ],
      activity_completions: [
        { _id: 'ac1', studentId: mockStudentId, lessonId: mockLessonId, phaseNumber: 1, activityId: mockActivityId, completedAt: 1000, idempotencyKey: 'key1', createdAt: 1, updatedAt: 1 },
      ],
      activities: [
        { _id: mockActivityId, displayName: 'Graphing Activity', componentKey: 'graphing-explorer', createdAt: 1, updatedAt: 1 },
      ],
      activity_submissions: [
        {
          _id: 'as1',
          userId: mockStudentId,
          activityId: mockActivityId,
          submissionData: { contractVersion: 'practice.v1', attemptNumber: 1, parts: [] },
          score: 8,
          maxScore: 10,
          submittedAt: 1000,
          createdAt: 1,
          updatedAt: 1000,
        },
      ],
      student_spreadsheet_responses: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getSubmissionDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
      lessonId: mockLessonId,
      studentName: 'Student One',
    });

    expect(result).not.toBeNull();
    expect(result?.studentName).toBe('Student One');
    expect(result?.lessonTitle).toBe('Lesson 1');
    expect(result?.phases).toHaveLength(1);

    const phase = result?.phases[0];
    expect(phase?.status).toBe('completed');
    expect(phase?.completedAt).toBe(1000);
    expect(phase?.evidence).toHaveLength(1);
    expect(phase?.evidence[0].kind).toBe('practice');
    expect(phase?.evidence[0].score).toBe(8);
    expect(phase?.evidence[0].activityTitle).toBe('Graphing Activity');
  });

  it('returns spreadsheet evidence when present', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [{ _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 }],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      phase_versions: [
        { _id: mockPhaseVersionId, lessonVersionId: mockLessonVersionId, phaseNumber: 1, phaseType: 'independent_practice', createdAt: 1 },
      ],
      student_progress: [],
      activity_completions: [
        { _id: 'ac1', studentId: mockStudentId, lessonId: mockLessonId, phaseNumber: 1, activityId: mockActivityId, completedAt: 1000, idempotencyKey: 'key1', createdAt: 1, updatedAt: 1 },
      ],
      activities: [
        { _id: mockActivityId, displayName: 'Spreadsheet Activity', componentKey: 'spreadsheet', createdAt: 1, updatedAt: 1 },
      ],
      activity_submissions: [],
      student_spreadsheet_responses: [
        {
          _id: 'ss1',
          studentId: mockStudentId,
          activityId: mockActivityId,
          spreadsheetData: { cells: [['1', '2']] },
          isCompleted: true,
          attempts: 1,
          createdAt: 1,
          updatedAt: 1000,
        },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getSubmissionDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
      lessonId: mockLessonId,
      studentName: 'Student One',
    });

    expect(result?.phases[0].evidence).toHaveLength(1);
    expect(result?.phases[0].evidence[0].kind).toBe('spreadsheet');
    expect(result?.phases[0].evidence[0].spreadsheetData).toEqual({ cells: [['1', '2']] });
    expect(result?.phases[0].spreadsheetData).toEqual({ cells: [['1', '2']] });
  });

  it('picks the latest practice submission by submittedAt', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      lessons: [{ _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 }],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      phase_versions: [
        { _id: mockPhaseVersionId, lessonVersionId: mockLessonVersionId, phaseNumber: 1, phaseType: 'assessment', createdAt: 1 },
      ],
      student_progress: [],
      activity_completions: [
        { _id: 'ac1', studentId: mockStudentId, lessonId: mockLessonId, phaseNumber: 1, activityId: mockActivityId, completedAt: 1000, idempotencyKey: 'key1', createdAt: 1, updatedAt: 1 },
      ],
      activities: [
        { _id: mockActivityId, displayName: 'Quiz', componentKey: 'comprehension-quiz', createdAt: 1, updatedAt: 1 },
      ],
      activity_submissions: [
        {
          _id: 'as1',
          userId: mockStudentId,
          activityId: mockActivityId,
          submissionData: { attemptNumber: 1 },
          score: 5,
          submittedAt: 500,
          createdAt: 1,
          updatedAt: 500,
        },
        {
          _id: 'as2',
          userId: mockStudentId,
          activityId: mockActivityId,
          submissionData: { attemptNumber: 2 },
          score: 9,
          submittedAt: 1000,
          createdAt: 1,
          updatedAt: 1000,
        },
      ],
      student_spreadsheet_responses: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getSubmissionDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
      lessonId: mockLessonId,
      studentName: 'Student One',
    });

    expect(result?.phases[0].evidence).toHaveLength(1);
    expect(result?.phases[0].evidence[0].score).toBe(9);
    expect(result?.phases[0].evidence[0].attemptNumber).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getTeacherCompetencyHeatmapDataHandler
// ---------------------------------------------------------------------------

describe('getTeacherCompetencyHeatmapDataHandler', () => {
  it('returns null for unauthorized user', async () => {
    const mockDb = createMockDb({
      profiles: [{ _id: 'bad', role: 'student', organizationId: mockOrgId } as unknown as Record<string, unknown>],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCompetencyHeatmapDataHandler(ctx, { userId: 'bad' as Id<'profiles'> });
    expect(result).toBeNull();
  });

  it('returns empty heatmap when no students exist', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCompetencyHeatmapDataHandler(ctx, { userId: mockTeacherId });
    expect(result).not.toBeNull();
    expect(result?.rows).toEqual([]);
    expect(result?.standards).toHaveLength(1);
  });

  it('returns heatmap with student mastery by standard', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile, otherStudentProfile],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
      student_competency: [
        { _id: 'sc1', studentId: mockStudentId, standardId: mockStandardId, masteryLevel: 85, lastUpdated: 1, createdAt: 1 },
        { _id: 'sc2', studentId: mockOtherStudentId, standardId: mockStandardId, masteryLevel: 45, lastUpdated: 1, createdAt: 1 },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCompetencyHeatmapDataHandler(ctx, { userId: mockTeacherId });

    expect(result).not.toBeNull();
    expect(result?.rows).toHaveLength(2);

    const studentOneRow = result?.rows.find((r) => r.studentId === mockStudentId);
    expect(studentOneRow?.cells[0].masteryLevel).toBe(85);
    expect(studentOneRow?.cells[0].color).toBe('green');

    const studentTwoRow = result?.rows.find((r) => r.studentId === mockOtherStudentId);
    expect(studentTwoRow?.cells[0].masteryLevel).toBe(45);
    expect(studentTwoRow?.cells[0].color).toBe('red');
  });

  it('filters inactive standards', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
        { _id: 'std2', code: 'F.IF.1', description: 'Inactive', isActive: false, createdAt: 1 },
      ],
      student_competency: [
        { _id: 'sc1', studentId: mockStudentId, standardId: mockStandardId, masteryLevel: 85, lastUpdated: 1, createdAt: 1 },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherCompetencyHeatmapDataHandler(ctx, { userId: mockTeacherId });

    expect(result?.standards).toHaveLength(1);
    expect(result?.standards[0].code).toBe('A.SSE.1');
    expect(result?.rows[0].cells).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// getTeacherStudentCompetencyDetailHandler
// ---------------------------------------------------------------------------

describe('getTeacherStudentCompetencyDetailHandler', () => {
  it('returns null for unauthorized user', async () => {
    const mockDb = createMockDb({
      profiles: [{ _id: 'bad', role: 'student', organizationId: mockOrgId } as unknown as Record<string, unknown>],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherStudentCompetencyDetailHandler(ctx, {
      userId: 'bad' as Id<'profiles'>,
      studentId: mockStudentId,
    });
    expect(result).toBeNull();
  });

  it('returns null when student is not in teacher org', async () => {
    const mockDb = createMockDb({
      profiles: [
        teacherProfile,
        { ...studentProfile, organizationId: 'other-org' },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherStudentCompetencyDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
    });
    expect(result).toBeNull();
  });

  it('returns detail with mastery and lesson context', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
      student_competency: [
        { _id: 'sc1', studentId: mockStudentId, standardId: mockStandardId, masteryLevel: 75, lastUpdated: 1, createdAt: 1 },
      ],
      lessons: [
        { _id: mockLessonId, unitNumber: 1, orderIndex: 1, title: 'Lesson 1', slug: 'l1', createdAt: 1, updatedAt: 1 },
      ],
      lesson_versions: [
        { _id: mockLessonVersionId, lessonId: mockLessonId, version: 1, status: 'published', createdAt: 1 },
      ],
      lesson_standards: [
        { _id: 'ls1', lessonVersionId: mockLessonVersionId, standardId: mockStandardId, isPrimary: true, createdAt: 1 },
      ],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherStudentCompetencyDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
    });

    expect(result).not.toBeNull();
    expect(result?.studentId).toBe(mockStudentId);
    expect(result?.displayName).toBe('Student One');
    expect(result?.competencies).toHaveLength(1);
    expect(result?.competencies[0].masteryLevel).toBe(75);
    expect(result?.competencies[0].unitNumber).toBe(1);
    expect(result?.competencies[0].lessonTitle).toBe('Lesson 1');
  });

  it('returns null for missing competency data', async () => {
    const mockDb = createMockDb({
      profiles: [teacherProfile, studentProfile],
      competency_standards: [
        { _id: mockStandardId, code: 'A.SSE.1', description: 'Description', isActive: true, createdAt: 1 },
      ],
      student_competency: [],
      lessons: [],
      lesson_versions: [],
      lesson_standards: [],
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getTeacherStudentCompetencyDetailHandler(ctx, {
      userId: mockTeacherId,
      studentId: mockStudentId,
    });

    expect(result?.competencies[0].masteryLevel).toBeNull();
    expect(result?.competencies[0].unitNumber).toBeNull();
    expect(result?.competencies[0].lessonTitle).toBeNull();
  });
});
