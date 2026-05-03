import { test as base, type Page, type BrowserContext } from '@playwright/test';

const STUDENT_USERNAME = 'student1@demo';
const STUDENT_PASSWORD = 'Demo1234!';
const TEACHER_USERNAME = 'teacher@demo';
const TEACHER_PASSWORD = 'Demo1234!';

async function loginAs(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL(/\/(student|teacher|admin)\//, { timeout: 15_000 });
}

export const test = base.extend<{
  studentPage: Page;
  teacherPage: Page;
}>({
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, STUDENT_USERNAME, STUDENT_PASSWORD);
    await use(page);
    await context.close();
  },

  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEACHER_USERNAME, TEACHER_PASSWORD);
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
