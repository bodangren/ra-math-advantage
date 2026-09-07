# IM3 selected quadratic seed independent review

Date: 2026-09-07

## Scope

This review compares `/tmp/im3-selected-quadratic-seed-head.patch` with the committed `HEAD` seed consumer, schema, server grader, and Lesson 1.1 source. It does not apply the patch. It does not approve an activity. It does not access or change a Convex deployment.

The findings block integration of this patch. They do not describe a live production incident.

## Findings

### 1. The seed helper has no production caller

The patch exports `upsertIm3SelectedPilotSeed`. The committed `seedLesson1` mutation does not call it. The patch therefore cannot create or link the three selected activities through the normal seed command.

Place the call after the phase creation loop and before the mutation returns. At that point, Phase 4 and its sections must exist. Pass the exact current published Lesson 1.1 version.

The committed mutation selects a lesson version with `by_lesson.first()`. This selection is not sufficient when the lesson has more than one version. Resolve the current published version or reject a version that is not the exact published Lesson 1.1 version before the selected seed call.

### 2. The Worked source authority is unresolved

Committed `HEAD` defines Phase 4 as “Graph `f(x) = x²` Using a Table.” Its source text and activity both use `f(x) = x²`.

The patch creates a Worked activity for `f(x) = x² + 2x - 3`. The current main working tree also has selected activity and teacher checks for this equation. The parent verified that main still uses `f(x) = x²` in the Phase 4 source text. Thus the mismatch also exists within main. Align the selected seed and later teacher check with the existing Phase 4 example. Preserve unrelated lesson changes.

Do not replace either equation blindly. Resolve which reviewed curriculum source is authoritative. Then make the phase text, stored activity, graph source mapping, and tests use that same equation. Record the source reference in the integration review.

The link operation must verify the lesson, current published lesson version, phase number, phase type `worked_example`, and expected source section. A lookup by Phase 4 and sequence 2 alone can replace an unrelated or revised section.

### 3. Changed content inherits an old approval

`upsertSelectedActivity` replaces the stored props and grading configuration. It then preserves the old activity approval and SRS eligibility without checking whether the reviewed content is unchanged.

This can transfer an approval to a different equation, case, rubric, or renderer payload under the same stable ID. An identical replay can preserve the review state. A content change must reset the activity to `approval.status = "unreviewed"` and `srsEligible = false`, or it must reject the update and use the existing revision process.

Add tests for both cases:

- An identical seed replay preserves the reviewed policy.
- A changed seed payload cannot retain approval or SRS eligibility.

### 4. Practice-item conflicts can be overwritten

`upsertSelectedPracticeDocuments` queries only `by_variantKey`. It patches the first matching row without verifying its stored activity ID and practice item ID. A conflicting mapping can be reassigned silently.

Query the rows by both variant key and activity ID. Deduplicate them by document ID. Require zero rows or one exact row. Reject a row with a different activity ID, variant key, or practice item ID.

The test database must model Convex `unique()` correctly. It must throw when more than one row matches. Returning the first row hides duplicate data.

### 5. Publication parameters do not control the result

The patch accepts `_publication` and reads `CURRENT_IM3_PILOT_PUBLICATION`. The builders do not use those values. Every new physical activity starts as unreviewed and SRS-disabled.

The inactive default is correct. Remove the unused publication parameter and imports because they imply a publication decision that the builder does not make. Curriculum publication must not approve a physical activity.

The temporary value `activities:pending` exists only to build the activity before its Convex ID exists. Split the activity builder from the variant and item builder. This removes the fake branded ID from the type boundary.

### 6. Guided and Independent public props are answerless

This part is correct. Generator seed 1 for Guided and seed 0 for Independent expose the equation, graph variant, response variant, domain, and range. They do not expose `expectedAnswer`, `table_values`, or `placed_points`.

The rubric part IDs are `table_values` and `placed_points`. This order matches the committed private grader. The stable IDs also distinguish Guided and Independent modes.

### 7. The complete three-mode path is not proved

The patch creates one Worked activity and two generated practice activities. It creates two practice variants and two practice-item mappings. It links the Worked row to a lesson section.

The patch does not prove that the production student acknowledgement writer, teacher attestation path, queue, renderer, and server submission handler consume these exact rows. Add one integration test that starts with the production seed mutation. Continue through Worked acknowledgement, verified teacher attestation, Guided or Independent queue selection, and private server grading.

Use hypothetical approved activity fixtures only in the test. Keep the production seed rows unreviewed and SRS-disabled.

## Recommended integration order

1. Resolve the authoritative Worked source equation.
2. Make changed content invalidate prior review state.
3. Add strict practice-item conflict checks.
4. Select the exact current published lesson version.
5. Call the selected seed helper after all lesson phases exist.
6. Add the production seed-to-submission integration test.

Do not deploy or approve the selected activities as part of this patch.
