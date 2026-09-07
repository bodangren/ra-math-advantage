# IM3 selected queue runtime implementation

Date: 2026-09-08

The queue now supplies the physical activity identifier for each resolved activity.

A selected claim comes from the card objective, card variant, practice item variant, activity stable identifier, or activity node. All selected identities must agree. The current node and blueprint must be approved. The physical activity must be approved. Its component, SRS setting, table-and-graph props, and grading fields must match. The queue excludes a selected row when one check fails. It does not send that row through the generic path.

The queue supplies the selected practice mode. `PracticeCardRenderer` sends Guided mode and all activity props through `ActivityRenderer`. The app graph wrapper now forwards the selected domain, range, and `table_graph` response variant to the shared graph component.

`PracticeCardRenderer` forwards an existing `practice.v1` envelope. It does not wrap that envelope as an answers object. The focused test preserves the two canonical parts and their hint counts. Raw legacy payloads keep the existing wrapper behavior.

The focused run passed 41 tests. Tests cover approved, unreviewed, withdrawn, changed-identity, changed-props, and changed-grading queue rows. A selected-node card cannot use a generic activity. Tests also cover physical activity identity, Guided mode, full-envelope forwarding, and the integrated provider boundary. Lint passed. The isolated-source TypeScript check passed. The application build passed.

The composition test uses the real queue resolver, `PracticeCardRenderer`, `ActivityRenderer`, the app graph wrapper, and the shared `GraphingExplorer`. It enters the five table values. It clicks the two Guided hints. It plots the five points through the real graph canvas event. The selected server grader accepts the emitted envelope and gives a score of 2 out of 2.

This patch covers the daily practice queue. The lesson phase query still needs a separate connection for the selected Worked activity. The committed lesson query returns raw phase sections without the selected activity identity fields. This test does not claim a browser journey or a lesson Worked connection.
