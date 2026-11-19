import { describe, expect, it } from "vitest";

import {
  computeObjectiveProficiency,
  type PracticeVariantEvidence,
} from "../srs/objective-proficiency";

function evidence(
  variantKey: string,
  overrides: Partial<PracticeVariantEvidence> = {},
): PracticeVariantEvidence {
  return {
    variantKey,
    retentionStrength: 1,
    practiceCoverage: 1,
    fluencyConfidence: "high",
    baselineSampleCount: 12,
    timingReliable: true,
    ...overrides,
  };
}

describe("v3.1 evidence integration with objective proficiency", () => {
  it("applies the most conservative non-null variant confidence cap", () => {
    const result = computeObjectiveProficiency({
      objectiveId: "objective-1",
      priority: "essential",
      minVariants: 3,
      variantEvidences: [
        evidence("a", { evidenceConfidenceCap: null }),
        evidence("b", { evidenceConfidenceCap: "medium" }),
        evidence("c", {
          evidenceConfidenceCap: "low",
          diagnosticReasons: ["small_sample_low_cap"],
        }),
      ],
    });

    expect(result.evidenceConfidence).toBe("low");
  });

  it("preserves legacy evidence confidence when cap metadata is absent", () => {
    const result = computeObjectiveProficiency({
      objectiveId: "objective-1",
      priority: "extension",
      variantEvidences: [evidence("legacy")],
    });

    expect(result.evidenceConfidence).toBe("high");
  });

  it("uses the highest fluency confidence among timing-reliable variants", () => {
    const result = computeObjectiveProficiency({
      objectiveId: "objective-1",
      priority: "essential",
      variantEvidences: [
        evidence("low", { fluencyConfidence: "low" }),
        evidence("medium", { fluencyConfidence: "medium" }),
        evidence("high-but-unreliable", {
          fluencyConfidence: "high",
          timingReliable: false,
        }),
      ],
    });

    expect(result.fluencyConfidence).toBe("medium");
  });

  it("allows one reliable high-fluency variant to establish high fluency", () => {
    const result = computeObjectiveProficiency({
      objectiveId: "objective-1",
      priority: "essential",
      variantEvidences: [
        evidence("low", { fluencyConfidence: "low" }),
        evidence("high", { fluencyConfidence: "high" }),
      ],
    });

    expect(result.fluencyConfidence).toBe("high");
  });
});
