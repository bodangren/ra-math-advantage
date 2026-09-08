# Precalculus Q30 teacher candidate query independent review

## Disposition

Accepted for the selected Topic 1.1 scope. I found no blocking defect in the final patch.

## Authority and source checks

The query requires an active teacher profile and credential with matching profile ID, username, role, and organization. It reads only classes owned by that teacher and excludes archived classes.

The query requires an active learner profile and credential in the teacher organization. It requires the exact approved physical Worked source, the exact current published Topic 1.1 source, and a canonical learner-owned acknowledgement. It checks source creation and review times against the acknowledgement time. It also checks phase, section, enrollment, and assignment authority at the acknowledgement time.

The query does not use a fixed result cap for the exact acknowledgement lookup. The test with 125 unrelated submissions confirms that it still finds the selected acknowledgement through `by_user_and_activity`.

The final duplicate-enrollment rule matches the mutation. The query counts all enrollment rows for a learner and class. An active row plus an inactive duplicate is ambiguous because the teacher writer uses an exact unique lookup. The query removes that class choice. It can still return another class that has one active enrollment and one exact assignment.

The query returns all valid class choices for an acknowledgement. It does not choose a class for the teacher. A class that another teacher owns cannot appear.

## Confirmation and state consistency

The query uses the same stored acknowledgement predicate as the Q27 learner state. It also uses the same exact teacher-confirmation predicate. A valid teacher event must match the learner, exact node, exact source activity, `teacher_led` origin, teaching mode, attempt ordinal, occurrence time, absence of graded evidence, and submission-derived idempotency key.

Before the teacher action, the real acknowledgement appears as a candidate. The real teacher mutation writes the trusted event. The candidate then disappears. This agrees with the learner state change from `awaiting_teacher_confirmation` to `ready_for_practice`.

Unrelated evidence and altered evidence do not hide the candidate. A duplicate selected physical source fails closed. Production catalog withdrawal also returns no candidate.

A normal acknowledgement replay does not create a second stored acknowledgement. The existing idempotent writer and the Q27 state therefore preserve the candidate until the exact teacher action succeeds. After confirmation, the state no longer presents the learner Worked acknowledgement flow.

## Result boundary

The internal query has explicit argument and return validators. It returns only learner ID, learner display name, submission ID, acknowledgement time, lesson label, and valid class choices. It does not return credentials, raw submission content, activity props, grades, or internal authorization reasons.

## Verification

I ran:

- `topic11-teacher-candidates.test.ts`: 21 tests passed.
- `topic11-selected-teacher-backend.test.ts`: 45 tests passed.

All 66 tests passed. The author also reports that lint, build, and post-build TypeScript checks pass.

## Limit

The tests use hypothetical approved catalog and physical source fixtures. They do not approve the production Topic 1.1 source. The query remains closed when production publication is withdrawn.
