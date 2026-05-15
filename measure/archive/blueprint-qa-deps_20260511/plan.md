# Implementation Plan: Blueprint QA Harness — Workspace Dependency Import

- [x] Add `@math-platform/math-content`, `@math-platform/activity-components`, `@math-platform/knowledge-space-practice` to `apps/bus-math-v2/package.json` dependencies
- [x] Verify `npx tsc --noEmit` passes in `apps/bus-math-v2`
- [x] Verify `npm run lint` passes in `apps/bus-math-v2`
