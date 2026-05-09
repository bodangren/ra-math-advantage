# Math Domain Adapter

The math-domain implementation of the `knowledge-space.v1` domain-adapter contract.

This package is the **single seam** where all math-specific semantics live:
- ID rules (`math.im3.skill.m1.l2.slug`)
- Metadata schemas (course, module, lesson, componentKey, generatorKey)
- Generator registry (algebraic, graphing, statistics stubs)
- Renderer registry (`componentKey` → props schema descriptors)
- `practice.v1` evidence bridge

Reusable packages (`knowledge-space-core`, `knowledge-space-practice`) stay domain-neutral.
Math rollouts (IM1, IM2, IM3, PreCalc) consume this adapter.

## Directory Structure

```
knowledge-space/
├── adapter.ts              — exports mathDomainAdapter
├── ids.ts                  — ID constructors and validators
├── metadata.ts             — Zod schemas for node/edge metadata
├── generators/
│   └── registry.ts         — generatorKey → generator stub
├── renderers/
│   └── registry.ts         — componentKey → renderer descriptor
├── practice-v1-adapter.ts  — evidence → PracticeSubmissionPart[] bridge
├── index.ts                — public entry point
└── README.md               — this file
```

## ID Format

| Kind | Format | Example |
|------|--------|---------|
| Skill | `math.<course>.skill.<module>.<lesson>.<slug>` | `math.im3.skill.1.2.solve-quadratic` |
| Worked example | `math.<course>.example.<module>.<lesson>.<index>` | `math.im3.example.1.2.1` |
| Lesson | `math.<course>.lesson.<module>.<lesson>` | `math.im3.lesson.1.2` |
| Module | `math.<course>.module.<module>` | `math.im3.module.1` |
| Course | `math.<course>` | `math.im3` |
| Standard | `math.standard.<authority>.<code>` | `math.standard.ccss.hsa.rei.b.4b` |

Supported courses: `im1`, `im2`, `im3`, `precalc`

## Usage

```typescript
import { mathDomainAdapter } from '@math-platform/math-content/knowledge-space';

// Validate a node
const result = mathDomainAdapter.validateNodeMetadata(node);

// Get a generator
const generator = mathDomainAdapter.getGenerator('algebraic-step-solver');

// Get a renderer descriptor
const renderer = mathDomainAdapter.getRenderer('step-by-step-solver');

// Convert evidence to practice.v1 parts
const parts = mathDomainAdapter.evidenceToPracticeV1(evidence);
```

## How to Copy This Pattern to a New Domain

When creating an adapter for English/GSE, Chinese, science, etc.:

1. **Create a new domain package** (e.g., `packages/english-content/`)
2. **Implement the `DomainAdapter` interface** from `@math-platform/knowledge-space-core`
3. **Define domain ID rules** in `ids.ts` — keep the `english.` prefix
4. **Define domain metadata schemas** in `metadata.ts` — validate GSE range, CEFR band, etc.
5. **Create stub generators** in `generators/registry.ts`
6. **Create renderer registry** in `renderers/registry.ts`
7. **Implement evidence bridge** in `practice-v1-adapter.ts`
8. **Export from `index.ts`** and wire into the app

**Critical boundary rule:** Reusable packages must not import domain adapters.
Domain adapters may import from reusable packages.
