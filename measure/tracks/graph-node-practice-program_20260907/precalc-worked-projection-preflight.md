# Q24 Topic 1.1 Worked projection preflight

## Result

Q24 can add a query that returns only the selected Worked source. The query must keep the accepted Q19 graph publication contract.

In this contract, `Worked-only` describes the query result and the physical activity lookup. It does not mean that the Worked graph specification has an independent approval path.

The accepted `isTopic11WorkedSourcePublished` predicate requires all of these items on one approved selected blueprint:

- the approved selected skill node;
- the complete approved Guided specification;
- the complete approved Independent specification;
- the selected generator and grading contract;
- `rendererModeMap.worked === "interval-classification"`;
- the exact `workedExampleSpec`.

This behavior is explicit in `precalc-selected-teacher-backend-combined-review.md`. The review states that `isTopic11WorkedSourcePublished` filters for the Worked specification and then reuses `isPrecalculusPilotPublished`. Q19 tests require missing or changed Worked content to fail. The Q19 acknowledgement and first teacher delivery use this combined predicate.

Do not create a weaker Worked graph predicate in Q24. Such a predicate would let the learner see and acknowledge content that the Q19 writer rejects.

## Contract distinction

The existing `getApprovedPrecalculusPilot` query is broader at the storage boundary. It requires three approved physical activity rows and returns three modes.

The new Worked projection must require only the one selected Worked physical row. It can return that row when the selected graph blueprint satisfies the full Q19 combined publication contract, even when a Guided or Independent physical database row is absent or unapproved.

This is the valid independence boundary:

- Graph publication remains the combined Worked, Guided, and Independent blueprint contract.
- Physical publication is independent for the Worked row.
- The query returns one Worked item only.

The accepted delivery plan says that `getApprovedPrecalculusPilot` is broader than the Q19 Worked acknowledgement contract. This statement applies to its three-row storage requirement and its three-mode result. It does not override the accepted combined graph predicate.

## Current consumer defects

### Lesson page

`app/student/lessons/[topic]/page.tsx` renders `PrecalculusTopic11DailyCurriculumPilot` when a raw lesson section has the selected component key. It passes no stable ID or props.

The component then creates browser fallback content with `generateTopic11IntervalGraph(0)`. This bypasses the physical projection. A stale, unreviewed, withdrawn, or mismatched source section can therefore show an answer and an acknowledgement action.

The lesson result already includes each raw phase section from `course.getLesson`. The page type hides `content.activityId`, but the runtime row retains it. Q24 only needs to add that field to the local type. `course.getLesson` does not need a change.

### Dashboard

`app/student/dashboard/page.tsx` gets Worked, Guided, and Independent items from `getApprovedPrecalculusPilot`. The complete three-row storage gate can hide a valid Worked physical source when one practice row is unavailable.

The dashboard must get the Worked item from the new query. It must keep Guided and Independent items on the existing broad query. Q24 must not change teacher-first learner-state rules. Those rules remain Integration 4 work.

### Component fallback

`PrecalculusTopic11DailyCurriculumPilot` accepts missing props and a missing stable ID. It generates a complete Worked answer in the browser.

Remove this fallback in Q24. Make `stableActivityId` and `activityProps` required. This change makes the projection an enforced caller boundary. The acknowledgement route and writer remain the final authority.

## Minimum backend change

Add one internal query beside `getApprovedPrecalculusPilot`:

`getApprovedTopic11WorkedSource`

Return `null` or this exact public object:

```ts
{
  activityId: Id<"activities">;
  stableActivityId: string;
  nodeId: string;
  componentKey: string;
  mode: "worked_example";
  props: IntervalClassificationProps;
}
```

Do not return approval records, grading configuration, target answers outside the Worked presentation props, database timestamps, or blueprint metadata.

The handler must complete these checks in this order:

1. Call `isTopic11WorkedSourcePublished(publication)`. Return `null` on failure.
2. Resolve exactly one selected blueprint and its exact `workedExampleSpec`. Reject an ambiguous selected blueprint set.
3. Read the physical row through `activities.by_stable_activity_id`. Use `collect()` and return `null` unless exactly one row exists. The current `unique()` call throws on duplicate rows. A query that promises `null` on ambiguity must handle the count explicitly.
4. Require `approval.status === "approved"`.
5. Reuse the Q19 exact physical identity predicate. Do not duplicate its display name, description, props, or grading values.
6. Resolve the exact Unit 1, Topic 1.1 lesson through `lessons.by_unit_and_order`. Use `unique()`.
7. Reuse and correct the Q19 current published lesson and phase-link predicate at the query time.
8. Return `workedExampleSpec.rendererProps` from the verified blueprint. Do not call the generator. Do not use stored activity props as display props. Do not use a hard-coded browser fallback.

The exact Q19 physical predicate is currently private. Export it with a narrow name, such as `hasTopic11SourceActivityIdentity`. Do not change its comparisons.

`hasCurrentTopic11Source` currently accepts `MutationCtx`, but it only uses `ctx.db`. Change its context type to `Pick<QueryCtx, "db">` or an equivalent union that accepts both `QueryCtx` and `MutationCtx`.

The current helper checks `phaseType === "worked_example"`, but it does not require phase number 4 or section sequence 2. Q22 established exact ownership at phase 4, sequence 2. Add these two checks to the existing helper. Do not add a second lesson comparator. Add mutation and query regressions so the stricter shared helper protects Q19 and Q24.

Select the highest published version. A newer draft version does not withdraw the current published version. Reject duplicate rows for the highest published version. Require the exact source link in that current published version.

The query-time call can pass `Date.now()` as the availability time. This does not replace the acknowledgement timestamp checks in the mutation.

## Minimum caller change

### Lesson page

For Topic 1.1, fetch `getApprovedTopic11WorkedSource` with the lesson query.

Render the Worked component only when all values match:

- the raw section is an activity section;
- `section.content.activityId === projection.activityId`;
- `section.content.componentKey === projection.componentKey`;
- `projection.stableActivityId` is the selected Worked stable ID;
- `projection.nodeId` is the selected node;
- `projection.mode === "worked_example"`.

Pass `projection.stableActivityId` and `projection.props` to the component.

When a raw selected section exists but the projection is `null` or mismatched, show the established unavailable text. Do not render the component or its acknowledgement button.

### Dashboard

Fetch the new Worked projection separately. Continue to use `getApprovedPrecalculusPilot` for Guided and Independent.

Do not take the Worked item from the broad result. Pass the new projection props and stable ID to the component.

### Component

Require both props. Delete `generateTopic11IntervalGraph` and the generated fallback object from this component. Keep the existing durable POST and retry behavior unchanged.

## Exact files

Minimum production files:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/app/student/lessons/[topic]/page.tsx`
- `apps/pre-calculus/app/student/dashboard/page.tsx`
- `apps/pre-calculus/components/student/PrecalculusTopic11DailyCurriculumPilot.tsx`

Minimum new tests:

- one selected Worked projection test;
- one seed-to-projection-to-lesson composition test;
- one dashboard projection split test;
- one component test that proves required projected props and no fallback.

Do not change `convex/course.ts`, the schema, an index, the seed, the acknowledgement route, or the acknowledgement writer for Q24.

## Required tests

### Predicate and projection

Use a complete hypothetical approved publication fixture. Do not edit the real draft catalog.

Verify these cases:

1. Missing or changed Worked specification returns `null`.
2. Missing or changed Guided or Independent specification returns `null`. This preserves Q19 combined publication.
3. An unreviewed Worked physical row returns `null`.
4. An exact approved Worked row returns the exact `workedExampleSpec.rendererProps`.
5. Missing Guided or Independent physical rows do not block the Worked result.
6. Changed stable ID, component, display name, description, props, grading, node, or mode returns `null`.
7. A draft node or blueprint returns `null`.
8. No published version, duplicate highest published versions, or a source link that exists only in an older published version returns `null`. A newer draft version does not hide the current published version.
9. A wrong phase type, physical section ID, component key, sequence, or duplicate link returns `null`.

### Real producer-to-consumer composition

Use the real `seedLesson1_1` handler and a table-aware database harness.

1. Run the real seed.
2. Call the real projection with the current draft publication and unreviewed physical row. Expect `null`.
3. Apply a hypothetical approved publication fixture and approve only the selected Worked physical row in the test database.
4. Call the real projection. Expect the physical ID from the seed and the exact Worked props from the verified blueprint.
5. Call the real `course.getLesson` handler. Use its actual phase section without rebuilding the content.
6. Pass both real query results through the actual lesson page transport seam.
7. Render the actual `PrecalculusTopic11DailyCurriculumPilot` and verify the exact graph, explanation, final answer, stable activity ID, and acknowledgement action.
8. Change the section physical ID or component key. Verify that the page shows the unavailable state and renders no answer or action.
9. Withdraw physical or graph approval. Verify the same fail-closed result.

This test can mock authentication and the Convex transport. It must not mock the seed, projection handler, lesson handler, component, or interval renderer.

### Dashboard split

Verify that the dashboard uses the selected Worked query for Worked content and the existing broad query for Guided and Independent content. A valid Worked physical row must not depend on the presence of the two practice physical rows. Guided and Independent must retain their existing broad storage gate.

## Contract contradiction to record

The delivery plan uses `Worked-only` in two possible senses. The accepted Q19 reports resolve the ambiguity:

- Do not require all three physical rows to project Worked content.
- Continue to require the complete selected blueprint, including Guided, Independent, and Worked specifications.

If the product now requires independent graph publication for Worked content, that is a Q19 contract change. It needs an explicit decision and new acknowledgement and teacher tests. Q24 must not make that change implicitly.

## Remaining limits

Q24 does not make the current source available. The graph node and blueprint remain draft. The seed physical activity remains unreviewed.

Q24 does not implement learner delivery state. Until Integration 4 is complete, the dashboard can still show Guided and Independent content without the trusted teacher-state UI gate when their existing broad publication succeeds. The server evidence boundary remains authoritative.
