import { describe, it, expect } from 'vitest';
import { computeComponentContentHash, type HashableComponent } from '../content-hash';

describe('computeComponentContentHash', () => {
  it('should produce consistent hash for same input', async () => {
    const component: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test-activity',
      props: { answer: 42 },
    };
    const hash1 = await computeComponentContentHash(component);
    const hash2 = await computeComponentContentHash(component);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hash for different props', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test-activity',
      props: { answer: 42 },
    };
    const component2: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test-activity',
      props: { answer: 43 },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hash for different component kinds', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test',
    };
    const component2: HashableComponent = {
      componentKind: 'practice',
      componentKey: 'test',
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hash for different component keys', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test-1',
    };
    const component2: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test-2',
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('should be deterministic regardless of key order in props', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test',
      props: { a: 1, b: 2, c: 3 },
    };
    const component2: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test',
      props: { c: 3, a: 1, b: 2 },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).toBe(hash2);
  });

  it('should include gradingConfig in hash', async () => {
    const component1: HashableComponent = {
      componentKind: 'practice',
      componentKey: 'test',
      props: { steps: [{ expression: 'x+1', explanation: 'add 1' }] },
    };
    const component2: HashableComponent = {
      componentKind: 'practice',
      componentKey: 'test',
      props: { steps: [{ expression: 'x+1', explanation: 'add 1' }] },
      gradingConfig: { points: 10 },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('should handle nested objects in props', async () => {
    const component: HashableComponent = {
      componentKind: 'example',
      componentKey: 'test',
      props: {
        outer: {
          inner: {
            deep: 'value',
          },
          array: [1, 2, { nested: true }],
        },
      },
    };
    const hash = await computeComponentContentHash(component);
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64);
  });

  it('should handle empty props', async () => {
    const component: HashableComponent = {
      componentKind: 'activity',
    };
    const hash = await computeComponentContentHash(component);
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64);
  });

  it('should return a 64-character hex string (SHA-256)', async () => {
    const component: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'test',
    };
    const hash = await computeComponentContentHash(component);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
