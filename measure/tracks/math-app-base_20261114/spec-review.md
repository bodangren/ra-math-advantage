# Spec Review: math-app-base_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves the IM3 app to `apps/math` with `git mv` and moves its curriculum to `apps/math/curriculum/im3/`. It adds a `courses` table and a course registry module, and it gives `lessons`, `competency_standards`, and `practice_variants` a required `courseKey`. It makes `classes.courseKey` and `classes.academicYear` required, and it namespaces each standard code as `<standardPrefix>.<sourceCode>`. It adds a `[course]` route segment for each curriculum page, and it gives each course a theme block on a `data-course` wrapper. IM3 is the only course at the end of this track.

### How the current system works, per this spec

One IM3 app lives at `apps/integrated-math-3` with about 1,580 files in `app/`, `components/`, `lib/`, `convex/`, `__tests__/`, and `curriculum/`. The Convex schema has 40 tables; `classes` has an optional `academicYear` and no course field, and lesson slugs and standard codes collide across the four apps. Each objective ID is a `competency_standards.code`, and `convex/queue/queue.ts` reads the policies with the literal `"integrated-math-3"`. `lib/curriculum/skill-graph-loader.ts` loads one static IM3 graph, and six scripts hardcode curriculum paths for the four apps. 57 files outside the app and outside `measure/` name `integrated-math-3`, and the Worker name in `wrangler.jsonc` is `integrated-math-3`. The theme is one IM3 palette in `app/globals.css`.

### Findings
- F1 [Major] plan.md Phase S3 Implement: The plan changes the `/` page to list the active courses of the registry, but spec.md names no such change and decision D7 says other pages do not change. Rationale: A plan step beyond the spec is a speculative feature; the spec needs a decision for this page or the step needs removal.
- F2 [Nit] plan.md Phase S3 Implement: The teacher navigation course switcher has no spec decision for its control type or placement; only its test behavior is fixed. Rationale: The spec story covers a list of courses, but this UI element needs one spec line so the implementer does not choose its shape.

### Author Response
- F1: FIX (spec D7 now names the change of `/`, Story S3 has a criterion for it, and the S3 Test task has a test for it)
- F2: DECLINE

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves the IM3 app to `apps/math` with `git mv` and moves its curriculum to `apps/math/curriculum/im3/`. It adds a `courses` table and a course registry module, and it gives `lessons`, `competency_standards`, and `practice_variants` a required `courseKey`. It makes `classes.courseKey` and `classes.academicYear` required, and it namespaces each standard code as `<standardPrefix>.<sourceCode>`. It adds a `[course]` route segment for each curriculum page, it makes the landing page `/` list the active courses with a link to `/curriculum/[course]`, and it gives each course a theme block on a `data-course` wrapper. IM3 is the only course at the end of this track.

### How the current system works, per this spec

One IM3 app lives at `apps/integrated-math-3` with about 1,580 files in `app/`, `components/`, `lib/`, `convex/`, `__tests__/`, and `curriculum/`. The Convex schema has 40 tables; `classes` has an optional `academicYear` and no course field, and lesson slugs and standard codes collide across the four apps. Each objective ID is a `competency_standards.code`, and `convex/queue/queue.ts` reads the policies with the literal `"integrated-math-3"`. `lib/curriculum/skill-graph-loader.ts` loads one static IM3 graph, and six scripts hardcode curriculum paths for the four apps. 57 files outside the app and outside `measure/` name `integrated-math-3`, and the Worker name in `wrangler.jsonc` is `integrated-math-3`. The theme is one IM3 palette in `app/globals.css`.

### Findings
- None

### Author Note

After Round 2, the author added a "Closeout" section to plan.md: the Measure closeout and the origin sync of the spec NFR. The change applies finding F1 of `math-app-retire-old-apps_20261114` to each member of the set. It adds no new requirement.

## Round 3

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)
Cause: the revision of 2026-11-14 (Convex Auth v2, the merged graph contract, the CCSS rule, and the cloud inventory). The spec and the plan changed after Round 2.

### What this track proposes

This track moves the IM3 app to `apps/math` with `git mv` and moves its curriculum to `apps/math/curriculum/im3/`. It replaces the custom JWT auth with Convex Auth v2 (username and password) after a spike proves path A under vinext 1.x. It adds a `courses` table and a course registry, gives `lessons` and `practice_variants` a required `courseKey`, and makes `classes.courseKey` and `classes.academicYear` required. Competencies are canonical CCSS codes, one graph serves all courses through `courseView`, and each course page lives under a `[course]` route segment with a course theme. After Round 2 the plan also gained a Closeout section: the Measure closeout steps, then `git fetch`, `git pull --ff-only`, and `git push` to origin master.

### How the current system works, per this spec

One IM3 app lives at `apps/integrated-math-3` with about 1,580 files across `app/`, `components/`, `lib/`, `convex/`, `__tests__/`, and `curriculum/`. A custom JWT session in `packages/core-auth` signs the `bm_session` cookie, and 32 server files call Convex through `fetchInternalQuery`/`fetchInternalMutation` with `CONVEX_DEPLOY_KEY`. The schema has 40 tables; `classes` has an optional `academicYear` and no course field, and lesson slugs and standard codes collide across the four apps. `lib/curriculum/skill-graph-loader.ts` loads one static IM3 graph, and `convex/queue/queue.ts` reads objective policies with the literal `"integrated-math-3"`. 57 files outside the app name `integrated-math-3`, and the theme is one IM3 palette in `app/globals.css`.

### Findings

- F3 [Nit] plan.md Closeout: The task says "the Measure `implement` workflow, sections 3.0 to 5.0", but the plan header resolves the Workflow to `measure/workflow.md`, which has no numbered sections 3.0 to 5.0; those sections live in the measure skill's `references/implement.md`. Rationale: The listed items (metadata, registry, set overview, generated facts, archive choice) match `implement.md` §3.4 to §5.0, so the implementer can recover, but a document name or path removes the lookup step.
- F4 [Nit] plan.md Closeout: The task says "sections 3.0 to 5.0" but the item list covers only the finalize, generate, and cleanup parts (§3.4 to §5.0), not §3.1 to §3.3. Rationale: An implementer who starts at §3.0 re-runs steps the phases already did; "§3.4 to §5.0" states the intent.

### Author Response

- F3: DECLINE
- F4: DECLINE

### Author Note

After Round 3, the author applied finding F5 of `math-app-course-precalc_20261114` and of `math-app-course-im2_20261114` (a Blocker in the same pattern) to this track. The NFR on the graph files now allows a change of the source path strings in a moved graph file, and the S1 task "move the IM3 curriculum" changes these strings. The S1 Contract also lists the files inside the app that name `integrated-math-3`. The change adds no new requirement, so no re-review ran.

### Author Note (2026-11-14, second)

Round 1 of `bm2-convex-auth-v2_20261114` found (F2, Blocker) that the auth provider of BM2 is a re-export of the shared context of `packages/app-shell`. The math app has the same re-export in `components/auth/AuthProvider.tsx`, `components/user-menu.tsx`, and `components/logout-button.tsx`. A change of the shared context in this track stops the sign-in of BM2. So the author added decision DA2a: the math app gets local files, and the track does not change `packages/app-shell`. The S3 Contract and the S3 Implement task name the three files. This fix had no review, because the PM machine load rule of 2026-11-14 limits the reviews.

## Accepted Risks

- BM2 F2 pattern (DA2a): fixed after the last review round of this track, with no review of the fix. The fix names three files of the math app and forbids a change of `packages/app-shell`.
