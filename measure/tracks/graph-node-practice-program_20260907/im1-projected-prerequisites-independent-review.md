# G52 projected prerequisite audit

## Result

The committed `HEAD` versions of the two projection copies contain the same 81 prerequisite pairs. Fourteen pairs do not have a matching canonical edge of type `prerequisite_for` or `prerequisite`. All 14 are stale lesson-sequence residues.

The projection contract is direct. `projectSrsInputs` in `packages/knowledge-space-practice/src/projections/srs.ts` selects only `prerequisite_for` edges whose `targetId` is the projected node. It does not calculate transitive closure. It does not read edges of type `prerequisite`.

The repository does not directly import these saved JSON files in production application code. Curriculum tests import them. They are still published SRS input artifacts. Their `prerequisites` arrays control downstream readiness and outer-fringe behavior when a consumer loads them.

## Stale sequence pairs

The following 14 pairs must be removed from both `projection/srs-input.json` and `projection/practice-v1-activity-map.json`:

1. `math.im1.skill.2.7.solve-literal-equations-and-formulas-for-a-specified-variabl` -> `math.im1.skill.3.1.express-a-relation-as-a-table-a-graph-a-mapping-and-a-set-of`
2. `math.im1.skill.3.1.express-a-relation-as-a-table-a-graph-a-mapping-and-a-set-of` -> `math.im1.skill.3.2.determine-whether-a-relation-represented-as-a-graph-table-ma`
3. `math.im1.skill.3.2.determine-whether-a-relation-represented-as-a-graph-table-ma` -> `math.im1.skill.3.3.determine-whether-a-function-represented-by-a-graph-equation`
4. `math.im1.skill.3.3.determine-whether-a-function-represented-by-a-graph-equation` -> `math.im1.skill.3.4.estimate-and-interpret-the-x-and-y-intercepts-of-a-function`
5. `math.im1.skill.3.4.estimate-and-interpret-the-x-and-y-intercepts-of-a-function` -> `math.im1.skill.3.5.identify-line-symmetry-in-the-graph-of-a-function-and-determ`
6. `math.im1.skill.3.5.identify-line-symmetry-in-the-graph-of-a-function-and-determ` -> `math.im1.skill.3.6.sketch-graphs-of-real-world-functions-from-verbal-descriptio`
7. `math.im1.skill.3.6.sketch-graphs-of-real-world-functions-from-verbal-descriptio` -> `math.im1.skill.4.1.graph-linear-equations-by-making-a-table-of-values-and-by-fi`
8. `math.im1.skill.8.6.find-the-first-several-terms-of-a-sequence-given-a-recursive` -> `math.im1.skill.9.1.calculate-the-mean-median-and-mode-of-a-data-set`
9. `math.im1.skill.9.1.calculate-the-mean-median-and-mode-of-a-data-set` -> `math.im1.skill.9.2.analyze-data-displays-to-draw-conclusions-and-answer-questio`
10. `math.im1.skill.9.2.construct-dot-plots-bar-graphs-and-histograms-to-represent-d` -> `math.im1.skill.9.3.identify-sample-bias-in-survey-and-sampling-methods-and-expl`
11. `math.im1.skill.9.3.recognize-biased-survey-questions-and-identify-whose-interes` -> `math.im1.skill.9.4.calculate-the-range-interquartile-range-and-standard-deviati`
12. `math.im1.skill.9.4.determine-the-five-number-summary-and-construct-a-box-plot-f` -> `math.im1.skill.9.5.choose-appropriate-measures-of-center-and-spread-based-on-wh`
13. `math.im1.skill.9.5.construct-and-interpret-histograms-and-box-plots-to-visualiz` -> `math.im1.skill.9.6.construct-and-interpret-box-plots-and-histograms-to-compare`
14. `math.im1.skill.9.6.describe-how-adding-or-multiplying-every-value-in-a-data-set` -> `math.im1.skill.9.7.construct-and-complete-two-way-frequency-tables-from-verbal`

The original edge IDs were `1235` through `1241` and `1270` through `1276`. Their rationales only stated that one lesson or module preceded the next. Commits `7b9b49932`, `9a3a8ef49`, `e4cd1d344`, `a161f18b7`, `df7883c69`, and `334f17643` removed them during source-boundary repairs. No canonical replacement edge supports these pairs.

## Valid direct relationship with a type mismatch

The projections also contain this valid pair:

`math.im1.skill.9.1.determine-the-median-of-a-data-set` -> `math.im1.skill.9.4.determine-the-five-number-summary-of-a-data-set`

Canonical edge `math.im1.g47.prerequisite.001` supports this direct relationship. Its rationale is that a five-number summary includes the median. The edge uses type `prerequisite`. Thus, this pair is not one of the 14 stale pairs.

Do not delete this projected pair as stale. `projectSrsInputs` currently recognizes only `prerequisite_for`. A later regeneration can drop this valid pair. Treat that edge-type mismatch as a separate contract issue.

## Bounded repair and tests

1. Remove the 14 stale sequence pairs from both projection copies.
2. Preserve the median-to-five-number-summary pair.
3. Add one audit test that accepts both canonical prerequisite edge types and compares their direct pairs with the prerequisite pair set in each projection copy.
4. Assert that the prerequisite pair sets in the two projections are equal.
5. Assert the 14 removed sequence pairs are absent.
6. Assert the median-to-five-number-summary pair remains present and has one canonical supporting edge.

The audit must not accept transitive reachability as support. SRS projection stores immediate prerequisites only.
