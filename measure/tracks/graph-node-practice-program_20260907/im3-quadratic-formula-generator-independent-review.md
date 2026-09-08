# IM3 quadratic-formula generator independent review

## Verdict

Accept.

The three-path patch has the required narrow scope. It changes one generator and two generator test files. It does not change runtime routes, graph data, deterministic equation selection, or approval state.

## Findings

The irrational regime now returns distinct plus and minus radical forms. The complex regime now returns distinct conjugate forms. The existing integer and repeated-root regimes keep their root counts. The final Worked step lists each returned root.

The discriminant substitution now puts every value of `b` in parentheses. This makes a negative value explicit as `(-n)^2`. The later formula step keeps the signed value in `-(${b})`.

The residual tests evaluate all generated real and complex roots. The complex parser now uses the square root of the radicand. The tests check both the real and imaginary residual components. They cover 100 deterministic seeds.

The existing adapter maps each root to `x1` and `x2`. The new adapter regression compares each field with the direct generator result. It also checks the discriminant and the exact number of answer fields.

The generator still uses one `mulberry32(seed)` instance and the same case-selection and coefficient-generation logic. The patch changes only root serialization and Worked-step text.

The current grading mode remains `exact_match`. The implementation report states this limitation. Learner activation still needs a separate contract for unordered equivalent root forms.

## Independent verification

The focused command passed 4 files and 130 tests:

`npm test --workspace=packages/math-content -- --run src/__tests__/quadratic-formula.test.ts src/__tests__/t17-adversarial.test.ts src/__tests__/generator-registry.test.ts src/__tests__/t17-algebra-generators-qa.test.ts`

The two failures in the reported full package run are unrelated to this patch. Both failures are in IM1 derived-data tests. One compares the stored IM1 coverage matrix with its current derived form. The other compares the IM1 rollout gap queue with module-1 scaffold coverage. None of the three changed paths reads or writes those artifacts. The focused generator, registry, adapter, and adversarial contracts all pass.
