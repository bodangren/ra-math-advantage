# Precalculus Q18 selected writer independent review

Reviewer: graph_inventory
Date: 2026-09-08
Patch base: `dc57eb14` as assigned

## Result

Do not integrate this patch as a durable selected writer yet. The primary grading and identity boundary is sound. Five P1 defects affect submission compatibility, replay, stored answer parity, stored identity validation, and blueprint readiness. Resolve these findings before integration.

## Findings

### P1 — A valid `practice.v1` envelope can pass the route and fail the Convex validator

The route permits the standard optional envelope fields `artifact`, `interactionHistory`, `analytics`, `studentFeedback`, `teacherSummary`, and `timing` at `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts:21-36`. It passes the full object to Convex at lines 226-239.

The Convex `dataValidator` accepts only the eight required fields at `apps/pre-calculus/convex/activities.ts:50-66`. Convex object validators reject extra fields. Thus, the route accepts a valid contract payload and then returns a generic 500 response when the internal mutation rejects it.

This is relevant to the actual shared renderer. `@math-platform/activity-components` can inject `timing` into student submissions. The current interval activity does not add timing by itself, but a standard renderer wrapper can add it.

Use one consistent selected envelope shape at both boundaries. Either preserve supported optional contract fields through storage, or reject unsupported fields as a client error before Convex. Add a route-to-real-mutation test with `timing` and `interactionHistory`.

### P1 — A lost create response cannot replay after publication or activity withdrawal

The mutation checks current graph publication at `apps/pre-calculus/convex/activities.ts:214-216`. It then checks current student credentials and current physical activity approval at lines 229-266. It reads the stored idempotent submission only at lines 270-277.

A request can create a submission and lose its HTTP response. If the graph or activity is withdrawn before retry, the same create key no longer returns the stored physical submission ID. It fails before the replay lookup. This breaks the stated durable physical ID contract and can cause the client to lose the only link to the stored submission.

Read and validate an exact stored replay before current first-create publication checks. The replay must still validate learner, stable activity, mode, normalized answers, assistance, stored server grade, and physical activity ID. It must not create a new row or re-grade. Add graph-withdrawal and activity-withdrawal replay tests with unchanged row counts.

### P2 — The internal mutation accepts a malformed contract timestamp and attempt number

The Convex validator permits any number for `attemptNumber` and any string for `submittedAt` at `apps/pre-calculus/convex/activities.ts:58-59`. `canonical` does not require a positive integer or an ISO timestamp at lines 107-143. The route checks only that the timestamp is nonempty at `route.ts:99-106`. The writer discards both client values and stores server values, but it still accepts a payload that is not a valid `practice.v1` envelope.

Validate a positive integer and a canonical ISO timestamp in the mutation. Keep server time and server attempt ordinal as the stored authority. Add direct mutation tests for zero, fractional, invalid-date, and noncanonical date values.

### P2 — The route can return success with an empty physical submission ID

`projectSubmissionResult` checks only that `submissionId` is a string at `route.ts:168-184`. An empty string passes and produces HTTP 200. The next evidence layer cannot use this receipt.

Require a nonempty trimmed opaque ID. Add a route dependency test that returns an empty or whitespace ID and verify a controlled server error without internal details.

### P2 — The create key is validated after trimming but stored without trimming

The route accepts a trimmed key at `route.ts:163-166`, but it passes the original header value. The mutation also tests `args.idempotencyKey.trim()` but queries and stores the untrimmed value at `activities.ts:223-228,270-276,368`. Therefore, `"key"` and `" key "` create different submissions even though validation treats both as the same nonempty key.

Canonicalize the key once. Use the canonical value for lookup and storage. Add a whitespace replay test.

## Content prerequisite finding

The excluded grader at `apps/pre-calculus/lib/practice/topic11-interval-graph.ts:29-67` parses both `(a,b)` and `[a,b]` into the same numeric tuple. It then ignores endpoint delimiter type. The generator stores intervals as numeric pairs and formats square brackets in its solution at `packages/math-content/src/knowledge-space/generators/topic11-interval-graph.ts:101-148`.

This means the grader cannot enforce an open, closed, or course-specific endpoint convention. Do not claim exact interval-notation grading until the content review selects a convention and the grader represents it. This is a grader prerequisite. It is not a reason to add endpoint logic to this writer patch.

The generator and grader are also required build dependencies. They remain absent from HEAD and are excluded from this patch, as the author report states.

## Verified behavior

- The route derives `userId` from the authenticated student session. It rejects browser authority and grade fields.
- The mutation verifies an active credential that matches profile ID, username, role, and organization.
- The mutation verifies the selected stable activity ID, exact mode, component key, node props, variant seed, display content, approval, and current graph publication.
- The client supplies only raw answers and assistance counts. The server generator and grader produce all correctness fields and aggregate scores.
- Stored submissions use the physical Convex activity ID, stable activity ID, server timestamp, server attempt ordinal, canonical answers, canonical part grades, and server feedback.
- The replay comparison ignores part order and client timestamp or attempt claims. It rejects changed normalized answers, changed assistance, a different physical activity, and corrupt stored grades.
- Guided and Independent use different stable IDs and fixed seeds. This patch does not create learning evidence, teacher exposure, or SRS effects.

## Test limitation

The focused writer tests use a memory database and mocked approved graph catalogs. This correctly proves the writer mechanics under a hypothetical approved state. It does not prove the excluded generator and grader are integrated in HEAD. The route tests inject a fake `createSubmission` function and do not exercise the real route-to-Convex validator shape. Add the focused end-to-end boundary case described above.

## Additional replay and publication findings

### P1 — The writer stores different canonical answers in the answer map and part records

`canonical` normalizes each top-level answer at `apps/pre-calculus/convex/activities.ts:137-143`. It keeps each part `rawAnswer` in its original form at lines 155-191. The insert builds `gradedParts` with `{ ...part, ...submitted.parts.get(part.partId) }` at lines 349-352. The second spread overwrites the grader's normalized `rawAnswer` with the original client text.

The stored `submissionData.answers` is canonical, but the matching stored part can contain different whitespace or Unicode minus characters. This breaks the stored answer-to-part parity that the inbound boundary enforces. It also makes later consumers choose between two representations.

Store one canonical raw answer in both locations. Preserve assistance fields separately. Add a test with spaces and a Unicode minus sign. Assert exact equality between each stored answer and matching stored part `rawAnswer`.

### P1 — Replay accepts corrupted stored envelope identity and duplicate parts

The replay branch checks the stored mode but does not check stored `contractVersion`, `status`, `submissionData.activityId`, stored answer-to-part raw parity, or unique part IDs at `apps/pre-calculus/convex/activities.ts:278-330`. `telemetryMatches` and `gradeMatches` use `every`. A corrupt three-part array can repeat one correctly graded part ID and omit another. The top-level answer map can still match the retry, so the writer returns the corrupt row as a valid replay.

Validate the complete stored canonical envelope before replay. Require the exact contract, graded status, stable activity ID, three unique expected part IDs, canonical raw parity, assistance, grades, aggregate grade, and physical activity ID. Add corruption tests for a duplicate part ID, missing part ID, wrong stored stable activity string in `submissionData.activityId`, wrong status, wrong contract version, and part raw answer mismatch.

### P1 — The publication predicate accepts an approved source-only blueprint

`isPrecalculusPilotPublished` checks only node kind/status and blueprint status at `apps/pre-calculus/convex/activities.ts:22-37`. The positive test fixture at `apps/pre-calculus/__tests__/convex/selected-topic11-submission-writer.test.ts:3-24` supplies an approved blueprint with only `nodeId` and `reviewStatus`. It has no selected Guided or Independent specification.

The current graph lifecycle permits source-only blueprints only while they are draft and inactive. An accidental approved source-only row must not activate a writer. Require the selected authored mode definitions that the physical Guided and Independent activities implement, or require the existing selected publication projection that proves these modes are active. Do not infer readiness from `reviewStatus` alone. Add a negative approved source-only fixture and a positive complete selected blueprint fixture.

## Parent scope decision

All five P1 findings require repair and regression tests before integration. The current patch remains outside committed runtime code.

The interval pilot accepts parentheses and square brackets as documented monotonic-interval conventions. It does not assess exact set-notation endpoint membership. Do not add stricter endpoint grading to the writer. The content prerequisite must state this scope.

Idempotency keys are opaque. Distinct strings do not require normalization unless the existing contract defines that rule. Reject empty keys. Preserve exact key identity unless contract evidence requires a change.

Validate client timestamp and attempt fields against the existing practice.v1 contract. Keep server time and attempt ordinal authoritative. Do not impose a stricter date format without a contract requirement. A successful route response must contain a nonempty physical submission ID.

The author prepares the selected generator and grader as a separate prerequisite. That patch must pass source review before the writer can compile and run from committed files. The later stored-evidence and SRS transaction remains open under Q18.

## Repaired writer review — 2026-09-08

### Result

The repaired patch resolves several original defects. Three P1 validation groups remain. Do not accept it yet.

### P1 — The mode publication check still accepts placeholder content

`isPrecalculusPilotPublished` checks shallow object presence at `apps/pre-calculus/convex/activities.ts:31-70`. It accepts an empty `scaffoldedPrompt`, arbitrary `stepPrompts` items, arbitrary hints, Guided renderer props with only the presentation mode, empty Independent `variantParameters`, empty `answerSchema`, any three grading rules, Independent renderer props with only the presentation mode, and an empty `gradingSpec`.

The positive test fixture demonstrates this gap at `apps/pre-calculus/__tests__/convex/selected-topic11-submission-writer.test.ts:13-47`. Its `gradingSpec.partIds` is empty. Its renderer props have no source geometry. Its mode specifications do not establish the exact three part rules or the selected seed behavior. This fixture passes publication.

An approved placeholder blueprint can therefore activate both physical writers. Require the exact selected mode contract from the current reviewed blueprint: renderer key and mode map, nonempty Guided instructions and field help, seed-0 Guided geometry, seed-2 Independent geometry, the three exact answer fields and custom one-point grading rules, generator key, and the matching three-part grading specification. A reusable existing schema can validate the renderer props if its dependency direction permits it. Do not add a new registry.

Add negative fixtures for empty strings, empty answer schema, wrong part IDs, wrong rule type or score, empty grading spec, and wrong seed geometry. Add one positive fixture copied from the selected reviewed blueprint shape.

### P1 — Replay does not validate the full stored envelope

The replay branch validates the three expected part rows and several identity fields at `apps/pre-calculus/convex/activities.ts:322-380`. It does not require the stored answer map to have exactly the three expected keys. An extra stored answer key survives replay because lines 369-371 iterate only the new answer entries.

It also does not validate the stored `submittedAt` field or any stored optional contract field. It does not compare `artifact`, `interactionHistory`, `analytics`, `studentFeedback`, `teacherSummary`, or `timing` from the retry with the stored payload. A changed retry under the same create key is accepted. Corrupt stored optional data is also returned as a valid replay.

Require exact stored answer keys and a valid server ISO timestamp. Define whether optional contract fields are part of create idempotency. The existing “one create key, one semantic request” rule indicates that they are. Compare their canonical stored values with the retry, or reject them from this selected writer if they are not part of its contract. Add tests for an extra stored answer, invalid stored timestamp, changed retry timing or interaction history, and corrupt stored optional fields.

The replay also checks only that `existing.activityId` is a nonempty string at lines 359-362. If the selected physical activity still exists, require this ID to match it. If the activity was removed, preserve replay through the stored stable identity and validated envelope. Add a test that changes the stored physical ID to another existing activity and verify conflict.

### Resolved original P1 findings

- The route and Convex validator now accept the same optional top-level fields. The writer preserves them.
- Authentication runs before replay. Exact stored replay can return after graph and activity withdrawal without new writes.
- The writer stores the same normalized answer in the answer map and matching graded part.
- Replay now rejects wrong contract version, mode, status, stable activity string, duplicate or missing expected parts, raw-answer mismatch, assistance mismatch, part-grade mismatch, aggregate-grade corruption, and attempt corruption.
- An approved blueprint with a missing Guided specification is rejected. The remaining publication issue is exact content validation, as described above.

### Parent scope decisions accepted

The writer stores server time and server attempt ordinal. It validates that the client attempt is positive and integral and that the client timestamp is parseable. The create key remains an exact opaque string. Surrounding spaces are not normalized into another key. The route rejects an empty physical result ID.

### P1 — Optional `practice.v1` fields are accepted as arbitrary values and the test bypasses Convex validation

The mutation declares all six optional fields as `v.any()` at `apps/pre-calculus/convex/activities.ts:99-104`. `canonical` copies them without validating the existing `practice.v1` schemas at lines 256-267. The route checks only their key names. It does not validate their values.

The new optional-field test calls the mutation `_handler` directly. This bypasses Convex argument validation. It then checks source text for field names. It does not exercise the real route-to-Convex validator boundary.

Its `timing: { elapsedMs: 1200 }` fixture is not a valid `PracticeTimingSummary`. The existing practice-core schema requires the standard timing fields such as `startedAt`, `submittedAt`, `wallClockMs`, and `activeMs`. The patch therefore proves storage of an invented timing shape, not parity with the real contract.

Reuse the existing `practice.v1` schema for optional field validation where the package boundary permits it. Otherwise, mirror its exact selected field validators. Use a valid timing fixture. Add malformed timing and malformed optional-field rejection tests before storage. Exercise the exported Convex mutation argument validator or a real route-to-mutation adapter path instead of only `_handler` plus source-text assertions.

## Parent durability clarification

Validate the stored physical activity ID for the activities table. If its original referenced row still exists, verify its selected identity, props, and rubric without requiring current approval. A deleted source row must not discard an otherwise valid durable submission. Do not compare the old reference with a replacement row found by stable ID. Do not add a tombstone or provenance system.

Validate the stored envelope with the existing practice.v1 schema and exact selected answer keys, grades, and server timestamp consistency. Define which optional fields affect semantic retry identity. Preserve original stored telemetry. A retry must not overwrite it.

## Repaired writer revision 2 review — 2026-09-08

### Result

Do not integrate revision 2 yet. It resolves the optional-field input boundary and the durable replay order. Two P1 trust-boundary defects remain.

### Resolved — optional input fields use the shared contract

`canonical` now calls `PracticeSubmissionEnvelopeSchema.safeParse` before it accepts the selected envelope at `apps/pre-calculus/convex/activities.ts:223-229`. The route-to-writer test uses a valid `PracticeTimingSummary` at `selected-topic11-submission-writer.test.ts:600-638`. The malformed timing, analytics, and student feedback cases reach the real writer and leave the submission table empty at lines 662-689. This resolves the prior optional-field input-validation finding. The Convex argument validator still uses `v.any` for these optional fields, but the writer validates them before storage.

The accepted idempotency policy is also implemented. A retry can supply different optional telemetry. The writer returns the first receipt and does not overwrite the first stored telemetry. The optional fields do not define semantic create identity.

### Resolved — replay is independent of current publication

The writer authenticates the learner before the idempotency lookup. It processes an exact stored replay before the current publication and current activity approval checks at `activities.ts:371-479`. The tests preserve one row and the original physical submission ID after graph withdrawal, activity withdrawal, replacement, and deletion at `selected-topic11-submission-writer.test.ts:513-556`.

If the original physical activity row still exists, the writer checks its exact selected identity at `activities.ts:402-447`. If that row no longer exists, the writer can return the durable receipt. This matches the assigned replay policy.

### P1 — publication still accepts malformed selected mode specifications

The publication predicate compares both selected geometries with the committed generator. It also checks the three part IDs. These checks are necessary, but they do not validate the complete selected contract.

Concrete approved malformed blueprints still return `true`:

- `guidedPracticeSpec.rendererProps.guidedSteps` can contain a number or an empty string. The predicate checks only that the array is nonempty at `activities.ts:98-100`.
- `guidedPracticeSpec.rendererProps.fieldHelp` can be `{}` or contain unrelated keys. The predicate checks only that it is a record at line 100.
- `independentPracticeSpec.variantParameters` can be `{}`. The predicate checks only that it is a record at line 103.
- Each `answerSchema` value can be an arbitrary value. The predicate checks only the three keys at lines 104-106.
- Each grading rule can use the correct `partId` with an invalid `ruleType` or `maxScore`. Lines 107-115 do not check either field.
- The rubric can repeat one valid part ID three times. Lines 124-131 check membership and points, but do not require unique rubric IDs or exact set equality.

The test at lines 242-265 covers an empty prompt, one wrong point, empty grading part IDs, and wrong rule IDs. It does not cover the malformed cases above. An approved placeholder can therefore activate the selected writer even when the renderer, answer, or grading contract is not usable.

Use exact manual checks for the selected fields because the interval schema is absent from HEAD. Require nonempty string Guided steps, the exact three nonempty `fieldHelp` keys, the selected seed variant definition, the three answer-schema string values, three unique `custom` grading rules with `maxScore: 1`, and three unique one-point rubric rows. Add one negative fixture for each boundary.

### P1 — replay does not validate the full stored envelope

The author report says replay validates the stored practice contract. The code validates selected required fields, parts, grade totals, and server timestamp consistency. It does not validate the complete stored envelope.

Concrete corrupt stored rows still replay:

- `submissionData.answers` can contain an extra key. Lines 458-461 compare only the retry's three keys.
- `submissionData` can contain an extra top-level key. The replay branch has no exact-key check.
- A stored optional field can have an invalid shared-contract shape, such as `timing: { wallClockMs: -1 }`, `analytics: "bad"`, or `studentFeedback: { private: true }`. `PracticeSubmissionEnvelopeSchema.safeParse` runs only on the retry at lines 223-229. It never runs on `stored`.

These corrupt rows can pass all conditions at lines 442-469 and return a successful receipt. The current corruption tests cover required identity, status, duplicate or missing parts, raw-answer parity, grade data, attempt data, and the server timestamp. They do not cover exact stored keys or malformed stored optional fields.

Validate the stored object with the shared envelope schema. Also require the exact selected top-level and answer key sets because the shared Zod objects are not strict. Keep the current explicit checks for graded status, canonical parts, server grades, server timestamp, and physical identity. Add corrupt stored fixtures for an extra answer key, an extra top-level key, malformed timing, and malformed analytics or feedback.

### Verification assessment

The reported 40 passing tests, lint, TypeScript check, and build show that the patch compiles and preserves the tested paths. They do not cover the two malformed-data counterexamples above. The patch is not ready for integration until those two boundaries fail closed.

### Independent counterexample result

The parent ran five direct counterexamples in `/tmp/precalc-q18-parent-v2-red.log`. All five requests resolved when they had to reject. The accepted corrupt cases were a stored extra answer, invalid stored timing, wrong blueprint `ruleType`, `maxScore: 99`, and duplicate rubric IDs. The fixtures are in `/tmp/precalc-q18-parent-v2-extra-tests.txt`.

These Red results confirm both P1 findings. Revision 2 must not be accepted on its reported Green suite. Revision 3 must add the missing exact publication checks and stored-envelope validation. It must keep the resolved route validation and durable replay behavior.

## Repaired writer revision 3 review — 2026-09-08

### Result

Do not integrate revision 3 yet. It makes the parent five Red cases Green. It still does not enforce the full selected publication contract or the exact stored selected envelope.

### Resolved in revision 3

- The publication predicate rejects a wrong grading `ruleType`, a wrong `maxScore`, and duplicate rubric part IDs.
- It requires the exact Guided prompt, step prompts, hints, checks, reveal policy, field help, and seed-0 geometry.
- It requires string answer-schema values, the three selected rule IDs, the replay policy, seed-2 geometry, the passing score, partial credit, and exact rubric criteria.
- Replay validates the stored object with `PracticeSubmissionEnvelopeSchema` and requires the exact three answer keys.
- The five parent regression cases now have direct tests at `selected-topic11-submission-writer.test.ts:746-813`.
- Authentication, server grading, canonical answer-to-part storage, immutable first optional telemetry, withdrawal replay, deletion replay, and existing-original-activity identity checks remain intact.

### P1 — the Independent variant definition is still not validated

The author report says that the predicate requires the exact selected mode content. The actual predicate only requires `independentPracticeSpec.variantParameters` to be a record at `apps/pre-calculus/convex/activities.ts:127-129`.

The pending selected blueprint defines this exact variant contract:

```json
{
  "seed": {
    "type": "integer",
    "min": 0,
    "description": "Deterministic Topic 1.1 interval graph variant seed"
  }
}
```

An approved blueprint with `variantParameters: {}` or an unrelated record still activates the writer. This is the same concrete placeholder boundary that revision 2 left open. Revision 3 has no negative fixture for it.

Compare `variantParameters` with the exact selected object. Add negative fixtures for `{}`, a non-integer seed type, and a negative minimum. This is a manual selected check. It does not require a new schema or registry.

### P1 — shared schema parsing is not exact stored-envelope validation

Replay calls `PracticeSubmissionEnvelopeSchema.safeParse(stored)` at `activities.ts:447-449`. The shared Zod object is not strict. It accepts and strips unknown keys during parsing. The replay branch then reads the original `stored` object and has no exact top-level key check.

Thus, these corrupt stored rows still replay:

- `submissionData.unexpected = true`
- a selected part with an extra shared-schema field, such as `misconceptionTags: ["corrupt"]`

The selected writer never creates either field. Both values pass the shared envelope schema. The explicit replay conditions at lines 483-513 do not reject them. The report claim that replay validates the complete exact selected envelope is therefore incorrect.

Require the exact selected top-level key set. Account for the six supported optional fields only when each field is present. Require the exact selected stored part key set: `partId`, `rawAnswer`, the three assistance counters, and the three server grade fields. Keep the shared schema validation for optional value shapes. Add corrupt stored fixtures for an extra top-level key and an extra part field.

### Evidence assessment

The reported 45 tests, lint, TypeScript check, and build show that revision 3 preserves the tested behavior. The five former Red cases are now covered. The suite does not test the two remaining counterexamples. Revision 3 is not ready for integration.

## Parent revision 3 verification

The parent ran the selected writer, route, and grader tests in an isolated candidate. All 45 tests passed. App lint, a fresh build, and standalone TypeScript with local source mappings passed.

The parent then added three direct regression cases. Each request resolved when it had to reject: empty variant parameters, an extra stored top-level field, and unowned stored part metadata. The three Red results confirm the two remaining findings. Revision 3 remains outside runtime integration. Revision 4 must repair these cases and preserve the existing positive behavior.

Logs: `/tmp/precalc-q18-writer-v3-parent-tests.log`, `/tmp/precalc-q18-writer-v3-parent-lint.log`, `/tmp/precalc-q18-writer-v3-parent-build.log`, `/tmp/precalc-q18-writer-v3-parent-tsc.log`, and `/tmp/precalc-q18-parent-v3-red.log`.

## Selected writer revision 4 review — 2026-09-08

### Result

Do not integrate revision 4 yet. The frozen parent patch and author patch are byte-identical by direct comparison.

Revision 4 resolves both revision 3 counterexamples. One P1 publication and concealment gap remains.

### Resolved in revision 4

- `variantParameters` now equals the pending selected seed contract at `apps/pre-calculus/convex/activities.ts:153-154`.
- Stored replay uses the shared envelope schema and a selected top-level key allowlist at lines 473-476.
- Each stored part must have the exact selected stored key set at lines 485-510.
- Tests reject empty, unrelated, wrong-type, and negative-minimum variant contracts at `selected-topic11-submission-writer.test.ts:847-915`.
- Tests reject unexpected stored top-level fields and unowned part metadata at lines 821-846.
- Authentication occurs before replay. Server grading, canonical storage, immutable optional telemetry, physical receipt identity, withdrawal replay, deletion replay, and existing-original-activity validation remain correct.

### P1 — the publication check permits fields that violate the renderer contract

The predicate compares selected renderer values, but it does not enforce selected renderer key sets. `matchesGeometry` checks only `domain`, `changePoints`, and `points` at `activities.ts:111-118`. The surrounding conditions check the prompt, mode, Guided steps, and field help. They do not reject extra renderer fields.

This approved Independent specification still passes publication:

```ts
independentPracticeSpec.rendererProps.correctAnswer = {
  increasingIntervals: "[0,2]",
  decreasingIntervals: "[4,8]",
  constantIntervals: "[2,4]",
};
```

An equivalent `answers`, `solution`, or `finalAnswer` field also passes the publication predicate. The existing strict `intervalClassificationSchema` rejects extra fields. Thus, the publication predicate can activate a blueprint that the intended renderer contract rejects.

The current component destructures known fields and does not render these extra values. The review did not prove visible answer exposure in that component. The delivery boundary must still exclude answer-bearing fields. It must not depend on component destructuring to enforce Independent concealment.

The positive test fixture also omits the selected renderer `title` fields that exist in the pending source blueprint. It is therefore not an exact copy of the pending selected renderer contract. The report's claim that the gate requires exact selected mode specifications is too broad.

Use manual exact key sets for the selected Guided and Independent renderer props because the renderer schema is absent from HEAD. Match the pending source blueprint fields. At minimum, reject all extra Independent renderer keys and test `correctAnswer`, `answers`, and `finalAnswer`. Add the real selected titles to the positive fixture and exact check if title is part of the renderer contract.

### Verification assessment

The reported 51 tests, lint, TypeScript check, and build support all fixed writer and replay boundaries. They do not test an answer-bearing extra renderer field. Revision 4 is not ready until Independent concealment fails closed at publication.

## Selected writer revision 5 review — 2026-09-08

### Result

Accept revision 5 for the selected Topic 1.1 submission writer scope.

### Evidence

The v5 delta adds exact renderer property key checks for Guided and Independent specifications. The key sets match the pending Topic 1.1 source blueprint:

- Guided: `title`, `prompt`, `domain`, `changePoints`, `points`, `presentationMode`, `guidedSteps`, and `fieldHelp`.
- Independent: `title`, `prompt`, `domain`, `changePoints`, `points`, and `presentationMode`.

The predicate also requires the exact source titles. The positive fixture now contains those titles. The fixture matches the pending selected blueprint for all fields used by the publication predicate.

The three new tests add `correctAnswer`, `answers`, and `finalAnswer` to Independent renderer properties. The parent Red log at `/tmp/precalc-q18-parent-v5-red.log` proves that v4 accepted all three invalid specifications. The v5 exact key check rejects them.

This resolves the final v4 finding. The previous checks remain present for exact mode content, generator geometry, variant parameters, answer schema, grading rules, rubric, stored envelope keys, stored part keys, canonical server grades, active learner authentication, and durable replay.

The current graph blueprint remains draft and source-only. The writer stays closed until the complete selected blueprint and node are approved through the separate curriculum process. This review does not approve that curriculum content.

### Scope boundary

Revision 5 adds the physical submission writer and authenticated create route only. It does not create learning evidence or SRS effects. Those effects require the separately reviewed opaque-submission evidence transaction and trusted teacher-exposure prerequisite.
