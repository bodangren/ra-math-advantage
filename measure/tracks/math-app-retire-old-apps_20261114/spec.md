# Track: Unified Math App: Retire the Old Math Apps

Type: Chore
Spec format: Classic FR list
Depends on: `math-app-course-im1_20261114`, `math-app-course-im2_20261114`,
`math-app-course-precalc_20261114`

## Overview

After the three course imports, the repository has one math app (`apps/math`) and BM2.
This track removes each remaining reference to the four old math apps, and it updates the
project documents so that they describe one math app with courses as data. It makes the
path guard final. It changes no app behavior.

## Track Set

This track is member 3 of the track set [Unified Math App](../../sets/unified-math-app_20261114.md). Depends on: `math-app-course-im1_20261114`, `math-app-course-im2_20261114`, `math-app-course-precalc_20261114`. The shared decisions and the start gate in the set overview apply to this track.

## Current System (expected at the start; checked 2026-11-14 before the set)

- The course imports delete `apps/integrated-math-1`, `apps/integrated-math-2`, and
  `apps/pre-calculus`. The base track moves `apps/integrated-math-3` to `apps/math`.
- `scripts/__tests__/old-app-path-guard.test.ts` (from the base track and the imports) has a
  case for each old app name that its track removed, with the list `KEEP_PATHS`.
- The documents that describe four math apps (checked 2026-11-14):
  - `AGENTS.md`: the title "AGENTS -- Integrated Math 3", the Scope section, and the
    "Where to Look" table.
  - `measure/index.md`: the title "Measure Index — Integrated Math 3" and the section
    "Per-App Definitions" (Product Definition, Product Guidelines, Design Definitions).
  - `measure/product.md`: the app table (line 17 names `apps/integrated-math-1/` as
    "Scaffold in progress") and the section "Global Competency Standard Codes".
  - `measure/architecture.md`, `measure/tech-stack.md`, `measure/knowledge-space.md`, and
    `measure/practice-primitives-roadmap.md` describe the apps, one Convex backend for each
    app, and the adoption across IM1, IM2, IM3, and PreCalc.
  - `README.md` and `INTEGRATION.md` name the old apps.
- `measure/tracks.md` has open entries and program sections that name the old apps (for
  example "## AP Precalculus", "## Integrated Math 2", "## Integrated Math 1", and
  "## Multi-App Curriculum Program").

## Functional Requirements

- **FR-1 Final guard:** `REMOVED_APPS` in `scripts/__tests__/old-app-path-guard.test.ts` has
  `integrated-math-1`, `integrated-math-2`, `integrated-math-3`, and `pre-calculus`.
  `KEEP_PATHS` has only `measure/**`, `graph.db`, `*.log` files, the audit fixtures that the
  member evidence files list, and the Worker name line in `apps/math/wrangler.jsonc`. The
  guard passes.
- **FR-2 Remaining references:** change or remove each reference that the guard finds
  outside `KEEP_PATHS`. `.github/workflows/ci.yml` has no `im1-im2-precalc` job. The root
  `package.json` has no `ws:im1:*`, `ws:im2:*`, `ws:pc:*`, or `ws:im3:*` script.
- **FR-3 AGENTS.md:** the title names the math platform. The Scope section says: edit
  `apps/math/` and `apps/bus-math-v2/`; a course is data in `apps/math` (registry,
  curriculum folder, seeds, theme block); a new course is not a new app. "Where to Look"
  names `apps/math/curriculum/<course key>/`, `apps/math/lib/courses/registry.ts`, and the
  set overview.
- **FR-4 measure/index.md:** the title names the math platform. "Per-App Definitions" has
  one math app row, one BM2 row, and one row for each course document folder
  (`apps/math/docs/courses/<course key>/`).
- **FR-5 Product and architecture documents:** `measure/product.md`,
  `measure/architecture.md`, `measure/tech-stack.md`, `measure/knowledge-space.md`, and
  `measure/practice-primitives-roadmap.md` describe one math app with four courses, one
  Convex backend, one `AUTH_JWT_SECRET`, and one Worker for the math app. The section
  "Global Competency Standard Codes" of `product.md` gives the implemented form
  `<prefix>.<source code>` and the prefixes `IM1`, `IM2`, `IM3`, and `PC`. The roadmap says
  that each primitive goes into `apps/math` once. Do not change the Deployment section of
  `tech-stack.md`; `prod-deploy-pipeline_20261114` owns it.
- **FR-6 README and integration notes:** `README.md` and `INTEGRATION.md` name `apps/math`
  and its courses, and BM2.
- **FR-7 Open registry entries:** list each open entry (`[ ]`) of `measure/tracks.md` whose
  text names an old app. Record the list in the evidence file, and report it at closeout.
  Do not change these entries.

## Non-Functional Requirements

- The track changes no app code, no test behavior other than the guard, and no dependency.
- Do not change `measure/archive/**`, the audit reports under `measure/`, or other history
  documents. They keep the old names as history.
- Do not change `graph.db` or `apps/bus-math-v2`.
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: The guard passes with the four old app names and the final `KEEP_PATHS`.
- AC2: `ci.yml` has the jobs `packages`, `boundary-check`, `math`, `e2e-math`, and `bm2`,
  and no job for an old app.
- AC3: `AGENTS.md` Scope names `apps/math/` and `apps/bus-math-v2/` only, and it says that a
  course is data.
- AC4: `measure/index.md` and the documents of FR-5 describe one math app with four courses.
- AC5: The evidence file lists the open registry entries that name an old app.
- AC6: Each gate passes.

## Out of Scope

- Cloud resources and the Deployment section of `tech-stack.md`
  (`prod-deploy-pipeline_20261114`).
- Changes to closed tracks, archived tracks, and audit reports.
- Changes to the open registry entries of FR-7.
