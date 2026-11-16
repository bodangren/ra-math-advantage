# IM1 Lesson 7-4 source and graph integration

## Result

The source restoration and graph correction are applied in the shared worktree. The lesson contains all 25 source problems, all 12 paired systems, the clay and juice tables, all subparts, and the complete Jason and Daniela work. The displayed errors in Problem 21 remain task givens. The lesson does not disclose the other problem answers.

The graph adds six draft inactive capabilities. It reuses six existing system capabilities through lesson containment. The new capabilities separate scale-factor selection, scaled elimination, equation-combination error diagnosis, method choice, specified-multiplier construction, and a missing coordinate with an equation parameter. Each new node has exact problem references in all four node catalogs.

Source `.014` represents the joint Examples 1 and 2 group. Source `.015` retains its stable ID as a rejected duplicate. New source `.source-003` represents Example 3. The legacy 7g aggregate is inactive and source-only. Its three empty activities are removed.

The patch removes prerequisite edge `1263` and the rejected duplicate source containment edge `1015`. It adds 13 containment edges: six new capabilities, six reuses, and the restored Example 3 source. It does not change other existing edge records. Both SRS projections remove the unsupported Lesson 7-5 dependency.

## Current inventory

The artifacts contain 948 nodes, 2,463 edges, 350 skill candidates, 346 blueprints, 396 projected activities, and 175 SRS planning rows. There are 344 generator gaps, six registered bindings, and 131 approved skill nodes. The 220 source-only blueprints and 120 empty-mode blueprints do not establish production readiness.

## Review corrections

Independent review accepts the restored source. The graph review required exact problem references and current audit totals. Both corrections are applied. A new regression compares the audit totals with the actual arrays.

The parent also corrected a stale Lesson 7-3 test. It had forbidden a second lesson containment for a reused capability. The test still requires the Lesson 7-3 relation and rejects every non-containment edge on the two capabilities. The parent added a string type guard to the new source-reference assertion because historical source references can also be objects.

## Parent verification

All 145 curriculum and seed tests in 35 files pass. All 36 coverage and audit tests in two files pass. App lint, a fresh build, and post-build standalone TypeScript pass. The final lint and TypeScript checks include the two parent test corrections.

Logs are `/tmp/im1-g36-parent-main-final-tests.log`, `/tmp/im1-g36-parent-coverage-tests.log`, `/tmp/im1-g36-parent-main-final-lint.log`, `/tmp/im1-g36-parent-main-build.log`, and `/tmp/im1-g36-parent-main-final-tsc.log`.

## Remaining work

The six new capabilities remain draft and inactive. Source approval and usable three-mode practice remain open. No live seed or deployment ran. Lesson 7-5 source review is active.

## Count correction

A later comparison with the committed node array corrected the approved-skill count from 132 to 131. G36 changed legacy 7g from approved to draft. The earlier total did not subtract that row. This correction does not change a node review state.
