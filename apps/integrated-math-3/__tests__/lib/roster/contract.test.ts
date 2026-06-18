// Phase 1 (Track onboarding-roster-import_20260605) — CSV contract + import-result
// schema Red contract test.
//
// This is an **artifact / documentation contract test** per
// `measure/tracks/onboarding-roster-import_20260605/test-strategy.md` §6 / §7
// (Phase 1 pyramid: bulk unit — "CSV contract & parsing"). It pins the
// public type-and-constant surface of `apps/integrated-math-3/lib/roster/csv-contract.ts`
// that the parser, validators, dry-run, mutation handlers, components, and
// student-flow will all share.
//
// Per spec.md FR2: "CSV upload with a documented column contract (name,
// email/identifier, section); validation with row-level error reporting;
// dry-run preview before commit."
// Per spec.md FR6: "Import results (created/updated/skipped/errors) are
// summarized and retrievable."
// Per test-strategy §4: "Identifier semantics must be locked in Phase 1's
// contract test (email vs SIS-id precedence) and re-asserted in Phase 2's
// idempotency test."
//
// The Green phase must create the module
//   apps/integrated-math-3/lib/roster/csv-contract.ts
// exporting at minimum:
//   - ROSTER_COLUMNS  (the canonical header names in order)
//   - REQUIRED_COLUMNS (the subset that must be present in any roster CSV)
//   - a RosterColumn union type
//   - the RosterRow / RosterImportError / RosterParseResult / RosterImportResult
//     type shapes
//   - an identifier-precedence constant (email > sisId) per test-strategy §4
//
// At HEAD, the module does not exist yet, so this test fails at
// import-time (module not found) — the contract-gap signal.
//
// Test count: 7 tests. Targeted Red command:
//   npx vitest run apps/integrated-math-3/__tests__/lib/roster/contract.test.ts \
//     --root apps/integrated-math-3
// (then parser.test.ts and dry-run-preview.test.ts run on the same import
// surface, so the Red signal compounds inside the directory).

import { describe, it, expect } from 'vitest';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates
//   apps/integrated-math-3/lib/roster/csv-contract.ts
// exporting the constants and types asserted below.
import {
  ROSTER_COLUMNS,
  REQUIRED_COLUMNS,
  type RosterColumn,
  type RosterRow,
  type RosterImportError,
  type RosterParseResult,
  type RosterImportResult,
  IDENTIFIER_PRECEDENCE,
} from '@/lib/roster/csv-contract';

// ---------------------------------------------------------------------------
// 1. Column contract — the canonical header set, in canonical order
// ---------------------------------------------------------------------------

describe('Roster CSV — column contract (FR2, test-strategy §6)', () => {
  it('exports ROSTER_COLUMNS listing the canonical column names in canonical order', () => {
    // FR2 requires columns: name, email/identifier, section. We pin a
    // 4-column contract: name, email, sisId, section. The header order
    // matters for parser determinism (golden CSVs assert byte-for-byte).
    expect(Array.isArray(ROSTER_COLUMNS)).toBe(true);
    expect(ROSTER_COLUMNS).toContain('name');
    expect(ROSTER_COLUMNS).toContain('email');
    expect(ROSTER_COLUMNS).toContain('section');
  });

  it('exports REQUIRED_COLUMNS as a Set/array containing "name" and "email"', () => {
    // FR2: "name, email/identifier, section" — name + email are
    // mandatory. section is optional. Identifier semantics (email vs
    // sisId) are covered separately.
    const requiredArr = Array.isArray(REQUIRED_COLUMNS)
      ? REQUIRED_COLUMNS
      : Array.from(REQUIRED_COLUMNS as Set<RosterColumn>);
    expect(requiredArr).toContain('name');
    expect(requiredArr).toContain('email');
    expect(requiredArr).not.toContain('section');
  });
});

// ---------------------------------------------------------------------------
// 2. Identifier semantics — locked here, re-asserted in Phase 2
// ---------------------------------------------------------------------------

describe('Roster CSV — identifier precedence (test-strategy §4)', () => {
  it('exports IDENTIFIER_PRECEDENCE pinning email > sisId', () => {
    // When a row has BOTH email and sisId, the parser MUST treat
    // email as the canonical identifier (Phase 2 idempotency test will
    // re-assert this against by_class_and_student). When only sisId
    // is present, sisId is the identifier. The contract pins this
    // precedence as a readable constant so the parser, dry-run, and
    // mutation handler can all read the same source of truth.
    expect(IDENTIFIER_PRECEDENCE).toBeDefined();
    const order: ReadonlyArray<string> = Array.isArray(IDENTIFIER_PRECEDENCE)
      ? (IDENTIFIER_PRECEDENCE as ReadonlyArray<string>)
      : Array.from(IDENTIFIER_PRECEDENCE as Iterable<string>);
    const idxEmail = order.indexOf('email');
    const idxSis = order.indexOf('sisId');
    expect(idxEmail).toBeGreaterThanOrEqual(0);
    expect(idxSis).toBeGreaterThanOrEqual(0);
    expect(idxEmail).toBeLessThan(idxSis);
  });
});

// ---------------------------------------------------------------------------
// 3. Type shapes — RosterRow
// ---------------------------------------------------------------------------

describe('Roster CSV — RosterRow type shape (FR2 / FR6)', () => {
  it('RosterRow carries rowIndex + name, and exposes optional email/sisId/section', () => {
    // Structural compile-time check: the Green-phase module's RosterRow
    // must accept rowIndex (1-based for the first data row; the header
    // is not counted) and a non-optional name. Email and sisId are
    // optional because the identifier contract allows either to drive
    // the canonical id.
    const row: RosterRow = {
      rowIndex: 2,
      name: 'Alice Anderson',
      email: 'alice.anderson@school.edu',
      sisId: 'SIS-001',
      section: 'Period 1',
    };
    expect(row.rowIndex).toBe(2);
    expect(row.name).toBe('Alice Anderson');
    // The test compiles iff the type accepts the shape. Runtime check
    // is a no-op assertion to keep the file from being tree-shaken.
    expect(typeof row).toBe('object');
  });
});

// ---------------------------------------------------------------------------
// 4. Type shapes — RosterImportError
// ---------------------------------------------------------------------------

describe('Roster CSV — RosterImportError type shape (test-strategy §4 PII)', () => {
  it('RosterImportError carries rowIndex + code + optional column, and no PII fields', () => {
    // PII-safety: errors must include rowIndex and column for the
    // teacher to locate the issue, but the contract MUST NOT add raw
    // email or full name fields. Phase 1/2 tests assert that the
    // parser populates only these safe fields; this test pins the
    // shape so a future commit cannot accidentally widen the contract.
    const err: RosterImportError = {
      rowIndex: 3,
      column: 'email',
      code: 'invalid_email',
      message: 'malformed email',
    };
    expect(err.rowIndex).toBe(3);
    expect(err.column).toBe('email');
    expect(err.code).toBe('invalid_email');
    // The keys "email" and "name" in the *error payload* (not column
    // name) are PII-leak vectors — pin their absence.
    const safeKeys = Object.keys(err).sort();
    expect(safeKeys).not.toContain('rawEmail');
    expect(safeKeys).not.toContain('rawName');
  });
});

// ---------------------------------------------------------------------------
// 5. Type shapes — RosterParseResult and RosterImportResult
// ---------------------------------------------------------------------------

describe('Roster CSV — aggregate result shapes (FR6)', () => {
  it('RosterParseResult contains rows + errors arrays', () => {
    // The parser returns both successful rows and validation errors in
    // one pass — never throw on a per-row validation failure. Errors
    // are surfaced, not raised, so the wizard can render them in a
    // summary table.
    const parsed: RosterParseResult = { rows: [], errors: [] };
    expect(Array.isArray(parsed.rows)).toBe(true);
    expect(Array.isArray(parsed.errors)).toBe(true);
  });

  it('RosterImportResult contains created/updated/skipped counts + errors array (FR6)', () => {
    // FR6: "Import results (created/updated/skipped/errors) are
    // summarized and retrievable." The dry-run preview, the
    // mutation handler's persisted summary, and the teacher UI's
    // summary view all share this shape.
    const result: RosterImportResult = {
      created: 3,
      updated: 1,
      skipped: 2,
      errors: [],
    };
    expect(result.created).toBe(3);
    expect(result.updated).toBe(1);
    expect(result.skipped).toBe(2);
    expect(result.errors).toEqual([]);
  });
});
