# WCAG 2.1 AA Accessibility Audit Report

**App:** Integrated Math 3 (`apps/integrated-math-3`)
**Date:** <!-- fill after first run -->
**Auditor:** Automated (axe-core v4.x + Playwright)
**Standard:** WCAG 2.1 Level AA

---

## Executive Summary

<!-- One paragraph: pass/fail status, total violations found, overall risk level. -->

## Routes Audited

| Route | Status | Critical | Serious | Moderate | Minor |
|-------|--------|----------|---------|----------|-------|
| `/` (landing) | | | | | |
| `/auth/login` | | | | | |
| `/auth/forgot-password` | | | | | |
| `/student/dashboard` | | | | | |
| `/student/practice` | | | | | |
| `/student/study` | | | | | |
| `/student/lesson/[slug]` | | | | | |
| `/teacher/dashboard` | | | | | |
| `/teacher/competency` | | | | | |
| `/teacher/gradebook` | | | | | |

## Violations by Severity

### Critical (must fix immediately)

<!-- axe rule ID | description | affected routes | # nodes -->

### Serious (fix before release)

<!-- axe rule ID | description | affected routes | # nodes -->

### Moderate (fix in next iteration)

<!-- axe rule ID | description | affected routes | # nodes -->

### Minor (nice to have)

<!-- axe rule ID | description | affected routes | # nodes -->

---

## Common Violation Types Expected

Based on codebase analysis, these violations are likely:

| axe Rule | Category | Expected Cause | Priority |
|----------|----------|---------------|----------|
| `color-contrast` | Color | oklch palette may have contrast gaps in muted text, badge colors | **Critical** |
| `label` | Forms | Activity component inputs may lack associated labels | **Serious** |
| `link-name` | Links | Icon-only links without text alternatives | **Serious** |
| `image-alt` | Images | SVG lock icons, decorative images without alt | **Serious** |
| `button-name` | Buttons | Icon-only buttons (Lucide icons) without aria-label | **Serious** |
| `aria-required-attr` | ARIA | Custom widgets missing required ARIA attributes | **Serious** |
| `keyboard` | Keyboard | GraphingCanvas click-only interactions, drag-and-drop activities | **Critical** |
| `focus-order-semantics` | Focus | Tab order may skip interactive elements in activity panels | **Moderate** |
| `region` | Structure | Missing landmark roles on page sections | **Moderate** |
| `heading-order` | Structure | Heading level jumps (h1 → h3) in lesson layouts | **Minor** |

## Current A11y Coverage (pre-audit)

### Existing ARIA Patterns Found

The codebase has **moderate** existing accessibility coverage:

| Pattern | Count | Locations |
|---------|-------|-----------|
| `aria-label` | ~30+ | Navigation, progress bars, lesson phases, buttons, cards |
| `aria-hidden` | ~25+ | Decorative Lucide icons across teacher/student panels |
| `role="progressbar"` | 5 | LessonPageLayout, StudentRow, ProgressCard, CardProgressBar, UnitProgressCard |
| `role="status"` | 1 | SubmissionFeedback |
| `role="alert"` | 1 | PhaseCompleteButton error state |
| `role="tooltip"` | 1 | VocabularyHighlight |
| `aria-valuenow/min/max` | ~5 sets | Progress bars in dashboard and lesson views |
| `aria-expanded` | 2 | VocabularyHighlight, DiscoursePrompt |
| `aria-pressed` | 1 | PhaseCompleteButton |
| `aria-current="step"` | 1 | LessonStepper |
| `aria-live="polite"` | 1 | SubmissionFeedback |
| `tabIndex` | 2 | VocabularyHighlight, StrugglingStudentsPanel |
| `alt` attributes | 2 | PhaseRenderer images, landing page logo |
| `<label htmlFor>` | 2 | Login page username/password inputs |

### Gaps Identified

- **No skip-to-content link** — keyboard users must tab through full header/nav
- **No `aria-current="page"`** on active navigation items (StudentNavigation, TeacherNavigation)
- **Minimal `aria-live` regions** — only 1 found; phase transitions, chatbot responses, and loading states lack live announcements
- **Limited `alt` text** — only 2 instances found across the entire app
- **Few `tabIndex` usages** — custom interactive elements (VocabularyHighlight, StrugglingStudentsPanel) are the only ones with explicit tab management
- **No `role="navigation"` on nav elements** — relies on `<nav>` semantic tag (which is fine, but needs verification)
- **Activity components** (`@math-platform/activity-components`) — a11y status unknown; needs audit when tests run against live routes

## Remediation Priority Guide

### Priority 1 — Critical (Blocks Users)
1. **Keyboard navigation** for all interactive elements (activities, graphs, sliders)
2. **Color contrast** failures in body text and UI components
3. **Missing form labels** on activity inputs

### Priority 2 — Serious (Significant Barrier)
1. **Icon-only buttons/links** — add `aria-label` to all Lucide icon buttons
2. **Image alt text** — add meaningful alt to all `<img>` and SVG icons
3. **Skip-to-content link** — add to both student and teacher layouts
4. **Live regions** — add `aria-live` to chatbot, phase transitions, loading states

### Priority 3 — Moderate (Usability Issue)
1. **Heading hierarchy** — ensure logical h1→h2→h3 nesting
2. **Landmark regions** — add `role` or semantic tags for page sections
3. **Focus management** — trap focus in modals, restore on close

### Priority 4 — Minor (Polish)
1. **Heading order** consistency across lesson phases
2. **`aria-current="page"`** on active nav items
3. **Descriptive link text** — replace "click here" / "→" with meaningful labels

---

## Running the Audit

```bash
# From apps/integrated-math-3/

# 1. Install dependencies (first time)
npm install

# 2. Ensure .env.local has test credentials
#    TEST_STUDENT_USERNAME=...
#    TEST_STUDENT_PASSWORD=...
#    TEST_TEACHER_USERNAME=...
#    TEST_TEACHER_PASSWORD=...

# 3. Run the full audit
npm run test:a11y

# 4. Run with Playwright UI (interactive)
npm run test:a11y:ui

# 5. Results are also written to e2e/a11y-results.json
```

## Next Steps

- [ ] Run `npm run test:a11y` against live dev server to populate this report
- [ ] Move to Phase 2: Keyboard Navigation Fixes
- [ ] Move to Phase 3: Screen Reader & ARIA Fixes
- [ ] Move to Phase 4: Color & Visual Fixes
- [ ] Move to Phase 5: Verification & Documentation
