import { describe, expect, it } from "vitest";
import graph from "../../curriculum/skill-graph/edges.json";
import standalone from "../../curriculum/skill-graph/projection/srs-input.json";
import activityMap from "../../curriculum/skill-graph/projection/practice-v1-activity-map.json";

const pair = (sourceId: string, targetId: string) => `${sourceId} -> ${targetId}`;
const canonicalPairs = new Set(
  graph.edges
    .filter((edge) => edge.reviewStatus !== "rejected" && (edge.type === "prerequisite_for" || edge.type === "prerequisite"))
    .map((edge) => pair(edge.sourceId, edge.targetId)),
);
const projectionPairs = (rows: typeof standalone.srsInputs) => new Set(
  rows.flatMap((row) => row.prerequisites.map((sourceId) => pair(sourceId, row.nodeId))),
);
const stalePairs = [
  ["math.im1.skill.2.7.solve-literal-equations-and-formulas-for-a-specified-variabl", "math.im1.skill.3.1.express-a-relation-as-a-table-a-graph-a-mapping-and-a-set-of"],
  ["math.im1.skill.3.1.express-a-relation-as-a-table-a-graph-a-mapping-and-a-set-of", "math.im1.skill.3.2.determine-whether-a-relation-represented-as-a-graph-table-ma"],
  ["math.im1.skill.3.2.determine-whether-a-relation-represented-as-a-graph-table-ma", "math.im1.skill.3.3.determine-whether-a-function-represented-by-a-graph-equation"],
  ["math.im1.skill.3.3.determine-whether-a-function-represented-by-a-graph-equation", "math.im1.skill.3.4.estimate-and-interpret-the-x-and-y-intercepts-of-a-function"],
  ["math.im1.skill.3.4.estimate-and-interpret-the-x-and-y-intercepts-of-a-function", "math.im1.skill.3.5.identify-line-symmetry-in-the-graph-of-a-function-and-determ"],
  ["math.im1.skill.3.5.identify-line-symmetry-in-the-graph-of-a-function-and-determ", "math.im1.skill.3.6.sketch-graphs-of-real-world-functions-from-verbal-descriptio"],
  ["math.im1.skill.3.6.sketch-graphs-of-real-world-functions-from-verbal-descriptio", "math.im1.skill.4.1.graph-linear-equations-by-making-a-table-of-values-and-by-fi"],
  ["math.im1.skill.8.6.find-the-first-several-terms-of-a-sequence-given-a-recursive", "math.im1.skill.9.1.calculate-the-mean-median-and-mode-of-a-data-set"],
  ["math.im1.skill.9.1.calculate-the-mean-median-and-mode-of-a-data-set", "math.im1.skill.9.2.analyze-data-displays-to-draw-conclusions-and-answer-questio"],
  ["math.im1.skill.9.2.construct-dot-plots-bar-graphs-and-histograms-to-represent-d", "math.im1.skill.9.3.identify-sample-bias-in-survey-and-sampling-methods-and-expl"],
  ["math.im1.skill.9.3.recognize-biased-survey-questions-and-identify-whose-interes", "math.im1.skill.9.4.calculate-the-range-interquartile-range-and-standard-deviati"],
  ["math.im1.skill.9.4.determine-the-five-number-summary-and-construct-a-box-plot-f", "math.im1.skill.9.5.choose-appropriate-measures-of-center-and-spread-based-on-wh"],
  ["math.im1.skill.9.5.construct-and-interpret-histograms-and-box-plots-to-visualiz", "math.im1.skill.9.6.construct-and-interpret-box-plots-and-histograms-to-compare"],
  ["math.im1.skill.9.6.describe-how-adding-or-multiplying-every-value-in-a-data-set", "math.im1.skill.9.7.construct-and-complete-two-way-frequency-tables-from-verbal"],
].map(([sourceId, targetId]) => pair(sourceId, targetId));
const validPair = pair("math.im1.skill.9.1.determine-the-median-of-a-data-set", "math.im1.skill.9.4.determine-the-five-number-summary-of-a-data-set");

describe("projected prerequisite consistency", () => {
  it("keeps both projection copies equal to direct canonical relationships", () => {
    const first = projectionPairs(standalone.srsInputs);
    const second = projectionPairs(activityMap.srsInputs);
    expect(first).toEqual(second);
    expect(first).toEqual(canonicalPairs);
  });

  it("removes all stale sequence pairs and keeps the valid median relationship", () => {
    for (const pairs of [projectionPairs(standalone.srsInputs), projectionPairs(activityMap.srsInputs)]) {
      for (const stale of stalePairs) expect(pairs).not.toContain(stale);
      expect(pairs).toContain(validPair);
    }
    expect(graph.edges.filter((edge) => pair(edge.sourceId, edge.targetId) === validPair && edge.type === "prerequisite_for")).toHaveLength(1);
  });
});
