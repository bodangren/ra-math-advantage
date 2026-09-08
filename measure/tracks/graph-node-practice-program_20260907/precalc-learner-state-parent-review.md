# Precalculus learner state initial parent review

## Decision

Do not integrate the first Q27 candidate. The candidate derives the three required states and checks active learner credentials. It uses existing indexes without a result cap. Its three new tests pass, but the time checks do not match the trusted teacher writer.

## Required correction

The stored acknowledgement predicate checks only that the submission time is finite. It accepts a negative time or a future time. The source query validates the current source at the current time. It does not validate the source at the acknowledgement time.

An acknowledgement that predates source creation, source review, or the selected lesson section can therefore change the UI state. The trusted teacher writer rejects that acknowledgement. A matching altered teacher event can also make the first query return `ready_for_practice` for a future acknowledgement.

Add regression cases before correction. Check the timestamp range and current time. Require source creation and review before the acknowledgement. Reuse the exact source ownership check at the acknowledgement time. Keep source review and writer authorization unchanged.

Also prove that more than 100 unrelated or malformed acknowledgement rows cannot hide a valid acknowledgement. Verify the existing early-practice evidence restriction with the real selected writer and evidence path. Run standalone TypeScript after the build.

## Scope

The first Q27 patch remains isolated at `/tmp/precalc-q27-candidate-20260908`. It is not applied to the shared worktree. The author is correcting it. Learner consumer integration must wait for acceptance of the backend state contract.
