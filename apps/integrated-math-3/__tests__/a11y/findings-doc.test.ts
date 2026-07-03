import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const FINDINGS_PATH = resolve(
  process.cwd(),
  'measure/tracks/wcag-aa-remediation_20260605/findings.md',
);

const REPO_ROOT = resolve(process.cwd());

function readFindings(): string {
  return readFileSync(FINDINGS_PATH, 'utf-8');
}

describe('findings.md structural guard', () => {
  it('exists and is non-empty', () => {
    expect(existsSync(FINDINGS_PATH)).toBe(true);
    const content = readFindings();
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('has labeled integer counts for every severity', () => {
    const content = readFindings();
    const severities = ['Critical', 'Serious', 'Moderate', 'Minor'];

    for (const severity of severities) {
      const match = content.match(new RegExp(`\\*\\*${severity}:\\*\\*\\s*([0-9]+)`));
      expect(match).not.toBeNull();
      const count = parseInt(match![1], 10);
      expect(Number.isFinite(count)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  it('every cited surface resolves to a real file', () => {
    const content = readFindings();
    const paths = Array.from(
      content.matchAll(/`((?:apps|packages)\/[^`]+\.(?:tsx|ts|md))`/g),
    ).map((m) => m[1]);

    expect(paths.length).toBeGreaterThan(0);

    for (const p of paths) {
      const fullPath = resolve(REPO_ROOT, p);
      expect(existsSync(fullPath)).toBe(true);
    }
  });

  it('includes at least one code-inspection evidence path', () => {
    const content = readFindings();
    const evidenceHeader = content.indexOf('## Code-Inspection Evidence');
    expect(evidenceHeader).toBeGreaterThan(-1);

    const evidenceSection = content.slice(evidenceHeader);
    const codePaths = Array.from(
      evidenceSection.matchAll(/`((?:apps|packages)\/[^`]+\.(?:tsx|ts))`/g),
    );

    expect(codePaths.length).toBeGreaterThan(0);
  });
});
