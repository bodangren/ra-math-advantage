# Lesson 1.6 source catalog review

Source commit: `508b59c40`.

The batch restores examples .036 through .038 from native PDF pages 43 and 44.
It changes three existing records in each of five catalogs.
It adds one source regression test.
The stable IDs, draft status, record order, prior source references, and unrelated data remain intact.
Only .036 includes contextual interpretation.
Parent and independent reviewers accept the final six paths.
All staged file contents match the accepted candidate.

Parent and independent focused tests passed seven cases.
Application lint, build, and separate TypeScript passed.
These checks do not establish practice readiness or source approval.
Examples .039 and .040 and the printed Checks remain outside this batch.

## Source issue for the next review

The Check on native page 43 states that the diving board is 10 feet high.
Its equation uses a height of 10 and defines height in meters.
The source therefore has inconsistent units.
A later contextual activity must resolve this issue explicitly before approval.
Do not silently change the source record.

## Working state

The new test is materialized in main.
The five mixed graph working files remain intact.
Only main is registered as a Git worktree.
The current IM3 candidate remains in use for receipt work.
