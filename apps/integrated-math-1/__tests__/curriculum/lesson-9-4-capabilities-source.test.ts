import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../curriculum/skill-graph");
const read = (name: string) =>
  JSON.parse(readFileSync(resolve(root, name), "utf8"));
const catalogs = [
  "nodes.json",
  "draft-nodes.json",
  "edges.json",
  "standard-edges.json",
].map(read);
const graph = read("edges.json");
const blueprints = read("blueprints.json").blueprints;
const projection = read("projection/practice-v1-activity-map.json");
const srs = read("projection/srs-input.json").srsInputs;
const gaps = read("generator-gap-queue.json");
const matrix = read("im1-coverage-matrix.json");
const queue = read("edge-review-queue.json");
const lesson = "math.im1.lesson.9.4";
const doc =
  "apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0904_practice.docx";
const definitions = [
  ["calculate-the-range-of-a-data-set", "Problems 1-5; Mixed Exercises, Problems 25 and 26; Problem 29, range calculation only", ["math.im1.example.9.4.011"]],
  ["determine-the-five-number-summary-of-a-data-set", "Problems 6-10; Mixed Exercises, Problems 23(a), 24(a), 25, and 26; Problem 29, five-number-summary calculation only", ["math.im1.example.9.4.012"]],
  ["construct-a-box-plot-from-a-five-number-summary", "Problems 6-10; Mixed Exercises, Problems 23(b), 24(b), 25, and 26; Problem 29, box-plot construction only", ["math.im1.example.9.4.012"]],
  ["calculate-the-interquartile-range-of-a-data-set", "Problems 11-15; Mixed Exercises, Problems 25 and 26; Problem 29, interquartile-range calculation only", ["math.im1.example.9.4.013"]],
  ["calculate-standard-deviation-under-a-stated-divisor-convention", "Problems 16-22; Mixed Exercises, Problems 25 and 26; Problem 29, standard-deviation calculation only", ["math.im1.example.9.4.014"]],
  ["interpret-standard-deviation-in-context", "Mixed Exercises, Problems 21 and 22, interpretation response only", []],
  ["evaluate-outlier-removal-as-a-way-to-decrease-standard-deviation", "Mixed Exercises, Problem 27, Jennifer response only; manual rubric required", []],
  ["evaluate-adding-mean-values-as-a-way-to-decrease-standard-deviation", "Mixed Exercises, Problem 27, Megan response only; manual rubric required", []],
  ["evaluate-variability-of-statistics-across-random-samples", "Mixed Exercises, Problem 28; manual rubric required", []],
  ["explain-interquartile-range-as-middle-half-spread", "Mixed Exercises, Problem 30; manual rubric required", []],
] as const;
const ids = definitions.map(([slug]) => `math.im1.skill.9.4.${slug}`);
const aggregates = [
  "math.im1.skill.9.4.calculate-the-range-interquartile-range-and-standard-deviati",
  "math.im1.skill.9.4.determine-the-five-number-summary-and-construct-a-box-plot-f",
];

describe("Lesson 9-4 capability inventory", () => {
  it("keeps four exact and distinct source identities", () => {
    const sourceGroups = [
      ["011", "Example 1: Find the range", "Example 1, Problems 1-5"],
      ["012", "Example 2: Determine a five-number summary and construct a box plot", "Example 2, Problems 6-10"],
      ["013", "Example 3: Find the interquartile range", "Example 3, Problems 11-15"],
      ["014", "Example 4: Find the standard deviation", "Example 4, Problems 16-20"],
    ];
    for (const [suffix, title, scope] of sourceGroups) {
      const id = `math.im1.example.9.4.${suffix}`;
      for (const catalog of catalogs)
        expect(catalog.nodes.find((node: any) => node.id === id)).toMatchObject({
          title,
          sourceRefs: [doc, `${doc} (${scope})`],
          reviewStatus: "draft",
          independentPracticeReady: false,
        });
    }
  });

  it.each(definitions)("adds exact draft source-only capability %s", (slug, scope, sourceNodeIds) => {
    const id = `math.im1.skill.9.4.${slug}`;
    const canonical = catalogs[0].nodes.find((node: any) => node.id === id);
    expect(canonical).toMatchObject({
      sourceRefs: [doc, `${doc} (${scope})`],
      reviewStatus: "draft",
      independentPracticeReady: false,
    });
    for (const catalog of catalogs)
      expect(catalog.nodes.find((node: any) => node.id === id)).toEqual(canonical);
    expect(blueprints.find((row: any) => row.nodeId === id)).toEqual({
      nodeId: id,
      sourceNodeIds,
      alignmentNodeIds: [],
      reviewStatus: "draft",
      metadata: { course: "im1", module: "9", lesson: "4" },
    });
    expect(
      graph.edges.filter((edge: any) => edge.sourceId === id || edge.targetId === id),
    ).toEqual([
      expect.objectContaining({ sourceId: lesson, targetId: id, type: "contains" }),
      ...(slug === "determine-the-five-number-summary-of-a-data-set"
        ? [expect.objectContaining({
            sourceId: "math.im1.skill.9.1.determine-the-median-of-a-data-set",
            targetId: id,
            type: "prerequisite",
          })]
        : []),
    ]);
  });

  it("keeps aggregates inactive and removes only the stale edge queue row", () => {
    for (const id of aggregates) {
      expect(blueprints.find((row: any) => row.nodeId === id)).not.toHaveProperty("workedExampleSpec");
      expect(projection.activities.filter((row: any) => row.nodeId === id)).toHaveLength(0);
    }
    expect(queue.lowConfidencePrerequisites.some((row: any) => row.edgeId === "math.im1.edge.1273")).toBe(false);
    expect(queue.counts.lowConfidencePrerequisites).toBe(queue.lowConfidencePrerequisites.length);
  });

  it("keeps all ten candidates inactive in each derived inventory", () => {
    for (const id of ids) {
      expect(projection.activities.some((row: any) => row.nodeId === id)).toBe(false);
      expect(projection.srsInputs.find((row: any) => row.nodeId === id)).toMatchObject({ generatorReady: false });
      expect(srs.find((row: any) => row.nodeId === id)).toEqual(projection.srsInputs.find((row: any) => row.nodeId === id));
      expect(gaps.queue.some((row: any) => row.nodeId === id)).toBe(true);
      expect(matrix.skills.some((row: any) => row.skillId === id && row.status === "gap")).toBe(true);
    }
  });
});
