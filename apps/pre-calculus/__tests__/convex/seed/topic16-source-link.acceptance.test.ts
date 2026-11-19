import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const GRAPH_DIR = path.join(process.cwd(), "curriculum/skill-graph");
const SOURCE_ID = "math.precalc.example.1.6.001";
const SECOND_SOURCE_ID = "math.precalc.example.1.6.002";
const THIRD_SOURCE_ID = "math.precalc.example.1.6.003";
const FOURTH_SOURCE_ID = "math.precalc.example.1.6.004";
const FIFTH_SOURCE_ID = "math.precalc.example.1.6.005";
const SKILL_ID = "math.precalc.skill.1.6.describe-polynomial-end-behavior-from-graphs";
const SECOND_SKILL_ID = "math.precalc.skill.1.6.sketch-polynomial-functions-from-end-behavior";
const THIRD_SKILL_ID = "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";
const FOURTH_SKILL_ID = "math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation";
const FIFTH_SKILL_ID =
  "math.precalc.skill.1.6.observe-function-end-behavior-with-a-graphing-calculator";
const OBSOLETE_SKILL_ID =
  "math.precalc.skill.1.6.write-limit-statements-for-polynomial-end-behavior";
const LESSON_ID = "math.precalc.lesson.1.6";
const HSF_IF_B_4 = "math.standard.ccss.hsf-if-b-4";
const HSF_IF_C_7C = "math.standard.ccss.hsf-if-c-7c";
const HSF_IF_C_7D = "math.standard.ccss.hsf-if-c-7d";
const HSA_APR_B_3 = "math.standard.ccss.hsa-apr-b-3";

type JsonDocument = {
  nodes?: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
  blueprints?: Array<Record<string, unknown>>;
  activities?: Array<Record<string, unknown>>;
  srsInputs?: Array<Record<string, unknown>>;
  inputs?: Array<Record<string, unknown>>;
  items?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

function findNodes(document: JsonDocument, id: string): Array<Record<string, unknown>> {
  return (document.nodes ?? []).filter((node) => node.id === id);
}

describe("Topic 1.6 Example 1 source link", () => {
  it("mirrors the PDF Example 1 graph-to-verbal-and-limit task", () => {
    const expectedSource = {
      id: SOURCE_ID,
      kind: "worked_example",
      title: "Example 1: Describe polynomial end behavior from graphs",
      domain: "math.precalc",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=77"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        module: "1",
        lesson: "6",
        exampleNumber: 1,
        sourceLesson: "1-6",
        rawText:
          "Describe the end behavior of the following polynomials verbally and using limit notation.\na) The graph of f has a rising left end and a falling right end. As x decreases without bound, f(x) increases without bound. lim(x to -infinity) f(x) = infinity. As x increases without bound, f(x) decreases without bound. lim(x to infinity) f(x) = -infinity.\nb) The graph of g has a rising left end and a rising right end. As x decreases without bound, g(x) increases without bound. lim(x to -infinity) g(x) = infinity. As x increases without bound, g(x) increases without bound. lim(x to infinity) g(x) = infinity.",
      },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, SOURCE_ID)).toHaveLength(1);
    expect(findNodes(draft, SOURCE_ID)).toHaveLength(1);
    expect(findNodes(root, SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draft, SOURCE_ID)).toEqual([expectedSource]);
  });

  it("preserves the Example 1 lesson and standard relationships", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "appears_in_context" &&
            edge.sourceId === SOURCE_ID &&
            edge.targetId === LESSON_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0029",
        type: "appears_in_context",
        sourceId: SOURCE_ID,
        targetId: LESSON_ID,
      },
    ]);
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "contains" && edge.sourceId === LESSON_ID && edge.targetId === SOURCE_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0191",
        type: "contains",
        sourceId: LESSON_ID,
        targetId: SOURCE_ID,
      },
    ]);
    const rootAlignments = edges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === SOURCE_ID,
    );
    expect(rootAlignments).toHaveLength(2);
    expect(rootAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-001-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
      {
        id: "math.alignment.precalc-example-1-6-001-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
    ]);
    expect(rootAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);

    const standardEdges = readJson("standard-edges.json").edges ?? [];
    const mirroredAlignments = standardEdges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === SOURCE_ID,
    );
    expect(mirroredAlignments).toHaveLength(2);
    expect(mirroredAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-001-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
      {
        id: "math.alignment.precalc-example-1-6-001-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
    ]);
    expect(mirroredAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);
  });
});

describe("Topic 1.6 Example 2 source link", () => {
  it("mirrors the PDF Example 2 limit-behavior-to-polynomial-sketch task", () => {
    const expectedSource = {
      id: SECOND_SOURCE_ID,
      kind: "worked_example",
      title: "Example 2: Sketch polynomial functions from end behavior",
      domain: "math.precalc",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=78"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        module: "1",
        lesson: "6",
        exampleNumber: 2,
        sourceLesson: "1-6",
        rawText:
          "Sketch a polynomial function with the following end behaviors.\na) lim(x to -infinity) f(x) = -infinity and lim(x to infinity) f(x) = -infinity. One valid sketch has both ends falling, such as a downward-opening even-degree polynomial.\nb) lim(x to -infinity) g(x) = -infinity and lim(x to infinity) g(x) = infinity. One valid sketch has a falling left end and a rising right end, such as a positive-leading-coefficient odd-degree polynomial.",
      },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, SECOND_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(draft, SECOND_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(root, SECOND_SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draft, SECOND_SOURCE_ID)).toEqual([expectedSource]);
  });

  it("preserves the Example 2 lesson and standard relationships", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "appears_in_context" &&
            edge.sourceId === SECOND_SOURCE_ID &&
            edge.targetId === LESSON_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0030",
        type: "appears_in_context",
        sourceId: SECOND_SOURCE_ID,
        targetId: LESSON_ID,
      },
    ]);
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "contains" &&
            edge.sourceId === LESSON_ID &&
            edge.targetId === SECOND_SOURCE_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0192",
        type: "contains",
        sourceId: LESSON_ID,
        targetId: SECOND_SOURCE_ID,
      },
    ]);

    const rootAlignments = edges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === SECOND_SOURCE_ID,
    );
    expect(rootAlignments).toHaveLength(2);
    expect(rootAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-002-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
      {
        id: "math.alignment.precalc-example-1-6-002-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
    ]);
    expect(rootAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);

    const standardEdges = readJson("standard-edges.json").edges ?? [];
    const mirroredAlignments = standardEdges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === SECOND_SOURCE_ID,
    );
    expect(mirroredAlignments).toHaveLength(2);
    expect(mirroredAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-002-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
      {
        id: "math.alignment.precalc-example-1-6-002-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
    ]);
    expect(mirroredAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);
  });
});

describe("Topic 1.6 Example 3 source link", () => {
  it("mirrors the PDF Example 3 equation-to-end-behavior task", () => {
    const expectedSource = {
      id: THIRD_SOURCE_ID,
      kind: "worked_example",
      title: "Example 3: Determine polynomial end behavior from equations",
      domain: "math.precalc",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=78"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        module: "1",
        lesson: "6",
        exampleNumber: 3,
        sourceLesson: "1-6",
        rawText:
          "Determine the end behavior for the following polynomials. Limit notation is not necessary.\na) f(x) = 4x^5. Left: down. Right: up.\nb) g(x) = (1/2)x^4. Left: up. Right: up.\nc) y = -2(x + 3)^6. Left: down. Right: down.\nd) h(x) = 3 - x^5. Left: up. Right: down.\ne) k(x) = 8x^2 + 4 - x^5. The leading term is -x^5. Left: up. Right: down.\nf) m(x) = 2x(x - 1)(6 - x). The leading term is -2x^3. Left: up. Right: down.",
      },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, THIRD_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(draft, THIRD_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(root, THIRD_SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draft, THIRD_SOURCE_ID)).toEqual([expectedSource]);
  });

  it("preserves the Example 3 lesson and standard relationships", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "appears_in_context" &&
            edge.sourceId === THIRD_SOURCE_ID &&
            edge.targetId === LESSON_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0031",
        type: "appears_in_context",
        sourceId: THIRD_SOURCE_ID,
        targetId: LESSON_ID,
      },
    ]);
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "contains" &&
            edge.sourceId === LESSON_ID &&
            edge.targetId === THIRD_SOURCE_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0193",
        type: "contains",
        sourceId: LESSON_ID,
        targetId: THIRD_SOURCE_ID,
      },
    ]);

    const rootAlignments = edges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === THIRD_SOURCE_ID,
    );
    expect(rootAlignments).toHaveLength(2);
    expect(rootAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-003-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
      {
        id: "math.alignment.precalc-example-1-6-003-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
    ]);
    expect(rootAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);

    const standardEdges = readJson("standard-edges.json").edges ?? [];
    const mirroredAlignments = standardEdges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === THIRD_SOURCE_ID,
    );
    expect(mirroredAlignments).toHaveLength(2);
    expect(mirroredAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-003-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
      {
        id: "math.alignment.precalc-example-1-6-003-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
    ]);
    expect(mirroredAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);
  });
});

describe("Topic 1.6 Example 4 source link", () => {
  it("mirrors the PDF Example 4 formal-limit task", () => {
    const expectedSource = {
      id: FOURTH_SOURCE_ID,
      kind: "worked_example",
      title: "Example 4: Write polynomial end behavior in limit notation",
      domain: "math.precalc",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=79"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        module: "1",
        lesson: "6",
        exampleNumber: 4,
        sourceLesson: "1-6",
        rawText:
          "Write limit statements for the end behavior of the following polynomials.\na) f(x) = -3x^4. lim(x to -infinity) f(x) = -infinity. lim(x to infinity) f(x) = -infinity.\nb) g(x) = 5x^3 + 2x^2 - 7. lim(x to -infinity) g(x) = -infinity. lim(x to infinity) g(x) = infinity.",
      },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, FOURTH_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(draft, FOURTH_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(root, FOURTH_SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draft, FOURTH_SOURCE_ID)).toEqual([expectedSource]);
  });

  it("preserves the Example 4 lesson and standard relationships", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "appears_in_context" &&
            edge.sourceId === FOURTH_SOURCE_ID &&
            edge.targetId === LESSON_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0400",
        type: "appears_in_context",
        sourceId: FOURTH_SOURCE_ID,
        targetId: LESSON_ID,
      },
    ]);
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "contains" &&
            edge.sourceId === LESSON_ID &&
            edge.targetId === FOURTH_SOURCE_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0401",
        type: "contains",
        sourceId: LESSON_ID,
        targetId: FOURTH_SOURCE_ID,
      },
    ]);

    const rootAlignments = edges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === FOURTH_SOURCE_ID,
    );
    expect(rootAlignments).toHaveLength(2);
    expect(rootAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-004-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
      {
        id: "math.alignment.precalc-example-1-6-004-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
    ]);
    expect(rootAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);

    const standardEdges = readJson("standard-edges.json").edges ?? [];
    const mirroredAlignments = standardEdges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === FOURTH_SOURCE_ID,
    );
    expect(mirroredAlignments).toHaveLength(2);
    expect(mirroredAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-004-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
      {
        id: "math.alignment.precalc-example-1-6-004-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
    ]);
    expect(mirroredAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);
  });
});

describe("Topic 1.6 Example 5 source link", () => {
  it("mirrors the PDF Example 5 calculator-observed end behavior task", () => {
    const expectedSource = {
      id: FIFTH_SOURCE_ID,
      kind: "worked_example",
      title: "Example 5: Use a graphing calculator to observe end behavior",
      domain: "math.precalc",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=79"],
      reviewStatus: "draft",
      metadata: {
        course: "precalc",
        module: "1",
        lesson: "6",
        exampleNumber: 5,
        sourceLesson: "1-6",
        rawText:
          "Use a graphing calculator to determine the end behavior for the following functions.\na) f(x) = x^2 - 3x + 1. Both ends rise: lim(x to -infinity) f(x) = infinity and lim(x to infinity) f(x) = infinity.\nb) g(x) = (2x - 3)/(x + 1). The graph approaches y = 2 on both ends: lim(x to -infinity) g(x) = 2 and lim(x to infinity) g(x) = 2.\nc) h(x) = -10/x^2. The graph approaches 0 from below on both ends: lim(x to -infinity) h(x) = 0 and lim(x to infinity) h(x) = 0.",
      },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, FIFTH_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(draft, FIFTH_SOURCE_ID)).toHaveLength(1);
    expect(findNodes(root, FIFTH_SOURCE_ID)).toEqual([expectedSource]);
    expect(findNodes(draft, FIFTH_SOURCE_ID)).toEqual([expectedSource]);
  });

  it("preserves the Example 5 lesson and standard relationships", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "appears_in_context" &&
            edge.sourceId === FIFTH_SOURCE_ID &&
            edge.targetId === LESSON_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0402",
        type: "appears_in_context",
        sourceId: FIFTH_SOURCE_ID,
        targetId: LESSON_ID,
      },
    ]);
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "contains" &&
            edge.sourceId === LESSON_ID &&
            edge.targetId === FIFTH_SOURCE_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0403",
        type: "contains",
        sourceId: LESSON_ID,
        targetId: FIFTH_SOURCE_ID,
      },
    ]);

    const rootAlignments = edges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === FIFTH_SOURCE_ID,
    );
    expect(rootAlignments).toHaveLength(3);
    expect(rootAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-005-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
      {
        id: "math.alignment.precalc-example-1-6-005-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
      {
        id: "math.alignment.precalc-example-1-6-005-to-ccss-hsf-if-c-7d",
        targetId: HSF_IF_C_7D,
      },
    ]);
    expect(rootAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);

    const standardEdges = readJson("standard-edges.json").edges ?? [];
    const mirroredAlignments = standardEdges.filter(
      (edge) => edge.type === "aligned_to_standard" && edge.sourceId === FIFTH_SOURCE_ID,
    );
    expect(mirroredAlignments).toHaveLength(3);
    expect(mirroredAlignments.map(({ id, targetId }) => ({ id, targetId }))).toEqual([
      {
        id: "math.alignment.precalc-example-1-6-005-to-ccss-hsf-if-c-7c",
        targetId: HSF_IF_C_7C,
      },
      {
        id: "math.alignment.precalc-example-1-6-005-to-ccss-hsf-if-c-7d",
        targetId: HSF_IF_C_7D,
      },
      {
        id: "math.alignment.precalc-example-1-6-005-to-ccss-hsf-if-b-4",
        targetId: HSF_IF_B_4,
      },
    ]);
    expect(mirroredAlignments.some((edge) => edge.targetId === HSA_APR_B_3)).toBe(false);
  });
});

describe("Topic 1.6 Example 1 capability support", () => {
  it("adds the exact graph-to-verbal-and-limit skill in both catalogs", () => {
    const expectedSkill = {
      id: SKILL_ID,
      kind: "skill",
      title: "Describe polynomial end behavior from graphs",
      domain: "math.precalc",
      description:
        "Given a polynomial graph, describe the left and right end behavior verbally and write both limit statements.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=77"],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, SKILL_ID)).toHaveLength(1);
    expect(findNodes(draft, SKILL_ID)).toHaveLength(1);
    expect(findNodes(root, SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draft, SKILL_ID)).toEqual([expectedSkill]);
  });

  it("adds one exclusive support edge from Example 1", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "supports" && edge.sourceId === SOURCE_ID && edge.targetId === SKILL_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0404",
        type: "supports",
        sourceId: SOURCE_ID,
        targetId: SKILL_ID,
      },
    ]);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === SKILL_ID),
    ).toHaveLength(1);
  });
});

describe("Topic 1.6 Example 2 capability support", () => {
  it("adds the exact limit-behavior-to-polynomial-sketch skill in both catalogs", () => {
    const expectedSkill = {
      id: SECOND_SKILL_ID,
      kind: "skill",
      title: "Sketch polynomial functions from end behavior",
      domain: "math.precalc",
      description:
        "Given two end-behavior limit statements for a polynomial function, sketch a polynomial graph whose left and right ends match the statements.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=78"],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, SECOND_SKILL_ID)).toHaveLength(1);
    expect(findNodes(draft, SECOND_SKILL_ID)).toHaveLength(1);
    expect(findNodes(root, SECOND_SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draft, SECOND_SKILL_ID)).toEqual([expectedSkill]);
  });

  it("adds one exclusive support edge from Example 2", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "supports" &&
            edge.sourceId === SECOND_SOURCE_ID &&
            edge.targetId === SECOND_SKILL_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0405",
        type: "supports",
        sourceId: SECOND_SOURCE_ID,
        targetId: SECOND_SKILL_ID,
      },
    ]);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === SECOND_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.sourceId === SECOND_SOURCE_ID),
    ).toHaveLength(1);
  });
});

describe("Topic 1.6 Example 3 capability support", () => {
  it("adds the exact equation-to-end-behavior skill in both catalogs", () => {
    const expectedSkill = {
      id: THIRD_SKILL_ID,
      kind: "skill",
      title: "Determine polynomial end behavior from equations",
      domain: "math.precalc",
      description:
        "Given a polynomial equation, use degree parity and the leading coefficient to state the left and right end behavior verbally.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=78"],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
      rendererKey: "polynomial-equation-end-behavior",
      generatorKey: "topic16-equation-end-behavior",
      independentPracticeReady: true,
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, THIRD_SKILL_ID)).toHaveLength(1);
    expect(findNodes(draft, THIRD_SKILL_ID)).toHaveLength(1);
    expect(findNodes(root, THIRD_SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draft, THIRD_SKILL_ID)).toEqual([expectedSkill]);
  });

  it("adds one exclusive support edge from Example 3", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "supports" &&
            edge.sourceId === THIRD_SOURCE_ID &&
            edge.targetId === THIRD_SKILL_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0406",
        type: "supports",
        sourceId: THIRD_SOURCE_ID,
        targetId: THIRD_SKILL_ID,
      },
    ]);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === THIRD_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.sourceId === THIRD_SOURCE_ID),
    ).toHaveLength(1);
  });
});

describe("Topic 1.6 Example 4 capability support", () => {
  it("adds the exact formal-limit skill in both catalogs", () => {
    const expectedSkill = {
      id: FOURTH_SKILL_ID,
      kind: "skill",
      generatorKey: "topic16-limit-notation-end-behavior",
      rendererKey: "polynomial-limit-notation-end-behavior",
      title: "Write polynomial end behavior in limit notation",
      domain: "math.precalc",
      description:
        "Given a polynomial equation, use its leading term to write both end-behavior limit statements.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=79"],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, FOURTH_SKILL_ID)).toHaveLength(1);
    expect(findNodes(draft, FOURTH_SKILL_ID)).toHaveLength(1);
    expect(findNodes(root, FOURTH_SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draft, FOURTH_SKILL_ID)).toEqual([expectedSkill]);
  });

  it("adds one exclusive support edge from Example 4", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "supports" &&
            edge.sourceId === FOURTH_SOURCE_ID &&
            edge.targetId === FOURTH_SKILL_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0407",
        type: "supports",
        sourceId: FOURTH_SOURCE_ID,
        targetId: FOURTH_SKILL_ID,
      },
    ]);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === FOURTH_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.sourceId === FOURTH_SOURCE_ID),
    ).toHaveLength(1);
  });
});

describe("Topic 1.6 Example 5 capability support", () => {
  it("adds the exact graphing-calculator skill in both catalogs", () => {
    const expectedSkill = {
      id: FIFTH_SKILL_ID,
      kind: "skill",
      title: "Observe function end behavior with a graphing calculator",
      domain: "math.precalc",
      description:
        "Use a graphing calculator to observe both ends of polynomial and rational function graphs and state the corresponding limits.",
      sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=79"],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
    };

    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");

    expect(findNodes(root, FIFTH_SKILL_ID)).toHaveLength(1);
    expect(findNodes(draft, FIFTH_SKILL_ID)).toHaveLength(1);
    expect(findNodes(root, FIFTH_SKILL_ID)).toEqual([expectedSkill]);
    expect(findNodes(draft, FIFTH_SKILL_ID)).toEqual([expectedSkill]);
  });

  it("adds one exclusive support edge from Example 5", () => {
    const edges = readJson("edges.json").edges ?? [];
    expect(
      edges
        .filter(
          (edge) =>
            edge.type === "supports" &&
            edge.sourceId === FIFTH_SOURCE_ID &&
            edge.targetId === FIFTH_SKILL_ID,
        )
        .map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    ).toEqual([
      {
        id: "math.precalc.edge.0408",
        type: "supports",
        sourceId: FIFTH_SOURCE_ID,
        targetId: FIFTH_SKILL_ID,
      },
    ]);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === FIFTH_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.sourceId === FIFTH_SOURCE_ID),
    ).toHaveLength(1);
  });
});

describe("Topic 1.6 obsolete placeholder family", () => {
  it("removes the obsolete skill from node and edge catalogs", () => {
    const root = readJson("nodes.json");
    const draft = readJson("draft-nodes.json");
    const edges = readJson("edges.json");
    const standardEdges = readJson("standard-edges.json");

    expect(findNodes(root, OBSOLETE_SKILL_ID)).toHaveLength(0);
    expect(findNodes(draft, OBSOLETE_SKILL_ID)).toHaveLength(0);
    expect(JSON.stringify(edges)).not.toContain(OBSOLETE_SKILL_ID);
    expect(JSON.stringify(standardEdges)).not.toContain(OBSOLETE_SKILL_ID);
  });

  it("removes the obsolete skill from all placeholder and projection records", () => {
    const blueprints = readJson("blueprints.json").blueprints ?? [];
    const practiceMap = readJson("projection/practice-v1-activity-map.json");
    const standaloneSrs = readJson("projection/srs-input.json").inputs ?? [];
    const generatorGap = readJson("generator-gap-queue.json").items ?? [];

    expect(blueprints.filter((row) => row.nodeId === OBSOLETE_SKILL_ID)).toHaveLength(0);
    expect(
      (practiceMap.activities ?? []).filter((row) => row.nodeId === OBSOLETE_SKILL_ID),
    ).toHaveLength(0);
    expect(
      (practiceMap.srsInputs ?? []).filter((row) => row.nodeId === OBSOLETE_SKILL_ID),
    ).toHaveLength(0);
    expect(standaloneSrs.filter((row) => row.nodeId === OBSOLETE_SKILL_ID)).toHaveLength(0);
    expect(generatorGap.filter((row) => row.nodeId === OBSOLETE_SKILL_ID)).toHaveLength(0);
    expect(JSON.stringify(practiceMap)).not.toContain(OBSOLETE_SKILL_ID);
  });
});
