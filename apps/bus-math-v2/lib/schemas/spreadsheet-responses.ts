import { z } from 'zod';

// Zod schema for spreadsheet cell data
export const spreadsheetCellSchema = z.object({
  value: z.union([z.string(), z.number()]).optional(),
  readOnly: z.boolean().optional(),
  className: z.string().optional(),
});

export const spreadsheetDataSchema = z.array(z.array(spreadsheetCellSchema.nullable()));

export type SpreadsheetData = z.infer<typeof spreadsheetDataSchema>;

// Validation result schema
export const validationResultSchema = z.object({
  isComplete: z.boolean(),
  totalCells: z.number().int().nonnegative(),
  correctCells: z.number().int().nonnegative(),
  feedback: z.array(
    z.object({
      cell: z.string(),
      isCorrect: z.boolean(),
      message: z.string().optional(),
      expectedValue: z.union([z.string(), z.number()]).optional(),
      actualValue: z.union([z.string(), z.number()]).optional(),
    })
  ),
  timestamp: z.string().datetime(),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;
