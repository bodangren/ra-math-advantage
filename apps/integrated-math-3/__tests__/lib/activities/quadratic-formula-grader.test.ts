import { describe, expect, it } from "vitest";
import { generateQuadraticFormula } from "@math-platform/math-content";
import { gradeQuadraticFormulaResponse } from "../../../lib/activities/quadratic-formula-grader";

function problem(seed: number) {
  return generateQuadraticFormula({ seed });
}

describe("quadratic formula exact response grader", () => {
  it("accepts exact rational forms and either distinct-root order", () => {
    const generated = {
      quadratic: "2x^2 - 5x + 2 = 0",
      a: 2,
      b: -5,
      c: 2,
      discriminant: 9,
      roots: [
        { value: 2, type: "real" as const },
        { value: 0.5, type: "real" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: "9", x1: "1/2", x2: "2" }).score,
    ).toBe(3);
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 9, x1: "4/2", x2: "2/4" }).score,
    ).toBe(3);
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 9, x1: "-4/-2", x2: "-1/-2" }).score,
    ).toBe(3);
  });

  it("accepts simplified equivalent irrational and complex forms", () => {
    const irrational = {
      quadratic: "x^2 + 4x - 17 = 0",
      a: 1,
      b: 4,
      c: -17,
      discriminant: 84,
      roots: [
        { value: "(-4 + √84)/2", type: "irrational" as const },
        { value: "(-4 - √84)/2", type: "irrational" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(irrational, {
        discriminant: "84",
        x1: "-2 - √21",
        x2: "√21 - 2",
      }).score,
    ).toBe(3);
    const complex = {
      quadratic: "5x^2 + 8x + 11 = 0",
      a: 5,
      b: 8,
      c: 11,
      discriminant: -156,
      roots: [
        { value: "(-8 + i√156)/10", type: "complex" as const },
        { value: "(-8 - i√156)/10", type: "complex" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(complex, {
        discriminant: "-156",
        x1: "(-4-i√39)/5",
        x2: "(-8+2√39i)/10",
      }).score,
    ).toBe(3);
  });

  it("preserves division precedence and accepts bounded imaginary syntax", () => {
    const irrational = {
      quadratic: "x^2 + 4x - 17 = 0",
      a: 1,
      b: 4,
      c: -17,
      discriminant: 84,
      roots: [
        { value: "(-4 + √84)/2", type: "irrational" as const },
        { value: "(-4 - √84)/2", type: "irrational" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(irrational, { discriminant: 84, x1: "-2+√21/2", x2: "-2-√21" })
        .score,
    ).toBe(2);
    const simple = {
      quadratic: "x^2 + 1 = 0",
      a: 1,
      b: 0,
      c: 1,
      discriminant: -4,
      roots: [
        { value: "i", type: "complex" as const },
        { value: "-i", type: "complex" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(simple, { discriminant: -4, x1: "-1*i", x2: "i" }).score,
    ).toBe(3);
    const scaled = {
      ...simple,
      roots: [
        { value: "2i", type: "complex" as const },
        { value: "-2i", type: "complex" as const },
      ],
    };
    expect(
      gradeQuadraticFormulaResponse(scaled, { discriminant: -4, x1: "2*i", x2: "-2i" }).score,
    ).toBe(3);
  });

  it("accepts ordinary separated fractions with term-level precedence", () => {
    const complex = {
      quadratic: "5x^2 + 8x + 11 = 0",
      a: 5,
      b: 8,
      c: 11,
      discriminant: -156,
      roots: [
        { value: "(-8 + i√156)/10", type: "complex" as const },
        { value: "(-8 - i√156)/10", type: "complex" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(complex, {
        discriminant: -156,
        x1: "-4/5+i*sqrt(39)/5",
        x2: "-4/5-i*sqrt(39)/5",
      }).score,
    ).toBe(3);
  });

  it("requires x1 and a blank zero-weight x2 for one repeated root", () => {
    const repeated = {
      quadratic: "x^2 - 6x + 9 = 0",
      a: 1,
      b: -6,
      c: 9,
      discriminant: 0,
      roots: [{ value: 3, type: "real" as const }],
      steps: [],
    };
    const correct = gradeQuadraticFormulaResponse(repeated, {
      discriminant: 0,
      x1: "6/2",
      x2: "   ",
    });
    expect(correct).toMatchObject({ score: 2, maxScore: 2 });
    expect(correct.parts.find((part) => part.partId === "x2")).toMatchObject({
      isCorrect: true,
      score: 0,
      maxScore: 0,
    });
    expect(
      gradeQuadraticFormulaResponse(repeated, { discriminant: 0, x1: "", x2: "3" }).score,
    ).toBe(1);
    const extra = gradeQuadraticFormulaResponse(repeated, { discriminant: 0, x1: "3", x2: "3" });
    expect(extra.score).toBeLessThan(extra.maxScore);
    expect(extra.parts.find((part) => part.partId === "x2")?.isCorrect).toBe(false);
  });

  it("awards order-independent partial root credit when the other field is wrong", () => {
    const generated = {
      quadratic: "x^2 - 1 = 0",
      a: 1,
      b: 0,
      c: -1,
      discriminant: 4,
      roots: [
        { value: 1, type: "real" as const },
        { value: -1, type: "real" as const },
      ],
      steps: [],
    };
    const result = gradeQuadraticFormulaResponse(generated, {
      discriminant: 4,
      x1: "wrong",
      x2: "1",
    });
    expect(result.parts.find((part) => part.partId === "x1")?.isCorrect).toBe(false);
    expect(result.parts.find((part) => part.partId === "x2")?.isCorrect).toBe(true);
  });

  it("rejects wrong signs, duplicates, missing roots, and wrong discriminants", () => {
    const generated = {
      quadratic: "x^2 - 1 = 0",
      a: 1,
      b: 0,
      c: -1,
      discriminant: 4,
      roots: [
        { value: 1, type: "real" as const },
        { value: -1, type: "real" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 4, x1: "1", x2: "1" }).score,
    ).toBe(2);
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 4, x1: "1", x2: "" }).score,
    ).toBe(2);
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 5, x1: "1", x2: "-1" }).score,
    ).toBe(2);
  });

  it.each([
    "1.41421356237",
    "sqrt(2) trailing",
    "1/0",
    "NaN",
    "Infinity",
    "x+1",
    "√(√2)",
    "1+√2+√3",
    "2**i",
    "9".repeat(161),
  ])("rejects unsupported or bounded input %j", (value) => {
    const generated = {
      quadratic: "x^2 - 2 = 0",
      a: 1,
      b: 0,
      c: -2,
      discriminant: 8,
      roots: [
        { value: "√2", type: "irrational" as const },
        { value: "-√2", type: "irrational" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 8, x1: value, x2: "-√2" }).score,
    ).toBeLessThan(3);
  });

  it("normalizes a zero radical coefficient without changing the value", () => {
    const generated = {
      quadratic: "x^2 - 4 = 0",
      a: 1,
      b: 0,
      c: -4,
      discriminant: 16,
      roots: [
        { value: 2, type: "real" as const },
        { value: -2, type: "real" as const },
      ],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 16, x1: "2+0√999", x2: "-2" }).score,
    ).toBe(3);
    expect(
      gradeQuadraticFormulaResponse(generated, { discriminant: 16, x1: "2+0i", x2: "-2" }).score,
    ).toBe(3);
  });

  it("normalizes zero radicands before radical simplification", () => {
    const repeated = {
      quadratic: "x^2 - 6x + 9 = 0",
      a: 1,
      b: -6,
      c: 9,
      discriminant: 0,
      roots: [{ value: 3, type: "real" as const }],
      steps: [],
    };
    for (const x1 of ["3+sqrt(0)", "(6+sqrt(0))/2", "3+i*sqrt(0)"]) {
      expect(gradeQuadraticFormulaResponse(repeated, { discriminant: 0, x1, x2: "" }).score).toBe(
        2,
      );
    }
    const zero = {
      quadratic: "x^2 = 0",
      a: 1,
      b: 0,
      c: 0,
      discriminant: 0,
      roots: [{ value: 0, type: "real" as const }],
      steps: [],
    };
    expect(
      gradeQuadraticFormulaResponse(zero, { discriminant: 0, x1: "sqrt(0)", x2: "" }).score,
    ).toBe(2);
  });

  it.each([
    { discriminant: "1*6", x1: "2", x2: "-2" },
    { discriminant: "16", x1: "0*2", x2: "-2" },
    { discriminant: "16", x1: "sqrt(2)*1", x2: "-2" },
    { discriminant: "16", x1: "0*1i", x2: "-2" },
    { discriminant: "16", x1: "2*(1)", x2: "-2" },
  ])("rejects unsupported multiplication without erasing its meaning: $x1", (response) => {
    const generated = {
      quadratic: "x^2 - 4 = 0",
      a: 1,
      b: 0,
      c: -4,
      discriminant: 16,
      roots: [
        { value: 2, type: "real" as const },
        { value: -2, type: "real" as const },
      ],
      steps: [],
    };
    expect(gradeQuadraticFormulaResponse(generated, response).score).toBeLessThan(3);
  });

  it("grades every repaired generated regime with the fixed public fields", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200 && seen.size < 4; seed += 1) {
      const generated = problem(seed);
      const kind =
        generated.discriminant < 0
          ? "complex"
          : generated.discriminant === 0
            ? "repeated"
            : generated.roots.every((root) => typeof root.value === "number")
              ? "rational"
              : "irrational";
      seen.add(kind);
      const result = gradeQuadraticFormulaResponse(generated, {
        discriminant: generated.discriminant,
        x1: String(generated.roots[0]?.value ?? ""),
        x2: String(generated.roots[1]?.value ?? ""),
      });
      expect(result.score).toBe(result.maxScore);
    }
    expect(seen).toEqual(new Set(["rational", "repeated", "irrational", "complex"]));
  });
});
