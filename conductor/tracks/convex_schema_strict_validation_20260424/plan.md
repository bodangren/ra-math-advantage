# Plan: Convex Schema Strict Validation

## Phase 1: Audit and Type Discovery

- [ ] Task: Catalog all v.any() fields with their usage context
    - [ ] Write audit test that snapshots current schema field types
    - [ ] Map each v.any() to its consuming query/mutation handler
    - [ ] Document expected data shapes from curriculum seed data

## Phase 2: Schema Validator Replacement

- [ ] Task: Replace v.any() fields with typed validators
    - [ ] Write validation tests for content, props, submissionData fields
    - [ ] Replace v.any() in lesson content sections with v.object({...})
    - [ ] Replace v.any() in activity props with typed union schemas
    - [ ] Replace v.any() in submission/evidence fields with appropriate types
    - [ ] Replace v.any() in fsrsState with SRS card state schema
    - [ ] Run `npx convex dev` to regenerate types

## Phase 3: Eliminate as any Casts

- [ ] Task: Fix 5 production as any casts on Convex internal
    - [ ] Write tests verifying internal function calls with proper types
    - [ ] Replace `(internal as any).seed` with typed internal references
    - [ ] Fix remaining 4 internal casts using regenerated API types
    - [ ] Verify no type errors via `npx tsc --noEmit`

## Phase 4: Verification

- [ ] Task: Full suite validation
    - [ ] Run `npm run lint` — zero errors
    - [ ] Run `npx tsc --noEmit` — zero errors
    - [ ] Run `npm run test` — all tests pass
    - [ ] Run `npm run build` — clean build
