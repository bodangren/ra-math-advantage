import { describe, expect, it } from "vitest";

import {
  PolynomialEquationEndBehaviorActivity,
  type PolynomialEquationEndBehaviorActivityProps,
} from "../index";
import { PolynomialEquationEndBehaviorActivity as DirectPolynomialEquationEndBehaviorActivity } from "../components/table/PolynomialEquationEndBehaviorActivity";

const workedProps: PolynomialEquationEndBehaviorActivityProps = {
  activityId: "topic-1-6.example-3.worked_example",
  mode: "teaching",
  prompt:
    "Determine the end behavior for the following polynomials. Limit notation is not necessary.",
  items: [
    { id: "a", functionName: "f", expression: "4x^5" },
    { id: "b", functionName: "g", expression: "(1/2)x^4" },
    { id: "c", functionName: "y", expression: "-2(x + 3)^6" },
    { id: "d", functionName: "h", expression: "3 - x^5" },
    { id: "e", functionName: "k", expression: "8x^2 + 4 - x^5" },
    { id: "f", functionName: "m", expression: "2x(x - 1)(6 - x)" },
  ],
  presentationMode: "worked_example",
  correctAnswers: {
    a_leftEnd: "down",
    a_rightEnd: "up",
    b_leftEnd: "up",
    b_rightEnd: "up",
    c_leftEnd: "down",
    c_rightEnd: "down",
    d_leftEnd: "up",
    d_rightEnd: "down",
    e_leftEnd: "up",
    e_rightEnd: "down",
    f_leftEnd: "up",
    f_rightEnd: "down",
  },
  steps: ["a", "b", "c", "d", "e", "f"],
  finalAnswer: "The six polynomial end behaviors are shown above.",
};

describe("PolynomialEquationEndBehaviorActivity public export", () => {
  it("exports the direct component and its props type from the package root", () => {
    expect(PolynomialEquationEndBehaviorActivity).toBe(DirectPolynomialEquationEndBehaviorActivity);
    expect(workedProps.mode).toBe("teaching");
    expect(workedProps.presentationMode).toBe("worked_example");
  });
});
