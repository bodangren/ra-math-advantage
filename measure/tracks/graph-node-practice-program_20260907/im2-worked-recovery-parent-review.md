# IM2 Worked recovery parent verification

The frozen three-path patch passes parent verification in `/tmp/im3-lesson18-recovery-v6l3h06f`.

The query reads at most two canonical Lesson 1.4 records. It returns no triangle activities when that source is missing or duplicated. A valid newest Worked acknowledgement removes that activity from the returned sequence. The shared stored-row check validates its learner, activity, lesson, ordinal, time, empty envelope, and request counters. Exact retries preserve the physical row. New acknowledgements store the canonical lesson ID.

The expanded tests cover both Worked activities, malformed same-key and new-key history, exact lesson binding, saved graded state after Worked omission, and the real writer receipt in the teacher projection.

Parent checks:

- Full IM2 suite: 357 tests passed in 52 files.
- Lint: passed.
- Build: passed.
- Separate post-build TypeScript: passed.
- The patch applies to the current index.
- All three scoped main files match HEAD before integration.

Logs are `/tmp/im2-worked-parent-tests.log`, `/tmp/im2-worked-parent-lint.log`, `/tmp/im2-worked-parent-build.log`, and `/tmp/im2-worked-parent-ts.log`.

Independent review passed 44 focused tests and exact patch reconstruction. Source integration is committed as `1afc2b7b5`. Every staged byte matched the tested candidate. All three main paths now match the commit. Native execution has not occurred. This repair does not establish graph readiness or full course coverage.
