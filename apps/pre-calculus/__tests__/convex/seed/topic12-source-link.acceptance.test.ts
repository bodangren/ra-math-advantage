import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import type { KnowledgeBlueprint } from "@math-platform/knowledge-space-practice";
import {
  knowledgeBlueprintSchema,
  projectActivityMap,
  projectSrsInputs,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from "@math-platform/knowledge-space-practice";
import { getPropsSchema } from "@math-platform/activity-components/schemas";
import {
  generateTopic12GraphAverageRateChoice,
  generateTopic12GraphAverageRateChoiceOutput,
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
  generateTopic12PointwiseLeastRateChoice,
  generateTopic12PointwiseLeastRateChoiceOutput,
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID,
  generateTopic12TableAverageRateChoice,
  generateTopic12TableAverageRateChoiceOutput,
  getGenerator,
} from "@math-platform/math-content/knowledge-space";

const SOURCE_REF = "apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf";
const TOPIC12_POINTWISE_LEAST_RATE_BLUEPRINT_NODE_ID =
  "math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs";
const TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID =
  "math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs";
const EXAMPLE_IDS = [
  "math.precalc.example.1.2.001",
  "math.precalc.example.1.2.002",
  "math.precalc.example.1.2.003",
  "math.precalc.example.1.2.004",
  "math.precalc.example.1.2.005",
  "math.precalc.example.1.2.006",
] as const;

type Node = {
  id: string;
  kind: string;
  title: string;
  sourceRefs: string[];
  reviewStatus: string;
  metadata: Record<string, unknown>;
};

type Edge = {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
};

type Catalog = { nodes: Node[]; edges?: Edge[] };

function readCatalog(fileName: string): Catalog {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "curriculum/skill-graph", fileName), "utf8"),
  ) as Catalog;
}

function readDocument(fileName: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "curriculum/skill-graph", fileName), "utf8"),
  ) as unknown;
}

describe("Passwater Topic 1.2 authored examples", () => {
  it("keeps six source nodes and their Lesson 1.2 membership edges synchronized", () => {
    const catalogs = ["nodes.json", "draft-nodes.json", "edges.json", "standard-edges.json"].map(
      readCatalog,
    );
    const rootEdges = catalogs[2]!.edges!;
    const sourceNodes = catalogs.map((catalog) =>
      EXAMPLE_IDS.map((id) => {
        const matches = catalog.nodes.filter((node) => node.id === id);
        expect(matches).toHaveLength(1);
        return matches[0]!;
      }),
    );

    for (const [index, nodes] of sourceNodes.entries()) {
      expect(nodes.map((node) => node.id)).toEqual([...EXAMPLE_IDS]);
      expect(nodes.every((node) => node.kind === "worked_example")).toBe(true);
      expect(nodes.every((node) => node.reviewStatus === "draft")).toBe(true);
      expect(nodes.every((node) => node.sourceRefs[0]?.startsWith(`${SOURCE_REF}#page=`))).toBe(
        true,
      );
      expect(nodes.every((node) => !/\btangent\b/i.test(String(node.metadata.rawText)))).toBe(true);
      if (index > 0) expect(nodes).toEqual(sourceNodes[0]);
    }

    const expected = [
      {
        page: 14,
        title: "Example 1: Order rates of change at labeled points",
        result: "B < C < A",
        content: ["Order the rates of change", "three labeled points", "B < C < A"],
      },
      {
        page: 14,
        title: "Example 2: Find the least rate of change",
        result: "D",
        content: ["four labeled points", "least", "option D"],
      },
      {
        page: 15,
        title: "Example 3: Find the greatest average rate of change",
        result: "[5,7]",
        content: ["2 <= x <= 3", "3 <= x <= 5", "5 <= x <= 7", "7 <= x <= 8", "[5,7]", "option C"],
      },
      {
        page: 16,
        title: "Example 4: Model a function with negative rate of change",
        result: "option B",
        content: ["negative rate of change", "time remaining", "option B"],
      },
      {
        page: 16,
        title: "Example 5: Identify a negative rate interval",
        result: "[2.470,10]",
        content: ["3.16 + 4.2x - 0.85x^2", "-10 <= x <= 10", "[2.470,10]", "option D"],
      },
      {
        page: 16,
        title: "Example 6: Find the greatest average rate interval",
        result: "1900-1950",
        content: [
          "1800/41.24",
          "1850/46.10",
          "1900/53.63",
          "1950/70.65",
          "2000/81.83",
          "1900-1950",
          "option C",
        ],
      },
    ];

    for (const [index, item] of expected.entries()) {
      const node = sourceNodes[0]![index]!;
      expect(node.title).toBe(item.title);
      expect(node.sourceRefs).toEqual([`${SOURCE_REF}#page=${item.page}`]);
      expect(node.metadata.rawText).toContain(item.result);
      for (const text of item.content) expect(node.metadata.rawText).toContain(text);
    }

    for (const id of EXAMPLE_IDS) {
      expect(
        rootEdges.filter(
          (edge) =>
            edge.type === "appears_in_context" &&
            edge.sourceId === id &&
            edge.targetId === "math.precalc.lesson.1.2",
        ),
      ).toHaveLength(1);
      expect(
        rootEdges.filter(
          (edge) =>
            edge.type === "contains" &&
            edge.sourceId === "math.precalc.lesson.1.2" &&
            edge.targetId === id,
        ),
      ).toHaveLength(1);
    }
    const staleExamples = /f\(x\) = x\^2|town population|500\(1\.08\)\^t/i;
    expect(JSON.stringify(rootEdges)).not.toMatch(staleExamples);
    expect(JSON.stringify(sourceNodes[0])).not.toMatch(staleExamples);
  });

  it("keeps the six Topic 1.2 skills and their example mappings exact", () => {
    const catalogs = ["nodes.json", "draft-nodes.json", "edges.json", "standard-edges.json"].map(
      readCatalog,
    );
    const skillIds = [
      "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
      "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
      "math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs",
      "math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs",
      "math.precalc.skill.1.2.model-negative-rate-contexts",
      "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics",
    ] as const;
    const expected = [
      {
        id: skillIds[0],
        title: "Compute and interpret the average rate of change",
        description:
          "Compute average rate of change as (change in output)/(change in input) using endpoint values, and interpret the result in context.",
        pages: [15],
      },
      {
        id: skillIds[1],
        title: "Compare average rates of change across intervals",
        description:
          "Compare average rates of change across intervals by comparing (change in output)/(change in input).",
        pages: [15, 16],
      },
      {
        id: skillIds[2],
        title: "Compare pointwise rates of change from graphs",
        description:
          "Compare pointwise rates of change from graphs by using local direction and steepness at labeled points.",
        pages: [13, 14],
      },
      {
        id: skillIds[3],
        title: "Identify the least pointwise rate of change from a graph",
        description:
          "Identify the labeled point with the least local rate from a graph by comparing local direction and steepness.",
        pages: [14],
      },
      {
        id: skillIds[4],
        title: "Model negative-rate contexts",
        description:
          "Model a negative rate of change by matching increasing input and decreasing output variables in context.",
        pages: [16],
      },
      {
        id: skillIds[5],
        title: "Determine negative-rate intervals for quadratics",
        description:
          "Determine intervals where a quadratic has a negative rate of change by using its vertex and graph behavior.",
        pages: [16],
      },
    ];
    const sourceNodes = catalogs.slice(0, 2).map((catalog) =>
      skillIds.map((id) => {
        const matches = catalog.nodes.filter((node) => node.id === id);
        expect(matches).toHaveLength(1);
        return matches[0]!;
      }),
    );

    for (const [catalogIndex, nodes] of sourceNodes.entries()) {
      expect(nodes.map((node) => node.id)).toEqual([...skillIds]);
      expect(nodes).toEqual(
        expected.map((item) =>
          expect.objectContaining({
            id: item.id,
            title: item.title,
            description: item.description,
            sourceRefs: item.pages.map((page) => `${SOURCE_REF}#page=${page}`),
            reviewStatus: "draft",
          }),
        ),
      );
      const sourceBackedSkillIds = new Set<string>([
        skillIds[0],
        skillIds[1],
        skillIds[2],
        skillIds[3],
        skillIds[4],
        skillIds[5],
      ]);
      expect(
        nodes
          .filter((node) => !sourceBackedSkillIds.has(node.id))
          .every((node) => !Object.hasOwn(node, "independentPracticeReady")),
      ).toBe(true);
      expect(
        nodes
          .filter((node) => !sourceBackedSkillIds.has(node.id))
          .every((node) => !Object.hasOwn(node, "rendererKey")),
      ).toBe(true);
      expect(nodes.find((node) => node.id === skillIds[1])).toMatchObject({
        rendererKey: "table-average-rate-choice",
        generatorKey: "topic12-table-average-rate-choice",
        independentPracticeReady: true,
      });
      if (catalogIndex > 0) expect(nodes).toEqual(sourceNodes[0]);
    }
    for (const catalog of catalogs.slice(0, 2)) {
      expect(new Set(catalog.nodes.map((node) => node.id)).size).toBe(catalog.nodes.length);
    }

    const rootEdges = catalogs[2]!.edges!;
    const supportTargets = new Map([
      [EXAMPLE_IDS[0], skillIds[2]],
      [EXAMPLE_IDS[1], skillIds[3]],
      [EXAMPLE_IDS[2], skillIds[1]],
      [EXAMPLE_IDS[3], skillIds[4]],
      [EXAMPLE_IDS[4], skillIds[5]],
      [EXAMPLE_IDS[5], skillIds[1]],
    ]);
    for (const [exampleId, targetId] of supportTargets) {
      const matches = rootEdges.filter(
        (edge) =>
          edge.type === "supports" && edge.sourceId === exampleId && edge.targetId === targetId,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({ confidence: "high", reviewStatus: "draft" });
    }
    const exampleThreeComputeMatches = rootEdges.filter(
      (edge) =>
        edge.type === "supports" &&
        edge.sourceId === EXAMPLE_IDS[2] &&
        edge.targetId === skillIds[0],
    );
    expect(exampleThreeComputeMatches).toHaveLength(1);
    expect(exampleThreeComputeMatches[0]).toMatchObject({
      confidence: "high",
      reviewStatus: "draft",
    });
    expect(
      rootEdges.filter(
        (edge) =>
          edge.type === "supports" &&
          edge.sourceId === EXAMPLE_IDS[2] &&
          edge.targetId === skillIds[1],
      ),
    ).toHaveLength(1);
    expect(
      rootEdges.filter(
        (edge) =>
          edge.type === "supports" &&
          EXAMPLE_IDS.includes(edge.sourceId as (typeof EXAMPLE_IDS)[number]),
      ),
    ).toHaveLength(7);
    expect(
      rootEdges.filter(
        (edge) =>
          edge.type === "supports" &&
          EXAMPLE_IDS.includes(edge.sourceId as (typeof EXAMPLE_IDS)[number]) &&
          edge.targetId === skillIds[0],
      ),
    ).toHaveLength(1);

    const prerequisites = rootEdges.filter(
      (edge) =>
        edge.type === "prerequisite_for" &&
        edge.sourceId === skillIds[0] &&
        edge.targetId === skillIds[1],
    );
    expect(prerequisites).toHaveLength(1);
    expect(prerequisites[0]).toMatchObject({ confidence: "high", reviewStatus: "reviewed" });
    const leastPrerequisites = rootEdges.filter(
      (edge) =>
        edge.type === "prerequisite_for" &&
        edge.sourceId === skillIds[2] &&
        edge.targetId === skillIds[3],
    );
    expect(leastPrerequisites).toHaveLength(1);
    expect(leastPrerequisites[0]).toMatchObject({ confidence: "high", reviewStatus: "reviewed" });
    expect(new Set(rootEdges.map((edge) => edge.id)).size).toBe(rootEdges.length);
  });

  it("quarantines Topic 1.2 skills without exact source-backed activities", () => {
    const skillIds = [
      "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
      "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
      "math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs",
      "math.precalc.skill.1.2.model-negative-rate-contexts",
      "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics",
    ];
    const blueprints = (
      readDocument("blueprints.json") as { blueprints: Array<{ nodeId: string }> }
    ).blueprints;
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<{ nodeId: string }>;
      srsInputs: Array<{ nodeId: string }>;
    };
    const standaloneSrs = readDocument("projection/srs-input.json") as {
      inputs: Array<{ nodeId: string }>;
    };

    const sourceBackedBlueprintIds = new Set([
      "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
      "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
      TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
      "math.precalc.skill.1.2.model-negative-rate-contexts",
      "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics",
    ]);
    for (const sourceBackedBlueprintId of sourceBackedBlueprintIds) {
      expect(
        blueprints.filter((blueprint) => blueprint.nodeId === sourceBackedBlueprintId),
      ).toHaveLength(1);
    }

    for (const skillId of skillIds) {
      if (!sourceBackedBlueprintIds.has(skillId)) {
        expect(blueprints.filter((blueprint) => blueprint.nodeId === skillId)).toHaveLength(0);
        expect(
          activityProjection.activities.filter((activity) => activity.nodeId === skillId),
        ).toHaveLength(0);
        expect(
          activityProjection.srsInputs.filter((input) => input.nodeId === skillId),
        ).toHaveLength(0);
        expect(standaloneSrs.inputs.filter((input) => input.nodeId === skillId)).toHaveLength(0);
      }
    }
  });

  it("defines the source-backed Example 6 table blueprint for all three modes", () => {
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprint = document.blueprints.find(
      (candidate) =>
        candidate.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
    );
    expect(blueprint).toBeDefined();
    expect(blueprint).toMatchObject({
      nodeId: "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
      sourceNodeIds: ["math.precalc.example.1.2.006"],
      alignmentNodeIds: [],
      rendererKey: "table-average-rate-choice",
      rendererModeMap: {
        worked: "table-average-rate-choice",
        guidedPractice: "table-average-rate-choice",
        independentPractice: "table-average-rate-choice",
      },
      generatorKey: "topic12-table-average-rate-choice",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "2" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");

    const seedZero = generateTopic12TableAverageRateChoice(0);
    const seedOne = generateTopic12TableAverageRateChoice(1);
    const seedTwoOutput = generateTopic12TableAverageRateChoiceOutput(2);
    const workedProps = blueprint!.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint!.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint!.independentPracticeSpec!.rendererProps!;
    expect(workedProps).toEqual({
      prompt: seedZero.prompt,
      inputLabel: seedZero.inputLabel,
      outputLabel: seedZero.outputLabel,
      rows: seedZero.rows,
      options: seedZero.options,
      presentationMode: "worked_example",
      correctOptionId: seedZero.correctOptionId,
      steps: seedZero.solutionSteps,
      finalAnswer: "The average rate of change is greatest over 1900-1950 (option C).",
    });
    expect(guidedProps).toMatchObject({
      prompt: seedOne.prompt,
      inputLabel: seedOne.inputLabel,
      outputLabel: seedOne.outputLabel,
      rows: seedOne.rows,
      options: seedOne.options,
      presentationMode: "guided_practice",
      guidedSteps: [
        "For each interval, calculate change in output divided by change in input.",
        "Select the interval with the greatest average rate of change.",
      ],
      fieldHelp: "Calculate change in output divided by change in input for each option.",
    });
    expect(independentProps).toEqual(
      (seedTwoOutput.data as { rendererProps: Record<string, unknown> }).rendererProps,
    );
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(getPropsSchema("table-average-rate-choice")?.safeParse(props).success).toBe(true);
    }
    expect(blueprint!.workedExampleSpec!.target).toEqual({ selectedOptionId: "C" });
    expect(blueprint!.workedExampleSpec!.steps.map((step) => step.description)).toEqual(
      seedZero.solutionSteps,
    );
    expect(blueprint!.workedExampleSpec!.steps).toHaveLength(4);
    expect(
      blueprint!.workedExampleSpec!.steps.every(
        (step) =>
          step.description.includes("change in output") &&
          step.description.includes("change in input"),
      ),
    ).toBe(true);
    expect(blueprint!.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: "integer", min: 0 } },
      answerSchema: { selectedOptionId: "string" },
      gradingRules: [{ partId: "selectedOptionId", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "any_seed",
    });
    expect(blueprint!.gradingSpec).toEqual({
      partIds: ["selectedOptionId"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria: "Select the interval with the greatest average rate of change",
          points: 1,
          partId: "selectedOptionId",
        },
      ],
    });
    for (const props of [guidedProps, independentProps]) {
      expect(JSON.stringify(props)).not.toMatch(/answer|solution|correct|grading|expected/i);
    }
    expect(validateBlueprintGeneratorReadiness(blueprint!)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint!)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint!)).toMatchObject({ valid: true });

    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const projectedRows = projectActivityMap(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === blueprint!.nodeId,
    );
    expect(projectedRows.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(projectedRows).toHaveLength(3);
    expect(projectedRows.every((row) => row.rendererKey === "table-average-rate-choice")).toBe(
      true,
    );
    expect(projectedRows[2]!.srsEligible).toBe(true);
    expect(getGenerator("topic12-table-average-rate-choice").key).toBe(
      "topic12-table-average-rate-choice",
    );
  });

  it("synchronizes the stored Example 6 activity and ready SRS projections", () => {
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const expectedActivities = projectActivityMap(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
    );
    const expectedSrs = projectSrsInputs(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
    );
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneSrs = readDocument("projection/srs-input.json") as {
      inputs: Array<Record<string, unknown>>;
    };
    const actualActivities = activityProjection.activities.filter(
      (row) => row.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
    );
    const actualCombinedSrs = activityProjection.srsInputs.filter(
      (row) => row.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
    );
    const actualStandaloneSrs = standaloneSrs.inputs.filter(
      (row) => row.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
    );

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(actualActivities))).toEqual(
      JSON.parse(JSON.stringify(expectedActivities)),
    );
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    for (const row of actualActivities) {
      expect(row.rendererKey).toBe("table-average-rate-choice");
      expect(getPropsSchema(String(row.rendererKey))?.safeParse(row.props).success).toBe(true);
      expect(row.srsEligible).toBe(
        row.mode === "guided_practice" || row.mode === "independent_practice",
      );
    }

    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualCombinedSrs[0]).toMatchObject({
      generatorKey: "topic12-table-average-rate-choice",
      generatorReady: true,
      blueprintId: "math.precalc.skill.1.2.compare-rates-of-change-across-intervals.blueprint",
      prerequisites: ["math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change"],
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(JSON.stringify(actualActivities)).not.toMatch(/placeholder|stub|STUB/i);
    expect(actualActivities.filter((row) => row.srsEligible === true)).toHaveLength(2);
    expect(actualActivities.find((row) => row.mode === "independent_practice")?.srsEligible).toBe(
      true,
    );
    expect(actualCombinedSrs[0]).toMatchObject({ generatorReady: true });
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });

    const queue = readDocument("generator-gap-queue.json") as {
      items: Array<{ nodeId: string }>;
    };
    expect(
      queue.items.filter(
        (item) => item.nodeId === "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
      ),
    ).toHaveLength(0);
  });

  it("defines the source-backed Example 3 graph blueprint and ready projections", () => {
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprint = document.blueprints.find(
      (candidate) =>
        candidate.nodeId === "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
    );
    expect(blueprint).toBeDefined();
    expect(blueprint).toMatchObject({
      nodeId: "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
      sourceNodeIds: ["math.precalc.example.1.2.003"],
      alignmentNodeIds: [],
      rendererKey: "graph-average-rate-choice",
      rendererModeMap: {
        worked: "graph-average-rate-choice",
        guidedPractice: "graph-average-rate-choice",
        independentPractice: "graph-average-rate-choice",
      },
      generatorKey: "topic12-graph-average-rate-choice",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "2" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");

    const seedZero = generateTopic12GraphAverageRateChoice(0);
    const seedOne = generateTopic12GraphAverageRateChoice(1);
    const seedTwo = generateTopic12GraphAverageRateChoice(2);
    const seedTwoOutput = generateTopic12GraphAverageRateChoiceOutput(2);
    const publicProps = (
      variant: typeof seedZero,
      presentationMode: "worked_example" | "guided_practice" | "independent_practice",
    ) => ({
      prompt: variant.prompt,
      domain: variant.domain,
      range: variant.range,
      xLabel: variant.xLabel,
      yLabel: variant.yLabel,
      graphPoints: variant.graphPoints,
      options: variant.options,
      presentationMode,
    });
    const workedProps = blueprint!.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint!.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint!.independentPracticeSpec!.rendererProps!;

    expect(workedProps).toEqual({
      ...publicProps(seedZero, "worked_example"),
      correctOptionId: seedZero.correctOptionId,
      steps: seedZero.solutionSteps,
      finalAnswer: "The greatest average rate is on 5 to 7 (option C).",
    });
    expect(seedZero.correctOptionId).toBe("C");
    expect(workedProps.prompt).toBe(seedZero.prompt);
    expect(workedProps.graphPoints).toEqual(seedZero.graphPoints);
    expect(workedProps.options).toEqual(seedZero.options);
    expect(workedProps.finalAnswer).toMatch(/5 to 7.*option C/i);
    expect(guidedProps).toEqual({
      ...publicProps(seedOne, "guided_practice"),
      guidedSteps: [
        "Calculate (change in output)/(change in input) for each interval.",
        "Compare the four average rates and select the greatest.",
      ],
      fieldHelp: "Use the endpoint values for each interval.",
    });
    expect(independentProps).toEqual({
      ...publicProps(seedTwo, "independent_practice"),
    });
    const { seed: outputSeed, ...publicData } = seedTwoOutput.data as Record<string, unknown>;
    expect(outputSeed).toBe(2);
    expect(independentProps).toEqual({
      ...publicData,
      presentationMode: "independent_practice",
    });
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(getPropsSchema("graph-average-rate-choice")?.safeParse(props).success).toBe(true);
    }
    for (const props of [guidedProps, independentProps]) {
      expect(JSON.stringify(props)).not.toMatch(/answer|solution|correct|grading|expected/i);
    }
    expect(blueprint!.workedExampleSpec!.target).toEqual({ selectedOptionId: "C" });
    expect(blueprint!.workedExampleSpec!.steps.map((step) => step.description)).toEqual(
      seedZero.solutionSteps,
    );
    expect(blueprint!.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: "integer", min: 0 } },
      answerSchema: { selectedOptionId: "string" },
      gradingRules: [{ partId: "selectedOptionId", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "any_seed",
    });
    expect(blueprint!.gradingSpec).toEqual({
      partIds: ["selectedOptionId"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria: "Select the interval with the greatest average rate of change",
          points: 1,
          partId: "selectedOptionId",
        },
      ],
    });
    expect(validateBlueprintGeneratorReadiness(blueprint!)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint!)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint!)).toMatchObject({ valid: true });

    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const graphNode = nodes.find((node) => node.id === blueprint!.nodeId) as
      | Record<string, unknown>
      | undefined;
    expect(graphNode).toMatchObject({
      id: blueprint!.nodeId,
      rendererKey: "graph-average-rate-choice",
      generatorKey: "topic12-graph-average-rate-choice",
      independentPracticeReady: true,
    });
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const expectedActivities = projectActivityMap(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === blueprint!.nodeId,
    );
    const expectedSrs = projectSrsInputs(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === blueprint!.nodeId,
    );
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneSrs = readDocument("projection/srs-input.json") as {
      inputs: Array<Record<string, unknown>>;
    };
    const actualActivities = activityProjection.activities.filter(
      (row) => row.nodeId === blueprint!.nodeId,
    );
    const actualCombinedSrs = activityProjection.srsInputs.filter(
      (row) => row.nodeId === blueprint!.nodeId,
    );
    const actualStandaloneSrs = standaloneSrs.inputs.filter(
      (row) => row.nodeId === blueprint!.nodeId,
    );
    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(actualActivities.every((row) => row.rendererKey === "graph-average-rate-choice")).toBe(
      true,
    );
    expect(
      actualActivities
        .filter((row) => row.mode === "worked_example")
        .every((row) => row.srsEligible === false),
    ).toBe(true);
    expect(
      actualActivities.filter(
        (row) => row.mode === "independent_practice" && row.srsEligible === true,
      ),
    ).toHaveLength(1);
    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualCombinedSrs[0]).toMatchObject({
      blueprintId: "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change.blueprint",
      generatorKey: "topic12-graph-average-rate-choice",
      generatorReady: true,
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });
    const queue = readDocument("generator-gap-queue.json") as { items: Array<{ nodeId: string }> };
    expect(queue.items.filter((item) => item.nodeId === blueprint!.nodeId)).toHaveLength(0);
    expect(getGenerator("topic12-graph-average-rate-choice").key).toBe(
      "topic12-graph-average-rate-choice",
    );
  });

  it("defines the source-backed Example 1 pointwise rate-ordering blueprint for all three modes", () => {
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprints = document.blueprints.filter(
      (candidate) => candidate.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    expect(blueprints).toHaveLength(1);
    const blueprint = blueprints[0]!;
    const seedZero = generateTopic12PointwiseRateOrdering(0);
    const seedOne = generateTopic12PointwiseRateOrdering(1);
    const seedTwoOutput = generateTopic12PointwiseRateOrderingOutput(2);
    const publicProps = (
      variant: typeof seedZero,
      presentationMode: "worked_example" | "guided_practice" | "independent_practice",
    ) => ({
      prompt: variant.prompt,
      domain: variant.domain,
      range: variant.range,
      xLabel: variant.xLabel,
      yLabel: variant.yLabel,
      graphPoints: variant.graphPoints,
      labeledPoints: variant.labeledPoints,
      presentationMode,
    });
    const seedZeroOrder = (
      seedZeroOutput: ReturnType<typeof generateTopic12PointwiseRateOrderingOutput>,
    ) => (seedZeroOutput.expectedAnswer as { orderedPointIds: string[] }).orderedPointIds;
    const seedZeroOutput = generateTopic12PointwiseRateOrderingOutput(0);

    expect(blueprint).toMatchObject({
      nodeId: TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
      sourceNodeIds: ["math.precalc.example.1.2.001"],
      alignmentNodeIds: [],
      rendererKey: "pointwise-rate-ordering",
      rendererModeMap: {
        worked: "pointwise-rate-ordering",
        guidedPractice: "pointwise-rate-ordering",
        independentPractice: "pointwise-rate-ordering",
      },
      generatorKey: "topic12-pointwise-rate-ordering",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "2" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");

    const workedProps = blueprint.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint.independentPracticeSpec!.rendererProps!;
    expect(workedProps).toEqual({
      ...publicProps(seedZero, "worked_example"),
      orderedPointIds: seedZeroOrder(seedZeroOutput),
      steps: seedZero.solutionSteps,
      finalAnswer: "The least-to-greatest order is B < C < A.",
    });
    expect(seedZeroOrder(seedZeroOutput)).toEqual(["B", "C", "A"]);
    expect(workedProps.prompt).toBe(seedZero.prompt);
    expect(workedProps.graphPoints).toEqual(seedZero.graphPoints);
    expect(workedProps.labeledPoints).toEqual(seedZero.labeledPoints);
    expect(blueprint.workedExampleSpec!.steps.map((step) => step.description)).toEqual(
      seedZero.solutionSteps,
    );
    expect(blueprint.workedExampleSpec!.target).toEqual({ orderedPointIds: ["B", "C", "A"] });
    expect(blueprint.workedExampleSpec!.givens).toEqual([
      "The graph is shown on the domain -5 <= x <= 5.",
      "Compare local direction and steepness at A, B, and C.",
    ]);
    expect(blueprint.workedExampleSpec!.explanation).toContain("B < C < A");
    expect(guidedProps).toEqual({
      ...publicProps(seedOne, "guided_practice"),
      guidedSteps: [
        "Compare local direction and steepness at each labeled point.",
        "Order the rates from least to greatest.",
      ],
      fieldHelp: "A steeper downward graph has a smaller rate of change.",
    });
    const { seed: outputSeed, ...publicData } = seedTwoOutput.data as Record<string, unknown>;
    expect(outputSeed).toBe(2);
    expect(independentProps).toEqual({ ...publicData, presentationMode: "independent_practice" });
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(getPropsSchema("pointwise-rate-ordering")?.safeParse(props).success).toBe(true);
    }
    for (const props of [guidedProps, independentProps]) {
      for (const key of [
        "orderedPointIds",
        "correctOptionId",
        "expectedAnswer",
        "gradingMetadata",
        "solutionSteps",
        "finalAnswer",
        "options",
      ]) {
        expect(props).not.toHaveProperty(key);
      }
      expect(JSON.stringify(props)).not.toMatch(
        /answer|correct|expected|grading|solution|finalAnswer/i,
      );
    }
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: "integer", min: 0 } },
      answerSchema: { orderedPointIds: "string[]" },
      gradingRules: [{ partId: "orderedPointIds", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "any_seed",
    });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["orderedPointIds"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria: "Order the rates from least to greatest",
          points: 1,
          partId: "orderedPointIds",
        },
      ],
    });
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });
    expect(getGenerator("topic12-pointwise-rate-ordering")).toMatchObject({
      key: "topic12-pointwise-rate-ordering",
      nodeIds: [TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID],
    });

    const nodes = readDocument("nodes.json") as { nodes: Array<Record<string, unknown>> };
    const broadNode = nodes.nodes.find(
      (node) => node.id === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    expect(broadNode).toBeDefined();
    expect(broadNode).toMatchObject({
      rendererKey: "pointwise-rate-ordering",
      generatorKey: "topic12-pointwise-rate-ordering",
      independentPracticeReady: true,
    });
    const edges = (readDocument("edges.json") as { edges: Array<Record<string, unknown>> }).edges;
    expect(
      edges.filter(
        (edge) =>
          edge.type === "supports" &&
          edge.sourceId === "math.precalc.example.1.2.001" &&
          edge.targetId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
      ),
    ).toHaveLength(1);
  });

  it("projects the ready Example 1 pointwise rate-ordering blueprint", () => {
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprint = document.blueprints.find(
      (candidate) => candidate.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    expect(blueprint).toBeDefined();
    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const expectedActivities = projectActivityMap(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    const expectedSrs = projectSrsInputs(nodes, edges, document.blueprints).filter(
      (row) => row.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneSrs = readDocument("projection/srs-input.json") as {
      inputs: Array<Record<string, unknown>>;
    };
    const actualActivities = activityProjection.activities.filter(
      (row) => row.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    const actualCombinedSrs = activityProjection.srsInputs.filter(
      (row) => row.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    const actualStandaloneSrs = standaloneSrs.inputs.filter(
      (row) => row.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    const nodeCatalog = readDocument("nodes.json") as { nodes: Array<Record<string, unknown>> };
    const draftNodeCatalog = readDocument("draft-nodes.json") as {
      nodes: Array<Record<string, unknown>>;
    };
    const sourceNode = nodeCatalog.nodes.find(
      (node) => node.id === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );
    const draftNode = draftNodeCatalog.nodes.find(
      (node) => node.id === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
    );

    expect(sourceNode).toBeDefined();
    expect(draftNode).toEqual(sourceNode);
    expect(sourceNode).toMatchObject({
      rendererKey: "pointwise-rate-ordering",
      generatorKey: "topic12-pointwise-rate-ordering",
      independentPracticeReady: true,
    });
    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.stableActivityId)).toEqual([
      `${TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID}.worked_example`,
      `${TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID}.guided_practice`,
      `${TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID}.independent_practice`,
    ]);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(actualActivities.every((row) => row.rendererKey === "pointwise-rate-ordering")).toBe(
      true,
    );
    expect(
      actualActivities.every((row) => {
        const sourceNodeIds = row.sourceNodeIds;
        return (
          Array.isArray(sourceNodeIds) &&
          sourceNodeIds.length === 1 &&
          sourceNodeIds[0] === "math.precalc.example.1.2.001"
        );
      }),
    ).toBe(true);
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(
      actualActivities.every(
        (row) => getPropsSchema("pointwise-rate-ordering")?.safeParse(row.props).success,
      ),
    ).toBe(true);
    const stableActivityIds = activityProjection.activities.map((row) => row.stableActivityId);
    expect(new Set(stableActivityIds).size).toBe(stableActivityIds.length);

    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualCombinedSrs[0]).toEqual({
      nodeId: TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
      blueprintId: `${TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID}.blueprint`,
      standards: [],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: "topic12-pointwise-rate-ordering",
      generatorReady: true,
      equivalentNodeIds: [],
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });

    const generatorQueue = readDocument("generator-gap-queue.json") as {
      items: Array<{ nodeId: string }>;
    };
    expect(
      generatorQueue.items.filter(
        (item) => item.nodeId === TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID,
      ),
    ).toHaveLength(0);
    const componentQueue = readDocument("component-gap-queue.json") as {
      items: Array<{ affectedNodeIds?: string[] }>;
    };
    expect(
      componentQueue.items.some((item) =>
        item.affectedNodeIds?.includes(TOPIC12_POINTWISE_RATE_ORDERING_NODE_ID),
      ),
    ).toBe(false);
  });

  it("defines the source-backed Example 2 least-rate blueprint with mirrored readiness", () => {
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprints = document.blueprints.filter(
      (candidate) => candidate.nodeId === TOPIC12_POINTWISE_LEAST_RATE_BLUEPRINT_NODE_ID,
    );
    expect(blueprints).toHaveLength(1);
    const blueprint = blueprints[0]!;
    const seedZero = generateTopic12PointwiseLeastRateChoice(0);
    const seedOne = generateTopic12PointwiseLeastRateChoice(1);
    const seedTwo = generateTopic12PointwiseLeastRateChoice(2);
    const seedTwoOutput = generateTopic12PointwiseLeastRateChoiceOutput(2);
    const publicProps = (
      variant: typeof seedZero,
      presentationMode: "worked_example" | "guided_practice" | "independent_practice",
    ) => ({
      prompt: variant.prompt,
      domain: variant.domain,
      range: variant.range,
      xLabel: variant.xLabel,
      yLabel: variant.yLabel,
      graphPoints: variant.graphPoints,
      labeledPoints: variant.labeledPoints,
      options: variant.options,
      presentationMode,
    });

    expect(blueprint).toMatchObject({
      nodeId: TOPIC12_POINTWISE_LEAST_RATE_BLUEPRINT_NODE_ID,
      sourceNodeIds: ["math.precalc.example.1.2.002"],
      alignmentNodeIds: [],
      rendererKey: "pointwise-least-rate-choice",
      rendererModeMap: {
        worked: "pointwise-least-rate-choice",
        guidedPractice: "pointwise-least-rate-choice",
        independentPractice: "pointwise-least-rate-choice",
      },
      generatorKey: "topic12-pointwise-least-rate-choice",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "2" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");

    const workedProps = blueprint.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint.independentPracticeSpec!.rendererProps!;
    expect(workedProps).toEqual({
      ...publicProps(seedZero, "worked_example"),
      correctOptionId: seedZero.correctOptionId,
      steps: seedZero.solutionSteps,
      finalAnswer: "Point D has the least rate of change (option D).",
    });
    expect(seedZero.correctOptionId).toBe("D");
    expect(blueprint.workedExampleSpec).toMatchObject({
      prompt: seedZero.prompt,
      givens: [
        "The graph is shown on the domain -5 <= x <= 5.",
        "Compare local direction and steepness at each labeled point.",
      ],
      target: { selectedOptionId: "D" },
      explanation:
        "Point D has the least local rate because its graph behavior is steepest downward.",
    });
    expect(blueprint.workedExampleSpec!.steps.map((step) => step.description)).toEqual(
      seedZero.solutionSteps,
    );
    expect(guidedProps).toEqual({
      ...publicProps(seedOne, "guided_practice"),
      guidedSteps: [
        "Compare whether the graph is rising or falling at each labeled point.",
        "Among the falling points, compare steepness and select the most negative rate.",
      ],
      fieldHelp: "A steeper downward graph has a smaller rate of change.",
    });
    expect(independentProps).toEqual({
      ...publicProps(seedTwo, "independent_practice"),
    });
    const { seed: outputSeed, ...publicData } = seedTwoOutput.data as Record<string, unknown>;
    expect(outputSeed).toBe(2);
    expect(independentProps).toEqual({ ...publicData, presentationMode: "independent_practice" });
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(getPropsSchema("pointwise-least-rate-choice")?.safeParse(props).success).toBe(true);
    }
    for (const props of [guidedProps, independentProps]) {
      const serialized = JSON.stringify(props);
      expect(serialized).not.toMatch(/answer|correct|expected|grading|solution|finalAnswer|slope/i);
      for (const key of [
        "correctOptionId",
        "finalAnswer",
        "steps",
        "expectedAnswer",
        "gradingMetadata",
        "correctAnswer",
        "answerKey",
        "score",
        "isCorrect",
      ]) {
        expect(props).not.toHaveProperty(key);
      }
    }
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: "integer", min: 0 } },
      answerSchema: { selectedOptionId: "string" },
      gradingRules: [{ partId: "selectedOptionId", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "any_seed",
    });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["selectedOptionId"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria: "Select the labeled point with the least rate of change",
          points: 1,
          partId: "selectedOptionId",
        },
      ],
    });
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });
    expect(getGenerator("topic12-pointwise-least-rate-choice")).toMatchObject({
      key: "topic12-pointwise-least-rate-choice",
      nodeIds: [TOPIC12_POINTWISE_LEAST_RATE_CHOICE_NODE_ID],
    });

    const nodes = readDocument("nodes.json") as { nodes: Array<Record<string, unknown>> };
    const draftNodes = readDocument("draft-nodes.json") as {
      nodes: Array<Record<string, unknown>>;
    };
    const graphNode = nodes.nodes.find(
      (node) => node.id === TOPIC12_POINTWISE_LEAST_RATE_BLUEPRINT_NODE_ID,
    );
    const draftGraphNode = draftNodes.nodes.find(
      (node) => node.id === TOPIC12_POINTWISE_LEAST_RATE_BLUEPRINT_NODE_ID,
    );
    expect(graphNode).toBeDefined();
    expect(draftGraphNode).toEqual(graphNode);
    expect(graphNode).toMatchObject({
      rendererKey: "pointwise-least-rate-choice",
      generatorKey: "topic12-pointwise-least-rate-choice",
      independentPracticeReady: true,
    });
  });

  it("defines the source-backed Example 4 negative-rate context blueprint for all three modes", () => {
    const nodeId = "math.precalc.skill.1.2.model-negative-rate-contexts";
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprints = document.blueprints.filter((candidate) => candidate.nodeId === nodeId);
    expect(blueprints).toHaveLength(1);
    const blueprint = blueprints[0]!;
    const seedZero = generateTopic12NegativeRateContextChoice(0);
    const seedZeroOutput = generateTopic12NegativeRateContextChoiceOutput(0);
    const seedOne = generateTopic12NegativeRateContextChoice(1);
    const seedTwoOutput = generateTopic12NegativeRateContextChoiceOutput(2);
    const expectedAnswer = (seedZeroOutput.expectedAnswer as { selectedOptionId: string })
      .selectedOptionId;
    const independentData = seedTwoOutput.data as {
      seed: number;
      rendererProps: Record<string, unknown>;
    };

    expect(blueprint).toMatchObject({
      nodeId,
      sourceNodeIds: ["math.precalc.example.1.2.004"],
      alignmentNodeIds: [],
      rendererKey: "negative-rate-context-choice",
      rendererModeMap: {
        worked: "negative-rate-context-choice",
        guidedPractice: "negative-rate-context-choice",
        independentPractice: "negative-rate-context-choice",
      },
      generatorKey: "topic12-negative-rate-context-choice",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "2" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");

    const workedProps = blueprint.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint.independentPracticeSpec!.rendererProps!;
    expect(workedProps).toEqual({
      prompt: seedZero.prompt,
      options: seedZero.options,
      presentationMode: "worked_example",
      correctOptionId: expectedAnswer,
      steps: seedZeroOutput.solutionSteps.map((step) => step.description),
      finalAnswer: "Option B is correct because x increases while y decreases.",
    });
    expect(expectedAnswer).toBe("B");
    expect(seedZero.options).toEqual([
      {
        id: "A",
        label: "A",
        xDefinition: "the age, in years, of a young child",
        yDefinition: "the height, in inches, of the young child",
      },
      {
        id: "B",
        label: "B",
        xDefinition: "the total number of points scored in a basketball game",
        yDefinition: "the time remaining, in seconds, in the game",
      },
      {
        id: "C",
        label: "C",
        xDefinition: "the time, in seconds, since a ball was thrown straight up in the air",
        yDefinition: "the height, in feet, of the ball",
      },
      {
        id: "D",
        label: "D",
        xDefinition: "the radius, in meters, of a circle",
        yDefinition: "the area, in square inches, of the circle",
      },
    ]);
    expect(guidedProps).toEqual({
      prompt: seedOne.prompt,
      options: seedOne.options,
      presentationMode: "guided_practice",
      guidedSteps: [
        "Determine how y changes as x increases in each option.",
        "Select the option in which y always decreases as x increases.",
      ],
      fieldHelp: "A negative rate of change means y decreases as x increases.",
    });
    expect(independentData.seed).toBe(2);
    expect(independentProps).toEqual(independentData.rendererProps);
    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(getPropsSchema("negative-rate-context-choice")?.safeParse(props).success).toBe(true);
    }
    for (const props of [guidedProps, independentProps]) {
      expect(JSON.stringify(props)).not.toMatch(
        /correct|expected|grading|solution|finalAnswer|relationship|score|isCorrect/i,
      );
      for (const key of [
        "correctOptionId",
        "expectedAnswer",
        "gradingMetadata",
        "solutionSteps",
        "finalAnswer",
        "relationship",
        "score",
        "isCorrect",
      ]) {
        expect(props).not.toHaveProperty(key);
      }
    }

    expect(blueprint.workedExampleSpec!.target).toEqual({ selectedOptionId: "B" });
    expect(blueprint.workedExampleSpec!.steps.map((step) => step.description)).toEqual(
      seedZeroOutput.solutionSteps.map((step) => step.description),
    );
    expect(blueprint.workedExampleSpec!.givens).toEqual([
      "An always-negative rate means y decreases as x increases.",
      "Choose definitions where x increases and y decreases.",
    ]);
    expect(blueprint.workedExampleSpec!.explanation).toBe(
      "Option B is correct because x increases while y decreases.",
    );
    expect(blueprint.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: "Choose definitions for x and y with an always-negative rate of change.",
      stepPrompts: [
        "Determine how y changes as x increases in each option.",
        "Select the option in which y always decreases as x increases.",
      ],
      hints: [
        "Check whether y increases or decreases as x increases.",
        "Select the definition with an always-negative relationship.",
      ],
      checksPerStep: [
        { check: "The direction of y is identified for each option." },
        { check: "The option with an always-negative relationship is selected." },
      ],
      revealPolicy: "one_at_a_time",
    });
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: { seed: { type: "integer", min: 0 } },
      answerSchema: { selectedOptionId: "string" },
      gradingRules: [{ partId: "selectedOptionId", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "any_seed",
    });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["selectedOptionId"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria: "Select the variable definitions that model an always-negative rate of change",
          points: 1,
          partId: "selectedOptionId",
        },
      ],
    });
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });

    const nodes = readDocument("nodes.json") as { nodes: Array<Record<string, unknown>> };
    const draftNodes = readDocument("draft-nodes.json") as {
      nodes: Array<Record<string, unknown>>;
    };
    const node = nodes.nodes.find((candidate) => candidate.id === nodeId);
    const draftNode = draftNodes.nodes.find((candidate) => candidate.id === nodeId);
    expect(node).toBeDefined();
    expect(draftNode).toEqual(node);
    expect(node).toMatchObject({
      rendererKey: "negative-rate-context-choice",
      generatorKey: "topic12-negative-rate-context-choice",
      independentPracticeReady: true,
    });
    expect(node!.reviewStatus).toBe("draft");

    const edges = (readDocument("edges.json") as { edges: Array<Record<string, unknown>> }).edges;
    expect(
      edges.filter(
        (edge) =>
          edge.id === "math.precalc.edge.0385" &&
          edge.type === "supports" &&
          edge.sourceId === "math.precalc.example.1.2.004" &&
          edge.targetId === nodeId,
      ),
    ).toEqual([
      {
        id: "math.precalc.edge.0385",
        type: "supports",
        sourceId: "math.precalc.example.1.2.004",
        targetId: nodeId,
        weight: 1,
        confidence: "high",
        sourceRefs: [`${SOURCE_REF}#page=16`],
        reviewStatus: "draft",
        rationale: "Example 4 models a negative rate from context variables.",
        metadata: { course: "precalc", unit: "1", lesson: "2" },
      },
    ]);
  });

  it("defines the source-backed Example 5 quadratic negative-rate interval blueprint for all three modes", () => {
    const nodeId = "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics";
    const document = readDocument("blueprints.json") as { blueprints: KnowledgeBlueprint[] };
    const blueprints = document.blueprints.filter((candidate) => candidate.nodeId === nodeId);
    expect(blueprints).toHaveLength(1);
    const blueprint = blueprints[0]!;
    const seedZero = generateTopic12QuadraticNegativeRateIntervalChoice(0);
    const seedZeroOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
    const seedOne = generateTopic12QuadraticNegativeRateIntervalChoice(1);
    const seedTwoOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(2);
    const publicProps = (
      variant: typeof seedZero,
      presentationMode: "worked_example" | "guided_practice" | "independent_practice",
    ) => ({
      prompt: variant.prompt,
      functionName: variant.functionName,
      constantTerm: variant.constantTerm,
      linearCoefficient: variant.linearCoefficient,
      quadraticCoefficient: variant.quadraticCoefficient,
      domain: variant.domain,
      options: variant.options,
      presentationMode,
    });
    const workedSteps = seedZeroOutput.solutionSteps.map((step) => step.description);
    const guidedSteps = [
      "Identify that the negative quadratic coefficient makes the parabola open downward.",
      "Find the vertex with x = -b/(2a).",
      "Use the right side of the vertex as the negative-rate interval.",
      "Select the one true statement.",
    ];
    const fieldHelp =
      "A downward-opening quadratic has a negative rate of change to the right of its vertex.";

    expect(blueprint).toMatchObject({
      nodeId,
      sourceNodeIds: ["math.precalc.example.1.2.005"],
      alignmentNodeIds: [],
      rendererKey: "quadratic-negative-rate-interval-choice",
      rendererModeMap: {
        worked: "quadratic-negative-rate-interval-choice",
        guidedPractice: "quadratic-negative-rate-interval-choice",
        independentPractice: "quadratic-negative-rate-interval-choice",
      },
      generatorKey: "topic12-quadratic-negative-rate-interval-choice",
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "2" },
    });
    expect(blueprint).not.toHaveProperty("exceptions");

    const workedProps = blueprint.workedExampleSpec!.rendererProps!;
    const guidedProps = blueprint.guidedPracticeSpec!.rendererProps!;
    const independentProps = blueprint.independentPracticeSpec!.rendererProps!;
    expect(workedProps).toEqual({
      ...publicProps(seedZero, "worked_example"),
      correctOptionId: "D",
      steps: workedSteps,
      finalAnswer: "Option D is correct because the rate is negative to the right of the vertex.",
    });
    expect(seedZeroOutput.expectedAnswer).toEqual({ selectedOptionId: "D" });
    expect(seedZero.options).toEqual([
      { id: "A", label: "A", rateSign: "positive", startInput: -10, endInput: 8.348 },
      { id: "B", label: "B", rateSign: "positive", startInput: -0.663, endInput: 5.605 },
      { id: "C", label: "C", rateSign: "negative", startInput: -10, endInput: 2.47 },
      { id: "D", label: "D", rateSign: "negative", startInput: 2.47, endInput: 10 },
    ]);
    expect(blueprint.workedExampleSpec).toMatchObject({
      givens: [
        "The negative quadratic coefficient makes the parabola open downward.",
        "The vertex is at x = 2.470.",
        "The rate of change is negative to the right of the vertex.",
      ],
      target: { selectedOptionId: "D" },
      explanation:
        "The parabola opens downward because its quadratic coefficient is negative. Its vertex is at x = 2.470, so the rate of change is negative to the right of the vertex. Therefore, option D is correct.",
    });
    expect(blueprint.workedExampleSpec!.steps.map((step) => step.description)).toEqual(workedSteps);
    expect(guidedProps).toEqual({
      ...publicProps(seedOne, "guided_practice"),
      guidedSteps,
      fieldHelp,
    });
    const independentData = seedTwoOutput.data as {
      seed: number;
      rendererProps: Record<string, unknown>;
    };
    expect(independentData.seed).toBe(2);
    expect(independentProps).toEqual(independentData.rendererProps);

    for (const props of [workedProps, guidedProps, independentProps]) {
      expect(
        getPropsSchema("quadratic-negative-rate-interval-choice")?.safeParse(props).success,
      ).toBe(true);
    }
    const authorityKeys = new Set([
      "correctOptionId",
      "expectedAnswer",
      "gradingMetadata",
      "solutionSteps",
      "finalAnswer",
      "vertexX",
      "score",
      "correctness",
      "solution",
    ]);
    const collectKeys = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap(collectKeys);
      if (!value || typeof value !== "object") return [];
      return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)]);
    };
    for (const props of [guidedProps, independentProps]) {
      expect(collectKeys(props).some((key) => authorityKeys.has(key))).toBe(false);
    }
    expect(blueprint.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt:
        "Use the quadratic and its vertex to identify the interval with a negative rate of change.",
      stepPrompts: guidedSteps,
      hints: [
        "Check the sign of the quadratic coefficient.",
        "Use x = -b/(2a) to locate the vertex.",
        "Look to the right of the vertex for a negative rate.",
        "Select the one statement that matches.",
      ],
      checksPerStep: [
        { check: "The negative quadratic coefficient shows that the parabola opens downward." },
        { check: "The vertex is found with x = -b/(2a)." },
        { check: "The rate is negative to the right of the vertex." },
        { check: "One true interval statement is selected." },
      ],
      revealPolicy: "one_at_a_time",
    });
    expect(blueprint.independentPracticeSpec).toMatchObject({
      variantParameters: {
        seed: {
          type: "integer",
          min: 0,
          description: "Deterministic Topic 1.2 quadratic negative-rate interval variant seed",
        },
      },
      answerSchema: { selectedOptionId: "string" },
      gradingRules: [{ partId: "selectedOptionId", ruleType: "exact_match", maxScore: 1 }],
      replayPolicy: "any_seed",
    });
    expect(blueprint.gradingSpec).toEqual({
      partIds: ["selectedOptionId"],
      passingScore: 1,
      partialCredit: false,
      rubric: [
        {
          criteria:
            "Select the interval statement that correctly identifies where the quadratic has a negative rate of change",
          points: 1,
          partId: "selectedOptionId",
        },
      ],
    });
    expect(validateBlueprintGeneratorReadiness(blueprint)).toMatchObject({ valid: true });
    expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    expect(validateModeSupport(blueprint)).toMatchObject({ valid: true });
    expect(validateGradingCompatibility(blueprint)).toMatchObject({ valid: true });

    const nodes = readDocument("nodes.json") as { nodes: Array<Record<string, unknown>> };
    const draftNodes = readDocument("draft-nodes.json") as {
      nodes: Array<Record<string, unknown>>;
    };
    const node = nodes.nodes.find((candidate) => candidate.id === nodeId);
    const draftNode = draftNodes.nodes.find((candidate) => candidate.id === nodeId);
    expect(node).toBeDefined();
    expect(draftNode).toEqual(node);
    for (const catalogNode of [node, draftNode]) {
      expect(catalogNode).toMatchObject({
        rendererKey: "quadratic-negative-rate-interval-choice",
        generatorKey: "topic12-quadratic-negative-rate-interval-choice",
        independentPracticeReady: true,
      });
    }
    const edges = (readDocument("edges.json") as { edges: Array<Record<string, unknown>> }).edges;
    expect(edges.filter((edge) => edge.id === "math.precalc.edge.0386")).toEqual([
      {
        id: "math.precalc.edge.0386",
        type: "supports",
        sourceId: "math.precalc.example.1.2.005",
        targetId: nodeId,
        weight: 1,
        confidence: "high",
        sourceRefs: [`${SOURCE_REF}#page=16`],
        reviewStatus: "draft",
        rationale: "Example 5 identifies the interval where a quadratic has negative rate.",
        metadata: { course: "precalc", unit: "1", lesson: "2" },
      },
    ]);
  });

  it("projects the ready Example 5 quadratic negative-rate interval blueprint", () => {
    const nodeId = "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics";
    const blueprintDocument = readDocument("blueprints.json") as {
      blueprints: KnowledgeBlueprint[];
    };
    const blueprint = blueprintDocument.blueprints.find((candidate) => candidate.nodeId === nodeId);
    expect(blueprint).toBeDefined();
    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const draftNodes = (
      readDocument("draft-nodes.json") as { nodes: Array<Record<string, unknown>> }
    ).nodes;
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const expectedActivities = projectActivityMap(
      nodes,
      edges,
      blueprintDocument.blueprints,
    ).filter((row) => row.nodeId === nodeId);
    const expectedSrs = projectSrsInputs(nodes, edges, blueprintDocument.blueprints).filter(
      (row) => row.nodeId === nodeId,
    );
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneProjection = readDocument("projection/srs-input.json") as {
      inputs: Array<Record<string, unknown>>;
    };
    const actualActivities = activityProjection.activities.filter((row) => row.nodeId === nodeId);
    const actualCombinedSrs = activityProjection.srsInputs.filter((row) => row.nodeId === nodeId);
    const actualStandaloneSrs = standaloneProjection.inputs.filter((row) => row.nodeId === nodeId);

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(actualActivities.map((row) => row.stableActivityId)).toEqual([
      `${nodeId}.worked_example`,
      `${nodeId}.guided_practice`,
      `${nodeId}.independent_practice`,
    ]);
    expect(actualActivities.map((row) => row.sourceNodeIds)).toEqual([
      ["math.precalc.example.1.2.005"],
      ["math.precalc.example.1.2.005"],
      ["math.precalc.example.1.2.005"],
    ]);
    expect(actualActivities.map((row) => row.rendererKey)).toEqual([
      "quadratic-negative-rate-interval-choice",
      "quadratic-negative-rate-interval-choice",
      "quadratic-negative-rate-interval-choice",
    ]);
    expect(actualActivities.map((row) => row.props)).toEqual([
      blueprint!.workedExampleSpec!.rendererProps,
      blueprint!.guidedPracticeSpec!.rendererProps,
      blueprint!.independentPracticeSpec!.rendererProps,
    ]);
    expect(actualActivities.map((row) => row.gradingConfig)).toEqual(
      expectedActivities.map((row) => row.gradingConfig),
    );
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    expect(new Set(activityProjection.activities.map((row) => row.stableActivityId)).size).toBe(
      activityProjection.activities.length,
    );

    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs[0]).toEqual(expectedSrs[0]);
    expect(actualCombinedSrs[0]).toEqual({
      nodeId,
      blueprintId: `${nodeId}.blueprint`,
      standards: [],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: "topic12-quadratic-negative-rate-interval-choice",
      generatorReady: true,
      equivalentNodeIds: [],
    });

    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });

    const node = nodes.find((candidate) => candidate.id === nodeId);
    const draftNode = draftNodes.find((candidate) => candidate.id === nodeId);
    expect(draftNode).toEqual(node);
    for (const catalogNode of [node, draftNode]) {
      expect(catalogNode).toBeDefined();
      expect(catalogNode).toMatchObject({
        rendererKey: "quadratic-negative-rate-interval-choice",
        generatorKey: "topic12-quadratic-negative-rate-interval-choice",
        independentPracticeReady: true,
      });
    }

    const generatorQueue = readDocument("generator-gap-queue.json") as {
      items: Array<{ nodeId: string }>;
    };
    expect(generatorQueue.items.filter((item) => item.nodeId === nodeId)).toHaveLength(0);
    const componentQueue = readDocument("component-gap-queue.json") as {
      items: Array<{ affectedNodeIds?: string[] }>;
    };
    expect(componentQueue.items.some((item) => item.affectedNodeIds?.includes(nodeId))).toBe(false);
  });

  it("projects the ready Example 4 negative-rate context blueprint", () => {
    const nodeId = "math.precalc.skill.1.2.model-negative-rate-contexts";
    const blueprintDocument = readDocument("blueprints.json") as {
      blueprints: KnowledgeBlueprint[];
    };
    const blueprint = blueprintDocument.blueprints.find((candidate) => candidate.nodeId === nodeId);
    expect(blueprint).toBeDefined();
    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const expectedActivities = projectActivityMap(
      nodes,
      edges,
      blueprintDocument.blueprints,
    ).filter((row) => row.nodeId === nodeId);
    const expectedSrs = projectSrsInputs(nodes, edges, blueprintDocument.blueprints).filter(
      (row) => row.nodeId === nodeId,
    );
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneProjection = readDocument("projection/srs-input.json") as {
      inputs: Array<Record<string, unknown>>;
    };
    const actualActivities = activityProjection.activities.filter((row) => row.nodeId === nodeId);
    const actualCombinedSrs = activityProjection.srsInputs.filter((row) => row.nodeId === nodeId);
    const actualStandaloneSrs = standaloneProjection.inputs.filter((row) => row.nodeId === nodeId);

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    expect(actualActivities.map((row) => row.stableActivityId)).toEqual([
      `${nodeId}.worked_example`,
      `${nodeId}.guided_practice`,
      `${nodeId}.independent_practice`,
    ]);
    expect(
      actualActivities.every((row) => row.rendererKey === "negative-rate-context-choice"),
    ).toBe(true);
    expect(
      actualActivities.every(
        (row) =>
          Array.isArray(row.sourceNodeIds) &&
          row.sourceNodeIds.length === 1 &&
          row.sourceNodeIds[0] === "math.precalc.example.1.2.004",
      ),
    ).toBe(true);
    expect(
      actualActivities.every(
        (row) => getPropsSchema("negative-rate-context-choice")?.safeParse(row.props).success,
      ),
    ).toBe(true);
    expect(actualActivities.map((row) => row.gradingConfig)).toEqual(
      expectedActivities.map((row) => row.gradingConfig),
    );
    expect(actualActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);
    const stableActivityIds = activityProjection.activities.map((row) => row.stableActivityId);
    expect(new Set(stableActivityIds).size).toBe(stableActivityIds.length);

    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualCombinedSrs[0]).toEqual({
      nodeId,
      blueprintId: `${nodeId}.blueprint`,
      standards: [],
      prerequisites: [],
      difficulty: 0.5,
      generatorKey: "topic12-negative-rate-context-choice",
      generatorReady: true,
      equivalentNodeIds: [],
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualCombinedSrs[0]).toMatchObject({ generatorReady: true });
    expect(actualStandaloneSrs[0]).toMatchObject({ generatorReady: true });

    const generatorQueue = readDocument("generator-gap-queue.json") as {
      items: Array<{ nodeId: string }>;
    };
    expect(generatorQueue.items.filter((item) => item.nodeId === nodeId)).toHaveLength(0);
    const componentQueue = readDocument("component-gap-queue.json") as {
      items: Array<{ affectedNodeIds?: string[] }>;
    };
    expect(componentQueue.items.some((item) => item.affectedNodeIds?.includes(nodeId))).toBe(false);
  });

  it("keeps the Example 2 least-rate projections synchronized and ready", () => {
    const nodeId = "math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs";
    const blueprintDocument = readDocument("blueprints.json") as {
      blueprints: KnowledgeBlueprint[];
    };
    const nodes = (
      readDocument("nodes.json") as { nodes: Parameters<typeof projectActivityMap>[0] }
    ).nodes;
    const edges = (
      readDocument("edges.json") as { edges: Parameters<typeof projectActivityMap>[1] }
    ).edges;
    const expectedActivities = projectActivityMap(
      nodes,
      edges,
      blueprintDocument.blueprints,
    ).filter((row) => row.nodeId === nodeId);
    const expectedSrs = projectSrsInputs(nodes, edges, blueprintDocument.blueprints).filter(
      (row) => row.nodeId === nodeId,
    );
    const activityProjection = readDocument("projection/practice-v1-activity-map.json") as {
      activities: Array<Record<string, unknown>>;
      srsInputs: Array<Record<string, unknown>>;
    };
    const standaloneProjection = readDocument("projection/srs-input.json") as {
      inputs: Array<Record<string, unknown>>;
    };
    const actualActivities = activityProjection.activities.filter((row) => row.nodeId === nodeId);
    const actualCombinedSrs = activityProjection.srsInputs.filter((row) => row.nodeId === nodeId);
    const actualStandaloneSrs = standaloneProjection.inputs.filter((row) => row.nodeId === nodeId);

    expect(expectedActivities).toHaveLength(3);
    expect(actualActivities).toHaveLength(3);
    expect(actualActivities).toEqual(expectedActivities);
    expect(actualActivities.map((row) => row.mode)).toEqual([
      "worked_example",
      "guided_practice",
      "independent_practice",
    ]);
    for (const row of actualActivities) {
      expect(row.stableActivityId).toBe(`${nodeId}.${String(row.mode)}`);
      expect(row.rendererKey).toBe("pointwise-least-rate-choice");
      expect(row.srsEligible).toBe(
        row.mode === "guided_practice" || row.mode === "independent_practice",
      );
      expect(getPropsSchema(String(row.rendererKey))?.safeParse(row.props).success).toBe(true);
    }
    expect(new Set(activityProjection.activities.map((row) => row.stableActivityId)).size).toBe(
      activityProjection.activities.length,
    );

    expect(expectedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toHaveLength(1);
    expect(actualCombinedSrs).toEqual(expectedSrs);
    expect(actualCombinedSrs[0]).toMatchObject({
      blueprintId: `${nodeId}.blueprint`,
      generatorKey: "topic12-pointwise-least-rate-choice",
      generatorReady: true,
      prerequisites: ["math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs"],
    });
    expect(actualStandaloneSrs).toHaveLength(1);
    const standaloneCore = actualStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(actualStandaloneSrs[0]).toMatchObject({
      blueprintId: `${nodeId}.blueprint`,
      generatorKey: "topic12-pointwise-least-rate-choice",
      generatorReady: true,
    });

    const queue = readDocument("generator-gap-queue.json") as { items: Array<{ nodeId: string }> };
    expect(queue.items.filter((item) => item.nodeId === nodeId)).toHaveLength(0);
  });
});
