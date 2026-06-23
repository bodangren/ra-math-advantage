# FR-2 Step A — 144-File Restore Confirmation (Phase 1 Green)

**Action:** `git restore --staged --worktree -- $(cat _artifacts/restored-files.txt)`
**Date:** 2026-06-24
**Track:** code-review-remediation_20260624
**Phase:** 1 (Cluster A — Malformed JSDoc)
**Task:** FR-2 step A — discard the malformed JSDoc working-tree batch

## Pre-restore state

- `git status --short | wc -l` reported 144 `M packages/|apps/|convex/` entries
  (the malformed JSDoc batch introduced by an agent-driven typed-JSDoc pass).
- The list was captured into `_artifacts/restored-files.txt` BEFORE the restore
  (during Red phase) so this audit trail is reproducible.
- Aggregate FR-3 guard violation count on the dirty tree: **358**.

## Action

Each line in `_artifacts/restored-files.txt` is a path like
`" M packages/foo/bar.ts"`. The leading `" M "` (git status porcelain prefix)
was stripped before passing to `git restore` so the command received a clean
list of 144 file paths. The restore used `--staged --worktree` to revert both
the index and the worktree back to HEAD for each of the 144 files.

## Post-restore state

- `git status --short | wc -l` reduced from 148 (144 + 2 junk + 2 archive) to 5
  (unrelated items: `M measure/automation-supervisor.py`, `?? --db`,
  `?? --symbol`, 2 archive untracked).
- The 144 files are byte-identical to HEAD for each path.
- FR-3 guard aggregate violation count on the post-FR-1 + post-restore tree
  (with the 2 additional @param fixes): **0** (exit 0).

## Sampled verification (FR-2 step-A strategy risk 3)

Spot-checked 5 files via `git diff --stat` BEFORE the restore:

- `packages/knowledge-space-core/src/validation.ts` — 26 +/-, all lines JSDoc
  tags (function descriptions, @param, @returns).
- `packages/teacher-reporting-core/src/teacher-reporting/gradebook.ts` — 50 +/-,
  all JSDoc tag rewrites.
- `packages/knowledge-space-core/src/placement-fixtures.ts` — 30 +/-,
  all JSDoc tag rewrites.
- `packages/practice-core/src/practice/error-analysis/index.ts` — 38 +/-,
  all JSDoc tag rewrites.
- `packages/knowledge-space-practice/src/projections/activity-map.ts` — 28 +/-,
  all JSDoc tag rewrites.

Pattern across all 5 samples: every change is a 1-for-1 line replacement of
JSDoc lines (no logic changes, no signature changes, no import changes). The
batch is pure JSDoc batch output, confirming the strategy assumption that the
restore is safe to apply in bulk.

## What was NOT touched (per strategy constraints)

- `--db` and `--symbol` (untracked junk files, owned by FR-15 / Phase 8)
- `measure/automation-supervisor.py` (pre-existing unrelated dirty state)
- `measure/archive/.../closeout-audit-result.json` (archived files, untracked)
- All `M` files NOT in the 144-file list (none exist after restore)
- The `--db` / `--symbol` junk files are tracked in `plan.md` Phase 8 (FR-15)

## Why this commit is empty

`git restore --staged --worktree` brings the worktree back to HEAD. The commit
body serves as an audit log of the action; the diff is intentionally empty so
the post-commit `git status --short` reflects a clean tree (modulo
non-Phase-1 items). The 144 file paths are listed in the commit body for
historical reference.
