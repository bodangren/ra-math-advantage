import { describe, it, expect } from "vitest";
import {
  parseUnitLessonFilename,
  isCapstoneFilename,
  parseCapstoneType,
  buildUnitLessonKey,
  validateWorkbookManifest,
  type ParsedWorkbookEntry,
} from "../workbook-pipeline/manifest.js";

describe("manifest parsing", () => {
  describe("parseUnitLessonFilename", () => {
    it("parses valid student workbook filename", () => {
      const result = parseUnitLessonFilename("unit_01_lesson_04_student.xlsx");
      expect(result).toEqual({
        unitNumber: 1,
        lessonNumber: 4,
        type: "student",
      } satisfies ParsedWorkbookEntry);
    });

    it("parses valid teacher workbook filename", () => {
      const result = parseUnitLessonFilename("unit_02_lesson_15_teacher.xlsx");
      expect(result).toEqual({
        unitNumber: 2,
        lessonNumber: 15,
        type: "teacher",
      } satisfies ParsedWorkbookEntry);
    });

    it("parses multi-digit unit and lesson numbers", () => {
      const result = parseUnitLessonFilename("unit_12_lesson_08_student.xlsx");
      expect(result).toEqual({
        unitNumber: 12,
        lessonNumber: 8,
        type: "student",
      } satisfies ParsedWorkbookEntry);
    });

    it("returns null for non-matching filename", () => {
      expect(parseUnitLessonFilename("capstone_investor_ready_workbook.xlsx")).toBeNull();
      expect(parseUnitLessonFilename("unit_01_lesson_04.xlsx")).toBeNull();
      expect(parseUnitLessonFilename("unit_01_lesson_04_student.csv")).toBeNull();
      expect(parseUnitLessonFilename("invalid_filename.xlsx")).toBeNull();
    });

    it("returns null for traversal attempts", () => {
      expect(parseUnitLessonFilename("unit_../lesson_04_student.xlsx")).toBeNull();
      expect(parseUnitLessonFilename("unit_01_lesson_../student.xlsx")).toBeNull();
    });
  });

  describe("isCapstoneFilename", () => {
    it("returns true for capstone student workbook", () => {
      expect(isCapstoneFilename("capstone_investor_ready_workbook.xlsx")).toBe(true);
    });

    it("returns true for capstone teacher workbook", () => {
      expect(isCapstoneFilename("capstone_investor_ready_workbook_teacher.xlsx")).toBe(true);
    });

    it("returns false for unit lesson filename", () => {
      expect(isCapstoneFilename("unit_01_lesson_04_student.xlsx")).toBe(false);
    });

    it("returns false for other files", () => {
      expect(isCapstoneFilename("other_file.xlsx")).toBe(false);
    });
  });

  describe("parseCapstoneType", () => {
    it("returns student for non-teacher capstone file", () => {
      expect(parseCapstoneType("capstone_investor_ready_workbook.xlsx")).toBe("student");
    });

    it("returns teacher for teacher capstone file", () => {
      expect(parseCapstoneType("capstone_investor_ready_workbook_teacher.xlsx")).toBe("teacher");
    });

    it("returns null for non-capstone file", () => {
      expect(parseCapstoneType("unit_01_lesson_04_student.xlsx")).toBeNull();
    });
  });

  describe("buildUnitLessonKey", () => {
    it("builds correct key format", () => {
      expect(buildUnitLessonKey(1, 4)).toBe("1-4");
      expect(buildUnitLessonKey(12, 8)).toBe("12-8");
      expect(buildUnitLessonKey(1, 15)).toBe("1-15");
    });
  });

  describe("validateWorkbookManifest", () => {
    const validManifest = {
      version: 1,
      generatedAt: "2026-04-24T00:00:00Z",
      files: ["unit_01_lesson_04_student.xlsx"],
      byUnitAndLesson: {
        "1-4": { student: true, teacher: true },
      },
      byCapstone: { student: false, teacher: false },
    };

    it("returns manifest for valid input", () => {
      const result = validateWorkbookManifest(validManifest);
      expect(result).toEqual(validManifest);
    });

    it("throws for null input", () => {
      expect(() => validateWorkbookManifest(null)).toThrow("WorkbookManifest must be an object");
    });

    it("throws for non-object input", () => {
      expect(() => validateWorkbookManifest("string")).toThrow(
        "WorkbookManifest must be an object",
      );
    });

    it("throws when version is missing", () => {
      const bad = { ...validManifest, version: undefined };
      expect(() => validateWorkbookManifest(bad)).toThrow(
        "WorkbookManifest.version must be a number",
      );
    });

    it("throws when generatedAt is not a string", () => {
      const bad = { ...validManifest, generatedAt: 123 };
      expect(() => validateWorkbookManifest(bad)).toThrow(
        "WorkbookManifest.generatedAt must be a string",
      );
    });

    it("throws when files is not an array of strings", () => {
      const bad = { ...validManifest, files: [1, 2] };
      expect(() => validateWorkbookManifest(bad)).toThrow(
        "WorkbookManifest.files must be an array of strings",
      );
    });

    it("throws when byUnitAndLesson entry lacks boolean properties", () => {
      const bad = {
        ...validManifest,
        byUnitAndLesson: { "1-4": { student: "yes", teacher: true } },
      };
      expect(() => validateWorkbookManifest(bad)).toThrow(
        'WorkbookManifest.byUnitAndLesson["1-4"] must have boolean student and teacher properties',
      );
    });

    it("throws when byCapstone lacks boolean properties", () => {
      const bad = { ...validManifest, byCapstone: { student: "yes", teacher: true } };
      expect(() => validateWorkbookManifest(bad)).toThrow(
        "WorkbookManifest.byCapstone must have boolean student and teacher properties",
      );
    });
  });
});
