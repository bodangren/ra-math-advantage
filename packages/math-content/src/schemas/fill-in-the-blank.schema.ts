import { z } from 'zod';

const BLANK_PLACEHOLDER_REGEX = /\{\{blank:(\w+)\}\}/g;

const blankSchema = z.object({
  id: z.string().min(1),
  correctAnswer: z.string().min(1),
  isMath: z.boolean().optional(),
});

export const fillInTheBlankSchema = z
  .object({
    activityId: z.string().min(1).optional(),
    template: z.string().min(1),
    blanks: z.array(blankSchema).min(1),
    wordBank: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string().min(1),
        }),
      )
      .optional(),
  })
  .strict()
  .refine(
    data => {
      const templateIds: string[] = [];
      let match;
      BLANK_PLACEHOLDER_REGEX.lastIndex = 0;
      while ((match = BLANK_PLACEHOLDER_REGEX.exec(data.template)) !== null) {
        templateIds.push(match[1]);
      }
      const blankIds = data.blanks.map(b => b.id);
      return templateIds.length > 0 && templateIds.every(id => blankIds.includes(id));
    },
    {
      message: 'Template must contain {{blank:id}} markers matching all blank IDs',
      path: ['template'],
    },
  );

export type FillInTheBlankProps = z.infer<typeof fillInTheBlankSchema>;
