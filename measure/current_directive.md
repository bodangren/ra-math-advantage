# Current Directive — 2026-11-14

## Objective

Carry out the direction of 2026-11-14 through Measure tracks, in the order below.
`README.md` (section "Planned Direction") lists the direction items. The directive of
2026-06-09 is complete: `wire-kst-pipeline_20260521` closed on 2026-07-03.

## Track Order

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

- Each phase ends with the checkpoint protocol of `measure/workflow.md`. Each track ends
  with a sync with origin.
- Until 2026-12-01 (PM rule), Math runs at most two sessions at one time: the build session
  and one role. The PM queues the spec reviews and starts each one.
- Run `~/Desktop/advantage-pr/scripts/jobs/slot check` before a role.

## Known Blockers

- The first release of the merged math graph from mastery-advantage. The ID scheme has the
  confirmation target 2026-11-21. `math-graph-consume_20261114` waits for the release.
