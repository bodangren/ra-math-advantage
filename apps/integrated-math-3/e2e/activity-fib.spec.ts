import { test, expect } from './fixtures';

// Phase 3 SEL keys live inline in this spec file (test code) to keep the
// Red-phase boundary clean. The shared apps/integrated-math-3/e2e/selectors.ts
// is also imported by convex/seed/seed_demo_e2e.ts, and any new file under
// e2e/ is treated as a shared module by the supervisor gate. Inlining here
// keeps the Phase 3 selector contract inside the test files (the .spec.ts
// files ARE test files per the Red-phase boundary).
const SEL_PHASE3_FIB = {
  practiceCardRenderer: 'practice-card-renderer',
  fillInTheBlank: 'fill-in-the-blank',
} as const;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

test.describe('Phase 3 fill-in-the-blank SEL contract', () => {
  test('every SEL_PHASE3_FIB value is a non-empty kebab-case token', () => {
    const entries = Object.entries(SEL_PHASE3_FIB);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `SEL_PHASE3_FIB.${name} should be a string`).toBe('string');
      expect(
        (value as string).length,
        `SEL_PHASE3_FIB.${name} should be a non-empty string`,
      ).toBeGreaterThan(0);
      expect(
        KEBAB_CASE_PATTERN.test(value as string),
        `SEL_PHASE3_FIB.${name} = "${value}" should be kebab-case`,
      ).toBe(true);
    }
  });

  test('SEL_PHASE3_FIB values are unique', () => {
    const values = Object.values(SEL_PHASE3_FIB) as string[];
    const unique = new Set(values);
    expect(unique.size, 'duplicate selector values found in SEL_PHASE3_FIB').toBe(values.length);
  });
});

test.describe('Activity Family — fill-in-the-blank', () => {
  // Strategy §5: "do not invent new activity content" — the IM3 curriculum
  // does not currently seed fill-in-the-blank activities in any lesson, so
  // the practice queue resolved by seedDemoE2E will not surface a FIB card
  // for the seeded student. The Red contract still requires the
  // fill-in-the-blank component to expose a stable data-testid (per Strategy
  // §2: "Components must adopt these via `data-testid={SEL.x}`"). The spec
  // will fail because the FIB component does not yet carry the testid AND
  // because the practice queue does not yet include a FIB card. The
  // implementation phase must (a) add `data-testid="fill-in-the-blank"` to
  // the component and (b) ensure at least one FIB card is seeded for the
  // demo student so the practice queue surfaces it.
  test('practice session renders the fill-in-the-blank activity with a stable data-testid', async ({ studentPage: page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_FIB.practiceCardRenderer}"]`),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE3_FIB.fillInTheBlank}"]`),
    ).toBeVisible({ timeout: 15_000 });
  });
});
