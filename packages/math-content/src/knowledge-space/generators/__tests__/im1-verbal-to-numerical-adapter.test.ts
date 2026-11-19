import { describe, expect, it } from "vitest";
import { getGenerator } from "../registry";
import {
  generateIM1VerbalToNumericalOutput,
  gradeIM1VerbalToNumerical,
  projectIM1VerbalToNumerical,
} from "../../index";
import { getRenderer } from "../../renderers/registry";

const NODE_ID = "math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express";

const input = (seed: number) => ({ nodeId: NODE_ID, seed, difficulty: 0.5 });

function findOutput(predicate: (expression: string) => boolean) {
  for (let seed = 0; seed < 200; seed += 1) {
    const output = generateIM1VerbalToNumericalOutput(input(seed));
    const expression = output.data.expression as string;
    if (predicate(expression)) return { seed, output, expression };
  }
  throw new Error("Required deterministic template was not generated.");
}

describe("IM1 verbal-to-numerical runtime adapter", () => {
  it("registers the real IM1 generator under its blueprint key", () => {
    const registered = getGenerator("1-1-verbal-to-numerical");
    expect(registered.nodeIds).toEqual([NODE_ID]);
    expect(registered.generate(input(11))).toEqual(generateIM1VerbalToNumericalOutput(input(11)));
  });

  it("projects valid FillInTheBlank props for all modes without leaking Independent answers", () => {
    const modes = ["worked_example", "guided_practice", "independent_practice"] as const;
    for (const mode of modes) {
      const projection = projectIM1VerbalToNumerical(input(4), mode, `activity-${mode}`);
      expect(projection.componentKey).toBe("fill-in-the-blank");
      expect(getRenderer("fill-in-the-blank").propsSchema.safeParse(projection.props).success).toBe(
        true,
      );
      expect(projection.props.mode).toBe(
        mode === "worked_example" ? "teaching" : mode === "guided_practice" ? "guided" : "practice",
      );
      const serialized = JSON.stringify(projection.props);
      if (mode === "independent_practice") {
        const generated = generateIM1VerbalToNumericalOutput(input(4));
        expect(projection.props).toEqual({
          activityId: `activity-${mode}`,
          mode: "practice",
          template: `Write a numerical expression for “${generated.data.verbal}”: {{blank:expression}}`,
          blanks: [{ id: "expression", isMath: true }],
        });
        expect(serialized).not.toContain(String(generated.data.expression));
        expect(serialized).not.toContain("correctAnswer");
        expect(serialized).not.toContain("acceptedAnswers");
        expect(serialized).not.toContain("solutionSteps");
        expect(serialized).not.toContain("expectedAnswer");
      } else {
        expect(projection.props.blanks[0]?.correctAnswer).toBeTruthy();
        expect(projection.props.blanks[0]?.acceptedAnswers?.length ?? 0).toBeGreaterThan(0);
      }
      if (mode === "worked_example") {
        const reasoningSteps = projection.props.reasoningSteps ?? [];
        expect(reasoningSteps.length).toBeGreaterThanOrEqual(2);
        expect(
          reasoningSteps.some((step) => step.expression.includes(expressionFor(projection))),
        ).toBe(true);
      }
      if (mode === "guided_practice") {
        expect(projection.props.guidedSupport).toEqual(
          expect.objectContaining({
            feedback: "on_check",
            revealAfterAttempts: 1,
          }),
        );
      }
    }
  });

  it("accepts explicit grouping and input notation but rejects an evaluated scalar", () => {
    const { seed, output, expression } = findOutput(
      (value) => value.includes(" + ") && value.includes(" * "),
    );
    const [left, product] = expression.split(" + ");
    const grouped = `${left} + (${product})`;
    expect(output.data.acceptedExpressions).toContain(grouped);
    expect(gradeIM1VerbalToNumerical(input(seed), { expression: grouped }).score).toBe(1);
    expect(
      gradeIM1VerbalToNumerical(input(seed), {
        expression: grouped.replace("*", "\\cdot"),
      }).score,
    ).toBe(1);
    expect(
      gradeIM1VerbalToNumerical(input(seed), {
        expression: String(output.data.value),
      }).score,
    ).toBe(0);
  });

  it("rejects changed order and changed grouping", () => {
    const difference = findOutput((value) => /^\d+ - \d+$/.test(value));
    const [minuend, subtrahend] = difference.expression.split(" - ");
    expect(
      gradeIM1VerbalToNumerical(input(difference.seed), {
        expression: `${subtrahend} - ${minuend}`,
      }).score,
    ).toBe(0);

    const grouped = findOutput((value) => value.includes(" * ("));
    expect(
      gradeIM1VerbalToNumerical(input(grouped.seed), {
        expression: grouped.expression.replace(/[()]/g, ""),
      }).score,
    ).toBe(0);
  });
});

function expressionFor(projection: ReturnType<typeof projectIM1VerbalToNumerical>): string {
  return projection.props.blanks[0]?.correctAnswer?.replace(/\*/g, "×") ?? "";
}
