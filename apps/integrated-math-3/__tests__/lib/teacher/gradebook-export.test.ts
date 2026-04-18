import { describe, it, expect } from 'vitest';
import { buildGradebookCsv, type GradebookCsvOptions } from '@/lib/teacher/gradebook-export';
import type { GradebookRow, GradebookLesson } from '@/lib/teacher/gradebook';

describe('buildGradebookCsv', () => {
  const lessons: GradebookLesson[] = [
    { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
    { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false },
  ];

  const rows: GradebookRow[] = [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        { lesson: lessons[0], completionStatus: 'completed', masteryLevel: 95, color: 'green' },
        { lesson: lessons[1], completionStatus: 'in_progress', masteryLevel: 70, color: 'yellow' },
      ],
    },
    {
      studentId: 's2',
      displayName: 'Bob Smith',
      username: 'bob',
      cells: [
        { lesson: lessons[0], completionStatus: 'not_started', masteryLevel: null, color: 'gray' },
        { lesson: lessons[1], completionStatus: 'completed', masteryLevel: 85, color: 'green' },
      ],
    },
  ];

  it('generates CSV with headers', () => {
    const csv = buildGradebookCsv(rows, lessons);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Student,Username,Intro to Quadratics,Graphing Quadratics');
  });

  it('includes student names and usernames', () => {
    const csv = buildGradebookCsv(rows, lessons);
    expect(csv).toContain('Alice Johnson');
    expect(csv).toContain('alice');
    expect(csv).toContain('Bob Smith');
    expect(csv).toContain('bob');
  });

  it('includes mastery levels', () => {
    const csv = buildGradebookCsv(rows, lessons);
    expect(csv).toContain('95');
    expect(csv).toContain('70');
    expect(csv).toContain('85');
  });

  it('handles null mastery levels as empty string', () => {
    const csv = buildGradebookCsv(rows, lessons);
    const lines = csv.split('\n');
    const bobRow = lines.find(line => line.includes('Bob Smith'))!;
    expect(bobRow).toBe('Bob Smith,bob,,85');
  });

  it('escapes values with commas', () => {
    const rowsWithComma: GradebookRow[] = [
      {
        studentId: 's1',
        displayName: 'Alice, Johnson',
        username: 'alice',
        cells: rows[0].cells,
      },
    ];
    const csv = buildGradebookCsv(rowsWithComma, lessons);
    expect(csv).toContain('"Alice, Johnson"');
  });

  it('escapes values with quotes', () => {
    const rowsWithQuotes: GradebookRow[] = [
      {
        studentId: 's1',
        displayName: 'Alice "Boss" Johnson',
        username: 'alice',
        cells: rows[0].cells,
      },
    ];
    const csv = buildGradebookCsv(rowsWithQuotes, lessons);
    expect(csv).toContain('"Alice ""Boss"" Johnson"');
  });

  it('excludes mastery levels when option is false', () => {
    const options: GradebookCsvOptions = { includeMasteryLevel: false };
    const csv = buildGradebookCsv(rows, lessons, options);
    expect(csv).not.toContain('95');
    expect(csv).not.toContain('70');
  });

  it('includes color coding status when option is true', () => {
    const options: GradebookCsvOptions = { includeColorCoding: true };
    const csv = buildGradebookCsv(rows, lessons, options);
    expect(csv).toContain('Completed');
    expect(csv).toContain('In Progress');
    expect(csv).toContain('Not Started');
  });

  it('returns empty string for empty rows', () => {
    const csv = buildGradebookCsv([], lessons);
    expect(csv).toBe('Student,Username,Intro to Quadratics,Graphing Quadratics');
  });

  it('handles lesson titles with special characters', () => {
    const specialLessons: GradebookLesson[] = [
      { lessonId: 'l1', lessonTitle: 'Lesson "Special" Title', orderIndex: 1, isUnitTest: false },
    ];
    const rowsWithSpecial: GradebookRow[] = [
      {
        studentId: 's1',
        displayName: 'Test Student',
        username: 'test',
        cells: [{ lesson: specialLessons[0], completionStatus: 'completed', masteryLevel: 100, color: 'green' }],
      },
    ];
    const csv = buildGradebookCsv(rowsWithSpecial, specialLessons);
    expect(csv).toContain('"Lesson ""Special"" Title"');
  });
});
