# Precalculus selected evidence implementation review

## Result

Do not integrate the first evidence patch. The parent found a runtime function-reference mismatch and reproduced three invalid stored-data cases that still create evidence.

Candidate: `/tmp/precalc-q18-evidence-v5`. Patch: `/tmp/precalc-q18-selected-evidence-head.patch`.

## Runtime function reference

The route calls `internal.learningEvidence.submitSelected`. The generated runtime exports Convex `anyApi`. That property resolves to `learningEvidence:submitSelected`.

The committed module is `convex/learning-evidence.ts`. Its function name is `learning-evidence:submitSelected`. The declaration file aliases the hyphenated module with a camel-case property. TypeScript therefore accepts a runtime reference that does not identify the committed function.

Correct the selected reference and the minimum related declaration. Test the production reference with `getFunctionName`. Do not use a mocked symbolic string as proof that the route can reach the mutation.

## Stored submission validation

The consumer validates a parsed shared envelope but does not enforce the selected stored key sets. The shared parser strips some unknown fields. The original writer rejects those fields, but the evidence consumer accepts a corrupted stored row.

The parent added three direct cases: an extra answer key, an extra top-level field, and unowned `misconceptionTags` on a part. All three returned `persisted: true` when they had to return `submission_not_found`. Log: `/tmp/precalc-q18-evidence-parent-red.log`.

Apply the accepted selected stored contract at this boundary. Verify exact answer and part keys, required assistance, row identity, canonical answer parity, grade, and server time before any effect. Preserve the valid Guided participation policy.

## Physical source and response validation

The current source check omits the selected physical activity display name and description. Align it with the accepted writer identity contract. Preserve exact mode, node, seed, approval, and publication checks.

The route can return HTTP 200 for an empty or malformed mutation result. Require a complete bounded receipt or a defined rejection result. A missing result must not appear to the client as successful evidence delivery.

## Required verification

The six dependency tests mock authentication, source checks, and stores. They do not exercise the physical row produced by the real writer through the real mutation adapter. Add those tests. Include incorrect and assisted Independent work, invalid physical source, credential mismatch, conflicting attempts, damaged receipts, and rejected stored data.

The author reports ten tests, lint, build, and source-mapped TypeScript passing. Those checks do not cover the parent failures above.

`convex-test` is absent from the current manifests and installed modules inspected by the parent. Do not install it without dependency approval. Real transactional rollback and concurrent delivery verification remain an explicit gap. A memory store cannot prove either property.

The trusted teacher producer and positive student-to-teacher flow remain separate prerequisites. Source approval remains open.

## Parent revision 2 verification

The parent passes all 19 revised focused tests in an isolated candidate. The runtime reference now uses the committed hyphenated module. The raw stored-data checks address the first review findings. Independent code review accepts the bounded consumer, subject to the stated integration limits.

A further direct route check finds incomplete decision validation. With valid outer receipt fields, `decision: { reason: "eligible" }` still returns HTTP 200. A decision whose `reason` is an object also returns HTTP 200 and forwards that value. Both requests must return a controlled server error. The two added tests fail with actual status 200 instead of expected 500. Log: `/tmp/precalc-q18-evidence-v2-receipt-parent-red.log`.

Require all five decision fields with their exact contract types and enum values. Keep the real writer-to-handler tests and actual transactional verification limits open. Do not accept a partial decision as successful delivery.
