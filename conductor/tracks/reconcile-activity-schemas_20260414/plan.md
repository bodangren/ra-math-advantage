# Implementation Plan — Reconcile Activity Schemas with Component Props

## Phase 1: ComprehensionQuiz Schema Reconciliation

- [x] Task: Rewrite comprehension-quiz.schema.ts to match component props
    - [x] Write tests: verify new schema validates component-compatible props
    - [x] Implement: Update schema to use `prompt`, `options[]`, `correctAnswer: string | string[]`
    - [x] Add `select_all` type support

- [x] Task: Update comprehension-quiz schema tests
    - [x] Update test fixtures to use new schema structure
    - [x] Verify all tests pass

- [x] Task: Phase Completion Verification 'ComprehensionQuiz Schema'

## Phase 2: FillInTheBlank Schema Reconciliation

- [ ] Task: Rewrite fill-in-the-blank.schema.ts to match component props
    - [x] Write tests: verify new schema validates component-compatible props
    - [ ] Implement: Update schema to use `{{blank:id}}` markers, inline blanks with `correctAnswer`
    - [ ] Change `answers` from `Record<string, string[]>` to `Record<string, string>`

- [ ] Task: Update fill-in-the-blank schema tests
    - [ ] Update test fixtures to use new schema structure
    - [ ] Verify all tests pass

- [ ] Task: Phase Completion Verification 'FillInTheBlank Schema'