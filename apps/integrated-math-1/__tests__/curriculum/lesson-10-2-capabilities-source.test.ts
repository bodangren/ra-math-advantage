import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { projectTeacherEvidence } from "@math-platform/knowledge-space-practice";
const graph = resolve(import.meta.dirname, "../../curriculum/skill-graph");
const read = (p: string) => JSON.parse(readFileSync(resolve(graph, p), "utf8"));
const nodes = read("nodes.json").nodes,
  draft = read("draft-nodes.json").nodes,
  edges = read("edges.json").edges,
  std = read("standard-edges.json").edges,
  bp = read("blueprints.json").blueprints;
const map = read("projection/practice-v1-activity-map.json"),
  srs = read("projection/srs-input.json").srsInputs,
  teacher = read("projection/teacher-evidence-map.json");
const identify =
  "math.im1.skill.10.2.identify-and-name-points-lines-and-planes-from-geometric-fig";
const draw =
  "math.im1.skill.10.2.draw-and-label-figures-that-accurately-represent-given-geome";
const postulate =
  "math.im1.skill.12.4.apply-geometric-postulates-about-points-lines-and-planes-to";
const maximum =
  "math.im1.skill.10.2.determine-the-maximum-number-of-distinct-lines-or-planes-formed-by-point-subsets";
const examples = ["003", "004", "005", "006", "007"].map(
  (n) => `math.im1.example.10.2.${n}`,
);
const alignments = [
  ...["003", "004", "005", "006", "007"].map(
    (n) => `math.alignment.im1-example-10-2-${n}-to-ccss-g-co-a-2`,
  ),
  "math.alignment.im1-skill-10-2-draw-and-label-figures-that-accurately-represent-given-geome-to-ccss-g-co-a-2",
  "math.alignment.im1-skill-10-2-identify-and-name-points-lines-and-planes-from-geometric-fig-to-ccss-g-co-a-2",
  "math.alignment.im1-skill-12-4-apply-geometric-postulates-about-points-lines-and-planes-to-to-ccss-g-co-a-4",
];
describe("Lesson 10-2 capability graph", () => {
  it("adds one inactive atom and preserves three approved reuses", () => {
    for (const cat of [nodes, draft])
      expect(cat.find((x: any) => x.id === maximum)).toMatchObject({
        reviewStatus: "draft",
        independentPracticeReady: false,
      });
    for (const id of [identify, draw, postulate])
      expect(nodes.find((x: any) => x.id === id).reviewStatus).toBe("approved");
  });
  it("records separate line and plane evidence without a prerequisite", () => {
    const n = nodes.find((x: any) => x.id === maximum);
    expect(n.sourceRefs.join(" ")).toContain(
      "Problem 47: line count and required double-counting explanation",
    );
    expect(n.sourceRefs.join(" ")).toContain(
      "Problem 48: maximum plane count only",
    );
    expect(
      edges.filter(
        (x: any) => x.type === "prerequisite_for" && x.targetId === maximum,
      ),
    ).toEqual([]);
    expect(srs.find((x: any) => x.nodeId === maximum).prerequisites).toEqual(
      [],
    );
    expect(
      edges.filter((x: any) => x.type === "contains" && x.targetId === maximum),
    ).toHaveLength(1);
    expect(
      edges.filter(
        (x: any) =>
          x.type === "contains" &&
          x.sourceId === "math.im1.lesson.10.2" &&
          x.targetId === postulate,
      ),
    ).toHaveLength(1);
  });
  it("binds exact source groups and removes only touched placeholders", () => {
    expect(bp.find((x: any) => x.nodeId === identify).sourceNodeIds).toEqual([
      examples[0],
      examples[1],
      examples[3],
      examples[4],
      "math.im1.lesson.10.2",
    ]);
    expect(bp.find((x: any) => x.nodeId === draw).sourceNodeIds).toEqual([
      examples[2],
      "math.im1.lesson.10.2",
    ]);
    expect(bp.find((x: any) => x.nodeId === postulate).sourceNodeIds).toContain(
      "math.im1.lesson.10.2",
    );
    const sourceBoundaries = new Map([
      [identify, "Problems 1–19, 25–31, 35–38, and 43–44"],
      [draw, "Problems 20–24, 32–34, 39–42, 45, and 50"],
      [postulate, "Problem 46 only"],
    ]);
    for (const catalog of [
      nodes,
      draft,
      read("edges.json").nodes,
      read("standard-edges.json").nodes,
    ]) {
      for (const [id, boundary] of sourceBoundaries) {
        expect(
          catalog.find((x: any) => x.id === id).sourceRefs.join(" "),
        ).toContain(boundary);
      }
    }
    for (const id of [identify, draw, postulate]) {
      const b = bp.find((x: any) => x.nodeId === id);
      for (const k of [
        "workedExampleSpec",
        "guidedPracticeSpec",
        "independentPracticeSpec",
      ])
        expect(b).not.toHaveProperty(k);
      expect(map.activities.filter((x: any) => x.nodeId === id)).toEqual([]);
    }
  });
  it("removes eight false alignments and keeps projection parity", () => {
    for (const id of alignments) {
      expect(edges.some((x: any) => x.id === id)).toBe(false);
      expect(std.some((x: any) => x.id === id)).toBe(false);
    }
    for (const id of [identify, draw, postulate, maximum]) {
      expect(bp.find((x: any) => x.nodeId === id).alignmentNodeIds).toEqual([]);
      expect(srs.find((x: any) => x.nodeId === id).standards).toEqual([]);
      expect(map.srsInputs.find((x: any) => x.nodeId === id).standards).toEqual(
        [],
      );
      expect(
        teacher.skills.find((x: any) => x.nodeId === id).standardsCovered,
      ).toEqual([]);
    }
    const touched = [identify, draw, postulate, maximum];
    expect(
      map.srsInputs.filter((x: any) => touched.includes(x.nodeId)),
    ).toEqual(srs.filter((x: any) => touched.includes(x.nodeId)));
    expect(
      map.teacherEvidence.skills.filter((x: any) => touched.includes(x.nodeId)),
    ).toEqual(teacher.skills.filter((x: any) => touched.includes(x.nodeId)));
    const freshTeacher = projectTeacherEvidence(nodes, edges);
    expect(teacher.skills.find((x: any) => x.nodeId === maximum)).toEqual(
      freshTeacher.skills.find((x: any) => x.nodeId === maximum),
    );
  });
  it("keeps unrelated alignment rows unchanged", () => {
    for (const id of [
      "math.alignment.im1-example-12-4-015-to-ccss-g-co-a-4",
    ]) {
      expect(edges.some((x: any) => x.id === id)).toBe(true);
      expect(std.some((x: any) => x.id === id)).toBe(true);
    }
  });
  it("reports exact derived counts", () => {
    const gaps = read("generator-gap-queue.json"),
      matrix = read("im1-coverage-matrix.json");
    expect(gaps.meta.totalSkills).toBe(gaps.queue.length);
    expect(matrix.totalSkills).toBe(matrix.skills.length);
    expect(matrix.counts.gap).toBe(gaps.queue.length);
    expect(map.metadata.totalActivities).toBe(map.activities.length);
    expect(map.metadata.totalSrsInputs).toBe(map.srsInputs.length);
    expect(map.metadata.totalSkills).toBe(map.srsInputs.length);
  });
});
