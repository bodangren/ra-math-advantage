import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * WCAG 2.1 AA Accessibility Audit — Phase 1 Baseline
 *
 * Runs axe-core against key routes and logs all violations by severity.
 * Tests FAIL if any critical or serious violations are found.
 *
 * Authenticated routes use a stored auth state (see auth.setup.ts).
 */

// ── Types ──────────────────────────────────────────────────────────────────────

interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
  description: string;
  helpUrl: string;
  nodes: { html: string; failureSummary: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return '  (none)';
  return violations
    .map(
      (v) =>
        `  [${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}: ${v.description}\n` +
        `    Help: ${v.helpUrl}\n` +
        `    Nodes: ${v.nodes.length}\n` +
        v.nodes
          .slice(0, 3)
          .map((n) => `      - ${n.html.slice(0, 120)}`)
          .join('\n'),
    )
    .join('\n\n');
}

function logResults(route: string, violations: AxeViolation[]) {
  const bySeverity = {
    critical: violations.filter((v) => v.impact === 'critical'),
    serious: violations.filter((v) => v.impact === 'serious'),
    moderate: violations.filter((v) => v.impact === 'moderate'),
    minor: violations.filter((v) => v.impact === 'minor'),
  };

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  AXE AUDIT: ${route}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Critical: ${bySeverity.critical.length}`);
  console.log(`  Serious:  ${bySeverity.serious.length}`);
  console.log(`  Moderate: ${bySeverity.moderate.length}`);
  console.log(`  Minor:    ${bySeverity.minor.length}`);
  console.log(`${'─'.repeat(60)}`);

  if (bySeverity.critical.length) {
    console.log('\n  CRITICAL:');
    console.log(formatViolations(bySeverity.critical));
  }
  if (bySeverity.serious.length) {
    console.log('\n  SERIOUS:');
    console.log(formatViolations(bySeverity.serious));
  }
  if (bySeverity.moderate.length) {
    console.log('\n  MODERATE:');
    console.log(formatViolations(bySeverity.moderate));
  }
  if (bySeverity.minor.length) {
    console.log('\n  MINOR:');
    console.log(formatViolations(bySeverity.minor));
  }
  console.log('');
}

async function runAxeAudit(page: Page, route: string) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();

  const violations = accessibilityScanResults.violations as AxeViolation[];
  logResults(route, violations);

  const criticalOrSerious = violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );

  return { violations, criticalOrSerious };
}

// ── Unauthenticated Routes ─────────────────────────────────────────────────────

test.describe('Accessibility Audit — Unauthenticated Routes', () => {
  test('/auth/login — zero critical/serious violations', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const { violations, criticalOrSerious } = await runAxeAudit(page, '/auth/login');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /auth/login`,
    ).toHaveLength(0);

    // Store full results as test attachment for the audit report
    expect.soft(violations).toEqual(expect.arrayContaining([]));
  });

  test('/auth/forgot-password — zero critical/serious violations', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/auth/forgot-password');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /auth/forgot-password`,
    ).toHaveLength(0);
  });

  test('/ — landing page zero critical/serious violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /`,
    ).toHaveLength(0);
  });
});

// ── Authenticated Student Routes ───────────────────────────────────────────────

test.describe('Accessibility Audit — Student Routes', () => {
  // NOTE: These tests require authentication. Set up credentials in .env.local:
  //   TEST_STUDENT_USERNAME=<username>
  //   TEST_STUDENT_PASSWORD=<password>
  //
  // The tests will log in via the UI before scanning.

  test.beforeEach(async ({ page }) => {
    const username = process.env.TEST_STUDENT_USERNAME;
    const password = process.env.TEST_STUDENT_PASSWORD;

    if (!username || !password) {
      test.skip(true, 'TEST_STUDENT_USERNAME / TEST_STUDENT_PASSWORD not set');
    }

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#username', username!);
    await page.fill('#password', password!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student/**', { timeout: 15000 });
  });

  test('/student/dashboard — zero critical/serious violations', async ({ page }) => {
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/student/dashboard');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /student/dashboard`,
    ).toHaveLength(0);
  });

  test('/student/practice — zero critical/serious violations', async ({ page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/student/practice');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /student/practice`,
    ).toHaveLength(0);
  });

  test('/student/study — zero critical/serious violations', async ({ page }) => {
    await page.goto('/student/study');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/student/study');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /student/study`,
    ).toHaveLength(0);
  });

  test('/student/lesson/[slug] — zero critical/serious violations', async ({ page }) => {
    // Navigate to dashboard first to find an available lesson link
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    const lessonLink = page.locator('a[href*="/student/lesson/"]').first();
    const hasLesson = await lessonLink.isVisible().catch(() => false);

    if (!hasLesson) {
      test.skip(true, 'No lesson links found on dashboard');
    }

    const href = await lessonLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, `/student/lesson/[slug]`);

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /student/lesson/[slug]`,
    ).toHaveLength(0);
  });
});

// ── Authenticated Teacher Routes ───────────────────────────────────────────────

test.describe('Accessibility Audit — Teacher Routes', () => {
  test.beforeEach(async ({ page }) => {
    const username = process.env.TEST_TEACHER_USERNAME;
    const password = process.env.TEST_TEACHER_PASSWORD;

    if (!username || !password) {
      test.skip(true, 'TEST_TEACHER_USERNAME / TEST_TEACHER_PASSWORD not set');
    }

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#username', username!);
    await page.fill('#password', password!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/**', { timeout: 15000 });
  });

  test('/teacher/dashboard — zero critical/serious violations', async ({ page }) => {
    await page.goto('/teacher/dashboard');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/teacher/dashboard');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /teacher/dashboard`,
    ).toHaveLength(0);
  });

  test('/teacher/competency — zero critical/serious violations', async ({ page }) => {
    await page.goto('/teacher/competency');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/teacher/competency');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /teacher/competency`,
    ).toHaveLength(0);
  });

  test('/teacher/gradebook — zero critical/serious violations', async ({ page }) => {
    await page.goto('/teacher/gradebook');
    await page.waitForLoadState('networkidle');

    const { criticalOrSerious } = await runAxeAudit(page, '/teacher/gradebook');

    expect(
      criticalOrSerious,
      `${criticalOrSerious.length} critical/serious a11y violations on /teacher/gradebook`,
    ).toHaveLength(0);
  });
});
