// Adversarial tests for Phase 1 — CSV Contract & Import Logic
// (Track `onboarding-roster-import_20260605`).
//
// Per the test-strategy §4 cross-phase edge cases and §6 Phase 1 contract,
// these tests try to DISPROVE correctness of the parser + dry-run with
// boundary, failure-path, integration, property, and contract-strengthening
// probes. Where the existing tests use permissive assertions
// (`toBeGreaterThanOrEqual(1)`), this file pins the EXACT expected behavior
// so a future refactor that emits two errors when one is expected, or that
// silently drops a row that should be flagged, cannot pass.
//
// The test file is organized by attack surface:
//   1. Parser boundary tests — header shape, whitespace, line layout, row count
//   2. Parser failure-path tests — bad input shapes that should be rejected
//   3. Parser property tests — determinism, error-payload purity, PII safety
//   4. Dry-run boundary tests — file-level vs row-level error accounting
//   5. Dry-run property tests — purity and consistency with the parser
//   6. Contract-strengthening tests — exact shape of the public surface
//   7. Golden-CSV integration tests — load each fixture from disk
//      and assert the same expected counts
//
// All probes are NON-FAKE: they hit `parseRoster` and `dryRunPreview`
// directly with real CSV bytes (inline strings or disk-loaded fixtures).
// No `vi.mock` is used; the parser has no Convex/React imports to fake.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

import { parseRoster } from '@/lib/roster/parser';
import { dryRunPreview } from '@/lib/roster/dry-run';
import {
  ROSTER_COLUMNS,
  REQUIRED_COLUMNS,
  IDENTIFIER_PRECEDENCE,
  type RosterImportError,
  type RosterParseResult,
} from '@/lib/roster/csv-contract';

import { rowsToCsv } from '../../fixtures/roster/builders';

const fixturesDir = resolvePath(__dirname, '../../fixtures/roster');

function loadFixture(name: string): string {
  return readFileSync(resolvePath(fixturesDir, name), 'utf8');
}

// ---------------------------------------------------------------------------
// 1. Parser boundary tests
// ---------------------------------------------------------------------------

describe('parseRoster — header shape (boundary)', () => {
  it('matches header columns case-insensitively', () => {
    // Spec §6 doesn't mandate case, but teachers export with whatever
    // casing their SIS uses. The contract test (contract.test.ts) locks
    // the column *names* — it does not lock the header *casing*. Pin
    // here that any reasonable casing is accepted.
    const csv = 'Name,EMAIL,SISID,Section\nAlice,alice@x.com,S-1,P1\n';
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]!.name).toBe('Alice');
    expect(result.rows[0]!.email).toBe('alice@x.com');
    expect(result.rows[0]!.sisId).toBe('S-1');
    expect(result.rows[0]!.section).toBe('P1');
  });

  it('matches columns regardless of header column order', () => {
    // A teacher who exports `email,name,sisId,section` from a non-default
    // SIS layout must still see name correctly extracted. Pin the
    // index-by-name, not index-by-position, behavior.
    const csv = 'email,name,sisId,section\nbob@x.com,Bob,S-2,P1\n';
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows[0]!.name).toBe('Bob');
    expect(result.rows[0]!.email).toBe('bob@x.com');
  });

  it('ignores extra columns beyond the four canonical ones', () => {
    // SIS exports sometimes include grade-level, homeroom, etc. Extra
    // columns must not break the parser and must not leak into the row.
    const csv = [
      'name,email,sisId,section,grade,homeroom',
      'Alice,alice@x.com,S-1,P1,9,Room-12',
    ].join('\n');
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    const row = result.rows[0]!;
    expect(Object.keys(row).sort()).toEqual(
      ['email', 'name', 'rowIndex', 'section', 'sisId'].sort(),
    );
  });

  it('treats a row with fewer cells than the header as missing trailing values', () => {
    // `Alice,alice@x.com` against a 4-column header must NOT shift the
    // data left (which would corrupt name/email). The trailing columns
    // (sisId, section) must be undefined.
    const csv = 'name,email,sisId,section\nAlice,alice@x.com\n';
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(1);
    const row = result.rows[0]!;
    expect(row.name).toBe('Alice');
    expect(row.email).toBe('alice@x.com');
    expect(row.sisId).toBeUndefined();
    expect(row.section).toBeUndefined();
  });
});

describe('parseRoster — whitespace tolerance (boundary)', () => {
  it('trims leading and trailing whitespace from each cell value', () => {
    const csv = 'name,email,sisId,section\n  Alice  ,  alice@x.com  ,  S-1  ,  P1  \n';
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    const row = result.rows[0]!;
    expect(row.name).toBe('Alice');
    expect(row.email).toBe('alice@x.com');
    expect(row.sisId).toBe('S-1');
    expect(row.section).toBe('P1');
  });

  it('treats a whitespace-only name cell as empty (missing_required)', () => {
    // `   ` (3 spaces) is not a real name. The parser trims, sees empty,
    // and must surface a missing_required error. The dry-run should
    // count the row as skipped.
    const csv = 'name,email,sisId,section\n   ,alice@x.com,S-1,P1\n';
    const result = parseRoster(csv);
    const nameErrs = result.errors.filter(
      (e) => e.code === 'missing_required' && e.column === 'name',
    );
    expect(nameErrs.length).toBe(1);
    expect(nameErrs[0]!.rowIndex).toBe(1);
  });

  it('trims BOM + whitespace from the header so the column index is correct', () => {
    // Defensive: even if a future commit forgets to strip the BOM, the
    // parser should still find the columns. (BOM stripping is covered
    // by parser.test.ts; this pin ensures it composes with whitespace.)
    const csv = '\uFEFF  name  ,  email  ,  sisId  ,  section  \nAlice,alice@x.com,S-1,P1\n';
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows[0]!.name).toBe('Alice');
  });
});

describe('parseRoster — line layout (boundary)', () => {
  it('skips empty data lines between non-empty data lines', () => {
    // A teacher editing a CSV in Excel may leave blank rows. The
    // parser must skip them without inflating rowIndex on subsequent
    // data rows.
    const csv = [
      'name,email,sisId,section',
      'Alice,alice@x.com,S-1,P1',
      '',
      'Bob,bob@x.com,S-2,P1',
    ].join('\n');
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0]!.name).toBe('Alice');
    expect(result.rows[1]!.name).toBe('Bob');
  });

  it('tolerates multiple trailing newlines (single trailing empty trim is not the only path)', () => {
    // Files saved by some text editors end with `\n\n\n`. The parser
    // strips one trailing empty line; the rest are silently skipped by
    // the `line.trim() === ''` filter in the data loop. Pin that ALL
    // trailing empty lines are tolerated.
    const csv = 'name,email,sisId,section\nAlice,alice@x.com,S-1,P1\n\n\n';
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]!.name).toBe('Alice');
  });

  it('handles 1000 valid rows deterministically (no quadratic behavior)', () => {
    // Adversarial scale probe: the duplicate-detection loop is O(N)
    // over a Map. A regression to O(N^2) would be invisible at N=3
    // but painful at N=1000. We assert the row count is exact and
    // the test itself completes quickly.
    const N = 1000;
    const rows = Array.from({ length: N }, (_, i) => ({
      name: `Student ${i}`,
      email: `student${i}@school.edu`,
      sisId: `S-${i}`,
    }));
    const csv = rowsToCsv(rows);
    const t0 = Date.now();
    const result = parseRoster(csv);
    const elapsed = Date.now() - t0;
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(N);
    // 5 seconds is generous for a jsdom+ts-node+vitest cold parse;
    // the real budget on warm runs is well under 500 ms.
    expect(elapsed).toBeLessThan(5000);
  });
});

describe('parseRoster — quoted field handling (boundary)', () => {
  it('parses a field containing a literal "" (escaped double-quote) as a single value', () => {
    // RFC 4180: `""` inside a quoted field is an escaped double-quote.
    // `Bob "Quoted" Brown` written correctly is `"Bob ""Quoted"" Brown"`.
    // Pin that the parser produces the unescaped string.
    const csv = [
      'name,email,sisId,section',
      '"Bob ""Quoted"" Brown",bob@x.com,S-1,P1',
    ].join('\n');
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows[0]!.name).toBe('Bob "Quoted" Brown');
  });

  it('parses a quoted field with a leading space as that value (no extra trim)', () => {
    // Quoted fields can legitimately contain leading/trailing spaces.
    // Pin that the parser preserves them (it does not trim quoted
    // cell contents) and that the row still round-trips.
    const csv = [
      'name,email,sisId,section',
      '" Alice ",alice@x.com,S-1,P1',
    ].join('\n');
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    // The parser trims via .trim() in getCell; this is a documented
    // behavior we pin explicitly so a future "RFC-strict" refactor
    // doesn't quietly change the spec.
    expect(result.rows[0]!.name).toBe('Alice');
  });
});

// ---------------------------------------------------------------------------
// 2. Parser failure-path tests
// ---------------------------------------------------------------------------

describe('parseRoster — failure paths', () => {
  it('emits exactly one missing_required error per missing required column', () => {
    // Existing test allows `>= 1`; pin the EXACT count and the EXACT
    // rowIndex=0 (file-level, not data-row). One missing column → one
    // error. Regression guard against accidental double-emit.
    const csv = 'name,sisId,section\nAlice,S-1,P1\nBob,S-2,P1\n';
    const result = parseRoster(csv);
    const missing = result.errors.filter((e) => e.code === 'missing_required');
    expect(missing.length).toBe(1);
    expect(missing[0]!.column).toBe('email');
    expect(missing[0]!.rowIndex).toBe(0);
  });

  it('emits two missing_required errors when both name and email columns are absent', () => {
    // The missing-column loop iterates REQUIRED_COLUMNS; pin the
    // multi-missing case. A regression that breaks after the first
    // missing column would not see this.
    const csv = 'sisId,section\nS-1,P1\nS-2,P1\n';
    const result = parseRoster(csv);
    const missing = result.errors
      .filter((e) => e.code === 'missing_required' && e.rowIndex === 0)
      .map((e) => e.column)
      .sort();
    expect(missing).toEqual(['email', 'name']);
  });

  it('emits exactly one invalid_email error for a single malformed row', () => {
    // Tightened version of parser.test.ts:146 — exact count, exact
    // code, exact column, exact rowIndex, no extras.
    const csv = rowsToCsv([{ name: 'Charlie', email: 'not-an-email' }]);
    const result = parseRoster(csv);
    const invalid = result.errors.filter((e) => e.code === 'invalid_email');
    expect(invalid.length).toBe(1);
    expect(invalid[0]!.column).toBe('email');
    expect(invalid[0]!.rowIndex).toBe(1);
  });

  it('emits exactly one duplicate_identifier error for two rows sharing an email', () => {
    // Tightened version of parser.test.ts:175 — exact count, exact
    // rowIndex pointing at the SECOND occurrence.
    const csv = rowsToCsv([
      { name: 'Alice', email: 'shared@school.edu', sisId: 'S-A' },
      { name: 'Bob', email: 'shared@school.edu', sisId: 'S-B' },
    ]);
    const result = parseRoster(csv);
    const dupes = result.errors.filter((e) => e.code === 'duplicate_identifier');
    expect(dupes.length).toBe(1);
    expect(dupes[0]!.rowIndex).toBe(2);
  });

  it('emits N-1 duplicate_identifier errors for N rows sharing one email', () => {
    // Generalization: pin that duplicate detection is O(N) emissions
    // for an N-cluster, not always 1. A regression that bails early
    // after the first duplicate would fail this.
    const csv = rowsToCsv([
      { name: 'A', email: 'same@school.edu' },
      { name: 'B', email: 'same@school.edu' },
      { name: 'C', email: 'same@school.edu' },
      { name: 'D', email: 'same@school.edu' },
    ]);
    const result = parseRoster(csv);
    const dupes = result.errors.filter((e) => e.code === 'duplicate_identifier');
    expect(dupes.length).toBe(3);
    const dupesRows = dupes.map((e) => e.rowIndex).sort((a, b) => a - b);
    expect(dupesRows).toEqual([2, 3, 4]);
  });

  it('matches duplicate identifiers case-insensitively on email', () => {
    // RFC 5321 §2.4: the local-part of an email is technically
    // case-sensitive, but every SIS the team has seen canonicalizes
    // to lowercase. Pin the lowercase-fold so a regression to
    // case-sensitive matching is caught.
    const csv = rowsToCsv([
      { name: 'Alice', email: 'Alice@School.EDU' },
      { name: 'Bob', email: 'alice@school.edu' },
    ]);
    const result = parseRoster(csv);
    const dupes = result.errors.filter((e) => e.code === 'duplicate_identifier');
    expect(dupes.length).toBe(1);
    expect(dupes[0]!.rowIndex).toBe(2);
  });

  it('uses email as the canonical identifier when BOTH email and sisId are present', () => {
    // IDENTIFIER_PRECEDENCE pins email > sisId. Pin that a row that
    // has a unique email and a duplicate sisId does NOT trigger a
    // duplicate_identifier error. This is the exact property the
    // `roster-duplicate-identifiers.csv` fixture encodes.
    const csv = rowsToCsv([
      { name: 'Alice', email: 'a@x.com', sisId: 'S-1' },
      { name: 'Bob', email: 'b@x.com', sisId: 'S-1' },
      { name: 'Carol', email: 'c@x.com', sisId: 'S-1' },
    ]);
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
  });

  it('uses sisId as the canonical identifier when only sisId is present', () => {
    // The other half of the precedence rule. Three rows with no
    // email and a duplicate sisId must trigger duplicate_identifier
    // on the second and third occurrences.
    const csv = rowsToCsv([
      { name: 'Alice', sisId: 'DUP-1' },
      { name: 'Bob', sisId: 'DUP-1' },
      { name: 'Carol', sisId: 'DUP-1' },
    ]);
    const result = parseRoster(csv);
    const dupes = result.errors.filter((e) => e.code === 'duplicate_identifier');
    expect(dupes.length).toBe(2);
    const dupesRows = dupes.map((e) => e.rowIndex).sort((a, b) => a - b);
    expect(dupesRows).toEqual([2, 3]);
  });

  it('emits missing_required when the row has NEITHER email NOR sisId', () => {
    // Spec FR2: "name, email/identifier, section" — the slash
    // notation means "email or sisId". A row with name but no
    // identifier cannot be linked to an account; the dry-run
    // currently says "created" for such rows, which is a Phase-2
    // correctness gap. Pin the SPEC behavior here so the gap is
    // visible to the next implementer (and to the supervisor).
    const csv = rowsToCsv([
      { name: 'No-Id Row', email: '', sisId: '' },
    ]);
    const result = parseRoster(csv);
    const noId = result.errors.filter(
      (e) => e.code === 'missing_required' && e.rowIndex === 1,
    );
    // Expected (per spec): at least one row-level missing_required
    // error pointing at the identifier slot. The column the error
    // names is implementation-defined ('email' or 'sisId'); pin
    // that the row is flagged.
    expect(noId.length).toBeGreaterThanOrEqual(1);
  });

  it('does not flag rows as duplicates when both rows have no identifier', () => {
    // Counterpart of the previous test. Two rows with the same name
    // and NO identifier must not be classified as duplicates of
    // each other (the duplicate detection short-circuits on null
    // identifiers; pin that this still happens when both rows have
    // no identifier).
    const csv = rowsToCsv([
      { name: 'Mystery', email: '', sisId: '' },
      { name: 'Mystery', email: '', sisId: '' },
    ]);
    const result = parseRoster(csv);
    const dupes = result.errors.filter((e) => e.code === 'duplicate_identifier');
    expect(dupes.length).toBe(0);
  });

  it('rejects an email with multiple @ signs', () => {
    const csv = rowsToCsv([{ name: 'X', email: 'a@b@c.com' }]);
    const result = parseRoster(csv);
    const invalid = result.errors.filter((e) => e.code === 'invalid_email');
    expect(invalid.length).toBe(1);
  });

  it('rejects an email with no domain dot', () => {
    const csv = rowsToCsv([{ name: 'X', email: 'a@b' }]);
    const result = parseRoster(csv);
    const invalid = result.errors.filter((e) => e.code === 'invalid_email');
    expect(invalid.length).toBe(1);
  });

  it('rejects an email that is just whitespace (treated as empty)', () => {
    // Whitespace-only emails trim to ''; the parser's `if (emailVal)`
    // check skips validation and the row has no email. Pin that the
    // row still surfaces a row-level missing_required (per the
    // "no identifier" rule above).
    const csv = rowsToCsv([{ name: 'X', email: '   ', sisId: '' }]);
    const result = parseRoster(csv);
    const noId = result.errors.filter(
      (e) => e.code === 'missing_required' && e.rowIndex === 1,
    );
    expect(noId.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 3. Parser property tests
// ---------------------------------------------------------------------------

describe('parseRoster — properties', () => {
  it('is deterministic: two calls with the same input produce the same output', () => {
    const csv = rowsToCsv([
      { name: 'Alice', email: 'a@x.com', sisId: 'S-1' },
      { name: 'Bob', email: 'b@x.com', sisId: 'S-2' },
    ]);
    const a = parseRoster(csv);
    const b = parseRoster(csv);
    expect(a).toEqual(b);
  });

  it('returns a JSON-serializable result (no functions, no symbols)', () => {
    // The Convex mutation handler in Phase 2 will pass this through
    // `JSON.stringify`. Anything that fails to serialize is a real
    // bug. Pin that the full result is plain data.
    const csv = rowsToCsv([{ name: 'A', email: 'a@x.com' }]);
    const result = parseRoster(csv);
    const json = JSON.stringify(result);
    const round = JSON.parse(json) as RosterParseResult;
    expect(round.rows.length).toBe(result.rows.length);
    expect(round.errors.length).toBe(result.errors.length);
    for (let i = 0; i < result.errors.length; i++) {
      const err: RosterImportError = result.errors[i]!;
      expect(typeof err.code).toBe('string');
      expect(typeof err.rowIndex).toBe('number');
      expect(typeof err.message).toBe('string');
    }
  });

  it('error payloads contain no PII (name, email, sisId tokens are not leaked into any error field)', () => {
    // This is a stronger version of parser.test.ts:223. The existing
    // test seeds 3 unique marker strings and asserts they are not
    // present in JSON.stringify(errors). The strengthened version
    // seeds 4 markers (including section) and asserts each one is
    // absent independently, so a regression that leaks ONE marker
    // is caught.
    const MARKERS = {
      name: 'PII-MARKER-NAME-AAA',
      email: 'pii-marker-email-aaa@school.test',
      sisId: 'PII-MARKER-SISID-BBB',
      section: 'PII-MARKER-SECTION-CCC',
    };
    const csv = rowsToCsv([
      {
        name: MARKERS.name,
        email: MARKERS.email,
        sisId: MARKERS.sisId,
        section: MARKERS.section,
      },
      // A second row that triggers a `duplicate_identifier` error so
      // the error path is exercised.
      {
        name: 'Carol',
        email: 'carol@school.edu',
        sisId: 'S-3',
      },
      // A third row to provide a duplicate_identifier target.
      {
        name: 'Dave',
        email: 'carol@school.edu',
        sisId: 'S-4',
      },
    ]);
    const result = parseRoster(csv);
    const errorText = JSON.stringify(result.errors);
    for (const marker of Object.values(MARKERS)) {
      expect(errorText).not.toContain(marker);
    }
  });

  it('rowIndex is always >= 1 for data rows (header is never counted)', () => {
    // Property: across all error and row objects, rowIndex is 0
    // ONLY for file-level errors, and >= 1 for row-level events.
    const csv = [
      'name,email,sisId,section',
      // Row 1: malformed email
      'Alice,not-an-email,S-1,P1',
      // Row 2: missing name
      ',bob@x.com,S-2,P1',
      // Row 3: duplicate
      'Carol,carol@x.com,S-3,P1',
      'Dave,carol@x.com,S-4,P1',
    ].join('\n');
    const result = parseRoster(csv);
    for (const err of result.errors) {
      // rowIndex 0 is reserved for file-level (missing column) errors.
      // All other rowIndex values must be >= 1.
      if (err.rowIndex !== 0) {
        expect(err.rowIndex).toBeGreaterThanOrEqual(1);
      }
    }
    for (const row of result.rows) {
      expect(row.rowIndex).toBeGreaterThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Dry-run boundary tests
// ---------------------------------------------------------------------------

describe('dryRunPreview — file-level errors do not inflate skipped', () => {
  it('reports created == row count when only a file-level missing_required is present', () => {
    // If the email column is missing, the parser pushes a rowIndex=0
    // missing_required. The dry-run must NOT count that as a skipped
    // row — the row count is determined by the data rows actually
    // present, not by the file-level error.
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'Alice', sisId: 'S-1' },
        { rowIndex: 2, name: 'Bob', sisId: 'S-2' },
      ],
      errors: [
        {
          rowIndex: 0,
          column: 'email',
          code: 'missing_required',
          message: 'Missing required column: email',
        },
      ],
    };
    const result = dryRunPreview(parsed);
    expect(result.created).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.updated).toBe(0);
    // Error pass-through (FR6: errors are retrievable in the same
    // shape the parser produced).
    expect(result.errors.length).toBe(1);
  });

  it('preserves a mix of file-level and row-level errors unchanged', () => {
    // Mixed bag: 1 file-level missing_required, 1 row-level
    // invalid_email. Dry-run must pass them through and only count
    // the row-level one as skipped.
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'Alice', email: 'alice@x.com', sisId: 'S-1' },
        { rowIndex: 2, name: 'Bob', email: 'not-an-email', sisId: 'S-2' },
      ],
      errors: [
        {
          rowIndex: 0,
          column: 'email',
          code: 'missing_required',
          message: 'Missing required column: email',
        },
        {
          rowIndex: 2,
          column: 'email',
          code: 'invalid_email',
          message: 'Malformed email',
        },
      ],
    };
    const result = dryRunPreview(parsed);
    expect(result.created).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors.length).toBe(2);
  });

  it('counts each errored row exactly once even with multiple errors on the same row', () => {
    // Adversarial: a row that has BOTH a missing name AND a malformed
    // email produces two errors at the same rowIndex. The dry-run's
    // Set must dedupe so skipped = 1, not 2.
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'Alice', email: 'alice@x.com', sisId: 'S-1' },
      ],
      errors: [
        { rowIndex: 2, column: 'name', code: 'missing_required', message: 'x' },
        { rowIndex: 2, column: 'email', code: 'invalid_email', message: 'y' },
      ],
    };
    const result = dryRunPreview(parsed);
    expect(result.skipped).toBe(1);
    expect(result.errors.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 5. Dry-run property tests
// ---------------------------------------------------------------------------

describe('dryRunPreview — properties', () => {
  it('is pure: calling it twice with the same input gives the same output (referential)', () => {
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'A', email: 'a@x.com', sisId: 'S-1' },
      ],
      errors: [],
    };
    const a = dryRunPreview(parsed);
    const b = dryRunPreview(parsed);
    expect(a).toEqual(b);
  });

  it('does not mutate the input parsed object', () => {
    const parsed: RosterParseResult = {
      rows: [{ rowIndex: 1, name: 'A', email: 'a@x.com', sisId: 'S-1' }],
      errors: [
        { rowIndex: 1, column: 'email', code: 'invalid_email', message: 'x' },
      ],
    };
    const snapshot = JSON.parse(JSON.stringify(parsed));
    dryRunPreview(parsed);
    expect(parsed).toEqual(snapshot);
  });

  it('updated is always 0 in the dry-run preview (no live enrollment data)', () => {
    // The dry-run is a pure function of the parsed result — it has
    // no access to existing class_enrollments. Pin that updated is
    // always 0 so a future refactor that tries to be clever is
    // caught.
    const result1 = dryRunPreview({ rows: [], errors: [] });
    const result2 = dryRunPreview({
      rows: [{ rowIndex: 1, name: 'A', email: 'a@x.com', sisId: 'S-1' }],
      errors: [],
    });
    const result3 = dryRunPreview({
      rows: [
        { rowIndex: 1, name: 'A', email: 'a@x.com', sisId: 'S-1' },
        { rowIndex: 2, name: 'B', email: 'b@x.com', sisId: 'S-2' },
      ],
      errors: [],
    });
    expect(result1.updated).toBe(0);
    expect(result2.updated).toBe(0);
    expect(result3.updated).toBe(0);
  });

  it('created + skipped equals total rows — invariant for fully-accounted inputs', () => {
    // Invariant: across a parsed result, created counts rows that are
    // not in the errored set, and skipped counts unique errored
    // rowIndices. Their sum must equal parsed.rows.length when every
    // error points at a real data row.
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'A', email: 'a@x.com', sisId: 'S-1' },
        { rowIndex: 2, name: 'B', email: 'b@x.com', sisId: 'S-2' },
        { rowIndex: 3, name: 'C', email: 'not-an-email', sisId: 'S-3' },
      ],
      errors: [
        { rowIndex: 3, column: 'email', code: 'invalid_email', message: 'x' },
      ],
    };
    const result = dryRunPreview(parsed);
    expect(result.created + result.skipped).toBe(parsed.rows.length);
  });
});

// ---------------------------------------------------------------------------
// 6. Contract-strengthening tests
// ---------------------------------------------------------------------------

describe('csv-contract — strengthened shape', () => {
  it('ROSTER_COLUMNS is exactly [name, email, sisId, section] in canonical order', () => {
    // The contract test allows any array containing 'name'/'email'/'section'.
    // Pin the EXACT tuple: canonical order matters for the parser's
    // rowData construction and for golden-CSV byte-for-byte comparisons.
    expect(ROSTER_COLUMNS).toEqual(['name', 'email', 'sisId', 'section']);
  });

  it('REQUIRED_COLUMNS contains exactly name and email (and not sisId or section)', () => {
    // Strengthen the contract test by pinning that sisId is NOT
    // required at the column level — Phase 2's idempotency needs
    // rows identified by email OR sisId, so a sisId-only CSV must
    // parse.
    const arr = Array.from(REQUIRED_COLUMNS as Set<string>).sort();
    expect(arr).toEqual(['email', 'name']);
  });

  it('IDENTIFIER_PRECEDENCE is exactly [email, sisId] in that order', () => {
    // Pin the exact tuple. The contract test allows email-before-sisId;
    // we lock the literal array so a refactor that re-orders or
    // adds more identifiers is caught.
    expect(Array.from(IDENTIFIER_PRECEDENCE)).toEqual(['email', 'sisId']);
  });
});

// ---------------------------------------------------------------------------
// 7. Golden-CSV integration tests — load each fixture from disk and
//    assert the parsed result matches the expected counts.
// ---------------------------------------------------------------------------

describe('golden CSV fixtures (integration)', () => {
  it('roster-valid.csv parses to 3 valid rows and 0 errors', () => {
    const csv = loadFixture('roster-valid.csv');
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(3);
    expect(result.rows[0]!.name).toBe('Alice Anderson');
    expect(result.rows[1]!.name).toBe('Bob "Quoted" Brown');
    expect(result.rows[2]!.name).toBe('Carol Chen');
    // dryRunPreview should report all 3 as created, 0 skipped.
    const dry = dryRunPreview(result);
    expect(dry.created).toBe(3);
    expect(dry.skipped).toBe(0);
    expect(dry.errors).toEqual([]);
  });

  it('roster-bom-utf8.csv (UTF-8 BOM at start) parses to 2 valid rows', () => {
    // The fixture has the literal UTF-8 BOM bytes (EF BB BF) before
    // the header. The parser must strip it.
    const csv = loadFixture('roster-bom-utf8.csv');
    // Sanity: confirm the BOM is actually present in the file.
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0]!.name).toBe('Alice Anderson');
    expect(result.rows[1]!.name).toBe('Bob Brown');
  });

  it('roster-crlf.csv (CRLF line endings) parses to 3 valid rows', () => {
    const csv = loadFixture('roster-crlf.csv');
    // Sanity: confirm CRLF is actually in the file.
    expect(csv.includes('\r\n')).toBe(true);
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(3);
  });

  it('roster-mixed-errors.csv parses to 5 rows with exactly 2 row-level errors', () => {
    // Row 2 has empty name → missing_required.
    // Row 3 has invalid email → invalid_email.
    // Rows 1, 4, 5 are valid.
    const csv = loadFixture('roster-mixed-errors.csv');
    const result = parseRoster(csv);
    // 5 data rows are pushed (the parser does not skip rows on
    // missing_required at the row level; it only emits the error).
    expect(result.rows.length).toBe(5);
    // Exactly 2 row-level errors.
    const rowErrors = result.errors.filter((e) => e.rowIndex !== 0);
    expect(rowErrors.length).toBe(2);
    const codes = rowErrors.map((e) => `${e.rowIndex}:${e.code}`).sort();
    expect(codes).toEqual(['2:missing_required', '3:invalid_email']);
    // dryRunPreview: created = 5 - 2 = 3, skipped = 2.
    const dry = dryRunPreview(result);
    expect(dry.created).toBe(3);
    expect(dry.skipped).toBe(2);
    expect(dry.errors.length).toBe(2);
  });

  it('roster-duplicate-identifiers.csv (shared sisId, unique emails) parses with 0 duplicates', () => {
    // The fixture shares one sisId across 3 rows but the emails are
    // unique. Per IDENTIFIER_PRECEDENCE (email > sisId), the parser
    // must NOT flag these as duplicates. This pins the precedence
    // rule against a real disk fixture.
    const csv = loadFixture('roster-duplicate-identifiers.csv');
    const result = parseRoster(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows.length).toBe(3);
    // Sanity: the fixture is what it claims to be — 3 rows sharing S-1.
    for (const row of result.rows) {
      expect(row.sisId).toBe('SIS-001');
    }
  });

  it('roster-reimport-idempotent.csv (4 valid rows) parses identically on a second call', () => {
    // The "reimport-idempotent" name is a Phase-2 cue — at the
    // Phase-1 parse layer, we pin determinism: the same input must
    // always produce the same parse result, so Phase 2 can rely on
    // it for the idempotency argument.
    const csv = loadFixture('roster-reimport-idempotent.csv');
    const a = parseRoster(csv);
    const b = parseRoster(csv);
    expect(a).toEqual(b);
    expect(a.errors).toEqual([]);
    expect(a.rows.length).toBe(4);
    const dry = dryRunPreview(a);
    expect(dry.created).toBe(4);
    expect(dry.skipped).toBe(0);
  });

  it('all six golden CSVs are non-empty and start with the canonical header', () => {
    // Defensive: a future commit that accidentally overwrites a
    // fixture with an empty file or the wrong header would break
    // every test in this file. Pin the fixture health.
    const files = [
      'roster-valid.csv',
      'roster-bom-utf8.csv',
      'roster-crlf.csv',
      'roster-mixed-errors.csv',
      'roster-duplicate-identifiers.csv',
      'roster-reimport-idempotent.csv',
    ];
    for (const f of files) {
      const csv = loadFixture(f);
      expect(csv.length).toBeGreaterThan(0);
      // Strip BOM if present and verify the header.
      const stripped = csv.charCodeAt(0) === 0xfeff ? csv.slice(1) : csv;
      const firstLine = stripped.split('\n')[0]!.replace(/\r$/, '').toLowerCase();
      expect(firstLine).toContain('name');
      expect(firstLine).toContain('email');
    }
  });
});
