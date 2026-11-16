# G3 IM1 Module 2 Source Implementation Review

Date: 2026-09-07.

This review compares the current Module 2 graph changes with the class-period plan, the seven lesson source files, the extraction parser, and the inventory assembler. It does not approve readiness or curriculum rows.

## Review decision

The six restored objective nodes match the current authored objectives. Their draft status, IDs, lesson containment, and lack of readiness fields are correct. The minimal blueprints are necessary because the graph stores exact example identity on blueprint `sourceNodeIds`. They correctly avoid invented Worked, Guided, or Independent specifications.

The example mapping is not ready to integrate. The test assigns generated occurrence IDs to duplicated class-period references. These IDs do not consistently identify the actual lesson example. The 2i mapping is materially wrong and does not support the restored objective text.

## Restored objective nodes

The following objectives match the class-period plan and lesson source:

- 2b: translate equations and formulas into verbal sentences and interpret formulas.
- 2d: write and solve one-step contextual equations and identify the property used.
- 2f: solve literal equations and equations that use distribution.
- 2h: classify one-solution, no-solution, and identity equations and apply equations to geometry.
- 2l: apply proportions to percent, scale, and mixture contexts.
- 2n: use dimensional analysis and formulas in applications.

Each new node is an exact full-row copy in `nodes.json`, `draft-nodes.json`, and the embedded `edges.json` node list. The focused test checks full equality only for these new rows. This is appropriate. Existing nodes can have older fields that are outside G3.

Each new node stays `draft`. Each has one draft lesson `contains` edge. No new prerequisite, alignment, renderer, generator, or readiness edge was added. No node sets `independentPracticeReady: true`.

The minimal blueprint rows contain source IDs, a generator exception, draft status, and lesson metadata. They contain no empty teaching specifications. Keep this form. Do not add placeholder mode specifications to make projection counts increase.

## Assembler identity defect

`assembleDraftInventory` uses one increasing `globalExampleIdx`. It creates a new worked-example node for every example occurrence in every class-period row. It does not deduplicate by lesson reference and example number.

Module 2 repeats some source examples across adjacent objective rows:

- Lesson 2-3 Example 2 appears for both 2e and 2f.
- Lesson 2-5 Example 3 appears for both 2i and 2j.
- Lesson 2-6 Example 3 appears for both 2k and 2l.

The generated graph therefore gives two IDs to each repeated actual example. The title and metadata can describe the same source example under different occurrence IDs. A blueprint that selects one side of this duplicate does not establish a canonical source identity.

## Incorrect 2i mapping

The class-period plan assigns 2i to Lesson 2-5 Examples 1 through 3:

- Example 1: solve and graph simple absolute-value equations.
- Example 2: identify equations with no solution.
- Example 3: apply absolute value to a real-world problem.

The current generated graph has only these Lesson 2-5 example nodes:

- `math.im1.example.2.5.020`, titled as Example 3 under the 2j occurrence.
- `math.im1.example.2.5.021`, titled as Example 4.

Examples 1 and 2 are absent. The current 2i blueprint maps only to `.020`. This row cannot support the full 2i meaning. It omits solving examples and the required no-solution example. It also uses the duplicate occurrence generated from the neighboring 2j row.

The restored 2i title and description are correct. Preserve its current ID and draft status. Correct the assembler output so Lesson 2-5 Examples 1, 2, 3, and 4 each have one unambiguous identity. Then map 2i to Examples 1, 2, and 3. Map 2j to Examples 3 and 4. Do not create a second skill ID for the repaired text.

## Other ambiguous mappings

The current test maps 2e to `.012` and `.013`, while 2f maps only to `.015`. The real source assigns Example 2 to both objectives. The graph also has `.014` as a second occurrence of Example 2. Choosing `.013` for 2e and omitting `.014` from 2f hides the duplicate instead of resolving it.

The current test maps 2k through `.022`, `.023`, and `.024`, while 2l maps only to `.026`. The real source assigns Example 3 to both objectives. The graph also has `.025` as a second occurrence of Example 3. Again, the mappings select occurrence-side IDs instead of one source example identity.

Resolve these duplicates at extraction or assembly. Use one stable ID for each `(course, lesson, exampleNumber)` source example. Both applicable objective blueprints can reference the same canonical example node. Do not infer that a repeated example is two different pieces of source evidence.

The other mappings agree with the source ranges:

- 2a uses Lesson 2-1 Examples 1 through 3.
- 2b uses Lesson 2-1 Examples 4 through 6.
- 2c uses Lesson 2-2 Examples 1 and 2.
- 2d uses Lesson 2-2 Examples 3 through 5.
- 2g uses Lesson 2-4 Examples 1 and 2.
- 2h uses Lesson 2-4 Examples 3 and 4.
- 2m uses Lesson 2-7 Examples 1 through 4.
- 2n uses Lesson 2-7 Examples 5 through 7.

These range matches remain subject to the canonical example-ID repair.

## Test assessment

`module-2-graph-source.test.ts` passes all four tests. The test proves internal agreement with the edited JSON. It does not prove source identity because it validates only that a referenced node is a worked example in the same lesson. It does not compare `metadata.exampleNumber`, the lesson heading, or the expected capability.

Strengthen the mapping test after the assembler repair:

- Assert one node for each lesson and example number.
- Assert the exact `metadata.exampleNumber` for every source ID.
- Assert the exact source heading or source location.
- Assert that shared source examples use the same node ID in both blueprints.
- Assert that 2i includes Examples 1, 2, and 3.
- Assert that 2j includes Examples 3 and 4.
- Assert that no readiness field or active runtime mapping changes.

## Safe conclusion

Keep the six new draft nodes, their exact copies, their draft containment edges, and their minimal blueprints. Keep the corrected 2i text on its existing ID. Do not integrate the current example mappings until the assembler gives repeated actual examples one canonical identity and restores the missing 2i Examples 1 and 2.

Focused verification result: `module-2-graph-source.test.ts` passed 4 tests. This Green result confirms the current fixture contract only. It does not resolve the source-identity defect.
