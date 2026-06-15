/**
 * Phase 3 — Red document contract test for the IM3 misconception authoring
 * guide.
 *
 * Per `test-strategy.md` §"Per-Phase Test Approach › Phase 3", the
 * authoring guide is a document/artifact deliverable. This test
 * asserts the guide:
 *   1. Exists at a known path inside `apps/integrated-math-3/`.
 *   2. Contains the four required sections
 *      (Taxonomy Schema, Detection Mapping, Remediation Activity
 *      Authoring, Expansion Process).
 *   3. References real, on-disk file paths inside the IM3 workspace
 *      (i.e., it does not point at code that was deleted or renamed).
 *
 * Source under test (does NOT exist at HEAD; this is the Red signal):
 * `apps/integrated-math-3/docs/misconception-authoring-guide.md`
 *
 * The Green phase must ship the authoring guide (FR6) and the test
 * gates that it is well-formed before this track's closeout.
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const TEST_FILE_DIR = dirname(__filename);
const IM3_APP_DIR = resolve(TEST_FILE_DIR, '..', '..', '..');
const AUTHORING_GUIDE_REL = 'docs/misconception-authoring-guide.md';
const AUTHORING_GUIDE_ABS = resolve(IM3_APP_DIR, AUTHORING_GUIDE_REL);

const REQUIRED_SECTIONS = [
  'Taxonomy Schema',
  'Detection Mapping',
  'Remediation Activity Authoring',
  'Expansion Process',
] as const;

const PATH_LINE_REGEX =
  /^[ \t>]*[-*]?\s*(?:[`*])?((?:apps|packages|__tests__|convex|measure|docs|lib|components|curriculum)\/[^\s`*]+\.[a-z0-9]{1,5})(?:[`*])?/gim;

function extractReferencedPaths(markdown: string): readonly string[] {
  const matches = new Set<string>();
  for (const match of markdown.matchAll(PATH_LINE_REGEX)) {
    const raw = match[1];
    if (!raw) continue;
    matches.add(raw);
  }
  return Array.from(matches);
}

describe('IM3 misconception authoring guide — document contract', () => {
  it('exists at apps/integrated-math-3/docs/misconception-authoring-guide.md', () => {
    expect(
      existsSync(AUTHORING_GUIDE_ABS),
      `authoring guide missing at ${AUTHORING_GUIDE_ABS}`,
    ).toBe(true);
  });

  it('is a non-empty regular file', () => {
    expect(existsSync(AUTHORING_GUIDE_ABS)).toBe(true);
    const stats = statSync(AUTHORING_GUIDE_ABS);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('contains all four required section headings', () => {
    const markdown = readFileSync(AUTHORING_GUIDE_ABS, 'utf8');
    for (const section of REQUIRED_SECTIONS) {
      const headingRegex = new RegExp(
        `^#{1,6}\\s+${section.replace(/\s+/g, '\\s+')}`,
        'im',
      );
      expect(
        headingRegex.test(markdown),
        `authoring guide missing required section: ${section}`,
      ).toBe(true);
    }
  });

  it('every referenced relative file path resolves to a real file on disk', () => {
    const markdown = readFileSync(AUTHORING_GUIDE_ABS, 'utf8');
    const referenced = extractReferencedPaths(markdown);
    expect(
      referenced.length,
      'authoring guide contains no path-like references — likely missing examples',
    ).toBeGreaterThan(0);
    for (const rel of referenced) {
      if (isAbsolute(rel)) continue;
      const candidate = resolve(IM3_APP_DIR, '..', rel);
      const relToRepo = relative(
        resolve(IM3_APP_DIR, '..'),
        candidate,
      );
      expect(
        existsSync(candidate),
        `authoring guide references missing path: ${rel} (resolved: ${candidate}${sep}./${relToRepo})`,
      ).toBe(true);
    }
  });

  it('does not reference any path outside the monorepo root (no absolute or escape paths)', () => {
    const markdown = readFileSync(AUTHORING_GUIDE_ABS, 'utf8');
    const referenced = extractReferencedPaths(markdown);
    for (const rel of referenced) {
      if (isAbsolute(rel)) {
        throw new Error(
          `authoring guide uses absolute path: ${rel} — must be repo-relative`,
        );
      }
      if (rel.startsWith('..')) {
        throw new Error(
          `authoring guide references a path outside the monorepo: ${rel}`,
        );
      }
    }
  });
});
