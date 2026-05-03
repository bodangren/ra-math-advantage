import { z } from 'zod';

import { resolveActivityComponentKey } from '../../activities/component-keys';
import { activityPropsSchemas, gradingConfigSchema } from './activity-props';

function addActivityPropsIssues(
  ctx: z.RefinementCtx,
  componentKey: string,
  props: unknown,
) {
  const canonicalComponentKey = resolveActivityComponentKey(componentKey);

  if (!canonicalComponentKey || !(canonicalComponentKey in activityPropsSchemas)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['componentKey'],
      message: `Unknown activity component: ${componentKey}`,
    });
    return;
  }

  const result = activityPropsSchemas[canonicalComponentKey].safeParse(props);
  if (result.success) {
    return;
  }

  result.error.issues.forEach((issue) => {
    ctx.addIssue({
      ...issue,
      path: ['props', ...issue.path],
    });
  });
}

export const selectActivitySchema = z.object({
  id: z.string(),
  componentKey: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  props: z.unknown(),
  gradingConfig: gradingConfigSchema.nullable(),
  standardId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).superRefine((activity, ctx) => {
  addActivityPropsIssues(ctx, activity.componentKey, activity.props);
});

export type Activity = z.infer<typeof selectActivitySchema>;
