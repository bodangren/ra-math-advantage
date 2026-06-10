import { describe, expect, it } from 'vitest';

import { gradingConfigSchema } from '@/lib/schemas/activity-props';
import { categorizationActivityPropsSchemas } from '@/lib/schemas/activities-categorization';
import {
  activityPropsSchemas,
  gradingConfigSchema as barrelGradingConfigSchema,
} from '@/lib/schemas/activity-props';
import { quizActivityPropsSchemas } from '@/lib/schemas/activities-quiz';
import { simulationActivityPropsSchemas } from '@/lib/schemas/activities-simulation';
import { spreadsheetActivityPropsSchemas } from '@/lib/schemas/activities-spreadsheet';

describe('activities schema decomposition', () => {
  it('exports grading schema from activity-props', () => {
    const parsed = gradingConfigSchema.safeParse({ autoGrade: true, partialCredit: false });
    expect(parsed.success).toBe(true);
  });

  it('exports spreadsheet domain schemas', () => {
    expect(spreadsheetActivityPropsSchemas.spreadsheet).toBeDefined();
    expect(spreadsheetActivityPropsSchemas['spreadsheet-evaluator']).toBeDefined();

    const parsed = spreadsheetActivityPropsSchemas.spreadsheet.safeParse({
      template: 'trial-balance',
    });
    expect(parsed.success).toBe(true);
  });

  it('exports quiz/comprehension schemas', () => {
    expect(quizActivityPropsSchemas['comprehension-quiz']).toBeDefined();
    expect(quizActivityPropsSchemas['fill-in-the-blank']).toBeDefined();
  });

  it('exports categorization schemas', () => {
    expect(categorizationActivityPropsSchemas['percentage-calculation-sorting']).toBeDefined();
    expect(categorizationActivityPropsSchemas['inventory-flow-diagram']).toBeDefined();
    expect(categorizationActivityPropsSchemas['cash-flow-timeline']).toBeDefined();
    expect(categorizationActivityPropsSchemas['classification']).toBeDefined();
  });

  it('exports simulation schemas', () => {
    expect(simulationActivityPropsSchemas['lemonade-stand']).toBeDefined();
    expect(simulationActivityPropsSchemas['startup-journey']).toBeDefined();
  });

  it('aggregates all domains through activity-props barrel', () => {
    expect(activityPropsSchemas['comprehension-quiz']).toBeDefined();
    expect(activityPropsSchemas['spreadsheet']).toBeDefined();
    expect(activityPropsSchemas['percentage-calculation-sorting']).toBeDefined();
    expect(activityPropsSchemas['lemonade-stand']).toBeDefined();
    expect(activityPropsSchemas['classification']).toBeDefined();

    expect(barrelGradingConfigSchema).toBe(gradingConfigSchema);
  });
});
