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
    - [ ] Write the contract of `scripts/deploy/deploy-app.ts`: `deployApp(key: string, runner: CommandRunner, log: Logger): Promise<DeployResult>`. `CommandRunner` runs one command (with an optional working folder and environment) and returns its exit code and output. The CLI entry calls it with the real runner.
    - [ ] Write the step order of `deployApp` as spec D4 gives it, the same for each app: (1) the preflight (spec D5; its Convex check is `npx convex login status`, which exits 0 when logged in and 1 when not, and the preflight fails on exit 1); (2) `npm run build` in the app folder, with `NEXT_PUBLIC_CONVEX_URL` set to the `vars` value of the `wrangler.jsonc` of that folder; (3) `checkRscMarkers` on the build folder; (4) `npx convex deploy` without `--cmd`; (5) `npx wrangler deploy --tag <git short SHA of HEAD>`; (6) the smoke test. A failed step 1, 2, or 3 gives no Convex command and no Worker command. The failure path (smoke test failed) is in the rollback contract below.
    - [ ] Write the contract of `scripts/deploy/smoke.ts`: `smokeTest(baseUrl: string, paths: SmokePath[], fetchFn): Promise<SmokeResult>` (spec D8).
    - [ ] Write the contract of the log filter: `redact(text: string, secretNames: string[]): string` replaces each value of each named environment variable with `[secret:NAME]`.
    - [ ] Write the contract of the marker check (spec D13): `checkRscMarkers(distDir: string): MarkerResult`. It finds the RSC server chunk (the file outside `dist/server/ssr/` that contains "Attempted to call a temporary Client Reference"). It passes only when the chunk holds "Cannot handle action key" and "Cannot transport a detached buffer".
    - [ ] Write the contract of the version list: the failure path runs `npx wrangler versions list --name <workerName> --json`. The output is an array of the 10 newest versions. Each item has `id` and `annotations["workers/tag"]` (the tag; it can be missing). A failed list command, or output that is not valid JSON, counts as an empty list.
    - [ ] Write the contract of the rollback target (spec D13): `findRollbackTarget(versions: WorkerVersion[], currentTag: string, isFixed: (tag: string) => boolean): WorkerVersion | undefined`. It returns the newest version whose tag exists, differs from `currentTag`, and passes `isFixed`. A version without a tag never matches. `deployApp` builds `isFixed` from `git merge-base --is-ancestor 472fd719 <tag>` through the runner (exit code 0 means fixed; any other exit code, including a tag that git cannot resolve, means not fixed). The rollback command is `npx wrangler rollback <version id> --name <workerName> --yes`.
    - [ ] Write the contract of `workersDevOff(workerName: string, runner: CommandRunner): Promise<CommandResult>` (spec D13): it makes a folder with `fs.mkdtemp` in `os.tmpdir()`, writes `wrangler.jsonc` there with `name`, `"workers_dev": false`, and `"preview_urls": false`, runs `npx wrangler triggers deploy --config <that file>` through the runner, and removes the folder. It reads and writes no token. If the command fails, `deployApp` reports that workers.dev may still be ON, and exits with a failure.
    - [ ] Run `npx --no-install wrangler triggers deploy --config <tmp file> --dry-run` with a temporary config of this form. The flag `--dry-run` changes nothing in the cloud. Record that the config loads without a `main` entry. If it does not load, add the lines that the config needs to the contract, and record the reason.
    - [ ] Run `npx convex deploy --help` and `npx convex deployment token create --help`. Record the flag that skips the prompt and the output form of the token command. If the token command prints more than the key, record the pipe step that keeps only the key.
    - [ ] Record the root script: `"deploy:app": "tsx scripts/deploy/deploy-app.ts"`.
- [ ] Task: S2 Test (Red) — specify the deploy behavior
    - [ ] `scripts/__tests__/deploy/apps.test.ts`: `DEPLOY_APPS` has `math` and `bm2`. The `workerName` of each entry equals the `name` in the `wrangler.jsonc` of its `dir`.
    - [ ] `scripts/__tests__/deploy/deploy-app.test.ts`: with a stub runner, a failed preflight check gives no cloud command.
    - [ ] Also: passing steps run the build (with `NEXT_PUBLIC_CONVEX_URL` set to the `wrangler.jsonc` value), then the marker check, then `npx convex deploy`, then `npx wrangler deploy --tag <short SHA of HEAD>`, then the smoke test, in this order. The `npx convex deploy` command has no `--cmd` flag. The stub records the order of its calls and the marker check reads the stub build folder before the first Convex command.
    - [ ] Also: a failed smoke test with a stub version list (items with `id` and a tag field) in which a version has a tag that the stub `git merge-base` calls fixed runs `npx wrangler rollback <that version id> --name <DEPLOY_APPS.math.workerName> --yes`, and the result is a failure. Take each Worker name from `DEPLOY_APPS`; no test file holds the literal `integrated-math-3`.
    - [ ] Also: the rollback target is the newest fixed version. Cases: two fixed versions give the newer one; the version with the tag of this deploy is skipped; a version without a tag is skipped, even when it is the newest; a version whose tag the stub `git merge-base` calls not fixed (exit code 1, or an unknown tag) is skipped.
    - [ ] Also: a failed smoke test with a stub version list that has no target (only untagged versions, or only tags that are not fixed) runs no rollback, runs `npx wrangler triggers deploy --config <tmp file>` through the stub runner, and the result is a failure. The stub reads the config file when it receives the command. The config has the Worker name, `"workers_dev": false`, and `"preview_urls": false`. The folder of the file is under `os.tmpdir()` and it is removed afterward.
    - [ ] Also: a failed smoke test on a Worker with no earlier version (the stub list of versions is empty, or the stub list command fails) runs no rollback, runs the same workers.dev OFF command, and the result is a failure.
    - [ ] Also: when the stub runner fails the workers.dev OFF command, the result is a failure that says workers.dev may still be ON.
    - [ ] Also: a stub output that holds the value of a secret variable never appears in the log of the OFF step, the list step, or the rollback step (the redact rule).
    - [ ] Also (marker check, spec D13): a stub build folder whose RSC server chunk lacks "Cannot handle action key", or lacks "Cannot transport a detached buffer", gives no Convex command, no Worker command, and a failure. A chunk that holds both strings passes the check.
    - [ ] Also: the marker check finds the RSC chunk outside `dist/server/ssr/`, and it does not read a file under `dist/server/ssr/`.
    - [ ] Also: when the stub runner returns exit code 1 for `npx convex login status`, the preflight fails and the stub receives no cloud command. Exit code 0 for that command passes this check.
    - [ ] Also: the preflight passes when `HEAD` is ahead of `origin/master`, and fails when `origin/master` is not an ancestor of `HEAD`.
    - [ ] Also: an unknown app key throws before any command.
    - [ ] Also: when the stub output holds the value of `OPENROUTER_API_KEY`, the log holds `[secret:OPENROUTER_API_KEY]` and not the value.
    - [ ] `scripts/__tests__/deploy/smoke.test.ts`: with a stub fetch, a 200 response with the marker passes. A 500 response, a missing marker, and a timeout fail after 3 tries.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S2 Implement — the deploy module
    - [ ] Implement `apps.ts`, `deploy-app.ts`, `smoke.ts`, and `redact` as the contract gives.
    - [ ] Implement the marker check, the rollback target rule, and the workers.dev OFF command as the contract gives (spec D13). The step order is the one of the S2 Contract: the build, the marker check, `npx convex deploy`, then `npx wrangler deploy --tag`. The marker check runs before `npx convex deploy`.
    - [ ] Add the root script `deploy:app`.
    - [ ] Add the Worker name line of `scripts/deploy/apps.ts` to `KEEP_PATHS` of `scripts/__tests__/old-app-path-guard.test.ts` (spec D12).
    - [ ] Commit: `feat(deploy): add the local deploy command with a smoke test and a rollback`.
- [ ] Task: S2 Deploy — the first production deploy of the math app (spec D4a)
    - [ ] In `apps/math`, run `npx convex deploy` alone, with the flag of the S2 Contract that skips the prompt. It runs no build. It and the Worker secret puts below are the cloud changes before the marker check, and neither puts Worker code in the cloud (spec D4a). It makes the prod deployment of `integrated-math-3`. Record its name and URL under "Math Deploy".
    - [ ] Change `NEXT_PUBLIC_CONVEX_URL` in `apps/math/wrangler.jsonc` to that URL. Set `NEXT_PUBLIC_SITE_URL` to the workers.dev URL of `integrated-math-3` that S1 recorded. Commit: `chore(math): point the Worker at the production Convex deployment`.
    - [ ] Set `OPENROUTER_API_KEY` on the Worker that exists, with a secret card: `sh -c 'printf %s "$OPENROUTER_API_KEY" | npx wrangler secret put OPENROUTER_API_KEY --name integrated-math-3'`.
    - [ ] If "Runtime Variables" keeps `CONVEX_DEPLOY_KEY` for the math app, run `npx convex deployment token create --prod | npx wrangler secret put CONVEX_DEPLOY_KEY --name integrated-math-3` in `apps/math`, with the pipe step of the S2 Contract.
    - [ ] Run `git merge-base --is-ancestor 472fd719 HEAD`. Confirm exit code 0 (spec D13). If it fails, stop.
    - [ ] Run `npm run deploy:app -- math`. The command builds the app with the prod `NEXT_PUBLIC_CONVEX_URL`, runs the marker check on the built RSC server chunk, then runs `npx convex deploy`, then `npx wrangler deploy --tag <short SHA of HEAD>` (spec D4, D13). If a marker is missing, the command stops before `npx convex deploy`: record the result and stop. The first `npx wrangler deploy` turns workers.dev on again. Record the Worker version, its tag, the marker result, and the smoke result under "Smoke Results". If the smoke test fails, the command rolls the Worker back only to a version with a fixed tag. If no such version exists, the command turns workers.dev OFF. Fix forward and run it again.
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
    - [ ] `scripts/__tests__/deploy/deploy-app.test.ts`: with a stub runner, `deployApp('bm2')` runs its commands in `apps/bus-math-v2`, and a failed smoke test with a stub version list that holds a version with a fixed tag runs `npx wrangler rollback <that version id> --name <DEPLOY_APPS.bm2.workerName> --yes`.
    - [ ] Also: a failed smoke test of `deployApp('bm2')` with a stub version list that has no version with a fixed tag runs no rollback, and it runs `npx wrangler triggers deploy --config <tmp file>` for `<DEPLOY_APPS.bm2.workerName>` (spec D13).
    - [ ] Also: `deployApp('bm2')` with a stub build folder whose RSC server chunk lacks "Cannot handle action key" or "Cannot transport a detached buffer" gives no Convex command, no Worker command, and a failure (spec D13).
    - [ ] Run the scripts suite. Confirm the result. If the case passes because S2 already covers it, record that and continue.
- [ ] Task: S3 Deploy — the first BM2 deploy through the pipeline
    - [ ] Run `git merge-base --is-ancestor 472fd719 HEAD`. Confirm exit code 0 (spec D13). If it fails, stop.
    - [ ] Run `npm run deploy:app -- bm2`. The command builds BM2, runs the marker check on the built RSC server chunk, and stops before `npx convex deploy` if a marker is missing (spec D4, D13). Record the marker result. If the Convex step rejects the schema because of old documents, record the tables and the counts under "BM2 Deploy", and continue with the next step. Otherwise go to the secret step.
    - [ ] Add a one-off internal mutation that deletes only the documents of the rejected tables. Deploy it with `npx convex deploy` in `apps/bus-math-v2`, run it with `npx convex run --prod`, then remove it (spec D10). Commit each change.
    - [ ] Set `NEXT_PUBLIC_SITE_URL` in `apps/bus-math-v2/wrangler.jsonc` to the workers.dev URL of `bus-math-v2` that S1 recorded. Commit: `chore(bm2): set the site URL of the Worker`.
    - [ ] Set `OPENROUTER_API_KEY` for `bus-math-v2` with a secret card, as in S2.
    - [ ] If "Runtime Variables" keeps `CONVEX_DEPLOY_KEY` for BM2, pipe a new deploy key into `npx wrangler secret put CONVEX_DEPLOY_KEY --name bus-math-v2`.
    - [ ] If the Worker `bus-math-v2` holds `AUTH_JWT_SECRET`, run `npx wrangler secret delete AUTH_JWT_SECRET --name bus-math-v2`.
    - [ ] Run `npm run deploy:app -- bm2`. The first `npx wrangler deploy --tag <short SHA of HEAD>` turns workers.dev on again (spec D13). If the smoke test fails, the command rolls back only to a version with a fixed tag; if none exists, it turns workers.dev OFF. Record the Worker version, its tag, and the smoke result.
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
    - [ ] Also: the marker `planned: prod-deploy-pipeline_20261114` is in no tracked file outside `measure/tracks/`, `measure/runs/`, and the test file itself (read the files with `git ls-files`). The test builds the marker text from two string parts, so that its own source does not match.
    - [ ] Run the scripts suite. Confirm that the cases fail, because `cloudflare-deploy.yml` exists and the markers exist.
- [ ] Task: S4 Implement — remove the dispatched workflow
    - [ ] Delete `.github/workflows/cloudflare-deploy.yml` (spec D2).
    - [ ] Run `node scripts/validate-ci.mjs`. If it names the deleted file, change it.
    - [ ] Commit: `ci: remove the dispatched Cloudflare deploy workflow`.
- [ ] Task: S4 Implement — the documents
    - [ ] Add the section "Deployment" to `measure/workflow.md`: the local deploy path (D1), the order and the rollback (D4), the preflight (D5), the secrets (D6, D7), no demo data in production (D9), the release rule (D11), and `npm run deploy:app -- <app>`.
    - [ ] In `AGENTS.md`, edit the guardrail "Deploys and cloud cleanup" that exists now (authorization of 2026-11-14). Add that only the orchestrator deploys and the release rule of `measure/workflow.md` "Deployment". Remove the marker `(planned: prod-deploy-pipeline_20261114)` and state the deploy path as the current state.
    - [ ] In `measure/tech-stack.md` "Deployment", edit the text that exists now ("Platform: Cloudflare Workers through `wrangler` 4.98.0", the line "Planned: local deploys ...", and "Not Vercel (planned: prod-deploy-pipeline_20261114)"). State the local deploy path as current, name Cloudflare Workers (workers.dev), Convex Cloud, and `npm run deploy:app -- <app>`, and remove the marker.
    - [ ] Remove the other markers of this track in the same commit and write the current state in each place: `README.md` (line 136), `INTEGRATION.md` (line 287), `measure/architecture.md` (lines 24 and 281), and `measure/tech-specs.md` (line 122). Run `git grep -n "planned: prod-deploy-pipeline_20261114" -- . ':!measure/tracks' ':!measure/runs' ':!scripts/__tests__'`. Confirm that it finds nothing. If a line number moved, search by the marker.
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
