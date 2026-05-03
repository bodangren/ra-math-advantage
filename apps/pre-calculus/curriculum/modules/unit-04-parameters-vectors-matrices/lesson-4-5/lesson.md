# Lesson 4-5 — Implicitly Defined Functions

Unit: 4
Topic: 4.5
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

The equation [x^2 + y^2 = 1] relates [x] and [y] but does not isolate [y] as a function of [x]. If we solve for [y], we get [y = pmsqrt{1 - x^2}] — two functions, not one. Equations that relate [x] and [y] without solving for one variable define **implicit functions**. Many important curves, including circles and ellipses, are naturally defined this way.

## Vocabulary

### Section: text

- **Implicitly defined function**: A relationship [F(x, y) = 0] that defines [y] in terms of [x] without explicitly isolating [y].
- **Explicit function**: A function written as [y = f(x)], where [y] is isolated on one side.
- **Implicit differentiation** (conceptual): Finding the slope of a tangent line to an implicit curve at a point by approximating [frac{Delta y}{Delta x}].

## Learn

### Section: text

An **implicitly defined function** is any equation in [x] and [y] where neither variable is necessarily solved for. Examples:
- [x^2 + y^2 = 25] (a circle)
- [x^2 - y^2 = 1] (a hyperbola)
- [e^x + y = xy] (a non-standard curve)

**Key distinction**: An implicit equation may define zero, one, or *multiple* functions. The circle [x^2 + y^2 = 25] defines [y = sqrt{25 - x^2}] (upper semicircle) and [y = -sqrt{25 - x^2}] (lower semicircle).

**Finding slope at a point**: To estimate the slope of an implicitly defined curve at a point [(a, b)], use nearby points. If [(x_1, y_1)] and [(x_2, y_2)] are two close points on the curve, then [frac{y_2 - y_1}{x_2 - x_1}] approximates the slope.

**Domain and range**: Not all [x]-values produce real [y]-values. For [x^2 + y^2 = 25], [x] is restricted to [[-5, 5]].

## Worked Example

### Section: text

**Example 1:** The curve [x^2 + y^2 = 9] passes through [(0, 3)]. Estimate the slope at this point using nearby points.

**Solution:** Choose [x = 1]: [y = pmsqrt{8} approx pm2.83]. Using the upper branch point [(1, 2.83)]:
\[ frac{Delta y}{Delta x} approx frac{2.83 - 3}{1 - 0} = -0.17 \]

Using [x = -1]: [y approx 2.83].
\[ frac{Delta y}{Delta x} approx frac{2.83 - 3}{-1 - 0} = 0.17 \]

Averaging: the slope near [(0, 3)] is approximately 0 — the tangent is horizontal. (This is correct: the top of the circle has a horizontal tangent.)

**Example 2:** Solve [x^2 + 4y^2 = 16] explicitly for [y].

**Solution:** [4y^2 = 16 - x^2 \implies y^2 = frac{16 - x^2}{4} \implies y = pmsqrt{frac{16 - x^2}{4}}].

Two explicit functions result — an upper and lower half of an ellipse.

## Guided Practice

### Section: text

**Problem 1:** The curve [x^2 + y^2 = 4] passes through [(2, 0)]. Estimate the slope at this point using [x = 1.5].

**Hint:** Find the corresponding [y]-value on the upper branch, then compute [frac{Delta y}{Delta x}].

**Problem 2:** Solve [x^2 + y^2 = 49] explicitly for [y]. How many functions result?

## Independent Practice

### Section: text

**Problem 1:** The curve [xy = 6] passes through [(2, 3)]. Find a nearby point at [x = 2.1] and estimate the slope at [(2, 3)].

**Problem 2:** The curve [x^2 - y^2 = 4] passes through [(sqrt{5}, 1)]. Estimate the slope at this point using [x = 2.5].

**Problem 3:** Explain why the curve [x^2 + y^2 = -1] has no real points. What does this tell you about when implicit equations define curves?

## Reflection

### Section: text

**Exit Ticket:** The curve [x^2 + y^2 = 1] passes through [(frac{sqrt{2}}{2}, frac{sqrt{2}}{2})]. Estimate the slope at this point using [x = 0.6].

**Lesson Summary:** Implicitly defined functions relate [x] and [y] without isolating either variable. They may define multiple branches (functions). Slopes can be estimated by choosing nearby points on the curve and computing [frac{Delta y}{Delta x}].
