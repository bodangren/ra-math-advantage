# Lesson 4-12 — Linear Transformations and Matrices

Unit: 4
Topic: 4.12
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

Stretch a rubber sheet by doubling its width and halving its height. Rotate a shape 90 degrees. Reflect a figure across the [y]-axis. Each of these operations is a **linear transformation** — and every [2 times 2] matrix represents one. Matrices are not just number grids; they are machines that transform space.

## Vocabulary

### Section: text

- **Linear transformation**: A function [T: mathbb{R}^2 to mathbb{R}^2] that maps vectors to vectors and preserves vector addition and scalar multiplication.
- **Image**: The result of applying a transformation to a point or shape.
- **Pre-image**: The original shape before transformation.
- **Standard matrix**: The [2 times 2] matrix representing a linear transformation.

## Learn

### Section: text

A [2 times 2] matrix [A] acts as a **linear transformation** on every point [(x, y)] via:

\[ begin{bmatrix} x' \ y' end{bmatrix} = A begin{bmatrix} x \ y end{bmatrix} = begin{bmatrix} a & b \ c & d end{bmatrix} begin{bmatrix} x \ y end{bmatrix} \]

This produces [x' = ax + by] and [y' = cx + dy].

**Common transformations**:

| Transformation | Matrix | Effect |
|----------------|--------|--------|
| Reflection over [x]-axis | [begin{bmatrix} 1 & 0 \ 0 & -1 end{bmatrix}] | [y to -y] |
| Reflection over [y]-axis | [begin{bmatrix} -1 & 0 \ 0 & 1 end{bmatrix}] | [x to -x] |
| Horizontal stretch by [k] | [begin{bmatrix} k & 0 \ 0 & 1 end{bmatrix}] | [x to kx] |
| Vertical stretch by [k] | [begin{bmatrix} 1 & 0 \ 0 & k end{bmatrix}] | [y to ky] |
| Rotation by [theta] | [begin{bmatrix} cos(theta) & -sin(theta) \ sin(theta) & cos(theta) end{bmatrix}] | Rotates counterclockwise |

**Determinant and area**: The absolute value of the determinant [det(A)] gives the **area scaling factor**. If [det(A) = 3], the image has 3 times the area of the pre-image.

## Worked Example

### Section: text

**Example 1:** The transformation [T] reflects over the [x]-axis. Apply [T] to the triangle with vertices [(1, 2)], [(3, 1)], [(2, 4)].

**Solution:** The reflection matrix is [begin{bmatrix} 1 & 0 \ 0 & -1 end{bmatrix}].
- [(1, 2) to (1, -2)]
- [(3, 1) to (3, -1)]
- [(2, 4) to (2, -4)]

**Example 2:** What transformation does [A = begin{bmatrix} 2 & 0 \ 0 & 3 end{bmatrix}] perform?

**Solution:** [x' = 2x], [y' = 3y]. This stretches horizontally by 2 and vertically by 3.
[det(A) = 6], so area is multiplied by 6.

## Guided Practice

### Section: text

**Problem 1:** Apply [begin{bmatrix} 0 & -1 \ 1 & 0 end{bmatrix}] to the point [(3, 1)]. What transformation is this?

**Hint:** Multiply the matrix by the column vector. Compare to the rotation matrix with [theta = 90°].

**Problem 2:** Find the area scaling factor for [begin{bmatrix} 4 & 1 \ 2 & 3 end{bmatrix}].

## Independent Practice

### Section: text

**Problem 1:** A square with vertices [(0, 0)], [(1, 0)], [(1, 1)], [(0, 1)] is transformed by [A = begin{bmatrix} 2 & 0 \ 0 & 1 end{bmatrix}]. Find the image and its area.

**Problem 2:** Write the matrix for a reflection over the line [y = x]. Apply it to [(3, -2)].

**Problem 3:** If [det(A) = 0], what happens to the area of any shape under transformation [A]? What does this mean geometrically?

## Reflection

### Section: text

**Exit Ticket:** The transformation [begin{bmatrix} 1 & 0 \ 0 & -1 end{bmatrix}] maps [(a, b)] to what point? What type of transformation is this?

**Lesson Summary:** Linear transformations are represented by [2 times 2] matrices. Common types include reflections, stretches, and rotations. The determinant gives the area scaling factor. A zero determinant collapses space.
