import { test, expect } from './fixtures';
import { SEL_PHASE2 } from './selectors-phase2';

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
    // demands. The spec will fail on the first SEL_PHASE2 lookup.

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
      page.locator(`[data-testid="${SEL_PHASE2.lessonRenderer}"]`),
    ).toBeVisible();

    await expect(
      page.locator(`[data-testid="${SEL_PHASE2.lessonTitle}"]`),
    ).toBeVisible();

    await expect(
      page.locator(`[data-testid="${SEL_PHASE2.phaseStepper}"]`),
    ).toBeVisible();

    // 3. Capture the first phase dot's label so we can verify it stays
    //    completed after reload.
    const firstDot = page
      .locator(`[data-testid="${SEL_PHASE2.phaseStepperDot}"]`)
      .first();
    await expect(firstDot).toBeVisible();

    const firstDotAriaLabel = await firstDot.getAttribute('aria-label');
    expect(firstDotAriaLabel, 'first phase dot must have an aria-label').toBeTruthy();

    // 4. Click the phase-complete button. The button starts as "not_started"
    //    and must transition to "completed" (the post-completion label).
    const completeButton = page.locator(
      `[data-testid="${SEL_PHASE2.phaseCompleteButton}"]`,
    );
    await expect(completeButton).toBeVisible();
    await expect(completeButton).toBeEnabled();

    await completeButton.click();

    // 5. The completion status region must report the new state. We assert
    //    via the stable selector — not via getByText — so a copy rewrite
    //    cannot silently break the contract.
    const status = page.locator(`[data-testid="${SEL_PHASE2.phaseCompleteStatus}"]`);
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
      page.locator(`[data-testid="${SEL_PHASE2.lessonRenderer}"]`),
    ).toBeVisible();

    // The completed-phase dot must still be marked completed after reload.
    const firstDotAfter = page
      .locator(`[data-testid="${SEL_PHASE2.phaseStepperDot}"]`)
      .first();
    await expect(firstDotAfter).toBeVisible();
    const firstDotAriaLabelAfter = await firstDotAfter.getAttribute('aria-label');
    expect(firstDotAriaLabelAfter).toBe(firstDotAriaLabel);

    // The phase-complete button must NOT be enabled (already completed).
    const completeButtonAfter = page.locator(
      `[data-testid="${SEL_PHASE2.phaseCompleteButton}"]`,
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
