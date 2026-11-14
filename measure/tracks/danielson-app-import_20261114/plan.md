# Implementation Plan: Danielson App Import

Track: `danielson-app-import_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

**Hold: do not start Phase S1 until Daniel answers the licence question, or until a spec revision for the licence default passes its spec review.** See spec "Licence Default (PM, 2026-11-14)".

## Rules for All Phases

### Start Gates

- Do not start S1 until `vinext-oxc-toolchain_20261114` is closed in `measure/tracks.md`.
- Do not start S3 until `prod-deploy-pipeline_20261114` is closed in `measure/tracks.md`.
  Between S2 and S3 the track stays open, and other tracks can run.

### Gate Commands

After S1, `<app>` is `apps/danielson`. Use the commands that `apps/math` uses after
`vinext-oxc-toolchain_20261114`.

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<app>` |
| Typecheck | `npm run typecheck --workspace=<app>` |
| Test | `CI=true npm run test --workspace=<app>` |
| Build | `npm run build --workspace=<app>` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

A gate passes when it has no failure that the baseline did not have. In S1, the app gates
of `<app>` record their first result as the baseline. "Run each gate" in a Verify task means
each row of this table.

### Source Rule

- Never write in `/home/daniebo/Desktop/hdkwa-danielson`. Read from it, or clone it to a
  new folder under `/tmp`.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12). The
  history merge of S1 is one merge commit.
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Import the app with its history
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the source state
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Source State, Import, Moved Tracks, Removed Files, Toolchain, Build Output, Deploy, Route Check.
    - [ ] Run each repository gate on the start commit. Record each result under "Baseline".
    - [ ] Run `git -C /home/daniebo/Desktop/hdkwa-danielson rev-parse HEAD origin/main` and `git -C /home/daniebo/Desktop/hdkwa-danielson status --short`. Record the output under "Source State".
    - [ ] Confirm that `origin/main` is `c047df1186e9cba458407b6f7be9c6293a9d40fd` and that `git rev-list --count c047df1` gives 71. If not, stop and report.
    - [ ] Write the list of the five open tracks, their new IDs (`danielson-<old id>`), and their status marks under "Moved Tracks".
- [ ] Task: S1 Test (Red) — specify the import
    - [ ] Create `scripts/__tests__/danielson-import.test.ts`. Case 1: `git log --oneline -- apps/danielson` lists at least 71 commits.
    - [ ] Case 2: `apps/danielson` has `package.json`, `src/app/page.tsx`, `product.md`, `product-guidelines.md`, and `DESIGN.md`, and has no `measure/`, `AGENTS.md`, `CLAUDE.md`, `package-lock.json`, or `.github/`.
    - [ ] Case 3: `measure/tracks/danielson-implementation_report_export_20260527/plan.md` exists, and `measure/tracks.md` has a "Danielson App" section with five entries.
    - [ ] Case 4: `apps/danielson/package.json` has no `next`, `eslint`, `eslint-config-next`, or `@rolldown/binding-darwin-arm64`, and has no `name` field.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S1 Implement — merge the source history (spec D1)
    - [ ] Run `git clone --no-local /home/daniebo/Desktop/hdkwa-danielson /tmp/danielson-import`. In `/tmp/danielson-import`, run `git checkout -b import c047df1186e9cba458407b6f7be9c6293a9d40fd`.
    - [ ] In `/tmp/danielson-import`, run `git filter-branch --index-filter` with the index rewrite that puts each path under `apps/danielson/`. Record the exact command under "Import".
    - [ ] Confirm that `git -C /tmp/danielson-import ls-tree -r --name-only import` shows only paths under `apps/danielson/`.
    - [ ] In this repository, run `git fetch /tmp/danielson-import import`, then `git merge --allow-unrelated-histories --no-ff FETCH_HEAD -m "chore(danielson): import hdkwa-danielson main at c047df1 with history"`.
    - [ ] Confirm that `git -C /home/daniebo/Desktop/hdkwa-danielson status --short` and `rev-parse HEAD` equal "Source State".
    - [ ] Record the merge SHA under "Import".
- [ ] Task: S1 Implement — move the Measure artifacts (spec D2, D3)
    - [ ] Run `git mv apps/danielson/measure/tracks/<old id> measure/tracks/danielson-<old id>` for each of the five open tracks.
    - [ ] In each moved `metadata.json`, set `track_id` to the new ID. In each moved `spec.md`, add the first line of spec D2.
    - [ ] Add the section "Danielson App" to `measure/tracks.md`, with one entry for each moved track (the text of the source `measure/tracks.md`, the new link, and "Starts after `danielson-app-import_20261114` closes"). Keep `[~]` for `danielson-implementation_report_export_20260527`.
    - [ ] Run `git mv apps/danielson/measure/product.md apps/danielson/product.md` and `git mv apps/danielson/measure/product-guidelines.md apps/danielson/product-guidelines.md`.
    - [ ] Add the Danielson rows to "Product Definition", "Product Guidelines", and "Design Definitions" of `measure/index.md`.
    - [ ] In `AGENTS.md`, add `apps/danielson/` to the Scope section and a "Where to Look" row for the Danielson app.
    - [ ] Commit: `chore(danielson): move the open tracks and the product documents into the root Measure`.
- [ ] Task: S1 Implement — remove the duplicates and join the workspaces (spec D4, D5)
    - [ ] Run `git rm -r` for `apps/danielson/measure`, `apps/danielson/AGENTS.md`, `apps/danielson/CLAUDE.md`, `apps/danielson/package-lock.json`, and `apps/danielson/.github`. Record each path under "Removed Files".
    - [ ] Change `apps/danielson/package.json` as spec D5 gives.
    - [ ] Run `npm install`. Confirm that `npm ls next` shows no `next` package, and that the lockfile diff adds only the `apps/danielson` workspace and the packages of D5. If it changes another version, stop and report.
    - [ ] Commit: `chore(danielson): join the workspaces with the repository dependency set`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run the scripts suite, the boundary check, and the CI check. Confirm that each passes.
    - [ ] Run the app gates of `apps/danielson`. Record each result under "Baseline" as the app baseline. S2 makes them pass.
    - [ ] Commit: `measure(danielson-app-import): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Import the app with its history' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Import the app with its history' as complete`.

## Phase S2: Repository toolchain
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the toolchain
    - [ ] Under "Toolchain", list the scripts, the config files, and the gate commands of `apps/math` after `vinext-oxc-toolchain_20261114`. Map each to its Danielson file.
    - [ ] Record the `next.config.ts` change of spec D6 and the removal of `src/lib/imagePath.ts` (spec D7), with its two callers.
    - [ ] Record the expected build output: one `index.html` under `dist/client/` for each route, each `/domains/<id>/` of `generateStaticParams`, and each `/strategy/<slug>/`, and each file of `public/technique-images/`.
- [ ] Task: S2 Test (Red) — specify the build
    - [ ] Create `apps/danielson/src/__tests__/build-output.test.ts`. It reads the expected route list from the data that `generateStaticParams` uses. It expects an `index.html` under `dist/client/` for each route, and each technique image under `dist/client/technique-images/`. It skips with a clear message when `dist/client/` does not exist.
    - [ ] Create `apps/danielson/src/__tests__/no-base-path.test.ts`: no file under `apps/danielson/src` names `__NEXT_ROUTER_BASEPATH` or `publicPath`, and `next.config.ts` has no `basePath`.
    - [ ] Run the app suite. Confirm that the new cases fail.
- [ ] Task: S2 Implement — move the app to the repository toolchain (spec D6, D7)
    - [ ] Add the config files and the scripts of "Toolchain". Remove `eslint.config.mjs`.
    - [ ] Change `next.config.ts` as spec D6 gives. Delete `src/lib/imagePath.ts`, and change its two callers to plain public paths.
    - [ ] Run the formatter on `apps/danielson` in one format-only commit: `style(danielson): format with oxfmt`.
    - [ ] Fix each lint and typecheck error that the move shows. Record each fix that is not mechanical under "Toolchain".
    - [ ] Run `npm run build --workspace=apps/danielson`. If the static export fails, apply the fallback of spec D6 and record the error.
    - [ ] Commit: `build(danielson): move the app to vinext 1.x and the Oxc tools`.
- [ ] Task: S2 Implement — CI and the root scripts (spec D9)
    - [ ] Add the `danielson` job to `.github/workflows/ci.yml`, with the steps of the `bm2` job.
    - [ ] Add the `ws:danielson:*` scripts to the root `package.json`.
    - [ ] Commit: `ci: add the danielson job`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run the build, then the build-output test. Record the route count and the image count under "Build Output".
    - [ ] Commit: `measure(danielson-app-import): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Repository toolchain' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Repository toolchain' as complete`.

## Phase S3: Deploy to the Worker danielson
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — define the Worker and the route check
    - [ ] Confirm that `prod-deploy-pipeline_20261114` is closed and that `DEPLOY_APPS` has a `danielson` entry. If it has none, record the entry to add: no Convex project, the smoke paths `/` and one technique page, and the build command of the app.
    - [ ] Write `apps/danielson/wrangler.jsonc` as spec D8 gives, in the evidence file first.
    - [ ] Write the contract of `scripts/deploy/route-check.ts`: `routeCheck(baseUrl, distDir, imageDir, fetchFn)` requests the URL of each `index.html` under `distDir` and each file under `imageDir`, and returns each status.
- [ ] Task: S3 Test (Red) — specify the route check
    - [ ] `scripts/__tests__/deploy/route-check.test.ts`: with a stub fetch and a fixture folder, each 200 response passes, and one 404 response fails with its path.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S3 Implement — the Worker config and the route check
    - [ ] Add `apps/danielson/wrangler.jsonc`. Add the `danielson` entry to `DEPLOY_APPS` if it is missing.
    - [ ] Implement `scripts/deploy/route-check.ts`.
    - [ ] Commit: `feat(danielson): add the Worker config and the route check`.
- [ ] Task: S3 Deploy — deploy the Worker danielson
    - [ ] Run `npm run deploy:app -- danielson`. Record the workers.dev URL and the Worker version under "Deploy".
    - [ ] Run the route check against the URL. Record the counts and each failure under "Route Check". Each request must give HTTP 200.
    - [ ] Request one unknown path. Confirm HTTP 404 and the generated 404 page.
    - [ ] Report the first production deploy of the Danielson app to the PM orchestrator: the app, the URL, and the commit. Tell the PM that the source shutdown can start (spec "External Dependencies").
    - [ ] Commit: `measure(danielson-app-import): record the deploy`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(danielson-app-import): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Deploy to the Worker danielson' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Deploy to the Worker danielson' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
