# Integrated Math 1 Lesson 4-2 Independent Review

Date: 2026-09-07

Scope: Lesson 4-2 graph source correction. This review does not approve curriculum content.

## Decision

The six new capability nodes match explicit Lesson 4-2 goals. They are useful assessment units. They are not incidental calculation steps.

All six nodes remain `draft`. Their `independentPracticeReady` value is false. Their blueprints contain source links only. The change does not add practice specifications, generators, alignments, prerequisites, or approval.

No blocking source defect was found.

## Capability review

The source and class-period plan support these separate capabilities:

- Calculate rate of change from a table.
- Calculate rate of change from a graph.
- Calculate rate of change from real-world data.
- Determine linearity from a constant rate of change.
- Compute slope through two points.
- Solve for an unknown coordinate from two points and a target slope.

The separation matches the evidence that each capability requires.

Table evidence must identify two coordinate pairs and calculate `change in output / change in input`. Graph evidence must first read coordinates from axes and then calculate the ratio. These are different input demands.

Linearity evidence must calculate rates across more than one pair and compare them. One slope calculation is only an internal step. It is not sufficient evidence for linearity.

Two-point slope evidence must support positive, negative, zero, undefined, integer, and fractional results. Unknown-coordinate evidence must construct a slope equation and solve a linear equation. These are separate performance demands.

Real-world-data calculation is an explicit Lesson 4-2 goal and part of objective 4c. The lesson does not provide one standalone worked-example body that isolates this capability. Examples 1 and 2 add context as part of table or graph work. The empty `sourceNodeIds` list is therefore correct. It prevents incidental context steps from becoming false direct evidence.

Example 10 supports the separate interpretation capability. The restored link from `math.im1.example.4.2.011` to the existing contextual interpretation blueprint is exact. It covers grade, elevation, and positioning.

## Worked-example identities

The titles for Examples 1 through 6 now match the lesson headings:

- Example 1: table rate of change
- Example 2: graph rate of change
- Examples 3 and 4: determine linearity
- Examples 5 and 6: slope through two points

The new source identities restore Examples 7 through 9 without changing occupied IDs:

- `math.im1.example.4.2.012`
- `math.im1.example.4.2.013`
- `math.im1.example.4.2.014`

Examples 7 and 8 belong to the source section `Examples 5 through 8 — Find the Slope Through Two Points`. Example 9 has its own unknown-coordinate section. Existing Example 10 keeps ID `math.im1.example.4.2.011`.

The four slope examples map only to the two-point slope capability. Example 9 maps only to the unknown-coordinate capability. The mapping does not use title similarity to connect unrelated skills.

The extracted lesson groups Examples 5 through 8 in one body. It does not preserve four separate numeric prompts. The graph can record the four source identities and their common capability. It must not generate distinct problem content from these nodes until the original source prompts or reviewed replacements are available.

## Graph structure

Each new capability and restored example has one draft containment edge from `math.im1.lesson.4.2`. The change adds no prerequisite edge. This is correct because the source describes lesson order, not a reviewed dependency claim.

The older 4c and 4d nodes remain broad objective aggregators. The new atomic nodes do not replace or approve those existing rows. No exact duplicate atomic node ID or title was found elsewhere in the current node catalog.

All new capability copies match across the canonical, draft, embedded-edge, and standard-edge node catalogs. The new source identities are unique in those catalogs.

## Verification

I ran `__tests__/curriculum/lesson-4-2-capabilities-source.test.ts` in the Integrated Math 1 app.

Result: one test file passed. All four tests passed.

The test checks all ten example identities and titles, the six draft capability copies, inactive readiness, exact source-only blueprints, containment-only edges, and the exact Example 10 context link.

The current test confirms the aggregate source headings for Examples 3 through 8. It cannot verify separate numeric prompt bodies for Examples 7 and 8 because the extracted lesson does not contain them. This is a source-detail limit, not a graph identity defect.
