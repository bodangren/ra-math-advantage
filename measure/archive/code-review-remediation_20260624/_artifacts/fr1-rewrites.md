# FR-1 Rewrite Plan — 4 Committed Malformed `@returns` Annotations

Each rewrite is a single targeted JSDoc edit. The file under it must keep its current
runtime behavior (lint + tsc + tests still pass).

## File 1: `apps/integrated-math-3/app/api/dev/review-queue/route.ts:141`

**Current (malformed):**
```
 * @returns {JSX.Element} {Promise<string | null> {} The Convex profile ID, or null if no profile exists.
```
**Guard violation type:** STRAY_BLOCK (balanced `{JSX.Element}` followed by orphaned `{Promise<…> {}`)

**Proposed rewrite:**
```
 * @returns {Promise<string | null>} The Convex profile ID, or null if no profile exists.
```
**Rationale:** The function `resolveProfileId` returns `Promise<string | null>`. The `{JSX.Element}` prefix was a generator hallucination.

---

## File 2: `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts:24`

**Current (malformed):**
```
 * @returns {string {} The sanitized input safe for inclusion in an AI prompt.
```
**Guard violation type:** UNBALANCED (opening `{` never closed before description)

**Proposed rewrite:**
```
 * @returns {string} The sanitized input safe for inclusion in an AI prompt.
```
**Rationale:** Simple type — just needs closing `}`.

---

## File 3: `apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx:16`

**Current (malformed):**
```
 * @returns {CourseOverviewRow[] {} Sorted rows array.
```
**Guard violation type:** UNBALANCED (opening `{` never closed before description)

**Proposed rewrite:**
```
 * @returns {CourseOverviewRow[]} Sorted rows array.
```
**Rationale:** Simple type — just needs closing `}`.

---

## File 4: `packages/knowledge-space-practice/src/projections/activity-map.ts:65`

**Current (malformed):**
```
 * @returns {ProjectedActivity[] {} Sorted array of projected activities
```
**Guard violation type:** UNBALANCED (opening `{` never closed before description)

**Proposed rewrite:**
```
 * @returns {ProjectedActivity[]} Sorted array of projected activities.
```
**Rationale:** Simple type — just needs closing `}`. Also add trailing period for consistency.

---

## Verification

After each fix, the FR-3 guard run against just that file must report `violations=0`.
After all 4 fixes, the aggregate guard run against `apps/ packages/ convex/` (with
the 144 working-tree files still present) must drop from `>=358` to `>=354`.
