# Track: Extract Shared Math Content Package

## Overview

Extract practice problems, worked examples, algebraic logic, glossaries, and lesson seed patterns from IM2, IM3, and PreCalc into a single shared `@math-platform/math-content` package. This enables maximum code reuse across apps for review, revision, remediation, and future content authoring. Also resolves two open tech debt items: replacing `v.any()` fields in IM3 Convex schema with typed validators, and migrating IM3 local activity component imports to the shared package.

## Motivation

Currently, problem families (87 in IM3, 71 in IM2, 41 in PreCalc), algebraic logic (distractors, equivalence), glossary terms (76 in IM3, 30 in BM2), and Zod schemas are duplicated or app-local. Each new app must re-implement or copy this content. A shared package will:

1. **Eliminate duplication** — problem family data, distractor generators, and glossary definitions exist in 3+ places
2. **Enable cross-app review/remediation** — any app can reference any problem family by ID
3. **Unify activity schemas** — currently duplicated between `activity-components` and IM3 local copies
4. **Resolve tech debt** — fold in `v.any()` schema fixes and local import migration
5. **Prepare for IM1 content authoring** — infrastructure will be ready when IM1 curriculum content is written

## Scope

### In Scope

- **New package**: `packages/math-content/` with `@math-platform/math-content` name
- **Problem family extraction**: Migrate IM2 (71), IM3 (87), PreCalc (41) problem family seed data into `@math-platform/math-content/problem-families/` with per-app subdirectories
- **Algebraic logic extraction**: Move IM3 `distractors.ts` (295 lines) and `equivalence.ts` (508 lines) to `@math-platform/math-content/algebraic/`
- **Glossary extraction**: Unify IM3 (76 terms, English-only, `modules` field) and BM2-style glossary schemas into shared `@math-platform/math-content/glossary/` with course-agnostic type + per-app term data. BM2 terms themselves excluded; only the type system is unified.
- **Lesson seed patterns**: Extract the common lesson/version/phase/activity seeding pattern into shared utility functions
- **Activity schema consolidation**: Move canonical Zod schemas (6 component types) from `activity-components/src/schemas/` and IM3 local copies into `@math-platform/math-content/schemas/`. `activity-components` re-exports from math-content.
- **IM3 local import migration**: Replace all IM3 local `lib/activities/schemas/` and `lib/activities/algebraic/` imports with `@math-platform/math-content` imports
- **Tech debt resolution**: Replace remaining `v.any()` fields in IM3 Convex schema with typed validators from math-content schemas where applicable
- **BM2**: Excluded — BM2 activity components, glossary terms, and seeding patterns remain local

### Out of Scope

- **IM1 curriculum authoring** — deferred to existing pending track
- **BM2 content extraction** — explicitly excluded
- **New activity component types** — no new UI components
- **Content authoring for new problem families** — this track moves existing content, doesn't author new content
- **Practice test question banks** — remain app-local per existing architecture

## Functional Requirements

### FR-1: Package Structure

`@math-platform/math-content` must expose these entry points:

```
packages/math-content/src/
├── problem-families/
│   ├── types.ts          # ProblemFamilyInput, ProblemFamily seed types
│   ├── im2/              # 13 unit files, 71 problem families
│   ├── im3/              # 9 module files, 87 problem families
│   └── precalc/          # 4 unit files, 41 problem families
├── algebraic/
│   ├── distractors.ts    # DistractorGenerator functions for 7 problem types
│   ├── equivalence.ts    # Expression equivalence validation
│   └── types.ts          # ProblemType union, DistractorResult types
├── glossary/
│   ├── types.ts          # Course-agnostic GlossaryTerm, GlossaryModule types
│   ├── im3.ts            # 76 IM3 glossary terms
│   └── helpers.ts        # getGlossaryTermBySlug, getTermsByModule, etc.
├── schemas/
│   ├── comprehension-quiz.schema.ts
│   ├── fill-in-the-blank.schema.ts
│   ├── graphing-explorer.schema.ts
│   ├── step-by-step-solver.schema.ts
│   ├── rate-of-change-calculator.schema.ts
│   ├── discriminant-analyzer.schema.ts
│   ├── index.ts          # ActivityComponentKey union + schema registry
│   └── types.ts          # Activity, ActivityComponentProps interfaces
├── seeds/
│   ├── lesson-seed.ts    # Shared lesson/version/phase/activity seeding types and helpers
│   └── types.ts          # SeedData, LessonSeed, PhaseSeed, ActivitySeed types
└── index.ts              # Public API surface
```

### FR-2: Problem Family Data

- IM3 problem families (`convex/seed/problem_families/module_1.ts` through `module_9.ts`) migrate to `packages/math-content/src/problem-families/im3/`
- IM2 problem families (`convex/seed/problem_families/unit_01.ts` through `unit_13.ts`) migrate to `packages/math-content/src/problem-families/im2/`
- PreCalc problem families (`convex/seed/problem_families/unit_01.ts` through `unit_04.ts`) migrate to `packages/math-content/src/problem-families/precalc/`
- Each app's seed file imports from the shared package instead of local paths
- `ProblemFamilyInput` type remains in `@math-platform/practice-core` (there's a dependency, not a relocation)

### FR-3: Algebraic Logic

- IM3 `distractors.ts` and `equivalence.ts` extract to `@math-platform/math-content/algebraic/`
- IM3 local imports in `components/activities/` and test files update to package imports
- algebraic logic is course-agnostic (factoring, quadratic formula, etc. apply across IM1/IM2/IM3/PreCalc)

### FR-4: Glossary

- Define course-agnostic `GlossaryTerm` type with: `slug`, `term`, `definition`, `courses` (replaces app-specific `modules`/`units`), `topics`, `synonyms`, `related`
- IM3 glossary (76 terms from `lib/study/glossary.ts`) migrates to `packages/math-content/src/glossary/im3.ts`
- Helper functions (`getGlossaryTermBySlug`, `getGlossaryTermsByModule`, `getAllGlossaryModules`, `getAllGlossaryTopics`) move to `packages/math-content/src/glossary/helpers.ts`
- BM2 glossary stays local in BM2 app (bilingual schema is different)
- IM3 `lib/study/glossary.ts` re-exports from `@math-platform/math-content`

### FR-5: Activity Schema Consolidation

- Canonical Zod schemas move from `packages/activity-components/src/schemas/` to `packages/math-content/src/schemas/`
- `packages/activity-components/src/schemas/` becomes a re-export barrel from `@math-platform/math-content`
- IM3 `lib/activities/schemas/` local copies are deleted; all imports point to `@math-platform/math-content`
- `ActivityComponentKey` union type and `Activity`/`ActivityComponentProps` interfaces move to `math-content`
- `activity-components` package depends on `math-content` (not vice versa)

### FR-6: Lesson Seed Patterns

- Extract shared seed data types (`LessonSeed`, `PhaseSeed`, `ActivitySeed`, `SeedData`) into `@math-platform/math-content/seeds/types.ts`
- Extract common seeding helper functions (creating lesson+version+phase+activity records) into `@math-platform/math-content/seeds/lesson-seed.ts`
- IM2, IM3, and PreCalc seed files import types from the package; app-specific seed mutations remain local

### FR-7: IM3 Local Import Migration

- Delete `apps/integrated-math-3/lib/activities/schemas/` directory entirely
- Delete `apps/integrated-math-3/lib/activities/algebraic/distractors.ts` and `equivalence.ts`
- Update all IM3 imports to use `@math-platform/math-content`
- Update `apps/integrated-math-3/lib/activities/registry.ts` to import schemas from `@math-platform/math-content`
- Resolves tech debt item: "IM3 still uses local activity component imports"

### FR-8: Tech Debt — v.any() Schema Fields

- Identify which of the remaining ~16 `v.any()` fields in IM3 Convex schema correspond to activity props/content
- Replace those `v.any()` fields with typed validators from `@math-platform/math-content` schemas
- Remaining `v.any()` fields (submission data, metadata) that don't map to shared schemas stay for a separate track

## Non-Functional Requirements

### NFR-1: Tree-Shaking

The package must support tree-shaking. Each subdirectory (`problem-families`, `algebraic`, `glossary`, `schemas`, `seeds`) must be independently importable so apps don't bundle content they don't use.

### NFR-2: Type Safety

- All exported types must have Zod schemas that validate at runtime
- Activity component schemas must produce TypeScript types via `z.infer<>`
- Package must pass `npx tsc --noEmit` with zero errors

### NFR-3: Test Coverage

- Package-level unit tests for all algebraic functions (distractors, equivalence)
- Package-level unit tests for all Zod schema validation
- Package-level unit tests for glossary helpers
- Existing IM3 tests must continue to pass after migration

### NFR-4: Backward Compatibility

- All existing app imports must work after migration via re-export barrels
- No breaking API changes to `practice-core`, `activity-components`, or any app
- Re-export barrels in `activity-components/src/schemas/` ensure downstream consumers aren't affected

### NFR-5: Build Verification

- `npm run build` must succeed for root monorepo
- `npx tsc --noEmit` must pass for all 5 apps
- All existing tests in IM2, IM3, and PreCalc must continue to pass

## Acceptance Criteria

1. **Package created**: `packages/math-content/` with full directory structure, `package.json`, `tsconfig.json`, and barrel exports
2. **Problem families migrated**: All 87 (IM3) + 71 (IM2) + 41 (PreCalc) problem families importable from `@math-platform/math-content/problem-families/`
3. **Algebraic logic migrated**: `distractors.ts` and `equivalence.ts` fully extracted with tests
4. **Glossary migrated**: IM3 glossary (76 terms) and helpers importable from `@math-platform/math-content/glossary/`
5. **Schemas consolidated**: 6 activity Zod schemas canonical in `math-content`, `activity-components` re-exports, IM3 local copies deleted
6. **Seed patterns extracted**: Shared `LessonSeed`/`PhaseSeed`/`ActivitySeed` types and seeding helpers in `math-content/seeds/`
7. **IM3 imports migrated**: Zero local imports from `lib/activities/schemas/` or `lib/activities/algebraic/`; all point to `@math-platform/math-content`
8. **v.any() reduction**: At least 8 of the remaining `v.any()` fields in IM3 Convex schema replaced with typed validators
9. **All tests pass**: IM2, IM3, PreCalc test suites green; package-level tests green
10. **Build passes**: `npm run build` and `npx tsc --noEmit` succeed for all apps