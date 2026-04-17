# Fix Teacher Dashboard N+1 Queries - Implementation Plan

## Phase 1: Analyze and Batch Student Card Queries

- [x] Read `getTeacherSrsDashboardData` handler in `convex/teacher.ts` (lines 1329-1484)
- [x] Identify all per-student queries inside the loop
- [x] Add `studentIds` array extraction from `activeStudents`
- [x] Create batched `Promise.all` for `srs_cards` queries
- [x] Create batched `Promise.all` for `srs_sessions` queries
- [x] Verify batched approach produces same results

## Phase 2: Remove Redundant Profile Lookup

- [x] Analyze whether `profile` lookup (line 1408) is redundant given we already have student data
- [x] Batch profile lookups via Promise.all into profilesMap for O(1) lookup per student
- [x] Update streak calculation to use data from batched queries

## Phase 3: Verify and Build

- [x] Run `npm run typecheck` to verify no TypeScript errors
- [x] Run `npm run lint` to check for lint errors (35 pre-existing `any` errors in tests)
- [x] Run `npm run build` to verify build passes