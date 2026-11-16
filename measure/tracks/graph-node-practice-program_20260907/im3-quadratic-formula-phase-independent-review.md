# IM3 quadratic-formula PhaseRenderer independent review

## Verdict

ACCEPT the two-path PhaseRenderer change.

The change forwards the parent save result through `PhaseRenderer`. It does not give `ActivityRenderer` a save handler when the parent has no handler. The quadratic-formula activity now remains pending until the parent promise settles.

## Scope

The change has two paths:

1. `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
2. `apps/integrated-math-3/__tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx`

The production change is narrow:

- `onActivitySubmit` can return `void` or `Promise<void>`.
- `handleSubmit` returns the parent callback result.
- `ActivityRenderer` receives no `onSubmit` prop when the parent callback is absent.

No persistence, route, lesson placement, approval, graph, schema, or activity contract changes are present in this scope.

## Behavior review

The new regression renders the real `PhaseRenderer`, `ActivityRenderer`, and quadratic-formula activity chain.

The deferred rejection case proves these conditions:

- The button shows `Saving answer…` while the parent promise is pending.
- The button remains disabled while the save is pending.
- The activity does not call the completion callback before the promise settles.
- A rejected promise shows the save error.
- A rejected promise does not call the completion callback.
- Retry calls the parent save callback a second time.
- Retry uses the same frozen payload object.
- The completion callback runs only after the successful retry.
- The final button shows `Answer saved` only after success.

The missing-parent case proves that the submit button stays disabled when `PhaseRenderer` has no save callback.

The existing ActivityRenderer regression also checks the first timing-enriched envelope, deferred rejection, exact retry, and trusted identity and mode handling. The new PhaseRenderer test confirms that the parent boundary does not discard this promise.

## Test evidence

The supplied RED log is `/tmp/im3-qf-phase-red.log`.

Before the fix, both new tests failed:

- The pending button incorrectly showed `Answer saved`.
- The button stayed enabled without a parent save handler.

The supplied GREEN log is `/tmp/im3-qf-phase-green.log`.

I independently ran:

`npm test --workspace=apps/integrated-math-3 -- --run __tests__/components/lesson/PhaseRenderer.test.tsx __tests__/components/lesson/PhaseRenderer-quadratic-formula.test.tsx __tests__/components/lesson/ActivityRenderer-quadratic-formula.test.tsx`

Result: 3 files and 17 tests passed.

## Limits

This review covers the PhaseRenderer submission boundary only. The parent still owns the combined lint, build, and post-build TypeScript checks. The server route and persistence flow remain separate work.

I did not change the candidate or main.
