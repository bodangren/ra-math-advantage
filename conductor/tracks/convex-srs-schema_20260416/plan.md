# Plan: convex-srs-schema_20260416

## Phase 1: Convex Schema Definitions [checkpoint: 3073154]

- [x] Task: Add `srs_cards` table to `convex/schema.ts`
  - [x] Sub-task: Define all fields matching `SrsCardState` from `lib/srs/contract.ts`
  - [x] Sub-task: Add indexes: `by_student`, `by_student_and_due`, `by_objective`, `by_student_and_objective`, `by_problem_family`
- [x] Task: Add `srs_review_log` table to `convex/schema.ts`
  - [x] Sub-task: Define all fields for immutable append-only log
  - [x] Sub-task: Add indexes: `by_card`, `by_student`, `by_reviewed_at`
- [x] Task: Add `srs_sessions` table to `convex/schema.ts`
  - [x] Sub-task: Define all fields including `config` as `any`
  - [x] Sub-task: Add indexes: `by_student`, `by_student_and_status`
- [x] Task: Write schema validation tests
  - [x] Sub-task: Test that all 3 tables export correct field types
  - [x] Sub-task: Test that all indexes are defined and reference correct fields
  - [x] Sub-task: Run `npm run lint` and typecheck
- [x] Task: Conductor - Phase Completion Verification 'Convex Schema Definitions' (Protocol in workflow.md)

## Phase 2: CardStore Adapter

- [ ] Task: Implement `convex/srs/cards.ts` — Convex mutations for `saveCard` and `saveCards`
  - [ ] Sub-task: `saveCard` mutation — upsert single card by `studentId + problemFamilyId` composite key
  - [ ] Sub-task: `saveCards` mutation — batch upsert using transactional writes
- [ ] Task: Implement Convex queries for card reads
  - [ ] Sub-task: `getCard` query — fetch by document ID
  - [ ] Sub-task: `getCardsByStudent` query — index `by_student`
  - [ ] Sub-task: `getCardsByObjective` query — index `by_objective`
  - [ ] Sub-task: `getDueCards` query — index `by_student_and_due` with date filter
- [ ] Task: Implement `ConvexCardStore` class in `lib/srs/convexCardStore.ts`
  - [ ] Sub-task: Implement `CardStore` interface using internal mutations/queries
  - [ ] Sub-task: Map between `SrsCardState` and Convex document shape
- [ ] Task: Write integration tests for CardStore
  - [ ] Sub-task: Test `saveCard` persists and `getCard` retrieves matching state
  - [ ] Sub-task: Test `getDueCards` returns only cards with `dueDate <= asOfDate`
  - [ ] Sub-task: Test `saveCards` batch upsert
  - [ ] Sub-task: Run `npm run lint` and typecheck
- [ ] Task: Conductor - Phase Completion Verification 'CardStore Adapter' (Protocol in workflow.md)

## Phase 3: ReviewLogStore Adapter

- [ ] Task: Implement `convex/srs/reviews.ts` — Convex mutation for `saveReview`
  - [ ] Sub-task: `saveReview` mutation — insert-only, no update path
- [ ] Task: Implement Convex queries for review log reads
  - [ ] Sub-task: `getReviewsByCard` query — index `by_card`
  - [ ] Sub-task: `getReviewsByStudent` query — index `by_student`
- [ ] Task: Implement `ConvexReviewLogStore` class in `lib/srs/convexReviewLogStore.ts`
  - [ ] Sub-task: Implement `ReviewLogStore` interface
  - [ ] Sub-task: Map between `SrsReviewLogEntry` and Convex document shape
- [ ] Task: Write integration tests for ReviewLogStore
  - [ ] Sub-task: Test `saveReview` appends entry and `getReviewsByCard` retrieves it
  - [ ] Sub-task: Test immutability — no update/delete mutations exist
  - [ ] Sub-task: Test `getReviewsByStudent` returns entries in chronological order
  - [ ] Sub-task: Run `npm run lint` and typecheck
- [ ] Task: Conductor - Phase Completion Verification 'ReviewLogStore Adapter' (Protocol in workflow.md)

## Phase 4: Atomic Review Persistence

- [ ] Task: Implement `convex/srs/processReview.ts` — atomic mutation
  - [ ] Sub-task: Mutation receives card state + review entry as args
  - [ ] Sub-task: Patch/update `srs_cards` document within same transaction
  - [ ] Sub-task: Insert `srs_review_log` entry within same transaction
  - [ ] Sub-task: Return `{ cardId, logEntryId }`
- [ ] Task: Write atomicity tests
  - [ ] Sub-task: Test that card state and log entry are both written
  - [ ] Sub-task: Test that neither is written if either write fails (transactional rollback)
  - [ ] Sub-task: Test concurrent reviews on same card produce correct sequential state
  - [ ] Sub-task: Run `npm run lint` and typecheck
- [ ] Task: Conductor - Phase Completion Verification 'Atomic Review Persistence' (Protocol in workflow.md)

## Phase 5: Session Management

- [ ] Task: Implement `convex/srs/sessions.ts` — session mutations
  - [ ] Sub-task: `createSession` mutation — insert with `startedAt`, `plannedCards`, `config`
  - [ ] Sub-task: `completeSession` mutation — set `completedAt`, update `completedCards`
- [ ] Task: Implement session queries
  - [ ] Sub-task: `getActiveSession` query — `by_student_and_status` where `completedAt === undefined`
  - [ ] Sub-task: `getSessionHistory` query — `by_student` with pagination
- [ ] Task: Write session tests
  - [ ] Sub-task: Test create → get active → complete → verify completed
  - [ ] Sub-task: Test config defaults are preserved
  - [ ] Sub-task: Run `npm run lint` and typecheck
- [ ] Task: Conductor - Phase Completion Verification 'Session Management' (Protocol in workflow.md)

## Phase 6: Verification and Handoff

- [ ] Task: Run full test suite and verify all tests pass
  - [ ] Sub-task: `npm run lint`
  - [ ] Sub-task: Typecheck
  - [ ] Sub-task: All Vitest tests pass
- [ ] Task: Verify backward compatibility with existing tables
  - [ ] Sub-task: Confirm no changes to existing table definitions
  - [ ] Sub-task: Confirm `problemFamilyId` field aligns with `timing_baselines` convention
- [ ] Task: Update `conductor/tracks.md` with track status
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
