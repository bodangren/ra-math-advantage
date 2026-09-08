# Precalculus lesson layout independent investigation

## Verdict

The 6,400 px element is a KaTeX stretchy SVG. It is not an interval-classification graph.

The defect occurs because the lesson renderer uses KaTeX without importing the KaTeX stylesheet. The page receives that stylesheet only as a side effect of an unrelated activity-components barrel import. The stale-source page did not render that activity path. Its KaTeX SVG therefore used its intrinsic size and expanded the document to 6,641 px.

The minimum fix is to load `katex/dist/katex.min.css` from the Precalculus application root. Do not hide page overflow. Do not change the interval SVG.

## Evidence

The saved observation has a 1,280 px viewport and a 6,641 px document. It identifies one 6,400 px `svg` and one 6,412.19 px `path`.

The saved full-page image shows the lesson in the left part of a 6,641 px canvas. The remaining area is empty. This shape agrees with one oversized drawing element.

The restored live page contains three SVG elements:

- The first SVG has `viewBox="0 0 400000 1080"`. Its parent has the KaTeX class `hide-tail`.
- The other two SVG elements have `viewBox="0 0 320 110"`. They are the guided and independent interval graphs. Each one is 590 px wide.

With the stylesheet present, the first SVG is 35.5 px wide. The active KaTeX rule is `.katex .hide-tail { overflow: hidden; position: relative; width: 100%; }`. The SVG is absolutely positioned. These rules constrain the large KaTeX viewBox to its formula box.

The interval activity has a fixed 320 by 110 viewBox and the class `h-28 w-full`. Its first path starts with `M10 88H310`. The observed oversized path does not have this geometry. A change to interval graph width or clipping cannot correct the observed cause.

## Source trace

Committed HEAD and the retained live overlay have the same missing dependency:

- `packages/lesson-renderer/src/textbook/MarkdownRenderer.tsx` imports `MathBlock` and `MathInline`. It does not import `katex/dist/katex.min.css`.
- `packages/lesson-renderer/src/textbook/MathBlock.tsx` and `MathInline.tsx` render `@matejmazur/react-katex`.
- `apps/pre-calculus/app/layout.tsx` imports only `./globals.css`.
- `apps/pre-calculus/app/globals.css` has a `.katex-display` scroll rule. It does not import the KaTeX stylesheet.

The activity-components package imports the stylesheet in `MathInputField.tsx`, `StepByStepper.tsx`, and `GraphingExplorer.tsx`. The public package barrel exports those modules and `IntervalClassificationActivity`. A page that loads the activity barrel can therefore receive KaTeX CSS through an unrelated module side effect. The restored Topic 1.1 page receives the rule and has a 1,280 px document. The stale-source state omitted the practice activity and exposed the missing direct stylesheet dependency.

The `.katex-display` rule in application CSS is useful for a long display formula after KaTeX applies its layout rules. It cannot replace the KaTeX stylesheet. A general `overflow-x: hidden` rule would conceal the symptom and can clip valid formulas.

## Minimum repair

Import `katex/dist/katex.min.css` once from the Precalculus application root. A direct import in `apps/pre-calculus/app/layout.tsx`, before `./globals.css`, gives every lesson route the required base rules. It also lets `globals.css` keep the application-specific `.katex-display` rule after the base stylesheet.

This is one runtime source change. A focused regression test can be the second path if the existing test location supports CSS dependency checks. Do not add a new wrapper, SVG rule, or overflow rule.

## Acceptance checks

1. Render a lesson that contains a KaTeX stretchy expression and does not render any activity component.
2. At a 1,280 px viewport, assert that `document.documentElement.scrollWidth` is at most the viewport width.
3. Assert that the SVG with `viewBox="0 0 400000 1080"` stays within its KaTeX formula container.
4. Assert that the formula remains visible. For a long formula, assert that `.katex-display` can scroll horizontally.
5. Render the current Topic 1.1 lesson. Assert that both interval SVG elements keep `viewBox="0 0 320 110"` and remain within their activity cards.
6. Run the Precalculus lint, build, and post-build TypeScript checks.

No backend data change is necessary. No lesson-source change is necessary.
