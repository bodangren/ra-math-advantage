# Implementation Plan: Repository Hygiene Remediation

## Phase 1: Commit Outstanding Track Work

- [x] Task 1.1: Commit the fix-kst-node-titles parser fix and regenerated curriculum
  - [x] Stage `packages/math-content/src/knowledge-space/extraction/parser.ts` and its test
  - [x] Stage all 93 curriculum files (class-period-packages, activity-map, audit, class-period plans, aleks, lesson submodules)
  - [x] Stage `measure/skill-graph-inventory-audit.md` and `measure/tracks.md`
  - [x] Commit: `fix(parser): split semicolon-separated titles 1:1 with example numbers + regenerate curriculum`
  - [x] Verify `git status --short` returns empty (or only new track files)

## Phase 2: Resolve Remaining Stashes

- [x] Task 2.1: Evaluate each stash
  - [x] stash@{0}: "unrelated: efficacy-core A/B testing" — create WIP branch or drop
  - [x] stash@{1-4}: "learning-efficacy-analytics_20260605" — create WIP branch
  - [x] stash@{5}: "kst-lesser-holes: park spec-compliance Phase 3 dirty paths" — drop (superseded by spec-compliance track)
  - [x] Verify `git stash list` returns empty

## Phase 3: Fix BM2 Pre-existing Test Reds

- [ ] Task 3.1: Fix UserMenu test — wrap `<UserMenu>` in `<AuthProvider>` provider
  - [ ] File: `apps/bus-math-v2/__tests__/components/user-menu.test.tsx`
  - [ ] Add AuthProvider wrapper to all 9 test cases
  - [ ] Verify tests pass

- [ ] Task 3.2: Fix GradebookDrillDown flaky timeout
  - [ ] File: `apps/bus-math-v2/__tests__/components/teacher/GradebookDrillDown.integration.test.tsx`
  - [ ] Increase timeout or mock slow operations
  - [ ] Verify test passes

## Phase 4: Fix IM3 React 19 ESLint Violations

- [ ] Task 4.1: Fix `react-hooks/set-state-in-effect` violations
  - [ ] Refactor effects that call setState during mount to use lazy initialization or `useSyncExternalStore`
  - [ ] Files: MatchingPageClient, SpeedRoundPageClient, practice-timing, PhaseCompleteButton, MatchingGame, SpeedRoundGame

- [ ] Task 4.2: Fix `react-hooks/purity` violations
  - [ ] Remove `Date.now()`, `Math.random()` from render paths
  - [ ] Files: teacher dashboard, PracticeTestPageClient, ExportPanel, VocabularyHighlight

- [ ] Task 4.3: Fix `react-hooks/refs` violations
  - [ ] Refactor ref access during render to use `useRef` initializers
  - [ ] Files: PracticeTestEngine, PhaseCompleteButton

- [ ] Task 4.4: Fix `react-hooks/static-components` violations
  - [ ] Move sub-component definitions outside render functions
  - [ ] Files: ActivityRenderer, LessonStepper

- [ ] Task 4.5: Re-enable React 19 eslint rules
  - [ ] File: `apps/integrated-math-3/eslint.config.mjs`
  - [ ] Remove the disabled rules
  - [ ] Verify lint passes with zero errors

## Phase 5: Verification

- [ ] Task 5.1: Run TypeScript compilation
  - [ ] `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json`
  - [ ] `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json`
  - [ ] Record results

- [ ] Task 5.2: Run lint
  - [ ] `npm run lint --workspace=apps/integrated-math-3`
  - [ ] `npm run lint --workspace=apps/bus-math-v2`
  - [ ] Record results

- [ ] Task 5.3: Run tests
  - [ ] `CI=true npm run test --workspace=apps/integrated-math-3`
  - [ ] `CI=true npm run test --workspace=apps/bus-math-v2`
  - [ ] Record results

- [ ] Task 5.4: Final state check
  - [ ] `git status --short` returns empty
  - [ ] `git stash list` returns empty
  - [ ] All acceptance criteria met
