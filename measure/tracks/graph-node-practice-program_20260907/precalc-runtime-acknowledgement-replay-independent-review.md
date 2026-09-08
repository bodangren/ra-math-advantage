# Precalculus acknowledgement replay independent review

## Decision

Accept the two-path patch.

The replay branch already checks the canonical acknowledgement shape, stable activity identity, mastery contract, attempt ordinal, and timestamp. The one-line change uses the existing recursive `sameJson` helper for the persisted submission payload. This compares nested arrays and records by JSON value instead of object identity. It also compares record key sets without depending on key order.

The change does not weaken the other replay identity checks. It does not change other `sameRecord` callers.

The regression test uses a JSON round trip to remove nested object identity. It verifies that an exact replay returns the original identity and creates no second submission or learning evidence. It then changes a nested answer and verifies `idempotency_conflict` with no additional effects.

I reran the selected backend file. All 68 tests passed.

No candidate or main worktree file was changed during this review.
