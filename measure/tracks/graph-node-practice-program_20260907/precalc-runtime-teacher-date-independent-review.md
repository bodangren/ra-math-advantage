# Independent teacher timestamp hydration review

Result: Accept.

Candidate: `/tmp/precalc-teacher-date-head-gjcn8q2r`

Patch: `/tmp/precalc-teacher-date.patch`

The two-path patch formats the submitted timestamp with fixed locale `en-US` and fixed timezone `UTC`. It adds the explicit visible label `UTC`. The server and browser therefore render the same text in different host timezones.

The ISO `dateTime` attribute remains unchanged. The patch does not change the stored numeric timestamp, teacher query, route, backend, schema, or submission behavior.

The regression test renders the real component to a server string with `TZ=UTC`. It hydrates that markup with `TZ=Asia/Shanghai`. It verifies that the visible value stays `9/7/2026, 10:00:00 AM UTC` and that React does not report a hydration failure.

The test restores the prior timezone correctly. If `TZ` was absent, it deletes the test value. It does not assign the string `undefined`.

Independent focused verification passes all 7 component tests. The parent report records 108 related teacher tests, app lint, app build, and standalone TypeScript as passing.

No stored data or query contract changed.
