import { describe, expect, it } from "vitest";

import { DEFAULT_PLANNER_V3_2_WEIGHTS } from "../planner/v3-2-contract";
import {
  precomputePlannerGraphV3_2,
  rankPlannerPriorityScoresV3_2,
  scorePlannerCandidateV3_2,
} from "../planner/v3-2-planner";

const zeroTerms = {
  readiness: 0,
  unlockValue: 0,
  goalProximity: 0,
  weaknessFit: 0,
  utility: 0,
} as const;

function release(
  nodes: Array<{ nodeId: string; kind: "skill"; domain: string }>,
  edges: Array<{
    edgeId: string;
    type: "prerequisite_for" | "contains";
    sourceId: string;
    targetId: string;
  }>,
  goalNodeIds: string[] = [],
) {
  return {
    schemaVersion: "planner.graph-release-input.v3.2" as const,
    graphReleaseId: "test.release",
    graphContentHash: "sha256:graph",
    precomputeInputHash: `sha256:goals:${goalNodeIds.join(",")}`,
    domain: "math",
    sparseThreshold: 0.05 as const,
    nodes,
    edges,
    goalNodeIds,
  };
}

describe("planner.v3.2 normalized mathematics", () => {
  it("reproduces the raw-count dominance correction example", () => {
    const maxReach = 120;
    const p = scorePlannerCandidateV3_2({
      nodeId: "P",
      rankingMode: "normalized-prerequisite",
      terms: { ...zeroTerms, readiness: 0.85, unlockValue: Math.log1p(40) / Math.log1p(maxReach) },
      weights: DEFAULT_PLANNER_V3_2_WEIGHTS,
    });
    const q = scorePlannerCandidateV3_2({
      nodeId: "Q",
      rankingMode: "normalized-prerequisite",
      terms: { ...zeroTerms, readiness: 1, unlockValue: Math.log1p(2) / Math.log1p(maxReach) },
      weights: DEFAULT_PLANNER_V3_2_WEIGHTS,
    });

    expect(p.composite).toBeCloseTo(0.4524, 3);
    expect(q.composite).toBeCloseTo(0.3958, 3);
    expect(p.composite).toBeGreaterThan(q.composite);
  });

  it("keeps valid normalized scores inside zero and one", () => {
    expect(
      scorePlannerCandidateV3_2({
        nodeId: "zero",
        rankingMode: "normalized-prerequisite",
        terms: zeroTerms,
      }).composite,
    ).toBe(0);
    expect(
      scorePlannerCandidateV3_2({
        nodeId: "one",
        rankingMode: "normalized-prerequisite",
        terms: { readiness: 1, unlockValue: 1, goalProximity: 1, weaknessFit: 1, utility: 1 },
      }).composite,
    ).toBe(1);
  });

  it("fails closed on invalid weights instead of normalizing them", () => {
    expect(() =>
      scorePlannerCandidateV3_2({
        nodeId: "bad",
        rankingMode: "normalized-prerequisite",
        terms: zeroTerms,
        weights: { a: 0.5, b: 0.5, c: 0.5, d: 0, e: 0 },
      }),
    ).toThrow(/weights/i);
  });
});

describe("planner.v3.2 deterministic graph precomputation", () => {
  it("handles an empty graph release deterministically", () => {
    expect(precomputePlannerGraphV3_2(release([], []))).toMatchObject({
      skillCount: 0,
      prerequisiteInEdgeRatio: 0,
      rankingMode: "utility-led",
      maxReach: 0,
      reachByNode: [],
    });
  });

  it("log-scales downstream skill reach against graph-wide max reach", () => {
    const output = precomputePlannerGraphV3_2(
      release(
        ["a", "b", "c"].map((nodeId) => ({ nodeId, kind: "skill" as const, domain: "math" })),
        [
          { edgeId: "a-b", type: "prerequisite_for", sourceId: "a", targetId: "b" },
          { edgeId: "b-c", type: "prerequisite_for", sourceId: "b", targetId: "c" },
        ],
        ["c"],
      ),
    );
    expect(output.maxReach).toBe(2);
    expect(output.reachByNode).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nodeId: "a",
          downstreamReach: 2,
          normalizedUnlockValue: 1,
          goalDistance: 2,
          goalProximity: 1 / 3,
        }),
        expect.objectContaining({
          nodeId: "b",
          downstreamReach: 1,
          normalizedUnlockValue: Math.log(2) / Math.log(3),
          goalDistance: 1,
          goalProximity: 0.5,
        }),
        expect.objectContaining({
          nodeId: "c",
          downstreamReach: 0,
          normalizedUnlockValue: 0,
          goalDistance: 0,
          goalProximity: 1,
        }),
      ]),
    );
  });

  it("returns zero goal proximity for unreachable nodes and one for a goal", () => {
    const output = precomputePlannerGraphV3_2(
      release(
        ["a", "goal"].map((nodeId) => ({ nodeId, kind: "skill" as const, domain: "math" })),
        [],
        ["goal"],
      ),
    );
    expect(output.reachByNode.find((entry) => entry.nodeId === "a")).toMatchObject({
      goalDistance: null,
      goalProximity: 0,
    });
    expect(output.reachByNode.find((entry) => entry.nodeId === "goal")).toMatchObject({
      goalDistance: 0,
      goalProximity: 1,
    });
  });

  it("terminates cycles and counts each downstream skill at most once", () => {
    const output = precomputePlannerGraphV3_2(
      release(
        ["a", "b"].map((nodeId) => ({ nodeId, kind: "skill" as const, domain: "math" })),
        [
          { edgeId: "a-b", type: "prerequisite_for", sourceId: "a", targetId: "b" },
          { edgeId: "b-a", type: "prerequisite_for", sourceId: "b", targetId: "a" },
        ],
        ["b"],
      ),
    );
    expect(output.maxReach).toBe(1);
    expect(output.reachByNode.map((entry) => entry.downstreamReach)).toEqual([1, 1]);
  });

  it("is byte-stable across node and edge input permutations", () => {
    const input = release(
      ["a", "b", "c"].map((nodeId) => ({ nodeId, kind: "skill" as const, domain: "math" })),
      [
        { edgeId: "a-b", type: "prerequisite_for", sourceId: "a", targetId: "b" },
        { edgeId: "b-c", type: "prerequisite_for", sourceId: "b", targetId: "c" },
      ],
      ["c"],
    );
    expect(
      precomputePlannerGraphV3_2({
        ...input,
        nodes: [...input.nodes].reverse(),
        edges: [...input.edges].reverse(),
      }),
    ).toEqual(precomputePlannerGraphV3_2(input));
  });
});

describe("planner.v3.2 deterministic ranking", () => {
  it("sorts priority descending, then node ID ascending without locale state", () => {
    const scores = ["b", "a", "c"].map((nodeId) =>
      scorePlannerCandidateV3_2({
        nodeId,
        rankingMode: "normalized-prerequisite",
        terms: { ...zeroTerms, readiness: nodeId === "c" ? 0.5 : 1 },
      }),
    );
    expect(rankPlannerPriorityScoresV3_2(scores).map((score) => score.nodeId)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(rankPlannerPriorityScoresV3_2([...scores].reverse())).toEqual(
      rankPlannerPriorityScoresV3_2(scores),
    );
  });
});
