# Track 7: Practice-Variant Rename — Implementation Plan

Workflow: Contract-First refactor — rename mechanically, keep tests green at each
phase; add migration tests. >80% coverage maintained.
Depends on: Track 1. Sequence after Track 1 to avoid churn collisions.

## Phase 1 — Contract & Schema

- [ ] Task: Rename types and schemas in practice-core
    - [ ] ProblemFamily → PracticeVariant; problemFamilyId → variantKey; Zod schemas; problem-family.ts module
- [ ] Task: Define the Convex schema rename and data migration
    - [ ] srs_cards.problemFamilyId → variantKey; migration script; migration tests
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Engine Rename

- [ ] Task: Rename across srs-engine (TDD — keep tests green)
    - [ ] scheduler, contract, objective-proficiency, srs-proficiency; variantKey threading
    - [ ] minProblemFamilies → minVariants; ProblemFamilyEvidence → PracticeVariantEvidence
    - [ ] Single-variant default (variantKey = objectiveId)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Projection, App Rename, and Migration

- [ ] Task: Rename in knowledge-space-practice SRS projection and app call sites (TDD)
    - [ ] projections/srs.ts; apps/integrated-math-3 lib/srs and convex call sites; fixtures and tests
- [ ] Task: Execute and verify the Convex data migration on existing card data
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Docs & Doctor

- [ ] Task: Update in-repo kst-srs.v2 spec §12.1 / §13 (practice variant; Card definition)
- [ ] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint
- [ ] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
