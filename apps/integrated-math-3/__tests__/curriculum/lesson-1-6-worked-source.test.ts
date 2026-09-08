import courseNodesJson from "../../curriculum/skill-graph/nodes.json";
import moduleNodesJson from "../../curriculum/skill-graph/module-1/nodes.json";
import draftNodesJson from "../../curriculum/skill-graph/draft-nodes.json";
import edgesJson from "../../curriculum/skill-graph/edges.json";
import standardEdgesJson from "../../curriculum/skill-graph/standard-edges.json";
import { describe, expect, it } from "vitest";

type SourceNode = {
  id: string;
  title: string;
  sourceRefs: string[];
  reviewStatus: string;
  metadata: Record<string, unknown>;
};
const PDF = "apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf";
const catalogs = [
  courseNodesJson.nodes,
  moduleNodesJson.nodes,
  draftNodesJson.nodes,
  edgesJson.nodes,
  standardEdgesJson.nodes,
] as SourceNode[][];
const examples = [
  {
    id: "math.im3.example.1.6.036",
    number: 1,
    page: 43,
    title: "Real Roots, c Is Positive",
    prompt:
      "CONTEST At the World Championship Punkin Chunkin contest in Bridgeville, Delaware, pumpkins are launched hundreds of yards. The path of a pumpkin can be modeled by h = -4.9t² + 11.7t + 42, where h is the height and t is the number of seconds after launch.",
    capability:
      "Use the Quadratic Formula to solve a contextual quadratic equation, preserve both mathematical roots, and interpret the context-valid root.",
    rawText:
      "Example 1 Real Roots, c Is Positive\nCONTEST At the World Championship Punkin Chunkin contest in Bridgeville, Delaware, pumpkins are launched hundreds of yards. The path of a pumpkin can be modeled by h = -4.9t² + 11.7t + 42, where h is the height and t is the number of seconds after launch.\nPart A Use the Quadratic Formula to solve 0 = -4.9t² + 11.7t + 42.\na = -4.9, b = 11.7, c = 42\nt = (-b ± √(b² - 4ac))/(2a)\nt = (-11.7 ± √((11.7)² - 4(-4.9)(42)))/(2(-4.9))\nt = (-11.7 ± √(136.89 + 823.2))/-9.8\nt = (-11.7 ± √960.09)/-9.8\nt = (11.7 + √960.09)/9.8 or t = (11.7 - √960.09)/9.8\nThe approximate solutions are 4.4 seconds and -2.0 seconds.\nPart B Interpret the roots.\nThe negative root does not make sense in this context because the pumpkin launches at 0 seconds. The pumpkin lands after 4.4 seconds.",
  },
  {
    id: "math.im3.example.1.6.037",
    number: 2,
    page: 44,
    title: "Real Roots, c Is Negative",
    prompt: "Solve x² + 4x - 17 = 0 by using the Quadratic Formula.",
    capability:
      "Use the Quadratic Formula to solve a quadratic equation with negative c and simplify both real roots exactly.",
    rawText:
      "Example 2 Real Roots, c Is Negative\nSolve x² + 4x - 17 = 0 by using the Quadratic Formula.\na = 1, b = 4, c = -17\nx = (-b ± √(b² - 4ac))/(2a)\nx = (-4 ± √((4)² - 4(1)(-17)))/(2(1))\nx = (-4 ± √84)/2\nx = (-4 ± √4 · √21)/2\nx = (-4 ± 2√21)/2\nx = -2 ± √21",
  },
  {
    id: "math.im3.example.1.6.038",
    number: 3,
    page: 44,
    title: "Complex Roots",
    prompt: "Solve 5x² + 8x + 11 = 0 by using the Quadratic Formula.",
    capability:
      "Use the Quadratic Formula to solve a quadratic equation with a negative discriminant and simplify both complex conjugate roots exactly.",
    rawText:
      "Example 3 Complex Roots\nSolve 5x² + 8x + 11 = 0 by using the Quadratic Formula.\na = 5, b = 8, c = 11\nx = (-b ± √(b² - 4ac))/(2a)\nx = (-8 ± √(8² - 4(5)(11)))/(2(5))\nx = (-8 ± √-156)/10\nx = (-8 ± √-1 · √4 · √39)/10\nx = (-8 ± 2i√39)/10\nx = (-4 ± i√39)/5",
  },
] as const;

describe("IM3 Lesson 1-6 Worked source restoration", () => {
  it("preserves the exact titles, prompts, solution sequences, and capabilities", () => {
    for (const expected of examples)
      for (const nodes of catalogs) {
        const matches = nodes.filter(
          (candidate) => candidate.id === expected.id,
        );
        expect(matches).toHaveLength(1);
        const [node] = matches;
        expect(node?.title).toBe(
          `Example ${expected.number}: ${expected.title}`,
        );
        expect(node?.sourceRefs).toEqual([
          `apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-6, Example ${expected.number})`,
          `${PDF}#page=${expected.page}`,
        ]);
        expect(node?.reviewStatus).toBe("draft");
        expect(node?.metadata).toMatchObject({
          exampleNumber: expected.number,
          pdfPage: expected.page,
          authoredTitle: expected.title,
          prompt: expected.prompt,
          demonstratedCapability: expected.capability,
          rawText: expected.rawText,
        });
      }
  });
});
