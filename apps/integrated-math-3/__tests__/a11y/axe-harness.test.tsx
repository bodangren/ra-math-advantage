import { describe, it, expect } from 'vitest';
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
