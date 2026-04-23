# Spec: Lesson Version Query Optimization

## Overview

Two N+1 query patterns exist in the codebase: (1) `public.ts` `getCurriculum` and `getUnitSummaries` issue a query per lesson for lesson versions instead of batching, and (2) `isStudentEnrolledInClassForLesson` runs 2 sequential queries per enrollment in a loop. This track replaces both with batched parallel queries.

## Functional Requirements

1. Batch lesson version lookups in `getCurriculum` — fetch all versions once, build a Map for O(1) lookup
2. Batch lesson version lookups in `getUnitSummaries` — same pattern
3. Batch `isStudentEnrolledInClassForLesson` enrollment checks via Promise.all
4. Maintain identical return types and behavior
5. Add performance regression tests that verify query counts

## Non-Functional Requirements

- Must reduce query count from O(N) to O(1) for both patterns
- No behavioral changes to consuming components
- Must pass existing test suites without modification

## Acceptance Criteria

- [ ] getCurriculum issues 1 batch query instead of N per-lesson queries
- [ ] getUnitSummaries issues 1 batch query instead of N per-lesson queries
- [ ] isStudentEnrolledInClassForLesson uses Promise.all for parallel enrollment checks
- [ ] All existing tests pass unchanged
- [ ] New tests verify batch query behavior

## Out of Scope

- Other N+1 patterns outside these two functions
- Convex query-level optimization (index changes)
- Caching layer additions
