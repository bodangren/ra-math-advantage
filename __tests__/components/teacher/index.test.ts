import { describe, it, expect } from 'vitest';

describe('components/teacher/index.ts', () => {
  it('should export without errors', () => {
    // Import the index file to verify it loads without errors
    expect(() => import('@/components/teacher')).not.toThrow();
  });
});
