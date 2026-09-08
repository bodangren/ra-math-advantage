# Precalculus Q19 main reconciliation report

## Result

The isolated candidate restores the committed Topic 1.1 acknowledgement and teacher confirmation boundary in the current pending main files. It preserves the pending later-topic writers, `submitRouted`, the no-fingerprint schema direction, and receipt `updatedAt` behavior.

Candidate: `/tmp/precalc-q19-main-reconcile-092640`

Patch from the recorded main snapshot: `/tmp/precalc-q19-main-reconciliation.patch`

Recorded main snapshot files:

- `/tmp/precalc-q19-main-activities.before.ts`
- `/tmp/precalc-q19-main-learningEvidence.before.ts`
- `/tmp/precalc-q19-main-precalc-pilot.before.ts`
- `/tmp/precalc-q19-main-before.patch`

## Changed files

- `apps/pre-calculus/convex/activities.ts`
  - Restores the exact Worked blueprint predicate.
  - Restores exact physical source identity checks.
  - Restores complete published lesson and phase lookup without fixed caps.
  - Restores the active learner credential check.
  - Restores canonical empty acknowledgement validation.
  - Preserves opaque idempotency-key bytes and canonical replay.
  - Stores `updatedAt` with the current main schema.
  - Removes the obsolete permissive Topic 1.1 validator.
  - Re-exports the component-key constant for current call-site compatibility. The authority value remains in the shared library file.
- `apps/pre-calculus/convex/learningEvidence.ts`
  - Replaces only the old selected Topic 1.1 teacher handler.
  - Restores active teacher and learner credential checks.
  - Restores exact activity, acknowledgement, publication, class, enrollment, assignment, and time checks.
  - Preserves authenticated durable replay after publication withdrawal.
  - Preserves the current main evidence store and its no-fingerprint behavior.
  - Removes the obsolete permissive selected source parser.
- `apps/pre-calculus/lib/learning-evidence/precalc-pilot.ts`
  - Restores the selected source component-key constant that the pending main file had removed.
  - Preserves all later-topic constants and functions.
- `apps/pre-calculus/__tests__/convex/topic11-selected-teacher-backend.test.ts`
  - This file is absent from the current main working tree. The patch adds the complete accepted 35-test contract from `/dev/null`.
  - It imports the current production camel-case `learningEvidence.ts` module.

The patch does not change `schema.ts`, the generated API, the seed, a route, a UI file, or a dependency.

The camel-case module name is intentional. The production teacher route calls `internal.learningEvidence.submitTopic11TeacherSubmission`. The generated API exposes `learningEvidence` as the camel-case module. The existing real route test passes only when that camel-case reference is used. The hyphenated file remains the active selected evidence module and dispatcher from Q20. The teacher route continues to use the camel-case teacher function.

## Verification

Passed:

- `topic11-selected-teacher-backend.test.ts`: 35 tests
- `topic11-daily-handler.acceptance.test.ts`: 20 tests
- `selected-topic11-submission-writer.test.ts`: 42 tests
- `selected-topic11-evidence.test.ts`: 11 tests
- `selected-topic11-writer-evidence-flow.test.ts`: 9 tests
- app lint
- fresh app build
- post-build standalone TypeScript with `npx tsc --noEmit`

The selected backend total is 117 passing tests. The production teacher route reference test adds 3 passing tests. The final focused route and teacher run passed 38 tests.

I also ran three broader existing files. They produced the same seven known fixture failures that the parent recorded for Q20: four old production-flow cases lack active credentials, and three old bounded-read cases use stale selected fixtures. The run had 229 passes and seven failures. These failures are outside this Q19 patch and are not new Q19 behavior regressions.

## Limits

This candidate does not implement the source seed, learner route, Worked projection, teacher candidate query, or teacher UI. Those tasks remain in the delivery integration plan.

The current real graph and physical source remain draft or unreviewed. The tests use hypothetical approved fixtures. The candidate does not approve or deploy content.

## Parent review and integration

The parent reviewed all changed production sections against the accepted Q19 baseline and current shared-worktree contracts. The first patch incorrectly assumed that the selected teacher test existed in main. The revised patch adds that file from `/dev/null`. `git apply --check` passed before the parent applied it.

The restored 35-test file matches the committed test exactly except for its production module import. The parent verified the real teacher route uses the same camel-case mutation. The selected writer and evidence dispatcher remain in their existing modules.

Current-worktree parent verification passes 117 backend tests and three teacher route tests. App lint, a fresh build, and post-build standalone TypeScript pass. Logs are `/tmp/precalc-q19-parent-main-tests.log`, `/tmp/precalc-q19-parent-main-route.log`, `/tmp/precalc-q19-parent-main-lint.log`, `/tmp/precalc-q19-parent-main-build.log`, and `/tmp/precalc-q19-parent-main-tsc.log`.

The selected Q19 backend reconciliation is accepted. Runtime edits remain in the existing mixed worktree. The committed backend baseline remains `da95212c`. This report does not claim that the pending later-topic module or all its dependencies are committed. Source seed, learner delivery, teacher candidate and interface integration, source approval, and a positive signed-in flow remain open.
