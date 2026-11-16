import { describe, it, expect } from 'vitest';
import { knowledgeBlueprintSchema, validateBlueprintGeneratorReadiness, validateRendererCompatibility, validateModeSupport } from '@math-platform/knowledge-space-practice';
import { getRenderer, RENDERER_KEYS } from '@math-platform/math-content/knowledge-space';
import type { KnowledgeBlueprint, SchemaAdapter } from '@math-platform/knowledge-space-practice';
import blueprintsJson from '../module-1/blueprints.json';

const blueprintDocument =
  blueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] };
const blueprints = blueprintDocument.blueprints;

const mathSchemaAdapter: SchemaAdapter = {
  acceptRendererKey(key: string): boolean {
    return RENDERER_KEYS.includes(key);
  },
  validateProps(key: string, props: Record<string, unknown>): boolean {
    const renderer = getRenderer(key);
    if (!renderer) return false;
    const result = renderer.propsSchema.safeParse(props);
    return result.success;
  },
};

describe('Module 1 Pilot Rendering', () => {
  it('all blueprints validate against knowledgeBlueprintSchema', () => {
    const errors: string[] = [];
    for (const bp of blueprints) {
      const result = knowledgeBlueprintSchema.safeParse(bp);
      if (!result.success) {
        errors.push(`${bp.nodeId}: ${result.error.issues.map(i => i.message).join('; ')}`);
      }
    }
    if (errors.length > 0) {
      console.error('Blueprint schema errors:', errors);
    }
    expect(errors).toHaveLength(0);
  });

  it('all blueprint rendererKeys are accepted by math schema adapter', () => {
    for (const bp of blueprints) {
      const result = validateRendererCompatibility(bp, mathSchemaAdapter);
      if (!result.valid) {
        console.error(`Renderer compatibility error for ${bp.nodeId}:`, result.errors);
      }
      expect(result.valid).toBe(true);
    }
  });

  it('all blueprints with independentPracticeSpec have generatorKey', () => {
    for (const bp of blueprints) {
      const result = validateBlueprintGeneratorReadiness(bp);
      if (!result.valid) {
        console.error(`Generator readiness error for ${bp.nodeId}:`, result.errors);
      }
      expect(result.valid).toBe(true);
    }
  });

  it('all blueprints pass mode support validation', () => {
    for (const bp of blueprints) {
      const result = validateModeSupport(bp);
      if (!result.valid) {
        console.error(`Mode support error for ${bp.nodeId}:`, result.errors);
      }
      expect(result.valid).toBe(true);
    }
  });

  it('can render worked example mode for at least 3 skills', () => {
    const workedBps = blueprints.filter(bp => bp.workedExampleSpec != null);
    expect(workedBps.length).toBeGreaterThanOrEqual(3);
  });

  it('can render guided practice mode for at least 3 skills', () => {
    const guidedBps = blueprints.filter(bp => bp.guidedPracticeSpec != null);
    expect(guidedBps.length).toBeGreaterThanOrEqual(3);
  });

  it('lists the current configured Independent specifications', () => {
    const independentBps = blueprints.filter(bp => bp.independentPracticeSpec != null);
    expect(independentBps.map(bp => bp.nodeId)).toEqual(expect.arrayContaining([
      'math.im3.skill.1.1.graph-quadratic-functions',
      'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context',
    ]));
  });

  it('all renderer mode maps reference valid renderers', () => {
    for (const bp of blueprints) {
      for (const [, rendererKey] of Object.entries(bp.rendererModeMap)) {
        expect(mathSchemaAdapter.acceptRendererKey(rendererKey)).toBe(true);
      }
    }
  });
});
