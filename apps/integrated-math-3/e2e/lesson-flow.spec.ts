import { test, expect } from './fixtures';

// Phase 2 SEL keys live inline in this spec file (test code) to keep the
// Red-phase boundary clean. The shared apps/integrated-math-3/e2e/selectors.ts
// is also imported by convex/seed/seed_demo_e2e.ts, and any new file under
// e2e/ is treated as a shared module by the supervisor gate. Inlining here
// keeps the Phase 2 selector contract inside the test files (the .spec.ts
// files ARE test files per the Red-phase boundary).
const SEL_PHASE2_LESSON = {
  lessonRenderer: 'lesson-renderer',
  lessonHeader: 'lesson-header',
  lessonTitle: 'lesson-title',
  phaseStepper: 'phase-stepper',
  phaseStepperDot: 'phase-stepper-dot',
  phaseCompleteButton: 'phase-complete-button',
  phaseCompleteStatus: 'phase-complete-status',
  lessonCompleteScreen: 'lesson-complete-screen',
  lessonCompleteContinueBtn: 'lesson-complete-continue-btn',
} as const;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

test.describe('Phase 2 lesson SEL contract', () => {
  test('every SEL_PHASE2_LESSON value is a non-empty kebab-case token', () => {
    const entries = Object.entries(SEL_PHASE2_LESSON);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `SEL_PHASE2_LESSON.${name} should be a string`).toBe('string');
      expect(
        (value as string).length,
        `SEL_PHASE2_LESSON.${name} should be a non-empty string`,
      ).toBeGreaterThan(0);
      expect(
        KEBAB_CASE_PATTERN.test(value as string),
        `SEL_PHASE2_LESSON.${name} = "${value}" should be kebab-case`,
      ).toBe(true);
    }
  });

  test('SEL_PHASE2_LESSON values are unique', () => {
    const values = Object.values(SEL_PHASE2_LESSON) as string[];
    const unique = new Set(values);
    expect(unique.size, 'duplicate selector values found in SEL_PHASE2_LESSON').toBe(values.length);
  });
});

test.describe('Lesson Flow — Phase 2 Red: full lesson + reload-persistence', () => {
  test('student can open a lesson, complete a phase, and progress persists across reload', async ({ studentPage: page }) => {
    // Strategy §3 (Reload persistence, FR2/AC2): the assertion must read a
    // field written by `completePhaseRequest` → `POST /api/phases/complete`
    // (`apps/integrated-math-3/app/api/phases/complete/route.ts`). The
    // localStorage.length===0 check is also required so a future local-
    // state regression can't masquerade as server persistence.
    //
    // Red: the dashboard heading, lesson renderer, and stepper dots do not
    // yet carry the data-testid attributes that the stable selector contract
    // demands. The spec will fail on the first SEL_PHASE2_LESSON lookup.

    // 1. Land on the dashboard and open the first available lesson.
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="student-dashboard"]`),
    ).toBeVisible();

    const firstLesson = page
      .locator(`[data-testid="student-dashboard-lesson-link"]:not([aria-disabled="true"])`)
      .first();
    await expect(firstLesson).toBeVisible({ timeout: 15_000 });

    const lessonHref = await firstLesson.getAttribute('href');
    expect(lessonHref, 'lesson link must carry an href').toBeTruthy();

    await firstLesson.click();
    await page.waitForURL(/\/student\/lesson\/.+/, { timeout: 15_000 });

    // 2. The lesson renderer + stepper must be visible.
    await expect(
      page.locator(`[data-testid="${SEL_PHASE2_LESSON.lessonRenderer}"]`),
    ).toBeVisible();

    await expect(
      page.locator(`[data-testid="${SEL_PHASE2_LESSON.lessonTitle}"]`),
    ).toBeVisible();

    await expect(
      page.locator(`[data-testid="${SEL_PHASE2_LESSON.phaseStepper}"]`),
    ).toBeVisible();

    // 3. Capture the first phase dot's label so we can verify it stays
    //    completed after reload.
    const firstDot = page
      .locator(`[data-testid="${SEL_PHASE2_LESSON.phaseStepperDot}"]`)
      .first();
    await expect(firstDot).toBeVisible();

    const firstDotAriaLabel = await firstDot.getAttribute('aria-label');
    expect(firstDotAriaLabel, 'first phase dot must have an aria-label').toBeTruthy();

    // 4. Click the phase-complete button. The button starts as "not_started"
    //    and must transition to "completed" (the post-completion label).
    const completeButton = page.locator(
      `[data-testid="${SEL_PHASE2_LESSON.phaseCompleteButton}"]`,
    );
    await expect(completeButton).toBeVisible();
    await expect(completeButton).toBeEnabled();

    await completeButton.click();

    // 5. The completion status region must report the new state. We assert
    //    via the stable selector — not via getByText — so a copy rewrite
    //    cannot silently break the contract.
    const status = page.locator(`[data-testid="${SEL_PHASE2_LESSON.phaseCompleteStatus}"]`);
    await expect(status).toBeVisible({ timeout: 15_000 });
    await expect(status).toHaveAttribute('data-status', /completed|skipped/, {
      timeout: 15_000,
    });

    // 6. Reload and re-assert: the lesson page must re-hydrate from Convex
    //    (not from local state), the phase-complete button must already be
    //    in its post-completion state, and localStorage must be empty for
    //    phase-progress keys.
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.waitForURL(/\/student\/lesson\/.+/, { timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE2_LESSON.lessonRenderer}"]`),
    ).toBeVisible();

    // The completed-phase dot must still be marked completed after reload.
    const firstDotAfter = page
      .locator(`[data-testid="${SEL_PHASE2_LESSON.phaseStepperDot}"]`)
      .first();
    await expect(firstDotAfter).toBeVisible();
    const firstDotAriaLabelAfter = await firstDotAfter.getAttribute('aria-label');
    expect(firstDotAriaLabelAfter).toBe(firstDotAriaLabel);

    // The phase-complete button must NOT be enabled (already completed).
    const completeButtonAfter = page.locator(
      `[data-testid="${SEL_PHASE2_LESSON.phaseCompleteButton}"]`,
    );
    await expect(completeButtonAfter).toBeVisible();
    await expect(completeButtonAfter).toBeDisabled();

    // No localStorage phase-progress key — persistence must be server-side.
    const phaseProgressKeys = await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && /phase|progress|completion/i.test(key)) {
          keys.push(key);
        }
      }
      return keys;
    });
    expect(phaseProgressKeys, 'no localStorage keys for phase progress').toEqual([]);
  });
});
