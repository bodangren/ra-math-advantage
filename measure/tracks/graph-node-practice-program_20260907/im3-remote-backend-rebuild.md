# IM3 development backend rebuild

The user deleted the entire remote project. It contained only seed/test data. The application had not rolled out. The user confirmed that advanced recovery is not required.

The replacement project is `integrated-math-3` under team `bodangren`. Its project ID is `2960816`. Its development deployment is `accurate-labrador-817`.

The backend URL is `https://accurate-labrador-817.convex.cloud`.

Committed backend source and schema were deployed. The source matched Git HEAD. The local browser fixture was excluded. The application connection change is committed as `b965a5756`. Lint, build, and separate post-build TypeScript passed. No frontend deployment has run.

The original seed orchestrator used invalid short function references. Its error handling could return without required data. Repair `1cde40221` maps the existing 67 calls to their registered modules. The handler, seed order, and lesson content are unchanged. The real handler regression failed before the repair. After the repair, 10 focused tests and 837 related tests passed. Lint, build, and separate post-build TypeScript passed. Parent and independent review accepted the exact two-file patch.

Before seeding, a read-only remote query confirmed zero lessons, standards, and activities. The repaired orchestrator was deployed. The remote seed returned success at the command level. Only Lesson 1.6 loaded. The other 51 lesson seeds failed: 49 activity-props errors and two phase-section-content errors. All 44 standards loaded. One of 79 lesson-standard relations loaded. Stored data contains 44 objective policies, 89 practice variants, three practice items, one class, and five enrollments. The demo created seven profiles, including six students. It created zero progress rows. These results are partial bootstrap evidence. The helper result semantics and remaining lesson failures require review.

The separate local browser database remains available. Its browser test is paused. The main working tree contains unrelated changes. They remain intact. Only the main checkout is registered with Git.
