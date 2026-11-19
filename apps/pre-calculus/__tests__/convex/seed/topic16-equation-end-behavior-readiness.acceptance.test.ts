import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import type {
  KnowledgeBlueprint,
  ProjectedActivity,
  SrsProjectionEntry,
} from "@math-platform/knowledge-space-practice";
import { projectActivityMap, projectSrsInputs } from "@math-platform/knowledge-space-practice";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, "../../../curriculum/skill-graph");
const NODE_ID = "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";
const SOURCE_ID = "math.precalc.example.1.6.003";
const ALIGNMENT_IDS = ["math.standard.ccss.hsf-if-b-4", "math.standard.ccss.hsf-if-c-7c"] as const;
const RENDERER_KEY = "polynomial-equation-end-behavior";
const GENERATOR_KEY = "topic16-equation-end-behavior";
const MODES = ["worked_example", "guided_practice", "independent_practice"] as const;

type StoredSrsRow = SrsProjectionEntry & {
  apTopic?: unknown;
  calculatorRequired?: unknown;
  frqTaskModel?: unknown;
};

type JsonDocument = {
  activities?: ProjectedActivity[];
  blueprints?: KnowledgeBlueprint[];
  edges?: Array<Record<string, unknown>>;
  inputs?: StoredSrsRow[];
  items?: Array<{ nodeId: string }>;
  nodes?: Array<Record<string, unknown>>;
  srsInputs?: SrsProjectionEntry[];
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

const expectedNode = {
  id: NODE_ID,
  kind: "skill",
  title: "Determine polynomial end behavior from equations",
  domain: "math.precalc",
  description:
    "Given a polynomial equation, use degree parity and the leading coefficient to state the left and right end behavior verbally.",
  sourceRefs: ["apps/pre-calculus/curriculum/APPC  Unit 1 Passwater.pdf#page=78"],
  reviewStatus: "draft",
  metadata: { course: "precalc", unit: "1", lesson: "6" },
  rendererKey: RENDERER_KEY,
  generatorKey: GENERATOR_KEY,
  independentPracticeReady: true,
};

describe("Topic 1.6 Example 3 graph readiness", () => {
  it("promotes the exact node and its derived projections", () => {
    const nodesDocument = readJson("nodes.json");
    const draftNodesDocument = readJson("draft-nodes.json");
    const rootNodes = nodesDocument.nodes!;
    const draftNodes = draftNodesDocument.nodes!;
    const rootMatches = rootNodes.filter((node) => node.id === NODE_ID);
    const draftMatches = draftNodes.filter((node) => node.id === NODE_ID);

    expect(rootMatches).toHaveLength(1);
    expect(draftMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(expectedNode);
    expect(draftMatches[0]).toEqual(expectedNode);
    expect(rootMatches[0]).toEqual(draftMatches[0]);

    const readyNodes = rootNodes.map((node) =>
      node.id === NODE_ID ? { ...node, independentPracticeReady: true } : node,
    ) as unknown as Parameters<typeof projectActivityMap>[0];
    const edges = readJson("edges.json").edges! as unknown as Parameters<
      typeof projectActivityMap
    >[1];
    const blueprints = readJson("blueprints.json").blueprints!;
    const expectedActivities = projectActivityMap(readyNodes, edges, blueprints).filter(
      (row) => row.nodeId === NODE_ID,
    );
    const storedActivities = readJson(
      "projection/practice-v1-activity-map.json",
    ).activities!.filter((row) => row.nodeId === NODE_ID);

    expect(expectedActivities).toHaveLength(3);
    expect(storedActivities).toHaveLength(3);
    expect(storedActivities).toEqual(expectedActivities);
    expect(storedActivities.map((row) => row.mode)).toEqual(MODES);
    expect(storedActivities.map((row) => row.stableActivityId)).toEqual(
      MODES.map((mode) => `${NODE_ID}.${mode}`),
    );
    expect(storedActivities.map((row) => row.srsEligible)).toEqual([false, true, true]);

    const expectedSrs = projectSrsInputs(readyNodes, edges, blueprints).filter(
      (row) => row.nodeId === NODE_ID,
    );
    const storedCombinedSrs = readJson(
      "projection/practice-v1-activity-map.json",
    ).srsInputs!.filter((row) => row.nodeId === NODE_ID);
    const storedStandaloneSrs = readJson("projection/srs-input.json").inputs!.filter(
      (row) => row.nodeId === NODE_ID,
    );

    expect(expectedSrs).toHaveLength(1);
    expect(storedCombinedSrs).toHaveLength(1);
    expect(storedCombinedSrs).toEqual(expectedSrs);
    expect(storedCombinedSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      blueprintId: `${NODE_ID}.blueprint`,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });
    expect(storedStandaloneSrs).toHaveLength(1);
    const standaloneCore = storedStandaloneSrs[0]!;
    expect(standaloneCore).toEqual(expectedSrs[0]);
    expect(storedStandaloneSrs[0]).toMatchObject({
      nodeId: NODE_ID,
      generatorKey: GENERATOR_KEY,
      generatorReady: true,
    });

    const blueprint = blueprints.filter((candidate) => candidate.nodeId === NODE_ID);
    expect(blueprint).toHaveLength(1);
    expect(blueprint[0]).toMatchObject({
      nodeId: NODE_ID,
      sourceNodeIds: [SOURCE_ID],
      alignmentNodeIds: [...ALIGNMENT_IDS],
      rendererKey: RENDERER_KEY,
      rendererModeMap: {
        worked: RENDERER_KEY,
        guidedPractice: RENDERER_KEY,
        independentPractice: RENDERER_KEY,
      },
      generatorKey: GENERATOR_KEY,
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
    });

    const generatorGapQueue = readJson("generator-gap-queue.json");
    expect(generatorGapQueue.items!.filter((item) => item.nodeId === NODE_ID)).toHaveLength(0);
    expect(
      new Set(
        readJson("projection/practice-v1-activity-map.json").activities!.map(
          (row) => row.stableActivityId,
        ),
      ).size,
    ).toBe(readJson("projection/practice-v1-activity-map.json").activities!.length);
  });
});
