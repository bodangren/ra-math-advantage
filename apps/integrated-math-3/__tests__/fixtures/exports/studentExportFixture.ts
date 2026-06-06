export interface StudentExportFixtureData {
  studentName: string;
  rows: Array<{
    studentName: string;
    lessonSlug: string;
    lessonTitle: string;
    phasesCompleted: number;
    totalPhases: number;
    activityScore: number | null;
    srsCardsNew: number;
    srsCardsLearning: number;
    srsCardsReview: number;
    lastActive: number | null;
  }>;
}

export const studentExportFixture: StudentExportFixtureData = {
  studentName: 'O\'Brien, "Junior"',
  rows: [
    {
      studentName: 'O\'Brien, "Junior"',
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
      studentName: 'O\'Brien, "Junior"',
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
    {
      studentName: 'O\'Brien, "Junior"',
      lessonSlug: "unit-1-lesson-3",
      lessonTitle: "Trial Balance Basics",
      phasesCompleted: 1,
      totalPhases: 4,
      activityScore: 0.5,
      srsCardsNew: 7,
      srsCardsLearning: 4,
      srsCardsReview: 9,
      lastActive: 1699000000000,
    },
  ],
};
