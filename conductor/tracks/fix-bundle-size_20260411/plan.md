# Implementation Plan — Fix Bundle Size (RSC Entry Chunk)

## Phase 1: Analyze Current Bundle Composition

- [ ] Task: Analyze bundle size and composition
    - [ ] Run bundle analyzer to identify largest contributors
    - [ ] Document which modules are in the RSC entry chunk
    - [ ] Verify the 687 KB size baseline
    - [ ] Identify low-hanging fruit for quick wins

- [ ] Task: Map component import dependencies
    - [ ] Trace `MarkdownRenderer` import locations
    - [ ] Trace `ConvexClientProvider` usage across pages
    - [ ] Identify activity registry eager imports
    - [ ] Document route-level component usage

- [ ] Task: Conductor — Phase Completion Verification 'Analyze Current Bundle Composition' (Protocol in workflow.md)

**Expected Outcome:** Clear map of what's in the 687 KB bundle and which lazy-loading strategies will have the most impact.

## Phase 2: Lazy-Load MarkdownRenderer

- [ ] Task: Lazy-load MarkdownRenderer in LessonRenderer
    - [ ] Write tests: verify MarkdownRenderer loads and renders correctly
    - [ ] Convert `MarkdownRenderer` import to `next/dynamic` with `ssr: true`
    - [ ] Test loading states and error handling
    - [ ] Verify content renders identically to before

- [ ] Task: Lazy-load MarkdownRenderer in LessonPageLayout
    - [ ] Write tests: verify MarkdownRenderer loads and renders correctly
    - [ ] Convert `MarkdownRenderer` import to `next/dynamic` with `ssr: true`
    - [ ] Test loading states and error handling
    - [ ] Verify content renders identically to before

- [ ] Task: Measure bundle size reduction
    - [ ] Run bundle analyzer after changes
    - [ ] Verify expected ~150-200 KB reduction
    - [ ] Document actual vs expected savings

- [ ] Task: Conductor — Phase Completion Verification 'Lazy-Load MarkdownRenderer' (Protocol in workflow.md)

**Expected Outcome:** MarkdownRenderer lazy-loaded, ~150-200 KB reduction in RSC entry chunk.

## Phase 3: Split Root Layout for ConvexClientProvider

- [ ] Task: Create auth-specific root layout
    - [ ] Write tests: verify auth pages work correctly
    - [ ] Create `app/(auth)/layout.tsx` with `ConvexClientProvider`
    - [ ] Keep existing root layout for non-auth pages
    - [ ] Update auth page imports to use new layout

- [ ] Task: Move ConvexClientProvider to dynamic import
    - [ ] Write tests: verify Convex client initializes correctly
    - [ ] Use `next/dynamic` for `ConvexClientProvider` with `ssr: false`
    - [ ] Test hydration and state persistence
    - [ ] Verify no breaking changes to data fetching

- [ ] Task: Measure bundle size reduction
    - [ ] Run bundle analyzer after changes
    - [ ] Verify expected ~80-120 KB reduction
    - [ ] Document actual vs expected savings

- [ ] Task: Conductor — Phase Completion Verification 'Split Root Layout for ConvexClientProvider' (Protocol in workflow.md)

**Expected Outcome:** ConvexClientProvider lazy-loaded, ~80-120 KB reduction in RSC entry chunk.

## Phase 4: Route-Level Code Splitting

- [ ] Task: Lazy-load LessonRenderer in lesson page
    - [ ] Write tests: verify lesson page renders correctly
    - [ ] Convert `LessonRenderer` to `next/dynamic` import
    - [ ] Test loading states and navigation
    - [ ] Verify lesson functionality unchanged

- [ ] Task: Lazy-load gradebook components in teacher pages
    - [ ] Write tests: verify teacher pages render correctly
    - [ ] Convert gradebook component imports to `next/dynamic`
    - [ ] Test loading states and navigation
    - [ Verify teacher functionality unchanged

- [ ] Task: Measure bundle size reduction
    - [ ] Run bundle analyzer after changes
    - [ ] Verify expected ~100-150 KB reduction
    - [ ] Document actual vs expected savings

- [ ] Task: Conductor — Phase Completion Verification 'Route-Level Code Splitting' (Protocol in workflow.md)

**Expected Outcome:** Route-level splitting implemented, ~100-150 KB reduction in RSC entry chunk.

## Phase 5: Lazy-Load Activity Registry Components

- [ ] Task: Identify activity registry eager imports
    - [ ] Document which components import activity registry
    - [ ] Identify which activities can be lazy-loaded
    - [ ] Determine lazy-loading strategy (per-component vs per-activity)

- [ ] Task: Implement activity component lazy-loading
    - [ ] Write tests: verify activity components load and render correctly
    - [ ] Convert activity registry imports to `next/dynamic`
    - [ ] Test loading states for different activity types
    - [ ] Verify activity functionality unchanged

- [ ] Task: Measure bundle size reduction
    - [ ] Run bundle analyzer after changes
    - [ ] Verify expected ~50-100 KB reduction
    - [ ] Document actual vs expected savings

- [ ] Task: Conductor — Phase Completion Verification 'Lazy-Load Activity Registry Components' (Protocol in workflow.md)

**Expected Outcome:** Activity registry components lazy-loaded, ~50-100 KB reduction in RSC entry chunk.

## Phase 6: Final Verification

- [ ] Task: Verify bundle size target met
    - [ ] Run final bundle analyzer
    - [ ] Confirm RSC entry chunk < 500 KB
    - [ ] Document total reduction (target: ~380-570 KB)

- [ ] Task: Run full test suite
    - [ ] Run `npm test` to ensure all tests pass
    - [ ] Run `npm run lint` to ensure no lint errors
    - [ ] Run `npm run typecheck` to ensure no TypeScript errors
    - [ ] Fix any regressions found

- [ ] Task: Manual verification of user flows
    - [ ] Test auth flow (login/logout)
    - [ ] Test lesson navigation and rendering
    - [ ] Test teacher dashboard and gradebook
    - [ ] Test activity interactions

- [ ] Task: Update tech-debt.md
    - [ ] Mark "Facade RSC entry chunk 687 KB (limit 500 KB)" as Resolved
    - [ ] Document final bundle size and reduction achieved

- [ ] Task: Conductor — Phase Completion Verification 'Final Verification' (Protocol in workflow.md)

**Expected Outcome:** Bundle size < 500 KB, all tests passing, no regressions, tech debt updated.
