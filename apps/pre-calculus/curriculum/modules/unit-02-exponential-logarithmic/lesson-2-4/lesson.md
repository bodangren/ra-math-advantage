# Lesson 2-4 — Exponential Function Manipulation

Unit: 2
Topic: 2.4
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider [f(x) = 2^{(x+4)}]. Does this function produce different outputs than [g(x) = 8 \cdot 2^x]? Evaluate both at [x = 0], [x = 1], and [x = 3]. What do you notice? Is there a way to convert every horizontal shift of an exponential function into a vertical stretch?

## Vocabulary

### Section: text

- **Product Property**: [b^m \cdot b^n = b^{(m+n)}]
- **Power Property**: [(b^m)^n = b^{mn}]
- **Negative Exponent Property**: [b^{-n} = 1/b^n]
- **Horizontal translation**: Shifting the graph left or right. For exponential functions, [f(x) = b^{(x+h)}] shifts left by [h].
- **Horizontal dilation**: Stretching or compressing horizontally. For [f(x) = b^{cx}], the graph compresses by factor [1/c] when [c > 1].
- **Vertical dilation**: Multiplying the function by a constant. [f(x) = a \cdot b^x] stretches vertically by factor [a].

## Learn

### Section: text

Exponential functions have a unique property: every horizontal transformation can be rewritten as a combination of vertical dilation and base change. This works because of the exponent rules.

**Horizontal translation to vertical dilation:**
\[b^{(x+h)} = b^h \cdot b^x\]

So [f(x) = 2^{(x+3)} = 2^3 \cdot 2^x = 8 \cdot 2^x]. The horizontal shift left 3 is identical to multiplying by 8.

**Horizontal dilation to base change:**
\[b^{cx} = (b^c)^x\]

So [f(x) = 3^{2x} = (3^2)^x = 9^x]. The horizontal compression by [1/2] is identical to changing the base from 3 to 9.

This equivalence is unique to exponential functions — it does not work for quadratic, polynomial, or other function families. It is a consequence of the fact that [b^{(x+h)}] factors cleanly into [b^x \cdot b^h].

## Worked Example

### Section: text

**Example 1:** Rewrite [f(x) = 2^{(x+3)}] as [y = a \cdot b^x].

**Solution:**
\[f(x) = 2^{(x+3)} = 2^3 \cdot 2^x = 8 \cdot 2^x\]

So [a = 8] and [b = 2].

**Example 2:** Rewrite [g(x) = 3^{(x-2)}] as [y = a \cdot b^x].

**Solution:**
\[g(x) = 3^{(x-2)} = 3^{-2} \cdot 3^x = \frac{1}{9} \cdot 3^x\]

So [a = 1/9] and [b = 3].

**Example 3:** Which is equivalent to [y = 2^{9x}]?

(A) [f(x) = 3^x] \quad (B) [f(x) = 9 \cdot 3^x] \quad (C) [f(x) = 18^x] \quad (D) [f(x) = 512^x]

**Solution:**
\[2^{9x} = (2^9)^x = 512^x\]

The answer is **(D)**.

## Guided Practice

### Section: text

**Problem 1:** Rewrite each function in the form [y = a \cdot b^x].

a) [f(x) = 2^{(x+7)}]

b) [g(x) = 5^{(x-1)}]

c) [p(x) = (1/2)^{(4x-1)}]

**Hint:** Use [b^{(x+h)} = b^h \cdot b^x] for translations and [b^{cx} = (b^c)^x] for dilations.

**Problem 2:** Which is equivalent to [p(x) = 2^{-3x}]?

(A) [p(x) = (-9)^x] \quad (B) [p(x) = (1/8)^x] \quad (C) [p(x) = (1/9)^x] \quad (D) [p(x) = -8^x]

**Hint:** Apply [b^{-3x} = (b^{-3})^x].

## Independent Practice

### Section: text

**Problem 1:** Rewrite in the form [y = a \cdot b^x]: [h(x) = 3^{(x+2)}]

**Problem 2:** Rewrite in the form [y = a \cdot b^x]: [s(x) = (3/5)^{2x}]

**Problem 3:** Which is equivalent to [f(x) = 4 \cdot 36^x]?

**Problem 4:** Which is equivalent to [g(x) = 25 \cdot 3^x]?

**Problem 5:** Rewrite in the form [y = a \cdot b^x]: [m(x) = 2^{3x}]. Identify [a] and [b].

## Reflection

### Section: text

**Exit Ticket:** Rewrite [f(x) = 3^{(x+2)}] in the form [y = a \cdot b^x].

**Lesson Summary:** Exponent rules — Product, Power, and Negative Exponent properties — allow any exponential expression to be rewritten. The key insight is that horizontal translations [b^{(x+h)}] equal [b^h \cdot b^x] (a vertical dilation) and horizontal dilations [b^{cx}] equal [(b^c)^x] (a base change). This equivalence is unique to exponential functions and is essential for comparing and manipulating exponential models.
