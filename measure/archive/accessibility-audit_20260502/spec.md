# Spec: WCAG 2.1 AA Accessibility Audit & Remediation

## Problem

IM3 and BM2 apps target real classroom use but have never undergone a systematic accessibility audit. Students with disabilities (visual, motor, cognitive) may be unable to use core learning flows. This is both a legal compliance risk (Section 508, ADA) and a classroom blocker.

## Scope

Audit and remediate all student-facing and teacher-facing routes in `apps/integrated-math-3/` and `apps/bus-math-v2/` against WCAG 2.1 AA.

## Key Areas

1. **Keyboard Navigation**: All interactive elements (activities, graphs, sliders, buttons) must be keyboard-accessible with visible focus indicators
2. **Screen Reader Support**: ARIA labels, live regions for dynamic content, semantic HTML for lesson phases and activity states
3. **Color Contrast**: Verify oklch color system meets 4.5:1 minimum for text, 3:1 for large text and UI components
4. **Activity Components**: GraphingCanvas click/tap interactions, StepByStepper, drag-and-drop activities — all need keyboard alternatives
5. **Form Inputs**: Auth forms, chatbot input, search — labels, error announcements, required field indicators
6. **Responsive Text**: Ensure layout doesn't break at 200% zoom

## Non-Goals

- WCAG AAA compliance (targeting AA only)
- Mobile native accessibility (no native apps)
- Third-party content accessibility (embedded videos, external links)

## Success Criteria

- Zero WCAG 2.1 AA violations across student and teacher flows
- Keyboard-only navigation works for complete lesson flow (dashboard → lesson → activities → completion)
- All activity components have ARIA labels and keyboard alternatives
- Color contrast passes automated audit (axe-core or equivalent)
