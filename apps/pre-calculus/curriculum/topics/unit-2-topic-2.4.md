# Topic 2.4: Exponential Function Manipulation

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.4`
- Learning-objective family: `2.4.A`
- Essential-knowledge family: `2.4.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.4.A: Use exponent rules to rewrite exponential functions and identify equivalent forms, understanding that horizontal translations and dilations of exponential functions can be rewritten as vertical dilations and base changes.

## CED Essential Knowledge

- EK 2.4.A.1: Exponent rules apply: Product Property b^m · b^n = b^(m+n), Power Property (b^m)^n = b^(mn), and Negative Exponent Property b^(−n) = 1/b^n.
- EK 2.4.A.2: Every horizontal translation f(x) = b^(x+h) is equivalent to a vertical dilation f(x) = a·b^x where a = b^h. Every horizontal dilation f(x) = b^(cx) is equivalent to changing the base: f(x) = (b^c)^x.
- EK 2.4.A.3: These equivalences are unique to exponential functions — horizontal transformations can always be rewritten as combinations of vertical dilation and base change.

## Passwater Scaffolding Notes

Passwater reviews exponent rules (product, power, negative exponent) before introducing the key insight: horizontal transformations of exponential functions are equivalent to vertical dilations or base changes. This is unique to exponential functions. Scaffolding moves: first, students identify horizontal transformations (e.g., f(x) = 2^(x+4) is a horizontal translation left 4); then convert to vertical dilation form (f(x) = 8·2^x); finally, identify equivalent forms in AP-style multiple choice. Misconception: students may think horizontal translations cannot be rewritten as vertical dilations — Passwater shows the equivalence explicitly.

## Guided Practice

**Example 1:** Determine horizontal transformations:
- a) f(x) = 2^(x+4) → horizontal translation left 4
- b) g(x) = 3^(2x) → horizontal dilation by factor 1/2
- c) h(x) = 9^(x/2) → horizontal dilation by factor 2
- d) k(x) = 5^(x−1) → horizontal translation right 1

**Example 2:** Rewrite as vertical dilations (no horizontal translation):
- a) f(x) = 2^(x+3) → f(x) = 2^3 · 2^x = 8 · 2^x
- b) g(x) = 3^(x−2) → g(x) = 3^(−2) · 3^x = (1/9) · 3^x
- c) k(x) = (1/2)^(x+3) → k(x) = (1/2)^3 · (1/2)^x = (1/8) · (1/2)^x

**Example 3:** Which is equivalent to y = 2^(9x)?
- (A) f(x) = 3^x — No
- (B) f(x) = 9 · 3^x — No
- (C) f(x) = 18^x — No
- (D) f(x) = 512^x — Yes, since 2^9 = 512

**Worksheet A — Problem 12:** h(x) = 2 · (9/4)^x — which equivalent form?
- (9/4)^x = (3/2)^(2x), so h(x) = 2 · (3/2)^(2x). Need to match to options.

**Worksheet A — Problem 14:** Equivalent form of p(x) = 2^(−3x)?
- p(x) = (2^(−3))^x = (1/8)^x. Options: (A) p(x) = (−9)^x — No; (D) p(x) = (1/9)^x — No; the answer is p(x) = (1/8)^x.

## Independent Practice Description

Students rewrite exponential expressions in equivalent general form y = a·b^x using exponent rules. Problems include f(x) = 2^(x+7), g(x) = 5^(x−1), h(x) = 3^(x+2), p(x) = (1/2)^(4x−1), m(x) = 2^(3x), s(x) = (3/5)^(2x). Multiple-choice problems ask which expression is equivalent to given forms like f(x) = 4 · (36^x) or g(x) = 25 · (3^x).

## FRQ Expectations

- FRQ 4 (Symbolic Manipulations): Rewriting exponential expressions in equivalent forms.
- Subskills: applying exponent rules, converting horizontal transformations to vertical dilations, identifying equivalent bases.
- AP practices: 1.A (justify equivalence), 2.B (apply exponent rules).

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Step-by-step exponent rule application is essential for students to see each transformation clearly.
- Calculator requirement: No calculator needed (FRQ 4 is no-calculator). Algebraic manipulation only.
- Graphing needs: Optional graph to verify equivalence visually by overlaying two forms.
- Phase package daily phases:
  - Warm-Up: Simplify 2^3 · 2^5, (3^2)^4, 5^(−2).
  - Topic Introduction: Review exponent rules; show that 2^(x+3) = 8 · 2^x.
  - Scaffolded Examples: Examples 1–2 (horizontal transformations, conversion to vertical dilation).
  - Guided Practice: Rewrite f(x) = 2^(3x), g(x) = 5^(x−1), h(x) = (3/5)^(2x) in y = a·b^x form.
  - Independent Practice: Worksheet A problems 1–15 (rewriting and MC equivalence).
  - Exit Evidence: "Rewrite f(x) = 3^(x+2) in the form y = a · b^x."
  - CAP Reflection: "Why can every horizontal translation of an exponential function be rewritten as a vertical dilation? Does this work for quadratic functions?"
