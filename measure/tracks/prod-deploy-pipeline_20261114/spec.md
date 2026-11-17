# Track: Production Deploy Pipeline

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: the track set `unified-math-app_20261114` (each member closed),
`bm2-convex-auth-v2_20261114`

## Overview

This track gives the repository one production deploy path that the orchestrator runs on
this machine. The path uses the OAuth logins of the `wrangler` and `convex` CLIs, with no
GitHub secrets. It builds the app and checks the RSC chunk first, then it deploys the Convex
functions, then the Cloudflare Worker, then it runs a smoke test. It rolls the Worker back to
a fixed version, or turns workers.dev OFF, when the smoke test fails. The track starts with
a check of the cloud inventory and a reuse or delete decision for each resource. It brings
the math app and BM2 under the path, and it makes the path ready for `apps/danielson`. It
adds a release rule: after each closeout that changes an app, the orchestrator deploys that
app.

Sprint goal: the math app and BM2 run in production on workers.dev from one local deploy
command, with a smoke test and a rollback, and the documents describe this path.

## Authorization

Daniel authorized the orchestrator to run production deploys and to delete the old cloud
resources of this repository (2026-11-14). This replaces the global rule "deploys and
deletions are human gates" for this project only. The orchestrator reports the first
production deploy of each app to the PM orchestrator as a deploy gate record.

## Current System (checked 2026-11-14)

- **Cloudflare** (account `0f8cef508e69d2446315a1c80042da20`): the Workers `bus-math-v2`
  and `integrated-math-3` only. Both are on workers.dev, with no routes, no custom domains,
  and 0 requests in 4 weeks. Another machine made them.
- **Convex** (team "bodangren", ID `435396`):
  - `integrated-math-3` (`2960816`): only the dev deployment `accurate-labrador-817`. The
    hourly cron of `convex/crons.ts` makes its calls. It has no prod deployment.
  - `bus-math-v2-experimental` (`1720191`): the prod deployment `quiet-swan-141`, with 0
    calls this month.
  - `integrated-math-1` (`2015980`), `integrated-math-2` (`2015859`), and `pre-calculus`
    (`2897579`): no deployments. `math-app-retire-old-apps_20261114` deletes them.
  - `danielson` (`2841695`): keep for later. `codex-convex-probe`: never touch.
- **Convex API access:** the Convex CLI has no project delete command and no project list
  command. The Convex Management API (`https://api.convex.dev/v1/openapi.json`) lists
  projects (`GET /v1/teams/{team_id}/projects`) and deployments
  (`GET /v1/projects/{project_id}/list_deployments`) with a team access token. A deploy key
  cannot list projects.
- **Worker config:**
  - `apps/integrated-math-3/wrangler.jsonc` (after the set: `apps/math/wrangler.jsonc`) has
    `"name": "integrated-math-3"` and the var `NEXT_PUBLIC_CONVEX_URL`
    `https://chatty-weasel-888.convex.cloud`. That deployment is not in the inventory, so the
    value is stale.
  - `apps/bus-math-v2/wrangler.jsonc` has `"name": "bus-math-v2"` and
    `NEXT_PUBLIC_CONVEX_URL` `https://quiet-swan-141.convex.cloud`.
- **Workflows:** `.github/workflows/cloudflare-deploy.yml` is a `workflow_dispatch` workflow
  with the environment `production` and Node 20. It runs the IM3 gates, then
  `cloudflare/wrangler-action@v3` with the secrets `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`. It has never run. `vinext-oxc-toolchain_20261114` removes the
  `deploy` job of `ci.yml` (its D7 says "production deploys run only through a dispatched
  workflow").
- **Workers OFF (2026-11-15):** both Workers `integrated-math-3` and `bus-math-v2` are OFF
  (workers.dev and previews disabled) because of GHSA-xqc2-xf4c-x3h3. Their builds of
  April and March used an affected `react-server-dom-webpack`. The URLs give 404. The
  scripts, the versions, and the secrets stay. The record file is
  `measure/runs/hotfix-rsdw/workers-off-2026-11-15.md`. Decision D13 gives the restore rule.
- **Documents:** the documents hold the deploy path as a planned item, and each marker names
  this track on one line. `measure/tech-stack.md` ("Deployment") says "Platform: Cloudflare
  Workers through `wrangler` 4.98.0" and "Not Vercel (planned: prod-deploy-pipeline_20261114)".
  `AGENTS.md` has the guardrail "Deploys and cloud cleanup" (authorization of 2026-11-14), with
  a planned marker. `README.md`, `INTEGRATION.md`, `measure/architecture.md`, and
  `measure/tech-specs.md` also hold a marker of this track. `measure/workflow.md` has no
  deploy section.
- **Old auth variables:** after `math-app-base_20261114` and `bm2-convex-auth-v2_20261114`,
  no app reads `AUTH_JWT_SECRET`. The evidence files of these tracks ("Runtime Variables")
  list the variables that each app reads, and the server calls that keep
  `CONVEX_DEPLOY_KEY`.
- **Other variables in code:** `lib/utils.ts` of the IM3 app has `hasEnvVars`, a tutorial
  leftover that reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  The IM3 code also reads `VERCEL_URL`. BM2 reads `DEMO_*_PASSWORD` (demo provisioning is
  off in production) and `TEST_API_KEY` (test routes return 403 in production).

## Runtime Variables (expected after the dependencies; the S1 Contract checks them)

| App | Variable | Kind | Value source |
|-----|----------|------|--------------|
| math | `NEXT_PUBLIC_CONVEX_URL` | var (build and run) | the prod deployment URL of `integrated-math-3`, recorded at the first `npx convex deploy` (D4a) |
| math | `NEXT_PUBLIC_SITE_URL` | var | the workers.dev URL of the Worker |
| math | `OPENROUTER_API_KEY` | secret | Daniel, through a secret card |
| math | `OPENROUTER_MODEL_STUDENT_TUTOR` | var | not set until Daniel names the model and agrees to the spend (D7) |
| math | `CONVEX_DEPLOY_KEY` | secret | `npx convex deployment token create --prod`, piped into `wrangler secret put`; only when the base track evidence keeps a no-user server call |
| bm2 | `NEXT_PUBLIC_CONVEX_URL` | var (build and run) | `https://quiet-swan-141.convex.cloud` |
| bm2 | `NEXT_PUBLIC_SITE_URL` | var | the workers.dev URL of the Worker |
| bm2 | `OPENROUTER_API_KEY` | secret | Daniel, through a secret card |
| bm2 | `OPENROUTER_MODEL_STUDENT_TUTOR`, `OPENROUTER_MODEL_SPREADSHEET_EVAL`, `OPENROUTER_MODEL_ACCOUNTING_EVAL` | var | not set until Daniel agrees to the spend (D7); the planned values are in `openrouter-sdk-ai-layer_20261114` |
| bm2 | `CONVEX_DEPLOY_KEY` | secret | as for the math app; only when the BM2 auth track evidence keeps a no-user server call |
| danielson | none | — | static app |

Not set in production: `AUTH_JWT_SECRET` (removed), `DEMO_MATH_PASSWORD`, `DEMO_BM2_PASSWORD`, `TEST_API_KEY`,
`VERCEL_URL`, the Supabase variables, and `DATABASE_URL`. Convex Auth v2 needs no key
variable on the Convex deployment; `CONVEX_CLOUD_URL` is a system variable of Convex.

## Decisions (defaults of 2026-11-14)

- **D1 Local deploys:** deploys run on this machine with the OAuth logins of `npx wrangler`
  and `npx convex`. No deploy runs in GitHub Actions. No GitHub secret exists for deploys.
  This supersedes the D7 words "production deploys run only through a dispatched workflow"
  of `vinext-oxc-toolchain_20261114`.
- **D2 Remove `cloudflare-deploy.yml`:** the workflow cannot run without GitHub secrets, so
  the track deletes it. A later track can add CI deploys with secrets.
- **D3 Reuse and delete:** the math app reuses the Convex project `integrated-math-3` (its
  prod deployment) and the Worker `integrated-math-3`. BM2 keeps the project
  `bus-math-v2-experimental` (prod `quiet-swan-141`) and the Worker `bus-math-v2`.
  `apps/danielson` gets the new Worker `danielson` in its own track. The track deletes no
  other resource, because the retire track deleted the three empty projects. If S1 finds a
  resource that is not in the inventory, stop and report.
- **D4 Deploy order:** each deploy runs the same steps in this order, after the preflight (D5):
  1. Build the app on this machine: `npm run build` in the app folder, with
     `NEXT_PUBLIC_CONVEX_URL` set to the `vars` value of the `wrangler.jsonc` of that folder.
     D4a sets that value before the first `deploy:app` run.
  2. Run the D13 marker check on the built RSC server chunk. If a marker is missing, the
     deploy stops here, before step 3. A static app (D13) has no RSC server chunk, and the
     D13 static-app rule replaces the marker test.
  3. Run `npx convex deploy`, without `--cmd`. The build of step 1 is the only build. Skip
     this step for an app whose `DEPLOY_APPS` entry has Convex "none" (for example
     `danielson`).
  4. Run `npx wrangler deploy --tag <short SHA of HEAD>` (D13 gives the reason for the tag).
  5. Run the smoke test (D8).
  - When the smoke test fails, the failure path of D13 runs: a rollback to a fixed version,
    or workers.dev OFF. Then the command reports and exits with a failure. Convex has no
    rollback; the orchestrator fixes the Convex side forward.
  - The Workers `integrated-math-3` and `bus-math-v2` already have earlier versions (made on
    another machine). These versions have no tag and are affected builds, so D13 never
    selects them for a rollback.
  - A Worker with no earlier version (a new Worker such as `danielson`) has no rollback
    target, so the D13 failure path turns workers.dev OFF. The orchestrator fixes forward.
- **D4a First deploy of an app with a new Convex deployment:** before the first
  `deploy:app` run, the orchestrator runs `npx convex deploy` alone in the app folder, records
  the URL of the prod deployment, and sets `NEXT_PUBLIC_CONVEX_URL` in `wrangler.jsonc` to
  that URL. It sets the Worker secrets on the Worker that exists. Then it runs `deploy:app`.
  So the first Worker deploy never runs with the stale URL. The first `npx convex deploy`
  and the Worker secret puts are the cloud changes before the D13 marker check. The first
  `npx convex deploy` runs no build. Neither step puts Worker code in the cloud, and both
  Workers are OFF at that point.
- **D5 Preflight:** the branch is `master`; the working tree is clean; after
  `git fetch origin`, `origin/master` is an ancestor of `HEAD` (`git merge-base
  --is-ancestor origin/master HEAD`), so no remote commit is missing. `HEAD` can be ahead of
  `origin/master`, because a track pushes only at its closeout. The deploy records the SHA of
  `HEAD`. The `preflightCommands` of the app config pass
  (the typecheck and the test suite of the app); `npx wrangler whoami` shows the account
  `0f8cef508e69d2446315a1c80042da20`; and the Convex CLI is logged in. The Convex check is
  `npx convex login status`: it exits with code 0 when the CLI is logged in and with code 1
  when it is not. The preflight fails on exit code 1. If one check fails, the deploy stops
  before any cloud change.
- **D6 Deploy keys:** a deploy key goes only from `npx convex deployment token create
  --prod` through a pipe into `npx wrangler secret put CONVEX_DEPLOY_KEY --name <worker>`.
  It never appears in a file, a log, or the terminal output. The track sets it only for an
  app that needs it (Runtime Variables).
- **D7 OpenRouter key and models:** the only manual secret is the OpenRouter API key. The
  orchestrator gets it from Daniel through a secret card and pipes it into `npx wrangler
  secret put OPENROUTER_API_KEY`. A role model variable is set in production only after
  Daniel names the model and agrees to the paid spend. Until then, each AI feature fails
  closed, as `openrouter-sdk-ai-layer_20261114` requires.
- **D8 Smoke test:** for each app, `scripts/deploy/smoke.ts` requests each smoke path of the
  app config (`/` and `/auth/login` for the math app and BM2; `/` and one technique page for
  danielson). Each request must give HTTP 200 and a body that holds the marker text of the
  config. It tries 3 times, 5 seconds apart, with a timeout of 10 seconds.
- **D9 No demo data in production:** the deploy runs no seed and no demo provisioning on a
  production deployment. The first school accounts are out of scope.
- **D10 Old documents in the BM2 prod deployment:** if `npx convex deploy` rejects the new
  BM2 schema because of old documents in `quiet-swan-141`, the orchestrator records the table
  names and the counts, deletes those documents with a one-off internal mutation that the
  track adds and then removes, and deploys again. No real user data exists (inventory and set
  decision).
- **D11 Release rule:** after each closeout that changes `apps/math`, `apps/bus-math-v2`, or
  `apps/danielson`, the orchestrator runs `npm run deploy:app -- <app>` for each changed app.
  It records the result (commit, Worker version, smoke result) in the evidence file of the
  closed track. A failed deploy stops the next track until the orchestrator fixes it or rolls
  it back.
- **D12 App config:** one module, `scripts/deploy/apps.ts`, lists each deployable app: `key`,
  `dir`, `workerName`, `convexProject` (or none), `preflightCommands`, `smokePaths` with
  markers, and `secrets`. It has the entries `math` and `bm2`, and `danielson` when
  `apps/danielson` exists at the start of S2.
  `scripts/deploy/deploy-app.ts` reads it. The Worker name `integrated-math-3` in this module
  joins the `KEEP_PATHS` of `scripts/__tests__/old-app-path-guard.test.ts`. The deploy tests
  take each Worker name from `DEPLOY_APPS`, so no test file holds the literal
  `integrated-math-3`.
- **D13 Restore after the RSC advisory (2026-11-15):** both Workers are OFF (Current
  System). The apps come back only through this track.
  - The build comes from master at `472fd719` or later.
  - Before each deploy, the built RSC server chunk must hold both "Cannot handle action key"
    and "Cannot transport a detached buffer". The chunk is the file outside `dist/server/ssr/`
    that contains "Attempted to call a temporary Client Reference". The check runs in step 2
    of D4, after the local build. If a marker is missing, `deployApp` stops before
    `npx convex deploy` and before `npx wrangler deploy`.
  - Static app rule (2026-11-15): a static app has a `DEPLOY_APPS` entry with Convex "none",
    and its `wrangler.jsonc` has no `main`. It has no RSC server chunk. For a static app,
    `checkRscMarkers` passes only when the build folder holds no server output (no
    `dist/server/` folder), and it records "static export: no RSC server chunk". A static app
    build with server output fails the check, with no Worker command. The reason: a static
    export has no Worker code, so the RSC server-action advisory cannot apply.
  - The first `npx wrangler deploy` turns workers.dev on again. This is the planned restore.
  - Version tag: each deploy runs `npx wrangler deploy --tag <short SHA of HEAD>`. The tag
    is the only record that maps a Worker version to its build commit. (Checked in
    `wrangler` 4.98.0: `wrangler deploy` has the flag `--tag`, and `npx wrangler versions list
    --name <W> --json` returns the 10 newest versions, each with `id` and
    `annotations["workers/tag"]`.)
  - Rollback target: the newest version in that list that is not the version of this deploy
    (a different tag), and whose tag is a commit that has `472fd719` as an ancestor
    (`git merge-base --is-ancestor 472fd719 <tag>` exits 0). A version without a tag is never
    a target. This includes all April and March versions. A tag that git cannot resolve is
    never a target. The rollback command is `npx wrangler rollback <version id> --name <W> --yes`.
  - If no target exists (no tag, an empty list, a new Worker, or a failed list command), the
    failure path runs no rollback. It turns workers.dev OFF and previews OFF.
  - workers.dev OFF: the script writes a temporary wrangler config in `os.tmpdir()` with the
    Worker name, `"workers_dev": false`, and `"preview_urls": false`. Then it runs
    `npx wrangler triggers deploy --config <tmp file>` through the command runner. The command
    uses the `wrangler` OAuth login, so the script handles no token. (Checked in `wrangler`
    4.98.0: `triggers deploy` sets the workers.dev subdomain from the config values. The
    command has the status "experimental".) If the command fails, the result is a failure that
    says workers.dev may still be ON. The orchestrator then sends the Cloudflare API call of
    `measure/runs/hotfix-rsdw/workers-off-2026-11-15.md` with a token from a secret card at run
    time. The token never goes into a file or a log.
  - This decision overrides the rollback rule of D4 and the rollback criteria of S2 and S3.

## Stories

### Story S1: Inventory check and resource decisions
**As the** orchestrator
**I want** a checked list of the cloud resources and one decision for each
**So that** a deploy goes only to a known resource

**Acceptance Criteria:**
- Given the team access token from a secret card, When the orchestrator lists the Convex projects and their deployments, Then the evidence file records each project, each deployment, and its D3 decision, and the list equals the inventory of 2026-11-14 minus the three projects that the retire track deleted.
- Given `npx wrangler deployments list --name <name>` for `integrated-math-3`, `bus-math-v2`, `integrated-math-1`, `integrated-math-2`, `pre-calculus`, and `danielson`, When it runs, Then only `integrated-math-3` and `bus-math-v2` exist.
- Given the evidence files of the dependency tracks, When S1 is complete, Then the evidence file holds the checked Runtime Variables table for each app.
- Given a resource outside the inventory, When S1 finds it, Then the track stops and reports.

**Estimate:** S
**Priority:** Must

### Story S2: Deploy tooling and the math app in production
**As the** orchestrator
**I want** one command that deploys an app with a smoke test and a rollback
**So that** each deploy follows the same safe steps

**Acceptance Criteria:**
- Given a stub command runner, When `deployApp('math')` runs with a failed preflight check, Then it runs no cloud command.
- Given a stub runner, When the steps pass, Then the commands run in the D4 order: the build, the marker check, `npx convex deploy` (without `--cmd`), `npx wrangler deploy --tag <short SHA of HEAD>`, then the smoke test.
- Given a stub runner, a failed smoke test, and a version list that holds a version whose tag is a commit with `472fd719` as an ancestor, When `deployApp` runs, Then it runs `npx wrangler rollback <version id> --name <workerName of math> --yes` for the newest such version that is not the version of this deploy, and it exits with a failure (D13).
- Given a stub runner, a failed smoke test, and a version list whose versions have no tag, or a tag that is not a fixed commit, When `deployApp` runs, Then it runs no rollback, it runs `npx wrangler triggers deploy --config <tmp file>` with a config that turns workers.dev and previews OFF, and it exits with a failure (D13).
- Given a stub runner and a built RSC server chunk that lacks "Cannot handle action key" or "Cannot transport a detached buffer", When `deployApp` runs, Then it stops before `npx convex deploy` and runs no cloud command (D13).
- Given a stub runner and a static app (Convex "none", no `main`) whose build folder has no `dist/server/` folder, When `deployApp` runs, Then the marker check passes with the record "static export: no RSC server chunk", the run has no `npx convex deploy` command, and the Worker deploy runs (D13).
- Given a stub runner and a static app whose build folder has a `dist/server/` folder, When `deployApp` runs, Then the marker check fails and the run has no `npx convex deploy` command and no Worker command (D13).
- Given a stub runner, a failed smoke test, and an empty version list (a Worker with no earlier version), When `deployApp` runs, Then it runs no rollback, it turns workers.dev OFF in the same way, and it exits with a failure.
- Given a stub runner whose output holds a value of a secret variable, When `deployApp` logs, Then the log holds no secret value.
- Given the first production deploy of the math app, When it completes, Then the Convex project `integrated-math-3` has a prod deployment, `apps/math/wrangler.jsonc` holds its URL, the Worker has the secrets of the Runtime Variables table, and the smoke test passes on the workers.dev URL.

**Estimate:** L
**Priority:** Must

### Story S3: BM2 under the pipeline
**As the** orchestrator
**I want** BM2 to deploy with the same command
**So that** each app has one release path

**Acceptance Criteria:**
- Given `npm run deploy:app -- bm2`, When it runs, Then it deploys `quiet-swan-141` and the Worker `bus-math-v2`, and the smoke test passes on the workers.dev URL.
- Given old documents that block the BM2 schema, When the deploy fails for that reason, Then the evidence file records the tables and the counts, and the second deploy passes after the D10 cleanup.
- Given the Worker `bus-math-v2`, When `npx wrangler secret list --name bus-math-v2` runs, Then it lists the secrets of the Runtime Variables table and no `AUTH_JWT_SECRET`.
- Given a built RSC server chunk of BM2 that lacks "Cannot handle action key" or "Cannot transport a detached buffer", or a failed smoke test with no version that has a fixed tag, When `deployApp('bm2')` runs, Then the first case stops the deploy before `npx convex deploy`, and the second case runs no rollback and turns workers.dev OFF (D13).

**Estimate:** M
**Priority:** Must

### Story S4: Release rule and documents
**As a** developer or an agent
**I want** the deploy path and the release rule in the project documents
**So that** each closeout that changes an app leads to a deploy

**Acceptance Criteria:**
- Given `measure/workflow.md`, When S4 is complete, Then it has a "Deployment" section with the D1, D4, D5, D6, D7, D9, and D11 rules and the command `npm run deploy:app -- <app>`.
- Given `AGENTS.md`, When S4 is complete, Then its guardrail "Deploys and cloud cleanup" names the release rule and says that only the orchestrator deploys, and it holds no `(planned: prod-deploy-pipeline_20261114)` marker.
- Given `measure/tech-stack.md`, When S4 is complete, Then its "Deployment" section names Cloudflare Workers, Convex Cloud, and the command `npm run deploy:app -- <app>`, and it holds no `(planned: prod-deploy-pipeline_20261114)` marker.
- Given the repository after S4, When `git grep -n "planned: prod-deploy-pipeline_20261114"` runs outside `measure/tracks/`, `measure/runs/`, and `scripts/__tests__/`, Then it finds no marker. Each document that held a marker now states the current deploy path.
- Given the repository after S4, When a test lists `.github/workflows/`, Then no workflow runs `wrangler deploy`, `wrangler-action`, or `convex deploy`.

**Estimate:** S
**Priority:** Must

## Non-Functional Requirements

- No secret value goes into a file, a commit, a log, the terminal output, or the evidence
  file. The secret card and the pipes of D6 and D7 are the only paths for secrets.
- No dependency change. The track uses `wrangler` and `convex` as the lockfile holds them.
- The track changes no cloud resource outside D3. It never touches `codex-convex-probe`.
- No paid spend without Daniel's word (D7).
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24). The tests of
  `deploy-app.ts` use a stub command runner and make no network call.
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: The evidence file records the checked inventory, one decision for each resource, and
  the Runtime Variables of each app.
- AC2: `npm run deploy:app -- <app>` runs the D5 preflight, the D4 order, the D8 smoke test,
  and the rollback, and its tests pass with a stub runner.
- AC3: The math app and BM2 run in production on workers.dev, and their smoke tests pass.
- AC4: No secret value is in the repository, and the Workers hold only the secrets of the
  Runtime Variables table.
- AC5: `cloudflare-deploy.yml` does not exist, and no workflow deploys.
- AC6: `measure/workflow.md`, `AGENTS.md`, and `measure/tech-stack.md` describe the local
  deploy path and the release rule.
- AC7: The orchestrator reported the first production deploy of the math app and of BM2 to
  the PM orchestrator.

## Out of Scope

- Custom domains and routes.
- CI deploys with GitHub secrets (a later track).
- The first school accounts and licenses in production.
- The deploy of `apps/danielson` is owned by this track. It is Phase 3 of the archived
  `danielson-app-import_20261114` and uses this pipeline.
- The Convex project `danielson`.
