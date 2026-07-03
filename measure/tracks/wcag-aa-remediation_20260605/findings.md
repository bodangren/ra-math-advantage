# WCAG 2.1 AA Remediation Findings

**Track:** `wcag-aa-remediation_20260605`  
**Phase:** 1 — Triage & Gate Harness  
**Source:** Code inspection of `apps/integrated-math-3/` + seeded expected-violations table from `measure/archive/accessibility-audit_20260502/audit-report.md`.  
**Scope:** Student- and teacher-facing routes plus shared activity components consumed by IM3.

---

## Severity Summary

- **Critical:** 2
- **Serious:** 5
- **Moderate:** 3
- **Minor:** 1

---

## Critical (must fix immediately)

| ID | Surface | File | Success Criterion | axe Rule | Evidence |
|----|---------|------|-------------------|----------|----------|
| C1 | Login submit button | `apps/integrated-math-3/app/auth/login/page.tsx` | 1.4.3 Contrast (Minimum) | `color-contrast` | Inline `style={{ backgroundColor: 'oklch(0.46 0.18 264)' }}` on the submit button (line 91) bypasses the design-system token `bg-primary`; the oklch value has not been verified against `background` for a 4.5:1 ratio. |
| C2 | Phase evidence accordion | `apps/integrated-math-3/components/teacher/gradebook/SubmissionDetailModal.tsx` | 2.1.1 Keyboard | `keyboard` | Phase header is a `<div>` with `cursor-pointer` and `onClick` (line 141-178); it has no `tabIndex`, no `role="button"`, and no `onKeyDown` handler, so it is unreachable by keyboard. |

---

## Serious (fix before release)

| ID | Surface | File | Success Criterion | axe Rule | Evidence |
|----|---------|------|-------------------|----------|----------|
| S1 | Speed-round answer feedback | `apps/integrated-math-3/components/student/SpeedRoundGame.tsx` | 1.4.1 Use of Color, 4.1.2 Name, Role, Value | `color-contrast`, `aria-required-attr` | Feedback is rendered only as a green/red `✓`/`✗` glyph (lines 267-275) with no `aria-live` region and no text alternative; state is conveyed by color alone. |
| S2 | Matching game card state | `apps/integrated-math-3/components/student/MatchingGame.tsx` | 1.4.1 Use of Color | `color-contrast` | Matched/wrong/selected states use only background/border color classes (lines 175-181); no `aria-pressed`, no `aria-label`, and no visible text distinguishes the state. |
| S3 | Gradebook mastery cells | `apps/integrated-math-3/components/teacher/gradebook/GradebookGrid.tsx` | 1.4.1 Use of Color | `color-contrast` | Cell background is set by `cellBgClass(cell.color)` (line 91) while the visible text is only the percentage or `—`; the color category (e.g., "approaching") is not exposed as text or `aria-label`. |
| S4 | Competency heatmap cells | `apps/integrated-math-3/components/teacher/CompetencyHeatmapGrid.tsx` | 1.4.1 Use of Color | `color-contrast` | Heatmap cells rely on a color scale to indicate mastery level; the underlying value must be exposed in an `aria-label` or visible label. |
| S5 | Active navigation indicator | `apps/integrated-math-3/components/student/StudentNavigation.tsx`, `apps/integrated-math-3/components/teacher/TeacherNavigation.tsx` | 1.3.1 Info and Relationships | `aria-required-attr` | Active route is styled with visual state but lacks `aria-current="page"` on the active nav link. Code-inspection reference: `StudentNavigation.tsx` line 39 `aria-label="Student navigation"` only. |

---

## Moderate (fix in next iteration)

| ID | Surface | File | Success Criterion | axe Rule | Evidence |
|----|---------|------|-------------------|----------|----------|
| M1 | Skip-to-content link | `apps/integrated-math-3/components/textbook/LessonPageLayout.tsx` | 2.4.1 Bypass Blocks | `bypass` (Playwright) | No `<a href="#main">` skip link is rendered as the first focusable element in the lesson layout; keyboard users must tab through the top navigation. |
| M2 | Main landmark | `apps/integrated-math-3/app/student/dashboard/page.tsx`, `apps/integrated-math-3/app/teacher/dashboard/page.tsx` | 1.3.1 Info and Relationships | `region` | Page content is wrapped in generic `<div>` containers rather than `<main>` or `role="main"`; no `id="main"` target exists for a skip link. |
| M3 | Heading hierarchy | `apps/integrated-math-3/components/lesson/LessonStepper.tsx`, `apps/integrated-math-3/components/textbook/LessonPageLayout.tsx` | 1.3.1 Info and Relationships | `heading-order` | Lesson phase headings may jump from `h1` to `h3` or lower without an intermediate `h2`; the stepper uses `nav` but does not guarantee sequential heading levels. |

---

## Minor (polish)

| ID | Surface | File | Success Criterion | axe Rule | Evidence |
|----|---------|------|-------------------|----------|----------|
| N1 | Decorative SVG icons | `apps/integrated-math-3/components/teacher/gradebook/SubmissionDetailModal.tsx` | 1.1.1 Non-text Content | `image-alt` | The expand/collapse chevron SVG (lines 168-176) is decorative but lacks `aria-hidden="true"` and has no `role="img"` or `aria-label`; while contextually understandable, it should be marked decorative. |

---

## Code-Inspection Evidence

The findings above are derived from direct code inspection, not a live axe scan. Representative lines inspected:

- `apps/integrated-math-3/app/auth/login/page.tsx:91` — inline oklch background.
- `apps/integrated-math-3/components/teacher/gradebook/SubmissionDetailModal.tsx:141-178` — clickable `<div>` phase header.
- `apps/integrated-math-3/components/student/SpeedRoundGame.tsx:267-275` — color-only feedback glyph.
- `apps/integrated-math-3/components/student/MatchingGame.tsx:167-185` — color-only card states.
- `apps/integrated-math-3/components/teacher/gradebook/GradebookGrid.tsx:91` — `cellBgClass(cell.color)` color-only mastery signal.
- `apps/integrated-math-3/components/teacher/CompetencyHeatmapGrid.tsx` — heatmap color scale.
- `apps/integrated-math-3/components/student/StudentNavigation.tsx:39` — no `aria-current="page"`.
- `apps/integrated-math-3/components/textbook/LessonPageLayout.tsx` — no skip link, no `<main>` landmark.

## Remediation Priority

1. Fix Critical C1/C2 first (contrast regression risk + keyboard blocker).
2. Fix Serious S1-S5 next (color-only meaning and missing active-route semantics).
3. Fix Moderate M1-M3 (skip link, landmarks, headings) after serious items.
4. Address Minor N1 during the same pass as the modal fixes.
