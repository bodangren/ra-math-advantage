# IM3 selected evidence backend implementation

Date: 2026-09-07

## Scope

This patch adds the backend evidence flow for `math.im3.skill.1.1.graph-quadratic-functions` only.

The patch adds these boundaries:

- A learner route accepts one authenticated submission identifier.
- A teacher route accepts one authenticated teacher attestation.
- The Convex handler reads the physical submission and activity rows.
- The handler checks the selected node, stable activity identifier, component, mode, attempt ordinal, stored grade, and canonical part grades.
- The teacher handler checks the approved current publication, exact Worked source, organization, class, enrollment, assignment time, and current published lesson phase.
- The teacher candidate output uses a fixed human-readable description. It does not return the stored submission envelope.
- The evidence write and receipt write use the current Convex mutation transaction.
- The existing `learningEvidenceFingerprintV1` function supplies the required stored fingerprint.
- The SRS bridge reads the stored selected submission. It does not reconstruct an unassisted response.

The current curriculum node and blueprint remain draft. Production publication checks therefore fail closed.

## Exact source contract

The Worked source uses `f(x) = x^2` and `plot_from_equation`.

The Worked acknowledgement has exactly eight `practice.v1` envelope keys. The handler rejects optional artifact and timing fields.

Guided and Independent submissions use `table_values` and `placed_points`. Each answer contains five finite points. Each stored part must match its answer and server grade. The aggregate score must equal the part score sum.

The selected graph UI does not support reveal actions. The evidence boundary rejects stored nonzero reveal telemetry. It preserves stored hint counts. Two hints cap a correct review at `Good`. Three hints cap it at `Hard`.

## Verification

The focused test command passed 63 tests in five files. These tests cover the real selected submission writer, teacher attestation, receipt replay, evidence history, SRS writes, route authentication, route error privacy, exact Worked source fields, extra Worked envelope fields, stored grade parity, two hints, three hints, unsupported reveal telemetry, physical approval withdrawal, physical mode changes, selected content changes, selected grading changes, and the exact candidate stable activity ID.

The final evidence boundary now compares current Guided and Independent activity props and grading configuration with the committed selected seed builders. It requires current physical approval. It requires the reviewed absence of `learningEvidenceMode` for these two seeded modes. It also requires the stored `practice.v1` contract. The Worked candidate query requires the exact selected stable activity ID.

`npm run lint` passed.

A standalone TypeScript check passed with a temporary path override to the scratch `practice-core` source. The scratch root reuses the main workspace `node_modules` link. That link resolves `@math-platform/practice-core` to the current main source, which does not yet export the HEAD `learningEvidenceFingerprintV1` function. The normal scratch TypeScript command also reports the existing missing `cloudflare/dist/server/index.js` build artifact. These two errors do not occur with the isolated HEAD source path and the Cloudflare generated file excluded.

The earlier focused coverage run used the normalized `/private/tmp` root. It reported 85.47% statement coverage, 82.23% branch coverage, 93.75% function coverage, and 88.62% line coverage across the selected backend and two routes. Coverage was not rerun after the five boundary regressions.

## Integration order

1. Apply the selected evidence schema and backend patch.
2. Regenerate Convex API types instead of keeping the two-line generated API change if the integration workflow runs Convex code generation.
3. Apply the learner and teacher routes.
4. Run the five focused test files with the repository package links resolved to the integrated tree.
5. Run app lint, TypeScript, and build checks.

Teacher UI is outside this patch.
