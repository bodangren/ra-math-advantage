import { describe, expect, it } from 'vitest';
import { syntheticBlueprint } from '../projections/fixtures';
import { validateRendererCompatibility } from '../blueprints/schemas';
import type { SchemaAdapter } from '../blueprints/types';

const adapter: SchemaAdapter = {
  acceptRendererKey: (key) => ['worked-renderer', 'answer-renderer'].includes(key),
  validateProps: () => true,
};

describe('renderer compatibility for mode overrides', () => {
  it('rejects an unknown mode renderer even when the fallback is accepted', () => {
    const result = validateRendererCompatibility({
      ...syntheticBlueprint,
      rendererKey: 'answer-renderer',
      rendererModeMap: { worked: 'missing-renderer', independentPractice: 'answer-renderer' },
    }, adapter);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([{
      code: 'UNKNOWN_RENDERER',
      message: 'Renderer key "missing-renderer" is not accepted by the schema adapter',
    }]);
  });

  it('checks mode renderers when the fallback is empty', () => {
    expect(validateRendererCompatibility({
      ...syntheticBlueprint, rendererKey: '', rendererModeMap: { worked: 'missing-renderer' },
    }, adapter).valid).toBe(false);
  });

  it('accepts different registered renderers and ignores empty optional entries', () => {
    expect(validateRendererCompatibility({
      ...syntheticBlueprint,
      rendererKey: 'answer-renderer',
      rendererModeMap: { worked: 'worked-renderer', guidedPractice: '', independentPractice: 'answer-renderer' },
    }, adapter)).toEqual({ valid: true });
  });
});
