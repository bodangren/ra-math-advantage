# BM2 event writer dependency review

Date: 2026-09-07

This review covers the Business Math 2 accounting-equation event writer.

## Catalog dependency

The writer publication check imports these complete files:

- `apps/bus-math-v2/curriculum/skill-graph/nodes.json`
- `apps/bus-math-v2/curriculum/skill-graph/blueprints.json`

The writer does not import the edge catalog or the activity-map projection.

The current Git `HEAD` has no Business Math skill-graph directory. The pending graph files are untracked. Task 3.5 is open. Do not add the complete catalogs only to satisfy the writer import.

The committed `pilot-source-review.md` verifies the selected node, lesson, old blueprint, and evidence policy. It also records that the old blueprint uses `notebook-organizer` and has no Guided specification. The committed `investigation.md` verifies graph counts. It states that populated graph data does not prove correctness. These reviews do not accept all 89 pending node and blueprint rows.

The current event publication check stays false. The current blueprint does not identify the event component or all three event specifications. Complete Task 3.5 before the catalog commit. Do not create a reduced catalog for this writer.

## Authentication boundary

The assessment route uses `requireActiveStudentRequestClaims`. This function verifies the session against the active credential. It checks the profile identifier, username, and role.

The internal event writer must also reject an inconsistent profile and credential. The clean `HEAD` patch now requires all these conditions:

- The profile role is `student`.
- The credential is active.
- The credential role is `student`.
- The credential username equals the profile username.
- The credential organization equals the profile organization.

The focused tests first failed for credential role, username, and organization mismatches. The guard then made all three tests pass. The complete writer and route run passed 22 tests. The app lint passed.

The clean writer patch is `/tmp/bm2-event-writer-route-head.patch`. The schema prerequisite patch is `/tmp/bm2-event-schema-prerequisite-head.patch`. Both patches apply to the current `HEAD` index.
