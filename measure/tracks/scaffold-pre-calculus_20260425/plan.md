# Implementation Plan: Scaffold AP Precalculus Course Application

## Phase 1: Project Configuration and Dependencies

- [ ] Task: Create package.json with workspace dependencies
    - [ ] Write package.json with @math-platform/* deps, vinext, vitest, and all IM3-equivalent deps
    - [ ] Verify npm install resolves workspace deps
- [ ] Task: Create TypeScript and build configuration
    - [ ] Write tsconfig.json (copy from IM3)
    - [ ] Write vite.config.ts (adapted for pre-calculus)
    - [ ] Write next.config.ts
    - [ ] Write postcss.config.mjs
    - [ ] Write eslint.config.mjs
    - [ ] Write tailwind.config.ts (adapted for DESIGN.md tokens)
- [ ] Task: Create test and utility configuration
    - [ ] Write vitest.config.ts and vitest.setup.ts
    - [ ] Write wrangler.jsonc (name: pre-calculus)
    - [ ] Write .gitignore and .env.local template
    - [ ] Write scripts/dev-stack.mjs
- [ ] Task: Measure - Phase 1 Manual Verification (Protocol in workflow.md)

## Phase 2: Convex Schema and Backend Infrastructure

- [ ] Task: Copy Convex schema and configuration
    - [ ] Create convex/ directory with tsconfig.json
    - [ ] Copy schema.ts from IM3 verbatim
    - [ ] Create convex/_generated/ placeholder
- [ ] Task: Create backend functions
    - [ ] Write convex/public.ts — unauthenticated curriculum queries
    - [ ] Write convex/auth.ts — login/register/session handlers
    - [ ] Write convex/activities.ts — placeholder
    - [ ] Write convex/student.ts — placeholder
    - [ ] Write convex/teacher.ts — placeholder
    - [ ] Write convex/seed.ts — orchestration entry point
- [ ] Task: Create lib infrastructure
    - [ ] Write lib/convex/server.ts (using @math-platform/core-convex)
    - [ ] Write lib/auth/server.ts (using @math-platform/core-auth)
    - [ ] Write lib/utils.ts (cn helper)
    - [ ] Write types/activity.ts and types/api.ts
- [ ] Task: Write unit tests for lib utilities
    - [ ] Test lib/utils.ts cn helper
    - [ ] Test lib/convex/server.ts ConvexHttpClient setup
- [ ] Task: Measure - Phase 2 Manual Verification (Protocol in workflow.md)

## Phase 3: Design System and Global Styles

- [ ] Task: Implement DESIGN.md tokens in globals.css
    - [ ] Write dark-mode-native color palette (canvas #080a0f, panel #141820, surface #1e2330)
    - [ ] Define indigo primary (#5e6ad2) and sky-blue accent (#38bdf8) tokens
    - [ ] Implement Inter Variable with cv01/ss03 font stack
    - [ ] Implement typography hierarchy (display 68px weight 510, body, caption, label)
    - [ ] Add component base styles (buttons, cards, inputs, navigation)
    - [ ] Add animation utilities
- [ ] Task: Update tailwind.config.ts for DESIGN.md system
    - [ ] Configure spacing scale (base 8px)
    - [ ] Configure border-radius scale (2/4/6/8/12/9999px)
    - [ ] Configure responsive breakpoints per DESIGN.md
    - [ ] Add font family tokens (Inter Variable, Fira Code)
- [ ] Task: Write public assets
    - [ ] Add favicon.svg placeholder
- [ ] Task: Measure - Phase 3 Manual Verification (Protocol in workflow.md)

## Phase 4: Layout, Providers, and Middleware

- [ ] Task: Create root layout with providers
    - [ ] Write app/layout.tsx with ConvexClientProvider + AuthProvider + ThemeProvider
    - [ ] Write components/ConvexClientProvider.tsx
    - [ ] Write components/auth/AuthProvider.tsx (using @math-platform/core-auth)
    - [ ] Write components/auth-button.tsx
    - [ ] Write components/logout-button.tsx
    - [ ] Write components/user-menu.tsx
    - [ ] Write components/theme-switcher.tsx
    - [ ] Write components/env-var-warning.tsx
- [ ] Task: Create header and footer components
    - [ ] Write components/header-simple.tsx with AP Precalculus branding
    - [ ] Write components/footer.tsx with course attribution
- [ ] Task: Create middleware
    - [ ] Write middleware.ts for component-approval auth guard
- [ ] Task: Write component tests
    - [ ] Test AuthProvider renders
    - [ ] Test ConvexClientProvider renders
    - [ ] Test header and footer render
- [ ] Task: Measure - Phase 4 Manual Verification (Protocol in workflow.md)

## Phase 5: Pages and Routes

- [ ] Task: Create landing page
    - [ ] Write app/page.tsx with AP Precalculus hero, unit overview cards, CTAs
    - [ ] Dark-mode-native aesthetic per DESIGN.md
- [ ] Task: Create auth routes
    - [ ] Write app/auth/login/page.tsx
    - [ ] Write app/auth/register/page.tsx
    - [ ] Write app/api/auth/login/route.ts
    - [ ] Write app/api/auth/register/route.ts
    - [ ] Write app/api/auth/session/route.ts
- [ ] Task: Create curriculum page
    - [ ] Write app/curriculum/page.tsx showing 4 units with lesson listings
- [ ] Task: Create placeholder dashboards
    - [ ] Write app/student/dashboard/page.tsx with "Coming Soon"
    - [ ] Write app/teacher/dashboard/page.tsx with "Coming Soon"
- [ ] Task: Write page tests
    - [ ] Test landing page renders
    - [ ] Test login page renders
    - [ ] Test curriculum page renders units
- [ ] Task: Measure - Phase 5 Manual Verification (Protocol in workflow.md)

## Phase 6: Seed Data and Verification

- [ ] Task: Create seed data for AP Precalculus
    - [ ] Write convex/seed/units.ts — 4 units with lesson slugs and titles from curriculum/overview.md
    - [ ] Write convex/seed/standards.ts — placeholder
    - [ ] Wire seed/units.ts into convex/seed.ts
- [ ] Task: Update root workspace configuration
    - [ ] Add ws:pc:lint, ws:pc:test, ws:pc:typecheck, ws:pc:build scripts to root package.json
- [ ] Task: Final verification
    - [ ] Run npm run lint
    - [ ] Run npx tsc --noEmit
    - [ ] Run npm run build
    - [ ] Run npm run test
    - [ ] Verify npm run dev boots
- [ ] Task: Measure - Phase 6 Manual Verification (Protocol in workflow.md)
