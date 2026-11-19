import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const GRAPH_DIR = path.join(process.cwd(), "curriculum/skill-graph");
const TARGET_SKILL_ID = "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";
const OTHER_TOPIC_16_SKILL_IDS = [
  "math.precalc.skill.1.6.describe-polynomial-end-behavior-from-graphs",
  "math.precalc.skill.1.6.sketch-polynomial-functions-from-end-behavior",
  "math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation",
  "math.precalc.skill.1.6.observe-function-end-behavior-with-a-graphing-calculator",
];

type JsonDocument = {
  nodes?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

function findNodes(document: JsonDocument, id: string): Array<Record<string, unknown>> {
  return (document.nodes ?? []).filter((node) => node.id === id);
}

describe("Topic 1.6 equation end behavior runtime keys", () => {
  it("adds only the exact runtime keys to the equation capability", () => {
    const expectedSkill = {
      id: TARGET_SKILL_ID,
      kind: "skill",
      title: "Determine polynomial end behavior from equations",
      domain: "math.precalc",
      description:
        "Given a polynomial equation, use degree parity and the leading coefficient to state the left and right end behavior verbally.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=78"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        unit: "1",
        lesson: "6",
      },
      rendererKey: "polynomial-equation-end-behavior",
      generatorKey: "topic16-equation-end-behavior",
      independentPracticeReady: true,
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");
    const rootMatches = findNodes(root, TARGET_SKILL_ID);
    const draftMatches = findNodes(draft, TARGET_SKILL_ID);

    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches).toEqual([expectedSkill]);
    expect(draftMatches).toEqual([expectedSkill]);
    expect(rootMatches[0]).toEqual(draftMatches[0]);
    expect(rootMatches[0]?.rendererKey).toBe("polynomial-equation-end-behavior");
    expect(rootMatches[0]?.generatorKey).toBe("topic16-equation-end-behavior");
    expect(rootMatches[0]?.independentPracticeReady).toBe(true);

    for (const id of OTHER_TOPIC_16_SKILL_IDS) {
      const rootOtherMatches = findNodes(root, id);
      const draftOtherMatches = findNodes(draft, id);
      expect(rootOtherMatches).toHaveLength(1);
      expect(draftOtherMatches).toHaveLength(1);
      expect(rootOtherMatches[0]?.rendererKey).not.toBe("polynomial-equation-end-behavior");
      expect(rootOtherMatches[0]?.generatorKey).not.toBe("topic16-equation-end-behavior");
      expect(draftOtherMatches[0]?.rendererKey).not.toBe("polynomial-equation-end-behavior");
      expect(draftOtherMatches[0]?.generatorKey).not.toBe("topic16-equation-end-behavior");
    }
  });
});
