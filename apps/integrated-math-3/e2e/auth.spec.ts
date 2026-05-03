import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('login page loads with title', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('nonexistent@user');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });

  test('valid student login redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('student1@demo');
    await page.getByLabel('Password').fill('Demo1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('/student/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('valid teacher login redirects to teacher dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('teacher@demo');
    await page.getByLabel('Password').fill('Demo1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('/teacher/dashboard');
  });
});
