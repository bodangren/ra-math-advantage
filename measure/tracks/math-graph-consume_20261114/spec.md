# Track: Consume the mastery-advantage Math Graph

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: `kst-v32-runtime_20261114` (closed); the first release of the merged math
graph in the hand-off folder (see "External Dependencies")

## Overview

The private repository mastery-advantage (`github.com/Reading-Advantage-Thailand/
mastery-advantage`) becomes the source of the math skill graph. It releases one merged
domain for IM1, IM2, IM3, and AP Precalculus ("IM1 to Precalc", Daniel, 2026-11-14), with
the name `math.us-hs`. A release is the six fixed files of the release path contract: the
graph, `id-map.json`, `equivalence-candidates.json`, `ccss-notice.txt`,
`standards-exceptions.json`, and `MANIFEST.txt`. The label of a release follows the pattern
`^math-us-hs-[0-9]{8}-r[0-9]{2}$`. The mapping file `id-map.json` maps each old node ID of
this repository to a node ID of the release (many to one) or marks it removed.

The ID scheme, the mapping format, the validator, and the release path are contracts of the
Graph session. The PM accepted them, and the Math orchestrator accepted the scheme on
2026-11-15 (hand-off folder `graph-math-id-scheme-95aae15`, source commit `95aae15` of
mastery-advantage). This track follows these contracts.

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
  registry field `graphCourseNodeId` (for example `math.im3`, an old course
  container; the mapping sends it to the domain `math.us-hs`, so G5 changes the field to a
  course node). `objectiveNodeIds(graph,
  objectiveId)` finds the `standard` nodes whose `canonicalCcssCode(metadata.code)` equals
  the objective ID (`math-app-base_20261114` D6a).
- **Other readers:** some files read the graph files directly, not through the loader. On
  `0bf1900a` they include `convex/student.ts`, `convex/student/knowledge-state.ts`,
  `convex/parent/visualization.ts`, `lib/practice/misconception-taxonomy.ts`,
  `lib/practice/misconception-remediations.ts`,
  `packages/math-content/src/knowledge-space/generators/algebra-generators-adapters.ts`, and
  many tests.
- **Course from the node domain:** `packages/knowledge-space-practice/src/projections/
  teacher-evidence.ts` line 169 derives a course from `node.domain` (or from the first two
  ID segments). In the release each node has the domain `math.us-hs`, so this rule gives one
  value for all nodes.
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
  release folder exists yet. The folder `graph-math-id-scheme-95aae15` holds the four
  accepted contracts (`id-scheme.md`, `id-map-format.md`, `validator.md`, `release-path.md`)
  and a `MANIFEST.txt` with their SHA-256 values.

## Decisions (defaults of 2026-11-14; amended 2026-11-15 from the A-58 contracts)

The contracts are `id-scheme.md`, `id-map-format.md`, `validator.md`, and `release-path.md`
in the hand-off folder `graph-math-id-scheme-95aae15` (source commit `95aae15` of
mastery-advantage). The repository holds no copy of them.

- **G1 Hand-off and check:** the release arrives in
  `/home/daniebo/Desktop/handoff/a58-math-graph-release-us-hs-<label>/`. The `<label>` follows
  the label pattern of `release-path.md` (`^math-us-hs-[0-9]{8}-r[0-9]{2}$`). A changed
  release has a new label (`r02` and so on) in a new folder. The track uses the folder with
  the highest label.
  - The folder holds the six fixed files of the release: `math-us-hs-knowledge-space.json`
    (the graph), `id-map.json`, `equivalence-candidates.json`, `ccss-notice.txt`,
    `standards-exceptions.json`, and `MANIFEST.txt`. A missing file stops the track. The
    track records an extra file in the evidence and does not copy it.
  - `MANIFEST.txt` gives the SHA-256 of each file, the source commit, the date, and the
    sender. The track checks each SHA-256 of `MANIFEST.txt` before use. A mismatch stops the
    track, and the track reports it to the PM.
  - The track also checks that the label of the folder matches the pattern and equals
    `metadata.schemaVersion` of the domain node.
  - After the check, the track sends one line to the PM orchestrator and to the sender
    session: the folder, the six file names, and "SHA-256 verified".
- **G2 Files in the repository:** the six files go into `apps/math/curriculum/graph/release/`
  byte for byte (Daniel confirmed, 2026-11-14; no license gate). All six are public-bound
  files of the release path contract.
  - `MANIFEST.txt` is the checksum file. The folder gets no `SHA256SUMS` and no `RELEASE.md`:
    `MANIFEST.txt` already holds the SHA-256 values, the source commit, the date, and the
    sender, and the label is in `metadata.schemaVersion`.
  - The test `apps/math/__tests__/curriculum/graph-release.test.ts` checks each SHA-256 of
    `MANIFEST.txt`.
  - The loader reads only the graph file. No runtime code reads
    `equivalence-candidates.json`. The runtime treats a skill that two courses teach as one
    node (`equivalent_to` is identity), and the release graph holds no `equivalent_to` edge.
  - A new release replaces the six files in one commit.
- **G3 Validation at ingestion:** the script `scripts/graph/ingest-release.ts <folder>`
  checks the SHA-256 values, validates the graph and the mapping, and copies the files (§15.3
  rule 4: validation at ingestion time). The Graph validator runs in the private repository,
  and this track does not run it. The ingestion check repeats the rules that Math needs:
  - The structural and content checks of `packages/knowledge-space-core/src/validation.ts`.
  - No `generator` node, no `renderer` node, and no `equivalent_to` edge.
  - Check M1: a node with `independentPracticeReady === true`, no `generated_by` edge from
    itself, and no `generator` entry in its `exceptions[]` fails with
    `MATH_M1_MISSING_GENERATOR`. A node with a `generator` entry must have an array in
    `metadata.legacyGeneratorIds`. The check reads the flag, the edge sources, and the entry
    types only.
  - Check M2: a node of an alignment-required kind (the S1 Contract records the kinds of the
    contract) with no `aligned_to_standard` edge from itself and no `alignment` entry in its
    `exceptions[]` fails with `MATH_M2_MISSING_ALIGNMENT`. A `generator` entry does not
    satisfy it.
  - Each learnable node (`skill`, `concept`, `worked_example`) has at least one
    `aligned_to_standard` edge to a CCSS `standard` node, with one primary. Or the node is on
    the approved exception list, which is `standards-exceptions.json` (the shape of the
    `exceptions` array: each entry has a `nodeId`).
  - The mapping checks of G4.
  - The validation test runs the checks that read only the release files on the files in the
    repository. The checks against the seed files run in the ingestion script only, because
    S4 removes the seed files.
- **G4 Mapping file format:** `id-map.json` follows `id-map-format.md`.
  - The file has the object `entries`. Each key is a seed node ID with the seed prefix kept
    (a `math.precalc.*` seed ID stays `math.precalc.*`). Each entry has a status: `mapped`,
    `merged`, or `removed`. A `mapped` or `merged` entry has `newId`. A `removed` entry has
    no `newId`.
  - The 9 removed entries are the 4 IM3 generator nodes and the 5 IM3 renderer nodes. The 4
    old course containers `math.im1`, `math.im2`, `math.im3`, and `math.precalc` each have
    their own entry (G5, G10).
  - The ingestion check: each seed node ID of the 47 files has an entry, each key names a
    seed node ID, each status is one of the three, each `newId` names a node of the release,
    and each `removed` entry names a generator node or a renderer node.
  - If the `id-map.json` of the release differs from `id-map-format.md`, stop and report to
    the PM.
- **G5 Graph source:** `GRAPH_SOURCES` goes away. `loadMathGraph()` reads the released graph
  file only. `courseView` and `objectiveNodeIds` keep their contracts, with the course node
  below.
  - Each registry `graphCourseNodeId` changes to the course node of the release. The old
    value is a container: the mapping sends `math.im1` to the domain `math.us-hs`, not to a
    course node. The value comes from the mapping of the seed course node of each course
    (for example `math.im1.course.im1` to `math.us-hs.course.im1`). The S2 Contract checks
    it against row 2 of `id-scheme.md`: `math.us-hs.course.<course>`, with `<course>` one of
    `im1`, `im2`, `im3`, and `ap-precalc`. The app course key `precalc` maps to `ap-precalc`.
  - `courseView(graph, courseKey)` returns the nodes that the course container reaches:
    course to module to lesson (`contains` edges), each skill that a lesson homes, and each
    skill that a lesson references with an `appears_in_context` edge. A skill has one home
    lesson, and other lessons reference it. The S2 Contract records the exact edge types and
    directions from the release.
  - `teacher-evidence.ts` line 169 changes. It takes the course of a node from course
    membership through `courseView`, not from `node.domain`.
  - Each direct reader of a graph file changes to `loadMathGraph()`.
- **G6 CCSS codes:** objective IDs stay canonical CCSS codes. Standard node IDs follow rows
  8 and 9 of `id-scheme.md` and its code-id normalization. `objectiveNodeIds` applies
  `canonicalCcssCode` to the `metadata.code` of each released standard node, and
  `metadata.code` holds the exact official code. `metadata.ccssPlus` marks a (+) standard.
  The S1 Contract records the code form of the release.
  - If `canonicalCcssCode` does not give one canonical code for each released CCSS code,
    `canonicalCcssCode` gets the extra form, with a test.
  - If two released codes give one canonical code, or a competency code has no released
    standard node, stop and report to the PM.
  - No stored code changes.
- **G7 Runtime bindings:** the release has no generator node and no renderer node. Each of
  the 9 seed nodes has a `removed` entry (G4). The 9 nodes and their edges become app code in
  `apps/math/lib/curriculum/runtime-bindings.ts`. It maps each release node that needs a
  generator or a renderer to its key. Each reader of `generated_by` or `rendered_by` edges in
  `apps/math` reads the bindings. The node kinds stay in `packages/knowledge-space-core`,
  because v3.2 §3.1 defines them.
  - Generators: each release node with a `generator` entry in `exceptions[]` maps to its
    generator key. The key comes from `metadata.legacyGeneratorIds` and from the old
    `generated_by` edges of the seed files.
  - Renderers: the contracts name legacy IDs for generators only. The default: the renderer
    bindings come from the old `rendered_by` edges of the seed files. The `id-map.json` maps
    the source node of each old edge to a release node, and the `removed` renderer node gives
    the renderer key. If the release carries legacy renderer IDs, they replace this default.
    The S2 Contract records the source that it uses.
- **G8 Kept authoring files:** the script `scripts/graph/rekey-node-ids.ts` applies the
  mapping file to `blueprints.json` and the three gap queues.
  - When two entries map to one node, the entry of the course with the lowest registry
    `sequence` stays. The evidence file lists each dropped entry. A second node that the
    release keeps (the duplicate slug of the two completing-the-square skills) has its own
    `id-map.json` entry, so this rule and the rule of G10 need no change for it.
  - The projection files are regenerated outputs (v3.2 §9): the projection builder runs
    again on the released graph and the re-keyed blueprints.
- **G9 Node IDs in code:** each node ID literal of the old scheme in `apps/math` and in
  `packages/` (code and tests, not data) changes to its mapping target. The S2 Contract
  lists each literal with `git grep -n -E "math\.(im1|im2|im3|precalc)\."`.
- **G10 Stored node IDs:** the one-off internal mutation `migrateGraphNodeIds` in
  `apps/math/convex/graph/migrate.ts` re-keys `placement_results.nodeId` with the mapping.
  When two rows of one student map to one node, the newest row stays. A row with a `removed`
  entry has no target: the mutation deletes it and counts it. The mutation deletes the rows
  of `edge_calibration` and `calibration_review_queue`, then `refreshCalibrationReviewQueue`
  recomputes them. The edge IDs of the release follow the edge ID rule of the contract
  (`math.us-hs.edge.` and 16 hex characters of the SHA-256 of `type|sourceId|targetId`), and
  Math reads them as opaque keys. A kept second node of the duplicate slug has its own entry
  (G8). The track runs the mutation on the dev deployment.
  The prod deploy of the release rule (`prod-deploy-pipeline_20261114` D11) comes after the
  closeout. Right after that deploy, the orchestrator runs
  `npx convex run graph/migrate:migrateGraphNodeIds --prod` one time. The closeout report
  to the PM names this step.
- **G11 CCSS tags in reporting:** teacher reporting shows the CCSS code of each node from
  the released graph, primary first. A node on the exception list of
  `standards-exceptions.json` shows its AP CED code only. The app shows no College Board
  text.
  - Each page that shows CCSS standard text also shows the CCSS copyright notice. The text
    of the notice comes from `ccss-notice.txt` of the release. The S3 Contract records the
    pages and the way that the app loads the text.
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
- Given the hand-off folder, When `scripts/graph/ingest-release.ts` runs, Then it checks each SHA-256 of `MANIFEST.txt`, validates the graph and the mapping by G3 and G4, and copies the six files to `apps/math/curriculum/graph/release/` byte for byte.
- Given a changed byte in a hand-off file, When the script runs, Then it stops with the SHA-256 error and copies nothing.
- Given a learnable node with no CCSS link that is not on the exception list, When the validation runs, Then it fails and names the node.
- Given a node that needs a generator and has neither a `generated_by` edge nor a `generator` entry, or a node of an alignment-required kind with neither an alignment edge nor an `alignment` entry, When the validation runs, Then it fails with the M1 or the M2 code and names the node.
- Given an `id-map.json` with a seed node ID that has no entry, an unknown status, or a `newId` that is not a node of the release, When the validation runs, Then it fails and names the entry.
- Given the repository after S1, When `graph-release.test.ts` runs, Then each SHA-256 of `MANIFEST.txt` matches.
- Given the check, When it passes, Then the PM orchestrator and the sender session get the one-line notice of G1.

**Estimate:** M
**Priority:** Must

### Story S2: The app reads the released graph
**As a** student or a teacher
**I want** the app to use the one merged graph
**So that** a skill that two courses teach has one state and one record

**Acceptance Criteria:**
- Given `loadMathGraph()`, When it runs, Then it reads only the released file, and `GRAPH_SOURCES` does not exist.
- Given each registry course, When `courseView` runs, Then it returns the nodes that the course node of the release reaches: its modules, its lessons, each skill that a lesson homes, and each skill that a lesson references with `appears_in_context`.
- Given the registry, When S2 is complete, Then each `graphCourseNodeId` is a course node of the release (`math.us-hs.course.<course>`) and no `graphCourseNodeId` is the domain.
- Given `teacher-evidence.ts`, When it takes the course of a node, Then it uses course membership through `courseView` and not `node.domain`.
- Given `git grep -n "equivalence-candidates" -- apps/math packages ':!*.json'`, When S2 is complete, Then it finds no reader.
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

- AC1: `apps/math/curriculum/graph/release/` holds the six files of the release, and the
  SHA-256 test of `MANIFEST.txt` passes.
- AC2: The app reads its graph only from the released file.
- AC3: Teacher reporting shows the CCSS tags of the release, primary first, with the AP
  exception rule and the CCSS notice.
- AC4: The 47 graph data files, the graph-data scripts, and `cross-course-equivalence.ts`
  do not exist. The curriculum module files exist.
- AC5: Each gate passes.

## External Dependencies

- The first release of `math.us-hs` from mastery-advantage. The ID scheme is accepted
  (2026-11-15, hand-off `graph-math-id-scheme-95aae15` at `95aae15`). The track still waits
  for the first release folder and does not start before the folder exists.
- The PM-approved exception list of the release: a checker from a different model family
  confirms each AP exception, then the PM approves the list. Daniel sees it in the release
  report and can overrule it.

## Out of Scope

- A history rewrite of the repository (Daniel's decision).
- The curriculum module files.
- The Danielson graph domain.
- A change of the graph in mastery-advantage. A wrong node goes to the PM as a report.
