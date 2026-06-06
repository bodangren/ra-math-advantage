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
      `
      "studentName,lessonSlug,lessonTitle,phasesCompleted,totalPhases,activityScore,srsCardsNew,srsCardsLearning,srsCardsReview,lastActive
      "O'Brien, ""Junior""",unit-1-lesson-1,Introduction to Accounting,3,5,0.85,10,5,20,2023-11-14T22:13:20.000Z
      "O'Brien, ""Junior""",unit-1-lesson-2,Debits and Credits,5,5,,3,2,15,
      "O'Brien, ""Junior""",unit-1-lesson-3,Trial Balance Basics,1,4,0.5,7,4,9,2023-11-03T08:26:40.000Z"
    `,
    );
  });

  it("locks the formatClassExport → toCsv column order and escaping", () => {
    const csv = toCsv(
      formatClassExport(
        classExportFixture as unknown as Parameters<typeof formatClassExport>[0],
      ),
    );

    expect(csv).toMatchInlineSnapshot(
      `
      "studentName,lessonsCompleted,totalLessons,overallProgress,averageScore
      Alice Johnson,8,10,0.8,0.92
      "Smith, ""Bob""",5,10,0.5,"
    `,
    );
  });
});
