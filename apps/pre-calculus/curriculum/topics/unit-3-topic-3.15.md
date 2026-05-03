# Topic 3.15: Rates of Change in Polar Functions

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.15`
- Learning-objective family: `3.15.A`
- Essential-knowledge family: `3.15.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.15.A: Analyze rates of change of polar functions. Describe how the distance from the origin changes as θ varies. Compute average rates of change over intervals and use them for estimation.

## CED Essential Knowledge

- EK 3.15.A.1: Given a polar function r = f(θ), r is a "signed radius" that can be positive or negative. The distance from the origin to a point (r, θ) is |r|.
- EK 3.15.A.2: When r is positive and increasing, the distance from the origin is increasing. When r is positive and decreasing, the distance is decreasing. When r is negative and increasing, the distance is decreasing. When r is negative and decreasing, the distance is increasing.
- EK 3.15.A.3: If r changes from increasing to decreasing (or decreasing to increasing), the function has a relative extremum corresponding to a point closest to or farthest from the origin.
- EK 3.15.A.4: The average rate of change of r with respect to θ over [a, b] is (f(b) − f(a))/(b − a). This indicates the rate at which the radius is changing per radian. It can be used to estimate values of f(θ) within the interval using point-slope form.

## Passwater Scaffolding Notes

Passwater introduces the concept of "signed radius": "Given a polar function r = f(θ), we know that r represents the 'signed radius' of the function. We use the phrase 'signed radius' because r can be a positive or negative value." This is a key abstraction — students must think about r as a directed quantity, not just a distance.

The distance-from-origin table is the central tool:

| r behavior | Distance to origin |
|-----------|-------------------|
| r positive and increasing | Distance increasing |
| r positive and decreasing | Distance decreasing |
| r negative and increasing | Distance decreasing |
| r negative and decreasing | Distance increasing |

This table requires students to first determine whether r is positive or negative, then whether r is increasing or decreasing, before reading off the distance behavior. Common error: forgetting that negative r values reverse the increasing/decreasing relationship.

For relative extrema: "For polar functions, if r changes from increasing to decreasing (or from decreasing to increasing), then the function has a relative extremum on the interval corresponding to a point relatively closest to or farthest from the origin."

Average rate of change: (f(b) − f(a))/(b − a) over [a, b]. "Geometrically, the average rate of change indicates the rate at which the radius is changing per radian." Estimation uses point-slope: r − r₁ = (average rate of change)(θ − θ₁).

AP exam tip: "It is often helpful to sketch the graph of a given function in rectangular coordinates when attempting to describe the behavior of a polar function."

Note: This topic has notes-only coverage (5 pages) with no worksheets.

## Guided Practice

**Example 1:** Graph of f(x) = r shown for a ≤ θ ≤ b. Complete a table: for each interval, determine whether r is positive/negative and increasing/decreasing, then determine distance behavior.

**Example 2:** f(θ) = r, 0 ≤ θ ≤ 2π. Which statement is true about distance between (r, θ) and origin?
- (A) Distance increasing for [0, π/2] because r positive and increasing. (Correct)
- (B) Distance increasing for [π/2, π] because r negative and increasing. (Incorrect — r neg and increasing means distance decreasing)

**Example 3:** f(θ) shown in rectangular coordinates. On which interval is the distance from the origin decreasing? Students read the rectangular graph to determine sign and monotonicity of r, then apply the table.

**Example 4:** r = f(θ), 0 ≤ θ ≤ 2π. Relative minimum on interval where r changes from decreasing to increasing (distance goes from decreasing to increasing). Relative maximum where r changes from increasing to decreasing.

**Example 5:** Graph of polar function. Average rate of change over interval [a, b] = (f(b) − f(a))/(b − a).

**Example 6:** Graph for a ≤ θ ≤ b. On which interval is average rate of change equal to zero? Options: [0, π/4], [π/4, π/2], [π/2, 3π/4], [3π/4, π]. Answer: interval where f(b) = f(a).

**Example 7:** Polar function passes through A, B, C, D. On which interval is average rate of change least? Students compute (f(b) − f(a))/(b − a) for each interval and compare.

**Example 8:** Table of f(θ) values. Use average rate of change over [a, b] to approximate f(θ) at a point within the interval via point-slope form.

## Independent Practice Description

No worksheets for this topic. Practice is embedded in the notes examples. Students should work through Examples 1–8 as guided and independent practice.

## FRQ Expectations

FRQ 4 (Symbolic Manipulations, NO calculator): Subskills for 3.15: determining distance behavior from sign and monotonicity of r, identifying relative extrema from r's behavior, computing average rate of change, using average rate of change for estimation. AP practices: 1.A, 1.B, 2.A, 3.A, 3.C.

## App-Build Notes

- Recommended componentKey: `rate-of-change-calculator`
- Rationale: Computing average rate of change of r with respect to θ and using it for estimation is the core skill — a rate-of-change tool supports this.
- Calculator requirement: NO calculator — intervals and values are chosen for exact computation.
- Graphing needs: Rectangular graph of r = f(θ) with sign/monotonicity annotations. Polar graph overlay showing distance behavior.
- Phase package daily phases:
  - Warm-Up: If r = 3 cos θ, what is r when θ = 0? When θ = π/2? Is r increasing or decreasing on [0, π/2]?
  - Topic Introduction: Passwater signed radius concept and distance-from-origin table.
  - Scaffolded Examples: Examples 1–4 (complete distance table, identify relative extrema).
  - Guided Practice: Examples 5–7 (average rate of change, comparison).
  - Independent Practice: Example 8 (estimation using average rate of change) or create additional interval problems.
  - Exit Evidence: For a polar function, r = 2 when θ = 0 and r = 5 when θ = π/4. What is the average rate of change? Estimate r when θ = π/8.
  - CAP Reflection: "Why does r being negative and increasing mean the distance is decreasing? How is the average rate of change of a polar function different from the average rate of change of a rectangular function?"
