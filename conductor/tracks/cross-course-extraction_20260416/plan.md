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

## Phase 2: Interface Documentation

- [ ] Task: Document all public types and functions in `lib/srs/contract.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/srs/scheduler.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/srs/review-processor.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/srs/queue.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/srs/adapters.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/practice/srs-rating.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/practice/objective-proficiency.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/practice/timing-baseline.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/practice/timing.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Document all public types and functions in `lib/practice/contract.ts`
  - [ ] Sub-task: Add JSDoc to every exported type and function
  - [ ] Sub-task: Write usage examples for each function
- [ ] Task: Verify all documentation examples compile with `npx tsc --noEmit`
- [ ] Task: Conductor - Phase Completion Verification 'Interface Documentation' (Protocol in workflow.md)

## Phase 3: Integration Guide

- [ ] Task: Create `lib/srs/INTEGRATION.md` with step-by-step guide
  - [ ] Sub-task: Write section 1 - Define activity components and register them
  - [ ] Sub-task: Write section 2 - Create problem family seed data mapping activities to objectives
  - [ ] Sub-task: Write section 3 - Assign objective practice policies
  - [ ] Sub-task: Write section 4 - Implement CardStore and ReviewLogStore for your backend
  - [ ] Sub-task: Write section 5 - Create daily practice page using queue engine
  - [ ] Sub-task: Write section 6 - Wire submission adapter to update cards on practice completion
  - [ ] Sub-task: Include complete code examples for each step
- [ ] Task: Write a test that validates the integration guide examples compile and run
  - [ ] Sub-task: Extract code examples from INTEGRATION.md into a test file
  - [ ] Sub-task: Run test to confirm examples pass
- [ ] Task: Conductor - Phase Completion Verification 'Integration Guide' (Protocol in workflow.md)

## Phase 4: Adapter Verification

- [ ] Task: Implement a non-Convex `CardStore` adapter stub (REST API-backed)
  - [ ] Sub-task: Create `lib/srs/__tests__/rest-adapter-stub.ts` implementing `CardStore` and `ReviewLogStore` interfaces
  - [ ] Sub-task: Adapter should use in-memory maps to simulate REST round-trips
- [ ] Task: Write tests proving the REST adapter works with the scheduler and review processor
  - [ ] Sub-task: Test scheduler produces a valid session using the REST adapter
  - [ ] Sub-task: Test review processor updates cards through the REST adapter
  - [ ] Sub-task: Test queue engine builds a practice session end-to-end with the REST adapter
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
