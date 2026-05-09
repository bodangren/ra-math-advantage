// Math domain adapter implementing the knowledge-space DomainAdapter contract

import type {
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  DomainAdapter,
} from '@math-platform/knowledge-space-core';
import { MATH_DOMAIN_PREFIX, validateMathId, ID_PATTERNS, type IdValidationResult } from './ids';
import { validateMathNodeMetadata, validateMathEdgeMetadata } from './metadata';
import { getGenerator } from './generators/registry';
import { getRenderer } from './renderers/registry';
import { evidenceToPracticeV1 } from './practice-v1-adapter';

// ---------------------------------------------------------------------------
// Math domain adapter
// ---------------------------------------------------------------------------

export interface MathDomainAdapter extends DomainAdapter {
  domain: typeof MATH_DOMAIN_PREFIX;
  idPatterns: typeof ID_PATTERNS;
  validateId: (id: string, kind: string) => IdValidationResult;
  validateEdgeMetadata: (edge: KnowledgeSpaceEdge) => { valid: boolean; errors?: string[] };
  getGenerator: typeof getGenerator;
  getRenderer: typeof getRenderer;
  evidenceToPracticeV1: typeof evidenceToPracticeV1;
}

export const mathDomainAdapter: MathDomainAdapter = {
  domain: MATH_DOMAIN_PREFIX,
  idPatterns: ID_PATTERNS,

  validateId(id: string, kind: string): IdValidationResult {
    return validateMathId(id, kind);
  },

  validateNodeMetadata(node: KnowledgeSpaceNode) {
    return validateMathNodeMetadata(node);
  },

  validateEdgeMetadata(edge: KnowledgeSpaceEdge) {
    return validateMathEdgeMetadata(edge);
  },

  getGenerator,
  getRenderer,
  evidenceToPracticeV1,
};
