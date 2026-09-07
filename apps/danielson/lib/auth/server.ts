import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthJwtSecret,
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type SessionClaims,
} from '@/lib/auth/session';
import {
  buildRequestForbiddenResponse,
  requireActiveRequestSessionClaims,
} from '@math-platform/core-auth';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

const LOGIN_PATH = '/auth/login';
const CHANGE_PASSWORD_PATH = '/auth/change-password';

export async function getServerSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, getAuthJwtSecret());
}

export async function getCurrentDanielsonAccount(claims: SessionClaims) {
  const account = await fetchInternalQuery(internal.auth.getAccountById, { accountId: claims.sub });
  if (!account || account.credentialUpdatedAt !== claims.credentialUpdatedAt) return null;
  const context = await fetchInternalQuery(internal.foundation.resolveAccessContext, {
    actorAccountId: claims.sub,
  });
  return {
    ...account,
    danielsonRoles: context.roleAssignments.map((assignment: { role: string }) => assignment.role),
  };
}

export async function requireDanielsonSession(path = '/') {
  const claims = await getServerSessionClaims();
  if (!claims) redirect(`${LOGIN_PATH}?redirect=${encodeURIComponent(path)}`);
  const account = await getCurrentDanielsonAccount(claims);
  if (!account?.accountIsActive || !account.organizationIsActive || !account.credentialIsActive) {
    redirect(LOGIN_PATH);
  }
  if (account.mustChangePassword && path !== CHANGE_PASSWORD_PATH) redirect(CHANGE_PASSWORD_PATH);
  return { claims, account };
}

export async function requireDanielsonApiSession(
  request: Request,
  options: { allowTemporaryCredential?: boolean } = {},
): Promise<SessionClaims | Response> {
  const claimsOrResponse = await requireActiveRequestSessionClaims(
    request,
    (token) => verifySessionToken(token, getAuthJwtSecret()),
    async (claims) => {
      const account = await fetchInternalQuery(internal.auth.getAccountById, { accountId: claims.sub });
      return Boolean(account?.accountIsActive && account.organizationIsActive && account.credentialIsActive
        && account.credentialUpdatedAt === (claims as SessionClaims).credentialUpdatedAt);
    },
    { cookieName: SESSION_COOKIE_NAME, unauthorizedMessage: 'Unauthorized' },
  );
  if (claimsOrResponse instanceof Response) return claimsOrResponse;

  const account = await fetchInternalQuery(internal.auth.getAccountById, {
    accountId: claimsOrResponse.sub,
  });
  if (account?.mustChangePassword && !options.allowTemporaryCredential) {
    return buildRequestForbiddenResponse('Password change required');
  }
  return claimsOrResponse;
}
