// Adaptive placement contract — domain-neutral types and schemas
// Seeds initial knowledge state from probe-based placement traversal.

import { z } from 'zod';
import { CORE_ID_PATTERN } from './schemas';

// ---------------------------------------------------------------------------
// ProbeResult — outcome of a single probe against a knowledge-space node
// ---------------------------------------------------------------------------

export const PROBE_RESULTS = ['pass', 'fail', 'partial'] as const;

export type ProbeResult = (typeof PROBE_RESULTS)[number];

export const probeResultSchema = z.enum(PROBE_RESULTS);

// ---------------------------------------------------------------------------
// PlacementResult — one node's estimated mastery after placement
// ---------------------------------------------------------------------------

export interface PlacementResult {
  nodeId: string;
  masteryEstimate: number;
  confidence: 'low' | 'medium';
  metadata?: Record<string, unknown>;
}

export const placementResultSchema = z.object({
  nodeId: z.string().regex(
    CORE_ID_PATTERN,
    'nodeId must match the core ID pattern (dot-separated lower-kebab-case)',
  ),
  masteryEstimate: z.number().min(0).max(1),
  confidence: z.enum(['low', 'medium']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const placementResultsSchema = z.array(placementResultSchema);

// ---------------------------------------------------------------------------
// isPlacementResult — runtime type guard
// ---------------------------------------------------------------------------

export function isPlacementResult(value: unknown): value is PlacementResult {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.nodeId !== 'string' || obj.nodeId.length === 0) return false;
  if (!CORE_ID_PATTERN.test(obj.nodeId)) return false;
  if (typeof obj.masteryEstimate !== 'number') return false;
  if (obj.masteryEstimate < 0 || obj.masteryEstimate > 1) return false;
  if (obj.confidence !== 'low' && obj.confidence !== 'medium') return false;
  return true;
}

// ---------------------------------------------------------------------------
// ProbeAdapter — domain-specific probe implementation
// ---------------------------------------------------------------------------

export interface ProbeAdapter {
  domain: string;
  probe(nodeId: string): ProbeResult | Promise<ProbeResult>;
}
