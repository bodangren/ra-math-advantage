// Phase 1 (Track onboarding-roster-import_20260605) — Dry-run preview
// computation Red tests.
//
// Per `measure/tracks/onboarding-roster-import_20260605/test-strategy.md` §6
// (Phase 1 "dryRunPreview() test that returns counts
// {created/updated/skipped/errors} from a parsed file alone (no
// Convex)") and §7 (Phase 1 Green/closeout gate: bounded
// `__tests__/lib/roster/` directory), this file pins the live
// behavior of
//   apps/integrated-math-3/lib/roster/dry-run.ts
// exporting
//   dryRunPreview(parsed: RosterParseResult): RosterImportResult
//
// Behavior pinned:
//   - All-valid roster → created = parsed.rows.length, updated = 0,
//     skipped = 0, errors = []
//   - Roster with per-row errors → errors pass through; failed rows
//     count as skipped (per FR2 / FR6 — a row that fails validation
//     cannot be created OR updated; the teacher must fix and
//     re-import)
//   - Roster with duplicate identifiers → duplicates counted as
//     skipped; first occurrence counted as created
//   - Pure function: no Convex / React / network imports (covered
//     structurally by the Green phase; this test pins output shape)
//
// At HEAD, the module does not exist yet, so the import fails —
// the Red signal.
//
// Test count: 4 tests. Targeted Red command (Phase 1 §7):
//   npx vitest run apps/integrated-math-3/__tests__/lib/roster/dry-run-preview.test.ts \
//     --root apps/integrated-math-3

import { describe, it, expect } from 'vitest';
import { dryRunPreview } from '@/lib/roster/dry-run';
import type {
  RosterRow,
  RosterImportError,
  RosterParseResult,
  RosterImportResult,
} from '@/lib/roster/csv-contract';
import { makeImportError } from '../../fixtures/roster/builders';

// ---------------------------------------------------------------------------
// 1. All-valid roster
// ---------------------------------------------------------------------------

describe('dryRunPreview — all-valid roster (FR2 / FR6)', () => {
  it('returns created == row count, updated == 0, skipped == 0, errors == []', () => {
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'Alice', email: 'alice@school.edu', sisId: 'S-1' },
        { rowIndex: 2, name: 'Bob', email: 'bob@school.edu', sisId: 'S-2' },
        { rowIndex: 3, name: 'Carol', email: 'carol@school.edu', sisId: 'S-3' },
      ],
      errors: [],
    };
    const result: RosterImportResult = dryRunPreview(parsed);
    expect(result.created).toBe(3);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Mixed errors
// ---------------------------------------------------------------------------

describe('dryRunPreview — mixed-errors roster (FR6)', () => {
  it('passes errors through unchanged and counts errored rows as skipped', () => {
    // parsed.rows contains 2 valid + 1 invalid row. The invalid row
    // is represented by the parser as EITHER (a) absent from rows
    // with an entry in errors, OR (b) present in rows with a
    // companion error. Either way, dryRunPreview must classify it
    // as skipped (not created, not updated) so the FR6 summary is
    // consistent.
    const error: RosterImportError = makeImportError({
      rowIndex: 2,
      column: 'email',
      code: 'invalid_email',
    });
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'Alice', email: 'alice@school.edu', sisId: 'S-1' },
      ],
      errors: [error],
    };
    const result = dryRunPreview(parsed);
    // Error pass-through (FR6: import result is auditable, errors are
    // retrievable in the same shape the parser produced).
    expect(result.errors).toEqual([error]);
    // The 1 errored row counts as skipped. The 1 valid row counts as
    // created. updated remains 0.
    expect(result.skipped).toBeGreaterThanOrEqual(1);
    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Duplicate identifiers
// ---------------------------------------------------------------------------

describe('dryRunPreview — duplicate identifiers within file (test-strategy §4)', () => {
  it('counts the first occurrence as created and subsequent duplicates as skipped', () => {
    // 3 rows share the same email. The dry-run must count row 1 as
    // created and rows 2–3 as skipped (per FR6 — duplicates are
    // reported as errors AND excluded from created).
    const parsed: RosterParseResult = {
      rows: [
        { rowIndex: 1, name: 'Alice', email: 'shared@school.edu', sisId: 'S-1' },
        { rowIndex: 2, name: 'Bob', email: 'shared@school.edu', sisId: 'S-2' },
        { rowIndex: 3, name: 'Carol', email: 'shared@school.edu', sisId: 'S-3' },
      ],
      errors: [
        makeImportError({ rowIndex: 2, code: 'duplicate_identifier' }),
        makeImportError({ rowIndex: 3, code: 'duplicate_identifier' }),
      ],
    };
    const result = dryRunPreview(parsed);
    expect(result.created).toBe(1);
    expect(result.skipped).toBe(2);
    expect(result.updated).toBe(0);
    expect(result.errors.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 4. Empty parsed input
// ---------------------------------------------------------------------------

describe('dryRunPreview — empty input', () => {
  it('returns zeros and an empty errors array for an empty parse result', () => {
    const parsed: RosterParseResult = { rows: [], errors: [] };
    const result: RosterImportResult = dryRunPreview(parsed);
    expect(result).toEqual({ created: 0, updated: 0, skipped: 0, errors: [] });
  });
});
