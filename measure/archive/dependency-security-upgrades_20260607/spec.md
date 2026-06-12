# Track: Dependency Security & Package Upgrades

Program: Quality & Completion Backlog (Tier 1)
Type: Chore
Depends on: none

## Overview

The npm workspace has one root lockfile, five first-class apps, and 21 shared
packages. A 2026-06-07 audit found 36 direct package families with newer
versions and 18 security findings: 1 critical, 3 high, and 14 moderate.
The critical finding is caused by the isolated Vitest 2.x declaration in
`packages/practice-test-engine`; high findings include the installed Next.js,
React Server Components, and Vite RSC plugin versions.

This track upgrades dependencies in controlled, independently verifiable waves.
Security patches and compatible in-range refreshes land before any major
framework or toolchain migration. Major upgrades remain isolated so a failure
can be attributed and rolled back without discarding the security work.

## Audit Baseline

- Installed direct external dependencies checked: 62.
- Direct package families with newer registry versions: 36.
- Upgrades accepted by all current manifest ranges: 22.
- Upgrades requiring at least one manifest change or major migration: 14.
- `npm audit`: 18 findings (1 critical, 3 high, 14 moderate).
- `npm ls --workspaces --depth=0`: clean, with no dependency-tree problems.
- Aggregate `npm outdated --workspaces` under-reports app-owned dependencies;
  the durable audit must inspect manifests/lockfile directly or check each
  first-class workspace.
- The app manifests use `"next": "latest"`, which can silently cross a major
  boundary on lockfile refresh and must be replaced with an intentional range.

## Confirmed Upgrade Inventory

The implementation audit matrix must preserve this complete 36-package-family
baseline and update the exact target versions from the registry immediately
before each approved upgrade wave.

### Compatible With Current Manifest Ranges

| Package families |
|---|
| `@cloudflare/vite-plugin`, `@playwright/test` |
| `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-slot`, `@radix-ui/react-tabs` |
| `@types/react`, `@vitejs/plugin-rsc`, `baseline-browser-mapping` |
| `convex`, `geist`, `postcss`, `react`, `react-dom` |
| `tailwind-merge`, `ts-fsrs`, `tsx`, `typescript-eslint`, `wrangler`, `zod` |

### Require Manifest Change Or Major Migration

| Package families |
|---|
| `@eslint/js`, `@types/node`, `@vitejs/plugin-react` |
| `eslint`, `eslint-config-next`, `jsdom`, `katex`, `lucide-react` |
| `next`, `tailwindcss`, `typescript`, `vinext`, `vite`, `vitest` |

## Functional Requirements

- FR1 — Establish a reproducible dependency audit that reports direct manifest
  declarations, installed lockfile versions, latest registry versions,
  range-compatible upgrades, major upgrades, declaration drift, and
  `npm audit` severity totals across every app and package.
- FR2 — Capture the pre-upgrade baseline and a package-wave matrix under this
  track. Each dependency must have an owner wave, target version, compatibility
  notes, and verification status.
- FR3 — Remediate urgent advisories first, targeting at minimum:
  Next.js `15.5.15 → 15.5.19`, React/React DOM `19.2.5 → 19.2.7`, Convex
  `1.35.1 → 1.40.0`, `@vitejs/plugin-rsc` `0.5.24 → 0.5.27`, and
  `packages/practice-test-engine` Vitest `2.1.9 → 4.1.8`.
- FR4 — Replace `"next": "latest"` in app manifests with an intentional,
  compatible declaration so routine lockfile refreshes cannot silently install
  Next.js 16 before its migration wave.
- FR5 — Refresh all compatible in-range direct dependencies, including the
  Cloudflare/Vite tooling, Playwright, Radix UI, React types, baseline browser
  mapping, Geist, PostCSS, tailwind-merge, ts-fsrs, tsx, typescript-eslint,
  Wrangler, Zod, and other direct packages identified by the durable audit.
- FR6 — Reconcile avoidable declaration drift across apps/packages, including
  KaTeX, Lucide, tailwind-merge, ts-fsrs, Vitest, ESLint declarations,
  `eslint-config-next`, and Node type declarations. Intentional drift must be
  documented rather than normalized blindly.
- FR7 — Execute and validate coordinated vinext/runtime migration:
  vinext `0.0.5 → 0.0.55`, Vite `7 → 8`, `@vitejs/plugin-react` `4 → 6`,
  and all peer-required React/RSC packages. Verify all five apps independently.
- FR8 — Execute remaining major migrations as separately attributable tasks:
  Next.js `15 → 16`, TypeScript `5 → 6`, ESLint/`@eslint/js` `9 → 10`,
  Tailwind CSS `3 → 4`, KaTeX `0.16 → 0.17`, Lucide React `0.x → 1.x`,
  jsdom `26 → 29`, and `eslint-config-next` `15 → 16`.
- FR9 — Investigate residual audit findings instead of accepting unsafe
  automated recommendations. In particular, do not downgrade `drizzle-kit` to
  `0.18.1` merely because `npm audit` proposes it; document exploitability,
  upstream status, and the chosen resolution.
- FR10 — Preserve one root `package-lock.json`; do not create per-workspace
  lockfiles or retain nested workspace `node_modules` as a workaround.

## Non-Functional Requirements

- No dependency installation or manifest change begins without the explicit
  approval required by the repository guardrails.
- Never run or accept `npm audit fix --force`.
- Each upgrade wave must be independently committable and leave a coherent
  lockfile, passing dependency tree, and documented audit delta.
- Security remediation must not wait for optional major migrations.
- Reusable packages must continue to obey the monorepo boundary rule.
- Major migrations must follow the relevant Next.js, Vite, and Vitest migration
  guidance and preserve existing application behavior.

## Acceptance Criteria

- AC1 — A repeatable, repo-wide dependency audit reports all manifests and does
  not undercount first-class app dependencies.
- AC2 — The critical Vitest advisory and all high-severity advisories are
  resolved; any remaining moderate advisories have documented disposition.
- AC3 — `npm ls --workspaces --depth=0` exits cleanly after every wave.
- AC4 — App manifests no longer use an uncontrolled `"next": "latest"` range.
- AC5 — All 36 direct upgrade candidates are upgraded or explicitly documented
  as deferred with compatibility evidence and a follow-up owner.
- AC6 — Version declaration drift is either reconciled or documented as
  intentional.
- AC7 — The root lockfile is the only lockfile and no nested dependency
  workaround is introduced.
- AC8 — Final verification passes:
  `node scripts/check-monorepo-boundaries.mjs`, root/package tests, all five app
  lint/test/typecheck/build scripts, `npm ls --workspaces --depth=0`, and
  `npm audit`.

## Out of Scope

- Unrelated application features or refactors.
- Replacing npm with another package manager.
- Automatically fixing existing lint/test/typecheck failures unrelated to an
  upgrade; baseline failures must be recorded separately.
- Dependency upgrades not present in the confirmed audit baseline unless needed
  as a transitive compatibility requirement.
