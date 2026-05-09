// Math metadata schemas for knowledge-space nodes and edges

import { z } from 'zod';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';

// ---------------------------------------------------------------------------
// Math node metadata schemas
// ---------------------------------------------------------------------------

export const mathSkillMetadataSchema = z.object({
  course: z.string().min(1),
  module: z.string().min(1),
  lesson: z.string().min(1),
  componentKey: z.string().optional(),
  generatorKey: z.string().optional(),
  difficulty: z.number().min(0).max(1).optional(),
  familyKey: z.string().optional(),
  frqTaskModel: z.string().optional(),
  calculatorPolicy: z.enum(['required', 'allowed', 'forbidden']).optional(),
});

export const mathWorkedExampleMetadataSchema = z.object({
  course: z.string().min(1),
  module: z.string().min(1),
  lesson: z.string().min(1),
  componentKey: z.string().optional(),
});

export const mathLessonMetadataSchema = z.object({
  course: z.string().min(1),
  module: z.string().min(1),
  lesson: z.string().min(1),
});

export const mathModuleMetadataSchema = z.object({
  course: z.string().min(1),
  module: z.string().min(1),
});

export const mathCourseMetadataSchema = z.object({
  course: z.string().min(1),
});

export const mathStandardMetadataSchema = z.object({
  framework: z.string().min(1),
  code: z.string().min(1),
});

export const mathGeneratorMetadataSchema = z.object({
  engine: z.string().min(1).optional(),
  variantCount: z.number().optional(),
});

export const mathRendererMetadataSchema = z.object({
  rendererType: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Edge metadata schema
// ---------------------------------------------------------------------------

export const mathEdgeMetadataSchema = z.object({
  lessonOrder: z.number().optional(),
  familyKey: z.string().optional(),
  cedTopic: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateMathNodeMetadata(
  node: KnowledgeSpaceNode,
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  try {
    switch (node.kind) {
      case 'skill': {
        mathSkillMetadataSchema.parse(node.metadata);
        break;
      }
      case 'worked_example': {
        mathWorkedExampleMetadataSchema.parse(node.metadata);
        break;
      }
      case 'instructional_unit': {
        mathLessonMetadataSchema.parse(node.metadata);
        break;
      }
      case 'content_group': {
        mathModuleMetadataSchema.parse(node.metadata);
        break;
      }
      case 'domain': {
        mathCourseMetadataSchema.parse(node.metadata);
        break;
      }
      case 'standard': {
        mathStandardMetadataSchema.parse(node.metadata);
        break;
      }
      case 'generator': {
        mathGeneratorMetadataSchema.parse(node.metadata);
        break;
      }
      case 'renderer': {
        mathRendererMetadataSchema.parse(node.metadata);
        break;
      }
      default: {
        // Other kinds have no required math-specific metadata
        break;
      }
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      for (const issue of err.issues) {
        errors.push(`${issue.path.join('.')}: ${issue.message}`);
      }
    } else {
      errors.push(String(err));
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function validateMathEdgeMetadata(
  edge: KnowledgeSpaceEdge,
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  try {
    mathEdgeMetadataSchema.parse(edge.metadata ?? {});
  } catch (err) {
    if (err instanceof z.ZodError) {
      for (const issue of err.issues) {
        errors.push(`${issue.path.join('.')}: ${issue.message}`);
      }
    } else {
      errors.push(String(err));
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

// (schemas already exported above via `export const`)
