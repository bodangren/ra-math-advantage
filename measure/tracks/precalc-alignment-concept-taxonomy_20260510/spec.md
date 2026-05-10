# Architectural Specification: PreCalc Standards Alignment & Concept Taxonomy

## Objective
Remediate the tech debt surrounding PreCalculus standards mapping and define the graph resolution algorithm for Concept nodes.

## 1. PreCalc Standards Alignment Script
- **File:** `scripts/align-precalc-standards.ts`
- **Architecture:**
  Write a one-off Node.js script to read `apps/pre-calculus/curriculum/skill-graph/edges.json`. The curriculum author will provide a CSV or JSON mapping of `skillId -> cedStandardId`. The script will overwrite the `aligned_to_standard` edges, upgrading their `confidence` to `"high"` and `reviewStatus` to `"reviewed"`.

## 2. Concept Node Resolution Algorithm
- **Architecture Decision:**
  Concept nodes (e.g., ALEKS topics) are aggregators. They **do not** have `KnowledgeBlueprint` records. If a student's learning state dictates they must practice a `concept`, the practice projection engine must dynamically resolve this into a concrete `skill`.
- **Target File:** `packages/knowledge-space-practice/src/projections/activity-map.ts`
- **Algorithm (in `projectActivityMap`):**
  ```typescript
  if (node.kind === 'concept') {
    // 1. Find all edges where sourceId === conceptId and target.kind === 'skill' (e.g., 'supports' or 'contains')
    const childSkills = findChildSkills(graph, node.id);
    // 2. Select a skill deterministically using the seed (or randomly at runtime if generating a session)
    const selectedSkill = selectSkill(childSkills, seed);
    // 3. Look up the blueprint for the *selectedSkill*
    const blueprint = blueprints.find(b => b.nodeId === selectedSkill.id);
    // 4. Emit the activity map row using the child's blueprint, but maintaining the Concept's provenance
    return createActivityRow(node.id, blueprint);
  }
  ```

## 3. Blueprint Remediation
- **Target Files:** `apps/integrated-math-3/curriculum/skill-graph/**/blueprints.json`
- **Action:** Delete all blueprint objects where `nodeId` contains `.concept.`. The updated projection engine will handle them gracefully.