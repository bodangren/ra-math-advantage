import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  projectActivityMap,
  projectSrsInputs,
  projectTeacherEvidence,
} from "@math-platform/knowledge-space-practice";

const graphDir = resolve(import.meta.dirname, "../../curriculum/skill-graph");
const read = (path: string) => JSON.parse(readFileSync(resolve(graphDir, path), "utf8"));
const catalogs = ["nodes.json", "draft-nodes.json", "edges.json", "standard-edges.json"].map(read);
const nodes = catalogs[0].nodes;
const edges = catalogs[2].edges;
const blueprints = read("blueprints.json").blueprints;
const activityMap = read("projection/practice-v1-activity-map.json");
const srs = read("projection/srs-input.json").srsInputs;
const teacher = read("projection/teacher-evidence-map.json");
const gaps = read("generator-gap-queue.json");
const matrix = read("im1-coverage-matrix.json");

const lesson = "math.im1.lesson.10.4";
const example = (suffix: string) => `math.im1.example.10.4.${suffix}`;
const readNumberLine = "math.im1.skill.10.3.find-the-length-of-a-segment-by-reading-coordinates-from-a-n";
const useDistance = "math.im1.skill.10.4.use-the-distance-formula-to-find-the-distance-between-two-po";
const applyDistance = "math.im1.skill.10.4.apply-the-distance-formula-to-solve-real-world-problems";
const divideSegment = "math.im1.skill.10.6.find-the-coordinates-of-a-point-that-divides-a-segment-in-a";
const newSkills = [
  ["math.im1.skill.10.4.determine-whether-two-coordinate-defined-segments-are-congruent-by-comparing-their-lengths", "Problems 15–20, 43, and 46"],
  ["math.im1.skill.10.4.find-possible-values-of-one-coordinate-from-a-fixed-coordinate-and-distance", "Problems 44, 45, and 53"],
  ["math.im1.skill.10.4.determine-and-justify-segment-congruence-from-rectangle-side-lengths-and-midpoints", "Problem 49 only"],
  ["math.im1.skill.10.4.explain-how-the-pythagorean-theorem-produces-the-distance-formula", "Problem 50 only"],
] as const;

describe("Lesson 10-4 capability graph", () => {
  it("preserves the four exact source identities", () => {
    for (const [suffix, range] of [["012", "Problems 1–14"], ["013", "Problems 15–20"], ["014", "Problems 21–26"], ["015", "Problems 27–30"]]) {
      for (const catalog of catalogs) {
        const node = catalog.nodes.find((row: any) => row.id === example(suffix));
        expect(node.sourceRefs.join(" ")).toContain(range);
      }
    }
    for (const suffix of ["012", "013", "014", "015"]) expect(nodes.find((row: any) => row.id === example(suffix)).reviewStatus).toBe("approved");
    expect(nodes.filter((row: any) => row.kind === "worked_example" && row.id.startsWith("math.im1.example.10.4.")).map((row: any) => row.id)).toEqual([example("012"), example("013"), example("014"), example("015")]);
  });

  it("adds four draft inactive capabilities with exact evidence", () => {
    for (const [id, range] of newSkills) {
      for (const catalog of catalogs) expect(catalog.nodes.find((row: any) => row.id === id)).toMatchObject({ reviewStatus: "draft", independentPracticeReady: false });
      expect(nodes.find((row: any) => row.id === id).sourceRefs.join(" ")).toContain(range);
      const blueprint = blueprints.find((row: any) => row.nodeId === id);
      expect(blueprint).toMatchObject({ sourceNodeIds: id.includes("coordinate-defined") ? [example("013"), lesson] : [lesson], alignmentNodeIds: [], reviewStatus: "draft" });
      for (const key of ["rendererKey", "rendererModeMap", "workedExampleSpec", "guidedPracticeSpec", "independentPracticeSpec"]) expect(blueprint).not.toHaveProperty(key);
      expect(activityMap.activities.filter((row: any) => row.nodeId === id)).toEqual([]);
      expect(edges.filter((edge: any) => edge.type === "contains" && edge.sourceId === lesson && edge.targetId === id)).toHaveLength(1);
      expect(edges.some((edge: any) => ["prerequisite_for", "equivalent_to"].includes(edge.type) && (edge.sourceId === id || edge.targetId === id))).toBe(false);
    }
  });

  it("binds only the accepted response stages", () => {
    for (const [id, range] of [[readNumberLine, "Problems 1–14"], [useDistance, "Example 3 Problems 21–26; Example 4 Problem 27 only; Mixed Exercises Problems 31–42, 52, and 54"], [applyDistance, "Problems 28–30 and 47–48"], [divideSegment, "Problem 51 only"]]) {
      expect(nodes.find((row: any) => row.id === id).sourceRefs.join(" ")).toContain(range);
    }
    expect(blueprints.find((row: any) => row.nodeId === useDistance).sourceNodeIds).toEqual([example("014"), example("015"), lesson]);
    expect(blueprints.find((row: any) => row.nodeId === applyDistance).sourceNodeIds).toEqual([example("015"), lesson]);
  });

  it("removes unsupported edges and reviewed placeholders", () => {
    expect(edges.some((edge: any) => edge.id === "math.im1.edge.1194")).toBe(false);
    expect(edges.some((edge: any) => edge.id === "math.im1.edge.1195")).toBe(true);
    expect(srs.every((row: any) => !row.prerequisites.includes(readNumberLine) || row.nodeId !== applyDistance)).toBe(true);
    for (const id of [useDistance, applyDistance]) {
      const blueprint = blueprints.find((row: any) => row.nodeId === id);
      for (const key of ["workedExampleSpec", "guidedPracticeSpec", "independentPracticeSpec"]) expect(blueprint).not.toHaveProperty(key);
      expect(activityMap.activities.filter((row: any) => row.nodeId === id)).toEqual([]);
    }
  });

  it("keeps only the two reviewed modeling alignments", () => {
    const lessonAlignments = edges.filter((edge: any) => edge.type === "aligned_to_standard" && (edge.sourceId.startsWith("math.im1.example.10.4.") || [useDistance, applyDistance].includes(edge.sourceId)));
    const standardAlignments = catalogs[3].edges.filter((edge: any) => edge.type === "aligned_to_standard" && (edge.sourceId.startsWith("math.im1.example.10.4.") || [useDistance, applyDistance].includes(edge.sourceId)));
    expect(standardAlignments).toEqual(lessonAlignments);
    expect(lessonAlignments.map((edge: any) => edge.id)).toEqual([
      "math.alignment.im1-example-10-4-015-to-ccss-g-mg-a-1",
      "math.alignment.im1-skill-10-4-apply-the-distance-formula-to-solve-real-world-problems-to-ccss-g-mg-a-1",
    ]);
    expect(blueprints.find((row: any) => row.nodeId === useDistance).alignmentNodeIds).toEqual([]);
    expect(blueprints.find((row: any) => row.nodeId === applyDistance).alignmentNodeIds).toEqual(["math.standard.ccss.g-mg-a-1"]);
  });

  it("keeps affected projections and counts consistent", () => {
    const freshActivities = projectActivityMap(nodes, edges, blueprints);
    const freshSrs = projectSrsInputs(nodes, edges, blueprints);
    const freshTeacher = projectTeacherEvidence(nodes, edges);
    for (const id of [readNumberLine, useDistance, applyDistance, divideSegment, ...newSkills.map(([id]) => id)]) {
      if ([useDistance, applyDistance, ...newSkills.map(([nodeId]) => nodeId)].includes(id)) expect(activityMap.activities.filter((row: any) => row.nodeId === id)).toEqual(freshActivities.filter((row: any) => row.nodeId === id));
      expect(srs.find((row: any) => row.nodeId === id)).toEqual(freshSrs.find((row: any) => row.nodeId === id));
      expect(teacher.skills.find((row: any) => row.nodeId === id)).toEqual(freshTeacher.skills.find((row: any) => row.nodeId === id));
      expect(activityMap.srsInputs.find((row: any) => row.nodeId === id)).toEqual(srs.find((row: any) => row.nodeId === id));
      expect(activityMap.teacherEvidence.skills.find((row: any) => row.nodeId === id)).toEqual(teacher.skills.find((row: any) => row.nodeId === id));
    }
    expect(activityMap.metadata.totalActivities).toBe(activityMap.activities.length);
    expect(gaps.meta.totalSkills).toBe(gaps.queue.length);
    expect(matrix.totalSkills).toBe(matrix.skills.length);
  });
});
