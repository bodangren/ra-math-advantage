import { describe, it, expect } from "vitest";
import {
  formatUnitNumber,
  formatLessonNumber,
  buildWorkbookFilename,
  buildWorkbookPublicPath,
  buildCapstoneFilename,
  buildCapstonePublicPath,
} from "../workbook-pipeline/path.js";

describe("path utilities", () => {
  describe("formatUnitNumber", () => {
    it("pads single digit units with leading zero", () => {
      expect(formatUnitNumber(1)).toBe("01");
      expect(formatUnitNumber(9)).toBe("09");
    });

    it("keeps double digit units as-is", () => {
      expect(formatUnitNumber(10)).toBe("10");
      expect(formatUnitNumber(12)).toBe("12");
    });
  });

  describe("formatLessonNumber", () => {
    it("pads single digit lessons with leading zero", () => {
      expect(formatLessonNumber(1)).toBe("01");
      expect(formatLessonNumber(4)).toBe("04");
      expect(formatLessonNumber(9)).toBe("09");
    });

    it("keeps double digit lessons as-is", () => {
      expect(formatLessonNumber(10)).toBe("10");
      expect(formatLessonNumber(15)).toBe("15");
    });
  });

  describe("buildWorkbookFilename", () => {
    it("builds student workbook filename", () => {
      expect(buildWorkbookFilename(1, 4, "student")).toBe("unit_01_lesson_04_student.xlsx");
    });

    it("builds teacher workbook filename", () => {
      expect(buildWorkbookFilename(2, 15, "teacher")).toBe("unit_02_lesson_15_teacher.xlsx");
    });

    it("handles multi-digit unit and lesson numbers", () => {
      expect(buildWorkbookFilename(12, 8, "student")).toBe("unit_12_lesson_08_student.xlsx");
    });
  });

  describe("buildWorkbookPublicPath", () => {
    it("builds correct public path for student workbook", () => {
      expect(buildWorkbookPublicPath(1, 4, "student")).toBe(
        "/workbooks/unit_01_lesson_04_student.xlsx",
      );
    });

    it("builds correct public path for teacher workbook", () => {
      expect(buildWorkbookPublicPath(1, 4, "teacher")).toBe(
        "/workbooks/unit_01_lesson_04_teacher.xlsx",
      );
    });
  });

  describe("buildCapstoneFilename", () => {
    it("builds student capstone filename with default base name", () => {
      expect(buildCapstoneFilename("student")).toBe("capstone_investor_ready_workbook.xlsx");
    });

    it("builds teacher capstone filename with default base name", () => {
      expect(buildCapstoneFilename("teacher")).toBe(
        "capstone_investor_ready_workbook_teacher.xlsx",
      );
    });

    it("builds student capstone filename with custom base name", () => {
      expect(buildCapstoneFilename("student", "math_capstone")).toBe("capstone_math_capstone.xlsx");
    });

    it("builds teacher capstone filename with custom base name", () => {
      expect(buildCapstoneFilename("teacher", "math_capstone")).toBe(
        "capstone_math_capstone_teacher.xlsx",
      );
    });
  });

  describe("buildCapstonePublicPath", () => {
    it("builds correct public path for student capstone with default base", () => {
      expect(buildCapstonePublicPath("student")).toBe(
        "/workbooks/capstone_investor_ready_workbook.xlsx",
      );
    });

    it("builds correct public path for teacher capstone with default base", () => {
      expect(buildCapstonePublicPath("teacher")).toBe(
        "/workbooks/capstone_investor_ready_workbook_teacher.xlsx",
      );
    });

    it("builds correct public path for student capstone with custom base", () => {
      expect(buildCapstonePublicPath("student", "math_capstone")).toBe(
        "/workbooks/capstone_math_capstone.xlsx",
      );
    });

    it("builds correct public path for teacher capstone with custom base", () => {
      expect(buildCapstonePublicPath("teacher", "math_capstone")).toBe(
        "/workbooks/capstone_math_capstone_teacher.xlsx",
      );
    });
  });
});
