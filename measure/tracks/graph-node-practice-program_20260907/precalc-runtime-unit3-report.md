# Precalculus Q37 unit 3 report

## Result

The isolated HEAD candidate now provides the selected Topic 1.1 learner read model.

- Base: `250a4167`
- Candidate: `/tmp/precalc-q37-unit3-head-20260908`
- Patch: `/tmp/precalc-q37-unit3.patch`

The patch changes two files. It does not edit main.

## Production change

`convex/activities.ts` now exports three internal read contracts:

- `getApprovedPrecalculusPilot`
- `getApprovedTopic11WorkedSource`
- `getTopic11LearnerDeliveryState`

The broad pilot query returns the three selected modes only after exact graph publication and approved physical activity checks. It regenerates browser-safe props. The Independent result has no answer, hint, or solution field.

The Worked query requires the exact reviewed Worked blueprint and one exact approved physical activity. It requires one current published lesson version, one Phase 4 Worked row, one sequence 2 occupant, and one selected activity link across all phases. The selected link and sequence occupant must be the same row.

The Worked query also requires finite nonnegative physical creation and approval times. Approval cannot occur before physical creation or after the current query time.

The source-layout helper now uses `QueryCtx` database access. The existing acknowledgement and teacher handlers continue to use the same helper. Duplicate Worked phases, occupied sequence rows, and cross-phase links now fail closed for reads and writes.

The learner-state query validates the active student credential. It accepts only the exact ungraded acknowledgement for the exact learner and physical activity. It returns `needs_acknowledgement`, `awaiting_teacher_confirmation`, or `ready_for_practice`. Only the exact same-submission teacher confirmation unlocks practice. The query does not write evidence or SRS state.

All registered queries use object form with argument and return validators. Existing indexes satisfy every read. The generated API declaration does not need a change because it already imports the complete `activities` module.

## TDD evidence

The Red run used the backend publication and projection tests before the new handlers existed. It failed on missing query exports and the old source-layout behavior. The old direct-submission fixture also exposed an unrelated assumption that publication validation occurs before identity validation. I did not reorder authentication or writer validation to satisfy that fixture.

I extended the existing real acknowledgement and teacher handler fixture. The final backend matrix covers:

- exact Worked projection
- duplicate Phase 4 rejection
- future physical creation rejection
- negative approval time rejection
- approval-before-creation rejection
- acknowledgement-to-teacher delivery-state transitions
- approved three-mode projection
- Independent answer concealment
- no SRS writes during learner-state reads
- current draft publication returning `null` or an empty list without reads that write state
- inactive, wrong-role, wrong-organization, and wrong-profile credentials
- future and damaged acknowledgements
- future approval and publication metadata while the query clock is earlier
- stale acknowledgements that predate currently valid approval or publication
- teacher history with the wrong learner, node, activity, submission key, ordinal, or occurrence time
- a valid acknowledgement beyond 150 damaged rows
- duplicate physical rows and duplicate current versions
- occupied sequence 2 and cross-phase selected links
- tampered physical component, props, and grading

I corrected the existing large-row fixture to use an actual Phase 4 identity and unique sequence orders. This preserves its no-fixed-cap test under the accepted source-layout contract.

## Verification

Seven focused backend, route, writer, and evidence files passed 151 tests.

The updated teacher backend file passed 67 tests.

These gates passed:

- `npm run lint`
- fresh `npm run build`
- post-build standalone TypeScript with candidate-source mappings for `@math-platform/practice-core`

The build emitted the existing vinext middleware warning and route-classification notice.

Exact focused command:

`npm test -- --run __tests__/convex/topic11-selected-teacher-backend.test.ts __tests__/convex/selected-topic11-submission-writer.test.ts __tests__/convex/selected-topic11-writer-evidence-flow.test.ts __tests__/convex/selected-topic11-evidence.test.ts __tests__/convex/learning-evidence.test.ts __tests__/app/api/learning-evidence/precalculus-pilot/production-route.test.ts __tests__/app/api/learning-evidence/precalculus-pilot/runtime-reference.test.ts`

Evidence logs:

- `/tmp/precalc-q37-unit3-final-tests.log`
- `/tmp/precalc-q37-unit3-final-lint.log`
- `/tmp/precalc-q37-unit3-final-build.log`
- `/tmp/precalc-q37-unit3-final-tsc.log`


## Limits

The current graph remains draft, so production reads remain closed.

This unit does not add the course query, learner page, acknowledgement route, student components, teacher candidate query, teacher route, or teacher UI. Those are later integration units.

The patch preserves the HEAD fingerprint contract. It adds no hash, registry, table, dependency, approval, deployment, or live write.
