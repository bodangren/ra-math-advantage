# Lesson 4-7 — Parametrization of Implicitly Defined Functions

Unit: 4
Topic: 4.7
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

We know that [x = cos(t)], [y = sin(t)] traces the unit circle [x^2 + y^2 = 1]. Can we find parametric equations for *other* implicit curves, like the ellipse [frac{x^2}{9} + frac{y^2}{4} = 1] or the hyperbola [x^2 - y^2 = 1]? Parametrizing implicit curves converts static equations into dynamic paths.

## Vocabulary

### Section: text

- **Parametrization**: A set of parametric equations [(x(t), y(t))] that traces out an implicitly defined curve.
- **Trigonometric parametrization**: Using sine and cosine (or other trig functions) to parameterize a curve.
- **Branch**: One connected piece of a curve that requires a separate parametrization.

## Learn

### Section: text

**Ellipse**: [frac{x^2}{a^2} + frac{y^2}{b^2} = 1] can be parameterized as:
\[ x = acos(t), quad y = bsin(t), quad 0 leq t leq 2pi \]

This works because [frac{a^2cos^2(t)}{a^2} + frac{b^2sin^2(t)}{b^2} = cos^2(t) + sin^2(t) = 1]. ✓

**Hyperbola**: [frac{x^2}{a^2} - frac{y^2}{b^2} = 1] can be parameterized using **hyperbolic functions** (beyond this course) or by noting that [x = asec(t)] and [y = btan(t)] satisfy the equation (since [sec^2(t) - tan^2(t) = 1]). This traces the right branch; the left branch uses [x = -asec(t)].

**General strategy**:
1. Identify the conic type from the implicit equation.
2. Choose a trig identity that matches (e.g., [cos^2 + sin^2 = 1] for ellipses, [sec^2 - tan^2 = 1] for hyperbolas).
3. Scale and shift to match the equation's parameters.

## Worked Example

### Section: text

**Example 1:** Parameterize [frac{x^2}{16} + frac{y^2}{25} = 1].

**Solution:** Here [a = 4], [b = 5]:
\[ x = 4cos(t), quad y = 5sin(t), quad 0 leq t leq 2pi \]

**Example 2:** Parameterize [(x - 1)^2 + (y + 3)^2 = 9].

**Solution:** This is a circle centered at [(1, -3)] with radius 3:
\[ x = 1 + 3cos(t), quad y = -3 + 3sin(t), quad 0 leq t leq 2pi \]

## Guided Practice

### Section: text

**Problem 1:** Parameterize [frac{x^2}{36} + frac{y^2}{49} = 1].

**Hint:** Identify [a] and [b], then use [x = acos(t)], [y = bsin(t)].

**Problem 2:** Parameterize [x^2 + y^2 - 6x + 4y + 4 = 0].

**Hint:** First complete the square to find the center and radius.

## Independent Practice

### Section: text

**Problem 1:** Parameterize [9x^2 + 4y^2 = 36].

**Problem 2:** A circle has center [(3, -2)] and passes through [(6, -2)]. Write its parametric equations.

**Problem 3:** Explain why the ellipse [frac{x^2}{a^2} + frac{y^2}{b^2} = 1] can use [x = asin(t)], [y = bcos(t)] instead of cosine for [x]. Does it trace the same curve?

## Reflection

### Section: text

**Exit Ticket:** Parameterize [frac{x^2}{9} + frac{y^2}{16} = 1].

**Lesson Summary:** Implicit curves can be parameterized by matching trig identities to the equation's structure. Ellipses use [cos] and [sin]; circles are special cases. Completing the square handles centered forms.
