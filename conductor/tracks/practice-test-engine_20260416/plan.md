# Implementation Plan: Practice Test Engine

## Phase 1: Data Structures and Question Banks

### Tasks

- [x] **Task: Create practice test types**
  - [x] Write unit tests for type contracts in `lib/practice-tests/__tests__/types.test.ts`
  - [x] Define `PracticeTestQuestion`, `PracticeTestModuleConfig`, `PracticeTestPhaseContent`, `PracticeTestMessaging` in `lib/practice-tests/types.ts`

- [x] **Task: Create question bank helpers**
  - [x] Write unit tests for `filterQuestionsByLessonIds`, `drawRandomQuestions`, `shuffleAnswers` in `lib/practice-tests/__tests__/question-banks.test.ts`
  - [x] Implement helper functions in `lib/practice-tests/question-banks.ts`

- [x] **Task: Author Module 1 question bank (seed content)**
  - [x] Create `lib/practice-tests/modules/module-1.ts` with 3+ questions per lesson (8 lessons)
  - [x] Wire into `getModuleConfig(1)` lookup
  - [x] Write tests verifying question bank structure

- [x] **Task: Author remaining module question banks (M2-M9)**
  - [x] Create module files M2-M9 with 3+ questions per lesson
  - [x] Wire all into `getModuleConfig` lookup
  - [x] Verify all 9 modules return valid configs

- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**

## Phase 2: Convex Schema and Persistence

### Tasks

- [x] **Task: Add Convex tables for practice test results and study sessions**
  - [x] Write schema migration tests
  - [x] Add `practice_test_results` table with indexes (by_user, by_user_and_module, by_user_and_completed)
  - [x] Add `study_sessions` table with indexes (by_user, by_user_and_activity, by_user_and_started)
  - [x] Wire into `convex/schema.ts`

- [x] **Task: Implement Convex queries and mutations**
  - [x] Write tests for `savePracticeTestResult` and `getPracticeTestResults` in `__tests__/convex/study.test.ts`
  - [x] Implement `convex/study.ts` with save, record session, and get results functions
  - [x] Add `activityType` union: `"flashcards" | "matching" | "speed_round" | "srs_review" | "practice_test"`

- [x] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: Test Engine UI

### Tasks

- [ ] **Task: Implement PracticeTestEngine component**
  - [ ] Write component tests for 6-phase state machine in `__tests__/components/student/PracticeTestEngine.test.tsx`
  - [ ] Implement `PracticeTestEngine.tsx` with phase transitions, answer handling, score tracking
  - [ ] Implement post-answer feedback (highlight correct, dim incorrect, show explanation)

- [ ] **Task: Implement PracticeTestSelection component**
  - [ ] Write component tests for module card grid in `__tests__/components/student/PracticeTestSelection.test.tsx`
  - [ ] Implement `PracticeTestSelection.tsx` with 9 module cards linking to test pages

- [ ] **Task: Create route pages and persistence wiring**
  - [ ] Create `app/student/study/practice-tests/page.tsx` (selection, auth guard)
  - [ ] Create `app/student/study/practice-tests/[moduleNumber]/page.tsx` (engine wrapper)
  - [ ] Wire `onComplete` to save result + record session via Convex mutations

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**
