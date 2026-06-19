# Responsive / Mobile Audit Baseline

> Track: `responsive-mobile-audit_20260605`
> App: Integrated Math 3
> Phase 1 deliverable — FR1 / AC1
> Viewports: phone 390×844, tablet 768×1024, desktop 1280×800
> Representative routes: student/dashboard, student/lesson, student/activity, teacher/gradebook, teacher/heatmap, teacher/dashboard

---

## Prioritized Failures

| # | Route | Breakpoint | Issue | Severity |
|---|-------|-----------|-------|----------|
| 1 | teacher/gradebook | phone 390×844 | GradebookGrid relies on `overflow-x-auto` with no visual indicator (gradient fade, scroll hint) that additional columns exist. Teachers on phone cannot see lesson-precision scores without discovering horizontal scroll. | **critical** |
| 2 | teacher/gradebook | tablet 768×1024 | GradebookGrid column headers use `truncate max-w-20` — lesson titles aggressively truncated, making it impossible to identify columns without tooltips. | high |
| 3 | teacher/heatmap | phone 390×844 | CompetencyHeatmapGrid uses the same `overflow-x-auto` pattern as GradebookGrid with no scroll affordance. The matrix of student × standard becomes a single-column scroll without orientation cues. | **critical** |
| 4 | teacher/heatmap | tablet 768×1024 | CompetencyHeatmapGrid's sortable headers and cell density exceed comfortable touch targets. Row toggles and column sort controls are < 36px on tablet, below WCAG 44×44 recommendation. | high |
| 5 | teacher/dashboard | phone 390×844 | Teacher dashboard student table hides Progress (`hidden md:table-cell`) and Current Lesson (`hidden lg:table-cell`) columns with no card or list fallback. Teachers on phone lose progress bars and last-active timestamps entirely. | **critical** |
| 6 | teacher/dashboard | tablet 768×1024 | Current Lesson column hidden below 1024px; tablets in portrait (768) already lose this data. No responsive alternative presentation. | high |
| 7 | student/dashboard | phone 390×844 | Dashboard stats grid (`grid-cols-2 md:grid-cols-4`) stacks to 2-column at phone but cards have no max-width constraint. StatsSummary cards may stretch unpredictably on 390px width. | medium |
| 8 | student/lesson | phone 390×844 | LessonPageLayout off-canvas sidebar (`z-40`) competes with global header (`z-50`), sticky progress bar (`z-50`), and section navigation toggle (`z-50`). Opening the lesson phase sidebar while section nav is open produces z-index conflicts. | high |
| 9 | student/lesson | phone 390×844 | LessonStepper mobile horizontal scroll (`overflow-x-auto`) with no scroll hint or active-phase centering. Users on phone must manually scroll to find the current phase, which may be off-screen. | high |
| 10 | student/lesson | tablet 768×1024 | VideoPlayer iframe has no responsive width constraint; may overflow the content column on narrow tablet layouts when sidebar is open. | medium |
| 11 | student/activity | phone 390×844 | GraphingCanvas (via `packages/activity-components`) has no `touch-action` handling, no `pointer: coarse` media query, and no pan/zoom. Placing points precisely on touch screens causes unintended page scrolling. | **critical** |
| 12 | student/activity | phone 390×844 | GraphingCanvas SVG `minHeight: '400px'` occupies nearly half of a 844px viewport, leaving insufficient space for controls and input panels below. Tick labels use fixed `11px`/`12px` font sizes that do not scale with viewport. | high |
| 13 | student/activity | tablet 768×1024 | Quiz/activity submit buttons and interactive controls lack minimum touch target sizing (`min-h-[44px]`/`min-w-[44px]`). LessonStepper mobile buttons are `h-9 w-9` (36px), below WCAG 2.1 AA recommendation. | medium |
| 14 | teacher/gradebook | desktop 1280×800 | SubmissionDetailModal has no responsive width cap; may stretch to full viewport on narrow desktop windows. | low |
| 15 | teacher/dashboard | desktop 1280×800 | SRS dashboard metrics and charts use fixed `h-64`/`h-80` chart heights that do not adapt to available viewport height; teacher must scroll past multiple tall charts. | low |
| 16 | student/dashboard | tablet 768×1024 | MatchingGame 3-column grid (`grid-cols-[repeat(3,minmax(0,180px))]`) uses fixed 180px column size; does not reflow to 2-column on narrower tablets, potentially causing overflow or truncation. | medium |
| 17 | student/dashboard | phone 390×844 | DailyPracticeCard and LessonCard text truncation limits information density on phone; no expand/collapse pattern to reveal truncated content. | low |
| 18 | student/lesson | desktop 1280×800 | MarkdownRenderer table content has no `overflow-x-auto` wrapper; wide KaTeX expressions in tables may overflow the content column. | low |
| 19 | teacher/heatmap | desktop 1280×800 | StudentCompetencyDetailGrid loads all student competencies in a single wide table; no pagination, filtering, or responsive collapse. On large classes this produces a massive grid that requires both vertical and horizontal scroll. | medium |
| 20 | student/lesson | phone 390×844 | PhaseCompleteButton and LessonCompleteScreen use fixed large typography (`text-4xl`/`text-5xl`) that does not scale down on phone, causing awkward wrapping and excessive vertical space consumption. | low |

---

## Summary

| Severity | Count | Routes Affected |
|----------|-------|-----------------|
| **critical** | 4 | teacher/gradebook, teacher/heatmap, teacher/dashboard, student/activity |
| high | 6 | teacher/gradebook, teacher/heatmap, teacher/dashboard, student/lesson, student/activity |
| medium | 5 | student/dashboard, student/lesson, student/activity, teacher/heatmap |
| low | 5 | teacher/gradebook, teacher/dashboard, student/dashboard, student/lesson |

**Highest-priority remediation targets (Phase 2):**
1. GraphingCanvas touch/pointer handling (student/activity) — **critical**
2. Teacher data tables with hidden scroll indicators (teacher/gradebook, teacher/heatmap) — **critical**
3. Teacher dashboard progressive column hiding without fallback (teacher/dashboard) — **critical**
4. Z-index stacking in LessonPageLayout (student/lesson) — **high**
5. LessonStepper mobile scroll UX (student/lesson) — **high**
6. Touch target sizing across interactive controls — **high**
