/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, internal } from "@/convex/_generated/api";
import {
  fetchInternalQuery as fetchInternalQueryBase,
  fetchInternalMutation as fetchInternalMutationBase,
  resolveConvexAdminAuth,
  getConvexUrl,
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

interface SupabaseUserLike {
  id?: string;
  email?: string | null;
  user_metadata?: {
    username?: unknown;
  } | null;
}

function extractUsername(user: SupabaseUserLike): string | null {
  const fromMetadata =
    user.user_metadata && typeof user.user_metadata.username === "string"
      ? user.user_metadata.username.trim()
      : "";

  if (fromMetadata.length > 0) {
    return fromMetadata;
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    const [localPart] = user.email.split("@");
    const username = localPart?.trim();
    if (username) return username;
  }

  return null;
}

export async function resolveConvexProfileIdFromSupabaseUser(
  user: SupabaseUserLike,
): Promise<string | null> {
  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }

  const username = extractUsername(user);
  if (!username) return null;

  const profile = await fetchInternalQuery(internal.activities.getProfileByUsername, { username });
  return profile?.id ?? null;
}

export { api, internal, resolveConvexAdminAuth, getConvexUrl };