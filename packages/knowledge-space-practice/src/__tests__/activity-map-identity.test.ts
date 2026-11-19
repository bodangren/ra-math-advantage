import { describe, expect, it } from "vitest";
import type { KnowledgeSpaceNode } from "@math-platform/knowledge-space-core";
import type { KnowledgeBlueprint } from "../blueprints";
import { projectActivityMap } from "../projections/activity-map";

function node(id: string, kind: KnowledgeSpaceNode["kind"]): KnowledgeSpaceNode {
  return {
    id,
    kind,
    title: id,
    domain: "math.test",
    reviewStatus: "draft",
    metadata: {},
    independentPracticeReady: true,
  };
}

function blueprint(nodeId: string): KnowledgeBlueprint {
  return {
    nodeId,
    sourceNodeIds: [],
    alignmentNodeIds: [],
    rendererKey: "fallback-renderer",
    rendererModeMap: {
      worked: "worked-renderer",
      guidedPractice: "guided-renderer",
      independentPractice: "independent-renderer",
    },
    workedExampleSpec: {
      prompt: "Show the complete solution.",
      givens: [],
      target: {},
      steps: [{ description: "Complete the solution." }],
      explanation: "This is the complete solution.",
    },
    guidedPracticeSpec: {
      scaffoldedPrompt: "Complete the guided task.",
      stepPrompts: ["Find the first value."],
      hints: ["Use the given relationship."],
      checksPerStep: [{ check: "The first value is correct.", answerPattern: "4" }],
      revealPolicy: "after_attempt",
    },
    independentPracticeSpec: {
      variantParameters: {},
      answerSchema: { answer: "number" },
      gradingRules: [{ partId: "answer", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "unique_seeds",
    },
    reviewStatus: "draft",
    metadata: {},
  };
}

describe("activity map identity boundary", () => {
  it("keeps a skill blueprint on its exact node and selects each mode renderer", () => {
    const skill = node("math.test.skill.exact", "skill");

    const rows = projectActivityMap([skill], [], [blueprint(skill.id)]);

    expect(
      rows.map(({ stableActivityId, nodeId, mode, rendererKey }) => ({
        stableActivityId,
        nodeId,
        mode,
        rendererKey,
      })),
    ).toEqual([
      {
        stableActivityId: `${skill.id}.worked_example`,
        nodeId: skill.id,
        mode: "worked_example",
        rendererKey: "worked-renderer",
      },
      {
        stableActivityId: `${skill.id}.guided_practice`,
        nodeId: skill.id,
        mode: "guided_practice",
        rendererKey: "guided-renderer",
      },
      {
        stableActivityId: `${skill.id}.independent_practice`,
        nodeId: skill.id,
        mode: "independent_practice",
        rendererKey: "independent-renderer",
      },
    ]);
  });

  it("does not assign a concept blueprint to its child skills", () => {
    const concept = node("math.test.concept.parent", "concept");
    const first = node("math.test.skill.first", "skill");
    const second = node("math.test.skill.second", "skill");

    const rows = projectActivityMap(
      [concept, first, second],
      [
        {
          id: "edge.first",
          sourceId: concept.id,
          targetId: first.id,
          type: "contains",
          weight: 1,
          confidence: "high",
          reviewStatus: "draft",
          metadata: {},
        },
        {
          id: "edge.second",
          sourceId: concept.id,
          targetId: second.id,
          type: "contains",
          weight: 1,
          confidence: "high",
          reviewStatus: "draft",
          metadata: {},
        },
      ],
      [blueprint(concept.id)],
    );

    expect(rows).toEqual([]);
  });

  it("projects only a child-owned blueprint and leaves its sibling untouched", () => {
    const concept = node("math.test.concept.owner", "concept");
    const owner = node("math.test.skill.owner", "skill");
    const sibling = node("math.test.skill.sibling", "skill");

    const rows = projectActivityMap(
      [concept, owner, sibling],
      [
        {
          id: "edge.owner",
          sourceId: concept.id,
          targetId: owner.id,
          type: "contains",
          weight: 1,
          confidence: "high",
          reviewStatus: "draft",
          metadata: {},
        },
        {
          id: "edge.sibling",
          sourceId: concept.id,
          targetId: sibling.id,
          type: "contains",
          weight: 1,
          confidence: "high",
          reviewStatus: "draft",
          metadata: {},
        },
      ],
      [blueprint(owner.id)],
    );

    expect(rows).toHaveLength(3);
    expect(new Set(rows.map((row) => row.nodeId))).toEqual(new Set([owner.id]));
    expect(rows.every((row) => !row.stableActivityId.includes(sibling.id))).toBe(true);
  });

  it("preserves task blueprint projection behavior", () => {
    const task = node("math.test.task.exact", "task_blueprint");

    const rows = projectActivityMap([task], [], [blueprint(task.id)]);

    expect(rows).toHaveLength(3);
    expect(new Set(rows.map((row) => row.nodeId))).toEqual(new Set([task.id]));
  });

  it("emits only the modalities that have specs", () => {
    const skill = node("math.test.skill.missing-mode", "skill");
    const input = blueprint(skill.id);
    delete input.guidedPracticeSpec;

    expect(projectActivityMap([skill], [], [input]).map((row) => row.mode)).toEqual([
      "worked_example",
      "independent_practice",
    ]);
  });

  it("skips all three invalid empty specs", () => {
    const skill = node("math.test.skill.invalid-mode", "skill");
    const input = blueprint(skill.id);
    input.workedExampleSpec = {} as KnowledgeBlueprint["workedExampleSpec"];
    input.guidedPracticeSpec = {} as KnowledgeBlueprint["guidedPracticeSpec"];
    input.independentPracticeSpec = {} as KnowledgeBlueprint["independentPracticeSpec"];

    expect(projectActivityMap([skill], [], [input])).toEqual([]);
  });

  it("uses rendererKey as the same-mode fallback and skips rows with no renderer", () => {
    const skill = node("math.test.skill.fallback", "skill");
    const fallback = blueprint(skill.id);
    fallback.rendererModeMap = { worked: "worked-renderer" };

    const fallbackRows = projectActivityMap([skill], [], [fallback]);
    expect(fallbackRows.map((row) => row.rendererKey)).toEqual([
      "worked-renderer",
      "fallback-renderer",
      "fallback-renderer",
    ]);

    const missing = blueprint(skill.id);
    missing.rendererKey = "";
    missing.rendererModeMap = {};

    expect(projectActivityMap([skill], [], [missing])).toEqual([]);
  });

  it("does not use a renderer key from a different mode", () => {
    const skill = node("math.test.skill.no-cross-fallback", "skill");
    const input = blueprint(skill.id);
    input.rendererKey = "";
    input.rendererModeMap = { independentPractice: "independent-renderer" };

    const rows = projectActivityMap([skill], [], [input]);

    expect(rows.map((row) => row.mode)).toEqual(["independent_practice"]);
    expect(rows[0]?.rendererKey).toBe("independent-renderer");
  });
});
