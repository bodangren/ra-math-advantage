import { z } from 'zod';

export const PracticeSubmissionPartSchema = z.object({
  partId: z.string(),
  rawAnswer: z.unknown(),
  normalizedAnswer: z.string().optional(),
  isCorrect: z.boolean().optional(),
  score: z.number().optional(),
  maxScore: z.number().optional(),
  misconceptionTags: z.array(z.string()).optional(),
  hintsUsed: z.number().optional(),
  revealStepsSeen: z.number().optional(),
  changedCount: z.number().optional(),
});

export type PracticeSubmissionPart = z.infer<typeof PracticeSubmissionPartSchema>;

export const PracticeSubmissionEnvelopeSchema = z.object({
  contractVersion: z.literal('practice.v1'),
  activityId: z.string(),
  mode: z.enum(['teaching', 'guided', 'practice']),
  status: z.enum(['draft', 'submitted', 'graded', 'returned']),
  attemptNumber: z.number().int().positive(),
  submittedAt: z.string(),
  answers: z.record(z.string(), z.unknown()),
  parts: z.array(PracticeSubmissionPartSchema),
  artifact: z.record(z.string(), z.unknown()).optional(),
  interactionHistory: z.array(z.object({
    type: z.string(),
    timestamp: z.number(),
    data: z.unknown().optional(),
  })).optional(),
  analytics: z.record(z.string(), z.unknown()).optional(),
  studentFeedback: z.string().optional(),
  teacherSummary: z.string().optional(),
});

export type PracticeSubmissionEnvelope = z.infer<typeof PracticeSubmissionEnvelopeSchema>;
