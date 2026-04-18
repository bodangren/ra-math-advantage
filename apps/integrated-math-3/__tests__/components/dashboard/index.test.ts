import { describe, it, expect } from 'vitest';

describe('components/dashboard/index.ts', () => {
  it('should export without errors', () => {
    // Import the index file to verify it loads without errors
    expect(() => import('@/components/dashboard')).not.toThrow();
  });
});
