# Spec: Convex Schema Strict Validation

## Overview

The IM3 Convex schema contains 21 `v.any()` fields that provide zero runtime validation on critical data paths (content, props, submissionData, evidence, fsrsState). Additionally, 5 production `as any` casts exist on Convex `internal` calls due to stale generated types. This track hardens the schema and eliminates unsafe casts.

## Functional Requirements

1. Audit all 21 `v.any()` fields in `convex/schema.ts` and replace with proper Zod-style Convex validators
2. Regenerate Convex types via `npx convex dev` to resolve stale `api.d.ts`
3. Eliminate all 5 `as any` casts on `internal` by using properly typed generated API references
4. Ensure all existing tests pass after schema changes
5. Add validation tests for previously-unvalidated fields

## Non-Functional Requirements

- No breaking changes to existing Convex queries/mutations
- Schema must remain backward-compatible with existing data
- All validators must handle null/undefined gracefully for existing documents

## Acceptance Criteria

- [ ] Zero `v.any()` fields remain in `convex/schema.ts`
- [ ] Zero `as any` casts on `internal` in production code
- [ ] `npx convex dev` generates clean types with no errors
- [ ] All existing Vitest tests pass
- [ ] New validation tests cover each previously-`v.any()` field

## Out of Scope

- BM2 schema changes (separate app)
- Data migration of existing documents
- New table additions
