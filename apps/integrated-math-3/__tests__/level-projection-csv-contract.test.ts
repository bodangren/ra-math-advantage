// Phase 2 (Track 8 kst-lesser-holes_20260521) — IM3 Level Projection CSV artifact contract.
//
// kst-srs.v2 §11.2 (Level Projection):
//   "Domain-supplied monotonic function from knowledge state → display level.
//   Presentation-only; never feeds KST/SRS computation."
//
// Track 8 spec FR2 (AC2):
//   "Level Projection implemented as a presentation-only projection; an IM3
//   instance derives display levels from the existing CSV mapping."
//
// Test-strategy §2 (fixtures) + §5 (P2 IM3 approach):
//   "IM3 CSV-derived instance lives in `apps/integrated-math-3/lib/.../level-projection.ts`
//    with its own dedicated unit test reading the CSV table-driven (do not mock
//    filesystem — read the actual checked-in mapping)."
//
// This is an artifact contract test: it asserts the checked-in CSV file exists
// at the expected path and has a minimum well-formed structure. The IM3 instance
// module (`@/lib/level-projection/im3-level-projection`) is NOT imported — the
// file-only contract is verified in isolation so the Red signal is unambiguous
// even when the instance module is also missing (file-load failure would
// otherwise mask the CSV signal).
//
// At HEAD, the CSV file does not exist, so this test fails with a clear
// contract-gap signal (file-not-found).
//
// Test count: 2 tests. Targeted Red command:
//   npx vitest run -t "IM3 level projection CSV" --root apps/integrated-math-3
//   (or, equivalently, run the file directly).

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Resolved relative to the test file's location, not cwd, so the path is
// stable regardless of the vitest root configuration. The Green phase must
// create this CSV file with a header row + at least 3 level rows.
const CSV_PATH = path.resolve(
  __dirname,
  '..',
  'lib',
  'level-projection',
  'gse-to-im3-advantage.csv',
);

describe('IM3 level projection — CSV artifact contract (kst-srs.v2 §11.2, FR2 AC2)', () => {
  it('CSV mapping file exists at apps/integrated-math-3/lib/level-projection/gse-to-im3-advantage.csv', () => {
    // The Green phase must add the CSV at this exact path (matches
    // test-strategy §2 + the import resolution path used by
    // `apps/integrated-math-3/__tests__/level-projection.test.ts`).
    expect(fs.existsSync(CSV_PATH)).toBe(true);
  });

  it('CSV has a header row and at least 3 level rows (well-formed anchor table)', () => {
    // Guard against an empty placeholder CSV. The IM3 projection needs at
    // least 3 levels (e.g., "below grade", "at grade", "above grade") to
    // exercise boundary behavior, plus a header row. The Green phase must
    // produce a CSV with at least 4 non-empty lines.
    expect(fs.existsSync(CSV_PATH)).toBe(true);
    const raw = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });
});
