import { describe, it, expect } from "vitest";
import {
  toCsv,
  formatStudentExport,
  formatClassExport,
} from "../../../lib/teacher/data-export";
import { studentExportFixture } from "../../fixtures/exports/studentExportFixture";
import { classExportFixture } from "../../fixtures/exports/classExportFixture";

describe("data-export CSV contract (snapshot)", () => {
  it("locks the formatStudentExport → toCsv column order and escaping", () => {
    const csv = toCsv(
      formatStudentExport(
        studentExportFixture as unknown as Parameters<typeof formatStudentExport>[0],
      ),
    );

    expect(csv).toMatchInlineSnapshot(
      `"RED_PHASE_PLACEHOLDER_student_csv_lock_here"`,
    );
  });

  it("locks the formatClassExport → toCsv column order and escaping", () => {
    const csv = toCsv(
      formatClassExport(
        classExportFixture as unknown as Parameters<typeof formatClassExport>[0],
      ),
    );

    expect(csv).toMatchInlineSnapshot(
      `"RED_PHASE_PLACEHOLDER_class_csv_lock_here"`,
    );
  });
});
