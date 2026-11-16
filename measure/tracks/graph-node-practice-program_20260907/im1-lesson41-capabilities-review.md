# IM1 Lesson 4.1 Capability Source Review

Date: 2026-09-07

## Source decision

Objective 4a owns graph construction. The existing skill keeps its stable identifier:

`math.im1.skill.4.1.graph-linear-equations-by-making-a-table-of-values-and-by-fi`

Examples 1 and 2 teach this capability. The blueprint now cites both existing example nodes.

Objective 4b contains two different capabilities. The source assesses them separately:

- Interpret intercepts in a real-world context.
- Rewrite a linear equation in an equivalent form to identify intercepts or slope.

The implementation adds these draft skill identifiers:

- `math.im1.skill.4.1.interpret-intercepts-in-the-context-of-real-world-situations`
- `math.im1.skill.4.1.rewrite-linear-equations-in-equivalent-forms-to-identify-int`

The identifiers match the current assembler truncation rule.

## Example mapping

The contextual interpretation skill cites `math.im1.example.4.1.004`. Source Example 3 finds and interprets both intercepts in the lunch-account and shipping contexts.

The equivalent-form skill cites `math.im1.example.4.1.001` and `math.im1.example.4.1.002`. Source Example 1 tells the student to rewrite equations when needed before table construction. Source Example 2 teaches intercept calculation across equation forms and tells the student to rearrange an equation when needed.

## Runtime boundary

Both new nodes have `reviewStatus: draft` and `independentPracticeReady: false`. Their blueprints contain source identity only. They have no renderer, generator, mode specifications, grading rules, readiness claim, standard alignment, prerequisite, or equivalence edge.

Each new skill has one draft `contains` edge from `math.im1.lesson.4.1`. No other edge references either new identifier.

The canonical, draft, and edge-embedded copies are equal for both new nodes. The implementation preserves all legacy skill identifiers.

## Verification

The red phase failed because the graph blueprint had no source examples and both atomic skills were absent.

The green phase passed these tests:

- `lesson-4-1-capabilities.test.ts`: 2 tests.
- `lesson-4-1-example-identity.test.ts`: 2 tests.

The IM1 lint command passed. Standalone TypeScript passed.

This note records the author source review. An independent reviewer must still assess the mapping and scope.

## Independent review

Date: 2026-09-07

Decision: the contextual-intercept capability is source-correct. The equivalent-form capability is a valid source objective, but the current example mapping does not support its full title. Keep both nodes draft and source-only. Do not treat either node as separately assessed.

### Contextual intercept interpretation

`math.im1.example.4.1.004` is the correct stable example identity. Its metadata identifies source Example 3. The source finds and interprets the y-intercept and x-intercept for Amanda's lunch account. It also describes the same work for the shipping scenario. This supports `math.im1.skill.4.1.interpret-intercepts-in-the-context-of-real-world-situations`.

The `.004` suffix is not an example-number error. The node metadata has `exampleNumber: 3` and the exact Example 3 heading. The stable identifier comes from the current extracted graph identity.

### Equivalent-form rewrite

The lesson objective explicitly says: `Rewrite linear equations in equivalent forms to identify intercepts and slope.` The class-period plan also assigns rewriting equivalent forms to objective 4b. Thus, the capability can exist as a draft source objective.

Examples 1 and 2 do not assess this capability separately. Example 1 teaches table construction. Its note says `rewrite if needed` as one step before the table. Example 2 teaches intercept calculation. Its note says some equations need rearrangement before substitution. Neither example gives a worked comparison of equivalent forms. Neither example checks a rewrite as its own result. Neither example identifies slope after a rewrite.

Therefore, `.001` and `.002` are supporting examples only. They do not prove the full capability titled `Rewrite linear equations in equivalent forms to identify intercepts and slope`. Example 2 is the stronger source because rearrangement directly supports intercept finding. Example 1 supplies only an incidental prerequisite step.

The mixed exercises include equations in different forms. They require graphing or intercept calculation. The source summary does not identify a separate rewrite-only exercise or rubric. The period 3 mastery cycle covers objectives 4a and 4b together. It is not evidence of a separate assessment for the new atomic rewrite node.

Required correction before a later review:

- Remove the claim that the source assesses the two new capabilities separately.
- Describe `.001` and `.002` as supporting source links.
- Do not infer independent rewrite evidence from these links.
- If the node keeps `and slope`, add an exact source that teaches or checks slope identification through rewriting. Lesson 4-3 Example 2 covers rewriting to slope-intercept form, but that source belongs to objective 4f and needs a separate overlap decision.
- If Lesson 4-1 remains the only source, narrow the capability to rewriting equations to find or graph intercepts.

### Runtime status

Both nodes have `reviewStatus: draft` and `independentPracticeReady: false`. Both blueprints contain source identity only. The nodes have no generator, renderer, mode specification, grading rule, prerequisite, equivalence edge, or readiness effect. The lesson `contains` edges do not transfer evidence. This is safe source inventory. It is not curriculum approval or runtime readiness.

## Parent correction after independent review

The equivalent-form objective remains in the source inventory because Today's Goals states it explicitly. Its source references now identify that objective. Its blueprint has no worked-example links. Examples 1 and 2 do not demonstrate the complete rewriting and slope-identification objective. The earlier claim of separate assessment is withdrawn. A dedicated worked example and assessment remain missing. The contextual-intercept mapping to Example 3 remains valid. Both rows remain draft and inactive.

## Independent disposition after correction

The correction resolves the independent source-mapping finding. The rewrite node now cites only the explicit Today's Goals statement and objective 4b in the class-period plan. Its blueprint has `sourceNodeIds: []`. Thus, Examples 1 and 2 no longer imply complete rewrite or slope-identification evidence.

The canonical and draft node copies have the same stable ID, title, description, source references, draft status, and inactive practice flag. The blueprint remains draft and contains no activity specification or readiness claim.

Disposition: accept this row as inventory only. A complete worked example and a separate assessment remain missing. The row must not produce teaching, practice, evidence, or readiness behavior. This disposition is not curriculum approval.
