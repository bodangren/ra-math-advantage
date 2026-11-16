# Precalculus Q31 teacher candidate UI independent review

## Disposition

The production connection is structurally correct. The patch does not yet meet the required composition proof. Add one real end-to-end component test before acceptance.

## Production trace

Both authenticated teacher pages obtain the teacher ID from `requireTeacherSessionClaims`. Each page calls `getTeacherData` and the Q30 `getTopic11TeacherCandidates` query with that server-owned teacher ID. Each page passes the returned candidates to `TeacherCourse`.

`TeacherCourse` renders one `Topic11ExposureForm` for each exact candidate. It uses the candidate learner ID, submission ID, acknowledgement time, lesson label, and class choices. It no longer derives teacher candidates from the broad latest-100 submission list. Therefore, a valid acknowledgement is not hidden by more than 100 unrelated submissions in production.

The form sends the selected class, candidate learner, and candidate submission to `/api/teacher/course`. The route obtains the teacher identity from the session and calls the actual teacher writer. The Q29 route validates the exact `new` or `replay` result. The form confirms only after that valid receipt. The Q30 query then removes the exact confirmed candidate on a fresh read.

This flow preserves the authority boundary. The browser does not choose an arbitrary learner or submission outside the server candidate. The teacher still chooses among all server-authorized class choices.

## Blocking verification gap

The tests prove the pieces separately, but no test proves the complete production composition.

- `topic11-teacher-candidates.test.ts` uses the real acknowledgement writer, query, and teacher writer. It does not render the actual teacher page or form.
- `topic11-candidate-pages.test.tsx` mocks `fetchInternalQuery` and gives the page a handcrafted candidate.
- `TeacherCourse-topic11-integration.test.tsx` passes handcrafted candidate props directly to `TeacherCourse`.
- `Topic11ExposureForm.test.tsx` mocks `fetch` and does not call the actual route or teacher writer.
- The backend test renders the learner lesson page. It does not render the teacher page.

Add one test that uses one shared in-memory database and these actual boundaries:

1. Create the selected Worked acknowledgement with the actual writer.
2. Add more than 100 unrelated submissions.
3. Render the actual authenticated teacher page.
4. Make its `fetchInternalQuery` adapter invoke the real `getTopic11TeacherCandidates` handler.
5. Select a returned class and submit the real form.
6. Make the form request invoke the actual teacher route and actual `submitTopic11TeacherSubmission` handler.
7. Assert the first receipt is `new` and one exact `teacher_led` event exists.
8. Render a fresh page against the same database.
9. Assert the candidate is absent.
10. Repeat the same teacher action at the route or writer boundary and assert `replay` with no second event.

This test must use the real acknowledgement-derived candidate. It must not insert a candidate prop or teacher event directly.

## Error behavior

The form keeps the request tuple after an ambiguous request or malformed receipt. It prevents a double submit. The Q29 tests cover these cases.

The pages use `Promise.all`. A query transport error rejects the page render and relies on the application error boundary. The patch does not add a local candidate-query error state. This is not a new trust-boundary defect. The required composition test should still cover a normal empty result after confirmation.

## Focused verification

I ran five focused files:

- `topic11-candidate-pages.test.tsx`
- `TeacherCourse-topic11-integration.test.tsx`
- `Topic11ExposureForm.test.tsx`
- `topic11-teacher-candidates.test.ts`
- `topic11-selected-teacher-backend.test.ts`

All 77 tests passed. These green suites do not close the composition gap described above.

## Parent review of correction

The corrected candidate connects the actual acknowledgement writer, candidate query, both teacher pages, real form, actual POST route, and actual teacher writer in one shared test context. Each page case includes 125 unrelated submissions. It checks one submission-bound teacher event, zero SRS cards and logs, and removal on a fresh page query. The test changes source publication only in its isolated fixture. Parent verification passes 83 tests in seven files with Q32. Lint, build, and post-build TypeScript pass.
