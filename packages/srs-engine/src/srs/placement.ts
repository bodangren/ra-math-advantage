import {
  isPlacementEstimate,
  isPlacementSeededCard,
} from './contract';

export {
  isPlacementEstimate,
  isPlacementSeededCard,
};

export type {
  PlacementConfidence,
  PlacementEvidenceType,
  PlacementEstimate,
  PlacementCardProvenance,
  PlacementSeededCard,
} from './contract';

/** Confidence horizons in days from kst-srs.v3.2 §11.4. */
export const PLACEMENT_STABILITY_HORIZONS = Object.freeze({
  low: 5,
  medium: 15,
  high: 30,
});

/** Minimal graph edge consumed by placement synthesis without importing KST packages. */
export interface PlacementGraphEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

/** Domain/app adapter supplies graph topology to the SRS-owned placement engine. */
export interface PlacementGraphAdapter {
  prerequisiteEdges: readonly PlacementGraphEdge[];
}

export interface PlacementSeedConfig {
  masteryEnter: number;
  hardGateThreshold: number;
  confidenceHorizons?: Partial<typeof PLACEMENT_STABILITY_HORIZONS>;
}

