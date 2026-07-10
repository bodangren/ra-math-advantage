# kst-srs.v3 Core Correctness Compatibility

## Compatible Additions

- Legacy four-field mastery configuration remains accepted through
  `normalizeMasteryConfig`; `hardGateThreshold` and `trendThreshold` receive
  normative defaults.
- `MasteryThresholds`, `MASTERY_THRESHOLDS_DEFAULT`, and the v2 schema remain
  available while consumers adopt `MasteryConfig`.
- Daily queue metadata is additive. The existing array-returning queue API can
  remain as a deprecated wrapper over the v3 result during migration.
- `prioritizeOverdue` remains readable in stored session configuration but is
  deprecated because v3 orders reviews by predicted retention.

## Intentionally Breaking Semantics

- `SRS_CONTRACT_VERSION` identifies `srs.contract.v3`.
- `stabilityToRetention(stability, elapsedDays)` changes the meaning of the
  second argument. All call sites must migrate atomically; retaining a scale
  factor interpretation under the same name is prohibited.
- Objective live retention becomes the minimum of reviewed variant cards and
  excludes cards with `reps = 0`.
- Hard-gate prerequisites become non-compensatory.
- Daily queues schedule reviews before new cards and suppress new cards during
  backlog mode.
- Placement may emit high-confidence direct evidence and synthesized review
  cards with explicit provenance.

## Ownership Migration

- `knowledge-space-core` owns graphs, validation, edge suggestions, edge
  calibration, equivalence, learner state, and readiness.
- `srs-engine` owns FSRS retention, proficiency, placement, review processing,
  and queues.
- `knowledge-space-practice` owns blueprints, generators, and role-specific
  projections; it consumes computed state rather than recreating readiness.
- `practice-core` owns `practice.v1`, timing, rating, error analysis, and the
  misconception lifecycle.

Current v2 bridge and placement exports remain compatibility-only until the
Phase 3 implementation tasks migrate consumers. Existing v2 calibration rows
must be versioned and recomputed; they are not valid inputs to v3 incremental
updates.

