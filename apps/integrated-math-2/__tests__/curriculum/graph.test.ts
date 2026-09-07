// @vitest-environment node
import { it, expect } from "vitest";
import graph from "../../curriculum/skill-graph/edges.json";
import inventory from "../../curriculum/skill-graph/nodes.json";
import draft from "../../curriculum/skill-graph/draft-nodes.json";
import standardGraph from "../../curriculum/skill-graph/standard-edges.json";
import lessons from "../../curriculum/lessons.json";
it("includes every current lesson with the correct title and source path in both graph files", () => {
  for (const nodes of [
    graph.nodes,
    inventory.nodes,
    draft.nodes,
    standardGraph.nodes,
  ]) {
    const units = nodes.filter((node) => node.kind === "instructional_unit");
    expect(units).toHaveLength(96);
    for (const lesson of lessons) {
      const node = units.find(
        (node) =>
          node.id ===
          `math.im2.lesson.${lesson.unitNumber}.${lesson.orderIndex}`,
      );
      expect(node?.title, lesson.slug).toBe(lesson.title);
      expect(node?.sourceRefs, lesson.slug).toContain(
        `apps/integrated-math-2/curriculum/modules/${lesson.slug}`,
      );
    }
  }
  for (const lesson of lessons)
    expect(
      graph.edges.some(
        (edge) =>
          edge.type === "contains" &&
          edge.sourceId === `math.im2.module.${lesson.unitNumber}` &&
          edge.targetId ===
            `math.im2.lesson.${lesson.unitNumber}.${lesson.orderIndex}`,
      ),
      lesson.slug,
    ).toBe(true);
});
it("does not use the nonexistent conditional probability cluster C", () => {
  expect(JSON.stringify(graph)).not.toContain("s-cp-c-9");
});
