# Spec Review: prod-deploy-pipeline_20261114

Author model: claude-opus-5-5[1m]
Revision author (Round 2 fixes): claude-sonnet-5-5

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

Date: 2026-11-15
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high). This is a substitution, because Kimi was at WAIT on weekly pace.
Audited HEAD: 7b5eb2fbe7104acdde074ffa33c64fe43b81e1ca
Result: fail (2 Blockers: F5, F6; 3 Majors: F7, F8, F9; 1 Nit: F10). Files: `measure/runs/prod-deploy-pipeline_20261114/spec-review-7b5eb2fb.json` and `.log`.

### What this track proposes

This track gives the repository one local production deploy path that the orchestrator runs with the OAuth logins of `wrangler` and `convex`. The command `npm run deploy:app -- <app>` runs a preflight, deploys the Convex functions, deploys the Cloudflare Worker, runs a smoke test, and rolls the Worker back when the smoke test fails. The track first checks the cloud inventory and records one reuse-or-delete decision for each resource, then brings the math app and BM2 under the path. After the RSC advisory GHSA-xqc2-xf4c-x3h3 turned both Workers off, decision D13 adds a restore rule: only a build from `472fd719` or later that passes the two-marker RSC chunk check may go out, and a rollback may target only a fixed version. The track also deletes the dispatched GitHub workflow and writes the deploy path and the release rule into the project documents.

### How the current system works, per this spec

Cloudflare account `0f8cef508e69d2446315a1c80042da20` holds only the Workers `integrated-math-3` and `bus-math-v2`. Both are OFF on workers.dev since 2026-11-15, because their April and March builds used an affected `react-server-dom-webpack`. The Convex team `435396` holds the projects of the inventory: `integrated-math-3` has only a dev deployment, and `bus-math-v2-experimental` has the prod deployment `quiet-swan-141`. The IM3 Worker config points at `chatty-weasel-888`, a deployment that is not in the inventory, so the value is stale. Deploys today exist only as a dispatched GitHub workflow that needs secrets the repository does not have. Per this spec, the documents name Vercel as the deploy platform and hold no deploy rule (see F9 for the drift at HEAD).

### Findings

- F5 [Blocker] spec.md D4/D13/D4a and plan.md S2 Implement, S2 Deploy, S3 Deploy: the D13 marker check has two placements that contradict each other and the D13 safety rule. D4 embeds the build in `npx convex deploy` (`--cmd` for the build), and the S2 Implement task puts the check after the build and before `npx wrangler deploy`, so the check runs after the Convex production deploy. But D13 says a missing marker stops the deploy before any cloud change, and the S2 Test case expects no cloud command. The S2 and S3 Deploy tasks also run the D4a `npx convex deploy` before the marker confirmation step. Rationale: the two placements cannot both hold. The implementer must invent where the build and the check sit, and one choice breaks the rule that a missing marker stops the deploy before any cloud change.
- F6 [Blocker] plan.md S2 Contract (findRollbackTarget): Comprehension gap: the plan names no data that maps a real Worker version to its build commit. The contract `findRollbackTarget(versions, minCommit)` must find a version built at `472fd719` or later. The output of `npx wrangler deployments list` carries no build commit, and the affected April and March versions were made on another machine. Rationale: the implementer must invent the classification, for example a created-on date rule or a recorded-SHA table. The stub tests feed whatever field the implementation invents, so the tests cannot enforce the D13 rollback limit.
- F7 [Major] spec.md D4/D13 and plan.md S2 Test: the workers.dev end state of a new Worker after a failed smoke test is undecided. For a Worker with no earlier version, D4 says the deploy leaves the Worker. D13 says that if no version built at `472fd719` or later exists, the failure path turns workers.dev OFF. An empty version list meets both conditions. The S2 Test empty-list case asserts only no rollback and a failure. Rationale: both behaviors pass the named test. The implementer chooses the end state, and D4 and D13 give opposite answers.
- F8 [Major] plan.md S2 Contract (workersDevOff): the plan names no transport and no authentication for the workers.dev OFF call. The contract gives only the endpoint and the body. The stub tests observe only commands that go through the stub runner. The hotfix record names the wrangler OAuth login, but the plan gives no step that reads it, and the Non-Functional Requirements forbid a secret value in a log. Rationale: the implementer must invent how the call authenticates and how the tests observe it. The choice touches secret handling.
- F9 [Major] spec.md Current System (Documents) and plan.md S4 Implement (the documents): the document claims are stale at HEAD, and the S4 edit target is gone. The spec says the Deployment section of `measure/tech-stack.md` says "Platform: Vercel (primary)". At HEAD, the section says "Platform: Cloudflare Workers through `wrangler` 4.98.0" and "Not Vercel (planned: prod-deploy-pipeline_20261114)" (commit 68518169, 2026-11-14 22:50). The S4 task says to replace "Platform: Vercel (primary)", a text that no longer exists, and it does not name the removal of the planned marker. The spec also says `AGENTS.md` has no deploy rule, but the "Deploys and cloud cleanup" guardrail exists since commit b4439ca2 (2026-11-14 08:11). Rationale: the implementer must invent the edit. The named replacement cannot run, and the repository marker rule requires the marker removal.
- F10 [Nit] spec.md D13: the alternative "or from the S1 build of `vinext-oxc-toolchain_20261114`" cannot apply, because D5 requires the branch to be `master`. Rationale: a build from the S1 branch fails the preflight. When the S1 commits reach master, the first arm of the rule already covers the build. The alternative is dead text.

### Author Response

- F5: FIX. One order for each deploy: the preflight, the local build with the prod `NEXT_PUBLIC_CONVEX_URL`, the D13 marker check, `npx convex deploy` without `--cmd`, `npx wrangler deploy --tag`, the smoke test. D4 (new numbered steps), D4a (the first Convex deploy runs no build, and it is the only cloud change before the check, with the reason), D13 (the check runs in step 2 and stops before `npx convex deploy`), the S2 and S3 stories, the S2 Contract, S2 Test, S2 Implement, S2 Deploy, S3 Test, and S3 Deploy now say the same order. The runtime variable source of `NEXT_PUBLIC_CONVEX_URL` no longer names `--cmd-url-env-var-name`.
- F6: FIX. The source is a version tag. Each deploy runs `npx wrangler deploy --tag <short SHA of HEAD>`. The flag `--tag` and the fields `id` and `annotations["workers/tag"]` of `npx wrangler versions list --name <W> --json` are confirmed in the `wrangler` 4.98.0 source (read-only; `--help` cannot run here because the `workerd` binary is missing). The target is the newest version, other than the version of this deploy, whose tag has `472fd719` as an ancestor (`git merge-base --is-ancestor`). A version without a tag is never a target. The contract is now `findRollbackTarget(versions, currentTag, isFixed)`, and the rollback command is `npx wrangler rollback <version id> --name <W> --yes`. The S2 Test cases feed stub version lists with tag fields. Changed: D13, S2 story, S2 Contract, S2 Test, S3 Test. A note: the list shows only the 10 newest versions, so the spec says so.
- F7: FIX. D13 wins. A failed smoke test with no target (an untagged list, an empty list, a new Worker, or a failed list command) turns workers.dev OFF. D4 and the S2 empty-list criterion and test case now say this. The test asserts the OFF command.
- F8: FIX. The OFF step uses `npx wrangler triggers deploy --config <tmp file>` through the runner, with a temporary config in `os.tmpdir()` (the Worker name, `"workers_dev": false`, `"preview_urls": false`). The `wrangler` 4.98.0 source confirms that `triggers deploy` sets the workers.dev subdomain from the config values (the command is marked experimental). The script handles no token. The S2 Contract has a read-only `--dry-run` check that the config loads without a `main` entry. If the command fails, the result says workers.dev may still be ON, and the orchestrator uses the Cloudflare API call with a token from a secret card at run time. New test cases: the stub reads the temporary config, a failed OFF command, and the redact rule for the OFF, list, and rollback steps.
- F9: FIX. The Current System "Documents" bullet states the text that exists now. The S4 documents task edits the "Deploys and cloud cleanup" guardrail and the `measure/tech-stack.md` "Deployment" text, and it removes the markers of this track in the same commit. It also names the markers in `README.md`, `INTEGRATION.md`, `measure/architecture.md`, and `measure/tech-specs.md`. A new S4 story criterion and a new S4 Test case check that no marker remains outside `measure/tracks/`, `measure/runs/`, and the test file.
- F10: FIX. The dead alternative is removed from D13.

## Round 3

Date: 2026-11-15
Reviewer: measure-spec-review (volcengine-agent-plan/glm-latest#high)
Audited HEAD: 9f019de242bf825dcc01335f376fea6a08b7a46a
Status: pass (no Blocker; 1 Major: F12; 1 Nit: F11). Files: `measure/runs/prod-deploy-pipeline_20261114/spec-review-9f019de2.json` and `.log`.

### What this track proposes

This track gives the repository one local production deploy path that the orchestrator runs with the OAuth logins of `wrangler` and `convex`. The command `npm run deploy:app -- <app>` runs a preflight, builds the app with the prod `NEXT_PUBLIC_CONVEX_URL`, runs the D13 RSC marker check, deploys the Convex functions, deploys the Cloudflare Worker with a version tag of the HEAD short SHA, runs a smoke test, and on failure rolls the Worker back to a fixed version or turns workers.dev OFF. The track first checks the cloud inventory and records one reuse-or-delete decision for each resource, then brings the math app and BM2 under the path. It deletes the dispatched GitHub workflow and writes the deploy path and the release rule into the project documents.

### How the current system works, per this spec

Cloudflare account `0f8cef508e69d2446315a1c80042da20` holds only the Workers `integrated-math-3` and `bus-math-v2`. Both are OFF on workers.dev since 2026-11-15, because their April and March builds used an affected `react-server-dom-webpack`. The Convex team `435396` holds the projects of the inventory: `integrated-math-3` has only a dev deployment, and `bus-math-v2-experimental` has the prod deployment `quiet-swan-141`. The IM3 Worker config points at `chatty-weasel-888`, a deployment that is not in the inventory, so the value is stale. Deploys today exist only as a dispatched GitHub workflow that needs secrets the repository does not have. The documents hold the deploy path as a planned item, and each marker names this track.

### Withdrawn Round 2 findings

- F5: withdrawn. The order (build, marker check, `npx convex deploy`, `npx wrangler deploy --tag`, smoke test) is the same in D4, D4a, D13, the stories, the tasks, and the tests.
- F6: withdrawn. The `--tag` flag maps each Worker version to its build commit, and the rollback target rule is complete and testable. It was verified read-only in `wrangler` 4.98.0.
- F7: withdrawn. When no rollback target exists, the failure path turns workers.dev OFF, and the S2 Test case asserts the OFF command.
- F8: withdrawn. The OFF step uses `npx wrangler triggers deploy --config <tmp file>` through the runner, with a read-only `--dry-run` check and a fallback.
- F9: withdrawn. The Current System "Documents" bullet and the S4 edits match the text at HEAD, and the S4 criteria name the marker removal.
- F10: withdrawn. The dead alternative is gone from D13.

### Findings

- F11 [Nit] spec.md D4a: the summary sentences of D4a contradict its own step list. D4a sets the Worker secrets on the Worker before the first `deploy:app` run, but then says 'This one run is the only cloud change before the D13 marker check' and 'It runs no build, and it changes only Convex'. The plan S2 Deploy task also runs the `npx wrangler secret put` calls before `deploy:app`. Rationale: the secret puts are cloud changes on the Worker before the marker check, so the 'only cloud change' and 'changes only Convex' claims are false. The operative order is the same in the spec and the plan, and the stated safety facts (no Worker code exposed, Workers OFF) hold, so the wording changes nothing that the implementer builds.
- F12 [Major] spec.md D5 and plan.md S2 Contract: the preflight requires 'the Convex CLI is logged in', but no document names the check command or its success criterion. Rationale: the implementer must invent the check. The Convex CLI 1.50.0 has no `whoami` command (verified in `node_modules/convex/dist/cli.bundle.cjs`); it offers `npx convex login status`, which 'Exits with code 1 when not logged in'. The wrangler check names its exact command and its expected account; the Convex check names nothing, so the implementer must find and pick the command.

### Author Response

- F11: FIX. The D4a summary now says that the first `npx convex deploy` and the Worker secret puts are the cloud changes before the marker check, that neither puts Worker code in the cloud, and that both Workers are OFF at that point. The S2 Deploy task in `plan.md` says the same.
- F12: FIX. D5 and the S2 Contract name the check: `npx convex login status` exits with code 0 when logged in and with code 1 when not, and the preflight fails on exit code 1. The command was checked read-only with `npx --no-install convex login status --help`. The S2 Test task has a new case: exit code 1 gives a preflight failure and no cloud command.

## Amendment after Round 3 (2026-11-15)

- The static-app rule of D4 and D13 comes from danielson-app-import Round 1 F4 and was not re-reviewed; pipeline S2 Review A and Review B check it; decision: orchestrator default, deferred:pm.

## Accepted Risks

None.
