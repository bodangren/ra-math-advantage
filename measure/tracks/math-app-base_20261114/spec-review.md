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

## Accepted Risks

None.
