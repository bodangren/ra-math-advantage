export type { SessionClaims, SessionTokenInput, PasswordCredential, UserRole } from '@math-platform/core-auth';
export {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  PASSWORD_HASH_ITERATIONS,
  getAuthJwtSecret,
} from '@math-platform/core-auth';
export {
  signSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  generateRandomPassword,
  generatePasswordSalt,
} from '@math-platform/core-auth';
