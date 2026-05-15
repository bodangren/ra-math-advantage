# Specification: Activity Component Extraction

## Overview

Extract the generic, data-driven activity components from IM3 into a shared package so IM2 and PreCalculus can register and use them without duplicating 30+ files per app.

## Context

IM3 has 6 activity types (graphing-explorer, step-by-step-solver, comprehension-quiz, fill-in-the-blank, rate-of-change-calculator, discriminant-analyzer) with 17 component files and 13 supporting lib files. These components are data-driven via props — a `ComprehensionQuiz` accepts `questions[]` regardless of course content. IM2 and PreCalculus currently have zero activity components.

## Functional Requirements

1. **Extract generic activity components** from `apps/integrated-math-3/components/activities/` to a new shared package `packages/activity-components/`
2. **Extract the registry pattern** (`registerActivity`, `getActivityComponent`, `getRegisteredActivityKeys`) to the shared package
3. **Extract Zod prop schemas** for all 6 activity types to the shared package
4. **Extract `ActivityRenderer`** component (Suspense wrapping + timing injection) to the shared package
5. **Keep course-specific code app-local**: algebraic utilities (`equivalence.ts`, `distractors.ts`), app-specific registrations
6. **IM2 and PreCalculus** import and register the shared components in their own registries
7. **Resolve `ActivityComponentProps` inconsistency** between registry-level (flat) and types-level (nested) interfaces

## Non-Functional Requirements

- No runtime behavior change for IM3 — existing lessons must render identically
- Package must follow existing monorepo package conventions (`@math-platform/` scope)
- All existing IM3 activity tests must continue to pass
- IM2 and PreCalculus must be able to register shared components with zero additional component code

## Acceptance Criteria

- [ ] `packages/activity-components/` exists with all 6 activity types exported
- [ ] Registry API (`registerActivity`, `getActivityComponent`) exported from package
- [ ] `ActivityRenderer` exported from package
- [ ] Zod schemas for all 6 activity types exported from package
- [ ] IM3 imports from `@math-platform/activity-components` instead of local files
- [ ] IM2 registers shared components in its own registry
- [ ] PreCalculus registers shared components in its own registry
- [ ] IM3 test suite passes with no regressions
- [ ] IM2 and PreCalculus can render activity components via the shared registry

## Out of Scope

- Creating new activity types for IM2/PreCalc-specific content
- Modifying activity component behavior or props
- Extracting algebraic utilities (equivalence.ts, distractors.ts) — these are IM3-specific
- Curriculum content authoring for any app
