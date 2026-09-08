# Precalculus learner lesson-status check

The pending message on the dashboard and Topic 1.1 lesson now has a Check lesson status link. A normal document request reads the current teacher confirmation through the existing authenticated server page. It adds no stored state or polling.

Both link assertions failed before implementation. The narrow suite then passed 56 tests. Combined Q31 and Q32 parent verification passes 83 tests in seven files. Lint, build, and standalone TypeScript pass. The native anchors have narrow lint comments because the action requires a fresh document request, including on the same lesson URL.

Independent review accepts the change. The existing real acknowledgement, pending page, teacher writer, and fresh ready page test remains intact. This verifies server-rendered state changes. It does not claim browser navigation verification.

The incremental patch is `/tmp/precalc-q32-learner-status-check.patch`. Runtime changes remain applied in the shared worktree. Source approval and live student-flow verification remain open.
