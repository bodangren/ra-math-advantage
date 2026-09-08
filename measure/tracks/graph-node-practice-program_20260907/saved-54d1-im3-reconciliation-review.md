# Saved worktree 54d1 IM3 reconciliation review

Result: Do not integrate any of the seven changed graph files from this worktree.

Saved worktree: `/Users/daniel.bodanske/.codex/worktrees/54d1/ra-math-advantage`

Saved HEAD: `106e1cb29e48540406857732745c6335a31f6a47160`

Relevant current track: `measure/tracks/mastery-advantage-graph-remediation_20260821/plan.md`

## Exact changed IM3 paths

1. `apps/integrated-math-3/curriculum/skill-graph/__tests__/pilot-projection.test.ts`
2. `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`
3. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
4. `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
5. `apps/integrated-math-3/curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json`
6. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
7. `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`

All seven files differ from current main. None contains a complete state that main should accept.

## Semantic reconciliation

### Lesson 1.1 graph-quadratic blueprint

The saved blueprint has useful source-backed Worked content for `math.im3.skill.1.1.graph-quadratic-functions`. Current main already preserves that Worked prompt and the Example 1 source identity.

The saved row also has six broad standard alignments, a key-features Guided task, a four-feature Independent task, a six-point rubric, and three activity projections. The current remediation track narrowed this skill to graphing from a table and stating domain and range. Current main aligns it only to `HSF-IF.C.7a` and uses corrected modality contracts. Tasks M1-G, M1-S6D, and later projection tasks record this accepted state.

Recommendation: Treat the saved Lesson 1.1 row and its projected activities as superseded. Do not copy its blueprint, node, test, or projections.

### Lesson 1.2 Example 5 physics row

The saved node adds the PDF page 16 source reference to `math.im3.example.1.2.011`. Current main already has the same reference and a more exact source title and complete raw text. The source-reference addition is therefore preserved.

The saved blueprint maps `interpret-solutions-roots-in-context` only to Example 5 and adds Worked, Guided, and Independent modalities. Current main maps the capability to the accepted Example 4 and Example 5 source identities. It keeps source-faithful Worked and Guided contracts and omits the saved generic Independent contract. Commit `4e8eca97b` and the current graph-remediation plan own this reconciliation.

The saved Independent row requests generic intercepts for the source football equation. It does not preserve the accepted contextual interpretation response. It would broaden the capability and conflict with current source ownership.

Recommendation: Treat the saved Lesson 1.2 blueprint, node text, test assertions, and projections as superseded. Do not integrate the Independent activity.

### Root mirrors and projection files

The root `nodes.json` and `blueprints.json` repeat the same stale Lesson 1.1 and Lesson 1.2 records. The module and course activity maps are generated from those stale records. They contain no separate authored capability.

Recommendation: Do not merge individual rows from these four files. Keep the current synchronized root and module catalogs and their current projections.

## Preservation decision

No unique valid authored graph change remains to integrate from this saved worktree.

The only clearly valid source addition, the page 16 PDF reference for Example 5, already exists in current main. Current main also contains the accepted exact source title, raw text, source identities, narrowed Lesson 1.1 capability, corrected Lesson 1.2 source mapping, and later projection work.

Keep unrelated dirty files outside this review. This review does not authorize deletion of the saved worktree. For the seven listed IM3 graph paths, the bounded action is to record them as superseded and integrate nothing.
