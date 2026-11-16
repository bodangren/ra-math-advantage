# Precalculus teacher route and form initial parent review

## Decision

Do not integrate the first Q29 candidate. The strict request schema and exact public receipt are useful. Two behavior defects and one test gap remain.

## Required corrections

The result schema accepts contradictory decision values. For example, it can accept a `delivery: new` result whose decision says `conflict` or `awaiting_teacher_exposure`. A teacher confirmation must require the actual accepted teacher-led outcome. Validate the introduced state, eligibility, non-mastery status, reason, and matching delivery and idempotency. Preserve the actual runtime replay persistence behavior.

The form preserves a retry body, but enables the class selector after failure. A teacher can select another class while the form sends the old class. Keep the selector locked during an ambiguous retry, or clear the saved tuple only after a definitive failure. Test the visible behavior.

The route tests return hand-built mutation results. The separate backend tests do not prove that the route accepts the actual mutation result. Connect the real route to the real teacher handler through mocked transport. A new route factory is not required for this test.

## Scope

The first candidate remains isolated at `/tmp/precalc-q29-teacher-route-form`. It is not applied to the shared worktree. Keep other teacher actions and the candidate-query work unchanged.
