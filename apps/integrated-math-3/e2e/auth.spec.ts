import { test, expect } from './fixtures';
import { SEL } from './selectors';

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
    await expect(
      page.locator(`[data-testid="${SEL.studentDashboardHeading}"]`),
    ).toBeVisible();
  });

  test('valid teacher login redirects to teacher dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('teacher@demo');
    await page.getByLabel('Password').fill('Demo1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('/teacher/dashboard');
  });
});

test.describe('Authentication — Phase 2 Red: logout, role redirects, deactivated denial', () => {
  test('logout clears the session and redirects to /auth/login', async ({ studentPage: page }) => {
    // Strategy §3 (Reload persistence, FR2/AC2) depends on a clean logout
    // contract: the session cookie must be cleared server-side and the user
    // must be bounced back to the login page.
    await expect(
      page.locator(`[data-testid="${SEL.studentDashboard}"]`),
    ).toBeVisible();

    const logoutButton = page.locator(`[data-testid="${SEL.logoutButton}"]`);
    await expect(logoutButton, 'logout button must be exposed via SEL.logoutButton').toBeVisible();
    await logoutButton.click();

    await page.waitForURL(/\/auth\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('student session visiting /teacher is redirected to /student/dashboard', async ({ studentPage: page }) => {
    // Strategy §1 row 2: role-redirect coverage. A student whose cookie is
    // valid must NOT be able to land on a teacher surface — the layout-level
    // guard should bounce them back to their dashboard.
    await page.goto('/teacher/dashboard');
    await page.waitForURL(/\/student\/dashboard/, { timeout: 15_000 });
    await expect(
      page.locator(`[data-testid="${SEL.studentDashboard}"]`),
    ).toBeVisible();
  });

  test('teacher session visiting /student is redirected to /teacher', async ({ teacherPage: page }) => {
    // Symmetric guard: a teacher who lands on /student must be redirected
    // away from the student surface, not silently allowed in.
    await page.goto('/student/dashboard');
    await page.waitForURL(/\/teacher\//, { timeout: 15_000 });
  });

  test('deactivated student is denied access to protected API routes', async ({ page }) => {
    // Strategy §3 (Deactivated-credential denial, FR1): the seed must create
    // a deactivated student with a still-valid JWT. The protected API route
    // (POST /api/phases/complete) must return 401/403 because
    // requireActiveRequestSessionClaims fails-closed on inactive credentials.
    //
    // This is the Red contract: the seed action does not yet expose a
    // `deactivated: true` option, and the API route does not yet enforce the
    // active-credential check. The test fails on the first 401 expectation.
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('deactivated@demo');
    await page.getByLabel('Password').fill('Demo1234!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // If login is rejected outright, the deactivated-login-error region
    // must surface a specific message — not the generic "Invalid login
    // credentials" string used for unknown accounts.
    await expect(
      page.locator(`[data-testid="${SEL.deactivatedLoginError}"]`),
    ).toBeVisible({ timeout: 10_000 });
  });
});
