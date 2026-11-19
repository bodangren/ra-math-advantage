import { convexToJson } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from "@math-platform/practice-core/contract";

export const LESSON_1_6_QUIZ_SLUG = "module-1-lesson-6";
export const LESSON_1_6_QUIZ_PHASE = 10;
export const LESSON_1_6_QUIZ_SEQUENCE = 2;

const privateQuestions = [
  {
    id: "discriminant-purpose",
    type: "multiple_choice" as const,
    prompt: "What does the discriminant tell you?",
    options: [
      "The sum of the roots",
      "The number and type of solutions",
      "The product of the roots",
      "The axis of symmetry",
    ],
    correctAnswer: "The number and type of solutions",
  },
  {
    id: "zero-discriminant-real-solution-count",
    type: "multiple_choice" as const,
    prompt: "If D = 0, how many real solutions are there?",
    options: ["0", "1", "2", "Cannot determine"],
    correctAnswer: "1",
  },
] as const;

export const lesson16QuizPrivateProps = () => structuredClone({ questions: privateQuestions });
export const lesson16QuizPublicProps = () => ({
  questions: privateQuestions.map(({ correctAnswer: _answer, ...question }) => ({
    ...question,
    options: [...question.options],
  })),
});
export const isExactLesson16QuizProps = (value: unknown) =>
  JSON.stringify(convexToJson(value as never)) ===
  JSON.stringify(convexToJson(lesson16QuizPrivateProps() as never));
export const isExactLesson16QuizPublicProps = (value: unknown) =>
  JSON.stringify(value) === JSON.stringify(lesson16QuizPublicProps());

const ids = privateQuestions.map((question) => question.id);
const scalar = (value: unknown): value is string => typeof value === "string";

export function isLesson16QuizRequest(value: PracticeSubmissionEnvelope): boolean {
  if (
    value.mode !== "independent_practice" ||
    value.status !== "submitted" ||
    Object.keys(value.answers).sort().join("|") !== [...ids].sort().join("|") ||
    value.parts.length !== 2 ||
    new Set(value.parts.map((part) => part.partId)).size !== 2
  )
    return false;
  return ids.every((id) => {
    const answer = value.answers[id];
    const part = value.parts.find((candidate) => candidate.partId === id);
    const question = privateQuestions.find((candidate) => candidate.id === id)!;
    return (
      scalar(answer) &&
      question.options.includes(answer as never) &&
      part !== undefined &&
      scalar(part.rawAnswer) &&
      Object.is(answer, part.rawAnswer) &&
      part.isCorrect === undefined &&
      part.score === undefined &&
      part.maxScore === undefined
    );
  });
}

export function gradeLesson16Quiz(value: PracticeSubmissionEnvelope): PracticeSubmissionEnvelope {
  if (!isLesson16QuizRequest(value)) throw new Error("Invalid Lesson 1.6 quiz response envelope");
  return {
    ...value,
    status: "graded",
    parts: privateQuestions.map((question) => {
      const rawAnswer = value.answers[question.id];
      const isCorrect = rawAnswer === question.correctAnswer;
      return { partId: question.id, rawAnswer, isCorrect, score: isCorrect ? 1 : 0, maxScore: 1 };
    }),
  };
}

export function canonicalLesson16QuizRequest(value: PracticeSubmissionEnvelope): string {
  const parts = [...value.parts]
    .sort((a, b) => a.partId.localeCompare(b.partId))
    .map(({ isCorrect: _correct, score: _score, maxScore: _max, ...part }) => part);
  return JSON.stringify(convexToJson({ ...value, status: "submitted", parts } as never));
}

export function validLesson16QuizRow(
  row: Doc<"activity_submissions">,
  userId: string,
  activityId: string,
): boolean {
  const parsed = practiceSubmissionEnvelopeSchema.safeParse(row.submissionData);
  if (!parsed.success) return false;
  const envelope = parsed.data;
  if (
    JSON.stringify(convexToJson(row.submissionData as never)) !==
    JSON.stringify(convexToJson(envelope as never))
  )
    return false;
  if (
    row.userId !== userId ||
    row.activityId !== activityId ||
    !row.idempotencyKey?.trim() ||
    row.idempotencyKey.length > 80 ||
    !Number.isSafeInteger(row.attemptOrdinal) ||
    (row.attemptOrdinal ?? 0) < 1 ||
    !Number.isFinite(row.createdAt) ||
    !Number.isFinite(row.updatedAt) ||
    !Number.isFinite(row.submittedAt) ||
    !Number.isFinite(row.gradedAt) ||
    row.createdAt > row.updatedAt ||
    row.submittedAt !== row.updatedAt ||
    row.gradedAt !== row.updatedAt ||
    row.masteryContractVersion !== undefined ||
    envelope.contractVersion !== "practice.v1" ||
    envelope.mode !== "independent_practice" ||
    envelope.status !== "graded" ||
    envelope.activityId !== activityId ||
    envelope.attemptNumber !== row.attemptOrdinal ||
    Number.isNaN(Date.parse(envelope.submittedAt)) ||
    new Date(envelope.submittedAt).toISOString() !== envelope.submittedAt ||
    envelope.parts.length !== 2 ||
    !Number.isInteger(row.score) ||
    (row.score ?? -1) < 0 ||
    (row.score ?? 3) > 2 ||
    row.maxScore !== 2
  )
    return false;
  const parts = envelope.parts;
  if (
    new Set(parts.map((part) => part.partId)).size !== 2 ||
    Object.keys(envelope.answers).sort().join("|") !== [...ids].sort().join("|")
  )
    return false;
  for (const question of privateQuestions) {
    const part = parts.find((candidate) => candidate.partId === question.id);
    const answer = envelope.answers[question.id];
    const correct = answer === question.correctAnswer;
    if (
      !scalar(answer) ||
      !question.options.includes(answer as never) ||
      !part ||
      !Object.is(part.rawAnswer, answer) ||
      part.isCorrect !== correct ||
      part.score !== (correct ? 1 : 0) ||
      part.maxScore !== 1
    )
      return false;
  }
  return row.score === parts.reduce((sum, part) => sum + (part.score ?? 0), 0);
}
