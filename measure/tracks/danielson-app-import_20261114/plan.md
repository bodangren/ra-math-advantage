# Implementation Plan: Danielson App Import

Track: `danielson-app-import_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gates

- Do not start S1 until `vinext-oxc-toolchain_20261114` is closed in `measure/tracks.md`.
- Do not start S3 until `prod-deploy-pipeline_20261114` is closed in `measure/tracks.md`.
  Between S2 and S3 the track stays open, and other tracks can run.

### Gate Commands

After S1, `<app>` is `apps/danielson`. Use the commands that `apps/integrated-math-3` uses
after `vinext-oxc-toolchain_20261114`. The app `apps/math` does not exist at the start of
this track. Each task reads each range, script name, config file, gate command, and the
`compatibility_date` from `apps/integrated-math-3` at HEAD when the task starts. The plan
pins no version number and no line number (spec D5).

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

- Never write in `/home/daniebo/Desktop/hdkwa-danielson`. Read it only with `git -C` and
  `archive`, `show`, `rev-parse`, `rev-list`, `status`, or `for-each-ref`.
- Do not clone or fetch the source repository. Make no network call to GitHub for it
  (spec D1).

### Text Rule

- No exact Danielson Framework text goes into a commit, a commit message, a git note,
  `evidence.md`, or a log (spec "Non-Functional Requirements"). Record element IDs, counts,
  paths, and hashes only.
- The working tree holds the source text from the export until the Green task is complete.
  Stage the snapshot only with explicit paths. Never use `git add -A` or `git add .` in S1.
- The snapshot paths are `apps/danielson`, `measure/tracks/danielson-*`,
  `measure/tracks.md`, `measure/index.md`, `AGENTS.md`, and this track folder.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- S1 exception (spec D1, D14c): the tasks "S1 Implement — export the snapshot", "S1 Test
  (Red) — the framework text guard", and "S1 Implement (Green) — paraphrase the framework
  text" make no commit. The task "S1 Implement — scan and make the snapshot commit" commits
  their work as one commit. Each of the four tasks gets the SHA of the snapshot commit.
- S1 mechanics:
  - Red writes the D14b guard in the working tree, runs it, and records the failing output
    in its role log. The output has keys only, and no values. Red makes no commit. The
    orchestrator records the Red HEAD-advance check as an accepted deviation for this task.
  - Green writes the paraphrases, and runs D14a and D14b until both pass. Then Green makes
    the snapshot commit. The snapshot commit holds the Red test.
  - Right after the snapshot commit, one plan-update commit sets the `[x]` marks of the
    no-commit tasks with the snapshot SHA, and adds the git notes.
  - No commit before the snapshot commit holds a file under `apps/danielson`.
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Import the app as one snapshot
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the source state and the text rules
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Source State, Text Rules, Import, Text Scan, Moved Tracks, Removed Files, Toolchain, Build Output, Deploy, Route Check.
    - [ ] Run each repository gate on the start commit. Record each result under "Baseline".
    - [ ] Run `git -C /home/daniebo/Desktop/hdkwa-danielson rev-parse HEAD origin/main`. Record the output under "Source State".
    - [ ] Run `git -C /home/daniebo/Desktop/hdkwa-danielson status --short`. Record the output under "Source State".
    - [ ] Run `git -C /home/daniebo/Desktop/hdkwa-danielson for-each-ref`. Record the output under "Source State".
    - [ ] Confirm that `origin/main` is `c047df1186e9cba458407b6f7be9c6293a9d40fd` and that `git -C /home/daniebo/Desktop/hdkwa-danielson rev-list --count c047df1` gives 71. If not, stop and report.
    - [ ] Confirm that `apps/danielson` does not exist in this repository. If it exists, stop and report.
    - [ ] Under "Baseline", record the dependency ranges and the lockfile versions of `react`, `lucide-react`, `tailwindcss`, and `vitest` at the start of S1. Also record the `vinext` and `react-server-dom-webpack` ranges of `apps/integrated-math-3`. The dated lockfile facts of the spec "Current System" are not the source of these values.
    - [ ] Under "Text Rules", write the 26 element IDs, the normalizations of spec D14a and D14b, the run rule, the title rule, and the paraphrase rules of spec D13. Write no source text.
    - [ ] Write the list of the five open tracks, their new IDs (`danielson-<old id>`), and their status marks under "Moved Tracks".
    - [ ] Commit: `measure(danielson-app-import): record the source state and the text rules`.
- [ ] Task: S1 Test (Red) — specify the import
    - [ ] Create `scripts/__tests__/danielson-import.test.ts`. Add `'__tests__/danielson-import.test.ts'` to `include` in `scripts/vitest.config.ts`.
    - [ ] Case 1: the first commit of `git log --reverse --format='%H %P %s' -- apps/danielson` has one parent, and its subject contains `hdkwa-danielson` and `c047df1`. `git log --merges --format=%H -- apps/danielson` gives no line.
    - [ ] Case 2: `apps/danielson` has `package.json`, `src/app/page.tsx`, `product.md`, `product-guidelines.md`, and `DESIGN.md`, and has no `measure/`, `AGENTS.md`, `CLAUDE.md`, `package-lock.json`, or `.github/`.
    - [ ] Case 3: `measure/tracks/danielson-implementation_report_export_20260527/plan.md` exists, and `measure/tracks.md` has a "Danielson App" section with five entries.
    - [ ] Case 4: `apps/danielson/package.json` has no `next`, `eslint`, `eslint-config-next`, or `@rolldown/binding-darwin-arm64`, and has no `name` field.
    - [ ] Case 5: `apps/danielson/src/data/framework-text.test.ts` has 52 keys in the form `<id>:title` or `<id>:descriptor`, each with a 64-digit hex value (spec D14b).
    - [ ] Run the scripts suite. Confirm that the new cases fail.
    - [ ] Commit: `test(danielson): specify the snapshot import`.
- [ ] Task: S1 Implement — export the snapshot (spec D1 to D4; no commit)
    - [ ] Create the folder `/tmp/danielson-import/`.
    - [ ] Run `git -C /home/daniebo/Desktop/hdkwa-danielson archive --format=tar --prefix=apps/danielson/ -o /tmp/danielson-import/source.tar c047df1`.
    - [ ] Run `tar -x -f /tmp/danielson-import/source.tar -C /home/daniebo/Desktop/ra-math-advantage`. Confirm that `apps/danielson/.git` does not exist.
    - [ ] Record the two commands under "Import".
    - [ ] Run `mv apps/danielson/measure/tracks/<old id> measure/tracks/danielson-<old id>` for each of the five open tracks (spec D2).
    - [ ] In each moved `metadata.json`, set `track_id` to the new ID. In each moved `spec.md`, add the first line of spec D2.
    - [ ] Add the section "Danielson App" to `measure/tracks.md`, with one entry for each moved track (the text of the source `measure/tracks.md`, the new link, and "Starts after `danielson-app-import_20261114` closes"). Keep `[~]` for `danielson-implementation_report_export_20260527`.
    - [ ] Run `mv apps/danielson/measure/product.md apps/danielson/product.md` and `mv apps/danielson/measure/product-guidelines.md apps/danielson/product-guidelines.md` (spec D3).
    - [ ] Add the Danielson rows to "Product Definition", "Product Guidelines", and "Design Definitions" of `measure/index.md`.
    - [ ] In `AGENTS.md`, add `apps/danielson/` to the Scope section and a "Where to Look" row for the Danielson app.
    - [ ] Run `rm -r` for `apps/danielson/measure`, `apps/danielson/AGENTS.md`, `apps/danielson/CLAUDE.md`, `apps/danielson/package-lock.json`, and `apps/danielson/.github` (spec D4). Record each path under "Removed Files".
    - [ ] Do not commit. The working tree still holds the source text (Text Rule).
- [ ] Task: S1 Test (Red) — the framework text guard (spec D14a, D14b, D14c; no commit)
    - [ ] Write `/tmp/danielson-import/scan-framework-text.mjs` as spec D14a gives. It reads the source text only at run time, from the local clone. It holds no source text.
    - [ ] Run `node /tmp/danielson-import/scan-framework-text.mjs --hashes`. Confirm 52 lines in the form `<id>:<kind> <sha256>`.
    - [ ] Create `apps/danielson/src/data/framework-text.test.ts` as spec D14b gives, with the 52 hashes. Write no source text in it.
    - [ ] Run `npx --no-install vitest run --root apps/danielson src/data/framework-text.test.ts`. The app has no workspace install before D5, so the root `vitest` runs it.
    - [ ] Confirm that the guard fails and names each of the 52 fields of `DANIELSON_FRAMEWORK`. Record the count of failed fields under "Text Scan", with no value.
    - [ ] Stage the snapshot paths of the Text Rule. Run `node /tmp/danielson-import/scan-framework-text.mjs`.
    - [ ] Confirm exit code 1, run hits in `apps/danielson/src/data/danielson.ts` and `apps/danielson/src/data/techniques.ts`, and title hits under `apps/danielson/src/`.
    - [ ] Copy the script text and the output into "Text Scan".
    - [ ] Do not commit.
- [ ] Task: S1 Implement (Green) — paraphrase the framework text (spec D13; no commit)
    - [ ] In `apps/danielson/src/data/danielson.ts`, write the 26 own-word descriptors and the 26 own-word labels, as spec D13 gives.
    - [ ] Set each technique `alignment` to `<subdomain>: <new label of that component>`.
    - [ ] Under `apps/danielson/src/`, replace each whole source title with the new label of the same element.
    - [ ] In each other file with a run hit, rewrite the run in own words, or use the element ID.
    - [ ] Run the guard command of the Red task until the guard passes.
    - [ ] Run `npx --no-install vitest run --root apps/danielson`. Confirm that each app test passes.
    - [ ] Do not commit.
- [ ] Task: S1 Implement — scan and make the snapshot commit (spec D1, D14a)
    - [ ] Stage the snapshot paths of the Text Rule again.
    - [ ] Run `node /tmp/danielson-import/scan-framework-text.mjs`. Confirm exit code 0, no run hit, and no title hit.
    - [ ] Copy the output into "Text Scan". Stage `evidence.md` again.
    - [ ] Confirm that the three clone commands of the Contract task give the "Source State" output.
    - [ ] Run `git diff --cached --name-only`. Confirm that each path is a snapshot path of the Text Rule. If another path appears, stop and report.
    - [ ] Commit: `chore(danielson): import bodangren/hdkwa-danielson at c047df1 as one snapshot`.
    - [ ] Run the scripts suite. Confirm that cases 1, 2, 3, and 5 pass. Case 4 passes after D5.
- [ ] Task: S1 Implement — join the workspaces (spec D5)
    - [ ] Record the SHA of the snapshot commit under "Import".
    - [ ] Change `apps/danielson/package.json` as spec D5 gives. Read each range from `apps/integrated-math-3` at HEAD now, and add `react-server-dom-webpack`. Remove the `name` field and the `version` field, and set `"private": true`.
    - [ ] Run `npm install`. Confirm that `npm ls next` shows no `next` package, and that the lockfile diff adds only the `apps/danielson` workspace and the packages of D5. If it changes another version, stop and report.
    - [ ] Commit: `chore(danielson): join the workspaces with the repository dependency set`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run the scripts suite, the boundary check, and the CI check. Confirm that each passes, with the five cases of the Red task.
    - [ ] Run the app gates of `apps/danielson`. Confirm that the guard passes in the Test gate. Record each result under "Baseline" as the app baseline. S2 makes them pass.
    - [ ] Commit: `measure(danielson-app-import): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Import the app as one snapshot' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Put the read of the 26 labels and the 26 paraphrases in the manual verification plan.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Import the app as one snapshot' as complete`.

## Phase S2: Repository toolchain
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the toolchain
    - [ ] Under "Toolchain", list the scripts, the config files, and the gate commands of `apps/integrated-math-3` at HEAD after `vinext-oxc-toolchain_20261114`. Map each to its Danielson file.
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
    - [ ] Write `apps/danielson/wrangler.jsonc` as spec D8 gives, in the evidence file first. Read the `compatibility_date` from `apps/integrated-math-3/wrangler.jsonc` at HEAD now.
    - [ ] Confirm that the marker check of `prod-deploy-pipeline_20261114` has the static-app rule of its spec D13. Confirm that `apps/danielson/wrangler.jsonc` has no `main`. If the rule is missing, stop and report.
    - [ ] Write the contract of `scripts/deploy/route-check.ts`: `routeCheck(baseUrl, distDir, imageDir, fetchFn)` requests the URL of each `index.html` under `distDir` and each file under `imageDir`, and returns each status.
- [ ] Task: S3 Test (Red) — specify the route check
    - [ ] `scripts/__tests__/deploy/route-check.test.ts`: with a stub fetch and a fixture folder, each 200 response passes, and one 404 response fails with its path.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
- [ ] Task: S3 Implement — the Worker config and the route check
    - [ ] Add `apps/danielson/wrangler.jsonc`. Add the `danielson` entry to `DEPLOY_APPS` if it is missing.
    - [ ] Implement `scripts/deploy/route-check.ts`.
    - [ ] Commit: `feat(danielson): add the Worker config and the route check`.
- [ ] Task: S3 Deploy — deploy the Worker danielson
    - [ ] The orchestrator runs this task, not a role (`AGENTS.md`, the deploy authorization of 2026-11-14). The request to turn the site on names the D12 exception of the technique image pixels (PM decision 2026-11-15).
    - [ ] The orchestrator runs `npm run deploy:app -- danielson`. The marker check records "static export: no RSC server chunk". Record the workers.dev URL and the Worker version under "Deploy".
    - [ ] Run the route check against the URL. Record the counts and each failure under "Route Check". Each request must give HTTP 200.
    - [ ] Request one unknown path. Confirm HTTP 404 and the generated 404 page.
    - [ ] Report the first production deploy of the Danielson app to the PM orchestrator: the app, the URL, and the commit. Tell the PM that the Worker can replace the GitHub Pages site. The source repository stays a separate item for Daniel (spec "External Dependencies").
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
