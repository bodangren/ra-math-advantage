import { z } from 'zod';

const finiteNumber = z.number().finite();

const rowSchema = z
  .object({
    input: finiteNumber,
    output: finiteNumber,
  })
  .strict();

const optionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    startInput: finiteNumber,
    endInput: finiteNumber,
  })
  .strict();

const baseShape = {
  title: z.string().min(1).optional(),
  prompt: z.string().min(1),
  inputLabel: z.string().min(1),
  outputLabel: z.string().min(1),
  rows: z.array(rowSchema).length(5),
  options: z.array(optionSchema).length(4),
};

const workedExampleSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal('worked_example'),
    correctOptionId: z.string().min(1),
    steps: z.array(z.string().min(1)).min(2),
    finalAnswer: z.string().min(1),
  })
  .strict();

const guidedPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal('guided_practice'),
    guidedSteps: z.array(z.string().min(1)).min(2),
    fieldHelp: z.string().min(1),
  })
  .strict();

const independentPracticeSchema = z
  .object({
    ...baseShape,
    presentationMode: z.literal('independent_practice'),
  })
  .strict();

export const tableAverageRateChoiceSchema = z
  .discriminatedUnion('presentationMode', [
    workedExampleSchema,
    guidedPracticeSchema,
    independentPracticeSchema,
  ])
  .superRefine((value, context) => {
    const rowInputs = value.rows.map((row) => row.input);
    if (rowInputs.some((input, index) => index > 0 && input <= rowInputs[index - 1])) {
      context.addIssue({
        code: 'custom',
        path: ['rows'],
        message: 'Row inputs must be unique and strictly increasing.',
      });
    }

    const optionIds = value.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({ code: 'custom', path: ['options'], message: 'Option IDs must be unique.' });
    }

    for (const [index, option] of value.options.entries()) {
      if (!rowInputs.includes(option.startInput)) {
        context.addIssue({
          code: 'custom',
          path: ['options', index, 'startInput'],
          message: 'Option endpoints must match row inputs.',
        });
      }
      if (!rowInputs.includes(option.endInput)) {
        context.addIssue({
          code: 'custom',
          path: ['options', index, 'endInput'],
          message: 'Option endpoints must match row inputs.',
        });
      }
      if (!(option.startInput < option.endInput)) {
        context.addIssue({
          code: 'custom',
          path: ['options', index],
          message: 'Option startInput must be less than endInput.',
        });
      }
    }

    if (value.presentationMode === 'worked_example' && !optionIds.includes(value.correctOptionId)) {
      context.addIssue({
        code: 'custom',
        path: ['correctOptionId'],
        message: 'The correct option ID must match an option.',
      });
    }
  });

export type TableAverageRateChoiceProps = z.infer<typeof tableAverageRateChoiceSchema>;
