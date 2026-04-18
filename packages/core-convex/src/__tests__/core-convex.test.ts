import { describe, it, expect } from 'vitest';
import { DEFAULT_LOCAL_CONVEX_URL, getConvexUrl } from '../index.js';

describe('core-convex config', () => {
  it('exports default local convex URL', () => {
    expect(DEFAULT_LOCAL_CONVEX_URL).toBe('http://127.0.0.1:3210');
  });

  describe('getConvexUrl', () => {
    it('returns default URL when no env vars set', () => {
      const url = getConvexUrl({});
      expect(url).toBe(DEFAULT_LOCAL_CONVEX_URL);
    });

    it('prefers CONVEX_URL over NEXT_PUBLIC_CONVEX_URL', () => {
      const env = {
        CONVEX_URL: 'https://my-convex-deployment.convex.cloud',
        NEXT_PUBLIC_CONVEX_URL: 'https://other.convex.cloud',
      };
      const url = getConvexUrl(env);
      expect(url).toBe('https://my-convex-deployment.convex.cloud');
    });

    it('uses NEXT_PUBLIC_CONVEX_URL when CONVEX_URL not set', () => {
      const env = {
        NEXT_PUBLIC_CONVEX_URL: 'https://public.convex.cloud',
      };
      const url = getConvexUrl(env);
      expect(url).toBe('https://public.convex.cloud');
    });

    it('normalizes URL by removing trailing slashes', () => {
      const env = {
        CONVEX_URL: 'https://my-convex.convex.cloud///',
      };
      const url = getConvexUrl(env);
      expect(url).toBe('https://my-convex.convex.cloud');
    });

    it('trims whitespace from URL', () => {
      const env = {
        CONVEX_URL: '  https://my-convex.convex.cloud  ',
      };
      const url = getConvexUrl(env);
      expect(url).toBe('https://my-convex.convex.cloud');
    });
  });
});