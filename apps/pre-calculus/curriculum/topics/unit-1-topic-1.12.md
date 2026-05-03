# Topic 1.12: Transformations of Functions

## CED Identity

- Unit: 1
- Unit title: Polynomial and Rational Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `1.12`
- Learning-objective family: `1.12.A`
- Essential-knowledge family: `1.12.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-1.md`

## CED Learning Objectives

- LO 1.12.A: Describe and apply vertical translations, horizontal translations, vertical dilations, horizontal dilations, and reflections to functions and determine the effects on domain, range, and graph behavior.

## CED Essential Knowledge

- EK 1.12.A.1: g(x) = f(x) + k produces a vertical translation of k units. g(x) = f(x + h) produces a horizontal translation of −h units.
- EK 1.12.A.2: g(x) = a·f(x) produces a vertical dilation by a factor of |a|. If a < 0, the graph reflects over the x-axis. g(x) = f(bx) produces a horizontal dilation by a factor of |1/b|. If b < 0, the graph reflects over the y-axis.
- EK 1.12.A.3: Transformations affect the domain and range of a function. A horizontal dilation by factor |1/b| scales the domain; a vertical dilation by |a| scales the range. Translations shift both accordingly.

## Passwater Scaffolding Notes

- Topic introduction: Passwater introduces a reference transformation table and then applies it systematically to polynomial and rational functions. This topic has the most worksheets of any in Unit 1 (4 regular + MEGA worksheet).
- Transformation table (from Passwater):
  - g(x) = f(x) + k → vertical translation of k units
  - g(x) = f(x + h) → horizontal translation of −h units
  - g(x) = a·f(x) → vertical dilation by |a|; if a < 0, reflect over x-axis
  - g(x) = f(bx) → horizontal dilation by |1/b|; if b < 0, reflect over y-axis
- Key vocabulary (fill-in-the-blank): Vertical translation, horizontal translation, vertical dilation, horizontal dilation, reflection, domain, range.
- Passwater's composition approach: Transformations are applied in a specific order — horizontal transformations first (translate, then dilate/reflect), then vertical (dilate/reflect, then translate). Students write g(x) = ah(bx + c) + d.
- Scaffolding sequence: (1) Describe transformations verbally from equation, (2) find domain and range of transformed functions, (3) map points from original to transformed graph, (4) sketch transformed graphs, (5) apply to polynomial and rational functions.

## Guided Practice

- Example 2: Let g(x) = 2f(x−1) + 3. Given graph of f:
  - a) Domain and range of g (shift domain right 1, scale range by 2, shift up 3)
  - b) Point (4, 2) on f → (4+1, 2·2+3) = (5, 7) on g
  - c) Find g(0) = 2f(0−1) + 3 = 2f(−1) + 3
  - d) Solutions to g(x) = 0 → 2f(x−1) + 3 = 0 → f(x−1) = −3/2 → find x values
  - e) Intervals where g is increasing (same relative positions shifted right by 1)
- Example 5: f(x) = −2(x+3)²(x−1). Let g(x) = f(−x):
  - a) Zeros of g: g(x) = f(−x) = −2(−x+3)²(−x−1) = −2(3−x)²(−x−1). Zeros: x = 3, x = −1.
  - b) Intervals where g < 0: test sign chart.
- Example 7: r(x) = (x−3)(x+1)/((x−3)(x+4)). Let k(x) = −4r(−x/2):
  - a) VA at x = −8 (from x+4 → −x/2+4 = 0 → x = −8), hole at x = −6 (from x−3 → −x/2−3 = 0 → x = −6)
  - b) Values where k(x) ≥ 0
- Example 8: p is cubic. Table: x: −2, 0, 2, 4, 6; p(x): 1, −1, 0, 3, 7. Let m(x) = −3p(x+4):
  - a) Horizontal translation left 4, vertical dilation by −3 (reflect and stretch)
  - b) Zero of m: p(x+4) = 0 when x+4 = 2, so x = −2.
  - c) AROC of m over [0, 2]: m(0) = −3p(4) = −9, m(2) = −3p(6) = −21. AROC = (−21−(−9))/(2−0) = −6.
- Example 9: n has domain [−6, 9], range [−8, 10), increasing on [−6, 1] and [5, 9), decreasing on [1, 5]. Let q(x) = 4 − 2n(5−x):
  - a) Domain of q: 5−x ∈ [−6, 9] → x ∈ [−4, 11]. Range of q: 4 − 2·[−8, 10) = 4 − (−16, 20] = (−16, 20].

## Independent Practice Description

- AP-style tasks: Students describe transformations, find transformed domain/range, map points, and sketch transformed graphs.
- Worksheet A Problem 1: g(x) = ½f(x+2) + 5 → "horizontal translation left 2, vertical dilation by 1/2, vertical translation up 5."
- Worksheet A Problem 5: g(x) = 2f(x/2) − 3. Given table for f, find g(−10) and g(0). g(−10) = 2f(−5) − 3.
- Worksheet A Problems 8–12: Sketch transformed graphs of f (which has two line segments and a semicircle on [−4, 3]).
- Worksheet C Problem 1: Graphs of f and g shown. "Which gives the transformation from f to g?" Options: g(x) = f(x−2)−1, f(x+2)−1, f(x−2)+1, f(x+2)+1.
- MEGA Worksheet: ~35 problems including table-based, graph-based, domain/range, zeros of transformed functions, asymptotes of transformed rational functions, and limit values.
- Emphasis: State transformations in the correct order. Always check domain and range.

## FRQ Expectations

- FRQ 1 (Function Concepts): Students may be given a graph of f and a transformation equation for g, then asked to find g's domain, range, zeros, or specific values. Subskill: map a point from f to g.
- FRQ 3 (Function Concepts from a Graph): Students may need to identify which transformation produced a given graph.
- AP mathematical practices targeted:
  - 1.A: Execute algebraic procedures (substitute into transformation equations).
  - 1.B: Identify information from multiple representations (graph of f → graph of g, equation → domain/range).
  - 3.B: Justify conclusions (explain how a transformation affects specific features).

## App-Build Notes

- Recommended componentKey: `graphing-explorer`
- Rationale: Transformations are inherently visual. Students need to see the original function and the transformed function side by side, and manipulate transformation parameters to build intuition. The graphing-explorer allows simultaneous display of f(x) and g(x) = ah(bx + c) + d with sliders for a, b, c, d.
- Calculator requirement: Graphing calculator required for verifying sketches and computing transformed values.
- Graphing needs: Interactive graphing essential with parameter sliders. Students benefit from seeing the effect of each transformation step-by-step.
- Phase package daily phases:
  - Warm-Up: "If f(3) = 5, what is g(3) when g(x) = 2f(x) − 1?"
  - Topic Introduction: Present the transformation table. Work through one example of each type.
  - Scaffolded Examples: Work through Passwater Examples 2 and 3 (describe transformations, find domain/range, map points).
  - Guided Practice: Students complete Worksheet A Problems 1–4 (describe transformations) and Problems 5–6 (table values).
  - Independent Practice: Worksheet A Problems 8–12 (sketch transformed graphs) and Worksheet C Problems 1–5 (AP-style MCQ matching).
  - Exit Evidence: "If f has domain [−3, 5] and range [0, 8], find the domain and range of g(x) = −2f(x−1) + 3."
  - CAP Reflection: "What courage move did you make when composing multiple transformations?"
