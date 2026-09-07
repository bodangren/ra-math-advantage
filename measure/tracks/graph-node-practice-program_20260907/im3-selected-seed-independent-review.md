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

## Revised patch review

The revised patch was reviewed in an isolated detached worktree. The focused test passes with five tests. Standalone TypeScript also passes in that worktree.

The revision fixes these earlier findings:

- The production `seedLesson1` handler now calls the selected upsert after phase creation.
- Worked now uses the committed `HEAD` source equation `f(x) = x²`.
- The helper checks the lesson slug, unique Phase 4, phase type, source text, and sequence-2 activity section.
- An approved activity rejects changed reviewed content.
- Practice-item lookup now compares variant, activity, and item identities.
- The test database now throws for a non-unique `unique()` query.
- Guided and Independent remain answerless, unreviewed, and SRS-disabled when first inserted.

The revised patch still has integration-blocking defects:

1. `upsertIm3SelectedPilotSeed` does not require `lessonVersion.status === "published"`. A direct caller can link a draft version. It also does not prove that the supplied version is the highest current published version.
2. When a lesson has only draft versions, `seedLesson1` inserts another version with `version: 1`. This can duplicate an existing version number. Compute the next version or reject the ambiguous state.
3. The sequence-2 section check validates only its sequence and type. It does not validate its current component, props, or source identity before replacement. A changed activity section can be overwritten because the neighboring text still matches.
4. Content comparison uses `JSON.stringify` on nested records. Equivalent stored props or grading objects with different key insertion order can be rejected as changed content. Use the existing canonical value normalization before comparison.
5. Changed content is rejected only when approval status is `approved`. A row with another approval state and `srsEligible: true` can receive changed content and preserve `srsEligible: true`. Any changed content must force `srsEligible: false`. Preserve SRS eligibility only for identical content with a valid reviewed policy.
6. The fake branded ID `activities:pending` remains. Split the activity builder from the variant and item builder so no fabricated Convex ID crosses the builder boundary.
7. The five tests do not cover the claimed alternate-version and practice-item conflict cases. They cover missing phase, missing sections, one changed approved activity, normal replay, and the broad seed caller. Add explicit tests for a draft or older lesson version, duplicate version numbers, changed existing activity-section content, reordered equivalent nested props, an unapproved changed row with SRS enabled, and conflicting rows by variant and by activity.

The integration review correctly records a separate remaining dependency: the pending teacher exposure matcher still expects `f(x) = x² + 2x - 3`. The seed patch must not be integrated as a complete three-mode flow until that matcher and its source tests use the resolved `f(x) = x²` authority.

## Second revised patch review

I reviewed the current `/tmp/im3-selected-quadratic-seed-head.patch` in a clean detached worktree at `HEAD` `0ed48684`. The focused seed test passes with five tests. Standalone TypeScript passes. The reported coverage is correct:

- Statements: 97.47% (116/119)
- Branches: 91.95% (80/87)
- Functions: 96.55% (28/29)
- Lines: 97.36% (111/114)

The actual `seedLesson1` handler calls `upsertIm3SelectedPilotSeed` after it creates all lesson phases. The helper selects the highest published lesson version. It rejects a draft supplied version. It rejects duplicate rows at the highest published version number. It also rejects missing or duplicate Phase 4 data and conflicting practice-item mappings. New activity rows remain unreviewed and SRS-disabled. Changed unreviewed content resets SRS eligibility. Changed approved content causes an error.

One integration-blocking content identity defect remains.

`normalizePracticeValue` does not canonicalize object keys. Its object branch returns `JSON.stringify(value)`. The patch passes wrapper objects that contain nested `props` and `gradingConfig` records. Equivalent records with a different key insertion order therefore compare as different. The key-order test does not detect this defect. It reorders an unreviewed row, does not enable SRS, and only checks that the call resolves. The implementation can reset that row and still pass. An approved, semantically identical row with reordered keys will throw `Approved selected IM3 activity content changed`.

Add a regression that approves the row, sets SRS eligibility, reorders keys in both nested records, reruns the seed, and verifies that the approval and SRS policy remain unchanged. Then compare the known reviewed fields with a stable deep-key representation or with explicit field comparisons. Do not add a content hash.

The source identity check also remains incomplete. It accepts any markdown that contains the heading text. It does not compare the complete committed source section. For the original activity branch, it verifies the equation in the section props but verifies only the linked activity component key. It does not verify the linked activity props. A modified paragraph or a linked activity with a different equation can pass and be replaced.

Compare the complete committed Phase 4 source markdown. Also require the linked original activity props to contain the expected `f(x) = x^2` equation before replacement. Add negative tests for a changed paragraph and a changed linked activity equation.

The five test bodies cover inactive builders, public props and rubric part names, selected upsert and replay, the real seed caller with draft-only and duplicate published-version cases, and missing or invalid Phase 4 structure. They cover one variant-side mapping conflict. They do not explicitly cover an activity-side mapping conflict. The implementation queries both indexes and compares both identities, so this is a smaller test gap. Add the symmetric case when this patch changes again.

The patch can proceed after the object-key and source identity defects are fixed. It must still coordinate the separate teacher exposure matcher change from `f(x) = x² + 2x - 3` to the committed `f(x) = x²` source before the full three-mode flow is complete.

## Final revised patch review

I reviewed the regenerated patch in a new detached worktree at `HEAD` `f888bd5c`. The two focused files pass with six tests. This includes five seed tests and one seeded-submission test. Lint passes.

The refreshed seed-only coverage is:

- Statements: 97.58% (121/124)
- Branches: 92.47% (86/93)
- Functions: 96.87% (31/32)
- Lines: 97.43% (114/117)

Standalone TypeScript reports three known HEAD integration errors. Two errors are missing `learningEvidenceFingerprintV1` exports. One error is the missing generated `dist/server/index.js` module. The patch does not add these errors.

The prior content identity blocker is fixed. The private serializer sorts object keys at every object level. It preserves array order and scalar values. The approved replay test now sets an approval record and SRS eligibility before it changes nested key order. It then verifies that both reviewed values remain unchanged.

The source guard now compares the complete committed Phase 4 markdown. It compares the linked original activity props with the raw HEAD Phase 4 props. The negative tests change the source paragraph and the linked activity equation. Both calls fail before any database write. The canonical link also requires the expected component, stable activity ID, node ID, mode, and public props.

The current patch is safe for its clean HEAD source contract. Main has a separate `normalizeSeedProps` change that adds step IDs and descriptions before storage. The raw HEAD original-props comparison will reject that normalized main row. Integration must update the expected original props through the same normalization function, or must compare with the exact normalized stored form. This is a merge reconciliation requirement. It is not a defect in the clean HEAD patch.

The helper selects the unique highest published version. It rejects draft-only state and duplicate highest published versions. It rejects changed approved activity content. It resets SRS eligibility for changed unreviewed content. It checks both practice-item indexes and rejects conflicting identity mappings. The actual lesson seed invokes the helper after phase creation.

No blocking defect remains in this patch against its stated clean HEAD base. The full three-mode production path still requires the separate teacher exposure source matcher to use the resolved `f(x) = x²` authority.

## Main integration collision review

The integrated seed has two writers for Lesson 1.1 Phase 4, sequence 1 and sequence 2.

`upsertIm3SelectedPilotSeed` requires the original `f(x) = x²` source at sequence 1. It links the selected graph activity at sequence 2. Later in the same mutation, `linkIm3DomainRangeWorkedPhase` replaces both sections with `f(x) = x² + 2x - 3` and the domain-range Worked activity. The next seed replay fails the selected source guard. The two helpers cannot both own the same section identity.

The minimum safe repair is to give the domain-range source a separate section pair in Phase 4. Keep the selected source at sequence 1 and sequence 2. Preserve the existing sequence 3 activity. Add the domain-range text and activity at new, fixed sequence values, such as sequence 4 and sequence 5. The domain-range link helper must find or insert its own exact pair. It must not patch sequence 1 or sequence 2.

The domain-range helper must verify these values on replay:

- The text is the complete reviewed `f(x) = x² + 2x - 3` prompt.
- The activity section links the exact `IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID` row.
- The linked row has the domain-range node ID, `worked_example` mode, `graphing-explorer` component, and reviewed props.
- A section at the selected fixed sequence with different content causes an error.
- More than one domain-range source pair causes an error.

This repair preserves both stable activity IDs and both exact node identities. It also preserves the selected replay guard. It does not remove the existing sequence 3 activity or rewrite another phase.

The production teacher candidate check uses `isActivityInPublishedLesson`. It does not require Phase 4 sequence 2. A separate domain-range section therefore keeps the published lesson containment contract. The selected graph teacher flow continues to use its own stable activity ID and exact node.

Add a seed regression that runs the complete `seedLesson1` handler twice. After each run, assert both exact activity IDs occur once in the published lesson. Also assert that the selected source text and link remain unchanged. Assert that the domain-range source and link remain unchanged.

There is a separate trust-boundary issue in the domain-range consumer. `buildIm3StoredEvidence` converts a student-owned domain-range Worked acknowledgement into `origin: "teacher_led"`. The selected graph path correctly requires a teacher attestation. The section mapping repair does not fix this policy defect. Keep domain-range mastery fail-closed until that consumer uses the verified teacher flow or an equivalent existing authorization path.

## Domain-range Worked acknowledgement repair

The domain-range student acknowledgement now returns no learning evidence from `buildIm3StoredEvidence`. A focused regression invokes the real builder with the exact domain-range node, stable activity ID, mode, empty acknowledgement payload, and learner identity. The test failed before the repair because the builder returned `origin: "teacher_led"`. It passes after the repair.

This change does not modify the genuine teacher verification handler. Domain-range Guided and Independent evidence therefore cannot use the student Worked acknowledgement as teacher exposure. A later bounded change must connect the domain-range Worked source to the existing verified teacher candidate and attestation flow before domain-range practice can become mastery-bearing.

## Domain-range section helper review

The revised helper owns Phase 4 sequence 4 and sequence 5. It validates both positions before it inserts either row. It preserves sequence 1, sequence 2, and sequence 3. It rejects occupied or duplicate owned positions. It also rejects another link to the same activity ID. A focused boundary test proves these behaviors and proves replay causes no write.

One blocker remains. The linked activity guard checks only the stable activity ID, node ID, and component key. It does not check `learningEvidenceMode` or the reviewed props. The new boundary test shows that an activity with `guided_practice` mode passes. It also shows that an activity with a different equation passes. These two cases currently fail the test because the helper inserts both source sections.

Compare the linked row with `buildIm3DomainRangeWorkedSeedDocument` before section insertion. Require at least the stable activity ID, node ID, component key, `worked_example` mode, SRS-disabled state, and canonical props. Use the existing stable structural serializer for the props comparison. Keep approval checks in the publication and consumer boundary.

### Domain-range helper fix disposition

The linked activity guard now compares the exact stable activity ID, node ID, component key, `worked_example` mode, SRS-disabled state, canonical props, and canonical grading configuration. The boundary test also rejects an SRS-enabled row and a changed grading configuration.

The helper boundary test, selected seed test, and student acknowledgement trust test pass together. The combined result is 16 passing tests. This helper has no remaining blocker in the reviewed scope.
