# Q38 saved practice views final independent implementation review

## Verdict

Accept the final eight-path candidate.

Candidate: `/tmp/precalc-saved-views-head-6_4_6dxd`

Patch: `/tmp/precalc-saved-views-final.patch`

## Final correction review

The stored receipt validator requires `decision.idempotency === "new"`. A test changes a real stored receipt decision to `"replay"` and expects `invalid_receipt`. This agrees with the selected evidence producer. A replay changes the top-level delivery result. It does not change the stored decision.

The saved submission validator checks all writer-owned timestamps. It requires finite, ordered, nonfuture `submittedAt`, `gradedAt`, `createdAt`, and `updatedAt` values. A table-driven query test now covers nonfinite creation and update timestamps and invalid lifecycle order.

The query test creates and delivers a real Independent writer result. It reads that result through `getSavedTopic11Practice` and verifies the Independent receipt result.

The harness records query operations. The tests prove that both mode reads use `activity_submissions.by_user_and_activity_and_attempt_ordinal`, descending order, and `first()`. They also prove the indexed receipt read.

The nested saved-result component now uses the saved submission ID as its React key. The regression rerenders the pilot from an old `needs_delivery` submission to a new `delivered` submission. It verifies the new score and delivery label. It verifies that the old required-delivery label and retry button are absent.

## Full behavior review

The query authenticates the exact learner. It resolves each physical activity by stable ID and exact identity. It performs bounded latest-per-mode submission reads. It recomputes the canonical server grade and compares complete graded parts. It distinguishes a missing receipt from a damaged receipt. It performs no write on read.

Historical saved results remain visible after current activity approval or source withdrawal. Current approval and readiness still control only new practice.

The shared saved-result component handles the active and fallback lesson states. A missing receipt has an explicit retry. The retry sends only the stored opaque submission ID. It has a separate immediate request guard and separate state from the fresh form. Malformed, ambiguous, and valid nonpersisted teacher-blocked results remain retryable. An invalid stored receipt is not retryable.

`Start new attempt` clears fresh controls and keeps the saved result visible. A saved retry cannot put its old submission ID into the fresh submission flow.

The dashboard authenticates before queries. It labels Guided or Independent mode and the attempt ordinal. It does not infer lesson completion or mastery.

The patch contains exactly the eight listed paths. The candidate and applied archive have equal bytes for all eight paths.

## Focused verification

Command:

`npx vitest run __tests__/convex/selected-topic11-writer-evidence-flow.test.ts __tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx __tests__/app/student/topic11-selected-lesson-page.test.tsx __tests__/app/student/saved-practice-dashboard.test.tsx`

Result: four files passed. Thirty-five tests passed.

Root owns the full suite and runtime gates. I made no candidate or main-worktree edit.
