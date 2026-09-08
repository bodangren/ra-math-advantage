# Q37 Unit 7 Acknowledgement Replay Verification

## Result

The recursive replay fix in commit `097d16a01` passed the real browser ambiguous-response test.

The browser sent the first acknowledgement. The local backend returned HTTP 200 to the intercepted request. The browser test then aborted that response. The page showed the visible retry control.

The retry used the same `Idempotency-Key` and the same request body. The retry succeeded. The database contained one acknowledgement submission for the new learner. It contained no evidence, receipt, SRS card, or SRS review.

## Separate defect

The pending double-click check failed.

Two synchronous clicks while the first request was held pending created two POST requests. The backend idempotency contract kept one persisted acknowledgement. The component did not suppress the second request.

The failed check used a separate new learner. It preserved the successful replay proof for the other learner.

## Local changes

The archive received the exact committed `apps/pre-calculus/convex/activities.ts` file from `097d16a01`.

The disposable fixture added two local learners. These learners used generated credentials. The credential files have mode `0600`.

The local Convex push used `CONVEX_SELF_HOSTED_URL=http://127.0.0.1:43160` and the protected local admin key. It did not contact a production deployment.

No main workspace file changed. No commit was created.
