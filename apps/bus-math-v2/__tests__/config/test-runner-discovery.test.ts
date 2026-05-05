import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const BM2_ROOT = path.resolve(__dirname, '../..');

function listFiles(dir: string, matcher: RegExp): string[] {
  const result: string[] = [];

  if (!fs.existsSync(dir)) {
    return result;
  }

  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const rel = path.relative(BM2_ROOT, fullPath).replace(/\\/g, '/');
        if (matcher.test(rel)) {
          result.push(rel);
        }
      }
    }
  };

  walk(dir);
  return result.sort();
}

describe('test runner discovery configuration', () => {
  it('keeps Vitest discovery focused on __tests__ directory', () => {
    const vitestConfig = fs.readFileSync(path.join(BM2_ROOT, 'vitest.config.ts'), 'utf8');

    expect(vitestConfig).toContain("'__tests__/**/*.test.{ts,tsx}'");

    const unitTests = listFiles(path.join(BM2_ROOT, '__tests__'), /\.test\.(ts|tsx)$/);

    expect(unitTests.length).toBeGreaterThan(0);
  });

  it('pins Playwright discovery to tests/e2e *.spec.ts files', () => {
    const playwrightConfigPath = path.join(BM2_ROOT, 'playwright.config.ts');
    if (!fs.existsSync(playwrightConfigPath)) {
      return; // playwright config not present
    }
    const playwrightConfig = fs.readFileSync(playwrightConfigPath, 'utf8');

    expect(playwrightConfig).toContain("testDir: './tests/e2e'");
    expect(playwrightConfig).toContain("testMatch: '**/*.spec.ts'");

    const e2eSpecs = listFiles(path.join(BM2_ROOT, 'tests/e2e'), /\.spec\.ts$/);
    if (e2eSpecs.length === 0) {
      return; // no e2e spec files authored yet
    }
  });
});
