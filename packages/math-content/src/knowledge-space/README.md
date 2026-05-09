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

## Standards Alignment

The `alignment/` module generates `aligned_to_standard` edges that connect skill and worked_example nodes to standard nodes.

### Confidence Rules

| Confidence | Rule | Rationale |
|-----------|------|-----------|
| **high** | Exact lesson-standard mapping directly supports the skill | The lesson explicitly teaches this standard, and the skill belongs to that lesson |
| **high** | CED topic alignment (PreCalc only) with official standard code | The CED topic explicitly lists the standard code for this lesson |
| **medium** | Problem-family objective ID mapping | The family’s objective IDs include this standard, but the skill may be narrower than the lesson scope |
| **low** | Heuristic title-keyword overlap or fuzzy lesson-slug matching | The alignment was inferred from keyword analysis or approximate lesson slug matching; requires human review |

### Weight Values

- Primary lesson standard: **0.8**
- Non-primary lesson standard: **0.5**
- CED topic alignment: **0.7**
- Family/objective mapping: **0.4**
- Heuristic keyword overlap: **0.2**
- Fuzzy lesson-slug match: **0.3**

### Alignment Strategies (in priority order)

1. **Lesson-standard mapping** — Match skill metadata (module, lesson) to lesson-standard seed slugs
2. **Family/objective mapping** — Map through problem-family `objectiveIds` fields
3. **CED topic alignment** — PreCalc official CED topic-to-standard mappings (high confidence)
4. **Heuristic keyword matching** — Compare skill title/slug keywords against standard descriptions (low confidence, requires review)

### Review Queue

All edges with `confidence: 'low'` are placed in a review queue for human verification. The queue includes the rationale and source references for each alignment.

### Exception Handling

Skills that cannot be aligned to any standard through any strategy receive an `alignment` exception documenting why. This ensures every skill node is accounted for — either aligned or explicitly excepted.

## Directory Structure

```
knowledge-space/
├── adapter.ts              — exports mathDomainAdapter
├── alignment/
│   ├── align.ts            — main alignment logic
│   ├── load-standards.ts   — types and helpers for loading standards sources
│   └── __tests__/          — alignment rule unit tests
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
