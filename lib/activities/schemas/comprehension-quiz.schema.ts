import { z } from 'zod';

const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']).optional(),
  explanation: z.string().optional(),
});

export const comprehensionQuizSchema = z
  .object({
    questions: z.array(questionSchema).min(1),
    choices: z.record(z.string().min(1), z.array(z.string().min(1).min(2))),
    correctAnswers: z.record(z.string().min(1), z.number().int().nonnegative()),
  })
  .strict()
  .refine(
    data => {
      // Ensure all questions have corresponding choices
      const questionIds = data.questions.map(q => q.id);
      const choiceIds = Object.keys(data.choices);
      const answerIds = Object.keys(data.correctAnswers);

      return (
        questionIds.every(id => choiceIds.includes(id)) &&
        questionIds.every(id => answerIds.includes(id))
      );
    },
    {
      message: 'All questions must have corresponding choices and correct answers',
      path: ['questions'],
    },
  )
  .refine(
    data => {
      // Ensure all correct answers are within valid range for their choices
      for (const [questionId, answerIndex] of Object.entries(data.correctAnswers)) {
        const choices = data.choices[questionId];
        if (!choices || answerIndex >= choices.length) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Correct answer index must be within the range of available choices',
      path: ['correctAnswers'],
    },
  );

export type ComprehensionQuizProps = z.infer<typeof comprehensionQuizSchema>;
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
