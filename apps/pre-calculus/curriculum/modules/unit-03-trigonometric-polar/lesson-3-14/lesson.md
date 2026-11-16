# Lesson 3-14 — Polar Function Graphs

Unit: 3
Topic: 3.14
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

In rectangular coordinates, $y = 3\sin(3x)$ produces a wave. But in polar coordinates, $r = 3\sin(3\theta)$ traces a **rose curve** with three petals. The same trig function produces a completely different shape when the output is a radius instead of a height. How do polar functions behave, and how can you identify which graph matches an equation without sketching it by hand?

## Vocabulary

### Section: text

- **Polar function** $r = f(\theta)$: The input is $\theta$ (angle), the output is $r$ (signed radius). The graph is traced in the polar coordinate system.
- **Rose curve**: A polar graph of $r = a \sin(n\theta)$ or $r = a \cos(n\theta)$. Has $n$ petals if $n$ is odd, $2n$ petals if $n$ is even.
- **Limaçon**: A polar graph of $r = a + bsin(\theta)$ or $r = a + bcos(\theta)$. May have an inner loop, a dimple, or be convex depending on $|a|$ vs $|b|$.
- **Domain restriction**: Limiting $\theta$ to a sub-interval of $[0, 2\pi]$ — only part of the full polar graph is drawn.

## Learn

### Section: text

For polar functions, $\theta$ is the independent variable and $r$ is the dependent variable. The graph of $r = f(\theta)$ is drawn by plotting points $(r, \theta)$ in the polar system.

**Key AP exam fact**: Polar functions appear **only in multiple choice** on the AP Precalculus exam. You will **not** be asked to sketch by hand. The strategy is to **evaluate at several $\theta$ values** and match to a graph.

**Common polar curve types:**
- **Rose curves** $r = a \sin(n\theta)$ or $r = a \cos(n\theta)$: $n$ petals if $n$ is odd, $2n$ petals if $n$ is even
- **Limaçons** $r = a + bsin(\theta)$: inner loop if $|b| > |a|$, a cardioid if $|b| = |a|$, a dimple if $|b| < |a| < 2|b|$, convex if $|a| ≥ 2|b|$
- **Circles** $r = a$: constant radius
- **Spirals** $r = \theta$: radius grows with angle

**Negative $r$**: When $r < 0$, the point plots in the **opposite direction** — on the ray through the origin in the direction of $\theta + \pi$.

**Domain restriction**: If the domain is restricted to a sub-interval, only a **portion** of the full curve appears. Matching requires evaluating at endpoints and key interior points.

**Symmetry**: Polar functions commonly display symmetry about the polar axis, the line $\theta = \pi/2$, or the origin.

## Worked Example

### Section: text

**Example 1:** $f(\theta) = 3\sin(3\theta)$ for $0 \leq \theta \leq 2\pi$. How many petals?

**Solution:**
- $n = 3$ is odd, so the rose has **3 petals**.
- Maximum $r = 3$ when $\sin(3\theta) = 1$, i.e., $3\theta = \pi/2 \rightarrow \theta = \pi/6$.

**Example 2:** A graph shows a rose with 8 petals. Which equation fits?

**Solution:**
- 8 petals means $2n = 8$, so $n = 4$ (even).
- Equation: $r = a\sin(4\theta)$ or $r = a\cos(4\theta)$ for some amplitude $a$.
- Evaluate at $\theta = 0$ to distinguish sin vs cos: $a\cos(0) = a$ (nonzero), $a\sin(0) = 0$.

**Example 3:** The graph is a limaçon with an inner loop. Which could be $f(\theta)$?

**Solution:**
- Inner loop means $|b| > |a|$ in $r = a + bsin(\theta)$.
- Options like $2 + 4\sin(\theta)$ or $2 - 4\sin(\theta)$ qualify; $4 + 2\sin(\theta)$ does not (no loop).
- Check whether the loop is on the positive or negative axis by evaluating at $\theta = \pi/2$.

**Example 4:** $f(\theta) = 6\cos(3\theta)$ on $[2\pi/3, \pi]$. Which piece of the full rose remains?

**Solution:**
- Full rose: 3 petals. Evaluate at endpoints $\theta = 2\pi/3$ and $\theta = \pi$.
- $f(2\pi/3) = 6\cos(2\pi) = 6$, $f(\pi) = 6\cos(3\pi) = -6$.
- At $\theta=5\pi/6$, $r=0$. From $2\pi/3$ to $5\pi/6$, the curve travels from $(-3,3\sqrt3)$ to the origin along one half of the upper-left petal.
- From $5\pi/6$ to $\pi$, the radius is negative. The plotted direction is $\theta+\pi$. This traces the lower half of the right petal from the origin to $(6,0)$.

## Guided Practice

### Section: text

**Problem 1:** If $r = 3\cos(2\theta)$, what is $r$ when $\theta = 0$? When $\theta = \pi/4$? When $\theta = \pi/2$?

**Hint:** Evaluate $\cos(2\theta)$ at each angle using exact unit circle values.

**Problem 2:** How many petals does $r = 6\sin(4\theta)$ have?

**Hint:** Is $n = 4$ odd or even?

**Problem 3:** A graph shows a cardioid (limaçon with no inner loop) with the loop on the positive $x$-axis. Which fits: $2 + 2\cos(\theta)$ or $2 - 2\cos(\theta)$?

**Hint:** Evaluate both at $\theta = 0$ and $\theta = \pi$.

## Independent Practice

### Section: text

**Problem 1:** Match each equation to its graph type:
- $r = -3\sin(3\theta)$
- $r = 1 + 2\sin(\theta)$
- $r = 6\cos(4\theta)$
- $r = \theta$ (for $0 \leq \theta \leq 3\pi/2$)

**Problem 2:** $f(\theta) = 6\cos(2\theta)$ on $[0, 2\pi]$. If the domain is restricted to $[\pi/2, \pi]$, which portion of the rose remains?

**Problem 3:** $f(\theta) = 6\sin(2\theta)$ on $[0, 2\pi]$. Domain restricted to $[3\pi/4, \pi]$. Describe which petal portion is drawn.

**Hint:** Evaluate $f$ at $3\pi/4$, $7\pi/8$, and $\pi$ to trace the curve.

## Reflection

### Section: text

**Exit Ticket:** The graph of $r = a\cos(3\theta)$ for $0 \leq \theta \leq 2\pi$ is a rose with how many petals? How does changing to $a\sin(3\theta)$ affect the graph?

**Lesson Summary:** Polar functions map $\theta$ to $r$. Rose curves $r = a\sin(n\theta)$ or $a\cos(n\theta)$ have $n$ or $2n$ petals. Limaçons $r = a + bsin(\theta)$ may loop, dimple, or bulge. On the AP exam, evaluate at key angles to match equations to graphs — you never need to sketch from scratch. Domain restrictions show only a portion of the full curve. Negative $r$ values plot in the opposite direction.
