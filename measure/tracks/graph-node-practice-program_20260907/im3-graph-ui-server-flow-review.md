# IM3 graph UI-to-server flow review

## Scope

This review covers the exact graph pilot for `math.im3.skill.1.1.graph-quadratic-functions`.

The test uses the current Graphing Explorer activity component.
It sends the component envelope to `createServerOwnedSubmissionHandler`.
It uses a test-only approved node, blueprint, and seeded activity.
It does not change production publication data.

## Result

The current UI and server contracts agree.

The UI sends `table_values` and `placed_points`.
The server accepts these snake_case keys.
The UI does not send a client grade.
The server grades both response parts.
The server stores the raw response and the server grade.

The literal equation is `y = -x^2 - 1`.
The test calculates these values without an expected-answer generator:

- `(-2, -5)`
- `(-1, -2)`
- `(0, -1)`
- `(1, -2)`
- `(2, -5)`

A correct table with the wrong point `(0, 0)` gets `1/2`.
A correct table with all five correct points gets `2/2`.
The stored parts contain the exact UI response and the server grade for each part.

## Test database behavior

The test database makes `unique()` fail when a query returns multiple rows.
The test database applies descending order before `first()`, `collect()`, and `take()`.
These behaviors match the required Convex query contracts for this flow.

## Disposition

No production defect was found after the snake_case UI fix.
No production file changed in this review.

The focused run passed nine tests in three files.
The existing component test printed React `act()` warnings.
The warnings are outside the new test.
