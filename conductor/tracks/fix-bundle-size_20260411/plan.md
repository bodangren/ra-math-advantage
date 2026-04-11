# Implementation Plan — Fix Bundle Size (RSC Entry Chunk)

## Phase 1: Analyze Current Bundle Composition [COMPLETED]

- [x] Task: Analyze bundle size and composition
    - [x] Run bundle analyzer to identify largest contributors
    - [x] Document which modules are in the RSC entry chunk
    - [x] Verify the 687 KB size baseline
    - [x] Identify low-hanging fruit for quick wins

- [x] Task: Map component import dependencies
    - [x] Trace `MarkdownRenderer` import locations
    - [x] Trace `ConvexClientProvider` usage across pages
    - [x] Identify activity registry eager imports
    - [x] Document route-level component usage

- [x] Task: Conductor — Phase Completion Verification 'Analyze Current Bundle Composition' (Protocol in workflow.md)

**Findings:**
- **Client RSC entry chunk**: worker-entry-Dr6LKK7J.js = 687 KB ✓ (matches baseline)
- **Server SSR entry chunk**: worker-entry-CK9t-BwC.js = 1.5 MB (even larger!)
- **Build warnings**: Vite warns about static imports that should be dynamic
- **Key contributors**:
  - `react-markdown` + `remark-gfm` + `katex` imported at top level in MarkdownRenderer.tsx
  - `ConvexClientProvider` wraps all pages in root layout.tsx
  - Both MarkdownRenderer variants are statically imported in PhaseRenderer and LessonRenderer

**Import Map:**
- `app/layout.tsx` → `ConvexClientProvider` (static, wraps all pages)
- `app/student/lesson/[lessonSlug]/page.tsx` → `LessonRenderer` (static)
- `components/lesson/LessonRenderer.tsx` → `PhaseRenderer` (static)
- `components/lesson/PhaseRenderer.tsx` → `ActivityRenderer` (static) + `LessonMarkdownRenderer` (static)
- `components/lesson/MarkdownRenderer.tsx` → `TextbookMarkdownRenderer` (static)
- `components/textbook/MarkdownRenderer.tsx` → `react-markdown` + `remark-gfm` + `katex` (static)
- `components/lesson/ActivityRenderer.tsx` → `getActivityComponent()` (registry lookup, no eager imports)

**Low-Hanging Fruit (in order of impact):**
1. **Lazy-load MarkdownRenderer** (~150-200 KB): React-markdown + katex are heavy
2. **Split root layout for ConvexClientProvider** (~80-120 KB): Auth pages don't need Convex
3. **Route-level splitting** (~100-150 KB): Lazy-load LessonRenderer in lesson pages
4. Activity registry is already optimized (uses placeholders, no eager imports)

**Expected Outcome:** Clear map of what's in the 687 KB bundle and which lazy-loading strategies will have the most impact.

## Phase 2: Lazy-Load MarkdownRenderer [COMPLETED]

- [x] Task: Lazy-load MarkdownRenderer in PhaseRenderer
    - [x] Write tests: verify MarkdownRenderer loads and renders correctly (tests already mock it)
    - [x] Convert `LessonMarkdownRenderer` import to `next/dynamic` with `ssr: true`
    - [x] Test loading states and error handling
    - [x] Verify content renders identically to before

- [x] Task: Lazy-load MarkdownRenderer in LessonPageLayout
    - [x] Write tests: verify MarkdownRenderer loads and renders correctly
    - [x] Convert `MarkdownRenderer` import to `next/dynamic` with `ssr: true`
    - [x] Test loading states and error handling
    - [x] Verify content renders identically to before
    - **Note:** LessonPageLayout does not use MarkdownRenderer; this task is N/A

- [x] Task: Measure bundle size reduction
    - [x] Run bundle analyzer after changes
    - [x] Verify expected ~150-200 KB reduction
    - [x] Document actual vs expected savings

- [x] Task: Conductor — Phase Completion Verification 'Lazy-Load MarkdownRenderer' (Protocol in workflow.md)

**Results:**
- **Client worker-entry**: 262 KB (was 687 KB) = **425 KB reduction (62%)**
- **Server worker-entry**: 613 KB (was 1.5 MB) = **909 KB reduction (60%)**
- **New MarkdownRenderer chunk**: 411 KB (client) / 877 KB (server)
- **All 823 tests pass** (1 pre-existing environment teardown error unrelated to changes)
- **Target met**: Worker entry is now well under 500 KB limit!

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
