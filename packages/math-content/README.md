# @math-platform/math-content

Shared math content package for the Math Platform monorepo. Contains problem families, algebraic logic, glossary terms, activity schemas, and seed helpers used across IM1, IM2, IM3, and PreCalc apps.

## Directory Structure

```
src/
├── problem-families/     # 199 problem families across 3 apps
│   ├── im2/              # 71 families (13 units)
│   ├── im3/              # 87 families (9 modules)
│   └── precalc/          # 41 families (4 units)
├── algebraic/            # Distractor generation & equivalence checking
│   ├── distractors.ts    # 7 problem type generators
│   └── equivalence.ts    # Expression normalization & comparison
├── glossary/             # Course-agnostic glossary terms
│   ├── im3.ts            # 76 IM3 terms
│   └── helpers.ts        # Lookup/filter functions
├── schemas/              # 6 activity component Zod schemas
│   ├── comprehension-quiz.schema.ts
│   ├── fill-in-the-blank.schema.ts
│   ├── graphing-explorer.schema.ts
│   ├── step-by-step-solver.schema.ts
│   ├── rate-of-change-calculator.schema.ts
│   ├── discriminant-analyzer.schema.ts
│   └── types.ts          # Activity, ActivityComponentProps interfaces
├── seeds/                # Lesson seed types and helpers
│   ├── types.ts          # LessonSeed, PhaseSeed, ActivitySeed
│   └── lesson-seed.ts    # createActivitySeed, createPhaseSeed, etc.
└── index.ts              # Public API barrel
```

## Usage

```ts
// Problem families
import { IM3_PROBLEM_FAMILIES } from '@math-platform/math-content/problem-families/im3';

// Activity schemas
import { comprehensionQuizSchema, SCHEMA_REGISTRY } from '@math-platform/math-content/schemas';

// Algebraic logic
import { generateDistractors, checkEquivalence } from '@math-platform/math-content/algebraic';

// Glossary
import { IM3_GLOSSARY, getGlossaryTermBySlug } from '@math-platform/math-content/glossary';

// Seed helpers
import { createActivitySeed, createPhaseSeed } from '@math-platform/math-content/seeds';
```

## Scripts

```bash
npm test          # Run tests
npm run lint      # ESLint
npm run typecheck # TypeScript check
npm run build     # Typecheck (same as typecheck)
```

## Dependencies

- `@math-platform/practice-core` — ProblemFamilyInput type
- `@math-platform/activity-runtime` — ActivityMode type
- `@math-platform/study-hub-core` — study hub types
- `zod` — Runtime schema validation
