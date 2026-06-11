/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, internal } from "@/convex/_generated/api";
import {
  fetchInternalQuery as fetchInternalQueryBase,
  fetchInternalMutation as fetchInternalMutationBase,
  resolveConvexAdminAuth,
  getConvexUrl,
} from "@math-platform/core-convex";

/** Executes a public Convex query via the core-convex fetchPublicQuery helper. */
export async function fetchQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  const { fetchPublicQuery } = await import("@math-platform/core-convex");
  return fetchPublicQuery(ref, args);
}

/** Executes a public Convex mutation via the core-convex fetchPublicMutation helper. */
export async function fetchMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  const { fetchPublicMutation } = await import("@math-platform/core-convex");
  return fetchPublicMutation(ref, args);
}

/** Executes an internal Convex query using server-side admin credentials. */
export async function fetchInternalQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  return fetchInternalQueryBase(ref, args, { env: process.env });
}

/** Executes an internal Convex mutation using server-side admin credentials. */
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

/** Extracts a display username from Supabase user metadata or email local part. */
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

/** Resolves a Convex profile ID from a Supabase user by ID or username lookup. */
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