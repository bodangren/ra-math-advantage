# Q25 Worked acknowledgement route final independent review

## Decision

Reject the current integration artifact. The revised route behavior is correct in its isolated candidate. The patch is not applicable to current main. The real-writer test also uses the old source-section field and will fail after Q24 applies the accepted source contract.

## Blocking findings

### P1: The patch is a HEAD add-file patch, not a current-main patch

Current main already contains both files:

- `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts`
- `apps/pre-calculus/__tests__/app/api/activities/precalculus-topic-1-1/submissions/route.red.test.ts`

`/tmp/precalc-q25-worked-ack-route.patch` marks both files as new files from `/dev/null`. A dry-run against current main reports that both files already exist. The route itself has a small current-main delta of 9 additions and 4 removals. The test has a current-main delta of 181 additions and 5 removals.

Regenerate the patch against current main after Q24 integration. Preserve all current-main route and test behavior that is outside Q25.

### P1: The production-flow fixture does not meet the accepted Q24 source identity

The real-writer fixture stores the source position as `sequence: 2`. The accepted source contract uses `sequenceOrder: 2`. Q24 changes the shared `hasCurrentTopic11Source` predicate to require exactly one current phase 4 Worked phase, one occupied `sequenceOrder: 2` row in that phase, and one selected physical link across all current-version phases.

The Q25 candidate does not include this Q24 predicate. Its 58 passing tests therefore do not prove that the revised route works with the accepted shared source boundary. Change the fixture to `sequenceOrder: 2`. Then run the route-to-real-writer test against the combined Q24 and Q25 candidate. Keep the Q24 cross-phase, duplicate-phase, and occupied-sequence authority regressions in that combined run.

## Verified behavior

I ran the two focused files in the isolated Q25 candidate.

- Route tests: 23 passed.
- Teacher backend tests: 35 passed.
- Total: 58 passed.

The revised test now calls the real `createTopic11DailySubmission` handler through the injected route dependency. It provides an active learner profile and credential. It provides a hypothetically approved graph publication and an approved physical Worked activity. It verifies the canonical six-field acknowledgement. It verifies empty `answers` and `parts`. It verifies no score, grade, learning evidence, SRS card, or SRS review. It verifies durable replay and one physical submission row. It verifies inactive credentials, withdrawn approval, and changed physical props fail closed.

The route preserves the exact nonempty value returned by `headers.get()`. The request-shaped test proves leading and trailing bytes reach the writer. The tests cover 256 accepted characters and 257 rejected characters. They cover invalid JSON, `null`, arrays, scalars, client answer fields, and client authority fields.

The route returns exactly `submissionId`, `attemptOrdinal`, and canonical `submittedAt`. It rejects extra, empty, nonpositive, fractional, or noncanonical receipt values. It maps direct and wrapped idempotency conflicts to HTTP 409. It returns a private generic error for other failures.

## Required correction

1. Change the real-writer fixture from `sequence` to `sequenceOrder`.
2. Apply Q24 to the candidate or apply Q25 to the corrected Q24 candidate.
3. Run the 23 route tests, the 35 teacher tests, and the Q24 projection and authority tests together.
4. Generate a current-main relative patch. Do not use `/dev/null` for files that exist in main.
5. Update the report with the combined test count and patch dry-run result.
