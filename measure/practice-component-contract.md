# Practice Component Contract

> Canonical reference for the activity/practice system. Carried forward from bus-math-v2.

## Contract Version

`practice.v1` -- all practice components and submissions use this version identifier.

## Architecture Overview

The practice system has three layers:

```
1. Component Registry    componentKey string → React component (lazy-loaded)
2. Activity Props        Zod schemas defining valid props per componentKey
3. Submission Envelope   Normalized structure every component emits on submit
```

### Source File (to be created)

`lib/practice/contract.ts` -- defines the envelope schema, builder helpers, and normalization functions. This file is a direct port from bus-math-v2.

---

## Canonical Modes

Every practice component declares one mode that governs its behavior:

| Mode | Purpose |
|------|---------|
| `worked_example` | Read-only instruction; shows explicit reasoning steps |
| `guided_practice` | Includes scaffolding, hints, partial structure, coachmarks |
| `independent_practice` | Reduced scaffolding, fresh problems |
| `assessment` | Auto-graded, teacher-reviewed, or hybrid |
| `teaching` | Instructor/preview view |

## Submission Status

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress |
| `submitted` | Student submitted |
| `graded` | Teacher/system graded |
| `returned` | Returned with feedback |

---

## Submission Envelope

Every component emits a `PracticeSubmissionEnvelope` on submit:

```typescript
type PracticeSubmissionEnvelope = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: PracticeMode;
  status: PracticeSubmissionStatus;
  attemptNumber: number;          // positive integer
  submittedAt: string;            // ISO timestamp
  answers: Record<string, unknown>;  // raw responses by part ID
  parts: PracticeSubmissionPart[];   // per-part detail
  artifact?: Record<string, unknown>; // richer deliverable (graph, table, etc.)
  interactionHistory?: unknown[];    // event log
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
};
```

### PracticeSubmissionPart

```typescript
type PracticeSubmissionPart = {
  partId: string;
  rawAnswer: unknown;
  normalizedAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  misconceptionTags?: string[];
  hintsUsed?: number;
  revealStepsSeen?: number;
  changedCount?: number;
  firstInteractionAt?: string;
  answeredAt?: string;
  wallClockMs?: number;
  activeMs?: number;
};

### Timing Evidence

> Timing is **optional process evidence**, not a standalone grade. It belongs in canonical fields, not arbitrary `analytics`.

```typescript
type PracticeTimingConfidence = "high" | "medium" | "low";

type PracticeTimingSummary = {
  startedAt: string;
  submittedAt: string;
  wallClockMs: number;
  activeMs: number;
  idleMs: number;
  pauseCount: number;
  focusLossCount: number;
  visibilityHiddenCount: number;
  longestIdleMs?: number;
  confidence: PracticeTimingConfidence;
  confidenceReasons?: string[];
};
```

The `timing` field is added to the `PracticeSubmissionEnvelope`:

```typescript
type PracticeSubmissionEnvelope = {
  // ... existing fields
  timing?: PracticeTimingSummary;
};
```

Design notes:
- `wallClockMs` is the total elapsed time from `startedAt` to `submittedAt`.
- `activeMs` is the subset of wall-clock time when the student was actively engaged. Hidden tabs, blur/focus losses, and idle gaps do not count.
- `confidence` is deterministic: `high` for clean sessions, `medium` for minor interruptions, `low` for significant idle gaps or focus losses.
- `confidenceReasons` are machine-readable so future SRS adapters can down-weight timing when appropriate.
- Backward compatibility: envelopes without `timing` remain valid.

---

## Component Registry Pattern

`lib/activities/registry.ts` maps `componentKey` strings to React components:

```typescript
const activityRegistry: Record<ActivityComponentKey, ComponentType<any>>;

function getActivityComponent(key: string): ComponentType<any> | null;
```

### Component Interface

Every activity component receives:

```typescript
interface ActivityComponentProps {
  activity: Activity;  // includes componentKey and typed props
  onSubmit?: (payload: PracticeSubmissionEnvelope) => void;
  onComplete?: () => void;
}
```

---

## Activity Database Model

Activities are stored in Convex (`activities` table):

| Field | Type | Description |
|-------|------|-------------|
| `componentKey` | string | Maps to registry entry |
| `displayName` | string | Human-readable name |
| `description` | string? | Optional description |
| `props` | JSON | Component-specific configuration |
| `gradingConfig` | JSON? | Auto-grade rules, rubric, passing score |
| `standardId` | ID? | Link to `competency_standards` |

### Grading Config

```typescript
type GradingConfig = {
  autoGrade: boolean;
  passingScore?: number;      // 0-100
  partialCredit: boolean;
  rubric?: Array<{ criteria: string; points: number }>;
};
```

---

## IM3 Component Keys (Planned)

These are the activity types needed for the Integrated Math 3 curriculum. Business-specific components from bus-math-v2 (spreadsheet, simulations, journal-entry) are **not** carried forward.

### Core Math Activities

| Component Key | Description | Modules |
|---------------|-------------|---------|
| `comprehension-quiz` | Multiple-choice, true/false, short-answer quiz | All |
| `fill-in-the-blank` | Equation/expression completion | All |
| `tiered-assessment` | Multi-tier assessment (knowledge → application) | All |
| `graphing-explorer` | Interactive graph with transformations | 1, 2, 3, 4, 5, 6, 7, 9 |
| `equation-solver` | Step-by-step equation solving workspace | 1, 3, 4, 5, 6, 7 |
| `function-analyzer` | Domain, range, end behavior, key features | 2, 4, 5, 6, 7, 9 |
| `drag-drop-categorization` | Sort/classify items into categories | 1, 2, 7, 8 |
| `statistical-explorer` | Data visualization, distributions, z-scores | 8 |
| `unit-circle-trainer` | Interactive unit circle with angle/value practice | 9 |

> This list is a starting point. Add new component keys as curriculum content is authored. Each new key needs a Zod props schema and a React component registered in the registry.

---

## Design Principles

1. **One componentKey → one React component** -- deterministic lookup
2. **All submissions use the practice.v1 envelope** -- normalized for persistence and teacher review
3. **Part-level tracking** -- raw answer, normalized answer, correctness, misconception tags
4. **Mode-based behavior** -- same component adapts across worked_example → assessment
5. **Deterministic evaluation first** -- compute correctness before any AI-assisted analysis
6. **Course-agnostic contract** -- the envelope, modes, and registry pattern are reusable across courses; only componentKeys and props schemas are course-specific

---

## Primitive Layer

> Added in track `primitive-layer-contract_20260615` (T0). Establishes the
> controlled-component contract every math primitive must satisfy. The
> canonical primitive catalog (P1–P13) lives in
> [Practice Primitives Roadmap](./practice-primitives-roadmap.md#primitive-taxonomy-p1p13)
> — this section summarizes the contract; the roadmap is the single source of
> truth for which primitives exist and which track owns them.

### Two-layer split

The `practice.v1` system has two distinct presentation layers, and they must
not be confused:

| Layer | Lives in | Responsibility | What it must NOT do |
|-------|----------|----------------|---------------------|
| **Primitive** | `packages/activity-components/src/primitives/<name>/` | Visualization + interaction engine (SVG canvas, slider, drag surface, validated input). Controlled by the consumer. | Import the `practice.v1` envelope, hold submission state, or compute correctness. |
| **Practice component** | `packages/activity-components/src/components/<name>/` (and registered via `componentKey`) | Composes one or more primitives, adds grading / hints / scaffolding, and emits the `PracticeSubmissionEnvelope`. | Re-implement a primitive's interaction engine. |

A primitive is a reusable engine. A practice component is what a teacher
or curriculum author configures into an activity. **One visual surface =
one primitive**; practice components and skill-graph blueprint renderers
both consume the same primitives — no duplicate visuals.

### Controlled-component rules (FR-2)

Every primitive accepts the FR-2 base props (`MathPrimitiveProps<TValue>`)
exported from `@math-platform/activity-components`:

```ts
import type { MathPrimitiveProps, PrimitiveMode } from '@math-platform/activity-components';

export type PrimitiveMode = 'static' | 'interactive' | 'readonly';

export interface MathPrimitiveProps<TValue> {
  /** Current controlled value. */
  value: TValue;
  /** Called when the user edits the value. No-op/absent in non-interactive modes. */
  onChange?: (next: TValue) => void;
  /** 'interactive' = editable (default); 'readonly'/'static' = display only. */
  mode?: PrimitiveMode;
  /** Hard-disable all interaction regardless of mode. */
  disabled?: boolean;
}
```

Rules a primitive MUST follow:

1. **Controlled only** — no internal copy of `value` as source of truth.
   Transient UI state (cursor position, hover, focus) is allowed.
2. **Default `mode` is `'interactive'`** when the prop is omitted.
3. When `mode !== 'interactive'` **or** `disabled === true`, the primitive
   must not call `onChange`. Handlers may be omitted or replaced with no-ops
   in those states.
4. The primitive emits no `practice.v1` envelope and holds no submission
   state. Correctness is computed by the practice component that wraps it.

### Value → envelope mapping

The practice component is the **only** place where a primitive's `value` is
turned into a `PracticeSubmissionEnvelope`. The contract is:

- The primitive's `value` becomes part of `answers[partId]` (and/or
  `artifact` if the value is too rich to normalize into a string).
- The practice component assigns `parts[i].rawAnswer` from the primitive
  value.
- The practice component computes `isCorrect`, `score`, `maxScore`, and
  `misconceptionTags` from the primitive value, never the primitive.
- A practice component may compose multiple primitives and combine their
  values into a single envelope.

This separation is what keeps primitives reusable across practice
components and across skill-graph blueprint renderers.

---

## Primitive Catalog (P1–P13)

The canonical, single source of truth for the primitive catalog (status,
owning track, detailed notes) is
[Practice Primitives Roadmap §Primitive taxonomy](./practice-primitives-roadmap.md#primitive-taxonomy-p1p13).
The table below is a summary that mirrors it; if the two ever disagree,
the roadmap wins.

| # | Primitive | Course / Domain | Status | Owning track |
|---|-----------|-----------------|--------|--------------|
| **P1** | `CoordinatePlane` (plot / click / snap) | IM1 linear, IM3 all | ✅ promoted (`GraphingCanvas`) | T0 + Track A |
| P2 | `FunctionPlot` + parameter sliders | IM1 exp/quad, IM3 poly/rational/log | 🟡 quadratic-only | Track A |
| P3 | `NumberLine` (points / fractions / inequalities / intervals) | IM1, IM3 | ❌ gap | Track B |
| P4 | `GeometryCanvas` (drag vertices, measure) | **IM2 (all)** | ❌ gap | Track C |
| P5 | `TransformationOverlay` (translate / rotate / reflect / dilate) | IM2 | ❌ gap | Track C |
| P6 | `UnitCircle` (drag / snap angle, radian formatting) | IM3 M9, PreCalc | 🟡 spec'd (T16) | Track E |
| P7 | `PolarPlane` | PreCalc | 🟡 spec'd (T16) | Track E |
| P8 | `StatChart` / `Distribution` (histogram, box / dot, normal, z) | IM1 stats, IM3 M8 | 🟡 spec'd (T15) | Track D |
| P9 | `DataTable` / grid input | IM1 scatter, IM3 stats | 🟡 promote (`InteractiveTableOfValues`) | Track D |
| P10 | `ProbabilitySimulator` (spinner / dice / coin / sampling, two-way) | IM2, IM1 | ❌ gap | Track D |
| P11 | `AlgebraManipulatives` (tiles: factoring, complete square) | IM1 / IM3 | ❌ gap | Track B |
| P12 | `MathInput` (validated equation / notation field) | all | 🟡 promote (`MathInputField`) | Track B |
| P13 | DnD surface (categorize / match / order / proof builder) | IM1–IM3, **IM2 proofs** | 🟡 generalize (`@hello-pangea/dnd`) | Tracks C + F |

**P1 (`CoordinatePlane`) is the first promoted primitive** — T0 wraps the
existing `packages/activity-components/src/components/graphing/GraphingCanvas`
in the FR-2 contract (see
[`spec.md` §FR-4](./tracks/primitive-layer-contract_20260615/spec.md#fr-4--reference-migration-coordinateplane-p1)).
Existing `GraphingExplorer` / `GraphingExplorerActivity` and their tests
are **unmodified** by T0; promotion is additive (the wrapper sits beside
the existing canvas).

