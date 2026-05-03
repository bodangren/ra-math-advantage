# Lesson 4-13 — Matrices as Functions

Unit: 4
Topic: 4.13
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A [2 times 2] matrix takes an input vector [langle x, yrangle] and produces an output vector [langle x', y'rangle]. This is exactly what a function does — it maps inputs to outputs. Viewing matrices as functions lets us apply all our function concepts: domain, range, composition, and inverses.

## Vocabulary

### Section: text

- **Matrix function**: A function [T(mathbf{v}) = Amathbf{v}] that maps vectors to vectors.
- **Composition of transformations**: Applying one transformation after another, represented by matrix multiplication [BA] (apply [A] first, then [B]).
- **Inverse transformation**: Applying [A^{-1}] to undo the transformation [A].

## Learn

### Section: text

A [2 times 2] matrix [A] defines a **function** [T: mathbb{R}^2 to mathbb{R}^2] where [T(mathbf{v}) = Amathbf{v}].

**Function concepts applied to matrices**:
- **Domain**: All of [mathbb{R}^2] (any vector can be input).
- **Range**: The set of all output vectors [Amathbf{v}]. If [det(A) neq 0], the range is all of [mathbb{R}^2]. If [det(A) = 0], the range is a line or the origin (the transformation collapses space).
- **One-to-one**: [A] is one-to-one if and only if [det(A) neq 0].
- **Onto**: [A] maps onto [mathbb{R}^2] if and only if [det(A) neq 0].

**Composition**: If [T_1] is represented by [A] and [T_2] by [B], then applying [T_1] then [T_2] is [T_2(T_1(mathbf{v})) = B(Amathbf{v}) = (BA)mathbf{v}]. The composite transformation is represented by [BA].

**Inverse**: If [det(A) neq 0], then [T^{-1}(mathbf{v}) = A^{-1}mathbf{v}] undoes [T].

## Worked Example

### Section: text

**Example 1:** Let [A = begin{bmatrix} 1 & 2 \ 0 & 1 end{bmatrix}] and [B = begin{bmatrix} 3 & 0 \ 0 & 1 end{bmatrix}].

**(a)** Find [T_2 circ T_1] (apply [A] then [B]):
\[ BA = begin{bmatrix} 3 & 0 \ 0 & 1 end{bmatrix} begin{bmatrix} 1 & 2 \ 0 & 1 end{bmatrix} = begin{bmatrix} 3 & 6 \ 0 & 1 end{bmatrix} \]

**(b)** Verify with [mathbf{v} = langle 1, 1rangle]:
- [T_1(mathbf{v}) = begin{bmatrix} 1 & 2 \ 0 & 1 end{bmatrix} begin{bmatrix} 1 \ 1 end{bmatrix} = begin{bmatrix} 3 \ 1 end{bmatrix}]
- [T_2(begin{bmatrix} 3 \ 1 end{bmatrix}) = begin{bmatrix} 3 & 0 \ 0 & 1 end{bmatrix} begin{bmatrix} 3 \ 1 end{bmatrix} = begin{bmatrix} 9 \ 1 end{bmatrix}]
- Direct: [BA mathbf{v} = begin{bmatrix} 3 & 6 \ 0 & 1 end{bmatrix} begin{bmatrix} 1 \ 1 end{bmatrix} = begin{bmatrix} 9 \ 1 end{bmatrix}]. ✓

## Guided Practice

### Section: text

**Problem 1:** Let [A = begin{bmatrix} 2 & 0 \ 0 & 1 end{bmatrix}] and [B = begin{bmatrix} 1 & 0 \ 0 & -1 end{bmatrix}]. Find the matrix for "stretch horizontally by 2, then reflect over [x]-axis."

**Hint:** Compute [BA].

**Problem 2:** Does [A = begin{bmatrix} 4 & 2 \ 2 & 1 end{bmatrix}] have an inverse? Is it one-to-one?

## Independent Practice

### Section: text

**Problem 1:** Let [A = begin{bmatrix} 0 & -1 \ 1 & 0 end{bmatrix}] (90° rotation). Find [A^4] and interpret the result.

**Problem 2:** If [T_1] is a horizontal stretch by 3 and [T_2] is a reflection over [y = x], find the composite matrix [T_2 circ T_1].

**Problem 3:** Explain why a transformation with [det(A) = 0] is not one-to-one. Give an example.

## Reflection

### Section: text

**Exit Ticket:** Find the matrix representing a horizontal stretch by 2 followed by a vertical stretch by 3.

**Lesson Summary:** Matrices define functions from vectors to vectors. Composition corresponds to matrix multiplication (order matters). Inverses exist when [det(A) neq 0]. A zero determinant means the transformation collapses space and is not one-to-one.
