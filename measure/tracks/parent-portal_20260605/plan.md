# Track: Parent Portal — Implementation Plan

Workflow: Contract-First (role + linking + projection consumption), then per-task TDD. >80% on guards/logic.
Boundary rule: consume the parent projection payload; no raw-graph or teacher data.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

## Phase 1 — Parent Role, Auth & Linking

- [~] Task: Add parent role + fail-closed guards (linked-students-only) (TDD)
- [~] Task: Parent↔student linking mechanism (teacher/invite), revocable (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

### Phase 1 — Red-phase evidence (MID, 2026-06-19)

Targeted Red commands and observed fail counts (real vitest output, no fake harness):

- `npm run --workspace=apps/integrated-math-3 test -- __tests__/lib/auth/parent-role-guard.test.ts`
  → 1 failed suite, 0 tests executed. Failure: `Failed to resolve import "@/lib/auth/parent-server-guards"` (module does not exist — implementation missing). Tests added: UserRole widening via `expectTypeOf` (3 cases), `requireParentRequestClaims` runtime (7 cases), `requireParentServerSessionClaims` runtime (2 cases). Total cases: 12.
- `npm run --workspace=apps/integrated-math-3 test -- __tests__/convex/parent/links.test.ts`
  → 1 failed suite, 0 tests executed. Failure: `Failed to resolve import "@/convex/parent/links"` (module does not exist — implementation missing). Tests added: `createParentLink` (9 cases), `revokeParentLink` (4 cases), `listParentLinks` (3 cases). Total cases: 16.

Both Red commands execute the real vitest binary against a single explicit file path (per test-strategy.md §7 bounded-smoke rule). Both fail because the implementation is missing, not because of a stale durable record.

Red-phase companion doc: `measure/tracks/parent-portal_20260605/test-strategy.md` (untracked at start of MID; folded into the same commit).

Dirty worktree classification at MID start (per spec):

- `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts` (modified) — unrelated user work; preserved, NOT staged in this commit.
- `graph.db` (modified) — generated build artifact; preserved, NOT staged.
- `measure/automation-supervisor.py` (modified, ACCEPTANCE_MODEL env default) — unrelated user work; preserved, NOT staged.

Phase-end worktree cleanup is the supervisor's job, not the Red-phase commit.

### Phase 1 — Red-phase boundary fix (MID, 2026-06-19, post-supervisor-gate)

Supervisor gate flagged `graph.db` as a Red-phase boundary violation: although
the file was already dirty at MID start and was never directly edited by the
MID agent, `build-graph stats` / `build-graph search` / `build-graph inspect`
queries run during graph-context probing caused SQLite to update the file's
journal/mtime, leaving it dirty in the worktree at end-of-attempt. The previous
attempt's commit `c4cffe1a` did not stage `graph.db`, but the worktree residue
tripped the boundary gate.

Fix applied (mid-attempt-2, doc-only commit):

- `git checkout HEAD -- graph.db` → restored to its committed state.
- Verified: `git diff graph.db` is empty; `git status --porcelain` no longer
  lists `graph.db`.
- Re-ran both Red commands; tests still fail with the same module-resolution
  errors (parent-server-guards and convex/parent/links do not exist). No
  regression in Red signal.

Remaining unrelated dirty files (preserved per spec, NOT touched):

- `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts`
- `measure/automation-supervisor.py`

Lesson learned (for tech-debt.md consideration, not edited in this attempt):

- Read-only `build-graph` queries against an SQLite-backed graph.db can
  silently update mtime/journal and re-dirty the worktree. Future MID-attempts
  using build-graph probing should either (a) snapshot+restore graph.db
  around the probe, or (b) treat graph.db as a write-once artifact and
  exclude it from the dirty-worktree boundary check via `.gitignore` after
  a one-time intentional commit.

## Phase 2 — Parent Progress View

- [ ] Task: Query + render the parent visualization projection (progress/mastery/engagement), read-only (TDD)
- [ ] Task: Multi-student switcher (TDD)
- [ ] Task: Privacy assertions — no teacher-only/other-student/raw-graph data (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — States & Verification

- [ ] Task: Empty/pending states (pre-link, no-activity)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)
