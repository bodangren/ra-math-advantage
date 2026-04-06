# Specification — Supporting Activity Components

## Context

Beyond the graphing and algebraic step-through components, Module 1 requires four additional activity types:

1. **`comprehension-quiz`** — Used for in-class Quick Checks in lessons 1-4 through 1-8. Multi-question assessments with multiple choice and short answer.
2. **`fill-in-the-blank`** — Used within Learn phases for guided reading and key concept checks. Students complete expressions or statements.
3. **`rate-of-change-calculator`** — A dedicated tool for the rate-of-change examples in lesson 1-1 (from equation, table, and graph).
4. **`discriminant-analyzer`** — A focused tool for lesson 1-6 discriminant problems that combines computation and classification in a single interaction.

## Requirements

### `comprehension-quiz` Component

1. Renders a numbered list of questions. Supported question types:
   - `multiple_choice` — 4 options, single correct answer
   - `true_false` — Two options
   - `short_answer` — Math input field (reuses `MathInputField` from Track 6)
   - `select_all` — Multiple correct options possible

2. **Teaching mode** — All questions shown with correct answers highlighted. No interaction.

3. **Guided mode** — Questions shown one at a time. Immediate feedback per question (correct/incorrect + explanation). Student can retry wrong answers once before the correct answer is revealed.

4. **Practice mode** — All questions shown, submitted as a batch. Score computed on submit. Correct answers revealed after submission only.

5. Submission envelope includes per-question correctness, selected/entered answers, retry counts, and total score.

### `fill-in-the-blank` Component

6. Renders rich text with blank slots embedded inline. Each blank is a `MathInputField` (for expression blanks) or a plain text input (for word blanks).

7. **Teaching mode** — Blanks pre-filled with correct answers, shown as highlighted labels. Read-only.

8. **Guided mode** — Blanks empty; student fills in. Immediate feedback per blank on submission. Incorrect blanks show the correct answer with explanation.

9. **Practice mode** — Same as guided but no immediate per-blank feedback — feedback only shown after submitting all blanks.

10. Supports optional word bank (list of terms student can drag into blanks).

### `rate-of-change-calculator` Component

11. Dedicated tool for lesson 1-1 rate of change examples. Source types (configured via props):
    - `from_equation` — Given f(x), compute average rate of change on [a, b]
    - `from_table` — Given a table of (x, f(x)) pairs, compute rate of change
    - `from_graph` — Given graph data, estimate then compute exact rate of change

12. **Teaching mode** — Formula displayed, values substituted with annotations, result computed. Read-only.

13. **Guided mode** — Stepped: student identifies a, f(a), b, f(b) before computing the fraction. Each sub-step validated separately.

14. **Practice mode** — Student enters the full calculation and final answer.

15. Submission includes identified values, computation steps attempted, and final answer.

### `discriminant-analyzer` Component

16. Focused tool for lesson 1-6. Given a quadratic `ax^2 + bx + c = 0`:
    - Student identifies a, b, c
    - Computes `b^2 - 4ac`
    - Classifies: two real / one real / two imaginary solutions
    - Optional: states the exact solutions (extends into quadratic formula use)

17. **Teaching mode** — Full computation shown with labels. Read-only.

18. **Guided mode** — Step-by-step: identify coefficients → plug in → compute → classify. Each step validated.

19. **Practice mode** — Student does full computation; batch validated on submit.

20. Submission includes coefficient identification, discriminant value, classification, and whether it is correct.

## Acceptance Criteria

1. All 4 components render correctly in all 3 modes
2. `comprehension-quiz`: all 4 question types work; scoring correct; retry logic in guided mode works
3. `fill-in-the-blank`: inline blanks accept math and text; word bank drag-and-drop functional
4. `rate-of-change-calculator`: all 3 source types work; stepped validation in guided mode correct
5. `discriminant-analyzer`: coefficient identification, computation, and classification all validated
6. All components emit valid `practice.v1` submission envelopes
7. Unit tests for all validation and scoring logic; >80% coverage
8. All components registered in activity registry
9. `npm run lint` and `npm run build` pass
