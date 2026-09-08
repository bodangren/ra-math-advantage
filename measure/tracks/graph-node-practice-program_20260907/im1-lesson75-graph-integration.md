# IM1 Lesson 7-5 graph integration

## Result

The graph correction is applied after source commit `fedfa50e`. It repairs the stable 7i capability and adds seven draft inactive capabilities. It adds eight containment edges, including the reviewed Problem 24 reuse. It preserves the existing 7i containment.

Sources `.016` and `.019` represent the canonical example groups. Sources `.017` and `.018` retain their IDs as rejected duplicates. The unsupported optimization node 7k retains its stable ID as rejected and inactive. The current coverage builder excludes rejected skills. The queue and matrix therefore exclude 7k. Six empty activities are removed. Prerequisite edge `1264` and both derived SRS prerequisites are removed.

Direct context-modeling references remain Problems 13, 14, 21, and 22. Problem 23 requests a viable ordered pair. It does not separately request a written model.

## Inventory

The graph contains 955 nodes, 2,467 edges, 357 skill records, and 356 non-rejected skill candidates. It contains 129 approved skills, 353 blueprints, 390 activity projections, and 182 SRS planning rows. Coverage contains six registered bindings and 350 generator gaps. These counts do not establish usable practice coverage.

## Parent verification

All 155 curriculum and seed tests in 37 files pass. All 37 coverage and audit tests in two files pass. App lint, a fresh build, and post-build standalone TypeScript pass. Shared math-content lint and standalone TypeScript also pass.

The parent compared semantic records. Only the reviewed source and skill records changed. Unrelated nodes and surviving activity records remain unchanged. The graph adds eight edges and removes only edges `1018`, `1019`, `1022`, and `1264`.

Logs use `/tmp/im1-g37-parent-`. The package TypeScript log is `/tmp/im1-g37-parent-package-tsc.log`.

## Limits

The new capabilities remain draft and inactive. They have no renderer, generator, or three-mode practice specification. Source approval, usable practice, and student-flow verification remain open. No live seed or deployment ran.
