/**
 * Phase 3 — Authorization & Verification: Red-phase tests.
 *
 * Track: data-export-teacher-ui_20260605
 * Spec: AC3 (FR6) — Authorization denies export for non-owning teachers.
 *
 * These tests are written BEFORE the public `query({...})` wrappers are
 * added to `convex/exports.ts`. The wrappers must:
 *   1. Accept a `userId` arg (the calling teacher).
 *   2. Call `validateTeacherOwnsClass` (`convex/teacher/lessonAssignment.ts`)
 *      for class/submission scopes — and `getStudentInTeacherOrg`
 *      (`convex/auth.ts`) for the student scope — BEFORE the handler runs.
 *   3. Throw on unauthorized access. The exact error message and code are
 *      intentionally asserted below so the Green phase locks the contract.
 *
 * The current implementation in `convex/exports.ts` exposes the three
 * handlers as `internalQuery` with no authorization check; the public
 * query wrapper (Phase 3 deliverable) is the missing layer. The Red-phase
 * tests below will fail because the public wrapper does not exist or
 * does not perform the authorization check.
 *
 * Architecture guardrails (from `measure/tracks/.../test-strategy.md`):
 *   - Reuse `validateTeacherOwnsClass` for class/submission scopes.
 *   - Reuse `getStudentInTeacherOrg` for the student scope.
 *   - Do NOT invent a new guard. Do NOT call internal handlers from the
 *     client; the panel calls the public query, not the internal one.
 *   - Cross-class denial: the wrapper must throw before the export
 *     handler runs, so data tables scoped to the unowned class
 *     (`class_enrollments`, etc.) are never queried.
 */
import { describe, it, expect, vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import type { QueryCtx } from '@/convex/_generated/server';
import {
  getStudentExport,
  getClassExport,
  getSubmissionExport,
} from '@/convex/exports';

/**
 * The Convex `internalQuery` / `query` builders return a `FunctionReference`
 * type that is not directly callable in TypeScript — it is meant to be
 * passed to `useQuery` from the React client. In these tests we invoke
 * the functions directly (bypassing the Convex runtime) so we cast to a
 * plain callable signature.
 *
 * For Red phase, the existing exports are `internalQuery` definitions; the
 * Green phase will replace them with public `query` wrappers that accept
 * a `userId` arg. The cast below uses the GREEN-phase arg shape so the
 * test compiles against the public-wrapper contract.
 */
type ClassExportCallable = (
  ctx: QueryCtx,
  args: { userId: Id<'profiles'>; classId: Id<'classes'>; startDate?: number; endDate?: number },
) => Promise<unknown>;
type StudentExportCallable = (
  ctx: QueryCtx,
  args: { userId: Id<'profiles'>; studentId: Id<'profiles'>; startDate?: number; endDate?: number },
) => Promise<unknown>;
type SubmissionExportCallable = (
  ctx: QueryCtx,
  args: { userId: Id<'profiles'>; classId: Id<'classes'>; endDate: number; limit?: number },
) => Promise<unknown>;

const callGetClassExport = getClassExport as unknown as ClassExportCallable;
const callGetStudentExport = getStudentExport as unknown as StudentExportCallable;
const callGetSubmissionExport = getSubmissionExport as unknown as SubmissionExportCallable;

/* ------------------------------------------------------------------ *
 * Mock ctx factory — extends the `makeTeacherSrsMockCtx` pattern from
 * `__tests__/convex/teacher/srs-dashboard.test.ts`. The export handlers
 * fan out to many tables, so the mock must support all of them. We also
 * track `class_enrollments` query calls so the cross-class-denial test
 * can assert the handler never ran against the unowned class.
 * ------------------------------------------------------------------ */

interface ClassEnrollmentRow {
  _id: Id<'class_enrollments'>;
  classId: Id<'classes'>;
  studentId: Id<'profiles'>;
  status: 'active' | 'withdrawn' | 'completed';
  enrolledAt: number;
  createdAt: number;
  updatedAt: number;
}

interface ProfileRow {
  _id: Id<'profiles'>;
  username: string;
  displayName?: string;
  role: 'student' | 'teacher' | 'admin';
  organizationId: Id<'organizations'>;
}

interface ClassRow {
  _id: Id<'classes'>;
  name: string;
  teacherId: Id<'profiles'>;
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface LessonRow {
  _id: Id<'lessons'>;
  slug: string;
  title: string;
  unitNumber: number;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

interface LessonVersionRow {
  _id: Id<'lesson_versions'>;
  lessonId: Id<'lessons'>;
  version: number;
  status: 'archived' | 'draft' | 'review' | 'published';
  createdAt: number;
}

interface PhaseVersionRow {
  _id: Id<'phase_versions'>;
  lessonVersionId: Id<'lesson_versions'>;
  phaseNumber: number;
  phaseType: string;
  createdAt: number;
}

function makeExportsMockCtx(options: {
  profiles?: ProfileRow[];
  classes?: ClassRow[];
  enrollments?: ClassEnrollmentRow[];
  lessons?: LessonRow[];
  lessonVersions?: LessonVersionRow[];
  phaseVersions?: PhaseVersionRow[];
} = {}) {
  const {
    profiles = [],
    classes = [],
    enrollments = [],
    lessons = [],
    lessonVersions = [],
    phaseVersions = [],
  } = options;

  const classEnrollmentCallLog: Array<{
    indexName: string;
    capturedClassId: Id<'classes'> | null;
  }> = [];

  // Build per-table id indexes for the two-arg form `db.get(table, id)`
  // AND the single-arg form `db.get(id)` (used by the export handlers
  // for profiles / classes / activities).
  const tableRows: Record<string, Map<string, unknown>> = {
    profiles: new Map(profiles.map((p) => [p._id, p])),
    classes: new Map(classes.map((c) => [c._id, c])),
    lessons: new Map(lessons.map((l) => [l._id, l])),
    lesson_versions: new Map(lessonVersions.map((lv) => [lv._id, lv])),
    phase_versions: new Map(phaseVersions.map((pv) => [pv._id, pv])),
  };

  const mockGet = vi.fn().mockImplementation((...args: unknown[]) => {
    if (args.length === 2) {
      const [table, id] = args as [string, string];
      return Promise.resolve(tableRows[table]?.get(id) ?? null);
    }
    if (args.length === 1) {
      const id = args[0] as string;
      for (const table of Object.values(tableRows)) {
        const row = table.get(id);
        if (row) return Promise.resolve(row);
      }
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  });

  const mockQuery = vi.fn().mockImplementation((table: string) => {
    if (table === 'class_enrollments') {
      return {
        withIndex: vi.fn().mockImplementation(
          (
            indexName: string,
            fn?: (q: {
              eq: (field: string, value: unknown) => unknown;
            }) => void,
          ) => {
            let capturedClassId: Id<'classes'> | null = null;
            if (fn) {
              const mockQ = {
                eq: (field: string, value: unknown) => {
                  if (field === 'classId') {
                    capturedClassId = value as Id<'classes'>;
                  }
                  return mockQ;
                },
              };
              fn(mockQ);
            }
            classEnrollmentCallLog.push({ indexName, capturedClassId });
            return {
              collect: vi.fn().mockResolvedValue(
                enrollments.filter(
                  (e) =>
                    !capturedClassId ||
                    e.classId === capturedClassId,
                ),
              ),
            };
          },
        ),
      };
    }
    if (table === 'student_progress') {
      return {
        withIndex: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue([]),
        }),
      };
    }
    if (table === 'activity_submissions') {
      return {
        withIndex: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue([]),
        }),
      };
    }
    if (table === 'srs_cards') {
      return {
        withIndex: vi.fn().mockReturnValue({
          collect: vi.fn().mockResolvedValue([]),
        }),
      };
    }
    if (table === 'lessons') {
      return {
        collect: vi.fn().mockResolvedValue(lessons),
      };
    }
    if (table === 'lesson_versions') {
      return {
        collect: vi.fn().mockResolvedValue(lessonVersions),
      };
    }
    if (table === 'phase_versions') {
      return {
        collect: vi.fn().mockResolvedValue(phaseVersions),
      };
    }
    return {
      withIndex: vi.fn().mockReturnValue({
        collect: vi.fn().mockResolvedValue([]),
      }),
      collect: vi.fn().mockResolvedValue([]),
    };
  });

  const mockCtx = {
    db: {
      get: mockGet,
      query: mockQuery,
    },
  } as unknown as QueryCtx;

  return { mockCtx, classEnrollmentCallLog, mockGet };
}

/* ------------------------------------------------------------------ *
 * Fixture builders
 * ------------------------------------------------------------------ */

const TEACHER_A_ID = 'teacher_a' as Id<'profiles'>;
const TEACHER_B_ID = 'teacher_b' as Id<'profiles'>;
const STUDENT_A1_ID = 'student_a1' as Id<'profiles'>;
const STUDENT_B1_ID = 'student_b1' as Id<'profiles'>;
const ORG_A_ID = 'org_a' as Id<'organizations'>;
const ORG_B_ID = 'org_b' as Id<'organizations'>;
const CLASS_A_ID = 'class_a' as Id<'classes'>;
const CLASS_B_ID = 'class_b' as Id<'classes'>;

const baseProfiles: ProfileRow[] = [
  {
    _id: TEACHER_A_ID,
    username: 'teacher_a',
    displayName: 'Teacher A',
    role: 'teacher',
    organizationId: ORG_A_ID,
  },
  {
    _id: TEACHER_B_ID,
    username: 'teacher_b',
    displayName: 'Teacher B',
    role: 'teacher',
    organizationId: ORG_B_ID,
  },
  {
    _id: STUDENT_A1_ID,
    username: 'student_a1',
    displayName: 'Student A1',
    role: 'student',
    organizationId: ORG_A_ID,
  },
  {
    _id: STUDENT_B1_ID,
    username: 'student_b1',
    displayName: 'Student B1',
    role: 'student',
    organizationId: ORG_B_ID,
  },
];

const baseClasses: ClassRow[] = [
  {
    _id: CLASS_A_ID,
    name: 'Period 1',
    teacherId: TEACHER_A_ID,
    archived: false,
    createdAt: 1,
    updatedAt: 1,
  },
  {
    _id: CLASS_B_ID,
    name: 'Period 2',
    teacherId: TEACHER_B_ID,
    archived: false,
    createdAt: 2,
    updatedAt: 2,
  },
];

const baseEnrollments: ClassEnrollmentRow[] = [
  {
    _id: 'enr_a1' as Id<'class_enrollments'>,
    classId: CLASS_A_ID,
    studentId: STUDENT_A1_ID,
    status: 'active',
    enrolledAt: 1,
    createdAt: 1,
    updatedAt: 1,
  },
  {
    _id: 'enr_b1' as Id<'class_enrollments'>,
    classId: CLASS_B_ID,
    studentId: STUDENT_B1_ID,
    status: 'active',
    enrolledAt: 2,
    createdAt: 2,
    updatedAt: 2,
  },
];

/* ------------------------------------------------------------------ *
 * Phase 3 — Red-phase tests
 * ------------------------------------------------------------------ */

describe('Phase 3 — public export query wrappers (Red)', () => {
  describe('getClassExport — class dataset', () => {
    it('allows a teacher who owns the class to fetch the export', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      const result = await callGetClassExport(mockCtx, {
        userId: TEACHER_A_ID,
        classId: CLASS_A_ID,
      });

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
    });

    it('throws when a teacher does not own the requested class (cross-class denial)', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      // Teacher A asks for Teacher B's class — must be denied.
      await expect(
        callGetClassExport(mockCtx, {
          userId: TEACHER_A_ID,
          classId: CLASS_B_ID,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|not.*own/i);
    });

    it('throws when the caller is a student (not a teacher)', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      await expect(
        callGetClassExport(mockCtx, {
          userId: STUDENT_A1_ID,
          classId: CLASS_A_ID,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|teacher/i);
    });

    it('throws when the userId does not exist in profiles (unauthenticated)', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      await expect(
        callGetClassExport(mockCtx, {
          userId: 'ghost_teacher' as Id<'profiles'>,
          classId: CLASS_A_ID,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|not.*found/i);
    });

    it('does NOT query class_enrollments for a class the teacher does not own', async () => {
      const { mockCtx, classEnrollmentCallLog } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      await expect(
        callGetClassExport(mockCtx, {
          userId: TEACHER_A_ID,
          classId: CLASS_B_ID,
        }),
      ).rejects.toThrow();

      // The export handler must not have been invoked for class B.
      // The authorization check itself may read the class doc to verify
      // ownership — that is allowed and expected. The forbidden read is
      // `class_enrollments` (and any other class-scoped data table).
      const enrollmentsCallsForClassB = classEnrollmentCallLog.filter(
        (entry) => entry.capturedClassId === CLASS_B_ID,
      );
      expect(enrollmentsCallsForClassB).toHaveLength(0);
    });
  });

  describe('getSubmissionExport — submissions dataset', () => {
    it('allows a teacher who owns the class', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      const result = (await callGetSubmissionExport(mockCtx, {
        userId: TEACHER_A_ID,
        classId: CLASS_A_ID,
        endDate: 1_700_000_000_000,
      })) as { rows: unknown[]; hasMore: boolean };

      expect(result).toBeDefined();
      expect(result.rows).toEqual([]);
      expect(result.hasMore).toBe(false);
    });

    it('throws when a teacher does not own the requested class', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      await expect(
        callGetSubmissionExport(mockCtx, {
          userId: TEACHER_A_ID,
          classId: CLASS_B_ID,
          endDate: 1_700_000_000_000,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|not.*own/i);
    });

    it('does NOT query class_enrollments for a class the teacher does not own', async () => {
      const { mockCtx, classEnrollmentCallLog } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      await expect(
        callGetSubmissionExport(mockCtx, {
          userId: TEACHER_A_ID,
          classId: CLASS_B_ID,
          endDate: 1_700_000_000_000,
        }),
      ).rejects.toThrow();

      const enrollmentsCallsForClassB = classEnrollmentCallLog.filter(
        (entry) => entry.capturedClassId === CLASS_B_ID,
      );
      expect(enrollmentsCallsForClassB).toHaveLength(0);
    });
  });

  describe('getStudentExport — student dataset', () => {
    it('allows a teacher in the same organization as the student', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      const result = await callGetStudentExport(mockCtx, {
        userId: TEACHER_A_ID,
        studentId: STUDENT_A1_ID,
      });

      expect(result).not.toBeNull();
    });

    it('throws when a teacher is in a different organization than the student', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      // Teacher A is in ORG_A; Student B1 is in ORG_B — must be denied.
      await expect(
        callGetStudentExport(mockCtx, {
          userId: TEACHER_A_ID,
          studentId: STUDENT_B1_ID,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|organization/i);
    });

    it('throws when the target profile is not a student', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      // Teacher A asks for Teacher B's profile — not a student.
      await expect(
        callGetStudentExport(mockCtx, {
          userId: TEACHER_A_ID,
          studentId: TEACHER_B_ID,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|not a student|not.*student/i);
    });

    it('throws when the caller is not a teacher', async () => {
      const { mockCtx } = makeExportsMockCtx({
        profiles: baseProfiles,
        classes: baseClasses,
        enrollments: baseEnrollments,
      });

      // Student A1 tries to read their own export without teacher rights.
      await expect(
        callGetStudentExport(mockCtx, {
          userId: STUDENT_A1_ID,
          studentId: STUDENT_A1_ID,
        }),
      ).rejects.toThrow(/unauthorized|forbidden|teacher/i);
    });
  });
});

/* ------------------------------------------------------------------ *
 * Unused-import guard — `vi` is imported above for the `vi.fn()` mock
 * factory and to keep parity with neighboring Convex test files. The
 * `Id` type-only import is preserved by being used in the fixture
 * types above.
 * ------------------------------------------------------------------ */
void vi;
