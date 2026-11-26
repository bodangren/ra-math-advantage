# Unified Math Pilot Deployment Runbook

Status: Draft. Complete this runbook in T4.1 and T4.4 before deployment.

Only the orchestrator runs deployment commands. Use local `wrangler` and `convex` OAuth logins.
Keep secrets out of files, commits, and logs.

## Targets

- Production Convex deployment for `apps/math` and region: pending.
- Custom domain and zone: pending.
- Worker and version: pending.
- Production variable and secret names: pending. Record names only.

## Sequence

Record the chosen domain before finalizing the production configuration.
Complete T7.1 before production seeding.
Record the checked build commit and RSC marker result before the deployment.
Keep both old Worker subdomains and previews off.
Record the curriculum query and smoke test after the deployment.
Repeat the checks for each new release build.
Stage A deploys IM3. Stage B adds Precalculus on the same Convex backend, Worker, and custom domain.
Before Stage B, record the schema update and safe recovery procedure. Preserve Stage A records.

## Failure procedure

Follow the safe rollback rule in D13 of `measure/tracks/prod-deploy-pipeline_20261114/spec.md`.
Never restore a version that does not satisfy the fixed-build rule.
Disable the custom-domain route if the deployment fails and no safe rollback exists.
Keep `workers.dev` and previews off. Report the failure to the PM.
