# Monorepo Migration Index

**Track:** `monorepo-readiness_20260417`
**Created:** 2026-04-18
**Status:** COMPLETE

## Repository State

| Repo | Branch | Status | Notes |
|------|--------|--------|-------|
| IM3 (`ra-integrated-math-3`) | master | Clean | Ahead of origin by 0 commits |
| BM2 (`bus-math-v2`) | main | Clean | Ahead of origin by 2 commits (session revocation hardening) |

## Toolchain Decision

**Status:** APPROVED — npm workspaces

**Chosen:** npm workspaces (no new dependency manager required)

| Option | Decision | Rationale |
|--------|----------|-----------|
| npm workspaces | **APPROVED** | Uses existing `package-lock.json`; no dependency manager change required; satisfies non-negotiable rule #3 |
| pnpm + Turborepo | Deferred | Requires explicit approval per non-negotiable rule #3; can be evaluated post-migration if npm workspaces prove insufficient |

### Approved Workspace Structure

```json
// root package.json additions
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### Root Commands (after tooling-shell track)

```bash
# Run IM3 gates
npm run --workspace=apps/integrated-math-3 lint
npm run --workspace=apps/integrated-math-3 test
npm run --workspace=apps/integrated-math-3 typecheck
npm run --workspace=apps/integrated-math-3 build

# Run BM2 gates
npm run --workspace=apps/bus-math-v2 lint
npm run --workspace=apps/bus-math-v2 test
npm run --workspace=apps/bus-math-v2 build

# Run all tests
npm run -w apps/integrated-math-3 test
npm run -w apps/bus-math-v2 test
```

**Decision Recorded:** 2026-04-18 by autonomous phase 2 implementation

## Branch Naming Convention

All monorepo migration tracks use this convention:

```
migration/<track-id>
```

Examples:
- `migration/monorepo-readiness`
- `migration/monorepo-tooling-shell`
- `migration/move-im3-app-to-apps`
- `migration/extract-practice-core`

**Working branch for this track:** `migration/monorepo-readiness` (current)

## Rollback Protocol

### Before Any File-Move Track

```bash
# Create checkpoint branch BEFORE moving files
git checkout -b checkpoint/pre-move-<track-id>

# If move fails, restore from checkpoint
git checkout checkpoint/pre-move-<track-id>
git branch -D migration/<track-id>  # delete failed branch
```

### Abort In-Progress File Move

```bash
# If mid-move and need to abort:
git reset --hard HEAD~1  # rollback one commit

# Or restore specific paths to previous state:
git checkout HEAD~1 -- <path>
```

### Rollback Command Sequence by Track Type

**For app move tracks (1.2, 4.1):**
```bash
# 1. Restore moved directories to original locations
git mv apps/integrated-math-3/* ./  # reverse direction

# Or full reset:
git reset --hard checkpoint/pre-move-<track-id>
```

**For extraction tracks (2.x, 3.x, 5.x):**
```bash
# Remove package imports and restore local imports
# Then:
git checkout HEAD~1 -- apps/integrated-math-3/lib/<package>
```

**For tooling shell track (1.1):**
```bash
# Remove workspace config additions from root package.json
# Then:
git reset --hard checkpoint/pre-move-<track-id>
```

### Checkpoint Cadence

| Milestone | Action |
|-----------|--------|
| Before `monorepo-tooling-shell` | Tag `checkpoint/pre-tooling-shell` |
| Before `move-im3-app-to-apps` | Tag `checkpoint/pre-im3-move` |
| After successful IM3 move | Tag `checkpoint/post-im3-move` |
| Before `move-bm2-app-to-apps` | Tag `checkpoint/pre-bm2-move` |
| After successful BM2 move | Tag `checkpoint/post-bm2-move` |

**Tag format:** `git tag checkpoint/<name> <commit>`

## Migration Track Registry

### Wave 0 — Readiness
| Order | Track ID | Status | Depends On |
|-------|----------|--------|------------|
| 0.1 | `monorepo-readiness_20260417` | **COMPLETE** | None |

### Wave 1 — Host Monorepo Shell
| Order | Track ID | Status | Depends On | Exit Gate |
|-------|----------|--------|------------|-----------|
| 1.1 | `monorepo-tooling-shell_20260417` | Pending | 0.1 | Tooling approved |
| 1.2 | `move-im3-app-to-apps_20260417` | Pending | 1.1 | IM3 runs from apps/ |
| 1.3 | `monorepo-boundary-guards_20260417` | Pending | 1.2 | Guards operational |

### Wave 2 — Core Engine Packages
| Order | Track ID | Status | Depends On |
|-------|----------|--------|------------|
| 2.1 | `extract-practice-core_20260417` | Pending | 1.2 |
| 2.2 | `extract-srs-engine_20260417` | Pending | 2.1 |
| 2.3 | `extract-core-auth-convex_20260417` | Pending | 1.2 |

### Wave 3 — Runtime and Approval
| Order | Track ID | Status | Depends On |
|-------|----------|--------|------------|
| 3.1 | `extract-activity-runtime_20260417` | Pending | 2.1 |
| 3.2 | `extract-component-approval_20260417` | Pending | 3.1 |
| 3.3 | `extract-graphing-core_20260417` | Pending | 3.1 |

### Wave 4 — Bring BM2 In
| Order | Track ID | Status | Depends On |
|-------|----------|--------|------------|
| 4.1 | `move-bm2-app-to-apps_20260417` | Pending | Waves 1-2 |
| 4.2 | `bm2-consume-core-packages_20260417` | Pending | 4.1 |
| 4.3 | `bm2-consume-runtime-packages_20260417` | Pending | 4.2 |

### Wave 5 — Feature Packages
| Order | Track ID | Status | Depends On |
|-------|----------|--------|------------|
| 5.1 | `extract-practice-test-engine_20260417` | Pending | 4.1 |
| 5.2 | `extract-study-hub-core_20260417` | Pending | 4.1 |
| 5.3 | `extract-teacher-reporting-core_20260417` | Pending | 4.1 |
| 5.4 | `extract-ai-tutoring-and-adopt-im3_20260417` | Pending | 4.1 |
| 5.5 | `extract-workbook-pipeline-and-adopt-im3_20260417` | Pending | 4.1 |

### Wave 6 — Hardening
| Order | Track ID | Status | Depends On |
|-------|----------|--------|------------|
| 6.1 | `monorepo-ci-deploy-hardening_20260417` | Pending | Waves 1-5 |
| 6.2 | `monorepo-docs-and-cleanup_20260417` | Pending | 6.1 |

## Blocker Summary

| Item | Severity | Status | Notes |
|------|----------|--------|-------|
| Package manager approval | High | **Resolved** | npm workspaces approved (2026-04-18) |
| IM3 worktree | - | Clear | Clean, no pending changes |
| BM2 worktree | - | Clear | 2 commits ahead (non-blocking) |

**Wave 0 Status: COMPLETE — Wave 1 (monorepo-tooling-shell) is now unblocked.**

## References

- Strategy: `conductor/monorepo-plan.md`
- Junior Execution: `conductor/monorepo-jr-execution-spec.md`
- Track Playbook: `conductor/monorepo-track-playbook.md`