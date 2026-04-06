# Implementation Plan — Flexible Phase Model

## Phase 1: Schema & Type Definitions

- [ ] Task: Add `phaseType` union field to `phase_versions` in `convex/schema.ts`
    - [ ] Write unit test validating the schema accepts all 10 phase types
    - [ ] Add `phaseType` as `v.union(v.literal("explore"), v.literal("vocabulary"), ...)` to `phase_versions`
    - [ ] Add optional `metadata` field (`v.optional(v.any())`) to `phase_versions`

- [ ] Task: Create `lib/curriculum/phase-types.ts` with type definitions and display utility
    - [ ] Write unit tests for `getPhaseDisplayInfo()` — all 10 types return correct label, icon, color
    - [ ] Write unit tests for `PHASE_TYPES` constant array and `isValidPhaseType()` guard
    - [ ] Implement `PhaseType` union type, `PHASE_TYPES` array, `isValidPhaseType()`, and `getPhaseDisplayInfo()`

- [ ] Task: Conductor — Phase Completion Verification 'Schema & Type Definitions' (Protocol in workflow.md)

## Phase 2: Backend Query Updates

- [ ] Task: Update `convex/public.ts` to include `phaseType` in phase data
    - [ ] Write test verifying public query returns `phaseType` for each phase
    - [ ] Update query to include `phaseType` field in returned phase objects

- [ ] Task: Update `convex/student.ts` to include `phaseType` in phase/progress data
    - [ ] Write test verifying student queries return `phaseType`
    - [ ] Update `getLessonWithContent` and `getLessonProgress` to include `phaseType`

- [ ] Task: Verify `resolveLessonLandingPhase` in `lib/student/lesson-runtime.ts` handles variable phase counts
    - [ ] Write test with 4-phase lesson, 8-phase lesson, and 10-phase lesson
    - [ ] Fix any hardcoded phase count assumptions (if found)

- [ ] Task: Conductor — Phase Completion Verification 'Backend Query Updates' (Protocol in workflow.md)

## Phase 3: Frontend Updates

- [ ] Task: Refactor `app/student/lesson/[lessonSlug]/page.tsx` to use dynamic phase display
    - [ ] Write test verifying lesson page renders N phases with correct labels from `phaseType`
    - [ ] Remove `PHASE_NAMES` constant
    - [ ] Import and use `getPhaseDisplayInfo()` for phase labels, icons, colors
    - [ ] Render phase list dynamically from query response (no hardcoded count)

- [ ] Task: Conductor — Phase Completion Verification 'Frontend Updates' (Protocol in workflow.md)

## Phase 4: Documentation & Cleanup

- [ ] Task: Update `conductor/product.md` — replace "6-phase" references with flexible phase model
    - [ ] Update "Phase-Based Lesson System" feature description
    - [ ] Update curriculum structure diagram
    - [ ] Update student description to reference variable-length lessons

- [ ] Task: Update `conductor/architecture.md` — update curriculum hierarchy and phase descriptions
    - [ ] Update the hierarchy diagram to show `phaseType` field
    - [ ] Update "Student Lesson Flow" section

- [ ] Task: Conductor — Phase Completion Verification 'Documentation & Cleanup' (Protocol in workflow.md)
