import { z } from 'zod';
import { graphingExplorerSchema } from './graphing-explorer.schema';
import { stepByStepSolverSchema } from './step-by-step-solver.schema';
import { comprehensionQuizSchema } from './comprehension-quiz.schema';
import { fillInTheBlankSchema } from './fill-in-the-blank.schema';
import { rateOfChangeCalculatorSchema } from './rate-of-change-calculator.schema';
import { discriminantAnalyzerSchema } from './discriminant-analyzer.schema';

export type ActivityComponentKey =
  | 'graphing-explorer'
  | 'step-by-step-solver'
  | 'comprehension-quiz'
  | 'fill-in-the-blank'
  | 'rate-of-change-calculator'
  | 'discriminant-analyzer';

const SCHEMA_REGISTRY: Record<ActivityComponentKey, z.ZodSchema> = {
  'graphing-explorer': graphingExplorerSchema,
  'step-by-step-solver': stepByStepSolverSchema,
  'comprehension-quiz': comprehensionQuizSchema,
  'fill-in-the-blank': fillInTheBlankSchema,
  'rate-of-change-calculator': rateOfChangeCalculatorSchema,
  'discriminant-analyzer': discriminantAnalyzerSchema,
};

export function getPropsSchema(key: string): z.ZodSchema | undefined {
  return SCHEMA_REGISTRY[key as ActivityComponentKey];
}

export * from './graphing-explorer.schema';
export * from './step-by-step-solver.schema';
export * from './comprehension-quiz.schema';
export * from './fill-in-the-blank.schema';
export * from './rate-of-change-calculator.schema';
export * from './discriminant-analyzer.schema';
