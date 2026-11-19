export interface StudyTerm {
  term: string;
  definition: string;
  slug: string;
}

export type StudySessionRating = "again" | "hard" | "good" | "easy";

export interface StudySessionResult {
  itemsSeen: number;
  itemsCorrect: number;
  itemsIncorrect: number;
  durationSeconds: number;
}

export type StudySessionState = "prompt" | "flip" | "complete";

export const RATING_DELTAS: Record<StudySessionRating, { delta: number; isCorrect: boolean }> = {
  again: { delta: -0.2, isCorrect: false },
  hard: { delta: -0.05, isCorrect: true },
  good: { delta: 0.1, isCorrect: true },
  easy: { delta: 0.2, isCorrect: true },
} as const;
