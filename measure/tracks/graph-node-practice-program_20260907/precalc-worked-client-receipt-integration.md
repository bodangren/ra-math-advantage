# Precalculus Worked client receipt integration

## Result

Q26 is applied in the shared worktree after independent review. The learner component validates the exact server receipt before it reports success or refreshes the page. The receipt contains only a nonblank submission ID, a positive integer attempt ordinal, and a canonical ISO time.

Invalid success responses, failed HTTP responses, and network failures keep the retry state. The next request uses the same opaque key and empty body. The component shows a generic error. It keeps the required Q24 projected content and stable activity ID.

## Verification

The independent reviewer ran 35 route and component tests. All passed. The parent ran 79 tests in six files against the shared worktree. They cover the real component, receipt errors and retry, real acknowledgement route and writer, strict projection, teacher authority, and shared component behavior. The parent also ran the actual graph renderer test. It passed. The total parent result is 80 tests in seven files.

App lint and a fresh build pass. Standalone `npx tsc --noEmit` passes after the build. Logs use the `/tmp/precalc-q26-parent-` prefix, with `tests.log`, `graph-tests.log`, `lint.log`, `build.log`, and `tsc.log`.

## Remaining work

The runtime component and tests remain applied with pending application dependencies. This record does not claim a standalone runtime commit. Q27 must derive the learner state and hide practice until trusted teacher confirmation. The teacher candidate query, teacher action, and complete student-flow verification remain open. No source approval, live seed, or deployment occurred.
