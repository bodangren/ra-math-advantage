# Lesson 12-5 — Solving Quadratic Equations by Completing the Square

Source: (Module 12, Lesson 12-5, Int2_1205_practice.docx)

## Today's Goals

* Find the value of c that completes the square for a trinomial in the form [x^2 + bx].
* Solve quadratic equations by completing the square.
* Write quadratic equations in vertex form by completing the square.
* Identify the axis of symmetry, extrema, and zeros from the vertex form.
* Apply completing the square to real-world problems involving projectile motion and optimization.

## Vocabulary

* **Completing the Square** — The process of adding [(b/2)^2] to [x^2 + bx] to create a perfect square trinomial [(x + b/2)^2].
* **Perfect Square Trinomial** — A trinomial that can be written as [(x + k)^2], meaning it factors into a binomial squared.
* **Vertex Form** — [f(x) = a(x - h)^2 + k], where (h, k) is the vertex.
* **Axis of Symmetry** — The vertical line [x = h] in vertex form.
* **Extrema** — The maximum or minimum value of a function.
* **Completing the Square Method** — A method for solving quadratic equations by rewriting them in vertex form.

## Explore: Creating Perfect Squares

When you have [x^2 + bx], you can make it a perfect square by adding [(b/2)^2]. The result factors as [(x + b/2)^2]. For example, [x^2 + 6x] needs 9 to become [x^2 + 6x + 9 = (x + 3)^2].

Inquiry Question:
Why is [(b/2)^2] the correct value to add, not [b^2] or [b/2]?

## Learn: Completing the Square

### Key Concept: Finding the Constant to Add

For [x^2 + bx + c] to be a perfect square, [c = (b/2)^2]. The term you add is always the square of half the coefficient of x.

* For [x^2 + 26x], add [(26/2)^2 = 169].
* For [x^2 - 24x], add [(-24/2)^2 = 144].

### Key Concept: Steps to Complete the Square

1. Move constant terms to the other side so [x^2 + bx] is alone.
2. Add [(b/2)^2] to both sides.
3. Factor the perfect square trinomial.
4. Take the square root of both sides.
5. Solve for x.

## Example 1 — Find the Value of c

### Step 1: Identify b

In [x^2 + bx], b is the coefficient of x.

### Step 2: Compute (b/2)^2

For [x^2 + 26x], b = 26, so [(26/2)^2 = 169].

### Step 3: Verify

[x^2 + 26x + 169 = (x + 13)^2].

Problems 1-9: Find the value of c that makes each trinomial a perfect square.

## Example 2 — Solve Equations by Completing the Square

### Step 1: Move Constants

For [x^2 + 6x - 16 = 0], add 16 to both sides: [x^2 + 6x = 16].

### Step 2: Complete the Square

Add [(6/2)^2 = 9] to both sides: [x^2 + 6x + 9 = 25].

### Step 3: Factor

[(x + 3)^2 = 25].

### Step 4: Solve

[x + 3 = ±5], so [x = 2] or [x = -8].

### Step 5: Check

Substitute back into the original equation.

Problems 10-21: Solve each equation by completing the square. Round to the nearest tenth if necessary.

## Example 3 — Solve Equations with Different Coefficients

When a ≠ 1, divide both sides by a first before completing the square.

For [5x^2 - 10x = 23]:
1. Divide by 5: [x^2 - 2x = 23/5].
2. Complete: [( -2/2)^2 = 1], add 1 to both sides.
3. Factor: [(x - 1)^2 = 28/5].
4. Solve: [x = 1 ± √(28/5)].
5. Approximate if needed.

For [2x^2 - 2x + 7 = 5]:
1. Move constants: [2x^2 - 2x = -2].
2. Divide by 2: [x^2 - x = -1].
3. Complete: add [( -1/2)^2 = 1/4].
4. Factor: [(x - 1/2)^2 = -3/4].
5. Recognize there is no real solution since the right side is negative.

Problems 14-21: Solve each equation by completing the square.

## Example 4 — Write in Vertex Form

### Step 1: Complete the Square

For [y = x^2 + 8x + 7]:
1. Group: [(x^2 + 8x) + 7].
2. Complete: [x^2 + 8x + 16 + 7 - 16 = (x + 4)^2 - 9].
3. Vertex form: [y = (x + 4)^2 - 9].

### Step 2: Identify Key Features

Axis of symmetry: [x = -4]. Vertex: (-4, -9). Opens upward (a = 1 > 0), so minimum at y = -9.

### Step 3: Find Zeros

Set vertex form equal to zero and solve: [(x + 4)^2 - 9 = 0] gives [x = -1] or [x = -7].

Problems 22-25: Write each equation in vertex form. Identify the axis of symmetry, extrema, and zeros. Then use the key features to graph the function.

## Example 5 — Graph Using Vertex Form

### Step 1: Locate the Vertex

From [y = (x + 4)^2 - 9], the vertex is (-4, -9).

### Step 2: Determine Direction and Width

Since a = 1 > 0, the parabola opens upward.

### Step 3: Plot Additional Points

Use the y-intercept and symmetric points to plot the curve.

### Step 4: Draw the Parabola

Connect with a smooth curve.

Problems 22-25 (continued): Graph each function using its vertex form.

## Example 6 — Real-World Problems

### Mars Gravity Problem

For [h = -1.9t^2 + 26t]:
1. Find the time when height is maximum: vertex at [t = -b/(2a) = 26/(3.8) ≈ 6.8 seconds].
2. Compare to Earth's time (5.4 seconds): the difference is how much longer on Mars.
3. Find maximum height: substitute t into the equation.

### Frog Jump Problem

For [h = -0.5d^2 + 2d + 3]:
1. Find when the frog lands (h = 0): solve [0 = -0.5d^2 + 2d + 3].
2. Find maximum height: find the vertex of the parabola.

### Falling Object Problem

For [d = 16t^2 + 64t]:
1. Set d = 80 and solve [16t^2 + 64t = 80].
2. Complete the square to find t.

Problems 26-28: For each scenario, solve the problem and interpret your answer in context.

## Mixed Exercises

Problems 29-39 include:

* Finding garden width from area and fencing constraints.
* Finding the value of q that makes two different trinomials perfect squares.
* Finding rectangle dimensions from area.
* Proving that no two consecutive positive even integers have a product of 27.
* Writing trinomials that can be completed but not factored.
* Completing the square to find zeros of a sales function.
* Deriving the axis of symmetry formula from completing the square.
* Analyzing the number of solutions based on the constant term.
* Identifying which expression does not belong among four.
* Creating a quadratic equation with only one solution.
* Comparing completing the square, graphing, and factoring as solving methods.

## Review Notes

Images in the source:
* Problem 26: Mars golf ball trajectory.
* Problem 28: Falling rock in a well.
* Problem 29: Gardening fence diagram.
* Problem 30: Expressions for completing the square (four boxes showing x^2 + qx + 72).
* Problem 31: Rectangle with area 352.
* Problem 37: Four expressions in boxes, one of which does not belong.

![](media/image1.png) ![](media/image2.png) ![](media/image3.png)