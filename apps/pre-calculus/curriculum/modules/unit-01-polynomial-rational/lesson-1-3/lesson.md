# Lesson 1-3 — Rates of Change in Linear and Quadratic Functions

Unit: 1
Topic: 1.3
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

Consider this table:

| x | 1 | 2 | 4 | 8 |
|---|---|---|---|---|
| f(x) | 4 | 7 | 10 | 13 |

The output differences are all [3]. Does that mean [f] is linear? Before answering, check the input intervals: [2 - 1 = 1], [4 - 2 = 2], [8 - 4 = 4]. The input intervals are **unequal**, so constant output differences alone do not guarantee linearity. This lesson explores what the pattern of average rates of change *over equal-length intervals* tells us about function type.

## Vocabulary

### Section: text

- **Equal-length input intervals**: Input values spaced the same distance apart (e.g., [x = 1, 3, 5, 7] — intervals of width 2).
- **Successive differences**: The differences between consecutive output values in a table.
- **Second differences**: The differences of the successive differences.
- **Concave up**: The average rate of change over equal-length intervals is *increasing*. The graph curves upward like a cup.
- **Concave down**: The average rate of change over equal-length intervals is *decreasing*. The graph curves downward like a frown.

## Learn

### Section: text

**Linear functions**: For a linear function, the average rate of change over *any* equal-length input interval is **constant**. This constant is the slope. If the successive differences in a table are the same and the input intervals are equal, the function could be linear.

**Quadratic functions**: For a quadratic function, the average rate of change over equal-length intervals **changes linearly** — the successive differences form an arithmetic sequence. Equivalently, the **second differences** (differences of differences) are constant.

**Concavity**:
- **Concave up**: AROCs over equal-length intervals are increasing → second differences are positive → graph curves upward.
- **Concave down**: AROCs over equal-length intervals are decreasing → second differences are negative → graph curves downward.

**Key insight**: For [g(x) = x^2], computing AROCs over equal-width intervals of 2:

| x | -3 | -1 | 1 | 3 | 5 |
|---|---|---|---|---|---|
| g(x) | 9 | 1 | 1 | 9 | 25 |

AROCs: [frac{1-9}{2} = -4], [frac{1-1}{2} = 0], [frac{9-1}{2} = 4], [frac{25-9}{2} = 8]. Each AROC increases by 4 — a linear pattern, confirming quadratic behavior with concave up.

**Common misconception**: Constant output differences do NOT mean a function is linear unless the input intervals are also equal length.

## Worked Example

### Section: text

**Example 1:** Could each function be linear, quadratic, or neither?

a) [x: 1, 2, 3, 4] → [f(x): 0, 1, 4, 9]

**Solution:** Successive differences: 1, 3, 5. These increase by 2 (constant second differences). Since input intervals are equal (width 1), [f] could be **quadratic** (concave up).

b) [x: 1, 2, 5, 10] → [g(x): 0, 1, 4, 9]

**Solution:** Successive differences: 1, 3, 5 (same values as part a). But input intervals are unequal (widths 1, 3, 5). **Cannot determine** — we cannot conclude anything about function type from unequal intervals.

c) [x: 1, 1.1, 1.2, 1.3] → [p(x): 1, 7, 11, 13]

**Solution:** Successive differences: 6, 4, 2. These decrease by 2 (constant second differences of [-2]). Input intervals are equal (width 0.1). [p] could be **quadratic** (concave down).

**Example 2:** Determine concavity.

[x: 1, 1.1, 1.2, 1.3] → [k(x): 4, 1, -1, -2]

**Solution:** Differences: [-3], [-2], [-1]. These are *increasing* (from -3 to -2 to -1). The function is **concave up**.

## Guided Practice

### Section: text

**Problem 1:** [x: 0, 2, 4, 6, 8] → [q(x): 0, 5, 8, 9, 8]. Find the successive differences, then the second differences. Could [q] be quadratic?

**Hint:** Successive differences are 5, 3, 1, -1. Second differences are -2, -2, -2 — constant! Input intervals are equal (width 2), so yes, [q] could be quadratic (concave down).

**Problem 2:** [x: 2, 4, 6, 8] → [f(x): 3, 7, 13, 21]. Could [f] be quadratic? Justify using differences.

**Hint:** Differences: 4, 6, 8. Second differences: 2, 2 — constant. Yes, could be quadratic (concave up).

## Independent Practice

### Section: text

**Problem 1:** [x: 1, 3, 5, 7, 9] → [f(x): -2, -5, -4, 1, 10]. Could [f] be linear? Could it be quadratic? Justify.

**Problem 2:** [x: 1, 3, 5, 7, 9] → [m(x): -2, -2, -2, -2, -2]. What type of function could produce these values?

**Problem 3:** [x: 1, 3, 5, 7] → [h(x): -1, 1, 2, 2]. Determine if the function is concave up, concave down, or neither.

## Reflection

### Section: text

**Exit Ticket:** Given [x: 2, 4, 6, 8] → [f(x): 3, 7, 13, 21]. Could [f] be quadratic? Justify using differences.

**Lesson Summary:** Linear functions have constant average rates of change over equal-length intervals. Quadratic functions have AROCs that change linearly — their second differences are constant. Always verify that input intervals are equal before drawing conclusions. Concave up means AROCs are increasing; concave down means AROCs are decreasing.
