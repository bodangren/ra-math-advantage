# Topic 3.12: Equivalent Representations of Trigonometric Functions

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.12`
- Learning-objective family: `3.12.A`
- Essential-knowledge family: `3.12.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.12.A: Use trigonometric identities — including reciprocal, Pythagorean, sum/difference, and double angle — to rewrite expressions in equivalent forms.

## CED Essential Knowledge

- EK 3.12.A.1: Reciprocal identities: 1/sin x = csc x, 1/cos x = sec x, 1/tan x = cot x, sin x/cos x = tan x, cos x/sin x = cot x.
- EK 3.12.A.2: Pythagorean identities: sin²θ + cos²θ = 1. Dividing by cos²θ gives 1 + tan²θ = sec²θ. Dividing by sin²θ gives 1 + cot²θ = csc²θ.
- EK 3.12.A.3: Inverse trig identities: cos⁻¹(x) = sin⁻¹(√(1 − x²)), sin⁻¹(x) = cos⁻¹(√(1 − x²)).
- EK 3.12.A.4: Sum/difference identities: sin(α ± β) = sin α cos β ± cos α sin β. cos(α ± β) = cos α cos β ∓ sin α sin β.
- EK 3.12.A.5: Double angle identities: sin(2θ) = 2 sin θ cos θ. cos(2θ) = cos²θ − sin²θ = 1 − 2 sin²θ = 2 cos²θ − 1.

## Passwater Scaffolding Notes

Passwater dedicates two sets of notes (8 total pages) to this topic, reflecting its depth. The first set covers reciprocal identities and the Pythagorean identity: "This identity is pretty remarkable: for any angle, the square of the sine of the angle plus the square of the cosine of the angle always equals 1." The derived forms 1 + tan²θ = sec²θ and 1 + cot²θ = csc²θ are obtained by dividing by cos²θ and sin²θ respectively.

Inverse trig identities are included: cos⁻¹(x) = sin⁻¹(√(1 − x²)) and sin⁻¹(x) = cos⁻¹(√(1 − x²)). These connect Topic 3.9 (inverse trig) to algebraic manipulation.

Sum/difference identities and double angle identities are presented with worked examples. The double angle formulas have three equivalent forms for cos(2θ): cos²θ − sin²θ, 1 − 2 sin²θ, 2 cos²θ − 1. Students must recognize all forms and choose strategically.

The second set of notes (Pages 159–162) focuses on rewriting expressions: "Rewrite f(x) = (sin²x · sec x) / csc x involving tan x only." The strategy is systematic: convert everything to sin and cos, simplify, then express in the target function.

Scaffolding moves: reciprocal substitution → Pythagorean identity application → inverse trig identities → sum/difference → double angle → combined rewriting exercises → matching/simplification activity.

## Guided Practice

**Example 1:** f(x) = tan x · csc x. Rewrite as fraction involving powers of cos x. tan x · csc x = (sin x/cos x)(1/sin x) = 1/cos x = sec x = 1/cos¹x.

**Example 2:** Which is equivalent to 2 sin(π/14) cos(π/14)? By double angle: 2 sin θ cos θ = sin(2θ). Answer: sin(π/7).

**Example 3:** k(x) = 4 cos(2x). Equivalent form? Options: 8 sin x cos x (that's 4 sin(2x) — no), 4 − 8 sin²x (using cos(2x) = 1 − 2 sin²x, so 4(1 − 2 sin²x) = 4 − 8 sin²x — yes), 8 cos²x − 4 (using 2 cos²x − 1: 4(2 cos²x − 1) = 8 cos²x − 4 — yes).

**Example 4:** cos(π/8) cos(π/16) − sin(π/8) sin(π/16) = cos(π/8 + π/16) = cos(3π/16). But the options show cos(π/16) — this uses the difference form: cos(π/8) cos(π/16) + sin(π/8) sin(π/16) = cos(π/16). The minus sign gives cos(π/8 − π/16) = cos(π/16).

**Example 8:** P(−5, 11) and Q(2, 5) on circles. Find: a) cos(2α) = 1 − 2 sin²α where sin α = 11/√146. b) sin(α + β). c) cos(α − β).

## Independent Practice Description

Worksheet A: 18 problems. Problems 1–6: Rewrite in terms of a single function — g(x) = tan x · sec x → sin x powers; h(x) = (1 − cos²x)/cos²x → tan x; f(x) = (sec²x − 1)/sin²x → sec x; k(x) = csc x · tan x → sec x; j(x) = sec²x · cot x · tan x → sin x powers; m(x) = (cot x · cos x)/csc x → cos x powers. Problems 7–9: Two circles, P(4,3), Q(5,12). Find sin 2α, sin(α+β), cos(α−β). Problems 10–12: P(−2,5), Q(3,7). Find cos 2α, sin(α−β), cos(α+β). Problems 13–18: MC equivalent expressions (4 cos(2x), (sin x + cos x)², (cos²x − 1)/cos²x, etc.).

Worksheet B: 8 matching/simplification problems. Answers: A. −1, B. sec θ, C. 1, D. sin²θ, E. 2, F. cos²θ, G. sec θ csc θ, H. cos θ. Problems include: tan²θ − sec²θ → −1; tan θ sin θ + cos θ → sec θ; tan²θ/(1 + tan²θ) → sin²θ; (sin θ − cos θ)² + (sin θ + cos θ)² → 2.

## FRQ Expectations

FRQ 4 (Symbolic Manipulations, NO calculator): Subskills for 3.12: applying Pythagorean identity, using double angle formulas, rewriting expressions in equivalent form, matching/simplifying trig expressions. AP practices: 1.A, 1.C, 2.A, 3.A, 3.B, 3.C.

## App-Build Notes

- Recommended componentKey: `step-by-step-solver`
- Rationale: Identity application requires step-by-step algebraic reasoning — show each substitution and simplification step.
- Calculator requirement: NO calculator — FRQ 4 is NO calculator.
- Graphing needs: Unit circle with points P and Q labeled for coordinate-based identity problems.
- Phase package daily phases:
  - Warm-Up: If sin θ = 3/5, what is cos²θ? How do you know?
  - Topic Introduction: Passwater identity catalog — reciprocal, Pythagorean, sum/difference, double angle.
  - Scaffolded Examples: Examples 1–4 (reciprocal substitution, double angle recognition).
  - Guided Practice: Worksheet A Problems 1–6 (rewrite in single function).
  - Independent Practice: Worksheet B (matching/simplification) or A Problems 13–18 (MC equivalents).
  - Exit Evidence: Rewrite tan²θ − sec²θ in simplified form. Rewrite 2 sin(π/10) cos(π/10) using a double angle identity.
  - CAP Reflection: "Which identity do you reach for first when simplifying? Why does sin²θ + cos²θ = 1 always work?"

## Additional Notes

The matching activity in Worksheet B is a high-engagement format: each simplified expression maps to exactly one answer from a fixed set (A through H). This constraint forces students to verify their work — if two expressions simplify to the same answer, something is wrong. The activity also reveals common patterns: tan²θ − sec²θ always equals −1 (from the Pythagorean identity rearranged), and (sin θ − cos θ)² + (sin θ + cos θ)² always equals 2 (expanding both squares gives sin²θ − 2 sin θ cos θ + cos²θ + sin²θ + 2 sin θ cos θ + cos²θ = 2(sin²θ + cos²θ) = 2).
