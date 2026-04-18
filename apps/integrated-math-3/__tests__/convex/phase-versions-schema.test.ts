import { describe, it, expect } from 'vitest';
import { v } from 'convex/values';

describe('phase_versions schema', () => {
  const phaseTypes = [
    'explore',
    'vocabulary',
    'learn',
    'key_concept',
    'worked_example',
    'guided_practice',
    'independent_practice',
    'assessment',
    'discourse',
    'reflection',
  ] as const;

  type PhaseType = typeof phaseTypes[number];

  const phaseTypeValidator = v.union(
    v.literal('explore'),
    v.literal('vocabulary'),
    v.literal('learn'),
    v.literal('key_concept'),
    v.literal('worked_example'),
    v.literal('guided_practice'),
    v.literal('independent_practice'),
    v.literal('assessment'),
    v.literal('discourse'),
    v.literal('reflection'),
  );

  it('defines all 10 required phase types', () => {
    expect(phaseTypes).toHaveLength(10);
    expect(phaseTypes).toContain('explore');
    expect(phaseTypes).toContain('vocabulary');
    expect(phaseTypes).toContain('learn');
    expect(phaseTypes).toContain('key_concept');
    expect(phaseTypes).toContain('worked_example');
    expect(phaseTypes).toContain('guided_practice');
    expect(phaseTypes).toContain('independent_practice');
    expect(phaseTypes).toContain('assessment');
    expect(phaseTypes).toContain('discourse');
    expect(phaseTypes).toContain('reflection');
  });

  it('PhaseType type includes all phase types', () => {
    const validTypes: PhaseType[] = [...phaseTypes];
    expect(validTypes).toHaveLength(10);
  });

  it('validator can be created without errors', () => {
    expect(() => phaseTypeValidator).not.toThrow();
  });

  it('all phase types are unique', () => {
    const uniqueTypes = new Set(phaseTypes);
    expect(uniqueTypes.size).toBe(phaseTypes.length);
  });
});
