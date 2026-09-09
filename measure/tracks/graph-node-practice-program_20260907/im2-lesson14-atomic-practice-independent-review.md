# IM2 Lesson 1.4 atomic practice independent review

## Decision

Rejected.

The focused test command passes 49 tests in eight files. The implementation still has material contract defects. The reported full IM2 run also has one unresolved calendar test failure. Do not integrate this freeze.

## Blocking findings

### 1. Worked triangle activities call the perpendicular mutation

`TriangleOrderingPractice.tsx:4` sends the legacy `rawResponse` body for a Worked triangle activity. The route selects the mutation only from the presence of `answers` at `submissions/route.ts:19`. It therefore sends the Worked triangle request to `submitPerpendicularBisectorPilot`.

That mutation accepts only the perpendicular activity identity. A Worked triangle cannot save its acknowledgement or advance.

Add a server-authoritative triangle dispatch and a triangle Worked acknowledgement path. Do not trust a client activity label. Add an actual route and handler test for both Worked triangle records.

### 2. Stored history validation does not enforce the stated trust boundary

`activities.ts:140` checks a small part of the newest row. It does not validate the full `practice.v1` envelope. It does not validate stored `activityId`, mode, status, attempt number, submitted time, fixed node and problem identity, exact answer-prefix keys, raw answers against graded parts, score and max-score coherence, or the required part array shape.

The function copies all stored `answers` into `acceptedAnswers`. A malformed row can add a future key or a skipped key. A row can also claim `isCorrect: true` without a coherent score or raw answer. The query then exposes this row as accepted progress.

The query calls this function directly at `activities.ts:141`. A malformed newest row throws `invalid_triangle_history`. The scope requires the query to return the triangle sequence as unavailable and to perform no write.

Implement one strict stored-row validator. Use it for query recovery, newest-row mutation recovery, and exact replay. Add malformed, mixed-identity, future-key, skipped-key, changed-raw-answer, bad-grade, and bad-final-shape tests.

### 3. Exact replay gives JSON key order authority

`activities.ts:144` compares the stored request and the new request with `JSON.stringify`.

Two requests with the same answer keys and values can conflict when their JSON key order differs. The accepted scope explicitly says that JSON object key order has no authority.

Compare the exact key set and each value. Also validate the stored receipt before replay. Add a reordered-key replay test.

### 4. The publication check does not require a skill node

`trianglePublished` at `activities.ts:138` checks only the node and blueprint review status. The existing publication pattern requires the node to have `kind: "skill"`.

The current test fixture at `triangle-ordering-practice.test.ts:6-9` omits `kind`. This omission masks the defect.

Require the exact canonical node kind and approved node and blueprint records. Add malformed and mixed publication tests.

### 5. The future-ready evidence contract is absent

`submitTriangleHandler` at `activities.ts:144` stops after it inserts the submission row. It has no gated learning-evidence decision and no SRS path.

The accepted scope requires a later-ready Independent last-part receipt to produce correct or incorrect evidence for the exact selected atomic node. Problem 10 must require a correct stored `missing_angle` prefix before either correct or incorrect `final_order` evidence is eligible. It must build target evidence only from `final_order` and must never create separate missing-angle evidence.

The current draft state correctly writes no evidence. However, the handler cannot satisfy the required behavior after the separate readiness activation.

Add the existing readiness and `srsEligible` gates. Add tests for correct and incorrect exact-node evidence, the Problem 10 prerequisite gate, cumulative hint and reveal exclusion, Guided and Worked exclusion, and current draft zero effects.

### 6. A complete response omits its public graded parts

`activities.ts:144` calculates all final parts, but the response does not include them. A successful last-part response contains only the aggregate score and other summary fields.

The accepted response contract requires all public graded parts for a complete last-part receipt. Each public part must contain only its part ID, learner raw answer, correctness, score, max score, and public feedback.

Add the public parts to a complete response and to exact replay. Add a privacy test that rejects normalized answers, answer keys, explanations, solution steps, and unrevealed hints.

### 7. Failed-request identity is not frozen

`TriangleOrderingPractice.tsx:4` creates a new key when the current body differs from the saved failed body. The learner can edit an answer after a failed request and send a new body and key. The scope requires one idempotency key and one body for the failed request.

Keep the failed body and key until the same request succeeds or the user performs an explicit safe reset. Disable relevant input while that retry is pending. Validate the returned receipt before the component deletes the saved retry identity or advances.

Add component tests for an edited answer after failure, a duplicate click, an invalid acknowledged result, an invalid graded result, and exact successful retry.

### 8. The authored Worked solutions omit the required correspondence

`triangle-ordering.ts:11` says only “Match each side to its opposite angle.” It does not show `RS → ∠T`, `TS → ∠R`, and `TR → ∠S`.

`triangle-ordering.ts:14` says only “Match each angle to its opposite side.” It does not show `∠T → RS`, `∠R → ST`, and `∠S → RT`.

The accepted source contract requires the authored solution to show the actual correspondence. Add the exact mappings and test the complete step text.

### 9. Seed change detection is order-sensitive and has no rerun proof

`seed_triangle_ordering_practice.ts:3` compares a constructed object with a stored database object through `JSON.stringify`. Object property order can differ after Convex serialization even when the content is equal. This can classify unchanged content as changed and clear an existing approval.

The seed test runs the handler only once. It does not test an unchanged rerun, changed content, review-field preservation, or exact stable identities.

Use a structural comparison that follows the existing Convex value semantics. Add unchanged-rerun and changed-content handler tests. Prove that an unchanged rerun preserves approval and that a real content change clears approval and keeps `srsEligible: false`.

## Test and review quality

The new production module, component, seed, and several tests are minified into very long lines. `activities.ts` and the new content and seed files add blanket `no-explicit-any` suppressions. This format makes the trust-boundary code difficult to review and helped hide the missing validation.

Format the new code normally. Use explicit types for the private item, stored envelope, artifact, response, and graded part contracts. Remove the blanket suppressions.

The focused tests pass, but they do not cover most required cases. The server test has only three cases. The component test has one case. The seed test has one case. The page test checks only that two queries run.

The full IM2 suite also has one unresolved calendar Worked-example failure. Resolve or prove that failure before the final gate can pass.
