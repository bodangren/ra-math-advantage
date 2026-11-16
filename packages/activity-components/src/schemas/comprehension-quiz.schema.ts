import { z } from 'zod';

const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'select_all']).optional(),
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).optional(),
  correctAnswer: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  explanation: z.string().optional(),
});

export const comprehensionQuizSchema = z
  .object({
    activityId: z.string().min(1).optional(),
    questions: z.array(questionSchema).min(1),
  })
  .strict();

export type ComprehensionQuizProps = z.infer<typeof comprehensionQuizSchema>;
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'select_all';
