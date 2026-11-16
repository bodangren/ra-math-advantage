# Implementation Plan: Worktree Atomic Integration

Superseded by the sync merge 2b2d9952, PM 2026-11-16.

## Phase 1: Inventory and ownership

- [x] Count tracked and untracked paths.
- [x] Read the Measure index, workflow, registry, and owning track plans.
- [x] Separate source, documentation, and generated output.

## Phase 2: Atomic integration

- [x] Stage one reviewed group at a time.
- [x] Commit each group with an owner track in the message.
- [x] Add a Git note to each integration commit.
- [x] Record each commit in the owning plan.

## Integration commit map

- `2c40e557e` — shared graph-practice layer. Owners: graph-node-practice-program, teacher-led-mastery-advantage, and mastery-advantage-graph-remediation.
- `5ebd79752` — IM1 source graph and practice changes. Owner: graph-node-practice-program.
- `8142bd70d` — IM3 graph practice and review changes. Owners: im3-complete-review, graph-node-practice-program, teacher-led-mastery-advantage, and kst-srs-v3-2-im3-runtime-migration.
- `67065a9e1` — Precalculus graph practice and review changes. Owners: precalculus-complete-review, graph-node-practice-program, teacher-led-mastery-advantage, and mastery-advantage-graph-remediation.
- `991fe1212` — Business Math review and practice corrections. Owners: business-math-review-fixes, graph-node-practice-program, and teacher-led-mastery-advantage.
- `8fed657a7` — Measure review and graph integration facts. Owners: the review and graph tracks listed above.
- `480b3f9f0` — repository architecture and workspace tooling. Owners: app-platform-consolidation, monorepo-architecture-contracts, and this track.
- `25f28638c` — restore quadratic-formula shared exports and input accessibility support after the first package quality run. Owners: graph-node-practice-program, teacher-led-mastery-advantage, and this track.

Residual state is limited to generated `.next`, `.vinext`, and coverage output, temporary review captures, the local `opencode.json`, an empty `=` file, two tracked generated route declarations, and one tracked Danielson output deletion. No residual source path lacks an owner.

## Phase 3: Final verification

- [x] Run `git diff --check` and the relevant quality gates.
- [x] Confirm that no committed path lacks an owner.
- [x] Record residual generated output and unresolved overlap.

Quality gates passed after the shared export fix: focused quadratic-formula tests (21/21), package lint, package typecheck, repository lint, repository typecheck, and package build.

Residual state remains limited to generated `.next`, `.vinext`, and coverage output, temporary review captures, the local `opencode.json`, an empty `=` file, two tracked generated route declarations, and one tracked Danielson output deletion. These paths remain outside the atomic source commits for explicit review.

## Remote sync: 2026-11-16

Daniel requested that all non-ignored local files be committed before the merge. This includes the residual output listed above.

- [x] Review and commit all non-ignored local files. Commit: `027925709`.
- [x] Merge origin/master. Preserve both histories. Commit: `12271c1dc`.
- [x] Run the required checks. Record failures.
- [x] Push master and verify remote equality. The remote accepted merge commit `12271c1dc`.

Pre-merge checks: `git diff --check` and `npx --no-install tsc --noEmit` passed. Lint, tests, and build stop before workspace execution because `debt.bus-math-undeclared` expired on 2026-10-31. This is an existing architecture gate failure. No dependencies were installed. The local file review found 114 untracked files. No file exceeded 50 MB. The text credential scan found no apparent credentials.

Merge checks: all eight conflicts are resolved. Preserve the local writing rules, current Oxlint commands, and v3.2 contract references. Preserve the remote plans and security update. All merged package dependency entries match the lockfile. The lockfile resolves React, React DOM, and React Server Components to 19.2.9. No dependencies were installed.

Post-merge `git diff --cached --check` and `npx --no-install tsc --noEmit` passed. Lint, tests, and build stop at the same expired architecture debt entry. Workspace execution did not start. The shared-machine heavy-job script is absent at the path specified by the remote instructions. No new application code was written.

Both parent histories are ancestors of the merge. The working directory was clean after the merge commit. The final plan update is included in the closeout push.
