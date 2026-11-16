// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import lessons from "../../curriculum/lessons.json";
import calendar from "../../curriculum/calendar.json";
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
const lesson14Source =
  "apps/integrated-math-2/curriculum/modules/module-1-lesson-4";
const anglesFromSidesId =
  "math.im2.skill.1.4.order-triangle-angles-from-side-lengths";
const sidesFromAnglesId =
  "math.im2.skill.1.4.order-triangle-sides-from-angle-measures";

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

  it("preserves all 39 Lesson 1-4 worksheet prompts and their native figures", () => {
    const source = readFileSync(
      resolve("curriculum/modules/module-1-lesson-4"),
      "utf8",
    );

    expect(source.match(/^## Example 1$/gm)).toHaveLength(1);
    expect(source.match(/^## Examples 2 and 3$/gm)).toHaveLength(1);
    expect(source.match(/^## Example 4$/gm)).toHaveLength(1);
    expect(source.match(/^## Mixed Exercises$/gm)).toHaveLength(1);
    expect(source.match(/^## Examples? /gm)).toHaveLength(3);
    const supportedGoals = [
      "List all angles that satisfy a given condition relative to another angle.",
      "Order angles and sides of a triangle from smallest to largest.",
      "Use angle and side relationships in real-world contexts.",
    ];
    expect(source).toContain("## Today's Goals");
    for (const goal of supportedGoals) expect(source).toContain(`* ${goal}`);
    const calendarEntry = calendar.periods.find(
      (period) => period.sourceLesson === "module-1-lesson-4",
    );
    expect(calendarEntry).toMatchObject({
      objective: supportedGoals[0],
      embeddedObjectives: supportedGoals.slice(1),
      workedExamples: [],
      dailyPhases: {
        conceptDevelopment: { workedExamples: [] },
        guidedPractice: { workedExamples: [] },
      },
    });

    for (let problem = 1; problem <= 39; problem += 1)
      expect(
        source.match(new RegExp(`^### Problem ${problem}$`, "gm")),
      ).toHaveLength(1);

    const problemBody = (problem: number) => {
      const start = source.indexOf(`### Problem ${problem}\n`);
      const end =
        problem === 39
          ? source.length
          : source.indexOf(`### Problem ${problem + 1}\n`, start);
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeGreaterThan(start);
      return source.slice(start, end);
    };

    for (const [problem, prompt] of [
      [1, "measures are greater than m∠3"],
      [2, "measures are less than m∠1"],
      [3, "measures are greater than m∠1"],
      [4, "measures are less than m∠7"],
      [5, "measures are greater than m∠2"],
    ] as const)
      expect(problemBody(problem)).toContain(prompt);

    expect(source).toContain(
      "### Problem 14\n\n**MAPS** Sata is going to Texas to visit a friend.",
    );
    for (const part of ["a.", "b.", "c."])
      expect(source.match(new RegExp(`^${part.replace(".", "\\.")} `, "gm"))).toHaveLength(1);

    for (const prompt of [
      "a. Based on the information in the figure, which of the two cities are nearest to each other?",
      "b. Based on the information in the figure, which of the two cities are farthest apart from each other?",
      "c. If you were going to use the information from Sata’s sketch in order to plan a road trip between these cities, what is an assumption you would have to make?",
    ])
      expect(problemBody(14)).toContain(prompt);

    const problemFigurePairs = [
      [6, 3],
      [7, 2],
      [8, 4],
      [9, 7],
      [10, 6],
      [11, 5],
      [15, 11],
      [16, 10],
    ] as const;
    for (const [problem, image] of problemFigurePairs)
      expect(problemBody(problem)).toContain(
        `module-1-lesson-4/image${image}.png`,
      );

    const sourceGroupFigures = [
      [source.slice(source.indexOf("## Example 1"), source.indexOf("## Examples 2 and 3")), [1]],
      [problemBody(12), [8]],
      [problemBody(14), [9]],
      [source.slice(source.indexOf("In △ABC"), source.indexOf("### Problem 20")), [12]],
      [problemBody(20), [13]],
      [problemBody(21), [14, 15]],
      [source.slice(source.indexOf("Use the figure at the right to determine the relationship between the measures"), source.indexOf("### Problem 32")), [16]],
      [source.slice(source.indexOf("Use the figure at the right to determine the relationship between the given lengths"), source.indexOf("### Problem 36")), [17]],
      [problemBody(37), [18]],
      [problemBody(39), [19]],
    ] as const;
    for (const [group, images] of sourceGroupFigures)
      for (const image of images)
        expect(group).toContain(`module-1-lesson-4/image${image}.png`);

    for (let image = 1; image <= 19; image += 1) {
      expect(
        source.match(
          new RegExp(`module-1-lesson-4/image${image}\\.png`, "g"),
        ),
      ).toHaveLength(1);
      expect(() =>
        readFileSync(
          resolve(`public/curriculum/module-1-lesson-4/image${image}.png`),
        ),
      ).not.toThrow();
    }

    for (const exactText of [
      "List the angles and sides of each triangle in order from smallest to largest.",
      "In △ABC, segment AY bisects ∠A, segment BX bisects ∠B, and Q is the intersection of segments AY and BX.",
      "Compare m∠BAY and m∠ABX. Justify your reasoning.",
      "Cynda claims that segment XC ≅ segment YC if BC > AC.",
      "which side of △ABQ has the greatest length?",
      "Give a possible measure for segment AB in △ABC shown. Explain your reasoning.",
      "∠1, ∠5, ∠6",
      "∠8, ∠10, ∠11",
      "∠ABD, ∠BDA",
      "∠DBF, ∠BFD",
      "SM, MR",
      "RM, RQ",
    ])
      expect(source).toContain(exactText);

    const listedResponses = new Map<number, string>([
      [22, "∠1, ∠5, ∠6"],
      [23, "∠2, ∠4, ∠6"],
      [24, "∠7, ∠4, ∠5"],
      [25, "∠3, ∠11, ∠12"],
      [26, "∠3, ∠9, ∠14"],
      [27, "∠8, ∠10, ∠11"],
      [28, "∠ABD, ∠BDA"],
      [29, "∠BCF, ∠CFB"],
      [30, "∠BFD, ∠BDF"],
      [31, "∠DBF, ∠BFD"],
      [32, "SM, MR"],
      [33, "RP, MP"],
      [34, "RQ, PQ"],
      [35, "RM, RQ"],
    ]);
    for (const [problem, response] of listedResponses)
      expect(problemBody(problem)).toContain(response);

    for (const instruction of [
      "Use the figure at the right to determine which angle has the greatest measure.",
      "Use the figure at the right to determine the relationship between the measures of the given angles.",
      "Use the figure at the right to determine the relationship between the given lengths.",
    ])
      expect(source).toContain(instruction);

    expect(source).not.toMatch(/^### Solution$/m);
    expect(source).not.toContain("Triangle Inequality Theorem");
    for (const syntheticText of [
      "35, 65, and 80 degrees",
      "AB = 7 cm, BC = 9 cm, and CA = 5 cm",
      "Triangle DEF has angles D = 50 degrees",
      "AB = 300 m, BC = 500 m, and CA = 400 m",
    ])
      expect(source).not.toContain(syntheticText);

    const sourceHeadings = [...source.matchAll(/^## (.+)$/gm)];
    const sourceSections = sourceHeadings.map((match, index) => ({
      title: match[1],
      markdown: source
        .slice(
          (match.index ?? 0) + match[0].length,
          sourceHeadings[index + 1]?.index ?? source.length,
        )
        .trim(),
    }));
    const bundledLesson = lessons.find(
      (lesson) => lesson.slug === "module-1-lesson-4",
    );
    expect(bundledLesson).toBeDefined();
    expect(
      bundledLesson?.phases.map(({ title, markdown }) => ({
        title,
        markdown,
      })),
    ).toEqual(sourceSections);
  });

  it("maps the combined Lesson 1-4 ordering prompts to two inactive atomic skills", () => {
    const source = readFileSync(
      resolve("curriculum/modules/module-1-lesson-4"),
      "utf8",
    );
    expect([...source.matchAll(/^## Examples?[^\n]*$/gm)].map((match) => match[0])).toEqual([
      "## Example 1",
      "## Examples 2 and 3",
      "## Example 4",
    ]);
    expect(source).not.toMatch(/^## Example [23]$/m);
    const combined = source.slice(
      source.indexOf("## Examples 2 and 3"),
      source.indexOf("## Example 4"),
    );
    expect(combined).toContain(
      "List the angles and sides of each triangle in order from smallest to largest.",
    );
    for (const problem of [6, 7, 8, 9, 10, 11])
      expect(combined.match(new RegExp(`^### Problem ${problem}$`, "gm"))).toHaveLength(1);
    for (const input of [
      "TR 48 centimeters, TS 35 centimeters, and RS 23.7 centimeters",
      "AB 3.8, AC 4.0, and BC 4.3",
      "PR 12, RQ 18, and PQ 20",
    ])
      expect(combined).toContain(input);
    for (const input of [
      "R 60 degrees, S 80 degrees, and T 40 degrees",
      "C 35 degrees, D 120 degrees, and E 25 degrees",
      "S 60 degrees and T 54 degrees",
    ])
      expect(combined).toContain(input);

    for (const [id, title, description, rationale] of [
      [
        anglesFromSidesId,
        "Order triangle angles from side lengths",
        "Use the side-angle relationship to order the angles of a triangle when three side lengths are given.",
        "Lesson 1-4 Problems 6, 8, and 11 give three side lengths and ask the learner to order the opposite angles.",
      ],
      [
        sidesFromAnglesId,
        "Order triangle sides from angle measures",
        "Use the side-angle relationship to order the sides of a triangle when angle measures are given.",
        "Lesson 1-4 Problems 7, 9, and 10 give angle measures and ask the learner to order the opposite sides.",
      ],
    ] as const) {
      const copies = [inventory.nodes, draft.nodes, graph.nodes].map((nodes) =>
        nodes.filter((node) => node.id === id),
      );
      expect(copies.every((matches) => matches.length === 1)).toBe(true);
      expect(copies[0][0]).toMatchObject({
        id,
        kind: "skill",
        title,
        description,
        sourceRefs: [lesson14Source],
        reviewStatus: "draft",
        metadata: { course: "im2", module: "1", lesson: "4" },
      });
      expect(copies[1][0]).toEqual(copies[0][0]);
      expect(copies[2][0]).toEqual(copies[0][0]);

      const blueprint = blueprints.blueprints.find((item) => item.nodeId === id);
      expect(blueprint).toMatchObject({
        sourceNodeIds: [],
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
      expect(blueprint?.exceptions).toEqual([{
        type: "generator",
        reason: "Generator not yet implemented for this source capability",
      }]);

      const incident = graph.edges.filter(
        (edge) => edge.sourceId === id || edge.targetId === id,
      );
      expect(incident).toHaveLength(1);
      expect(incident[0]).toMatchObject({
        type: "contains",
        sourceId: "math.im2.lesson.1.4",
        targetId: id,
        reviewStatus: "draft",
        derived: false,
        rationale,
        sourceRefs: [lesson14Source],
      });
      expect(JSON.stringify(incident)).not.toMatch(/math\.im2\.example\.1\.4\.01[45]/);

      expect(teacher.skills.find((item) => item.nodeId === id)).toMatchObject({
        standardsCoverage: { alignedStandards: [], hasStandardsGap: true },
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
        objectiveDomain: "math.im2",
      });
      expect(
        activityMap.activities.some((item: { nodeId: string }) => item.nodeId === id),
      ).toBe(false);
    }

    const legacy1g =
      "math.im2.skill.1.4.order-angles-and-sides-of-a-triangle-from-smallest-to-larges";
    const supplementary1h =
      "math.im2.skill.1.4.apply-triangle-inequality-relationships-in-proofs-and-real-w";
    for (const nodes of [inventory.nodes, draft.nodes, graph.nodes]) {
      expect(getNode(nodes as { id: string }[], legacy1g)).toMatchObject({
        kind: "skill",
        reviewStatus: "draft",
        metadata: { taxonomyRole: "legacy_objective_aggregator" },
      });
      expect(getNode(nodes as { id: string }[], supplementary1h)).toMatchObject({
        kind: "skill",
        reviewStatus: "draft",
      });
    }
    const exampleIds = ["013", "014", "015", "016"].map(
      (suffix) => `math.im2.example.1.4.${suffix}`,
    );
    for (const exampleId of exampleIds)
      for (const nodes of [inventory.nodes, draft.nodes, graph.nodes])
        expect(nodes.filter((node) => node.id === exampleId)).toEqual([
          expect.objectContaining({
            id: exampleId,
            kind: "worked_example",
            reviewStatus: "draft",
          }),
        ]);

    const preservedIds = new Set([...exampleIds, legacy1g, supplementary1h]);
    expect(
      graph.edges
        .filter((edge) => preservedIds.has(edge.sourceId) || preservedIds.has(edge.targetId))
        .map((edge) => edge.id),
    ).toEqual([
      "math.alignment.im2-example-1-4-013-to-ccss-g-co-b-7",
      "math.alignment.im2-example-1-4-014-to-ccss-g-co-b-7",
      "math.alignment.im2-example-1-4-015-to-ccss-g-co-b-7",
      "math.alignment.im2-example-1-4-016-to-ccss-g-co-b-7",
      "math.alignment.im2-skill-1-4-apply-triangle-inequality-relationships-in-proofs-and-real-w-to-ccss-g-co-b-7",
      "math.alignment.im2-skill-1-4-order-angles-and-sides-of-a-triangle-from-smallest-to-larges-to-ccss-g-co-b-7",
      "math.im2.edge.0013",
      "math.im2.edge.0014",
      "math.im2.edge.0015",
      "math.im2.edge.0016",
      "math.im2.edge.0407",
      "math.im2.edge.0408",
      "math.im2.edge.0581",
      "math.im2.edge.0582",
      "math.im2.edge.0583",
      "math.im2.edge.0584",
      "math.im2.edge.0585",
      "math.im2.edge.0586",
    ]);
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
    expect(graph.meta.totalNodes).toBe(graph.nodes.length);
    expect(graph.meta.totalEdges).toBe(graph.edges.length);
  });
});
