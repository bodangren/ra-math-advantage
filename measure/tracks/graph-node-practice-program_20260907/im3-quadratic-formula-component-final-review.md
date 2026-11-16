# IM3 quadratic-formula component final independent review

## Verdict

Accept the corrected 18-path component batch.

The strict public schema keeps mode-specific fields. Guided and Independent props cannot contain Worked steps or private answer fields. The UI has the fixed `discriminant`, `x1`, and `x2` fields. It does not disclose root count. It submits raw `practice.v1` answers and per-part counters without client grades.

Labels and help IDs are unique. Inputs reference the format help and requested Guided help. KaTeX renders equations, Worked expressions, and previews. A mode mismatch fails closed. Trusted activity ID, mode, and callbacks override activity props.

The component uses an immediate lock and awaits asynchronous completion. A failed request retains one frozen envelope and telemetry for retry. `ActivityRenderer` now caches the first quadratic envelope even when timing is unavailable. The retry receives the same object and does not call the timing source again.

The renderer keys the quadratic activity by trusted activity ID and mode. A new identity remounts the component. The regression verifies that prior answers clear and the submit control returns. This also discards the old lock, error, counters, and frozen retry state through the remount boundary.

The timing cache and remount behavior are limited to the quadratic component. Existing registry-count expectations were updated explicitly in five tests.

Independent focused results:

- Math-content schema: 1 file and 6 tests passed.
- Activity component: 1 file and 10 tests passed.
- IM3 registry and renderer: 2 files and 14 tests passed.

This verdict covers the public helper, component, registry, and renderer boundary. It does not establish server writer integration, learner routing, persistence, or end-to-end student-flow readiness.
