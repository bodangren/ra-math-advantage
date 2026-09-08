import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
const g = resolve(import.meta.dirname, "../../curriculum/skill-graph");
const read = (p: string) => JSON.parse(readFileSync(resolve(g, p), "utf8"));
const cats = [
  "nodes.json",
  "draft-nodes.json",
  "edges.json",
  "standard-edges.json",
].map(read);
const bp = read("blueprints.json").blueprints,
  edges = cats[2].edges,
  map = read("projection/practice-v1-activity-map.json"),
  srs = read("projection/srs-input.json").srsInputs,
  teacher = read("projection/teacher-evidence-map.json"),
  gaps = read("generator-gap-queue.json"),
  matrix = read("im1-coverage-matrix.json");
const lesson = "math.im1.lesson.10.3",
  ex = "math.im1.example.10.3.028",
  S =
    "math.im1.skill.10.3.apply-the-segment-addition-postulate-to-find-missing-segment",
  C0 =
    "math.im1.skill.10.3.find-the-length-of-a-segment-by-reading-coordinates-from-a-n",
  L23 =
    "math.im1.skill.2.3.solve-multi-step-linear-equations-using-properties-of-equali",
  L24 =
    "math.im1.skill.2.4.solve-linear-equations-that-have-the-variable-on-both-sides",
  L74 = "math.im1.skill.7.4.solve-one-solution-systems-by-scaled-elimination";
const defs = [
  [
    "use-congruent-subsegments-equal-spacing-or-a-midpoint-to-determine-segment-measures",
    "Problems 28–33, 37, 40, 41, and 45",
  ],
  [
    "write-a-segment-addition-equation-or-statement-from-betweenness",
    "Problems 39, 46, 50, and 51",
  ],
  [
    "solve-a-segment-addition-equation-with-quadratic-expressions-and-reject-a-negative-length-root",
    "Problem 47 only",
  ],
  [
    "classify-and-justify-a-part-whole-segment-inequality-from-betweenness",
    "Problem 48 only",
  ],
  ["model-two-segment-constraints-as-a-linear-system", "Problem 49 only"],
].map(([x, r]) => [`math.im1.skill.10.3.${x}`, r]);
describe("Lesson 10-3 capability graph", () => {
  it("preserves sources and adds exact Example 5", () => {
    for (const c of cats) {
      expect(c.nodes.find((x: any) => x.id === ex)).toMatchObject({
        reviewStatus: "draft",
        independentPracticeReady: false,
      });
      for (const id of ["008", "009"])
        expect(
          c.nodes
            .find((x: any) => x.id === `math.im1.example.10.3.${id}`)
            .sourceRefs.join(" "),
        ).toContain("Examples 1 and 2, Problems 1–9");
    }
    expect(bp.some((x: any) => x.nodeId === ex)).toBe(false);
  });
  it("adds five inactive atoms with exact response boundaries", () => {
    for (const [id, ref] of defs) {
      for (const c of cats)
        expect(c.nodes.find((x: any) => x.id === id)).toMatchObject({
          reviewStatus: "draft",
          independentPracticeReady: false,
        });
      expect(
        cats[0].nodes.find((x: any) => x.id === id).sourceRefs.join(" "),
      ).toContain(ref);
      expect(
        edges.filter(
          (x: any) =>
            x.type === "contains" && x.sourceId === lesson && x.targetId === id,
        ),
      ).toHaveLength(1);
      expect(bp.find((x: any) => x.nodeId === id)).toEqual(
        expect.objectContaining({
          sourceNodeIds: id.endsWith(
            "use-congruent-subsegments-equal-spacing-or-a-midpoint-to-determine-segment-measures",
          )
            ? [ex, lesson]
            : [lesson],
          alignmentNodeIds: [],
          reviewStatus: "draft",
        }),
      );
      expect(map.activities.filter((x: any) => x.nodeId === id)).toEqual([]);
    }
  });
  it("reuses exact stages without skill IDs as sources", () => {
    for (const [id, ref] of [
      [S, "Problems 1–28, 31, 33–36, 38, and 41–47"],
      [L23, "Problems 10, 13, 17, 22, 23, 35, 37, and 42"],
      [L24, "Problems 12, 15, 16, 18, 19, 27a, 32, 33, 36, 43, and 45"],
      [
        L74,
        "Problem 49 only after both segment constraints are supplied or accepted",
      ],
    ])
      expect(
        cats[0].nodes.find((x: any) => x.id === id).sourceRefs.join(" "),
      ).toContain(ref);
    for (const id of [S, L23, L24, L74, ...defs.map((x) => x[0])])
      expect(
        bp
          .find((x: any) => x.nodeId === id)
          .sourceNodeIds.every((x: string) => !x.includes(".skill.")),
      ).toBe(true);
    expect(cats[0].nodes.find((x: any) => x.id === L74).reviewStatus).toBe(
      "draft",
    );
    for (const id of [L23, L24]) {
      expect(
        cats[0].nodes
          .find((x: any) => x.id === id)
          .sourceRefs.slice(-2)
          .every((ref: string) =>
            ref.includes(
              "accepted equation stage must be observed separately from the final segment length",
            ),
          ),
      ).toBe(true);
    }
  });
  it("removes only reviewed placeholders and sequence edge", () => {
    for (const id of [S, C0, L23, L24]) {
      const b = bp.find((x: any) => x.nodeId === id);
      for (const k of [
        "workedExampleSpec",
        "guidedPracticeSpec",
        "independentPracticeSpec",
      ])
        expect(b).not.toHaveProperty(k);
      expect(map.activities.filter((x: any) => x.nodeId === id)).toEqual([]);
    }
    for (const source of [
      ...["008", "009", "010", "011"].map((x) => `math.im1.example.10.3.${x}`),
      S,
      C0,
    ])
      for (const standard of [
        "math.standard.ccss.g-co-a-2",
        "math.standard.ccss.g-gpe-b-4",
      ])
        expect(
          edges.some(
            (x: any) =>
              x.type === "aligned_to_standard" &&
              x.sourceId === source &&
              x.targetId === standard,
          ),
        ).toBe(false);
    expect(edges.some((x: any) => x.id === "math.im1.edge.1193")).toBe(false);
    expect(edges.some((x: any) => x.id === "math.im1.edge.1194")).toBe(true);
  });
  it("keeps affected projections and counts consistent", () => {
    for (const id of [S, L23, L24, L74, ...defs.map((x) => x[0])]) {
      expect(map.srsInputs.find((x: any) => x.nodeId === id)).toEqual(
        srs.find((x: any) => x.nodeId === id),
      );
      expect(
        map.teacherEvidence.skills.find((x: any) => x.nodeId === id),
      ).toEqual(teacher.skills.find((x: any) => x.nodeId === id));
    }
    expect(map.metadata.totalActivities).toBe(map.activities.length);
    expect(gaps.meta.totalSkills).toBe(gaps.queue.length);
    expect(matrix.totalSkills).toBe(matrix.skills.length);
  });
});
