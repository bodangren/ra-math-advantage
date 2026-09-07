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
