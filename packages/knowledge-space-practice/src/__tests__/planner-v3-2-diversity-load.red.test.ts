import { describe, expect, it } from "vitest";

import { planRecommendationsV3_2 } from "../planner/v3-2-recommendations";
import { assessReviewLoadV3_2 } from "../planner/v3-2-review-load";

const fallbackGroup = (nodeId: string) => ({
  groupId: nodeId,
  ancestorNodeId: null,
  ancestorKind: "self_fallback" as const,
  distance: 0,
});

const ancestorGroup = (groupId: string) => ({
  groupId,
  ancestorNodeId: groupId,
  ancestorKind: "instructional_unit" as const,
  distance: 1,
});

function candidate(nodeId: string, readiness: number) {
  return {
    nodeId,
    readiness,
    weaknessFit: 0,
    utilityResolution: {
      schemaVersion: "planner.utility-resolution.v3.2" as const,
      kind: "inert" as const,
      releaseIdentity: {
        domain: "math",
        graphReleaseId: "math.release",
        graphContentHash: "sha256:math",
        precomputeInputHash: "sha256:math-input",
      },
      utility: 0 as const,
      signals: [] as [],
      reason: "no-provider" as const,
      weightsRenormalized: false as const,
    },
  };
}

function denseRelease(nodeIds: string[]) {
  return {
    schemaVersion: "planner.graph-release-output.v3.2" as const,
    graphReleaseId: "math.release",
    graphContentHash: "sha256:math",
    precomputeInputHash: "sha256:math-input",
    domain: "math",
    goalNodeIds: [],
    skillCount: nodeIds.length,
    skillsWithPrerequisiteInEdge: 1,
    prerequisiteInEdgeRatio: 1 / nodeIds.length,
    sparseThreshold: 0.05 as const,
    rankingMode: "normalized-prerequisite" as const,
    maxReach: 1,
    reachByNode: nodeIds.map((nodeId, index) => ({
      nodeId,
      downstreamReach: index === 0 ? 1 : 0,
      normalizedUnlockValue: index === 0 ? 1 : 0,
      goalDistance: null,
      goalProximity: 0,
      diversityGroup: nodeId.startsWith("u1")
        ? ancestorGroup("unit.1")
        : nodeId.startsWith("u2")
          ? ancestorGroup("unit.2")
          : nodeId.startsWith("u3")
            ? ancestorGroup("unit.3")
            : fallbackGroup(nodeId),
    })),
  };
}

describe("planner.v3.2 recommendation diversity", () => {
  it("caps each nearest instructional ancestor at two and fills from other groups", () => {
    const result = planRecommendationsV3_2({
      graphRelease: denseRelease(["u1-a", "u1-b", "u1-c", "u2-a", "u3-a"]),
      readyThreshold: 0.8,
      requestedCount: 4,
      candidates: [
        candidate("u1-a", 1),
        candidate("u1-b", 0.99),
        candidate("u1-c", 0.98),
        candidate("u2-a", 0.9),
        candidate("u3-a", 0.85),
      ],
    });
    expect(result.recommendations.map((entry) => entry.score.nodeId)).toEqual([
      "u1-a",
      "u1-b",
      "u2-a",
      "u3-a",
    ]);
    expect(
      result.recommendations.filter((entry) => entry.diversityGroup.groupId === "unit.1"),
    ).toHaveLength(2);
  });

  it("does not collapse unrelated fallback nodes into one diversity group", () => {
    const result = planRecommendationsV3_2({
      graphRelease: denseRelease(["a", "b", "c"]),
      readyThreshold: 0.8,
      requestedCount: 3,
      candidates: [candidate("a", 1), candidate("b", 1), candidate("c", 1)],
    });
    expect(result.recommendations.map((entry) => entry.score.nodeId)).toEqual(["a", "b", "c"]);
  });

  it("honors configured dense-mode a-e weights", () => {
    const result = planRecommendationsV3_2({
      graphRelease: denseRelease(["a", "b"]),
      readyThreshold: 0.8,
      requestedCount: 1,
      weights: { a: 0, b: 1, c: 0, d: 0, e: 0 },
      candidates: [candidate("a", 0.8)],
    });
    expect(result.recommendations[0]?.score.composite).toBe(1);
  });

  it("rejects utility provenance from a different domain or graph release", () => {
    const mismatched = candidate("a", 1);
    mismatched.utilityResolution.releaseIdentity = {
      domain: "english.cefr",
      graphReleaseId: "cefr.old",
      graphContentHash: "sha256:old",
      precomputeInputHash: "sha256:old-input",
    };
    expect(() =>
      planRecommendationsV3_2({
        graphRelease: denseRelease(["a", "b"]),
        readyThreshold: 0.8,
        requestedCount: 1,
        candidates: [mismatched],
      }),
    ).toThrow(/does not match graph release/);
  });
});

describe("planner.v3.2 seven-day review-load budgeting", () => {
  const asOf = "2026-07-10T00:00:00.000Z";

  function cards(count: number, dueDate = "2026-07-17T00:00:00.000Z") {
    return Array.from({ length: count }, (_, index) => ({ cardId: `card.${index}`, dueDate }));
  }

  it("includes overdue cards and the exact seven-day boundary, excluding later cards", () => {
    const assessment = assessReviewLoadV3_2({
      asOf,
      maxReviewsPerDay: 20,
      cards: [
        { cardId: "overdue", dueDate: "2026-07-09T00:00:00.000Z" },
        { cardId: "boundary", dueDate: "2026-07-17T00:00:00.000Z" },
        { cardId: "later", dueDate: "2026-07-17T00:00:00.001Z" },
      ],
    });
    expect(assessment).toMatchObject({
      dueWithinHorizon: 2,
      projectedDailyLoad: 2 / 7,
      reviewLoadState: "normal",
    });
  });

  it.each([
    [67, "normal", "allowed"],
    [68, "elevated", "allowed"],
    [112, "elevated", "allowed"],
    [113, "saturated", "zero"],
  ] as const)("classifies %i cards as %s", (count, state, allowance) => {
    expect(assessReviewLoadV3_2({ asOf, maxReviewsPerDay: 20, cards: cards(count) })).toMatchObject(
      {
        reviewLoadState: state,
        newSkillAllowance: allowance,
      },
    );
  });

  it("suppresses every new-skill recommendation when the projected budget is saturated", () => {
    const reviewLoad = assessReviewLoadV3_2({ asOf, maxReviewsPerDay: 20, cards: cards(180) });
    const result = planRecommendationsV3_2({
      graphRelease: denseRelease(["a", "b"]),
      readyThreshold: 0.8,
      requestedCount: 2,
      candidates: [candidate("a", 1), candidate("b", 0.9)],
      reviewLoad,
    });
    expect(result.recommendations).toEqual([]);
    expect(result.reviewLoad).toMatchObject({
      reviewLoadState: "saturated",
      guidance: "review-day",
    });
  });

  it("rejects invalid timestamps and duplicate card identities", () => {
    expect(() =>
      assessReviewLoadV3_2({
        asOf,
        maxReviewsPerDay: 20,
        cards: [
          { cardId: "same", dueDate: "bad" },
          { cardId: "same", dueDate: asOf },
        ],
      }),
    ).toThrow();
  });
});
