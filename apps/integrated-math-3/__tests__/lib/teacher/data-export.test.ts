import { describe, it, expect } from "vitest";
import { toCsv, formatStudentExport, formatClassExport } from "../../../lib/teacher/data-export";

describe("toCsv", () => {
  it("converts a basic object array to CSV with headers", () => {
    const data = [
      { name: "Alice", score: 95 },
      { name: "Bob", score: 87 },
    ];

    const result = toCsv(data);
    expect(result).toBe("name,score\nAlice,95\nBob,87");
  });

  it("escapes fields containing commas", () => {
    const data = [
      { name: "Smith, John", value: 1 },
    ];

    const result = toCsv(data);
    expect(result).toBe('name,value\n"Smith, John",1');
  });

  it("escapes fields containing double quotes", () => {
    const data = [
      { name: 'She said "hello"', value: 1 },
    ];

    const result = toCsv(data);
    expect(result).toBe('name,value\n"She said ""hello""",1');
  });

  it("escapes fields containing newlines", () => {
    const data = [
      { name: "line1\nline2", value: 1 },
    ];

    const result = toCsv(data);
    expect(result).toBe('name,value\n"line1\nline2",1');
  });

  it("handles null and undefined values as empty strings", () => {
    const data = [
      { name: "Alice", score: null, extra: undefined },
    ];

    const result = toCsv(data);
    expect(result).toBe("name,score,extra\nAlice,,");
  });

  it("returns empty string for empty array", () => {
    const result = toCsv([]);
    expect(result).toBe("");
  });

  it("handles multiple rows with consistent columns", () => {
    const data = [
      { a: "1", b: "2", c: "3" },
      { a: "4", b: "5", c: "6" },
      { a: "7", b: "8", c: "9" },
    ];

    const result = toCsv(data);
    expect(result).toBe("a,b,c\n1,2,3\n4,5,6\n7,8,9");
  });
});

describe("formatStudentExport", () => {
  it("maps student export data to correct CSV columns", () => {
    const data = {
      studentName: "Alice Johnson",
      rows: [
        {
          studentName: "Alice Johnson",
          lessonSlug: "unit-1-lesson-1",
          lessonTitle: "Introduction to Accounting",
          phasesCompleted: 3,
          totalPhases: 5,
          activityScore: 0.85,
          srsCardsNew: 10,
          srsCardsLearning: 5,
          srsCardsReview: 20,
          lastActive: 1700000000000,
        },
        {
          studentName: "Alice Johnson",
          lessonSlug: "unit-1-lesson-2",
          lessonTitle: "Debits and Credits",
          phasesCompleted: 5,
          totalPhases: 5,
          activityScore: null,
          srsCardsNew: 3,
          srsCardsLearning: 2,
          srsCardsReview: 15,
          lastActive: null,
        },
      ],
    };

    const result = formatStudentExport(data);

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      studentName: "Alice Johnson",
      lessonSlug: "unit-1-lesson-1",
      lessonTitle: "Introduction to Accounting",
      phasesCompleted: 3,
      totalPhases: 5,
      activityScore: 0.85,
      srsCardsNew: 10,
      srsCardsLearning: 5,
      srsCardsReview: 20,
      lastActive: new Date(1700000000000).toISOString(),
    });

    expect(result[1]).toEqual({
      studentName: "Alice Johnson",
      lessonSlug: "unit-1-lesson-2",
      lessonTitle: "Debits and Credits",
      phasesCompleted: 5,
      totalPhases: 5,
      activityScore: "",
      srsCardsNew: 3,
      srsCardsLearning: 2,
      srsCardsReview: 15,
      lastActive: "",
    });
  });

  it("handles empty lessons array", () => {
    const data = {
      studentName: "Bob",
      rows: [],
    };

    const result = formatStudentExport(data);
    expect(result).toEqual([]);
  });
});

describe("formatClassExport", () => {
  it("maps class export data to correct CSV columns", () => {
    const rows = [
      {
        studentId: "s1",
        studentName: "Alice",
        lessonsCompleted: 8,
        totalLessons: 10,
        overallProgress: 0.8,
        averageScore: 0.92,
      },
      {
        studentId: "s2",
        studentName: "Bob",
        lessonsCompleted: 5,
        totalLessons: 10,
        overallProgress: 0.5,
        averageScore: null,
      },
    ];

    const result = formatClassExport(rows);

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      studentName: "Alice",
      lessonsCompleted: 8,
      totalLessons: 10,
      overallProgress: 0.8,
      averageScore: 0.92,
    });

    expect(result[1]).toEqual({
      studentName: "Bob",
      lessonsCompleted: 5,
      totalLessons: 10,
      overallProgress: 0.5,
      averageScore: "",
    });
  });

  it("rounds fractional values to 4 decimal places", () => {
    const rows = [
      {
        studentId: "s1",
        studentName: "Alice",
        lessonsCompleted: 1,
        totalLessons: 3,
        overallProgress: 0.33333333,
        averageScore: 0.856789,
      },
    ];

    const result = formatClassExport(rows);

    expect(result[0].overallProgress).toBe(0.3333);
    expect(result[0].averageScore).toBe(0.8568);
  });

  it("handles empty array", () => {
    const result = formatClassExport([]);
    expect(result).toEqual([]);
  });
});
