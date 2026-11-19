import { describe, expect, it } from "vitest";

import {
  BM2_PILOT_MODES,
  BM2_PILOT_NODE,
  isBm2PilotPublished,
  isBm2PilotSourcePublished,
} from "@/lib/learning-evidence/bm2-pilot";

describe("BM2 accounting-equation pilot publication", () => {
  it("fails closed after the notebook source mapping is withdrawn", () => {
    expect(BM2_PILOT_NODE).toBe("math.bm2.skill.1.1.apply-accounting-equation");
    expect(isBm2PilotSourcePublished()).toBe(false);
    expect(isBm2PilotPublished()).toBe(false);
  });

  it("uses the three instructional modes in order", () => {
    expect(BM2_PILOT_MODES).toEqual(["worked_example", "guided_practice", "independent_practice"]);
  });
});
