# Review evidence

These files record the local IM2 review on 2026-09-07. They contain no live student records. The handler probe uses synthetic accounts and mock storage. It reduces password iterations for the test. It uses the real shared password implementation. The probe is a diagnostic tool, not a production test suite.

Run the scripts from the repository root. They use installed dependencies. Do not install packages to run this review.

```sh
node measure/tracks/im2-complete-review_20260907/evidence/handler-probe.cjs
node measure/tracks/im2-complete-review_20260907/evidence/graph-probe.cjs
python3 measure/tracks/im2-complete-review_20260907/evidence/inventory.py
```

The handler probe writes temporary seed observations under `/tmp/im2-review-*`. It does not connect to Convex. It lets module 9 and 10 code read local source files. That is deliberately more permissive than the mutation runtime. Its module 13 partial rows reflect mock storage without rollback. A real Convex mutation would roll them back.

The graph probe runs the installed blueprint schema and structural validator against current files. The inventory script reads lesson sources, original DOCX packages, schedule packages, and graph projections. Its title comparison is a text comparison, not a judgment that every different title changes the mathematics.

The logs retain the test, lint, backend type, build, schema, handler, inventory, and dependency-audit results. The app type check passed with no output. No production request, database write, deployment, dependency update, or application fix was made.

The audit command was `npm audit --workspace=apps/integrated-math-2 --omit=dev --json`. The shared lockfile affects its scope. Advisory reachability remains a separate task.
