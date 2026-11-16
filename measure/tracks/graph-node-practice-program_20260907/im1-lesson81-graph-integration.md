# IM1 Lesson 8-1 graph integration

## Result

The graph adds eight draft inactive capabilities. It repairs stable 8a and adds the existing 8e reuse for Problem 17. Nine new containment edges connect the eight new skills and the reuse. The existing 8a containment remains.

Sources `.001` and `.002` remain canonical draft sources. Source `.003` retains its ID as a rejected duplicate. Its containment edge `1025` is removed. The graph removes three empty 8a activity placeholders. It adds no prerequisite, equivalence, evidence, renderer, or active practice claim.

The parent compared semantic records with the preceding graph. No stable node ID was removed. Only the three Lesson 8-1 source nodes and 8a changed. Eight nodes and eight blueprints were added. Only the 8a existing blueprint changed. Nine edges were added. Only edge `1025` was removed. No surviving edge changed.

## Review correction

Independent review found one incorrect direct source reference. Problem 15 supplies a domain. It does not ask the student to determine domain and range. The parent removed this reference from all four node catalogs. The exact-reference regression failed before the correction and passed after it. Independent review accepts the correction.

Problems 16 and 19 remain manual composite tasks. Problem 17 remains nonunique. The graph does not assign whole-task evidence to component capabilities.

## Inventory

The artifacts contain 963 nodes, 2,475 edges, 365 skill records, and 364 non-rejected skill candidates. There are 128 approved skill records, 361 blueprints, 387 activity projections, and 190 SRS planning rows. Coverage contains six registered bindings and 358 generator gaps. Draft planning rows do not establish usable practice.

## Parent verification

All 183 curriculum and seed tests in 40 files pass. All 37 coverage and audit tests in two files pass. App lint, a fresh build, and post-build standalone TypeScript pass. Logs use `/tmp/im1-g38-graph-parent-`.

## Limits

Source restoration is committed as `f62ef3fa`. The graph candidates remain draft and inactive. Source approval, usable three-mode practice, and signed-in student-flow verification remain open. No live seed or deployment ran.
