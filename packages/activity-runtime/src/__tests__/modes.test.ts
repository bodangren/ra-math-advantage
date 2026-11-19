import { describe, it, expect } from "vitest";
import { resolveActivityMode, type ActivityMode, type ResolveModeParams } from "../index";

describe("modes", () => {
  describe("resolveActivityMode", () => {
    it("returns teaching mode for teacher role", () => {
      const params: ResolveModeParams = {
        role: "teacher",
        phaseType: "independent_practice",
      };
      expect(resolveActivityMode(params)).toBe("teaching");
    });

    it("returns teaching mode for admin role", () => {
      const params: ResolveModeParams = {
        role: "admin",
        phaseType: "explore",
      };
      expect(resolveActivityMode(params)).toBe("teaching");
    });

    it("returns teaching mode for teacher even with override", () => {
      const params: ResolveModeParams = {
        role: "teacher",
        phaseType: "independent_practice",
        activityModeOverride: "practice",
      };
      expect(resolveActivityMode(params)).toBe("teaching");
    });

    describe("student mode resolution", () => {
      it("returns practice mode for independent_practice", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "independent_practice",
        };
        expect(resolveActivityMode(params)).toBe("practice");
      });

      it("returns practice mode for assessment", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "assessment",
        };
        expect(resolveActivityMode(params)).toBe("practice");
      });

      it("returns guided mode for worked_example", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "worked_example",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for guided_practice", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "guided_practice",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for explore", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "explore",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for vocabulary", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "vocabulary",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for learn", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "learn",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for key_concept", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "key_concept",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for discourse", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "discourse",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("returns guided mode for reflection", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "reflection",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });
    });

    describe("activity mode override", () => {
      it("respects teaching override for student", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "independent_practice",
          activityModeOverride: "teaching",
        };
        expect(resolveActivityMode(params)).toBe("teaching");
      });

      it("respects guided override for student", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "independent_practice",
          activityModeOverride: "guided",
        };
        expect(resolveActivityMode(params)).toBe("guided");
      });

      it("ignores invalid override values", () => {
        const params: ResolveModeParams = {
          role: "student",
          phaseType: "independent_practice",
          activityModeOverride: "invalid" as ActivityMode,
        };
        expect(resolveActivityMode(params)).toBe("practice");
      });
    });
  });
});
