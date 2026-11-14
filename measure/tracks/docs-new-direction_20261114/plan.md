# Implementation Plan: Project Documents for the New Direction

Track: `docs-new-direction_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Tasks

- Docs only. Mark a task `[~]` before its first edit and `[x]` after its commit.
- Use the planned marker of spec W1. Check each fact against the repository (spec W2).
- Record each check and each unchanged file in `evidence.md` in this track folder.
- Do not push. Only the closeout step pushes.

## Phase 1: Rewrite the project documents [checkpoint: 9941117]
_Story ref: spec.md#story-s1_

- [x] Task: Rewrite README.md for the new direction (group 1) 5711189
    - [ ] Create `evidence.md` with these sections: Facts, Unchanged Files, INTEGRATION Sections, Test Constraints.
    - [ ] Record the facts of spec "Current System" under "Facts", with the command of each check.
    - [ ] Rewrite `README.md`: the current apps and packages, the planned direction of spec W3, the dev commands of today, and the license facts. Keep the license line.
    - [ ] Commit: `docs: rewrite README for the new direction`.
- [x] Task: Rewrite AGENTS.md for the new direction (group 2) b4439ca
    - [ ] Rewrite `AGENTS.md`: the scope of today, the planned direction, the planned marker rule (spec W1), the cross-project rules, and the shared machine rules (spec W3 items 8 to 10). `CLAUDE.md` stays `@AGENTS.md`.
    - [ ] Commit: `docs: rewrite AGENTS.md for the new direction`.
- [x] Task: Update the Measure core documents (group 3) ab65527
    - [ ] Update `measure/index.md`, `measure/product.md`, `measure/architecture.md`, `measure/tech-stack.md`, `measure/knowledge-space.md`, and `measure/current_directive.md`.
    - [ ] Confirm the W5 constraints with `grep`. Record each result under "Test Constraints".
    - [ ] Commit: `docs(measure): update the core documents for the new direction`.
- [x] Task: Fix the wrong instructions of the other Measure documents (group 4) 2632a84
    - [ ] Change only each sentence that gives a wrong instruction today in the other `measure/*.md` files (spec W4, W7).
    - [ ] List each file that stays as it is under "Unchanged Files".
    - [ ] Commit: `docs(measure): fix the wrong instructions in the reference documents`.
- [x] Task: Fix the contradictions of INTEGRATION.md (group 5) 07067b2
    - [ ] Change only each contradiction with the current state or the direction.
    - [ ] List the other old sections under "INTEGRATION Sections" for `math-app-retire-old-apps_20261114`.
    - [ ] Commit: `docs: fix the contradictions in INTEGRATION.md`.
- [x] Task: Amend the document tasks of the retire track (group 6) 3839d1d
    - [ ] In `measure/tracks/math-app-retire-old-apps_20261114/spec.md` and `plan.md`, add: each planned marker of the math app items changes into current-state text.
    - [ ] Commit: `chore(measure): Amend track 'Retire the Old Math Apps' (planned markers)`.
- [x] Task: Measure - User Manual Verification 'Phase 1: Rewrite the project documents' (Protocol in workflow.md) 9941117
    - [ ] Run `npm run generate` and `npm run doctor`. Record each exit code.
    - [ ] Run the protocol: the manual verification plan and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 1: Rewrite the project documents' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0, with no archive step: the metadata, the registry, and the generated facts.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
