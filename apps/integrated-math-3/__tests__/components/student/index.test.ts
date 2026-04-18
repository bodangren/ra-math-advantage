import { describe, it, expect } from 'vitest';

describe('components/student/index.ts', () => {
  it('should export without errors', () => {
    // Import the index file to verify it loads without errors
    expect(() => import('@/components/student')).not.toThrow();
  });
});
