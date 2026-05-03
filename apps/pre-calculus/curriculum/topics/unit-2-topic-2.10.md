# Topic 2.10: Inverses of Exponential Functions

## CED Identity

- Unit: 2
- Unit title: Exponential and Logarithmic Functions
- AP Exam status: `assessed-on-ap-exam`
- CED topic ID: `2.10`
- Learning-objective family: `2.10.A`
- Essential-knowledge family: `2.10.A.*`
- Mathematical practices: `1.A`, `1.B`, `1.C`, `2.A`, `2.B`, `3.A`, `3.B`, `3.C`

## Source References

- CED topic index: `source/college-board/ced-topic-index.json`
- CED errata: `source/college-board/clarification-guidance.md`
- Passwater instructional source: `source/passwater/unit-2.md`

## CED Learning Objectives

- LO 2.10.A: Determine from data whether a function is logarithmic, exponential, or neither; sketch inverse (logarithmic) graphs from exponential graphs; show exponential and logarithmic functions are inverses via composition; and find average rate of change of logarithmic functions.

## CED Essential Knowledge

- EK 2.10.A.1: The general form of a logarithmic function is f(x) = a log_b(x), where b > 0, b ≠ 1, and a ≠ 0. Logarithmic functions are the inverses of exponential functions.
- EK 2.10.A.2: Exponential functions have inputs that change additively (equally spaced) and outputs that change multiplicatively. Logarithmic functions reverse this: inputs change multiplicatively and outputs change additively (equally spaced). This reversal is the signature of inverse functions.
- EK 2.10.A.3: If f(x) = b^x and g(x) = log_b(x), then f(g(x)) = x and g(f(x)) = x. Graphs of exponential and logarithmic functions are reflections over y = x. If (x₁, y₁) is on f, then (y₁, x₁) is on f⁻¹.

## Passwater Scaffolding Notes

Passwater frames this topic as the conceptual bridge from inverse functions (Topic 2.8) and logarithmic expressions (Topic 2.9) to logarithmic functions. The key insight: the input/output behavior swaps between exponential and logarithmic functions — exponential has additive inputs/multiplicative outputs, logarithmic has multiplicative inputs/additive outputs. Scaffolding: (1) classify tables as logarithmic, exponential, or neither by checking the multiplicative/additive pattern, (2) show f(x) = 3^x and g(x) = log₃x are inverses via composition, (3) sketch log graph as reflection of exponential graph over y = x, (4) find average rate of change of log functions using the inverse relationship. Example: h(x) = a^x contains (2,3) and (6,27); find average rate of change of y = log_a(x) over [3, 27].

## Guided Practice

**Example 1:** Tables — determine logarithmic, exponential, or neither:
- a) x: 1,2,3,4 → h(x): 16,8,4,2 → Exponential (halving, constant ratio 1/2)
- b) x: 10,30,90,270 → k(x): 10,20,30,40 → Logarithmic (inputs ×3, outputs +10)
- c) x: 5,50,500,5000 → p(x): 1,2,4,8 → Neither (outputs double, not linear)
- d) x: 4,8,16,32 → l(x): −1,−4,−7,−10 → Exponential (inputs ×2, outputs −3)

**Example 2:** Let f(x) = 3^x and g(x) = log₃x. Show they are inverses:
- f(g(x)) = 3^(log₃x) = x ✓
- g(f(x)) = log₃(3^x) = x ✓

**Example 3:** Graph of k(x) = 2^x shown. Sketch k⁻¹(x) = log₂(x) on same grid.
- Reflect key points over y = x: (0,1) → (1,0), (1,2) → (2,1), (2,4) → (4,2), (−1, 1/2) → (1/2, −1).

**Example 4:** h(x) = a^x contains (2,3) and (6,27). Find average rate of change of y = log_a(x) over [3, 27].
- Since h(2) = 3 and h(6) = 27, the inverse log_a has points (3,2) and (27,6).
- Average rate of change = (6 − 2)/(27 − 3) = 4/24 = 1/6.

**Worksheet A — Problem 3:** x: 1,2,4,8 → h(x): 1,3,5,7 → Logarithmic (inputs double, outputs increase by 2).

**Worksheet A — Problem 4:** x: 40,20,10,5 → k(x): −1,−2,−3,−4 → Logarithmic (inputs halve, outputs decrease by 1).

## Independent Practice Description

Students classify tables as logarithmic, exponential, or neither. Problems include: x: 0,3,6,9 → f(x): 1,4,9,16 (neither — quadratic); x: 0,1,2,3 → g(x): 1,4,16,64 (exponential, r = 4); x: 1,2,4,8 → h(x): 1,3,5,7 (logarithmic — inputs double, outputs +2); x: 40,20,10,5 → k(x): −1,−2,−3,−4 (logarithmic — inputs halve, outputs −1). Students sketch inverse graphs from exponential graphs, reflect key points over y = x, and approximate log values from graphs (log_a3, log_a(1/2), log_b4, log_b(3/2)).

## FRQ Expectations

- FRQ 1 (Function Concepts): Connecting exponential and logarithmic functions as inverses, evaluating from graphs.
- Subskills: classification from tables, inverse composition verification, average rate of change of log functions.
- AP practices: 1.A (justify), 1.B (interpret inverse relationship), 3.A (connect exponential and log representations).

## App-Build Notes

- Recommended componentKey: `comprehension-quiz`
- Rationale: Students must demonstrate conceptual understanding that log functions are inverses of exponential functions and recognize the multiplicative/additive input-output pattern.
- Calculator requirement: No calculator needed for classification and composition verification.
- Graphing needs: Coordinate plane with y = x line for reflection; graph of exponential function with inverse sketch.
- Phase package daily phases:
  - Warm-Up: "If f(x) = 2^x has the point (3, 8), what point does f⁻¹ have?"
  - Topic Introduction: Present the input/output swap (additive inputs → multiplicative outputs for exponential; reversed for log).
  - Scaffolded Examples: Examples 1–2 (classify tables, verify inverses via composition).
  - Guided Practice: Students classify tables from Worksheet A and sketch inverses of exponential graphs.
  - Independent Practice: Worksheet A problems 1–10 (classification, sketching, graph-based log approximation).
  - Exit Evidence: "x: 5,50,500,5000 → p(x): 1,2,3,4. Is p logarithmic, exponential, or neither? Justify."
  - CAP Reflection: "How does the input/output pattern of a logarithmic function reflect that it is the inverse of an exponential function?"
  - Extension: Students create their own table that represents a logarithmic function and explain the multiplicative input / additive output pattern.
