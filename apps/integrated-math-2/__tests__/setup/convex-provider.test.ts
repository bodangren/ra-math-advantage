import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('ConvexClientProvider', () => {
  it('uses shared Convex URL fallback behavior', () => {
    const providerPath = path.resolve(process.cwd(), 'components/ConvexClientProvider.tsx');
    const provider = fs.readFileSync(providerPath, 'utf8');

    expect(provider).toContain('getConvexUrl');
    expect(provider).toContain('new ConvexReactClient(getConvexUrl())');
    expect(provider).not.toContain('process.env.NEXT_PUBLIC_CONVEX_URL!');
  });
});
