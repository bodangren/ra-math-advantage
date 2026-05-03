# Topic 1.10: Rational Functions and Holes

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.10`
- Learning-objective family: `1.10.A`
- Essential-knowledge family: `1.10.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.10.A: Identify holes in the graph of a rational function and distinguish holes from vertical asymptotes using algebraic and graphical reasoning.

## CED Essential Knowledge

- EK 1.10.A.1: A hole occurs in the graph of a rational function when a factor in the denominator cancels completely with a factor in the numerator. The function is undefined at that x-value, but the graph does not diverge to ±∞.
- EK 1.10.A.2: At a hole, both one-sided limits exist and are equal. The y-coordinate of the hole can be found by evaluating the simplified function at the canceled x-value.
- EK 1.10.A.3: Distinguishing holes from vertical asymptotes requires fully factoring both the numerator and denominator and identifying which denominator factors cancel.

## Passwater Scaffolding Notes

- Topic introduction: Passwater teaches Topics 1.9 and 1.10 together as a pair. The central question: "A hole occurs when the factor in the denominator cancels out with factors in the numerator." vs. "A vertical asymptote occurs when a factor in the denominator cannot cancel out with factors in the numerator."
- Key vocabulary (fill-in-the-blank): Hole, vertical asymptote, cancel, simplified form.
- Passwater's table comparing holes and VAs:
  - Holes: f(x) = (x−1)(x+2)/(x−1) and g(x) = (x−1)³/2(x−1)² — both have hole at x = 1.
  - VAs: f(x) = (x−3)(x+2)/(x−1) and g(x) = (x−1)(x+2)/(x−1)² — both have VA at x = 1.
- Hole limit behavior: lim(x→1⁻) f(x) = 3 and lim(x→1⁺) f(x) = 3 (both sides approach the same value).
- VA limit behavior: lim(x→1⁻) f(x) = −∞ and lim(x→1⁺) f(x) = +∞ (sides diverge).
- Example 3 (constructing functions): Write an equation with hole at x = 3, VAs at x = 1 and x = −4 → f(x) = (x−3)(...)/(x−3)(x−1)(x+4) with any numerator factors that don't create additional zeros.
- Scaffolding: Passwater provides "construct a rational function" problems that reinforce the cancellation rule.

## Guided Practice

- Example 1 (shared with 1.9): Determine x-values of holes or VAs:
  - a) f(x) = (x−2)(x+3)/((x+3)(x−5)) → cancel (x+3): hole at x = −3, VA at x = 5
  - b) y = (x+1)(x−2)²/((x−2)(x+1)²) → after canceling one (x−2) and one (x+1): remaining denominator (x+1) gives VA at x = −1; the canceled (x−2) gives hole at x = 2.
  - c) g(x) = 1/(x(x²+4)) → no common factors, VA at x = 0 only.
- Example 2 (shared with 1.9): Limit statements as x approaches 2:
  - b) g(x) = (x−2)(x+4)/((x−2)(x−3)) → cancel (x−2): hole at x = 2, VA at x = 3. lim(x→2⁻) g(x) = 6/−1 = −6, lim(x→2⁺) g(x) = −6 (equal — hole).
- Example 4: Sketch a rational function with:
  - a) f(x) has a hole at x = 1; as x → 4⁻, f(x) → +∞; as x → 4⁺, f(x) → −∞.
  - b) g(x) has holes at x = −2 and x = 3; as x → −1⁻, g(x) → −∞; as x → −1⁺, g(x) → −∞.
- Worksheet A Problem 12: "Holes at x = 2 and x = 5; VA at x = 0; zero at x = 1." → f(x) = (x−2)(x−5)(x−1)/(x−2)(x−5)(x).

## Independent Practice Description

- AP-style tasks: Students distinguish holes from VAs, write equations with specified hole/VA locations, and interpret graphs showing both features.
- Worksheet B (AP-style MCQ): Graph of f shown with VA at x = 4, hole at x = 6, HA at y = 5.
  - Q1–3: Write limit statements as x → 4⁻, x → 6⁺, x → ∞.
  - Q4: "Which could be the equation for f?" (4 options with factored forms — student must match VA and hole locations.)
- Worksheet B Problem 10: (x²−6x+3)/((x²−2)(x²−3x−5)²) → "How many VAs and holes does this graph have?" Factor and count: 2 VAs from x²−2, 2 VAs from x²−3x−5, no common factors → 4 VAs, 0 holes.
- Emphasis: Always factor completely before declaring a VA or hole.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may need to identify holes and VAs from a rational function equation, describe behavior using limits, or construct a rational function with specified features.
- FRQ 3 (Function Concepts from a Graph): Students may interpret a graph showing a hole and write the corresponding limit statement (e.g., "lim(x→6) f(x) = 5").
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (factor, cancel, classify).
  - 2.A: Identify information from mathematical representations (graph → VA/hole locations).
  - 3.B: Justify conclusions (explain why a factor produces a hole rather than a VA).

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Students need to see holes on rational function graphs — a subtle feature that requires zooming in. The graphing-explorer can display the function with a visual hole marker and the simplified form simultaneously.
- Calculator requirement: Graphing calculator recommended. Students can use the table feature to see the undefined row at a hole's x-value.
- Graphing needs: Interactive graphing essential. Students need to zoom in near holes to see the "missing point" and distinguish it from VA behavior.
- Phase package daily phases:
  - Warm-Up: "Factor (x²−5x+6)/(x−2). What is the simplified form? What happened at x = 2?"
  - Topic Introduction: Present the VA vs. hole comparison table. Emphasize: cancellation = hole, no cancellation = VA.
  - Scaffolded Examples: Work through Passwater Examples 1 and 2 (classify each denominator zero as VA or hole).
  - Guided Practice: Students write limit statements for three functions near VAs and holes.
  - Independent Practice: Worksheet A Problems 1–6 and Problems 10–12 (construct functions with specified VAs/holes).
  - Exit Evidence: "Classify each: f(x) = (x−3)(x+1)/(x−3) has a ___ at x = ___. g(x) = (x+2)/(x−3) has a ___ at x = ___."
  - CAP Reflection: "What adaptability move did you make when multiple factors needed canceling?"
