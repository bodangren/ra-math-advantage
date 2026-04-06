# Implementation Plan — Lesson Rendering Engine

## Phase 1: Core Rendering Components (Port from bus-math-v2)

- [ ] Task: Port and enhance `MarkdownRenderer`
    - [ ] Write tests: renders markdown, renders inline math, renders block math, renders GFM tables
    - [ ] Port `components/lesson/MarkdownRenderer.tsx` from bus-math-v2
    - [ ] Integrate KaTeX rendering (MathBlock/MathInline from design system)
    - [ ] Wrap output in `.textbook-content` typography scope

- [ ] Task: Port `VideoPlayer` component
    - [ ] Write tests: renders video embed responsively, handles missing URL gracefully
    - [ ] Port `components/lesson/VideoPlayer.tsx` from bus-math-v2

- [ ] Task: Port `ContentBlockErrorBoundary`
    - [ ] Write tests: catches render error, shows fallback UI, does not crash parent
    - [ ] Port `components/lesson/ContentBlockErrorBoundary.tsx` from bus-math-v2

- [ ] Task: Conductor — Phase Completion Verification 'Core Rendering Components' (Protocol in workflow.md)

## Phase 2: Phase Rendering

- [ ] Task: Create `PhaseRenderer` — renders sections for a single phase
    - [ ] Write tests: maps `text` → MarkdownRenderer, `callout` → CalloutBox, `activity` → ActivityRenderer, `video` → VideoPlayer, `image` → image component
    - [ ] Write tests: wraps phase in `PhaseContainer` with correct phaseType treatment
    - [ ] Implement `components/lesson/PhaseRenderer.tsx`

- [ ] Task: Create `ActivityRenderer` — delegates to activity registry
    - [ ] Write tests: registered component key renders component; unregistered key shows placeholder
    - [ ] Write tests: passes activity props, mode, onSubmit, and onComplete
    - [ ] Port and adapt `components/lesson/ActivityRenderer.tsx` from bus-math-v2

- [ ] Task: Create `PhaseCompleteButton`
    - [ ] Write tests: renders enabled when phase requirements met; disabled otherwise
    - [ ] Write tests: posts to `/api/phases/complete` on click; shows success state
    - [ ] Port and adapt `components/lesson/PhaseCompleteButton.tsx` from bus-math-v2

- [ ] Task: Conductor — Phase Completion Verification 'Phase Rendering' (Protocol in workflow.md)

## Phase 3: Lesson-Level Components

- [ ] Task: Create `LessonStepper` for N-phase navigation
    - [ ] Write tests: renders N phases with labels from `getPhaseDisplayInfo()`
    - [ ] Write tests: highlights current phase, shows completion icons
    - [ ] Write tests: sidebar layout on desktop, horizontal scroll on mobile
    - [ ] Implement `components/lesson/LessonStepper.tsx`

- [ ] Task: Create `LessonRenderer` — top-level lesson orchestrator
    - [ ] Write tests: renders LessonPageLayout with LessonStepper and PhaseRenderer
    - [ ] Write tests: navigating phases updates rendered content
    - [ ] Write tests: teacher mode renders all steps revealed, no completion buttons
    - [ ] Implement `components/lesson/LessonRenderer.tsx`

- [ ] Task: Conductor — Phase Completion Verification 'Lesson-Level Components' (Protocol in workflow.md)

## Phase 4: Page Integration & Polish

- [ ] Task: Wire `LessonRenderer` into `app/student/lesson/[lessonSlug]/page.tsx`
    - [ ] Write integration test: page renders LessonRenderer with data from Convex queries
    - [ ] Replace stub content with `<LessonRenderer>` component
    - [ ] Pass lesson data, phase content, student progress, and user role

- [ ] Task: Add keyboard navigation between phases
    - [ ] Write tests: left/right arrow keys navigate phases; focus management is correct
    - [ ] Implement keyboard event handlers in LessonRenderer

- [ ] Task: Conductor — Phase Completion Verification 'Page Integration & Polish' (Protocol in workflow.md)
