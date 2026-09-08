import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const graph = resolve(root, "curriculum/skill-graph");
const read = (name: string) => JSON.parse(readFileSync(resolve(graph, name), "utf8"));
const nodes = read("nodes.json").nodes;
const edges = read("edges.json").edges;
const blueprints = read("blueprints.json").blueprints;
const activityMap = read("projection/practice-v1-activity-map.json");
const srs = read("projection/srs-input.json").srsInputs;

const slugs = [
  "derive-a-supported-conclusion-from-stated-axioms-and-facts",
  "author-axioms-from-observed-categorical-data",
  "evaluate-whether-a-supplied-candidate-model-satisfies-every-stated-axiom",
  "construct-a-model-that-satisfies-stated-incidence-constraints",
  "evaluate-whether-stated-conclusions-follow-from-axioms-and-diagnose-an-invalid-inference",
];
const ids = slugs.map((slug) => `math.im1.skill.10.1.${slug}`);
const classifier = "math.im1.skill.10.1.differentiate-between-synthetic-geometry-and-analytic-geomet";
const roles = "math.im1.skill.10.1.understand-the-structure-of-an-axiomatic-system-and-distingu";

describe("Lesson 10-1 capability graph", () => {
  it("adds exactly five draft inactive atoms and preserves approved broad skills", () => {
    expect(ids.map((id) => nodes.find((node: { id: string }) => node.id === id)?.reviewStatus)).toEqual(Array(5).fill("draft"));
    expect(ids.map((id) => nodes.find((node: { id: string }) => node.id === id)?.independentPracticeReady)).toEqual(Array(5).fill(false));
    expect(nodes.filter((node: { id: string }) => node.id.startsWith("math.im1.skill.10.1.") && ids.includes(node.id))).toHaveLength(5);
    expect(nodes.find((node: { id: string }) => node.id === classifier).reviewStatus).toBe("approved");
    expect(nodes.find((node: { id: string }) => node.id === roles).reviewStatus).toBe("approved");
  });

  it("preserves exact example identities and binds only applicable example evidence", () => {
    const byId = (id: string) => blueprints.find((blueprint: { nodeId: string }) => blueprint.nodeId === id);
    expect(nodes.find((node: { id: string }) => node.id === "math.im1.example.10.1.001").title).toBe("Example 1: Draw Conclusions from Axioms");
    expect(nodes.find((node: { id: string }) => node.id === "math.im1.example.10.1.002").title).toBe("Example 2: Classify Synthetic and Analytic Geometry");
    expect(byId(ids[0]).sourceNodeIds).toEqual(["math.im1.example.10.1.001"]);
    expect(byId(classifier).sourceNodeIds).toEqual(["math.im1.example.10.1.002"]);
    expect(nodes.some((node: { id: string }) => node.id.startsWith("math.im1.example.10.1.003"))).toBe(false);
  });

  it("records exact response and manual-review boundaries", () => {
    const refs = (index: number) => nodes.find((node: { id: string }) => node.id === ids[index]).sourceRefs.join(" ");
    expect(refs(0)).toContain("score each requested conclusion separately");
    expect(refs(0)).toContain("all stated premises");
    expect(refs(2)).toContain("full three-route system");
    expect(refs(2)).toContain("selected failing diagram and cited axiom");
    expect(refs(2)).toContain("curved lines are allowed");
    expect(refs(3)).toContain("no requirement that all points lie on lines");
    expect(refs(3)).not.toContain("curved lines are allowed");
    expect(refs(4)).toContain("all three judgments");
    expect(refs(4)).toContain("two valid and one invalid");
  });

  it("removes placeholder execution data and the unsupported lesson-sequence edge", () => {
    for (const id of [classifier, roles]) {
      const blueprint = blueprints.find((item: { nodeId: string }) => item.nodeId === id);
      expect(blueprint.workedExampleSpec).toBeUndefined();
      expect(blueprint.guidedPracticeSpec).toBeUndefined();
      expect(blueprint.independentPracticeSpec).toBeUndefined();
      expect(activityMap.activities.filter((item: { nodeId: string }) => item.nodeId === id)).toEqual([]);
    }
    expect(edges.some((edge: { id: string }) => edge.id === "math.im1.edge.1192")).toBe(false);
    const nextSkill = "math.im1.skill.10.2.draw-and-label-figures-that-accurately-represent-given-geome";
    for (const rows of [srs, activityMap.srsInputs]) {
      expect(rows.find((item: { nodeId: string }) => item.nodeId === nextSkill).prerequisites).not.toContain(roles);
    }
  });
});
