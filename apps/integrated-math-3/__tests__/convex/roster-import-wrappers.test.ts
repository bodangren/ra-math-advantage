// Red tests for Phase 2 — Convex wrapper validator correctness.
//
// Per measure/tracks/onboarding-roster-import_20260605/test-strategy.md §6
// the Phase 2 deliverable is three handlers: importRosterMutation,
// getImportSummary, listImportsForClass. The committed Red tests
// (apps/integrated-math-3/__tests__/convex/roster-import.test.ts and
// import-summary.test.ts) exercise the underlying handlers against a
// mock-ctx; this file covers the Convex wrappers — the registered
// internalMutation / internalQuery objects whose args validators the
// Convex runtime consults at request time.
//
// Per spec.md FR6 + AC5: "Import summary is auditable; boundary lints,
// tsc --noEmit, tests pass." A wrong validator on
// getImportSummaryQuery (e.g., `v.id('_scheduled_functions')` instead
// of `v.id('roster_imports')`) would:
//   1. Pass type-checking because v.id() accepts any string literal.
//   2. Be registered in convex/_generated/api.d.ts with the wrong table.
//   3. Reject every legitimate importId at runtime via Convex's
//      request validator.
//
// This file pins the validator shapes by parsing the JSON exposed via
// Convex's `exportArgs()` runtime hook (defined in
// node_modules/convex/dist/esm/server/impl/registration_impl.js).
// The JSON shape for an id validator is
// `{ "type": "id", "tableName": "<table>" }`; for an object validator
// it's `{ "type": "object", "value": { "<field>": { "fieldType": {...},
// "optional": <bool> }, ... } }`.
//
// The current implementation has `v.id('_scheduled_functions')` on
// getImportSummaryQuery.args.importId — caught here. The other
// wrappers carry correct table names; the tests pin those too so
// regressions are caught.

import { describe, it, expect } from 'vitest';

type FieldValidator =
  | { type: 'id'; tableName: string }
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'array'; value: Validator }
  | { type: 'object'; value: Record<string, FieldValidator> }
  | { type: 'null' };

interface Validator {
  type: string;
  value?: unknown;
}

interface ArgsJson {
  type: 'object';
  value: Record<
    string,
    { fieldType: FieldValidator; optional: boolean }
  >;
}

function parseArgs(exportedArgs: string): ArgsJson {
  return JSON.parse(exportedArgs) as ArgsJson;
}

function getField(
  args: ArgsJson,
  fieldName: string,
): FieldValidator {
  const field = args.value[fieldName];
  if (!field) {
    throw new Error(`field ${fieldName} not present in args validator`);
  }
  return field.fieldType;
}

describe('roster-import Convex wrappers — args validator correctness', () => {
  it('getImportSummaryQuery.args.importId is v.id("roster_imports")', async () => {
    const { getImportSummaryQuery } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(getImportSummaryQuery.exportArgs());
    const importId = getField(args, 'importId');
    expect(importId.type).toBe('id');
    if (importId.type !== 'id') {
      throw new Error('unreachable — type narrowed above');
    }
    expect(importId.tableName).toBe('roster_imports');
  });

  it('getImportSummaryQuery.args.classId is v.id("classes")', async () => {
    const { getImportSummaryQuery } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(getImportSummaryQuery.exportArgs());
    const classId = getField(args, 'classId');
    expect(classId.type).toBe('id');
    if (classId.type !== 'id') {
      throw new Error('unreachable — type narrowed above');
    }
    expect(classId.tableName).toBe('classes');
  });

  it('importRosterMutationConvex.args.importedBy is v.id("profiles")', async () => {
    const { importRosterMutationConvex } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(importRosterMutationConvex.exportArgs());
    const importedBy = getField(args, 'importedBy');
    expect(importedBy.type).toBe('id');
    if (importedBy.type !== 'id') {
      throw new Error('unreachable — type narrowed above');
    }
    expect(importedBy.tableName).toBe('profiles');
  });

  it('importRosterMutationConvex.args.classId is v.id("classes")', async () => {
    const { importRosterMutationConvex } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(importRosterMutationConvex.exportArgs());
    const classId = getField(args, 'classId');
    expect(classId.type).toBe('id');
    if (classId.type !== 'id') {
      throw new Error('unreachable — type narrowed above');
    }
    expect(classId.tableName).toBe('classes');
  });

  it('listImportsForClassQuery.args.classId is v.id("classes")', async () => {
    const { listImportsForClassQuery } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(listImportsForClassQuery.exportArgs());
    const classId = getField(args, 'classId');
    expect(classId.type).toBe('id');
    if (classId.type !== 'id') {
      throw new Error('unreachable — type narrowed above');
    }
    expect(classId.tableName).toBe('classes');
  });

  it('importRosterMutationConvex.args.rows is v.array(v.object({...})) with all four CSV columns', async () => {
    const { importRosterMutationConvex } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(importRosterMutationConvex.exportArgs());
    const rows = getField(args, 'rows');
    expect(rows.type).toBe('array');
    if (rows.type !== 'array') {
      throw new Error('unreachable — type narrowed above');
    }
    const element = rows.value as FieldValidator;
    expect(element.type).toBe('object');
    if (element.type !== 'object') {
      throw new Error('unreachable — type narrowed above');
    }
    const fields = element.value;
    expect(Object.keys(fields).sort()).toEqual(
      ['email', 'name', 'rowIndex', 'section', 'sisId'].sort(),
    );
  });

  it('importRosterMutationConvex.args.source is v.optional(v.object({fileName, rowCount}))', async () => {
    const { importRosterMutationConvex } = await import(
      '@/convex/onboarding/roster-import'
    );

    const args = parseArgs(importRosterMutationConvex.exportArgs());
    const sourceField = args.value['source'];
    expect(sourceField).toBeDefined();
    expect(sourceField!.optional).toBe(true);
    const source = sourceField!.fieldType;
    expect(source.type).toBe('object');
    if (source.type !== 'object') {
      throw new Error('unreachable — type narrowed above');
    }
    expect(Object.keys(source.value).sort()).toEqual(
      ['fileName', 'rowCount'].sort(),
    );
  });
});