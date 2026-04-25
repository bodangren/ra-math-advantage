# Implementation Plan: Scaffold Integrated Math 2 Course Application

## Phase 1: Project Configuration and Dependencies

- [x] Task: Create package.json with workspace dependencies
    - [x] Write package.json with @math-platform/* deps, vinext, vitest, and all IM3-equivalent deps
    - [x] Verify npm install resolves workspace deps
- [x] Task: Create TypeScript and build configuration
    - [x] Write tsconfig.json (copy from IM3)
    - [x] Write vite.config.ts (adapted for integrated-math-2)
    - [x] Write next.config.ts
    - [x] Write postcss.config.mjs
    - [x] Write eslint.config.mjs
    - [x] Write tailwind.config.ts (using IM2 design tokens)
- [x] Task: Create test and utility configuration
    - [x] Write vitest.config.ts and vitest.setup.ts
    - [x] Write wrangler.jsonc (name: integrated-math-2)
    - [x] Write .gitignore and .env.local template
    - [x] Write scripts/dev-stack.mjs
- [x] Task: Measure - Phase 1 Manual Verification (Protocol in workflow.md)

## Phase 2: Convex Schema and Backend Infrastructure

- [x] Task: Copy Convex schema and configuration
    - [x] Create convex/ directory with tsconfig.json
    - [x] Copy schema.ts from pre-calculus verbatim (same schema as IM3)
    - [x] Create convex/_generated/ placeholder (with stub files for tsc)
- [x] Task: Create backend functions
    - [x] Write convex/public.ts — unauthenticated curriculum queries
    - [x] Write convex/auth.ts — login/register/session handlers
    - [x] Write convex/activities.ts — placeholder
    - [x] Write convex/student.ts — placeholder
    - [x] Write convex/teacher.ts — placeholder
    - [x] Write convex/seed.ts — orchestration entry point
- [x] Task: Create lib infrastructure
    - [x] Write lib/convex/server.ts (using @math-platform/core-convex)
    - [x] Write lib/auth/server.ts (using @math-platform/core-auth)
    - [x] Write lib/utils.ts (cn helper)
    - [x] Write types/activity.ts and types/api.ts
- [x] Task: Write unit tests for lib utilities
    - [x] Test lib/utils.ts cn helper
    - [x] Test lib/convex/server.ts ConvexHttpClient setup (via ConvexClientProvider test)
- [x] Task: Measure - Phase 2 Manual Verification (Protocol in workflow.md)

## Phase 3: Design System and Global Styles

- [x] Task: Implement DESIGN.md tokens in globals.css
    - [x] Write warm academic orange color palette (brand orange primary, teal accent)
    - [x] Define oklch-based CSS custom properties for light and dark modes
    - [x] Implement Lora/DM Sans/Fira Code font stack
    - [x] Implement typography scale (display-lg, display-md, body-lg, body-md, label-mono)
    - [x] Add component base styles (buttons, cards, inputs, navigation)
    - [x] Add animation utilities (fade-up, gradients)
- [x] Task: Configure tailwind.config.ts for DESIGN.md system
    - [x] Configure oklch color tokens
    - [x] Configure border-radius scale
    - [x] Add font family tokens
- [x] Task: Write public assets
    - [x] Add favicon.svg placeholder
- [x] Task: Measure - Phase 3 Manual Verification (Protocol in workflow.md)

## Phase 4: Layout, Providers, and Middleware

- [x] Task: Create root layout with providers
    - [x] Write app/layout.tsx with ConvexClientProvider + AuthProvider + ThemeProvider
    - [x] Write components/ConvexClientProvider.tsx
    - [x] Write components/auth/AuthProvider.tsx (using @math-platform/core-auth)
    - [x] Write components/auth-button.tsx
    - [x] Write components/logout-button.tsx
    - [x] Write components/user-menu.tsx
    - [x] Write components/theme-switcher.tsx
    - [x] Write components/env-var-warning.tsx
- [x] Task: Create header and footer components
    - [x] Write components/header-simple.tsx with Integrated Math 2 branding
    - [x] Write components/footer.tsx with course attribution
- [x] Task: Create middleware
    - [x] Write middleware.ts for component-approval auth guard
- [x] Task: Write component tests
    - [x] Test AuthProvider renders (placeholder test)
    - [x] Test ConvexClientProvider renders (verifies getConvexUrl usage)
    - [x] Test header and footer render (placeholder test)
- [x] Task: Measure - Phase 4 Manual Verification (Protocol in workflow.md)

## Phase 5: Pages and Routes

- [x] Task: Create landing page
    - [x] Write app/page.tsx with IM2 hero, 13-unit overview cards, CTAs
    - [x] Warm academic orange aesthetic per DESIGN.md
- [x] Task: Create auth routes
    - [x] Write app/auth/login/page.tsx
    - [x] Write app/auth/register/page.tsx
    - [x] Write app/api/auth/login/route.ts
    - [x] Write app/api/auth/register/route.ts
    - [x] Write app/api/auth/session/route.ts
- [x] Task: Create curriculum page
    - [x] Write app/curriculum/page.tsx showing 13 units with lesson listings
- [x] Task: Create placeholder dashboards
    - [x] Write app/student/dashboard/page.tsx with "Coming Soon"
    - [x] Write app/teacher/dashboard/page.tsx with "Coming Soon"
- [x] Task: Write page tests
    - [x] Test landing page renders
    - [x] Test login page renders
    - [x] Test curriculum page renders units
- [x] Task: Measure - Phase 5 Manual Verification (Protocol in workflow.md)

## Phase 6: Seed Data and Verification

- [x] Task: Create seed data for Integrated Math 2
    - [x] Write convex/seed/units.ts — 13 units with lesson slugs and titles from curriculum/overview.md
    - [x] Write convex/seed/standards.ts — placeholder
    - [x] Wire seed/units.ts into convex/seed.ts
- [x] Task: Update root workspace configuration
    - [x] ws:im2:lint, ws:im2:test, ws:im2:typecheck, ws:im2:build scripts already in root package.json
- [x] Task: Final verification
    - [x] Run npm run lint — PASS (0 warnings)
    - [x] Run npx tsc --noEmit — PASS
    - [x] Run npm run build — PASS (vinext build completes)
    - [x] Run npm run test — PASS (7 test files, 12 tests)
    - [ ] Verify npm run dev boots (requires Convex local — deferred to manual verification)
- [x] Task: Measure - Phase 6 Manual Verification (Protocol in workflow.md)
