import { expect, it } from "vitest";
import { checkEquivalence } from "../algebraic/equivalence";
it.each([
  ["2*3", "23"],
  ["(x+1)^2+5", "x^2+2x+1"],
  ["x--1", "x-1"],
  ["1/2+4", "1/2"],
])("does not equate %s with %s", (a, b) => expect(checkEquivalence(a, b)).toBe(false));
