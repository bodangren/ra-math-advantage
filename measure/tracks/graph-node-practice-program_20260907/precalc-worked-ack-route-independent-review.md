# Precalculus Q25 Worked acknowledgement route independent review

## Decision

Reject the patch until the production-path test gap is repaired. The route implementation is narrow. The tests do not prove the required route-to-real-writer behavior.

## P1 findings

### The tests do not run the real route through the real writer

The production route calls `internal.activities.createTopic11DailySubmission` at `apps/pre-calculus/app/api/activities/precalculus-topic-1-1/submissions/route.ts:138-152`. The route test mocks `fetchInternalMutation` at test lines 3-8. The final test injects another `vi.fn` at lines 86-94. No route test calls the actual `createTopic11DailySubmission` handler.

The separate writer suite calls the handler directly. It proves writer behavior in isolation. It does not prove that the route builds an argument accepted by the real mutation validator and handler. It also does not prove the complete approved source identity, active learner credential, Phase 4 sequence 2 source, or stored acknowledgement through the route boundary.

Add a route-to-real-writer fixture. Use a hypothetical fully approved Q19 source. Include an active learner profile and matching active credential. Include the exact physical activity and the exact Phase 4 sequence 2 source. Assert these results:

- The stored envelope has only the canonical six fields.
- `answers` is empty and `parts` is empty.
- The submission has no score, grade, learning evidence, or SRS effect.
- The returned receipt has the physical submission ID, positive ordinal, and canonical server timestamp.
- A replay returns the same receipt and creates no new row.
- Inactive identity and withdrawn or changed exact source fail closed.

### The opaque-header test does not distinguish the old and new code

The positive test at lines 26-41 uses `key  bytes`. Both the old `.trim()` implementation and the new implementation preserve internal spaces. Native `Headers` also normalizes leading and trailing optional whitespace, so a normal `Request` cannot prove that the route preserves the exact string returned by `Headers.get`.

Use the injected route with a request-shaped fixture whose `headers.get()` returns a value such as `" key "`. Assert that the writer receives those exact bytes. This test is Red against the old code. Keep the existing internal-space case as an additional ordinary HTTP case.

## P2 test gaps

The patch rejects a 257-character key but does not prove that a 256-character key is accepted. Add the exact boundary case.

The positive route test checks status only. It does not assert the exact public receipt body. Assert exact equality for `submissionId`, `attemptOrdinal`, and `submittedAt`. This must also prove that no internal or extra field is returned.

Add explicit rejection cases for `null`, an array, and a scalar request body. The current implementation rejects these values, but the strict empty-object contract is not directly covered.

## Verified implementation behavior

The route reads the value returned by `Headers.get`. It uses trimming only to reject an all-whitespace key. It preserves the returned key value and checks the original string length. The 256-character implementation boundary is correct.

The route creates the canonical empty Worked acknowledgement on the server. It rejects client authority and answer fields. The receipt validator requires exactly three keys, a nonempty ID, a positive integer ordinal, and a canonical ISO timestamp.

Direct and wrapped conflict strings map to 409. Other failures return a generic 500 response. The response does not expose the internal error.

## Test evidence

I ran the two stated focused files in the isolated candidate.

- Route tests: 17 passed.
- Selected teacher and writer backend tests: 35 passed.
- Total: 52 passed.

The author report states 59 tests. The current candidate contains 52 tests in these two files. Update the report after the missing integration and boundary tests are added.
