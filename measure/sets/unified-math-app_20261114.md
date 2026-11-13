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
| 2026-11-14 | scope and order | The set deletes the old app folders in the repository. The set does not change cloud resources (Cloudflare Workers, Convex deployments). The planned track `prod-deploy-pipeline_20261114` owns their inventory, their reuse, and their deletion. | user |
| 2026-11-14 | scope and order | Licensing is per seat (one student) per academic year. | user |
| 2026-11-14 | scope and order | The set runs after `vinext-oxc-toolchain_20261114` and before Practice Primitives Tracks A to F in `measure/tracks.md`. Tracks A to F depend on this set, because each primitive then goes into one app, not four. | user |
| 2026-11-14 | scope and order | `openrouter-sdk-ai-layer_20261114` runs before this set. Its IM3 paths move with the folder rename of member 1. | user (default of decision 4) |
| 2026-11-14 | split rule | One base member, one member for each imported course (one template group), one member that removes the old apps, then two platform features. The section "Member Changes" gives the changes to the suggested list. | user (suggested list), changed as recorded |
| 2026-11-14 | shared decision | The app folder is `apps/math`. Member 1 makes it with `git mv apps/integrated-math-3 apps/math`, so that the file history stays. | user (suggested name) |
| 2026-11-14 | shared decision | The math app has one Convex backend, one `AUTH_JWT_SECRET`, one Cloudflare Worker, and the cookie `bm_session`. | user |
| 2026-11-14 | shared decision | The course keys are `im1`, `im2`, `im3`, and `precalc`: the `MATH_COURSES` values in `packages/math-content/src/knowledge-space/ids.ts`. Each `courseKey` field and each `[course]` route segment uses these values. | `packages/math-content/src/knowledge-space/ids.ts` (default, see Open Questions) |
| 2026-05-04 | shared decision | Each `competency_standards` code is globally unique and has a course namespace. | `measure/product.md` |
| 2026-11-14 | shared decision | The namespaced code is `<prefix>.<source code>`, for example `IM3.HSA-SSE.B.3`. The prefixes are `IM1`, `IM2`, `IM3`, and `PC`. The field `sourceCode` keeps the code as the authority writes it. | default, see Open Questions |
| 2026-11-14 | shared decision | A lesson slug is unique in its course, not in the app: `module-2-lesson-1` is in IM1, IM2, and IM3. A route that reads curriculum rows has a `[course]` segment. | facts checked 2026-11-14 |
| 2026-11-14 | shared decision | An academic year is a string `YYYY-YYYY` with consecutive years, for example `2026-2027`. | default (the IM3 test fixtures use `2025-2026`) |
| 2026-11-14 | rule | The lockfile changes only because member folders move or go away (workspace entries). Each other dependency change needs the user's approval. | `AGENTS.md` and user decision 2 |
| 2026-11-14 | shared decision | Each math course uses the mastery-advantage graph (`/home/daniebo/Desktop/mastery-advantage`) as its graph source. The consumption contract is pending. Until it arrives, no member adds a graph authoring task, and each graph task reads the graph files that exist today. | user (Daniel, through the PM orchestrator) |
| 2026-11-14 | rule | Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114` sets them, and ends with the Phase Completion Verification and Checkpointing Protocol. | user, `measure/workflow.md` |
| 2026-11-14 | rule | After closeout, each member syncs with origin: `git fetch origin`, `git pull --ff-only origin master`, then `git push origin master`. If the pull cannot fast-forward, stop and report. | user |

## Members

| Order | Track | Type | Scope | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | [math-app-base_20261114](../tracks/math-app-base_20261114/) | feature | Move IM3 to `apps/math` and its curriculum to `curriculum/im3/`. Add the course data model, course routes, and one theme for each course. | `vinext-oxc-toolchain_20261114`, `openrouter-sdk-ai-layer_20261114` | new |
| 2 | [math-app-course-im1_20261114](../tracks/math-app-course-im1_20261114/) | feature | Import Integrated Math 1 as course data, then delete `apps/integrated-math-1`. | `math-app-base_20261114` | new |
| 2 | [math-app-course-im2_20261114](../tracks/math-app-course-im2_20261114/) | feature | Import Integrated Math 2 as course data, then delete `apps/integrated-math-2`. | `math-app-base_20261114` | new |
| 2 | [math-app-course-precalc_20261114](../tracks/math-app-course-precalc_20261114/) | feature | Import AP Precalculus as course data, with its own theme, then delete `apps/pre-calculus`. | `math-app-base_20261114` | new |
| 3 | [math-app-retire-old-apps_20261114](../tracks/math-app-retire-old-apps_20261114/) | chore | Remove each remaining reference to the four old apps. Update the project documents and the Scope section of `AGENTS.md`. Add a guard test. | `math-app-course-im1_20261114`, `math-app-course-im2_20261114`, `math-app-course-precalc_20261114` | new |
| 4 | [math-app-student-history_20261114](../tracks/math-app-student-history_20261114/) | feature | One student profile across courses and years: enrollment history, year rollover, teacher views by year, and knowledge state that uses earlier courses. | `math-app-retire-old-apps_20261114` | new |
| 5 | [math-app-seat-licensing_20261114](../tracks/math-app-seat-licensing_20261114/) | feature | Licenses for each organization and academic year with a seat count, seat assignment at enrollment, enforcement, and an admin view. | `math-app-student-history_20261114` | new |

## Member Changes

The suggested list had 7 members. The set keeps 7 members, with two changes:

1. **The removal of the old apps moves from order 7 to order 3.** After the course imports, the old apps hold no content. The change stops CI from building three empty apps, and it makes the documents name one math app before new feature work starts.
2. **Each course import deletes its own old app folder.** A course import moves the curriculum and the seeds with `git mv`. After the move, the old app cannot build, and CI fails. So each import removes its old app from CI and from the root scripts, and deletes the rest of the folder. The retire member keeps the documents, the Scope section of `AGENTS.md`, and the final sweep.

## Notes

- **Cloud resources:** The user decision of 2026-11-14 for `prod-deploy-pipeline_20261114` replaces the part of decision 2 that made cloud cleanup a manual step: the orchestrator manages deploys and the deletion of unused cloud resources. No member of this set deploys or deletes a cloud resource.
- **Worker name:** Member 1 keeps the Worker name `integrated-math-3` in `wrangler.jsonc`. `prod-deploy-pipeline_20261114` decides to reuse or replace that Worker and its Convex project after its inventory.

## Open Dependencies

- **Graph source: mastery-advantage, contract pending (2026-11-14).** These members read or
  build a graph: `math-app-base_20261114` (the course graph loader, D6a),
  `math-app-course-im1_20261114`, `math-app-course-im2_20261114`, and
  `math-app-course-precalc_20261114` (the course graph entry and the cross-course edges,
  FR-4), and `math-app-student-history_20261114` (the cross-course edges at runtime, D7).
  When the PM orchestrator sends the contract, the orchestrator amends these tasks.

## Open Questions

- Q1 (set): The track IDs use hyphens (`math-app-base`), as the other tracks of the repository do. The Measure workflow suggests underscores. Default: hyphens.
- Q2 (`math-app-base_20261114`): The course keys are the `MATH_COURSES` values (`im1`, `im2`, `im3`, `precalc`). The current `objective_policies` seed and the glossary use `integrated-math-3`. Default: `MATH_COURSES` values; the course members change the old literals.
- Q3 (`math-app-base_20261114`): `measure/product.md` gives `IM1.A.REI.B.3` as an example. The seeds use other code forms (`HSA-SSE.B.3`, `A-CED.A.1`, `6.EE.A.1`). Default: prefix plus the code as seeded, with no rewrite of the code body. The AP Precalculus prefix is `PC`.
- Q4 (`math-app-base_20261114`): The app folder name. Default: `apps/math`.
- Q5 (`math-app-seat-licensing_20261114`): Who makes a license? Default: an internal Convex mutation that the operator runs with `npx convex run`. The organization admin can see licenses and release seats, but cannot make licenses.
- Q6 (`math-app-seat-licensing_20261114`): Does one seat cover each math course of the student in that year? Default: yes. One seat covers one student in one organization for one academic year, for all courses of the product `math`.
