# Lesson 3-13 — Trigonometry and Polar Coordinates

Unit: 3
Topic: 3.13
AP Exam: assessed-on-ap-exam

## Explore

### Section: text

A ship is 5 miles from a harbor at an angle of [pi/3] from due east. You could describe this as the rectangular point [(2.5, 4.33)], but that obscures the natural description: 5 miles, angle [pi/3]. A polar coordinate system uses distance and angle directly. How do you convert between these two systems, and why can a single point have infinitely many polar representations?

## Vocabulary

### Section: text

- **Polar coordinates** [(r, theta)]: A point defined by radius [r] (distance from origin) and angle [theta] (in standard position). The same point has many representations.
- **Rectangular coordinates** [(x, y)]: The familiar Cartesian system. Connected to polar by [x = rcos(theta)], [y = rsin(theta)].
- **Polar-to-rectangular formulas**: [x = rcos(theta)], [y = rsin(theta)].
- **Rectangular-to-polar formulas**: [r^2 = x^2 + y^2], [tan(theta) = y/x].
- **Polar form of a complex number**: [r(cos(theta) + i sin(theta)] where [(r, theta)] are the polar coordinates of [(a, b)] for [a + bi].

## Learn

### Section: text

In polar coordinates, a point [A] is defined by [(r, theta)] where [r] is the radius of the circle on which [A] lies and [theta] is the angle in standard position whose terminal ray includes [A].

**Key insight**: The same point can be represented many different ways. The point [(5, pi/2)] can also be written as [(5, 5pi/2)], [(-5, 3pi/2)], or [(-5, -pi/2)].

**Conversion formulas:**

Polar to rectangular:
\[ x = rcos(theta), quad y = rsin(theta) \]

Rectangular to polar:
\[ r^2 = x^2 + y^2, quad tan(theta) = frac{y}{x} \]

**Tip**: Always sketch the point first and check that your answer makes sense. When computing [theta] from [tan(theta) = y/x], check the quadrant — [arctan] only gives angles in [(-pi/2, pi/2)].

**Complex numbers**: The rectangular form [a + bi] corresponds to the point [(a, b)]. Its polar form is [r(cos(theta) + i sin(theta))]. For example, [-2 - 2i] has [r = sqrt{8} = 2sqrt{2}] and [theta = 5pi/4], giving [2sqrt{2}(cos(5pi/4) + i sin(5pi/4))].

## Worked Example

### Section: text

**Example 1:** Convert [(5, 4pi/3)] to rectangular coordinates.

**Solution:**
- [x = 5cos(4pi/3) = 5 cdot (-1/2) = -5/2]
- [y = 5sin(4pi/3) = 5 cdot (-sqrt{3}/2) = -5sqrt{3}/2]
- Rectangular: [(-5/2, -5sqrt{3}/2)]

**Example 2:** Convert [(2, -2)] to polar coordinates.

**Solution:**
- [r = sqrt{4 + 4} = sqrt{8} = 2sqrt{2}]
- [tan(theta) = -2/2 = -1]. Point is in QIV, so [theta = -pi/4] (or [7pi/4])
- Polar: [(2sqrt{2}, -pi/4)]

**Example 3:** Convert [(-1, sqrt{3})] to polar coordinates.

**Solution:**
- [r = sqrt{1 + 3} = 2]
- [tan(theta) = sqrt{3}/(-1) = -sqrt{3}]. Point is in QII, so [theta = 2pi/3]
- Polar: [(2, 2pi/3)]

**Example 4:** Write two different polar representations for [(5, pi/2)].

**Solution:**
- Original: [(5, pi/2)]
- Add [2pi]: [(5, 5pi/2)]
- Negate [r], add [pi]: [(-5, 3pi/2)]

## Guided Practice

### Section: text

**Problem 1:** Convert [(2, pi)] to rectangular coordinates.

**Hint:** Use [x = 2cos(pi)] and [y = 2sin(pi)].

**Problem 2:** Convert [(7, -pi/2)] to rectangular coordinates.

**Hint:** What is [sin(-pi/2)]?

**Problem 3:** Convert [(0, -5)] to polar coordinates.

**Hint:** This point is on the negative [y]-axis. What angle does that correspond to?

## Independent Practice

### Section: text

**Problem 1:** Convert to rectangular:
- [(2, pi)]
- [(7, -pi/2)]

**Problem 2:** Convert to polar (give [r > 0] and [0 leq theta < 2pi]):
- [(2, -2)]
- [(-1, sqrt{3})]

**Problem 3:** Write the complex number [3 + 2i] in polar form [r(cos(theta) + i sin(theta))].

**Hint:** Find [r = sqrt{a^2 + b^2}] and [theta] from the point [(3, 2)].

**Problem 4:** Convert [7(cos(7pi/6) + i sin(7pi/6))] to rectangular form [a + bi].

## Reflection

### Section: text

**Exit Ticket:** Convert [(5, pi/3)] to rectangular coordinates. Convert [(-3, 3)] to polar coordinates.

**Lesson Summary:** Polar coordinates [(r, theta)] describe points by distance and angle. Conversion uses [x = rcos(theta)], [y = rsin(theta)] for polar-to-rectangular and [r^2 = x^2 + y^2], [tan(theta) = y/x] for rectangular-to-polar. A single point has infinitely many polar representations. When converting, always sketch the point and verify the quadrant. Complex numbers connect naturally: [a + bi rightarrow r(cos(theta) + i sin(theta))].
