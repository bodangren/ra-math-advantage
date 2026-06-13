import type { SessionClaims } from '@math-platform/core-auth';

/**
 * Defense-in-depth role guard for the efficacy dashboard.
 *
 * Returns the claims verbatim when the role is 'teacher' or 'admin';
 * returns null otherwise.  Mirrors the server-side `requireServerRoles`
 * check but as a pure predicate (no redirect) so components can
 * short-circuit rendering for non-teacher roles.
 */
export function guardEfficacyAccess(
  claims: SessionClaims | null | undefined,
): SessionClaims | null {
  if (!claims) return null;
  if (claims.role === 'teacher' || claims.role === 'admin') return claims;
  return null;
}
