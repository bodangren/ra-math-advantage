# Track: Dependency Security & Package Upgrades — Implementation Plan

Workflow: Audit-contract first, then dependency-ordered upgrade waves with
tests before and after each wave.
Approval gate: repository guardrails require explicit approval before any
dependency installation or manifest change.
Verification substitute for Doctor: `node scripts/check-monorepo-boundaries.mjs`
+ per-app lint/test/typecheck/build + `npm ls --workspaces --depth=0` +
`npm audit`.

## Phase 1 — Audit Contract & Baseline

- [~] Task: Define the durable repo-wide dependency-audit contract and expected report schema
    - [~] Cover all app/package manifests, the root lockfile, registry latest versions, range compatibility, declaration drift, and security totals
    - [~] Add a regression fixture/assertion proving first-class app dependencies are not under-reported
- [~] Task: Capture the pre-upgrade package-wave matrix under this track
    - [~] Assign every one of the 36 direct upgrade candidates to security, in-range, vinext/runtime, or remaining-major wave
    - [~] Record current/target versions, manifest owners, compatibility notes, and baseline verification state
- [~] Task: Capture baseline quality-gate results and separate pre-existing failures from upgrade regressions
- [ ] Task: Measure - User Manual Verification 'Phase 1 — Audit Contract & Baseline' (Protocol in workflow.md) — deferred to supervisor after Red+Green land

Phase 1 Red SHA: `ec6b97df` (test(audit-contract): add Red-phase TDD suite for dependency audit contract).
Follow-up fix: `93acaf9a` removed `scripts/audit/vitest.config.ts` and `scripts/audit/tsconfig.json` to honor the Red-phase boundary (only test files and Measure docs may be added in this phase). The suite is runnable with vitest CLI flags alone — no project-local config required:

  npx vitest run scripts/audit/__tests__/audit-contract.test.ts

Suite is Red on missing `scripts/audit/audit-contract.ts`; Green is owed by a separate commit.

Phase 1 Red expansion SHA: `2acf4282` (test(audit-contract): expand Red coverage for Task 1.1/2.2/3 sub-tasks). Adds four new describe blocks to the same suite — registry-latest versions (Task 1.1), range-compatibility classification 22-in-range / 14-requires-manifest-change (Task 1.1), matrix field completeness + manifest_owners boundary check (Task 2.2), and baseline quality-gates capture (Task 3) — plus two new fixtures (`registry-stub.json`, `baseline-quality-gates.json`) and the previously untracked test-strategy.md. Same Red behavior: file fails on missing `../audit-contract`; verified with a one-shot stub that the 22 new tests fail individually with `TypeError: <new function> is not a function`. No source code modified.

## Phase 2 — Urgent Security Remediation

- [ ] Task: Obtain explicit approval for dependency installation and manifest changes before starting upgrade execution
- [ ] Task: Pin an intentional Next.js 15 declaration and upgrade Next.js to 15.5.19 across the workspace
    - [ ] Replace app-level `"next": "latest"` declarations
    - [ ] Verify Next.js 16 is not pulled into this wave
- [ ] Task: Upgrade React and React DOM to 19.2.7 and align React/RSC transitive requirements
- [ ] Task: Upgrade Convex to 1.40.0 and `@vitejs/plugin-rsc` to 0.5.27
- [ ] Task: Upgrade `packages/practice-test-engine` from Vitest 2.1.9 to 4.1.8 using TDD on its existing suite
- [ ] Task: Verify and checkpoint the security wave
    - [ ] Run package/app tests affected by the upgrades plus all app builds
    - [ ] Run `npm ls --workspaces --depth=0` and `npm audit`; require zero critical/high findings
- [ ] Task: Measure - User Manual Verification 'Phase 2 — Urgent Security Remediation' (Protocol in workflow.md)

## Phase 3 — In-Range Refresh & Declaration Alignment

- [ ] Task: Refresh all audit-confirmed in-range direct dependencies without crossing declared major boundaries
    - [ ] Include Cloudflare/Vite tooling, Playwright, Radix UI, React types, baseline-browser-mapping, Geist, PostCSS, tailwind-merge, ts-fsrs, tsx, typescript-eslint, Wrangler, and Zod
- [ ] Task: Reconcile avoidable version declaration drift across apps and shared packages
    - [ ] Align KaTeX, Lucide, tailwind-merge, ts-fsrs, Vitest, ESLint declarations, `eslint-config-next`, and Node types where compatible
    - [ ] Document every intentionally retained difference
- [ ] Task: Investigate residual moderate advisories, including the `drizzle-kit` recommendation, and record resolution/defer evidence
- [ ] Task: Verify and checkpoint the in-range refresh
    - [ ] Run repo boundary checks, relevant package suites, all app lint/test/typecheck/build scripts, dependency tree, and audit
- [ ] Task: Measure - User Manual Verification 'Phase 3 — In-Range Refresh & Declaration Alignment' (Protocol in workflow.md)

## Phase 4 — Coordinated Framework & Toolchain Majors

- [ ] Task: Upgrade vinext 0.0.5 → 0.0.55 with its required React/RSC peers
- [ ] Task: Upgrade Vite 7 → 8 and `@vitejs/plugin-react` 4 → 6; verify each first-class app independently
- [ ] Task: Upgrade Next.js 15 → 16 and `eslint-config-next` 15 → 16 as an isolated migration
- [ ] Task: Upgrade TypeScript 5 → 6 and ESLint/`@eslint/js` 9 → 10 as isolated toolchain migrations
- [ ] Task: Verify and checkpoint each framework/toolchain migration independently
    - [ ] Run all package suites and all five app lint/test/typecheck/build scripts after each migration
- [ ] Task: Measure - User Manual Verification 'Phase 4 — Coordinated Framework & Toolchain Majors' (Protocol in workflow.md)

## Phase 5 — Remaining Majors, Final Audit & Closure

- [ ] Task: Upgrade Tailwind CSS 3 → 4 with visual and build verification across all five apps
- [ ] Task: Upgrade KaTeX 0.16 → 0.17 and Lucide React 0.x → 1.x with shared-component and app verification
- [ ] Task: Upgrade jsdom 26 → 29 and resolve test-environment compatibility changes
- [ ] Task: Run the durable audit and document every upgraded or deferred candidate
    - [ ] Require explicit compatibility evidence and follow-up owner for any deferral
- [ ] Task: Run final quality gates and reconcile Measure artifacts
    - [ ] Run `node scripts/check-monorepo-boundaries.mjs`
    - [ ] Run root/package tests and all five app lint/test/typecheck/build scripts
    - [ ] Run `npm ls --workspaces --depth=0` and `npm audit`
    - [ ] Confirm the root `package-lock.json` is the only lockfile and no nested dependency workaround was introduced
- [ ] Task: Measure - User Manual Verification 'Phase 5 — Remaining Majors, Final Audit & Closure' (Protocol in workflow.md)
