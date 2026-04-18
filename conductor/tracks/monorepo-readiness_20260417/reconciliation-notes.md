# Reconciliation Notes

## Monorepo Readiness Gate

### Phase 1: Audit and Triage (Complete)

## Worktree State

### IM3 (`/Users/daniel.bodanske/Desktop/ra-integrated-math-3`)
```
On branch master
Your branch is up to date with 'origin/master'.
nothing to commit, working tree clean
```

### BM2 (`/Users/daniel.bodanske/Desktop/bus-math-v2`)
```
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
nothing to commit, working tree clean
```
BM2 local commits:
- `80a3862` Session Revocation: wire requireActiveRequestSessionClaims into all mutating API routes
- `5ea2139` k2p5: Phase 1 — Add requireActiveStudentRequestClaims and requireActiveTeacherRequestClaims helpers

## Delta Classification

### IM3
- **complete now**: All tracked changes committed
- **defer**: None
- **stash**: None

### BM2
- **complete now**: Session revocation hardening (2 local commits ahead of origin)
- **defer**: None
- **stash**: None

## Blocker Assessment

| Blocker | Owner | Unblock Condition | Severity |
|---------|-------|-------------------|----------|
| None | - | - | - |

### Known Pre-Existing Issues (Non-Blocking)
- 35 `@typescript-eslint/no-explicit-any` violations in test mocks (tech-debt item 47, Medium)
- 8 equivalence validator test failures (tech-debt item 41, Low)

## Verification Results

### IM3 Baseline Gates
- `npm run lint`: 35 errors (pre-existing, documented)
- `npm run test`: 8 failed, 3354 passed (pre-existing, documented)
- `npm run build`: not run (lint errors present)

Exit gate assessment: Baseline is stable with known pre-existing issues documented in tech-debt.md. No structural migration blockers identified.

### Phase 2: Tooling and Governance Decision (Complete)

## Toolchain Decision

**Approved:** npm workspaces

| Option | Decision | Rationale |
|--------|----------|-----------|
| npm workspaces | **APPROVED** | Uses existing `package-lock.json`; no dependency manager change; satisfies non-negotiable rule #3 |
| pnpm + Turborepo | Deferred | Requires explicit approval per non-negotiable rule #3 |

## Branch Naming Convention

All monorepo migration tracks use: `migration/<track-id>`

Examples:
- `migration/monorepo-tooling-shell`
- `migration/move-im3-app-to-apps`
- `migration/extract-practice-core`

## Rollback Protocol

**Checkpoint branches:** `checkpoint/pre-<track-name>` before any structural change

**Abort in-progress move:**
```bash
git reset --hard HEAD~1
git checkout HEAD~1 -- <path>
```

**Checkpoint cadence:**
- `checkpoint/pre-tooling-shell` before Wave 1.1
- `checkpoint/pre-im3-move` before Wave 1.2
- `checkpoint/post-im3-move` after successful IM3 move
- `checkpoint/pre-bm2-move` before Wave 4.1
- `checkpoint/post-bm2-move` after successful BM2 move