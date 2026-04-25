/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, internal } from "@/convex/_generated/api";
import {
  fetchInternalQuery as fetchInternalQueryBase,
  fetchInternalMutation as fetchInternalMutationBase,
} from "@math-platform/core-convex";

export async function fetchQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  const { fetchPublicQuery } = await import("@math-platform/core-convex");
  return fetchPublicQuery(ref, args);
}

export async function fetchMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  const { fetchPublicMutation } = await import("@math-platform/core-convex");
  return fetchPublicMutation(ref, args);
}

export async function fetchInternalQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  return fetchInternalQueryBase(ref, args, { env: process.env });
}

export async function fetchInternalMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  return fetchInternalMutationBase(ref, args, { env: process.env });
}

export { api, internal };
