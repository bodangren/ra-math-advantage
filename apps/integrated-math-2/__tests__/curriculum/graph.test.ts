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
it("uses canonical standards with real definitions and valid trigonometry clusters", () => {
  const standards = graph.nodes.filter((node) => node.kind === "standard");
  const codes = standards.map((node) => node.metadata?.code);
  expect(new Set(codes).size).toBe(codes.length);
  for (const standard of standards) {
    expect(standard.id).not.toMatch(/\.hs[afgns]-/);
    expect(standard.title).not.toContain("(placeholder)");
    expect(standard.description).not.toContain("definition not yet available");
    expect(standard.id).not.toMatch(/f-tf-c-[67]$/);
  }
});
it("maps each source worked example to one graph node with its actual title", () => {
  const expected = lessons.flatMap((lesson) =>
    lesson.phases
      .filter((phase) => phase.phaseType === "worked_example")
      .map((phase) => ({
        key: `${lesson.unitNumber}.${lesson.orderIndex}.${phase.phaseNumber}`,
        title: phase.title,
        source: `apps/integrated-math-2/curriculum/modules/${lesson.slug}`,
      })),
  );
  for (const nodes of [
    graph.nodes,
    inventory.nodes,
    draft.nodes,
    standardGraph.nodes,
  ]) {
    const examples = nodes.filter((node) => node.kind === "worked_example");
    expect(examples).toHaveLength(expected.length);
    for (const example of expected) {
      const node = examples.find(
        (item) =>
          `${item.metadata?.module}.${item.metadata?.lesson}.${item.metadata?.phaseNumber}` ===
          example.key,
      );
      expect(node?.title, example.key).toBe(example.title);
      expect(node?.sourceRefs, example.key).toContain(example.source);
    }
  }
});
it("does not use lesson-order guesses as prerequisite requirements", () => {
  const prerequisites = graph.edges.filter(
    (edge) => edge.type === "prerequisite_for",
  );
  expect(prerequisites.length).toBeGreaterThan(0);
  for (const edge of prerequisites) {
    expect(edge.reviewStatus).toBe("reviewed");
    expect(edge.derived).toBe(false);
    expect(edge.rationale).not.toContain("Lesson-sequence prerequisite");
  }
});
it("gives every source lesson at least one linked objective candidate", () => {
  for (const lesson of lessons) {
    const parent = `math.im2.lesson.${lesson.unitNumber}.${lesson.orderIndex}`;
    const skills = graph.nodes.filter(
      (node) =>
        node.kind === "skill" &&
        node.metadata?.module === String(lesson.unitNumber) &&
        node.metadata?.lesson === String(lesson.orderIndex),
    );
    expect(skills.length, lesson.slug).toBeGreaterThan(0);
    expect(
      graph.edges.some(
        (edge) =>
          edge.type === "contains" &&
          edge.sourceId === parent &&
          skills.some((skill) => skill.id === edge.targetId),
      ),
      lesson.slug,
    ).toBe(true);
  }
});
