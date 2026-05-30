# Specification: JSDoc Comments

## Overview

Add standard JSDoc comments to all exported functions across `apps/integrated-math-3/`, `apps/bus-math-v2/`, and `packages/`. The build-graph knowledge graph reports 2,108 functions with `NULL` summaries out of 2,266 total (93% undocumented). Each function gets a one-sentence summary, `@param` tags, `@returns` description, and `@throws` where applicable. Work proceeds directory-by-directory, exported functions first.

## Functional Requirements

- **FR-1:** For every exported function in scope, add a JSDoc block with a one-sentence summary, typed `@param` for each parameter, `@returns` description, and `@throws` if the function can throw.
- **FR-2:** For every non-exported (internal) function in scope, add the same standard JSDoc block.
- **FR-3:** Work proceeds directory-by-directory in the order: `lib/` → `components/` → `convex/` → `app/` → `scripts/` → `src/` → `other`.
- **FR-4:** Within each directory phase, exported functions are documented first, then internal functions.
- **FR-5:** JSDoc must be valid TypeScript-flavored JSDoc — use `@param {type} name - description` format with types matching the TS signature.
- **FR-6:** Do not change any function signatures, logic, or behavior — documentation-only changes.
- **FR-7:** After each directory phase, run `build-graph update` to refresh the graph and confirm the documented function count increased.

## Non-Functional Requirements

- No functional regressions — all existing tests must still pass after each phase.
- JSDoc comments must not exceed 120 chars per line.

## Acceptance Criteria

- `build-graph stats` shows 0 functions with `NULL` summaries for in-scope apps/packages after track completion.
- `npm run lint` passes with no new warnings.
- `npm run test` passes with no regressions.

## Out of Scope

- `apps/integrated-math-1/`, `apps/integrated-math-2/`, `apps/pre-calculus/` (not in AGENTS.md scope).
- React component props documentation (JSDoc on component functions only, not prop types).
- README or architecture documentation updates.
