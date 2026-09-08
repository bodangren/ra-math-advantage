import { describe, expect, it } from 'vitest';
import { getFunctionName } from 'convex/server';
import { internal } from '@/convex/_generated/api';

describe('selected Topic 1.1 evidence runtime reference', () => {
  it('targets the committed hyphenated Convex module', () => {
    expect(getFunctionName(internal['learning-evidence'].submitSelected))
      .toBe('learning-evidence:submitSelected');
  });
});
