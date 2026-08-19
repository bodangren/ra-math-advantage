import type { GbfMappingRelease, GbfSequenceRelease } from './contracts';
import { GBF_MAPPING_RELEASE } from './mappings';
import { GBF_SEQUENCE_RELEASE } from './source';

export type GbfReleaseRegistryEntry = {
  sequenceReleaseId: string;
  mappingReleaseId: string;
  graphReleaseId: string;
  effectiveDate: string;
};

/** The app-owned release registry is append-only. Keep old IDs here. */
export const GBF_RELEASE_REGISTRY: readonly GbfReleaseRegistryEntry[] = Object.freeze([
  Object.freeze({
    sequenceReleaseId: 'danielson.gbf.sequence.2026-08-19.v1',
    mappingReleaseId: 'danielson.gbf.mapping.2026-08-19.v1',
    graphReleaseId: 'danielson.gbf.graph.2026-08-19.v1',
    effectiveDate: '2026-08-19',
  }),
]);

export function findGbfRelease(input: {
  sequenceReleaseId: string;
  graphReleaseId: string;
}) {
  return GBF_RELEASE_REGISTRY.find((entry) => (
    entry.sequenceReleaseId === input.sequenceReleaseId
    && entry.graphReleaseId === input.graphReleaseId
  )) ?? null;
}

/** Resolve source records for the current registry entry. */
export function resolveGbfSourceRelease(input: {
  sequenceReleaseId: string;
  mappingReleaseId: string;
}): { sequence: GbfSequenceRelease; mapping: GbfMappingRelease } | null {
  if (
    input.sequenceReleaseId !== GBF_SEQUENCE_RELEASE.releaseId
    || input.mappingReleaseId !== GBF_MAPPING_RELEASE.releaseId
  ) return null;
  return { sequence: GBF_SEQUENCE_RELEASE, mapping: GBF_MAPPING_RELEASE };
}
