# Track: vinext 1.x Upgrade and Oxc Toolchain Move

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: none
Precedent: `measure/archive/dependency-security-upgrades_20260607/`

## Overview

This track moves the monorepo to vinext 1.x and to the Oxc tools: oxlint, oxfmt, and tsrs.
It also updates every dependency to the latest version that works.

The repository is a test bed for a full move to the Oxc project tools
(https://github.com/oxc-project). The track records the results in one evidence file, so
that other repositories can use them. The results are speed before and after, conformance
gaps, rule gaps, and workarounds.

Goal: all 5 apps build on vinext 1.x, and oxlint, tsrs, and oxfmt are the lint, type-check,
and format gates.

## Current System (checked 2026-11-14)

- **Workspaces:** npm workspaces `apps/*` and `packages/*`, with one root
  `package-lock.json`. The 5 apps are integrated-math-1, integrated-math-2,
  integrated-math-3, pre-calculus, and bus-math-v2. The 20 shared packages use the
  `@math-platform/*` scope. `packages/_template` is the template for new packages.
- **Framework:** all 5 apps run `vinext dev`, `vinext build`, and `vinext start`. Each app
  has `vite.config.ts` and `next.config.ts`, and has `"type": "module"`.
- **The `next` package:** the root, the 5 apps, and `packages/app-shell` declare `next`.
  The root `overrides` pin `next`, `eslint`, and `typescript`. The code imports `next`,
  `next/link`, `next/navigation`, `next/server`, `next/headers`, `next/image`, and
  `next/dynamic`.
- **vinext 1.4.5:** it depends on `@vinext/types`. This package declares the modules
  `next` and `next/*`. Apps load these types through `vinext/types`. vinext 1.4.5 needs
  Node >=22, React ^19.3.1, and `@vitejs/plugin-rsc` ^0.5.37.
- **Locked versions:** next 16.2.7, vinext 0.0.55, typescript 6.0.3, convex 1.40.0,
  vite 8.0.16, vitest 4.1.8, react 19.2.7, eslint 10.4.1.
- **Lint:** 19 `eslint.config.mjs` files exist: 5 in apps and 14 in packages. The apps use
  `eslint-config-next`. The packages use `@eslint/js` and `typescript-eslint`. Five packages
  have a lint script but no ESLint config: activity-components, app-shell, math-content,
  practice-test-engine, and rate-limiter. `packages/lesson-renderer` has no lint script.
- **Type check:** each workspace runs `tsc --noEmit` (TypeScript 6.0.3). The package
  `build` scripts also run `tsc --noEmit`. bus-math-v2 has no `typecheck` script. CI and
  `cloudflare-deploy.yml` call `npx tsc --noEmit` directly in the app folders.
- **Format:** the repository has no formatter and no `.git-blame-ignore-revs`.
- **CI:** `.github/workflows/ci.yml` and `cloudflare-deploy.yml` use Node 20. The local
  Node is v24.19.0.
- **Audit suites:** `scripts/audit/__tests__/` holds the suites of the precedent track.
  They pin package lines, for example `next` 16.x and `eslint-config-next` 16.x. No
  vitest config and no CI step runs them.
- **Convex CLI:** `scripts/dev-stack.mjs` in each app runs `npx convex dev --local`. No CI
  step runs the Convex CLI.
- **Editors:** the repository has no `.vscode/settings.json`, so editors use their bundled
  TypeScript.
- **Measure scripts:** no live script in `measure/scripts/` calls `eslint` or `tsc`.

## Decisions (user, 2026-11-14)

- **D1:** One track with 5 phases, in the order S1 to S5.
- **D2:** oxfmt formats the whole repository in one format-only commit. After that commit,
  `oxfmt --check` is a gate.
- **D3:** tsrs is the type-check gate, through `oxlint --type-aware --type-check` with
  tsrs installed and `TSRS_FAST=1`. The `typescript` package stays only where the Convex
  CLI or editors need it.
- **D4:** Every dependency moves to the latest version that works, including major
  versions. The user approved dependency changes for this track, as `AGENTS.md` requires.
- **D5:** The track records its results in an evidence file for other repositories.

## Terms

- **Gate:** one of lint, typecheck, test, build, format check, boundary check, and the
  scripts test suite.
- **Baseline:** the gate results that S1 records before any package change.
- **New failure:** a gate diagnostic that the baseline does not have. The comparison uses
  the workspace, the file, and the diagnostic code.
- **Held package:** a dependency that stays below its latest version because the latest
  version fails a gate.
- **Rule gap:** an ESLint rule that has no native oxlint rule.
- **Conformance gap:** a type-check diagnostic that tsrs and `tsc` report differently on
  the same commit, when both use the same compiler line. tsrs 0.25.0-ts7.1.0-beta uses
  TypeScript 7.1.0-beta, so the comparison uses `tsc` from `typescript@7.1.0-beta`.
- **Compiler-version difference:** a diagnostic that `tsc` 7.0.2 and `tsc` 7.1.0-beta
  report differently on the same commit. It is not a conformance gap.
- **Keep list:** the workspaces that keep the `typescript` package, each with its reason.
- **Format-only commit:** a commit that holds only oxfmt output.
- **Evidence file:** `measure/tracks/vinext-oxc-toolchain_20261114/oxc-evidence.md`.

## Stories

### Story S1: Package refresh and vinext 1.x
**As a** maintainer of the monorepo
**I want** every app on vinext 1.x, with current packages and without the `next` package
**So that** the apps build on the supported vinext line, and the Oxc phases start from a measured base

**Acceptance Criteria:**
- Given an empty `node_modules` and the current lockfile, When the maintainer runs `npm ci` and each gate, Then the evidence file records the baseline for each workspace.
- Given the upgrade, When each of the 5 apps runs `npm run build`, Then `vinext build` on vinext 1.x completes with exit code 0.
- Given the upgrade, When code imports `next` or `next/*`, Then the type check resolves the types through `vinext/types`, and no workspace can resolve the `next` package.
- Given a dependency whose latest version fails a gate, When no migration-guide change fixes the gate, Then the dependency is a held package in the evidence file.
- Given the CI workflows, When a job sets up Node, Then the job uses Node 24.

**Estimate:** XL
**Priority:** Must

### Story S2: ESLint to oxlint
**As a** maintainer of the monorepo
**I want** oxlint in place of ESLint in every workspace that has a lint script
**So that** lint runs on the Oxc linter, and other repositories know which rules oxlint does not have

**Acceptance Criteria:**
- Given each `eslint.config.mjs`, When the maintainer migrates it with `@oxlint/migrate`, Then a `.oxlintrc.json` in the same workspace holds the rules, and the ESLint config is deleted.
- Given a workspace with a lint script, When it runs `npm run lint`, Then oxlint exits with code 0 and reports zero warnings.
- Given a file with an unused variable, When oxlint runs with a migrated config, Then oxlint exits with a non-zero code.
- Given the migration, When it is complete, Then no manifest declares `eslint`, `typescript-eslint`, `eslint-config-next`, `@eslint/js`, or `@eslint/eslintrc`.
- Given a rule gap, When the migration is complete, Then the evidence file lists the rule, its source config, and its workspaces.

**Estimate:** L
**Priority:** Must

### Story S3: TypeScript 7 and tsrs
**As a** maintainer of the monorepo
**I want** a type-check gate that runs tsrs through oxlint with TypeScript 7 semantics
**So that** type checks use the Oxc tools, and other repositories know where tsrs differs from `tsc`

**Acceptance Criteria:**
- Given TypeScript 7.0.2, When `tsc --noEmit` runs in each workspace, Then it reports no new failure.
- Given tsrs, When a workspace runs `npm run typecheck`, Then the script runs `oxlint --type-aware --type-check` with `TSRS_FAST=1` and reports no new failure.
- Given a file that assigns a string to a `number` variable, When the type-check command runs, Then it exits with a non-zero code and reports TS2322.
- Given one commit, When the maintainer compares the `tsc` 7.1.0-beta and tsrs diagnostics, Then the evidence file lists each conformance gap with its file, line, code, and disposition.
- Given the same commit, When the maintainer compares `tsc` 7.0.2 and `tsc` 7.1.0-beta, Then the evidence file lists each compiler-version difference apart from the conformance gaps.
- Given the Convex CLI result, When the `typescript` package is removed, Then it stays only in the workspaces of the keep list.

**Estimate:** L
**Priority:** Must

### Story S4: oxfmt
**As a** maintainer of the monorepo
**I want** one oxfmt format of the whole repository and a format-check gate
**So that** all code has one style, and later changes cannot drift from it

**Acceptance Criteria:**
- Given `.oxfmtrc.json`, When the maintainer runs `npm run format`, Then one format-only commit holds the result.
- Given the format-only commit, When `git blame` uses `.git-blame-ignore-revs`, Then a reformatted line shows its earlier commit.
- Given the formatted repository, When `npm run format:check` runs, Then it exits with code 0.
- Given a file with incorrect spacing, When `oxfmt --check` runs on it, Then it exits with a non-zero code.
- Given the format-only commit, When the gates run, Then lint, typecheck, test, and build give the same results as before the format.

**Estimate:** M
**Priority:** Must

### Story S5: Gate rules and CI
**As a** maintainer, and as an agent that follows `AGENTS.md`
**I want** the guardrails, the workflow gates, the tech stack, the root scripts, and CI to name the Oxc gates
**So that** each session and each CI run uses oxlint, tsrs, and oxfmt, and no rule names a removed tool

**Acceptance Criteria:**
- Given `AGENTS.md`, When an agent reads the guardrails, Then they name `npm run typecheck` and `npm run format:check`, and not `npx tsc --noEmit`.
- Given `measure/workflow.md`, When a task reaches the quality gates, Then the gates name `npm run format:check`, `npm run lint`, and `npm run typecheck`.
- Given the root `package.json`, When the maintainer runs `npm run lint`, `npm run typecheck`, or `npm run format:check`, Then each covers all workspaces or the whole repository and reports no new failure.
- Given the CI workflows, When CI runs, Then a step runs `npm run format:check`, and no step calls `tsc` or `eslint`.
- Given the evidence file, When S5 is complete, Then its summary section gives the results for other repositories.

**Estimate:** M
**Priority:** Must

## Evidence File Contract

S1 creates the evidence file. Each phase fills its sections. The file has these 11 sections,
in this order:

1. **Environment:** CPU model, cores, RAM, OS, Node, npm, and each tool version.
2. **Baseline gates:** one row for each workspace, with lint, typecheck, test, and build results.
3. **Package changes:** package, old version, new version, workspaces, and notes.
4. **Held packages:** package, latest version, used version, failing gate, and first error line.
5. **Speed:** task, tool before, seconds before, tool after, seconds after, and ratio.
6. **Rule gaps:** ESLint rule, source config, workspaces, and the oxlint result.
7. **Conformance gaps:** the compiler version of each tool, then one row for each gap:
   workspace, file and line, code, `tsc` 7.1.0-beta result, tsrs result, and disposition.
   A second table lists each compiler-version difference.
8. **Workarounds:** tool, problem, workaround, and the upstream issue link when one exists.
9. **Keep list:** workspace and the reason that it keeps `typescript`.
10. **Pre-existing failures:** gate, workspace, file, and diagnostic code.
11. **Summary for other repositories:** the main results and the recommended order of steps.

## Non-Functional Requirements

- The user approved dependency changes for this track on 2026-11-14.
- Do not run `npm audit fix --force`.
- The root `package-lock.json` stays the only lockfile.
- Shared packages do not import from `apps/` or `convex/_generated/`.
- Each phase leaves each gate with no new failure.
- The track fixes no pre-existing failure, with one exception: S2 makes each lint script
  pass with zero warnings, as the user asked for S2.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- **AC1:** All 5 apps pass `npm run build` on vinext 1.x. No manifest declares `next`, and
  no workspace can resolve it.
- **AC2:** Each direct dependency is on its latest version, or the evidence file lists it as
  a held package.
- **AC3:** Each workspace lint script runs oxlint and passes with zero warnings. No ESLint
  package and no ESLint config remain.
- **AC4:** Each workspace typecheck script runs `oxlint --type-aware --type-check` with
  tsrs and `TSRS_FAST=1`. The `typescript` package stays only in the keep list. The one
  exception is a workspace with a blocking conformance gap: its script runs `tsc`, and the
  evidence file names it.
- **AC5:** `npm run format:check` exits with code 0. `.git-blame-ignore-revs` lists the
  format-only commit.
- **AC6:** `AGENTS.md`, `measure/workflow.md`, `measure/tech-stack.md`, the root scripts,
  and the CI workflows name the Oxc gates. None of them calls `tsc` or `eslint`.
- **AC7:** The evidence file has all 11 sections. The speed section has before and after
  values for build, lint, and type check, and the time of the format check.
- **AC8:** The test, typecheck, and build gates have no new failure. `npm ls --workspaces
  --depth=0` is clean. The boundary check passes. `npm audit` has no new critical or high
  finding.
- **AC9:** The CI workflows use Node 24.

## Out of Scope

- Deploys, paid services, and public dates. Do not run `convex deploy`. Do not start
  `cloudflare-deploy.yml`.
- Fixes for pre-existing typecheck, test, or build failures. The evidence file lists them.
- The React Compiler rules that the tech-debt row "IM3 React 19 react-hooks v6 violations"
  names. S2 records their oxlint status only.
- A change of npm, Vite, or Vitest to other tools.
- oxlint JS plugins (`jsPlugins`). S2 uses native oxlint rules only.
- Markdown and MDX formatting. S4 formats code and config files only.
- Generated files, curriculum content, and Measure records in the format scope.
- A new lint script for `packages/lesson-renderer`.
- Changes to app behavior, and changes to `vite.config.ts` that no failing build needs.
