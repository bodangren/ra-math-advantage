# Specification: Scaffold AP Precalculus Course Application

## Overview

Scaffold the `apps/pre-calculus/` application as a minimal runnable shell. The app already has product.md, product-guidelines.md, DESIGN.md, and curriculum/overview.md. This track creates the full project skeleton: config files, Convex schema, design system tokens, auth wiring, layout, landing page, and seed data so the app boots and renders pages.

## Functional Requirements

### FR-1: Project Configuration
- Copy and adapt all config files from IM3: package.json (with @math-platform/* workspace deps), tsconfig.json, vite.config.ts, vitest.config.ts, vitest.setup.ts, eslint.config.mjs, postcss.config.mjs, tailwind.config.ts, next.config.ts, wrangler.jsonc, .gitignore, .env.local template
- App name: `pre-calculus`, Convex project: AP Precalculus
- Scripts: dev, build, lint, typecheck, test, test:watch

### FR-2: Convex Schema
- Copy IM3's convex/schema.ts verbatim (all 517 lines, all tables)
- Copy convex/tsconfig.json
- Create placeholder convex/_generated/ directory structure

### FR-3: Design System Implementation
- Implement DESIGN.md tokens in globals.css:
  - Dark-mode-native palette: #080a0f canvas, #141820 panels, #1e2330 surfaces
  - Indigo primary (#5e6ad2), sky-blue accent (#38bdf8)
  - Inter Variable with cv01/ss03 OpenType features
  - Weight 510 as signature UI weight
  - Aggressive negative letter-spacing at display sizes
  - Semi-transparent white borders
  - Multi-layer shadows
- Update tailwind.config.ts to match the DESIGN.md spacing/radius/breakpoint system

### FR-4: Layout and Providers
- Root layout.tsx with ConvexClientProvider, AuthProvider, ThemeProvider
- Header and footer components with AP Precalculus branding
- Middleware for auth-gated routes (component-approval pattern from IM3)

### FR-5: Landing Page
- AP Precalculus branded landing page with:
  - Hero section with course title and description
  - 4-unit overview cards
  - Sign In and View Curriculum CTAs
  - Dark-mode-native aesthetic per DESIGN.md

### FR-6: Auth Routes
- Login page at /auth/login
- Register page at /auth/register
- Reuse IM3's auth components (AuthProvider, auth-button, logout-button)

### FR-7: Curriculum Public Page
- /curriculum route showing 4 units with lesson listings
- Sourced from curriculum/overview.md content structure

### FR-8: Placeholder Dashboards
- /student/dashboard — placeholder with "Coming Soon" message
- /teacher/dashboard — placeholder with "Coming Soon" message

### FR-9: Seed Data
- Seed script (convex/seed.ts) with:
  - Demo organization, teacher, and student profiles
  - 4 units with lesson placeholders (slugs and titles from curriculum/overview.md)
  - No phase, activity, or standard content

### FR-10: Shared Lib Infrastructure
- lib/convex/server.ts — ConvexHttpClient with admin auth (from core-convex package)
- lib/auth/server.ts — Cookie-based session, role guards (from core-auth package)
- types/ — activity.ts, api.ts type definitions (copied from IM3)

### FR-11: Public API Routes
- Convex public.ts with unauthenticated curriculum queries
- API routes for auth (login, register, session)

## Non-Functional Requirements

- TypeScript strict mode, no `any` without eslint-disable
- `npm run dev` boots without errors
- `npm run build` completes (vinext build)
- `npm run lint` passes
- `npx tsc --noEmit` passes
- Tests pass (vitest) — at minimum config/placeholder tests

## Acceptance Criteria

1. `npm run dev` starts and landing page renders at localhost
2. Landing page shows AP Precalculus branding with dark-mode-native design
3. /auth/login renders login form
4. /curriculum shows 4 units with lesson titles
5. /student/dashboard and /teacher/dashboard render placeholder pages
6. Convex schema matches IM3 schema (all tables present)
7. Seed script creates 4 units with ~54 lesson placeholders
8. `npm run lint && npm run build && npx tsc --noEmit` all pass
9. Root package.json has workspace scripts for pre-calculus

## Out of Scope

- Activity components (graphing, step-by-step, quizzes)
- Lesson rendering engine (phase stepper, phase renderer)
- Teacher gradebook, competency heatmaps, submission review
- SRS daily practice, study hub, practice tests
- AI chatbot
- Workbook system
- Curriculum content authoring (phases, activities, standards)
- E2E tests
