# Lesson 4-10 — Matrices

Unit: 4
Topic: 4.10
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A school offers three sports, and enrollment data is organized in a grid:

| | Freshmen | Sophomores |
|---|---|---|
| Soccer | 24 | 31 |
| Track | 18 | 27 |
| Swim | 12 | 15 |

This rectangular array of numbers is a **matrix**. Matrices organize data and enable systematic calculations — adding enrollments, scaling budgets, and transforming coordinates.

## Vocabulary

### Section: text

- **Matrix**: A rectangular array of numbers arranged in rows and columns, written in brackets.
- **Dimensions**: An [m times n] matrix has [m] rows and [n] columns.
- **Element (entry)**: The number in row [i] and column [j], denoted [a_{ij}].
- **Row matrix**: A [1 times n] matrix (also called a row vector).
- **Column matrix**: An [m times 1] matrix (also called a column vector).

## Learn

### Section: text

A **matrix** [A] of size [m times n] is written:

\[ A = begin{bmatrix} a_{11} & a_{12} & cdots & a_{1n} \ a_{21} & a_{22} & cdots & a_{2n} \ vdots & vdots & ddots & vdots \ a_{m1} & a_{m2} & cdots & a_{mn} end{bmatrix} \]

**Matrix addition and subtraction**: Add or subtract corresponding entries (matrices must have the same dimensions).

\[ begin{bmatrix} 1 & 3 \ 2 & 4 end{bmatrix} + begin{bmatrix} 5 & 1 \ 0 & 2 end{bmatrix} = begin{bmatrix} 6 & 4 \ 2 & 6 end{bmatrix} \]

**Scalar multiplication**: Multiply every entry by the scalar.

\[ 3 begin{bmatrix} 2 & -1 \ 0 & 4 end{bmatrix} = begin{bmatrix} 6 & -3 \ 0 & 12 end{bmatrix} \]

**Matrix multiplication**: [A times B] is defined when columns of [A] = rows of [B]. Entry [(i, j)] is the dot product of row [i] of [A] and column [j] of [B]. Multiplication is **not** commutative — [AB neq BA] in general.

## Worked Example

### Section: text

**Example 1:** Let [A = begin{bmatrix} 2 & -1 \ 0 & 3 end{bmatrix}] and [B = begin{bmatrix} 4 & 1 \ -2 & 5 end{bmatrix}].

\[ A + B = begin{bmatrix} 6 & 0 \ -2 & 8 end{bmatrix}, quad 2A - B = begin{bmatrix} 0 & -3 \ 2 & 1 end{bmatrix} \]

**Example 2:** Multiply [A = begin{bmatrix} 1 & 3 \ 2 & -1 end{bmatrix}] by [B = begin{bmatrix} 4 \ 5 end{bmatrix}].

\[ AB = begin{bmatrix} 1(4) + 3(5) \ 2(4) + (-1)(5) end{bmatrix} = begin{bmatrix} 19 \ 3 end{bmatrix} \]

## Guided Practice

### Section: text

**Problem 1:** Compute [begin{bmatrix} 3 & 0 \ -1 & 2 end{bmatrix} + begin{bmatrix} -1 & 5 \ 4 & -3 end{bmatrix}].

**Hint:** Add corresponding entries.

**Problem 2:** Compute [begin{bmatrix} 1 & 2 \ 3 & 4 end{bmatrix} begin{bmatrix} 0 & 1 \ -1 & 2 end{bmatrix}].

**Hint:** Row 1 of the result = [1(0) + 2(-1)] and [1(1) + 2(2)].

## Independent Practice

### Section: text

**Problem 1:** Let [A = begin{bmatrix} 1 & -2 \ 3 & 0 end{bmatrix}]. Find [3A].

**Problem 2:** Let [A = begin{bmatrix} 2 & 1 \ 0 & -1 end{bmatrix}] and [B = begin{bmatrix} 3 \ 4 end{bmatrix}]. Find [AB].

**Problem 3:** Explain why [begin{bmatrix} 1 & 2 & 3 end{bmatrix} begin{bmatrix} 4 & 5 \ 6 & 7 end{bmatrix}] is undefined.

## Reflection

### Section: text

**Exit Ticket:** Compute [begin{bmatrix} 2 & -3 \ 1 & 4 end{bmatrix} begin{bmatrix} 5 \ -2 end{bmatrix}].

**Lesson Summary:** Matrices are rectangular arrays that organize and transform data. Addition requires matching dimensions. Multiplication requires matching inner dimensions and uses dot products. Matrix multiplication is not commutative.
