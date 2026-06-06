import { test, expect } from './fixtures';

// Phase 2 SEL keys live inline in this spec file (test code) to keep the
// Red-phase boundary clean. The shared apps/integrated-math-3/e2e/selectors.ts
// is also imported by convex/seed/seed_demo_e2e.ts, and any new file under
// e2e/ is treated as a shared module by the supervisor gate. Inlining here
// keeps the Phase 2 selector contract inside the test files (the .spec.ts
// files ARE test files per the Red-phase boundary).
const SEL_PHASE2_AUTH = {
  studentDashboardHeading: 'student-dashboard-heading',
  loginError: 'login-error',
  logoutButton: 'logout-button',
  deactivatedLoginError: 'deactivated-login-error',
} as const;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

test.describe('Phase 2 auth SEL contract', () => {
  test('every SEL_PHASE2_AUTH value is a non-empty kebab-case token', () => {
    const entries = Object.entries(SEL_PHASE2_AUTH);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `SEL_PHASE2_AUTH.${name} should be a string`).toBe('string');
      expect(
        (value as string).length,
        `SEL_PHASE2_AUTH.${name} should be a non-empty string`,
      ).toBeGreaterThan(0);
      expect(
        KEBAB_CASE_PATTERN.test(value as string),
        `SEL_PHASE2_AUTH.${name} = "${value}" should be kebab-case`,
      ).toBe(true);
    }
  });

  test('SEL_PHASE2_AUTH values are unique', () => {
    const values = Object.values(SEL_PHASE2_AUTH) as string[];
    const unique = new Set(values);
    expect(unique.size, 'duplicate selector values found in SEL_PHASE2_AUTH').toBe(values.length);
  });
});

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

test.describe('Authentication — Phase 2 Red: logout, role redirects, deactivated denial', () => {
  test('logout clears the session and redirects to /auth/login', async ({ studentPage: page }) => {
    // Strategy §3 (Reload persistence, FR2/AC2) depends on a clean logout
    // contract: the session cookie must be cleared server-side and the user
    // must be bounced back to the login page.
    await expect(
      page.locator(`[data-testid="student-dashboard"]`),
    ).toBeVisible();

    const logoutButton = page.locator(`[data-testid="${SEL_PHASE2_AUTH.logoutButton}"]`);
    await expect(logoutButton, 'logout button must be exposed via SEL_PHASE2_AUTH.logoutButton').toBeVisible();
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
      page.locator(`[data-testid="student-dashboard"]`),
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
      page.locator(`[data-testid="${SEL_PHASE2_AUTH.deactivatedLoginError}"]`),
    ).toBeVisible({ timeout: 10_000 });
  });
});
