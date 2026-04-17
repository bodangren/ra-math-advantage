# Implementation Plan: Student Study Hub — Flashcards & SRS Review

## Phase 1: Glossary and SRS Core

### Tasks

- [x] **Task: Create IM3 glossary data**
  - [x] Define `GlossaryTerm` type in `lib/study/types.ts`
  - [x] Author `lib/study/glossary.ts` with Algebra/Trig vocabulary covering all 9 modules (target: 60-80 terms)
  - [x] Write tests for `getGlossaryTermsByModule`, `getAllGlossaryModules`, `getGlossaryTermBySlug`

- [x] **Task: Port FSRS scheduling utilities**
  - [x] Write unit tests for `scheduleNewTerm`, `processReview`, `getDueTerms`, `proficiencyBand`, `updateMastery` in `lib/study/__tests__/srs.test.ts`
  - [x] Implement `lib/study/srs.ts` wrapping `ts-fsrs` library
  - [x] Verify FSRS interval calculations produce reasonable spacing

- [x] **Task: Port study utilities**
  - [x] Write test for `shuffleArray` (Fisher-Yates)
  - [x] Implement `lib/study/utils.ts`

- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** [checkpoint: c47f8a1]

## Phase 2: Convex Tables and Mutations [~]

### Tasks

- [~] **Task: Add Convex tables for term mastery and due reviews**
  - [ ] Add `term_mastery` table with indexes (by_user, by_user_and_term)
  - [ ] Add `due_reviews` table with indexes (by_user, by_user_and_term, by_user_and_due)
  - [ ] Add `study_preferences` table with index (by_user)
  - [ ] Write schema migration tests

- [ ] **Task: Implement Convex study mutations and queries**
  - [ ] Write tests for `processReview`, `recordSession`, `getDueTerms` mutations/queries
  - [ ] Implement in `convex/study.ts`: processReview (upsert term_mastery + due_reviews), recordSession, getDueTerms, getTermMasteryByUnit, getRecentSessions

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: UI Components and Routes

### Tasks

- [ ] **Task: Implement BaseReviewSession component**
  - [ ] Write component tests for state machine: prompt → flip → rate → advance → complete
  - [ ] Implement `BaseReviewSession.tsx` with configurable header, empty state, and completion screen
  - [ ] Wire to Convex hooks (useDueTerms, useProcessReview, useRecordSession)

- [ ] **Task: Implement FlashcardPlayer and ReviewSession wrappers**
  - [ ] Write smoke tests for each wrapper
  - [ ] Implement `FlashcardPlayer.tsx` (activityType="flashcards", "Term X of Y" header)
  - [ ] Implement `ReviewSession.tsx` (activityType="srs_review", due-today header)

- [ ] **Task: Create study hub routes**
  - [ ] Create `app/student/study/page.tsx` (hub home with navigation cards)
  - [ ] Create `app/student/study/flashcards/page.tsx` (FlashcardPlayer, auth guard)
  - [ ] Create `app/student/study/review/page.tsx` (ReviewSession, auth guard)
  - [ ] Add study hub link to student dashboard

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**
