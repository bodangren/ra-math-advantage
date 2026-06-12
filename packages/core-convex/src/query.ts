import { ConvexHttpClient } from 'convex/browser';
import type { FunctionReference, FunctionReturnType, FunctionArgs } from 'convex/server';
import type { ResolveConvexAdminAuthOptions, ConvexAdminAuth } from './admin.js';
import { resolveConvexAdminAuth } from './admin.js';
import { getConvexUrl } from './config.js';

export interface ConvexClientWithAdminAuth extends ConvexHttpClient {
  setAdminAuth: (token: string, actingAsIdentity?: string) => void;
}

let publicClient: ConvexHttpClient | null = null;

/**
 * Gets or creates a singleton public Convex HTTP client.
 * @returns ConvexHttpClient for public queries/mutations
 */
export function getPublicConvexClient(): ConvexHttpClient {
  if (!publicClient) {
    publicClient = new ConvexHttpClient(getConvexUrl());
  }
  return publicClient;
}

export interface CreateInternalClientOptions extends ResolveConvexAdminAuthOptions {
  convexUrl?: string;
}

let internalClient: ConvexHttpClient | null = null;
let internalClientAuth: ConvexAdminAuth | null = null;

/**
 * Gets or creates a singleton internal Convex HTTP client with admin auth.
 * @param options - Options for URL and auth resolution
 * @returns ConvexHttpClient with admin auth set
 */
export async function getInternalConvexClient(
  options: CreateInternalClientOptions = {},
): Promise<ConvexHttpClient> {
  const url = options.convexUrl ?? getConvexUrl();
  const adminAuth = await resolveConvexAdminAuth(options);

  if (
    internalClient &&
    internalClientAuth &&
    internalClientAuth.token === adminAuth.token &&
    internalClientAuth.source === adminAuth.source
  ) {
    return internalClient;
  }

  internalClient = new ConvexHttpClient(url);
  (internalClient as ConvexClientWithAdminAuth).setAdminAuth(adminAuth.token);
  internalClientAuth = adminAuth;
  return internalClient;
}

/**
 * Resets the internal client singleton (for testing or re-auth).
 */
export function resetInternalClient(): void {
  internalClient = null;
  internalClientAuth = null;
}

/**
 * Fetches a public Convex query with typed arguments and return value.
 * @param ref - Query function reference
 * @param args - Query arguments
 * @returns Query result
 */
export async function fetchPublicQuery<Query extends FunctionReference<'query', 'public'>>(
  ref: Query,
  args: FunctionArgs<Query>,
): Promise<FunctionReturnType<Query>> {
  const client = getPublicConvexClient();
  return client.query(ref, args);
}

/**
 * Calls a public Convex mutation with typed arguments and return value.
 * @param ref - Mutation function reference
 * @param args - Mutation arguments
 * @returns Mutation result
 */
export async function fetchPublicMutation<Mutation extends FunctionReference<'mutation', 'public'>>(
  ref: Mutation,
  args: FunctionArgs<Mutation>,
): Promise<FunctionReturnType<Mutation>> {
  const client = getPublicConvexClient();
  return client.mutation(ref, args);
}

/**
 * Fetches an internal Convex query (public or internal) with admin auth.
 * @param ref - Query function reference
 * @param args - Query arguments
 * @param options - Options including convexUrl override
 * @returns Query result
 */
export async function fetchInternalQuery<Query extends FunctionReference<'query', 'public' | 'internal'>>(
  ref: Query,
  args: FunctionArgs<Query>,
  options: CreateInternalClientOptions = {},
): Promise<FunctionReturnType<Query>> {
  const client = await getInternalConvexClient(options);
  return client.query(ref as FunctionReference<'query'>, args) as Promise<FunctionReturnType<Query>>;
}

/**
 * Call an internal Convex mutation with admin auth.
 * @param ref - Mutation function reference
 * @param args - Mutation arguments
 * @param options - Options including convexUrl override
 * @returns Mutation result
 */
export async function fetchInternalMutation<Mutation extends FunctionReference<'mutation', 'public' | 'internal'>>(
  ref: Mutation,
  args: FunctionArgs<Mutation>,
  options: CreateInternalClientOptions = {},
): Promise<FunctionReturnType<Mutation>> {
  const client = await getInternalConvexClient(options);
  return client.mutation(ref as FunctionReference<'mutation'>, args) as Promise<FunctionReturnType<Mutation>>;
}