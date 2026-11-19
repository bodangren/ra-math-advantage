import { describe, expect, it } from "vitest";

import {
  LEARN_TECHNIQUES,
  getLearnTechnique,
  getLearnTechniqueNavigation,
  learnHref,
} from "../../lib/learn/catalog";
import { APPROVED_TLAC_SOURCE_INVENTORY } from "../../lib/proficiency/source-inventory";

describe("Danielson Learn catalog", () => {
  it("contains exactly the 63 approved TLAC modules with no supplemental records", () => {
    const ids = LEARN_TECHNIQUES.map((technique) => technique.id);
    const approvedIds = APPROVED_TLAC_SOURCE_INVENTORY.map((item) => item.id);

    expect(LEARN_TECHNIQUES).toHaveLength(63);
    expect(new Set(ids)).toHaveLength(63);
    expect([...ids].sort()).toEqual([...approvedIds].sort());
    expect(ids).not.toContain("concept-mapping");
    expect(ids).not.toContain("student-centered-research");
  });

  it("keeps each approved title and parent component aligned with the proficiency inventory", () => {
    const approvedById = new Map(APPROVED_TLAC_SOURCE_INVENTORY.map((item) => [item.id, item]));

    for (const technique of LEARN_TECHNIQUES) {
      const approved = approvedById.get(technique.id);
      expect(approved).toBeDefined();
      expect(technique.title).toBe(approved?.title);
      expect(technique.subdomain).toBe(approved?.componentId);
      expect(technique.source).toBe("TLAC 3.0");
      expect(technique.actionSteps.length).toBeGreaterThan(0);
    }
  });

  it("normalizes plain and canonical skill IDs to one Learn URL", () => {
    expect(learnHref("cold-call")).toBe("/learn/cold-call");
    expect(learnHref("danielson.tlac.skill.cold-call")).toBe("/learn/cold-call");
  });

  it("gets one technique and stable previous and next links", () => {
    const coldCall = getLearnTechnique("cold-call");
    expect(coldCall?.title).toBe("Cold Call");
    expect(getLearnTechnique("not-a-technique")).toBeUndefined();

    const first = LEARN_TECHNIQUES[0];
    const last = LEARN_TECHNIQUES.at(-1);
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    expect(getLearnTechniqueNavigation(first?.id ?? "")).toMatchObject({ previous: null });
    expect(getLearnTechniqueNavigation(last?.id ?? "")).toMatchObject({ next: null });
  });
});
