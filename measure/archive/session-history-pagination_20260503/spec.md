# Spec: Session History Cursor Pagination

## Problem

The session history query fetches all records then slices client-side, which degrades as students accumulate more practice sessions. For a student with 500+ sessions, this loads the entire history into memory on every page visit. The same pattern exists in BM2.

## Goal

Replace the fetch-all-then-slice pattern with Convex cursor pagination, reducing initial load time and memory usage for students with long session histories.

## Requirements

1. **Cursor Pagination**: Use Convex `.paginate()` or manual cursor-based pagination to fetch sessions in pages of 20.
2. **Backward Compatibility**: Existing UI must work unchanged — pagination should be transparent to consumers.
3. **Both Apps**: Apply the fix to both IM3 and BM2 session history queries.
4. **Test Coverage**: Add tests verifying pagination returns correct pages and handles edge cases (empty results, last page).

## Non-Goals

- Infinite scroll UI (pagination only, no UI change)
- Session history search/filter (future track)
- Real-time session updates

## Success Criteria

- Session history loads in pages of 20, not all-at-once
- Initial page load under 200ms for students with 500+ sessions
- All existing tests pass
- BM2 session history also migrated
