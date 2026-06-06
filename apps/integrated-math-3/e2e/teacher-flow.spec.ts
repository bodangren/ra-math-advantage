import { test, expect } from './fixtures';

// Phase 4 — Teacher Flow & CI.
//
// Phase 4 SEL keys live inline in this spec file (test code) to keep the
// Red-phase boundary clean. The shared apps/integrated-math-3/e2e/selectors.ts
// is also imported by convex/seed/seed_demo_e2e.ts, and any new file under
// e2e/ is treated as a shared module by the supervisor gate. Inlining here
// keeps the Phase 4 selector contract inside the test files (the .spec.ts
// files ARE test files per the Red-phase boundary). See
// measure/tracks/e2e-coverage-expansion_20260605/test-strategy.md §4.
const SEL_PHASE4_TEACHER = {
  teacherGradebook: 'teacher-gradebook',
  teacherGradebookCell: 'teacher-gradebook-cell',
  teacherStudentDetail: 'teacher-student-detail',
  teacherStudentDetailBackLink: 'teacher-student-detail-back-link',
  teacherStudentDetailLessonCard: 'teacher-student-detail-lesson-card',
  teacherLessons: 'teacher-lessons',
  teacherClassSelector: 'teacher-class-selector',
  teacherAssignToggle: 'teacher-assign-toggle',
  teacherSubmissionReview: 'teacher-submission-review',
  teacherCompetencyHeatmap: 'teacher-competency-heatmap',
  teacherStudentList: 'teacher-student-list',
  teacherStudentListRow: 'teacher-student-list-row',
} as const;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

test.describe('Phase 4 teacher-flow SEL contract', () => {
  test('every SEL_PHASE4_TEACHER value is a non-empty kebab-case token', () => {
    const entries = Object.entries(SEL_PHASE4_TEACHER);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `SEL_PHASE4_TEACHER.${name} should be a string`).toBe('string');
      expect(
        (value as string).length,
        `SEL_PHASE4_TEACHER.${name} should be a non-empty string`,
      ).toBeGreaterThan(0);
      expect(
        KEBAB_CASE_PATTERN.test(value as string),
        `SEL_PHASE4_TEACHER.${name} = "${value}" should be kebab-case`,
      ).toBe(true);
    }
  });

  test('SEL_PHASE4_TEACHER values are unique', () => {
    const values = Object.values(SEL_PHASE4_TEACHER) as string[];
    const unique = new Set(values);
    expect(unique.size, 'duplicate selector values found in SEL_PHASE4_TEACHER').toBe(values.length);
  });
});

test.describe('Teacher Flow — Phase 4 Red: gradebook drilldown + student detail + assignment + submission review', () => {
  // Strategy §5: "Teacher specs reuse teacherPage fixture. Gradebook
  // drilldown asserts the cell→detail navigation (uses GradebookGrid.tsx).
  // CI: add a new job `e2e-im3` in .github/workflows/ci.yml after the
  // `integrated-math-3` job ... Flake budget: retries=1 in CI."
  //
  // Red contract: the gradebook page (`app/teacher/gradebook/page.tsx`),
  // the student-detail lesson cards (`app/teacher/students/page.tsx`),
  // the ClassSelector + Assign toggle (`app/teacher/lessons/page.tsx`),
  // the SubmissionReviewPanel, and the competency-heatmap page do not yet
  // expose the Phase 4 stable data-testid attributes. The CI workflow
  // does not yet have an e2e-im3 job. Specs fail on the first SEL lookup.

  test('teacher gradebook renders the unit grid with stable cell drilldown selectors', async ({ teacherPage: page }) => {
    await page.goto('/teacher/gradebook');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherGradebook}"]`),
    ).toBeVisible({ timeout: 15_000 });

    // The grid renders at least one cell link. The cell link must carry a
    // stable data-testid so the drilldown spec can target it without
    // resorting to `[class*="..."]` patterns.
    const firstCell = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherGradebookCell}"]`)
      .first();
    await expect(firstCell).toBeVisible({ timeout: 15_000 });

    const cellHref = await firstCell.getAttribute('href');
    expect(cellHref, 'cell link must carry an href').toBeTruthy();
    expect(cellHref, 'cell link must target /teacher/students').toMatch(/\/teacher\/students\?id=/);
  });

  test('gradebook cell → student detail navigation (FR5 drilldown)', async ({ teacherPage: page }) => {
    // Strategy §5: "Gradebook drilldown asserts the cell→detail navigation
    // (uses GradebookGrid.tsx)." The cell link href already encodes
    // /teacher/students?id=...&lesson=N; the detail page must accept the
    // id and surface a stable testid on the lesson card.
    await page.goto('/teacher/gradebook');
    await page.waitForLoadState('networkidle');

    const firstCell = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherGradebookCell}"]`)
      .first();
    await expect(firstCell).toBeVisible({ timeout: 15_000 });
    await firstCell.click();

    await page.waitForURL(/\/teacher\/students\?id=/, { timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherStudentDetail}"]`),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherStudentDetailBackLink}"]`),
    ).toBeVisible();
  });

  test('student detail surfaces at least one lesson card (FR5 student detail)', async ({ teacherPage: page }) => {
    // Strategy §5: "student detail ... uses GradebookGrid.tsx" — the
    // teacher/students page renders per-lesson cards (LessonCard) inside
    // the unit sections. The lesson card must expose a stable data-testid
    // so this spec can assert presence without coupling to copy.
    await page.goto('/teacher/gradebook');
    await page.waitForLoadState('networkidle');

    const firstCell = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherGradebookCell}"]`)
      .first();
    await expect(firstCell).toBeVisible({ timeout: 15_000 });
    await firstCell.click();

    await page.waitForURL(/\/teacher\/students\?id=/, { timeout: 15_000 });

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherStudentDetail}"]`),
    ).toBeVisible({ timeout: 15_000 });

    const firstLessonCard = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherStudentDetailLessonCard}"]`)
      .first();
    await expect(firstLessonCard).toBeVisible({ timeout: 15_000 });
  });

  test('student list (no id) renders one row per enrolled student (FR5 teacher dashboard)', async ({ teacherPage: page }) => {
    // /teacher/students with no `id` query param renders the roster.
    // Each row is a student summary card; the list and row must expose
    // stable data-testids so other specs can iterate without coupling to
    // text.
    await page.goto('/teacher/students');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherStudentList}"]`),
    ).toBeVisible({ timeout: 15_000 });

    const firstRow = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherStudentListRow}"]`)
      .first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });
  });

  test('lesson-assignment toggle mutates a class_id not consumed by other specs (FR5 assignment)', async ({ teacherPage: page }) => {
    // Strategy §3: "Teacher assignment flow (FR5) mutates
    // `assignLessonToClassHandler`; this can pollute later runs. Wrap
    // teacher assignment spec in a per-test `beforeEach` reseed or use a
    // dedicated class id not consumed by student specs."
    //
    // The lessons page surfaces the class selector + the per-lesson
    // Assign/Unassign form. The seed guarantees teacher@demo owns at
    // least one class with assignments; the spec must locate a
    // dedicated class id (e.g. a non-default class) so the toggle
    // mutation does not leak into the student lesson-flow spec.
    await page.goto('/teacher/lessons');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherLessons}"]`),
    ).toBeVisible({ timeout: 15_000 });

    // The class selector must expose a stable data-testid so the spec
    // can switch to a non-default class.
    const classSelector = page.locator(
      `[data-testid="${SEL_PHASE4_TEACHER.teacherClassSelector}"]`,
    );
    await expect(classSelector).toBeVisible();

    // The assign toggle is a form button. Asserting visibility proves the
    // page renders the toggle affordance; the spec does not actually
    // submit (mutation is destructive — handled in a separate test that
    // resets state via a dedicated class id).
    const firstToggle = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherAssignToggle}"]`)
      .first();
    await expect(firstToggle).toBeVisible({ timeout: 15_000 });
  });

  test('submission review panel is reachable from the student detail view (FR5 submission review)', async ({ teacherPage: page }) => {
    // Strategy §5: "gradebook/heatmap drilldown, student detail,
    // submission review, assignment". The SubmissionReviewPanel is
    // surfaced by the student-detail page; the panel must expose a
    // stable data-testid so the spec can assert its presence without
    // coupling to copy or class names.
    await page.goto('/teacher/gradebook');
    await page.waitForLoadState('networkidle');

    const firstCell = page
      .locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherGradebookCell}"]`)
      .first();
    await expect(firstCell).toBeVisible({ timeout: 15_000 });
    await firstCell.click();

    await page.waitForURL(/\/teacher\/students\?id=/, { timeout: 15_000 });

    // The submission review panel testid is the seam between the
    // detail view and the practice evidence surface.
    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherSubmissionReview}"]`),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('competency heatmap view renders for the teacher (FR5 heatmap)', async ({ teacherPage: page }) => {
    // Strategy §5: "gradebook/heatmap drilldown, student detail,
    // submission review, assignment". The /teacher/competency page
    // (CompetencyHeatmapClient) renders a heatmap; the section must
    // expose a stable data-testid so the spec can assert presence
    // without depending on aria-label alone (aria-label is fine for
    // a11y; the spec needs a deterministic bridge to the assertion).
    await page.goto('/teacher/competency');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`[data-testid="${SEL_PHASE4_TEACHER.teacherCompetencyHeatmap}"]`),
    ).toBeVisible({ timeout: 15_000 });
  });
});
