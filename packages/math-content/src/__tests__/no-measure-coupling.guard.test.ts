import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// FR-4 guard (track: math-content-test-suite-repair_20260626)
//
// A `packages/` test must never depend on a `measure/` track artifact. Reading
// `measure/tracks/…` or `measure/archive/…` from a test couples the package
// suite to volatile planning state and breaks it whenever a track is archived
// (the exact failure this track repaired: 16 ENOENT failures after
// `im1-practice-readiness_20260609` was archived).
//
// This guard scans every test file under `packages/**/__tests__/` and fails if
// any contains a STRING LITERAL referencing a `measure/tracks/` or
// `measure/archive/` path (i.e. a real fs read / resolve target). Provenance
// mentions in line comments (`// per measure/tracks/…`) are intentionally NOT
// flagged — they document origin without coupling behavior.
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(HERE, '../../../../..'); // repo root
const PACKAGES_DIR = resolve(PKG_ROOT, 'packages');

// A measure path embedded inside a quoted string literal: '…measure/tracks/…'
// or "…measure/archive/…". Comments (`// measure/tracks/…`) have no opening
// quote before the path, so they are not matched.
const COUPLING_PATTERN = /['"`][^'"`]*measure\/(tracks|archive)\//;

/**
 * Detect a `measure/tracks|archive` path used inside a string literal.
 * @param {string} content - File text to scan.
 * @returns {string[]} - Offending lines (empty if clean).
 */
export function findMeasureCoupling(content: string): string[] {
  return content
    .split('\n')
    .filter((line) => COUPLING_PATTERN.test(line));
}

/**
 * Recursively collect `*.ts`/`*.tsx` files under any `__tests__` directory.
 * @param {string} dir - Directory to walk.
 * @returns {string[]} - Absolute test file paths.
 */
function collectTestFiles(dir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true, recursive: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const parent = (entry as unknown as { parentPath?: string; path?: string })
      .parentPath ?? (entry as unknown as { path: string }).path;
    const full = resolve(parent, entry.name);
    if (!/[\\/]__tests__[\\/]/.test(full)) continue;
    if (full.includes('node_modules')) continue;
    if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('FR-4 — packages tests must not couple to measure/ artifacts', () => {
  it('flags a deliberately-coupled sample (detector works)', () => {
    const badRead = `const p = resolve(ROOT, 'measure/tracks/some-track_2026/metadata.json');`;
    const badArchive = `readFileSync("measure/archive/old-track/spec.md");`;
    const provenanceComment = `// Contract under test (per measure/tracks/some-track_2026/plan.md)`;

    expect(findMeasureCoupling(badRead)).toHaveLength(1);
    expect(findMeasureCoupling(badArchive)).toHaveLength(1);
    // Provenance comments are allowed (documentation, not coupling).
    expect(findMeasureCoupling(provenanceComment)).toHaveLength(0);
  });

  it('no test under packages/**/__tests__/ reads a measure/ path', () => {
    const files = collectTestFiles(PACKAGES_DIR);
    // Sanity: the walk actually found this very guard file.
    expect(files.length).toBeGreaterThan(0);

    const offenders: Array<{ file: string; lines: string[] }> = [];
    for (const file of files) {
      if (file === HERE) continue; // this guard names the pattern in prose/regex
      const hits = findMeasureCoupling(readFileSync(file, 'utf-8'));
      if (hits.length > 0) {
        offenders.push({ file: file.replace(PKG_ROOT + '/', ''), lines: hits });
      }
    }
    expect(offenders).toEqual([]);
  });
});
