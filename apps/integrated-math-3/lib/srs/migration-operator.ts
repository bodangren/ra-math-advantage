/**
 * Ensures the CLI-only migration facade cannot be invoked without the
 * deployment-owned operator secret. Migration implementations remain Convex
 * internal mutations; this boundary only lets an operator start them.
 */
export function assertMigrationOperator(
  suppliedToken: string,
  configuredToken: string | undefined,
): void {
  if (!configuredToken) {
    throw new Error("Migration operator is not configured for this deployment.");
  }
  if (suppliedToken !== configuredToken) {
    throw new Error("Migration operator is not authorized.");
  }
}
