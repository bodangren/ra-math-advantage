# Topic 2.12: Logarithmic Function Manipulation

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.12`
- Learning-objective family: `2.12.A`
- Essential-knowledge family: `2.12.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.12.A: Expand and condense logarithmic expressions using properties of logarithms, identify equivalent logarithmic expressions, and understand the relationship between horizontal dilations and vertical translations for logarithmic functions.

## CED Essential Knowledge

- EK 12.A.1: Since logarithmic expressions can be written in exponential form, exponent properties translate to log properties: Product Property log_b(xy) = log_b(x) + log_b(y), Quotient Property log_b(x/y) = log_b(x) − log_b(y), Power Property log_b(x^n) = n · log_b(x).
- EK 12.A.2: Change of Base: log_a(x) = log_b(x) / log_b(a), where a > 0 and a ≠ 1. This shows all logarithmic functions are vertical dilations of each other.
- EK 12.A.3: A horizontal dilation of a log function is equivalent to a vertical translation: log(cx) = log(c) + log(x). This is analogous to the exponential function property from Topic 2.4.

## Passwater Scaffolding Notes

Passwater derives log properties from exponent properties, since log expressions can be written in exponential form. Scaffolding: (1) condense sums/differences of logs into single expressions using product, quotient, and power properties, (2) identify equivalent forms in MC (e.g., which is equivalent to log₃(x²/y)?), (3) show that horizontal dilation ↔ vertical translation for logs: log(6x) = log(6) + log(x) = g(x) + log(6), so k = log 6, (4) show all log bases are vertical dilations of each other using change of base. Key misconceptions: log(a + b) ≠ log(a) + log(b) — you can only split products, not sums; log(x²) = 2 log(x), NOT (log x)².

## Guided Practice

**Example 1:** Condense to single logarithm:
- a) log₄(x) + log₄(y) = log₄(xy)
- b) log₃(5) − log₃(z) = log₃(5/z)
- c) log₁₀(x) − log₁₀(z) − 5 log₁₀(w) = log₁₀(x / (z · w⁵))
- d) 2 log₂(x) − 3 log₂(y) = log₂(x²/y³)
- e) 2 log₇(a) − 5 log₇(b) + log₇(4) = log₇(4a²/b⁵)
- f) 6 + 2 log(x) = log(10⁶) + log(x²) = log(10⁶x²)

**Example 2:** Which is equivalent to log₃(x²/y)?
- (A) log₃(2x) − log₃(y) — No (log₃(2x) = log₃2 + log₃x)
- (B) 2(log₃x − log₃y) = 2 log₃x − 2 log₃y — No
- (C) 2 log₃x − log₃y — Yes ✓
- (D) log₃x + log₃2 − log₃y — No

**Example 3:** f(x) = log(6x) is a horizontal dilation of g(x) = log(x). Show f can also be written as vertical translation.
- log(6x) = log(6) + log(x) = g(x) + log(6), so k = log 6 ≈ 0.778.

**Example 4:** Let f(x) = log₄(x) and g(x) = log₉(x). Show f is a vertical dilation of g.
- f(x) = log₄(x) = log₉(x) / log₉(4) = g(x) / log₉(4). So k = 1/log₉(4) = log₄(9).

**Example 5:** Which is equivalent to 3 ln(x) − 4 ln(y)?
- (A) ln(x³/y⁴) — Yes ✓ (power property then quotient property)
- (B) ln(x³/4y) — No
- (C) ln(3x − 4y) — No (log of a difference)
- (D) ln(3x) − ln(4y) — No

## Independent Practice Description

Students condense expressions: 3 log₃4 + log₃z, ln x − ln w, log₁₀3x − log₁₀5, 4 log₄6 + 3 log₄x, 5 ln2 + ln x − 2 ln y − ln w. Multiple-choice problems ask for equivalent expressions. Students explore relationships between graphs: f(x) = log(x), g(x) = log(x + 4) — horizontal translation; h(x) = ln(x), k(x) = ln(8x) — horizontal dilation that is equivalent to vertical translation by ln(8).

## FRQ Expectations

- FRQ 4 (Symbolic Manipulations): Expanding and condensing logarithmic expressions.
- Subskills: product/quotient/power properties, change of base, equivalent form identification.
- AP practices: 1.A (justify equivalence), 2.B (apply log properties).

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Step-by-step application of log properties (product → sum, quotient → difference, power → coefficient) is essential for building fluency.
- Calculator requirement: No calculator needed (FRQ 4 is no-calculator). Algebraic manipulation only.
- Graphing needs: Optional overlay of log(cx) and log(x) + log(c) to verify equivalence visually.
- Phase package daily phases:
  - Warm-Up: "Simplify log₅(3 · 7) using the product property."
  - Topic Introduction: Derive log properties from exponent properties; present product, quotient, power, change of base.
  - Scaffolded Examples: Examples 1–3 (condense, identify equivalent forms, horizontal dilation ↔ vertical translation).
  - Guided Practice: Students condense: 3 log₃4 + log₃z, 2 log₂x − 3 log₂y, 5 ln2 + ln x − 2 ln y.
  - Independent Practice: Worksheet A problems 1–14 (condensing, MC equivalence, graph relationships).
  - Exit Evidence: "Condense 2 log₇(a) − 5 log₇(b) + log₇(4) to a single logarithm."
  - CAP Reflection: "Why does log(a + b) ≠ log(a) + log(b)? What property does this violate?"
