# Track 2: Weighted Readiness — Implementation Plan

Workflow: Contract-First, then per-task TDD (red/green). >80% coverage.
Depends on: Track 1 (getKnowledgeState, getOuterFringe, threshold config).

## Phase 1 — Contract & Schema
[checkpoint: cd0666a]

- [x] Task: Define readiness types and threshold config [6a7845a]
    - [x] Readiness score type; readiness state enum (ready / nearly_ready / blocked) [6a7845a]
    - [x] Add readyThreshold (0.80) and nearThreshold (0.50) to Track 1's threshold block [6a7845a]
    - [x] Extend node-state types to include nearly_ready [6a7845a]
- [x] Task: Measure - User Manual Verification 'Phase 1' [cd0666a]

## Phase 2 — Readiness Engine
[checkpoint: 11a782d]

- [x] Task: Implement readiness(B) (TDD) [a5f12b3]
    - [x] Tests: no prerequisites (=1), partial, full, decaying-prerequisite cases [a5f12b3]
    - [x] Pure function consuming Track 1 mastery levels and edge weights [a5f12b3]
- [x] Task: Integrate weighted readiness into getOuterFringe (TDD) [a5f12b3]
    - [x] Replace binary gating; fringe = ready ∪ nearly_ready with scores [a5f12b3]
- [x] Task: Measure - User Manual Verification 'Phase 2' [11a782d]

## Phase 3 — Projection Integration
[checkpoint: 3910d2f]

- [x] Task: Update visualization computeNodeState and student payload (TDD) [8681c05]
    - [x] computeNodeState consumes weighted readiness; expose nearly_ready bucket [8681c05]
- [x] Task: Update in-repo kst-srs.v2 spec §5.3 (weight semantics + readiness formula) [8681c05]
- [x] Task: Measure - User Manual Verification 'Phase 3' [3910d2f]

## Phase 4 — Docs & Doctor + Closeout
[checkpoint: cc1206b]

- [x] Task: Run measure/generate.sh and measure/doctor.sh; fix architectural lint [cc1206b]
- [x] Task: Final verification — boundary lints, npm run lint, tsc --noEmit, CI=true npm run test [cc1206b]
- [x] Task: Measure - User Manual Verification 'Phase 4' [cc1206b]

## Final Acceptance

- **FR1:** `readiness(B) = Σ(wᵢ·mᵢ)/Σ(wᵢ)`, readiness=1 when no prereqs ✅ [a5f12b3]
- **FR2:** `ready` (≥0.80), `nearly_ready` (≥0.50), `blocked` (otherwise) ✅ [a5f12b3]
- **FR3:** `getOuterFringe` default = weighted readiness; fringe = ready ∪ nearly_ready (blocked excluded); entries carry scores ✅ [a5f12b3]
- **FR4:** `computeNodeState` enriches with readiness; `StudentVisualizationV1` has `nearlyReady` bucket; IM3 handler maps nearly_ready ✅ [8681c05]
- **FR5:** `kst-srs.v2/SPECIFICATION.md` §5.3 documents weight semantics + formula ✅ [8681c05]
- **AC1–AC6:** All acceptance criteria verified ✅ [cc1206b]
- **Anti-patterns A1/A3/A4/A5/A6:** Clean ✅ [cc1206b]
