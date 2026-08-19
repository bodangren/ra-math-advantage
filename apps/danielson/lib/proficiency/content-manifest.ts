import type { ReviewStatus } from '@math-platform/knowledge-space-core';

import {
  APPROVED_TLAC_SOURCE_INVENTORY,
  DANIELSON_SOURCE_SNAPSHOT,
  DANIELSON_SIBLING_COMMIT,
  RUNTIME_OVERLAP_SOURCE_INVENTORY,
  RUNTIME_SOURCE_INVENTORY,
} from './source-inventory';

export type DanielsonSourceManifest = {
  stableId: string;
  source: string;
  version: string;
  effectiveDate: string;
  contentHash: string;
  reviewStatus: ReviewStatus;
  recordCount: number;
  licenseBoundary: 'app-owned-internal-import';
};

export type ApprovedTlacSkill = (typeof APPROVED_TLAC_SOURCE_INVENTORY)[number];

export type RuntimeReviewRow = {
  id: string;
  source: string;
};

export const DANIELSON_SOURCE_SIBLING_COMMIT = DANIELSON_SIBLING_COMMIT;
export const DANIELSON_FRAMEWORK_SOURCE_HASH = DANIELSON_SOURCE_SNAPSHOT.frameworkSourceHash;
export const APPROVED_STANDALONE_SOURCE_HASH = DANIELSON_SOURCE_SNAPSHOT.standaloneSourceHash;
export const RUNTIME_ARRAY_SOURCE_HASH = DANIELSON_SOURCE_SNAPSHOT.runtimeSourceHash;

/** Versioned declarations for the frozen app-owned source boundary. */
export const DANIELSON_SOURCE_MANIFESTS: readonly DanielsonSourceManifest[] = [
  {
    stableId: 'danielson.framework.2022',
    source: 'Danielson Framework for Teaching 2022',
    version: '2022',
    effectiveDate: '2022-01-01',
    contentHash: DANIELSON_FRAMEWORK_SOURCE_HASH,
    reviewStatus: 'approved',
    recordCount: 27,
    licenseBoundary: 'app-owned-internal-import',
  },
  {
    stableId: 'sibling.tlac3.modules',
    source: 'Teach Like a Champion 3.0',
    version: '3.0',
    effectiveDate: '2026-08-19',
    contentHash: APPROVED_STANDALONE_SOURCE_HASH,
    reviewStatus: 'approved',
    recordCount: APPROVED_TLAC_SOURCE_INVENTORY.length,
    licenseBoundary: 'app-owned-internal-import',
  },
  {
    stableId: 'sibling.runtime.techniques',
    source: 'Sibling runtime technique array',
    version: 'runtime-import-2026-08-19',
    effectiveDate: '2026-08-19',
    contentHash: RUNTIME_ARRAY_SOURCE_HASH,
    reviewStatus: 'reviewed',
    // The runtime source has 63 rows. Forty are unique to that source and
    // remain in the review queue below.
    recordCount: 63,
    licenseBoundary: 'app-owned-internal-import',
  },
];

/** Reviewed standalone TLAC rows from the committed source inventory. */
export const APPROVED_TLAC_SKILLS: readonly ApprovedTlacSkill[] = APPROVED_TLAC_SOURCE_INVENTORY;

/** Runtime provenance for IDs that also occur in the standalone modules. */
export const RUNTIME_OVERLAP_TECHNIQUES = RUNTIME_OVERLAP_SOURCE_INVENTORY;

/** Runtime-only rows retain their exact source labels for later review. */
export const RUNTIME_ONLY_TECHNIQUES: readonly RuntimeReviewRow[] = RUNTIME_SOURCE_INVENTORY.map((row) => ({
  id: row.id,
  source: row.source,
}));

if (APPROVED_TLAC_SKILLS.length !== 63 || RUNTIME_ONLY_TECHNIQUES.length !== 40) {
  throw new Error('Danielson source manifest counts are not frozen');
}
