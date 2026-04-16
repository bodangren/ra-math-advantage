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

- [ ] Task: Create seed data structure for objective policies
  - [ ] Create `convex/seeds/objective-policies.ts`
  - [ ] Define `OBJECTIVE_POLICIES` array mapping each IM3 competency standard to its policy
  - [ ] Use `PRIORITY_DEFAULTS` from `objective-proficiency.ts` to assign priority values
  - [ ] Assign `essential` to core algebraic manipulation and function analysis standards
  - [ ] Assign `supporting` to modeling and application standards
  - [ ] Assign `extension` to enrichment and advanced standards
- [ ] Task: Create seed mutation for objective policies
  - [ ] Create `convex/seeds/seedObjectivePolicies.ts` with idempotent upsert mutation
  - [ ] Validate each policy against `objectivePolicySchema` before insertion
  - [ ] Skip if `standardId` already has a policy for the given `courseKey`
- [ ] Task: Write tests for policy seed data
  - [ ] Test every standard in `competency_standards` has a policy assignment
  - [ ] Test no duplicate standardIds in seed data
  - [ ] Test policy values are valid `ObjectivePracticePolicy` values
- [ ] Task: Run lint and typecheck
  - [ ] `npm run lint` passes
  - [ ] `npm run typecheck` passes
- [ ] Task: Conductor - Phase Completion Verification 'Objective Policy Assignment' (Protocol in workflow.md)

## Phase 4: Seed Data for Modules 1–5

- [ ] Task: Create problem family seed data for Modules 1–3
  - [ ] Create `convex/seeds/problem-families/module-1.ts` (Relations & Functions)
  - [ ] Create `convex/seeds/problem-families/module-2.ts` (Linear Systems & Matrices)
  - [ ] Create `convex/seeds/problem-families/module-3.ts` (Quadratic Functions)
  - [ ] Each family references real componentKeys and objectiveIds from existing data
- [ ] Task: Create problem family seed data for Modules 4–5
  - [ ] Create `convex/seeds/problem-families/module-4.ts` (Polynomial Functions)
  - [ ] Create `convex/seeds/problem-families/module-5.ts` (Rational & Radical Functions)
- [ ] Task: Create practice item seed data for Modules 1–5
  - [ ] Create `convex/seeds/practice-items/module-1.ts` through `module-5.ts`
  - [ ] Map each activity variant to its problem family
  - [ ] Assign variant labels ("Set A", "Set B", etc.)
- [ ] Task: Create seed mutations for problem families and practice items
  - [ ] Create `convex/seeds/seedProblemFamilies.ts` with idempotent upsert by `problemFamilyId`
  - [ ] Create `convex/seeds/seedPracticeItems.ts` with idempotent upsert by `practiceItemId`
  - [ ] Validate each record against its Zod schema before insertion
- [ ] Task: Write seed data validation tests
  - [ ] All problem family records pass `problemFamilySchema`
  - [ ] All practice item records pass `practiceItemSchema`
  - [ ] No duplicate `problemFamilyId` values within seed data
  - [ ] All referenced `objectiveIds` exist in competency standards
- [ ] Task: Run lint and typecheck
  - [ ] `npm run lint` passes
  - [ ] `npm run typecheck` passes
- [ ] Task: Conductor - Phase Completion Verification 'Seed Data for Modules 1–5' (Protocol in workflow.md)

## Phase 5: Seed Data for Modules 6–9 and Validation

- [ ] Task: Create problem family seed data for Modules 6–9
  - [ ] Create `convex/seeds/problem-families/module-6.ts` (Exponential & Logarithmic Functions)
  - [ ] Create `convex/seeds/problem-families/module-7.ts` (Trigonometric Functions)
  - [ ] Create `convex/seeds/problem-families/module-8.ts` (Trigonometric Identities & Equations)
  - [ ] Create `convex/seeds/problem-families/module-9.ts` (Statistics & Probability)
- [ ] Task: Create practice item seed data for Modules 6–9
  - [ ] Create `convex/seeds/practice-items/module-6.ts` through `module-9.ts`
  - [ ] Map each activity variant to its problem family
- [ ] Task: Create referential integrity validation mutation
  - [ ] Create `convex/seeds/validateBlueprint.ts`
  - [ ] Check every `problemFamilyId` in `timing_baselines` has a `problem_families` record
  - [ ] Check every `problemFamilyId` in `practice_items` has a `problem_families` record
  - [ ] Check every `activityId` in `practice_items` has an `activities` record
  - [ ] Check every `objectiveId` in `problem_families` has a `competency_standards` record
  - [ ] Check every `standardId` in `objective_policies` has a `competency_standards` record
  - [ ] Return a validation report with pass/fail counts and specific violations
- [ ] Task: Create validation unit tests
  - [ ] Test validation logic with mock data (valid and invalid scenarios)
  - [ ] Test that missing references are correctly reported
- [ ] Task: Update seed orchestration
  - [ ] Create or update `convex/seeds/seed.ts` to orchestrate all seed mutations in dependency order:
    1. `seedObjectivePolicies`
    2. `seedProblemFamilies`
    3. `seedPracticeItems`
    4. `validateBlueprint`
- [ ] Task: Run lint and typecheck
  - [ ] `npm run lint` passes
  - [ ] `npm run typecheck` passes
- [ ] Task: Conductor - Phase Completion Verification 'Seed Data for Modules 6–9 and Validation' (Protocol in workflow.md)

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
