import { describe, it, expect } from 'vitest';
import { isDevApprovalEnabledForRequest } from '@/lib/auth/developer';

describe('isDevApprovalEnabledForRequest', () => {
  it('returns false when NODE_ENV is production', () => {
    const env = { NODE_ENV: 'production' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(false);
  });

  it('returns false when NODE_ENV is preview', () => {
    const env = { NODE_ENV: 'preview' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(false);
  });

  it('returns true when NODE_ENV is development', () => {
    const env = { NODE_ENV: 'development' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(true);
  });

  it('returns true when NODE_ENV is test', () => {
    const env = { NODE_ENV: 'test' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(true);
  });

  it('returns false when NODE_ENV is empty string', () => {
    const env = { NODE_ENV: '' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(false);
  });

  it('returns false when NODE_ENV is undefined', () => {
    const env = {};
    expect(isDevApprovalEnabledForRequest(env)).toBe(false);
  });

  it('returns true when VERCEL_ENV is production but NODE_ENV is development', () => {
    const env = { NODE_ENV: 'development', VERCEL_ENV: 'production' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(true);
  });

  it('returns false when NODE_ENV is production regardless of VERCEL_ENV', () => {
    const env = { NODE_ENV: 'production', VERCEL_ENV: 'preview' };
    expect(isDevApprovalEnabledForRequest(env)).toBe(false);
  });
});