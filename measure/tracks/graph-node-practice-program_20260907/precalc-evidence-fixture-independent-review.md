# Q18 seven-failure fixture repair independent review

## Result

Accept this test-only repair. I found no production bypass in the repaired fixtures.

## Selected Topic 1.1 flow

The revised production-flow test uses the real selected writer and the real evidence dispatcher. It supplies active learner profiles and matching active credentials. It does not insert a pregraded selected submission.

The selected physical rows now match the exact production identity. They include the stable ID, physical ID, component, display text, description, props, grading seed, and approved state. The writer creates the physical submission. The test passes only the returned physical submission ID to the route and dispatcher.

The Guided interval submission keeps its server-owned physical score. The evidence policy records ungraded participation. The evidence row has no `gradedEvidence`. It creates no SRS card or review. Receipt replay creates no second effect.

The Independent test verifies the stored server grade, exact node and activity identity, one evidence row, one SRS card, one review, and stable replay counts. The existing writer tests still cover incorrect answers, assistance, same-key conflicts, new-key ordinals, malformed stored rows, and publication boundaries.

## Topic 1.2 bounded authority flow

The bounded tests now call `createTopic12TableAverageRateSubmission`. They use its returned physical submission ID with `submitRoutedEvidenceHandler`. They do not patch the new physical submission after the writer returns.

The ordinal fixtures preserve the intended boundaries:

- A prior physical ordinal of 1001 makes the real writer create ordinal 1002.
- A prior physical ordinal of 1000 makes the real writer create ordinal 1001. Existing exact-scope evidence at ordinal 1001 then causes the expected conflict.
- Wrong learner, wrong node, wrong activity, future teacher exposure, nearest prior exposure, and descending exact-index selection remain asserted.
- The authority harness still rejects `collect()` and `take()` on the evidence authority queries.
- Rejected evidence delivery writes only the already-authorized physical submission. It writes no evidence, receipt, SRS card, or review.

The generated correct option is used only as input to the real Topic 1.2 writer. The server writer still grades and stores the response. The patch does not replace server grading with a fixture grade.

## Scope and verification

The patch changes only two test files. It does not change a production handler, schema, route, or catalog.

I ran the reported three-file group independently:

- selected Topic 1.1 writer: 42 passed;
- bounded authority: 3 passed;
- production flow: 107 passed;
- total: 152 passed, 0 failed.

The author also reports the selected route group, broader authority regression, lint, build, and standalone TypeScript as passed.
