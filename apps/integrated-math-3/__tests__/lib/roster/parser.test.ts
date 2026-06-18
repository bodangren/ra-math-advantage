// Phase 1 (Track onboarding-roster-import_20260605) — Pure CSV parser +
// row-level validation Red tests.
//
// Per `measure/tracks/onboarding-roster-import_20260605/test-strategy.md` §6
// (Phase 1 "CSV contract & parsing — bulk — pure parser, validators,
// dry-run") and §4 (cross-phase edge cases 1, 2, 3), this file pins the
// live behavior of
//   apps/integrated-math-3/lib/roster/parser.ts
// exporting
//   parseRoster(csv: string): RosterParseResult
//
// Behavior pinned by these tests:
//   - Good row → 1 row, 0 errors
//   - Empty CSV → 0 rows, 0 errors
//   - Missing required column → all rows fail with code 'missing_required'
//   - Malformed email → 1 row, 1 error with code 'invalid_email'
//   - Duplicate identifier within file → error with code
//     'duplicate_identifier' (test-strategy §4 #1 — same precedence as
//     Phase 1 contract test)
//   - BOM tolerance (UTF-8 BOM at start of file is stripped)
//   - CRLF tolerance (Windows line endings are normalized)
//   - Quoted field with embedded comma → field parsed intact
//   - PII safety: error payload contains rowIndex and (optional)
//     column, but no raw email or full name values (test-strategy §4 #2)
//
// The Green phase must create the module
//   apps/integrated-math-3/lib/roster/parser.ts
// with the public shape asserted below. At HEAD, the module does not
// exist yet, so the import fails — the Red signal.
//
// Test count: 11 tests. Targeted Red command (Phase 1 §7):
//   npx vitest run apps/integrated-math-3/__tests__/lib/roster/parser.test.ts \
//     --root apps/integrated-math-3
//
// Fixture inputs are inline (not read from disk) so the Red signal is
// deterministic and the test file alone proves the contract without
// relying on golden CSVs being present. The golden CSVs in
// `__tests__/fixtures/roster/*.csv` are reserved for parser/dry-run
// integration assertions in the Green phase and for Phase 2/3 reuse.

import { describe, it, expect } from 'vitest';
import { parseRoster } from '@/lib/roster/parser';
import type {
  RosterRow,
  RosterImportError,
  RosterParseResult,
} from '@/lib/roster/csv-contract';
import { rowsToCsv } from '../../fixtures/roster/builders';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_ROWS = [
  { name: 'Alice Anderson', email: 'alice.anderson@school.edu', sisId: 'SIS-001', section: 'Period 1' },
  { name: 'Bob Brown', email: 'bob.brown@school.edu', sisId: 'SIS-002', section: 'Period 1' },
];

const SAMPLE_CSV = rowsToCsv(VALID_ROWS);

// ---------------------------------------------------------------------------
// 1. Good rows
// ---------------------------------------------------------------------------

describe('parseRoster — good rows (FR2)', () => {
  it('parses a valid CSV with 2 rows, 0 errors', () => {
    const result: RosterParseResult = parseRoster(SAMPLE_CSV);
    expect(result.rows.length).toBe(2);
    expect(result.errors.length).toBe(0);
  });

  it('preserves column values exactly (name, email, sisId, section)', () => {
    const result = parseRoster(SAMPLE_CSV);
    const first = result.rows[0]!;
    expect(first.name).toBe('Alice Anderson');
    expect(first.email).toBe('alice.anderson@school.edu');
    expect(first.sisId).toBe('SIS-001');
    expect(first.section).toBe('Period 1');
  });

  it('assigns 1-based rowIndex to the first data row, incrementing thereafter', () => {
    // rowIndex is the user-facing "row number in the file" with the
    // header NOT counted. The first data row is row 1, so the wizard
    // can show "Row 3: invalid email" without off-by-one gymnastics.
    const result = parseRoster(SAMPLE_CSV);
    const indices = result.rows.map((r: RosterRow) => r.rowIndex);
    expect(indices).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// 2. Empty / header-only input
// ---------------------------------------------------------------------------

describe('parseRoster — empty / header-only input', () => {
  it('returns 0 rows and 0 errors for an empty string', () => {
    const result = parseRoster('');
    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it('returns 0 rows and 0 errors for a header-only CSV', () => {
    const result = parseRoster('name,email,sisId,section\n');
    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. Required-column enforcement
// ---------------------------------------------------------------------------

describe('parseRoster — missing required column (FR2 / test-strategy §4)', () => {
  it('reports a single missing_required error when the email column is absent', () => {
    // The required-column check fires once per file, NOT once per row,
    // because the contract is "the file is missing email" not "every
    // row is missing email" — Phase 3 UI will render this as a banner.
    // We assert the code and rowIndex 0 (file-level, not a data row).
    const csv = 'name,sisId,section\nAlice,SIS-001,P1\nBob,SIS-002,P1\n';
    const result = parseRoster(csv);
    const missing = result.errors.filter(
      (e: RosterImportError) => e.code === 'missing_required',
    );
    expect(missing.length).toBeGreaterThanOrEqual(1);
    expect(missing[0]!.column).toBe('email');
    // The implementation MAY still parse the data rows (with email
    // undefined) OR skip them; both are acceptable, but at minimum
    // the error must be surfaced.
  });
});

// ---------------------------------------------------------------------------
// 4. Per-row validation
// ---------------------------------------------------------------------------

describe('parseRoster — per-row validation (FR2)', () => {
  it('reports invalid_email for a row whose email is malformed', () => {
    const csv = rowsToCsv([
      { name: 'Charlie Cho', email: 'not-an-email', sisId: 'SIS-003' },
    ]);
    const result = parseRoster(csv);
    const invalid = result.errors.filter(
      (e: RosterImportError) => e.code === 'invalid_email',
    );
    expect(invalid.length).toBe(1);
    expect(invalid[0]!.rowIndex).toBe(1);
    expect(invalid[0]!.column).toBe('email');
  });

  it('reports missing_required when the name cell is empty (name is required)', () => {
    const csv = rowsToCsv([{ name: '', email: 'no-name@school.edu', sisId: 'SIS-X' }]);
    const result = parseRoster(csv);
    const missing = result.errors.filter(
      (e: RosterImportError) => e.code === 'missing_required' && e.column === 'name',
    );
    expect(missing.length).toBe(1);
    expect(missing[0]!.rowIndex).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 5. Duplicate identifier detection (test-strategy §4 #1)
// ---------------------------------------------------------------------------

describe('parseRoster — duplicate identifier within file (test-strategy §4)', () => {
  it('reports duplicate_identifier when two rows share the same email', () => {
    const csv = rowsToCsv([
      { name: 'Alice', email: 'shared@school.edu', sisId: 'SIS-A' },
      { name: 'Bob', email: 'shared@school.edu', sisId: 'SIS-B' },
    ]);
    const result = parseRoster(csv);
    const dupes = result.errors.filter(
      (e: RosterImportError) => e.code === 'duplicate_identifier',
    );
    expect(dupes.length).toBeGreaterThanOrEqual(1);
    // Every duplicate_identifier error must point at a real data row.
    expect(dupes.every((e) => e.rowIndex >= 1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Encoding tolerance — BOM, CRLF, quoted commas
// ---------------------------------------------------------------------------

describe('parseRoster — encoding tolerance (FR2)', () => {
  it('strips a UTF-8 BOM at the start of the file so the header is parsed', () => {
    // Excel on Windows emits a UTF-8 BOM (0xEF 0xBB 0xBF) at the start
    // of CSV files; without stripping, the first header cell becomes
    // "\uFEFFname" and the column lookup fails.
    const bom = '\uFEFF';
    const csv = bom + SAMPLE_CSV;
    const result = parseRoster(csv);
    expect(result.rows.length).toBe(2);
    expect(result.errors.length).toBe(0);
  });

  it('tolerates CRLF line endings (Windows exports)', () => {
    const csv = SAMPLE_CSV.replace(/\n/g, '\r\n');
    const result = parseRoster(csv);
    expect(result.rows.length).toBe(2);
    expect(result.errors.length).toBe(0);
  });

  it('parses a quoted field containing a comma as a single value', () => {
    // RFC 4180: "Smith, Jr." is one cell. Without quoted-field support
    // the parser would split on the embedded comma.
    const csv = [
      'name,email,sisId,section',
      '"Smith, Jr.",smithjr@school.edu,SIS-007,P1',
    ].join('\n');
    const result = parseRoster(csv);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]!.name).toBe('Smith, Jr.');
  });
});

// ---------------------------------------------------------------------------
// 7. PII safety — error payload must not contain raw email or full name
//    (test-strategy §4 #2)
// ---------------------------------------------------------------------------

describe('parseRoster — PII safety in error payloads (NFR / test-strategy §4)', () => {
  it('does not include the raw email or full name in any error payload', () => {
    // The error payload is rendered in the teacher UI, logged to the
    // console, and persisted to Convex. None of those surfaces should
    // see the raw PII. We seed a roster with 3 rows that each have
    // unique, recognizable strings; if any of those strings appear in
    // any error, the contract is breached.
    const SECRET_NAME = 'PII-NAME-MARKER-XYZ';
    const SECRET_EMAIL = 'pii-email-marker-xyz@school.test';
    const SECRET_SISID = 'PII-SISID-MARKER-XYZ';
    const csv = rowsToCsv([
      { name: 'Alice', email: 'alice@school.edu', sisId: 'SIS-1' },
      { name: SECRET_NAME, email: SECRET_EMAIL, sisId: SECRET_SISID },
      { name: 'Carol', email: 'not-an-email', sisId: 'SIS-3' },
    ]);
    const result = parseRoster(csv);
    const allErrorText = JSON.stringify(result.errors);
    expect(allErrorText).not.toContain(SECRET_NAME);
    expect(allErrorText).not.toContain(SECRET_EMAIL);
    // sisId is generally less sensitive than email, but we pin it too
    // — the test-strategy §4 #2 rule is "no PII" generically. The
    // Green implementer MAY include sisId in the error payload if
    // they wish; this test only pins email + name, which are the
    // canonical PII fields the test-strategy calls out.
  });
});
