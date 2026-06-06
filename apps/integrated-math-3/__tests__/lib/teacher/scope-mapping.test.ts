import { describe, it, expect } from "vitest";
import {
  resolveExportScope,
  type ExportScope,
} from "../../../lib/teacher/data-export";

const STUDENT_ID = "profile_student_001" as const;
const CLASS_ID = "class_001" as const;

describe("resolveExportScope", () => {
  it("resolves a student dataset to the getStudentExport query with studentId", () => {
    const resolved = resolveExportScope({
      dataset: "student",
      studentId: STUDENT_ID,
    });

    expect(resolved.query).toBe("exports.getStudentExport");
    expect(resolved.args).toEqual({ studentId: STUDENT_ID });
  });

  it("passes startDate and endDate through to the student query args", () => {
    const resolved = resolveExportScope({
      dataset: "student",
      studentId: STUDENT_ID,
      startDate: 100,
      endDate: 200,
    });

    expect(resolved.query).toBe("exports.getStudentExport");
    expect(resolved.args).toEqual({
      studentId: STUDENT_ID,
      startDate: 100,
      endDate: 200,
    });
  });

  it("does not include classId in the student query args", () => {
    const resolved = resolveExportScope({
      dataset: "student",
      studentId: STUDENT_ID,
      classId: CLASS_ID,
    });

    expect(resolved.args).not.toHaveProperty("classId");
  });

  it("resolves a class dataset to the getClassExport query with classId", () => {
    const resolved = resolveExportScope({
      dataset: "class",
      classId: CLASS_ID,
    });

    expect(resolved.query).toBe("exports.getClassExport");
    expect(resolved.args).toEqual({ classId: CLASS_ID });
  });

  it("passes startDate and endDate through to the class query args", () => {
    const resolved = resolveExportScope({
      dataset: "class",
      classId: CLASS_ID,
      startDate: 100,
      endDate: 200,
    });

    expect(resolved.query).toBe("exports.getClassExport");
    expect(resolved.args).toEqual({
      classId: CLASS_ID,
      startDate: 100,
      endDate: 200,
    });
  });

  it("does not include studentId in the class query args", () => {
    const resolved = resolveExportScope({
      dataset: "class",
      classId: CLASS_ID,
      studentId: STUDENT_ID,
    });

    expect(resolved.args).not.toHaveProperty("studentId");
  });

  it("resolves a submissions dataset to the getSubmissionExport query with classId and endDate", () => {
    const resolved = resolveExportScope({
      dataset: "submissions",
      classId: CLASS_ID,
      endDate: 999,
    });

    expect(resolved.query).toBe("exports.getSubmissionExport");
    expect(resolved.args).toEqual({ classId: CLASS_ID, endDate: 999 });
  });

  it("passes limit through to the submissions query args when provided", () => {
    const resolved = resolveExportScope({
      dataset: "submissions",
      classId: CLASS_ID,
      endDate: 999,
      limit: 50,
    });

    expect(resolved.args).toEqual({
      classId: CLASS_ID,
      endDate: 999,
      limit: 50,
    });
  });

  it("does not include limit in args when not provided for submissions", () => {
    const resolved = resolveExportScope({
      dataset: "submissions",
      classId: CLASS_ID,
      endDate: 999,
    });

    expect(resolved.args).not.toHaveProperty("limit");
  });

  it("throws when the student dataset is missing studentId", () => {
    expect(() =>
      resolveExportScope({ dataset: "student" } as ExportScope),
    ).toThrow();
  });

  it("throws when the class dataset is missing classId", () => {
    expect(() =>
      resolveExportScope({ dataset: "class" } as ExportScope),
    ).toThrow();
  });

  it("throws when the submissions dataset is missing classId", () => {
    expect(() =>
      resolveExportScope({ dataset: "submissions", endDate: 999 } as ExportScope),
    ).toThrow();
  });

  it("throws when the submissions dataset is missing endDate", () => {
    expect(() =>
      resolveExportScope({ dataset: "submissions", classId: CLASS_ID } as ExportScope),
    ).toThrow();
  });

  it("selects a different query name per dataset", () => {
    const student = resolveExportScope({
      dataset: "student",
      studentId: STUDENT_ID,
    });
    const classResolved = resolveExportScope({
      dataset: "class",
      classId: CLASS_ID,
    });
    const submissions = resolveExportScope({
      dataset: "submissions",
      classId: CLASS_ID,
      endDate: 999,
    });

    const queries = new Set([
      student.query,
      classResolved.query,
      submissions.query,
    ]);
    expect(queries.size).toBe(3);
  });

  it("returns an object with exactly the query and args keys and no extra fields, for every dataset", () => {
    const student = resolveExportScope({
      dataset: "student",
      studentId: STUDENT_ID,
    });
    const classResolved = resolveExportScope({
      dataset: "class",
      classId: CLASS_ID,
    });
    const submissions = resolveExportScope({
      dataset: "submissions",
      classId: CLASS_ID,
      endDate: 999,
    });

    for (const resolved of [student, classResolved, submissions]) {
      expect(Object.keys(resolved).sort()).toEqual(["args", "query"]);
    }
  });

  it("names each query under the exports module path (e.g. exports.getXxxExport)", () => {
    const student = resolveExportScope({
      dataset: "student",
      studentId: STUDENT_ID,
    });
    const classResolved = resolveExportScope({
      dataset: "class",
      classId: CLASS_ID,
    });
    const submissions = resolveExportScope({
      dataset: "submissions",
      classId: CLASS_ID,
      endDate: 999,
    });

    for (const resolved of [student, classResolved, submissions]) {
      expect(resolved.query).toMatch(/^exports\.[a-zA-Z]+$/);
    }
  });
});
