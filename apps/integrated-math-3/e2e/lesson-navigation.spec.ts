import { test, expect } from './fixtures';

test.describe('Lesson Navigation', () => {
  test('dashboard shows lesson cards', async ({ studentPage: page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    const lessonLinks = page.locator('a[href*="/student/lesson/"]');
    await expect(lessonLinks.first()).toBeVisible();
  });

  test('clicking lesson opens lesson page', async ({ studentPage: page }) => {
    const lessonLink = page.locator('a[href*="/student/lesson/"]:not([aria-disabled="true"])').first();
    await expect(lessonLink).toBeVisible();

    await lessonLink.click();
    await page.waitForURL(/\/student\/lesson\/.+/);
    await expect(page.locator('main, [data-testid="lesson-renderer"]').first()).toBeVisible();
  });

  test('phase navigation is present', async ({ studentPage: page }) => {
    const lessonLink = page.locator('a[href*="/student/lesson/"]:not([aria-disabled="true"])').first();
    await lessonLink.click();
    await page.waitForURL(/\/student\/lesson\/.+/);

    const phaseButtons = page.locator('[data-testid="phase-tab"], button:has-text("Phase"), [class*="phase"]');
    await expect(phaseButtons.first()).toBeVisible();
  });
});
