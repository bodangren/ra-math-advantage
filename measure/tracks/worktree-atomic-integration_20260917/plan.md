# Implementation Plan: Worktree Atomic Integration

## Phase 1: Inventory and ownership

- [x] Count tracked and untracked paths.
- [x] Read the Measure index, workflow, registry, and owning track plans.
- [x] Separate source, documentation, and generated output.

## Phase 2: Atomic integration

- [~] Stage one reviewed group at a time.
- [ ] Commit each group with an owner track in the message.
- [ ] Add a Git note to each integration commit.
- [ ] Record each commit in the owning plan.

## Phase 3: Final verification

- [ ] Run `git diff --check` and the relevant quality gates.
- [ ] Confirm that no committed path lacks an owner.
- [ ] Record residual generated output and unresolved overlap.
