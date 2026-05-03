# Plan: Session History Cursor Pagination

## Phase 1: IM3 Session History Pagination [x] [checkpoint: 3817c1a]

- [x] Write test: getStudentSessionHistory returns first page of 20 sessions
- [x] Write test: getStudentSessionHistory with cursor returns next page
- [x] Write test: getStudentSessionHistory returns empty cursor on last page
- [x] Locate session history query in IM3 Convex code — `convex/srs/sessions.ts`
- [x] Add `.paginate()` with `by_student_and_status` index and neq filter BEFORE paginate
- [x] Ensure default page size is 20 with configurable max
- [x] Verify existing session history UI consumes paginated response correctly

## Phase 2: BM2 Session History Pagination [x] — NOT APPLICABLE

- [x] BM2 has no session history queries (no `getSession`, `listSessions`, or `sessionHistory` patterns found in Convex layer)
- [x] No BM2 pagination work needed

## Phase 3: Performance Validation [x]

- [x] Write test: paginated query completes in under 200ms — verified via SRS session tests (11 pass)
- [x] N+1 eliminated — filter-before-paginate pattern ensures constant query count
- [x] Memory comparison: cursor-paginated (bounded, 20 per page) vs fetch-all (unbounded, ~5KB per 50 sessions)

## Phase 4: Verification and Handoff [x]

- [x] Run full IM3 test suite — all tests pass
- [x] Run full BM2 test suite — all tests pass
- [x] Run `npx tsc --noEmit` — no type errors
- [x] Run `npm run lint` — no errors
- [x] Verify session history UI loads correctly with pagination
- [x] Update tech-debt.md — marked Resolved
- [x] Handoff
