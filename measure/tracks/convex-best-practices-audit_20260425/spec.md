# Specification: Convex Best Practices Audit

## Overview

Systematic audit of all Convex backend code across 5 apps (integrated-math-3, bus-math-v2, integrated-math-1, integrated-math-2, pre-calculus) against Convex best practices. Each phase covers one audit category and evaluates all 5 apps, documenting findings and applying fixes inline.

## Scope

### In Scope

- All Convex function files: schema.ts, student.ts, teacher.ts, public.ts, activities.ts, auth.ts, and domain-specific files
- All seed files: seed.ts and seed/ subdirectories
- All 5 apps: IM3, BM2, IM1, IM2, PreCalc
- 10 audit categories (one per phase)
- Inline fixes for all findings (trivial and complex)

### Out of Scope

- Frontend code (React components, pages, lib/)
- Non-Convex API routes (Next.js route handlers)
- Test file refactoring (only fix test files if they break due to production code changes)

## Functional Requirements

### Phase 1: Function Registration Syntax
- Verify all functions use new object syntax (`{ args, handler, returns }`)
- Verify all functions have explicit `args: {}` (even empty)
- No old-style registered function syntax

### Phase 2: Argument Validators
- Every query, mutation, action, internalQuery, internalMutation, internalAction has explicit `args` validators
- Validators use `v` from `convex/values` correctly
- No raw/unguarded function arguments

### Phase 3: Return Validators
- Every function has a `returns` validator defined
- Return types match actual handler return values
- No functions returning implicit `null` without `v.null()` validator

### Phase 4: Mutation Best Practices
- Idempotency: mutations check current state before updating where it matters
- Direct patching: use `ctx.db.patch` without unnecessary reads
- Parallel writes: use `Promise.all` for independent updates
- OCC awareness: avoid unnecessary read-before-write patterns

### Phase 5: Query Patterns
- Using `withIndex` instead of `filter`
- Using `.take()` or pagination instead of `.collect()` for unbounded results
- No `.collect().length` for counting
- Proper index usage matching schema-defined indexes
- No in-memory filtering when an index could serve the query

### Phase 6: Schema Quality
- Indexes named correctly (`by_field1_and_field2` convention)
- No unbounded arrays in documents (should be separate tables)
- High-churn data separated from stable profile data
- Replace `v.any()` fields with typed validators (addresses open tech debt)

### Phase 7: Auth & Security
- No `userId` accepted as argument for auth purposes — identity derived from `ctx.auth.getUserIdentity()`
- Sensitive operations use `internalQuery`/`internalMutation`, not public `query`/`mutation`
- Auth config (`auth.config.ts`) exists where needed
- Internal functions are not unnecessarily exposed as public

### Phase 8: Type Safety
- Using `Id<"table">` not `string` for document IDs
- Using `Doc<"table">` for document types
- Using `QueryCtx`/`MutationCtx` from `_generated/server` — no `any`
- No production `as any` casts on Convex internal objects (addresses open tech debt)

### Phase 9: Error Handling
- User-facing errors use `ConvexError`
- Null checks on `ctx.db.get()` results before accessing properties
- No unhandled promise rejections

### Phase 10: Component Usage
- Proper use of `defineComponent` / `app.use` patterns
- Component boundary discipline (no importing across app/component lines)
- Component API surface follows Convex component authoring conventions

## Acceptance Criteria

1. All 10 phases completed across all 5 apps
2. Each finding documented with file, line, category, severity, and fix applied
3. All existing tests continue to pass after fixes
4. No `v.any()` fields remain in any Convex schema (Phase 6)
5. No production `as any` casts on Convex internal objects (Phase 8)
6. All functions have both `args` and `returns` validators (Phases 2-3)
7. Tech debt items addressed by this audit are updated in `tech-debt.md`

## Known Tech Debt Addressed

| Item | Phase | Sev |
|------|-------|-----|
| 21 `v.any()` fields in IM3 Convex schema | Phase 6 | Medium |
| 5 production `as any` casts on Convex internal (IM3) | Phase 8 | Medium |
| Internal Convex fns rely on action wrapper for auth | Phase 7 | Medium |
| getDueCards fetches all cards then filters by date in-memory | Phase 5 | Medium |
| SRS CardStore: studentId type mismatch | Phase 8 | High |
