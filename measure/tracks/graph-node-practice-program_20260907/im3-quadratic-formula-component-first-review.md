# IM3 quadratic-formula component independent review

## Verdict

Reject until two asynchronous state defects are corrected.

## Required corrections

1. `ActivityRenderer` does not cache the first submission envelope when `getTiming()` returns no timing value. On a failed first request, a retry can call `getTiming()` again. If timing becomes available, the retry sends a different envelope. Cache the parsed first envelope for the original input object even when timing is absent. A regression must make the first timing read return `undefined`, make the retry timing read return a value, and assert that both calls receive the same object and no new timing.

2. A new `activityId` does not reset `QuadraticFormulaActivity`. `ActivityRenderer` creates the activity without a React `key`. The component also does not reset its answer, lock, error, saved, counter, pending, or frozen-envelope state when `activityId` changes. A renderer rerender with a new activity ID can show the prior locked result and can retain the prior retry envelope. Key the rendered activity by the trusted activity identity, or add one complete synchronous identity reset that cannot mix old state with a new submit event. Add a real `ActivityRenderer` rerender regression. Submit or fail the first activity, rerender with a different trusted activity ID, and verify blank enabled fields, zero counters, no old error or retry, and a new envelope with the new ID.

Keep the timing repair limited to the required activity behavior if possible. The current WeakMap wrapper changes callback behavior for every registered student activity. The patch report does not establish that all activity types need this new caching policy.

## Accepted parts

The public schema has strict Worked, Guided, and Independent variants. Guided and Independent reject Worked steps and private answer fields. The component shows exactly three public answer inputs and does not disclose root count.

The component emits only raw `practice.v1` answers and counters. It emits no client score or correctness. Guided hints increment per-part hint state. Edits increment per-part change state. Reveal counts remain zero because this component has no reveal control.

Input labels and help IDs are unique across mounted instances. Each input references the shared format help and its requested Guided hint. KaTeX renders the equation, Worked expressions, and input previews.

Mode mismatch fails closed before Worked content appears. Trusted renderer props override hostile activity props. No callback means no enabled submission or handler preview.

The component uses an immediate submit lock. It awaits the callback before completion. An ambiguous failure preserves the frozen raw envelope inside the component. Retry uses that object. These properties work when timing is present on the first renderer callback.

## Independent verification

The package-specific focused commands passed:

- Math-content schema: 1 file and 6 tests.
- Activity component: 1 file and 10 tests.
- IM3 registry and renderer: 2 files and 12 tests.

The current tests do not cover the two rejected transitions. The code paths directly show both state failures.

## Readiness boundary

This verdict covers the public schema, shared component, registry entry, and renderer adapter only. It does not establish server grading, persistence, student-route wiring, graph activation, or end-to-end learner readiness.
