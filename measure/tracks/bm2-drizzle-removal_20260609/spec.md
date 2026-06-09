# Track: BM2 Drizzle Dead-Layer Removal

Program: Monorepo Migration Program (cleanup)
Type: Chore
Depends on: none (BM2 server logic already on Convex)

## Overview

`apps/bus-math-v2` moved its data path to Convex, but the legacy
Drizzle/Postgres source layer (`lib/db/schema/*`, `lib/db/drizzle.ts`,
`drizzle.config.ts`) and the `drizzle-kit`/`drizzle-orm`/`drizzle-zod`/`postgres`
dependencies were never removed. This contradicts `tech-stack.md` ("no legacy
layers in the data path") and was flagged in the 2026-06-09 structural audit.

A prior session (`current_directive.md`, "Strategic Detour") **began** the
removal — deleting the schema files and dropping the deps in the working tree —
but the change is **incomplete and build-breaking**: the deleted
`lib/db/schema/*` files mixed dead Drizzle table definitions (`pgTable(...)`,
`drizzle-zod` derived validators) with **live, still-consumed** zod schemas and
inferred types. ~15 unmodified files still import the deleted paths and
`drizzle-orm`, so BM2 no longer typechecks or builds.

## Live (must-survive) exports tangled into the deleted files

- `phase-content.ts` → `contentBlockSchema`, `phaseMetadataSchema`, `ContentBlock`
- `activity-props.ts` (+ `activities-*` siblings) → `activityPropsSchemas`, per-kind prop schemas
- `activities.ts` → `gradingConfigSchema`, activity prop wiring; `ActivityComponentKey` (via component-keys)
- `activity-submissions.ts` → `submissionDataSchema` (= `practiceSubmissionEnvelopeSchema`), `SubmissionData`
- `spreadsheet-responses.ts` → `spreadsheetCellSchema`, `spreadsheetDataSchema`, `SpreadsheetData`, `validationResultSchema`, `ValidationResult`
- `lessons.ts` → `unit*Schema` family, `lessonMetadataSchema`
- `classes.ts` → `classMetadataSchema`; `content-revisions.ts` → `validationErrorSchema`; `live-*.ts` → answer/session schemas
- `validators.ts` → `Activity` (and other drizzle-zod-derived types) consumed by `types/*` and tests

## Known importers to rewire (~15)

`lib/assessments/scoring.ts`, `lib/activities/component-keys.ts`,
`lib/curriculum/published-manifest.ts`, `lib/teacher/submission-detail.ts`,
`lib/test-utils/mock-factories.ts`, `types/database.ts`, `types/activities.ts`,
`types/curriculum.ts`, `vite.config.ts` (drizzle manualChunks), and associated
`__tests__/*` (incl. `vi.mock('@/lib/db/drizzle')`).

## Functional Requirements

- FR1 — Live zod schemas + inferred types currently exported from `lib/db/schema/*`
  are relocated to a non-Drizzle home (proposed `apps/bus-math-v2/lib/schemas/`)
  with identical shapes and export names (or updated names with all callers rewired).
- FR2 — `drizzle-zod`-derived validators (e.g. `Activity` in `validators.ts`) are
  rewritten as hand-authored or Convex-sourced zod/types — no drizzle dependency.
- FR3 — All ~15 importers and `types/*` compile against the new homes; no remaining
  `@/lib/db/...` or `drizzle-orm` imports anywhere in BM2.
- FR4 — Dead artifacts deleted: `lib/db/`, `drizzle.config.ts`; deps removed from
  `apps/bus-math-v2/package.json`; drizzle entry removed from `vite.config.ts` manualChunks.
- FR5 — Docs reconciled: correct the false "Prune BM2 Legacy [x] complete" claim in
  `current_directive.md`; confirm `tech-stack.md` "no legacy layers" now holds.

## Acceptance Criteria

- AC1 — `npx tsc --noEmit` for BM2 passes (currently RED).
- AC2 — BM2 lint + test + build all green.
- AC3 — `grep -rE "lib/db|drizzle-orm|drizzle-zod|postgres" apps/bus-math-v2` returns
  only incidental matches (none load-bearing).
- AC4 — `npm run doctor` green; no boundary regressions.
- AC5 — `current_directive.md` and tech-debt reflect actual state.

## Out of Scope

- Any Convex schema changes (Convex is already the data path).
- Closing doctor's type-check blind spot (separate follow-up on the tooling track).
