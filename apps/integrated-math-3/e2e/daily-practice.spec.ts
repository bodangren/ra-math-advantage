import { test, expect } from './fixtures';

// Phase 3 SEL keys live inline in this spec file (test code) to keep the
// Red-phase boundary clean. The shared apps/integrated-math-3/e2e/selectors.ts
// is also imported by convex/seed/seed_demo_e2e.ts, and any new file under
// e2e/ is treated as a shared module by the supervisor gate. Inlining here
// keeps the Phase 3 selector contract inside the test files (the .spec.ts
// files ARE test files per the Red-phase boundary).
const SEL_PHASE3_DAILY_PRACTICE = {
  practiceCardRenderer: 'practice-card-renderer',
  cardCounter: 'card-counter',
  submissionFeedback: 'submission-feedback',
  completionCheck: 'completion-check',
  dailyPracticeCard: 'daily-practice-card',
  streakValue: 'streak-value',
} as const;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

test.describe('Phase 3 daily-practice SEL contract', () => {
  test('every SEL_PHASE3_DAILY_PRACTICE value is a non-empty kebab-case token', () => {
    const entries = Object.entries(SEL_PHASE3_DAILY_PRACTICE);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `SEL_PHASE3_DAILY_PRACTICE.${name} should be a string`).toBe('string');
      expect(
        (value as string).length,
        `SEL_PHASE3_DAILY_PRACTICE.${name} should be a non-empty string`,
      ).toBeGreaterThan(0);
      expect(
        KEBAB_CASE_PATTERN.test(value as string),
        `SEL_PHASE3_DAILY_PRACTICE.${name} = "${value}" should be kebab-case`,
      ).toBe(true);
    }
  });

  test('SEL_PHASE3_DAILY_PRACTICE values are unique', () => {
    const values = Object.values(SEL_PHASE3_DAILY_PRACTICE) as string[];
    const unique = new Set(values);
    expect(unique.size, 'duplicate selector values found in SEL_PHASE3_DAILY_PRACTICE').toBe(values.length);
  });
});

test.describe('Daily Practice — Phase 3 Red: session submission + streak = 1', () => {
  // Strategy §5: "Daily-practice spec submits exactly 3 cards and asserts
  // streak = 1." Strategy §3 (Daily-practice streak, FR4): `calculateStreak`
  // (apps/integrated-math-3/convex/srs/dashboard.ts) reads completion
  // timestamps; the seed must fix Date.now window OR seed completions with
  // explicit timestamps so streak count is deterministic.
  //
  // Red contract:
  //  1. The practice session must expose a stable submit affordance per
  //     card. The current activity components have no `data-testid` on the
  //     submit button, so the click below cannot target a stable selector.
  //  2. After 3 submissions the completion screen must surface the
  //     completion-check testid, and the dashboard's DailyPracticeCard must
  //     render the streak-value testid as "1".
  // The spec fails on the first card's submit-button click (or, if the
  // click somehow lands, on the completion-check visibility).
  test('student submits 3 daily-practice cards and the dashboard streak is 1', async ({ studentPage: page }) => {
    // 1. Open the daily-practice page and wait for the session to load.
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.cardCounter}"]`),
    ).toBeVisible({ timeout: 15_000 });

    // 2. Submit exactly 3 cards. Each iteration waits for the card-counter
    //    to advance, then clicks the stable submit affordance inside the
    //    current card. The submit button is targeted via the submission-feedback
    //    testid (the component that appears after submit), but the button
    //    itself must adopt a stable data-testid for this to be reliable.
    for (let i = 0; i < 3; i++) {
      await expect(
        page.locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.practiceCardRenderer}"]`),
      ).toBeVisible({ timeout: 15_000 });

      // The practice session advances cards after the submission feedback
      // timeout (FEEDBACK_DELAY_MS = 2000). Submit the current card by
      // clicking the only button inside the practice-card-renderer — the
      // activity components are responsible for rendering their own
      // submit button. Once components adopt a stable data-testid the
      // selector below can be tightened to a family-specific testid.
      const submitButton = page
        .locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.practiceCardRenderer}"] button[type="submit"]`)
        .first();
      await expect(submitButton, `card ${i + 1} must expose a stable submit button`).toBeVisible({
        timeout: 15_000,
      });
      await submitButton.click();

      // Wait for the submission feedback to surface — it appears for 2s
      // before the card advances.
      await expect(
        page.locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.submissionFeedback}"]`),
      ).toBeVisible({ timeout: 10_000 });
    }

    // 3. After 3 submissions the session must reach its completion screen.
    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.completionCheck}"]`),
    ).toBeVisible({ timeout: 20_000 });

    // 4. The dashboard's DailyPracticeCard must report the new streak.
    await page.goto('/student/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.dailyPracticeCard}"]`),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_DAILY_PRACTICE.streakValue}"]`),
    ).toHaveText('1', { timeout: 15_000 });
  });
});
