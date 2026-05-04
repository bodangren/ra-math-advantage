# Plan: E2E Test Coverage for Critical Student Flows

## Phase 1: Test Infrastructure — COMPLETE [checkpoint: 4b7b97d]

- [x] Write Playwright config for IM3 (baseURL, webServer, projects for chromium)
- [x] Create test fixtures: authenticated student page object, authenticated teacher page object
- [x] Write seed data helper that ensures consistent test state
- [x] Write smoke test to verify Playwright setup works

## Phase 2: Authentication Tests — COMPLETE

- [x] Write test: login page loads with title/sign-in form
- [x] Write test: invalid credentials show error message
- [x] Write test: student login redirects to dashboard
- [x] Write test: teacher login redirects to dashboard

## Phase 3: Lesson Navigation Tests — COMPLETE

- [x] Write test: dashboard shows lesson cards
- [x] Write test: clicking lesson navigates to lesson page
- [x] Write test: phase navigation is present on lesson page

## Phase 4: Activity Interaction Tests [ ]

- [ ] Write test: graphing-explorer in guided mode → place points → submit → feedback
- [ ] Write test: step-by-step-solver → complete all steps → submit → feedback
- [ ] Write test: comprehension-quiz → select answers → submit → score
- [ ] Write test: activity in practice mode → submit wrong answer → error feedback

## Phase 5: Daily Practice & Teacher Flows — PARTIAL

- [x] Write test: daily practice page loads at /student/practice
- [x] Write test: practice session loads cards/interactive content
- [ ] Write test: login as teacher → dashboard shows class list → click class → student list
- [ ] Write test: teacher → student detail → submission history visible
- [ ] Add Playwright to CI script
- [ ] Verify all tests pass in headless mode
