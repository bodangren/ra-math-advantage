import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const graph = resolve(root, "curriculum/skill-graph");
const read = (name: string) => JSON.parse(readFileSync(resolve(graph, name), "utf8"));
const nodes = read("nodes.json").nodes;
const edges = read("edges.json").edges;
const ids = [
  "determine-a-named-center-statistic-after-adding-a-constant",
  "determine-a-named-spread-statistic-after-adding-a-constant",
  "determine-a-named-center-statistic-after-multiplying-by-a-constant",
  "determine-a-named-spread-statistic-after-multiplying-by-a-constant",
  "determine-a-named-center-statistic-after-an-ordered-affine-transformation",
  "construct-a-data-table-with-a-specified-mean",
  "evaluate-which-sample-appears-more-representative-using-sample-evidence",
  "make-a-contextual-choice-from-compared-distributions",
  "compare-the-information-shown-by-histograms-and-box-plots",
  "update-an-overall-mean-after-equal-changes-to-a-subgroup",
].map((slug) => `math.im1.skill.9.6.${slug}`);

describe("Lesson 9-6 capability graph", () => {
  it("contains exactly the ten accepted draft capabilities", () => {
    expect(ids.map((id) => nodes.find((node: { id: string }) => node.id === id)?.reviewStatus)).toEqual(Array(10).fill("draft"));
    expect(nodes.some((node: { id: string }) => node.id.includes("ordered-affine") && node.id.includes("spread"))).toBe(false);
    const blueprints = read("blueprints.json").blueprints;
    expect(blueprints.find((row: { nodeId: string }) => row.nodeId === ids[0]).sourceNodeIds).toEqual(["math.im1.example.9.6.019"]);
    expect(blueprints.find((row: { nodeId: string }) => row.nodeId === ids[2]).sourceNodeIds).toEqual(["math.im1.example.9.6.020"]);
  });

  it("preserves the four exact source identities", () => {
    expect(nodes.find((node: { id: string }) => node.id.endsWith("9.6.019")).title).toBe("Example 1");
    expect(nodes.find((node: { id: string }) => node.id.endsWith("9.6.020")).title).toBe("Example 2");
    expect(nodes.find((node: { id: string }) => node.id.endsWith("9.6.021")).title).toBe("Examples 3 and 4");
    expect(nodes.find((node: { id: string }) => node.id.endsWith("9.6.022")).reviewStatus).toBe("rejected");
  });

  it("removes the unsupported sequence edge and adds no prerequisites", () => {
    expect(edges.some((edge: { id: string }) => edge.id === "math.im1.edge.1276")).toBe(false);
    expect(edges.filter((edge: { metadata?: { lesson?: string }; type: string }) => edge.metadata?.lesson === "9.6" && edge.type === "prerequisite")).toEqual([]);
  });

  it("records the manual explanation boundaries", () => {
    const center = nodes.find((node: { id: string }) => node.id === ids[4]);
    const addSpread = nodes.find((node: { id: string }) => node.id === ids[1]);
    const multiplySpread = nodes.find((node: { id: string }) => node.id === ids[3]);
    expect(center.sourceRefs.join(" ")).toContain("Problem 32");
    expect(nodes.find((node: { id: string }) => node.id === ids[2]).description).toContain("nonzero");
    expect(center.description).toContain("nonzero");
    expect(addSpread.sourceRefs.join(" ")).toContain("separately observed addition-invariance explanation");
    expect(multiplySpread.sourceRefs.join(" ")).toContain("separately observed multiplication-scaling explanation");
  });
});
