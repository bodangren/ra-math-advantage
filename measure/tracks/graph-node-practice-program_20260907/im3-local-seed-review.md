# IM3 full local seed independent review

## Decision

Accepted as bounded real local Convex proof for the current bootstrap contract.

The lesson, standards, mapping, solver-system, demo-progress, and repaired generic practice-item helper checks pass.

This acceptance retains the current native first-200 activity limit. It does not claim that every problem family has a distinct stored item.

## Initial hidden helper failure and repair

The first direct call to `seed/seed_practice_items:seedPracticeItems` failed with `Too many bytes read in a single function execution`. `seedAll` had caught this failure. The original review correctly rejected the first full-bootstrap claim.

The failed generic mutation committed no partial writes because Convex rolled back the transaction. The four baseline practice items came from the separate quadratic-formula seed. They did not prove generic helper progress or completion.

The accepted two-file repair at `4294ebb72` reuses the existing bounded fallback activity read once per invocation. It does not add a persisted cache or a new framework.

After the repaired source was pushed to the local backend, the direct helper returned 7,838 result rows. All 7,838 rows have `success: true`. No row has `success: false`. `practice-helper-fixed-stderr.log` is empty.

The 7,838 result rows are loop outcomes across 87 source problem families and matching activities. They are not 7,838 stored items. They do not prove one stored item for each family.

The final database contains 200 unique practice items. All item references are valid. This count is bounded by the helper's current native first-200 fallback activity pool.

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

The local seed stored 388 activities, 594 phase versions, 979 phase sections, 91 unique variant keys, and 200 unique practice-item IDs. The final practice-item reference check is zero. The direct repaired helper result proves completion for this bounded run.

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

## Final verification

`verify-fixed-result.json` reports zero invalid references in every checked category.

The non-practice counts and demo states are unchanged from the accepted partial proof. It still contains 52 lessons, 44 standards, 79 mappings, five exact system pairs, 30 progress rows, and 18 coherent activity completions.

## Evidence boundary

The stored mapping result gives an exact count, unique response pairs, and valid stored references. The verifier does not return the 79 stored mapping pairs as codes. The clean lesson result and equal stored mapping count provide sufficient proof for the lesson-standard portion. The direct repaired helper result and final reference check provide proof for the bounded practice-item run. A later audit that needs pair-by-pair stored equality must return those sanitized pairs.

The evidence contains no credential, secret, or profile document content.
