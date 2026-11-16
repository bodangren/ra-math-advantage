# Implementation Plan: Unified Math App: Retire the Old Math Apps

Track: `math-app-retire-old-apps_20261114`
Specification: [spec.md](./spec.md)
Set: [Unified Math App](../../sets/unified-math-app_20261114.md), member 3
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start Phase 1 until `math-app-course-im1_20261114`, `math-app-course-im2_20261114`,
and `math-app-course-precalc_20261114` are closed in `measure/tracks.md`.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=apps/math` |
| Typecheck | `npm run typecheck --workspace=apps/math` |
| Test | `CI=true npm run test --workspace=apps/math` |
| Build | `npm run build --workspace=apps/math` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Audit suites | `npx vitest run scripts/audit/__tests__` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase 1: Contract & Schema Definition

- [ ] Task: Record the baseline and the inventory
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Remaining References, Document Sections, Open Registry Entries, Cloud Cleanup.
    - [ ] Run each gate on the start commit. Record each result under "Baseline".
    - [ ] Confirm that `apps/integrated-math-1`, `apps/integrated-math-2`, `apps/integrated-math-3`, and `apps/pre-calculus` do not exist. If one exists, stop and report.
    - [ ] Run `git grep -n -E "integrated-math-[123]|pre-calculus" -- . ':!measure/archive'`. Record each file outside `KEEP_PATHS` under "Remaining References".
    - [ ] For each document of spec FR-3 to FR-6, record each section that describes more than one math app under "Document Sections", with its planned text.
    - [ ] Run `git grep -n -E "planned: [^)]*(math-app-base|math-app-course-(im1|im2|precalc)|math-app-retire-old-apps)_20261114" -- README.md AGENTS.md INTEGRATION.md ':(glob)measure/*.md'`. Record each marker under "Document Sections" with its current-state text (spec FR-6a).
    - [ ] Record the open registry entries of FR-7 under "Open Registry Entries".
- [ ] Task: Measure - User Manual Verification 'Phase 1: Contract & Schema Definition' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 1: Contract & Schema Definition' as complete`.

## Phase 2: Test

- [ ] Task: Make the guard final (Red)
    - [ ] In `scripts/__tests__/old-app-path-guard.test.ts`, confirm that `REMOVED_APPS` has the four names of FR-1. Add each missing name.
    - [ ] Set `KEEP_PATHS` to the list of FR-1.
    - [ ] Add a case: `.github/workflows/ci.yml` has no job key that names an old app.
    - [ ] Add a case: the root `package.json` has no `ws:im1:`, `ws:im2:`, `ws:pc:`, or `ws:im3:` script.
    - [ ] Run the scripts suite. Confirm that each case with a "Remaining References" entry fails.
- [ ] Task: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 2: Test' as complete`.

## Phase 3: Implement

- [ ] Task: Remove the remaining references (FR-2)
    - [ ] Change or remove each entry of "Remaining References".
    - [ ] Confirm that the guard passes.
    - [ ] Commit: `chore(math): remove the last references to the old math apps`.
- [ ] Task: Update AGENTS.md and the index (FR-3, FR-4)
    - [ ] Write the `AGENTS.md` title, Scope section, and "Where to Look" rows of FR-3.
    - [ ] Write the `measure/index.md` title and "Per-App Definitions" of FR-4.
    - [ ] Commit: `docs: describe one math app with courses in AGENTS.md and the index`.
- [ ] Task: Update the product and architecture documents (FR-5)
    - [ ] Apply the planned text of "Document Sections" to `measure/product.md`.
    - [ ] Apply it to `measure/architecture.md` and `measure/knowledge-space.md`.
    - [ ] Apply it to `measure/tech-stack.md`, except the Deployment section.
    - [ ] Apply it to `measure/practice-primitives-roadmap.md`.
    - [ ] Commit: `docs(measure): describe one math app with four courses`.
- [ ] Task: Update the README and the integration notes (FR-6)
    - [ ] Apply the planned text to `README.md` and `INTEGRATION.md`.
    - [ ] Run the marker `git grep` of the Phase 1 inventory again. Confirm that it finds no marker of spec FR-6a.
    - [ ] Commit: `docs: name apps/math and its courses in the README`.
- [ ] Task: Delete the empty Convex projects (FR-8)
    - [ ] Get a Convex team access token from Daniel through a secret card. Keep it only in the environment of each command.
    - [ ] Call `GET https://api.convex.dev/v1/teams/435396/projects`. Record each project name and ID under "Cloud Cleanup".
    - [ ] For each of `2015980`, `2015859`, and `2897579`, call `GET https://api.convex.dev/v1/projects/<id>/list_deployments`. Record the result.
    - [ ] If a target ID is missing, has another name, or has a deployment, stop and report.
    - [ ] For each target, call `POST https://api.convex.dev/v1/projects/<id>/delete`. Record the status code.
    - [ ] If the API refuses the token, ask Daniel to delete the three projects in the Convex dashboard. Then continue with the list call.
    - [ ] Call the project list again. Confirm AC7. Record the result.
    - [ ] For each of `integrated-math-1`, `integrated-math-2`, and `pre-calculus`, run `npx wrangler deployments list --name <name>`. Confirm that each Worker does not exist. If one exists, stop and report.
    - [ ] Commit the evidence file: `measure(math-app-retire-old-apps): record the cloud cleanup`.
- [ ] Task: Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit the evidence file: `measure(math-app-retire-old-apps): record the results`.
- [ ] Task: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 3: Implement' as complete`.

## Phase 4: Generate Docs & Doctor

- [ ] Task: Generate the docs and run the doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
    - [ ] Commit the generated files that changed: `measure(math-app-retire-old-apps): regenerate the Measure docs`.
- [ ] Task: Measure - User Manual Verification 'Phase 4: Generate Docs & Doctor' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase 4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase 4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase 4: Generate Docs & Doctor' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the set overview status, the generated facts, and the archive choice.
    - [ ] Report the list of "Open Registry Entries" (FR-7) to the user.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
