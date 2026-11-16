# Q37 Teacher Date Hydration Diagnosis

## Result

The teacher dashboard has a real hydration defect. The normal Asia/Shanghai browser reproduced it against the retained local candidate.

The server rendered `9/8/2026, 12:49:37 PM`. The browser rendered `9/8/2026, 8:49:37 PM` for the same timestamp. React reported a hydration mismatch and regenerated the client tree. The local development error overlay then intercepted the teacher confirmation control.

Evidence is in:

- `/tmp/precalc-q37-unit7-local-bo06gg5_/unit7-teacher-hydration-mismatch.json`
- `/tmp/precalc-q37-unit7-local-bo06gg5_/unit7-teacher-hydration-mismatch.png`

The proof used an authenticated teacher session and browser timezone `Asia/Shanghai`. It did not change database state.

## Cause

`Topic11ExposureForm` is a Client Component. The server also pre-renders it.

This line formats the same timestamp in the timezone of each runtime:

`new Date(submittedAt).toLocaleString()`

The server process formats the value in UTC. The browser formats the value in Asia/Shanghai. The visible text therefore differs during hydration. The `dateTime` attribute is stable because it uses `toISOString()`.

The defect is in:

`apps/pre-calculus/components/course/Topic11ExposureForm.tsx`

The dashboard page passes the correct numeric timestamp. The query result and database value do not cause the mismatch.

## Minimum fix proposal

Change the visible timestamp formatter to specify a locale and timezone. Keep the ISO `dateTime` attribute.

A minimum expression is:

`new Date(submittedAt).toLocaleString('en-US', { timeZone: 'UTC' })`

Add `UTC` to the visible label so the teacher knows which timezone the page uses. For example:

`Submitted: 9/8/2026, 12:49:37 PM UTC`

This fix makes server and browser output deterministic. It does not add a dependency or change stored data.

Use two paths:

- `apps/pre-calculus/components/course/Topic11ExposureForm.tsx`
- `apps/pre-calculus/__tests__/components/course/Topic11ExposureForm.test.tsx`

Write the test first. Render server markup with one process timezone. Hydrate it with an Asia/Shanghai timezone. Assert that React does not report a hydration mismatch. Also assert the exact ISO `dateTime` attribute and the explicit `UTC` label.

No backend, schema, route, query, fixture, or date-storage change is required.

## Scope

I did not edit the live candidate or the main workspace. I preserved all learner and teacher state. The backend and frontend remain live.
