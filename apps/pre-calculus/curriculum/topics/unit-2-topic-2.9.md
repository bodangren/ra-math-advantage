# Topic 2.9: Logarithmic Expressions

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.9`
- Learning-objective family: `2.9.A`
- Essential-knowledge family: `2.9.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.9.A: Convert between exponential and logarithmic forms, evaluate logarithms without a calculator, and use common and natural logarithms with a calculator.

## CED Essential Knowledge

- EK 2.9.A.1: Every operation has exactly one inverse. Just as we can write rational numbers in decimal form and fraction form (0.5 = 1/2), we can write equations in exponential form or logarithmic form: b^a = c ↔ log_b(c) = a.
- EK 2.9.A.2: If the base of a log expression is 10, this is the common logarithm, written without a base: log 3 means log₁₀ 3. ln x means logₑ x (natural logarithm).
- EK 2.9.A.3: Logarithmic scales allow us to view data that spans many orders of magnitude. A logarithmic scale on a graph's vertical axis transforms exponential data into a linear display.

## Passwater Scaffolding Notes

Passwater motivates logarithms by stating "every operation has exactly one inverse" — just as subtraction undoes addition, logarithms undo exponentiation. The big idea: exponential form b^a = c and logarithmic form log_b(c) = a are interchangeable — converting doesn't change the problem, it's just rewriting. Scaffolding: (1) convert exponential to log form and vice versa, (2) evaluate logs without calculator by asking "what exponent gives this result?" (e.g., log₂8 = 3 since 2³ = 8), (3) evaluate with calculator using change of base, (4) plot points on log-scaled axes. Vocabulary: common logarithm (base 10, written log), natural logarithm (base e, written ln). Misconception: log without a base means base 10; ln means base e.

## Guided Practice

**Example 1:** Convert exponential to log form:
- a) 3² = 9 → log₃9 = 2
- b) 10^x = y → log y = x
- c) r^t = w → log_r(w) = t
- d) y = e^(3x) → ln y = 3x

**Example 2:** Convert log to exponential form:
- a) log₇(x) = 2 → 7² = x
- b) x = log₃(y) → 3^x = y
- c) log y = 2 → 10² = y
- d) ln c = 4 → e⁴ = c

**Example 3:** Evaluate without calculator:
- a) log₂8 = 3 (since 2³ = 8)
- b) log₅25 = 2 (since 5² = 25)
- c) log₂32 = 5 (since 2⁵ = 32)
- d) log 100 = 2 (since 10² = 100)
- e) log₁₆4 = 1/2 (since 16^(1/2) = 4)
- f) log₃1 = 0 (since 3⁰ = 1)
- g) log 10 = 1
- h) log₆₃6 = 2

**Example 4:** Evaluate with calculator (4 decimal places):
- a) log 9 ≈ 0.9542
- b) log 6125 ≈ 3.7871
- c) log₂10 = log 10 / log 2 ≈ 3.3219
- d) log₇135 = log 135 / log 7 ≈ 2.4957

**Worksheet B — Challenging evaluations:**
- log₂16 = 4, ln(e^(−3)) = −3, log₃27 = 3, log₅125 = 3, log₂₇3 = 1/3, ln(e^(1/2)) = 1/2, log 1 = 0, log₁/₆4 = log₆(1/4) / log₆(1/6) = −log₆4 / (−1) = log₆4 ≈, log₉3 = 1/2, log₄₉7 = 1/2, ln√e = 1/2.

## Independent Practice Description

Students convert between exponential and logarithmic forms (2³ = 8 → log₂8 = 3; e^(x+2) = 7 → ln(7) = x+2), evaluate logarithms without calculator (log₃9, log₆36, ln 1, log 10, log₁/₄16, log₂8, log₉(1/3), log₃₆(1/6), log₂(1/32)), and use calculator for non-integer results. Problems also include plotting data on log-scaled graphs and interpreting what linearity means.

## FRQ Expectations

- FRQ 1 (Function Concepts): Converting between exponential and logarithmic forms.
- FRQ 4 (Symbolic Manipulations): Evaluating logarithmic expressions.
- Subskills: form conversion, evaluation, calculator use with change of base.
- AP practices: 1.A (justify), 2.A (calculate), 2.B (apply log definition).

## App-Build Notes

- Recommended componentKey: `fill-in-the-blank`
- Rationale: Logarithm definition (b^a = c ↔ log_b(c) = a) and evaluation lend themselves to fill-in-the-blank for converting forms and finding exponents.
- Calculator requirement: Calculator allowed for Problems 21+ (evaluating with change of base); no calculator for problems 1–20.
- Graphing needs: Logarithmically scaled coordinate plane for plotting exponential data.
- Phase package daily phases:
  - Warm-Up: "Convert 5² = 25 to logarithmic form."
  - Topic Introduction: Define logarithm as inverse of exponentiation; present the two forms.
  - Scaffolded Examples: Examples 1–3 (convert forms, evaluate without calculator).
  - Guided Practice: Students convert and evaluate: log₃9, log₆36, ln 1, log₁/₄16.
  - Independent Practice: Worksheet A problems 1–22 (conversion, evaluation, graphing).
  - Exit Evidence: "Evaluate log₂32 without a calculator. Show your reasoning."
  - CAP Reflection: "Why is the logarithm the inverse of exponentiation? How does log_b(c) = a relate to b^a = c?"
