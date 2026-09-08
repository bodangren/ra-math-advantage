# Precalculus learner delivery UI integration

## Result

Q28 is applied in the shared worktree. The lesson and dashboard read the authenticated Q27 delivery state. They show the strict Worked activity only before acknowledgement. They show a pending message after acknowledgement. They show published Guided and Independent activities only after trusted teacher confirmation. A missing mode projection hides that mode. Other topics and ordinary lesson text remain unchanged.

The lesson keeps the exact physical activity and component check. It does not show another Worked action on later visits after acknowledgement. A null state gives no selected action.

## Review correction

The initial independent review accepted the production conditions but rejected the test evidence. The first page tests supplied fixed state strings. The revised composition test calls the actual state query after the real acknowledgement writer and the real teacher writer. It renders the actual lesson page at each transition. A separate dashboard assertion verifies the pending state with no selected action. The parent read the revised test and accepts this correction.

The composition uses hypothetical approval and mocked transport. It does not claim a live signed-in browser run. The earlier source projection test separately connects the real seed, lesson query, source projection, and renderer.

## Parent verification

All 89 tests in seven files pass. They cover real state transitions and page rendering, the strict source projection, acknowledgement route, receipt retry behavior, and graph renderer. App lint, a fresh build, and post-build standalone TypeScript pass.

Logs use `/tmp/precalc-q28-parent-` with `tests.log`, `lint.log`, `build.log`, and `tsc.log`.

## Remaining work

The runtime changes remain applied with pending application dependencies. The teacher candidate query and its consumer remain open. Complete browser verification and source approval remain open. No live seed or deployment ran.
