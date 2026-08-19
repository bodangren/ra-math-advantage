import type { GbfMappingRelease, GbfSequenceRelease } from './contracts';
import { GBF_RELEASE_REGISTRY } from './graph';

export { GBF_RELEASE_REGISTRY, type GbfReleaseRegistryEntry } from './graph';

export function findGbfRelease(input: {
  sequenceReleaseId: string;
  graphReleaseId: string;
}) {
  return GBF_RELEASE_REGISTRY.find((entry) => (
    entry.sequenceReleaseId === input.sequenceReleaseId
    && entry.graphReleaseId === input.graphReleaseId
  )) ?? null;
}

/** Resolve source records from one immutable registry entry. */
export function resolveGbfSourceRelease(input: {
  sequenceReleaseId: string;
  mappingReleaseId: string;
}): { sequence: GbfSequenceRelease; mapping: GbfMappingRelease } | null {
  const entry = GBF_RELEASE_REGISTRY.find((candidate) => (
    candidate.sequenceReleaseId === input.sequenceReleaseId
    && candidate.mappingReleaseId === input.mappingReleaseId
  ));
  return entry
    ? { sequence: structuredClone(entry.sequence), mapping: structuredClone(entry.mapping) }
    : null;
}
