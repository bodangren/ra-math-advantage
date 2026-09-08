# IM1 G53 Lesson 10-2 graph independent review

## Verdict

Reject the frozen patch until four bounded defects are corrected.

The canonical node, edge, alignment, placeholder, and count changes otherwise match the accepted G53 scope. The patch adds one draft inactive skill. It removes the eight reviewed false alignments. It clears the three affected blueprint alignment arrays. It removes nine placeholder activities. It preserves the three approved skills and adds no executable mode, generator, approval, readiness claim, or new prerequisite.

## Required corrections

### 1. Record exact prompt evidence for each reused skill

All four touched blueprints include `math.im1.lesson.10.2` in `sourceNodeIds`. The three reused skill nodes do not contain prompt-level Lesson 10-2 source references. Thus, the stored blueprint relation can be read as evidence from the full lesson. It does not encode the accepted exclusions for Problem 49 or the P46-only postulate reuse.

Add an exact DOCX source reference to each reused skill in `nodes.json`, `draft-nodes.json`, and the embedded node arrays in `edges.json` and `standard-edges.json`:

- identify and name: Problems 1–19, 25–31, 35–38, and 43–44;
- draw and label: Problems 20–24, 32–34, 39–42, 45, and 50;
- apply postulates: Problem 46 only.

Keep the existing exact Example mappings. Keep Problem 49 task-local and manual. The new maximum-count node already separates Problem 47 reasoning from the Problem 48 numeric response in its source reference.

Extend the focused test to assert these exact boundaries. A containment-edge rationale alone does not constrain the blueprint source relation.

### 2. Fix the no-prerequisite regression

The focused test searches for edge type `prerequisite`. The projector and canonical graph use `prerequisite_for`. The current assertion is vacuous.

Test `prerequisite_for` edges that target the maximum-count skill. The result must be empty. Also assert an empty `prerequisites` array in its SRS row.

### 3. Correct the derived teacher row

The new maximum-count teacher row stores `prerequisitesMet: false`. The canonical graph has no `prerequisite_for` edge that targets this skill. Current `projectTeacherEvidence` sets `prerequisitesMet` to `true` when the incoming prerequisite list is empty.

Set the new row to the fresh projector result in both `projection/teacher-evidence-map.json` and the embedded teacher projection. Add a regression that compares the affected teacher rows with fresh projector output. Embedded-versus-standalone equality alone preserves the same wrong value in two files.

### 4. Remove unrelated SRS row rewrites

The patch rewrites 15 existing Lesson 7.5 and Lesson 8.1 embedded SRS rows by adding `rendererKey`. These rows are outside G53. Their standalone rows already contain those keys, but the current `projectSrsInputs` contract does not emit `rendererKey`. Do not use G53 to repair this older whole-projection mismatch.

Restore those 15 embedded rows to the base bytes. Test parity only for the four touched skill rows. Record the older full-projection mismatch as separate technical debt.

## Test wording correction

The test named `keeps unrelated transformation alignments` uses Lesson 10.3 and Lesson 12.4 Example edges that this review did not validate as correct transformation evidence. Do not describe those edges as valid transformation alignments. The test can assert only that the two unrelated IDs remain unchanged as a scope guard, or it can be removed in favor of an exact removed-edge set check.

## Confirmed scope

The semantic graph diff has these expected canonical changes:

- one new skill in `nodes.json`, `draft-nodes.json`, and both embedded node catalogs;
- one new blueprint and three bounded blueprint updates;
- two new containment edges;
- eight removed alignment edges;
- nine removed activities, counted by unique `stableActivityId`;
- one new inactive SRS row and one new teacher skill row;
- derived queue, matrix, graph metadata, and rollout-audit counts.

The reported totals are internally consistent after these changes: 1,091 nodes, 2,620 edges, 491 skill records, 490 non-rejected skills, 487 blueprints, 484 generator gaps, 91 empty specification rows, 390 source-only rows, 108 approved skills, 309 activities, and 316 SRS inputs.

The focused, full curriculum, knowledge-space, lint, build, and TypeScript gates passed on the frozen bytes. They do not detect the four defects above.

## Corrected freeze review

Accept.

The corrected 13-path patch resolves all four blocking findings:

- The three reused approved skills now have exact Lesson 10-2 prompt-range source references in all four node catalogs. The postulate reference is limited to Problem 46. Problem 49 remains outside the identify-and-name range.
- The regression checks `prerequisite_for` and checks the maximum-count SRS row's empty prerequisite array.
- The maximum-count teacher row now has `prerequisitesMet: true`. It equals fresh `projectTeacherEvidence` output in both stored teacher projections.
- The 15 unrelated Lesson 7.5 and Lesson 8.1 embedded SRS rewrites are absent. No existing SRS row outside the four touched skills has a semantic change.

The scope-guard test now says only that unrelated alignment rows remain unchanged. It does not claim that those rows are valid transformation evidence.

The final patch preserves the accepted source boundaries, the two maximum-count evidence variants, P46-only postulate reuse, eight alignment removals, three cleared alignment arrays, nine placeholder removals, canonical and projected row order, and the reported derived counts. The parent and author gates pass. No blocking defect remains.
