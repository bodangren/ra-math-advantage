# Monorepo Integration Guide

This document covers package creation, app adoption patterns, boundary rules, and operational guides for the `ra-math-advantage` monorepo. `README.md` gives the current state and the planned direction of 2026-11-14.

## Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Package Creation](#package-creation)
3. [App Adoption](#app-adoption)
4. [Boundary Rules](#boundary-rules)
5. [Local Development](#local-development)
6. [Testing](#testing)
7. [Convex Projects](#convex-projects)
8. [Deployment](#deployment)
9. [Ownership Map](#ownership-map)

---

## Monorepo Structure

```
ra-math-advantage/             # Monorepo root
├── apps/
│   ├── integrated-math-3/     # IM3 application (primary)
│   ├── integrated-math-1/     # IM1 application
│   ├── integrated-math-2/     # IM2 application
│   ├── pre-calculus/          # AP Precalculus application
│   └── bus-math-v2/           # Business Math v2
├── packages/                  # 20 shared packages and _template (README.md lists each one)
├── measure/                   # Measure spec-driven development framework
└── README.md                  # Current state and planned direction
```

One math app `apps/math` replaces the four math apps (planned: math-app-base_20261114)
(planned: math-app-retire-old-apps_20261114).

---

## Package Creation

### Prerequisites

Before creating a new package, confirm:
- The shared code is stable across both apps
- The code has no app-specific imports (`apps/*`, `convex/_generated/*`)
- The code is course-agnostic (no curriculum data, question banks, or domain assets)

### Steps

1. **Copy the template:**
   ```bash
   cp -r packages/_template packages/<your-package-name>
   ```

2. **Update `package.json`:**
   ```json
   {
     "name": "@math-platform/<your-package-name>",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "exports": {
       ".": {
         "import": "./src/index.ts",
         "types": "./src/index.ts"
       }
     }
   }
   ```

3. **Update `tsconfig.json`** if your entry point differs.

4. **Write the package `README.md`** (see [Package README Template](#package-readme-template)).

5. **Add source code in `src/`** with all public APIs exported from `src/index.ts`.

6. **Add tests in `src/__tests__/`**.

7. **Run verification:**
   ```bash
   npm run lint --workspace=@math-platform/<your-package-name>
   npm run typecheck --workspace=@math-platform/<your-package-name>
   npm run test --workspace=@math-platform/<your-package-name>
   npm run build --workspace=@math-platform/<your-package-name>
   ```

---

## App Adoption

### IM3 Adoption

Add the package to the `dependencies` of `apps/integrated-math-3/package.json` with the
range `"*"` (for example `"@math-platform/<package-name>": "*"`). Then run `npm install` at
the monorepo root. A dependency change needs explicit approval (`AGENTS.md`, Guardrails).

Update imports:
```typescript
// Before (local import)
import { someFunction } from '@/lib/practice/some-module';

// After (package import)
import { someFunction } from '@math-platform/practice-core';
```

### BM2 Adoption

Same as IM3 adoption. Both apps share the same package imports.

---

## Boundary Rules

### Critical Constraints

| Rule | Applies To | Description |
|------|------------|-------------|
| No `apps/*` imports | All packages | Packages must be app-agnostic |
| No `convex/_generated/*` imports | All packages | Use injected adapters for Convex APIs |
| No business-domain code | Shared packages | Keep domain-specific code app-local |
| No curriculum data | Shared packages | Question banks, glossary terms stay in apps |
| No asset files | Shared packages | Workbook files, images, fonts stay in apps |

### App-Local Keep List

**IM3 (must remain local):**
- `apps/integrated-math-3/lib/practice/engine/**` — algebraic practice families
- `apps/integrated-math-3/components/activities/graphing/**` — IM3-specific graphing configs
- `apps/integrated-math-3/curriculum/**` — lesson seeds, phase content
- `apps/integrated-math-3/lib/study/**` — IM3 glossary terms
- `apps/integrated-math-3/public/workbooks/**` — IM3 workbook assets

**BM2 (must remain local):**
- `apps/bus-math-v2/lib/practice/engine/**` — accounting practice families
- `apps/bus-math-v2/components/activities/spreadsheet/**` — spreadsheet activities
- `apps/bus-math-v2/components/activities/simulations/**` — business simulations
- `apps/bus-math-v2/resources/**` — business assets
- `apps/bus-math-v2/public/workbooks/**` — BM2 workbook assets

### Review Checklist

When merging package changes:
- [ ] No `import from 'apps/...'`
- [ ] No `import from 'convex/_generated/...'`
- [ ] No domain-specific code (accounting, spreadsheets, simulations)
- [ ] All public exports have tests
- [ ] Both IM3 and BM2 tests pass after adoption

---

## Local Development

### Environment Variables

**IM3** (in `apps/integrated-math-3/.env.local`):
```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
CONVEX_DEPLOY_KEY=<server-only deploy key>
AUTH_JWT_SECRET=<server-only JWT secret>
```

**BM2** (in `apps/bus-math-v2/.env.local`):
```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
CONVEX_DEPLOY_KEY=<server-only deploy key>
AUTH_JWT_SECRET=<server-only JWT secret>
```

### Running Both Apps

```bash
# Terminal 1: IM3
cd apps/integrated-math-3
npx convex dev --local
npm run dev:stack

# Terminal 2: BM2
cd apps/bus-math-v2
npx convex dev --local
npm run dev
```

### Workspace Scripts

From monorepo root, each app has `ws:<app>:lint`, `ws:<app>:test`, `ws:<app>:typecheck`,
and `ws:<app>:build` scripts (`im3`, `bm2`, `im2`, `im1`, `pc`). `README.md` lists each
one. The root has no script that runs all packages.

Per-app commands:

| Command | Description |
|---------|-------------|
| `npm run ws:im3:lint` | Lint IM3 |
| `npm run ws:im3:test` | Test IM3 |
| `npm run ws:im3:typecheck` | Typecheck IM3 |
| `npm run ws:im3:build` | Build IM3 |
| `npm run ws:bm2:lint` | Lint BM2 |
| `npm run ws:bm2:test` | Test BM2 |
| `npm run ws:bm2:build` | Build BM2 |

---

## Testing

### Package Tests

Place tests in `src/__tests__/`:
```
packages/<package>/
├── src/
│   ├── index.ts
│   └── __tests__/
│       └── *.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

Run package tests:
```bash
npm run test --workspace=@math-platform/<package-name>
```

### App Tests

IM3:
```bash
cd apps/integrated-math-3
npm test
```

BM2:
```bash
cd apps/bus-math-v2
npm test
```

### Full Gates

**IM3:**
```bash
cd apps/integrated-math-3 && npm run lint && npm test && npm run typecheck && npm run build
```

**BM2:**
```bash
cd apps/bus-math-v2 && npm run lint && npm test && npm run build && npx tsc --noEmit
```

---

## Convex Projects

Each app maintains its own Convex project:

| App | Convex Project | Schema | Generated API |
|-----|----------------|--------|--------------|
| IM3 | `integrated-math-3` (dev deployment only) | `apps/integrated-math-3/convex/schema.ts` | `apps/integrated-math-3/convex/_generated/api.d.ts` |
| BM2 | `bus-math-v2-experimental` (prod deployment `quiet-swan-141`) | `apps/bus-math-v2/convex/schema.ts` | `apps/bus-math-v2/convex/_generated/api.d.ts` |

### Convex Commands

```bash
# IM3
cd apps/integrated-math-3
npx convex dev --local          # Local development (also pushes schema changes)
npx convex deploy               # Deploy to production

# BM2
cd apps/bus-math-v2
npx convex dev --local
npx convex deploy
```

`npx convex dev` and `npx convex deploy` push the schema. Convex has no separate schema
push command.

---

## Deployment

Each app deploys to a Cloudflare Worker (not Cloudflare Pages). Its `wrangler.jsonc` names
the Worker. The Workers `integrated-math-3` and `bus-math-v2` exist on workers.dev with no
traffic, and no deploy has run from this repository.

The orchestrator runs the deploys locally with the OAuth logins of `wrangler` and
`convex`: `npm run deploy:app -- <app>` runs a preflight, the Convex deploy, the Worker
deploy, a smoke test, and a rollback on failure (planned: prod-deploy-pipeline_20261114).

---

## Ownership Map

| Package | Owner | Canonical Source | App-Local Remainder |
|---------|-------|------------------|---------------------|
| `core-auth` | Shared | Both IM3 + BM2 | BM2 Supabase compat |
| `core-convex` | Shared | Both IM3 + BM2 | BM2 Supabase profile resolver |
| `practice-core` | Shared | IM3 | BM2 practice families |
| `srs-engine` | Shared | IM3 | Convex store adapters |
| `activity-runtime` | Shared | IM3 | Course activity components |
| `component-approval` | Shared | IM3 + BM2 hardening | App-specific review targets |
| `graphing-core` | Shared | Reconciled | BM2 exploration configs, IM3 quadratic configs |
| `practice-test-engine` | Shared | Reconciled | Question banks |
| `study-hub-core` | Shared | Reconciled | Glossary data, route loaders |
| `teacher-reporting-core` | Shared | Reconciled later | Convex query handlers |
| `ai-tutoring` | BM2 → Shared | BM2 | Rate-limit storage, API keys |
| `workbook-pipeline` | BM2 → Shared | BM2 | `.xlsx` assets, capstone PDFs |

---

## Package README Template

```markdown
# @math-platform/<package-name>

Brief description of what this package provides.

## Installation

This package is already part of the monorepo workspace. No separate installation needed.

## Usage

\`\`\`typescript
import { /* public API */ } from '@math-platform/<package-name>';
\`\`\`

## Public API

### Functions

#### `functionName`

Description.

\`\`\`typescript
function functionName(arg: Type): ReturnType
\`\`\`

### Types

#### `TypeName`

Description.

## Testing

\`\`\`bash
npm run test --workspace=@math-platform/<package-name>
\`\`\`

## Boundary Rules

This package MUST NOT:
- Import from `apps/*`
- Import from `convex/_generated/*`
- Contain business-domain code (accounting, spreadsheets, simulations)
- Contain curriculum data or asset files

## Changelog

### 2026-04-19
- Initial extraction
```