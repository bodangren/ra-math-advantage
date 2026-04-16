# Plan: Practice Item Blueprint

## Phase 1: Type Definitions and Zod Schemas

- [x] Task: Define ProblemFamily type and Zod schema
  - [x] Create `lib/practice/problem-family.ts` with `ProblemFamily` type
  - [x] Create `problemFamilySchema` Zod schema with all fields validated
  - [x] Export `Difficulty` union type (`"introductory" | "standard" | "challenging"`)
  - [x] Add JSDoc documentation on each field
- [x] Task: Define PracticeItem type and Zod schema
  - [x] Create `lib/practice/practice-item.ts` with `PracticeItem` type
  - [x] Create `practiceItemSchema` Zod schema
  - [x] Validate `variantLabel` as non-empty string
- [x] Task: Define ObjectivePolicy type and Zod schema
  - [x] Create `lib/practice/objective-policy.ts` with `ObjectivePolicy` type
  - [x] Create `objectivePolicySchema` Zod schema
  - [x] Import and reuse `ObjectivePracticePolicy` from `objective-proficiency.ts`
- [x] Task: Write validation unit tests
  - [x] Create `lib/practice/__tests__/problem-family.test.ts`
  - [x] Create `lib/practice/__tests__/practice-item.test.ts`
  - [x] Create `lib/practice/__tests__/objective-policy.test.ts`
  - [x] Test valid data passes, invalid data rejects for each schema
  - [x] Test edge cases: empty objectiveIds, invalid difficulty, missing required fields
- [x] Task: Run lint and typecheck
  - [x] `npm run lint` passes
  - [x] `npm run typecheck` passes (no new errors; pre-existing errors unchanged)
- [x] Task: Conductor - Phase Completion Verification 'Type Definitions and Zod Schemas' (Protocol in workflow.md)

## Phase 2: Convex Schema Extension

- [x] Task: Add `problem_families` table to `convex/schema.ts`
  - [x] Define table with fields: `problemFamilyId` (string), `componentKey` (string), `displayName` (string), `description` (string), `objectiveIds` (array of string), `difficulty` (string), `metadata` (any)
  - [x] Add index `by_problemFamilyId` on `problemFamilyId`
  - [x] Add index `by_componentKey` on `componentKey`
  - [x] Add index `by_objectiveId` on `objectiveIds`
- [x] Task: Add `practice_items` table to `convex/schema.ts`
  - [x] Define table with fields: `practiceItemId` (string), `activityId` (string), `problemFamilyId` (string), `variantLabel` (string)
  - [x] Add index `by_activityId` on `activityId`
  - [x] Add index `by_problemFamilyId` on `problemFamilyId`
- [x] Task: Add `objective_policies` table to `convex/schema.ts`
  - [x] Define table with fields: `standardId` (string), `policy` (string), `courseKey` (string), `priority` (number)
  - [x] Add index `by_standardId` on `standardId`
  - [x] Add index `by_courseKey` on `courseKey`
- [x] Task: Write schema tests
  - [x] Verify tables are defined with correct fields
  - [x] Verify indexes exist
- [x] Task: Run lint and typecheck
  - [x] `npm run lint` passes
  - [x] `npm run typecheck` passes
- [x] Task: Conductor - Phase Completion Verification 'Convex Schema Extension' (Protocol in workflow.md)

## Phase 3: Objective Policy Assignment

- [x] Task: Create seed data structure for objective policies
  - [x] Create `convex/seed/objective-policies.ts` (deviation: existing codebase uses `convex/seed/`, not `convex/seeds/`)
  - [x] Define `OBJECTIVE_POLICIES` array mapping each IM3 competency standard to its policy
  - [x] Use priority categories derived from `PRIORITY_DEFAULTS` thresholds to assign numeric priority values
  - [x] Assign `essential` to core algebraic manipulation and function analysis standards
  - [x] Assign `supporting` to modeling and application standards
  - [x] Assign `extension` to enrichment and advanced statistics standards
- [x] Task: Create seed mutation for objective policies
  - [x] Create `convex/seed/seed-objective-policies.ts` with idempotent upsert mutation
  - [x] Validate each policy against `objectivePolicySchema` before insertion
  - [x] Skip if `standardId` already has a policy for the given `courseKey`
- [x] Task: Write tests for policy seed data
  - [x] Test every standard in `competency_standards` has a policy assignment
  - [x] Test no duplicate standardIds in seed data
  - [x] Test policy values are valid `ObjectivePracticePolicy` values
  - [x] Test Zod schema validation passes for all records
- [x] Task: Run lint and typecheck
  - [x] `npm run lint` passes
  - [x] `npm run typecheck` passes (no new errors; pre-existing errors unchanged)
- [x] Task: Conductor - Phase Completion Verification 'Objective Policy Assignment' (Protocol in workflow.md) [checkpoint: b8df23e]

## Phase 4: Seed Data for Modules 1–5

- [x] Task: Create problem family seed data for Modules 1–3
  - [x] Create `convex/seed/problem-families/module-1.ts` (Quadratic Functions)
  - [x] Create `convex/seed/problem-families/module-2.ts` (Polynomial Functions)
  - [x] Create `convex/seed/problem-families/module-3.ts` (Polynomial Equations)
  - [x] Each family references real componentKeys and objectiveIds from existing data
- [x] Task: Create problem family seed data for Modules 4–5
  - [x] Create `convex/seed/problem-families/module-4.ts` (Inverses and Radical Functions)
  - [x] Create `convex/seed/problem-families/module-5.ts` (Exponential Functions and Geometric Series)
- [x] Task: Create practice item seed data for Modules 1–5
  - [x] Create `convex/seed/practice-items/` directory structure
  - [x] Seed mutation `seedPracticeItems.ts` auto-generates practice items by matching activities to problem families
  - [x] Assign variant labels ("Set A", "Set B", etc.)
- [x] Task: Create seed mutations for problem families and practice items
  - [x] Create `convex/seed/seed-problem-families.ts` with idempotent upsert by `problemFamilyId`
  - [x] Create `convex/seed/seed-practice-items.ts` with idempotent upsert by `practiceItemId`
  - [x] Validate each record against its Zod schema before insertion
- [x] Task: Write seed data validation tests
  - [x] All problem family records pass `problemFamilySchema`
  - [x] All practice item records pass `practiceItemSchema`
  - [x] No duplicate `problemFamilyId` values within seed data
  - [x] All referenced `objectiveIds` exist in competency standards
- [x] Task: Run lint and typecheck
  - [x] `npm run lint` passes
  - [x] `npm run typecheck` passes (pre-existing test-file errors unchanged)
- [x] Task: Wire seed mutations into seed.ts
  - [x] `seedProblemFamilies` called after `seedObjectivePolicies`
  - [x] `seedPracticeItems` called after `seedProblemFamilies`
- [x] Task: Conductor - Phase Completion Verification 'Seed Data for Modules 1–5' (Protocol in workflow.md) [checkpoint: HEAD]

## Phase 5: Seed Data for Modules 6–9 and Validation

- [x] Task: Create problem family seed data for Modules 6–9
  - [x] Create `convex/seed/problem-families/module-6.ts` (Logarithmic Functions)
  - [x] Create `convex/seed/problem-families/module-7.ts` (Rational Functions)
  - [x] Create `convex/seed/problem-families/module-8.ts` (Inferential Statistics)
  - [x] Create `convex/seed/problem-families/module-9.ts` (Trigonometric Functions)
- [x] Task: Create practice item seed data for Modules 6–9
  - [x] Auto-generated via `seedPracticeItems` using updated problem family imports
  - [x] Map each activity variant to its problem family
- [x] Task: Create referential integrity validation mutation
  - [x] Create `convex/seed/validate-blueprint.ts`
  - [x] Check every `problemFamilyId` in `timing_baselines` has a `problem_families` record
  - [x] Check every `problemFamilyId` in `practice_items` has a `problem_families` record
  - [x] Check every `activityId` in `practice_items` has an `activities` record
  - [x] Check every `objectiveId` in `problem_families` has a `competency_standards` record
  - [x] Check every `standardId` in `objective_policies` has a `competency_standards` record
  - [x] Return a validation report with pass/fail counts and specific violations
- [x] Task: Create validation unit tests
  - [x] Test validation logic with mock data (valid and invalid scenarios)
  - [x] Test that missing references are correctly reported
- [x] Task: Update seed orchestration
  - [x] `convex/seed.ts` already orchestrates `seedObjectivePolicies`, `seedProblemFamilies`, `seedPracticeItems`
  - [x] `validateBlueprint` available as standalone mutation for post-seed verification
- [x] Task: Run lint and typecheck
  - [x] `npm run lint` passes
  - [x] `npm run typecheck` passes (no new errors; pre-existing errors unchanged)
- [x] Task: Conductor - Phase Completion Verification 'Seed Data for Modules 6–9 and Validation' (Protocol in workflow.md) [checkpoint: pending]

## Phase 6: Verification and Handoff

- [ ] Task: Run full test suite
  - [ ] `npx vitest run` — all tests pass
  - [ ] `npm run lint` passes
  - [ ] `npm run typecheck` passes
- [ ] Task: Verify seed data completeness
  - [ ] All 9 modules have problem family seed data
  - [ ] All 9 modules have practice item seed data
  - [ ] All competency standards have objective policy assignments
- [ ] Task: Update track metadata
  - [ ] Set `actual_tasks` in `metadata.json`
  - [ ] Set `status` to `complete`
  - [ ] Record any `deviation_notes`
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
