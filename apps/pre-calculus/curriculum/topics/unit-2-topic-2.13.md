# Topic 2.13: Exponential and Logarithmic Equations and Inequalities

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.13`
- Learning-objective family: `2.13.A`
- Essential-knowledge family: `2.13.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.13.A: Solve exponential and logarithmic equations and inequalities by isolating and converting between forms, using log properties and common bases, finding inverses of exponential/log functions in general form, and checking for extraneous solutions.

## CED Essential Knowledge

- EK 13.A.1: Converting between forms: b^c = a ↔ log_b(a) = c. Steps: (1) isolate the exponential or log, (2) convert to the alternate form, (3) solve for the variable, (4) simplify.
- EK 13.A.2: Equations with multiple logarithms use log properties to simplify to one of two forms: log_a(x) = b (convert to exponential) or log_a(x) = log_a(y) (set x = y). Always check for extraneous solutions — log properties can create solutions outside the domain.
- EK 13.A.3: Equations with multiple exponentials can be solved by finding common bases using exponent properties, then setting exponents equal. Inequalities follow the same conversion process with inequality signs preserved.

## Passwater Scaffolding Notes

Passwater scaffolds equation solving in four stages: (1) single exponential/log — isolate and convert (e.g., 4^(x−2) = 7 → x = 2 + log₄(7)), (2) single log with isolation (e.g., 2 log₃(x+3) + 4 = 10 → x = 24), (3) multiple logs — use properties to combine, then convert, always checking extraneous solutions (e.g., log₃(x+2) + log₃(x−3) = log₃(14) → x² − x − 20 = 0), (4) common bases for exponential equations (e.g., 8^(3x−2) = 2^(x+5) → 2^(9x−6) = 2^(x+5) → 8x = 11), (5) finding inverses of general form f(x) = 4^(3x+2) − 15, (6) inequalities with exponential/log functions. Key misconception: "canceling" logs by subtraction does not work if they have different arguments; log(x+y) ≠ log(x) + log(y).

## Guided Practice

**Example 1:** Solve (single exponential):
- a) 4^(x−2) = 7 → x − 2 = log₄(7) → x = 2 + log₄(7)
- b) 2^(x+3) + 5 = 26 → 2^(x+3) = 21 → x + 3 = log₂(21) → x = log₂(21) − 3
- c) −7 = 3 − 4e^x → −10 = −4e^x → e^x = 5/2 → x = ln(5/2)

**Example 2:** Solve (single log):
- a) 2 log₃(x+3) + 4 = 10 → log₃(x+3) = 3 → x + 3 = 27 → x = 24
- b) 2 + log₅(2x−1) = 4 → log₅(2x−1) = 2 → 2x − 1 = 25 → x = 13
- c) ln(2−x)/5 = 1 → ln(2−x) = 5 → 2 − x = e⁵ → x = 2 − e⁵

**Example 3:** Solve (multiple logs, check extraneous):
- a) log(3) + log(x+4) = log(5x−2) → log(3(x+4)) = log(5x−2) → 3x + 12 = 5x − 2 → x = 7
- b) ln(x+1) − ln(3x−5) = ln(7) → ln((x+1)/(3x−5)) = ln(7) → (x+1)/(3x−5) = 7 → x + 1 = 21x − 35 → 20x = 36 → x = 9/5. Check: 3(9/5) − 5 = 27/5 − 25/5 = 2/5 > 0 ✓
- c) log₃(x+2) + log₃(x−3) = log₃(14) → (x+2)(x−3) = 14 → x² − x − 20 = 0 → (x−5)(x+4) = 0. x = 5 ✓, x = −4 ✗ (extraneous: x − 3 = −7 < 0)

**Example 7:** Solve (common bases):
- a) 25^(x−1) = 2^(2x+7) → No common base — use logs
- b) 8^(3x−2) = 2^(x+5) → 2^(9x−6) = 2^(x+5) → 9x − 6 = x + 5 → 8x = 11 → x = 11/8
- c) 9^(2x) = 27^(x+2) → 3^(4x) = 3^(3x+6) → 4x = 3x + 6 → x = 6
- d) (1/2)^(5x+7) = 4^x → 2^(−5x−7) = 2^(2x) → −5x − 7 = 2x → x = −1

**Part II — Example 1:** Find inverse of f(x) = 4^(3x+2) − 15.
- y = 4^(3x+2) − 15 → y + 15 = 4^(3x+2) → log₄(y+15) = 3x+2 → x = (log₄(y+15) − 2)/3. So f⁻¹(x) = (log₄(x+15) − 2)/3.

**Part II — Example 5:** g(x) = ln(x²+5), h(x) = ln(x+4). Find x where g(x) < h(x).
- ln(x²+5) < ln(x+4) → x² + 5 < x + 4 → x² − x + 1 < 0. Discriminant = 1 − 4 = −3 < 0, so x² − x + 1 > 0 for all x. No solution.

## Independent Practice Description

Students solve single exponential/log equations (3^(x+4) = 15, 4^(x+3) − 7 = 2, log₂(x−1) = 3, 3 log₄(x) + 2 = −7), multiple log equations with extraneous checking (log₃(2x−1) − log₃(x+3) = log₃4, ln(3x−1) + ln2 = ln(11x+13)), common base problems (3^(x−1) = 9^(2x+5), 4^(2x−3) = 2^x), inverse finding (f(x) = 3^(x−2) + 1, g(x) = 4(2)^(3x) − 5, k(x) = 3 log(x+1) − 2), and inequalities (4^(x+1) + 12 · 5^(x+3) ≥ 57).

## FRQ Expectations

- FRQ 4 (Symbolic Manipulations): Solving exponential and logarithmic equations algebraically.
- FRQ 1 (Function Concepts): Finding inverses of exponential and log functions.
- Subskills: isolation, form conversion, common bases, extraneous solution checking, inverse finding, inequality solving.
- AP practices: 1.A (justify steps), 2.A (calculate), 2.B (apply properties).

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Step-by-step equation solving is critical — students need to see each isolation and conversion step clearly.
- Calculator requirement: No calculator needed (FRQ 4 is no-calculator). Algebraic solving only.
- Graphing needs: Optional graph to verify solutions visually and check for extraneous solutions.
- Phase package daily phases:
  - Warm-Up: "Solve 2^x = 16. What form did you use?"
  - Topic Introduction: Present the 4-step process: isolate, convert, solve, simplify. Show b^c = a ↔ log_b(a) = c.
  - Scaffolded Examples: Examples 1–3 (single exponential, single log, multiple logs with extraneous check).
  - Guided Practice: Students solve: 3^(x+4) = 15, 2 log₃(x+3) + 4 = 10, log(3) + log(x+4) = log(5x−2).
  - Independent Practice: Worksheet A problems 1–20 (single and multiple equations), Worksheet B problems 1–12 (common bases), Worksheet C problems 1–6 (inverses), problems 7–9 (inequalities).
  - Exit Evidence: "Solve log₃(2x−1) − log₃(x+3) = log₃4. Check for extraneous solutions."
  - CAP Reflection: "Why must you always check for extraneous solutions when solving log equations?"
