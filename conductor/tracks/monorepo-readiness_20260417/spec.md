# Specification: Monorepo Readiness Gate

> Execution detail packet: see `conductor/monorepo-jr-execution-spec.md`, section `monorepo-readiness_20260417`.

## Overview

Prepare both repos for safe monorepo work without moving source files. Capture explicit approvals and constraints so junior developers can execute subsequent tracks without guessing.

## Dependencies

- None

## Functional Requirements

- FR-1: Worktree State Audit: document all modified/untracked files in IM3 and BM2 and classify each as complete now, defer, or stash.
- FR-2: Toolchain Decision: record approved workspace approach (pnpm+turborepo or npm workspaces) and required commands.
- FR-3: Branching and Rollback: define branch naming, checkpoint tags, and rollback commands for file-move tracks.
- FR-4: Migration Control Artifacts: create migration index/checklist under Conductor for dependency tracking across tracks.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] IM3 and BM2 worktree states are documented with explicit owner decisions.
- [ ] Workspace/tooling decision is recorded and approved.
- [ ] Rollback strategy is documented and test commands are listed.
- [ ] Conductor migration control artifacts exist and are linked from this track.

## Out of Scope

- Moving app files into apps/.
- Creating shared packages.
- Changing CI pipelines.
