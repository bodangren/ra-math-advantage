# Topic 2.1: Change in Arithmetic and Geometric Sequences

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.1`
- Learning-objective family: `2.1.A`
- Essential-knowledge family: `2.1.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.1.A: Identify sequences as arithmetic or geometric and write explicit expressions for sequences given initial terms, common differences/ratios, or two terms.

## CED Essential Knowledge

- EK 2.1.A.1: A sequence is a function whose domain is a subset of the integers. Arithmetic sequences are characterized by a constant difference between consecutive terms; geometric sequences are characterized by a constant ratio between consecutive terms.
- EK 2.1.A.2: Arithmetic sequences have explicit formulas of the form a_n = a_0 + d·n or a_n = a_k + d·(n−k). Geometric sequences have explicit formulas of the form g_n = g_0 · r^n or g_n = g_k · r^(n−k).
- EK 2.1.A.3: Arithmetic sequences model constant additive change and behave like linear functions; geometric sequences model constant multiplicative change and behave like exponential functions. Both are discrete (points only, no connecting lines or curves).

## Passwater Scaffolding Notes

Passwater introduces sequences by defining a sequence as a function from the **natural** numbers to the **real** numbers — emphasizing that inputs are whole numbers only but outputs can be any real number. When graphing, points cannot be connected. The scaffolding builds from evaluating explicit formulas (a_n = 4n − 3) to classifying sequences as arithmetic, geometric, or neither, to writing formulas from given information. Key misconceptions addressed: arithmetic sequences behave like linear functions but are not continuous; geometric sequences behave like exponential functions but are not continuous. Passwater emphasizes the general form g_n = g_k · r^(n−k) as "usually the best form to use" for geometric sequences, and when given two terms without r, the larger k value should be used as the g_n term. Vocabulary includes: sequence, arithmetic (common difference d), geometric (common ratio r), explicit formula, domain, range.

## Guided Practice

**Example 1:** Consider a_n = 4n − 3. Find a_1 and a_7.
- Solution: a_1 = 4(1) − 3 = 1; a_7 = 4(7) − 3 = 25.

**Example 2:** Classify each as arithmetic, geometric, or neither:
- a) s_n = 2 − 3n → Arithmetic, d = −3
- b) s_n = 6 − 2^n → Neither (exponential in n)
- c) −7, −2, 3, 8, 13, ... → Arithmetic, d = 5
- d) −1, 2, 3, 4, 5, ... → Neither (d is not constant)

**Example 3:** Let a_n be arithmetic with a_3 = 8 and d = −3. Find a_n and a_12.
- Solution: a_n = a_3 + d(n−3) = 8 − 3(n−3) = 17 − 3n; a_12 = 17 − 36 = −19.

**Example 4:** Let a_n be arithmetic with a_2 = 7 and a_6 = 9. Find a_n and a_24.
- d = (9 − 7)/(6 − 2) = 2/4 = 1/2; a_n = 7 + (1/2)(n−2) = n/2 + 6; a_24 = 18.

**Example 6:** Classify each as arithmetic, geometric, or neither:
- a) s_n = 2 · 3^n → Geometric, r = 3
- b) s_n = (1/4) · 2^(−n) → Geometric, r = 1/2
- c) 1, 3, 2, 6, 4, 12, 8, 24, ... → Neither (not geometric)
- d) −16, −8, −4, −2, −1, ... → Geometric, r = 1/2

**Example 7:** g_n geometric with g_1 = 12 and r = 2. Find g_n and g_4.
- g_n = 12 · 2^(n−1); g_4 = 12 · 2^3 = 96.

**Part II — Example 3:** g_n geometric with g_3 = −2 and g_6 = 128. Find g_n and g_11.
- 128 = −2 · r^(6−3), so 128 = −2r^3, r^3 = −64, r = −4.
- g_n = −2 · (−4)^(n−3); g_11 = −2 · (−4)^8 = −2 · 65536 = −131072.

## Independent Practice Description

Students classify sequences from tables and lists as arithmetic, geometric, or neither, then write explicit formulas. Problems include finding a_n from a single term and common difference/ratio, from two terms, and evaluating specific terms. Worksheet A includes sequences like 12, 7, 2, −3, −8, ... (arithmetic, d = −5) and −5, 10, −20, 40, ... (geometric, r = −2). Problems 13–18 focus on geometric sequences with conditions like g_1 = 5 and r = −2, or g_2 = 48 and g_7 = 1.5.

## FRQ Expectations

- FRQ 1 (Function Concepts): Evaluating sequences at specific indices, connecting discrete sequences to continuous function behavior.
- Subskills: identifying sequence type, writing explicit formulas, evaluating terms using a_k + d(n−k) or g_k · r^(n−k).
- AP practices: 1.A (justify), 1.B (interpret), 2.A (calculate).

## App-Build Notes

- Recommended componentKey: `fill-in-the-blank`
- Rationale: Sequence vocabulary and formulas lend themselves naturally to fill-in-the-blank for formulas like a_n = a_0 + ___·n and g_n = g_0 · ___^n.
- Calculator requirement: No calculator needed — arithmetic with integers and simple fractions.
- Graphing needs: Coordinate plane to plot discrete points of sequences (no connecting lines).
- Phase package daily phases:
  - Warm-Up: Evaluate a_n = 4n − 3 for n = 1, 5, 10.
  - Topic Introduction: Define sequence as function from natural numbers to real numbers; fill-in-the-blank vocabulary.
  - Scaffolded Examples: Examples 1–2 (evaluate formulas, classify arithmetic), then Examples 6–7 (classify geometric, write formulas).
  - Guided Practice: Students classify sequences from lists and write formulas given single terms and d or r.
  - Independent Practice: Worksheet A problems 1–12 (arithmetic) and 13–18 (geometric), including two-term problems like g_3 = −2 and g_6 = 128.
  - Exit Evidence: "Let a_n be arithmetic with a_5 = 7 and a_3 = −9. Find a_n."
  - CAP Reflection: "Why can't we connect the dots when graphing a sequence? How does this relate to the domain?"
