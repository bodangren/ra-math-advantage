# Knowledge Space Practice Projection Audit

> Placeholder audit report. This document will be filled when domain packages are wired and the comparison tooling is run against existing activity maps.

## Purpose

This document tracks the comparison between projection-generated activity maps and existing manually-authored `practice.v1` activity maps. Projections are regenerated outputs, not source truth — the knowledge space graph is canonical.

## Comparison Process

1. Run `projectActivityMap()` with the domain's knowledge space nodes, edges, and blueprints.
2. Compare generated rows against the existing `implementation/practice-v1/activity-map.json`.
3. For each row in both maps:
   - **Missing in generated**: Row exists in existing map but was not produced by the projection (manual override, non-standard activity, deprecated content).
   - **Extra in generated**: Row was produced by the projection but does not exist in the existing map (newly covered skill, missing manual entry).
   - **Changed**: Both maps have the row but fields differ (reviewer needs to decide which is correct).
4. Review diffs before replacing app artifacts.
5. Only overwrite existing maps after comparison tests pass and diffs are reviewed.

## Important Notes

- Actual comparison will be done when domain packages (math-content, English/GSE content) are wired to the projection pipeline.
- This file should be updated each time a course rollout track (T9-T12) runs the full projection pipeline.
- Treat existing manually-authored activity maps as comparison baselines, not canonical truth.

## Projection Pipeline

The full pipeline for a domain:

```
KnowledgeSpace (nodes + edges)
    +
KnowledgeBlueprints
    │
    ├── projectActivityMap()       → ProjectedActivity[] (practice.v1 rows)
    ├── projectSrsInputs()         → SrsProjectionEntry[] (SRS card targets)
    ├── projectTeacherEvidence()   → TeacherEvidence (standards/skills/gaps)
    ├── projectStudentVisualization()  → StudentVisualizationV1
    ├── projectParentVisualization()   → ParentVisualizationV1
    └── projectTeacherVisualization()  → TeacherVisualizationV1
```

## Audit Status

| Domain | Status | Date | Notes |
|--------|--------|------|-------|
| Math (IM3) | Pending | — | Awaiting T8 pilot and T9-T12 rollouts |
| English/GSE | Pending | — | Awaiting domain package wiring |
| Other domains | Pending | — | — |
