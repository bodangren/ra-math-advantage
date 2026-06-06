export interface SubmissionExportFixtureRow {
  submissionId: string;
  studentId: string;
  studentName: string;
  activityId: string;
  componentKey: string;
  score: number | null;
  maxScore: number | null;
  submittedAt: number;
}

export const submissionExportFixture: SubmissionExportFixtureRow[] = [
  {
    submissionId: "sub_001",
    studentId: "student_001",
    studentName: "Alice Johnson",
    activityId: "activity_quiz_1",
    componentKey: "comprehension-quiz",
    score: 8,
    maxScore: 10,
    submittedAt: 1700000000000,
  },
  {
    submissionId: "sub_002",
    studentId: "student_001",
    studentName: "Alice Johnson",
    activityId: "activity_solver_1",
    componentKey: "step-by-step-solver",
    score: 9,
    maxScore: 10,
    submittedAt: 1700000010000,
  },
  {
    submissionId: "sub_003",
    studentId: "student_002",
    studentName: "Bob Smith",
    activityId: "activity_quiz_1",
    componentKey: "comprehension-quiz",
    score: null,
    maxScore: 10,
    submittedAt: 1700000020000,
  },
];
