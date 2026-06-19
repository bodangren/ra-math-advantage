import { test, expect } from '@playwright/test';

// Phase 1 — Viewport guard stand-up (responsive-mobile-audit_20260605)
// VIEWPORTS per strategy §2: phone 390×844, tablet 768×1024, desktop 1280×800

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

    expect(bodyWidth, 'known-bad fixture must overflow viewport horizontally at phone 390×844').toBeGreaterThan(viewportWidth);
  });

  test.fixme('known-bad fixture — tablet 768×1024 overflow detected on deliberately-bad page (owned by P2 [~] activity remediation)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/responsive-fixtures/known-bad-overflow');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth, 'known-bad fixture must overflow viewport horizontally at tablet 768×1024').toBeGreaterThan(viewportWidth);
  });

  test.fixme('known-bad fixture — desktop 1280×800 overflow detected on deliberately-bad page (owned by P2 [~] activity remediation)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/responsive-fixtures/known-bad-overflow');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth, 'known-bad fixture must overflow viewport horizontally at desktop 1280×800').toBeGreaterThan(viewportWidth);
  });
});
