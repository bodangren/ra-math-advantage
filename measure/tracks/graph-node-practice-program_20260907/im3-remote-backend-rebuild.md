# IM3 development backend rebuild

The deleted IM3 test project is replaced. The user confirmed that it held only seed/test data and had not rolled out. Advanced recovery was not required.

Project: `bodangren/integrated-math-3` (ID `2960816`).

Development deployment: `accurate-labrador-817`.

Backend URL: `https://accurate-labrador-817.convex.cloud`.

The backend now contains 52 lessons, 44 competency standards, and 79 lesson-standard mappings. It also contains 388 activities, 91 practice variants, and 200 unique practice items. All checked references resolve. The five system activities preserve both source equations. The demo has five active students, one active teacher, and one deactivated test student. The declared demo phase states pass verification.

## Repair and verification

The first seed loaded only Lesson 1.6. It exposed invalid function references and legacy seed contracts. The repairs preserve current schemas and source content. They correct system transport, generic variant references, real demo phase progress, and a repeated activity read that exceeded Convex's 16 MiB limit.

The repaired source passed focused tests, related seed tests, lint, build, and separate post-build TypeScript. A separate local Convex backend verified the stored data. Independent review accepted that bounded proof.

The committed source was then deployed to the replacement development backend. All 62 targeted seed calls passed: 51 failed lessons, nine mapping helpers, the generic practice helper, and the progress helper. These calls did not run seedAll or reset demo accounts. A final remote query and independent review passed. See `im3-remote-bootstrap-final-review.md` and `evidence/im3-seed-bootstrap-remote/`.

The generic helper returned 7,838 family/activity outcomes. It stored 200 unique items. These counts do not establish graph-node practice coverage. Its existing first-200 activity selection remains unchanged.

## Configuration and cleanup

Wrangler uses the replacement URL through commit `b965a5756`. The main `.env.local` still selects its separate local deployment. The isolated candidate selects the replacement development deployment. No frontend or production deployment ran.

The local deployment command changed the isolated connection file. The remote target check caught this before a remote call. An explicit development environment file selected the correct target for the final push. The temporary TypeScript settings were restored after each push.

The temporary seed-test backend was stopped. Its database, storage, keys, environment files, and runner files were removed after review. The separate quadratic-formula browser fixture remains available for its open verification task. Only the main Git worktree is registered. Unrelated main changes remain intact.

The backend rebuild is complete. Learner browser verification and the five-course Graph Node Practice Program remain open.
