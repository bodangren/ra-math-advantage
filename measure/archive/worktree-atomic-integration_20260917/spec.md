# Worktree Atomic Integration Specification

## Objective

Associate the current uncommitted work with its owning Measure tracks. Commit each reviewed change group as one atomic commit. Preserve generated output outside the commits.

## Scope

- Review the current worktree without discarding user changes.
- Group application and shared-package changes by owning track.
- Keep build output, coverage output, temporary files, and review captures outside commits.
- Add a Git note to each integration commit.
- Record the commit mapping in the owning Measure plans.

## Constraints

- Do not use destructive Git commands.
- Do not add dependencies without approval.
- Do not claim feature completion from an integration commit alone.
- Do not add hashes, checksums, or manifests.

## Acceptance criteria

1. Every committed source path has an owner track.
2. Every integration commit has a clear message and a Git note.
3. Generated output remains uncommitted and is listed as residual worktree state.
4. Measure plans record the resulting commit IDs and verification limits.
