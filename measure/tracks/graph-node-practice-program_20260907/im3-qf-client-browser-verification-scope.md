# IM3 Quadratic Formula client browser verification scope

## Goal

Verify the combined backend and client in one disposable local environment. Use the real browser, Next.js routes, authentication, and Convex database. Do not approve or publish production curriculum data.

## Minimum local data

Use a fresh local Convex database.

1. Run the existing `seed/seed_demo_env:seedDemoEnv` internal mutation. Use its existing student account `student1@demo` with the local-only password `Demo1234!`.
2. Run the existing `seed/seed_lesson_1_6:seedLesson6` internal mutation. This creates the two unreviewed fixed QF activities and their canonical relations.
3. Deploy one temporary private internal mutation for browser placement. Remove it after verification.
4. In that fixture, look up the fixed Guided and Independent activities by the stable IDs in `IM3_QF_DRAFT_MAPPINGS`. Require exactly one activity for each mode.
5. Create two disposable lessons with unique slugs:
   - `qf-browser-guided`
   - `qf-browser-independent`
6. Give each lesson one local-only `published` lesson version. The student query ignores draft versions. This wrapper status only makes the disposable page readable. It does not approve the QF activity or publish the draft graph.
7. Give each version one phase and one activity section:
   - Guided lesson: phase 1, `phaseType: "guided_practice"`.
   - Independent lesson: phase 1, `phaseType: "independent_practice"`.
8. Validate each stored activity before section creation. Require its exact mapping stable ID, `componentKey: "quadratic-formula"`, the QF mastery node, `srsEligible: false`, unreviewed approval, and public props equal to `quadraticFormulaPublicProps(mode, mapping.seed)`.
9. Store only `{ activityId: <fixed activity ID>, componentKey: "quadratic-formula" }` in each section. This is the real production schema shape.
10. Require the accepted production student-query projection before this run. `student.getLessonProgress` must validate the exact physical QF activity. It must derive the mode from `IM3_QF_DRAFT_MAPPINGS`. It must add the stable activity ID, mastery node, evidence mode, SRS flag, and fixed public props at the read boundary.
11. Confirm the returned section satisfies the complete `getQuadraticFormulaSectionMode` guard before browser actions start.
12. Do not put a private seed, variant key, schedule, expected answer, grading data, approval override, or copied public props in stored section content.
13. Do not create standards, assignments, approvals, evidence, SRS rows, or preexisting submissions.

One phase in each lesson is sufficient. It avoids phase locking and completion setup. The learner can exercise all four immutable attempts from the same activity section.

## Local environment

Use placeholders in commands and logs.

```text
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:<CONVEX_PORT>
CONVEX_URL=http://127.0.0.1:<CONVEX_PORT>
CONVEX_DEPLOY_KEY=<LOCAL_ADMIN_KEY>
AUTH_JWT_SECRET=<LOCAL_TEST_SECRET>
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:<APP_PORT>
```

Keep `CONVEX_DEPLOYMENT` unset. Use the local administrator key only for server-side internal calls and fixture setup. Do not expose it through a `NEXT_PUBLIC_*` variable. Start only the frontend after the local backend and fixture deployment are ready. The existing `dev:stack` command assumes Convex port 3210, so use it only when the disposable backend uses that port. Otherwise start `npx vinext dev` with the explicit values above.

## URLs

- Login: `http://127.0.0.1:<APP_PORT>/auth/login`
- Guided verification: `http://127.0.0.1:<APP_PORT>/student/lesson/qf-browser-guided`
- Independent verification: `http://127.0.0.1:<APP_PORT>/student/lesson/qf-browser-independent`

Login through the visible form. Confirm that `/api/auth/session` returns the seeded student profile before opening either lesson.

## Browser scenarios

### 1. Entry, explicit Start, and reload

Open the Guided URL in a new authenticated context. Record requests to the attempt route.

- Confirm entry sends one GET and no POST.
- Confirm the page shows an explicit Start action and no editable QF controls.
- Click Start once. Confirm one POST returns pending ordinal 1.
- Confirm the displayed equation is the server-selected canonical equation.
- Confirm editable controls appear only after the pending response.
- Reload the page. Confirm the page sends GET only, displays the same equation and ordinal, and does not allocate another row.

### 2. Guided check binding and exact retry request

- Enter the discriminant. Confirm the check request contains the current pending submission ID.
- Confirm the request contains only the fixed activity ID, `fieldId: "discriminant"`, the raw answer, and the pending ID.
- Submit once while recording the submission request body and the `Idempotency-Key` and `X-Pending-Submission-Id` headers.
- If a retry is needed, fail the first submission response at the browser network boundary after capture. Use the visible retry action.
- Confirm the retry body and both headers are equal to the first captured request.

### 3. Saved-awaiting-details and GET failure

For one successful save, intercept only the immediate follow-up GET to the attempt route and return a local 503 response. Do not intercept the submission POST.

- Confirm the matching submission receipt puts the page in saved-awaiting-details.
- Confirm the selected equation, submitted answers, score, maximum score, and ordinal remain visible.
- Confirm no editable controls or part correctness appear.
- Confirm completion remains recorded.
- Confirm the page shows a details retry action.
- Click details retry. Confirm it sends GET and sends no submission POST.
- Allow the GET to reach the backend. Confirm the authoritative final view replaces saved-awaiting-details.

Count route requests during this scenario. A details failure and retry must not resubmit the answer.

### 4. Start next and failure preservation

- From the final view, click Start next attempt.
- Delay the Start POST. Confirm the saved final display remains visible while the request is pending.
- Fail one Start POST at the browser boundary. Confirm the saved final display remains visible and read-only with an adjacent error.
- Retry Start and allow it to succeed. Confirm ordinal 2 and the next server equation replace the final view.
- Confirm answers, Guided check state, error state, locks, and saved state from ordinal 1 are clear.

### 5. Repeated-root remount and timing reset

Finish ordinal 2. Start ordinal 3. This is the repeated-root schedule position.

- Confirm ordinal 3 has a new pending submission ID and a new equation.
- Confirm all response fields start empty.
- Submit the correct discriminant and repeated root. Leave `x2` blank.
- Capture the ordinal 2 and ordinal 3 submission envelopes.
- Confirm each envelope has its own timing start and duration data. Confirm ordinal 3 does not retain ordinal 2 timing, answers, hints, changed counts, or check state.
- Confirm the final view shows an `x2` part with maximum score 0 and overall maximum score 2.
- Reload. Confirm GET restores the same read-only repeated-root final and does not POST.

### 6. Exhaustion

- Start and finish ordinal 4.
- Click Start next attempt.
- Confirm the server returns exhausted.
- Confirm the ordinal 4 final remains visible and read-only.
- Confirm no new submission, item, or variant appears after the exhausted response.

### 7. Independent four-position schedule and isolation

Open the Independent URL in the same authenticated browser context.

- Confirm GET shows no attempt for the Independent fixed activity.
- Confirm explicit Start creates Independent ordinal 1.
- Complete ordinals 1 through 4. Use the explicit Start next action for each later ordinal.
- Confirm each ordinal uses its expected Independent schedule equation and a distinct pending submission ID.
- Confirm ordinal 3 is the Independent repeated-root position. Submit its repeated root with `x2` blank. Confirm `x2` has maximum score 0 and the overall maximum score is 2.
- Confirm the ordinal 3 remount clears prior answers, timing, hints, changed counts, check state, errors, and saved state. Confirm its timing belongs only to ordinal 3.
- Confirm the presentation mode remains Independent for all four positions.
- After ordinal 4, click Start next. Confirm exhausted state and no new submission, item, or variant.
- Return to the Guided URL. Confirm its final or exhausted state is unchanged.

### 8. Stale response protection

- Complete an attempt. Delay the immediate final-details GET while the page shows saved-awaiting-details.
- Click Start next and allow the new pending attempt to load for the same activity.
- Release the old final GET response.
- Confirm the new pending ordinal, equation, pending submission ID, and editable controls remain unchanged. Confirm the old final does not replace or clear the new pending state.
- Confirm this sequence sends no duplicate submission POST.
- Delay a Guided GET or Start response.
- Navigate to the Independent URL before it resolves.
- Release the delayed response.
- Confirm the Independent equation, mode, pending identity, and controls do not change.
- Repeat with a delayed Guided check when practical. Confirm it does not unlock roots in a new pending identity.

## Required evidence

Save plain browser evidence only:

- Request method and URL sequence for each scenario.
- Redacted request bodies and the two retry headers.
- Public response bodies for pending, final, and exhausted states.
- Screenshots for no-attempt, pending, saved-awaiting-details, repeated-root final, Start failure, and exhausted views.
- Console errors and failed network requests. Mark intentional injected failures separately.
- Final direct database counts and rows for the two fixture activities and the one learner.

Do not store credentials, session cookies, administrator keys, password hashes, or salts. Do not add checksums, manifests, or audit hash fields.

## Acceptance boundary

The browser run must use the accepted combined backend and client source. Unit tests cannot replace this run. The earlier local transaction proof covers backend concurrency and rollback. This browser run covers the real learner flow, client state transitions, timing remount, and network-error recovery.
