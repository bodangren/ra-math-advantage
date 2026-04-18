# Track: Fix Misconception Summary N+1 Query

## Overview

Fix critical N+1 sequential query pattern in `getMisconceptionSummaryHandler` that causes timeout with 30+ students. The handler currently loops sequentially over each student to query review logs, then loops again to fetch each card individually — resulting in 3000+ sequential reads for typical class sizes.

## Problem Statement

In `apps/integrated-math-3/convex/teacher/srs-queries.ts:getMisconceptionSummaryHandler`:

```typescript
// N queries - one per student (sequential)
for (const enrollment of activeStudents) {
  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) => q.eq("studentId", enrollment.studentId))
    .collect();
  
  // M queries per student - one per review card (sequential)
  for (const review of reviews) {
    const card = await ctx.db.get("srs_cards", review.cardId);
  }
}
```

With 30 students × 100 reviews = 3000+ sequential DB operations → timeout.

## Functional Requirements

1. Fetch all student IDs first (single enrollment query)
2. Parallelize review log queries using `Promise.all` instead of sequential loop
3. Batch all card lookups using `Promise.all` instead of sequential per-review get
4. Preserve exact same output format and sorting behavior
5. Maintain time-window filtering (sinceDays parameter)

## Non-Functional Requirements

- Convex function must complete within normal execution limits
- No changes to public API or return types
- All existing tests must pass

## Acceptance Criteria

1. [ ] `getMisconceptionSummaryHandler` uses `Promise.all` for parallel student review queries
2. [ ] Card lookups are batched with `Promise.all`, not sequential per-review gets
3. [ ] All 8 existing tests in `srs-dashboard.test.ts` pass
4. [ ] Return value format unchanged (sorted by count descending, MisconceptionView[])

## Out of Scope

- Schema changes (denormalizing objectiveId into review log)
- Index creation/modification
- Changes to other handlers
