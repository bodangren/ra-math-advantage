# IM1 Lesson 7-5 source restoration

## Result

The lesson now preserves all 28 worksheet questions, all 12 initial systems, each context constraint, and all subparts. It restores the joint Examples 1 and 2 group and the Example 3 group. It replaces the incomplete summaries and the claim that source graphs were unavailable.

The four public graph images are unchanged original DOCX assets. Their mapping is Problem 15 to image3, Problem 16 to image1, Problem 17 to image2, and Problem 18 to image4. The internal image order differs from the question order. Parent visual inspection caught and corrected this difference before acceptance.

Each graph has an accessible description of boundary points, line style, and shading. The lesson does not supply solved inequality systems for the graph questions. It does not disclose the authored answers to the other questions. The general method guidance is identified separately from recovered source content.

## Verification

The source regression failed all four tests before repair. All four pass after repair. Independent review inspected both worksheet pages, all four graph mappings, and the complete prompts. It confirms that public image bytes match their original embedded assets.

App lint, a fresh build, and post-build standalone TypeScript pass. Logs use `/tmp/im1-g37-source-` with `red.log`, `green.log`, `lint.log`, `build.log`, and `tsc.log`.

## Remaining work

G37 graph correction is in a separate isolated candidate. It must preserve existing 7i and add only seven new capabilities. Source approval and usable three-mode practice remain open. This source repair does not approve a capability or run a live seed or deployment.
