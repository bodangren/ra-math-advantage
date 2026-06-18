// Failing tests for Phase 2 — Task 3: Import summary persistence + retrieval.
//
// Per measure/tracks/onboarding-roster-import_20260605/test-strategy.md §6:
//   "getImportSummary query round-trips the persisted result."
//
// Per spec.md FR6 + AC5: "Import summary is auditable; boundary lints,
// tsc --noEmit, tests pass." Import results (created/updated/skipped/errors)
// must be retrievable after the mutation completes — this is the
// auditability contract.
//
// These tests target the read-side of the Convex wiring in
//   apps/integrated-math-3/convex/onboarding/roster-import.ts
// exporting getImportSummary (and listImportsForClass for the broader
// audit surface). The mutation that produces the persisted summary is
// covered by roster-import.test.ts; this file is concerned with the
// read query and the round-trip contract.

import { describe, it, expect, beforeEach } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

// Production module — does not exist yet (Red phase).
import {
  getImportSummary,
  listImportsForClass,
} from '@/convex/onboarding/roster-import';

import {
  makeRosterMockCtx,
  makeTestClass,
  makeTestTeacher,
  type RosterMockCtx,
  type RosterImportRow,
} from './_helpers/mockRosterCtx';

const TEACHER_ID = makeTestTeacher()._id;
const CLASS_ID = makeTestClass()._id;
const OTHER_CLASS_ID = 'classes_other' as Id<'classes'>;

function makePersistedImport(
  overrides: Partial<RosterImportRow> = {},
): RosterImportRow {
  return {
    _id: 'roster_imports_test_1' as Id<'roster_imports'>,
    _creationTime: 1_780_000_000_000,
    classId: CLASS_ID,
    importedBy: TEACHER_ID,
    importedAt: 1_780_000_000_000,
    source: { fileName: 'roster.csv', rowCount: 3 },
    created: 3,
    updated: 0,
    skipped: 0,
    errors: [],
    createdStudentIds: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Task 2.3.a — getImportSummary round-trips the persisted result
// ---------------------------------------------------------------------------

describe('getImportSummary — round-trip', () => {
  let ctx: RosterMockCtx;
  const importRow = makePersistedImport();

  beforeEach(() => {
    ctx = makeRosterMockCtx({
      classes: [makeTestClass()],
      rosterImports: [importRow],
    });
  });

  it('returns the persisted import summary for a known classId + importId', async () => {
    const result = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: importRow._id },
    );

    expect(result).toBeDefined();
    expect(result!.importId).toBe(importRow._id);
    expect(result!.classId).toBe(CLASS_ID);
  });

  it('returns counts {created, updated, skipped, errors} from the persisted row', async () => {
    const withMixed: RosterImportRow = makePersistedImport({
      created: 2,
      updated: 1,
      skipped: 1,
      errors: [
        {
          rowIndex: 4,
          column: 'email',
          code: 'invalid_email',
          message: 'malformed email',
        },
      ],
    });
    const ctx2 = makeRosterMockCtx({
      classes: [makeTestClass()],
      rosterImports: [withMixed],
    });

    const result = await getImportSummary(
      ctx2 as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: withMixed._id },
    );

    expect(result!.created).toBe(2);
    expect(result!.updated).toBe(1);
    expect(result!.skipped).toBe(1);
    expect(result!.errors).toHaveLength(1);
    expect(result!.errors[0]!.code).toBe('invalid_email');
  });

  it('returns the importedBy teacher and importedAt timestamp for audit', async () => {
    const result = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: importRow._id },
    );

    expect(result!.importedBy).toBe(TEACHER_ID);
    expect(result!.importedAt).toBe(1_780_000_000_000);
  });

  it('returns source metadata (fileName, rowCount) for audit', async () => {
    const result = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: importRow._id },
    );

    expect(result!.source).toBeDefined();
    expect(result!.source.fileName).toBe('roster.csv');
    expect(result!.source.rowCount).toBe(3);
  });

  it('returns null when the importId is not found', async () => {
    const result = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: 'roster_imports_unknown' as Id<'roster_imports'> },
    );

    expect(result).toBeNull();
  });

  it('returns null when the importId exists but belongs to a different class', async () => {
    const result = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: OTHER_CLASS_ID, importId: importRow._id },
    );

    // Cross-class isolation: a teacher must not see imports for a class
    // they do not own. Either null or an explicit error is acceptable;
    // the test permits null as the audit-safe default.
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 2.3.b — Error array preserves PII rules in the persisted summary
// ---------------------------------------------------------------------------
//
// Per spec.md NFR: "No PII leakage in errors/logs."
// Per test-strategy.md §4.2: "every error path test in Phases 1 & 2
// asserts the error payload contains row index/column but not the raw
// email or full name."

describe('getImportSummary — error array PII rules', () => {
  it('returns errors with rowIndex/column/code but never the raw email', async () => {
    const privateEmail = 'private.ada@hidden.test';
    const importWithPii: RosterImportRow = makePersistedImport({
      created: 0,
      updated: 0,
      skipped: 1,
      errors: [
        {
          rowIndex: 7,
          column: 'email',
          code: 'invalid_email',
          message: 'malformed email',
        },
      ],
    });
    const ctx = makeRosterMockCtx({
      classes: [makeTestClass()],
      rosterImports: [importWithPii],
    });

    const result = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: importWithPii._id },
    );

    expect(result!.errors).toHaveLength(1);
    const payload = JSON.stringify(result);
    expect(payload).not.toContain(privateEmail);
    expect(result!.errors[0]!.rowIndex).toBe(7);
    expect(result!.errors[0]!.column).toBe('email');
    expect(result!.errors[0]!.code).toBe('invalid_email');
  });
});

// ---------------------------------------------------------------------------
// Task 2.3.c — listImportsForClass: bulk audit listing
// ---------------------------------------------------------------------------

describe('listImportsForClass — audit listing', () => {
  it('returns all imports for a class in reverse chronological order', async () => {
    const older: RosterImportRow = makePersistedImport({
      _id: 'roster_imports_older' as Id<'roster_imports'>,
      importedAt: 1_770_000_000_000,
    });
    const newer: RosterImportRow = makePersistedImport({
      _id: 'roster_imports_newer' as Id<'roster_imports'>,
      importedAt: 1_790_000_000_000,
    });
    const unrelated: RosterImportRow = makePersistedImport({
      _id: 'roster_imports_other_class' as Id<'roster_imports'>,
      classId: OTHER_CLASS_ID,
      importedAt: 1_795_000_000_000,
    });

    const ctx = makeRosterMockCtx({
      classes: [makeTestClass()],
      rosterImports: [older, newer, unrelated],
    });

    const result = await listImportsForClass(
      ctx as unknown as Parameters<typeof listImportsForClass>[0],
      { classId: CLASS_ID },
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.importId)).toEqual([
      newer._id,
      older._id,
    ]);
  });

  it('returns an empty list when the class has no imports', async () => {
    const ctx = makeRosterMockCtx({
      classes: [makeTestClass()],
      rosterImports: [],
    });

    const result = await listImportsForClass(
      ctx as unknown as Parameters<typeof listImportsForClass>[0],
      { classId: CLASS_ID },
    );

    expect(result).toEqual([]);
  });

  it('isolates imports by classId — a different class does not leak through', async () => {
    const own: RosterImportRow = makePersistedImport({
      _id: 'roster_imports_own' as Id<'roster_imports'>,
      classId: CLASS_ID,
      importedAt: 1_780_000_000_000,
    });
    const othersClass: RosterImportRow = makePersistedImport({
      _id: 'roster_imports_other' as Id<'roster_imports'>,
      classId: OTHER_CLASS_ID,
      importedAt: 1_781_000_000_000,
    });

    const ctx = makeRosterMockCtx({
      classes: [makeTestClass()],
      rosterImports: [own, othersClass],
    });

    const result = await listImportsForClass(
      ctx as unknown as Parameters<typeof listImportsForClass>[0],
      { classId: CLASS_ID },
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.classId).toBe(CLASS_ID);
  });
});

// ---------------------------------------------------------------------------
// Task 2.3.d — Summary persistence through the mutation
// ---------------------------------------------------------------------------
//
// Round-trip: importRosterMutation persists a roster_imports row that
// getImportSummary can read back. This complements roster-import.test.ts
// by exercising the read side of the same persisted record.

describe('Phase 2 mutation + summary round-trip', () => {
  it('a row written by importRosterMutation is readable by getImportSummary', async () => {
    // Lazy import so we can co-test the mutation and the query together
    // without adding a hard import-time coupling between the two files.
    const { importRosterMutation } = await import(
      '@/convex/onboarding/roster-import',
    );

    const ctx = makeRosterMockCtx({
      profiles: [makeTestTeacher()],
      classes: [makeTestClass()],
    });

    const rows = [
      {
        rowIndex: 1,
        name: 'Ada Lovelace',
        email: 'ada@school.test',
        section: undefined,
        sisId: undefined,
      },
    ];

    const writeResult = await importRosterMutation(
      ctx as unknown as Parameters<typeof importRosterMutation>[0],
      { classId: CLASS_ID, rows, importedBy: TEACHER_ID },
    );

    const readResult = await getImportSummary(
      ctx as unknown as Parameters<typeof getImportSummary>[0],
      { classId: CLASS_ID, importId: writeResult.importId },
    );

    expect(readResult).toBeDefined();
    expect(readResult!.importId).toBe(writeResult.importId);
    expect(readResult!.created).toBe(writeResult.created);
    expect(readResult!.updated).toBe(writeResult.updated);
    expect(readResult!.skipped).toBe(writeResult.skipped);
  });
});