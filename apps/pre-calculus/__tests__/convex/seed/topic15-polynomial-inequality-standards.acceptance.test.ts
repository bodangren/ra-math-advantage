import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const GRAPH_DIR = path.resolve(__dirname, "../../../curriculum/skill-graph");
const EXAMPLE_ID = "math.precalc.example.1.5.003";
const HSA_APR_B2_ID = "math.standard.ccss.hsa-apr-b-2";
const HSA_APR_B3_ID = "math.standard.ccss.hsa-apr-b-3";
const SOURCE_REF =
  "apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-5/lesson.md (1-5, Example 3)";
const SUPPORT_EDGE_ID = "math.precalc.edge.0399";

type Graph = { edges: Array<Record<string, unknown>> };

function readGraph(fileName: string): Graph {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as Graph;
}

function edgesFrom(graph: Graph, sourceId: string): Array<Record<string, unknown>> {
  return graph.edges.filter((edge) => edge.sourceId === sourceId);
}

describe("Topic 1.5 Example 3 standards alignment", () => {
  it("keeps exactly the existing HSA-APR.B.3 alignment in both graph surfaces", () => {
    const edges = readGraph("edges.json");
    const standardEdges = readGraph("standard-edges.json");

    expect(
      edgesFrom(edges, EXAMPLE_ID).filter((edge) => edge.type === "aligned_to_standard"),
    ).toEqual([
      {
        id: "math.alignment.precalc-example-1-5-003-to-ccss-hsa-apr-b-3",
        type: "aligned_to_standard",
        sourceId: EXAMPLE_ID,
        targetId: HSA_APR_B3_ID,
        weight: 0.75,
        confidence: "high",
        sourceRefs: [
          { source: "CED:1.5", location: "1-5" },
          { source: "CED:1.5", location: "1-5" },
        ],
        derived: true,
        derivationMethod: "standards-alignment-script",
        reviewStatus: "draft",
        rationale: "Aligned via CED topic 1.5",
        metadata: {
          isPrimary: false,
          course: "precalc",
          originalWeight: 0.7,
          weightNormalization: "t5-review-remediation",
        },
      },
    ]);

    expect(
      edgesFrom(standardEdges, EXAMPLE_ID).filter((edge) => edge.type === "aligned_to_standard"),
    ).toEqual([
      {
        id: "math.alignment.precalc-example-1-5-003-to-ccss-hsa-apr-b-3",
        type: "aligned_to_standard",
        sourceId: EXAMPLE_ID,
        targetId: HSA_APR_B3_ID,
        weight: 0.7,
        confidence: "high",
        sourceRefs: [
          { source: "CED:1.5", location: "1-5" },
          { source: "CED:1.5", location: "1-5" },
        ],
        derived: true,
        derivationMethod: "standards-alignment-script",
        reviewStatus: "draft",
        rationale: "Aligned via CED topic 1.5",
        metadata: {
          isPrimary: false,
          course: "precalc",
        },
      },
    ]);
  });

  it("removes the unsupported HSA-APR.B.2 target from both graph surfaces", () => {
    for (const fileName of ["edges.json", "standard-edges.json"]) {
      const graph = readGraph(fileName);
      expect(
        graph.edges.filter(
          (edge) => edge.sourceId === EXAMPLE_ID && edge.targetId === HSA_APR_B2_ID,
        ),
      ).toHaveLength(0);
    }
  });

  it("preserves the exact direct Example 3 source support edge", () => {
    const graph = readGraph("edges.json");

    expect(graph.edges.filter((edge) => edge.id === SUPPORT_EDGE_ID)).toEqual([
      {
        id: SUPPORT_EDGE_ID,
        type: "supports",
        sourceId: EXAMPLE_ID,
        targetId: "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts",
        weight: 1,
        confidence: "high",
        sourceRefs: [SOURCE_REF],
        reviewStatus: "draft",
        rationale: "Example 3 supports solving polynomial inequalities by testing interval signs.",
        metadata: { course: "precalc", unit: "1", lesson: "5" },
      },
    ]);
  });

  it("preserves the exact Example 3 lesson context and containment edges", () => {
    const graph = readGraph("edges.json");

    expect(graph.edges.filter((edge) => edge.id === "math.precalc.edge.0028")).toEqual([
      {
        id: "math.precalc.edge.0028",
        type: "appears_in_context",
        sourceId: EXAMPLE_ID,
        targetId: "math.precalc.lesson.1.5",
        weight: 0.75,
        confidence: "medium",
        reviewStatus: "draft",
        derived: true,
        derivationMethod: "lesson-sequence-placement-v1",
        rationale: "Worked example appears in lesson context",
        metadata: { module: "1", lesson: "5" },
      },
    ]);
    expect(graph.edges.filter((edge) => edge.id === "math.precalc.edge.0190")).toEqual([
      {
        id: "math.precalc.edge.0190",
        type: "contains",
        sourceId: "math.precalc.lesson.1.5",
        targetId: EXAMPLE_ID,
        weight: 1,
        confidence: "high",
        reviewStatus: "draft",
        derived: true,
        derivationMethod: "lesson-sequence-containment-v1",
        rationale: "Lesson contains worked example",
        metadata: { module: "1", lesson: "5" },
      },
    ]);
  });
});
