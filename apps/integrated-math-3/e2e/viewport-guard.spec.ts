import { test, expect } from '@playwright/test';

// Phase 1 — Viewport guard stand-up (responsive-mobile-audit_20260605)
// VIEWPORTS per strategy §2: phone 390×844, tablet 768×1024, desktop 1280×800
//
// Strategy §7/§8: each known-bad-fixture case asserts the guard's PASS
// condition (no horizontal overflow: bodyWidth <= viewportWidth). On the
// deliberately-bad 200vw fixture this assertion FAILS — that failure is the
// one-shot Red proof that the guard is non-vacuous (it detects overflow).
// Cases are committed as `test.fixme` (owned by P2 [~] activity remediation)
// so the deliberate Red stays out of default e2e/a11y aggregates until P3
// CI wiring. The companion vitest regression test in
// __tests__/responsive/viewport-guard.unit.test.ts ("guard detects horizontal
// overflow ... non-vacuity proof") keeps a permanent, re-runnable, PASSING
// proof that the guard detects overflow in the default aggregate.

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

test.describe('Viewport Guard — Regression Net (Phase 1 stand-up)', () => {
  test.fixme('known-bad fixture — phone 390×844 overflow detected on deliberately-bad page (owned by P2 [~] activity remediation)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.phone);
    await page.goto('/responsive-fixtures/known-bad-overflow');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth, 'guard pass condition: no horizontal overflow at phone 390×844').toBeLessThanOrEqual(viewportWidth);
  });

  test.fixme('known-bad fixture — tablet 768×1024 overflow detected on deliberately-bad page (owned by P2 [~] activity remediation)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/responsive-fixtures/known-bad-overflow');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth, 'guard pass condition: no horizontal overflow at tablet 768×1024').toBeLessThanOrEqual(viewportWidth);
  });

  test.fixme('known-bad fixture — desktop 1280×800 overflow detected on deliberately-bad page (owned by P2 [~] activity remediation)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/responsive-fixtures/known-bad-overflow');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth, 'guard pass condition: no horizontal overflow at desktop 1280×800').toBeLessThanOrEqual(viewportWidth);
  });
});
