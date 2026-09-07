# Shared graph submission review

Status: Shared table-and-graph repair committed as `4146100a`. App integration remains in progress.

The table-and-graph activity reported a saved submission before its storage callback completed. The wrapper hid callback failures. The repair waits for storage. It blocks repeated clicks while a save is pending. It shows a retry message after failure. It does not report success when the writer is missing.

Independent review found that the rendered answer keys differed from the server contract. The renderer now sends `table_values` and `placed_points` in both answers and parts. The graph artifact keeps its existing display-state fields.

The table also disappeared when the final cell was filled. Deferred practice now keeps the table available for correction. Clearing a cell invalidates the previous table response and removes the submit action until the table is complete.

Three delayed-storage tests failed before the repair and passed after it. The app contract and table-correction tests exposed two further failures. Seven app graph tests now pass. The shared graph suite passes 31 tests. Shared lint, standalone TypeScript, and build pass. The app wrapper and practice-session suites previously passed 105 tests after the delayed-save correction. The final app lint, standalone TypeScript, and build check passed.

The UI test uses independently solved values for `y = -x^2 - 1`. It no longer copies the generator answer. A separate rendered-UI-to-production-writer test now passes. It records a score of 1/2 for a correct table and incorrect graph, and 2/2 for a correct table and graph. The extracted shared patch passed seven tests, lint, TypeScript, and build against the HEAD source in an isolated snapshot. The real graph node remains draft.
