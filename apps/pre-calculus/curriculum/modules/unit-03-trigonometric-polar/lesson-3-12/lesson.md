# Lesson 3-12 — Equivalent Representations of Trigonometric Functions

Unit: 3
Topic: 3.12
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Is [tan^2theta - sec^2theta] always equal to [-1]? Try [theta = pi/4]: [1 - 2 = -1]. Try [theta = pi/3]: [3 - 4 = -1]. It seems to hold. But *why*? The answer lies in a deep relationship between sine and cosine — one that constrains every angle, not just special ones. What identities govern these relationships, and how can you use them to rewrite expressions in simpler forms?

## Vocabulary

### Section: text

- **Reciprocal identities**: [1/sin(x) = csc(x)], [1/cos(x) = sec(x)], [1/tan(x) = cot(x)], [sin(x)/cos(x) = tan(x)].
- **Pythagorean identities**: [sin^2theta + cos^2theta = 1], [1 + tan^2theta = sec^2theta], [1 + cot^2theta = csc^2theta].
- **Sum/difference identities**: [sin(alpha pm beta) = sin(alpha)cos(beta) pm cos(alpha)sin(beta)], [cos(alpha pm beta) = cos(alpha)cos(beta) mp sin(alpha)sin(beta)].
- **Double angle identities**: [sin(2theta) = 2sin(theta)cos(theta)], [cos(2theta) = cos^2theta - sin^2theta = 1 - 2sin^2theta = 2cos^2theta - 1].

## Learn

### Section: text

Trigonometric identities are equations that are true for every value in the domain. They let you rewrite expressions in equivalent forms — a critical skill for the AP exam.

**Pythagorean identity**: [sin^2theta + cos^2theta = 1] holds for all [theta]. Dividing by [cos^2theta] yields [1 + tan^2theta = sec^2theta]. Dividing by [sin^2theta] yields [1 + cot^2theta = csc^2theta].

**Double angle formulas** for cosine have three equivalent forms — choose strategically:
- [cos(2theta) = cos^2theta - sin^2theta] — use when both sin and cos are present
- [cos(2theta) = 1 - 2sin^2theta] — use when only sin appears
- [cos(2theta) = 2cos^2theta - 1] — use when only cos appears

**Rewriting strategy**: Convert everything to sin and cos, simplify, then express in the target function. For example, to rewrite [tan(x) cdot csc(x)] in terms of cos: [sin(x)/cos(x) cdot 1/sin(x) = 1/cos(x) = sec(x)].

**Inverse trig identities** (connecting to Lesson 3-9): [cos^{-1}(x) = sin^{-1}(sqrt{1 - x^2})] and [sin^{-1}(x) = cos^{-1}(sqrt{1 - x^2})].

## Worked Example

### Section: text

**Example 1:** Rewrite [f(x) = tan(x) cdot csc(x)] as a fraction involving powers of [cos(x)].

**Solution:**
- [tan(x) cdot csc(x) = frac{sin(x)}{cos(x)} cdot frac{1}{sin(x)} = frac{1}{cos(x)} = cos^{-1}(x)]

**Example 2:** Which is equivalent to [2sin(pi/14)cos(pi/14)]?

**Solution:**
- By the double angle identity: [2sin(theta)cos(theta) = sin(2theta)]
- [2sin(pi/14)cos(pi/14) = sin(2 cdot pi/14) = sin(pi/7)]

**Example 3:** Rewrite [k(x) = 4cos(2x)] using the double angle identity.

**Solution:**
- Using [cos(2theta) = 1 - 2sin^2theta]: [4(1 - 2sin^2x) = 4 - 8sin^2x]
- Using [cos(2theta) = 2cos^2theta - 1]: [4(2cos^2x - 1) = 8cos^2x - 4]
- Both [4 - 8sin^2x] and [8cos^2x - 4] are equivalent.

**Example 4:** Simplify [tan^2theta - sec^2theta].

**Solution:**
- From [1 + tan^2theta = sec^2theta], rearrange: [tan^2theta - sec^2theta = -1]

## Guided Practice

### Section: text

**Problem 1:** If [sin(theta) = 3/5], find [cos^2theta].

**Hint:** Use [sin^2theta + cos^2theta = 1].

**Problem 2:** Rewrite [(1 - cos^2x)/cos^2x] in terms of [tan(x)].

**Hint:** Replace [1 - cos^2x] with [sin^2x], then simplify.

**Problem 3:** Expand [(sin(x) + cos(x))^2] and simplify using identities.

**Hint:** Expand the square, then recognize [sin^2x + cos^2x = 1].

## Independent Practice

### Section: text

**Problem 1:** Rewrite each expression in terms of a single function:
- [g(x) = tan(x) cdot sec(x)] — express using powers of [sin(x)]
- [h(x) = (1 - cos^2x)/cos^2x] — simplify completely
- [f(x) = (sec^2x - 1)/sin^2x] — express using [sec(x)]

**Problem 2:** Simplify each expression to a single value:
- [tan^2theta - sec^2theta]
- [(sin(theta) - cos(theta))^2 + (sin(theta) + cos(theta))^2]
- [tan^2theta/(1 + tan^2theta)]

**Problem 3:** [cos(pi/8)cos(pi/16) - sin(pi/8)sin(pi/16)] equals what single trig value?

**Hint:** This matches the cosine sum identity [cos(alpha)cos(beta) - sin(alpha)sin(beta)].

## Reflection

### Section: text

**Exit Ticket:** Simplify [tan^2theta - sec^2theta]. Rewrite [2sin(pi/10)cos(pi/10)] using a double angle identity.

**Lesson Summary:** Trigonometric identities — reciprocal, Pythagorean, sum/difference, and double angle — let you rewrite expressions in equivalent forms. The Pythagorean identity [sin^2theta + cos^2theta = 1] is the foundation; the other two Pythagorean identities derive from it. When simplifying, convert to sin and cos first, simplify, then express in the target function. The double angle formula for cosine has three forms — choose the one that matches your expression.
