import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const GRAPH_DIR = path.join(process.cwd(), "curriculum/skill-graph");
const TARGET_SKILL_ID = "math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation";

type JsonDocument = {
  nodes?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

function findNodes(
  document: JsonDocument,
  predicate: (node: Record<string, unknown>) => boolean,
): Array<Record<string, unknown>> {
  return (document.nodes ?? []).filter(predicate);
}

describe("Topic 1.6 limit-notation end behavior runtime keys", () => {
  it("adds only the exact runtime keys to the limit-notation capability", () => {
    const expectedSkill = {
      id: TARGET_SKILL_ID,
      kind: "skill",
      title: "Write polynomial end behavior in limit notation",
      domain: "math.precalc",
      description:
        "Given a polynomial equation, use its leading term to write both end-behavior limit statements.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=79"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        unit: "1",
        lesson: "6",
      },
      rendererKey: "polynomial-limit-notation-end-behavior",
      generatorKey: "topic16-limit-notation-end-behavior",
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");
    const rootMatches = findNodes(root, (node) => node.id === TARGET_SKILL_ID);
    const draftMatches = findNodes(draft, (node) => node.id === TARGET_SKILL_ID);
    const usesNewKey = (node: Record<string, unknown>) =>
      node.rendererKey === "polynomial-limit-notation-end-behavior" ||
      node.generatorKey === "topic16-limit-notation-end-behavior";

    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches).toEqual([expectedSkill]);
    expect(draftMatches).toEqual([expectedSkill]);
    expect(rootMatches[0]).toEqual(draftMatches[0]);
    expect("independentPracticeReady" in (rootMatches[0] ?? {})).toBe(false);
    expect(findNodes(root, usesNewKey)).toEqual([expectedSkill]);
    expect(findNodes(draft, usesNewKey)).toEqual([expectedSkill]);
  });
});
