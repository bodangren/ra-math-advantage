# Precalculus teacher candidate interface integration

## Result

Q31 is applied in the shared worktree. Both teacher pages request exact candidates with the authenticated teacher ID. They pass the result to TeacherCourse as a required separate prop. The interface shows query-approved learner, lesson, time, and class choices. It does not reconstruct candidates from the latest 100 submissions.

## Review and verification

Independent review found that the first candidate did not prove the complete interface flow. The corrected test uses one shared database context. It connects the actual acknowledgement writer, exact candidate query, both actual pages, TeacherCourse, the confirmation form, actual POST route, and real teacher writer. Both page cases include 125 unrelated submissions. They verify one submission-bound teacher event, zero SRS cards and review logs, and removal on a fresh page request.

Parent verification passes 83 tests in seven files with Q32. App lint, a fresh build, and post-build standalone TypeScript pass. Logs use `/tmp/precalc-q31-q32-parent-`.

## Limits

Authentication and database transport use test adapters. Source approval is hypothetical in isolated test fixtures. This does not establish a live signed-in browser flow. Runtime changes remain applied with pending application dependencies. No source approval, live seed, or deployment occurred.
