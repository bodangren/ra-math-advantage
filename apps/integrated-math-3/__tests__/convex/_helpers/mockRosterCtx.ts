// Mock Convex ctx builder for the onboarding/roster-import handlers.
//
// Per measure/tracks/onboarding-roster-import_20260605/test-strategy.md §3:
// "an in-memory class_enrollments table supporting by_class_and_student
// lookups. Phase 2 only; do not reach into Convex internals."
//
// This helper models the four tables the roster-import handlers touch:
//   - classes (with by_teacher index)
//   - class_enrollments (with by_class_and_student, by_class, by_student indexes)
//   - profiles (with by_username, by_organization indexes)
//   - auth_credentials (with by_username, by_profile indexes)
//   - roster_imports (NEW in Phase 2 for FR6 auditability)
//
// Each table exposes a `withIndex(name, builder)` mock that applies a
// chain of `eq(field, value)` calls against an in-memory array. The
// builder is treated as opaque — only `eq` is observed — which is the
// same simplification used in placement.test.ts and study.test.ts.
//
// Production module contract under test:
//   apps/integrated-math-3/convex/onboarding/roster-import.ts
//
// Exports expected (Red phase, do not exist yet):
//   - importRosterMutation(ctx, { classId, rows, importedBy, source })
//   - getImportSummary(ctx, { classId, importId })
//   - listImportsForClass(ctx, { classId })

import { vi } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

export interface ClassRow {
  _id: Id<'classes'>;
  _creationTime: number;
  teacherId: Id<'profiles'>;
  name: string;
  description?: string;
  academicYear?: string;
  archived: boolean;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface ClassEnrollmentRow {
  _id: Id<'class_enrollments'>;
  _creationTime: number;
  classId: Id<'classes'>;
  studentId: Id<'profiles'>;
  enrolledAt: number;
  status: 'active' | 'withdrawn' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export interface ProfileRow {
  _id: Id<'profiles'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  displayName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface AuthCredentialRow {
  _id: Id<'auth_credentials'>;
  _creationTime: number;
  profileId: Id<'profiles'>;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  organizationId: Id<'organizations'>;
  passwordHash: string;
  passwordSalt: string;
  passwordHashIterations: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RosterImportRow {
  _id: Id<'roster_imports'>;
  _creationTime: number;
  classId: Id<'classes'>;
  importedBy: Id<'profiles'>;
  importedAt: number;
  source: {
    fileName?: string;
    rowCount: number;
  };
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    rowIndex: number;
    column?: 'name' | 'email' | 'sisId' | 'section';
    code: 'missing_required' | 'invalid_email' | 'duplicate_identifier' | 'malformed_row';
    message: string;
  }>;
  createdStudentIds: Id<'profiles'>[];
}

export interface MakeRosterCtxOptions {
  classes?: ClassRow[];
  classEnrollments?: ClassEnrollmentRow[];
  profiles?: ProfileRow[];
  authCredentials?: AuthCredentialRow[];
  rosterImports?: RosterImportRow[];
  organizationId?: Id<'organizations'>;
}

type EqBuilder = {
  eq: (field: string, value: unknown) => EqBuilder;
};

function makeIndexChain<T>(
  rows: T[],
): { withIndex: (...args: unknown[]) => unknown; queryMock: { withIndex: (...args: unknown[]) => unknown } } {
  const withIndex = vi.fn().mockImplementation(
    (_indexName: string, builder?: (q: EqBuilder) => unknown) => {
      let filtered: T[] = [...rows];
      const eqChain: EqBuilder = {
        eq: (field: string, value: unknown) => {
          filtered = (filtered as unknown as Array<Record<string, unknown>>).filter(
            (d) => d[field] === value,
          ) as unknown as T[];
          return eqChain;
        },
      };
      if (builder) builder(eqChain);
      return {
        collect: () => Promise.resolve(filtered),
        first: () => Promise.resolve(filtered[0] ?? null),
        unique: () => Promise.resolve(filtered[0] ?? null),
        order: vi.fn().mockReturnThis(),
        take: (n: number) => Promise.resolve(filtered.slice(0, n)),
      };
    },
  );
  return { withIndex, queryMock: { withIndex } };
}

export interface RosterMockCtx {
  db: {
    query: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  // Direct state (for assertions and post-call inspection)
  classes: ClassRow[];
  classEnrollments: ClassEnrollmentRow[];
  profiles: ProfileRow[];
  authCredentials: AuthCredentialRow[];
  rosterImports: RosterImportRow[];
  // Spies
  insertSpy: ReturnType<typeof vi.fn>;
  patchSpy: ReturnType<typeof vi.fn>;
  // Index-call counters (for N+1 guard assertions)
  classEnrollmentsByClassAndStudentCalls: number;
  classEnrollmentsByClassCalls: number;
  profilesByUsernameCalls: number;
  authCredentialsByUsernameCalls: number;
  rosterImportsByClassCalls: number;
}

let enrollmentIdCounter = 1;
let profileIdCounter = 1;
let authCredentialIdCounter = 1;
let classIdCounter = 1;
let rosterImportIdCounter = 1;

export function makeRosterMockCtx(
  options: MakeRosterCtxOptions = {},
): RosterMockCtx {
  const classes: ClassRow[] = options.classes ? [...options.classes] : [];
  const classEnrollments: ClassEnrollmentRow[] = options.classEnrollments
    ? [...options.classEnrollments]
    : [];
  const profiles: ProfileRow[] = options.profiles ? [...options.profiles] : [];
  const authCredentials: AuthCredentialRow[] = options.authCredentials
    ? [...options.authCredentials]
    : [];
  const rosterImports: RosterImportRow[] = options.rosterImports
    ? [...options.rosterImports]
    : [];

  let classEnrollmentsByClassAndStudentCalls = 0;
  let classEnrollmentsByClassCalls = 0;
  let profilesByUsernameCalls = 0;
  let authCredentialsByUsernameCalls = 0;
  let rosterImportsByClassCalls = 0;

  const classEnrollmentsChain = makeIndexChain(classEnrollments);
  // Wrap the withIndex so we can detect which index name was requested
  // (for N+1 assertions). The test-strategy requires that index usage
  // be observable in the mock.
  const classEnrollmentsWrappedWithIndex = vi.fn().mockImplementation(
    (indexName: string, builder?: (q: EqBuilder) => unknown) => {
      if (indexName === 'by_class_and_student') {
        classEnrollmentsByClassAndStudentCalls++;
      } else if (indexName === 'by_class') {
        classEnrollmentsByClassCalls++;
      }
      return classEnrollmentsChain.withIndex(indexName, builder);
    },
  );
  const classEnrollmentsQuery = {
    withIndex: classEnrollmentsWrappedWithIndex,
  };

  const profilesChain = makeIndexChain(profiles);
  const profilesWrappedWithIndex = vi.fn().mockImplementation(
    (indexName: string, builder?: (q: EqBuilder) => unknown) => {
      if (indexName === 'by_username') {
        profilesByUsernameCalls++;
      }
      return profilesChain.withIndex(indexName, builder);
    },
  );
  const profilesQuery = { withIndex: profilesWrappedWithIndex };

  const authCredentialsChain = makeIndexChain(authCredentials);
  const authCredentialsWrappedWithIndex = vi.fn().mockImplementation(
    (indexName: string, builder?: (q: EqBuilder) => unknown) => {
      if (indexName === 'by_username') {
        authCredentialsByUsernameCalls++;
      }
      return authCredentialsChain.withIndex(indexName, builder);
    },
  );
  const authCredentialsQuery = { withIndex: authCredentialsWrappedWithIndex };

  const rosterImportsChain = makeIndexChain(rosterImports);
  const rosterImportsWrappedWithIndex = vi.fn().mockImplementation(
    (indexName: string, builder?: (q: EqBuilder) => unknown) => {
      if (indexName === 'by_class') {
        rosterImportsByClassCalls++;
      }
      return rosterImportsChain.withIndex(indexName, builder);
    },
  );
  const rosterImportsQuery = { withIndex: rosterImportsWrappedWithIndex };

  const classesChain = makeIndexChain(classes);
  const classesQuery = { withIndex: classesChain.withIndex };

  const insertSpy = vi.fn().mockImplementation(
    (table: string, doc: Record<string, unknown>) => {
      const now = Date.now();
      switch (table) {
        case 'classes': {
          const id = `classes_${classIdCounter++}` as Id<'classes'>;
          const row: ClassRow = { _id: id, _creationTime: now, ...doc } as ClassRow;
          classes.push(row);
          return Promise.resolve(id);
        }
        case 'class_enrollments': {
          const id = `class_enrollments_${enrollmentIdCounter++}` as Id<'class_enrollments'>;
          const row = { _id: id, _creationTime: now, ...doc } as ClassEnrollmentRow;
          classEnrollments.push(row);
          return Promise.resolve(id);
        }
        case 'profiles': {
          const id = `profiles_${profileIdCounter++}` as Id<'profiles'>;
          const row = { _id: id, _creationTime: now, ...doc } as ProfileRow;
          profiles.push(row);
          return Promise.resolve(id);
        }
        case 'auth_credentials': {
          const id = `auth_credentials_${authCredentialIdCounter++}` as Id<'auth_credentials'>;
          const row = { _id: id, _creationTime: now, ...doc } as AuthCredentialRow;
          authCredentials.push(row);
          return Promise.resolve(id);
        }
        case 'roster_imports': {
          const id = `roster_imports_${rosterImportIdCounter++}` as Id<'roster_imports'>;
          const row = { _id: id, _creationTime: now, ...doc } as RosterImportRow;
          rosterImports.push(row);
          return Promise.resolve(id);
        }
        default:
          return Promise.resolve(`unknown_${table}_1` as unknown as Id<'classes'>);
      }
    },
  );

  const patchSpy = vi.fn().mockImplementation(
    (id: string, updates: Record<string, unknown>) => {
      const applyTo = (
        list: Array<{ _id: string }>,
      ): boolean => {
        const found = list.find((d) => d._id === id);
        if (!found) return false;
        Object.assign(found, updates, { updatedAt: Date.now() });
        return true;
      };
      applyTo(classEnrollments);
      applyTo(profiles);
      applyTo(classes);
      applyTo(authCredentials);
      applyTo(rosterImports);
      return Promise.resolve(undefined);
    },
  );

  const ctx: RosterMockCtx = {
    db: {
      query: vi.fn().mockImplementation((tableName: string) => {
        switch (tableName) {
          case 'classes':
            return classesQuery;
          case 'class_enrollments':
            return classEnrollmentsQuery;
          case 'profiles':
            return profilesQuery;
          case 'auth_credentials':
            return authCredentialsQuery;
          case 'roster_imports':
            return rosterImportsQuery;
          default:
            return {
              withIndex: vi.fn().mockReturnThis(),
              collect: vi.fn().mockResolvedValue([]),
              first: vi.fn().mockResolvedValue(null),
              unique: vi.fn().mockResolvedValue(null),
            };
        }
      }),
      insert: insertSpy,
      get: vi.fn().mockImplementation((id: string) => {
        const all = [
          ...classes,
          ...classEnrollments,
          ...profiles,
          ...authCredentials,
          ...rosterImports,
        ];
        const found = all.find((d) => (d as { _id: string })._id === id);
        return Promise.resolve(found ?? null);
      }),
      patch: patchSpy,
      delete: vi.fn().mockResolvedValue(undefined),
    },
    classes,
    classEnrollments,
    profiles,
    authCredentials,
    rosterImports,
    insertSpy,
    patchSpy,
    classEnrollmentsByClassAndStudentCalls,
    classEnrollmentsByClassCalls,
    profilesByUsernameCalls,
    authCredentialsByUsernameCalls,
    rosterImportsByClassCalls,
  };

  // Track counters via property descriptors so tests can read after.
  Object.defineProperty(ctx, 'classEnrollmentsByClassAndStudentCalls', {
    get: () => classEnrollmentsByClassAndStudentCalls,
  });
  Object.defineProperty(ctx, 'classEnrollmentsByClassCalls', {
    get: () => classEnrollmentsByClassCalls,
  });
  Object.defineProperty(ctx, 'profilesByUsernameCalls', {
    get: () => profilesByUsernameCalls,
  });
  Object.defineProperty(ctx, 'authCredentialsByUsernameCalls', {
    get: () => authCredentialsByUsernameCalls,
  });
  Object.defineProperty(ctx, 'rosterImportsByClassCalls', {
    get: () => rosterImportsByClassCalls,
  });

  return ctx;
}

export const FIXED_TEST_ORG = 'organizations_test_1' as Id<'organizations'>;

export function makeTestTeacher(
  overrides: Partial<ProfileRow> = {},
): ProfileRow {
  return {
    _id: 'profiles_teacher_1' as Id<'profiles'>,
    _creationTime: 1_780_000_000_000,
    organizationId: FIXED_TEST_ORG,
    username: 'teacher.test',
    role: 'teacher',
    displayName: 'Test Teacher',
    metadata: {},
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
    ...overrides,
  };
}

export function makeTestClass(
  overrides: Partial<ClassRow> = {},
): ClassRow {
  return {
    _id: 'classes_test_1' as Id<'classes'>,
    _creationTime: 1_780_000_000_000,
    teacherId: makeTestTeacher()._id,
    name: 'Period 3 — Algebra',
    description: 'Integrated Math 3 — Spring',
    academicYear: '2025-2026',
    archived: false,
    metadata: {},
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
    ...overrides,
  };
}