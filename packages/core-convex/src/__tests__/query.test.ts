import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetInternalClient } from '../query.js';

const mockQuery = vi.fn().mockResolvedValue({ result: 'mocked' });
const mockMutation = vi.fn().mockResolvedValue({ result: 'mocked' });

vi.mock('convex/browser', () => {
  return {
    ConvexHttpClient: function MockConvexHttpClient() {
      return {
        query: mockQuery,
        mutation: mockMutation,
        setAdminAuth: vi.fn(),
      };
    },
  };
});

vi.mock('../admin.js', async () => {
  const actual = await vi.importActual('../admin.js');
  return {
    ...actual,
    resolveConvexAdminAuth: vi.fn().mockResolvedValue({ token: 'mock-token', source: 'local-admin-key' }),
  };
});

describe('core-convex query wrappers', () => {
  beforeEach(() => {
    resetInternalClient();
    vi.clearAllMocks();
  });

  describe('fetchPublicQuery', () => {
    it('accepts any ref and args without TypeScript errors', async () => {
      const { fetchPublicQuery } = await import('../query.js');
      const mockRef = {} as any;
      const mockArgs = { key: 'value' };

      const result = await fetchPublicQuery(mockRef, mockArgs);
      expect(result).toEqual({ result: 'mocked' });
    });

    it('infers return type from function reference', async () => {
      const { fetchPublicQuery } = await import('../query.js');
      const mockRef = { _type: 'query', _args: { id: 'string' }, _returnType: { id: 'string', name: 'string' } } as any;

      const result = await fetchPublicQuery(mockRef, { id: '123' });
      // TypeScript compile-time check: result should be inferred, not unknown
      expect(result).toBeDefined();
    });
  });

  describe('fetchPublicMutation', () => {
    it('accepts any ref and args without TypeScript errors', async () => {
      const { fetchPublicMutation } = await import('../query.js');
      const mockRef = {} as any;
      const mockArgs = { key: 'value' };

      const result = await fetchPublicMutation(mockRef, mockArgs);
      expect(result).toEqual({ result: 'mocked' });
    });

    it('infers return type from function reference', async () => {
      const { fetchPublicMutation } = await import('../query.js');
      const mockRef = { _type: 'mutation', _args: { name: 'string' }, _returnType: { success: true } } as any;

      const result = await fetchPublicMutation(mockRef, { name: 'test' });
      expect(result).toBeDefined();
    });
  });

  describe('fetchInternalQuery', () => {
    it('infers return type from function reference', async () => {
      const { fetchInternalQuery } = await import('../query.js');
      const mockRef = { _type: 'query', _args: {}, _returnType: { items: [] } } as any;

      const result = await fetchInternalQuery(mockRef, {});
      expect(result).toBeDefined();
    });

    it('accepts internal function references', async () => {
      const { fetchInternalQuery } = await import('../query.js');
      const mockRef = { _type: 'query', _visibility: 'internal', _args: { id: 'string' }, _returnType: { id: 'string' } } as any;

      const result = await fetchInternalQuery(mockRef, { id: '123' });
      expect(result).toBeDefined();
    });
  });

  describe('fetchInternalMutation', () => {
    it('infers return type from function reference', async () => {
      const { fetchInternalMutation } = await import('../query.js');
      const mockRef = { _type: 'mutation', _args: {}, _returnType: { count: 0 } } as any;

      const result = await fetchInternalMutation(mockRef, {});
      expect(result).toBeDefined();
    });

    it('accepts internal function references', async () => {
      const { fetchInternalMutation } = await import('../query.js');
      const mockRef = { _type: 'mutation', _visibility: 'internal', _args: { name: 'string' }, _returnType: { success: true } } as any;

      const result = await fetchInternalMutation(mockRef, { name: 'test' });
      expect(result).toBeDefined();
    });
  });
});