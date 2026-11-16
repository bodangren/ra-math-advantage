import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../curriculum/skill-graph");
const read = (name: string) => JSON.parse(readFileSync(resolve(root, name), "utf8"));
const catalogs = ["nodes.json", "draft-nodes.json", "edges.json", "standard-edges.json"].map(read);
const graph = read("edges.json");
const blueprints = read("blueprints.json").blueprints;
const projection = read("projection/practice-v1-activity-map.json");
const srs = read("projection/srs-input.json").srsInputs;
const gaps = read("generator-gap-queue.json");
const matrix = read("im1-coverage-matrix.json");
const queue = read("edge-review-queue.json");
const lesson = "math.im1.lesson.9.5";
const doc = "apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0905_practice.docx";
const definitions = [
  ["group-raw-values-into-stated-histogram-intervals", "Problems 1-4, 9-12, 16(a), and 23(a), grouping stage only", ["015", "016"]],
  ["describe-distribution-shape-from-a-histogram", "Problems 1, 2, 9-12, 16(a), 19(b) for each curve, and 23(a), shape response only", ["015"]],
  ["describe-bounded-shape-features-from-a-box-plot", "Problems 13 and 18(a), shape response only", []],
  ["describe-distribution-center-from-a-box-plot", "Problem 17(a), original center description; Problem 17(b), new center description", []],
  ["describe-distribution-spread-from-a-box-plot", "Problem 17(a), original spread description; Problem 17(b), new spread description", []],
  ["select-a-measure-of-spread-and-justify-the-selection", "Problems 3-6, 7(b), 8(b), 14, 15, 16(b), 18(b), 20, and 23(b), spread-selection and justification response only", ["016", "017", "018"]],
  ["describe-an-outliers-effect-on-a-named-center-statistic", "Problems 7(c), 8(c), 18(c), and 23(c), center-statistic response only", ["018"]],
  ["describe-an-outliers-effect-on-a-named-spread-statistic", "Problems 7(c), 8(c), 18(c), and 23(c), spread-statistic response only", ["018"]],
  ["compare-distribution-centers-using-given-evidence", "Problem 17(c), two center comparisons; Problems 19(a), 20, and 22, center claims", []],
  ["compare-distribution-spreads-using-given-evidence", "Problems 19(a), 20, and 22, spread claims", []],
  ["describe-a-distribution-from-partial-frequency-and-extreme-value-information", "Problem 21, current-distribution description; manual rubric required", []],
  ["describe-the-effect-of-removing-extreme-values-on-a-distribution", "Problem 21, effect of losing the longest streams; manual rubric required", []],
  ["match-histograms-and-box-plots-by-distribution-features", "Problem 24, three labeled matches; manual justification required", []],
  ["define-a-bimodal-distribution-using-researched-sources", "Problem 25, research and definition response; manual review required", []],
  ["describe-center-and-spread-for-a-bimodal-distribution", "Problem 25, statistical-description response; manual rubric required", []],
  ["create-a-real-world-data-example-with-a-stated-distribution-shape", "Problem 26, two examples with separate evidence records; manual rubric required", []],
  ["explain-when-mean-and-standard-deviation-suit-a-symmetrical-distribution", "Problem 27, symmetrical-distribution explanation; manual bounded rubric required", []],
  ["explain-why-median-and-quartiles-help-describe-a-skewed-distribution", "Problem 27, five-number-summary explanation; manual bounded rubric required", []],
] as const;
const ids = definitions.map(([slug]) => `math.im1.skill.9.5.${slug}`);
const aggregates = [
  "math.im1.skill.9.5.construct-and-interpret-histograms-and-box-plots-to-visualiz",
  "math.im1.skill.9.5.choose-appropriate-measures-of-center-and-spread-based-on-wh",
];

describe("Lesson 9-5 capability inventory", () => {
  it("restores four distinct draft source headings", () => {
    const sources = [
      ["015", "Example 1", "Example 1, Problems 1 and 2", "Construct a histogram and a box plot. Describe the distribution shape."],
      ["016", "Example 2", "Example 2, Problems 3 and 4", "Select and calculate center and spread statistics. Justify the selection with a histogram."],
      ["017", "Example 3", "Example 3, Problems 5 and 6", "Select and calculate center and spread statistics. Justify the selection with a box plot."],
      ["018", "Example 4", "Example 4, Problems 7 and 8", "Construct a box plot. Calculate representative statistics. Describe the outlier effect."],
    ];
    for (const [suffix, title, scope, description] of sources) {
      const id = `math.im1.example.9.5.${suffix}`;
      for (const catalog of catalogs)
        expect(catalog.nodes.find((node: any) => node.id === id)).toMatchObject({
          title,
          description,
          sourceRefs: [doc, `${doc} (${scope})`],
          reviewStatus: "draft",
          independentPracticeReady: false,
        });
    }
  });

  it.each(definitions)("adds exact draft source-only capability %s", (slug, scope, sourceSuffixes) => {
    const id = `math.im1.skill.9.5.${slug}`;
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
      sourceNodeIds: sourceSuffixes.map((suffix) => `math.im1.example.9.5.${suffix}`),
      alignmentNodeIds: [],
      reviewStatus: "draft",
      metadata: { course: "im1", module: "9", lesson: "5" },
    });
    expect(graph.edges.filter((edge: any) => edge.sourceId === id || edge.targetId === id))
      .toEqual([expect.objectContaining({ sourceId: lesson, targetId: id, type: "contains" })]);
  });

  it("records only the seven accepted exact prior reuses", () => {
    const expected = [
      "math.im1.skill.9.1.calculate-the-arithmetic-mean-of-a-data-set",
      "math.im1.skill.9.1.determine-the-median-of-a-data-set",
      "math.im1.skill.9.3.select-a-measure-of-center-and-justify-the-selection",
      "math.im1.skill.9.4.determine-the-five-number-summary-of-a-data-set",
      "math.im1.skill.9.4.construct-a-box-plot-from-a-five-number-summary",
      "math.im1.skill.9.4.calculate-standard-deviation-under-a-stated-divisor-convention",
      "math.im1.skill.9.2.construct-a-histogram-from-grouped-frequencies",
    ];
    expect(graph.edges.filter((edge: any) => edge.id.startsWith("math.im1.g48.contains.reuse-")).map((edge: any) => edge.targetId)).toEqual(expected);
    expect(graph.edges.some((edge: any) => edge.id.startsWith("math.im1.g48") && [
      "math.im1.skill.9.4.calculate-the-range-of-a-data-set",
      "math.im1.skill.9.4.calculate-the-interquartile-range-of-a-data-set",
    ].includes(edge.targetId))).toBe(false);
  });

  it("keeps all candidates and legacy aggregates inactive", () => {
    for (const id of aggregates) {
      for (const catalog of catalogs)
        expect(catalog.nodes.find((row: any) => row.id === id)).toMatchObject({ reviewStatus: "draft", independentPracticeReady: false });
      expect(blueprints.find((row: any) => row.nodeId === id)).not.toHaveProperty("workedExampleSpec");
    }
    for (const id of [...ids, ...aggregates]) {
      expect(projection.activities.some((row: any) => row.nodeId === id)).toBe(false);
    }
    for (const id of ids) {
      expect(projection.srsInputs.find((row: any) => row.nodeId === id)).toMatchObject({ generatorReady: false });
      expect(srs.find((row: any) => row.nodeId === id)).toEqual(projection.srsInputs.find((row: any) => row.nodeId === id));
      expect(gaps.queue.some((row: any) => row.nodeId === id)).toBe(true);
      expect(matrix.skills.some((row: any) => row.skillId === id && row.status === "gap")).toBe(true);
    }
  });

  it("removes unsupported lesson-sequence edges and preserves manual boundaries", () => {
    expect(graph.edges.some((edge: any) => ["math.im1.edge.1274", "math.im1.edge.1275"].includes(edge.id))).toBe(false);
    expect(queue.lowConfidencePrerequisites.some((row: any) => ["math.im1.edge.1274", "math.im1.edge.1275"].includes(row.edgeId))).toBe(false);
    expect(queue.counts.lowConfidencePrerequisites).toBe(queue.lowConfidencePrerequisites.length);
    for (const slug of [
      "describe-a-distribution-from-partial-frequency-and-extreme-value-information",
      "define-a-bimodal-distribution-using-researched-sources",
      "create-a-real-world-data-example-with-a-stated-distribution-shape",
    ]) {
      const edge = graph.edges.find((row: any) => row.targetId === `math.im1.skill.9.5.${slug}`);
      expect(edge.rationale).toContain("manual");
    }
    for (const slug of [
      "compare-distribution-centers-using-given-evidence",
      "compare-distribution-spreads-using-given-evidence",
    ]) {
      const edge = graph.edges.find((row: any) => row.targetId === `math.im1.skill.9.5.${slug}`);
      expect(edge.rationale).toContain("Problems 19 and 22 require manual claim-and-evidence review");
      expect(edge.rationale).toContain("Problem 20 can use separately calculated statistics");
    }
  });
});
