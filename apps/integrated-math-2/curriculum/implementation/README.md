# Curriculum implementation records

`calendar.json` is the 180-period course plan. Run `npm run curriculum:build` from the app directory to generate it.

- `class-period-packages/unit-*.json` contains one module view of the calendar. Each file contains multiple periods.
- `practice-v1/activity-map.json` lists the 96 implemented lesson checkpoints. It uses the questions in `curriculum/questions.json`.
- `exceptions.json` records earlier source limitations. Check each item against the current source before use.

Instruction periods refer to source lesson goals and worked examples. Each period includes the six planned daily phases. These records do not implement a class-period runtime. Mastery tasks, group tasks, secure tests, and spaced review still require implementation.

Run `npm run curriculum:check` to detect stale generated files. Run `npm run curriculum:audit` to test current source files, assets, calendar counts, question data, graph inventory, and math rendering. The old stored audit report is removed. Its pass claims did not describe the current app.
