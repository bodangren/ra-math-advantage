import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import {
  knowledgeBlueprintSchema,
  projectActivityMap,
  projectSrsInputs,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from "@math-platform/knowledge-space-practice";
import {
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
  generateTopic14PolynomialEndBehaviorOutput,
  generateTopic14PolynomialExtremaFromGraphOutput,
  generateTopic14RateSignAndTrendOutput,
} from "@math-platform/math-content/knowledge-space";
import {
  getPropsSchema,
  polynomialEndBehaviorSchema,
  polynomialExtremaFromGraphSchema,
  polynomialDegreeLeadingCoefficientSchema,
  rateSignAndTrendFromGraphSchema,
} from "@math-platform/math-content";
import type { KnowledgeBlueprint } from "@math-platform/knowledge-space-practice";

const GRAPH_DIR = path.join(process.cwd(), "curriculum/skill-graph");
const LESSON_PATH = path.join(
  process.cwd(),
  "curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md",
);
const EXAMPLE_ONE_ID = "math.precalc.example.1.4.001";
const EXAMPLE_TWO_ID = "math.precalc.example.1.4.002";
const EXAMPLE_THREE_ID = "math.precalc.example.1.4.003";
const EXAMPLE_FOUR_ID = "math.precalc.example.1.4.004";
const OBSOLETE_NODE_ID =
  "math.precalc.skill.1.4.identify-polynomial-features-degree-leading-coefficient-extrema";
const NEW_SKILL_ID = "math.precalc.skill.1.4.identify-polynomial-degree-and-leading-coefficient";
const EXAMPLE_TWO_SKILL_ID =
  "math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs";
const EXAMPLE_THREE_SKILL_ID =
  "math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals";
const EXAMPLE_FOUR_SKILL_ID = "math.precalc.skill.1.4.determine-end-behavior-from-leading-term";
const SOURCE_REF =
  "apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md (1-4, Example 1)";
const EXAMPLE_TWO_SOURCE_REF =
  "apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md (1-4, Example 2)";
const EXAMPLE_THREE_SOURCE_REF =
  "apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md (1-4, Example 3)";
const EXAMPLE_FOUR_SOURCE_REF =
  "apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md (1-4, Example 4)";
const POLYNOMIAL_RENDERER_KEY = "polynomial-degree-leading-coefficient";
const POLYNOMIAL_GENERATOR_KEY = "topic14-polynomial-degree-leading-coefficient";
const EXTREMA_RENDERER_KEY = "polynomial-extrema-from-graph";
const EXTREMA_GENERATOR_KEY = "topic14-polynomial-extrema-from-graph";
const RATE_RENDERER_KEY = "rate-sign-and-trend-from-graph";
const RATE_GENERATOR_KEY = "topic14-rate-sign-and-trend";
const END_BEHAVIOR_RENDERER_KEY = "polynomial-end-behavior";
const END_BEHAVIOR_GENERATOR_KEY = "topic14-polynomial-end-behavior";

type NodeRecord = Record<string, unknown> & { id: string };
type EdgeRecord = Record<string, unknown> & { id: string };
type JsonDocument = {
  nodes?: NodeRecord[];
  edges?: EdgeRecord[];
  blueprints?: Record<string, unknown>[];
  activities?: Record<string, unknown>[];
  srsInputs?: Record<string, unknown>[];
  inputs?: Record<string, unknown>[];
  items?: Record<string, unknown>[];
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

function findNodes(nodes: NodeRecord[], id: string): NodeRecord[] {
  return nodes.filter((node) => node.id === id);
}

describe("Topic 1.4 Example 1 graph capability", () => {
  it("synchronizes the Topic 1.4 lesson node across catalogs", () => {
    const lesson = fs.readFileSync(LESSON_PATH, "utf8");
    const canonicalLesson = {
      id: "math.precalc.lesson.1.4",
      kind: "instructional_unit",
      title: "Polynomial Functions and Rates of Change",
      domain: "math.precalc",
      description: "AP Precalculus Unit 1 Lesson 4",
      sourceRefs: [
        "apps/pre-calculus/curriculum/modules/unit-01-polynomial-rational/lesson-1-4/lesson.md",
      ],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    };
    const catalogs = ["nodes.json", "draft-nodes.json", "edges.json", "standard-edges.json"].map(
      (fileName) => readJson(fileName).nodes!,
    );
    const lessonObjects = catalogs.map((nodes) => findNodes(nodes, canonicalLesson.id));

    expect(lesson.startsWith("# Lesson 1-4 — Polynomial Functions and Rates of Change")).toBe(true);
    for (const matches of lessonObjects) {
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(canonicalLesson);
      expect(Object.keys(matches[0]!).sort()).toEqual([
        "description",
        "domain",
        "id",
        "kind",
        "metadata",
        "reviewStatus",
        "sourceRefs",
        "title",
      ]);
    }
    expect(lessonObjects[0]![0]).toEqual(lessonObjects[1]![0]);
    expect(lessonObjects[0]![0]).toEqual(lessonObjects[2]![0]);
    expect(lessonObjects[0]![0]).toEqual(lessonObjects[3]![0]);
    expect(lessonObjects.flatMap((matches) => matches[0]!.sourceRefs as string[])).toEqual(
      Array(4).fill(canonicalLesson.sourceRefs[0]),
    );
    expect(
      lessonObjects
        .flatMap((matches) => matches[0]!.sourceRefs as string[])
        .some((sourceRef) => /unit-0[234]-|unit-01-\*/.test(sourceRef)),
    ).toBe(false);
  });

  it("preserves the authored Example 1 source and answers", () => {
    const lesson = fs.readFileSync(LESSON_PATH, "utf8");
    const example = findNodes(readJson("nodes.json").nodes!, EXAMPLE_ONE_ID);

    expect(example).toHaveLength(1);
    expect(lesson).toContain("**Example 1:** Find the leading coefficient and degree.");
    expect(example[0]).toMatchObject({
      kind: "worked_example",
      sourceRefs: [SOURCE_REF],
      metadata: {
        rawText:
          "Find the leading coefficient and degree.\na) [f(x) = 3x^4 + 2x - 7] → **LC: 3, Degree: 4**\nb) [y = frac{1}{2}x - 7x^3 + 11] → Rewrite: [-7x^3 + frac{1}{2}x + 11]. **LC: -7, Degree: 3**\nc) [g(x) = 4] → This is [4x^0]. **LC: 4, Degree: 0**",
      },
    });
    expect(lesson).toContain("**LC: 3, Degree: 4**");
    expect(lesson).toContain("**LC: -7, Degree: 3**");
    expect(lesson).toContain("**LC: 4, Degree: 0**");
  });

  it("preserves the corrected Example 2 graph result", () => {
    const lesson = fs.readFileSync(LESSON_PATH, "utf8");
    const example = findNodes(readJson("nodes.json").nodes!, EXAMPLE_TWO_ID);
    expect(example).toHaveLength(1);
    expect(example[0]).toMatchObject({
      kind: "worked_example",
      sourceRefs: [EXAMPLE_TWO_SOURCE_REF],
    });
    expect(lesson).toContain("$g(x)=-2x^3+15x^2-24x$");
    expect(lesson).toContain("**relative minimum**");
    expect(lesson).toContain("**relative maximum**");
    expect(example[0]).toMatchObject({ metadata: { rawText: expect.any(String) } });
  });

  it("preserves the corrected Example 3 rate result", () => {
    const lesson = fs.readFileSync(LESSON_PATH, "utf8");
    const example = findNodes(readJson("nodes.json").nodes!, EXAMPLE_THREE_ID);
    expect(example).toHaveLength(1);
    expect(example[0]).toMatchObject({
      kind: "worked_example",
      sourceRefs: [EXAMPLE_THREE_SOURCE_REF],
    });
    expect(lesson).toContain("$h(x)=-(x-4)^2+8$");
    expect(lesson).toContain("**positive and decreasing**");
    expect(example[0]).toMatchObject({ metadata: { rawText: expect.any(String) } });
  });

  it("preserves the corrected Example 4 end-behavior result", () => {
    const lesson = fs.readFileSync(LESSON_PATH, "utf8");
    const example = findNodes(readJson("nodes.json").nodes!, EXAMPLE_FOUR_ID);
    expect(example).toHaveLength(1);
    expect(example[0]).toMatchObject({
      kind: "worked_example",
      sourceRefs: [EXAMPLE_FOUR_SOURCE_REF],
    });
    expect(lesson).toContain("$f(x) = -3x^4$");
    expect(lesson).toContain("degree 4 is even");
    expect(example[0]).toMatchObject({ metadata: { rawText: expect.any(String) } });
  });

  it("adds one exact mirrored draft skill and one exclusive support edge", () => {
    const rootNodes = readJson("nodes.json").nodes!;
    const draftNodes = readJson("draft-nodes.json").nodes!;
    const edges = readJson("edges.json").edges!;
    const expectedSkill = {
      id: NEW_SKILL_ID,
      kind: "skill",
      title: "Identify polynomial degree and leading coefficient",
      domain: "math.precalc",
      description:
        "Given a polynomial expression, identify the degree and leading coefficient, including reordered polynomials and nonzero constants.",
      sourceRefs: [SOURCE_REF],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
      rendererKey: POLYNOMIAL_RENDERER_KEY,
      generatorKey: POLYNOMIAL_GENERATOR_KEY,
      independentPracticeReady: true,
    };

    const rootMatches = findNodes(rootNodes, NEW_SKILL_ID);
    const draftMatches = findNodes(draftNodes, NEW_SKILL_ID);
    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(rootMatches[0]);
    expect(Object.keys(rootMatches[0]!).sort()).toEqual([
      "description",
      "domain",
      "generatorKey",
      "id",
      "independentPracticeReady",
      "kind",
      "metadata",
      "rendererKey",
      "reviewStatus",
      "sourceRefs",
      "title",
    ]);
    expect(rootMatches[0]).toMatchObject({
      rendererKey: POLYNOMIAL_RENDERER_KEY,
      generatorKey: POLYNOMIAL_GENERATOR_KEY,
      independentPracticeReady: true,
    });

    const targetSupportEdges = edges.filter(
      (edge) => edge.type === "supports" && edge.targetId === NEW_SKILL_ID,
    );
    expect(targetSupportEdges).toHaveLength(1);
    expect(targetSupportEdges[0]).toEqual({
      id: "math.precalc.edge.0393",
      type: "supports",
      sourceId: EXAMPLE_ONE_ID,
      targetId: NEW_SKILL_ID,
      weight: 1,
      confidence: "high",
      sourceRefs: [SOURCE_REF],
      rationale:
        "Example 1 supports identifying polynomial degree and leading coefficient from equations.",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(edges.filter((edge) => edge.id === "math.precalc.edge.0393")).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_ONE_ID),
    ).toHaveLength(1);
    expect(
      edges.some(
        (edge) =>
          edge.type === "supports" &&
          /^math\.precalc\.example\.1\.4\./.test(String(edge.sourceId)) &&
          edge.targetId === NEW_SKILL_ID &&
          edge.sourceId !== EXAMPLE_ONE_ID,
      ),
    ).toBe(false);
  });

  it("keeps the four Topic 1.4 lesson membership edges", () => {
    const edges = readJson("edges.json").edges!;
    const exampleToLesson = edges.filter(
      (edge) =>
        edge.type === "appears_in_context" &&
        edge.targetId === "math.precalc.lesson.1.4" &&
        /^math\.precalc\.example\.1\.4\./.test(String(edge.sourceId)),
    );
    const lessonToExample = edges.filter(
      (edge) =>
        edge.type === "contains" &&
        edge.sourceId === "math.precalc.lesson.1.4" &&
        /^math\.precalc\.example\.1\.4\./.test(String(edge.targetId)),
    );

    expect(exampleToLesson).toHaveLength(4);
    expect(lessonToExample).toHaveLength(4);
  });

  it("adds one graph-ready exclusive mirrored skill and support for Example 2", () => {
    const rootNodes = readJson("nodes.json").nodes!;
    const draftNodes = readJson("draft-nodes.json").nodes!;
    const edges = readJson("edges.json").edges!;
    const expectedSkill = {
      id: EXAMPLE_TWO_SKILL_ID,
      kind: "skill",
      title: "Identify relative and absolute extrema from graphs",
      domain: "math.precalc",
      description:
        "Given a polynomial graph, identify relative minima, relative maxima, and absolute extrema from changes in monotonicity and global values.",
      sourceRefs: [EXAMPLE_TWO_SOURCE_REF],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
      rendererKey: EXTREMA_RENDERER_KEY,
      generatorKey: EXTREMA_GENERATOR_KEY,
      independentPracticeReady: true,
    };

    const rootMatches = findNodes(rootNodes, EXAMPLE_TWO_SKILL_ID);
    const draftMatches = findNodes(draftNodes, EXAMPLE_TWO_SKILL_ID);
    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(rootMatches[0]);
    expect(Object.keys(rootMatches[0]!).sort()).toEqual([
      "description",
      "domain",
      "generatorKey",
      "id",
      "independentPracticeReady",
      "kind",
      "metadata",
      "rendererKey",
      "reviewStatus",
      "sourceRefs",
      "title",
    ]);
    expect(rootMatches[0]).toMatchObject({
      rendererKey: EXTREMA_RENDERER_KEY,
      generatorKey: EXTREMA_GENERATOR_KEY,
      independentPracticeReady: true,
    });

    const exampleTwoSupports = edges.filter(
      (edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_TWO_ID,
    );
    expect(exampleTwoSupports).toHaveLength(1);
    expect(exampleTwoSupports[0]).toEqual({
      id: "math.precalc.edge.0394",
      type: "supports",
      sourceId: EXAMPLE_TWO_ID,
      targetId: EXAMPLE_TWO_SKILL_ID,
      weight: 1,
      confidence: "high",
      sourceRefs: [EXAMPLE_TWO_SOURCE_REF],
      rationale: "Example 2 supports identifying relative and absolute extrema from a graph.",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(edges.filter((edge) => edge.id === "math.precalc.edge.0394")).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === EXAMPLE_TWO_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.some(
        (edge) =>
          edge.type === "supports" &&
          /^math\.precalc\.example\.1\.4\./.test(String(edge.sourceId)) &&
          edge.targetId === EXAMPLE_TWO_SKILL_ID &&
          edge.sourceId !== EXAMPLE_TWO_ID,
      ),
    ).toBe(false);
    const exampleOneSupport = edges.find(
      (edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_ONE_ID,
    );
    const exampleTwoSupport = exampleTwoSupports[0]!;
    expect(exampleOneSupport?.targetId).toBe(NEW_SKILL_ID);
    expect(exampleTwoSupport.targetId).toBe(EXAMPLE_TWO_SKILL_ID);
    expect(exampleOneSupport?.targetId).not.toBe(exampleTwoSupport.targetId);
  });

  it("mirrors the existing Example 3 skill and adds one exclusive support edge", () => {
    const rootNodes = readJson("nodes.json").nodes!;
    const draftNodes = readJson("draft-nodes.json").nodes!;
    const edges = readJson("edges.json").edges!;
    const expectedSkill = {
      id: EXAMPLE_THREE_SKILL_ID,
      kind: "skill",
      title: "Describe rate-of-change behavior on intervals using precise language",
      domain: "math.precalc",
      description:
        'Classify ROC as positive/negative and increasing/decreasing on specific intervals. Distinguish "f is increasing" from "f is positive."',
      sourceRefs: [EXAMPLE_THREE_SOURCE_REF],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
      rendererKey: RATE_RENDERER_KEY,
      generatorKey: RATE_GENERATOR_KEY,
      independentPracticeReady: true,
    };

    const rootMatches = findNodes(rootNodes, EXAMPLE_THREE_SKILL_ID);
    const draftMatches = findNodes(draftNodes, EXAMPLE_THREE_SKILL_ID);
    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(rootMatches[0]);
    expect(Object.keys(rootMatches[0]!).sort()).toEqual([
      "description",
      "domain",
      "generatorKey",
      "id",
      "independentPracticeReady",
      "kind",
      "metadata",
      "rendererKey",
      "reviewStatus",
      "sourceRefs",
      "title",
    ]);
    expect(rootMatches[0]).toHaveProperty("rendererKey", RATE_RENDERER_KEY);
    expect(rootMatches[0]).toHaveProperty("generatorKey", RATE_GENERATOR_KEY);
    expect(rootMatches[0]).toHaveProperty("independentPracticeReady", true);

    const exampleThreeSupports = edges.filter(
      (edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_THREE_ID,
    );
    expect(exampleThreeSupports).toHaveLength(1);
    expect(exampleThreeSupports[0]).toEqual({
      id: "math.precalc.edge.0395",
      type: "supports",
      sourceId: EXAMPLE_THREE_ID,
      targetId: EXAMPLE_THREE_SKILL_ID,
      weight: 1,
      confidence: "high",
      sourceRefs: [EXAMPLE_THREE_SOURCE_REF],
      rationale: "Example 3 supports classifying rate-of-change sign and trend on an interval.",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(edges.filter((edge) => edge.id === "math.precalc.edge.0395")).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === EXAMPLE_THREE_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.some(
        (edge) =>
          edge.type === "supports" &&
          /^math\.precalc\.example\.1\.4\./.test(String(edge.sourceId)) &&
          edge.targetId === EXAMPLE_THREE_SKILL_ID &&
          edge.sourceId !== EXAMPLE_THREE_ID,
      ),
    ).toBe(false);

    const exampleOneSupport = edges.find(
      (edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_ONE_ID,
    );
    const exampleTwoSupport = edges.find(
      (edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_TWO_ID,
    );
    expect(exampleOneSupport?.targetId).toBe(NEW_SKILL_ID);
    expect(exampleTwoSupport?.targetId).toBe(EXAMPLE_TWO_SKILL_ID);
    expect(exampleThreeSupports[0]!.targetId).toBe(EXAMPLE_THREE_SKILL_ID);
    expect(
      new Set([
        exampleOneSupport?.targetId,
        exampleTwoSupport?.targetId,
        exampleThreeSupports[0]!.targetId,
      ]).size,
    ).toBe(3);
  });

  it("mirrors the existing Example 4 skill and adds one exclusive support edge", () => {
    const rootNodes = readJson("nodes.json").nodes!;
    const draftNodes = readJson("draft-nodes.json").nodes!;
    const edges = readJson("edges.json").edges!;
    const expectedSkill = {
      id: EXAMPLE_FOUR_SKILL_ID,
      kind: "skill",
      title: "Determine polynomial end behavior from the leading term",
      domain: "math.precalc",
      description:
        "Use degree (even/odd) and leading coefficient (positive/negative) to determine the four end-behavior patterns. Write limit statements.",
      sourceRefs: [EXAMPLE_FOUR_SOURCE_REF],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
      rendererKey: END_BEHAVIOR_RENDERER_KEY,
      generatorKey: END_BEHAVIOR_GENERATOR_KEY,
      independentPracticeReady: true,
    };

    const rootMatches = findNodes(rootNodes, EXAMPLE_FOUR_SKILL_ID);
    const draftMatches = findNodes(draftNodes, EXAMPLE_FOUR_SKILL_ID);
    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(rootMatches[0]);
    expect(Object.keys(rootMatches[0]!).sort()).toEqual([
      "description",
      "domain",
      "generatorKey",
      "id",
      "independentPracticeReady",
      "kind",
      "metadata",
      "rendererKey",
      "reviewStatus",
      "sourceRefs",
      "title",
    ]);
    expect(rootMatches[0]).toHaveProperty("rendererKey", END_BEHAVIOR_RENDERER_KEY);
    expect(rootMatches[0]).toHaveProperty("generatorKey", END_BEHAVIOR_GENERATOR_KEY);
    expect(rootMatches[0]).toHaveProperty("independentPracticeReady", true);

    const exampleFourSupports = edges.filter(
      (edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_FOUR_ID,
    );
    expect(exampleFourSupports).toHaveLength(1);
    expect(exampleFourSupports[0]).toEqual({
      id: "math.precalc.edge.0396",
      type: "supports",
      sourceId: EXAMPLE_FOUR_ID,
      targetId: EXAMPLE_FOUR_SKILL_ID,
      weight: 1,
      confidence: "high",
      sourceRefs: [EXAMPLE_FOUR_SOURCE_REF],
      rationale:
        "Example 4 supports determining polynomial end behavior from degree parity and leading-coefficient sign.",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(edges.filter((edge) => edge.id === "math.precalc.edge.0396")).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.targetId === EXAMPLE_FOUR_SKILL_ID),
    ).toHaveLength(1);
    expect(
      edges.some(
        (edge) =>
          edge.type === "supports" &&
          /^math\.precalc\.example\.1\.4\./.test(String(edge.sourceId)) &&
          edge.targetId === EXAMPLE_FOUR_SKILL_ID &&
          edge.sourceId !== EXAMPLE_FOUR_ID,
      ),
    ).toBe(false);

    const supportTargets = [EXAMPLE_ONE_ID, EXAMPLE_TWO_ID, EXAMPLE_THREE_ID, EXAMPLE_FOUR_ID].map(
      (exampleId) =>
        edges.find((edge) => edge.type === "supports" && edge.sourceId === exampleId)?.targetId,
    );
    expect(supportTargets).toEqual([
      NEW_SKILL_ID,
      EXAMPLE_TWO_SKILL_ID,
      EXAMPLE_THREE_SKILL_ID,
      EXAMPLE_FOUR_SKILL_ID,
    ]);
    expect(new Set(supportTargets).size).toBe(4);
  });

  it("stores the source-backed graph-ready Example 4 blueprint with live three-mode props", () => {
    const blueprintDocument = readJson("blueprints.json") as unknown as {
      blueprints: KnowledgeBlueprint[];
    };
    const blueprints = blueprintDocument.blueprints;
    const matches = blueprints.filter((candidate) => candidate.nodeId === EXAMPLE_FOUR_SKILL_ID);
    expect(matches).toHaveLength(1);
    const blueprint = matches[0]!;
    const workedOutput = generateTopic14PolynomialEndBehaviorOutput(0);
    const guidedOutput = generateTopic14PolynomialEndBehaviorOutput(1);
    const independentOutput = generateTopic14PolynomialEndBehaviorOutput(2);
    const workedPublic = workedOutput.data.rendererProps as Record<string, unknown>;
    const guidedPublic = guidedOutput.data.rendererProps as Record<string, unknown>;
    const independentPublic = independentOutput.data.rendererProps as Record<string, unknown>;
    const workedSteps = workedOutput.solutionSteps.map((step) => step.description);
    const guidedSteps = [
      "Identify whether the degree is even or odd.",
      "Identify whether the leading coefficient is positive or negative.",
      "Use the degree parity and leading-coefficient sign to determine both ends.",
    ];
    const fieldHelp =
      "An even degree sends both ends in the same direction. An odd degree sends them in opposite directions. The leading coefficient determines the right end.";
    const finalAnswer =
      "As x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches negative infinity.";

    expect(blueprint).toMatchObject({
      nodeId: EXAMPLE_FOUR_SKILL_ID,
      sourceNodeIds: [EXAMPLE_FOUR_ID],
      alignmentNodeIds: ["math.standard.ccss.hsf-if-c-7c", "math.standard.ccss.hsf-if-b-4"],
      rendererKey: END_BEHAVIOR_RENDERER_KEY,
      rendererModeMap: {
        worked: END_BEHAVIOR_RENDERER_KEY,
        guidedPractice: END_BEHAVIOR_RENDERER_KEY,
        independentPractice: END_BEHAVIOR_RENDERER_KEY,
      },
      generatorKey: END_BEHAVIOR_GENERATOR_KEY,
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");
    expect(blueprint.workedExampleSpec).toMatchObject({
      prompt: workedOutput.prompt,
      givens: ["For f(x) = -3x^4, the degree is 4 and the leading coefficient is -3."],
      target: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps,
      explanation:
        "The degree is even, so both ends move in the same direction. The negative leading coefficient makes both ends fall toward negative infinity.",
    });
    expect(blueprint.workedExampleSpec!.rendererProps).toEqual({
      ...workedPublic,
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedSteps,
      finalAnswer,
    });
    expect(blueprint.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: guidedOutput.prompt,
      stepPrompts: guidedSteps,
      hints: [
        "Check whether the exponent is even or odd.",
        "Check whether the leading coefficient is positive or negative.",
        "Apply the parity and sign rules to both ends.",
      ],
      checksPerStep: [
        { check: "The exponent is even or odd." },
        { check: "The leading coefficient is positive or negative." },
        { check: "The end directions follow from degree parity and coefficient sign." },
      ],
      revealPolicy: "one_at_a_time",
    });
    expect(blueprint.guidedPracticeSpec!.rendererProps).toEqual({
      ...guidedPublic,
      presentationMode: "guided_practice",
      guidedSteps,
      fieldHelp,
    });
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: {
        seed: {
          type: "integer",
          min: 0,
          description: "Deterministic Topic 1.4 polynomial end-behavior variant seed",
        },
      },
      answerSchema: {
        leftEnd: "string",
        rightEnd: "string",
      },
      gradingRules: [
        { partId: "leftEnd", ruleType: "exact_match", maxScore: 1 },
        { partId: "rightEnd", ruleType: "exact_match", maxScore: 1 },
      ],
      replayPolicy: "any_seed",
    });
    expect(blueprint.independentPracticeSpec!.rendererProps).toEqual(independentPublic);
    for (const props of [
      blueprint.workedExampleSpec!.rendererProps!,
      blueprint.guidedPracticeSpec!.rendererProps!,
      blueprint.independentPracticeSpec!.rendererProps!,
    ]) {
      expect(polynomialEndBehaviorSchema.safeParse(props).success).toBe(true);
      expect(getPropsSchema(END_BEHAVIOR_RENDERER_KEY)?.safeParse(props).success).toBe(true);
    }
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["leftEnd", "rightEnd"],
      passingScore: 2,
      partialCredit: true,
      rubric: [
        { criteria: "Identify the left end behavior.", points: 1, partId: "leftEnd" },
        { criteria: "Identify the right end behavior.", points: 1, partId: "rightEnd" },
      ],
    });

    const nodes = readJson("nodes.json").nodes! as unknown as Parameters<
      typeof projectActivityMap
    >[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const expectedActivities = projectActivityMap(nodes, edges, blueprints).filter(
      (row) => row.nodeId === EXAMPLE_FOUR_SKILL_ID,
    );
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints).filter(
      (row) => row.nodeId === EXAMPLE_FOUR_SKILL_ID,
    );
    const practiceMap = readJson("projection/practice-v1-activity-map.json");
    const actualActivities = practiceMap.activities!.filter(
      (row) => row.nodeId === EXAMPLE_FOUR_SKILL_ID,
    );
    const actualCombinedSrs = practiceMap.srsInputs!.filter(
      (row) => row.nodeId === EXAMPLE_FOUR_SKILL_ID,
    );
    const actualStandaloneSrs = readJson("projection/srs-input.json").inputs!.filter(
      (row) => row.nodeId === EXAMPLE_FOUR_SKILL_ID,
    );
    const generatorGapQueue = readJson("generator-gap-queue.json").items!;

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(actualActivities.map((row) => row.stableActivityId)).toEqual([
      `${EXAMPLE_FOUR_SKILL_ID}.worked_example`,
      `${EXAMPLE_FOUR_SKILL_ID}.guided_practice`,
      `${EXAMPLE_FOUR_SKILL_ID}.independent_practice`,
    ]);
    for (const row of actualActivities) expect(row.sourceNodeIds).toContain(EXAMPLE_FOUR_ID);
    expect(actualActivities.map((row) => row.rendererKey)).toEqual([
      END_BEHAVIOR_RENDERER_KEY,
      END_BEHAVIOR_RENDERER_KEY,
      END_BEHAVIOR_RENDERER_KEY,
    ]);
    expect(actualActivities.map((row) => row.props)).toEqual([
      blueprint.workedExampleSpec!.rendererProps,
      blueprint.guidedPracticeSpec!.rendererProps,
      blueprint.independentPracticeSpec!.rendererProps,
    ]);
    expect(actualActivities.map((row) => row.gradingConfig)).toEqual([
      blueprint.gradingSpec,
      blueprint.gradingSpec,
      blueprint.gradingSpec,
    ]);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs[0]).toEqual(expectedSrs[0]);
    expect(actualCombinedSrs[0]).toMatchObject({
      blueprintId: `${EXAMPLE_FOUR_SKILL_ID}.blueprint`,
      generatorKey: END_BEHAVIOR_GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({
      blueprintId: `${EXAMPLE_FOUR_SKILL_ID}.blueprint`,
      generatorKey: END_BEHAVIOR_GENERATOR_KEY,
      generatorReady: true,
    });
    expect(
      generatorGapQueue.filter((record) => record.nodeId === EXAMPLE_FOUR_SKILL_ID),
    ).toHaveLength(0);
  });

  it("stores the source-backed graph-ready Example 1 blueprint and projections", () => {
    const blueprintDocument = readJson("blueprints.json") as unknown as {
      blueprints: KnowledgeBlueprint[];
    };
    const blueprints = blueprintDocument.blueprints;
    const blueprint = blueprints.filter((candidate) => candidate.nodeId === NEW_SKILL_ID);
    expect(blueprint).toHaveLength(1);
    const exampleOneBlueprint = blueprint[0]!;
    const workedOutput = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
    const guidedOutput = generateTopic14PolynomialDegreeLeadingCoefficientOutput(1);
    const independentOutput = generateTopic14PolynomialDegreeLeadingCoefficientOutput(2);
    const workedRendererProps = workedOutput.data.rendererProps as Record<string, unknown>;
    const guidedRendererProps = guidedOutput.data.rendererProps as Record<string, unknown>;
    const independentRendererProps = independentOutput.data.rendererProps as Record<
      string,
      unknown
    >;
    const workedProps = exampleOneBlueprint.workedExampleSpec!.rendererProps!;
    const guidedProps = exampleOneBlueprint.guidedPracticeSpec!.rendererProps!;
    const independentProps = exampleOneBlueprint.independentPracticeSpec!.rendererProps!;

    expect(exampleOneBlueprint).toMatchObject({
      nodeId: NEW_SKILL_ID,
      sourceNodeIds: [EXAMPLE_ONE_ID],
      alignmentNodeIds: ["math.standard.ccss.hsa-apr-a-1", "math.standard.ccss.hsf-if-c-7c"],
      rendererKey: POLYNOMIAL_RENDERER_KEY,
      rendererModeMap: {
        worked: POLYNOMIAL_RENDERER_KEY,
        guidedPractice: POLYNOMIAL_RENDERER_KEY,
        independentPractice: POLYNOMIAL_RENDERER_KEY,
      },
      generatorKey: POLYNOMIAL_GENERATOR_KEY,
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(exampleOneBlueprint).not.toHaveProperty("exceptions");
    expect(exampleOneBlueprint.workedExampleSpec).toMatchObject({
      prompt: "Find the leading coefficient and degree.",
      givens: ["a) f(x) = 3x^4 + 2x - 7", "b) y = frac{1}{2}x - 7x^3 + 11", "c) g(x) = 4"],
      target: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps,
      explanation:
        "The degree is the greatest exponent. The leading coefficient belongs to that term. Inspect exponents before written term order, and treat a nonzero constant as a degree-0 polynomial.",
    });
    expect(workedProps).toEqual({
      ...workedRendererProps,
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer:
        "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.",
    });
    expect(exampleOneBlueprint.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: "Find the degree and leading coefficient for each expression.",
      stepPrompts: [
        "Find the term with the greatest exponent in each expression.",
        "Use that exponent as the degree.",
        "Use the coefficient of that term as the leading coefficient.",
        "Treat a nonzero constant as a degree-0 polynomial.",
      ],
      hints: [
        "Find the largest exponent in each expression.",
        "Record the largest exponent as the degree.",
        "Read the coefficient paired with the largest exponent.",
        "Write degree 0 for a nonzero constant.",
      ],
      checksPerStep: [
        { check: "The learner finds the greatest exponent in each expression." },
        { check: "The learner records the greatest exponent as the degree." },
        { check: "The learner identifies the coefficient paired with the greatest exponent." },
        { check: "The learner identifies each nonzero constant as degree 0." },
      ],
      revealPolicy: "one_at_a_time",
    });
    expect(guidedProps).toEqual({
      ...guidedRendererProps,
      presentationMode: "guided_practice",
      guidedSteps: [
        "Find the term with the greatest exponent in each expression.",
        "Use that exponent as the degree.",
        "Use the coefficient of that term as the leading coefficient.",
        "Treat a nonzero constant as a degree-0 polynomial.",
      ],
      fieldHelp: "Inspect exponents before you use the written term order.",
    });
    expect(exampleOneBlueprint.independentPracticeSpec).toMatchObject({
      variantParameters: {
        seed: {
          type: "integer",
          min: 0,
          description:
            "Deterministic Topic 1.4 polynomial degree and leading coefficient variant seed",
        },
      },
      answerSchema: {
        a_degree: "number",
        a_leading_coefficient: "number",
        b_degree: "number",
        b_leading_coefficient: "number",
        c_degree: "number",
        c_leading_coefficient: "number",
      },
      replayPolicy: "any_seed",
    });
    expect(independentProps).toEqual(independentRendererProps);
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(polynomialDegreeLeadingCoefficientSchema.safeParse(props).success).toBe(true);
      expect(getPropsSchema(POLYNOMIAL_RENDERER_KEY)?.safeParse(props).success).toBe(true);
    }
    expect(validateBlueprintGeneratorReadiness(exampleOneBlueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(exampleOneBlueprint).success).toBe(true);
    expect(validateModeSupport(exampleOneBlueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(exampleOneBlueprint)).toMatchObject({ valid: true });
    expect(exampleOneBlueprint.gradingSpec).toEqual({
      partIds: [
        "a_degree",
        "a_leading_coefficient",
        "b_degree",
        "b_leading_coefficient",
        "c_degree",
        "c_leading_coefficient",
      ],
      passingScore: 6,
      partialCredit: true,
      rubric: [
        { criteria: "Identify the degree for part a.", points: 1, partId: "a_degree" },
        {
          criteria: "Identify the leading coefficient for part a.",
          points: 1,
          partId: "a_leading_coefficient",
        },
        { criteria: "Identify the degree for part b.", points: 1, partId: "b_degree" },
        {
          criteria: "Identify the leading coefficient for part b.",
          points: 1,
          partId: "b_leading_coefficient",
        },
        { criteria: "Identify the degree for part c.", points: 1, partId: "c_degree" },
        {
          criteria: "Identify the leading coefficient for part c.",
          points: 1,
          partId: "c_leading_coefficient",
        },
      ],
    });

    const nodes = readJson("nodes.json").nodes! as unknown as Parameters<
      typeof projectActivityMap
    >[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const expectedActivities = projectActivityMap(nodes, edges, blueprints).filter(
      (row) => row.nodeId === NEW_SKILL_ID,
    );
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints).filter(
      (row) => row.nodeId === NEW_SKILL_ID,
    );
    const practiceMap = readJson("projection/practice-v1-activity-map.json");
    const actualActivities = practiceMap.activities!.filter((row) => row.nodeId === NEW_SKILL_ID);
    const actualCombinedSrs = practiceMap.srsInputs!.filter((row) => row.nodeId === NEW_SKILL_ID);
    const standaloneSrs = readJson("projection/srs-input.json").inputs!;
    const actualStandaloneSrs = standaloneSrs.filter((row) => row.nodeId === NEW_SKILL_ID);

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    for (const row of actualActivities) expect(row.sourceNodeIds).toContain(EXAMPLE_ONE_ID);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(actualActivities.map((row) => row.props)).toEqual([
      workedProps,
      guidedProps,
      independentProps,
    ]);
    expect(new Set(actualActivities.map((row) => row.stableActivityId)).size).toBe(3);
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs[0]).toEqual(expectedSrs[0]);
    expect(actualCombinedSrs[0]).toMatchObject({
      generatorKey: POLYNOMIAL_GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });
    expect(practiceMap.activities!.filter((row) => row.nodeId === NEW_SKILL_ID)).toHaveLength(3);
    expect(practiceMap.srsInputs!.filter((row) => row.nodeId === NEW_SKILL_ID)).toHaveLength(1);
  });

  it("stores the source-backed graph-ready Example 2 blueprint and projections", () => {
    const blueprintDocument = readJson("blueprints.json") as unknown as {
      blueprints: KnowledgeBlueprint[];
    };
    const blueprints = blueprintDocument.blueprints;
    const matches = blueprints.filter((candidate) => candidate.nodeId === EXAMPLE_TWO_SKILL_ID);
    expect(matches).toHaveLength(1);
    const blueprint = matches[0]!;
    const workedOutput = generateTopic14PolynomialExtremaFromGraphOutput(0);
    const guidedOutput = generateTopic14PolynomialExtremaFromGraphOutput(1);
    const independentOutput = generateTopic14PolynomialExtremaFromGraphOutput(2);
    const workedPublic = workedOutput.data.rendererProps as Record<string, unknown>;
    const guidedPublic = guidedOutput.data.rendererProps as Record<string, unknown>;
    const independentPublic = independentOutput.data.rendererProps as Record<string, unknown>;
    const workedProps = blueprint.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint.independentPracticeSpec!.rendererProps!;
    const guidedSteps = [
      "Find where the graph changes from decreasing to increasing.",
      "Find where the graph changes from increasing to decreasing.",
      "Compare the displayed y-values to identify the absolute minimum.",
    ];

    expect(blueprint).toMatchObject({
      nodeId: EXAMPLE_TWO_SKILL_ID,
      sourceNodeIds: [EXAMPLE_TWO_ID],
      alignmentNodeIds: ["math.standard.ccss.hsa-apr-a-1", "math.standard.ccss.hsf-if-c-7c"],
      rendererKey: EXTREMA_RENDERER_KEY,
      rendererModeMap: {
        worked: EXTREMA_RENDERER_KEY,
        guidedPractice: EXTREMA_RENDERER_KEY,
        independentPractice: EXTREMA_RENDERER_KEY,
      },
      generatorKey: EXTREMA_GENERATOR_KEY,
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");
    expect(blueprint.workedExampleSpec).toMatchObject({
      prompt: workedOutput.prompt,
      target: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps,
      explanation:
        "A decreasing-to-increasing change at x = 1 gives a relative minimum. An increasing-to-decreasing change at x = 4 gives a relative maximum. The lowest displayed value is at x = 1, so g(1) is the absolute minimum.",
    });
    expect(workedProps).toEqual({
      ...workedPublic,
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer:
        "x = 1 is a relative minimum and the absolute minimum; x = 4 is a relative maximum.",
    });
    expect(blueprint.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: "Identify the relative and absolute extrema from the graph.",
      stepPrompts: guidedSteps,
      hints: [
        "Look for the change from decreasing to increasing.",
        "Look for the change from increasing to decreasing.",
        "Compare the displayed y-values and find the lowest one.",
      ],
      checksPerStep: [
        {
          check:
            "The relative minimum occurs where the graph changes from decreasing to increasing.",
        },
        {
          check:
            "The relative maximum occurs where the graph changes from increasing to decreasing.",
        },
        { check: "The absolute minimum is at the displayed point with the lowest y-value." },
      ],
      revealPolicy: "one_at_a_time",
    });
    expect(guidedProps).toEqual({
      ...guidedPublic,
      presentationMode: "guided_practice",
      guidedSteps,
      fieldHelp:
        "A relative extremum occurs where the graph changes direction. The absolute minimum is the lowest displayed value.",
    });
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: {
        seed: {
          type: "integer",
          min: 0,
          description: "Deterministic Topic 1.4 polynomial extrema graph variant seed",
        },
      },
      answerSchema: {
        relative_minimum_x: "number",
        relative_maximum_x: "number",
        absolute_minimum_x: "number",
      },
      gradingRules: [
        { partId: "relative_minimum_x", ruleType: "exact_match", maxScore: 1 },
        { partId: "relative_maximum_x", ruleType: "exact_match", maxScore: 1 },
        { partId: "absolute_minimum_x", ruleType: "exact_match", maxScore: 1 },
      ],
      replayPolicy: "any_seed",
    });
    expect(independentProps).toEqual(independentPublic);
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(polynomialExtremaFromGraphSchema.safeParse(props).success).toBe(true);
      expect(getPropsSchema(EXTREMA_RENDERER_KEY)?.safeParse(props).success).toBe(true);
    }
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["relative_minimum_x", "relative_maximum_x", "absolute_minimum_x"],
      passingScore: 3,
      partialCredit: true,
      rubric: [
        {
          criteria: "Identify the relative minimum x-value.",
          points: 1,
          partId: "relative_minimum_x",
        },
        {
          criteria: "Identify the relative maximum x-value.",
          points: 1,
          partId: "relative_maximum_x",
        },
        {
          criteria: "Identify the absolute minimum x-value.",
          points: 1,
          partId: "absolute_minimum_x",
        },
      ],
    });

    const nodes = readJson("nodes.json").nodes! as unknown as Parameters<
      typeof projectActivityMap
    >[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const expectedActivities = projectActivityMap(nodes, edges, blueprints).filter(
      (row) => row.nodeId === EXAMPLE_TWO_SKILL_ID,
    );
    const expectedSrs = projectSrsInputs(nodes, edges, blueprints).filter(
      (row) => row.nodeId === EXAMPLE_TWO_SKILL_ID,
    );
    const practiceMap = readJson("projection/practice-v1-activity-map.json");
    const actualActivities = practiceMap.activities!.filter(
      (row) => row.nodeId === EXAMPLE_TWO_SKILL_ID,
    );
    const actualCombinedSrs = practiceMap.srsInputs!.filter(
      (row) => row.nodeId === EXAMPLE_TWO_SKILL_ID,
    );
    const standaloneSrs = readJson("projection/srs-input.json").inputs!;
    const actualStandaloneSrs = standaloneSrs.filter((row) => row.nodeId === EXAMPLE_TWO_SKILL_ID);

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    for (const row of actualActivities) expect(row.sourceNodeIds).toContain(EXAMPLE_TWO_ID);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(actualActivities.map((row) => row.props)).toEqual([
      workedProps,
      guidedProps,
      independentProps,
    ]);
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs[0]).toEqual(expectedSrs[0]);
    expect(actualCombinedSrs[0]).toMatchObject({
      generatorKey: EXTREMA_GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });
    expect(
      blueprints.filter((candidate) => candidate.nodeId === EXAMPLE_THREE_SKILL_ID),
    ).toHaveLength(1);
    expect(
      blueprints.filter((candidate) => candidate.nodeId === EXAMPLE_FOUR_SKILL_ID),
    ).toHaveLength(1);
    expect(
      practiceMap.activities!.filter((row) => row.nodeId === EXAMPLE_THREE_SKILL_ID),
    ).toHaveLength(3);
    expect(
      practiceMap.activities!.filter((row) => row.nodeId === EXAMPLE_FOUR_SKILL_ID),
    ).toHaveLength(3);
  });

  it("stores the source-backed practice-ready Example 3 blueprint and projections", () => {
    const rootNodes = readJson("nodes.json").nodes!;
    const draftNodes = readJson("draft-nodes.json").nodes!;
    const edges = readJson("edges.json").edges!;
    const generatorGapQueue = readJson("generator-gap-queue.json").items!;
    const blueprintDocument = readJson("blueprints.json") as unknown as {
      blueprints: KnowledgeBlueprint[];
    };
    const blueprints = blueprintDocument.blueprints;
    const blueprintMatches = blueprints.filter(
      (candidate) => candidate.nodeId === EXAMPLE_THREE_SKILL_ID,
    );
    expect(blueprintMatches).toHaveLength(1);
    const blueprint = blueprintMatches[0]!;
    const expectedSkill = {
      id: EXAMPLE_THREE_SKILL_ID,
      kind: "skill",
      title: "Describe rate-of-change behavior on intervals using precise language",
      domain: "math.precalc",
      description:
        'Classify ROC as positive/negative and increasing/decreasing on specific intervals. Distinguish "f is increasing" from "f is positive."',
      sourceRefs: [EXAMPLE_THREE_SOURCE_REF],
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
      rendererKey: RATE_RENDERER_KEY,
      generatorKey: RATE_GENERATOR_KEY,
      independentPracticeReady: true,
    };
    const rootMatches = findNodes(rootNodes, EXAMPLE_THREE_SKILL_ID);
    const draftMatches = findNodes(draftNodes, EXAMPLE_THREE_SKILL_ID);
    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(expectedSkill);
    expect(draftMatches[0]).toEqual(rootMatches[0]);

    const workedOutput = generateTopic14RateSignAndTrendOutput(0);
    const guidedOutput = generateTopic14RateSignAndTrendOutput(1);
    const independentOutput = generateTopic14RateSignAndTrendOutput(2);
    const workedPublic = workedOutput.data.rendererProps as Record<string, unknown>;
    const guidedPublic = guidedOutput.data.rendererProps as Record<string, unknown>;
    const independentPublic = independentOutput.data.rendererProps as Record<string, unknown>;
    const guidedSteps = [
      "Determine whether h rises or falls on the interval.",
      "Determine whether the rate of change increases or decreases as x increases.",
    ];
    const finalAnswer = "The rate of change is positive and decreasing on (3, 4).";

    expect(blueprint).toMatchObject({
      nodeId: EXAMPLE_THREE_SKILL_ID,
      sourceNodeIds: [EXAMPLE_THREE_ID],
      alignmentNodeIds: ["math.standard.ccss.hsf-if-c-7c", "math.standard.ccss.hsf-if-b-4"],
      rendererKey: RATE_RENDERER_KEY,
      rendererModeMap: {
        worked: RATE_RENDERER_KEY,
        guidedPractice: RATE_RENDERER_KEY,
        independentPractice: RATE_RENDERER_KEY,
      },
      generatorKey: RATE_GENERATOR_KEY,
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "4" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");
    expect(blueprint.workedExampleSpec).toMatchObject({
      prompt: workedOutput.prompt,
      givens: [
        "For the graph of h on the interval (3, 4), the graph rises and flattens as x increases.",
      ],
      target: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps,
      explanation:
        "On (3, 4), h rises, so the rate of change is positive. The graph flattens as x increases, so the positive rate of change is decreasing.",
    });
    expect(blueprint.workedExampleSpec!.rendererProps).toEqual({
      ...workedPublic,
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer,
    });
    expect(blueprint.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: guidedOutput.prompt,
      stepPrompts: guidedSteps,
      hints: [
        "Check whether h rises or falls on the interval.",
        "Compare the rate changes from left to right.",
      ],
      checksPerStep: [
        { check: "The graph rises or falls on the interval." },
        { check: "The rate changes increase or decrease from left to right." },
      ],
      revealPolicy: "one_at_a_time",
    });
    expect(blueprint.guidedPracticeSpec!.rendererProps).toEqual({
      ...guidedPublic,
      presentationMode: "guided_practice",
      guidedSteps,
      fieldHelp:
        "A positive rate means h rises. A decreasing rate means the graph flattens as x increases.",
    });
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: {
        seed: {
          type: "integer",
          min: 0,
          description: "Deterministic Topic 1.4 rate sign and trend variant seed",
        },
      },
      answerSchema: { rateSign: "string", rateTrend: "string" },
      gradingRules: [
        { partId: "rateSign", ruleType: "exact_match", maxScore: 1 },
        { partId: "rateTrend", ruleType: "exact_match", maxScore: 1 },
      ],
      replayPolicy: "any_seed",
    });
    expect(blueprint.independentPracticeSpec!.rendererProps).toEqual(independentPublic);
    for (const props of [
      blueprint.workedExampleSpec!.rendererProps!,
      blueprint.guidedPracticeSpec!.rendererProps!,
      blueprint.independentPracticeSpec!.rendererProps!,
    ]) {
      expect(rateSignAndTrendFromGraphSchema.safeParse(props).success).toBe(true);
      expect(getPropsSchema(RATE_RENDERER_KEY)?.safeParse(props).success).toBe(true);
    }
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["rateSign", "rateTrend"],
      passingScore: 2,
      partialCredit: true,
      rubric: [
        { criteria: "Identify the rate sign.", points: 1, partId: "rateSign" },
        { criteria: "Identify the rate trend.", points: 1, partId: "rateTrend" },
      ],
    });

    const expectedActivities = projectActivityMap(
      rootNodes as unknown as Parameters<typeof projectActivityMap>[0],
      edges as unknown as Parameters<typeof projectActivityMap>[1],
      blueprints,
    ).filter((row) => row.nodeId === EXAMPLE_THREE_SKILL_ID);
    const expectedSrs = projectSrsInputs(
      rootNodes as unknown as Parameters<typeof projectSrsInputs>[0],
      edges as unknown as Parameters<typeof projectSrsInputs>[1],
      blueprints,
    ).filter((row) => row.nodeId === EXAMPLE_THREE_SKILL_ID);
    const practiceMap = readJson("projection/practice-v1-activity-map.json");
    const actualActivities = practiceMap.activities!.filter(
      (row) => row.nodeId === EXAMPLE_THREE_SKILL_ID,
    );
    const actualCombinedSrs = practiceMap.srsInputs!.filter(
      (row) => row.nodeId === EXAMPLE_THREE_SKILL_ID,
    );
    const actualStandaloneSrs = readJson("projection/srs-input.json").inputs!.filter(
      (row) => row.nodeId === EXAMPLE_THREE_SKILL_ID,
    );
    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(actualActivities.map((row) => row.stableActivityId)).toEqual([
      `${EXAMPLE_THREE_SKILL_ID}.worked_example`,
      `${EXAMPLE_THREE_SKILL_ID}.guided_practice`,
      `${EXAMPLE_THREE_SKILL_ID}.independent_practice`,
    ]);
    for (const row of actualActivities) expect(row.sourceNodeIds).toContain(EXAMPLE_THREE_ID);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(actualActivities.map((row) => row.props)).toEqual([
      blueprint.workedExampleSpec!.rendererProps,
      blueprint.guidedPracticeSpec!.rendererProps,
      blueprint.independentPracticeSpec!.rendererProps,
    ]);
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs[0]).toEqual(expectedSrs[0]);
    expect(actualCombinedSrs[0]).toMatchObject({
      generatorKey: RATE_GENERATOR_KEY,
      generatorReady: true,
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({
      generatorKey: RATE_GENERATOR_KEY,
      generatorReady: true,
    });
    expect(
      generatorGapQueue.filter((record) => record.nodeId === EXAMPLE_THREE_SKILL_ID),
    ).toHaveLength(0);
    expect(edges.filter((edge) => edge.id === "math.precalc.edge.0395")).toHaveLength(1);
    expect(
      edges.filter((edge) => edge.type === "supports" && edge.sourceId === EXAMPLE_THREE_ID),
    ).toHaveLength(1);
  });

  it("removes the obsolete combined Topic 1.4 artifacts", () => {
    const rootNodes = readJson("nodes.json").nodes!;
    const draftNodes = readJson("draft-nodes.json").nodes!;
    const blueprints = readJson("blueprints.json").blueprints!;
    const practiceMap = readJson("projection/practice-v1-activity-map.json");
    const standaloneSrs = readJson("projection/srs-input.json").inputs!;
    const queue = readJson("generator-gap-queue.json").items!;
    const topic14 = (record: Record<string, unknown>) =>
      String(record.nodeId).startsWith("math.precalc.skill.1.4.");

    expect(findNodes(rootNodes, OBSOLETE_NODE_ID)).toHaveLength(0);
    expect(findNodes(draftNodes, OBSOLETE_NODE_ID)).toHaveLength(0);
    expect(blueprints.filter((record) => record.nodeId === OBSOLETE_NODE_ID)).toHaveLength(0);
    expect(
      practiceMap.activities!.filter((record) => record.nodeId === OBSOLETE_NODE_ID),
    ).toHaveLength(0);
    expect(
      practiceMap.srsInputs!.filter((record) => record.nodeId === OBSOLETE_NODE_ID),
    ).toHaveLength(0);
    expect(standaloneSrs.filter((record) => record.nodeId === OBSOLETE_NODE_ID)).toHaveLength(0);
    expect(queue.filter((record) => record.nodeId === OBSOLETE_NODE_ID)).toHaveLength(0);

    for (const artifact of [
      rootNodes,
      draftNodes,
      blueprints,
      practiceMap.activities!,
      practiceMap.srsInputs!,
      standaloneSrs,
      queue,
    ]) {
      expect(JSON.stringify(artifact)).not.toContain(OBSOLETE_NODE_ID);
    }
    expect(JSON.stringify(practiceMap)).not.toContain(OBSOLETE_NODE_ID);

    expect(blueprints.filter(topic14)).toHaveLength(4);
    expect(practiceMap.activities!.filter(topic14)).toHaveLength(12);
    expect(practiceMap.srsInputs!.filter(topic14)).toHaveLength(4);
    expect(standaloneSrs.filter(topic14)).toHaveLength(4);
    expect(queue.filter(topic14)).toHaveLength(0);
  });
});
