# Fix apiRateLimits Race Condition

## Problem Statement

In `apps/bus-math-v2/convex/apiRateLimits.ts`, the `checkAndIncrementApiRateLimitHandler` function has a race condition:

1. `unique()` query returns `null` (no existing record)
2. Two concurrent requests both see `null`
3. Both try to `insert()` with same `userId + endpoint`
4. One succeeds, one throws duplicate key error (permanent failure)

The `by_user_and_endpoint` index is a **unique composite index**, so duplicate inserts fail permanently.

## Solution

Replace the check-then-insert pattern with an atomic upsert approach using try/catch:

1. If no existing record, try to `insert()`
2. If insert throws duplicate key error, the other request won — re-query and patch
3. All other paths (reset window, increment count) already use `patch()` which is safe

## Acceptance Criteria

- [ ] Concurrent requests for same user+endpoint do not cause duplicate key errors
- [ ] Rate limit enforcement works correctly under concurrent load
- [ ] Existing tests pass
- [ ] Build succeeds
- [ ] Tech debt registry updated
- [ ] Lessons learned documented