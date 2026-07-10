// Domain adapter contracts and runtime policy validation.

import { z } from 'zod';
import type {
  AgeBandPolicy,
  DomainAdapterV31Declarations,
  GuessFloorPolicy,
  PlacementProbeInstrumentPolicy,
} from './types';

export const DOMAIN_ADAPTER_V31_CONTRACT_VERSION = 'domain-adapter.v3.1' as const;

const nonEmptyOpaqueKeySchema = z.string().min(1);

export const guessFloorPolicySchema = z.strictObject({
  policyVersion: z.string().min(1),
  byAnswerFormat: z.record(
    nonEmptyOpaqueKeySchema,
    z.number().finite().min(0).lt(1),
  ),
}).refine(
  (policy) => Object.keys(policy.byAnswerFormat).length > 0,
  { path: ['byAnswerFormat'], message: 'at least one answer format is required' },
);

export const ageBandDefinitionSchema = z.strictObject({
  populationKey: z.string().min(1),
  minAgeYearsInclusive: z.number().finite().nonnegative(),
  maxAgeYearsExclusive: z.number().finite().positive(),
}).refine(
  (band) => band.minAgeYearsInclusive < band.maxAgeYearsExclusive,
  {
    path: ['maxAgeYearsExclusive'],
    message: 'maxAgeYearsExclusive must be greater than minAgeYearsInclusive',
  },
);

export const ageBandPolicySchema = z.strictObject({
  policyVersion: z.string().min(1),
  bands: z.array(ageBandDefinitionSchema).min(1),
}).superRefine((policy, ctx) => {
  const seenKeys = new Set<string>();
  policy.bands.forEach((band, index) => {
    if (seenKeys.has(band.populationKey)) {
      ctx.addIssue({
        code: 'custom',
        path: ['bands', index, 'populationKey'],
        message: 'populationKey must be unique within an age-band policy',
      });
    }
    seenKeys.add(band.populationKey);
  });

  for (let leftIndex = 0; leftIndex < policy.bands.length; leftIndex += 1) {
    const left = policy.bands[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < policy.bands.length; rightIndex += 1) {
      const right = policy.bands[rightIndex];
      const overlaps = left.minAgeYearsInclusive < right.maxAgeYearsExclusive
        && right.minAgeYearsInclusive < left.maxAgeYearsExclusive;
      if (overlaps) {
        ctx.addIssue({
          code: 'custom',
          path: ['bands', rightIndex],
          message: `age band overlaps populationKey "${left.populationKey}"`,
        });
      }
    }
  }
});

export const highFidelityPlacementProbeInstrumentSchema = z.strictObject({
  instrumentId: z.string().min(1),
  instrumentVersion: z.string().min(1),
  highFidelity: z.literal(true),
});

export const placementProbeInstrumentPolicySchema = z.strictObject({
  policyVersion: z.string().min(1),
  instruments: z.array(highFidelityPlacementProbeInstrumentSchema).min(1),
}).superRefine((policy, ctx) => {
  const seenInstrumentIds = new Set<string>();
  policy.instruments.forEach((instrument, index) => {
    if (seenInstrumentIds.has(instrument.instrumentId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['instruments', index, 'instrumentId'],
        message: 'instrumentId must be unique within a placement-instrument policy',
      });
    }
    seenInstrumentIds.add(instrument.instrumentId);
  });
});

export const domainAdapterV31DeclarationsSchema = z.strictObject({
  contractVersion: z.literal(DOMAIN_ADAPTER_V31_CONTRACT_VERSION),
  guessFloors: guessFloorPolicySchema,
  ageBands: ageBandPolicySchema,
  placementProbeInstruments: placementProbeInstrumentPolicySchema.optional(),
});

/** Validate a guess-floor declaration without interpreting its format keys. */
export function isGuessFloorPolicy(value: unknown): value is GuessFloorPolicy {
  return guessFloorPolicySchema.safeParse(value).success;
}

/** Validate population-safe, non-overlapping age-band declarations. */
export function isAgeBandPolicy(value: unknown): value is AgeBandPolicy {
  return ageBandPolicySchema.safeParse(value).success;
}

/** Validate high-fidelity placement-instrument declarations. */
export function isPlacementProbeInstrumentPolicy(
  value: unknown,
): value is PlacementProbeInstrumentPolicy {
  return placementProbeInstrumentPolicySchema.safeParse(value).success;
}

/** Validate the complete optional v3.1 declaration block on a domain adapter. */
export function isDomainAdapterV31Declarations(
  value: unknown,
): value is DomainAdapterV31Declarations {
  return domainAdapterV31DeclarationsSchema.safeParse(value).success;
}

export type {
  AgeBandDefinition,
  AgeBandPolicy,
  DomainAdapter,
  DomainAdapterV31Declarations,
  GuessFloorPolicy,
  HighFidelityPlacementProbeInstrument,
  PlacementProbeInstrumentPolicy,
} from './types';
