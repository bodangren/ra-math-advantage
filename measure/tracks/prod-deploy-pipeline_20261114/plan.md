# Implementation Plan: Production Deploy Pipeline

Track: `prod-deploy-pipeline_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until each member of the track set `unified-math-app_20261114` and
`bm2-convex-auth-v2_20261114` are closed in `measure/tracks.md`.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Math app | `CI=true npm run test --workspace=apps/math` and `npm run build --workspace=apps/math` |
| BM2 | `CI=true npm run test --workspace=apps/bus-math-v2` and `npm run build --workspace=apps/bus-math-v2` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Secrets

- Get each secret through a secret card (`openchamber_secret`, action `secret.run`). Pass it
  to the command through an environment variable and a pipe. Never print it.
- Do not write a secret value into a file, a commit, a log, or the evidence file.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Inventory check and resource decisions
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — define the inventory record
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Inventory, Decisions, Runtime Variables, Math Deploy, BM2 Deploy, Smoke Results, PM Reports.
    - [ ] Run each gate on the start commit. Record each result under "Baseline".
    - [ ] Write the record format of "Inventory": provider, name, ID, deployments, and the D3 decision.
- [ ] Task: S1 Check — list the cloud resources
    - [ ] Get a Convex team access token from Daniel through a secret card.
    - [ ] Call `GET https://api.convex.dev/v1/teams/435396/projects`, and `GET https://api.convex.dev/v1/projects/<id>/list_deployments` for each project. Record each result under "Inventory".
    - [ ] Run `npx wrangler whoami`. Confirm the account `0f8cef508e69d2446315a1c80042da20`.
    - [ ] Run `npx wrangler deployments list --name <name>` for `integrated-math-3`, `bus-math-v2`, `integrated-math-1`, `integrated-math-2`, `pre-calculus`, and `danielson`. Record each result, and the workers.dev URL of each Worker that exists.
    - [ ] Compare the result with the inventory of the spec. If a resource is not in the inventory, or a deleted project still exists, stop and report.
    - [ ] Record the D3 decision of each resource under "Decisions".
- [ ] Task: S1 Check — confirm the runtime variables
    - [ ] Read "Runtime Variables" and "Server Calls" of the evidence files of `math-app-base_20261114` and `bm2-convex-auth-v2_20261114`.
    - [ ] Run `git grep -n -o -E "process\.env\.[A-Z_]+" -- apps/math apps/bus-math-v2 ':!**/__tests__/**'`. Compare each name with the Runtime Variables table of the spec.
    - [ ] Record the checked table under "Runtime Variables". Mark each difference from the spec, with its reason.
    - [ ] Commit: `measure(prod-deploy-pipeline): record the inventory and the decisions`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Inventory check and resource decisions' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Inventory check and resource decisions' as complete`.

## Phase S2: Deploy tooling and the math app in production
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the deploy module
    - [ ] Write the contract of `scripts/deploy/apps.ts`: the type `DeployApp` (spec D12) and the export `DEPLOY_APPS`.
    - [ ] Write the contract of `scripts/deploy/deploy-app.ts`: `deployApp(key: string, runner: CommandRunner, log: Logger): Promise<DeployResult>`. `CommandRunner` runs one command and returns its exit code and output. The CLI entry calls it with the real runner.
    - [ ] Write the contract of `scripts/deploy/smoke.ts`: `smokeTest(baseUrl: string, paths: SmokePath[], fetchFn): Promise<SmokeResult>` (spec D8).
    - [ ] Write the contract of the log filter: `redact(text: string, secretNames: string[]): string` replaces each value of each named environment variable with `[secret:NAME]`.
    - [ ] Run `npx convex deploy --help` and `npx convex deployment token create --help`. Record the flag that skips the prompt and the output form of the token command. If the token command prints more than the key, record the pipe step that keeps only the key.
    - [ ] Record the root script: `"deploy:app": "tsx scripts/deploy/deploy-app.ts"`.
- [ ] Task: S2 Test (Red) — specify the deploy behavior
    - [ ] `scripts/__tests__/deploy/apps.test.ts`: `DEPLOY_APPS` has `math` and `bm2`. The `workerName` of each entry equals the `name` in the `wrangler.jsonc` of its `dir`.
    - [ ] `scripts/__tests__/deploy/deploy-app.test.ts`: with a stub runner, a failed preflight check gives no cloud command.
    - [ ] Also: passing steps run `npx convex deploy`, then `npx wrangler deploy`, then the smoke test, in this order.
    - [ ] Also: a failed smoke test runs `npx wrangler rollback --name <DEPLOY_APPS.math.workerName>`, and the result is a failure. Take each Worker name from `DEPLOY_APPS`; no test file holds the literal `integrated-math-3`.
    - [ ] Also: a failed smoke test on a Worker with no earlier version (the stub list of versions is empty) runs no rollback, and the result is a failure.
    - [ ] Also: the preflight passes when `HEAD` is ahead of `origin/master`, and fails when `origin/master` is not an ancestor of `HEAD`.
    - [ ] Also: an unknown app key throws before any command.
    - [ ] Also: when the stub output holds the value of `OPENROUTER_API_KEY`, the log holds `[secret:OPENROUTER_API_KEY]` and not the value.
    - [ ] `scripts/__tests__/deploy/smoke.test.ts`: with a stub fetch, a 200 response with the marker passes. A 500 response, a missing marker, and a timeout fail after 3 tries.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S2 Implement — the deploy module
    - [ ] Implement `apps.ts`, `deploy-app.ts`, `smoke.ts`, and `redact` as the contract gives.
    - [ ] Add the root script `deploy:app`.
    - [ ] Add the Worker name line of `scripts/deploy/apps.ts` to `KEEP_PATHS` of `scripts/__tests__/old-app-path-guard.test.ts` (spec D12).
    - [ ] Commit: `feat(deploy): add the local deploy command with a smoke test and a rollback`.
- [ ] Task: S2 Deploy — the first production deploy of the math app (spec D4a)
    - [ ] In `apps/math`, run `npx convex deploy` alone, with the flag of the S2 Contract that skips the prompt. It makes the prod deployment of `integrated-math-3`. Record its name and URL under "Math Deploy".
    - [ ] Change `NEXT_PUBLIC_CONVEX_URL` in `apps/math/wrangler.jsonc` to that URL. Set `NEXT_PUBLIC_SITE_URL` to the workers.dev URL of `integrated-math-3` that S1 recorded. Commit: `chore(math): point the Worker at the production Convex deployment`.
    - [ ] Set `OPENROUTER_API_KEY` on the Worker that exists, with a secret card: `sh -c 'printf %s "$OPENROUTER_API_KEY" | npx wrangler secret put OPENROUTER_API_KEY --name integrated-math-3'`.
    - [ ] If "Runtime Variables" keeps `CONVEX_DEPLOY_KEY` for the math app, run `npx convex deployment token create --prod | npx wrangler secret put CONVEX_DEPLOY_KEY --name integrated-math-3` in `apps/math`, with the pipe step of the S2 Contract.
    - [ ] Run `npm run deploy:app -- math`. Record the Worker version and the smoke result under "Smoke Results". If the smoke test fails, the command rolls the Worker back; fix forward and run it again.
    - [ ] Run `npx wrangler secret list --name integrated-math-3`. Confirm that the list equals the secrets of "Runtime Variables".
    - [ ] Report the first production deploy of the math app to the PM orchestrator: the app, the URL, and the commit. Record the report under "PM Reports".
    - [ ] Commit: `measure(prod-deploy-pipeline): record the math deploy`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n -E "sk-or-|prod:"` on the changed files. Confirm that no secret value is in the repository.
    - [ ] Commit: `measure(prod-deploy-pipeline): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Deploy tooling and the math app in production' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Deploy tooling and the math app in production' as complete`.

## Phase S3: BM2 under the pipeline
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Test (Red) — specify the BM2 entry
    - [ ] `scripts/__tests__/deploy/deploy-app.test.ts`: with a stub runner, `deployApp('bm2')` runs its commands in `apps/bus-math-v2`, and a failed smoke test runs `npx wrangler rollback --name <DEPLOY_APPS.bm2.workerName>`.
    - [ ] Run the scripts suite. Confirm the result. If the case passes because S2 already covers it, record that and continue.
- [ ] Task: S3 Deploy — the first BM2 deploy through the pipeline
    - [ ] Run `npm run deploy:app -- bm2`. If the Convex step rejects the schema because of old documents, record the tables and the counts under "BM2 Deploy", and continue with the next step. Otherwise go to the secret step.
    - [ ] Add a one-off internal mutation that deletes only the documents of the rejected tables. Deploy it with `npx convex deploy` in `apps/bus-math-v2`, run it with `npx convex run --prod`, then remove it (spec D10). Commit each change.
    - [ ] Set `NEXT_PUBLIC_SITE_URL` in `apps/bus-math-v2/wrangler.jsonc` to the workers.dev URL of `bus-math-v2` that S1 recorded. Commit: `chore(bm2): set the site URL of the Worker`.
    - [ ] Set `OPENROUTER_API_KEY` for `bus-math-v2` with a secret card, as in S2.
    - [ ] If "Runtime Variables" keeps `CONVEX_DEPLOY_KEY` for BM2, pipe a new deploy key into `npx wrangler secret put CONVEX_DEPLOY_KEY --name bus-math-v2`.
    - [ ] If the Worker `bus-math-v2` holds `AUTH_JWT_SECRET`, run `npx wrangler secret delete AUTH_JWT_SECRET --name bus-math-v2`.
    - [ ] Run `npm run deploy:app -- bm2`. Record the Worker version and the smoke result.
    - [ ] Run `npx wrangler secret list --name bus-math-v2`. Confirm that the list equals the secrets of "Runtime Variables".
    - [ ] Report the first BM2 deploy through the pipeline to the PM orchestrator. Record the report under "PM Reports".
    - [ ] Commit: `measure(prod-deploy-pipeline): record the BM2 deploy`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(prod-deploy-pipeline): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: BM2 under the pipeline' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: BM2 under the pipeline' as complete`.

## Phase S4: Release rule and documents
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Test (Red) — specify the workflow state
    - [ ] `scripts/__tests__/deploy/no-deploy-workflows.test.ts`: no file under `.github/workflows/` holds `wrangler deploy`, `wrangler-action`, or `convex deploy`.
    - [ ] Run the scripts suite. Confirm that the case fails, because `cloudflare-deploy.yml` exists.
- [ ] Task: S4 Implement — remove the dispatched workflow
    - [ ] Delete `.github/workflows/cloudflare-deploy.yml` (spec D2).
    - [ ] Run `node scripts/validate-ci.mjs`. If it names the deleted file, change it.
    - [ ] Commit: `ci: remove the dispatched Cloudflare deploy workflow`.
- [ ] Task: S4 Implement — the documents
    - [ ] Add the section "Deployment" to `measure/workflow.md`: the local deploy path (D1), the order and the rollback (D4), the preflight (D5), the secrets (D6, D7), no demo data in production (D9), the release rule (D11), and `npm run deploy:app -- <app>`.
    - [ ] In `AGENTS.md` Guardrails, add: only the orchestrator deploys; the release rule of `measure/workflow.md` "Deployment"; and the authorization of 2026-11-14 for production deploys and the deletion of old cloud resources.
    - [ ] In `measure/tech-stack.md` "Deployment", replace "Platform: Vercel (primary)" with Cloudflare Workers (workers.dev) and Convex Cloud, and name the local deploy command.
    - [ ] Add a row to `measure/tech-debt.md` for `hasEnvVars` in `apps/math/lib/utils.ts` (Supabase leftover), if the function still exists.
    - [ ] Commit: `docs: describe the local deploy path and the release rule`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(prod-deploy-pipeline): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Release rule and documents' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Release rule and documents' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
