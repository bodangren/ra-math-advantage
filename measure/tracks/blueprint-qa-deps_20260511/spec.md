# Specification: Blueprint QA Harness — Workspace Dependency Import

## Objective
Add required workspace packages as dependencies in `apps/bus-math-v2/package.json` so the Blueprint QA Harness (T14) can import generators, component registry, and blueprint types.

## Dependencies to Add
- `@math-platform/math-content": "*"` — generator registry (`getGenerator`)
- `@math-platform/activity-components": "*"` — component registry (`getActivityComponent`)
- `@math-platform/knowledge-space-practice": "*"` — blueprint types (`KnowledgeBlueprint`, `GeneratorOutput`, etc.)

## Acceptance Criteria
- `npm run lint` passes in `apps/bus-math-v2`
- `npm run build` passes in `apps/bus-math-v2` (or at minimum `npx tsc --noEmit` in `apps/bus-math-v2`)
- No regressions in existing BM2 imports
