# Lesson 4-2 — Parametric Functions Modeling Planar Motion

Unit: 4
Topic: 4.2
AP Exam: not-assessed-on-ap-exam

## Explore

### Section: text

A soccer ball is kicked across a field. At time [t] seconds, its position is [x(t) = 20t] horizontally and [y(t) = -16t^2 + 30t] vertically. Where is the ball after 1 second? When does it land? Parametric equations let us model two-dimensional motion by tracking horizontal and vertical components independently.

## Vocabulary

### Section: text

- **Planar motion**: Movement in a two-dimensional plane, described by separate horizontal and vertical components.
- **Position function**: A parametric function [(x(t), y(t))] that gives the location of an object at time [t].
- **Domain restriction on the parameter**: Limiting [t] to a meaningful interval (e.g., [t geq 0] or [0 leq t leq T]) to reflect physical constraints.
- **Projectile motion**: A special case where horizontal velocity is constant and vertical motion is governed by gravity.

## Learn

### Section: text

Parametric functions are natural tools for modeling **planar motion** because they separate horizontal and vertical behavior:

\[ x(t) = x_0 + v_x t, \quad y(t) = y_0 + v_y t + frac{1}{2}at^2 \]

- [x_0, y_0] = initial position
- [v_x, v_y] = initial velocities
- [a] = acceleration (for gravity, [a = -32] ft/s² or [a = -9.8] m/s²)

**Horizontal motion** is typically linear (no air resistance). **Vertical motion** is typically quadratic (gravity acts downward).

**Finding when the object lands**: Set [y(t) = 0] and solve for [t] (taking the positive solution). Then substitute into [x(t)] to find the landing position.

**Key constraint**: The domain of [t] should reflect reality — time starts at [t = 0] and ends when the object lands or the motion stops.

## Worked Example

### Section: text

**Example:** A ball is launched from the origin with [x(t) = 12t] and [y(t) = -16t^2 + 20t].

**(a)** Where is the ball at [t = 1]?
- [x(1) = 12(1) = 12]
- [y(1) = -16(1)^2 + 20(1) = 4]
- Position: [(12, 4)]

**(b)** When does the ball land?
Set [y(t) = 0]:
\[ -16t^2 + 20t = 0 \implies t(-16t + 20) = 0 \implies t = 0 text{ or } t = frac{20}{16} = 1.25 \text{ seconds} \]

**(c)** Where does it land?
[x(1.25) = 12(1.25) = 15]. The ball lands at [(15, 0)].

## Guided Practice

### Section: text

**Problem 1:** A projectile has [x(t) = 8t] and [y(t) = -16t^2 + 24t]. Find its position at [t = 0.5].

**Hint:** Substitute [t = 0.5] into both equations.

**Problem 2:** For the projectile in Problem 1, when does it land and where?

**Hint:** Set [y(t) = 0] and solve. Then evaluate [x] at that time.

## Independent Practice

### Section: text

**Problem 1:** A model rocket has [x(t) = 6t] and [y(t) = -16t^2 + 48t]. Find its maximum height and the time at which it occurs.

**Problem 2:** A ball is thrown from position [(2, 5)] with [x(t) = 2 + 10t] and [y(t) = 5 - 16t^2 + 8t]. When does the ball hit the ground ([y = 0])?

**Problem 3:** Two objects move with [x_1(t) = 3t, y_1(t) = 4t] and [x_2(t) = 12 - 3t, y_2(t) = 8t]. At what time and position do they meet?

## Reflection

### Section: text

**Exit Ticket:** For [x(t) = 15t] and [y(t) = -16t^2 + 30t], find the landing position of the projectile.

**Lesson Summary:** Parametric equations model planar motion by treating horizontal and vertical components separately. Horizontal motion is typically linear; vertical motion is quadratic when gravity is involved. Landing occurs when [y(t) = 0].
