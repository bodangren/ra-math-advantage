# Lesson 4-14 — Matrices Modeling Contexts

Unit: 4
Topic: 4.14
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A store sells two products. On Monday it sells 10 of product A and 5 of product B; on Tuesday it sells 8 of A and 12 of B. Product A costs $3 and product B costs $7. The revenue for each day can be computed with a single matrix multiplication. Matrices model real-world problems where multiple quantities interact across multiple categories.

## Vocabulary

### Section: text

- **Matrix model**: Using matrix multiplication to represent and solve a real-world problem.
- **Coefficient matrix**: The matrix of coefficients in a system of equations.
- **Input-output model**: A matrix representation showing how outputs of one sector become inputs of another.

## Learn

### Section: text

Matrices naturally model problems involving **multiple inputs and outputs**.

**Revenue model**: If [S = begin{bmatrix} 10 & 5 \ 8 & 12 end{bmatrix}] (rows = days, columns = products) and [P = begin{bmatrix} 3 \ 7 end{bmatrix}] (prices), then:
\[ R = SP = begin{bmatrix} 10(3) + 5(7) \ 8(3) + 12(7) end{bmatrix} = begin{bmatrix} 65 \ 108 end{bmatrix} \]
The revenue vector gives Monday's and Tuesday's revenue.

**Systems of equations**: The system [2x + 3y = 7] and [x - y = 1] can be written as:
\[ begin{bmatrix} 2 & 3 \ 1 & -1 end{bmatrix} begin{bmatrix} x \ y end{bmatrix} = begin{bmatrix} 7 \ 1 end{bmatrix} \]

Solving: [mathbf{x} = A^{-1}mathbf{b}], provided [det(A) neq 0].

**Modeling strategy**:
1. Identify the quantities and organize them into matrices.
2. Set up the matrix equation [Amathbf{x} = mathbf{b}].
3. Solve by multiplying both sides by [A^{-1}]: [mathbf{x} = A^{-1}mathbf{b}].

## Worked Example

### Section: text

**Example:** A bakery makes cookies and cakes. Each batch of cookies uses 2 cups flour and 1 cup sugar. Each batch of cake uses 3 cups flour and 2 cups sugar. The bakery has 14 cups flour and 9 cups sugar. How many batches of each can be made?

**Solution:**
Set up the system:
\[ 2x + 3y = 14 \]
\[ x + 2y = 9 \]

Matrix form:
\[ begin{bmatrix} 2 & 3 \ 1 & 2 end{bmatrix} begin{bmatrix} x \ y end{bmatrix} = begin{bmatrix} 14 \ 9 end{bmatrix} \]

Find [A^{-1}]:
[det(A) = 2(2) - 3(1) = 1]
\[ A^{-1} = begin{bmatrix} 2 & -3 \ -1 & 2 end{bmatrix} \]

Solve:
\[ begin{bmatrix} x \ y end{bmatrix} = begin{bmatrix} 2 & -3 \ -1 & 2 end{bmatrix} begin{bmatrix} 14 \ 9 end{bmatrix} = begin{bmatrix} 28 - 27 \ -14 + 18 end{bmatrix} = begin{bmatrix} 1 \ 4 end{bmatrix} \]

Answer: 1 batch of cookies, 4 batches of cake.

## Guided Practice

### Section: text

**Problem 1:** A school sells tickets: adult tickets cost $8 and student tickets cost $5. On Friday, 120 adult and 80 student tickets were sold; on Saturday, 95 adult and 110 student tickets were sold. Write a matrix equation for the total revenue each day.

**Hint:** [R = begin{bmatrix} 120 & 80 \ 95 & 110 end{bmatrix} begin{bmatrix} 8 \ 5 end{bmatrix}]

**Problem 2:** Solve [3x + y = 10] and [x + 2y = 9] using [A^{-1}].

## Independent Practice

### Section: text

**Problem 1:** A farmer plants corn and wheat. Each acre of corn uses 4 hours labor and 2 tons water; each acre of wheat uses 3 hours labor and 3 tons water. The farmer has 24 hours labor and 18 tons water available. Set up and solve using matrices.

**Problem 2:** Verify the solution to Problem 1 by substituting back into the original equations.

**Problem 3:** Explain why [A^{-1}] cannot be used to solve a system where [det(A) = 0]. What does this mean geometrically?

## Reflection

### Section: text

**Exit Ticket:** Write the system [5x - 2y = 11] and [x + 3y = 7] as a matrix equation [Amathbf{x} = mathbf{b}].

**Lesson Summary:** Matrices model real-world problems by organizing data and representing systems of equations. Solving [Amathbf{x} = mathbf{b}] uses [mathbf{x} = A^{-1}mathbf{b}]. This approach works whenever [det(A) neq 0].
