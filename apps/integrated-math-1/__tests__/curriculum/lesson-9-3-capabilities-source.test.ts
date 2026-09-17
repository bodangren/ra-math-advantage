import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const root = resolve(import.meta.dirname, "../../curriculum/skill-graph");
const read = (n: string) => JSON.parse(readFileSync(resolve(root, n), "utf8"));
const cats = [
  "nodes.json",
  "draft-nodes.json",
  "edges.json",
  "standard-edges.json",
].map(read);
const graph = read("edges.json"),
  bps = read("blueprints.json").blueprints,
  map = read("projection/practice-v1-activity-map.json"),
  srs = read("projection/srs-input.json").srsInputs,
  gaps = read("generator-gap-queue.json"),
  matrix = read("im1-coverage-matrix.json");
const doc =
    "apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0903_practice.docx",
  lesson = "math.im1.lesson.9.3";
const defs = [
  [
    "identify-the-intended-population-for-a-survey",
    "Problem 1, population response only",
    ["math.im1.example.9.3.008"],
  ],
  [
    "identify-sample-bias-in-a-sampling-method",
    "Problem 1, bias response only",
    ["math.im1.example.9.3.008"],
  ],
  [
    "design-an-unbiased-sampling-method",
    "Problem 2",
    ["math.im1.example.9.3.008"],
  ],
  [
    "identify-bias-in-survey-wording",
    "Problem 3(a); Mixed Exercises, Problem 19 question-bias evaluation only",
    ["math.im1.example.9.3.009"],
  ],
  [
    "identify-contextual-bias-around-a-survey",
    "Problem 4(a)",
    ["math.im1.example.9.3.009"],
  ],
  [
    "identify-who-benefits-from-survey-bias",
    "Problems 3(b) and 4(b)",
    ["math.im1.example.9.3.009"],
  ],
  [
    "select-a-measure-of-center-and-justify-the-selection",
    "Problem 5, selection response only; Problem 6, selection and justification",
    ["math.im1.example.9.3.010"],
  ],
  [
    "evaluate-graph-scale-misrepresentation",
    "Problem 7",
    ["math.im1.example.9.3.025"],
  ],
  [
    "explain-how-axis-scale-affects-a-data-display",
    "Problem 8",
    ["math.im1.example.9.3.025"],
  ],
  [
    "compare-sampling-frames-for-bias",
    "Mixed Exercises, Problems 9 and 22",
    [],
  ],
  [
    "explain-bias-from-selected-survey-information",
    "Mixed Exercises, Problem 10",
    [],
  ],
  [
    "evaluate-pictorial-graph-misrepresentation",
    "Mixed Exercises, Problem 12",
    [],
  ],
  [
    "predict-how-an-outlier-affects-measure-selection",
    "Mixed Exercises, Problem 13",
    [],
  ],
  [
    "evaluate-contextual-accuracy-of-a-rounded-statistic",
    "Mixed Exercises, Problem 14",
    [],
  ],
  [
    "describe-a-method-for-assessing-sample-bias",
    "Mixed Exercises, Problem 15",
    [],
  ],
  [
    "predict-the-mean-after-adding-a-constant-to-all-values",
    "Mixed Exercises, Problem 16, mean response only",
    [],
  ],
  [
    "predict-the-median-after-adding-a-constant-to-all-values",
    "Mixed Exercises, Problem 16, median response only",
    [],
  ],
  [
    "construct-a-biased-comparative-data-display",
    "Mixed Exercises, Problem 17; manual rubric required",
    [],
  ],
  [
    "create-a-scenario-with-sample-bias",
    "Mixed Exercises, Problem 18, two scenarios with different sample biases; manual rubric required",
    [],
  ],
  [
    "evaluate-when-a-biased-sample-can-be-valid",
    "Mixed Exercises, Problem 20; manual rubric required",
    [],
  ],
] as const;
const ids = defs.map(([s]) => `math.im1.skill.9.3.${s}`);
const aggs = [
  "math.im1.skill.9.3.identify-sample-bias-in-survey-and-sampling-methods-and-expl",
  "math.im1.skill.9.3.recognize-biased-survey-questions-and-identify-whose-interes",
];
const reuse = [
  "math.im1.skill.9.1.calculate-the-arithmetic-mean-of-a-data-set",
  "math.im1.skill.9.1.determine-the-median-of-a-data-set",
  "math.im1.skill.9.1.identify-all-modes-of-a-data-set",
];
describe("Lesson 9-3 capability inventory", () => {
  it("keeps four distinct draft source groups including new .025", () => {
    for (const [id, title, scope] of [
      [
        "math.im1.example.9.3.008",
        "Example 1: Identify sample bias and design an unbiased sample",
        "Example 1, Problems 1 and 2",
      ],
      [
        "math.im1.example.9.3.009",
        "Example 2: Identify wording and contextual survey bias",
        "Example 2, Problems 3 and 4",
      ],
      [
        "math.im1.example.9.3.010",
        "Example 3: Calculate and select measures of center",
        "Example 3, Problems 5 and 6",
      ],
      [
        "math.im1.example.9.3.025",
        "Example 4: Evaluate graph-scale misrepresentation",
        "Example 4, Problems 7 and 8",
      ],
    ])
      for (const c of cats)
        expect(c.nodes.find((n: any) => n.id === id)).toMatchObject({
          title,
          sourceRefs: [doc, `${doc} (${scope})`],
          reviewStatus: "draft",
          independentPracticeReady: false,
        });
  });
  it.each(defs)("adds exact source-only %s", (slug, scope, sources) => {
    const id = `math.im1.skill.9.3.${slug}`,
      n = cats[0].nodes.find((x: any) => x.id === id);
    expect(n).toMatchObject({
      sourceRefs: [doc, `${doc} (${scope})`],
      reviewStatus: "draft",
      independentPracticeReady: false,
    });
    for (const c of cats)
      expect(c.nodes.find((x: any) => x.id === id)).toEqual(n);
    expect(bps.find((x: any) => x.nodeId === id)).toEqual({
      nodeId: id,
      sourceNodeIds: sources,
      alignmentNodeIds: [],
      reviewStatus: "draft",
      metadata: { course: "im1", module: "9", lesson: "3" },
    });
    expect(
      graph.edges.filter((e: any) => (e.sourceId === id || e.targetId === id) && !e.id.startsWith("math.im1.g48.")),
    ).toEqual([
      expect.objectContaining({
        sourceId: lesson,
        targetId: id,
        type: "contains",
      }),
    ]);
  });
  it("keeps aggregates inactive, adds exact reuse, and removes lesson-order prerequisite", () => {
    for (const id of aggs) {
      expect(bps.find((x: any) => x.nodeId === id)).not.toHaveProperty(
        "workedExampleSpec",
      );
      expect(map.activities.filter((x: any) => x.nodeId === id)).toHaveLength(
        0,
      );
    }
    for (const id of reuse)
      expect(
        graph.edges.filter(
          (e: any) =>
            e.sourceId === lesson && e.targetId === id && e.type === "contains",
        ),
      ).toHaveLength(1);
    expect(graph.edges.some((e: any) => e.id === "math.im1.edge.1273")).toBe(
      false,
    );
  });
  it("keeps all new planning rows inactive", () => {
    for (const id of ids) {
      expect(map.activities.some((x: any) => x.nodeId === id)).toBe(false);
      expect(map.srsInputs.find((x: any) => x.nodeId === id)).toMatchObject({
        generatorReady: false,
      });
      expect(srs.find((x: any) => x.nodeId === id)).toEqual(
        map.srsInputs.find((x: any) => x.nodeId === id),
      );
      expect(gaps.queue.some((x: any) => x.nodeId === id)).toBe(true);
      expect(
        matrix.skills.some((x: any) => x.skillId === id && x.status === "gap"),
      ).toBe(true);
    }
  });
});
