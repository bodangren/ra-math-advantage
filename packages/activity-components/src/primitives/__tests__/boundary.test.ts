// packages/activity-components/src/primitives/__tests__/boundary.test.ts
// Phase 2 Red boundary test for primitive-layer-contract_20260615 (T0) — FR-7.
//
// Per spec FR-7 and test-strategy.md §2, `primitives/` is a leaf: it must not import
// from apps, Convex generated modules, the practice-submission lib, or the
// practice.v1 envelope (`@math-platform/practice-core/contract`).
//
// Modeled on the precedent at
// `packages/knowledge-space-core/src/__tests__/boundary.test.ts` (130 lines) —
// `collectTsFiles` / `checkImports` helpers copied verbatim with the forbidden
// pattern list swapped for the primitive-layer rules. The "planted bad import"
// sub-case uses INLINE STRING FIXTURES ONLY (per test-strategy.md §2) — no real
// file is ever written to disk, so the fixture cannot leak into other suites.
//
// At HEAD this test passes vacuously: `primitives/` contains only `types.ts` and
// `index.ts`, neither of which has any imports. Phase 3 (Green) will add
// `CoordinatePlane.tsx` and a primitive subdir barrel — both must also pass.

import { describe, it, expect } from 'vitest';
// @ts-ignore — @types/node is not in this package's tsconfig; node: imports
// are resolved at runtime by vitest (vite) without strict tsc types.
import { readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore — see above.
import { dirname, join, resolve } from 'node:path';
// @ts-ignore — see above.
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Forbidden import patterns for the primitives/ directory
//
// 1. `apps/` — primitives must not depend on any application code.
// 2. `convex/_generated/` — primitives must not depend on generated Convex types.
// 3. `lib/practice` — primitives must not depend on the practice-submission lib
//    (e.g. misconception wiring, timing baseline).
// 4. `practice-core/contract` — the practice.v1 envelope; primitives must emit
//    no envelope and hold no submission state (spec FR-2 rule).
// ---------------------------------------------------------------------------

const FORBIDDEN_IMPORT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /from\s+['"]\s*apps\//, label: 'apps/' },
  { pattern: /from\s+['"]\s*convex\/_generated/, label: 'convex/_generated/' },
  { pattern: /from\s+['"]\s*[^'"]*lib\/practice/, label: 'lib/practice (practice-submission lib)' },
  { pattern: /from\s+['"]\s*[^'"]*practice-core\/contract/, label: '@math-platform/practice-core/contract (practice.v1 envelope)' },
];

/**
 * Check a source-code string for forbidden import patterns.
 * @param source - The source code to scan.
 * @returns Array of violations with the offending line and rule label.
 */
function checkImports(source: string): Array<{ line: string; label: string }> {
  const violations: Array<{ line: string; label: string }> = [];
  const lines = source.split('\n');
  for (const line of lines) {
    for (const { pattern, label } of FORBIDDEN_IMPORT_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({ line: line.trim(), label });
      }
    }
  }
  return violations;
}

const PRIMITIVES_SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Recursively collect all non-test TypeScript files from a directory, skipping
 * `__tests__/` so the boundary scan does not flag its own pattern fixtures.
 * @param dir - The directory to scan.
 * @returns Array of absolute file paths to `.ts`/`.tsx` files (excluding test files).
 */
function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === '__tests__') continue;
      files.push(...collectTsFiles(fullPath));
    } else if (
      (entry.endsWith('.ts') || entry.endsWith('.tsx')) &&
      !entry.endsWith('.test.ts') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.spec.ts') &&
      !entry.endsWith('.spec.tsx')
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Real filesystem scan — passes vacuously at HEAD, must keep passing after
// Phase 3 Green adds `CoordinatePlane.tsx` and the primitive subdir barrel.
// ---------------------------------------------------------------------------

describe('boundary — primitives/ must not import forbidden modules', () => {
  it('contains no imports from apps/, convex/_generated/, lib/practice, or practice.v1 envelope', () => {
    const sourceFiles = collectTsFiles(PRIMITIVES_SRC);
    const violations: Array<{ file: string; line: number; match: string; label: string }> = [];

    for (const filePath of sourceFiles) {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const { pattern, label } of FORBIDDEN_IMPORT_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              file: filePath.replace(PRIMITIVES_SRC + '/', ''),
              line: i + 1,
              match: line.trim(),
              label,
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      expect.fail(
        `Primitive-layer boundary violations found:\n${violations
          .map(
            (v) =>
              `  ${v.file}:${v.line} — forbidden import from ${v.label}\n    ${v.match}`,
          )
          .join('\n\n')}`,
      );
    }

    expect(violations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Inline string-fixture assertions — prove the scanner detects each forbidden
// pattern, ignores allowed imports, and ignores comments that mention the
// forbidden paths. Per test-strategy.md §2, no planted file is ever written
// to disk; these are pure function-level tests on `checkImports()`.
// ---------------------------------------------------------------------------

describe('boundary lint — fixture assertions', () => {
  it('catches imports from apps/', () => {
    const badCode = `import { foo } from 'apps/integrated-math-3/lib/curriculum/audit';`;
    expect(checkImports(badCode)).toHaveLength(1);
  });

  it('catches imports from convex/_generated/', () => {
    const badCode = `import type { Doc } from "convex/_generated/dataModel";`;
    expect(checkImports(badCode)).toHaveLength(1);
  });

  it('catches imports from lib/practice (relative)', () => {
    const badCode = `import { wiring } from '../../lib/practice/misconception-loop-wiring';`;
    expect(checkImports(badCode)).toHaveLength(1);
  });

  it('catches imports from @math-platform/practice-core/contract (the practice.v1 envelope)', () => {
    const badCode = `import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';`;
    expect(checkImports(badCode)).toHaveLength(1);
  });

  it('does not flag allowed sibling imports', () => {
    const goodCode = [
      `import type { MathPrimitiveProps, PrimitiveMode } from '../types';`,
      `import { GraphingCanvas } from '../../components/graphing/GraphingCanvas';`,
      `import type { Point, FunctionPlot } from '../../components/graphing/GraphingCanvas';`,
      `import React from 'react';`,
    ].join('\n');
    expect(checkImports(goodCode)).toHaveLength(0);
  });

  it('does not flag comments mentioning the forbidden paths', () => {
    const comment = `// primitives/ must not import from apps/, convex/_generated/, lib/practice, or practice.v1 envelope.`;
    expect(checkImports(comment)).toHaveLength(0);
  });
});
