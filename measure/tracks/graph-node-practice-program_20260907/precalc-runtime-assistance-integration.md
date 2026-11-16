# Selected interval assistance integration

The selected interval activity now has per-part hint and answer controls. Each part records assistance and input-change counters. The parent preserves these counters and removes client grading fields.

All three answers must contain text before submission. A blank attempt remains editable. The first valid submission immediately freezes the answers and assistance state. An ambiguous failure preserves the frozen request for parent retry. A new attempt clears this state.

Parent verification passed 105 tests: 12 component tests, 8 parent acceptance tests, 42 writer tests, 20 evidence tests, and 23 route tests. App lint, build, and post-build standalone TypeScript passed. All 21 workspace packages resolve within the candidate from the app. Independent review accepts the four-path change.

The author reports one existing full-package schema test failure outside this change. The test expects a blank without a correct answer to fail. This integration does not change that schema contract. Actual browser assistance and persisted rating verification remain open.
