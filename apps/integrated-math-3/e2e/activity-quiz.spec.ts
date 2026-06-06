import { test, expect } from './fixtures';

// Phase 3 SEL keys live inline in this spec file (test code) to keep the
// Red-phase boundary clean. The shared apps/integrated-math-3/e2e/selectors.ts
// is also imported by convex/seed/seed_demo_e2e.ts, and any new file under
// e2e/ is treated as a shared module by the supervisor gate. Inlining here
// keeps the Phase 3 selector contract inside the test files (the .spec.ts
// files ARE test files per the Red-phase boundary).
const SEL_PHASE3_QUIZ = {
  practiceCardRenderer: 'practice-card-renderer',
  comprehensionQuiz: 'comprehension-quiz',
} as const;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

test.describe('Phase 3 comprehension-quiz SEL contract', () => {
  test('every SEL_PHASE3_QUIZ value is a non-empty kebab-case token', () => {
    const entries = Object.entries(SEL_PHASE3_QUIZ);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `SEL_PHASE3_QUIZ.${name} should be a string`).toBe('string');
      expect(
        (value as string).length,
        `SEL_PHASE3_QUIZ.${name} should be a non-empty string`,
      ).toBeGreaterThan(0);
      expect(
        KEBAB_CASE_PATTERN.test(value as string),
        `SEL_PHASE3_QUIZ.${name} = "${value}" should be kebab-case`,
      ).toBe(true);
    }
  });

  test('SEL_PHASE3_QUIZ values are unique', () => {
    const values = Object.values(SEL_PHASE3_QUIZ) as string[];
    const unique = new Set(values);
    expect(unique.size, 'duplicate selector values found in SEL_PHASE3_QUIZ').toBe(values.length);
  });
});

test.describe('Activity Family — comprehension-quiz', () => {
  // Strategy §5: "Use the activity-family routing in `ActivityRenderer`...
  // to pick representative lessons from the seeded set — do not invent new
  // activity content." The /student/practice queue surfaces activity cards
  // resolved from the seeded srs_cards. The Red contract requires the
  // comprehension-quiz component to expose a stable data-testid (per Strategy
  // §2: "Components must adopt these via `data-testid={SEL.x}`"). The seeded
  // queue includes comprehension-quiz cards (see seed_lesson_*.ts), but the
  // ComprehensionQuiz component does not yet carry `data-testid="comprehension-quiz"`.
  // The spec will fail on the SEL_PHASE3_QUIZ.comprehensionQuiz lookup.
  test('practice session renders the comprehension-quiz activity with a stable data-testid', async ({ studentPage: page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_QUIZ.practiceCardRenderer}"]`),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_QUIZ.comprehensionQuiz}"]`),
    ).toBeVisible({ timeout: 15_000 });
  });
});
