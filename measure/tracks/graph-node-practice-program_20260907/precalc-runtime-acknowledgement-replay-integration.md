# Precalculus acknowledgement replay fix

## Scope

Candidate: `/tmp/precalc-ack-replay-head-20260908.zHLsJj`
Base commit: `db398c32e494702cf72d390857bb23083648a944`
Patch: `/tmp/precalc-ack-replay-final.patch`

The patch changes two paths:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/__tests__/convex/topic11-selected-teacher-backend.test.ts`

## Change

The existing replay branch compared `submissionData` with `sameRecord`. That helper compares nested `answers` and `parts` by object identity. Convex returns persisted values with new nested object identities. Thus, an exact replay returned `idempotency_conflict`.

The replay branch now uses the existing `sameJson` helper for this one comparison. The change does not alter `sameRecord` or any other caller.

The regression creates an acknowledgement, replaces the stored data with a JSON round trip, and replays an independently cloned exact request. It verifies the original submission identity, one stored submission, and no learning evidence. It then changes the stored nested payload and verifies `idempotency_conflict` with no added effects.

## Verification

- Red: 67 tests passed and the new round-trip replay case failed with `idempotency_conflict`. See `/tmp/precalc-ack-replay-red.log`.
- Relevant acknowledgement, route, teacher candidate, and real-flow tests: 115 of 115 pass. See `/tmp/precalc-ack-replay-tests.log`.
- Precalculus lint passes. See `/tmp/precalc-ack-replay-lint.log`.
- Precalculus build passes. See `/tmp/precalc-ack-replay-build.log`.
- Post-build standalone TypeScript passes with `--incremental false`. See `/tmp/precalc-ack-replay-tsc.log`.
- `git diff --check` passes.

The candidate has a local dependency overlay. All 21 `@math-platform` links resolve to candidate package sources. No deployment, installation, commit, Unit 7 candidate edit, or main worktree edit occurred.
