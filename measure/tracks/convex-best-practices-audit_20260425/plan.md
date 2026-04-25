# Implementation Plan: Convex Best Practices Audit

## Phase 1: Function Registration Syntax

- [ ] Task: Audit all 5 apps for old-style function registration syntax and missing `args` fields
  - [ ] Scan IM3 convex/ files for old-style `query({...})` without `args`/`handler` object syntax
  - [ ] Scan BM2 convex/ files
  - [ ] Scan IM1 convex/ files
  - [ ] Scan IM2 convex/ files
  - [ ] Scan PreCalc convex/ files
  - [ ] Document all findings with file:line references
- [ ] Task: Fix function registration syntax across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Function Registration Syntax'

## Phase 2: Argument Validators

- [ ] Task: Audit all 5 apps for missing or incomplete `args` validators
  - [ ] Check every query/mutation/action/internal function in IM3 has explicit `args`
  - [ ] Check every query/mutation/action/internal function in BM2
  - [ ] Check every query/mutation/action/internal function in IM1
  - [ ] Check every query/mutation/action/internal function in IM2
  - [ ] Check every query/mutation/action/internal function in PreCalc
  - [ ] Document all findings with file:line references
- [ ] Task: Fix missing or incomplete argument validators across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Argument Validators'

## Phase 3: Return Validators

- [ ] Task: Audit all 5 apps for missing `returns` validators
  - [ ] Check every function in IM3 has explicit `returns` validator matching actual return type
  - [ ] Check every function in BM2
  - [ ] Check every function in IM1
  - [ ] Check every function in IM2
  - [ ] Check every function in PreCalc
  - [ ] Document all findings with file:line references
- [ ] Task: Add missing return validators across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Return Validators'

## Phase 4: Mutation Best Practices

- [ ] Task: Audit all 5 apps for mutation anti-patterns
  - [ ] Check IM3 mutations for: unnecessary read-before-patch, non-idempotent writes, missing Promise.all for parallel ops, OCC conflict risks
  - [ ] Check BM2 mutations
  - [ ] Check IM1 mutations
  - [ ] Check IM2 mutations
  - [ ] Check PreCalc mutations
  - [ ] Document all findings with severity (Critical/High/Medium/Low)
- [ ] Task: Fix mutation anti-patterns across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Mutation Best Practices'

## Phase 5: Query Patterns

- [ ] Task: Audit all 5 apps for query anti-patterns
  - [ ] Check IM3 for: `.filter()` instead of `.withIndex()`, unbounded `.collect()`, `.collect().length`, missing index usage, in-memory date filtering (addresses tech debt: getDueCards)
  - [ ] Check BM2
  - [ ] Check IM1
  - [ ] Check IM2
  - [ ] Check PreCalc
  - [ ] Document all findings with severity
- [ ] Task: Fix query anti-patterns across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Query Patterns'

## Phase 6: Schema Quality

- [ ] Task: Audit all 5 apps for schema anti-patterns
  - [ ] Check IM3 schema.ts for: incorrect index naming, unbounded arrays, high-churn data mixed with stable data, `v.any()` fields (addresses tech debt: 21 v.any() fields)
  - [ ] Check BM2 schema.ts
  - [ ] Check IM1 schema.ts
  - [ ] Check IM2 schema.ts
  - [ ] Check PreCalc schema.ts
  - [ ] Document all findings with severity
- [ ] Task: Fix schema anti-patterns across all apps
  - [ ] Fix IM3 findings (replace v.any() with typed validators)
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Schema Quality'

## Phase 7: Auth & Security

- [ ] Task: Audit all 5 apps for auth and security anti-patterns
  - [ ] Check IM3 for: userId as argument for auth, sensitive internal functions exposed as public, missing auth.config.ts, functions relying on action wrapper for auth (addresses tech debt)
  - [ ] Check BM2
  - [ ] Check IM1
  - [ ] Check IM2
  - [ ] Check PreCalc
  - [ ] Document all findings with severity
- [ ] Task: Fix auth and security anti-patterns across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Auth & Security'

## Phase 8: Type Safety

- [ ] Task: Audit all 5 apps for type safety anti-patterns
  - [ ] Check IM3 for: `string` instead of `Id<"table">`, missing `Doc<>` usage, `any` context params, production `as any` casts on Convex internal (addresses tech debt: 5 as-any casts, SRS CardStore type mismatch)
  - [ ] Check BM2
  - [ ] Check IM1
  - [ ] Check IM2
  - [ ] Check PreCalc
  - [ ] Document all findings with severity
- [ ] Task: Fix type safety anti-patterns across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Type Safety'

## Phase 9: Error Handling

- [ ] Task: Audit all 5 apps for error handling anti-patterns
  - [ ] Check IM3 for: missing `ConvexError` usage, unchecked `ctx.db.get()` null returns, unhandled promise rejections
  - [ ] Check BM2
  - [ ] Check IM1
  - [ ] Check IM2
  - [ ] Check PreCalc
  - [ ] Document all findings with severity
- [ ] Task: Fix error handling anti-patterns across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Error Handling'

## Phase 10: Component Usage

- [ ] Task: Audit all 5 apps for Convex component anti-patterns
  - [ ] Check IM3 for: improper `defineComponent`/`app.use`, boundary violations, non-standard component API surface
  - [ ] Check BM2
  - [ ] Check IM1
  - [ ] Check IM2
  - [ ] Check PreCalc
  - [ ] Document all findings with severity
- [ ] Task: Fix component usage anti-patterns across all apps
  - [ ] Fix IM3 findings
  - [ ] Fix BM2 findings
  - [ ] Fix IM1 findings
  - [ ] Fix IM2 findings
  - [ ] Fix PreCalc findings
- [ ] Task: Run tests and verify no regressions
- [ ] Task: Measure - Phase Completion Verification 'Component Usage'

## Final

- [ ] Task: Update tech-debt.md — mark resolved items, add any new items discovered during audit
- [ ] Task: Update lessons-learned.md with audit insights
- [ ] Task: Measure - Final Verification and Handoff
