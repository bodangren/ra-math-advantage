# Junior Developer Handoff: Teacher SRS Dashboard

## What Was Built

A teacher-facing SRS (spaced repetition) dashboard that surfaces class-wide daily practice health, identifies at-risk students and weak objectives, aggregates misconception patterns from review logs, and provides basic intervention tools.

## Files and Locations

### Convex Queries (backend)

| Query | File | Purpose |
|-------|------|---------|
| `getClassSrsHealth` | `convex/teacher/srs-queries.ts` | Active students, practiced today, avg retention, total cards |
| `getOverdueLoad` | `convex/teacher/srs-queries.ts` | Total overdue cards + per-student breakdown |
| `getPracticeStreaks` | `convex/teacher/srs-queries.ts` | Top-N students by consecutive daily practice streak |
| `getWeakObjectives` | `convex/teacher/srs-queries.ts` | Objectives with <50% proficiency, sorted by priority |
| `getStrugglingStudents` | `convex/teacher/srs-queries.ts` | Students ranked by overdue count + retention |
| `getMisconceptionSummary` | `convex/teacher/srs-queries.ts` | Aggregated misconception tags from review logs |
| `getTeacherSrsDashboardData` | `convex/teacher.ts` | Combined dashboard payload (health, overdue, streaks) |

### Convex Mutations (backend)

| Mutation | File | Purpose |
|----------|------|---------|
| `updateObjectivePriority` | `convex/teacher/srs-mutations.ts` | Change objective priority (essential ↔ triaged) |
| `resetStudentCards` | `convex/teacher/srs-mutations.ts` | Reset a student's card to "new" state |
| `addExtraCards` | `convex/teacher/srs-mutations.ts` | Assign an extra new card for a student-objective pair |

### React Components (frontend)

| Component | File | Purpose |
|-----------|------|---------|
| `SrsDashboardPanel` | `components/teacher/srs/SrsDashboardPanel.tsx` | Class health metrics cards |
| `WeakObjectivesPanel` | `components/teacher/srs/WeakObjectivesPanel.tsx` | Sortable table of weak objectives |
| `StrugglingStudentsPanel` | `components/teacher/srs/StrugglingStudentsPanel.tsx` | Ranked student cards with overdue badges |
| `MisconceptionPanel` | `components/teacher/srs/MisconceptionPanel.tsx` | Bar chart of top misconceptions |
| `InterventionActions` | `components/teacher/srs/InterventionActions.tsx` | Priority toggle, reset dialog, extra cards dialog |
| `StudentSrsDetail` | `components/teacher/srs/StudentSrsDetail.tsx` | Per-student SRS detail view |
| `page.tsx` | `app/teacher/dashboard/srs/page.tsx` | Dashboard page composing all panels |

### Tests

- `__tests__/convex/teacher/srs-queries.test.ts` — 31 tests for all queries
- `__tests__/convex/teacher/srs-mutations.test.ts` — 16 tests for all mutations
- `__tests__/components/teacher/srs/SrsDashboardPanel.test.tsx` — 23 tests
- `__tests__/components/teacher/srs/WeakObjectivesPanel.test.tsx` — 12 tests
- `__tests__/components/teacher/srs/StrugglingStudentsPanel.test.tsx` — 14 tests
- `__tests__/components/teacher/srs/MisconceptionPanel.test.tsx` — 11 tests
- `__tests__/components/teacher/srs/InterventionActions.test.tsx` — 7 tests
- `__tests__/components/teacher/srs/StudentSrsDetail.test.tsx` — 4 tests

## Component Hierarchy and Data Flow

```
app/teacher/dashboard/srs/page.tsx (RSC)
├── fetches getTeacherSrsDashboardData
├── renders SrsDashboardPanel (health + overdue + streaks)
├── renders WeakObjectivesPanel
├── renders StrugglingStudentsPanel
├── renders MisconceptionPanel
└── renders InterventionActions (client, wired to mutations)

app/teacher/students/[id]/page.tsx (existing)
└── can embed <StudentSrsDetail studentId={...} />
```

All panels are presentational except `InterventionActions`, which uses `useMutation` from Convex to call the three intervention mutations.

## How to Extend Interventions

To add a new intervention (e.g., "Assign custom practice set"):

1. **Add the mutation** in `convex/teacher/srs-mutations.ts`:
   - Reuse `validateTeacherOwnsClass` and `validateStudentInClass`
   - Return a discriminated union result for type-safe error handling
2. **Add tests** in `__tests__/convex/teacher/srs-mutations.test.ts`
3. **Add UI** in `components/teacher/srs/InterventionActions.tsx`:
   - Follow the existing Dialog/AlertDialog pattern
   - Use shadcn/ui Button variants for action semantics
4. **Export props** in `components/teacher/srs/index.ts` if the new component needs to be consumed elsewhere

## Important Implementation Notes

### Auth Boundary
- All queries/mutations validate the caller is a teacher or admin
- All class-scoped operations verify `classDoc.teacherId === teacher._id`
- Student-scoped mutations additionally verify active enrollment via `class_enrollments`

### Type Safety
- `ResetStudentCardsResult` is a discriminated union (`{ success: true; cardId } | { success: false; error; cardId: null }`)
- Do NOT use `as` casts for error branches; extend the union pattern instead

### N+1 Queries (Known)
- The dashboard queries loop over students and make per-student DB calls
- This is a documented trade-off tracked in `tech-debt.md` as "Critical — pre-existing"
- Future optimization should batch reads or move aggregation into a single compound query

### `objective_policies` Schema Quirk
- `objective_policies` stores `policy` (string enum) AND `priority` (numeric) separately
- The mutation updates both fields to keep them in sync

### `by_objectiveId` Index on `problem_families`
- Uses `q.eq("objectiveIds", args.objectiveId as unknown as string[])`
- This relies on Convex array-element matching; tracked as high-severity tech debt
- Future refactor should filter in-memory or use a junction table

## Known Limitations

1. **Misconception tags require `evidence.misconceptionTags`** in `srs_review_log`
   - The submission-srs-adapter currently does not populate this field
   - `getMisconceptionSummary` will return empty results until that adapter is updated
2. **Dashboard page uses `getTeacherSrsDashboardData`** which computes weak objectives and struggling students as empty arrays in the combined query
   - The separate `getWeakObjectives` and `getStrugglingStudents` queries are fully implemented and tested
   - The page can be upgraded to call them directly when performance needs justify the extra round-trips
3. **No real-time updates** — teachers must refresh the page to see new data
4. **Student detail SRS section is a standalone component** — it is not yet integrated into `app/teacher/students/[id]/page.tsx`

## Running Focused Tests

```bash
# Convex backend tests
npx vitest run __tests__/convex/teacher/srs-queries.test.ts
npx vitest run __tests__/convex/teacher/srs-mutations.test.ts

# Component tests
npx vitest run __tests__/components/teacher/srs/
```
