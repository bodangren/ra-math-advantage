# Lesson 3-10 — Trigonometric Equations and Inequalities

Unit: 3
Topic: 3.10
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

A radar antenna rotates so that its beam angle [theta] satisfies [2cos(theta) + 1 = 0]. You need every angle where this holds. Is this the same as asking for [cos^{-1}(-1/2)]? No — the inverse cosine returns one value, but the equation may have many solutions. How do you find *all* solutions, and how does the period of the function determine the pattern?

## Vocabulary

### Section: text

- **Trigonometric equation**: An equation containing one or more trigonometric functions of a variable, such as [2sin(x) = sqrt{3}].
- **General solution**: A formula capturing every solution, typically using [+] [2kpi] (for sin/cos) or [+] [kpi] (for tan) where [k] is any integer.
- **Sign chart**: A number line with solutions marked as boundary points, intervals labeled positive or negative to determine where an inequality holds.
- **[sin^n x]**: Shorthand notation meaning [(sin x)^n] — for example, [sin^2 x = (sin x)^2].

## Learn

### Section: text

To solve a trigonometric equation, follow these steps:

1. **Isolate** the trigonometric function on one side of the equation.
2. **Find** the corresponding angle measures on the unit circle.
3. **Consider** any domain restrictions in the problem.
4. **Write** the general solutions using the period.

For sin and cos (period [2pi]): solutions repeat every [2pi]. For tan (period [pi]): solutions repeat every [pi].

**Key distinction**: [sin(x) = 1/2] and [sin^{-1}(1/2) = ?] are **not** equivalent. The inverse trig function returns one value in the restricted range. The equation [sin(x) = 1/2] has infinitely many solutions: [x = pi/6 + 2kpi] or [x = 5pi/6 + 2kpi].

**No-solution cases**: If isolating the trig function gives a value outside [[-1, 1]] (for sin or cos), there is no solution. For example, [cos(x) = -4/3] has no solution since [|-4/3| > 1].

For **trigonometric inequalities**, use a five-step sign chart method:
1. Set [f(x) = 0] and solve for [x].
2. Create a sign chart with solutions as boundary points.
3. Test a value in one interval.
4. Label remaining intervals positive or negative.
5. Interpret the sign chart to answer the inequality.

## Worked Example

### Section: text

**Example 1:** Find all solutions to [2cos(x) = -sqrt{2}] on [[0, 2pi)].

**Solution:**
- Isolate: [cos(x) = -sqrt{2}/2]
- Unit circle: [cos(x) = -sqrt{2}/2] at [x = 3pi/4] and [x = 5pi/4]
- On [[0, 2pi)]: [x = 3pi/4, 5pi/4]
- General solution: [x = 3pi/4 + 2kpi] or [x = 5pi/4 + 2kpi]

**Example 2:** Find all values of [theta] where [sin(theta) geq sqrt{2}/2], [0 leq theta < 2pi].

**Solution:**
- [sin(theta) = sqrt{2}/2] at [theta = pi/4] and [theta = 3pi/4]
- Sine is above [sqrt{2}/2] between these angles
- Answer: [pi/4 leq theta leq 3pi/4]

**Example 3:** Solve [2sin^2theta + sin(theta) < 0] for [0 leq theta < 2pi].

**Solution:**
- Factor: [sin(theta)(2sin(theta) + 1) < 0]
- Zeros: [sin(theta) = 0 rightarrow theta = 0, pi] and [sin(theta) = -1/2 rightarrow theta = 7pi/6, 11pi/6]
- Sign chart with four intervals — product is negative where factors have opposite signs
- Answer: [7pi/6 < theta < pi] or [11pi/6 < theta < 2pi]

## Guided Practice

### Section: text

**Problem 1:** Find all solutions of [sin(x) = -1/2] on [[0, 2pi)].

**Hint:** Where is sine negative on the unit circle? Check QIII and QIV.

**Problem 2:** Does [3cos(x) + 2 = -2] have a solution? Explain.

**Hint:** Isolate [cos(x)] and check if the result is in [[-1, 1]].

**Problem 3:** Find all solutions of [cos^2theta = cos(theta) + 2]. Rewrite as a quadratic in [cos(theta)].

**Hint:** Let [u = cos(theta)] and solve [u^2 - u - 2 = 0]. Discard solutions where [u] falls outside [[-1, 1]].

## Independent Practice

### Section: text

**Problem 1:** Find all solutions on [[0, 2pi)]: [2sin(x) = sqrt{2}], [cos(x) = 1/2], [tan(x) = -1].

**Problem 2:** Write the general solution for [cos(x) = 0].

**Hint:** Cosine is zero at [x = pi/2] and [x = 3pi/2] on [[0, 2pi)]. General solutions repeat every [2pi].

**Problem 3:** Find all [theta] in [[0, 2pi)] where [(2cos(theta) - 1)(sin(theta) + 1) < 0].

**Hint:** Find zeros of each factor, build a sign chart, and determine where the product is negative.

## Reflection

### Section: text

**Exit Ticket:** Find all solutions of [2sin(x) = sqrt{3}] on [[0, 2pi)]. How many solutions are there and why?

**Lesson Summary:** Solving trig equations means isolating the function, finding reference angles on the unit circle, and writing general solutions using the period ([2pi] for sin/cos, [pi] for tan). Inequalities add a sign chart step. The critical distinction: an inverse trig value is one answer; an equation like [sin(x) = k] may have infinitely many. Always verify that isolated values are in range before solving.
