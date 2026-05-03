# Lesson 3-11 — The Secant, Cosecant, and Cotangent Functions

Unit: 3
Topic: 3.11
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

You know that [cos(pi/3) = 1/2]. So what is [1/cos(pi/3)]? It is [2] — a value outside the [[-1, 1]] range of cosine itself. This suggests that the reciprocal of cosine produces a fundamentally different kind of function. What happens to the graph where [cos(x) = 0]? What are the new range and asymptote locations?

## Vocabulary

### Section: text

- **Secant** [sec(x) = 1/cos(x)]: The reciprocal of cosine, defined where [cos(x) neq 0]. Vertical asymptotes at [x = pi/2 + kpi]. Range: [(-infty, -1] cup [1, infty)].
- **Cosecant** [csc(x) = 1/sin(x)]: The reciprocal of sine, defined where [sin(x) neq 0]. Vertical asymptotes at [x = kpi]. Range: [(-infty, -1] cup [1, infty)].
- **Cotangent** [cot(x) = 1/tan(x) = cos(x)/sin(x)]: The reciprocal of tangent, defined where [sin(x) neq 0]. Vertical asymptotes at [x = kpi].
- **Vertical asymptote**: A vertical line where the function approaches [pm infty] — for reciprocal trig functions, this occurs wherever the denominator equals zero.

## Learn

### Section: text

Secant, cosecant, and cotangent are defined as reciprocals of the three primary trig functions:

\[ sec(x) = frac{1}{cos(x)}, quad cos(x) neq 0 \]
\[ csc(x) = frac{1}{sin(x)}, quad sin(x) neq 0 \]
\[ cot(x) = frac{1}{tan(x)} = frac{cos(x)}{sin(x)}, quad sin(x) neq 0 \]

**Vertical asymptotes** appear wherever the denominator is zero:
- [sec(x)] has asymptotes at [x = pi/2 + kpi] (where [cos(x) = 0])
- [csc(x)] has asymptotes at [x = kpi] (where [sin(x) = 0])
- [cot(x)] has asymptotes at [x = kpi] (where [sin(x) = 0])

The **ranges** of sec and csc are [(-infty, -1] cup [1, infty)] because they are reciprocals of values in [[-1, 1]] — the reciprocal of any number with magnitude at most 1 has magnitude at least 1.

**Solving strategy**: To solve equations involving reciprocal trig functions, isolate the function first, then convert to sin, cos, or tan. For example, [4csc(3x) + 1 = 11] becomes [csc(3x) = 5/2], which means [sin(3x) = 2/5] — a familiar equation.

## Worked Example

### Section: text

**Example 1:** Find a vertical asymptote of [f(x) = 3sec(2x)].

**Solution:**
- Asymptote when [cos(2x) = 0]
- [2x = pi/2 + kpi rightarrow x = pi/4 + kpi/2]
- At [k = 0]: [x = pi/4]. This is one asymptote location.

**Example 2:** Find the range of [h(theta) = 3csc(theta/2)].

**Solution:**
- [csc(theta/2)] has range [(-infty, -1] cup [1, infty)]
- Multiplying by 3: range is [(-infty, -3] cup [3, infty)]

**Example 3:** Solve [4csc(3x) + 1 = 11] on [[0, 2pi)].

**Solution:**
- [4csc(3x) = 10 rightarrow csc(3x) = 5/2]
- Convert: [sin(3x) = 2/5]
- [3x = arcsin(2/5)] or [3x = pi - arcsin(2/5)] plus multiples of [2pi]
- Solve for [x] and restrict to [[0, 2pi)]

## Guided Practice

### Section: text

**Problem 1:** Where does [g(x) = cot(2x)] have vertical asymptotes?

**Hint:** [cot(2x)] has asymptotes where [sin(2x) = 0]. Solve [2x = kpi].

**Problem 2:** Find the range of [h(x) = 5sec(x/2)].

**Hint:** Start with the range of [sec(x/2)], then scale by 5.

**Problem 3:** Solve [3sec(2x - 1) = 4] without a calculator.

**Hint:** Convert to [cos(2x - 1) = 3/4]. Is this solvable with exact values?

## Independent Practice

### Section: text

**Problem 1:** Find the vertical asymptotes of [f(x) = sec(x/2)] on [[0, 4pi)].

**Problem 2:** Solve [5 - 2csc(x) = 7] on [[0, 2pi)].

**Hint:** Isolate [csc(x)], convert to [sin(x)], and solve.

**Problem 3:** Solve [2 + 3cot(x) = 1] on [[0, 2pi)].

**Hint:** Isolate [cot(x)], convert to [cos(x)/sin(x)], and find angles where tangent equals the reciprocal.

**Problem 4:** At what [x]-values does [f(x) = 2sec(x) - 5] intersect [g(x) = -1] on [[0, 2pi)]?

**Hint:** Set [2sec(x) - 5 = -1], solve for [sec(x)], then convert to [cos(x)].

## Reflection

### Section: text

**Exit Ticket:** Find the vertical asymptotes of [f(x) = 2csc(3x)] on [[0, 2pi)]. How do you convert a sec/csc equation into a sin/cos equation?

**Lesson Summary:** Sec, csc, and cot are reciprocals of cos, sin, and tan. Their graphs have vertical asymptotes where the denominator is zero, and their ranges exclude values between -1 and 1 (for sec and csc). To solve reciprocal equations, isolate the reciprocal function and convert to the primary trig function. This converts unfamiliar sec/csc/cot problems into familiar sin/cos/tan problems.
