# Specification — Lesson Rendering Engine

## Context

Bus-math-v2 has a working lesson rendering pipeline: `LessonStepper` (phase navigation), `PhaseRenderer` (section-by-section content), `ActivityRenderer` (activity embedding), `PhaseCompleteButton` (progress tracking), `MarkdownRenderer`, `Callout`, and `VideoPlayer`. These total ~1,187 lines across 8 files.

IM3 needs to port and adapt this pipeline to:
1. Support variable-length phase sequences (from Track 1: Flexible Phase Model)
2. Use the e-textbook design system primitives (from Track 2) instead of basic markdown rendering
3. Map each `phaseType` to the correct visual treatment and component composition

The current `app/student/lesson/[lessonSlug]/page.tsx` is a stub that shows phase names and completion status but does not render actual phase content.

## Requirements

### Core Rendering Components (components/lesson/)

1. **LessonRenderer** — Top-level component receiving full lesson data (phases, sections, progress). Wraps content in `LessonPageLayout` from the design system. Manages current phase state and phase navigation.

2. **LessonStepper** — Phase navigation component. Adapted from bus-math-v2 for N phases with type-based icons and labels from `getPhaseDisplayInfo()`. Shows completion state per phase. Supports both sidebar (desktop) and horizontal scroll (mobile) layouts.

3. **PhaseRenderer** — Renders a single phase's sections in order. Maps `sectionType` to the correct component:
   - `text` → `MarkdownRenderer` (enhanced with KaTeX, wrapped in textbook typography)
   - `callout` → `CalloutBox` from design system
   - `activity` → `ActivityRenderer` (delegates to activity registry)
   - `video` → `VideoPlayer`
   - `image` → Image component with caption support

4. **PhaseRenderer phaseType awareness** — In addition to rendering sections, `PhaseRenderer` wraps content in `PhaseContainer` from the design system, applying phase-type-specific visual treatment:
   - `explore` → Inquiry framing (shows inquiry question prominently)
   - `learn` → Clean textbook feel, `TheoremBox` for key concepts
   - `worked_example` → `ExampleHeader` + `StepRevealContainer`
   - `vocabulary` → `DefinitionCard` grid
   - `guided_practice` / `independent_practice` → Activity-centric layout
   - `assessment` → Assessment wrapper with submission handling
   - `discourse` → `DiscoursePrompt` styling
   - `reflection` → `ReflectionCard` layout

5. **PhaseCompleteButton** — Port from bus-math-v2. Posts to `/api/phases/complete` with phase ID. Shows completion state. Disabled until phase requirements are met (e.g., activity completed).

6. **MarkdownRenderer** — Enhanced port from bus-math-v2 integrated with KaTeX math rendering from the design system. Uses `react-markdown` + `remark-gfm` (already in dependencies).

7. **VideoPlayer** — Port from bus-math-v2. Responsive video embed.

8. **ContentBlockErrorBoundary** — Port from bus-math-v2. Catches rendering errors in individual sections without crashing the whole phase.

### Page Integration

9. **Update `app/student/lesson/[lessonSlug]/page.tsx`** — Replace stub content with `<LessonRenderer>`. Pass lesson data, phase content, and student progress from server-side queries.

10. **Keyboard navigation** — Arrow keys or keyboard shortcuts to navigate between phases. Accessible focus management.

### Teacher Mode

11. **Teacher lesson preview** — When a teacher navigates to a lesson URL, render in `teaching` mode: all steps revealed, all activities in teaching mode, no completion tracking. Detect role from session claims.

## Acceptance Criteria

1. `LessonRenderer` renders a complete lesson with N phases and M sections per phase
2. Phase navigation works: clicking a phase in the stepper loads that phase's content
3. Each `phaseType` receives its correct visual treatment via `PhaseContainer`
4. Worked example phases show `StepRevealContainer` with step-by-step reveal
5. `PhaseCompleteButton` posts completion and updates UI state
6. Math expressions render correctly via KaTeX in all content
7. Keyboard navigation between phases works
8. Teacher mode renders all content without completion tracking
9. Mobile responsive: stepper collapses, content stacks vertically
10. All components have unit tests; `npm run lint` and `npm run build` pass

## Out of Scope

- Activity component implementations (Tracks 5-7) — `ActivityRenderer` delegates to the registry; if a component key is not registered, it shows a placeholder
- Seed data (Track 8)
- Progress persistence end-to-end (Track 9)
