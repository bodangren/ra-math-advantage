import { z } from 'zod';

const blankSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().nonnegative(),
  length: z.number().int().positive(),
  hint: z.string().optional(),
});

export const fillInTheBlankSchema = z
  .object({
    template: z.string().min(1),
    blanks: z.array(blankSchema).min(1),
    answers: z.record(z.string().min(1), z.array(z.string().min(1)).min(1)),
  })
  .strict()
  .refine(
    data => {
      // Ensure template contains at least one blank placeholder (___)
      return data.template.includes('___');
    },
    {
      message: 'Template must contain at least one blank placeholder (___)',
      path: ['template'],
    },
  )
  .refine(
    data => {
      // Ensure all blank positions are within template bounds
      const templateLength = data.template.length;
      return data.blanks.every(blank => blank.position < templateLength);
    },
    {
      message: 'Blank position must be within template bounds',
      path: ['blanks'],
    },
  )
  .refine(
    data => {
      // Ensure all blanks have corresponding answers
      const blankIds = data.blanks.map(b => b.id);
      const answerIds = Object.keys(data.answers);
      return blankIds.every(id => answerIds.includes(id));
    },
    {
      message: 'All blanks must have corresponding answers',
      path: ['answers'],
    },
  );

export type FillInTheBlankProps = z.infer<typeof fillInTheBlankSchema>;
