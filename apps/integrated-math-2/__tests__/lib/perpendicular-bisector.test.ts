// @vitest-environment node
import { it, expect } from "vitest";
import {
  generatePerpendicularBisector,
  gradePerpendicularBisector,
  nodeId,
  projectPerpendicularBisector,
} from "../../lib/practice/perpendicular-bisector";
import { questionSchema, gradeQuestion } from "../../lib/practice/question";
import {
  generatorOutputSchema,
  knowledgeBlueprintSchema,
  validateModeSupport,
  validateGradingCompatibility,
} from "../../../../packages/knowledge-space-practice/src/blueprints/schemas";
import data from "../../curriculum/skill-graph/blueprints.json";
it("creates deterministic, valid questions with independently verified equations", () => {
  const prompts = new Set<string>();
  for (let seed = 0; seed < 960; seed++) {
    const input = { nodeId, seed, difficulty: 0.5 };
    const result = generatePerpendicularBisector(input);
    expect(result).toEqual(generatePerpendicularBisector(input));
    expect(generatorOutputSchema.safeParse(result).success).toBe(true);
    const question = questionSchema.parse(result.data.question);
    const { a, b, c, d } = result.data.coefficients;
    const independentAnswer = (c - d) / (b - a);
    expect(question.answer).toBe(independentAnswer);
    expect(a * independentAnswer + c).toBeGreaterThan(0);
    expect(a * independentAnswer + c).toBe(b * independentAnswer + d);
    expect(gradeQuestion(question, String(independentAnswer)).score).toBe(1);
    expect(gradeQuestion(question, String(independentAnswer + 1)).score).toBe(
      0,
    );
    expect(question.hint).toContain("equal");
    prompts.add(result.prompt);
  }
  expect(prompts.size).toBe(960);
});
it("projects three modes and keeps the independent answer private", () => {
  const input = { nodeId, seed: 7, difficulty: 1 };
  const worked = projectPerpendicularBisector(input, "worked_example", "worked");
  const guided = projectPerpendicularBisector(input, "guided_practice", "guided");
  const independent = projectPerpendicularBisector(input, "independent_practice", "independent");
  expect(worked).toHaveProperty("answer");
  expect(worked).toHaveProperty("solutionSteps");
  expect(guided).toHaveProperty("hint");
  expect(independent).not.toHaveProperty("answer");
  expect(independent).not.toHaveProperty("hint");
  expect(independent).not.toHaveProperty("solutionSteps");
  // DA = x + 2 and DB = 2x - 9, so equal distances give x = 11.
  expect(independent.prompt).toBe("D lies on the perpendicular bisector of AB. DA = (1x + 2) cm and DB = (2x - 9) cm. Find x.");
  expect(worked).toHaveProperty("answer", 11);
  expect(gradePerpendicularBisector(input, "11").score).toBe(1);
  expect(gradePerpendicularBisector(input, "12").score).toBe(0);
});
it("rejects unsupported node IDs and invalid generator inputs", () => {
  for (const changes of [
    { nodeId: "other" },
    { seed: -1 },
    { seed: 0.5 },
    { seed: Number.MAX_SAFE_INTEGER + 1 },
    { difficulty: -0.1 },
    { difficulty: 1.1 },
  ])
    expect(() =>
      generatePerpendicularBisector({
        nodeId,
        seed: 1,
        difficulty: 0.5,
        ...changes,
      }),
    ).toThrow();
});
it("has one complete source-linked blueprint and does not claim unfinished modes", () => {
  for (const raw of data.blueprints) {
    const blueprint = knowledgeBlueprintSchema.parse(raw);
    expect(validateModeSupport(blueprint).valid).toBe(true);
    expect(validateGradingCompatibility(blueprint).valid).toBe(true);
    if (blueprint.nodeId !== nodeId)
      expect(blueprint.rendererModeMap).toEqual({});
  }
  const blueprint = knowledgeBlueprintSchema.parse(
    data.blueprints.find((b) => b.nodeId === nodeId),
  );
  expect(blueprint.sourceNodeIds).toContain("math.im2.example.1.1.001");
  expect(blueprint.generatorKey).toBe(
    "im2-perpendicular-bisector-equidistance",
  );
  expect(blueprint.guidedPracticeSpec?.hints.length).toBeGreaterThan(1);
});

it("keeps graph projections consistent and unavailable for runtime practice", async () => {
  const graph = (await import("../../curriculum/skill-graph/edges.json"))
    .default;
  const teacher = (
    await import("../../curriculum/skill-graph/projection/teacher-evidence-map.json")
  ).default;
  const srs = (
    await import("../../curriculum/skill-graph/projection/srs-input.json")
  ).default;
  const activities = (
    await import("../../curriculum/skill-graph/projection/practice-v1-activity-map.json")
  ).default;
  const ids = new Set(
    graph.nodes.filter((n) => n.kind === "skill").map((n) => n.id),
  );
  expect(ids.size).toBe(data.blueprints.length);
  for (const blueprint of data.blueprints)
    expect(ids.has(blueprint.nodeId)).toBe(true);
  expect(new Set(teacher.skills.map((s) => s.nodeId))).toEqual(ids);
  expect(new Set(srs.skills.map((s) => s.nodeId))).toEqual(ids);
  expect(activities.activities).toEqual([]);
  expect(srs.skills.every((s) => !s.srsEligible)).toBe(true);
  expect(teacher.skills.every((s) => !s.independentPracticeReady)).toBe(true);
});
