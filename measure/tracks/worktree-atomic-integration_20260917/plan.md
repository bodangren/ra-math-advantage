# Implementation Plan: Worktree Atomic Integration

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
