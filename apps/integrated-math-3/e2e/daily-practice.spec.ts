import { test, expect } from './fixtures';

test.describe('Daily Practice', () => {
  test('daily practice page loads', async ({ studentPage: page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /Daily Practice|Practice/ }),
    ).toBeVisible();
  });

  test('practice session loads cards', async ({ studentPage: page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    const sessionContent = page.locator(
      '[data-testid="practice-card"], [data-testid="practice-session"], [class*="practice"]',
    );
    await expect(sessionContent.first()).toBeVisible({ timeout: 15_000 });
  });
});
