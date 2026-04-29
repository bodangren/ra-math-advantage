# Spec: Teacher SRS Queries N+1 Batch Fix

## Overview

The `getTeacherClassProficiencyHandler` in `convex/objectiveProficiency.ts` fires N×2+ queries per class (2 per student + 1 per objective). With 30 students and 50 objectives, this produces 110+ sequential/parallel query operations that can be batched into O(1) broader queries.

## Current N+1 Issues

### Issue 1: Per-Student Cards + Reviews (Lines 743-757)
```typescript
// CURRENT: 2N queries for N students
const studentDataResults = await Promise.all(
  studentIds.map(async (studentId) => {
    const [cards, reviews] = await Promise.all([
      ctx.db.query("srs_cards").withIndex("by_student", ...).collect(),  // N queries
      ctx.db.query("srs_review_log").withIndex("by_student", ...).collect(), // N queries
    ]);
  })
);
```

**Fix**: Fetch ALL srs_cards for ALL enrolled students in ONE query using `by_student` index, then filter/group by studentId in memory. Same for reviews.

### Issue 2: Per-Objective Competency Standards (Lines 773-780 + 234-242)
```typescript
// CURRENT: N queries for N objectives
const allStandards = await Promise.all(
  objectiveIdArray.map(objectiveId =>
    ctx.db.query("competency_standards").withIndex("by_code", ...).first()
  )
);
```

**Fix**: Fetch ALL competency_standards in ONE query, then build a Map by code in memory.

### Issue 3: Per-Student Activity Submissions (preFetchTeacherClassData, lines 262-269)
```typescript
// CURRENT: N queries for N students
const studentSubmissionResults = await Promise.all(
  studentIds.map(async (studentId) => {
    const subs = await ctx.db.query("activity_submissions").withIndex("by_user", ...).collect();
  })
);
```

**Fix**: This is trickier since there's no broad index. However, since preFetchTeacherClassData already fetches ALL submissions for ALL students, we can fetch them once and filter.

## Functional Requirements

1. All srs_cards for all students fetched in 1 query (not N)
2. All srs_review_log entries for all students fetched in 1 query (not N)
3. All competency_standards fetched in 1 query (not N)
4. Activity submissions already fetched broadly in preFetchTeacherClassData - reuse this
5. Memory usage acceptable since we batch the results

## Acceptance Criteria

- [ ] getTeacherClassProficiencyHandler uses 1 query for all srs_cards (not N)
- [ ] getTeacherClassProficiencyHandler uses 1 query for all srs_review_log (not N)
- [ ] preFetchTeacherClassData uses 1 query for all competency_standards (not N)
- [ ] No functional changes to output structure
- [ ] All existing tests pass