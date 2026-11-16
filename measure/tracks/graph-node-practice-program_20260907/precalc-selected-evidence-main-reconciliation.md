# Precalculus selected evidence main reconciliation

## Result

The shared worktree now uses the accepted selected evidence handler through `learning-evidence.submitRouted`. The dispatcher uses durable learner-submission evidence to preserve selected replay authentication after the physical submission is deleted or damaged. New selected submissions use the strict selected handler. Other activity IDs use the existing camel-case handler.

The selected handler preserves the current schema. It omits the removed fingerprint field and writes receipt `updatedAt`. The route requires the exact safe receipt with `kstApplied:false`. The parent corrected an old positive fixture that claimed `true`. A new negative test rejects that unsupported claim and prevents private data disclosure.

The reconciliation preserves pending later-topic code, catalogs, routes, and schema changes. It does not restore the Q19 teacher backend to the shared worktree. That separate reconciliation is active.

## Artifacts and integration boundary

The reviewed candidate is `/tmp/precalc-q20-main-current`. The applied patch is `/tmp/precalc-q20-main-reconciliation.patch`. The patch uses repository-relative paths and requires `git apply -p0`. The parent checked it against the current worktree before application.

The parent additionally corrected `apps/pre-calculus/__tests__/app/api/learning-evidence/precalculus-pilot/submission-authority.red.test.ts`. Its previous contents are saved at `/tmp/precalc-q20-parent-route-authority-before.ts`.

The production code remains part of the existing mixed shared-worktree changes. This report does not claim that all pending later-topic dependencies are committed. The accepted selected HEAD baseline remains commit `78201f36`.

## Verification

Independent review accepts the revised dispatcher. Its nine real composition tests pass. They exercise selected writer-to-evidence behavior and a real Topic 1.2 submission through the existing handler and stores. Selected deletion and damaged-identity replays reject inactive credentials without new effects.

The parent current-worktree focused run passes 189 tests in nine files. The separate selected writer file passes all 42 tests. App lint, a fresh production build, and post-build standalone TypeScript pass. The final lint also passes after the route fixture correction.

The broader curriculum run reports four unresolved failures: two obsolete depth or exam-signal checks, one old topic-label assertion, and one stored projection mismatch. Their correct repair is under investigation. Passing selected tests does not establish full curriculum correctness.

The additional existing evidence run passes 145 of 152 tests. This includes the 42 selected writer tests. Four failures stop in the existing selected writer because their fixtures lack the required active identity. Three failures call the unchanged camel-case handler with legacy selected fixtures and return `submission_not_found`. These files need separate reconciliation under Q18. Their bounded-read and real-flow requirements must remain covered. Q20 did not modify either producer used by those failing calls.

Logs:

- `/tmp/precalc-q20-parent-main-tests.log`: initial evidence and full curriculum run; 556 pass and five fail before the route fixture correction.
- `/tmp/precalc-q20-parent-main-focused.log`: 189 pass after the fixture correction.
- `/tmp/precalc-q20-parent-main-additional.log`: 145 pass and seven fail in the additional existing evidence suites.
- `/tmp/precalc-q20-parent-main-final-lint.log`
- `/tmp/precalc-q20-parent-main-build.log`
- `/tmp/precalc-q20-parent-main-tsc.log`

## Remaining program work

Q19 teacher reconciliation, exact source seeding, learner and teacher delivery, source approval, and the positive signed-in journey remain open. Real Convex rollback and concurrent receipt insertion remain unproved. No dependency change, live seed, schema push, source approval, or deployment occurred.
