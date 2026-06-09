# Track: BM2 Drizzle Dead-Layer Removal — Implementation Plan

Workflow: establish a green baseline, then Contract-First extraction + TDD per phase.
Verification gate each phase: `npx tsc --noEmit` (BM2) + `npm run ws:bm2:test`.

## Phase 0 — Baseline & Inventory

- [ ] Task: Restore the half-deleted files into a working git state OR snapshot HEAD's `lib/db/schema/*` so the live exports are recoverable during extraction (no green baseline currently exists in the working tree)
- [ ] Task: Generate the complete export-usage inventory: every symbol imported from `@/lib/db/*` by non-deleted files, classified live-schema vs dead-table (Contract-First)

## Phase 1 — Re-home Live Zod Schemas (no drizzle)

- [ ] Task: Create `lib/schemas/` modules holding the live schemas (content-block, phase-metadata, activity-props + kinds, submission-data, spreadsheet, lessons/unit, class-metadata, validation-error, live-*)
- [ ] Task: Port schema bodies verbatim, stripping `drizzle-orm`/`drizzle-zod`; keep external dep edges (`practice/contract`, `curriculum/standards`)
- [ ] Task: TDD — parity tests asserting moved schemas parse the same fixtures as before
- [ ] Task: Measure - User Manual Verification 'Phase 1'

## Phase 2 — Rewrite drizzle-zod-derived Validators

- [ ] Task: Replace `validators.ts` `createInsertSchema`/`createSelectSchema` outputs (e.g. `Activity`) with hand-authored/Convex-sourced zod + inferred types
- [ ] Task: TDD — type + runtime parity for the rewritten validators against existing callers

## Phase 3 — Rewire Importers & types/*

- [ ] Task: Repoint the ~15 importers (`scoring.ts`, `component-keys.ts`, `published-manifest.ts`, `submission-detail.ts`, `mock-factories.ts`, `types/{database,activities,curriculum}.ts`, tests) to `lib/schemas/`
- [ ] Task: Remove `drizzle-orm` type imports from `types/*`; fix `vi.mock('@/lib/db/drizzle')` test seams
- [ ] Task: `npx tsc --noEmit` (BM2) green

## Phase 4 — Delete Dead Layer

- [ ] Task: Delete `lib/db/`, `drizzle.config.ts`; drop `drizzle-kit`/`drizzle-orm`/`drizzle-zod`/`postgres` from `apps/bus-math-v2/package.json`
- [ ] Task: Remove drizzle/postgres entry from `vite.config.ts` manualChunks
- [ ] Task: Confirm `grep -rE "lib/db|drizzle|postgres" apps/bus-math-v2` has no load-bearing matches

## Phase 5 — Verify & Reconcile

- [ ] Task: BM2 lint + test + build + `tsc --noEmit` all green; `npm run doctor` green
- [ ] Task: Correct `current_directive.md` (remove false "[x] complete"); confirm `tech-stack.md` "no legacy layers" holds; update tech-debt
- [ ] Task: Measure - User Manual Verification 'Phase 5'
