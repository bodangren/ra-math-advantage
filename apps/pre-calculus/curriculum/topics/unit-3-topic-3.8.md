# Topic 3.8: The Tangent Function

## CED Identity

- Unit: 3
- Unit title: Trigonometric and Polar Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `3.8`
- Learning-objective family: `3.8.A`
- Essential-knowledge family: `3.8.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-3.md`

## CED Learning Objectives

- LO 3.8.A: Analyze the graph of the tangent function, including its period, vertical asymptotes, and domain. Write equations for transformed tangent functions.

## CED Essential Knowledge

- EK 3.8.A.1: The tangent function is defined as tan θ = sin θ / cos θ, or equivalently as the slope of the terminal ray. When the terminal ray is vertical (θ = π/2 + kπ), the slope is undefined and the tangent function has vertical asymptotes.
- EK 3.8.A.2: The period of tan θ is π. For f(θ) = a tan(b(θ − c)) + d, the period is π/|b|.
- EK 3.8.A.3: Transformations of the tangent function include vertical dilation by |a|, horizontal dilation by 1/b (period = π/|b|), horizontal translation of c units, and vertical translation of d units.

## Passwater Scaffolding Notes

Passwater reintroduces tangent as slope: "We first introduced the tangent of an angle in Topic 3.2. We defined the tangent of an angle as the slope of the terminal ray, or as the ratio of the angle's sine to its cosine values." The graph development traces the slope of the terminal ray as θ increases: from 0 at θ = 0, to +∞ as θ → π/2⁻, undefined at π/2 ("The slope of a vertical line is **undefined**"), then from −∞ to 0 on (π/2, π). Key fill-in-the-blank: "Each time that the terminal ray is vertical, the slopes are **undefined**. When we graph the tangent function, this means that we will see **vertical asymptotes** when θ = π/2, 3π/2, etc."

The asymptote pattern is reinforced: "Each half-turn around the circle will create another vertical asymptote!" The period is π (not 2π like sin/cos) because the tangent pattern repeats every half-rotation.

For transformed tangent f(θ) = a tan(b(θ − c)) + d: vertical dilation by |a|, period = π/|b|, phase shift c units, vertical translation d units. Scaffolding moves from graph reading (find a, b, d from graph) → asymptote identification → slope/angle connections → exact value evaluation.

## Guided Practice

**Example 1:** Graph of f shown. f(x) = a tan(bx) + d. Students read a from vertical stretch, b from period (P = π/|b|), d from midline.

**Example 2:** h(θ) = 4 tan(2θ) + 5. Period = π/2.

**Example 3:** g(θ) = 2 tan(θ − 1/3). Vertical asymptotes at x = π/2 + πk. Answer: x = π/2 + πk shifted right by 1/3.

**Example 5:** Exact values using unit circle:
- tan(π/6) = √3/3, tan(π/4) = 1, tan(π/3) = √3
- tan(5π/6) = −√3/3, tan(4π/3) = √3, tan(7π/4) = −1
- tan(3π/2) = undefined, tan π = 0, tan(π/2) = undefined

## Independent Practice Description

Worksheet A: 28 problems. Problems 1–5: Find periods of tangent functions from graphs and equations (e.g., h(x) = 7 tan(3x) − 4, period = π/3). Problems 6–9: Vertical asymptotes — j(θ) = tan(2θ), f(θ) = tan(θ/4), g(θ) = tan(πθ), h(θ) = tan(πθ/2 − π/3). Problems 10–11: Graph analysis — which is true about a and b in f(x) = a tan(bx). Problems 14–19: Terminal ray slope problems — given slope find angle, or given angle find slope. Problems 20–28: Exact values — tan(17π/6), tan(3π/4), tan(2π/3), tan(5π/3), tan(11π/6), tan π, tan(−π/2), tan(−5π/4), tan(7π/3).

Worksheet B: 28 problems — same structure with different values.

## FRQ Expectations

FRQ 4 (Symbolic Manipulations, NO calculator) begins here. Subskills for 3.8: identifying vertical asymptotes of transformed tangent, finding exact tan values using unit circle, determining period from equation. AP practices: 1.A, 1.C, 2.A, 3.A.

## App-Build Notes

- Recommended componentKey: `fill-in-the-blank`
- Rationale: Tangent function properties (asymptote locations, period = π, tan = sin/cos) benefit from fill-in-the-blank scaffolding and vocabulary reinforcement.
- Calculator requirement: NO calculator — FRQ 4 is NO calculator.
- Graphing needs: Tangent graph with asymptotes marked, showing one period between consecutive asymptotes.
- Phase package daily phases:
  - Warm-Up: What happens to the slope of the terminal ray as θ approaches π/2 from the left?
  - Topic Introduction: Passwater slope-based development of tangent — trace slope from 0 to +∞ to −∞.
  - Scaffolded Examples: Examples 1–3 (read graph, find period, find asymptotes).
  - Guided Practice: Worksheet A Problems 1–6 (period and asymptote problems).
  - Independent Practice: Worksheet A Problems 20–28 (exact tan values).
  - Exit Evidence: Find the period and vertical asymptotes of f(θ) = 3 tan(2θ − π).
  - CAP Reflection: "Why is the period of tangent π instead of 2π? How does the unit circle explain the asymptotes?"

## Additional Notes

The tangent function has no amplitude in the traditional sense — it is unbounded (range is all real numbers). This contrasts with sin and cos which have range [−1, 1]. When working with transformed tangent functions f(θ) = a tan(b(θ − c)) + d, the factor |a| controls the vertical stretch but does not bound the range. The period of tan is π, half that of sin/cos, because the tangent pattern repeats every half-rotation of the terminal ray.

Exact tangent values at standard angles derive from sin/cos: tan(π/6) = sin(π/6)/cos(π/6) = (1/2)/(√3/2) = √3/3. Students should be comfortable computing these from known sin/cos values rather than memorizing separately. The quiz after Topic 3.8 tests period, asymptote, and exact value skills for tangent.

Tangent has period π rather than 2π because the terminal ray reaches a vertical position (undefined slope) twice per full revolution — at π/2 and 3π/2 — and the slope pattern between these asymptotes repeats.
