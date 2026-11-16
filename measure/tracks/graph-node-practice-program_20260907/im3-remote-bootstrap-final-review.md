# IM3 Remote Bootstrap Final Independent Review

## Decision

Accepted for the bounded remote bootstrap claim.

The evidence shows a successful clean data bootstrap on the remote development deployment. The review found no blocking defect.

## Evidence reviewed

- `remote-targeted-calls.json`
- `remote-targeted-results.json`
- `remote-call-00.json` through `remote-call-61.json`
- `remote-call-00.stderr` through `remote-call-61.stderr`
- `remote-final-verify.json`
- `remote-account-state.json`
- The accepted local aggregate expectations and the five exact system equation pairs

I did not read an environment file, an administrator key, an instance secret, a password field, or a profile document. I did not run a mutation.

## Targeted call set

The call plan contains exactly 62 calls.

- It contains 51 lesson seed calls. It omits Module 1 Lesson 6 because that lesson already existed.
- It contains nine lesson-standard mapping calls.
- It contains one `seedPracticeItems` call.
- It contains one `seedDemoProgress` call.
- It does not contain `seedAll`.
- It does not contain `seedDemoEnv`.

All 62 calls have exit code 0. All recorded failure counts are zero. All 62 standard-error files are empty.

The nine mapping calls returned 79 successful result rows in total. The generic practice call returned 7,838 successful result rows and zero false results. The demo progress call returned five successful result rows and zero false results.

## Stored remote state

The final read-only query reports these counts:

- 52 lessons and 52 lesson versions
- 44 competency standards and 44 objective policies
- 79 lesson-standard mappings
- 388 activities
- 594 phase versions and 979 phase sections
- 91 practice variants and 200 practice items
- 30 student progress rows and 18 activity completion rows

The unique counts agree with the row counts for lesson slugs, standard codes, variant keys, and practice item IDs.

All stored-reference checks are zero. These checks cover lesson versions, phases, sections, activity sections, standards, practice items, student progress, and activity completions.

The query found five system activities. Each activity has a strict `equations` object with the expected `first` and `second` strings. Each activity has `problemType: "system"`. None has a single `equation` field.

The five pairs are:

1. `x = 2y^2 + 3y + 1` and `-x + y = -1`
2. `x^2 = y + 5` and `-x + y = 7`
3. `y = x^2 - 2x + 6` and `y = 4x + 1`
4. `R = -0.1x^2 + 4x` and `R = 42`
5. `y = x^2 + 2x` and `y = -x^2 + 4x + 6`

## Demo progress

The five learner states match the accepted boundaries.

- Student 1 has no progress and no completion.
- Student 2 has completed phases 1 and 2. Phase 3 is in progress. Only phase 1 has an activity completion.
- Student 3 has completed phases 1 through 5. Phase 6 is in progress. Phases 1, 4, and 5 have activity completions.
- Student 4 has completed phases 1 through 9. Phases 1, 4, 5, 6, 8, and 9 have activity completions.
- Student 5 has completed phases 1 through 12. Phases 1, 4, 5, 6, 8, 9, 10, and 11 have activity completions.

Every completed progress row has `completedAt`. Each in-progress row does not have `completedAt`. The verifier reports zero incoherent completions for all five learners.

## Account state

The stored state has seven profiles: six students and one teacher.

The sanitized account query reports five active students, one active teacher, and one deactivated student. It reports zero duplicate account aliases, zero duplicate profile aliases, and zero missing profile references. This proves that the deactivated sixth student exists once and that the bootstrap did not create a duplicate profile or account alias.

## Limits

The remote insertion order differs from the local insertion order because Module 1 Lesson 6 existed before the 62 targeted calls. The bounded first-200 practice-item set can therefore differ from the local set. The remote query proves 200 unique items and zero broken item references. It does not claim full native-family coverage.

The 7,838 generic helper result rows are loop outcomes. They are not 7,838 stored items and do not prove coverage of every source family.

This review accepts the recorded remote development state. It does not make a production deployment or rollout claim.
