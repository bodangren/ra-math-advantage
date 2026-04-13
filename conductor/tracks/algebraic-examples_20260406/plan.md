# Implementation Plan — Algebraic Worked-Example Components

## Phase 1: Foundation — Math Input & Step Rendering [checkpoint: 021c426]

- [x] Task: Create `MathInputField` component [64957ca]
    - [x] Write tests: renders live KaTeX preview as user types
    - [x] Write tests: validates exact match (e.g., `3x + 2` == `3x + 2`)
    - [x] Write tests: validates structural equivalence for common forms (e.g., `(x-3)(x+2)` == `x^2-x-6`)
    - [x] Implement `components/activities/algebraic/MathInputField.tsx`

- [x] Task: Create expression equivalence validator `lib/activities/algebraic/equivalence.ts` [ab372d0]
    - [x] Write tests: identical strings → true; algebraic equivalents → true; wrong answers → false
    - [x] Write tests: handles complex numbers (`2 + 3i`), fractions, radicals
    - [x] Implement pattern-matching equivalence checker for Module 1 expression types

- [x] Task: Create `StepByStepper` base component (teaching mode only) [9f2a001]
    - [x] Write tests: renders all steps with expression and explanation; uses StepRevealContainer in full-reveal state
    - [x] Write tests: `isKeyStep` flag applies visual emphasis
    - [x] Implement `components/activities/algebraic/StepByStepper.tsx` — teaching mode

- [x] Task: Conductor — Phase Completion Verification 'Foundation' (Protocol in workflow.md)

## Phase 2: Guided & Practice Modes [checkpoint: 9ba018d]

- [x] Task: Add guided mode to `StepByStepper` [4cd3ee4]
    - [x] Write tests: steps hidden on load; multiple-choice shows correct + 2 distractors
    - [x] Write tests: correct selection reveals step and advances; incorrect shows hint
    - [x] Write tests: hint usage count recorded in component state
    - [x] Implement guided mode state machine in `StepByStepper`

 - [x] Task: Add practice mode to `StepByStepper` [44517c1]
    - [x] Write tests: fresh problem from pool presented; partial steps shown at configured scaffold level
    - [x] Write tests: blank expressions accept math input; validated on submit
    - [x] Write tests: correct solution overlaid on submit for comparison
    - [x] Implement practice mode with `MathInputField` blank slots

 - [x] Task: Implement distractor generation utility `lib/activities/algebraic/distractors.ts` [12fa556]
    - [x] Write tests: common misconception distractors for each step type are plausible
    - [x] Implement distractor pool for Module 1 step types, falling back to prop-provided distractors

 - [x] Task: Conductor — Phase Completion Verification 'Guided & Practice Modes' (Protocol in workflow.md) [9ba018d]

## Phase 3: Problem Types — Simple Procedures

- [x] Task: Implement `graph_analysis` problem type
    - [x] Write tests: all 3 modes; steps cover a/b/c → axis → vertex → max/min → domain/range
    - [x] Implement step sequence and validation logic

- [x] Task: Implement `rate_of_change` problem type
    - [x] Write tests: all 3 modes; steps cover interval endpoints → f(a), f(b) → formula → interpret
    - [x] Implement step sequence; supports input from equation, table data, and graph readout

- [x] Task: Implement `simplify_imaginary` problem type
    - [x] Write tests: all 3 modes; validates i notation in answers
    - [x] Implement step sequence

- [x] Task: Implement `complex_operations` problem type (add/subtract/multiply)
    - [x] Write tests: all 3 modes; i² = -1 substitution step validated
    - [x] Implement step sequence with i² handling

- [x] Task: Conductor — Phase Completion Verification 'Problem Types — Simple' (Protocol in workflow.md)

## Phase 4: Problem Types — Multi-Step Procedures

- [x] Task: Implement `factor_trinomial` problem type (all factoring patterns from 1-4) [22691c7]
    - [x] Write tests: a=1 trinomials, a≠1, GCF first, difference of squares, perfect square — all 3 modes
    - [x] Implement step sequences for each factoring pattern

- [x] Task: Implement `complete_the_square` problem type [395618c]
    - [x] Write tests: a=1, a≠1, imaginary solutions — all 3 modes
    - [x] Implement step sequence; vertex form conversion variant

- [x] Task: Implement `quadratic_formula` problem type [5ac4e1f]
    - [x] Write tests: real solutions (factorable), real solutions (non-factorable), imaginary solutions — all 3 modes
    - [x] Implement step sequence; radical simplification step validated

- [x] Task: Implement `discriminant_analysis` problem type [5ac4e1f]
    - [x] Write tests: D > 0, D = 0, D < 0 cases — all 3 modes
    - [x] Implement step sequence; classification answer validated

- [x] Task: Implement `system_substitution` problem type [5ac4e1f]
    - [x] Write tests: 2-solution, 1-solution, 0-solution cases — all 3 modes
    - [x] Implement step sequence; solution pairs validated

- [~] Task: Build submission envelope assembly and register component
    - [ ] Write tests: envelope includes step attempts, hints used, filled answers, final correctness
    - [ ] Implement `buildAlgebraicSubmission()` in schema file
    - [ ] Register `step-by-step-solver` in `lib/activities/registry.ts`

- [ ] Task: Conductor — Phase Completion Verification 'Multi-Step Problem Types' (Protocol in workflow.md)
