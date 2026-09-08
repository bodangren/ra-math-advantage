# Precalculus learner delivery state integration

## Result

Q27 is applied in the shared worktree after independent review. The query derives `needs_acknowledgement`, `awaiting_teacher_confirmation`, or `ready_for_practice`. It returns `null` for unavailable source or inactive learner authority. It adds no schema, index, or persisted state.

The query requires an active learner credential with matching profile fields. It reads acknowledgements through the existing physical activity index without a result cap. Each acknowledgement must have the exact empty contract, positive ordinal, no grade fields, and a finite nonnegative time no later than now. Source creation, review, and exact lesson ownership must be valid at that time.

Practice readiness requires the exact same-node teacher event for the learner. Its stable activity, mode, origin, ordinal, time, and submission-bound idempotency key must match. An unrelated event cannot enable practice.

## Verification

Independent review accepts the corrected query and 44 focused tests. Parent verification passes 72 tests in three files. These include the state and real teacher flow, strict Worked projection, and acknowledgement route. App lint, a fresh build, and post-build standalone TypeScript pass.

The early-practice regression calls the actual server-owned submission writer and selected evidence handler. It returns `awaiting_teacher_exposure`. It writes no learning evidence, evidence receipt, SRS card, or review log. The derived state remains `needs_acknowledgement`.

Logs use `/tmp/precalc-q27-parent-` with `tests.log`, `lint.log`, `build.log`, and `tsc.log`.

## Remaining work

Runtime changes remain applied with pending application dependencies. This is a shared-worktree acceptance record. Q28 must connect the state to the actual learner pages. Teacher candidate selection, the teacher action, and complete signed-in student-flow verification remain open. No production source approval, seed, or deployment occurred.
