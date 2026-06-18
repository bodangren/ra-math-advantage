// Test fixture builders for the roster import contract tests.
//
// These helpers are intentionally pure and dependency-free: tests in
// `apps/integrated-math-3/__tests__/lib/roster/` import them to build
// synthetic RosterRow / RosterImportError inputs without duplicating
// shape literals across the three test files. The Green-phase modules
// (csv-contract, parser, dry-run) live under
// `apps/integrated-math-3/lib/roster/` and export the types these
// builders produce.

/** A single roster row in CSV-order shape (one column per key). */
export interface RosterCsvShape {
  name: string;
  email?: string;
  sisId?: string;
  section?: string;
}

/** A single parsed roster row (post-validation). Mirrors the
 *  Green-phase `RosterRow` type. */
export interface RosterRow {
  rowIndex: number;
  name: string;
  email?: string;
  sisId?: string;
  section?: string;
}

/** A row-level validation error produced by the parser. Mirrors the
 *  Green-phase `RosterImportError` type. */
export interface RosterImportError {
  rowIndex: number;
  column?: 'name' | 'email' | 'sisId' | 'section';
  code:
    | 'missing_required'
    | 'invalid_email'
    | 'duplicate_identifier'
    | 'malformed_row';
  message: string;
}

/** Aggregate import result shape. Mirrors the Green-phase
 *  `RosterImportResult` type. */
export interface RosterImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: RosterImportError[];
}

/** Build a synthetic CSV-shape row. Defaults are deliberately minimal so
 *  each test opts in to the columns it cares about. */
export function makeRosterCsvRow(
  partial: Partial<RosterCsvShape> & { name: string },
): RosterCsvShape {
  return { ...partial };
}

/** Build a synthetic RosterRow (parsed shape) for assertions. */
export function makeRosterRow(
  partial: Partial<RosterRow> & { name: string; rowIndex: number },
): RosterRow {
  return { ...partial };
}

/** Build a synthetic RosterImportError. The `message` defaults to a
 *  stable, code-derived string so tests can assert on the code only. */
export function makeImportError(
  partial: Partial<RosterImportError> & { rowIndex: number; code: RosterImportError['code'] },
): RosterImportError {
  const defaults: Record<RosterImportError['code'], string> = {
    missing_required: 'missing required column',
    invalid_email: 'malformed email',
    duplicate_identifier: 'duplicate identifier within file',
    malformed_row: 'malformed row',
  };
  return {
    column: partial.column,
    code: partial.code,
    rowIndex: partial.rowIndex,
    message: partial.message ?? defaults[partial.code],
  };
}

/** Build a synthetic RosterImportResult (used by dry-run-preview tests). */
export function makeImportResult(
  partial: Partial<RosterImportResult> = {},
): RosterImportResult {
  return {
    created: partial.created ?? 0,
    updated: partial.updated ?? 0,
    skipped: partial.skipped ?? 0,
    errors: partial.errors ?? [],
  };
}

/** Serialize an array of CSV-shape rows to a CSV string. Always emits
 *  the canonical header order from the contract:
 *  `name,email,sisId,section`. Empty cells are written as empty (no
 *  quoting) so golden CSVs match the expected bytes-for-bytes. */
export function rowsToCsv(rows: ReadonlyArray<RosterCsvShape>): string {
  const headers = ['name', 'email', 'sisId', 'section'] as const;
  const headerLine = headers.join(',');
  const lines = rows.map((r) =>
    headers.map((h) => (r[h] ?? '').toString()).join(','),
  );
  return [headerLine, ...lines].join('\n');
}
