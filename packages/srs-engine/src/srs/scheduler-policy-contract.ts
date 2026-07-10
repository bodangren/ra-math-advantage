import { z } from 'zod';

/** Contract version for the v3.1 scheduler-policy additions. */
export const SCHEDULER_POLICY_VERSION = 'scheduler-policy.v3.1' as const;

/** Canonical provenance for the exact built-in ts-fsrs v5 parameter set. */
export const BUILTIN_FSRS_PARAMS_VERSION = 'fsrs-defaults.ts-fsrs.v5.4.1' as const;

export const OBJECTIVE_PRIORITIES = [
  'essential',
  'supporting',
  'extension',
  'triaged',
] as const;

export const objectivePrioritySchema = z.enum(OBJECTIVE_PRIORITIES);

const requestedRetentionSchema = z.number().finite().gt(0).lte(1);

/**
 * Normative §12.3 defaults for schedulable priorities. Triaged objectives are
 * omitted because the product contract excludes them from scheduling; a
 * caller may still provide an explicit value for migration compatibility.
 */
export const DEFAULT_REQUEST_RETENTION_BY_PRIORITY = Object.freeze({
  essential: 0.95,
  supporting: 0.9,
  extension: 0.8,
});

export const requestRetentionByPrioritySchema = z.strictObject({
  essential: requestedRetentionSchema.optional(),
  supporting: requestedRetentionSchema.optional(),
  extension: requestedRetentionSchema.optional(),
  triaged: requestedRetentionSchema.optional(),
});

/**
 * Additive v3.1 scheduler configuration. Omitting the priority map deliberately
 * retains the pre-v3.1 scalar behavior.
 */
export const schedulerConfigSchema = z.strictObject({
  requestRetention: requestedRetentionSchema,
  requestRetentionByPriority: requestRetentionByPrioritySchema.optional(),
  maximumInterval: z.number().int().positive(),
  enableShortTermPreview: z.boolean(),
  siblingReinforcement: z.boolean().optional(),
});

export type ObjectivePriorityV31 = z.infer<typeof objectivePrioritySchema>;
export type RequestRetentionByPriority = z.infer<typeof requestRetentionByPrioritySchema>;
export type SchedulerConfigV31 = z.infer<typeof schedulerConfigSchema>;

/**
 * Validate and deterministically expand an opted-in priority map. An absent map
 * remains absent so legacy scalar callers keep exactly their prior semantics.
 */
export function normalizeSchedulerConfig(input: unknown): SchedulerConfigV31 {
  const parsed = schedulerConfigSchema.parse(input);
  if (parsed.requestRetentionByPriority === undefined) return { ...parsed };

  return {
    ...parsed,
    requestRetentionByPriority: {
      ...DEFAULT_REQUEST_RETENTION_BY_PRIORITY,
      ...parsed.requestRetentionByPriority,
    },
  };
}

/** Resolve the target actually supplied to FSRS for an objective priority. */
export function resolveRequestedRetention(
  config: SchedulerConfigV31,
  priority: ObjectivePriorityV31,
): number {
  const normalized = normalizeSchedulerConfig(config);
  return normalized.requestRetentionByPriority?.[priority]
    ?? normalized.requestRetention;
}

export function isSchedulerConfigV31(value: unknown): value is SchedulerConfigV31 {
  return schedulerConfigSchema.safeParse(value).success;
}

/**
 * Version identifier of the exact FSRS parameter set used to schedule a card.
 * It is persisted on every review log so replay evaluation can attribute the
 * prediction to the correct fitted/default parameter artifact (§12.10, §17.2).
 */
export const paramsVersionSchema = z.string()
  .min(1)
  .max(200)
  .refine((value) => value.trim() === value && value.length > 0, {
    message: 'paramsVersion must be non-blank and have no surrounding whitespace',
  });

/** Standalone strict stamp intended to be spread onto a review-log entry. */
export const paramsVersionStampSchema = z.strictObject({
  paramsVersion: paramsVersionSchema,
});

export type ParamsVersionStampV31 = z.infer<typeof paramsVersionStampSchema>;

export function createParamsVersionStamp(paramsVersion: string): ParamsVersionStampV31 {
  return paramsVersionStampSchema.parse({ paramsVersion });
}

export function isParamsVersionStampV31(value: unknown): value is ParamsVersionStampV31 {
  return paramsVersionStampSchema.safeParse(value).success;
}

/** Guard a full review-log-like object without accepting an inherited stamp. */
export function hasStampedParamsVersion(
  value: unknown,
): value is Record<string, unknown> & ParamsVersionStampV31 {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!Object.prototype.hasOwnProperty.call(value, 'paramsVersion')) return false;
  return paramsVersionSchema.safeParse(
    (value as Record<string, unknown>).paramsVersion,
  ).success;
}
