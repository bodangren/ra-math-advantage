# Guided graph hint telemetry repair

The real table-and-graph component offered Guided hints but omitted their count from its submitted parts. The regression uses the real table, canvas, and HintPanel. Two displayed hints produced undefined counts before the repair.

The component now records the graph hint count on `placed_points`. It records zero on `table_values`. This counts each displayed hint once. The knowledge-space specification sums hint counts across parts in section 8.4. Two hints must not become four hints. Independent practice offers no HintPanel and submits zero counts.

The source fields, answers, part identities, and private grading contract remain intact. Nine related tests, package lint, standalone TypeScript, and package build pass. The two changed emission lines execute in the new regression. Server grading and the final learning-policy effect remain under separate verification in Task Q11. The root workspace test command was started in error and stopped; its output does not support these package results.
