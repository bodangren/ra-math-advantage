# Independent Topic 1.1 assistance review

Result: Accept.

Candidate: `/tmp/precalc-q37-assistance.95ayTg`

Patch: `/tmp/precalc-q37-assistance.patch`

## Contract review

The four-path patch adds one-use hint and reveal controls for each interval part in Guided Practice and Independent Practice. No hint or answer is visible before the learner requests it. A reveal displays text only. It does not fill or change the answer input.

The component records `hintsUsed`, `revealStepsSeen`, and `changedCount` for each part. Each input change affects only that part. Each assistance control affects only that part. The parent preserves these three counters with `partId` and `rawAnswer`. It removes all other client part fields before it sends the frozen submission.

The component derives reveal text from the supplied graph points. It emits each source segment by endpoint values. It uses `U` for multiple segments and `none` when no segment exists. This matches the server parser and the actual generated graph contract. It does not merge adjacent segments. It does not perform client grading.

Guided Practice retains the supplied guided steps and field help. Independent Practice uses short direction hints. Both modes keep the graph before the controls.

The first submission locks answers and assistance controls. An ambiguous failure keeps that lock. The parent retry button remains enabled. It retries the same frozen envelope and idempotency key. After success, `Start new attempt` remounts the activity and clears inputs, assistance state, counters, frozen request state, and server result state.

The component requires a nonblank value for all three parts before the first submission. Whitespace does not satisfy this condition. An incomplete attempt stays editable and does not call the parent submission handler.

An immediate ref locks submit, input-change, hint, and reveal handlers in the same event cycle. A callback that runs after the first valid submit cannot change the frozen answers or assistance counters. The ref also prevents a second same-cycle submission.

The patch adds no backend, route, schema, generator, seed, graph, approval, or dependency change.

## Verification

Independent focused runs pass:

- Interval component: 12 tests pass.
- Precalculus parent acceptance: 8 tests pass.

The report records passing backend writer and evidence-flow tests, rating tests, package lint, app lint, package TypeScript, app build, and standalone app TypeScript with all 21 workspace links resolved to candidate packages.

The one full package failure is an existing schema expectation outside these four paths. It does not concern the assistance implementation.
