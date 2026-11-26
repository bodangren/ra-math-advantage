# Current Directive — 2026-11-14

## Objective

Carry out the direction of 2026-11-14 through Measure tracks, in the order below.
`README.md` (section "Planned Direction") lists the direction items. The directive of
2026-06-09 is complete: `wire-kst-pipeline_20260521` closed on 2026-07-03.

## Track Order

0. `math-pilot-fastlane_20261126`: one math app for Integrated Math 3, then AP Precalculus, on the pilot URL.
1. `vinext-oxc-toolchain_20261114`: vinext 1.x with no `next`, oxlint, oxfmt, and tsrs.
2. `openrouter-sdk-ai-layer_20261114`: the OpenRouter SDK AI layer (after 1).
3. `danielson-app-import_20261114` is archived (superseded, PM 2026-11-16). `apps/danielson`
   is in the tree; its deploy is part of `prod-deploy-pipeline_20261114`.
4. The track set `unified-math-app_20261114`: `math-app-base_20261114`, then the three
   course imports, then `math-app-retire-old-apps_20261114`,
   `math-app-student-history_20261114`, and `math-app-seat-licensing_20261114`.
5. `bm2-convex-auth-v2_20261114` (after 4).
6. `prod-deploy-pipeline_20261114` (after 4 and 5). It also owns the deploy of
   `apps/danielson` (Phase S3 of the archived `danielson-app-import_20261114`, superseded
   PM 2026-11-16).
7. `kst-v32-runtime_20261114` is archived (superseded, PM 2026-11-16); `kst-srs-v3-2-im3-runtime-migration_20260710` replaces it (after 4).
8. `math-graph-consume_20261114` (after 7 and the first release of the math graph).
9. Practice Primitives Tracks A to F (after 5 and 6).

`docs-new-direction_20261114` updates the project documents for this direction. The
registry `measure/tracks.md` also holds older open tracks, for example
`live-classroom-presentation_20260703`.

## Rules in Force

- `math-pilot-fastlane_20261126` has top priority (PM 2026-11-26).
- The pilot track pulls forward the necessary parts of `prod-deploy-pipeline_20261114` and `unified-math-app_20261114`. The remaining work waits until the pilot track closes.
- Each phase ends with the checkpoint protocol of `measure/workflow.md`. Each track ends
  with a sync with origin.

## Next High School Graph Task

Audit all practice components and bindings connected to the prerelease graph skills.
Use `graph-node-practice-program_20260907`. Use the results to select one set of
practice components for Integrated Math 1–3 and AP Precalculus in `apps/math`.
Keep Business Math in `apps/bus-math-v2`. Reuse shared packages that fit its workflows.

## Known Blockers

- `math-graph-consume_20261114` requires a versioned package for the corrected graph.
  The practice component audit can use the prerelease candidate now.
