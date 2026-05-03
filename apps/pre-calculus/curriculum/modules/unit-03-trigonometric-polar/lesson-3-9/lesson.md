# Lesson 3-9 — Inverse Trigonometric Functions

Unit: 3
Topic: 3.9
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider the equation [sin(theta) = 1/2]. On the interval [[0, 2pi)], there are two solutions: [theta = pi/6] and [theta = 5pi/6]. But a function can only return one output for each input. So if we want to *undo* the sine function — to go from [1/2] back to an angle — we must choose which answer to return. How do mathematicians resolve this ambiguity, and what happens when we restrict the domain?

## Vocabulary

### Section: text

- **Inverse sine** [sin^{-1}(x)] or [arcsin(x)]: The inverse of the sine function, restricted to domain [[-1, 1]] and range [[-pi/2, pi/2]]. The output is always an angle in the fourth or first quadrant.
- **Inverse cosine** [cos^{-1}(x)] or [arccos(x)]: The inverse of the cosine function, restricted to domain [[-1, 1]] and range [[0, pi]]. The output is always an angle in the first or second quadrant.
- **Inverse tangent** [tan^{-1}(x)] or [arctan(x)]: The inverse of the tangent function, with domain all reals and range [(-pi/2, pi/2)]. The output is always an angle in the fourth or first quadrant.
- **Domain restriction**: Because trig functions are periodic (not one-to-one), we limit the input domain to a specific interval where the function is one-to-one, allowing us to define a true inverse.

## Learn

### Section: text

The inverse of a trigonometric function switches the input and output values. As a result, the output value of an inverse trigonometric function is always an **angle measure**.

Because trig functions are periodic, their domains must be restricted to create corresponding inverse functions:

\[ sin^{-1}(x): text{ domain } [-1, 1], text{ range } [-pi/2, pi/2] \]
\[ cos^{-1}(x): text{ domain } [-1, 1], text{ range } [0, pi] \]
\[ tan^{-1}(x): text{ domain } (-infty, infty), text{ range } (-pi/2, pi/2) \]

With either notation [sin^{-1}(x)] or [arcsin(x)], we say "arcsine of x" aloud.

**Critical distinction**: While [sin(x) = 1/2] has infinitely many solutions, [sin^{-1}(1/2)] returns exactly **one** value: [pi/6]. The inverse function must be single-valued — that is why the domain restriction is non-negotiable.

**Common error**: A student evaluates [sin^{-1}(-sqrt{3}/2)] and answers [4pi/3]. But [4pi/3] is outside the range [[-pi/2, pi/2]]. The correct answer is [-pi/3] — always check that your output falls in the restricted range.

## Worked Example

### Section: text

**Example 1:** Evaluate [cos^{-1}(-sqrt{2}/2)].

**Solution:**
- We need the angle [theta] in [[0, pi]] where [cos(theta) = -sqrt{2}/2].
- On the unit circle, [cos(theta) = -sqrt{2}/2] at [theta = 3pi/4] and [theta = 5pi/4].
- Only [3pi/4] is in [[0, pi]].
- Answer: [cos^{-1}(-sqrt{2}/2) = 3pi/4].

**Example 2:** Evaluate [sin^{-1}(-sqrt{3}/2)].

**Solution:**
- We need [theta] in [[-pi/2, pi/2]] where [sin(theta) = -sqrt{3}/2].
- On the unit circle, [sin(theta) = -sqrt{3}/2] at [theta = -pi/3] and [theta = 4pi/3].
- Only [-pi/3] is in [[-pi/2, pi/2]].
- Answer: [sin^{-1}(-sqrt{3}/2) = -pi/3].

**Example 3:** Evaluate [tan^{-1}(sqrt{3})].

**Solution:**
- We need [theta] in [(-pi/2, pi/2)] where [tan(theta) = sqrt{3}].
- [tan(pi/3) = sqrt{3}] and [pi/3] is in [(-pi/2, pi/2)].
- Answer: [tan^{-1}(sqrt{3}) = pi/3].

## Guided Practice

### Section: text

**Problem 1:** Write [sin^{-1}(1/2) = pi/6] using arcsine notation.

**Hint:** Replace [sin^{-1}] with [arcsin]. The statement reads the same aloud.

**Problem 2:** Evaluate [cos^{-1}(1/2)].

**Hint:** Find the angle in [[0, pi]] whose cosine is [1/2]. Check both candidate angles from the unit circle.

**Problem 3:** Why is [sin^{-1}(2)] undefined?

**Hint:** What is the domain of [sin^{-1}(x)]? Is [2] in that interval?

## Independent Practice

### Section: text

**Problem 1:** Evaluate each expression:
- [cos^{-1}(1/2)]
- [sin^{-1}(-sqrt{2}/2)]
- [tan^{-1}(1)]
- [cos^{-1}(-sqrt{3}/2)]
- [sin^{-1}(-1/2)]
- [tan^{-1}(-1/sqrt{3})]

**Problem 2:** Evaluate [sin^{-1}(1/2) - cos^{-1}(-1/2)].

**Hint:** Find each inverse value separately, then subtract. Check that both outputs are in their respective ranges.

**Problem 3:** Angle [theta] is in standard position with terminal ray hitting the unit circle at [P(x, y)]. Point [Q] is the reflection of [P] across the [x]-axis. Which point corresponds to the output of [cos^{-1}(-x)]?

## Reflection

### Section: text

**Exit Ticket:** Evaluate [cos^{-1}(-sqrt{2}/2)] and [sin^{-1}(sqrt{3}/2)]. Explain why [sin^{-1}(2)] is undefined.

**Lesson Summary:** Inverse trig functions return angle measures, not ratios. The domain restrictions — [[-pi/2, pi/2]] for arcsin, [[0, pi]] for arccos, [(-pi/2, pi/2)] for arctan — ensure each inverse is single-valued. Always verify that your answer falls in the correct range. The inverse function returns one specific angle; the original equation [sin(x) = k] may have infinitely many solutions.
