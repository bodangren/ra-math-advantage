// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import blueprints from "../../curriculum/skill-graph/blueprints.json";
import draft from "../../curriculum/skill-graph/draft-nodes.json";
import graph from "../../curriculum/skill-graph/edges.json";
import inventory from "../../curriculum/skill-graph/nodes.json";
import activityMap from "../../curriculum/skill-graph/projection/practice-v1-activity-map.json";
import srs from "../../curriculum/skill-graph/projection/srs-input.json";
import teacher from "../../curriculum/skill-graph/projection/teacher-evidence-map.json";

const centroidCoordinateId =
  "math.im2.skill.1.3.find-coordinates-of-the-centroid";
const centroidLengthId =
  "math.im2.skill.1.3.find-lengths-of-medians-using-the-centroid-theorem";
const coordinateCircumcenterId =
  "math.im2.skill.1.1.find-coordinates-of-the-circumcenter";
const lessonSource =
  "apps/integrated-math-2/curriculum/modules/module-1-lesson-3";
const lesson12Source =
  "apps/integrated-math-2/curriculum/modules/module-1-lesson-2";
const equalAngleId =
  "math.im2.skill.1.2.solve-an-equal-angle-equation-and-find-the-whole-angle";
const inradiusId =
  "math.im2.skill.1.2.find-the-inradius-from-equal-perpendicular-distances";

function getNode<T extends { id: string }>(nodes: T[], id: string) {
  return nodes.find((node) => node.id === id);
}

describe("IM2 Module 1 source mappings", () => {
  it("separates the perpendicular-bisector equation from coordinate circumcenter work", () => {
    const source = readFileSync(
      resolve("curriculum/modules/module-1-lesson-1"),
      "utf8",
    );
    expect(source).toContain(
      "D lies on the perpendicular bisector of AB. DA = 3x + 2 cm and DB = 5x - 6 cm. Find x and both distances.",
    );
    expect(source).toContain(
      "Find the circumcenter of the triangle with A(0, 0), B(6, 0), and C(0, 8).",
    );
    expect(source).toContain(
      "A monument must be equidistant from landmarks A(2, 2), B(8, 2), and C(2, 10). Find its coordinates.",
    );
    expect(source).toContain(
      "Find a sprinkler location equidistant from all three trees and the required spray radius.",
    );

    expect(
      blueprints.blueprints.find(
        (item) => item.nodeId === coordinateCircumcenterId,
      )?.sourceNodeIds,
    ).toEqual([
      "math.im2.example.1.1.002",
      "math.im2.example.1.1.003",
      "math.im2.example.1.1.004",
    ]);
    expect(
      blueprints.blueprints.find(
        (item) =>
          item.nodeId ===
          "math.im2.skill.1.1.perpendicular-bisector-equidistance",
      )?.sourceNodeIds,
    ).toEqual(["math.im2.example.1.1.001"]);

    const copies = [
      getNode(inventory.nodes, coordinateCircumcenterId),
      getNode(draft.nodes, coordinateCircumcenterId),
      getNode(graph.nodes, coordinateCircumcenterId),
    ];
    expect(copies[0]).toMatchObject({
      title: "Find the coordinates of the circumcenter of a triangle",
      sourceRefs: [
        "apps/integrated-math-2/curriculum/modules/module-1-lesson-1",
      ],
      reviewStatus: "draft",
    });
    expect(copies[1]).toEqual(copies[0]);
    expect(copies[2]).toEqual(copies[0]);
    expect(
      teacher.skills.find((item) => item.nodeId === coordinateCircumcenterId),
    ).toMatchObject({
      generatorStatus: "not_implemented",
      independentPracticeReady: false,
      prerequisites: [],
    });
    expect(
      srs.skills.find((item) => item.nodeId === coordinateCircumcenterId),
    ).toMatchObject({ srsEligible: false, prerequisiteNodeIds: [] });
  });

  it("keeps Lesson 1-1 legacy objective rows as draft aggregators", () => {
    const legacyIds = [
      "math.im2.skill.1.1.apply-properties-of-circumcenters-and-perpendicular-bisector",
      "math.im2.skill.1.1.find-measures-of-segments-and-angles-using-perpendicular-bis",
    ];
    for (const nodes of [inventory.nodes, draft.nodes, graph.nodes])
      for (const id of legacyIds)
        expect(getNode(nodes as { id: string; reviewStatus?: string }[], id)).toMatchObject({
          kind: "skill",
          reviewStatus: "draft",
          metadata: { taxonomyRole: "legacy_objective_aggregator" },
        });
  });

  it("uses the exact Lesson 1-3 source bodies for the two centroid mappings", () => {
    const source = readFileSync(
      resolve("curriculum/modules/module-1-lesson-3"),
      "utf8",
    );
    expect(source).toContain(
      "## Example 1 — Find Segment Lengths Using the Centroid\n\n### Problem\n\nG is the centroid of triangle ABC, and M is the midpoint of BC. The median AM is 24 cm long. Find AG and GM.",
    );
    expect(source).toContain(
      "## Example 2 — Find Coordinates of the Centroid\n\n### Problem\n\nFind the centroid of the triangle with vertices A(-3, 2), B(6, 5), and C(0, -1).",
    );

    expect(
      blueprints.blueprints.find((item) => item.nodeId === centroidLengthId)
        ?.sourceNodeIds,
    ).toEqual(["math.im2.example.1.3.009"]);
    expect(
      blueprints.blueprints.find(
        (item) => item.nodeId === centroidCoordinateId,
      )?.sourceNodeIds,
    ).toEqual(["math.im2.example.1.3.010"]);
  });

  it("keeps the new source-only capability identical and draft in all graph node stores", () => {
    const copies = [
      getNode(inventory.nodes, centroidCoordinateId),
      getNode(draft.nodes, centroidCoordinateId),
      getNode(graph.nodes, centroidCoordinateId),
    ];
    expect(copies[0]).toBeDefined();
    expect(copies[1]).toEqual(copies[0]);
    expect(copies[2]).toEqual(copies[0]);
    expect(copies[0]).toMatchObject({
      id: centroidCoordinateId,
      kind: "skill",
      title: "Find the coordinates of the centroid of a triangle",
      description:
        "Find the centroid of a triangle by averaging the vertex coordinates.",
      sourceRefs: [lessonSource],
      reviewStatus: "draft",
      metadata: { course: "im2", module: "1", lesson: "3" },
    });

    const blueprint = blueprints.blueprints.find(
      (item) => item.nodeId === centroidCoordinateId,
    );
    expect(blueprint).toMatchObject({
      sourceNodeIds: ["math.im2.example.1.3.010"],
      alignmentNodeIds: [],
      rendererKey: "",
      rendererModeMap: {},
      reviewStatus: "draft",
      metadata: {
        course: "im2",
        module: "1",
        lesson: "3",
        implementationStatus: "unavailable",
        independentPracticeReady: false,
      },
    });
    expect(blueprint).not.toHaveProperty("workedExampleSpec");
    expect(blueprint).not.toHaveProperty("guidedPracticeSpec");
    expect(blueprint).not.toHaveProperty("independentPracticeSpec");
    expect(blueprint).not.toHaveProperty("generatorKey");

    const directEdges = graph.edges.filter(
      (edge) =>
        edge.sourceId === centroidCoordinateId ||
        edge.targetId === centroidCoordinateId,
    );
    expect(directEdges.map((edge) => edge.type).sort()).toEqual([
      "appears_in_context",
      "contains",
    ]);
    expect(directEdges.every((edge) => edge.reviewStatus === "draft")).toBe(
      true,
    );

    expect(
      teacher.skills.find((item) => item.nodeId === centroidCoordinateId),
    ).toMatchObject({
      generatorStatus: "not_implemented",
      independentPracticeReady: false,
      prerequisites: [],
    });
    expect(
      srs.skills.find((item) => item.nodeId === centroidCoordinateId),
    ).toMatchObject({
      srsEligible: false,
      prerequisiteNodeIds: [],
    });
  });

  it("uses the full Lesson 1-2 source bodies and preserves the requested final quantities", () => {
    const source = readFileSync(
      resolve("curriculum/modules/module-1-lesson-2"),
      "utf8",
    );
    expect(source).toContain(
      "## Example 1 — Find Angle and Segment Measures Using Angle Bisectors\n\n### Problem\n\nBD bisects angle ABC. Angle ABD is (3x + 4) degrees and angle DBC is (5x - 12) degrees. Find angle ABC.\n\n### Solution\n\nThe two angles are equal. Solve 3x + 4 = 5x - 12 to obtain x = 8. Each smaller angle is 28 degrees, so angle ABC is 56 degrees.",
    );
    expect(source).toContain(
      "## Example 2 — Use the Incenter to Find Measures\n\n### Problem\n\nI is the incenter of triangle ABC. D and E are the feet of perpendiculars from I to AB and BC. ID = 2x + 1 cm and IE = 5x - 8 cm. Find the inradius.\n\n### Solution\n\nThe incenter has equal perpendicular distances to all three sides. Thus 2x + 1 = 5x - 8, so x = 3. The inradius is ID = IE = 7 cm.",
    );

    for (const exampleId of [
      "math.im2.example.1.2.005",
      "math.im2.example.1.2.006",
    ]) {
      for (const nodes of [inventory.nodes, draft.nodes, graph.nodes]) {
        expect(nodes.filter((node) => node.id === exampleId)).toHaveLength(1);
        expect(getNode(nodes as { id: string }[], exampleId)).toMatchObject({
          kind: "worked_example",
        });
      }
    }

    expect(
      blueprints.blueprints.find((item) => item.nodeId === equalAngleId)
        ?.sourceNodeIds,
    ).toEqual(["math.im2.example.1.2.005"]);
    expect(
      blueprints.blueprints.find((item) => item.nodeId === inradiusId)
        ?.sourceNodeIds,
    ).toEqual(["math.im2.example.1.2.006"]);
  });

  it("adds two inactive atomic Lesson 1-2 capabilities and preserves the broad rows", () => {
    for (const [id, title, description, exampleId] of [
      [
        equalAngleId,
        "Solve an equal-angle equation and find the whole bisected angle",
        "Use two equal angle expressions to solve a linear equation and find the measure of the whole bisected angle.",
        "math.im2.example.1.2.005",
      ],
      [
        inradiusId,
        "Find the inradius from equal perpendicular distances",
        "Use equal perpendicular distances from an incenter to solve a linear equation and find the inradius.",
        "math.im2.example.1.2.006",
      ],
    ] as const) {
      const copies = [
        getNode(inventory.nodes, id),
        getNode(draft.nodes, id),
        getNode(graph.nodes, id),
      ];
      expect(copies[0]).toMatchObject({
        id,
        kind: "skill",
        title,
        description,
        sourceRefs: [lesson12Source],
        reviewStatus: "draft",
        metadata: { course: "im2", module: "1", lesson: "2" },
      });
      expect(copies[1]).toEqual(copies[0]);
      expect(copies[2]).toEqual(copies[0]);

      const blueprint = blueprints.blueprints.find((item) => item.nodeId === id);
      expect(blueprint).toMatchObject({
        sourceNodeIds: [exampleId],
        alignmentNodeIds: [],
        rendererKey: "",
        rendererModeMap: {},
        reviewStatus: "draft",
        metadata: {
          implementationStatus: "unavailable",
          independentPracticeReady: false,
        },
      });
      expect(blueprint).not.toHaveProperty("generatorKey");
      expect(blueprint).not.toHaveProperty("workedExampleSpec");
      expect(blueprint).not.toHaveProperty("guidedPracticeSpec");
      expect(blueprint).not.toHaveProperty("independentPracticeSpec");

      const directEdges = graph.edges.filter(
        (edge) => edge.sourceId === id || edge.targetId === id,
      );
      expect(directEdges.map((edge) => edge.type).sort()).toEqual([
        "appears_in_context",
        "contains",
      ]);
      expect(directEdges.every((edge) => edge.reviewStatus === "draft")).toBe(
        true,
      );
      expect(
        directEdges.find((edge) => edge.type === "appears_in_context")
          ?.targetId,
      ).toBe(exampleId);

      expect(teacher.skills.find((item) => item.nodeId === id)).toMatchObject({
        standardsCoverage: { alignedStandards: [] },
        prerequisites: [],
        generatorStatus: "not_implemented",
        rendererKey: "",
        independentPracticeReady: false,
      });
      expect(srs.skills.find((item) => item.nodeId === id)).toMatchObject({
        prerequisiteNodeIds: [],
        generatorReady: false,
        independentPracticeReady: false,
        srsEligible: false,
      });
      expect(
        activityMap.activities.some((item: { nodeId: string }) => item.nodeId === id),
      ).toBe(false);
    }

    const legacy1c =
      "math.im2.skill.1.2.use-the-angle-bisector-theorem-to-find-angle-and-segment-mea";
    const supplementary1d =
      "math.im2.skill.1.2.solve-real-world-problems-involving-angle-bisectors-and-the";
    for (const nodes of [inventory.nodes, draft.nodes, graph.nodes]) {
      expect(getNode(nodes as { id: string }[], legacy1c)).toMatchObject({
        kind: "skill",
        reviewStatus: "draft",
        metadata: { taxonomyRole: "legacy_objective_aggregator" },
      });
      expect(getNode(nodes as { id: string }[], supplementary1d)).toMatchObject({
        kind: "skill",
        reviewStatus: "draft",
      });
      expect(
        getNode(nodes as { id: string; metadata?: Record<string, unknown> }[], supplementary1d)
          ?.metadata,
      ).not.toHaveProperty("taxonomyRole");
    }
    for (const id of [legacy1c, supplementary1d])
      expect(
        blueprints.blueprints.find((item) => item.nodeId === id)?.sourceNodeIds,
      ).toEqual([]);
  });

  it("keeps projection metadata equal to the canonical skill inventory", () => {
    const canonicalSkillIds = inventory.nodes
      .filter((node) => node.kind === "skill")
      .map((node) => node.id)
      .sort();
    const teacherSkillIds = teacher.skills.map((row) => row.nodeId).sort();
    const srsSkillIds = srs.skills.map((row) => row.nodeId).sort();

    expect(teacherSkillIds).toEqual(canonicalSkillIds);
    expect(srsSkillIds).toEqual(canonicalSkillIds);
    expect(teacher.metadata.totalSkills).toBe(canonicalSkillIds.length);
    expect(srs.metadata.totalSkills).toBe(canonicalSkillIds.length);
    expect(teacher.metadata.standardsGapCount).toBe(
      teacher.skills.filter((row) => row.standardsCoverage.hasStandardsGap)
        .length,
    );
    expect(teacher.metadata.generatorReadyCount).toBe(
      teacher.skills.filter((row) => row.generatorStatus === "implemented")
        .length,
    );
    expect(srs.metadata.srsEligibleCount).toBe(
      srs.skills.filter((row) => row.srsEligible).length,
    );
  });
});
