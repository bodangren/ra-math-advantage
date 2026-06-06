import { test, expect } from './fixtures';
import { SEL } from './selectors';

test.describe('Phase 1 — Deterministic Seed Smoke', () => {
  test('student dashboard exposes the locked-in selector contract', async ({ studentPage: page }) => {
    // Login flow drives us to /student/dashboard
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    // The app shell wraps every authenticated route. The smoke spec must
    // see it via the stable selector — not via a [class*=...] pattern.
    await expect(page.locator(`[data-testid="${SEL.appShell}"]`)).toBeVisible();
  });

  test('student dashboard exposes a lesson list region', async ({ studentPage: page }) => {
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL.studentDashboard}"]`),
    ).toBeVisible();

    await expect(
      page.locator(`[data-testid="${SEL.studentDashboardLessonList}"]`),
    ).toBeVisible();
  });

  test('student dashboard renders at least one seeded lesson link', async ({ studentPage: page }) => {
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    // Strategy §5: "log in, dashboard shows the seeded lesson title."
    // The Phase 1 seed action must guarantee at least one assigned lesson
    // for student1@demo, surfaced through the stable selector.
    const firstLesson = page
      .locator(`[data-testid="${SEL.studentDashboardLessonLink}"]`)
      .first();

    await expect(firstLesson).toBeVisible({ timeout: 15_000 });
  });
});
