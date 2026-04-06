# Specification — Flexible Phase Model

## Context

The current codebase assumes a fixed 6-phase lesson structure inherited from bus-math-v2 (Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing). The IM3 curriculum uses a variable-length lesson format where phase count and types depend on the lesson content. A single lesson might have: Explore → Learn → Example 1 → Example 2 → Learn → Example 3 → Example 4 → Independent Practice — totaling 8 phases rather than 6.

The Convex schema already supports variable-length phases via `phase_versions` (phaseNumber is an integer), but there is no `phaseType` field, and the frontend hardcodes `PHASE_NAMES` as a 6-entry map.

## Requirements

### Schema Changes

1. Add a `phaseType` field to the `phase_versions` table in `convex/schema.ts` with the following allowed values:
   - `explore` — Inquiry-driven exploration activity
   - `vocabulary` — Term definitions and key language
   - `learn` — Concept presentation (mini-lesson)
   - `key_concept` — Visual callout for important rules/formulas
   - `worked_example` — Step-by-step teacher-led example
   - `guided_practice` — Scaffolded student practice
   - `independent_practice` — Unscaffolded student practice
   - `assessment` — In-class quick check or formal assessment
   - `discourse` — Think About It / discussion prompts
   - `reflection` — CAP Reflection or similar closing activity

2. Add `phaseType` to the `phase_versions` table definition as a required `v.union(v.literal(...))` field.

3. Add an optional `metadata` field to `phase_versions` for extensibility (e.g., storing worked example problem config, explore inquiry questions).

### Frontend Changes

4. Remove the hardcoded `PHASE_NAMES` map from `app/student/lesson/[lessonSlug]/page.tsx`.

5. Replace with a utility function `getPhaseDisplayInfo(phaseType: string)` in `lib/curriculum/phase-types.ts` that returns:
   - `label` — Human-readable name (e.g., "Explore", "Learn", "Example 1")
   - `icon` — Lucide icon name appropriate for the phase type
   - `color` — CSS class or oklch color token for the phase type

6. Update the lesson page to render phases dynamically based on the phases returned from the query, using `phaseType` and the phase `title` field for display.

### Documentation Changes

7. Update `conductor/product.md` to replace references to "6-phase lessons" with "variable-length, typed phase sequences."

8. Update `conductor/architecture.md` curriculum hierarchy to show the flexible model.

### Query/API Changes

9. Update `convex/public.ts` and `convex/student.ts` queries to include `phaseType` in phase data returned to the frontend.

10. Update `lib/student/lesson-runtime.ts` `resolveLessonLandingPhase` to work correctly with variable phase counts (verify it already does — it uses phaseNumber, not hardcoded counts).

## Acceptance Criteria

1. `phase_versions` table includes `phaseType` as a required union field with all 10 types listed above
2. No hardcoded phase count or phase name assumptions remain in the frontend
3. `getPhaseDisplayInfo()` returns correct label, icon, and color for all 10 phase types
4. Lesson page renders N phases with correct labels derived from `phaseType` + `title`
5. `resolveLessonLandingPhase` works with any number of phases
6. `product.md` and `architecture.md` reflect the flexible model
7. All existing tests pass; new tests cover `getPhaseDisplayInfo` and updated query shapes
8. `npm run lint` and `npm run build` pass

## Out of Scope

- Building the actual phase rendering components (Track 3: Lesson Rendering Engine)
- Activity components (Tracks 5–7)
- Seed data (Track 8)
