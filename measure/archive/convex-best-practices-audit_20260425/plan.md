# Implementation Plan: Convex Best Practices Audit

## Phase 1: Function Registration Syntax — COMPLETE ✅

- [x] Task: Audit all 5 apps for old-style function registration syntax and missing `args` fields
  - [x] All apps use new object syntax. Zero findings.

## Phase 2: Argument Validators — COMPLETE ✅

- [x] Task: Audit all 5 apps for missing or incomplete `args` validators
  - [x] All 481 functions have explicit `args` validators. Zero findings.

## Phase 3: Return Validators — AUDITED ❌

- [x] Task: Audit all 5 apps for missing `returns` validators
  - [x] Finding: 481 functions across all 5 apps missing `returns` validators. Critical severity.
- [ ] Task: Add missing return validators across all apps

## Phase 4: Mutation Best Practices — COMPLETE ✅

- [x] Task: Audit all 5 apps for mutation anti-patterns
  - [x] Minor parallelization opportunities in teacher.ts. Mostly clean.

## Phase 5: Query Patterns — AUDITED ❌

- [x] Task: Audit all 5 apps for query anti-patterns
  - [x] Finding: 96+ `.filter()` uses where indexes could serve; 221+ unbounded `.collect()`; 4 in-memory date filtering instances. High severity.
- [ ] Task: Fix query anti-patterns across all apps

## Phase 6: Schema Quality — AUDITED ❌

- [x] Task: Audit all 5 apps for schema anti-patterns
  - [x] Finding: 110 `v.any()` fields across 5 schemas. High severity.

## Phase 7: Auth & Security — AUDITED ⚠️

- [x] Task: Audit all 5 apps for auth and security anti-patterns
  - [x] Finding: Missing `auth.config.ts` in 4 apps; 4 public seed mutations should be internal. Medium severity.

## Phase 8: Type Safety — AUDITED ⚠️

- [x] Task: Audit all 5 apps for type safety anti-patterns
  - [x] Finding: 8 `as any` casts (mostly justified); some `string` instead of `Id<>`. Medium severity.

## Phase 9: Error Handling — FIXED ✅

- [x] Task: Audit all 5 apps for error handling anti-patterns
  - [x] Finding: Zero uses of ConvexError. All 96 throws used bare Error.
- [x] Task: Fix error handling anti-patterns
  - [x] Converted 59 user-facing throws to ConvexError across IM3 and BM2.

## Phase 10: Component Usage — COMPLETE ✅

- [x] Task: Audit all 5 apps for Convex component anti-patterns
  - [x] No components in use. No boundary violations.

## Final

- [ ] Task: Update tech-debt.md — mark resolved items, add any new items discovered during audit
- [ ] Task: Update lessons-learned.md with audit insights
- [ ] Task: Measure - Final Verification and Handoff
