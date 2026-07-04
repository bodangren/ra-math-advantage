import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { runAxeOnRendered } from '@/lib/a11y/harness';

/**
 * Minimal icon fixture used to create an icon-only button with no accessible
 * name (a known button-name violation).
 */
function SomeIcon() {
  return (
    <svg data-testid="icon" width="16" height="16" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

describe('axe-core a11y harness', () => {
  it('detects a serious violation on an icon-only button with no accessible name', async () => {
    const results = await runAxeOnRendered(
      <button type="button" onClick={() => {}} role="button">
        <SomeIcon />
      </button>,
    );

    const seriousOrCritical = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );

    expect(seriousOrCritical.length).toBeGreaterThanOrEqual(1);
  });

  it('reports no serious/critical violations on a properly labeled button', async () => {
    const results = await runAxeOnRendered(
      <button type="button" aria-label="Save">
        Save
      </button>,
    );

    const seriousOrCritical = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );

    expect(seriousOrCritical).toHaveLength(0);
  });

  it('returns a typed summary shape with violations, critical, and serious counts', async () => {
    const results = await runAxeOnRendered(
      <button type="button" aria-label="OK">
        OK
      </button>,
    );

    expect(results).toHaveProperty('violations');
    expect(results).toHaveProperty('critical');
    expect(results).toHaveProperty('serious');
    expect(typeof results.critical).toBe('number');
    expect(typeof results.serious).toBe('number');
    expect(Array.isArray(results.violations)).toBe(true);
  });
});

describe('Adversarial: axe rule-disable drift (A7 defense)', () => {
  it('every new axe rule disable in a11y test files carries a documented reason comment', () => {
    const a11yTestDir = path.resolve(__dirname);
    const files = readdirSync(a11yTestDir).filter((f: string) => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
    const undocDisables: string[] = [];
    for (const file of files) {
      const full = path.join(a11yTestDir, file);
      const src = readFileSync(full, 'utf-8') as string;
      const lines = src.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comment-only lines that merely *describe* the pattern we're
        // searching for (otherwise the scanner false-positives on its own
        // rule description).
        if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) continue;
        // Match patterns like: enabled: false, { enabled: false }, 'some-rule': { enabled: false }
        if (/enabled\s*:\s*false/.test(line) && !/color-contrast/.test(line)) {
          const prev1 = lines[i - 1] || '';
          const prev2 = lines[i - 2] || '';
          const nearby = `${prev2}\n${prev1}\n${line}`;
          if (!/(reason|because|jsdom|false[- ]?positive|axe[- ]?false[- ]?positive|documented|intentionall|defer)/i.test(nearby)) {
            undocDisables.push(`${file}:${i + 1}: ${line.trim()}`);
          }
        }
      }
    }
    expect(
      undocDisables,
      `undocumented axe rule disables detected (A7 anti-pattern):\n${undocDisables.join('\n')}`,
    ).toHaveLength(0);
  });

  it('harness default disables are all documented with reason comments in harness.tsx', () => {
    const harnessPath = path.resolve(__dirname, '../../lib/a11y/harness.tsx');
    const src = readFileSync(harnessPath, 'utf-8');
    // color-contrast + color-contrast-enhanced are the expected defaults.
    expect(src).toMatch(/'color-contrast':\s*\{\s*enabled:\s*false\s*\}/);
    expect(src).toMatch(/jsdom/);
  });
});
