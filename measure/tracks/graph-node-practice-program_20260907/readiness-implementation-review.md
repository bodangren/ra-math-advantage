# IM3 readiness implementation review

Date: 2026-09-07

## Finding

### R1. The parent handler loses the `nearly_ready` state

Severity: High

The canonical student handler can put an approved node in `progress.nearlyReady`. See `convex/student/knowledge_state.ts`, lines 142-150. The parent handler rebuilds `learnerState` from `mastered`, `ready`, `blocked`, and `reviewDue`. It does not copy `progress.nearlyReady`. See `convex/parent/visualization.ts`, lines 116-121.

The parent projection then treats the omitted node as `unknown`. The shared projection includes an unknown node in `recommendedNext` when it does not receive `knowledgeState`. See `packages/knowledge-space-practice/src/projections/visualization.ts`, lines 210-213. Thus, the parent can recommend a node that the canonical student handler classifies as `nearly_ready`.

Add `nearly_ready` to the parent handler's local state type. Copy `progress.nearlyReady` into `learnerState`. Add a behavioral test with an approved prerequisite path that produces `nearly_ready`. Assert that the parent result does not use that target as `nextFocus`.

Author response on 2026-09-07: The current working tree now copies `progress.nearlyReady` as `nearly_ready`. The parent payload helper accepts that state. `graph-readiness-boundary-consumers.test.ts` supplies an approved nearly-ready node through the canonical student result and verifies that the parent keeps `nextFocus` at `Continue current practice`. The focused and related readiness run passed 43 tests in 6 files. Application lint and TypeScript checks also passed. Independent review must confirm resolution.

## Verified behavior

- The readiness projector admits approved skill nodes only.
- A draft or reviewed prerequisite edge quarantines its approved target.
- An approved edge with a missing or unapproved source quarantines its approved target.
- Quarantine propagates through approved descendant edges.
- A rejected edge does not define a prerequisite. Therefore, it does not prevent an approved node from being a root.
- The projector returns approved prerequisite edges only. Both student handlers and the parent handler use these filtered edges.
- The canonical student handler computes the outer fringe from the readiness graph.
- Historical mastered and review-due evidence can add an isolated candidate node for display. This operation does not restore its edges. Therefore, it does not make the node eligible.
- The legacy placement handler adds only mastered historical nodes. Ready and blocked candidate placements remain hidden.
- The parent handler receives the canonical student result. It then uses the same readiness projector and the same isolated-history helper.

## Test assessment

The new helper tests cover true approved roots, candidate prerequisite edges, malformed prerequisites, descendant quarantine, closed approved paths, and isolated history.

The new consumer tests now cover these behaviors:

- The main handler displays real historical mastery and later review-due state.
- The main handler changes an approved target from blocked to ready after prerequisite mastery.
- The legacy handler does not recommend a draft target.
- The legacy handler displays mastered draft history.
- The parent handler applies the empty current readiness boundary.
- The parent handler displays mastered draft history without recommendation.

Add the parent `nearly_ready` parity test described in R1. A parent review-due history test would also give direct coverage of the existing review-due copy branch.

## Verification

The focused test command passed:

`npm run test --workspace=apps/integrated-math-3 -- --run __tests__/lib/curriculum/graph-readiness-boundary.test.ts __tests__/convex/graph-readiness-boundary-consumers.test.ts`

Result: 2 test files passed. All 13 tests passed.

An initial repository-level test command started the workspace quality runner. I stopped it because it did not apply the requested file filter. It ended with exit code 130 after the interrupt.

## Integration owner verification

The parent reviewed the corrected parent handler and its behavioral test. The handler preserves `nearly_ready` from the canonical student output. The test uses an approved graph and checks that this state is not selected as `nextFocus`. Both new readiness suites pass: 14 tests. This resolves the reported omission. Full curriculum approval remains open.
