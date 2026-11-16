import { z } from 'zod';

import { plannerRankingModeV3_2Schema } from './v3-2-contract';

const EPSILON = 1e-9;
const idSchema = z.string().min(1).refine((value) => value.trim() === value, {
  message: 'Identifiers must not have surrounding whitespace',
});
const scalarSchema = z.union([z.string(), z.number().finite(), z.boolean(), z.null()]);

export const learnerUtilityContextV3_2Schema = z
  .object({
    schemaVersion: z.literal('planner.learner-context.v3.2'),
    learnerId: idSchema,
    domain: idSchema,
    asOf: z.string().datetime({ offset: true }),
    attributes: z.record(z.string(), scalarSchema).default({}),
  })
  .strict();

export const utilitySignalV3_2Schema = z
  .object({
    source: idSchema,
    sourceVersion: idSchema,
    value: z.number().finite(),
    weight: z.number().finite().min(0),
  })
  .strict();

export const utilityProviderResultV3_2Schema = z
  .object({
    utility: z.number().finite().min(0).max(1),
    signals: z.array(utilitySignalV3_2Schema).min(1),
  })
  .strict()
  .superRefine((result, ctx) => {
    if (result.signals.every((signal) => signal.weight === 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['signals'],
        message: 'At least one provenance signal must contribute positive weight',
      });
    }
  });

export type LearnerUtilityContextV3_2 = z.infer<typeof learnerUtilityContextV3_2Schema>;
export type UtilitySignalV3_2 = z.infer<typeof utilitySignalV3_2Schema>;
export type UtilityProviderResultV3_2 = z.infer<typeof utilityProviderResultV3_2Schema>;

export const utilityReleaseIdentityV3_2Schema = z
  .object({
    domain: idSchema,
    graphReleaseId: idSchema,
    graphContentHash: idSchema,
    precomputeInputHash: idSchema,
  })
  .strict();

export interface DomainUtilityProviderV3_2 {
  readonly providerKey: string;
  readonly version: string;
  getUtility(
    nodeId: string,
    context: LearnerUtilityContextV3_2,
  ): UtilityProviderResultV3_2;
}

const providerResolutionSchema = z
  .object({
    schemaVersion: z.literal('planner.utility-resolution.v3.2'),
    kind: z.literal('provider'),
    releaseIdentity: utilityReleaseIdentityV3_2Schema,
    providerKey: idSchema,
    providerVersion: idSchema,
    utility: z.number().finite().min(0).max(1),
    signals: z.array(utilitySignalV3_2Schema).min(1),
    weightsRenormalized: z.literal(false),
  })
  .strict()
  .superRefine((result, ctx) => {
    if (result.signals.every((signal) => signal.weight === 0)) {
      ctx.addIssue({ code: 'custom', path: ['signals'], message: 'Provider signals need positive total weight' });
    }
  });

const inertResolutionSchema = z
  .object({
    schemaVersion: z.literal('planner.utility-resolution.v3.2'),
    kind: z.literal('inert'),
    releaseIdentity: utilityReleaseIdentityV3_2Schema,
    utility: z.literal(0),
    signals: z.tuple([]),
    reason: z.literal('no-provider'),
    weightsRenormalized: z.literal(false),
  })
  .strict();

export const utilityResolutionV3_2Schema = z.discriminatedUnion('kind', [
  providerResolutionSchema,
  inertResolutionSchema,
]);

const utilityRegistrationSchema = z
  .object({
    domain: idSchema,
    graphReleaseId: idSchema,
    graphContentHash: idSchema,
    precomputeInputHash: idSchema,
    providerKey: idSchema,
    providerVersion: idSchema,
    executionPolicy: z.literal('deterministic-offline').default('deterministic-offline'),
  })
  .strict();

export const domainUtilityRegistryV3_2Schema = z
  .object({
    schemaVersion: z.literal('planner.utility-registry.v3.2'),
    registrations: z.array(utilityRegistrationSchema),
  })
  .strict()
  .superRefine((registry, ctx) => {
    const domains = new Set<string>();
    registry.registrations.forEach((registration, index) => {
      if (domains.has(registration.domain)) {
        ctx.addIssue({
          code: 'custom',
          path: ['registrations', index, 'domain'],
          message: 'A domain adapter may register only one utility provider',
        });
      }
      domains.add(registration.domain);
    });
  });

export type DomainUtilityRegistrationManifestV3_2 = z.input<
  typeof utilityRegistrationSchema
>;

export interface BoundDomainUtilityProviderV3_2 {
  readonly manifest: z.output<typeof utilityRegistrationSchema>;
  readonly provider: DomainUtilityProviderV3_2;
}

export function bindDomainUtilityProviderV3_2(
  manifest: DomainUtilityRegistrationManifestV3_2,
  provider: DomainUtilityProviderV3_2,
): BoundDomainUtilityProviderV3_2 {
  const parsedManifest = utilityRegistrationSchema.parse(manifest);
  idSchema.parse(provider.providerKey);
  idSchema.parse(provider.version);
  if (
    parsedManifest.providerKey !== provider.providerKey ||
    parsedManifest.providerVersion !== provider.version
  ) {
    throw new Error('Utility provider identity does not match its adapter manifest');
  }
  return Object.freeze({ manifest: parsedManifest, provider });
}

export const prerequisiteSparseReleaseV3_2Schema = z
  .object({
    schemaVersion: z.literal('planner.sparse-release.v3.2'),
    graphReleaseId: idSchema,
    graphContentHash: idSchema,
    precomputeInputHash: idSchema,
    domain: idSchema,
    skillCount: z.number().int().min(0),
    skillsWithPrerequisiteInEdge: z.number().int().min(0),
    prerequisiteInEdgeRatio: z.number().finite().min(0).max(1),
    sparseThreshold: z.literal(0.05).default(0.05),
    prerequisiteSparse: z.boolean(),
    rankingMode: plannerRankingModeV3_2Schema,
    readyThreshold: z.number().finite().min(0).max(1),
    sparseWeights: z
      .object({ utility: z.literal(0.7), weaknessFit: z.literal(0.3) })
      .strict(),
    readinessIsGateOnly: z.boolean(),
    syntheticPrerequisitesProhibited: z.literal(true),
  })
  .strict()
  .superRefine((release, ctx) => {
    if (release.skillsWithPrerequisiteInEdge > release.skillCount) {
      ctx.addIssue({ code: 'custom', path: ['skillsWithPrerequisiteInEdge'], message: 'Count exceeds skill count' });
    }
    const ratio = release.skillCount === 0 ? 0 : release.skillsWithPrerequisiteInEdge / release.skillCount;
    const sparse = ratio < release.sparseThreshold;
    if (Math.abs(release.prerequisiteInEdgeRatio - ratio) > EPSILON) {
      ctx.addIssue({ code: 'custom', path: ['prerequisiteInEdgeRatio'], message: 'Ratio must match counts' });
    }
    if (release.prerequisiteSparse !== sparse) {
      ctx.addIssue({ code: 'custom', path: ['prerequisiteSparse'], message: 'Sparse flag must match threshold' });
    }
    const mode = sparse ? 'utility-led' : 'normalized-prerequisite';
    if (release.rankingMode !== mode) {
      ctx.addIssue({ code: 'custom', path: ['rankingMode'], message: 'Ranking mode must match sparse classification' });
    }
    if (release.readinessIsGateOnly !== sparse) {
      ctx.addIssue({ code: 'custom', path: ['readinessIsGateOnly'], message: 'Readiness is gate-only exactly in sparse mode' });
    }
  });

export type UtilityResolutionV3_2 = z.infer<typeof utilityResolutionV3_2Schema>;
export type UtilityReleaseIdentityV3_2 = z.infer<typeof utilityReleaseIdentityV3_2Schema>;
export type DomainUtilityRegistryV3_2 = z.infer<typeof domainUtilityRegistryV3_2Schema>;
export type PrerequisiteSparseReleaseV3_2 = z.infer<typeof prerequisiteSparseReleaseV3_2Schema>;
