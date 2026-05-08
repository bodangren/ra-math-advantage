import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule12Result {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

const lessonConfigs = [
  {
    slug: "module-12-lesson-1",
    title: "Graphing Quadratic Functions",
    description:
      "Students analyze vertex form, standard form, and intercept form. Identify axis of symmetry, vertex, and end behavior of a quadratic function from its graph.",
    orderIndex: 1,
    content: `## Vocabulary

* **Axis of Symmetry** — The vertical line that divides a parabola into two mirror images; passes through the vertex.
* **Vertex** — The highest or lowest point of a parabola; the maximum or minimum value of the function.
* **End Behavior** — Describes what happens to the output values as x approaches very large positive or very large negative values.
* **Parabola** — The U-shaped graph of a quadratic function.
* **Quadratic Function** — A function of the form [y = ax^2 + bx + c] where [a ≠ 0].

## Explore: What Makes Quadratic Graphs Unique?

Quadratic functions produce parabolic curves that are symmetric about a vertical axis. Unlike linear functions that go forever in one direction, parabolas turn at a single vertex point and then mirror themselves on either side.

Inquiry Question: How does the sign of the leading coefficient affect whether a parabola opens upward or downward, and what does that tell you about the vertex as a maximum or minimum?

## Learn: Graphing Quadratic Functions

### Key Concept: Parts of a Parabola

Every quadratic function [y = ax^2 + bx + c] produces a parabola with these key features:

* **Axis of Symmetry**: The vertical line [x = -b/(2a)] that passes through the vertex.
* **Vertex**: The point [( -b/(2a) , f( -b/(2a) ) )]; a maximum when [a < 0], a minimum when [a > 0].
* **Y-Intercept**: The point where the graph crosses the y-axis, found by evaluating [f(0) = c].
* **End Behavior**: When [a > 0], the parabola opens upward and y increases without bound in both directions. When [a < 0], the parabola opens downward and y decreases without bound in both directions.

### Key Concept: Graphing from a Table of Values

To graph a quadratic function:
1. Choose x-values symmetric around the axis of symmetry.
2. Compute the corresponding y-values.
3. Plot the points and connect them with a smooth curve.

## Example 1 — Identify Key Features from a Graph

### Step 1: Identify the Axis of Symmetry

For each graph, find the vertical line that divides the parabola in half. The axis of symmetry passes through the vertex and is equidistant from matching points on either side.

### Step 2: Identify the Vertex

Read the coordinates of the vertex from the graph. If the parabola opens downward, the vertex is the maximum point. If it opens upward, the vertex is the minimum point.

### Step 3: Identify the Y-Intercept

Find where the graph crosses the y-axis (where x = 0).

### Step 4: Describe End Behavior

State what happens to y as x becomes very large positive and as x becomes very large negative.

Problems 1-4: Identify the axis of symmetry, the vertex, and the y-intercept of each graph. Then describe the end behavior.

## Example 2 — Graph Quadratic Functions Using Key Features

### Step 1: Find the Axis of Symmetry

For [y = -3x^2 + 6x - 4], the axis of symmetry is [x = -b/(2a) = -6/(2(-3)) = 1].

### Step 2: Find the Vertex

Substitute x = 1 into the function: [y = -3(1)^2 + 6(1) - 4 = -1]. The vertex is (1, -1).

### Step 3: Find the Y-Intercept

Evaluate at x = 0: [y = -4], so the y-intercept is (0, -4).

### Step 4: Plot Points and Draw the Parabola

Use the axis of symmetry to find symmetric points on the other side of the axis. Draw the curve through these points.

Problems 5-10: Graph each function. Find the axis of symmetry, vertex, and y-intercept first.

## Example 3 — Graph with a Table of Values

When the coefficients are not friendly for completing the square, use a table of values to plot points. Choose x-values that are symmetric about the axis of symmetry for an accurate parabola shape.

### Step 1: Build a Table

For [y = x^2 + 6x - 6], find the axis of symmetry [x = -3]. Create a table with x-values around -3.

### Step 2: Compute Y-Values

Calculate y for each x-value. Plot the points.

### Step 3: State Domain and Range

The domain of any quadratic function is all real numbers. The range is [[vertex_y), ∞)) for upward-opening parabolas or [(-∞, vertex_y]] for downward-opening ones.

Problems 11-16: Use a table of values to graph each function. State the domain and range.

## Example 4 — Real-World Quadratic Models

### Step 1: Identify the Variables

In the Olympics pole vault problem, x represents the Olympiad number and y represents the winning height in meters.

### Step 2: Complete the Table

Substitute x-values into [y = 0.37x^2 + 4.3x + 126] and compute y.

### Step 3: Graph the Function

Plot the points from the table and connect them with a smooth curve.

### Step 4: Interpret Key Features

The vertex represents the maximum or minimum winning height. The y-intercept represents the winning height at the first Olympiad. Zeros would represent times when the height was zero, though in context they often fall outside the reasonable domain.

Problems 17-20: For each real-world scenario, graph the function and interpret the key features in terms of the quantities described.

## Mixed Exercises

Problems 21-36 provide practice with all skills from the lesson, including writing an equation for the area of a rectangular deck and finding the axis of symmetry, comparing quadratic and exponential functions on the same coordinate plane, finding intercepts, maximum values, and reasonable domains from real-world quadratic models, writing equations given specific features (y-intercept, minimum value, axis of symmetry), using the axis of symmetry to find additional points on a parabola, analyzing whether a vertex is always a minimum, and comparing quadratic, linear, and exponential functions in a table and graph.

## Review Notes

Images in the source include Problems 1-4 (four parabola graphs for identifying axis of symmetry, vertex, and end behavior), Problem 17 (graph showing Olympic pole vault data), Problem 21 (diagram of a rectangular deck), Problems 29-31 (additional parabola graphs), and Problem 36 (graph of [g(x)] for comparison with [f(x) = -x^2 + 3x - 2]).`,
  },
  {
    slug: "module-12-lesson-2",
    title: "Transformations of Quadratic Functions",
    description:
      "Students describe how the graph of a quadratic function relates to the parent function y = x^2 based on translations and dilations.",
    orderIndex: 2,
    content: `## Vocabulary

* **Parent Function** — The simplest quadratic function [f(x) = x^2], whose graph is a parabola opening upward with vertex at (0, 0).
* **Translation** — A shift of the graph horizontally or vertically without changing its shape.
* **Dilation** — A stretch or compression of the graph that changes its width but not its shape.
* **Reflection** — A flip of the graph across a line, such as the x-axis.
* **Horizontal Translation** — A shift left or right; occurs when a value is added or subtracted inside the squared term.
* **Vertical Translation** — A shift up or down; occurs when a value is added outside the squared term.
* **Vertex Form** — [f(x) = a(x - h)^2 + k], where (h, k) is the vertex and a controls the width and direction.

## Explore: How Do Changes to the Equation Move the Graph?

The parent function [f(x) = x^2] has a vertex at (0, 0) and opens upward. Adding values inside the parentheses shifts the graph horizontally, while adding values outside shifts it vertically. Multiplying the squared term stretches or compresses the graph and can flip it upside down.

Inquiry Question: If you replace x with (x - 3) in [y = x^2], why does the graph shift 3 units to the right rather than to the left?

## Learn: Transformations of Quadratic Functions

### Key Concept: Vertical Translations

* [g(x) = x^2 + k] shifts the parent function up by k units.
* [g(x) = x^2 - k] shifts the parent function down by k units.

Examples: [y = x^2 + 2], [y = x^2 - 8], [y = (x + 3)^2], [y = (x - 1)^2]

### Key Concept: Horizontal Translations

* [g(x) = (x - h)^2] shifts the parent function right by h units.
* [g(x) = (x + h)^2] shifts the parent function left by h units.

The sign is counterintuitive: (x - 3) means shift right 3 because you solve x - 3 = 0 to find where the input is zero.

### Key Concept: Dilations

* [g(x) = ax^2] where [a > 1] stretches the parabola vertically, making it narrower.
* [g(x) = ax^2] where [0 < a < 1] compresses the parabola vertically, making it wider.
* [g(x) = -ax^2] reflects the parabola across the x-axis, opening downward.

When the dilation factor is inside the squared term as [(bx)^2], the width is affected horizontally. The effective horizontal stretch factor is [|1/b|].

### Key Concept: Combined Transformations

* [g(x) = a(x - h)^2 + k] applies all three transformation types: a controls vertical stretch and reflection, h controls horizontal translation, k controls vertical translation.

## Example 1 — Describe Vertical and Horizontal Translations

### Step 1: Identify the Constant Outside the Square

If the equation has [+ k] or [- k] outside the squared term, the graph shifts vertically.

### Step 2: Identify the Expression Inside the Square

If the equation has [(x - h)] inside the square, the graph shifts horizontally.

Problems 1-12: Describe how each function is related to the graph of [y = x^2].

## Example 2 — Describe Dilations from Coefficients

### Step 1: Check the Coefficient of x^2

A coefficient greater than 1 makes the parabola narrower. A coefficient between 0 and 1 makes it wider.

### Step 2: Check for Negative Sign

A negative coefficient reflects the parabola across the x-axis.

### Step 3: Check for Horizontal Dilation

When x is multiplied by a factor inside the square, the graph is compressed or stretched horizontally.

Problems 13-20: Describe the dilation in each function as it relates to the graph of [y = x^2].

## Example 3 — Describe Combined Transformations

For [g(x) = -5 - (4/3)x^2], the negative sign reflects the parabola, the coefficient (4/3) affects the width, and the -5 shifts it down.

For [h(x) = 3 + (5/2)x^2], the coefficient (5/2) stretches the parabola vertically and the +3 shifts it up.

Problems 21-32: Describe how each function is related to the graph of [y = x^2].

## Example 4 — Use a Graph to Write the Equation

### Step 1: Identify the Vertex

Find the (h, k) coordinates from the graph.

### Step 2: Identify the Direction and Width

Determine whether [a] is positive or negative (opens up or down) and estimate its magnitude from how wide or narrow the parabola is.

### Step 3: Write the Equation

Substitute into [f(x) = a(x - h)^2 + k] and solve for a if needed by substituting another point.

Problems 36-38: Use the graph of each function to write its equation.

## Example 5 — Transformations in Real-World Contexts

The spring constant problem compares [U_s = (1/2)kx^2] for k = 10 versus k = 2. The larger spring constant produces a steeper, narrower parabola.

The falling ball problem [h = -16t^2 + 20] is a vertical stretch (wider than [y = t^2]) combined with a reflection across the x-axis and a vertical shift up 20 units.

The racing car problem compares [d = 3t^2] and [d = 2t^2 + 100]. The second car's equation represents a vertical stretch factor of 2 and a vertical translation up 100 units.

Problems 33-35: Compare each real-world quadratic model to its parent function.

## Mixed Exercises

Problems 39-65 include describing transformations for functions with decimals, fractions, and combined translations, using transformations to graph quadratic functions and identifying the transformation used, matching functions to their graphs (four options provided), writing instructions to transform [f(x) = x^2] into a given function, analyzing whether statements about quadratic functions are always, sometimes, or never true, writing functions that pass through given points, determining whether all quadratic functions reflected across the y-axis produce the same graph, and creating a quadratic function with specific characteristics (opens down, wider than parent).

## Review Notes

Images in the source include Problems 36-38 (three parabola graphs for writing equations from graphs), Problems 45-47 (graphs for transformation practice), Problems 48-51 (four graphs A, B, C, D to match with four functions), Problems 54, 55-60 (parabola graphs for equation writing), Problem 61 (graph showing two parabolas for comparison), and Problem 64 (parabola for creating a function).`,
  },
  {
    slug: "module-12-lesson-3",
    title: "Solving Quadratic Equations by Graphing",
    description:
      "Students solve quadratic equations by finding the x-intercepts of the related quadratic function, estimate solutions when the exact x-intercepts are not integers.",
    orderIndex: 3,
    content: `## Vocabulary

* **Zero of a Function** — An input x for which [f(x) = 0]; the x-intercept of the graph.
* **Root** — A solution to the quadratic equation [ax^2 + bx + c = 0].
* **X-Intercept** — The point where the graph crosses the x-axis; where [y = 0].
* **Quadratic Equation** — An equation of the form [ax^2 + bx + c = 0] where [a ≠ 0].
* **Projectile Motion** — Motion that follows a parabolic path, modeled by a quadratic function where the variable represents time.

## Explore: Where Does the Function Cross the X-Axis?

When solving [x^2 + 7x + 14 = 0], you are looking for x-values that make the output zero. On a graph, these are exactly the points where the parabola crosses or touches the x-axis. If the parabola stays entirely above or below the x-axis, there are no real solutions.

Inquiry Question: Why can a quadratic equation have 0, 1, or 2 real solutions, but not 3?

## Learn: Solving Quadratics by Graphing

### Key Concept: The Graphing Method

To solve [ax^2 + bx + c = 0] by graphing:
1. Rewrite the equation in the form [f(x) = ax^2 + bx + c].
2. Graph the function [y = f(x)].
3. Find the x-coordinate(s) of any x-intercept(s).
4. Those x-values are the solutions.

If the vertex lies on the x-axis, there is one solution (a double root). If the parabola crosses the x-axis twice, there are two solutions.

### Key Concept: Interpreting Zeros in Context

In real-world problems, a zero of the function often has a physical meaning. For a ball thrown upward, the zeros represent when the ball is at ground level (height = 0). The positive zero is when it lands.

## Example 1 — Solve Quadratics with Integer Solutions

### Step 1: Graph the Function

For [x^2 + 7x + 14 = 0], graph [y = x^2 + 7x + 14].

### Step 2: Find the X-Intercepts

Look for points where the graph crosses the x-axis. Read the x-values at those points.

### Step 3: Write the Solutions

The x-coordinate(s) of the x-intercept(s) are the solution(s).

Problems 1-12: Solve each equation by graphing.

## Example 2 — Solve Quadratics with Non-Integer Solutions

When the x-intercepts are not at integer values, use the graph to estimate. For [x^2 - 5x + 12 = 0], if the graph does not cross the x-axis, there are no real solutions.

Problems 4-6: Solve each equation by graphing. Note which have no real solutions.

## Example 3 — Real-World Projectile Motion

### Step 1: Identify the Function

For the soccer ball kicked off a platform: [y = -x^2 + 3x + 12].

### Step 2: Graph the Function

Plot the parabola with the given equation.

### Step 3: Find the X-Intercepts

The x-intercepts represent when the ball is at ground level (height = 0).

### Step 4: Interpret the Solutions

The time the ball is in the air is the positive x-intercept (or the difference between the two intercepts if both are positive). The y-intercept represents the initial height at the moment of the kick.

Problems 13-14: For each real-world scenario, determine approximately how long the object is in the air.

## Mixed Exercises

Problems 15-32 include estimating solutions by graphing to the nearest tenth, graphing crop yield functions to find maximum yield and zeros, finding the width of picture frame material given total area, determining if a rectangle can have both a given area and perimeter, analyzing parabolic satellite dishes and translating them to produce different numbers of zeros, matching graphs to quadratic equations with parameters m and n, finding where a rocket reaches its maximum height and when it hits the ground, using profit functions to find break-even points and maximum profit, analyzing quadratic inequalities (y > some value), and creating quadratic equations with specific root types (double root, no real solutions, two unique real solutions).

## Review Notes

Images in the source include Problem 21 (graph of crop yield function), Problem 22 (diagram of framed photograph with frame width x), Problem 24 (parabolic satellite dish diagram), Problem 25 (graph with three parabolas), Problem 26 (rocket height graph), Problem 27 (profit function graph), Problem 28 (quadratic function graph for zero analysis), Problem 30 (quadratic inequality graph), and Problem 31 (graph for finding solutions greater than 2).`,
  },
  {
    slug: "module-12-lesson-4",
    title: "Solving Quadratic Equations by Factoring",
    description:
      "Students solve quadratic equations by factoring and using the Zero Product Property, recognize and factor difference of squares, perfect square trinomials, and general trinomials.",
    orderIndex: 4,
    content: `## Vocabulary

* **Zero Product Property** — If [ab = 0], then [a = 0] or [b = 0].
* **Factored Form** — A quadratic written as [(x - r1)(x - r2) = 0], where r1 and r2 are the roots.
* **Difference of Squares** — A binomial of the form [a^2 - b^2] that factors as [(a + b)(a - b)].
* **Perfect Square Trinomial** — A trinomial of the form [a^2 + 2ab + b^2] or [a^2 - 2ab + b^2] that factors as [(a + b)^2] or [(a - b)^2].
* **Root** — A value that makes the quadratic expression equal to zero.
* **Repeated Root** — A root that appears twice (a double root), resulting from a factor that appears twice in the factored form.

## Explore: Why Does the Zero Product Property Work?

If the product of two expressions is zero, at least one of them must be zero. This is the foundation of solving factored quadratic equations. But you can only use this property when the product equals zero, not some other number.

Inquiry Question: If [(x - 3)(x + 5) = 12], can you use the Zero Product Property directly? What must you do first?

## Learn: Solving Quadratics by Factoring

### Key Concept: Standard Form First

Always move all terms to one side so the equation equals zero: [ax^2 + bx + c = 0]. Then factor.

### Key Concept: Zero Product Property

If [(x - r1)(x - r2) = 0], then [x - r1 = 0] or [x - r2 = 0], giving [x = r1] or [x = r2].

### Key Concept: Special Factoring Patterns

* Difference of squares: [a^2 - b^2 = (a + b)(a - b)]
* Perfect square trinomials: [a^2 + 2ab + b^2 = (a + b)^2], [a^2 - 2ab + b^2 = (a - b)^2]

## Example 1 — Solve Equations with Squares and Simple Factors

### Step 1: Isolate One Side

For [x^2 = 36], rewrite as [x^2 - 36 = 0].

### Step 2: Factor

Recognize [x^2 - 36] as a difference of squares: [(x + 6)(x - 6) = 0].

### Step 3: Apply Zero Product Property

[x + 6 = 0] gives [x = -6]; [x - 6 = 0] gives [x = 6].

### Step 4: Check Solutions

Substitute back into the original equation.

Problems 1-14: Solve each equation. Check your solutions.

## Example 2 — Solve Equations with Trinomials

### Step 1: Write in Standard Form

For [x^2 - 6x = 27], rewrite as [x^2 - 6x - 27 = 0].

### Step 2: Factor the Trinomial

Find two numbers that multiply to the constant term and add to the coefficient of x.

### Step 3: Apply Zero Product Property

Set each factor equal to zero and solve.

Problems 15-18: Solve each equation by factoring.

## Example 3 — Solve Equations with Divided Terms

For [81 - (1/25)x^2 = 0], rearrange to [(9 - (1/5)x)(9 + (1/5)x) = 0] and solve.

For [3b(9b - 27) = 0], factor out the common factor first, then apply the Zero Product Property.

Problems 19-24: Solve each equation. Check your solutions.

## Example 4 — Use Roots to Sketch the Related Function

### Step 1: Solve by Factoring

Find the roots of the quadratic equation.

### Step 2: Identify Key Features

The roots are the x-intercepts. The axis of symmetry is halfway between the roots. The vertex lies on the axis of symmetry.

### Step 3: Sketch the Parabola

Plot the x-intercepts, find the vertex, and draw a smooth curve through the points.

Problems 25-26: Consider each equation. Solve by factoring, then use the roots to sketch the related function.

## Example 5 — Real-World Problems

### Number Theory Problem

Let the consecutive integers be n and n+1. The product [n(n+1)] equals the sum [n + (n+1)] plus 11. Write and solve the equation.

### Ladder Problem

Let the distance from the wall be x. The length of the ladder is [2x + 1] (one foot more than twice the distance). Use the Pythagorean Theorem: [x^2 + 15^2 = (2x + 1)^2]. Solve for x.

### Free Fall Problem

Set [f(t) = -16t^2 + 576 = 0] and solve for t. The positive solution is when the ballast bag hits the ground.

### Volume Problem

Given [V = 3x^2 - 36x + 108], factor to find when the volume equals a given value, or find the dimensions when the original cardboard length is known.

Problems 27-30: Solve each real-world problem.

## Example 6 — Write a Quadratic Function from a Graph

### Step 1: Identify the X-Intercepts

Read the x-intercepts from the graph. If the vertex is on the x-axis, the quadratic has a repeated root.

### Step 2: Write Factored Form

If the x-intercepts are r1 and r2, write [f(x) = a(x - r1)(x - r2)].

### Step 3: Find a

Substitute another point from the graph to solve for a.

### Step 4: Write the Equation

Substitute the value of a back into the factored form.

Problems 31-34: Write a quadratic function for each given graph.

## Example 7 — Write a Quadratic Function Given Three Points

### Step 1: Set Up a System

Substitute each point (x, y) into [f(x) = ax^2 + bx + c] to get three equations.

### Step 2: Solve the System

Solve for a, b, and c.

### Step 3: Write the Function

Substitute the values into [f(x) = ax^2 + bx + c].

Problems 35-38: Write a quadratic function that contains the given points.

## Mixed Exercises

Problems 39-70 include checking whether factored solutions are correct (Kayla's zero claim), writing perimeter expressions from area expressions, solving equations with fractions and coefficients, finding triangle dimensions from area, explaining how Zero Product Property works, analyzing how solving differs when a ≠ 1 versus a = 1, finding perimeter from binomials and checking multiples, predicting values for q in a factoring problem, finding rectangle dimensions from perimeter and area, using graphs to verify whether equations have solutions, analyzing what to consider when solving real-world quadratic models, creating perfect square trinomial equations, factoring cubic polynomials and sketching their graphs.

## Review Notes

Images in the source include Problem 27 (ladder diagram against a wall), Problem 30 (box formed by cutting 3-inch squares from corners), Problems 31-34 (four parabola graphs for writing equations), Problem 62 (rectangle with perimeter expression), and Problem 67 (Ignatio and Samantha work for solving a quadratic).`,
  },
  {
    slug: "module-12-lesson-5",
    title: "Solving Quadratic Equations by Completing the Square",
    description:
      "Students find the value of c that completes the square for a trinomial in the form x^2 + bx, solve quadratic equations by completing the square, write quadratic equations in vertex form.",
    orderIndex: 5,
    content: `## Vocabulary

* **Completing the Square** — The process of adding [(b/2)^2] to [x^2 + bx] to create a perfect square trinomial [(x + b/2)^2].
* **Perfect Square Trinomial** — A trinomial that can be written as [(x + k)^2], meaning it factors into a binomial squared.
* **Vertex Form** — [f(x) = a(x - h)^2 + k], where (h, k) is the vertex.
* **Axis of Symmetry** — The vertical line [x = h] in vertex form.
* **Extrema** — The maximum or minimum value of a function.
* **Completing the Square Method** — A method for solving quadratic equations by rewriting them in vertex form.

## Explore: Creating Perfect Squares

When you have [x^2 + bx], you can make it a perfect square by adding [(b/2)^2]. The result factors as [(x + b/2)^2]. For example, [x^2 + 6x] needs 9 to become [x^2 + 6x + 9 = (x + 3)^2].

Inquiry Question: Why is [(b/2)^2] the correct value to add, not [b^2] or [b/2]?

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

For [5x^2 - 10x = 23]: 1. Divide by 5: [x^2 - 2x = 23/5]. 2. Complete: [( -2/2)^2 = 1], add 1 to both sides. 3. Factor: [(x - 1)^2 = 28/5]. 4. Solve: [x = 1 ± √(28/5)]. 5. Approximate if needed.

For [2x^2 - 2x + 7 = 5]: 1. Move constants: [2x^2 - 2x = -2]. 2. Divide by 2: [x^2 - x = -1]. 3. Complete: add [( -1/2)^2 = 1/4]. 4. Factor: [(x - 1/2)^2 = -3/4]. 5. Recognize there is no real solution since the right side is negative.

Problems 14-21: Solve each equation by completing the square.

## Example 4 — Write in Vertex Form

### Step 1: Complete the Square

For [y = x^2 + 8x + 7]: 1. Group: [(x^2 + 8x) + 7]. 2. Complete: [x^2 + 8x + 16 + 7 - 16 = (x + 4)^2 - 9]. 3. Vertex form: [y = (x + 4)^2 - 9].

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

For [h = -1.9t^2 + 26t]: 1. Find the time when height is maximum: vertex at [t = -b/(2a) = 26/(3.8) ≈ 6.8 seconds]. 2. Compare to Earth's time (5.4 seconds): the difference is how much longer on Mars. 3. Find maximum height: substitute t into the equation.

### Frog Jump Problem

For [h = -0.5d^2 + 2d + 3]: 1. Find when the frog lands (h = 0): solve [0 = -0.5d^2 + 2d + 3]. 2. Find maximum height: find the vertex of the parabola.

### Falling Object Problem

For [d = 16t^2 + 64t]: 1. Set d = 80 and solve [16t^2 + 64t = 80]. 2. Complete the square to find t.

Problems 26-28: For each scenario, solve the problem and interpret your answer in context.

## Mixed Exercises

Problems 29-39 include finding garden width from area and fencing constraints, finding the value of q that makes two different trinomials perfect squares, finding rectangle dimensions from area, proving that no two consecutive positive even integers have a product of 27, writing trinomials that can be completed but not factored, completing the square to find zeros of a sales function, deriving the axis of symmetry formula from completing the square, analyzing the number of solutions based on the constant term, identifying which expression does not belong among four, creating a quadratic equation with only one solution, and comparing completing the square, graphing, and factoring as solving methods.

## Review Notes

Images in the source include Problem 26 (Mars golf ball trajectory), Problem 28 (falling rock in a well), Problem 29 (gardening fence diagram), Problem 30 (expressions for completing the square), Problem 31 (rectangle with area 352), and Problem 37 (four expressions in boxes).`,
  },
  {
    slug: "module-12-lesson-6",
    title: "Solving Quadratic Equations by Using the Quadratic Formula",
    description:
      "Students apply the Quadratic Formula to solve quadratic equations written in standard form, use the discriminant to determine the number and type of solutions.",
    orderIndex: 6,
    content: `## Vocabulary

* **Quadratic Formula** — The formula [ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} ] used to find the exact solutions of any quadratic equation written in standard form [ ax^2 + bx + c = 0 ].
* **Discriminant** — The expression [ b^2 - 4ac ] under the radical in the Quadratic Formula, which determines the number and nature of the solutions.
* **Real solutions** — Solutions to a quadratic equation that are real numbers; they occur when the discriminant is greater than or equal to zero.
* **Complex (nonreal) solutions** — Solutions that involve the imaginary unit [ i ]; they occur when the discriminant is negative.

## Explore: Why Does the Quadratic Formula Work?

The Quadratic Formula provides the exact solutions to any quadratic equation [ ax^2 + bx + c = 0 ]. Students explore how completing the square on the general quadratic leads to this powerful formula, and why it works for every value of [ a ], [ b ], and [ c ] (as long as [ a \ne 0 ]).

Inquiry Question: Why does the Quadratic Formula give all solutions to a quadratic equation, and what does the discriminant reveal about those solutions?

## Learn: The Quadratic Formula

For any quadratic equation in standard form [ ax^2 + bx + c = 0 ] where [ a \ne 0 ], the Quadratic Formula gives the exact solutions:

[ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} ]

Before applying the formula, rewrite the equation in standard form and identify the coefficients [ a ], [ b ], and [ c ]. Substitute these values into the formula, simplify the radical and the fraction, and separate the two solutions indicated by [ \pm ]. Round to the nearest tenth when instructed.

### Key Concept: Using the Quadratic Formula

* Rewrite the equation in standard form [ ax^2 + bx + c = 0 ].
* Identify [ a ], [ b ], and [ c ], including their signs.
* Substitute into [ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} ].
* Simplify the discriminant and the entire fraction.
* Use [ \pm ] to write both solutions; round when necessary.

## Example 1 — Solve Quadratic Equations with the Quadratic Formula

Solve quadratic equations by applying the Quadratic Formula. Equations may already be in standard form or may require rearrangement.

### Step 1: Write in Standard Form

Ensure the equation is in the form [ ax^2 + bx + c = 0 ].

### Step 2: Identify Coefficients

Determine [ a ], [ b ], and [ c ] from the standard form. Watch for missing terms and negative signs.

### Step 3: Substitute and Simplify

Substitute the coefficients into the Quadratic Formula: [ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} ]

Simplify the expression under the radical and the entire fraction. If the discriminant is a perfect square, the solutions are rational. If not, approximate to the nearest tenth.

For example, for [ x^2 - x - 20 = 0 ] with [ a = 1 ], [ b = -1 ], and [ c = -20 ]: [ x = \frac{-(-1) \pm \sqrt{(-1)^2 - 4(1)(-20)}}{2(1)} = \frac{1 \pm \sqrt{81}}{2} = \frac{1 \pm 9}{2} ] giving [ x = 5 ] or [ x = -4 ].

## Example 2 — Solve Equations Requiring Rearrangement

Solve quadratic equations that are not initially given in standard form, including equations with missing terms, decimals, or fractional coefficients.

### Step 1: Rearrange into Standard Form

Move all terms to one side to obtain [ ax^2 + bx + c = 0 ]. For example, [ 5x^2 - 8x = 6 ] becomes [ 5x^2 - 8x - 6 = 0 ].

### Step 2: Identify Coefficients and Solve

Identify [ a ], [ b ], and [ c ] from the rearranged equation, then substitute into the Quadratic Formula and simplify.

### Step 3: Simplify Special Cases

For equations with no linear term, such as [ x^2 - 49 = 0 ]: [ x = \frac{-0 \pm \sqrt{0^2 - 4(1)(-49)}}{2(1)} = \frac{\pm \sqrt{196}}{2} = \pm 7 ]

For equations with no real solutions, such as [ x^2 + 16 = 0 ]: [ x = \frac{-0 \pm \sqrt{0 - 4(1)(16)}}{2(1)} = \frac{\pm \sqrt{-64}}{2} = \pm 4i ]

## Example 3 — Apply Quadratic Equations to Real-World Problems

Use the Quadratic Formula to solve application problems from business, physics, architecture, and crafts.

### Step 1: Model the Situation

Write a quadratic equation that represents the problem. For example, a profit function [ f(x) = x^2 + 2x - 37 ] can be set equal to zero to find break-even points.

### Step 2: Solve and Interpret

Apply the Quadratic Formula, then interpret the result in context. Discard solutions that do not make sense for the situation (e.g., negative time or a negative count of items).

### Step 3: Round Appropriately

Round answers to the nearest tenth (or hundredth when specified) and include appropriate units.

Representative applications include free-fall motion modeled by [ h = -16t^2 + 50 ], the Golden Ratio relationship in architecture, and dividing a length into two unequal pieces to form squares with a specified total area.

## Example 4 — Use the Discriminant

Determine the number of real solutions of a quadratic equation without fully solving it by evaluating the discriminant.

### Step 1: Identify Coefficients

From [ ax^2 + bx + c = 0 ], identify [ a ], [ b ], and [ c ].

### Step 2: Calculate the Discriminant

Evaluate [ b^2 - 4ac ].

### Step 3: Determine the Number of Solutions

* If [ b^2 - 4ac > 0 ], the equation has **two distinct real solutions**.
* If [ b^2 - 4ac = 0 ], the equation has **one real solution** (a repeated root).
* If [ b^2 - 4ac < 0 ], the equation has **no real solutions** (two complex solutions).

For example, for [ x^2 - 4x + 10 = 0 ]: [ b^2 - 4ac = (-4)^2 - 4(1)(10) = 16 - 40 = -24 ] and since [ -24 < 0 ], there are no real solutions.

## Mixed Exercises

The mixed exercises provide comprehensive practice across all skills in this lesson. Problem types include solving quadratic equations using the Quadratic Formula with and without rearrangement, determining the number of x-intercepts by evaluating the discriminant, solving geometry word problems involving rectangles, cylinders, and frames, analyzing projectile motion and fireworks trajectories, reasoning about parameter values that yield a specific number of solutions, comparing solution methods, and writing original quadratic equations with a specified number of real roots and justifying with the discriminant.

## Review Notes

Images referenced in the worksheet provide visual context for the geometric relationships described. Problem 18 involves a Golden Ratio proportion that simplifies to a quadratic equation.`,
  },
  {
    slug: "module-12-lesson-7",
    title: "Solving Systems of Linear and Quadratic Equations",
    description:
      "Students solve a system of linear and quadratic equations by graphing, identify intersection points of the parabola and line, solve algebraically by substitution or elimination.",
    orderIndex: 7,
    content: `## Vocabulary

* **System of Linear and Quadratic Equations** — A system containing one equation of degree 1 and one equation of degree 2, typically a parabola and a line.
* **Substitution Method** — An algebraic technique where one equation is solved for a variable in terms of the others and substituted into the remaining equation(s).
* **Intersection Point** — The coordinate(s) where the graph of the linear function and the graph of the quadratic function cross each other; the solution to the system.

## Explore: Intersection of Parabolas and Lines

When a parabola and a line are graphed on the same coordinate plane, their intersection(s) represent the solution(s) to the system of equations. Students investigate how many intersection points are possible and what conditions determine whether the line intersects, is tangent to, or misses the parabola.

Inquiry Question: What determines whether a line and a parabola will intersect at 0, 1, or 2 points?

## Learn: Solving Systems of Linear and Quadratic Equations

### Key Concept: Number of Solutions

A system of one linear and one quadratic equation can have 0, 1, or 2 solutions depending on how many times the line intersects the parabola:

* **0 solutions** — The line does not intersect the parabola.
* **1 solution** — The line is tangent to the parabola (touches at exactly one point).
* **2 solutions** — The line crosses the parabola at two distinct points.

### Key Concept: Solving by Graphing

Graph both equations on the same coordinate plane. Read the coordinates of the intersection point(s) from the graph. This method is useful for estimating solutions and visualizing the relationship between the functions.

### Key Concept: Solving Algebraically

Use substitution or elimination to solve the system exactly:

1. Solve the linear equation for one variable, or substitute the quadratic expression for [y] in the linear equation.
2. Rearrange to standard quadratic form and solve for the remaining variable.
3. Substitute back to find the other coordinate of each solution point.

## Example 1 — Solve Systems by Graphing

Graph each system and identify the solution point(s) where the parabola and line intersect.

### Step 1: Graph the Parabola

Use a table of values or vertex form to sketch the quadratic function. Plot several points to reveal the shape of the parabola.

[y = x^2 - 4] with [y = -3], [y = x^2 + x - 2] with [y = -x + 1], [y = 2x^2 + 1] with [y = 1], [y = x^2 + 3x + 1] with [y = x + 1].

### Step 2: Graph the Line

Plot the linear function using its slope and y-intercept. Extend the line across the coordinate plane.

### Step 3: Identify Intersection Points

Read the coordinates of each point where the line and parabola cross. These coordinates are the solution(s) to the system.

## Example 2 — Solve Systems Algebraically

Solve each system exactly using substitution or elimination. Find both coordinates of each solution.

### Step 1: Substitute the Quadratic Expression into the Linear Equation

For a system written as [y =] quadratic and [y =] linear, substitute the right-hand side of the quadratic for [y] in the linear equation. This eliminates [y] and leaves an equation in [x].

### Step 2: Rearrange to Standard Quadratic Form

Move all terms to one side so the equation equals zero.

### Step 3: Solve the Quadratic Equation

Factor, complete the square, or use the quadratic formula to find the [x]-values.

### Step 4: Substitute Back to Find [y]

Plug each [x]-value into one of the original equations to find the corresponding [y]-value.

### Step 5: Check All Solutions in Both Equations

Verify that each solution pair satisfies both original equations.

## Example 3 — Real-World Systems

### Gymnastics Problem

A gymnast throws a baton into the air. The height of the baton is modeled by a quadratic function, and the gym ceiling is modeled by a horizontal line. Solve the system algebraically to find when and where the baton height equals the ceiling height. If the discriminant is negative, the baton does not reach the ceiling.

### Disc Golf Problem

A disc's height is modeled by a quadratic function and Rodrigo's hand height by a linear function. Solve the system to find when the disc reaches Rodrigo's hand height.

### Zoo Revenue Problem

Two revenue functions (single-day tickets and season passes) intersect at a specific month. Solve the system and convert [x] months past January to find the actual month.

## Mixed Exercises

Problems 14-27 involve solving systems by graphing or algebraically with parabolas intersecting horizontal, vertical, and slanted lines. Problems 28-33 require rearranging into standard quadratic form. Real-world applications include a wingsuit flyer problem, a video game with rubber bands, a rocket launch with line-of-sight constraints, a rock kicked off a cliff, and problems involving circles. Additional problems ask students to find the value of [k] that produces exactly one solution and to write their own problems.

## Review Notes

Problem 35 references a parabola and horizontal line [y = k]. Problem 46 includes a graph and table of values. Problem 48 contains a step-by-step solution in a two-column format with "Step 1" through "Step 7" labels.`,
  },
  {
    slug: "module-12-lesson-8",
    title: "Modeling and Curve Fitting",
    description:
      "Students identify whether data is best modeled by a linear, quadratic, or exponential function by examining patterns in tables, write equations using first/second differences and ratios.",
    orderIndex: 8,
    content: `## Vocabulary

* **Linear model** — a function with constant first differences; grows by equal differences over equal intervals
* **Quadratic model** — a function with constant second differences; characterized by a² term
* **Exponential model** — a function with constant ratios; grows by equal factors over equal intervals
* **Coefficient of determination (R²)** — a value between 0 and 1 indicating how well a regression model fits data; values closer to 1 indicate a better fit
* **Scatter plot** — a graph of plotted points showing the relationship between two variables
* **Regression equation** — an equation derived from data that best fits a given pattern (linear, quadratic, or exponential)

## Explore: Identifying Model Types from Tables

When given a table of values, you can determine the model type by analyzing how the y-values change:

* **Linear**: Compute first differences [(y₂ − y₁), (y₃ − y₂), ...]. If they are constant (or nearly constant), a linear model fits.
* **Quadratic**: Compute second differences [(Δy)₂ − (Δy)₁, (Δy)₃ − (Δy)₂, ...]. If they are constant (or nearly constant), a quadratic model fits.
* **Exponential**: Compute ratios (y₂/y₁, y₃/y₂, ...). If they are constant (or nearly constant), an exponential model fits.

Inquiry Question: How can you determine whether a set of data is best modeled by a linear, quadratic, or exponential function just by looking at the patterns in a table of values?

### Example Table Analysis

| x | y | First Differences | Second Differences | Ratios |
|---|---|-------------------|---------------------|--------|
| 0 | 3 | — | — | — |
| 1 | 7 | 4 | — | 7/3 ≈ 2.33 |
| 2 | 11 | 4 | 0 | 11/7 ≈ 1.57 |
| 3 | 15 | 4 | 0 | 15/11 ≈ 1.36 |

The constant first differences (4) indicate a **linear model**: [y = 4x + 3]

## Learn: Choosing and Applying the Right Model

### Key Concept: Decision Framework

1. **Examine the context** — Does the situation suggest a particular type of growth?
   * Linear: constant rate of change (distance over time, flat fee + per unit)
   * Quadratic: acceleration or parabolic motion (height over time, area problems)
   * Exponential: growth/decay by percentage (population, radioactive decay, interest)

2. **Check the differences** — Use finite differences or ratios to confirm your hypothesis

3. **Use technology for regression** — When differences are not perfectly constant (real-world data), use a graphing calculator to find the regression equation with the highest R² value

4. **Interpret domain and range** — In context, domain is typically the range of x-values (time, age, etc.) and range is the corresponding y-values (height, population, etc.)

## Example 1 — Identify the Model Type from a Table

**Problem:** Look for a pattern in the table of values to determine which kind of model best describes the data. Then write an equation for the function that models the data.

| x | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| y | 2 | 6 | 18 | 54 | 162 |

### Step 1: Compute first differences

y₂ − y₁ = 6 − 2 = 4; y₃ − y₂ = 18 − 6 = 12; y₄ − y₃ = 54 − 18 = 36; y₅ − y₄ = 162 − 54 = 108

First differences are **not constant** (4, 12, 36, 108).

### Step 2: Compute second differences

12 − 4 = 8; 36 − 12 = 24; 108 − 36 = 72

Second differences are **not constant** (8, 24, 72).

### Step 3: Compute ratios

6 ÷ 2 = 3; 18 ÷ 6 = 3; 54 ÷ 18 = 3; 162 ÷ 54 = 3

Ratios are **constant (3)**. This indicates an **exponential model**.

### Step 4: Write the exponential equation

The general form is [y = a · b^x]. From the ratio, b = 3. Using the point (0, 2): [2 = a · 3^0 = a], so a = 2.

**Answer:** [y = 2 · 3^x]

## Example 2 — Model Data with a Quadratic Function

**Problem:** The table shows the height of a ball thrown upward at various times.

| t (seconds) | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| h (feet) | 0 | 48 | 64 | 48 | 0 |

### Step 1: Compute first differences

48 − 0 = 48; 64 − 48 = 16; 48 − 64 = −16; 0 − 48 = −48

First differences are **not constant**.

### Step 2: Compute second differences

16 − 48 = −32; −16 − 16 = −32; −48 − (−16) = −32

Second differences are **constant (−32)**. This indicates a **quadratic model**.

### Step 3: Write the quadratic equation

The general form is [h = at^2 + bt + c]. Using three points:
- t = 0: h = 0 → c = 0
- t = 1: h = 48 → a + b = 48
- t = 2: h = 64 → 4a + 2b = 64

Solving: a = −16, b = 64.

**Answer:** [h = -16t^2 + 64t] (a projectile motion model)

## Example 3 — Use Regression to Find the Best Model

**Problem:** A drone's height is recorded at various times after launch.

| Time (s) | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Height (ft) | 0 | 62 | 95 | 108 | 115 | 120 |

### Step 1: Analyze the scatter plot

Plot the points. The relationship appears to increase rapidly at first, then level off — suggesting an exponential or logarithmic model.

### Step 2: Test regression types

Use a graphing calculator to compare linear, quadratic, and exponential regression:
- **Linear regression**: R² ≈ 0.847
- **Quadratic regression**: R² ≈ 0.991
- **Exponential regression**: R² ≈ 0.953

The **quadratic model has R² closest to 1**.

### Step 3: Write the regression equation

The quadratic regression yields: [h = -4.8t^2 + 35.2t + 0.8]

R² ≈ 0.991 (99.1% of variation is explained by the model).

### Step 4: Predict at t = 7

[h = -4.8(7)^2 + 35.2(7) + 0.8 = 12]

**Answer:** Approximately 12 feet.

## Mixed Exercises

Problems 1-14 involve looking for patterns in tables of values to determine whether a linear, quadratic, or exponential model best fits, then writing an equation that models the data. Problems 15-16 involve making scatter plots, determining which regression equation has R² closest to 1, finding the appropriate regression equation and stating R², and using the regression equation to make predictions. Problems 17-19 require using a graphing calculator to determine the appropriate regression type. Additional problems address weather data, land value appreciation, boat depreciation, nuclear waste decay, two-town population data, elevator height, soccer team goals, temperature data, and various reasoning problems about function types.

## Review Notes

Graphing calculator skills are required for Examples 4 and Mixed Exercises 15-19, 23-26 to compute regression equations and R² values. Problem 23 (Nuclear Waste) connects to real-world applications of exponential decay and half-life calculations.`,
  },
  {
    slug: "module-12-lesson-9",
    title: "Combining Functions",
    description:
      "Students add and subtract functions to create new functions, multiply (compose) functions and interpret the result in context, write real-world scenarios as combined functions.",
    orderIndex: 9,
    content: `## Vocabulary

* **Combining Functions** — Adding, subtracting, or composing two or more functions to produce a new function.
* **Addition of Functions** — [(f + g)(x) = f(x) + g(x)]; the sum of the outputs of each function at the same input.
* **Subtraction of Functions** — [(f - g)(x) = f(x) - g(x)]; the difference of the outputs.
* **Composition of Functions** — [(f ∘ g)(x) = f(g(x))]; applying one function to the output of another.
* **Function Notation for Operations** — (f + g), (f - g), and (f ∘ g) denote the result of combining functions.

## Explore: What Does It Mean to Combine Functions?

When two quantities are described by separate functions, combining them lets you model total quantities, differences, or relationships where one quantity depends on another. Students consider how adding the height of two people on a seesaw differs from composing functions like "apply the square function, then double."

Inquiry Question: What does it mean when you add two functions together versus when you compose them?

## Learn: Combining Functions

### Key Concept: Adding and Subtracting Functions

When combining functions by addition or subtraction, combine like terms from each function's expression.

Given [f(x) = x - 9], [g(x) = 3x² - 2x + 5], and [h(x) = -6x]:

[(f + g)(x) = (x - 9) + (3x² - 2x + 5) = 3x² - x - 4]

[(f - g)(x) = (x - 9) - (3x² - 2x + 5) = -3x² + 3x - 14]

[(g - h)(x) = (3x² - 2x + 5) - (-6x) = 3x² + 4x + 5]

### Key Concept: Composing Functions

When composing functions [(f ∘ g)(x)], substitute the entire expression of g(x) into f(x) and simplify.

Given [f(x) = 11x], [g(x) = x² - 6x + 3], and [h(x) = -x + 4]:

[(f ∘ g)(x) = f(g(x)) = 11(x² - 6x + 3) = 11x² - 66x + 33]

[(g ∘ h)(x) = g(h(x)) = (-x + 4)² - 6(-x + 4) + 3 = x² - 2x - 5]

### Key Concept: Interpreting Combined Functions in Context

In real-world problems, combined functions represent total quantities (e.g., combined walking speed), differences (e.g., one quantity minus another), or composite relationships (e.g., cost as a function of quantity sold).

Walking speed example: If Jan's walking speed is [f(t) = 4t + 3] and a walkway speed is [g(t) = 3t + 1], then [f(t) + g(t) = 7t + 4] represents their combined speed walking on the walkway.

## Example 1 — Add and Subtract Functions

### Step 1: Identify the Functions

Given [f(x) = x - 9], [g(x) = 3x² - 2x + 5], and [h(x) = -6x].

### Step 2: Compute (f + g)(x)

[(f + g)(x) = (x - 9) + (3x² - 2x + 5) = 3x² - x - 4]

### Step 3: Compute (g - h)(x)

[(g - h)(x) = (3x² - 2x + 5) - (-6x) = 3x² + 4x + 5]

### Step 4: Interpret in Context

(f + g)(x) combines the outputs of f and g at the same input. (g - h)(x) subtracts h's output from g's output.

## Example 2 — Compose Functions

### Step 1: Identify the Inner Function

Given [f(x) = 11x] and [g(x) = x² - 6x + 3]. For (f ∘ g)(x), g(x) is the inner function.

### Step 2: Substitute g(x) into f(x)

[(f ∘ g)(x) = f(g(x)) = 11 · (x² - 6x + 3)]

### Step 3: Simplify

[= 11x² - 66x + 33]

### Step 4: Find (g ∘ f)(x) for Comparison

[(g ∘ f)(x) = g(f(x)) = (11x)² - 6(11x) + 3 = 121x² - 66x + 3]

Composition is not commutative: [(f ∘ g)(x) ≠ (g ∘ f)(x)] in general.

## Mixed Exercises

The mixed exercises section provides additional practice combining functions in increasingly complex contexts: evaluating sum and difference functions given algebraic definitions, composing functions with linear, quadratic, and exponential functions, writing functions for real-world scenarios such as membership growth for two clubs combined, ticket pricing and revenue for a magician, cost of golf rounds as a sum of fixed and per-round fees, analyzing a box-making problem (cut identical squares from corners of a 20-by-12 sheet, find the area function), modeling granola pricing and sales, analyzing a tile pattern, modeling temperature cooling, finding the area of a gravel border around a flower bed, comparing adding linear and quadratic functions versus multiplying them, determining the equation of a translated exponential function, creating and solving problems where (f - g)(x) or (f ∘ g)(x) yields a specified polynomial, analyzing whether multiplying a linear and quadratic function always produces a three-term result, finding and correcting errors in function composition, and determining which product of three functions does not belong with the others.

## Review Notes

Images referenced in the source include diagrams for a cardboard box problem, tile pattern diagrams, a temperature data table, and a flower bed diagram.`,
  },
];

function parseLessonContent(
  content: string
): Array<{
  phaseNumber: number;
  title: string;
  phaseType: "explore" | "vocabulary" | "learn" | "worked_example" | "independent_practice";
  estimatedMinutes: number;
  sections: Array<{
    sequenceOrder: number;
    sectionType: "text";
    content: { markdown: string };
  }>;
}> {
  const phases: Array<{
    phaseNumber: number;
    title: string;
    phaseType: "explore" | "vocabulary" | "learn" | "worked_example" | "independent_practice";
    estimatedMinutes: number;
    sections: Array<{
      sequenceOrder: number;
      sectionType: "text";
      content: { markdown: string };
    }>;
  }> = [];

  const sectionRegex = /^##\s+(.+)/gm;
  const matches = [...content.matchAll(sectionRegex)];

  const phaseMap: Record<
    string,
    {
      type: "explore" | "vocabulary" | "learn" | "worked_example" | "independent_practice";
      title: string;
    }
  > = {};

  for (const match of matches) {
    const header = match[1].trim();
    const key = header.toLowerCase();

    if (key.startsWith("explore")) {
      phaseMap[header] = { type: "explore", title: header };
    } else if (key === "vocabulary") {
      phaseMap[header] = { type: "vocabulary", title: header };
    } else if (key.startsWith("example")) {
      phaseMap[header] = { type: "worked_example", title: header };
    } else if (key === "mixed exercises" || key === "review notes") {
      phaseMap[header] = { type: "independent_practice", title: header };
    } else if (key.startsWith("learn")) {
      phaseMap[header] = { type: "learn", title: header };
    } else {
      phaseMap[header] = { type: "learn", title: header };
    }
  }

  const headers = matches.map((m) => m[1].trim());
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const nextHeader = headers[i + 1];
    const start = matches[i].index! + matches[i][0].length;
    const end = nextHeader
      ? content.indexOf(nextHeader)
      : content.length;
    const sectionContent = content.slice(start, end).trim();

    const phaseInfo = phaseMap[header];
    if (!phaseInfo) continue;

    phases.push({
      phaseNumber: i + 1,
      title: phaseInfo.title,
      phaseType: phaseInfo.type,
      estimatedMinutes:
        phaseInfo.type === "explore"
          ? 15
          : phaseInfo.type === "vocabulary"
            ? 10
            : phaseInfo.type === "worked_example"
              ? 12
              : phaseInfo.type === "learn"
                ? 15
                : 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text",
          content: { markdown: `## ${header}\n\n${sectionContent}` },
        },
      ],
    });
  }

  return phases;
}

export const seedModule12Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule12Result> => {
    const now = Date.now();
    const results = [];

    for (const config of lessonConfigs) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", config.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 12,
            title: config.title,
            slug: config.slug,
            description: config.description,
            orderIndex: config.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      const existingLessonVersion = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .first();

      const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
        ? existingLessonVersion._id
        : await ctx.db.insert("lesson_versions", {
            lessonId,
            version: 1,
            title: config.title,
            description: config.description,
            status: "published",
            createdAt: now,
          });

      const phaseData = parseLessonContent(config.content);

      let phasesCreated = 0;
      let activitiesCreated = 0;

      for (const phase of phaseData) {
        const existingPhase = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version_and_phase", (q) =>
            q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
          )
          .first();

        if (existingPhase) continue;

        const phaseId = await ctx.db.insert("phase_versions", {
          lessonVersionId,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          estimatedMinutes: phase.estimatedMinutes,
          phaseType: phase.phaseType,
          createdAt: now,
        });

        phasesCreated++;

        for (const section of phase.sections) {
          if (section.sectionType === "activity") {
            const activityContent = section.content as SeedActivityContent;

            const insertedActivityId = await ctx.db.insert("activities", {
              componentKey: activityContent.componentKey,
              displayName: `${phase.title} - ${activityContent.componentKey}`,
              description: `Activity for ${phase.title}`,
              props: activityContent.props as never,
              gradingConfig: { autoGrade: true, partialCredit: true },
              createdAt: now,
              updatedAt: now,
            });

            activitiesCreated++;

            await ctx.db.insert("phase_sections", {
              phaseVersionId: phaseId,
              sequenceOrder: section.sequenceOrder,
              sectionType: section.sectionType,
              content: {
                ...activityContent,
                activityId: insertedActivityId,
              },
              createdAt: now,
            });
          } else {
            await ctx.db.insert("phase_sections", {
              phaseVersionId: phaseId,
              sequenceOrder: section.sequenceOrder,
              sectionType: section.sectionType,
              content: section.content,
              createdAt: now,
            });
          }
        }
      }

      results.push({
        lessonId,
        lessonVersionId,
        slug: config.slug,
        phasesCreated,
        activitiesCreated,
      });
    }

    return { lessons: results };
  },
});
