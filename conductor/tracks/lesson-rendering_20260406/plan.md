# Implementation Plan — Lesson Rendering Engine

## Phase 1: Core Rendering Components (Port from bus-math-v2) [checkpoint: 9ada872]

- [x] Task: Port and enhance `MarkdownRenderer` — **6939961**
    - [x] Write tests: renders markdown, renders inline math, renders block math, renders GFM tables
    - [x] Port `components/lesson/MarkdownRenderer.tsx` from bus-math-v2
    - [x] Integrate KaTeX rendering (MathBlock/MathInline from design system)
    - [x] Wrap output in `.textbook-content` typography scope

- [x] Task: Port `VideoPlayer` component — **fb0a7a2**
    - [x] Write tests: renders video embed responsively, handles missing URL gracefully
    - [x] Port `components/lesson/VideoPlayer.tsx` from bus-math-v2

- [x] Task: Port `ContentBlockErrorBoundary` — **68d178c**
    - [x] Write tests: catches render error, shows fallback UI, does not crash parent
    - [x] Port `components/lesson/ContentBlockErrorBoundary.tsx` from bus-math-v2

- [x] Task: Conductor — Phase Completion Verification 'Core Rendering Components' (Protocol in workflow.md)

## Phase 2: Phase Rendering [checkpoint: 5e6b7d4]

- [x] Task: Create `PhaseRenderer` — renders sections for a single phase — **8da2ef0**
    - [x] Write tests: maps `text` → MarkdownRenderer, `callout` → CalloutBox, `activity` → ActivityRenderer, `video` → VideoPlayer, `image` → image component
    - [x] Write tests: wraps phase in `PhaseContainer` with correct phaseType treatment
    - [x] Implement `components/lesson/PhaseRenderer.tsx`

- [x] Task: Create `ActivityRenderer` — delegates to activity registry — **3f70a20**
    - [x] Write tests: registered component key renders component; unregistered key shows placeholder
    - [x] Write tests: passes activity props, mode, onSubmit, and onComplete
    - [x] Port and adapt `components/lesson/ActivityRenderer.tsx` from bus-math-v2

- [x] Task: Create `PhaseCompleteButton` — **d973f86**
    - [x] Write tests: renders enabled when phase requirements met; disabled otherwise
    - [x] Write tests: posts to `/api/phases/complete` on click; shows success state
    - [x] Port and adapt `components/lesson/PhaseCompleteButton.tsx` from bus-math-v2

- [x] Task: Conductor — Phase Completion Verification 'Phase Rendering' (Protocol in workflow.md)

## Phase 3: Lesson-Level Components [checkpoint: 6270562]

- [x] Task: Create `LessonStepper` for N-phase navigation — **2b7455b**
    - [x] Write tests: renders N phases with labels from `getPhaseDisplayInfo()`
    - [x] Write tests: highlights current phase, shows completion icons
    - [x] Write tests: sidebar layout on desktop, horizontal scroll on mobile
    - [x] Implement `components/lesson/LessonStepper.tsx`

- [x] Task: Create `LessonRenderer` — top-level lesson orchestrator — **f33d371**
    - [x] Write tests: renders LessonPageLayout with LessonStepper and PhaseRenderer
    - [x] Write tests: navigating phases updates rendered content
    - [x] Write tests: teacher mode renders all steps revealed, no completion buttons
    - [x] Implement `components/lesson/LessonRenderer.tsx`

- [x] Task: Conductor — Phase Completion Verification 'Lesson-Level Components' (Protocol in workflow.md)

## Phase 4: Page Integration & Polish

- [ ] Task: Wire `LessonRenderer` into `app/student/lesson/[lessonSlug]/page.tsx`
    - [ ] Write integration test: page renders LessonRenderer with data from Convex queries
    - [ ] Replace stub content with `<LessonRenderer>` component
    - [ ] Pass lesson data, phase content, student progress, and user role

- [ ] Task: Add keyboard navigation between phases
    - [ ] Write tests: left/right arrow keys navigate phases; focus management is correct
    - [ ] Implement keyboard event handlers in LessonRenderer

- [ ] Task: Conductor — Phase Completion Verification 'Page Integration & Polish' (Protocol in workflow.md)
