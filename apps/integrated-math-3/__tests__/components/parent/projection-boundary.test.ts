// Phase 2.4 — Projection boundary lint (per test-strategy.md §4).
//
// Architectural rule (per parent-portal test-strategy.md §4 "Architecture
// Guardrails" and §5 "Phase 2.1"):
//
//   The parent UI MUST consume the parent projection payload from
//   `@math-platform/knowledge-space-practice` only. It must NEVER reach
//   into raw graph modules in `@math-platform/knowledge-space-core` — those
//   leak the canonical graph and bypass the projection boundary that
//   strips teacher-only fields.
//
// This test scans `apps/integrated-math-3/components/parent/**` and
// `apps/integrated-math-3/app/parent/**` and asserts:
//
//   1. Both directories exist by Phase 2 Green (Red signal at HEAD).
//   2. No file in those directories imports from
//      `@math-platform/knowledge-space-core` (raw graph package).
//   3. At least one file imports from
//      `@math-platform/knowledge-space-practice` (projection package).
//
// Red signal (per test-strategy.md §7):
//   `npm run ws:im3:test -- __tests__/components/parent/projection-boundary.test.ts`
// At HEAD, neither directory exists (Phase 2 Green has not landed), so the
// "directories exist" assertion fails with a clear error message. This
// prevents a regression where the Green-phase implementation imports
// directly from the raw graph package and bypasses the projection layer.
//
// Pattern reference: `__tests__/lib/placement/phase5-docs-and-doctor.test.ts`
// (Adaptive Placement Phase 5 boundary lint, same shape).

import { describe, it, expect, beforeAll } from 'vitest';
import {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------
//
// Test file lives at
//   apps/integrated-math-3/__tests__/components/parent/projection-boundary.test.ts
// which is 4 levels below the monorepo root. Going up 4 `..`s lands on
// the repo root.

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const REPO_ROOT = resolve(__dirname, '../../../../');
const PARENT_COMPONENTS_DIR = join(
  REPO_ROOT,
  'apps',
  'integrated-math-3',
  'components',
  'parent',
);
const PARENT_APP_DIR = join(
  REPO_ROOT,
  'apps',
  'integrated-math-3',
  'app',
  'parent',
);

// ---------------------------------------------------------------------------
// Forbidden / required import patterns
// ---------------------------------------------------------------------------
//
// FORBIDDEN: any import from the raw-graph package. The parent UI must
// not see KnowledgeSpaceNode / KnowledgeSpaceEdge / projection-internal
// types — only the parent projection payload surface from
// knowledge-space-practice. We match both the bare package and any
// `/src/` subpath import.
const FORBIDDEN_RAW_GRAPH_IMPORTS = [
  /from\s+['"]@math-platform\/knowledge-space-core['"]/,
  /from\s+['"]@math-platform\/knowledge-space-core\/[^'"]+['"]/,
  /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/packages\/knowledge-space-core/,
];

// REQUIRED: at least one parent UI file must import the projection
// package. This catches the regression where a Green-phase author
// re-implements the projection locally instead of consuming it.
const REQUIRED_PROJECTION_IMPORTS = [
  /from\s+['"]@math-platform\/knowledge-space-practice['"]/,
  /from\s+['"]@math-platform\/knowledge-space-practice\/[^'"]+['"]/,
];

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules' || entry === 'dist') continue;
      out.push(...collectTsFiles(full));
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pre-compute the file list once per test run (the directories do not change
// mid-suite). This makes the per-test asserts fast.
// ---------------------------------------------------------------------------

let allFiles: string[] = [];

beforeAll(() => {
  allFiles = [
    ...collectTsFiles(PARENT_COMPONENTS_DIR),
    ...collectTsFiles(PARENT_APP_DIR),
  ];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parent UI — projection boundary (Phase 2.4)', () => {
  it('parent UI directories exist by Phase 2 Green (Red signal at HEAD)', () => {
    const missing: string[] = [];
    if (!existsSync(PARENT_COMPONENTS_DIR)) missing.push(PARENT_COMPONENTS_DIR);
    if (!existsSync(PARENT_APP_DIR)) missing.push(PARENT_APP_DIR);
    expect(
      missing,
      `parent UI directories missing (Phase 2 Green has not landed):\n${missing.join('\n')}`,
    ).toEqual([]);
  });

  it('no parent UI file imports the raw graph package @math-platform/knowledge-space-core', () => {
    expect(
      allFiles.length,
      'parent UI directories must contain at least one .ts/.tsx file by Phase 2 Green',
    ).toBeGreaterThan(0);

    const violations: Array<{ file: string; line: number; match: string; pattern: string }> = [];

    for (const file of allFiles) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        for (const pattern of FORBIDDEN_RAW_GRAPH_IMPORTS) {
          if (pattern.test(line)) {
            violations.push({
              file: file.replace(REPO_ROOT + '/', ''),
              line: i + 1,
              match: line.trim(),
              pattern: pattern.source,
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      expect.fail(
        `Parent UI boundary violations — files must not import raw graph:\n${violations
          .map((v) => `  ${v.file}:${v.line} (pattern ${v.pattern})\n    ${v.match}`)
          .join('\n\n')}`,
      );
    }

    expect(violations).toHaveLength(0);
  });

  it('at least one parent UI file imports the projection package @math-platform/knowledge-space-practice', () => {
    expect(
      allFiles.length,
      'parent UI directories must contain at least one .ts/.tsx file by Phase 2 Green',
    ).toBeGreaterThan(0);

    let foundProjectionImport = false;
    const sampleFiles: string[] = [];

    for (const file of allFiles) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        for (const pattern of REQUIRED_PROJECTION_IMPORTS) {
          if (pattern.test(line)) {
            foundProjectionImport = true;
            sampleFiles.push(`${file.replace(REPO_ROOT + '/', '')}:${i + 1}`);
          }
        }
      }
    }

    expect(
      foundProjectionImport,
      `At least one parent UI file must import @math-platform/knowledge-space-practice. ` +
        `Files scanned: ${allFiles.length}. ` +
        `If the Green implementation uses the projection locally instead, ` +
        `it bypasses the projection boundary and may leak teacher-only data.`,
    ).toBe(true);
  });
});