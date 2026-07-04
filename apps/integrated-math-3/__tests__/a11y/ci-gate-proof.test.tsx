import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runAxeOnRendered } from '@/lib/a11y/harness';

// Phase 5 Task 15 — CI gate proof test (AC5 / A5 defense).
// Proves that the axe harness FAILS on injected bad markup and PASSES on
// clean markup, and that the Playwright e2e a11y spec and the test:a11y
// script still exist (A9 defense against silent deletion).

describe('CI gate proof (Task 15 Group A/B) — axe catches injected violations', () => {
  it('known-bad fixture (icon-only button) returns ≥1 serious/critical violation', async () => {
    const BadButton = (
      <button type="button">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>
    );
    const results = await runAxeOnRendered(BadButton);
    expect(
      results.critical + results.serious,
      'axe must flag an unlabeled icon-only button as serious/critical',
    ).toBeGreaterThanOrEqual(1);
  });

  it('known-good fixture (labeled button) returns 0 serious/critical violations', async () => {
    const GoodButton = (
      <button type="button" aria-label="Save">
        Save
      </button>
    );
    const results = await runAxeOnRendered(GoodButton);
    expect(results.critical + results.serious, 'labeled button must be clean').toBe(0);
  });
});

describe('CI gate proof (Task 15 Group C) — Playwright a11y spec exists and references wcag2aa', () => {
  it('e2e/accessibility.spec.ts references AxeBuilder with wcag2aa tag', () => {
    const specPath = path.resolve(__dirname, '../../e2e/accessibility.spec.ts');
    const source = readFileSync(specPath, 'utf-8');
    expect(source).toMatch(/AxeBuilder/);
    expect(source).toMatch(/withTags\s*\(/);
    expect(source).toMatch(/wcag2aa/);
  });
});

describe('CI gate proof (Task 15 Group D) — test:a11y script exists in package.json', () => {
  it('apps/integrated-math-3/package.json contains a test:a11y script', () => {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.['test:a11y'], 'test:a11y script must be defined').toBeTruthy();
    expect(pkg.scripts!['test:a11y'].length).toBeGreaterThan(0);
  });
});
