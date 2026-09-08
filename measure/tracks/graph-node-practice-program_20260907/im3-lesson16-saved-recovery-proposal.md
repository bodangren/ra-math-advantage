# IM3 Lesson 1-6 saved recovery proposal

## Source finding

The committed Module 1 PDF verifies source node `.038` on printed page 44. The printed heading is `Example 3 Complex Roots`. The prompt is `Solve 5x² + 8x + 11 = 0 by using the Quadratic Formula.` The printed work gives `a = 5`, `b = 8`, and `c = 11`. It simplifies the discriminant to `-156` and gives `x = (-4 ± i√39)/5`.

The saved arithmetic and worked steps match the source. The saved page reference is valid. The saved source record is incomplete as an exact restoration because it keeps the generic title `Example 3: Solve More Complex Equations` and adds no exact prompt or demonstrated-capability metadata.

The source relation is narrower than the existing broad skill. Example 1 on page 43 covers contextual real roots. Example 2 on page 44 covers irrational real roots. Example 3 covers complex roots. Example 3 alone does not prove the whole capability to use the Quadratic Formula across these cases.

## Valid bounded recovery

A source-only recovery is valid for `.038`. It should update the same record in these five catalogs:

1. `module-1/nodes.json`;
2. `nodes.json`;
3. `draft-nodes.json`;
4. the embedded nodes in `edges.json`;
5. the embedded nodes in `standard-edges.json`.

The recovery should add the page 44 PDF reference. It should use the exact authored title `Example 3: Complex Roots`. It should add the exact prompt and a narrow demonstrated capability for a quadratic with a negative discriminant. It should preserve the stable ID, draft status, and each catalog's unrelated metadata. A focused source regression should verify all five copies.

This recovery must not approve the source. It must not use `.038` as proof of every response covered by the broad quadratic-formula skill.

## Blueprint and runtime finding

Do not integrate the saved blueprint or its projections in the source recovery.

The Worked specification is a faithful rendering of Example 3. It is useful reference material. The Guided and Independent specifications use the same fixed source equation and include the complete solution steps in client props. The Independent specification states `unique_seeds`, but its renderer props remain fixed at `5x² + 8x + 11 = 0`. The saved tests do not connect a generated variant to rendered props, expected answers, server grading, retry behavior, or evidence persistence.

The saved projection test treats `generatorReady: true` as sufficient. That field is an inventory result. It is not an approval or mastery-readiness result. The saved projections are also unsafe under the current approval gate: all three stored activity rows have `srsEligible: true` while the skill node and blueprint remain draft. Current `projectActivityMap` would make all three rows ineligible.

The existing `quadratic-formula` generator is real and has package tests. This fact does not validate the saved fixed-mode contract. A later runtime task can reuse the generator after it proves these items:

- generated equation and solution steps reach the renderer for each attempt;
- Guided help does not expose an answer before the permitted action;
- Independent mode does not receive solution-bearing props before submission;
- submitted part IDs and answers match generator grading metadata;
- retry preserves the same attempt envelope;
- a new attempt uses its new generated variant;
- draft content remains `srsEligible: false` and does not produce mastery evidence.

Until that work is complete, keep the broad skill and any blueprint draft and inactive. Do not add its three saved activity rows or its SRS readiness claim.

## Saved test disposition

`StepByStepSolverActivity-example-1-6-3.test.tsx` is useful as a static rendering check for the Worked source. Its Guided and Independent checks prove only that controls render and selected text is hidden. They do not prove safe answer transport or grading.

`example-1-6-3-projection.test.ts` is useful for source isolation and schema parsing. Its expectation for three executable modes and `generatorReady: true` must not be used as an acceptance test for this recovery. A revised source-only test should replace those claims.

## Preservation disposition

If only the source recovery is integrated, the exact source changes in the five node catalogs can be superseded by the corrected source restoration. The following unique saved work must remain preserved for later review:

- the two blueprint catalogs;
- the module and course combined projection files;
- the standalone SRS projection;
- both focused tests;
- the two Measure files that record the earlier work.

The saved projection bytes must remain historical evidence only. They must not be copied as current generated state because they mark draft activities as SRS eligible.

Keep worktree `8111` or preserve its complete 14-path dirty state until the source recovery and the later blueprint decision are committed. A reference to its old `HEAD` does not preserve the untracked tests or dirty projections.

## Recommended exact scope

Use a six-path source recovery: the five node-bearing catalogs and one app-discovered source regression. Add no blueprint, activity, SRS, teacher, runtime, generator, approval, or mastery change. Review Examples 1 and 2 separately before any broad-skill source binding. Create a separate runtime track for the generator-driven three-mode contract.
