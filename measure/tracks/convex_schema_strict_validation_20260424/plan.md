# Plan: Convex Schema Strict Validation

## Phase 1: Audit and Type Discovery [COMPLETE]

- [x] Task: Catalog all v.any() fields with their usage context
    - [x] Write audit test that snapshots current schema field types
    - [x] Map each v.any() to its consuming query/mutation handler
    - [x] Document expected data shapes from curriculum seed data
    - [x] Output: `measure/tracks/convex_schema_strict_validation_20260424/audit.md`
    - [x] Output: `__tests__/convex/schema-vany-audit.test.ts`

## Phase 2: Schema Validator Replacement [PARTIAL - REQUIRES MORE WORK]

- [x] Task: Audit schema v.any() fields (21 fields across 16 tables)
- [x] Task: Create typed validators for SRS-related fields
- [ ] Task: Replace v.any() fields with typed validators - DEFERRED (requires handler arg updates)
    - Schema validator changes cascade to handler arg validators
    - Handlers use `v.any()` for evidence/stateBefore/stateAfter args
    - Changing schema without updating handlers causes type mismatches
    - Requires: Update processReview.ts, reviews.ts, and all callers
- [ ] Run `npx convex dev` to regenerate types - PENDING

## Phase 3: Eliminate as any Casts [IN PROGRESS]

- [x] Task: Audit 4 `as any` cast locations
    - `lesson-chatbot/route.ts`: rateLimits + student modules (public fns via internal)
    - `phases/skip/route.ts`: student.skipPhase (public fn via internal)
    - `seed.ts`: seed.* functions (correct names are seed_*, not seed*)
- [ ] Fix `(internal as any).seed` in seed.ts - REQUIRES property name fixes
- [ ] Fix `(internal as any).rateLimits` in lesson-chatbot/route.ts - REQUIRES architectural decision
- [ ] Fix `(internal as any).student` in lesson-chatbot/route.ts - REQUIRES architectural decision
- [ ] Fix `(internal.student as any).skipPhase` in phases/skip/route.ts - REQUIRES architectural decision
- [ ] Note: These casts work at runtime but bypass TypeScript type checking
- [ ] Proper fix requires: Converting public mutations to internal, or using api.* instead of internal.*

## Phase 4: Verification

- [ ] Task: Full suite validation
    - [ ] Run `npm run lint` — zero errors
    - [ ] Run `npx tsc --noEmit` — zero errors
    - [ ] Run `npm run test` — all tests pass
    - [ ] Run `npm run build` — clean build
