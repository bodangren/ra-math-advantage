export interface ClassExportFixtureRow {
  studentId: string;
  studentName: string;
  lessonsCompleted: number;
  totalLessons: number;
  overallProgress: number;
  averageScore: number | null;
}

export const classExportFixture: ClassExportFixtureRow[] = [
  {
    studentId: "student_001",
    studentName: "Alice Johnson",
    lessonsCompleted: 8,
    totalLessons: 10,
    overallProgress: 0.8,
    averageScore: 0.92,
  },
  {
    studentId: "student_002",
    studentName: 'Smith, "Bob"',
    lessonsCompleted: 5,
    totalLessons: 10,
    overallProgress: 0.5,
    averageScore: null,
  },
];
