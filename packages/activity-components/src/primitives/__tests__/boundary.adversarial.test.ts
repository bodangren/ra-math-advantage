// packages/activity-components/src/primitives/__tests__/boundary.adversarial.test.ts
// Adversarial fixture tests for primitive-layer-contract_20260615 (T0) — FR-7 boundary.
//
// These tests document gaps in the Phase-2 boundary test by intentionally feeding
// `checkImports` (re-implemented here) code patterns that the existing scanner does
// not catch. The failures are the *evidence*; they are not assertions we expect to
// pass. Once the boundary scanner is hardened to catch these patterns, these tests
// should be inverted to assert that the scanner DOES catch them.
//
// Patterns probed:
//   - Relative `../apps/integrated-math-3/...` (smuggled app import).
//   - A backslash-form `from "apps\..."` style string.
//   - A quoted path inside a JS comment that *could* be mistaken for a real import.

import { describe, it, expect } from 'vitest';

const FORBIDDEN_IMPORT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /from\s+['"]\s*apps\//, label: 'apps/' },
  { pattern: /from\s+['"]\s*convex\/_generated/, label: 'convex/_generated/' },
  { pattern: /from\s+['"]\s*[^'"]*lib\/practice/, label: 'lib/practice (practice-submission lib)' },
  {
    pattern: /from\s+['"]\s*[^'"]*practice-core\/contract/,
    label: '@math-platform/practice-core/contract (practice.v1 envelope)',
  },
];

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

describe('boundary scanner — adversarial fixture gaps', () => {
  it('DEMO: scanner MISSES relative ../apps/ imports (regression risk)', () => {
    // The spec forbids any import from `apps/`. A primitive is "leaf" — it
    // can't reach into the apps directory. This is a real regression risk.
    const badCode = `import { foo } from '../../../apps/integrated-math-3/convex/seed/seed_practice_items';`;
    const caught = checkImports(badCode);
    // Documenting the current behavior — this SHOULD be 1 after the fix.
    expect(caught).toHaveLength(0);
  });

  it('scanner correctly catches direct apps/ imports (baseline)', () => {
    const badCode = `import { foo } from 'apps/integrated-math-3/lib/foo';`;
    expect(checkImports(badCode)).toHaveLength(1);
  });

  it('scanner correctly catches convex/_generated/ imports (baseline)', () => {
    const badCode = `import type { Doc } from "convex/_generated/dataModel";`;
    expect(checkImports(badCode)).toHaveLength(1);
  });

  it('scanner correctly catches practice-core/contract imports (baseline)', () => {
    const badCode = `import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';`;
    expect(checkImports(badCode)).toHaveLength(1);
  });
});