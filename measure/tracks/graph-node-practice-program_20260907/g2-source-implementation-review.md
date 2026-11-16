# IM1 G2 source implementation review

Date: 2026-09-07

## Result

The Module 1 G2 change is correct for its bounded scope. I found no source error or accidental activation.

The six new rows use the full scheduled capability text. The descriptions also preserve necessary lesson restrictions. Objective `1f` keeps the nonzero restriction for a multiplicative inverse. Objective `1h` includes negative and fractional coefficients. Objective `1l` keeps both precision judgment and source reliability.

The identifiers match the current assembler algorithm. The algorithm removes punctuation, replaces spaces with hyphens, and truncates the slug to 60 characters.

| Objective | Assembler identifier |
|---|---|
| `1b` | `math.im1.skill.1.1.evaluate-numerical-expressions-accurately-using-the-order-of` |
| `1d` | `math.im1.skill.1.2.evaluate-algebraic-expressions-by-substituting-given-values` |
| `1f` | `math.im1.skill.1.3.use-the-commutative-associative-identity-and-inverse-propert` |
| `1h` | `math.im1.skill.1.4.use-the-distributive-property-to-simplify-algebraic-expressi` |
| `1j` | `math.im1.skill.1.5.evaluate-absolute-value-expressions-by-substituting-given-va` |
| `1l` | `math.im1.skill.1.6.determine-a-reasonable-level-of-accuracy-when-performing-mul` |

Each row is identical in `nodes.json`, `draft-nodes.json`, and the embedded `edges.json` node list. Each row has `reviewStatus: draft`. None of the rows sets `independentPracticeReady` to `true`.

Each new row has one incoming edge. That edge is a draft `contains` edge from its exact lesson. The change adds no prerequisite, standards, readiness, or cross-course edge.

The six blueprint source maps point only to existing worked-example rows from the same lesson. The maps omit source examples that do not yet have graph identities. This is correct for G2. Later identity repair must add the missing examples before a blueprint maps them.

The Git diff changes no existing node identifier. It adds the six node rows, their six containment edges, the six source maps, and the focused test. The current test uses `not.toMatchObject({ independentPracticeReady: true })`. This avoids the TypeScript error caused by the inferred JSON type while it keeps the required assertion.

## Test improvement

The test contains fixed expected identifiers. It does not call the real parser and assembler. Add a deterministic parity assertion when G3 changes the same files. Parse the Module 1 plan and call `assembleDraftInventory`. Compare the six extracted identifiers with the six catalog identifiers. This test would detect a later change to the slug algorithm.

## G3 Module 2 source rows

Add these six missing scheduled capabilities as draft rows. Use these exact source texts and assembler identifiers.

| Objective | Exact source text | Assembler identifier |
|---|---|---|
| `2b` | `Translate algebraic equations and formulas into complete verbal sentences and interpret formulas in context.` | `math.im1.skill.2.1.translate-algebraic-equations-and-formulas-into-complete-ver` |
| `2d` | `Write and solve one-step equations to model real-world situations and apply the correct Property of Equality to verify solutions.` | `math.im1.skill.2.2.write-and-solve-one-step-equations-to-model-real-world-situa` |
| `2f` | `Solve literal equations for a specified variable and solve equations requiring the Distributive Property.` | `math.im1.skill.2.3.solve-literal-equations-for-a-specified-variable-and-solve-e` |
| `2h` | `Determine whether an equation has one solution, no solution, or is an identity and apply equations to geometric situations.` | `math.im1.skill.2.4.determine-whether-an-equation-has-one-solution-no-solution-o` |
| `2l` | `Apply proportions to percent situations, scaling problems, and mixture contexts.` | `math.im1.skill.2.6.apply-proportions-to-percent-situations-scaling-problems-and` |
| `2n` | `Use dimensional analysis to convert between units of measurement and apply formulas to solve real-world problems.` | `math.im1.skill.2.7.use-dimensional-analysis-to-convert-between-units-of-measure` |

For each row, add only a draft containment edge from its exact lesson. Do not infer prerequisites or standards in G3.

## G3 objective 2i identity correction

The current preserved identifier is:

`math.im1.skill.2.5.solve-absolute-value-equations-of-the-form`

Keep this identifier because it can have historical references. Correct its title and description to the full source capability:

`2i: Solve absolute value equations of the form |expression| = constant and recognize when no solution exists.`

The current assembler would create this different identifier from the full text:

`math.im1.skill.2.5.solve-absolute-value-equations-of-the-form-expression-consta`

Do not replace the preserved identifier with the new assembler output. Add a test that fixes the preserved identifier and the corrected full text. This is an explicit legacy identity exception.
