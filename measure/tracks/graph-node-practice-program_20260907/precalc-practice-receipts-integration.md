# Precalculus practice receipt integration

## Result

Q33 is applied in the shared worktree. The selected practice component validates the exact five-field submission receipt and the exact evidence receipt with its five decision fields. It checks score bounds, positive attempt ordinal, nonblank physical submission ID, strict string enums, and mode-specific decision semantics.

Guided Practice accepts ungraded evidence or an awaiting-teacher decision. Independent Practice accepts eligible evidence or an awaiting-teacher decision. A malformed successful response cannot show saved practice or enable a new attempt. The component preserves the same envelope and idempotency key before a valid submission receipt. After that receipt, it retries evidence delivery with the same physical submission ID. An immediate reference guard prevents concurrent submissions.

## Review corrections

Parent review required strict string enums and mode checks. Array coercion and a swapped Guided or Independent decision are rejected. Independent review also found an invalid Guided test receipt and an outdated dashboard fixture. Both fixtures now use the current contracts. The ready dashboard shows practice and hides the Worked acknowledgement card. Authentication, knowledge-state, private-field, and interactive controls remain checked.

## Parent verification

All 30 tests in four files pass. They include the full eight-test acceptance file, eleven receipt tests, two real component composition tests, and nine real writer and evidence-store tests. The composition tests connect the actual activity component, submission route, server writer, evidence route, evidence handler, and stores. Guided creates no SRS effect. Independent creates one SRS card and review. The real-store suite checks replay without duplicate effects.

App lint, a fresh build, and post-build standalone TypeScript pass in the shared worktree. Earlier isolated TypeScript failures do not describe the current main result. Logs use `/tmp/precalc-q33-parent-`.

## Limits

Source publication and teacher history use isolated test fixtures. Authentication and database transport use test adapters. This is not a signed-in browser acceptance result. Runtime changes remain applied with pending workspace dependencies. Source approval, live student-flow verification, and complete course coverage remain open. No live seed or deployment occurred.
