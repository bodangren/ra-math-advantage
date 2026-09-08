# Precalculus Q29 teacher route and form independent review

## Disposition

Accepted for the selected Topic 1.1 scope. I found no blocking defect in the final patch.

## Runtime contract review

The route accepts only the four exact request fields for `recordTopic11Exposure`. It obtains the teacher ID from authenticated server claims. It forwards only teacher, learner, class, and stored submission identity to the internal mutation.

The route validates the complete teacher result. A new event must return `persisted: true`, `delivery: new`, and decision idempotency `new`. A replay must return `persisted: false`, `delivery: replay`, and decision idempotency `replay`. Both cases require `masteryApplied: false`, `kstApplied: false`, exposure state `introduced`, reason `teacher_led`, `eligible: false`, and `masteryBearing: false`. These values match the actual teacher writer and the canonical learning-evidence decision. Teacher introduction is not a mastery event.

The public response contains only `{ delivery: 'new' }` or `{ delivery: 'replay' }`. The route rejects an unknown request field, a malformed internal result, an unavailable source submission, and an internal authorization error with controlled public errors. It does not expose an internal reason.

The real route-to-writer test creates a canonical learner-owned Worked acknowledgement. It then invokes the actual teacher mutation through the route. The first call writes one `teacher_led` teaching event and returns `new`. The replay writes no second event and returns `replay`. Neither call creates an SRS card or review log.

The existing backend tests prove that a valid stored teacher event can replay after graph publication withdrawal. Physical approval withdrawal still rejects the teacher action. This is the accepted durable replay rule. The writer still checks the stored physical source identity, current physical approval, and current teacher, class, enrollment, learner, and assignment authority. A changed source identity or withdrawn teacher authority fails. A new event requires current publication and physical approval.

## Form review

The form binds the retry request body before it starts the request. It disables the class selector while the request is pending. It keeps the selector locked after an ambiguous network or malformed-receipt failure. A retry sends the same class, learner, and submission tuple. A later selector change cannot replace that tuple. The synchronous pending guard prevents a double submission.

The form accepts only a one-field `new` or `replay` receipt. It does not confirm or remove the action after an HTTP success with a malformed body. It clears the retry body only after a valid receipt. The confirmation text states that the teacher confirms classroom instruction. It does not claim student mastery.

## Verification

I ran these four focused files:

- `topic11-exposure-route.test.ts`
- `topic11-exposure-route-real-writer.test.ts`
- `Topic11ExposureForm.test.tsx`
- `topic11-selected-teacher-backend.test.ts`

All 62 tests passed across the four files.

## Limit

The tests use hypothetical approved graph and physical source fixtures. They do not approve the production Topic 1.1 catalog. Production remains closed until separate source review and approval occur.

## Parent replay clarification

The parent corrected the review wording about physical approval. A teacher replay can survive graph publication withdrawal. It still requires current physical approval. The separate learner acknowledgement replay has a different rule. Do not transfer that rule to the teacher action.
