// Phase 2 selectors — test-only bridge for the auth-flow and lesson-flow
// E2E specs. Lives in the e2e/ directory and is imported exclusively by
// Playwright specs and the Phase 2 contract test. It is NOT imported by
// any Convex or app code, so it can be modified in the Red phase without
// crossing the source/test boundary that governs apps/integrated-math-3/
// e2e/selectors.ts (which is shared with convex/seed/seed_demo_e2e.ts).

export const SEL_PHASE2 = {
  studentDashboardHeading: 'student-dashboard-heading',
  loginError: 'login-error',
  logoutButton: 'logout-button',
  userMenu: 'user-menu',
  lessonRenderer: 'lesson-renderer',
  lessonHeader: 'lesson-header',
  lessonTitle: 'lesson-title',
  phaseStepper: 'phase-stepper',
  phaseStepperDot: 'phase-stepper-dot',
  phaseCompleteButton: 'phase-complete-button',
  phaseCompleteStatus: 'phase-complete-status',
  lessonCompleteScreen: 'lesson-complete-screen',
  lessonCompleteContinueBtn: 'lesson-complete-continue-btn',
  deactivatedLoginError: 'deactivated-login-error',
} as const;
