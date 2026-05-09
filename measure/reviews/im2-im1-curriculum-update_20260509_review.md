# Measure Review: im2-im1-curriculum-update_20260508

**Reviewer:** Kimi Code CLI (autonomous deep-dive review)  
**Review Date:** 2026-05-09  
**Commits Reviewed:** `2c30bd05` through `f067594d` (12 commits)  
**Track Status Claimed in Git:** COMPLETED (`[x]` in tracks.md, Phase 14 marked done)  
**Track Status in metadata.json/spec.md:** `update-required` / "Paused for Skill Graph alignment"

---

## Executive Summary

The track delivers **substantial infrastructure** — new seed data, class period plans, module overviews, course spec, and implementation artifacts for both IM1 and IM2. **Build, lint, and typecheck all pass.**

However, the review uncovers **4 critical data integrity bugs** that will cause silent runtime failures, **1 major cleanup failure** leaving 71 dead files, and **significant activity-map orphaning** that breaks the practice.v1 contract linkage. The spec's own claim of "109 IM2 lessons" is factually incorrect (actual: 96). Most critically, the track is marked complete in Git/tracks.md but the spec and metadata still say "update-required" — a source-of-truth conflict.

**Verdict: CONDITIONAL PASS — requires remediation before this track can be considered truly complete.**

---

## Critical Issues (Blocking)

### C1. Lesson Slug Mismatch → Silent Standards Seeding Failure (IM1 Modules 6, 8, 13; IM2 Module 5)

**Severity:** CRITICAL — data loss at seed time, no error surfaced  
**Spec Violation:** FR-1: "Each lesson entry uses `module-X-lesson-Y` ID matching curriculum file names"

| App | Module | Lessons Affected | Seed Slug Format | Standards Slug Format |
|-----|--------|------------------|------------------|----------------------|
| IM1 | 6 | 5 | `6-1-one-step-inequalities` | `module-6-lesson-1` |
| IM1 | 8 | 6 | `8-1-exponential-functions` | `module-8-lesson-1` |
| IM1 | 13 | 6 | `13-1-reflections` | `module-13-lesson-1` |
| IM2 | 5 | 8 | `5-1-circles-circumference` | `module-5-lesson-1` |

**Impact:** When `seed_im1_module_6_standards.ts` runs, it queries `lessons.by_slug` for `module-6-lesson-1` → returns `null` → `continue` → no `lesson_standards` row inserted. **17 lessons in IM1 and 8 lessons in IM2 will have zero standard associations** with no error logged beyond the seed result array.

**Root Cause:** These modules were apparently generated from the old `units.ts` slug catalog (`1-1-classifying-triangles` style) instead of the new `module-X-lesson-Y` naming convention.

**Remediation:**
1. Rename lesson slugs in `seed_module_6_lessons.ts`, `seed_module_8_lessons.ts`, `seed_module_13_lessons.ts` (IM1) and `seed_module_5_lessons.ts` (IM2) to `module-X-lesson-Y` format.
2. Update lesson titles/descriptions to match the actual curriculum files if they diverge.
3. Re-verify standards mapping after slug correction.

---

### C2. IM2 activity-map.json Completely Orphaned (Old Unit-Based Period IDs)

**Severity:** CRITICAL — breaks practice.v1 contract linkage  
**Spec Violation:** FR-5: "Create `implementation/practice-v1/activity-map.json`"

**Finding:** All 412 activities in IM2's `activity-map.json` use period IDs in the **old unit format**:
```json
{ "periodId": "u01-p01", "sourceLesson": "1-1", ... }
```

But the new class period packages use **module format**:
```json
{ "periodId": "module-1-p01", "sourceLesson": "1-1", ... }
```

**Result:** Zero period IDs match. The activity map is completely disconnected from the class period packages. Any code resolving `periodId → activities` will find no matches for IM2.

The `generatedFrom` field even references `curriculum/unit-*-class-period-plan.md`, which no longer exists (deleted in this track).

**Remediation:**
1. Regenerate IM2 `activity-map.json` with `module-X-pXX` period IDs matching the new class period packages.
2. Update `generatedFrom` to reference `curriculum/module-*-class-period-plan.md`.
3. Verify `sourceLesson` references align with new curriculum file naming if the resolver depends on it.

---

### C3. IM1 activity-map.json Severely Incomplete (4.6% Coverage)

**Severity:** CRITICAL — missing activity mappings for 227+ periods  
**Spec Violation:** FR-5: "Create `implementation/practice-v1/activity-map.json`"

**Finding:** IM1's `activity-map.json` contains **33 activities across only 12 unique period IDs**, all in **Module 1**:
```
m1-p01, m1-p02, m1-p04, m1-p05, m1-p07, m1-p08,
m1-p10, m1-p11, m1-p13, m1-p14, m1-p16, m1-p17
```

With **260 total class period packages** across 14 modules, this is **~4.6% coverage**. Modules 2–14 have **zero** activity mappings.

**Remediation:** Create activity mappings for all 260 IM1 class period packages, or explicitly document the coverage gap in the spec's "Out of Scope" section if intentional.

---

### C4. Invalid JSON in IM1 Class Period Package

**Severity:** CRITICAL — breaks any JSON parser loading this file  
**File:** `apps/integrated-math-1/curriculum/implementation/class-period-packages/module-7-p14.json`

**Finding:** Python's `json.load()` fails with:
```
Invalid control character at: line 7 column 163
```

**Remediation:** Re-encode the file to remove the control character (likely a non-printable byte in the `activities` array string).

---

## Major Issues

### M1. IM2 Old Seed Files Not Deleted (71 Dead Files)

**Severity:** MAJOR — spec explicitly requires deletion  
**Spec Violation:** FR-1: "Delete old seed files using `unit-X` format"

**Finding:** 71 old `seed_lesson_X_Y.ts` files remain in `apps/integrated-math-2/convex/seed/`. They are no longer imported by `seed.ts`, but they:
- Create clutter and confusion
- Are still compiled by Convex (appear in `_generated/api.d.ts`)
- Reference old `unitNumber` and `1-1-classifying-triangles` slug format

**Files:** `seed_lesson_1_1.ts` through `seed_lesson_13_5.ts` (71 total)

**Remediation:** Delete all `apps/integrated-math-2/convex/seed/seed_lesson_*.ts` files.

---

### M2. `units.ts` Still Present in Both Apps

**Severity:** MAJOR — plan explicitly requires removal  
**Plan Violation:** Task 3.1: "Remove old seed.ts and seed/units.ts completely"  
**Plan Violation:** Task 4.1: "Remove old seed files — replace with new module-based seeds"

**Finding:**
- `apps/integrated-math-1/convex/seed/units.ts` — still present
- `apps/integrated-math-2/convex/seed/units.ts` — still present

Both contain old `X-Y-topic-name` slug catalogs. Worse, they are **still compiled into Convex's generated API** (`_generated/api.d.ts` imports `seed_units`).

**Remediation:** Delete `units.ts` from both apps and regenerate Convex types.

---

### M3. Track Status Conflict (Complete vs. Update-Required)

**Severity:** MAJOR — source-of-truth drift  

**Finding:**
- `tracks.md` line 986: `- [x] **Track: IM2 + IM1 Curriculum Update** — **COMPLETED**`
- `metadata.json`: `"status": "update-required"`
- `spec.md` line 3: `2026-05-09 Status: Update Required Before Implementation`
- Final commit `f067594d`: `im2-im1: Phase 14 — track complete, tracks.md updated`

These are contradictory. The Git history claims completion; the Measure artifacts say the track is paused. This undermines the "Plan is Source of Truth" principle.

**Remediation:** Reconcile status. If the critical issues above are fixed, mark as complete. If Skill Graph alignment truly blocks the track, revert tracks.md to `[ ]` and document the blocker.

---

## Minor Issues

### m1. Inconsistent exceptions.json Format

- **IM1:** Minimal array, no schema version
- **IM2:** Rich object with `schemaVersion`, `pdfFilenameAnomalies`, `splitModulePdfs`, etc.

Standardize or document the format divergence.

### m2. Class Period Plans Use `X-Y` Notation Instead of `module-X-lesson-Y`

Both IM1 and IM2 class period plans reference source lessons as `1-1`, `1-2`, etc. rather than `module-1-lesson-1`. This is acceptable as textbook notation but creates an implicit mapping layer. Consider adding an explicit mapping table or note.

### m3. Plan Task 3.1 Left Unchecked

Task 3.1 in `plan.md` says:
```
- [ ] Remove old seed.ts and seed/units.ts completely — replace with new module-based seeds
```

This box is **unchecked** even though the final commit marks Phase 3 complete. The work was partially done (old `seed.ts` replaced) but `units.ts` was not removed.

### m4. IM2 Lesson Count Spec Drift

The spec claims "IM2: 109 lesson files" but the actual count is **96**. The plan says "~104 lessons" which is also incorrect. The correct count (from Practice Worksheet Example Import track) is **96**.

---

## What Was Done Well

| Deliverable | IM1 | IM2 | Status |
|-------------|-----|-----|--------|
| Curriculum lesson files (`module-X-lesson-Y`) | 93 | 96 | ✓ Present |
| Class period plans | 14 modules, 260 periods | 13 modules, 252 periods | ✓ Created |
| Old unit-X plans deleted | N/A | 13 deleted | ✓ Done |
| Module overviews | 14 created | 13 created | ✓ Done |
| Course spec | Created | Already existed | ✓ Done |
| Class period packages | 260 JSON files | 252 JSON files | ✓ Created |
| Seed files (`seed_module_*_lessons.ts`) | 14 files | 13 files | ✓ Created |
| Standards seed files | 14 files | 13 files | ✓ Created |
| seed.ts orchestration | Rewritten | Rewritten | ✓ Done |
| Build (`npm run build`) | Pass | Pass | ✓ Verified |
| Lint (`npm run lint`) | Pass | Pass | ✓ Verified |
| TypeScript (`npx tsc --noEmit`) | Pass | Pass | ✓ Verified |
| Schema compatibility | `module-X-lesson-Y` accepted | `module-X-lesson-Y` accepted | ✓ Verified |

---

## Remediation Checklist

- [ ] **C1:** Fix lesson slugs in IM1 M6, M8, M13 and IM2 M5 seed files to `module-X-lesson-Y`
- [ ] **C1:** Verify standards files match corrected slugs
- [ ] **C2:** Regenerate IM2 `activity-map.json` with `module-X-pXX` period IDs
- [ ] **C3:** Extend IM1 `activity-map.json` to cover all 260 periods (or scope-exclude)
- [ ] **C4:** Fix invalid control character in `IM1/module-7-p14.json`
- [ ] **M1:** Delete 71 old `seed_lesson_*.ts` files from IM2
- [ ] **M2:** Delete `units.ts` from both IM1 and IM2
- [ ] **M3:** Reconcile track status in tracks.md vs metadata.json vs spec.md
- [ ] **m1:** Standardize `exceptions.json` format (optional)
- [ ] **Post-fix:** Re-run build, lint, tsc --noEmit for both apps
- [ ] **Post-fix:** Verify seed orchestration runs without errors (dry-run or dev env)

---

## Review Notes

1. **The track should NOT be considered complete** until C1–C4 are resolved. The current state creates a facade of completeness: files exist, builds pass, but runtime seeding will silently drop standards and activity resolution will fail.

2. **The old `units.ts` file was the source of the slug format infection.** Whoever fixes C1 should verify no other files were generated from `units.ts` with the old format.

3. **Activity-map generation appears to have been copy-pasted from the old unit-based track** for IM2, and severely truncated for IM1. This suggests the implementation artifact phase was rushed.

4. **Measure hygiene:** Leaving plan checkboxes unchecked (Task 3.1) while marking the phase complete in the checkpoint is an anti-pattern. The plan should be updated to reflect what was actually done, or the work should be completed to match the plan.
