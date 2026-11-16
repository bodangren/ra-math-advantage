import courseNodesJson from "../../curriculum/skill-graph/nodes.json";
import moduleNodesJson from "../../curriculum/skill-graph/module-1/nodes.json";
import draftNodesJson from "../../curriculum/skill-graph/draft-nodes.json";
import edgesJson from "../../curriculum/skill-graph/edges.json";
import standardEdgesJson from "../../curriculum/skill-graph/standard-edges.json";
import moduleEdgesJson from "../../curriculum/skill-graph/module-1/edges.json";
import moduleActivityMapJson from "../../curriculum/skill-graph/module-1/projection/practice-v1-activity-map.json";
import { projectTeacherEvidence } from "@math-platform/knowledge-space-practice";
import { describe, expect, it } from "vitest";

type CatalogNode = {
  id: string;
  kind: string;
  sourceRefs: string[];
  independentPracticeReady?: boolean;
};

const CLASSIFICATION_SKILL =
  "math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol";
const ALEKS_CONCEPT = "math.im3.skill.1.aleks.discriminant-analysis";
const PDF = "apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf";
const catalogs = [
  courseNodesJson.nodes,
  moduleNodesJson.nodes,
  draftNodesJson.nodes,
  edgesJson.nodes,
  standardEdgesJson.nodes,
] as CatalogNode[][];

describe("IM3 Lesson 1-6 discriminant source correction", () => {
  it("binds the page 45 Key Concept and page 48 Problems 24-35 to the classification skill", () => {
    for (const nodes of catalogs) {
      const matches = nodes.filter((node) => node.id === CLASSIFICATION_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({
        kind: "skill",
        sourceRefs: [
          "apps/integrated-math-3/curriculum/module-1-class-period-plan.md",
          `${PDF}#page=45`,
          `${PDF}#page=48`,
        ],
      });
    }
  });

  it("does not mark the ALEKS discriminant concept as ready for independent practice", () => {
    for (const nodes of catalogs) {
      const matches = nodes.filter((node) => node.id === ALEKS_CONCEPT);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.kind).toBe("concept");
      if ("independentPracticeReady" in matches[0]!) {
        expect(matches[0]?.independentPracticeReady).toBe(false);
      }
    }

    const projected = projectTeacherEvidence(
      moduleNodesJson.nodes as never[],
      moduleEdgesJson.edges as never[],
    );
    const storedRow = moduleActivityMapJson.teacherEvidence.skills.find(
      (row) => row.nodeId === ALEKS_CONCEPT,
    );
    expect(projected.skills.some((row) => row.nodeId === ALEKS_CONCEPT)).toBe(
      false,
    );
    expect(storedRow).toBeUndefined();
  });
});
