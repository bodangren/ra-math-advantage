import { z } from 'zod';

import {
  domainUtilityRegistryV3_2Schema,
  learnerUtilityContextV3_2Schema,
  utilityProviderResultV3_2Schema,
  utilityResolutionV3_2Schema,
  type BoundDomainUtilityProviderV3_2,
  type DomainUtilityProviderV3_2,
  type LearnerUtilityContextV3_2,
  type UtilityResolutionV3_2,
  utilityReleaseIdentityV3_2Schema,
  type UtilityReleaseIdentityV3_2,
  bindDomainUtilityProviderV3_2,
} from './v3-2-domain-utility-contract';

const idSchema = z.string().min(1).refine((value) => value.trim() === value);

export interface DomainUtilityRegistryV3_2Runtime {
  readonly registrations: readonly BoundDomainUtilityProviderV3_2[];
  get(domain: string): BoundDomainUtilityProviderV3_2 | undefined;
}

export function createDomainUtilityRegistryV3_2(
  registrations: readonly BoundDomainUtilityProviderV3_2[],
): DomainUtilityRegistryV3_2Runtime {
  const rebound = registrations.map((registration) =>
    bindDomainUtilityProviderV3_2(registration.manifest, registration.provider),
  );
  const manifests = rebound.map((registration) => registration.manifest);
  domainUtilityRegistryV3_2Schema.parse({
    schemaVersion: 'planner.utility-registry.v3.2',
    registrations: manifests,
  });
  const copied = Object.freeze([...rebound]);
  const byDomain = new Map(copied.map((registration) => [registration.manifest.domain, registration]));
  return Object.freeze({
    registrations: copied,
    get(domain: string) {
      return byDomain.get(domain);
    },
  });
}

export interface ResolveDomainUtilityInputV3_2 {
  readonly registry: DomainUtilityRegistryV3_2Runtime;
  readonly domain: string;
  readonly graphReleaseIdentity: UtilityReleaseIdentityV3_2;
  readonly nodeId: string;
  readonly context: LearnerUtilityContextV3_2;
}

export function resolveDomainUtilityV3_2(
  input: ResolveDomainUtilityInputV3_2,
): UtilityResolutionV3_2 {
  const domain = idSchema.parse(input.domain);
  const graphReleaseIdentity = utilityReleaseIdentityV3_2Schema.parse(
    input.graphReleaseIdentity,
  );
  const nodeId = idSchema.parse(input.nodeId);
  const context = learnerUtilityContextV3_2Schema.parse(input.context);
  if (context.domain !== domain || graphReleaseIdentity.domain !== domain) {
    throw new Error('Utility learner context domain does not match the requested adapter');
  }
  const registration = input.registry.get(domain);
  if (!registration) {
    return utilityResolutionV3_2Schema.parse({
      schemaVersion: 'planner.utility-resolution.v3.2',
      kind: 'inert',
      releaseIdentity: graphReleaseIdentity,
      utility: 0,
      signals: [],
      reason: 'no-provider',
      weightsRenormalized: false,
    });
  }
  bindDomainUtilityProviderV3_2(registration.manifest, registration.provider);
  if (
    registration.manifest.domain !== graphReleaseIdentity.domain ||
    registration.manifest.graphReleaseId !== graphReleaseIdentity.graphReleaseId ||
    registration.manifest.graphContentHash !== graphReleaseIdentity.graphContentHash ||
    registration.manifest.precomputeInputHash !== graphReleaseIdentity.precomputeInputHash
  ) {
    throw new Error('Utility provider registration does not match the requested graph release');
  }
  const result = utilityProviderResultV3_2Schema.parse(
    registration.provider.getUtility(nodeId, context),
  );
  return utilityResolutionV3_2Schema.parse({
    schemaVersion: 'planner.utility-resolution.v3.2',
    kind: 'provider',
    releaseIdentity: graphReleaseIdentity,
    providerKey: registration.provider.providerKey,
    providerVersion: registration.provider.version,
    utility: result.utility,
    signals: result.signals,
    weightsRenormalized: false,
  });
}

const syntheticProviderConfigSchema = z
  .object({
    providerKey: idSchema,
    version: idSchema,
    source: idSchema,
    sourceVersion: idSchema,
    utilityByNode: z.record(idSchema, z.number().finite().min(0).max(1)),
  })
  .strict();

export type SyntheticUtilityProviderConfigV3_2 = z.input<typeof syntheticProviderConfigSchema>;

export function createSyntheticUtilityProviderV3_2(
  rawConfig: SyntheticUtilityProviderConfigV3_2,
): DomainUtilityProviderV3_2 {
  const config = syntheticProviderConfigSchema.parse(rawConfig);
  const utilityByNode = Object.freeze({ ...config.utilityByNode });
  return Object.freeze({
    providerKey: config.providerKey,
    version: config.version,
    getUtility(nodeId: string) {
      const parsedNodeId = idSchema.parse(nodeId);
      const utility = utilityByNode[parsedNodeId] ?? 0;
      return utilityProviderResultV3_2Schema.parse({
        utility,
        signals: [
          {
            source: config.source,
            sourceVersion: config.sourceVersion,
            value: utility,
            weight: 1,
          },
        ],
      });
    },
  });
}
