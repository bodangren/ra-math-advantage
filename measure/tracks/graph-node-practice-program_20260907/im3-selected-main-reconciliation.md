# IM3 selected main worktree reconciliation

The selected behavior committed in `927dcf0a` is now present in the shared worktree. Pending later-node changes remain intact. The reconciliation does not stage those broader changes.

The evidence consumer loads current activity approval and grading configuration. It applies the selected seed identity check to the original Guided and Independent activities in both stored-evidence checks. The teacher form now matches committed HEAD. It requires the exact class and submission selection, a nonempty evidence identifier, and a stable retry key. The provider retains pending submission ownership and validates finite bounded server grades.

The worker reproduced four backend acceptance failures, four teacher form failures, and nine selected provider failures before repair. The repaired worktree passed 153 focused tests, app lint, and standalone TypeScript. The parent inspected the differences against `/tmp/im3-selected-main-reconcile-before-20260907`, verified that the teacher form equals HEAD, and ran the 11 existing general provider tests. Those tests passed. The parent app build also passed. Its log is `/tmp/im3-selected-main-reconcile-build.log`.

No queue file or fingerprint metadata changed in this reconciliation. Actual queue and lesson consumer connections remain under Task Q14. Source approval and real approved student-flow verification remain open.
