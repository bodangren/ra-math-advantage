# Track Set: Unified Math App

- **Set ID:** `unified-math-app_20261114`
- **Status:** new
- **Created:** 2026-11-14
- **Goal:** One math app in `apps/math` serves Integrated Math 1, 2, and 3 and AP Precalculus as course data, with one student account and one history across courses and academic years, and with seat licenses for each student for each academic year.
- **Start gate:** none

## Shared Decisions

| Date | Topic | Decision | Source |
| --- | --- | --- | --- |
| 2026-11-14 | scope and order | Replace `apps/integrated-math-1`, `apps/integrated-math-2`, `apps/integrated-math-3`, and `apps/pre-calculus` with one math app where a course is data. A new course (for example AP Calculus or AP Statistics) is course data plus new components, not a new app. | user |
| 2026-11-14 | scope and order | BM2 (`apps/bus-math-v2`) stays a separate app, with a later review. No member changes BM2. The platform layer (organizations, accounts, licenses, classes, academic years, auth, rate limits) must let BM2 join later as a course with its own modules. | user |
| 2026-11-14 | scope and order | No app is live. No app had users or real data. So the set has no data migration, no redirects, and no user communication. | user |
| 2026-11-14 | scope and order | The set deletes the old app folders in the repository. Member 3 deletes the three empty Convex projects of the old apps (`integrated-math-1`, `integrated-math-2`, `pre-calculus`) through the Convex Management API. No other member changes a cloud resource. The planned track `prod-deploy-pipeline_20261114` owns the Workers and the other Convex projects. | user; orchestrator (cloud inventory, 2026-11-14) |
| 2026-11-14 | rule | Daniel authorized the orchestrator to run production deploys and to delete the old cloud resources of this repository. This replaces the global rule "deploys and deletions are human gates" for this project only. | Daniel, through the orchestrator |
| 2026-11-14 | scope and order | Licensing is per seat (one student) per academic year. | user |
| 2026-11-14 | scope and order | The set runs after `vinext-oxc-toolchain_20261114` and before Practice Primitives Tracks A to F in `measure/tracks.md`. Tracks A to F depend on this set, because each primitive then goes into one app, not four. | user |
| 2026-11-14 | scope and order | `openrouter-sdk-ai-layer_20261114` runs before this set. Its IM3 paths move with the folder rename of member 1. | user (default of decision 4) |
| 2026-11-14 | split rule | One base member, one member for each imported course (one template group), one member that removes the old apps, then two platform features. The section "Member Changes" gives the changes to the suggested list. | user (suggested list), changed as recorded |
| 2026-11-14 | shared decision | The app folder is `apps/math`. Member 1 makes it with `git mv apps/integrated-math-3 apps/math`, so that the file history stays. | user (suggested name) |
| 2026-11-14 | shared decision | The math app has one Convex backend and one Cloudflare Worker. | user |
| 2026-11-14 | shared decision | The math app uses Convex Auth v2 (`@convex-dev/auth` 2.x) with username and password from the start. A spike in member 1 proves it under vinext 1.x first. The cookie `bm_session`, `auth_credentials`, `packages/core-auth`, and `AUTH_JWT_SECRET` do not go into the math app. Teachers make student accounts; there is no self sign-up. `sessionMaxLifetimeSeconds` stays at 30 days. The dependency and the `convex` upgrade that it needs are approved. | orchestrator (Convex Auth v2 decision, 2026-11-14) |
| 2026-11-14 | shared decision | The course keys are `im1`, `im2`, `im3`, and `precalc`: the `MATH_COURSES` values in `packages/math-content/src/knowledge-space/ids.ts`. Each `courseKey` field and each `[course]` route segment uses these values. | `packages/math-content/src/knowledge-space/ids.ts` (default, see Open Questions) |
| 2026-05-04 | shared decision | Each `competency_standards` code is globally unique and has a course namespace. Replaced on 2026-11-14 by the next row. | `measure/product.md` |
| 2026-11-14 | shared decision | A competency is a CCSS standard, and it is course-neutral: one row for each CCSS code, shared by each course that teaches it. The code is the canonical CCSS code (`canonicalCcssCode` puts `HS` before a high school code without it). Evidence on a shared competency counts in each course, with no transfer step. Teacher reporting shows the CCSS code. The `IM1.A.REI.B.3` form goes away. | graph contract and CCSS rule (PM and Daniel, 2026-11-14); default form, see Open Questions |
| 2026-11-14 | rule | Where the app shows CCSS text, it shows the CCSS copyright notice. The app shows no College Board text from the graph; an AP node shows its AP code only. | PM decision (A-58 change 2) |
| 2026-11-14 | shared decision | A lesson slug is unique in its course, not in the app: `module-2-lesson-1` is in IM1, IM2, and IM3. A route that reads curriculum rows has a `[course]` segment. | facts checked 2026-11-14 |
| 2026-11-14 | shared decision | An academic year is a string `YYYY-YYYY` with consecutive years, for example `2026-2027`. | default (the IM3 test fixtures use `2025-2026`) |
| 2026-11-14 | rule | The lockfile changes only because member folders move or go away (workspace entries). Each other dependency change needs the user's approval. | `AGENTS.md` and user decision 2 |
| 2026-11-14 | shared decision | Each math course uses the mastery-advantage graph (`/home/daniebo/Desktop/mastery-advantage`) as its graph source. mastery-advantage releases one merged domain, `math.us-hs` (default name), for IM1, IM2, IM3, and AP Precalculus ("IM1 to Precalc"). Skill IDs are course-neutral (`math.us-hs.skill.<id>`). Courses, modules, and lessons are container nodes. Each learnable node has a primary CCSS tag. The app reads one graph, and each course is a view of it. No member adds a graph authoring task. Each graph task reads the graph files that exist today. The track Consume the mastery-advantage Math Graph changes the graph source after the set. | user (Daniel, through the PM orchestrator); graph contract of 2026-11-14 |
| 2026-11-14 | rule | Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114` sets them, and ends with the Phase Completion Verification and Checkpointing Protocol. | user, `measure/workflow.md` |
| 2026-11-14 | rule | After closeout, each member syncs with origin: `git fetch origin`, `git pull --ff-only origin master`, then `git push origin master`. If the pull cannot fast-forward, stop and report. | user |

## Members

| Order | Track | Type | Scope | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | [math-app-base_20261114](../tracks/math-app-base_20261114/) | feature | Move IM3 to `apps/math` and its curriculum to `curriculum/im3/`. Prove Convex Auth v2 under vinext 1.x, then move the accounts and the sign-in to it. Add the course data model with CCSS competencies and one graph, course routes, and one theme for each course. | `vinext-oxc-toolchain_20261114`, `openrouter-sdk-ai-layer_20261114` | new |
| 2 | [math-app-course-im1_20261114](../tracks/math-app-course-im1_20261114/) | feature | Import Integrated Math 1 as course data, then delete `apps/integrated-math-1`. | `math-app-base_20261114` | new |
| 2 | [math-app-course-im2_20261114](../tracks/math-app-course-im2_20261114/) | feature | Import Integrated Math 2 as course data, then delete `apps/integrated-math-2`. | `math-app-base_20261114` | new |
| 2 | [math-app-course-precalc_20261114](../tracks/math-app-course-precalc_20261114/) | feature | Import AP Precalculus as course data, with its own theme, then delete `apps/pre-calculus`. | `math-app-base_20261114` | new |
| 3 | [math-app-retire-old-apps_20261114](../tracks/math-app-retire-old-apps_20261114/) | chore | Remove each remaining reference to the four old apps. Update the project documents and the Scope section of `AGENTS.md`. Add a guard test. Delete the three empty Convex projects of the old apps. | `math-app-course-im1_20261114`, `math-app-course-im2_20261114`, `math-app-course-precalc_20261114` | new |
| 4 | [math-app-student-history_20261114](../tracks/math-app-student-history_20261114/) | feature | One student profile across courses and years: enrollment history, year rollover, teacher views by year, and knowledge state that uses earlier courses through the one graph, with no transfer step. | `math-app-retire-old-apps_20261114` | new |
| 5 | [math-app-seat-licensing_20261114](../tracks/math-app-seat-licensing_20261114/) | feature | Licenses for each organization and academic year with a seat count, seat assignment at enrollment, enforcement, and an admin view. | `math-app-student-history_20261114` | new |

## Member Changes

The suggested list had 7 members. The set keeps 7 members, with two changes:

1. **The removal of the old apps moves from order 7 to order 3.** After the course imports, the old apps hold no content. The change stops CI from building three empty apps, and it makes the documents name one math app before new feature work starts.
2. **Each course import deletes its own old app folder.** A course import moves the curriculum and the seeds with `git mv`. After the move, the old app cannot build, and CI fails. So each import removes its old app from CI and from the root scripts, and deletes the rest of the folder. The retire member keeps the documents, the Scope section of `AGENTS.md`, and the final sweep.

## Notes

- **Cloud resources:** The user decision of 2026-11-14 for `prod-deploy-pipeline_20261114` replaces the part of decision 2 that made cloud cleanup a manual step: the orchestrator manages deploys and the deletion of unused cloud resources. In this set, only member 3 deletes cloud resources: the three empty Convex projects. No member deploys.
- **Cloud inventory (read-only, 2026-11-14):** Cloudflare account `0f8cef508e69d2446315a1c80042da20` has the Workers `bus-math-v2` and `integrated-math-3` only, on workers.dev, with no routes and no requests in 4 weeks. Convex team "bodangren" (`435396`) has `integrated-math-3` (`2960816`, dev deployment `accurate-labrador-817`), `bus-math-v2-experimental` (`1720191`, prod deployment `quiet-swan-141`), `integrated-math-1` (`2015980`), `integrated-math-2` (`2015859`), and `pre-calculus` (`2897579`) with no deployments, `danielson` (`2841695`, keep), and `codex-convex-probe` (never touch).
- **Worker name:** Member 1 keeps the Worker name `integrated-math-3` in `wrangler.jsonc`. `prod-deploy-pipeline_20261114` decides to reuse or replace that Worker and its Convex project.
- **Graph model before the release:** the graph files of each course stay in the app until the track Consume the mastery-advantage Math Graph. They hold one skill node for each course. So until then, a skill that two courses teach shares evidence only through its CCSS standard nodes (`math-app-student-history_20261114` D6a).

## Open Dependencies

- **Graph source: mastery-advantage (contract of 2026-11-14).** One merged domain,
  `math.us-hs`, for IM1 to AP Precalculus, with course-neutral skill IDs and courses as
  container nodes. Each learnable node has a primary CCSS tag; an AP Precalculus node with
  no fitting CCSS standard keeps its AP code and goes on the PM-approved exception list.
  The confirmation of the ID scheme has the target date 2026-11-21.
  - Members 1, 2 (each import), and 4 use the one-graph model and read the graph files
    that exist today. If the scheme is not confirmed when member 1 Story S4 starts, member 1
    uses its defaults and records them.
  - The track Consume the mastery-advantage Math Graph (after the set and after the track
    KST Spec v3.2 Runtime Migration) replaces the graph files with the released file.

## Open Questions

- Q1 (set): The track IDs use hyphens (`math-app-base`), as the other tracks of the repository do. The Measure workflow suggests underscores. Default: hyphens.
- Q2 (`math-app-base_20261114`): The course keys are the `MATH_COURSES` values (`im1`, `im2`, `im3`, `precalc`). The current `objective_policies` seed and the glossary use `integrated-math-3`. Default: `MATH_COURSES` values; the course members change the old literals.
- Q3 (`math-app-base_20261114`): The seeds write high school CCSS codes in two forms (`HSA-SSE.B.3` in IM3 and AP Precalculus, `A-SSE.B.3` in IM1 and IM2). Default: the canonical form has the `HS` prefix (`canonicalCcssCode`), until the released graph gives the code in `metadata.code`. This replaces the earlier default of course prefixes (`IM1`, `IM2`, `IM3`, `PC`).
- Q7 (`math-app-base_20261114`): Convex Auth v2 needs `convex` `^1.48.0`; the lockfile holds 1.40.0. The lockfile has one `convex` version, so BM2 and the packages also get the new version. Default: the approval of Convex Auth v2 covers this upgrade, and the BM2 gate shows the effect.
- Q8 (`math-app-base_20261114`): If path A of the spike fails, should the spike try the framework-neutral `@convex-dev/auth/ssr` handlers before the React client fallback? Default: no. The track uses the React client fallback (path B), as the orchestrator decided, and records the failure.
- Q9 (`math-app-base_20261114`): The demo password `Demo1234!` fails the minimum of 10 characters. Default: `DemoMath-2026!` for the dev demo accounts, and no demo seed on a production deployment.
- Q4 (`math-app-base_20261114`): The app folder name. Default: `apps/math`.
- Q5 (`math-app-seat-licensing_20261114`): Who makes a license? Default: an internal Convex mutation that the operator runs with `npx convex run`. The organization admin can see licenses and release seats, but cannot make licenses.
- Q6 (`math-app-seat-licensing_20261114`): Does one seat cover each math course of the student in that year? Default: yes. One seat covers one student in one organization for one academic year, for all courses of the product `math`.
