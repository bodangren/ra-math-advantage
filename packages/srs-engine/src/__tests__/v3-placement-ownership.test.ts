import { describe, expect, it } from "vitest";

import { PLACEMENT_STABILITY_HORIZONS, isPlacementEstimate } from "../srs/placement";

describe("srs-engine placement ownership surface", () => {
  it("exports normative confidence horizons from the placement module", () => {
    expect(PLACEMENT_STABILITY_HORIZONS).toEqual({
      low: 5,
      medium: 15,
      high: 30,
    });
  });

  it("re-exports the canonical placement validator", () => {
    expect(
      isPlacementEstimate({
        nodeId: "math.im3.skill-a",
        masteryEstimate: 0.8,
        confidence: "medium",
        evidenceType: "direct",
        inferenceDepth: 0,
      }),
    ).toBe(true);
  });
});
