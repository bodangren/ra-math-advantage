import { describe, expect, it } from "vitest";
import {
  APP_NAME,
  CODE_REGEX,
  collectDefinedCodes,
  collectReferencedCodes,
  findMissingCodes,
} from "./referenced-codes";

describe("standards-integrity (IM1)", () => {
  const referencedCodes = collectReferencedCodes();
  const definedCodes = collectDefinedCodes();
  const missingCodes = findMissingCodes(referencedCodes, definedCodes);

  it("collector finds at least one referenced standard (sanity check)", () => {
    expect(referencedCodes.length).toBeGreaterThan(0);
  });

  it("every referenced standard code matches the widened IM1 format regex", () => {
    for (const code of referencedCodes) {
      expect(code).toMatch(CODE_REGEX);
    }
  });

  it(`every referenced standard code is defined in ${APP_NAME} seed_standards (referencedCodes ⊆ definedCodes)`, () => {
    expect(missingCodes).toEqual([]);
  });
});
