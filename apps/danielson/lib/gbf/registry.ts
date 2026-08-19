import type { GbfMappingRelease, GbfSequenceRelease } from './contracts';
import type { GbfGraphRelease } from './contracts';
import { GBF_GRAPH_RELEASE_V1 } from './graph';
import { GBF_MAPPING_RELEASE_V1 } from './mappings';
import { GBF_SEQUENCE_RELEASE_V1 } from './source';

export type GbfReleaseRegistryEntry = {
  sequenceReleaseId: string;
  mappingReleaseId: string;
  graphReleaseId: string;
  effectiveDate: string;
  sequence: GbfSequenceRelease;
  mapping: GbfMappingRelease;
  graph: GbfGraphRelease;
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

/** The app-owned release registry is append-only. Keep old IDs here. */
export const GBF_RELEASE_REGISTRY: readonly GbfReleaseRegistryEntry[] = deepFreeze([
  {
    sequenceReleaseId: 'danielson.gbf.sequence.2026-08-19.v1',
    mappingReleaseId: 'danielson.gbf.mapping.2026-08-19.v1',
    graphReleaseId: 'danielson.gbf.graph.2026-08-19.v1',
    effectiveDate: '2026-08-19',
    sequence: structuredClone(GBF_SEQUENCE_RELEASE_V1),
    mapping: structuredClone(GBF_MAPPING_RELEASE_V1),
    graph: structuredClone(GBF_GRAPH_RELEASE_V1),
  },
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
