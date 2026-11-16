# Precalculus Q37 unit 6 teacher surface candidate

## Result

The seven-path candidate is ready for parent review. It starts from `a40ca6e2` and remains at `/tmp/precalc-q37-unit6-surface.NWwlxi`. The complete patch is `/tmp/precalc-q37-unit6-surface-final.patch`.

## Behavior

- `/api/teacher/course` accepts only `recordTopic11Exposure`.
- The route derives the teacher ID from the authenticated request.
- The route calls `internal.selectedLearningEvidence.submitTopic11TeacherSubmission`.
- The route validates the complete writer result and returns only `{ delivery: "new" | "replay" }`.
- The form freezes the exact class, learner, and submission tuple after an ambiguous failure.
- The form rejects malformed success receipts and prevents duplicate pending requests.
- The teacher dashboard requires a teacher session and queries only `getTopic11TeacherCandidates`.
- The dashboard renders the selected candidate list and exact class choices.
- The dashboard preserves the curriculum and home links.
- The patch does not use `TeacherCourse`, `getTeacherData`, or unrelated teacher actions.

## Real-handler composition proof

The real-flow test uses the real acknowledgement handler, teacher candidate handler, learner delivery handler, route, and selected teacher writer. It uses an in-memory test database. It is not a real Convex backend test.

The fixture satisfies the required schema fields for profiles, credentials, classes, enrollments, lessons, assignments, lesson versions, phases, sections, and activities. It uses a mixed Worked phase. Sequence 1 contains the ordinary text section. Sequence 2 contains the selected physical activity link. It creates a canonical learner acknowledgement. It confirms that the learner first waits for teacher confirmation. It confirms that the teacher query returns one candidate. It sends the route request through the selected writer. It then confirms that the candidate disappears and learner delivery becomes ready. The writer creates one teacher-led evidence row and creates no mastery, spaced-repetition card, or review-log row. Unit 7 must repeat this flow against the schema-enforcing local backend.

## Verification

- Initial Red: the route did not exist, the dashboard did not authenticate or query candidates, and the form accepted `{ ok: true }` as success.
- Focused surface tests: 16 tests passed in four files.
- Unit 4, unit 5, selected backend, and surface suite: 235 tests passed in 20 files.
- App lint passed.
- Fresh production build passed and included `/api/teacher/course`.
- Post-build standalone TypeScript passed with candidate source mappings for `@math-platform/practice-core`.
- `git diff --check` passed for the seven-path patch.
- A temporary-index apply check passed against `a40ca6e2`.
- All seven patched files are byte-identical to the candidate after application.

No main-worktree edit, commit, deployment, dependency, schema, hash, or approval change is included.
