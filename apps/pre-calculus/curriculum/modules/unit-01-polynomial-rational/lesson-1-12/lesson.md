# Lesson 1-12 — Transformations of Functions

Unit: 1
Topic: 1.12
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

If [f(3) = 5], what is [g(3)] when [g(x) = 2f(x) - 1]? What about [g(3)] when [g(x) = f(x + 2)]? Each transformation shifts, stretches, or reflects the graph of [f]. Today we develop a systematic table of transformations and learn how they affect domain, range, and graph behavior.

## Vocabulary

### Section: text

- **Vertical translation** — [g(x) = f(x) + k] shifts the graph up [k] units (down if [k < 0]).
- **Horizontal translation** — [g(x) = f(x + h)] shifts the graph left [h] units (right if [h < 0]).
- **Vertical dilation** — [g(x) = a · f(x)] stretches the graph by factor [|a|] vertically.
- **Horizontal dilation** — [g(x) = f(bx)] compresses the graph by factor [|1/b|] horizontally.
- **Reflection** — If [a < 0], reflect over the x-axis. If [b < 0], reflect over the y-axis.

## Learn

### Section: text

**EK 1.12.A.1:** [g(x) = f(x) + k] produces a vertical translation of [k] units. [g(x) = f(x + h)] produces a horizontal translation of [-h] units.

**EK 1.12.A.2:** [g(x) = a · f(x)] produces a vertical dilation by [|a|]. If [a < 0], reflect over the x-axis. [g(x) = f(bx)] produces a horizontal dilation by [|1/b|]. If [b < 0], reflect over the y-axis.

**EK 1.12.A.3:** Transformations affect domain and range. Horizontal dilations scale the domain; vertical dilations scale the range. Translations shift both.

### Transformation Order

Apply transformations in this order:
1. **Horizontal:** translate (shift by [-h]), then dilate/reflect (scale by [1/b])
2. **Vertical:** dilate/reflect (scale by [a]), then translate (shift by [k])

The general form: [g(x) = a · f(bx + c) + d].

### Mapping Points

A point [(p, q)] on [f] maps to [(p/b - c/b, aq + d)] on [g].

## Worked Example

### Section: text

**Example 1:** Let [g(x) = 2f(x - 1) + 3]. Given that [f] has domain [[-4, 6]] and range [[-2, 5]]:

- **Domain of [g]:** [x - 1 ∈ [-4, 6]] → [x ∈ [-3, 7]].
- **Range of [g]:** [2 · [-2, 5] + 3 = [-4, 10] + 3 = [-1, 13]].
- **Point mapping:** [(4, 2)] on [f] → [(4 + 1, 2 · 2 + 3) = (5, 7)] on [g].
- **Find [g(0)]:** [g(0) = 2f(-1) + 3].

**Example 2:** [f(x) = -2(x + 3)²(x - 1)]. Let [g(x) = f(-x)].

[g(x) = -2(-x + 3)²(-x - 1)].

Zeros: [-x + 3 = 0] gives [x = 3]; [-x - 1 = 0] gives [x = -1].

**Example 3:** [p] is cubic with table: [p(-2) = 1, p(0) = -1, p(2) = 0, p(4) = 3, p(6) = 7]. Let [m(x) = -3p(x + 4)].

- Zero of [m]: [p(x + 4) = 0] when [x + 4 = 2], so [x = -2].
- Average rate of change of [m] over [[0, 2]]: [m(0) = -3p(4) = -9], [m(2) = -3p(6) = -21]. AROC = [(-21 - (-9)) / (2 - 0) = -6].

## Guided Practice

### Section: text

**Problem 1:** [f] has domain [[-6, 9]] and range [[-8, 10)], increasing on [[-6, 1]] and [[5, 9)], decreasing on [[1, 5]]. Find the domain and range of [q(x) = 4 - 2n(5 - x)].
*Hint:* For domain: [5 - x ∈ [-6, 9]]. For range: apply dilation by [-2] then translation by [4].

**Problem 2:** Let [g(x) = 2f(x/2) - 3]. Given the table [f(-5) = 7, f(0) = 2, f(5) = -1], find [g(-10)] and [g(0)].
*Hint:* [g(-10) = 2f(-10/2) - 3 = 2f(-5) - 3].

**Problem 3:** Describe the transformation from [f] to [g] if [g(x) = -f(2x + 4) + 1].
*Hint:* Rewrite as [g(x) = -f(2(x + 2)) + 1]. Horizontal shift left 2, horizontal compression by 1/2, reflection over x-axis, vertical shift up 1.

## Independent Practice

### Section: text

**Problem 1:** If [f] has domain [[-3, 5]] and range [[0, 8]], find the domain and range of [g(x) = -2f(x - 1) + 3].

**Problem 2:** The graph of [f] consists of two line segments and a semicircle on [[-4, 3]]. Sketch [g(x) = ½f(x + 2) + 5] by mapping key points.

**Problem 3:** Which equation transforms [f] to [g] if [g] is [f] shifted right 2 and down 1? Options: [g(x) = f(x - 2) - 1], [f(x + 2) - 1], [f(x - 2) + 1], [f(x + 2) + 1].

## Reflection

### Section: text

**Exit Ticket:** If [f] has domain [[-3, 5]] and range [[0, 8]], find the domain and range of [g(x) = -2f(x - 1) + 3].

**Lesson Summary:** Transformations shift, stretch, compress, and reflect function graphs. Horizontal transformations act on the input (inside the function); vertical transformations act on the output (outside). Always track how domain and range change, and map key points to verify your transformed graph.
