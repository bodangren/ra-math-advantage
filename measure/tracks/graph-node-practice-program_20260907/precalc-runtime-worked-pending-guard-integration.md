# Worked acknowledgement pending guard integration

Two clicks in one event cycle sent two acknowledgement requests in the actual browser. The backend kept one submission. The page still needed to suppress the duplicate request.

The component now checks an immediate ref before it creates a request. It keeps that ref set after success. Failure releases the ref and preserves the idempotency key. The visible saved and error states remain unchanged.

The author added a regression with a deferred response and two native clicks in one React act block. It failed with two requests before the correction. It passes with one request after the correction. Existing tests verify same-key retry after failure and disabled submission after success.

The parent independently reviewed the two-path patch. It preserves receipt validation and server authority. Parent verification passed 73 tests, lint, build, and post-build standalone TypeScript in a candidate with local workspace package links. The complete patch was built against HEAD. Both staged files match the tested candidate byte for byte. Unrelated main changes remain intact.

The actual browser pending-click check must repeat after this integration. The earlier failed browser result is preserved in the Unit 7 report.
