# Q23 independent review

## Result

Revise the proposal before implementation. Most proposed text is correct. Three source-parity changes are required.

## Required corrections

### 1. State the ball-model turning point

The model is

`h(t) = -24t^2 + 60t + 6`.

Its positive ground intersection is

`t = (5 + sqrt(29)) / 4`, which is approximately `2.5963` seconds.

The physical domain for height above the ground is therefore

`0 <= t <= (5 + sqrt(29)) / 4`.

The vertex occurs at `t = 5/4 = 1.25` seconds. The maximum height is `87/2 = 43.5` feet. The displayed values at `t = 1` and `t = 1.5` are both 42 feet because the samples are equally spaced around the vertex. They do not show a constant interval.

The proposed Explore prompt asks what happens from `t = 0` to `t = 1.5`, but it does not state this turning point. Add an explicit instruction to use the algebraic model. State that the height increases through `t = 1.25` and then decreases. State that the equal endpoint samples at 1 and 1.5 seconds do not make the function constant between them.

The model values in the table are correct: `6, 30, 42, 42, 30, 6, -30`.

### 2. Preserve the authored greatest-rate task

Do not replace the existing greatest-rate question only with a greatest-increase question. That replacement removes an existing authored task.

Keep the rate question and label it as a Topic 1.2 preview. State that it does not supply Topic 1.1 mastery evidence. The displayed input gaps are all 2 units, so the ranking by output increase happens to match the ranking by average rate in this table. The largest increase is 6 on `[7,9]`, and its average rate is 3. The earlier increasing intervals each have an increase of 5 and an average rate of 2.5.

A value-comparison question can remain as Topic 1.1 practice. It must not replace the preserved Topic 1.2 preview.

### 3. Repair the accepted lesson in the same bounded change

Do not leave a known difference between the runtime seed and the accepted lesson source. Apply the same authored labels, table assumptions, corrected sentence frame, ball turning-point explanation, and preserved Topic 1.2 preview to both files.

The accepted lesson does not currently contain the two authored ordinary Worked tasks from the seed. Add these tasks to the lesson under the authored-practice boundary, or remove them from the runtime seed if the product does not need them. The minimum content-preserving choice is to add them to the lesson with the same authored labels and finite-table limits.

This parallel correction does not change the recovered Passwater Examples 1 through 12. It must keep those examples as the original-source section. It must keep the selected phase-4 physical activity separate.

## Correct proposal content

The following parts are source-aligned:

- The independent variable is an input variable. It is not the domain.
- The dependent variable is an output variable. It is not the range.
- The domain is the set of input values.
- The range is the set of output values.
- The ball, temperature, `g`, `p`, and `m` tables are authored extensions.
- A finite table does not prove behavior between samples.
- The temperature task needs an explicit monotonic interpolation assumption.
- The `p` and `m` tasks need an explicit linear interpolation assumption if they ask for interval behavior between displayed inputs.
- The authored `g` task can compare only consecutive displayed values without an interpolation claim.
- The text-described piecewise-linear graph supplies its behavior between endpoints directly.
- The `$amount$` placeholder must become `___`.
- The negative ball value at 3 seconds is an algebraic continuation. It is not a physical height above the ground.
- The ordinary Worked section must not reuse the labels `Example 1` and `Example 2`, because those labels identify the recovered Passwater tasks.

## Minimum implementation scope

Change the seven ordinary seed bodies and the matching accepted lesson content together. Keep all IDs, component keys, physical links, approval values, and activity props unchanged. Keep the Q22 phase ownership and conflict guards.

Add an exact source-parity test that checks the seven phase identities, sequence-1 text, the selected sequence-2 physical link, authored labels, interpolation assumptions, the ball vertex and cutoff, the preserved Topic 1.2 preview, and replay preservation of unrelated sections.
