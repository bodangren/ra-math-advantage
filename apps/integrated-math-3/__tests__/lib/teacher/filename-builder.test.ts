import { describe, it, expect } from "vitest";
import {
  buildExportFilename,
  type ExportDataset,
  type ExportFormat,
} from "../../../lib/teacher/data-export";

const NOV_14_2023_UTC = Date.UTC(2023, 10, 14, 12, 0, 0);
const JAN_5_2024_UTC = Date.UTC(2024, 0, 5, 0, 0, 0);

describe("buildExportFilename", () => {
  it("builds a basic filename from class, dataset, date, and format", () => {
    const filename = buildExportFilename({
      className: "Algebra 1",
      dataset: "student",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toBe("Algebra 1-student-2023-11-14.csv");
  });

  it("zero-pads single-digit month and day in the date", () => {
    const filename = buildExportFilename({
      className: "Algebra 1",
      dataset: "student",
      format: "csv",
      date: JAN_5_2024_UTC,
    });

    expect(filename).toBe("Algebra 1-student-2024-01-05.csv");
  });

  it("uses .json extension when format is json", () => {
    const filename = buildExportFilename({
      className: "Algebra 1",
      dataset: "class",
      format: "json",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toMatch(/\.json$/);
    expect(filename).not.toMatch(/\.csv$/);
  });

  it("uses .csv extension when format is csv", () => {
    const filename = buildExportFilename({
      className: "Algebra 1",
      dataset: "submissions",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toMatch(/\.csv$/);
  });

  it("replaces forward slashes in the class name with dashes", () => {
    const filename = buildExportFilename({
      className: "Period 3/4",
      dataset: "class",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toBe("Period 3-4-class-2023-11-14.csv");
    expect(filename).not.toContain("/");
  });

  it("collapses runs of whitespace in the class name to a single space", () => {
    const filename = buildExportFilename({
      className: "  Algebra   1  ",
      dataset: "student",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toBe("Algebra 1-student-2023-11-14.csv");
  });

  it("preserves unicode characters in the class name", () => {
    const filename = buildExportFilename({
      className: "Álgebra 1",
      dataset: "student",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toBe("Álgebra 1-student-2023-11-14.csv");
  });

  it("accepts a Date object equivalent to a millisecond timestamp", () => {
    const fromDate = buildExportFilename({
      className: "Algebra 1",
      dataset: "student",
      format: "csv",
      date: new Date(NOV_14_2023_UTC),
    });
    const fromNumber = buildExportFilename({
      className: "Algebra 1",
      dataset: "student",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(fromDate).toBe(fromNumber);
  });

  it("is deterministic for the same input across calls", () => {
    const input = {
      className: "Algebra 1",
      dataset: "class" as ExportDataset,
      format: "csv" as ExportFormat,
      date: NOV_14_2023_UTC,
    };

    expect(buildExportFilename(input)).toBe(buildExportFilename(input));
  });

  it("produces a different filename for a different dataset given the same other inputs", () => {
    const base = {
      className: "Algebra 1",
      format: "csv" as ExportFormat,
      date: NOV_14_2023_UTC,
    };

    expect(buildExportFilename({ ...base, dataset: "student" })).not.toBe(
      buildExportFilename({ ...base, dataset: "class" }),
    );
    expect(buildExportFilename({ ...base, dataset: "submissions" })).not.toBe(
      buildExportFilename({ ...base, dataset: "class" }),
    );
  });

  it("embeds the date in YYYY-MM-DD format using UTC components", () => {
    const filename = buildExportFilename({
      className: "Algebra 1",
      dataset: "student",
      format: "csv",
      date: JAN_5_2024_UTC,
    });

    expect(filename).toContain("-2024-01-05.");
    expect(filename).not.toContain("2024-1-5");
  });

  it("combines all sanitization rules: trim, collapse whitespace, replace slashes, preserve unicode", () => {
    const filename = buildExportFilename({
      className: "  \u00c1lgebra   /  1  ",
      dataset: "student",
      format: "csv",
      date: NOV_14_2023_UTC,
    });

    expect(filename).toBe("\u00c1lgebra - 1-student-2023-11-14.csv");
    expect(filename).not.toMatch(/\s\s/);
    expect(filename).not.toContain("/");
    expect(filename.startsWith(" ")).toBe(false);
    expect(filename.startsWith("\u00c1lgebra")).toBe(true);
  });
});
