# Track: Fix submitReviewHandler componentKind Derivation

## Problem Statement

`submitReviewHandler` uses the client-sent `componentKind` argument directly when writing to `component_reviews`. However, the read path (`assembleReviewQueueItem`) derives `componentKind` from `placement.phaseType` using `resolveComponentKind`. If the client sends an incorrect `componentKind`, the stored hash will not match the computed hash, causing permanent `isStale = true`.

## Root Cause

**Write path** (`convex/dev.ts:submitReviewHandler`):
- Uses `args.componentKind` from client directly (line 156, 165)
- Stores this in `component_reviews.componentKind`

**Read path** (`lib/activities/review-queue.ts:assembleReviewQueueItem`):
- Derives `componentKind` from `placement.phaseType` via `resolveComponentKind()` (lines 90-92)
- `worked_example` → `example`, `guided/independent_practice`/`assessment` → `practice`, all else → `activity`

**Result**: If client sends `componentKind: "example"` for an activity in `guided_practice` phase (which resolves to `"practice"`), hash mismatch causes permanent stale flag.

## Solution

Derive `componentKind` from `placement.phaseType` on the write path, using the same `resolveComponentKind` function. Fall back to `args.componentKind` only when `placement` is not provided.

## Files to Modify

1. `convex/dev.ts` - `submitReviewHandler`: Derive componentKind from placement.phaseType instead of using client arg directly
2. `__tests__/convex/dev.test.ts` - Add test case for stale detection when client componentKind mismatches placement-derived kind

## Acceptance Criteria

1. When `placement.phaseType` is `worked_example`, the stored `componentKind` is `example` regardless of client arg
2. When `placement.phaseType` is `guided_practice`, `independent_practice`, or `assessment`, stored `componentKind` is `practice`
3. When `placement` is absent, fall back to `args.componentKind`
4. Hash computation uses the same derived `componentKind`
5. Existing tests continue to pass