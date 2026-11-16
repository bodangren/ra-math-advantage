/* eslint-disable @typescript-eslint/no-explicit-any */
import { internal } from '@/convex/_generated/api';
import {
  fetchInternalMutation as fetchInternalMutationBase,
  fetchInternalQuery as fetchInternalQueryBase,
} from '@math-platform/core-convex';

export async function fetchInternalQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  return fetchInternalQueryBase(ref, args, { env: process.env });
}

export async function fetchInternalMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  return fetchInternalMutationBase(ref, args, { env: process.env });
}

export { internal };
