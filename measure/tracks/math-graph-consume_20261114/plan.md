# Implementation Plan: Consume the mastery-advantage Math Graph

Track: `math-graph-consume_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until these conditions are true:

- `kst-srs-v3-2-im3-runtime-migration_20260710` is complete in `measure/tracks.md`.
- The graph release folder is available. The label follows the pattern of `release-path.md`
  (`^math-us-hs-[0-9]{8}-r[0-9]{2}$`). Use the highest available label.
- The ID scheme is accepted (hand-off folder `graph-math-id-scheme-95aae15`, source commit
  `95aae15`). The four contract files stay read-only and are not copied into the repository.

### Read-Only Rule

Read the input release files from their source location.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<ws>` for `apps/math`, `packages/knowledge-space-core`, `packages/knowledge-space-practice`, and `packages/math-content` |
| Typecheck | `npm run typecheck --workspace=<ws>` for the same workspaces |
| Test | `CI=true npm run test --workspace=<ws>` for the same workspaces |
| Build | `npm run build --workspace=apps/math` |
| E2E | `npm run test:e2e --workspace=apps/math` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

If `vinext-oxc-toolchain_20261114` renamed a gate script, use the new name and record it.
A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Test Rules

- App tests use the mock context helpers in `apps/math/__tests__/convex/_helpers/`.
- Tests resolve paths from the test file, never from `process.cwd()`.
- A test that needs a small graph uses a fixture, not the released file. Only the release
  tests read the released file.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Ingest the first release
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the release
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Release, Mapping Format, Code Form, Validation, Readers, Literals, Kept Files, Dropped Entries, Scripts, Removal.
    - [ ] Run each gate on the start commit. Record each result and each test count under "Baseline".
    - [ ] Under "Release", record the hand-off folder, the label, each of the six files, its size, its SHA-256 value from `MANIFEST.txt`, and the source commit, the date, and the sender of `MANIFEST.txt`. Record any extra file (spec G1).
    - [ ] Record the format of `id-map.json` under "Mapping Format" (spec G4): the statuses, the seed prefix of the keys, the count of `removed` entries (each names a generator or a renderer seed node, including the draft-only IDs), and the 4 container keys with their course nodes (`math.us-hs.course.im1`, `.im2`, `.im3`, `.ap-precalc`). If the release differs from the spec G4 (the example of `id-map-format.md` that maps `math.im1` to the domain is stale), stop and record the mismatch.
    - [ ] Record the form of `metadata.code` of the released CCSS standard nodes under "Code Form" (spec G6), with the form of `metadata.ccssPlus` and of the standard node IDs.
    - [ ] Record under "Validation" the alignment-required kinds of the M2 check, the form of `metadata.legacyGeneratorIds`, and how the release links an exception node to an AP-only standard (spec G3, G11).
    - [ ] Write the contract of `scripts/graph/ingest-release.ts <folder>` (spec G1 to G4): its checks, its output files, and its exit codes.
    - [ ] Commit: `measure(math-graph-consume): record the S1 contract`.
- [ ] Task: S1 Test (Red) — specify the ingestion
    - [ ] `scripts/__tests__/graph/ingest-release.test.ts`: with a fixture hand-off folder of six files, the script copies the six files byte for byte. It writes no other file.
    - [ ] Also: a changed byte stops the script with the SHA-256 error, and the output folder stays unchanged. A missing file and a label that does not match the pattern stop the script too.
    - [ ] Also: a `generator` node, a `renderer` node, an `equivalent_to` edge, a learnable node with no CCSS link and no exception entry, and a node with two primary links each fail the validation with the node ID.
    - [ ] Also: a node that needs a generator and has neither a `generated_by` edge nor a `generator` entry fails with `MATH_M1_MISSING_GENERATOR`. A node of an alignment-required kind with neither an alignment edge nor an `alignment` entry fails with `MATH_M2_MISSING_ALIGNMENT`. A `generator` entry does not satisfy the M2 check.
    - [ ] Also: a seed node ID with no entry in `id-map.json`, a key that names no seed node ID, an unknown status, a `removed` entry with a `newId`, and a `newId` that is not a node of the release each fail with the entry key.
    - [ ] `apps/math/__tests__/curriculum/graph-release.test.ts`: each SHA-256 of `MANIFEST.txt` matches its file. The checks of G3 that read only the release files pass on the files in the repository.
    - [ ] Run the scripts suite and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(graph): specify the release ingestion`.
- [ ] Task: S1 Implement — the ingestion script
    - [ ] Write `scripts/graph/ingest-release.ts` with the checks of spec G1, G3, and G4. Use the validation of `packages/knowledge-space-core/src/validation.ts`. The script copies the six files byte for byte.
    - [ ] Commit: `feat(graph): add the release ingestion script`.
- [ ] Task: S1 Ingest — take the release into the repository
    - [ ] Run `npx tsx scripts/graph/ingest-release.ts <hand-off folder>`. Record the output under "Validation".
    - [ ] If the SHA-256 check or the validation fails, stop and record the mismatch. Copy nothing.
    - [ ] Commit: `feat(math): add the math.us-hs graph release <label>`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(math-graph-consume): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Ingest the first release' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Ingest the first release' as complete`.

## Phase S2: The app reads the released graph
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — list the readers and the old IDs
    - [ ] Run `git grep -l -E "skill-graph/|standards_inventory|cross-course-edges|GRAPH_SOURCES" -- apps/math packages scripts ':!*.json' ':!*.md'`. Record each reader under "Readers" with its new form (spec G5).
    - [ ] Run `git grep -n -E "math\.(im1|im2|im3|precalc)\." -- apps/math packages ':!*.json'` and the bare form `git grep -n -E "['\"]math\.(im1|im2|im3|precalc)['\"]" -- apps/math packages ':!*.json'`. Record each literal under "Literals" with its target (spec G9): a mapping target, a runtime binding key (a literal with a `removed` entry, or a fixture that drops it), or the domain `math.us-hs` (a `domain` field value). A literal that stays (for example a mapping test) gets a reason. `apps/integrated-math-3/lib/transfer-credit/` is out of scope.
    - [ ] Record the course node ID of each course for `graphCourseNodeId` (spec G5). Take it from the mapping of the container (`math.im1`) or of the seed course node (`math.im1.course.im1`), and check it against `math.us-hs.course.<course>` with `<course>` one of `im1`, `im2`, `im3`, `ap-precalc` (the app key `precalc` maps to `ap-precalc`). No `graphCourseNodeId` is the domain.
    - [ ] Record the exact edge types and directions of the release for `courseView`: course to module, module to lesson, lesson to its home skill, and lesson to a referenced skill (`appears_in_context`). Record the exact edge types for worked examples and concepts of a lesson.
    - [ ] Record each reader of `generated_by` and `rendered_by` edges in `apps/math`, and the contract of `apps/math/lib/curriculum/runtime-bindings.ts` (spec G7): the generator keys from `metadata.legacyGeneratorIds` and the old `generated_by` edges, and the source of the renderer keys (the old `rendered_by` edges with the `id-map.json` mapping, or the legacy renderer IDs if the release carries them).
    - [ ] Run `git grep -n "equivalent_to" -- apps/math packages ':!*.json' ':!*.md'`. Record each reader of `equivalent_to` edges with its path and line (spec G13). Record that `teacher-evidence.ts` and `srs.ts` stay unchanged. The release has no `equivalent_to` edge.
    - [ ] Record the contract of `scripts/graph/rekey-node-ids.ts` and the kept files that it changes under "Kept Files" (spec G8).
    - [ ] Record the contract of `migrateGraphNodeIds` in `apps/math/convex/graph/migrate.ts` (spec G10): the handling of each status (`mapped`, `merged`, `removed`) and the container keys. Edge IDs of the release are opaque keys.
    - [ ] If the "Code Form" needs a new form in `canonicalCcssCode`, record it. If two released codes give one canonical code, or a competency has no released standard node, stop and record the mismatch (spec G6).
    - [ ] Commit: `measure(math-graph-consume): record the S2 contract`.
- [ ] Task: S2 Test (Red) — specify the switch
    - [ ] `apps/math/__tests__/lib/curriculum/skill-graph-loader.test.ts`: `loadMathGraph()` returns the nodes of the released file. The module exports no `GRAPH_SOURCES`.
    - [ ] Also: `courseView` of each registry course returns the nodes that its course node reaches: modules, lessons, the skills that a lesson homes, and the skills that a lesson references with `appears_in_context`. No `graphCourseNodeId` is the domain `math.us-hs`. `objectiveNodeIds` finds the released standard nodes of a canonical code.
    - [ ] `apps/math/__tests__/lib/courses/ccss.test.ts`: the released code form gives the canonical code (if the S2 Contract records a new form).
    - [ ] `apps/math/__tests__/lib/curriculum/runtime-bindings.test.ts`: each of the 4 IM3 generator IDs and the 5 IM3 renderer IDs that the runtime uses has a binding key, and each binding target names a node of the release. A draft-only ID has no binding.
    - [ ] `scripts/__tests__/graph/rekey-node-ids.test.ts`: with a fixture mapping, two entries that map to one node keep the entry of the lowest course `sequence`, and the script lists the dropped entry. An entry whose node has a `removed` entry drops, and the script lists it.
    - [ ] `apps/math/__tests__/convex/graph/migrate.test.ts`: two placement rows of one student that map to one node leave the newest row. A row with a `removed` entry is deleted. The calibration rows go away.
    - [ ] `apps/math/__tests__/convex/student/knowledge-state.test.ts`: evidence on a skill that IM1 and IM2 share appears in the IM2 state.
    - [ ] Run the app suite and the scripts suite. Confirm that the new cases fail.
    - [ ] Commit: `test(math): specify the switch to the released graph`.
- [ ] Task: S2 Implement — the loader and the readers
    - [ ] Change `loadMathGraph()` to read the released file. Remove `GRAPH_SOURCES`.
    - [ ] Change each registry `graphCourseNodeId` to its course node ID of the S2 Contract.
    - [ ] Change each reader of "Readers" to its new form. Add the code form to `canonicalCcssCode` if the S2 Contract records one.
    - [ ] Write `apps/math/lib/curriculum/runtime-bindings.ts`. Change each reader of `generated_by` and `rendered_by` edges to read it.
    - [ ] Change each literal of "Literals" to its target of the S2 Contract: its mapping target, its runtime binding key (or drop the fixture), or the domain `math.us-hs` for a `domain` field value.
    - [ ] Commit: `feat(math): read the released math graph`.
- [ ] Task: S2 Implement — the kept files and the stored IDs
    - [ ] Write `scripts/graph/rekey-node-ids.ts`. Run it on the kept files of "Kept Files". Record each dropped entry under "Dropped Entries".
    - [ ] Run the projection builder on the released graph and the re-keyed blueprints. Commit the regenerated projection files.
    - [ ] Write `apps/math/convex/graph/migrate.ts` with `migrateGraphNodeIds`. Run it on the dev deployment. Record the counts.
    - [ ] Commit: `feat(math): re-key the authoring files and the stored node IDs`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run the two literal `git grep` commands of the S2 Contract again (the form with the trailing dot and the bare form). Confirm that only the matches with a reason remain.
    - [ ] Run `git grep -n "equivalence-candidates" -- apps/math packages ':!*.json'`. Confirm that no runtime code reads the file.
    - [ ] Run the projection builder on the released graph. Confirm that the output has no equivalence component with more than one node (spec G13).
    - [ ] Commit: `measure(math-graph-consume): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: The app reads the released graph' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: The app reads the released graph' as complete`.

## Phase S3: CCSS tags in teacher reporting
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — define the tags
    - [ ] Write the contract of `ccssTags(graph, nodeId)` in `apps/math/lib/curriculum/standards.ts`: the CCSS codes of the node, primary first, or the AP CED code of an exception node (spec G11).
    - [ ] Run `git grep -l -E "competency|standardCode|ccss" -- apps/math/app/teacher apps/math/components/teacher`. Record each teacher page and component that shows a standard code or standard text.
    - [ ] Record that the CCSS copyright notice text comes from `ccss-notice.txt` of the release, the way that the app loads it, and the place of the notice on each page that shows CCSS standard text.
    - [ ] Record that the exception list is `standards-exceptions.json` of the release (spec G11).
    - [ ] Commit: `measure(math-graph-consume): record the S3 contract`.
- [ ] Task: S3 Test (Red) — specify the tags
    - [ ] `apps/math/__tests__/lib/curriculum/standards.test.ts`: a node with a primary and a secondary link gives the primary code first. An exception node gives its AP CED code only.
    - [ ] `apps/math/__tests__/components/teacher/standard-tags.test.tsx`: each page of the S3 Contract shows the tags in that order. A page with CCSS standard text shows the notice. No page shows College Board text.
    - [ ] Run the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(math): specify the CCSS tags in teacher reporting`.
- [ ] Task: S3 Implement — the tags and the notice
    - [ ] Write `apps/math/lib/curriculum/standards.ts`. Change each page and component of the S3 Contract to show the tags and the notice.
    - [ ] Change the section "Global Competency Standard Codes" of `measure/product.md`: the codes come from the released graph, primary first, with the AP exception rule.
    - [ ] Commit: `feat(math): show the CCSS tags of the released graph`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(math-graph-consume): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: CCSS tags in teacher reporting' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: CCSS tags in teacher reporting' as complete`.

## Phase S4: Remove the old graph data
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — list the removals
    - [ ] Run `git ls-files | grep -E "(^|/)(nodes|edges|standard-edges|draft-nodes|edge-review-queue|standards-review-queue|unit-4-source-gap-queue|cross-course-edges|standards_inventory)\.json$"`. Record each file under "Removal". Expect 47 files.
    - [ ] For each `standards_inventory.json`, record if a seed reads it. If a seed reads it, record the change of the seed to read the released file.
    - [ ] Under "Scripts", give each script of the spec "Current System" its class (spec G12). Also record each `package.json` script that runs a deleted script.
    - [ ] Record `cross-course-equivalence.ts`, its exports in `packages/knowledge-space-core/src/index.ts`, and its test.
    - [ ] Give `packages/knowledge-space-core/src/edge-suggestions.ts` its class: it writes graph data (delete), or it does not (keep). The edge type `equivalent_to` stays in `schemas.ts` and `types.ts` (spec G13).
    - [ ] Record the count of files under `apps/math/curriculum/*/modules/`.
    - [ ] Commit: `measure(math-graph-consume): record the S4 contract`.
- [ ] Task: S4 Test (Red) — specify the removal
    - [ ] Create `scripts/__tests__/graph-data-removed.test.ts`. It expects that no file of "Removal" exists and that `packages/knowledge-space-core/src/cross-course-equivalence.ts` does not exist.
    - [ ] Also: no file under `scripts/` names a removed file. The count of curriculum module files equals the S4 Contract count.
    - [ ] Run the scripts suite. Confirm that the new cases fail.
    - [ ] Commit: `test(scripts): specify the removal of the old graph data`.
- [ ] Task: S4 Implement — remove the old graph data and tooling
    - [ ] Change each seed that reads a `standards_inventory.json` to read the released file, as the S4 Contract records.
    - [ ] Run `git rm` for each file of "Removal" and for each script of the class "delete". Remove their `package.json` scripts.
    - [ ] Remove `cross-course-equivalence.ts`, its exports, and its test.
    - [ ] Commit: `chore(math): remove the graph data that the release replaces`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(math-graph-consume): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Remove the old graph data' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Remove the old graph data' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
    - [ ] Record the production migration in the closeout. After the next prod deploy of the math app, run `npx convex run graph/migrate:migrateGraphNodeIds --prod` one time (spec G10).
