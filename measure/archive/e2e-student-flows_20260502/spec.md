# Spec: E2E Test Coverage for Critical Student Flows

## Problem

IM3 has 267 unit tests and Playwright installed but no E2E tests covering the critical student journey: login → dashboard → lesson → phase navigation → activity interaction → submission → completion → progress persistence. regressions in the end-to-end flow are only caught manually, which is slow and unreliable.

## Scope

Add Playwright E2E tests for the 5 most critical student-facing flows in `apps/integrated-math-3/`.

## Key Flows to Cover

1. **Authentication Flow**: Login with valid credentials → redirect to dashboard. Login with invalid credentials → error message. Logout → session cleared.
2. **Lesson Navigation Flow**: Dashboard → click lesson → lesson landing → navigate phases → complete activity → mark phase complete → see progress update
3. **Activity Interaction Flow**: Open graphing-explorer activity → interact (place points) → submit → see feedback. Open step-by-step-solver → complete steps → submit.
4. **Daily Practice Flow**: Navigate to daily practice → start session → complete cards → see SRS scheduling update → session complete
5. **Teacher Dashboard Flow**: Login as teacher → see class overview → click student → see student detail → view submission

## Non-Goals

- Visual regression testing (no screenshot comparison)
- Performance/load testing
- Mobile viewport testing (desktop-first)
- Testing third-party services (OpenRouter AI responses)

## Success Criteria

- 15+ E2E tests covering the 5 flows above
- Tests run in CI (Playwright config for headless mode)
- Tests use Convex test data (seeded via existing seed scripts)
- All tests pass consistently (no flakiness from timing)
