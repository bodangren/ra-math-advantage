# Track: Consume the mastery-advantage Math Graph

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: `kst-v32-runtime_20261114` (closed); the first release of the merged math
graph in the hand-off folder (see "External Dependencies")

## Overview

The private repository mastery-advantage (`github.com/Reading-Advantage-Thailand/
mastery-advantage`) becomes the source of the math skill graph. It releases one merged
domain for IM1, IM2, IM3, and AP Precalculus ("IM1 to Precalc", Daniel, 2026-11-14), with
the default name `math.us-hs`. A release is one graph file and one mapping file. The
mapping file maps each old node ID of this repository to a node ID of the release (many to
one).

This track takes the first release into `apps/math`, switches the app from the graph files
of the set to the released graph, shows the CCSS tag of each node in teacher reporting,
and removes the old graph data files and the scripts that only write them.

Sprint goal: the math app reads its skill graph only from the released `math.us-hs` file,
and the repository holds no graph data file that the release replaces.

## Current System (checked 2026-11-14 on `0bf1900a`)

Paths below give the state after the set `unified-math-app_20261114`. Today the files are
in the old app folders.

- **Graph files:** 47 graph data files exist (`origin/master` `c1e0b1b2` has them; the
  repository is public).
  - `apps/math/curriculum/<course>/skill-graph/` for `im1`, `im2`, `im3`, and `precalc`:
    `nodes.json`, `edges.json`, `standard-edges.json`, `draft-nodes.json`,
    `edge-review-queue.json`, `standards-review-queue.json`, and (precalc)
    `unit-4-source-gap-queue.json`. IM3 also has `module-<n>/` files with nodes, edges, and
    standard edges.
  - `apps/math/convex/seed/im1/standards_inventory.json` and
    `apps/math/convex/seed/im2/standards_inventory.json`.
  - `packages/math-content/src/knowledge-space/cross-course-edges.json`.
- **Kept authoring files:** `blueprints.json` (also the IM3 module blueprints), the
  projection files (`skill-graph/projection/`), `component-gap-queue.json`,
  `generator-gap-queue.json`, and `geometry-renderer-gap-queue.json`. They hold old node
  IDs.
- **Curriculum files:** 325 files under `apps/*/curriculum/modules/` are in the public
  repository. Daniel (2026-11-14): the content is reproducible material from various
  publishers, and "Public is fine". These files stay.
- **Loader:** `loadMathGraph()` in `apps/math/lib/curriculum/skill-graph-loader.ts` returns
  the union of the files of `GRAPH_SOURCES`. `courseView(graph, courseKey)` uses the
  registry field `graphCourseNodeId` (for example `math.im3`). `objectiveNodeIds(graph,
  objectiveId)` finds the `standard` nodes whose `canonicalCcssCode(metadata.code)` equals
  the objective ID (`math-app-base_20261114` D6a).
- **Other readers:** some files read the graph files directly, not through the loader. On
  `0bf1900a` they include `convex/student.ts`, `convex/student/knowledge-state.ts`,
  `convex/parent/visualization.ts`, `lib/practice/misconception-taxonomy.ts`,
  `lib/practice/misconception-remediations.ts`,
  `packages/math-content/src/knowledge-space/generators/algebra-generators-adapters.ts`, and
  many tests.
- **Generator and renderer nodes:** IM3 `nodes.json` holds 4 `generator` nodes and 5
  `renderer` nodes, with `generated_by` and `rendered_by` edges. The release leaves them
  out of the data graph (PM rule A-58).
- **Stored node IDs:** `placement_results.nodeId` holds node IDs.
  `edge_calibration.edgeId` and `calibration_review_queue.edgeId` hold edge IDs. They are
  derived from observations.
- **Scripts that write graph data:** `scripts/align-standards.ts`,
  `scripts/extract-skill-inventory.ts`, `scripts/generate-course-edges.ts`,
  `scripts/generate-cross-course-edges.ts`, and `scripts/validate-skill-inventory.ts` name
  graph data files. `scripts/remediate-concept-blueprints.ts` writes blueprints.
- **Cross-course code:** `packages/knowledge-space-core/src/cross-course-equivalence.ts`
  (with `courseFromId`) serves only `scripts/generate-cross-course-edges.ts` after the
  student history track.
- **Hand-off folders:** `/home/daniebo/Desktop/handoff/` holds the seed folders
  `a58-math-graph-seed-{im1,im2,im3,ap-precalc,cross-course}` that this repository sent. No
  release folder exists yet.

## Decisions (defaults of 2026-11-14)

- **G1 Hand-off and check:** the release arrives in
  `/home/daniebo/Desktop/handoff/a58-math-graph-release-us-hs-<label>/` (a changed version
  in a new folder with the suffix `-v2`, `-v3`, and so on).
  - The folder holds one graph file, one mapping file, and their SHA-256 values. The track
    checks each SHA-256 before use. A mismatch stops the track, and the track reports it to
    the PM.
  - After the check, the track sends one line to the PM orchestrator and to the sender
    session: the folder, the two file names, and "SHA-256 verified".
- **G2 Files in the repository:** the released file and the mapping file go into
  `apps/math/curriculum/graph/release/` unchanged (Daniel confirmed, 2026-11-14; no license
  gate). The folder also gets `SHA256SUMS` and `RELEASE.md` (the label, the hand-off folder,
  the source commit if the hand-off names it, and the date).
  - The test `apps/math/__tests__/curriculum/graph-release.test.ts` checks each SHA-256 of
    `SHA256SUMS`.
  - A new release replaces the files of this folder in one commit.
- **G3 Validation at ingestion:** the script `scripts/graph/ingest-release.ts <folder>`
  checks the SHA-256 values, validates the graph, and copies the files (§15.3 rule 4:
  validation at ingestion time). The validation is:
  - The structural and content checks of `packages/knowledge-space-core/src/validation.ts`.
  - No `generator` node and no `renderer` node.
  - Each learnable node (`skill`, `concept`, `worked_example`) has at least one
    `aligned_to_standard` edge to a CCSS `standard` node, with one primary. Or the node is
    on the PM-approved exception list of the release.
  - Each mapping target is a node of the release, and each node ID of the current graph
    files has a mapping entry.
  - The validation test runs the same checks on the files in the repository.
- **G4 Mapping file format:** the S1 Contract records the format of the mapping file from
  the hand-off. If the hand-off does not describe the format, stop and ask the PM.
- **G5 Graph source:** `GRAPH_SOURCES` goes away. `loadMathGraph()` reads the released
  file only. `courseView` and `objectiveNodeIds` keep their contracts.
  - Each registry `graphCourseNodeId` changes to the released course container ID that the
    mapping file gives for `math.im1`, `math.im2`, `math.im3`, and `math.precalc`.
  - Each direct reader of a graph file changes to `loadMathGraph()`.
- **G6 CCSS codes:** objective IDs stay canonical CCSS codes. `objectiveNodeIds` applies
  `canonicalCcssCode` to the `metadata.code` of each released standard node. The S1
  Contract records the code form of the release.
  - If `canonicalCcssCode` does not give one canonical code for each released CCSS code,
    `canonicalCcssCode` gets the extra form, with a test.
  - If two released codes give one canonical code, or a competency code has no released
    standard node, stop and report to the PM.
  - No stored code changes.
- **G7 Runtime bindings:** the 9 generator and renderer nodes and their edges become app
  code in `apps/math/lib/curriculum/runtime-bindings.ts`. It maps each node ID of the
  release to its generator key or its renderer key. Each reader of `generated_by` or
  `rendered_by` edges in `apps/math` reads the bindings. The node kinds stay in
  `packages/knowledge-space-core`, because v3.2 §3.1 defines them.
- **G8 Kept authoring files:** the script `scripts/graph/rekey-node-ids.ts` applies the
  mapping file to `blueprints.json` and the three gap queues.
  - When two entries map to one node, the entry of the course with the lowest registry
    `sequence` stays. The evidence file lists each dropped entry.
  - The projection files are regenerated outputs (v3.2 §9): the projection builder runs
    again on the released graph and the re-keyed blueprints.
- **G9 Node IDs in code:** each node ID literal of the old scheme in `apps/math` and in
  `packages/` (code and tests, not data) changes to its mapping target. The S2 Contract
  lists each literal with `git grep -n -E "math\.(im1|im2|im3|precalc)\."`.
- **G10 Stored node IDs:** the one-off internal mutation `migrateGraphNodeIds` in
  `apps/math/convex/graph/migrate.ts` re-keys `placement_results.nodeId` with the mapping.
  When two rows of one student map to one node, the newest row stays. The mutation deletes
  the rows of `edge_calibration` and `calibration_review_queue`, then
  `refreshCalibrationReviewQueue` recomputes them. The track runs it on the dev deployment.
  The prod deploy of the release rule (`prod-deploy-pipeline_20261114` D11) comes after the
  closeout. Right after that deploy, the orchestrator runs
  `npx convex run graph/migrate:migrateGraphNodeIds --prod` one time. The closeout report
  to the PM names this step.
- **G11 CCSS tags in reporting:** teacher reporting shows the CCSS code of each node from
  the released graph, primary first. A node on the exception list shows its AP CED code
  only. The app shows no College Board text.
  - Each page that shows CCSS standard text also shows the CCSS copyright notice. The S3
    Contract records the pages and the notice text.
  - The product section "Global Competency Standard Codes" in `measure/product.md` says
    that the codes come from the released graph.
- **G12 Removal:** after S2, the track deletes the 47 graph data files and the scripts that
  only write graph data. It removes `cross-course-equivalence.ts` and its test.
  - Each script of the S4 Contract gets one class: writes graph data only (delete), builds
    projections or blueprints (keep), or validates graph data (delete; G3 replaces it).
  - The curriculum module files stay. The track plans no history rewrite (Daniel's
    decision).

## Stories

### Story S1: Ingest the first release
**As a** curriculum maintainer
**I want** the released graph checked, validated, and stored unchanged
**So that** the app uses exactly the graph that mastery-advantage released

**Acceptance Criteria:**
- Given the hand-off folder, When `scripts/graph/ingest-release.ts` runs, Then it checks each SHA-256, validates the graph by G3, and copies the two files to `apps/math/curriculum/graph/release/` with `SHA256SUMS` and `RELEASE.md`.
- Given a changed byte in a hand-off file, When the script runs, Then it stops with the SHA-256 error and copies nothing.
- Given a learnable node with no CCSS link that is not on the exception list, When the validation runs, Then it fails and names the node.
- Given the repository after S1, When `graph-release.test.ts` runs, Then each SHA-256 matches.
- Given the check, When it passes, Then the PM orchestrator and the sender session get the one-line notice of G1.

**Estimate:** M
**Priority:** Must

### Story S2: The app reads the released graph
**As a** student or a teacher
**I want** the app to use the one merged graph
**So that** a skill that two courses teach has one state and one record

**Acceptance Criteria:**
- Given `loadMathGraph()`, When it runs, Then it reads only the released file, and `GRAPH_SOURCES` does not exist.
- Given each registry course, When `courseView` runs, Then it returns the nodes that the released course container reaches.
- Given a student with evidence on a skill that IM1 and IM2 share, When the knowledge state of IM2 is computed, Then the shared skill node has that evidence.
- Given `git grep -n -E "math\.(im1|im2|im3|precalc)\." -- apps/math packages ':!*.json'`, When S2 is complete, Then it finds no match outside the list that the evidence file gives with a reason.
- Given the dev deployment after `migrateGraphNodeIds`, When `placement_results` is read, Then each `nodeId` is a node of the release.
- Given the projection builder, When it runs on the released graph, Then each projection row names a node of the release.

**Estimate:** XL
**Priority:** Must

### Story S3: CCSS tags in teacher reporting
**As a** teacher
**I want** the CCSS code of each skill in my reports
**So that** I can report progress against the standards

**Acceptance Criteria:**
- Given a node with a primary and a secondary CCSS link, When the teacher competency page shows it, Then it shows the primary code first.
- Given a node on the exception list, When a teacher page shows it, Then it shows the AP CED code only, and no College Board text.
- Given a page that shows CCSS standard text, When it renders, Then it shows the CCSS copyright notice.
- Given `measure/product.md`, When S3 is complete, Then its "Global Competency Standard Codes" section says that the codes come from the released graph.

**Estimate:** M
**Priority:** Must

### Story S4: Remove the old graph data
**As a** developer
**I want** one graph source in the repository
**So that** no stale copy can disagree with the release

**Acceptance Criteria:**
- Given the repository after S4, When `scripts/__tests__/graph-data-removed.test.ts` runs, Then none of the 47 files exists, and no script writes a graph data file.
- Given `packages/knowledge-space-core`, When S4 is complete, Then `cross-course-equivalence.ts` does not exist.
- Given the curriculum module files, When S4 is complete, Then each one still exists.
- Given the gates, When they run, Then each gate passes.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- Do not write in the mastery-advantage repository or in the hand-off folders. Read them
  only.
- The released files go into the repository byte for byte.
- No dependency change.
- Each schema change adds an optional field only. This track adds none.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24).
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `apps/math/curriculum/graph/release/` holds the released file, the mapping file,
  `SHA256SUMS`, and `RELEASE.md`, and the SHA-256 test passes.
- AC2: The app reads its graph only from the released file.
- AC3: Teacher reporting shows the CCSS tags of the release, primary first, with the AP
  exception rule and the CCSS notice.
- AC4: The 47 graph data files, the graph-data scripts, and `cross-course-equivalence.ts`
  do not exist. The curriculum module files exist.
- AC5: Each gate passes.

## External Dependencies

- The first release of `math.us-hs` from mastery-advantage. The ID scheme has the
  confirmation target 2026-11-21. The track does not start before the release folder
  exists.
- The PM-approved exception list of the release: a checker from a different model family
  confirms each AP exception, then the PM approves the list. Daniel sees it in the release
  report and can overrule it.

## Out of Scope

- A history rewrite of the repository (Daniel's decision).
- The curriculum module files.
- The Danielson graph domain.
- A change of the graph in mastery-advantage. A wrong node goes to the PM as a report.
