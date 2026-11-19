import { describe, expect, it } from "vitest";
import { classifyRuntimeComparison, shouldPermitCutover } from "@/lib/srs/runtime-comparison";

describe("classifyRuntimeComparison", () => {
  it("emits no event when normalized observable output is identical", () => {
    expect(
      classifyRuntimeComparison({
        subject: "daily_queue",
        v2: { cardIds: ["card-a", "card-b"], reviewDay: false },
        v3_2: { cardIds: ["card-a", "card-b"], reviewDay: false },
      }),
    ).toBeNull();
  });

  it("classifies a saturated v3.2 review-day queue as an intended contract change", () => {
    expect(
      classifyRuntimeComparison({
        subject: "daily_queue",
        v2: { cardIds: ["review-a", "new-a"], reviewDay: false },
        v3_2: {
          cardIds: ["review-a"],
          reviewDay: true,
          reason: "review-load-saturated",
        },
      }),
    ).toMatchObject({
      divergenceClass: "intended_contract_change",
      explanationKey: "review-load-saturated",
    });
  });

  it("classifies an incomplete migration fallback as a data gap", () => {
    expect(
      classifyRuntimeComparison({
        subject: "knowledge_state",
        v2: { nodeIds: ["im3.m1.a"] },
        v3_2: { nodeIds: [], reason: "legacy-card-fallback" },
      }),
    ).toMatchObject({
      divergenceClass: "data_gap",
      explanationKey: "legacy-card-fallback",
    });
  });

  it("makes an unexplained output change an unexpected divergence", () => {
    expect(
      classifyRuntimeComparison({
        subject: "dashboard_recommendation",
        v2: { recommendedNodeIds: ["im3.m1.a"] },
        v3_2: { recommendedNodeIds: ["im3.m1.b"] },
      }),
    ).toMatchObject({
      divergenceClass: "unexpected",
      explanationKey: "unclassified-output-change",
    });
  });
});

describe("shouldPermitCutover", () => {
  it("requires verification, no unexpected divergences, and explicit approval", () => {
    expect(
      shouldPermitCutover({
        verificationComplete: true,
        unexpectedDivergenceCount: 0,
        approvedAt: 1_700_000_000_000,
      }),
    ).toBe(true);
  });

  it.each([
    { verificationComplete: false, unexpectedDivergenceCount: 0, approvedAt: 1 },
    { verificationComplete: true, unexpectedDivergenceCount: 1, approvedAt: 1 },
    { verificationComplete: true, unexpectedDivergenceCount: 0, approvedAt: undefined },
  ])("refuses cutover when a release requirement is missing: %o", (input) => {
    expect(shouldPermitCutover(input)).toBe(false);
  });
});
