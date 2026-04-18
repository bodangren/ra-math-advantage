import { z } from 'zod';

const SOURCE_TYPES = ['table', 'function', 'graph'] as const;

const tableDataSchema = z.object({
  x: z.array(z.number()).min(2),
  y: z.array(z.number()).min(2),
});

const functionDataSchema = z.object({
  expression: z.string().min(1),
});

const graphDataSchema = z.object({
  points: z.array(z.tuple([z.number(), z.number()])).min(2),
});

const intervalSchema = z.object({
  start: z.number(),
  end: z.number(),
});

export const rateOfChangeCalculatorSchema = z
  .object({
    sourceType: z.enum(SOURCE_TYPES),
    data: z.union([tableDataSchema, functionDataSchema, graphDataSchema]),
    interval: intervalSchema,
  })
  .strict()
  .refine(
    data => {
      // Validate interval start < end
      return data.interval.start < data.interval.end;
    },
    {
      message: 'Interval start must be less than end',
      path: ['interval'],
    },
  )
  .refine(
    data => {
      // For table data, ensure x and y arrays have same length
      if (data.sourceType === 'table' && 'x' in data.data && 'y' in data.data) {
        return data.data.x.length === data.data.y.length;
      }
      return true;
    },
    {
      message: 'Table data x and y arrays must have the same length',
      path: ['data'],
    },
  );

export type RateOfChangeCalculatorProps = z.infer<typeof rateOfChangeCalculatorSchema>;
export type SourceType = (typeof SOURCE_TYPES)[number];
