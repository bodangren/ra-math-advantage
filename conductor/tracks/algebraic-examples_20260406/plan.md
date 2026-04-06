# Implementation Plan — Algebraic Worked-Example Components

## Phase 1: Foundation — Math Input & Step Rendering

- [ ] Task: Create `MathInputField` component
    - [ ] Write tests: renders live KaTeX preview as user types
    - [ ] Write tests: validates exact match (e.g., `3x + 2` == `3x + 2`)
    - [ ] Write tests: validates structural equivalence for common forms (e.g., `(x-3)(x+2)` == `x^2-x-6`)
    - [ ] Implement `components/activities/algebraic/MathInputField.tsx`

- [ ] Task: Create expression equivalence validator `lib/activities/algebraic/equivalence.ts`
    - [ ] Write tests: identical strings → true; algebraic equivalents → true; wrong answers → false
    - [ ] Write tests: handles complex numbers (`2 + 3i`), fractions, radicals
    - [ ] Implement pattern-matching equivalence checker for Module 1 expression types

- [ ] Task: Create `StepByStepper` base component (teaching mode only)
    - [ ] Write tests: renders all steps with expression and explanation; uses StepRevealContainer in full-reveal state
    - [ ] Write tests: `isKeyStep` flag applies visual emphasis
    - [ ] Implement `components/activities/algebraic/StepByStepper.tsx` — teaching mode

- [ ] Task: Conductor — Phase Completion Verification 'Foundation' (Protocol in workflow.md)

## Phase 2: Guided & Practice Modes

- [ ] Task: Add guided mode to `StepByStepper`
    - [ ] Write tests: steps hidden on load; multiple-choice shows correct + 2 distractors
    - [ ] Write tests: correct selection reveals step and advances; incorrect shows hint
    - [ ] Write tests: hint usage count recorded in component state
    - [ ] Implement guided mode state machine in `StepByStepper`

- [ ] Task: Add practice mode to `StepByStepper`
    - [ ] Write tests: fresh problem from pool presented; partial steps shown at configured scaffold level
    - [ ] Write tests: blank expressions accept math input; validated on submit
    - [ ] Write tests: correct solution overlaid on submit for comparison
    - [ ] Implement practice mode with `MathInputField` blank slots

- [ ] Task: Implement distractor generation utility `lib/activities/algebraic/distractors.ts`
    - [ ] Write tests: common misconception distractors for each step type are plausible
    - [ ] Implement distractor pool for Module 1 step types, falling back to prop-provided distractors

- [ ] Task: Conductor — Phase Completion Verification 'Guided & Practice Modes' (Protocol in workflow.md)

## Phase 3: Problem Types — Simple Procedures

- [ ] Task: Implement `graph_analysis` problem type
    - [ ] Write tests: all 3 modes; steps cover a/b/c → axis → vertex → max/min → domain/range
    - [ ] Implement step sequence and validation logic

- [ ] Task: Implement `rate_of_change` problem type
    - [ ] Write tests: all 3 modes; steps cover interval endpoints → f(a), f(b) → formula → interpret
    - [ ] Implement step sequence; supports input from equation, table data, and graph readout

- [ ] Task: Implement `simplify_imaginary` problem type
    - [ ] Write tests: all 3 modes; validates i notation in answers
    - [ ] Implement step sequence

- [ ] Task: Implement `complex_operations` problem type (add/subtract/multiply)
    - [ ] Write tests: all 3 modes; i² = -1 substitution step validated
    - [ ] Implement step sequence with i² handling

- [ ] Task: Conductor — Phase Completion Verification 'Problem Types — Simple' (Protocol in workflow.md)

## Phase 4: Problem Types — Multi-Step Procedures

- [ ] Task: Implement `factor_trinomial` problem type (all factoring patterns from 1-4)
    - [ ] Write tests: a=1 trinomials, a≠1, GCF first, difference of squares, perfect square — all 3 modes
    - [ ] Implement step sequences for each factoring pattern

- [ ] Task: Implement `complete_the_square` problem type
    - [ ] Write tests: a=1, a≠1, imaginary solutions — all 3 modes
    - [ ] Implement step sequence; vertex form conversion variant

- [ ] Task: Implement `quadratic_formula` problem type
    - [ ] Write tests: real solutions (factorable), real solutions (non-factorable), imaginary solutions — all 3 modes
    - [ ] Implement step sequence; radical simplification step validated

- [ ] Task: Implement `discriminant_analysis` problem type
    - [ ] Write tests: D > 0, D = 0, D < 0 cases — all 3 modes
    - [ ] Implement step sequence; classification answer validated

- [ ] Task: Implement `system_substitution` problem type
    - [ ] Write tests: 2-solution, 1-solution, 0-solution cases — all 3 modes
    - [ ] Implement step sequence; solution pairs validated

- [ ] Task: Build submission envelope assembly and register component
    - [ ] Write tests: envelope includes step attempts, hints used, filled answers, final correctness
    - [ ] Implement `buildAlgebraicSubmission()` in schema file
    - [ ] Register `step-by-step-solver` in `lib/activities/registry.ts`

- [ ] Task: Conductor — Phase Completion Verification 'Multi-Step Problem Types' (Protocol in workflow.md)
