# Plan: WCAG 2.1 AA Accessibility Audit & Remediation

## Phase 1: Audit Baseline — COMPLETE

- [x] Install axe-core and @axe-core/react for automated scanning
- [x] Write test harness that runs axe on every route (student dashboard, lesson, activity, teacher dashboard, gradebook)
- [x] Run automated audit and log all violations by severity (critical/serious/moderate/minor)
- [x] Document findings in audit report with affected components and remediation priority

## Phase 2: Keyboard Navigation Fixes [~]

- [x] Write tests verifying Tab/Shift+Tab reaches all interactive elements on lesson page [9a9d263]
- [ ] Add visible focus indicators to all buttons, links, and form controls (Tailwind focus-visible styles)
- [ ] Make GraphingCanvas keyboard-accessible (arrow keys for point placement, Enter to submit)
- [ ] Make parameter sliders in Explore mode keyboard-adjustable
- [ ] Make drag-and-drop activities keyboard-operable (spacebar to pick up, arrow keys to move, spacebar to drop)
- [ ] Add skip-to-content link for lesson and dashboard layouts

## Phase 3: Screen Reader & ARIA Fixes [ ]

- [ ] Write tests verifying ARIA labels on all activity components
- [ ] Add aria-live regions for dynamic content (submission results, phase completion, chatbot responses)
- [ ] Add aria-current="page" to active navigation items
- [ ] Ensure lesson phase transitions announce state changes via aria-live
- [ ] Add role="status" to loading indicators and progress bars

## Phase 4: Color & Visual Fixes [ ]

- [ ] Write contrast tests using axe-core rule color-contrast against oklch palette
- [ ] Fix any failing contrast ratios in DESIGN.md color system
- [ ] Ensure focus indicators have 3:1 contrast against background
- [ ] Verify error states use more than color alone (icon + text + color)

## Phase 5: Verification & Documentation [ ]

- [ ] Run full axe-core audit — zero critical/serious violations
- [ ] Manual keyboard-only walkthrough of complete student lesson flow
- [ ] Manual screen reader walkthrough (VoiceOver/NVDA) of dashboard and one lesson
- [ ] Update DESIGN.md with accessibility guidelines for future component development
- [ ] Handoff
