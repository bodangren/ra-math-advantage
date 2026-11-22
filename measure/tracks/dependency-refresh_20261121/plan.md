# Implementation Plan: Dependency Refresh

Track: `dependency-refresh_20261121`. Type: chore. Lane: light. Priority: PM P2.
Specification: [spec.md](./spec.md).
Workflow: `measure/workflow.md`.

## Spec Review Amendment

- [x] Apply the Round 1 decisions and verify the amended gate runner. (e84735c)
  This is planning work, not a dependency change or a phase acceptance.

## Start and Scope Rules

- Track creation does not start implementation.
- Complete the separate spec review before implementation.
- Use the definition of OpenRouter S1 acceptance in `spec.md`.
- Strategy and Red baseline capture may precede OpenRouter S1 acceptance; Green may not.
- Record the S1 checkpoint and passing phase role-gate in `evidence.md` before Green.
- Keep Daniel's deferred OpenRouter check outside OpenRouter S1 acceptance.
- Never edit `measure/gates.json`; export every role command below.
- Confirm exclusive dependency changes with the PM before each Green phase.
- Refresh a provisional baseline after any intervening code or lockfile change.
- Keep that ownership through the phase checkpoint.
- OpenRouter S3 rebases its later `zod` install on this track's resulting dependencies.
- Treat this assignment as approval for this track's dependency changes.
- Make one commit for each task, with a Git note.
- Keep task status and commit references current.
- The orchestrator pushes the D1 checkpoint by 2026-11-23 and D2 at closeout by 2026-11-25.
- Use `safe-push` at both points, per the PM push rule of 2026-11-20.
- The PM decision of 2026-11-21 permits this D1 exception to the AGENTS.md closeout-only rule.

## Files That Stay Unstaged

- `apps/bus-math-v2/lib/workbooks-manifest.json`
- `apps/integrated-math-1/.next/types/routes.d.ts`
- `apps/integrated-math-2/.next/types/routes.d.ts`
- `apps/integrated-math-3/.next/types/routes.d.ts`
- `apps/pre-calculus/.next/types/routes.d.ts`
- `measure/generated/routes.md`

Do not restore another track's changes.
Record generator defects in this track's evidence without expanding the repair scope.
Recurring audit configuration stays out of scope; the shared debt registry is at its line limit.

## Gate Commands for Each Phase

`gates.sh` reuses the archived `vinext-oxc-toolchain_20261114/gates.sh` comparison and resume logic.
It validates audit JSON and rejects infrastructure failures, missing results, removed scripts, and changed workspace sets.
It returns zero only for baseline capture or no new failure keys.
Infrastructure failures return 3, including during baseline capture.
Run one group at a time from the repository root:

```bash
bash measure/tracks/dependency-refresh_20261121/gates.sh format <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh lint <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh typecheck <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh test <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh build <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh support <label>
bash measure/tracks/dependency-refresh_20261121/gates.sh docs <label>
```

Labels: `d1-baseline`, `d1-baseline-r2`, `d1-green`, `d2-baseline`, and `d2-green`.
Set `GATES_BASE=d1-baseline-r2` for D1 comparisons and `GATES_BASE=d2-baseline` for D2 comparisons. The `d1-baseline-r2` label replaced `d1-baseline` after the OpenRouter r4 and r5 code changes and the Step 0 runner repair; earlier `d1-baseline` logs stay as evidence.
Set `GATES_RESUME=1` to reuse completed jobs and retry infrastructure jobs once.
Use a new label suffix after a code change; preserve earlier logs.
The script calls `~/Desktop/advantage-pr/scripts/jobs/heavy-run.sh` for each job.
Do not wrap the whole group in a second heavy job.
No group stops after the first failed workspace.

Compare every command against its phase baseline by the keys in `test-strategy.md`.
`NEWFAIL=0` means no new failure; it does not mean every command passed.
`NEWFAIL=1` means at least one new failure key or missing comparison result.
Reject a missing command, missing log, or incomplete workspace set.
Resolve infrastructure failures before acceptance.

Capture root `npm outdated --json`, `npm outdated --json --workspaces`, and `npm ls --all` in `evidence.md`.
Enumerate declarations from the root and the architecture workspace list.
Query `npm view <name> version --json` for every external declaration, resolving npm aliases to their real names.
Query `npm view '<name>@<declared-range>' version --json` for wanted versions that npm omits.
Record missing npm entries, declaration ranges, installed versions, wanted versions, and registry results.
Outdated and tree commands can fail for valid findings; reject network and infrastructure errors instead of accepting them as Red.

### Role Environment

Export these exact values in each D1 role brief and role-gate call:

```bash
export RED_TEST_COMMAND='npm audit --audit-level=high'
export GREEN_TEST_COMMAND='GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d1-audit-green-r11'
export PROJECT_LINT='GATES_BASE=d1-baseline-r2 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh lint d1-green-r11'
export PROJECT_CHECKS='GATES_BASE=d1-baseline-r2 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh checks-all d1-green-r11'
export PROJECT_TESTS='GATES_BASE=d1-baseline-r2 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh test d1-green-r11'
```

Every group has an r11 log. The r11 sweep ran fresh with no reuse of r10 records because the audit path and resume rules changed. All eight groups exit 0 with `NEWFAIL=0`. The four PM-deferred adversarial cases stay on the D2 list.

Export these exact values for D2:

```bash
export RED_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets'
export GREEN_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets && GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d2-audit-green'
export PROJECT_LINT='GATES_BASE=d1-green-r11 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh lint d2-green'
export PROJECT_CHECKS='GATES_BASE=d1-green-r11 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh checks-all d2-green'
export PROJECT_TESTS='GATES_BASE=d1-green-r11 GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh test d2-green'
```

D2 reuses the `d1-green-r11` logs as its baseline. No code or lockfile changed after the r11 sweep: `git diff --stat 62b947cf..43f29627` shows only Measure files (strategy log, tracks.md, evidence.md, plan.md, test-strategy.md). No `d2-baseline` capture runs. D2 comparisons use `GATES_BASE=d1-green-r11` in place of `d2-baseline`.

The environment overrides `measure/gates.json`, including `PROJECT_TESTS` for adversarial testing.
The gate runner wraps each job through `heavy-run.sh`; do not wrap these runner commands again.
The orchestrator wraps the direct D1 Red audit through `heavy-run.sh`.
Update label values in all role briefs together after a code retry.
If D2 reuses D1 logs, use `GATES_BASE=d1-green` in every D2 comparison command.

### D2 Targets

Red fills this table from the complete inventory before running `targets`.
Use one row for each outdated declaration and its selected stable target.
The command resolves the installed version through the lockfile, starting at the declaration's workspace.
It fails for an empty table, a missing package, or an installed version below the target.
Green records failed candidates in `evidence.md` before lowering a target to a retained version.
Each such row requires a reason and the exact failed gate in the `Decision` column.
An unchanged prerelease pin can appear only with `Deferred:` and its registry reason; the command requires an exact installed match.

| Manifest | Package | Target | Decision |
|---|---|---|---|
| apps/bus-math-v2/package.json | @playwright/test | 1.65.1 | Update |
| apps/bus-math-v2/package.json | @radix-ui/react-avatar | 1.3.1 | Update |
| apps/bus-math-v2/package.json | @radix-ui/react-checkbox | 1.4.1 | Update |
| apps/bus-math-v2/package.json | @radix-ui/react-dropdown-menu | 2.2.1 | Update |
| apps/bus-math-v2/package.json | @radix-ui/react-label | 2.1.17 | Update |
| apps/bus-math-v2/package.json | @radix-ui/react-slot | 1.5.0 | Update |
| apps/bus-math-v2/package.json | @radix-ui/react-tabs | 1.2.1 | Update |
| apps/bus-math-v2/package.json | @tailwindcss/postcss | 4.3.5 | Update |
| apps/bus-math-v2/package.json | @tailwindcss/typography | 0.5.20 | Update |
| apps/bus-math-v2/package.json | @testing-library/jest-dom | 6.9.1 | Deferred: keep 6.9.1; jest-dom 8.0.0 declares a peer range vitest >=5 <6 and creates a new invalid tree edge against the retained vitest 4.1.12 (npm ls --all, green-d2 tree check). The no-new-key rule defers the major with its peer. |
| apps/bus-math-v2/package.json | @testing-library/user-event | 14.6.13 | Update |
| apps/bus-math-v2/package.json | autoprefixer | 10.7.0 | Update |
| apps/bus-math-v2/package.json | convex | 1.51.0 | Update |
| apps/bus-math-v2/package.json | dotenv | 18.0.10 | Update |
| apps/bus-math-v2/package.json | jsdom | 29.1.1 | Deferred: keep 29.1.1; jsdom 31.0.1 changed the DOM accessibility tree so the activity-components axe a11y test gained one serious violation (green-d2 test packages/activity-components, StepByStepper guided mode). The no-new-key rule defers the major. |
| apps/bus-math-v2/package.json | lucide-react | 1.77.0 | Update |
| apps/bus-math-v2/package.json | postcss | 8.5.33 | Update |
| apps/bus-math-v2/package.json | recharts | 3.11.0 | Update |
| apps/bus-math-v2/package.json | tailwind-merge | 3.7.1 | Update |
| apps/bus-math-v2/package.json | tailwindcss | 4.3.5 | Update |
| apps/bus-math-v2/package.json | ts-fsrs | 6.0.1 | Update |
| apps/bus-math-v2/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| apps/danielson/package.json | @testing-library/jest-dom | 6.9.1 | Deferred: keep 6.9.1; jest-dom 8.0.0 declares a peer range vitest >=5 <6 and creates a new invalid tree edge against the retained vitest 4.1.12 (npm ls --all, green-d2 tree check). The no-new-key rule defers the major with its peer. |
| apps/danielson/package.json | convex | 1.51.0 | Update |
| apps/danielson/package.json | jsdom | 29.1.1 | Deferred: keep 29.1.1; jsdom 31.0.1 changed the DOM accessibility tree so the activity-components axe a11y test gained one serious violation (green-d2 test packages/activity-components, StepByStepper guided mode). The no-new-key rule defers the major. |
| apps/danielson/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| apps/integrated-math-1/package.json | @cloudflare/vite-plugin | 1.49.0 | Deferred: keep 1.49.0; @cloudflare/vite-plugin 1.49.1 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 1.70.1 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/integrated-math-1/package.json | @tailwindcss/postcss | 4.3.5 | Update |
| apps/integrated-math-1/package.json | @tailwindcss/typography | 0.5.20 | Update |
| apps/integrated-math-1/package.json | @testing-library/dom | 10.4.2 | Update |
| apps/integrated-math-1/package.json | @testing-library/jest-dom | 6.9.1 | Deferred: keep 6.9.1; jest-dom 8.0.0 declares a peer range vitest >=5 <6 and creates a new invalid tree edge against the retained vitest 4.1.12 (npm ls --all, green-d2 tree check). The no-new-key rule defers the major with its peer. |
| apps/integrated-math-1/package.json | autoprefixer | 10.7.0 | Update |
| apps/integrated-math-1/package.json | convex | 1.51.0 | Update |
| apps/integrated-math-1/package.json | dotenv | 18.0.10 | Update |
| apps/integrated-math-1/package.json | jsdom | 29.1.1 | Deferred: keep 29.1.1; jsdom 31.0.1 changed the DOM accessibility tree so the activity-components axe a11y test gained one serious violation (green-d2 test packages/activity-components, StepByStepper guided mode). The no-new-key rule defers the major. |
| apps/integrated-math-1/package.json | lucide-react | 1.77.0 | Update |
| apps/integrated-math-1/package.json | postcss | 8.5.33 | Update |
| apps/integrated-math-1/package.json | tailwind-merge | 3.7.1 | Update |
| apps/integrated-math-1/package.json | tailwindcss | 4.3.5 | Update |
| apps/integrated-math-1/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| apps/integrated-math-1/package.json | wrangler | 4.116.0 | Deferred: keep 4.116.0; wrangler 4.117.0 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 4.166.0 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/integrated-math-2/package.json | @cloudflare/vite-plugin | 1.49.0 | Deferred: keep 1.49.0; @cloudflare/vite-plugin 1.49.1 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 1.70.1 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/integrated-math-2/package.json | @tailwindcss/postcss | 4.3.5 | Update |
| apps/integrated-math-2/package.json | @tailwindcss/typography | 0.5.20 | Update |
| apps/integrated-math-2/package.json | @testing-library/dom | 10.4.2 | Update |
| apps/integrated-math-2/package.json | @testing-library/jest-dom | 6.9.1 | Deferred: keep 6.9.1; jest-dom 8.0.0 declares a peer range vitest >=5 <6 and creates a new invalid tree edge against the retained vitest 4.1.12 (npm ls --all, green-d2 tree check). The no-new-key rule defers the major with its peer. |
| apps/integrated-math-2/package.json | autoprefixer | 10.7.0 | Update |
| apps/integrated-math-2/package.json | convex | 1.51.0 | Update |
| apps/integrated-math-2/package.json | dotenv | 18.0.10 | Update |
| apps/integrated-math-2/package.json | jsdom | 29.1.1 | Deferred: keep 29.1.1; jsdom 31.0.1 changed the DOM accessibility tree so the activity-components axe a11y test gained one serious violation (green-d2 test packages/activity-components, StepByStepper guided mode). The no-new-key rule defers the major. |
| apps/integrated-math-2/package.json | lucide-react | 1.77.0 | Update |
| apps/integrated-math-2/package.json | postcss | 8.5.33 | Update |
| apps/integrated-math-2/package.json | tailwind-merge | 3.7.1 | Update |
| apps/integrated-math-2/package.json | tailwindcss | 4.3.5 | Update |
| apps/integrated-math-2/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| apps/integrated-math-2/package.json | wrangler | 4.116.0 | Deferred: keep 4.116.0; wrangler 4.117.0 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 4.166.0 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/integrated-math-3/package.json | @axe-core/playwright | 4.14.0 | Update |
| apps/integrated-math-3/package.json | @cloudflare/vite-plugin | 1.49.0 | Deferred: keep 1.49.0; @cloudflare/vite-plugin 1.49.1 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 1.70.1 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/integrated-math-3/package.json | @convex-dev/migrations | 0.3.9 | Update |
| apps/integrated-math-3/package.json | @playwright/test | 1.65.1 | Update |
| apps/integrated-math-3/package.json | @radix-ui/react-avatar | 1.3.1 | Update |
| apps/integrated-math-3/package.json | @radix-ui/react-checkbox | 1.4.1 | Update |
| apps/integrated-math-3/package.json | @radix-ui/react-dropdown-menu | 2.2.1 | Update |
| apps/integrated-math-3/package.json | @radix-ui/react-label | 2.1.17 | Update |
| apps/integrated-math-3/package.json | @radix-ui/react-slot | 1.5.0 | Update |
| apps/integrated-math-3/package.json | @radix-ui/react-tabs | 1.2.1 | Update |
| apps/integrated-math-3/package.json | @tailwindcss/postcss | 4.3.5 | Update |
| apps/integrated-math-3/package.json | @tailwindcss/typography | 0.5.20 | Update |
| apps/integrated-math-3/package.json | @testing-library/dom | 10.4.2 | Update |
| apps/integrated-math-3/package.json | @testing-library/jest-dom | 6.9.1 | Deferred: keep 6.9.1; jest-dom 8.0.0 declares a peer range vitest >=5 <6 and creates a new invalid tree edge against the retained vitest 4.1.12 (npm ls --all, green-d2 tree check). The no-new-key rule defers the major with its peer. |
| apps/integrated-math-3/package.json | @testing-library/user-event | 14.6.13 | Update |
| apps/integrated-math-3/package.json | autoprefixer | 10.7.0 | Update |
| apps/integrated-math-3/package.json | convex | 1.51.0 | Update |
| apps/integrated-math-3/package.json | dotenv | 18.0.10 | Update |
| apps/integrated-math-3/package.json | jsdom | 29.1.1 | Deferred: keep 29.1.1; jsdom 31.0.1 changed the DOM accessibility tree so the activity-components axe a11y test gained one serious violation (green-d2 test packages/activity-components, StepByStepper guided mode). The no-new-key rule defers the major. |
| apps/integrated-math-3/package.json | lucide-react | 1.77.0 | Update |
| apps/integrated-math-3/package.json | postcss | 8.5.33 | Update |
| apps/integrated-math-3/package.json | recharts | 3.11.0 | Update |
| apps/integrated-math-3/package.json | tailwind-merge | 3.7.1 | Update |
| apps/integrated-math-3/package.json | tailwindcss | 4.3.5 | Update |
| apps/integrated-math-3/package.json | ts-fsrs | 6.0.1 | Update |
| apps/integrated-math-3/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| apps/integrated-math-3/package.json | wrangler | 4.116.0 | Deferred: keep 4.116.0; wrangler 4.117.0 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 4.166.0 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/pre-calculus/package.json | @cloudflare/vite-plugin | 1.49.0 | Deferred: keep 1.49.0; @cloudflare/vite-plugin 1.49.1 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 1.70.1 gate failed the miniflare-stability check before any install. Review B F5. |
| apps/pre-calculus/package.json | @tailwindcss/postcss | 4.3.5 | Update |
| apps/pre-calculus/package.json | @tailwindcss/typography | 0.5.20 | Update |
| apps/pre-calculus/package.json | @testing-library/dom | 10.4.2 | Update |
| apps/pre-calculus/package.json | @testing-library/jest-dom | 6.9.1 | Deferred: keep 6.9.1; jest-dom 8.0.0 declares a peer range vitest >=5 <6 and creates a new invalid tree edge against the retained vitest 4.1.12 (npm ls --all, green-d2 tree check). The no-new-key rule defers the major with its peer. |
| apps/pre-calculus/package.json | autoprefixer | 10.7.0 | Update |
| apps/pre-calculus/package.json | convex | 1.51.0 | Update |
| apps/pre-calculus/package.json | dotenv | 18.0.10 | Update |
| apps/pre-calculus/package.json | jsdom | 29.1.1 | Deferred: keep 29.1.1; jsdom 31.0.1 changed the DOM accessibility tree so the activity-components axe a11y test gained one serious violation (green-d2 test packages/activity-components, StepByStepper guided mode). The no-new-key rule defers the major. |
| apps/pre-calculus/package.json | lucide-react | 1.77.0 | Update |
| apps/pre-calculus/package.json | postcss | 8.5.33 | Update |
| apps/pre-calculus/package.json | tailwind-merge | 3.7.1 | Update |
| apps/pre-calculus/package.json | tailwindcss | 4.3.5 | Update |
| apps/pre-calculus/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| apps/pre-calculus/package.json | wrangler | 4.116.0 | Deferred: keep 4.116.0; wrangler 4.117.0 and later resolve miniflare 5 prerelease, and the no-prerelease rule forbids it. The 4.166.0 gate failed the miniflare-stability check before any install. Review B F5. |
| package.json | @oxlint/plugins | 1.94.0 | Update |
| package.json | @vitest/coverage-v8 | 4.1.12 | Deferred: keep 4.1.12; the coverage provider must match the retained vitest 4.x major. |
| package.json | oxfmt | 0.79.0 | Update |
| package.json | oxlint | 1.94.0 | Update |
| package.json | oxlint-plugin-eslint | 1.94.0 | Update |
| package.json | tsrs | 0.25.0-ts7.1.0-beta | Deferred: keep the 0.25.0-ts7.1.0-beta pin; the registry latest tag 7.1.0-beta.tsrs4 is a prerelease and no released replacement exists. |
| packages/activity-components/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/activity-runtime/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/ai-tutoring/package.json | @openrouter/sdk | 1.5.128 | Update |
| packages/ai-tutoring/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/app-shell/package.json | convex | 1.51.0 | Update |
| packages/app-shell/package.json | lucide-react | 1.77.0 | Update |
| packages/app-shell/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/component-approval/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/core-auth/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/core-convex/package.json | convex | 1.51.0 | Update |
| packages/core-convex/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/efficacy-core/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/graphing-core/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/knowledge-space-core/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/knowledge-space-practice/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/lesson-renderer/package.json | lucide-react | 1.77.0 | Update |
| packages/lesson-renderer/package.json | tailwind-merge | 3.7.1 | Update |
| packages/lesson-renderer/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/math-content/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/practice-core/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/practice-test-engine/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/rate-limiter/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/srs-engine/package.json | ts-fsrs | 6.0.1 | Update |
| packages/srs-engine/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/study-hub-core/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/teacher-reporting-core/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |
| packages/workbook-pipeline/package.json | vitest | 4.1.12 | Deferred: keep 4.1.12; vitest 5.1.1 adds a new Unhandled Rejection reporter key in the BM2 test gate (green-d2-PROJECT_TESTS.out, test apps/bus-math-v2). The no-new-key rule defers the major. |

## Phase D1: Fix the critical and high advisories [checkpoint: 71450a85]

Due at origin: 2026-11-23. Green depends on OpenRouter S1 acceptance.

- [x] Task: D1 Red — record the audit and compatibility baseline (b979734)
    - [ ] Record the phase base commit and whether OpenRouter S1 acceptance is complete.
    - [ ] Capture `npm audit --json`, including all severities and advisory identifiers.
    - [ ] Run `npm audit --audit-level=high` through `heavy-run.sh`.
    - [ ] Confirm exit 1 comes from critical or high advisories, not an infrastructure error.
    - [ ] If the audit passes, use the role's documented `gap_closing` result with `gaps:` and `breakage_proof:`.
    - [ ] Refresh the outdated inventory for the root, six apps, and 20 packages.
    - [ ] Run every gate group with label `d1-baseline`.
    - [ ] Record exact baseline keys and log paths in `evidence.md`.
    - [ ] Record both bundle results and report every budget failure to the PM.
    - [ ] Commit the Red evidence before Green changes.
    - Red commands: `npm audit --audit-level=high` exits 1 (9 high); `npm audit --json` gives critical=0 high=9 moderate=7 low=5; gate groups with label `d1-baseline` give `NEWFAIL=0` for format, lint, typecheck, test, build, docs and `NEWFAIL=1` for support (bundle-entry parse misses, no infra). Logs: `measure/runs/dependency-refresh_20261121/` (gitignored).
- [x] Task: D1 Green — update the vulnerable dependency chains (e61f73e)
    - [ ] Confirm OpenRouter S1 acceptance and exclusive dependency changes through the checkpoint.
    - [ ] Refresh the baseline if code or the lockfile changed after capture.
    - [ ] Read each affected package declaration and its real dependency path.
    - [ ] Update fixed parents first, using the file and command list below.
    - [ ] Check brace-expansion, browserslist, fast-uri, sharp, undici, and ws after each relevant update.
    - [ ] Use a root override only when the parent has no fixed release.
    - [ ] Record the reason and compatibility proof for each override.
    - [ ] Make only required compatibility edits.
    - [ ] Add a behavior test first if a compatibility edit changes behavior.
    - [ ] Run the audit check after parents and overrides, before the compatibility gates.
    - [ ] Record unresolved findings in the `D1 High Exceptions` table with identifiers, paths, versions, and named reasons.
    - [ ] Run `GREEN_TEST_COMMAND`; require no high or critical identifier outside that table.
    - [ ] Keep the selected SDK version compatible with the S1 tests and workerd probe.
- [x] Task: D1 Verify — compare the complete gate results (e61f73e)
    - The first sweep stopped on the bundle growth rule with miniflare 5 beta. The r2 retry uses the newest wrangler 4.116.0 and plugin 1.49.0 with stable miniflare 4.20260730.0. All seven groups report `NEWFAIL=0` against `d1-baseline-r2`; no infrastructure failure. IM3 total changed by -5 bytes and BM2 total by -5 bytes. The Green audit gate exits 0 with every high named in the exceptions table. No user verification and no checkpoint ran.
    - r3 remediation fixed the bundle baseline-entry coverage defect in `gates.sh` with a tracked regression fixture, and corrected the exception reasons, leaf identifiers, and dependency paths in `evidence.md`. The support group at `d1-green-r3` and the audit gate at `d1-audit-green-r3` exit 0 with `NEWFAIL=0`. Logs: `green-r3-support.out`, `green-r3-audit-gate.out`, and `gates/d1-green-r3/support/`. The other groups keep their r2 logs because the dependency tree is unchanged.
    - r5 remediation fixed ADV-1 to ADV-6 in `gates.sh`: test-title keys, package-bound audit exceptions, complete resume records, chunk-level bundle coverage, baseline report validation, and audit count reconciliation. The adversarial fixture moved from 22 pass and 10 fail to 32 pass and 0 fail. Every group ran again with label `d1-green-r5` and the audit gate with `d1-audit-green-r5`. Format, lint, typecheck, build, support, docs, and audit-high exit 0 with `NEWFAIL=0`. The test group first exited 1 with `NEWFAIL=1` from two audit-contract test titles and two assertions about nine nested lockfiles in the gitignored `review-b-scratch` folder created by the adversarial role after the r2 baseline. No source or dependency change produced the keys.
    - r6 close of that stop: the orchestrator moved the scratch folder to `/home/daniebo/.cache/ra-math-scratch/review-b-scratch-20261121` instead of deleting it. No tracked file or baseline key changed. The test group reran with label `d1-green-r6` against `d1-baseline-r2` and exited 0 with `NEWFAIL=0`. Log: `green-r6-test.out`; gate folder `gates/d1-green-r6/test/`. The other seven groups keep their r5 logs. Bundle totals stay within 5 percent.
    - r8 remediation closed Review A F4 and F5. `key()` now keeps complete test titles and strips timing only from runner result lines. The bundle comparison counts normalized chunk keys and requires at least as many current entries per key as the baseline. Two new adversarial cases failed before the fix and pass after; the fixture moved from 33 pass and 2 fail to 35 pass and 0 fail. A live audit showed 23 undici identifiers, 7 high and 16 moderate or low. No stable miniflare 4.x or wrangler 4.x on miniflare 4 resolves fixed undici, so no dependency changed; the 16 new identifiers were added as undici rows with the same chain and reason, and the other four exception packages did not drift. Every group reran with label `d1-green-r8` and the audit gate with `d1-audit-green-r8`; all eight exit 0 with `NEWFAIL=0`. Logs: `green-r8-*.out` and `gates/d1-green-r8/`. Bundle totals stay within 5 percent.
    - r9 remediation closed Review A F7 and F6. `key()` now strips timing only from `×` runner result lines, so complete FAIL titles stay in the key even when they end in `(10ms)` or `(20ms)`. One new adversarial case failed before the fix and one runner-timing control passed; the fixture moved from 36 pass and 1 fail to 37 pass and 0 fail. F-PA3 closes this correction. The earlier r8 exit-1 records stay as superseded evidence and the final r8 comparison exit is 0. Typecheck, test, and support were rerun with label `d1-green-r9`; all three exit 0 with `NEWFAIL=0`. Format, lint, build, docs, and audit-high keep their r8 records because their comparisons do not use `key()`. Logs: `green-r9-*.out` and `gates/d1-green-r9/`. Bundle totals stay within 5 percent.
    - r10 remediation closed ADV-7 to ADV-11 in `gates.sh`: FAIL titles keep coordinates and colon text, audit exceptions bind to the disclosed dependency path, resume rejects incomplete or conflicting records, bundle coverage counts distinct concrete chunks, and EXCEEDS multiplicity is preserved. The adversarial fixture moved from 63 pass and 14 fail at `c481e481` to 73 pass and 4 fail; the four remaining cases are ADV-12, ADV-13 twice, and F9, all PM-deferred to D2. All eight gate groups ran fresh at `d1-green-r10` and the audit gate at `d1-audit-green-r10`, all exit 0 with `NEWFAIL=0`. Logs: `green-r10-*.out` and `gates/d1-green-r10/`. Bundle totals stay within 5 percent.
    - r11 remediation closed ADV-8, ADV-9 and ADV-11. Dependency paths now match complete package names, including scopes; resume checks the last non-blank log line; baseline EXCEEDS capacity counts distinct failing chunks. The adversarial fixture moved from 75 pass and 9 fail at `71d882e6` to 80 pass and 4 fail; the four failures are only the PM-deferred D2 cases. All eight gate groups ran fresh at `d1-green-r11` and the audit gate at `d1-audit-green-r11`, all exit 0 with `NEWFAIL=0`. Logs: `green-r11-*.out` and `gates/d1-green-r11/`. Bundle totals stay within 5 percent.
    - [ ] Run every gate group with label `d1-green`.
    - [ ] Compare each result with `d1-baseline` by diagnostic key.
    - [ ] Record `NEWFAIL`, audit counts, selected versions, and log paths in `evidence.md`.
    - [ ] Stop for a new failure key or an infrastructure failure.
    - [ ] Stop when a passing budget entry fails or a total grows by more than 5% over baseline.
    - [ ] Send the before and after bundle report to the orchestrator at either stop condition.
    - [ ] Report the standing BM2 budget failure before acceptance.
    - [ ] Keep every budget and manual deploy trigger unchanged.
    - [ ] Report each unresolved critical or high finding to the PM by 2026-11-23.
- [x] Task: Measure - User Manual Verification 'Phase D1: Fix the critical and high advisories' (cfecbe9)
    - PM-verified 2026-11-21: a dependency refresh has no visible change, so this is not a Daniel gate. Evidence: the D1 audit counts (before 0 critical, 9 high, 7 moderate, 5 low; after 0 critical, 5 high, 6 moderate, 5 low), the five named high exceptions in evidence.md, and the gate exits at D1 phase acceptance.
    - [ ] Complete independent review and the D1 phase acceptance role-gate.
    - [ ] Follow the checkpoint protocol in `measure/workflow.md`.
    - [ ] Present the audit result, baseline exceptions, and bundle report to Daniel.
    - [ ] Obtain Daniel's confirmation before the checkpoint.
    - [ ] Record the checkpoint commit in this phase heading.
    - [ ] Update the registry and commit the plan update.
    - [ ] Ask the orchestrator to synchronize and push this checkpoint through `safe-push` by 2026-11-23.

PM 2026-11-22 adversarial limit: after Green r10, one adversarial run checks only ADV-7 to ADV-11. A new hole in an input type that no earlier round tested goes to the D2 list, unless it can hide a failure in the D1 results that exist now. Each such call is recorded here with its reason.
Adversarial r3 (71d882e6): ADV-7 and ADV-10 closed. ADV-8, ADV-9 and ADV-11 BLOCKING, same input types as earlier rounds; fixed in r11. ADV-12, ADV-13, F8 and F9 stay D2 by the PM deferral. No new input type produced a finding. Per the PM limit, no adversarial r4 runs; phase acceptance checks the r11 fixture result.
PM ruling 2026-11-22: ADV-8, ADV-9 and ADV-11 are gate-tool tech debt, not D1 blockers. No r12 and no adversarial r4. All three were fixed in r11; none went to measure/tech-debt.md.
Adversarial r3 gate at `71d882e6` exited 1 with 80 pass and 4 fail. The four cases are the PM-deferred D2 items. Phase acceptance passed by the PM deferral of 2026-11-22.

### D1 Files and Update Order

1. Update fixed declared parents and compatible resolved dependencies.
2. Try an override only when the blocking parent has no fixed release.
3. Run the full audit check, including named exceptions.
4. Run the complete compatibility gates.

Expected files: root `package.json`, `package-lock.json`, and these workspace manifests:

- `apps/integrated-math-1/package.json`
- `apps/integrated-math-2/package.json`
- `apps/integrated-math-3/package.json`
- `apps/pre-calculus/package.json`
- `apps/bus-math-v2/package.json`
- `apps/danielson/package.json`

The four course apps declare `wrangler` and `@cloudflare/vite-plugin`.
Use `npm install --save-dev wrangler@latest @cloudflare/vite-plugin@latest --workspace=<app>` for those four apps.
Every app declares `jsdom`; try `npm install --save-dev jsdom@latest --workspace=<app>` for every app.
IM3 and BM2 declare `tsx`; use `npm install --save-dev tsx@latest --workspace=<app>` there.
Root `eslint-plugin-react` and root/app `react-server-dom-webpack` also own affected paths.
Inspect app `autoprefixer`, Babel, and webpack paths before selecting further parent changes.
Use `npm update brace-expansion browserslist fast-uri sharp undici ws` for compatible resolved versions in the lockfile.
Change declaration ranges only when a compatible update cannot reach the fixed version.
Record any additional declaring workspace manifest from the fresh inventory before editing it.
Record every targeted command and its changed files in `evidence.md`.
These commands belong to Green, not this authoring session.

## Phase D2: Update the remaining packages

Due: 2026-11-25. Depends on D1 acceptance.

D2 deferred gate findings (next-phase under the PM 2026-11-22 cap):

- ADV-12 — a failed test run with no attributable key can pass a failing baseline; a new execution check belongs to D2.
- ADV-13 — `key()` omits `node:test` and Playwright failure titles; adding those formats belongs to D2.
- F8 — an audit exception on an undisclosed path is deferred with ADV-8 scope; D2 rechecks the bound path set after new dependency changes.
- F9 — a critical escalation under a known high identifier needs a severity check; D2 adds it with the next audit table refresh.
- F-PA1 — the lint `.out` file contains root output rather than a group `NEWFAIL` marker; D2 records its provenance with the workspace records.
- F-PA3 — the Review A F8 sentence needs a corrected dependency path; D2 rewrites it with the verified parent chain.

- [x] Task: D2 Red — refresh the remaining update baseline (98a6d3f)
    - [ ] Record the phase base commit.
    - [ ] Refresh the audit and outdated reports for every declared external package.
    - [ ] Fill `D2 Targets` with the stable targets, subject to the Node 24 and exact-pin rules.
    - [ ] Confirm that `RED_TEST_COMMAND` fails because an installed package is below its target.
    - [ ] If no target needs an update, document `red_kind: gap_closing`, `gaps:`, and `breakage_proof:` instead.
    - [ ] Reuse the complete `d1-green` logs when no code or lockfile changed after that sweep.
    - [ ] Otherwise run every gate group with label `d2-baseline`.
    - [ ] Record unchanged baseline keys and bundle results.
    - [ ] Commit the target list and Red evidence before Green.
    - [ ] Add a failing regression test only for a real behavior that requires a compatibility edit.
- [x] Task: D2 Green — select the latest working versions (db7b4bb)
    - Applied 95 stable target updates in 12 manifests and the lockfile. Deferred 36 rows with recorded reasons. GREEN_TEST_COMMAND exits 0; PROJECT_LINT and PROJECT_TESTS exit 0 with NEWFAIL=0; PROJECT_CHECKS exits 1 with NEWFAIL=1 only from five PM-deferred extraneous node_modules tree keys (recorded as D2-LOW). Adversarial fixture 84 pass / 0 fail; bundle fixture passes.
    - [ ] Update remaining dependencies in small related groups.
    - [ ] Try each latest stable major, except the explicit Node 24 constraint.
    - [ ] Keep Vitest and its coverage provider compatible.
    - [ ] Keep `@types/node` on 24.x and record the runtime reason.
    - [ ] Move `oxfmt` and `tsrs` exact pins only to released versions that pass the gates.
    - [ ] Reject new prereleases and repository-wide reformatting.
    - [ ] Keep the accepted S1 tests and local workerd probe passing.
    - [ ] Retain the working version when a breaking major fails.
    - [ ] Record each failed candidate and its exact failing gate.
    - [ ] Try fixed blocking parents for every moderate or low chain, including fflate, KaTeX, and PostCSS selector-parser.
    - [ ] Try an override for each chain without a fixed blocking parent.
    - [ ] Keep it only when the complete sweep has no new failure key.
    - [ ] Otherwise remove the trial and record the advisory, version, failing gate, and keys in the reason list.
    - [ ] Reject forced downgrades and unexplained overrides.
    - [ ] Update the stack document before a deliberate stack change.
    - [ ] Run `GREEN_TEST_COMMAND` after all target updates and documented target deferrals.
- [ ] Task: D2 Verify — finish the dependency and advisory reports
    - [ ] Run every gate group with label `d2-green`.
    - [ ] Compare with `d2-baseline`, or the unchanged `d1-green` baseline, by diagnostic key.
    - [ ] Confirm no critical or high finding returned without a named exception.
    - [ ] Record final current and latest versions for every deferred update.
    - [ ] End `evidence.md` with every remaining moderate or low advisory and its supported reason.
    - [ ] Record `NEWFAIL`, the bundle report, and all baseline exceptions.
    - [ ] Apply the same bundle stop rules as D1.
    - [ ] Check `.github/workflows/` for unchanged manual deploy triggers.
    - [ ] Check both `apps/{bus-math-v2,integrated-math-3}/scripts/bundle-size-audit.mjs` files for unchanged budgets.
    - [ ] Verify that the six generated files remain unstaged.
- [ ] Task: Measure - User Manual Verification 'Phase D2: Update the remaining packages'
    - [ ] Complete independent review and the D2 phase acceptance role-gate.
    - [ ] Follow the checkpoint protocol in `measure/workflow.md`.
    - [ ] Present the final versions, exceptions, and advisory table to Daniel.
    - [ ] Obtain Daniel's confirmation before the checkpoint.
    - [ ] Record the checkpoint commit in this phase heading.
    - [ ] Update the registry and commit the plan update.
- [ ] Task: At phase close (11-25), run `npm view miniflare dist-tags`. If a stable 5.x exists, adopt it in this phase and clear the D1 Cloudflare exceptions (PM a778067f).

## Closeout

- [ ] Task: Close the track and synchronize with origin
    - [ ] Confirm the D2 phase acceptance and checkpoint before archive changes.
    - [ ] Use light-lane closeout; `measure/workflow.md` does not require a separate final acceptance role for every track.
    - [ ] Update the registry and archive through the Measure closeout workflow.
    - [ ] Confirm that generated output and unrelated changes remain outside staged changes.
    - [ ] Ask the orchestrator to run `git fetch origin`.
    - [ ] Ask the orchestrator to run `git pull --ff-only origin master`.
    - [ ] Stop and report if the pull cannot fast-forward.
    - [ ] Recheck acceptance if the pull changes the accepted code.
    - [ ] Ask the orchestrator to push D2 with `~/Desktop/advantage-pr/scripts/jobs/safe-push /home/daniebo/Desktop/ra-math-advantage --branch master`.
    - [ ] Stop and report a safe-push refusal without bypassing it.
    - [ ] Report the final commit and audit counts to the PM.
    - [ ] Close the assignment with a facts changed list.
