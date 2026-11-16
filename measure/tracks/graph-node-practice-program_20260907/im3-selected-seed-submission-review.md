# IM3 Selected Seed-to-Submission Test

Date: 2026-09-07

## Scope

The test runs the real `seedLesson1` mutation handler. It uses the selected physical activity rows and IDs that the seed creates. It then calls the committed `createServerOwnedSubmissionHandler`.

The current catalog remains draft. The first Independent submission fails before storage. The positive test changes only its local memory rows and publication input. It does not change the repository catalog or a live database.

## Verified behavior

- The seeded Independent activity rejects submission while its physical approval is unreviewed.
- The rejected submission creates no physical submission row.
- A test-only approved publication and approved physical activities permit Guided and Independent server grading.
- Independent seed 0 uses the literal points `(-2,-5), (-1,-2), (0,-1), (1,-2), (2,-5)`.
- Guided seed 1 uses the literal points `(-2,4), (-1,0), (0,-2), (1,-2), (2,0)`.
- Both modes receive score 2 of 2 from the server.
- An identical Independent retry returns the original physical submission ID.
- A changed response with the same idempotency key returns `idempotency_conflict`.
- The two accepted modes create two physical submission rows.
- The writer does not create learning-evidence or SRS rows.

## Limit

This test does not run the teacher exposure handler. It does not run a browser or route. It proves the seed-to-writer boundary only.
