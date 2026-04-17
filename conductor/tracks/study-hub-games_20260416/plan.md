# Implementation Plan: Student Study Hub — Matching & Speed Round Games

## Phase 1: MatchingGame [checkpoint: d7956f9]

### Tasks

- [x] **Task: Implement MatchingGame component** [f88c7e3]
  - [x] Write component tests in `__tests__/components/student/MatchingGame.test.tsx`: card grid rendering, selection, match detection, wrong flash, completion screen
  - [x] Implement `MatchingGame.tsx` with click-based pair matching, 3×4 grid, 6 random terms
  - [x] Support `?module=N` search param with fallback to full glossary

- [x] **Task: Create MatchingGame route** [f88c7e3]
  - [x] Create `app/student/study/matching/page.tsx` with auth guard
  - [x] Add matching card to study hub home page

- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** [f88c7e3]

## Phase 2: SpeedRoundGame [checkpoint: 49f194b]

### Tasks

- [x] **Task: Implement SpeedRoundGame component** [49f194b]
  - [x] Write component tests in `__tests__/components/student/SpeedRoundGame.test.tsx`: timer countdown, lives, streaks, question generation, feedback flash, game over screen
  - [x] Implement `SpeedRoundGame.tsx` with 90s timer, 3 lives, streak counter, multiple-choice questions
  - [x] Support `?module=N` search param with fallback

- [x] **Task: Create SpeedRoundGame route** [49f194b]
  - [x] Create `app/student/study/speed-round/page.tsx` with auth guard
  - [x] Add speed round card to study hub home page

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: Study Hub Polish

### Tasks

- [ ] **Task: Verify shared infrastructure and session recording**
  - [ ] Verify both games use shared `recordSession` mutation
  - [ ] Verify both games use shared `shuffleArray` and glossary helpers
  - [ ] Test that sessions appear in progress dashboard (if ProgressDashboard exists)

- [ ] **Task: Final verification**
  - [ ] Run full test suite
  - [ ] Run lint and typecheck
  - [ ] Manual walkthrough of all study hub routes

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**
