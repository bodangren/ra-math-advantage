# Plan: cross-course-extraction_20260416

## Phase 1: Boundary Audit

- [x] Task: Read all source files in `lib/srs/` and `lib/practice/` and compile a coupling inventory
  - [x] Sub-task: Read every file in `lib/srs/` and catalog all string literals, constants, and type references
  - [x] Sub-task: Read every file in `lib/practice/` and catalog all string literals, constants, and type references
  - [x] Sub-task: Cross-reference catalog against known IM3 identifiers (lesson names, module numbers, component keys)
- [x] Task: Fix any course-specific leaks by parameterizing or extracting
  - [x] Sub-task: For each flagged reference, refactor to accept the value as a parameter or config entry
  - [x] Sub-task: Run `npm run lint` and all existing tests to confirm no regressions
- [x] Task: Write audit report documenting findings and fixes
  - [x] Sub-task: Create `conductor/tracks/cross-course-extraction_20260416/boundary-audit-report.md`
  - [x] Sub-task: Include per-file findings table with columns: file, line, issue, resolution
- [x] Task: Conductor - Phase Completion Verification 'Boundary Audit' (Protocol in workflow.md) [checkpoint: d3475cd]

## Phase 2: Interface Documentation [checkpoint: ad4afe8]

- [x] Task: Document all public types and functions in `lib/srs/contract.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/srs/scheduler.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/srs/review-processor.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/srs/queue.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/srs/adapters.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/practice/srs-rating.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/practice/objective-proficiency.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/practice/timing-baseline.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/practice/timing.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Document all public types and functions in `lib/practice/contract.ts`
  - [x] Sub-task: Add JSDoc to every exported type and function
  - [x] Sub-task: Write usage examples for each function
- [x] Task: Verify all documentation examples compile with `npx tsc --noEmit`
- [x] Task: Conductor - Phase Completion Verification 'Interface Documentation' (Protocol in workflow.md)

## Phase 3: Integration Guide

- [x] Task: Create `lib/srs/INTEGRATION.md` with step-by-step guide
  - [x] Sub-task: Write section 1 - Define activity components and register them
  - [x] Sub-task: Write section 2 - Create problem family seed data mapping activities to objectives
  - [x] Sub-task: Write section 3 - Assign objective practice policies
  - [x] Sub-task: Write section 4 - Implement CardStore and ReviewLogStore for your backend
  - [x] Sub-task: Write section 5 - Create daily practice page using queue engine
  - [x] Sub-task: Write section 6 - Wire submission adapter to update cards on practice completion
  - [x] Sub-task: Include complete code examples for each step
- [x] Task: Write a test that validates the integration guide examples compile and run
  - [x] Sub-task: Extract code examples from INTEGRATION.md into a test file
  - [x] Sub-task: Run test to confirm examples pass
- [x] Task: Conductor - Phase Completion Verification 'Integration Guide' (Protocol in workflow.md)

## Phase 4: Adapter Verification [~]

- [x] Task: Implement a non-Convex `CardStore` adapter stub (REST API-backed) [e3d9107]
  - [x] Sub-task: Create `lib/srs/__tests__/rest-adapter-stub.ts` implementing `CardStore` and `ReviewLogStore` interfaces
  - [x] Sub-task: Adapter should use in-memory maps to simulate REST round-trips
- [x] Task: Write tests proving the REST adapter works with the scheduler and review processor [4139db9]
  - [x] Sub-task: Test scheduler produces a valid session using the REST adapter
  - [x] Sub-task: Test review processor updates cards through the REST adapter
  - [x] Sub-task: Test queue engine builds a practice session end-to-end with the REST adapter
- [ ] Task: Write type export verification test
  - [ ] Sub-task: Create `lib/srs/__tests__/export-verification.test.ts`
  - [ ] Sub-task: Import all types from `lib/srs/contract.ts` and verify they are complete for integration
  - [ ] Sub-task: Assert no internal-only types appear in public function signatures
- [ ] Task: Run all tests and `npm run lint`
- [ ] Task: Conductor - Phase Completion Verification 'Adapter Verification' (Protocol in workflow.md)

## Phase 5: Verification and Handoff

- [ ] Task: Run full test suite and lint to confirm zero regressions
- [ ] Task: Update `conductor/tracks/cross-course-extraction_20260416/metadata.json` with actual task count and status
- [ ] Task: Conductor - Phase Completion Verification 'Verification and Handoff' (Protocol in workflow.md)
