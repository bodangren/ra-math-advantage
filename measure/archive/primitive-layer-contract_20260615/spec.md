# Specification: Primitive Layer Contract (Practice Primitives T0)

## Overview

Establish the shared **primitive layer** that all `practice.v1` activity components and
skill-graph blueprint renderers consume, so each interactive/visual surface is built once
and reused across IM1/IM2/IM3/PreCalc. This track defines the contract only: the
directory, the controlled-component interface, the consumption rules, **one** reference
migration that proves the seam, the canonical P1–P13 catalog, boundary enforcement, and
reconciliation of the overlapping T15/T16 skill-graph renderer tracks.

**No end-user behavior changes.** The 6 shipped activity components must render and
behave identically before and after this track.

Read first: [Practice Primitives Roadmap](../../practice-primitives-roadmap.md) and
[Practice Component Contract](../../practice-component-contract.md).

### Glossary for implementers

- **Primitive** — a presentation/interaction engine (e.g. a coordinate plane, a number
  line, a drag surface). It is a controlled React component: it renders a `value` and
  reports edits through `onChange`. It holds **no** submission state and never imports the
  `practice.v1` envelope.
- **Practice component** — a registry entry (`componentKey` → component) that composes one
  or more primitives, adds grading/hints/scaffolding, and emits a
  `PracticeSubmissionEnvelope`. Built in later tracks (A–F), **not here**.

## Functional Requirements

### FR-1 — Primitive layer location & structure

1. Create directory `packages/activity-components/src/primitives/`.
2. Each primitive is its own subdirectory: `primitives/<kebab-name>/<PascalName>.tsx`
   plus a local `index.ts` barrel that re-exports the component and its public types.
3. Create `packages/activity-components/src/primitives/index.ts` that re-exports every
   primitive subdirectory barrel and the shared contract types from FR-2.
4. Surface the primitives barrel from the package root
   `packages/activity-components/src/index.ts` (add an
   `export * from './primitives/index';` line, or named re-exports following the existing
   style in that file).

### FR-2 — Primitive contract (`MathPrimitiveProps`)

1. Create `packages/activity-components/src/primitives/types.ts` exporting:

   ```ts
   /** Interaction mode for a primitive. */
   export type PrimitiveMode = 'static' | 'interactive' | 'readonly';

   /**
    * Base props every math primitive accepts. Primitives are CONTROLLED:
    * they render `value` and report edits via `onChange`. They emit no
    * practice.v1 envelope and hold no submission state.
    */
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

2. Rules a primitive MUST follow (documented in FR-3 and enforced by tests):
   - Controlled only — no internal copy of `value` as source of truth (transient UI state
     such as hover/cursor is allowed).
   - When `mode !== 'interactive'` **or** `disabled === true`, the primitive must not call
     `onChange`.
   - Default `mode` is `'interactive'` when the prop is omitted.

### FR-3 — Consumption contract (how a practice component uses a primitive)

Add a **"Primitive Layer"** section to `practice-component-contract.md` documenting:

1. The two-layer split (primitive vs. practice component) and the FR-2 rules.
2. How a practice component maps a primitive's `value` into the submission envelope:
   the primitive `value` becomes part of `answers[partId]` and/or `artifact`; correctness
   is computed by the practice component, never the primitive.
3. One concrete reference example in prose/code using the `CoordinatePlane` primitive from
   FR-4 (e.g. a practice component stores `value.points` into
   `answers["plot"]` and sets `parts[0].rawAnswer = value.points`).

### FR-4 — Reference migration: `CoordinatePlane` (P1)

Goal: prove a real primitive can be expressed in the FR-2 contract **without changing any
existing component**.

1. Create `primitives/coordinate-plane/CoordinatePlane.tsx`: a controlled wrapper that
   composes the **existing** `GraphingCanvas` renderer
   (`components/graphing/GraphingCanvas.tsx`, which itself wraps
   `@math-platform/graphing-core`). Do **not** move or modify `GraphingCanvas`.
2. Types:

   ```ts
   import type { Point, FunctionPlot } from '../../components/graphing/GraphingCanvas';
   import type { MathPrimitiveProps } from '../types';

   /** The controlled value of a coordinate plane: the student-placed points. */
   export interface CoordinatePlaneValue {
     points: Point[];
   }

   /** Static configuration (not part of the controlled value). */
   export interface CoordinatePlaneConfig {
     domain?: [number, number];
     range?: [number, number];
     functions?: FunctionPlot[];
     snapToGrid?: boolean;
     width?: number;
     height?: number;
   }

   export type CoordinatePlaneProps =
     MathPrimitiveProps<CoordinatePlaneValue> & CoordinatePlaneConfig;
   ```

3. Behavior mapping inside `CoordinatePlane`:
   - Render `<GraphingCanvas>` with `points={value.points}`, plus config props.
   - Set `readonly={mode !== 'interactive' || disabled === true}`.
   - Wire `onPointAdd={(p) => onChange?.({ points: [...value.points, p] })}`.
   - Wire `onPointRemove={(p) => onChange?.({ points: value.points.filter(pt => pt !== p) })}`
     (match the identity/removal semantics `GraphingCanvas` already uses for
     `onPointRemove`).
   - When `mode !== 'interactive'` or `disabled`, do not pass the add/remove handlers (or
     pass no-ops) so `onChange` is never called.
4. `GraphingExplorer`, `GraphingExplorerActivity`, and their tests are **untouched** and
   continue to import `GraphingCanvas` from its current path.
5. Document (in the FR-5 catalog) that `MathInputField` → **P12** and
   `InteractiveTableOfValues` → **P9** are existing primitive candidates to be migrated by
   their owning family tracks (B and D). Do **not** migrate them in this track.

### FR-5 — Canonical primitive catalog

Add a **"Primitive Catalog (P1–P13)"** table to `practice-component-contract.md` (or a new
clearly-linked subsection) listing each primitive: id, name, course/domain, status, owning
track. Mirror the table in `practice-primitives-roadmap.md` and cross-link the two so
there is a single canonical catalog. Mark `CoordinatePlane` (P1) as the first promoted
primitive.

### FR-6 — T15/T16 reconciliation in `tracks.md`

1. Register the **Practice Primitives & Components Program** section in `tracks.md` listing
   T0 (this track) and the six planned domain-family tracks A–F (as `[ ]` planned).
2. Edit the existing **T15 (geometry-stats-renderers)** entry: note it was never created
   and its scope is folded into Tracks C (geometry) and D (statistics).
3. Edit the existing **T16 (trig-advanced-renderers)** entry: note it is reframed as the
   seed of Track E (its `UnitCircleVisualizer`/`TrigGraphBuilder`/`PolarRenderer` specs
   become the P6/P7/P2-trig primitives).

### FR-7 — Boundary enforcement

Add `packages/activity-components/src/primitives/__tests__/boundary.test.ts` modeled on
`packages/knowledge-space-core/src/__tests__/boundary.test.ts`. It must recursively scan
every non-test `.ts`/`.tsx` file under `primitives/` and FAIL if any imports from:
- `apps/`
- `convex/_generated/`
- any practice-submission module (`lib/practice`, or `**/contract` exporting the
  `practice.v1` envelope) — i.e. primitives must not depend on the submission envelope.

Include the same positive/negative fixture assertions as the precedent test (catches a bad
import string; does not flag allowed imports or comments).

## Non-Functional Requirements

- `npx tsc --noEmit` passes (root and `packages/activity-components`).
- `npm run lint` passes.
- Existing `packages/activity-components` test suite passes unchanged (no edits to existing
  test files except additive).
- Zero runtime behavior change to the 6 shipped activity components.

## Acceptance Criteria

1. `MathPrimitiveProps<TValue>` and `PrimitiveMode` are exported from the
   `@math-platform/activity-components` package root.
2. `CoordinatePlane` is importable from the package root, satisfies `MathPrimitiveProps`,
   and its contract test passes (controlled value/onChange; no `onChange` when not
   interactive).
3. `primitives/__tests__/boundary.test.ts` passes and demonstrably fails on a planted bad
   import (fixture assertions).
4. Existing GraphingCanvas/GraphingExplorer tests still pass with no edits.
5. `practice-component-contract.md` contains the Primitive Layer section + P1–P13 catalog;
   `tracks.md` registers the program and reconciles T15/T16.
6. `tsc --noEmit`, lint, and the full `activity-components` test suite are green.

## Out of Scope

- Implementing primitives P2–P13 (owned by Tracks A–F).
- Building any practice component (`equation-solver`, `function-analyzer`,
  `statistical-explorer`, `unit-circle-trainer`, `drag-drop-categorization`,
  `tiered-assessment`).
- Any seed-data / downstream adoption wiring.
- Migrating `MathInputField` or `InteractiveTableOfValues` (documented only).
- Any change to bus-math-v2.
