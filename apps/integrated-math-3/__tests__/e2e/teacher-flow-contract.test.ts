import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SPEC_FILE = resolve(
  __dirname,
  '../../e2e/teacher-flow.spec.ts',
);

const SPEC_SOURCE = readFileSync(SPEC_FILE, 'utf8');

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

const EXPECTED_LOCKED_IN_SELS: ReadonlyArray<string> = [
  'teacher-gradebook',
  'teacher-gradebook-cell',
  'teacher-student-detail',
  'teacher-student-detail-back-link',
  'teacher-student-detail-lesson-card',
  'teacher-lessons',
  'teacher-class-selector',
  'teacher-assign-toggle',
  'teacher-submission-review',
  'teacher-competency-heatmap',
  'teacher-student-list',
  'teacher-student-list-row',
];

function extractSelConstant(source: string, constantName: string): Record<string, string> {
  const marker = `const ${constantName} = {`;
  const start = source.indexOf(marker);
  if (start < 0) {
    throw new Error(`Could not find constant "${constantName}" in spec file`);
  }
  const openBrace = source.indexOf('{', start);
  // The spec uses `} as const;` rather than `};`, so match the closing
  // brace that is followed by `as const` or `;`. Walk forward one char
  // at a time and bail on the first match.
  let closeBrace = -1;
  for (let i = openBrace + 1; i < source.length; i += 1) {
    if (source[i] !== '}') continue;
    const tail = source.slice(i, i + 16);
    if (tail.startsWith('} as const') || tail.startsWith('};')) {
      closeBrace = i;
      break;
    }
  }
  if (closeBrace < 0) {
    throw new Error(`Could not find end of "${constantName}" object in spec file`);
  }
  const body = source.slice(openBrace + 1, closeBrace);
  const result: Record<string, string> = {};
  const entryPattern = /(\w+):\s*'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = entryPattern.exec(body)) !== null) {
    const [, key, value] = match;
    result[key] = value;
  }
  return result;
}

describe('e2e/teacher-flow.spec.ts — Phase 4 Red locked-in SEL contract', () => {
  describe('spec file shape', () => {
    it('declares SEL_PHASE4_TEACHER as a const object', () => {
      expect(SPEC_SOURCE).toMatch(/const\s+SEL_PHASE4_TEACHER\s*=\s*\{/);
    });

    it('imports the test + expect helpers from ./fixtures', () => {
      expect(SPEC_SOURCE).toMatch(/import\s*\{[^}]*test[^}]*\}\s*from\s*['"]\.\/fixtures['"]/);
      expect(SPEC_SOURCE).toMatch(/import\s*\{[^}]*expect[^}]*\}\s*from\s*['"]\.\/fixtures['"]/);
    });
  });

  describe('SEL_PHASE4_TEACHER values are non-empty kebab-case strings', () => {
    it('every entry is a non-empty kebab-case token', () => {
      const sel = extractSelConstant(SPEC_SOURCE, 'SEL_PHASE4_TEACHER');
      const entries = Object.entries(sel);
      expect(entries.length, 'SEL_PHASE4_TEACHER must be non-empty').toBeGreaterThan(0);

      for (const [name, value] of entries) {
        expect(typeof value, `SEL_PHASE4_TEACHER.${name} should be a string`).toBe('string');
        expect(
          value.length,
          `SEL_PHASE4_TEACHER.${name} should be a non-empty string`,
        ).toBeGreaterThan(0);
        expect(
          KEBAB_CASE_PATTERN.test(value),
          `SEL_PHASE4_TEACHER.${name} = "${value}" should be kebab-case (a-z, 0-9, single-hyphen separators)`,
        ).toBe(true);
      }
    });
  });

  describe('SEL_PHASE4_TEACHER values are unique', () => {
    it('no duplicate values across entries', () => {
      const sel = extractSelConstant(SPEC_SOURCE, 'SEL_PHASE4_TEACHER');
      const values = Object.values(sel);
      const unique = new Set(values);
      expect(unique.size, 'duplicate selector values found in SEL_PHASE4_TEACHER').toBe(values.length);
    });
  });

  describe('SEL_PHASE4_TEACHER exposes the locked-in Phase 4 set', () => {
    it('exposes the minimum selector set the Phase 4 teacher-flow spec depends on', () => {
      const sel = extractSelConstant(SPEC_SOURCE, 'SEL_PHASE4_TEACHER');
      const present = new Set(Object.values(sel));

      for (const expected of EXPECTED_LOCKED_IN_SELS) {
        expect(
          present.has(expected),
          `SEL_PHASE4_TEACHER must include the locked-in value "${expected}"`,
        ).toBe(true);
      }
    });

    it('every locked-in value appears at least once in the spec body', () => {
      for (const expected of EXPECTED_LOCKED_IN_SELS) {
        const escaped = expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`['"\`]${escaped}['"\`]`);
        expect(
          pattern.test(SPEC_SOURCE),
          `Phase 4 spec must reference the locked-in selector "${expected}" via its string literal`,
        ).toBe(true);
      }
    });
  });
});
