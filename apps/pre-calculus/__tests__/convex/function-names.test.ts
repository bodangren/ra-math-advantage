import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
describe('Convex deployment limits', () => {
  it('keeps registered learning evidence names within the backend limit', () => {
    const source = readFileSync('convex/learningEvidence.ts', 'utf8');
    const names = [...source.matchAll(/export const (\w+) = internal(?:Query|Mutation)/g)].map((match) => match[1]);
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => name.length > 64)).toEqual([]);
  });
});
