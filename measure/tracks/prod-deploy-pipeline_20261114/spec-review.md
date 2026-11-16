# Spec Review: prod-deploy-pipeline_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track gives the repository one local production deploy path for the math app (`apps/math`) and BM2. The orchestrator runs `npm run deploy:app -- <app>` on this machine with the OAuth logins of the `wrangler` and `convex` CLIs. The path runs a preflight, deploys Convex, deploys the Cloudflare Worker, runs a smoke test, and rolls the Worker back when the smoke test fails. The track also checks the cloud inventory, records one reuse-or-delete decision per resource, deletes the dispatched GitHub workflow, adds a release rule to the project documents, and reports each first deploy to the PM orchestrator.

### How the current system works, per this spec

Cloudflare account `0f8cef508e69d2446315a1c80042da20` holds only the Workers `bus-math-v2` and `integrated-math-3`, both on workers.dev with no routes and no traffic. The Convex team `435396` holds the projects of the inventory: `integrated-math-3` with only a dev deployment, `bus-math-v2-experimental` with the prod deployment `quiet-swan-141`, and empty or kept projects. The IM3 Worker config points at `https://chatty-weasel-888.convex.cloud`, a deployment that is not in the inventory, so the value is stale. Deploys today exist only as `.github/workflows/cloudflare-deploy.yml`, a dispatched workflow that needs GitHub secrets the repository does not have. The documents name Vercel as the deploy platform, which is wrong.

### Findings

- F1 [Blocker] spec.md D5 and plan.md Phases S2/S3: Comprehension gap: D5 requires `HEAD` to equal `origin/master` after `git fetch origin`, but the track commits locally and the Non-Functional Requirements forbid any push before closeout. Rationale: at the S2 and S3 deploy tasks, `HEAD` is ahead of `origin/master`, so the preflight stops each deploy before any cloud change, and AC3 cannot be reached. The plan names no fix, so the deploy phases leave the repository in a state where the named commands cannot run.
- F2 [Major] plan.md Phase S2 "S2 Deploy" and spec.md D4/D8: the first deploy runs the smoke test against a Worker whose `NEXT_PUBLIC_CONVEX_URL` is the stale value `chatty-weasel-888`, and a smoke failure on the first-ever deploy has no previous Worker version for `npx wrangler rollback`. Rationale: the two-deploy dance has no defined branch for a failed first smoke, and the plan records a smoke result only for the second deploy. The edge-case behavior is left to the implementer.
- F3 [Major] plan.md Phase S2 "S2 Implement" (KEEP_PATHS): the plan adds only the Worker-name line of `scripts/deploy/apps.ts` to `KEEP_PATHS`, but the new tests `scripts/__tests__/deploy/apps.test.ts` and `deploy-app.test.ts` also hold the literal `integrated-math-3`. Rationale: the guard `old-app-path-guard.test.ts` of `math-app-retire-old-apps_20261114` (FR-1) flags each match of a removed app name outside `KEEP_PATHS`, so the scripts suite gate can fail in S2 Verify. The plan does not name the lines for the test files.
- F4 [Nit] plan.md Phase S2 "S2 Contract": the root script `"deploy:app": "tsx scripts/deploy/deploy-app.ts"` uses `tsx`, which no root manifest declares. Rationale: the binary resolves only through npm hoisting of the app devDependency `tsx` `^4.20.6` (declared in `apps/integrated-math-3/package.json` line 89 and `apps/bus-math-v2/package.json` line 74). This meets the "no dependency change" rule, but a future range split breaks the root command.

### Author Response

- F1: FIX (D5 asks that `origin/master` is an ancestor of `HEAD`; `HEAD` can be ahead; the deploy records the SHA; the S2 Test task has a case for each result)
- F2: FIX (new D4a: the first deploy runs `npx convex deploy` alone, sets the prod URL in `wrangler.jsonc`, and sets the secrets before `deploy:app`; D4 names the rollback targets and the rule for a Worker with no earlier version; S1 records the workers.dev URLs; S3 sets the BM2 site URL)
- F3: FIX (the deploy tests take each Worker name from `DEPLOY_APPS`; no test file holds the literal)
- F4: DECLINE

## Round 2

Status: queued. The PM machine load rule of 2026-11-14 (07:32 ICT) stopped the first run of this re-review. The PM starts it when a slot is free. The fixes of F1 to F3 have no review result yet.

## Accepted Risks

None.
