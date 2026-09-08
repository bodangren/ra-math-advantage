# Guided check backend final review

Source commit: `02f1f36b1`.

The authenticated route derives the profile from verified student claims.
It accepts only the activity ID, discriminant field ID, and bounded raw answer.
The internal query rechecks active credentials and exact Guided authority.
It shares the existing forward and reverse item checks, private variant checks, and draft graph checks with the final writer.
Private problem regeneration is shared with final grading.
The exact parser is unchanged.
The check returns only correctness.
It writes no submission and schedules no progression.
The route uses private no-store headers and hides internal errors.

Tests failed before the query and route existed.
The final parent run passed 111 cases in six files.
The independent run passed 48 cases in three files.
These include the existing writer replay, privacy, and draft no-progression regressions.
Lint, build, and separate post-build TypeScript passed.
The independent reviewer accepts the five-path batch.
All staged files match the tested candidate.

Component callbacks, Guided field gating, stale-response tests, and browser verification remain open.
No live deployment, seed, or learner publication occurred.
The new route and tests were materialized in main.
Mixed server source working files remain intact.
