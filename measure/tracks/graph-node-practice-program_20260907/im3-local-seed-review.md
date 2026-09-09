# IM3 full local seed independent review

## Decision

Rejected as proof of a complete bootstrap.

The lesson, standards, mapping, solver-system, and demo-progress portions pass.

The generic practice-item helper fails on the real local backend. `seedAll` catches this failure and still returns success for the other sections. Thus, the top-level result is not complete bootstrap proof.

## Blocking finding

A direct call to `seed/seed_practice_items:seedPracticeItems` failed.

Convex reported `Too many bytes read in a single function execution` at `seed_practice_items.ts:71`. The function repeatedly executes the fallback `activities.take(200)` query inside the problem-family loop. The repeated bounded query still exceeds the 16 MiB per-function read limit.

`practice-helper-result.json` is empty. `practice-helper-stderr.log` contains the server error.

The four stored practice items show that part of the helper ran before or during `seedAll`. They do not prove that the helper completed. The valid item references do not close this failure.

Repair the helper with minimum per-invocation reuse of the existing bounded fallback read. Do not add a persisted cache or framework. Run the helper directly and require a successful result. Then rerun the read-only reference and count checks.

## Seed result

`seed-result.json` contains these exact successful result sets:

- 52 lesson results; all have `success: true`; all 52 response identities are unique.
- 44 standards results; all have `success: true`; all 44 response identities are unique.
- 79 lesson-standard results; all have `success: true`; all 79 lesson and standard pairs are unique.
- the demo helper reports success.
- the progress helper reports success.

`seed-stderr.log` is empty.

The stored database has 52 lessons, 52 lesson versions, 44 competency standards, and 79 lesson-standard rows.

The 52 stored lesson slugs are unique. The slug list has the exact module counts: 8, 5, 5, 6, 5, 5, 6, 5, and 7.

The 44 stored standard codes are unique.

## Reference checks

The read-only verifier reports zero invalid references for:

- lesson versions to lessons;
- phases to lesson versions;
- sections to phases;
- lesson standards to lesson versions and standards;
- practice items to activities and variant keys;
- student progress to profiles and phases;
- activity completions to profiles, lessons, and activities.

It reports zero invalid activity sections. Each activity section has only `activityId` and `componentKey`. Its activity ID exists. Its component key equals the stored activity component key.

The local seed stored 388 activities, 594 phase versions, 979 phase sections, 91 unique variant keys, and 4 unique practice-item IDs. The practice-item reference check is zero for the four rows that exist. This check does not prove helper completion.

## System records

The verifier found exactly five `system` solver activities.

Each activity has `equations: { first, second }` and has no single `equation` field.

The five ordered pairs exactly match the accepted Lesson 1.8 source:

1. `x = 2y^2 + 3y + 1`; `-x + y = -1`
2. `x^2 = y + 5`; `-x + y = 7`
3. `y = x^2 - 2x + 6`; `y = 4x + 1`
4. `R = -0.1x^2 + 4x`; `R = 42`
5. `y = x^2 + 2x`; `y = -x^2 + 4x + 6`

The successful lesson transactions show that the real Convex validator accepted all stored solver records. The all-handler unit test separately proves the shared public schema parses every solver record.

## Demo progress

The database has 30 `student_progress` rows and 18 `activity_completions` rows.

The sanitized states match all five descriptors:

- Student 1 has no progress row and no completion. The application resolves this state as `not_started`.
- Student 2 has completed phases 1 and 2. Phase 3 is `in_progress` and has no `completedAt` value.
- Student 3 has completed phases 1 through 5. Phase 6 is `in_progress` and has no `completedAt` value.
- Student 4 has completed phases 1 through 9.
- Student 5 has completed phases 1 through 12.

Each completed progress row has `completedAt`. The two in-progress rows do not have `completedAt`.

The completion phases match the real activity sections in completed phases. Student 2 has one completion. Student 3 has three. Student 4 has six. Student 5 has eight. Student 1 has none.

The verifier reports zero incoherent completions. This check requires the same learner, lesson, completed phase, phase section, and physical activity ID. Thus, no text phase uses a fake activity ID. Neither current in-progress phase has a completion.

## Verification-script execution

The first read-only verifier invocation used an incorrect default-export wrapper. Convex rejected it before the query ran. `verify-first-error.log` preserves this error.

The retry passed the query body directly and produced `verify-result.json`. This invocation was read-only. The first error does not weaken the successful result.

## Evidence boundary

The stored mapping result gives an exact count, unique response pairs, and valid stored references. The verifier does not return the 79 stored mapping pairs as codes. The clean lesson result and equal stored mapping count provide sufficient proof for the lesson-standard portion. They do not prove the failed practice-item helper. A later audit that needs pair-by-pair stored equality must return those sanitized pairs.

The evidence contains no credential, secret, or profile document content.
