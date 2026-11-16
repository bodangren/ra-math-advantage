# IM2 Lesson 1.4 native verification scope review

## Decision

Accepted for execution after the three-path Worked reload repair is accepted and integrated.

The corrected scope resolves the prior setup defects. The deferred Worked repair is an explicit execution prerequisite. It is not a defect in this scope.

## Confirmed corrections

- The fixture uses the unique `lessons.by_slug` result for `module-1-lesson-4`.
- It matches the physical lesson ID to the `seedModule1Lessons` result.
- It verifies that the returned lesson-version ID belongs to that lesson.
- It does not infer identity from array order or title.
- It calls `publication:publishLesson` with the exact `versionId`. The internal mutation returns `null`.
- It completes the real teacher assignment before the first Stage 1 learner submission.
- It verifies the canonical `class_lessons` row before it records the learner attempts.
- It reads the 14 teacher rows after the Stage 1 flow.
- It uses the three demo learners without creating credentials.
- It keeps the synthetic `teacher_led` prerequisite separate from result evidence.
- It requires the prerequisite event to precede the independent result.
- It verifies correct and incorrect independent results. Both results can produce eligible evidence when all other gates pass.
- It verifies that the revealed retry does not add evidence, update a card, or add a review log.
- It preserves the exact retry body and `Idempotency-Key` after the one lost response.
- It tests reload at a wrong Guided result, at a correct accepted prefix, and at the incomplete Problem 10 final state.
- It uses the six correct native images, `image2.png` through `image7.png`.

## Activation boundary

The scope states the product limit correctly. The current teacher-led exposure action supports only Lesson 1.1. The temporary prerequisite proves conditional persistence. It does not prove a production introduction path for either triangle node.

Keep the two nodes unready after this verification. Complete the separately tracked exact-node teacher-led introduction task and its native teacher/student proof before an activation change.
