# IM3 quadratic-formula real local verification

Source commit: `e4c9f6889`.

This record comes from a disposable loopback Convex backend. It uses the actual registered queries, mutations, database, and transaction retries. The fixture is local-only. It does not change curriculum approval or publish learner content.

The `evidence/` directory contains CLI results and complete synthetic record snapshots. The initial runner completed through the successful seed rerun. The CLI printed no JSON for its null result. `runner.log` records the resulting parser error. `resume-verification.py` reads the prior real result files and completes the remaining checks without reseeding. `resume.log` and `evidence/result.json` record success. The final runner handles this explicit null result.

`backend-concurrency.log` contains actual conflict retry lines for Start, finalization, and shared relation creation. The rollback snapshots include full private variants and system record fields. Direct equality checks passed for both rollbacks, repeated exhausted Start, and seed rerun. No content hash is used as a correctness test.

The first local push failed the existing Convex-specific TypeScript configuration. The test temporarily added installed Node types and the app path alias. Later pushes passed with type checking enabled. The original configuration and generated files were restored before source integration.

To repeat the full test, use a fresh local database. Copy the fixture temporarily into the matching app Convex directory. Use the cached backend bound to loopback and explicit self-hosted environment variables. Supply the key through a permission-restricted file. Run the full runner once. Do not run the historical continuation after a fresh full run. Do not seed an existing test database again. Remove the fixture and local settings after verification.

No administrator key, credential record, database, or storage directory is included. These results prove the bounded local transaction contract. They do not prove browser behavior, learner approval, or complete course coverage.
