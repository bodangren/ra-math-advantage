// Failing tests for Phase 2 — Tasks 1+2: Idempotent enrollment mutation.
//
// Per measure/tracks/onboarding-roster-import_20260605/test-strategy.md §6:
//   - importRosterMutation (insert path)
//   - re-run on identical input (zero new inserts via by_class_and_student)
//   - updates-by-identifier path
//   - batch boundary (≥51 rows in one call → still ≤constant index lookups)
//   - error pass-through preserves PII rules
//
// Per spec.md FR3 + FR5: import is idempotent and links/creates student
// accounts by identifier (email/sisId) without leaking PII in error
// payloads. Provisioned accounts must be retrievable from
// profiles + auth_credentials.
//
// These tests target the Convex-layer handlers in
//   apps/integrated-math-3/convex/onboarding/roster-import.ts
// that do not exist yet (Red phase). The pure CSV parser that lives in
// lib/roster/parser.ts is covered by __tests__/lib/roster/parser.test.ts.
// This file is concerned with the Convex wiring — the mutation that
// resolves each row's identifier into a student profile and creates
// or updates a class_enrollments row using by_class_and_student.
//
// The mock ctx pattern follows the existing __tests__/convex/placement.test.ts
// and __tests__/convex/study.test.ts conventions, extended per
// test-strategy §3 with a class_enrollments table + by_class_and_student
// index, plus the Phase 2 tables: profiles, auth_credentials, classes,
// and roster_imports (new for FR6 auditability).

import { describe, it, expect, beforeEach } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates
//   apps/integrated-math-3/convex/onboarding/roster-import.ts
// exporting importRosterMutation (and the summary retrieval handlers
// covered by import-summary.test.ts).
import { importRosterMutation } from '@/convex/onboarding/roster-import';

// Shared mock-ctx builder — see __tests__/convex/_helpers/mockRosterCtx.ts.
import {
  makeRosterMockCtx,
  makeTestClass,
  makeTestTeacher,
  FIXED_TEST_ORG,
  type RosterMockCtx,
  type ClassEnrollmentRow,
  type ProfileRow,
} from './_helpers/mockRosterCtx';

const TEACHER_ID = makeTestTeacher()._id;
const CLASS_ID = makeTestClass()._id;

function makeRow(
  partial: {
    rowIndex?: number;
    name?: string;
    email?: string;
    sisId?: string;
    section?: string;
  },
) {
  return {
    rowIndex: partial.rowIndex ?? 1,
    name: partial.name ?? 'Ada Lovelace',
    email: partial.email,
    sisId: partial.sisId,
    section: partial.section,
  };
}

// ---------------------------------------------------------------------------
// Task 2.1.a — First-run insert path
// ---------------------------------------------------------------------------

describe('importRosterMutation — initial insert path', () => {
  let ctx: RosterMockCtx;

  beforeEach(() => {
    ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });
  });

  it('creates one class_enrollments row per imported row', async () => {
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
      makeRow({ rowIndex: 2, name: 'Grace Hopper', email: 'grace@school.test' }),
      makeRow({ rowIndex: 3, name: 'Alan Turing', email: 'alan@school.test' }),
    ];

    const result = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(result.created).toBe(3);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(ctx.classEnrollments).toHaveLength(3);
    for (const enrollment of ctx.classEnrollments) {
      expect(enrollment.classId).toBe(CLASS_ID);
      expect(enrollment.status).toBe('active');
    }
  });

  it('creates a profiles row for each new student keyed by email', async () => {
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
      makeRow({ rowIndex: 2, name: 'Grace Hopper', email: 'grace@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const newStudentProfiles = ctx.profiles.filter((p) => p.role === 'student');
    expect(newStudentProfiles).toHaveLength(2);
    const usernames = newStudentProfiles.map((p) => p.username).sort();
    expect(usernames).toEqual(['ada@school.test', 'grace@school.test']);
  });

  it('lowercases the email when seeding profiles.username (identifier semantics locked in Phase 1)', async () => {
    const rows = [
      makeRow({
        rowIndex: 1,
        name: 'Ada Lovelace',
        email: 'ADA@School.Test',
      }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const studentProfile = ctx.profiles.find((p) => p.role === 'student');
    expect(studentProfile).toBeDefined();
    expect(studentProfile!.username).toBe('ada@school.test');
  });

  it('creates matching auth_credentials rows for each new student', async () => {
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(ctx.authCredentials).toHaveLength(1);
    const cred = ctx.authCredentials[0]!;
    expect(cred.role).toBe('student');
    expect(cred.username).toBe('ada@school.test');
    expect(cred.organizationId).toBe(FIXED_TEST_ORG);
    expect(cred.isActive).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 2.1.b — Idempotency: re-running the same import produces zero new inserts
// ---------------------------------------------------------------------------
//
// Per spec.md FR3: "Re-importing does not duplicate students; updates/links
// existing accounts by identifier."
//
// Per test-strategy.md §4.3: "Idempotency proof spans Phase 1 (same parsed
// result twice) and Phase 2 (re-running mutation produces 0 inserts, N
// updates with by_class_and_student); both share
// roster-reimport-idempotent.csv."

describe('importRosterMutation — idempotency (re-import same input)', () => {
  let ctx: RosterMockCtx;
  const reimportRows = [
    makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    makeRow({ rowIndex: 2, name: 'Grace Hopper', email: 'grace@school.test' }),
    makeRow({ rowIndex: 3, name: 'Alan Turing', email: 'alan@school.test' }),
  ];

  beforeEach(() => {
    ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });
  });

  it('produces zero new class_enrollments inserts when re-imported with identical input', async () => {
    const first = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows: reimportRows, importedBy: TEACHER_ID },
    );
    expect(first.created).toBe(3);

    // Reset insert spy so we can count second-call inserts only.
    const insertCallsBefore = ctx.insertSpy.mock.calls.filter(
      (c) => c[0] === 'class_enrollments',
    ).length;

    const second = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows: reimportRows, importedBy: TEACHER_ID },
    );

    const insertCallsAfter = ctx.insertSpy.mock.calls.filter(
      (c) => c[0] === 'class_enrollments',
    ).length;
    expect(insertCallsAfter).toBe(insertCallsBefore);
    expect(second.created).toBe(0);
  });

  it('uses the by_class_and_student index to dedupe (not a full table scan or per-row first() loop)', async () => {
    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows: reimportRows, importedBy: TEACHER_ID },
    );
    const callsAfterFirst = ctx.classEnrollmentsByClassAndStudentCalls;

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows: reimportRows, importedBy: TEACHER_ID },
    );

    // Re-import must consult by_class_and_student again — for each row.
    expect(ctx.classEnrollmentsByClassAndStudentCalls).toBeGreaterThan(
      callsAfterFirst,
    );
    // But the call count should be O(N), not O(N²): one lookup per row is
    // acceptable, NOT one lookup per (row × existing_enrollment).
    expect(ctx.classEnrollmentsByClassAndStudentCalls).toBeLessThanOrEqual(
      reimportRows.length * 2,
    );
  });

  it('keeps the persisted set of (classId, studentId) pairs stable across re-imports', async () => {
    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows: reimportRows, importedBy: TEACHER_ID },
    );
    const firstPairs = ctx.classEnrollments
      .map((e) => e.studentId)
      .sort();

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows: reimportRows, importedBy: TEACHER_ID },
    );
    const secondPairs = ctx.classEnrollments
      .map((e) => e.studentId)
      .sort();

    expect(secondPairs).toEqual(firstPairs);
    expect(ctx.classEnrollments).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Task 2.1.c — Updates-by-identifier path: existing student is linked, not duplicated
// ---------------------------------------------------------------------------
//
// Per spec.md FR3 + test-strategy.md §6:
// "updates-by-identifier path" — when the email already exists, the
// student profile is reused, no new auth_credentials row is created, and
// the class_enrollments row uses by_class_and_student for the upsert.

describe('importRosterMutation — updates by identifier', () => {
  let ctx: RosterMockCtx;
  const existingStudent: ProfileRow = {
    _id: 'profiles_existing_student' as Id<'profiles'>,
    _creationTime: 1_770_000_000_000,
    organizationId: FIXED_TEST_ORG,
    username: 'ada@school.test',
    role: 'student',
    displayName: 'Ada Lovelace',
    metadata: { firstName: 'Ada', lastName: 'Lovelace' },
    createdAt: 1_770_000_000_000,
    updatedAt: 1_770_000_000_000,
  };

  beforeEach(() => {
    ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher(), existingStudent],
      classes: [makeTestClass()],
    });
  });

  it('does not create a duplicate profile when the email already matches an existing student', async () => {
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const adaProfiles = ctx.profiles.filter(
      (p) => p.role === 'student' && p.username === 'ada@school.test',
    );
    expect(adaProfiles).toHaveLength(1);
    expect(adaProfiles[0]!._id).toBe(existingStudent._id);
  });

  it('creates a fresh class_enrollments row for the existing student in the new class', async () => {
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const enrollments = ctx.classEnrollments.filter(
      (e) => e.studentId === existingStudent._id && e.classId === CLASS_ID,
    );
    expect(enrollments).toHaveLength(1);
    expect(enrollments[0]!.status).toBe('active');
  });

  it('reuses the existing student even if the name in the CSV has changed', async () => {
    const rows = [
      makeRow({
        rowIndex: 1,
        name: 'Augusta Ada King-Noel (updated)',
        email: 'ada@school.test',
      }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(ctx.profiles.filter((p) => p.username === 'ada@school.test')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Task 2.1.d — Batch boundary (no N+1)
// ---------------------------------------------------------------------------
//
// Per spec.md NFR: "enrollment writes are batched (no N+1)".
// Per test-strategy.md §4.5: "Phase 2 must include a counter assertion on
// the mock-ctx db.insert/db.patch call counts (≤ constant per batch, not
// per row)."
//
// For N rows imported in one call, the test-strategy requires that the
// number of profile-lookup operations stay bounded — typically one
// batched by_username query plus per-row by_class_and_student lookups.
// The exact per-row by_class_and_student lookups are tolerated because
// each must verify "does this enrollment already exist?".

describe('importRosterMutation — batch boundary (no N+1)', () => {
  it('does not call by_username per row when no students exist yet (batched lookup)', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    // 51+ rows: the batch boundary in test-strategy §6.
    const rows = Array.from({ length: 60 }, (_, i) =>
      makeRow({
        rowIndex: i + 1,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@school.test`,
      }),
    );

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    // The implementation must batch profile lookups: a per-row
    // by_username query would be N=60+ calls (and is forbidden by
    // test-strategy §4.5). The constant ceiling here is generous on
    // purpose — we are checking that the implementation does not
    // devolve into N lookups.
    expect(ctx.profilesByUsernameCalls).toBeLessThanOrEqual(3);
    expect(ctx.classEnrollmentsByClassAndStudentCalls).toBeLessThanOrEqual(
      rows.length + 2,
    );
  });

  it('produces 60 class_enrollments inserts for a 60-row initial import', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const rows = Array.from({ length: 60 }, (_, i) =>
      makeRow({
        rowIndex: i + 1,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@school.test`,
      }),
    );

    const result = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(result.created).toBe(60);
    expect(ctx.classEnrollments).toHaveLength(60);
  });
});

// ---------------------------------------------------------------------------
// Task 2.1.e — Error pass-through preserves PII rules
// ---------------------------------------------------------------------------
//
// Per spec.md NFR: "No PII leakage in errors/logs; respects existing auth
// + role guards."
// Per test-strategy.md §4.2: "every error path test in Phases 1 & 2
// asserts the error payload contains row index/column but not the raw
// email or full name."

describe('importRosterMutation — error pass-through preserves PII rules', () => {
  it('returns errors that include row index/column/code but never the raw email', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const privateEmail = 'private.ada@hidden.test';
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: privateEmail }),
      makeRow({
        rowIndex: 2,
        name: 'Bad Row',
        email: 'definitely-not-an-email',
      }),
    ];

    const result = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
    for (const err of result.errors) {
      const payload = JSON.stringify(err);
      expect(payload).not.toContain(privateEmail);
      expect(payload).not.toContain('ada@school.test');
      // The error must carry the row index for the teacher UI to
      // surface a usable row number.
      expect(typeof err.rowIndex).toBe('number');
      expect(err.code).toBeDefined();
    }
  });

  it('does not include the raw full name in any error message', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const privateName = 'Top Secret Student';
    const rows = [
      makeRow({
        rowIndex: 1,
        name: privateName,
        email: 'malformed', // forces an invalid_email error path
      }),
    ];

    const result = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    for (const err of result.errors) {
      const payload = JSON.stringify(err);
      expect(payload).not.toContain(privateName);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 2.1.f — Class-existence + authorization guards
// ---------------------------------------------------------------------------
//
// Per spec.md NFR: "respects existing auth + role guards."

describe('importRosterMutation — guards', () => {
  it('rejects when the classId does not exist', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [], // no class row
    });

    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await expect(
      importRosterMutation(
        ctx as unknown as Parameters<typeof importRosterMutation>[0],
        { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
      ),
    ).rejects.toThrowError(/class/i);
  });

  it('rejects when the importedBy teacher is not the class teacher', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const otherTeacherId = 'profiles_other_teacher' as Id<'profiles'>;
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await expect(
      importRosterMutation(
        ctx as unknown as Parameters<typeof importRosterMutation>[0],
        { classId: CLASS_ID, rows, importedBy: otherTeacherId },
      ),
    ).rejects.toThrowError(/teacher|forbidden|not.*owner/i);
  });
});

// ---------------------------------------------------------------------------
// Task 2.2 — Provisioning: imported students have an auth_credentials row
// ---------------------------------------------------------------------------
//
// Per spec.md FR5: "A mechanism to provision or invite imported students
// consistent with the existing auth model." The existing model lives in
// apps/integrated-math-3/convex/auth.ts:bulkCreateStudentAccounts. Phase 2
// must produce a profile + auth_credentials pair per new student so that
// AC4 (Invited/provisioned students can sign in and reach assigned work)
// is satisfiable downstream.

describe('importRosterMutation — provisioning per the auth model', () => {
  it('produces a profile + auth_credentials pair per new student in the same organization', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
      makeRow({ rowIndex: 2, name: 'Grace Hopper', email: 'grace@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const studentProfiles = ctx.profiles.filter((p) => p.role === 'student');
    expect(studentProfiles).toHaveLength(2);
    expect(ctx.authCredentials).toHaveLength(2);

    const profileIds = new Set(studentProfiles.map((p) => p._id));
    for (const cred of ctx.authCredentials) {
      expect(profileIds.has(cred.profileId)).toBe(true);
      expect(cred.organizationId).toBe(FIXED_TEST_ORG);
    }
  });

  it('does not produce a duplicate auth_credentials row on re-import', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );
    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const adaCreds = ctx.authCredentials.filter(
      (c) => c.username === 'ada@school.test',
    );
    expect(adaCreds).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Task 2.1.g — Initial import returns counts {created, updated, skipped}
// ---------------------------------------------------------------------------

describe('importRosterMutation — return value contract', () => {
  it('returns created=N, updated=0, skipped=0 for a fully-fresh import', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
      makeRow({ rowIndex: 2, name: 'Grace Hopper', email: 'grace@school.test' }),
    ];

    const result = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(result.created).toBe(2);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('returns a roster_imports row id so Phase 3 / Phase 2 summary can reference it', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    const result = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    expect(result.importId).toBeDefined();
    expect(String(result.importId)).toMatch(/^roster_imports_/);
    expect(ctx.rosterImports).toHaveLength(1);
    expect(ctx.rosterImports[0]!.classId).toBe(CLASS_ID);
  });

  it('records a roster_imports row with importedAt within the test window', async () => {
    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const before = Date.now();
    const rows = [
      makeRow({ rowIndex: 1, name: 'Ada Lovelace', email: 'ada@school.test' }),
    ];

    await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );
    const after = Date.now();

    const persisted = ctx.rosterImports[0]!;
    expect(persisted.importedAt).toBeGreaterThanOrEqual(before);
    expect(persisted.importedAt).toBeLessThanOrEqual(after);
  });
});

// Type-level sanity check — keeps the test file importable even if the
// row shapes evolve slightly between Red and Green phases. (Compiles
// only; runtime assertion is via the tests above.)
const _typeCheck: ClassEnrollmentRow | undefined = undefined;
void _typeCheck;