# Precalculus lesson math layout repair

The root layout now imports the installed KaTeX stylesheet before the application stylesheet. Math styles no longer depend on whether the selected practice component renders.

The original browser check measured a 6641-pixel document in a 1280-pixel viewport when the source was unavailable. The missing KaTeX clipping and positioning rules exposed its long square-root SVG.

The corrected browser check used the same stale-source state. It measured a 1280-pixel document in the same 1280-pixel viewport. The parent inspected the rendered square-root expression. The internal SVG path can remain wide because the KaTeX rules position and clip it correctly.

Both Guided and Independent requests still returned safe HTTP 409. Persisted rows remained unchanged. The local source was restored afterward. The first screenshot locator expected display math; the observed expression was inline math. The corrected locator captured the inline expression. That harness correction did not change the application.

Parent lint, build, and post-build standalone TypeScript passed. Independent review accepts the one-file repair. The parent verified the staged layout against the tested candidate. No dependency change, general overflow clipping, or interval-graph change is included.
