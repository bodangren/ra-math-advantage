import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

/**
 * Phase 1 — Audit & Classification (Red)
 *
 * This audit-contract test asserts two things:
 * 1. `apps/bus-math-v2/lib/auth/server.ts` exports the expected public surface.
 * 2. The Contract-First classification decision doc exists and has a valid shape.
 *
 * At HEAD the decision doc has not been authored yet, so this test fails with
 * a missing-file error — confirming the Red phase.
 */

const REPO_ROOT = process.cwd();
const BM2_SERVER_PATH = path.join(
  REPO_ROOT,
  'apps/bus-math-v2/lib/auth/server.ts',
);
const DECISION_DOC_PATH = path.join(
  REPO_ROOT,
  'measure/tracks/unified-auth-monorepo_20260609/decisions/auth-export-classification.md',
);

const EXPECTED_BM2_EXPORTS = [
  'getServerSessionClaims',
  'getRequestSessionClaims',
  'requireRequestSessionClaims',
  'requireStudentRequestClaims',
  'requireAdminRequestClaims',
  'requireServerSessionClaims',
  'requireServerRoles',
  'requireTeacherSessionClaims',
  'requireStudentSessionClaims',
  'requireActiveRequestSessionClaims',
  'requireActiveStudentRequestClaims',
  'requireActiveTeacherRequestClaims',
];

async function readSourceFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

function extractExportedFunctionNames(source: string): string[] {
  const names: string[] = [];
  const patterns = [
    // export async function foo(
    // export function foo(
    /export\s+(?:async\s+)?function\s+(\w+)/g,
    // export const foo =
    /export\s+(?:const|let|var)\s+(\w+)/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      names.push(match[1]);
    }
  }

  return [...new Set(names)].sort();
}

describe('Phase 1 — BM2 auth server export inventory', () => {
  it('exports exactly the expected public identifiers', async () => {
    const source = await readSourceFile(BM2_SERVER_PATH);
    const actual = extractExportedFunctionNames(source);
    const expected = [...EXPECTED_BM2_EXPORTS].sort();

    expect(actual).toEqual(expected);
  });
});

describe('Phase 1 — Contract-First classification decision doc', () => {
  it('exists and contains a classified section for every BM2 export', async () => {
    const doc = await readSourceFile(DECISION_DOC_PATH);

    // Every BM2 export must have a dedicated heading.
    for (const exportName of EXPECTED_BM2_EXPORTS) {
      const headingPattern = new RegExp(`^#{2,3}\\s+${exportName}\\s*$`, 'm');
      expect(
        doc,
        `Decision doc is missing a heading for ${exportName}`,
      ).toMatch(headingPattern);

      // Find the section for this export and assert it carries one of the
      // three allowed classifications.
      const sectionStart = doc.search(headingPattern);
      expect(sectionStart).toBeGreaterThanOrEqual(0);

      const nextHeadingIndex = doc.indexOf('\n## ', sectionStart + 1);
      const sectionEnd =
        nextHeadingIndex === -1 ? doc.length : nextHeadingIndex;
      const section = doc.slice(sectionStart, sectionEnd);

      const hasClassification =
        /\b(identical-to-package|generalizable-into-package|bm2-specific)\b/.test(section);
      expect(
        hasClassification,
        `Section for ${exportName} must declare one of the allowed classifications`,
      ).toBe(true);
    }
  });
});
