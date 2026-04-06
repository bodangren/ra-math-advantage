# Specification — Algebraic Worked-Example Components

## Context

The majority of worked examples across all 8 Module 1 lessons are algebraic step-by-step procedures: factoring, completing the square, applying the quadratic formula, performing operations on complex numbers, and solving systems by substitution. These are the most common interaction pattern in the entire course.

The `step-by-step-solver` component is the workhorse. It receives a problem configuration (steps, each step having an expression and an explanation) and renders it appropriately for the active mode. The same component handles all algebraic problem types by varying its props — not its structure.

## Problem Types for Module 1

| Problem Type | Lessons | Examples |
|---|---|---|
| `graph_analysis` | 1-1 | Finding vertex, axis of symmetry, domain/range from equation |
| `rate_of_change` | 1-1 | Average rate of change from equation, table, or graph |
| `solve_by_graphing` | 1-2 | Identify solution set from graph description |
| `simplify_imaginary` | 1-3 | Simplify √(-n), multiply imaginary numbers |
| `complex_operations` | 1-3 | Add, subtract, multiply complex numbers |
| `solve_complex_equation` | 1-3 | Solve equations with imaginary solutions |
| `factor_trinomial` | 1-4 | Factor and apply zero product property |
| `complete_the_square` | 1-5 | Solve by completing the square; convert to vertex form |
| `quadratic_formula` | 1-6 | Apply formula, simplify radical, classify solutions |
| `discriminant_analysis` | 1-6 | Calculate and interpret discriminant |
| `system_substitution` | 1-8 | Solve linear-quadratic system algebraically |

## Requirements

### Core Component Architecture

1. **`step-by-step-solver` component** (`components/activities/algebraic/StepByStepper.tsx`) — Renders a math problem as an ordered sequence of steps. Each step has:
   - `expression` — The math at this step (LaTeX string, rendered via KaTeX)
   - `explanation` — Plain-language explanation of what happened
   - `hint` — Optional scaffolding hint (shown in guided mode)
   - `isKeyStep` — Flag for steps that warrant extra visual emphasis

2. **Teaching mode** — All steps visible simultaneously. Each step shows its expression and explanation. Uses `StepRevealContainer` from the design system in "all revealed" state. Read-only. Teacher can use this for live instruction.

3. **Guided mode** — Steps hidden, revealed one at a time:
   - Problem shown at top
   - "What's the next step?" prompt
   - Student selects from multiple-choice options (the correct next step expression + 2 distractors)
   - On correct selection: step is revealed with explanation and "Next" button
   - On incorrect: hint shown, retry allowed (hint usage recorded)
   - After all steps: summary of solution

4. **Practice mode** — Fresh problem, fill-in approach:
   - New problem of the same type (from a problem pool in props)
   - Partial steps shown (scaffolding level decreases as competency grows — configurable)
   - Student fills in blank expressions via a math input field
   - Exact match or equivalent-expression validation
   - On submit: full worked solution overlaid for comparison

### Math Input

5. **`MathInputField`** (`components/activities/algebraic/MathInputField.tsx`) — Input field for algebraic expressions:
   - Renders student input with KaTeX as they type (live preview)
   - Accepts standard math notation (e.g., `x^2`, `(x+3)^2`, `2i`, `-1 + 2i`)
   - Validation: structural equivalence check for equivalent forms (e.g., `(x-3)(x+2)` == `x^2 - x - 6`)

### Problem Types Implementation

6. **`graph_analysis` type** — Steps covering: identify a, b, c → compute axis of symmetry → find vertex → classify max/min → state domain/range.

7. **`rate_of_change` type** — Steps covering: identify interval endpoints → evaluate f(a) and f(b) → compute [f(b)-f(a)]/(b-a) → interpret result.

8. **`simplify_imaginary` type** — Steps covering: factor out -1 from radicand → separate √(-1) → replace with i → simplify remaining radical.

9. **`complex_operations` type** — Steps covering: identify real/imaginary parts → apply operation rules → substitute i² = -1 where needed → collect like terms.

10. **`factor_trinomial` type** — Steps covering: identify standard form → find factor pair → write factored form → apply zero product property → solve each linear equation.

11. **`complete_the_square` type** — Steps covering: move constant → compute (b/2)² → add to both sides → factor perfect square trinomial → take square root → solve.

12. **`quadratic_formula` type** — Steps covering: identify a, b, c → substitute into formula → simplify discriminant → simplify radical → simplify fraction → write solutions.

13. **`discriminant_analysis` type** — Steps covering: identify a, b, c → compute b²-4ac → classify (>0, =0, <0) → state number and type of solutions.

14. **`system_substitution` type** — Steps covering: set expressions equal → rearrange to standard form → solve by factoring or formula → find y-values → write solution pairs.

### Distractor Generation

15. **Distractors for guided mode** — Each step in guided mode shows 3 choices (correct + 2 distractors). Distractors must be plausible wrong answers, not random. The props schema supports explicitly listing distractors per step, or the component can generate common misconception-based distractors for known step types.

## Acceptance Criteria

1. All 11 problem types render correctly in teaching mode with full step reveal
2. Guided mode: correct step selection reveals step with explanation; incorrect shows hint
3. Practice mode: fresh problem presented; blank expressions accept valid math input
4. `MathInputField` renders live KaTeX preview; validates structural equivalence
5. Hint usage, step selection attempts, and fill-in answers all recorded in submission envelope
6. All problem types produce valid `practice.v1` submission envelopes
7. Unit tests for all validation logic (equivalence checking, distractor selection)
8. Component renders correctly at all viewport sizes
9. `npm run lint` and `npm run build` pass

## Out of Scope

- Symbolic algebra engine (CAS) — validation uses pattern matching and known equivalent forms, not a full CAS
- Graphing within this component (handled by `graphing-explorer`)
- Lessons 1-7 content (blocked on correct curriculum content being authored)
