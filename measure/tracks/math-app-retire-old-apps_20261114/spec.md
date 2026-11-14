# Track: Unified Math App: Retire the Old Math Apps

Type: Chore
Spec format: Classic FR list
Depends on: `math-app-course-im1_20261114`, `math-app-course-im2_20261114`,
`math-app-course-precalc_20261114`

## Overview

After the three course imports, the repository has one math app (`apps/math`) and BM2.
This track removes each remaining reference to the four old math apps, and it updates the
project documents so that they describe one math app with courses as data. It makes the
path guard final. It deletes the three empty Convex projects of the old apps. It changes no
app behavior.

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
- **Cloud inventory (read-only, 2026-11-14):**
  - Cloudflare account `0f8cef508e69d2446315a1c80042da20` has the Workers `bus-math-v2` and
    `integrated-math-3` only. No Worker of IM1, IM2, or AP Precalculus exists.
  - Convex team "bodangren" (ID `435396`) has these projects:
    - `integrated-math-3` (`2960816`): the dev deployment `accurate-labrador-817`. Keep it.
    - `bus-math-v2-experimental` (`1720191`): the prod deployment `quiet-swan-141`. Keep it.
    - `integrated-math-1` (`2015980`), `integrated-math-2` (`2015859`), and `pre-calculus`
      (`2897579`): no deployments. Delete them (FR-8).
    - `danielson` (`2841695`): keep it for later.
    - `codex-convex-probe`: never touch it.
- **Delete method:** the Convex CLI has no project delete command. The Convex Management
  API (OpenAPI at `https://api.convex.dev/v1/openapi.json`, read 2026-11-14) has
  `GET /v1/teams/{team_id}/projects`, `GET /v1/projects/{project_id}/list_deployments`, and
  `POST /v1/projects/{project_id}/delete`. The delete also deletes each deployment of the
  project. These calls need a team access token (Bearer). A deploy key cannot list or
  delete projects.
- **Authorization:** Daniel authorized the orchestrator to run production deploys and to
  delete the old cloud resources of this repository (2026-11-14). This replaces the global
  rule "deploys and deletions are human gates" for this project only.

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
  Convex backend with Convex Auth v2, and one Worker for the math app. They describe one
  skill graph with each course as a view (`math-app-base_20261114` D6a).
  - The section "Global Competency Standard Codes" of `product.md` gives the rule of
    `math-app-base_20261114` D5: a competency is a course-neutral CCSS code in canonical
    form. After the track Consume the mastery-advantage Math Graph, the CCSS code comes from
    the graph. The `IM1.A.REI.B.3` form and the rule of 2026-05-04 go away.
  - The section also says: teacher reporting shows the CCSS code; where the app shows CCSS
    text, it shows the CCSS copyright notice; the app shows no College Board text, and an AP
    node shows its AP code only (PM decisions, 2026-11-14).
  - The roadmap says that each primitive goes into `apps/math` once.
  - Do not change the Deployment section of `tech-stack.md`; `prod-deploy-pipeline_20261114`
    owns it.
- **FR-6 README and integration notes:** `README.md` and `INTEGRATION.md` name `apps/math`
  and its courses, and BM2.
- **FR-6a Planned markers:** `docs-new-direction_20261114` marks each direction item with
  `(planned: <track id>)` (`AGENTS.md`, "Planned Marker Rule"). In the documents of FR-3 to
  FR-6, each marker that names `math-app-base_20261114`, a course import track, or this
  track changes into current-state text, and the marker goes away. A marker that names
  another track stays, because that track is not complete.
- **FR-7 Open registry entries:** list each open entry (`[ ]`) of `measure/tracks.md` whose
  text names an old app. Record the list in the evidence file, and report it at closeout.
  Do not change these entries.
- **FR-8 Delete the empty Convex projects:** the orchestrator deletes the Convex projects
  `integrated-math-1` (`2015980`), `integrated-math-2` (`2015859`), and `pre-calculus`
  (`2897579`) of team `435396`.
  - The orchestrator gets a team access token from Daniel through a secret card. The token
    lives only in the environment of the command that uses it.
  - Before each delete, the orchestrator lists the projects of the team and the deployments
    of the project. It deletes a project only when its ID and its name match the list above
    and the project has no deployment. Otherwise it stops and reports.
  - The delete call is `POST https://api.convex.dev/v1/projects/{project_id}/delete`. If
    the API refuses the token, Daniel deletes the projects in the Convex dashboard, and the
    orchestrator checks the result with the list call.
  - The orchestrator never changes `integrated-math-3`, `bus-math-v2-experimental`,
    `danielson`, or `codex-convex-probe`.
  - The orchestrator confirms that no Worker named `integrated-math-1`,
    `integrated-math-2`, or `pre-calculus` exists: `npx wrangler deployments list --name
    <name>` reports that the Worker does not exist. If one exists, stop and report, because
    `prod-deploy-pipeline_20261114` owns the Workers.
  - The evidence file records each list result and each delete result, with no token.

## Non-Functional Requirements

- The track changes no app code, no test behavior other than the guard, and no dependency.
- The track changes no cloud resource other than the three projects of FR-8.
- No token goes into a file, a commit, a log, or the evidence file.
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
- AC7: The project list of team `435396` has no `integrated-math-1`, `integrated-math-2`,
  or `pre-calculus` project. The projects `integrated-math-3`, `bus-math-v2-experimental`,
  `danielson`, and `codex-convex-probe` are on the list with no change.

## Out of Scope

- The Workers, the Convex projects `integrated-math-3` and `bus-math-v2-experimental`, and
  the Deployment section of `tech-stack.md` (`prod-deploy-pipeline_20261114`).
- The Convex project `danielson` (a later track).
- Changes to closed tracks, archived tracks, and audit reports.
- Changes to the open registry entries of FR-7.
