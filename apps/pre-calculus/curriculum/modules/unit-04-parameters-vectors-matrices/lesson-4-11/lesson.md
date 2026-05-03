# Lesson 4-11 — The Inverse and Determinant of a Matrix

Unit: 4
Topic: 4.11
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

For numbers, [5 times frac{1}{5} = 1] — the reciprocal "undoes" multiplication. Can matrices do the same? If [A times A^{-1} = I] (where [I] is the identity matrix), then [A^{-1}] is the **inverse** of [A]. Not every matrix has an inverse, and the **determinant** tells us which ones do.

## Vocabulary

### Section: text

- **Identity matrix** ([I]): The matrix equivalent of 1. For [2 times 2]: [I = begin{bmatrix} 1 & 0 \ 0 & 1 end{bmatrix}].
- **Inverse matrix** ([A^{-1}]): The matrix satisfying [AA^{-1} = A^{-1}A = I].
- **Determinant**: A scalar value [det(A)] (or [|A|]) that indicates whether [A] is invertible.
- **Singular matrix**: A matrix with [det(A) = 0] — it has no inverse.
- **Non-singular matrix**: A matrix with [det(A) neq 0] — it has an inverse.

## Learn

### Section: text

**Determinant of a [2 times 2] matrix**:

\[ detbegin{pmatrix} a & b \ c & d end{pmatrix} = ad - bc \]

If [det(A) = 0], the matrix is **singular** (not invertible).

**Inverse of a [2 times 2] matrix**: When [det(A) neq 0]:

\[ A^{-1} = frac{1}{ad - bc} begin{bmatrix} d & -b \ -c & a end{bmatrix} \]

**Verification**: [AA^{-1} = frac{1}{ad - bc} begin{bmatrix} a & b \ c & d end{bmatrix} begin{bmatrix} d & -b \ -c & a end{bmatrix} = frac{1}{ad - bc} begin{bmatrix} ad - bc & 0 \ 0 & ad - bc end{bmatrix} = I]. ✓

**Geometric meaning**: A zero determinant means the transformation represented by the matrix collapses space (no area). The inverse "reverses" the transformation.

## Worked Example

### Section: text

**Example 1:** Find the determinant and inverse of [A = begin{bmatrix} 3 & 1 \ 2 & 4 end{bmatrix}].

**Solution:**
\[ det(A) = 3(4) - 1(2) = 12 - 2 = 10 \]

Since [det(A) neq 0], the inverse exists:
\[ A^{-1} = frac{1}{10} begin{bmatrix} 4 & -1 \ -2 & 3 end{bmatrix} = begin{bmatrix} 0.4 & -0.1 \ -0.2 & 0.3 end{bmatrix} \]

**Verification**: [AA^{-1} = begin{bmatrix} 3(0.4) + 1(-0.2) & 3(-0.1) + 1(0.3) \ 2(0.4) + 4(-0.2) & 2(-0.1) + 4(0.3) end{bmatrix} = begin{bmatrix} 1 & 0 \ 0 & 1 end{bmatrix}]. ✓

**Example 2:** Find the determinant of [B = begin{bmatrix} 6 & 3 \ 4 & 2 end{bmatrix}].

\[ det(B) = 6(2) - 3(4) = 12 - 12 = 0 \]

[B] is **singular** — no inverse exists.

## Guided Practice

### Section: text

**Problem 1:** Find the determinant of [begin{bmatrix} 5 & -2 \ 3 & 1 end{bmatrix}].

**Hint:** Compute [ad - bc].

**Problem 2:** Find the inverse of [begin{bmatrix} 2 & 0 \ 1 & 3 end{bmatrix}], if it exists.

## Independent Practice

### Section: text

**Problem 1:** Determine whether [begin{bmatrix} 4 & -1 \ -8 & 2 end{bmatrix}] has an inverse. Justify using the determinant.

**Problem 2:** Find [A^{-1}] for [A = begin{bmatrix} 1 & 2 \ 3 & 7 end{bmatrix}]. Verify by computing [AA^{-1}].

**Problem 3:** If [det(A) = 5] and [det(B) = -2], what is [det(AB)]?

## Reflection

### Section: text

**Exit Ticket:** Find the determinant of [begin{bmatrix} 7 & 2 \ -3 & 5 end{bmatrix}] and state whether the inverse exists.

**Lesson Summary:** The determinant [ad - bc] of a [2 times 2] matrix determines invertibility. The inverse formula swaps diagonal entries, negates off-diagonal entries, and divides by the determinant. A zero determinant means the matrix has no inverse.
