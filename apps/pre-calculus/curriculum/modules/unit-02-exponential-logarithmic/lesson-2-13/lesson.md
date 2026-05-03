# Lesson 2-13 — Exponential and Logarithmic Equations and Inequalities

Unit: 2
Topic: 2.13
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Solving equations requires undoing operations. To solve [3x + 5 = 20], we subtract 5 and divide by 3 — undoing addition and multiplication in reverse order. Exponential and logarithmic equations follow the same principle, but now we must undo exponentiation (using logarithms) and logarithms (using exponentiation).

Consider: [2^x = 32]. You might recognize [x = 5] immediately. But what about [2^x = 30]? We need a systematic process: since [2^x = 30], we take [log_2] of both sides: [x = log_2(30)]. Or use common logs: [x = frac{log(30)}{log(2)}].

The key insight: [b^c = a rightarrow log_b(a) = c]. We convert between exponential and logarithmic form to isolate the variable.

## Vocabulary

### Section: text

- **Isolate**: Rearrange an equation so the exponential or logarithmic expression is alone on one side.
- **Convert**: Switch between exponential form [b^c = a] and logarithmic form [log_b(a) = c] to solve for the variable.
- **Common bases**: When two exponential expressions share a base (or can be rewritten to share a base), set exponents equal. Example: [8^x = 2^{3x}], so [8^{2x+1} = 2^{3(2x+1)}].
- **Extraneous solution**: A solution that emerges algebraically but fails to satisfy the original equation — particularly common with logarithmic equations where arguments must be positive.
- **Inverse of a general exponential/log function**: Finding [f^{-1}(x)] when [f(x) = a cdot b^{cx+d} + k] or [f(x) = a log_b(cx + d) + k].

## Learn

### Section: text

**Four-step process for exponential equations:**
1. **Isolate** the exponential expression.
2. **Convert** to logarithmic form.
3. **Solve** for the variable.
4. **Simplify.**

**Solving logarithmic equations:**
- Single log: Isolate, then convert to exponential form.
- Multiple logs: Use log properties to combine into one log, then convert.

**Always check for extraneous solutions.** Logarithmic properties can produce solutions where the argument is non-positive. Verify every solution by substituting back into the original equation.

**Common bases:** If both sides can be written with the same base, set exponents equal. For example, [9^{2x} = 27^{x+2}] becomes [3^{4x} = 3^{3(x+2)}], so [4x = 3x + 6] and [x = 6].

**Inequalities:** Follow the same conversion process, preserving inequality direction.

## Worked Example

### Section: text

**Example 1:** Solve single exponential equations.
- a) [4^{x-2} = 7] → [x - 2 = log_4(7)] → [x = 2 + log_4(7)]
- b) [2^{x+3} + 5 = 26] → [2^{x+3} = 21] → [x + 3 = log_2(21)] → [x = log_2(21) - 3]
- c) [-7 = 3 - 4e^x] → [e^x = frac{5}{2}] → [x = ln(frac{5}{2})]

**Example 2:** Solve single logarithmic equations.
- a) [2 log_3(x+3) + 4 = 10] → [log_3(x+3) = 3] → [x + 3 = 27] → [x = 24]
- b) [ln(2-x)/5 = 1] → [ln(2-x) = 5] → [2 - x = e^5] → [x = 2 - e^5]

**Example 3:** Solve equations with multiple logs (check extraneous).
- a) [log_3(x+2) + log_3(x-3) = log_3(14)] → [(x+2)(x-3) = 14] → [x^2 - x - 20 = 0] → [(x-5)(x+4) = 0]. Check: [x = 5] gives positive arguments. [x = -4] gives [x - 3 = -7 < 0] — extraneous. Solution: [x = 5].

**Example 4:** Solve using common bases.
- a) [9^{2x} = 27^{x+2}] → [3^{4x} = 3^{3x+6}] → [4x = 3x + 6] → [x = 6]
- b) [(1/2)^{5x+7} = 4^x] → [2^{-5x-7} = 2^{2x}] → [-5x - 7 = 2x] → [x = -1]

**Example 5:** Find the inverse of [f(x) = 4^{3x+2} - 15].
- [y = 4^{3x+2} - 15] → [y + 15 = 4^{3x+2}] → [log_4(y+15) = 3x + 2] → [x = frac{log_4(y+15) - 2}{3}]. So [f^{-1}(x) = frac{log_4(x+15) - 2}{3}].

## Guided Practice

### Section: text

**Problem 1:** Solve [3^{x+4} = 15].

**Hint:** Isolate the exponential (already isolated), then convert: [x + 4 = log_3(15)]. Solve for [x].

**Problem 2:** Solve [log(3) + log(x+4) = log(5x-2)].

**Hint:** Combine the left side using the product property: [log(3(x+4)) = log(5x-2)]. Then set arguments equal. Check for extraneous solutions.

**Problem 3:** Solve [8^{3x-2} = 2^{x+5}].

**Hint:** Rewrite [8] as [2^3]: [2^{3(3x-2)} = 2^{x+5}]. Set exponents equal.

**Problem 4:** Find the inverse of [g(x) = 3^{x-2} + 1].

**Hint:** Swap [x] and [y], then isolate the exponential and convert to log form.

## Independent Practice

### Section: text

**Problem 1:** Solve.
- a) [4^{x+3} - 7 = 2]
- b) [log_2(x-1) = 3]
- c) [3 log_4(x) + 2 = -7]

**Problem 2:** Solve and check for extraneous solutions.
- a) [ln(x+1) - ln(3x-5) = ln(7)]
- b) [log_3(2x-1) - log_3(x+3) = log_3(4)]

**Problem 3:** Solve using common bases.
- a) [3^{x-1} = 9^{2x+5}]
- b) [4^{2x-3} = 2^x]

**Problem 4:** Find the inverse of [k(x) = 3 log(x+1) - 2].

## Reflection

### Section: text

**Exit Ticket:** Solve [log_3(2x-1) - log_3(x+3) = log_3(4)]. Check for extraneous solutions.

**Lesson Summary:** Solving exponential and logarithmic equations follows a systematic process: isolate, convert between forms, solve, simplify. When multiple logs appear, use log properties to combine them first. When exponential expressions share a base, set the exponents equal. Always check for extraneous solutions in logarithmic equations — the argument of every log must be positive in the original equation.
