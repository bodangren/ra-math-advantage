type EnvLike = Record<string, string | undefined>;

/**
 * Checks if demo provisioning is enabled (non-production environments).
 * @param env - Environment object (defaults to process.env)
 * @returns True if demo provisioning is enabled
 */
export function isDemoProvisioningEnabled(env: EnvLike = process.env): boolean {
  const vercelEnv = env.VERCEL_ENV?.trim();
  const nodeEnv = env.NODE_ENV?.trim();

  if (vercelEnv === 'production' || vercelEnv === 'preview' || nodeEnv === 'production') {
    return false;
  }

  return nodeEnv === 'development' || nodeEnv === 'test';
}